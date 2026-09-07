import { describe, expect, it } from "vitest";
import { boundWindow, sampleAt, zoomWindow } from "../src/transport";

describe("transport", () => {
  it("does not extend a sample beyond recorded coverage", () => {
    const points: [number, number][] = [[10, 2], [20, 4]];
    expect(sampleAt(points, 9)).toBeNull();
    expect(sampleAt(points, 21)).toBeNull();
    expect(sampleAt(points, 15)).toBe(3);
    expect(sampleAt(points, 15, 5)).toBeNull();
  });
  it("zooms around the cursor and bounds span and future extent", () => {
    expect(zoomWindow({ start: 0, end: 7200 }, 1800, 0.5, 10000)).toEqual({ start: 900, end: 4500 });
    const win = boundWindow({ start: 0, end: 10000000 }, 10000);
    expect(win.end).toBeLessThanOrEqual(10000 + 7 * 86400);
    expect(win.end - win.start).toBe(30 * 86400);
  });
});
