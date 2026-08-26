import { describe, expect, it } from "vitest";
import { FADER_MAX, FADER_MIN, fromPosition, formatGain, stepValue, toPosition } from "../src/fader";

describe("fader scale", () => {
  it("maps unity gain to the middle of the log scale", () => {
    expect(toPosition(1)).toBeCloseTo(0.5, 10);
  });
  it("maps the extremes to 0 and 1", () => {
    expect(toPosition(FADER_MIN)).toBeCloseTo(0, 10);
    expect(toPosition(FADER_MAX)).toBeCloseTo(1, 10);
  });
  it("clamps values outside [0.1, 10] before scaling", () => {
    expect(toPosition(0.01)).toBeCloseTo(0, 10);
    expect(toPosition(100)).toBeCloseTo(1, 10);
  });
  it("round-trips through toPosition/fromPosition", () => {
    for (const v of [0.1, 0.5, 1, 2.5, 5, 10]) {
      expect(fromPosition(toPosition(v))).toBeCloseTo(v, 1);
    }
  });
  it("fromPosition clamps and rounds to 2 decimals", () => {
    expect(fromPosition(-1)).toBe(FADER_MIN);
    expect(fromPosition(2)).toBe(FADER_MAX);
    expect(fromPosition(0.5)).toBe(1);
  });
});

describe("stepValue", () => {
  it("multiplies by 1.25 stepping up, divides stepping down", () => {
    expect(stepValue(1, 1)).toBe(1.25);
    expect(stepValue(1.25, -1)).toBe(1);
  });
  it("uses a finer 1.05 factor when fine is set", () => {
    expect(stepValue(1, 1, true)).toBe(1.05);
    expect(stepValue(1.05, -1, true)).toBe(1);
  });
  it("clamps at the fader extremes", () => {
    expect(stepValue(FADER_MAX, 1)).toBe(FADER_MAX);
    expect(stepValue(FADER_MIN, -1)).toBe(FADER_MIN);
  });
  it("rounds to 2 decimals", () => {
    expect(stepValue(0.33, 1)).toBe(0.41);
  });
});

describe("formatGain", () => {
  it("keeps at least one decimal", () => {
    expect(formatGain(1)).toBe("1.0");
    expect(formatGain(10)).toBe("10.0");
  });
  it("trims a single trailing zero", () => {
    expect(formatGain(2.5)).toBe("2.5");
  });
  it("keeps both decimals when both are significant", () => {
    expect(formatGain(0.12)).toBe("0.12");
  });
});
