import { describe, expect, it } from "vitest";
import { FADER_MAX, FADER_MIN, formatGain, fromPosition, gainScale, levelScale, stepValue, toPosition } from "../src/fader";

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

describe("gainScale", () => {
  it("is the log gain throw, with unity as its home", () => {
    expect(gainScale.min).toBe(FADER_MIN);
    expect(gainScale.max).toBe(FADER_MAX);
    expect(gainScale.reset).toBe(1);
    expect(gainScale.toPosition(1)).toBeCloseTo(0.5, 10);
    expect(gainScale.format(1)).toBe("1.0");
  });
  it("steps by a notch and pages by a factor of two, clamped", () => {
    expect(gainScale.step(1, 1)).toBe(1.25);
    expect(gainScale.step(1, 1, true)).toBe(1.05);
    expect(gainScale.page(1, 1)).toBe(2);
    expect(gainScale.page(1, -1)).toBe(0.5);
    expect(gainScale.page(FADER_MAX, 1)).toBe(FADER_MAX);
  });
});

describe("levelScale", () => {
  const scale = levelScale(5, 1);

  it("runs linearly from zero to the ceiling", () => {
    expect(scale.min).toBe(0);
    expect(scale.max).toBe(5);
    expect(scale.toPosition(0)).toBe(0);
    expect(scale.toPosition(2.5)).toBe(0.5);
    expect(scale.toPosition(5)).toBe(1);
  });

  it("clamps a value outside the throw rather than scaling past it", () => {
    expect(scale.toPosition(-1)).toBe(0);
    expect(scale.toPosition(9)).toBe(1);
    expect(scale.clamp(-1)).toBe(0);
    expect(scale.clamp(9)).toBe(5);
  });

  it("quantises to the group's precision, without floating-point crumbs", () => {
    expect(scale.fromPosition(0.5)).toBe(2.5);
    expect(scale.clamp(1.8342)).toBe(1.8);
    expect(levelScale(5, 0).clamp(1.8342)).toBe(2);
    expect(levelScale(5, 2).clamp(1.8342)).toBe(1.83);
    expect(scale.step(0.2, 1, true)).toBe(0.3);
  });

  it("steps a tenth of the throw, or one quantum when fine", () => {
    expect(scale.step(1, 1)).toBe(1.5);
    expect(scale.step(1, -1)).toBe(0.5);
    expect(scale.step(1, 1, true)).toBe(1.1);
    expect(levelScale(1, 2).step(0.5, 1)).toBe(0.6);
  });

  it("never steps by nothing, however coarse the precision", () => {
    // A ceiling of 2 at 0 dp would round a tenth of the throw down to zero.
    expect(levelScale(2, 0).step(1, 1)).toBe(2);
    expect(levelScale(0.3, 1).step(0.1, 1)).toBe(0.2);
  });

  it("pages by a quarter of the throw and clamps at both ends", () => {
    expect(scale.page(2, 1)).toBe(3.3);
    expect(scale.page(5, 1)).toBe(5);
    expect(scale.page(0, -1)).toBe(0);
  });

  it("round-trips through fromPosition/toPosition", () => {
    for (const v of [0, 0.5, 2.5, 4.9, 5]) expect(scale.fromPosition(scale.toPosition(v))).toBeCloseTo(v, 6);
  });

  it("prints the value the way the engine rounds it", () => {
    expect(scale.format(2)).toBe("2.0");
    expect(levelScale(5, 2).format(2)).toBe("2.00");
    expect(levelScale(5, 0).format(2.4)).toBe("2");
  });

  it("has no double-click home: there is no natural level to snap back to", () => {
    expect(scale.reset).toBeNull();
  });

  it("keeps a usable throw when the ceiling is missing or nonsense", () => {
    for (const bad of [0, -5, Number.NaN]) {
      expect(levelScale(bad, 1).max).toBe(1);
      expect(levelScale(bad, 1).toPosition(0.5)).toBe(0.5);
    }
  });

  it("squares up a precision no group should ever have", () => {
    expect(levelScale(5, -3).format(2.4)).toBe("2");
    expect(levelScale(5, 1.9).format(2.44)).toBe("2.4");
  });
});
