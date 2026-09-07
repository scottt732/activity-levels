/** A null cursor follows live values. A null window uses the selected range presets. */
export interface TransportDetail {
  time: number | null;
  window: { start: number; end: number } | null;
}

export type TransportWindow = NonNullable<TransportDetail["window"]>;

/** Keep gestures within the recorder's useful scale and the forecast's seven-day limit. */
export function boundWindow(window: TransportWindow, now: number): TransportWindow {
  const span = Math.min(30 * 86400, Math.max(3600, window.end - window.start));
  const end = Math.min(now + 7 * 86400, window.start + span);
  return { start: end - span, end };
}

export function zoomWindow(window: TransportWindow, time: number, factor: number, now: number): TransportWindow {
  const span = window.end - window.start;
  const next = Math.min(30 * 86400, Math.max(3600, span * factor));
  const start = time - ((time - window.start) / span) * next;
  return boundWindow({ start, end: start + next }, now);
}

/** Interpolate only inside coverage. Missing history must never become an edge value. */
export function sampleAt(points: [number, number][], time: number, maxGap = Infinity): number | null {
  if (!points.length || time < points[0]![0] || time > points[points.length - 1]![0]) return null;
  let lo = 0;
  let hi = points.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (points[mid]![0] < time) lo = mid + 1;
    else hi = mid;
  }
  const right = points[lo]!;
  if (right[0] === time || lo === 0) return right[1];
  const left = points[lo - 1]!;
  if (right[0] - left[0] > maxGap) return null;
  return left[1] + ((time - left[0]) / (right[0] - left[0])) * (right[1] - left[1]);
}
