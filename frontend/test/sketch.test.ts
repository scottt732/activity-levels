import { describe, expect, it } from "vitest";
import { envelopeLabels, envelopePoints } from "../src/sketch";

describe("envelopePoints", () => {
  it("draws A D S R in order and scales time to 1", () => {
    const pts = envelopePoints({ attack: 10, decay: 10, sustain: 0.5, release: 20, impulse: false });
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[pts.length - 1]!.y).toBe(0);
    expect(pts[pts.length - 1]!.x).toBeCloseTo(1);
    expect(Math.max(...pts.map((p) => p.y))).toBe(1);
  });
  it("impulse jumps straight to peak", () => {
    const pts = envelopePoints({ attack: 30, decay: 0, sustain: 1, release: 60, impulse: true });
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[1]).toEqual({ x: 0, y: 1 });
  });
  it("handles all-zero durations", () => {
    const pts = envelopePoints({ attack: 0, decay: 0, sustain: 1, release: 0, impulse: false });
    expect(pts.every((p) => p.y === 0 || p.y === 1)).toBe(true);
  });

  it("ends an impulse at the right edge whatever the release", () => {
    for (const release of [0, 60]) {
      const pts = envelopePoints({ attack: 0, decay: 0, sustain: 1, release, impulse: true });
      expect(pts[pts.length - 1]).toEqual({ x: 1, y: 0 });
    }
  });

  it("draws a flat top when decay is zero and sustain is full", () => {
    const pts = envelopePoints({ attack: 10, decay: 0, sustain: 1, release: 20, impulse: false });
    expect(pts.slice(1, 4).every((p) => p.y === 1)).toBe(true);
    expect(pts[1]!.x).toBe(pts[2]!.x);
    expect(pts[3]!.x).toBeGreaterThan(pts[2]!.x);
  });

  it("gives the sustain plateau the requested share of the width", () => {
    const pts = envelopePoints({ attack: 10, decay: 10, sustain: 0.5, release: 20, impulse: false }, 0.25);
    expect(pts[3]!.x - pts[2]!.x).toBeCloseTo(0.25);
  });

  it("keeps x monotonically non-decreasing", () => {
    const pts = envelopePoints({ attack: 5, decay: 0, sustain: 0.2, release: 0, impulse: false });
    for (let i = 1; i < pts.length; i++) expect(pts[i]!.x).toBeGreaterThanOrEqual(pts[i - 1]!.x);
  });
});

describe("envelopeLabels", () => {
  it("labels each non-zero segment at its midpoint", () => {
    const labels = envelopeLabels({ attack: 10, decay: 10, sustain: 0.5, release: 20, impulse: false });
    expect(labels.map((l) => l.text)).toEqual(["A 10s", "D 10s", "S 0.5", "R 20s"]);
    expect(labels[0]!.x).toBeGreaterThan(0);
    expect(labels[3]!.x).toBeLessThan(1);
  });

  it("skips zero-length segments", () => {
    const labels = envelopeLabels({ attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false });
    expect(labels.map((l) => l.text)).toEqual(["S 1", "R 30m"]);
  });

  it("says impulse instead of A/D/S", () => {
    const labels = envelopeLabels({ attack: 30, decay: 5, sustain: 0.5, release: 60, impulse: true });
    expect(labels.map((l) => l.text)).toEqual(["impulse", "R 1m"]);
    expect(labels[1]!.x).toBeCloseTo(0.5);
  });

  it("drops the release label from a zero-release impulse", () => {
    const labels = envelopeLabels({ attack: 0, decay: 0, sustain: 1, release: 0, impulse: true });
    expect(labels.map((l) => l.text)).toEqual(["impulse"]);
  });
});
