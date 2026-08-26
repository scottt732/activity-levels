import type { TimeseriesQuery } from "./api";
import type { Forecast } from "./types";

export type Range = "24h" | "7d" | "30d";
export type Horizon = "off" | "24h" | "7d";

export const RANGE_SECONDS: Record<Range, number> = {
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400,
};

export const HORIZON_SECONDS: Record<Horizon, number> = {
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400,
};

export function windowFor(
  now: number,
  range: Range,
  horizon: Horizon,
): { start: number; end: number; forecastUntil: number | undefined; resolution: "5m" | "1h" } {
  return {
    start: now - RANGE_SECONDS[range],
    end: now,
    resolution: range === "24h" ? "5m" : "1h",
    forecastUntil: horizon === "off" ? undefined : now + HORIZON_SECONDS[horizon],
  };
}

/** Maps a time domain [t0, t1] onto a pixel range [0, width]. */
export function xScale(t0: number, t1: number, width: number): (t: number) => number {
  const span = t1 - t0 || 1;
  return (t: number) => ((t - t0) / span) * width;
}

/** Maps a value domain [0, max] onto pixel rows, 0 at the bottom and max at the top. */
export function yScale(max: number, height: number, pad = 4): (v: number) => number {
  const span = max || 1;
  const inner = height - 2 * pad;
  return (v: number) => height - pad - (v / span) * inner;
}

/**
 * Reduces `points` to at most `maxPoints` while keeping the shape of the series: each
 * bucket of `ceil(n / (maxPoints/2))` source points contributes its min and its max
 * (in time order), so spikes inside a bucket are never smoothed away.
 */
export function decimate(points: [number, number][], maxPoints: number): [number, number][] {
  // Below 4 there is no room for a first point, a last point and one bucket's min/max in
  // between; the chart cannot resolve fewer than that anyway; and a maxPoints of 1 or 2
  // handed in unclamped drove `perBucket` (and then `bucketSize`) to values that dropped
  // the last-point patch-up below.
  maxPoints = Math.max(4, maxPoints);
  const n = points.length;
  if (n <= maxPoints) return points;
  const perBucket = Math.max(1, Math.floor(maxPoints / 2));
  const bucketSize = Math.ceil(n / perBucket);
  const out: [number, number][] = [];
  for (let start = 0; start < n; start += bucketSize) {
    const end = Math.min(start + bucketSize, n);
    let minP = points[start]!;
    let maxP = points[start]!;
    for (let i = start + 1; i < end; i++) {
      const p = points[i]!;
      if (p[1] < minP[1]) minP = p;
      if (p[1] > maxP[1]) maxP = p;
    }
    if (minP === maxP) out.push(minP);
    else if (minP[0] <= maxP[0]) out.push(minP, maxP);
    else out.push(maxP, minP);
  }
  if (out[0] !== points[0]) out[0] = points[0]!;
  if (out[out.length - 1] !== points[n - 1]) out[out.length - 1] = points[n - 1]!;
  return out;
}

/** `"M x,y L x,y L x,y …"` for an SVG `<path d>`. */
export function pathFor(points: [number, number][], x: (t: number) => number, y: (v: number) => number): string {
  if (points.length === 0) return "";
  return points.map(([t, v], i) => `${i === 0 ? "M" : "L"}${x(t)},${y(v)}`).join(" ");
}

/** The forecast band as a closed SVG polygon path: p75 forward, then p25 backward.
 *  `maxPoints` caps the vertices per edge; the default keeps every point. */
export function bandPolygon(
  f: Forecast,
  x: (t: number) => number,
  y: (v: number) => number,
  maxPoints = Infinity,
): string {
  if (f.p75.length === 0) return "";
  const at = (vs: number[]): [number, number][] => vs.map((v, i): [number, number] => [f.t0 + i * f.step, v]);
  // Both edges go through `decimate`, like every line on the chart: a long forecast is no
  // more resolvable than a long history, and the band is the widest shape on the chart.
  const forward = decimate(at(f.p75), maxPoints);
  const backward = decimate(at(f.p25), maxPoints).reverse();
  const all = [...forward, ...backward];
  return `${all.map(([t, v], i) => `${i === 0 ? "M" : "L"}${x(t)},${y(v)}`).join(" ")} Z`;
}

/** Raw (unscaled) time/value pairs for one forecast series, for `pathFor` to draw. */
export function forecastLine(f: Forecast, key: "p50"): [number, number][] {
  return f[key].map((v, i): [number, number] => [f.t0 + i * f.step, v]);
}

/** Maps `[start, end|null, tag]` spans onto pixel rects; a null end extends to `t1`. */
export function spanRects<T>(
  spans: [number, number | null, T][],
  x: (t: number) => number,
  t1: number,
): { x0: number; x1: number; tag: T }[] {
  return spans.map(([start, end, tag]) => ({ x0: x(start), x1: x(end ?? t1), tag }));
}

/** Binary search for the index of the point whose time is closest to `t`. */
export function nearestIndex(points: [number, number][], t: number): number {
  if (points.length === 0) return -1;
  let lo = 0;
  let hi = points.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid]![0] < t) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(points[lo - 1]![0] - t) <= Math.abs(points[lo]![0] - t)) return lo - 1;
  return lo;
}

/** A stable cache key for a timeseries query, independent of key order. */
export function cacheKey(q: TimeseriesQuery): string {
  return [q.group_id, q.start, q.end, q.resolution, q.include_children ?? false, q.forecast_until ?? ""].join("|");
}
