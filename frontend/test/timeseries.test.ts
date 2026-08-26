import { describe, expect, it } from "vitest";
import type { TimeseriesQuery } from "../src/api";
import {
  HORIZON_SECONDS,
  RANGE_SECONDS,
  bandPolygon,
  cacheKey,
  decimate,
  forecastLine,
  nearestIndex,
  pathFor,
  spanRects,
  windowFor,
  xScale,
  yScale,
} from "../src/timeseries";
import type { Forecast } from "../src/types";

describe("windowFor", () => {
  it("uses 5m resolution for the 24h range and 1h otherwise", () => {
    expect(windowFor(1_000_000, "24h", "off").resolution).toBe("5m");
    expect(windowFor(1_000_000, "7d", "off").resolution).toBe("1h");
    expect(windowFor(1_000_000, "30d", "off").resolution).toBe("1h");
  });
  it("spans back by the range and ends at now", () => {
    const w = windowFor(1_000_000, "24h", "off");
    expect(w.start).toBe(1_000_000 - RANGE_SECONDS["24h"]);
    expect(w.end).toBe(1_000_000);
  });
  it("leaves forecastUntil undefined when the horizon is off", () => {
    expect(windowFor(1_000_000, "24h", "off").forecastUntil).toBeUndefined();
  });
  it("extends forecastUntil by the horizon past now", () => {
    expect(windowFor(1_000_000, "24h", "24h").forecastUntil).toBe(1_000_000 + HORIZON_SECONDS["24h"]);
    expect(windowFor(1_000_000, "24h", "7d").forecastUntil).toBe(1_000_000 + HORIZON_SECONDS["7d"]);
  });
});

describe("xScale / yScale", () => {
  it("maps the time domain onto the pixel width", () => {
    const x = xScale(0, 100, 200);
    expect(x(0)).toBe(0);
    expect(x(50)).toBe(100);
    expect(x(100)).toBe(200);
  });
  it("maps value 0 to the bottom and max to the top, inside the padding", () => {
    const y = yScale(10, 100, 4);
    expect(y(0)).toBe(96);
    expect(y(10)).toBe(4);
  });
});

describe("decimate", () => {
  it("returns the input unchanged when it already fits", () => {
    const points: [number, number][] = [[0, 1], [1, 2], [2, 3]];
    expect(decimate(points, 10)).toBe(points);
  });
  it("never emits more than maxPoints", () => {
    const points: [number, number][] = Array.from({ length: 137 }, (_, i) => [i, (i * 37) % 11]);
    const out = decimate(points, 20);
    expect(out.length).toBeLessThanOrEqual(20);
  });
  it("keeps the first and last points and both the min and max of each bucket", () => {
    // 15 points, maxPoints=6 -> 3 buckets of 5, each contributing its min and max in time order.
    const values = [10, 2, 5, 3, 1, 4, 9, 0, 6, 2, 3, 8, 5, 7, 1];
    const points: [number, number][] = values.map((v, i) => [i, v]);
    expect(decimate(points, 6)).toEqual([
      [0, 10],
      [4, 1],
      [6, 9],
      [7, 0],
      [11, 8],
      [14, 1],
    ]);
  });
});

describe("pathFor", () => {
  it("builds an SVG path with a moveto then linetos", () => {
    const points: [number, number][] = [[0, 0], [1, 2], [2, 1]];
    const path = pathFor(points, (t) => t * 10, (v) => 100 - v * 10);
    expect(path).toBe("M0,100 L10,80 L20,90");
  });
  it("is empty for no points", () => {
    expect(pathFor([], (t) => t, (v) => v)).toBe("");
  });
});

describe("bandPolygon", () => {
  it("walks p75 forward then p25 backward and closes the shape", () => {
    const f: Forecast = { t0: 0, step: 10, p25: [1, 2], p50: [2.5, 3.5], p75: [4, 5] };
    const path = bandPolygon(f, (t) => t, (v) => v);
    expect(path).toBe("M0,4 L10,5 L10,2 L0,1 Z");
  });
  it("is empty for an empty forecast", () => {
    const f: Forecast = { t0: 0, step: 10, p25: [], p50: [], p75: [] };
    expect(bandPolygon(f, (t) => t, (v) => v)).toBe("");
  });
});

describe("forecastLine", () => {
  it("returns raw time/value pairs for the requested series", () => {
    const f: Forecast = { t0: 100, step: 10, p25: [1, 2], p50: [2, 3], p75: [4, 5] };
    expect(forecastLine(f, "p50")).toEqual([[100, 2], [110, 3]]);
  });
});

describe("spanRects", () => {
  it("maps spans to pixel rects, extending a null end to the domain end", () => {
    const spans: [number, number | null, string][] = [[0, 5, "weekend"], [5, null, "holiday"]];
    expect(spanRects(spans, (t) => t * 2, 10)).toEqual([
      { x0: 0, x1: 10, tag: "weekend" },
      { x0: 10, x1: 20, tag: "holiday" },
    ]);
  });
});

describe("nearestIndex", () => {
  const points: [number, number][] = [[0, 0], [10, 0], [20, 0], [30, 0]];
  it("picks the closer neighbour", () => {
    expect(nearestIndex(points, 14)).toBe(1);
    expect(nearestIndex(points, 16)).toBe(2);
  });
  it("clamps to the ends", () => {
    expect(nearestIndex(points, -5)).toBe(0);
    expect(nearestIndex(points, 100)).toBe(3);
  });
  it("hits an exact match", () => {
    expect(nearestIndex(points, 20)).toBe(2);
  });
});

describe("cacheKey", () => {
  const q: TimeseriesQuery = { group_id: "house", start: 0, end: 100, resolution: "5m" };
  it("is stable for the same query", () => {
    expect(cacheKey(q)).toBe(cacheKey({ ...q }));
  });
  it("differs when a field differs", () => {
    expect(cacheKey(q)).not.toBe(cacheKey({ ...q, end: 200 }));
    expect(cacheKey(q)).not.toBe(cacheKey({ ...q, resolution: "1h" }));
    expect(cacheKey(q)).not.toBe(cacheKey({ ...q, group_id: "kitchen" }));
  });
  it("distinguishes optional fields from their defaults", () => {
    expect(cacheKey(q)).not.toBe(cacheKey({ ...q, include_children: true }));
    expect(cacheKey(q)).not.toBe(cacheKey({ ...q, forecast_until: 500 }));
  });
});
