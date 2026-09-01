import { describe, expect, it } from "vitest";
import { formatInherited, formatMultiplier, fromSelectorValue, toSelectorValue } from "../src/convert";

describe("override field conversion", () => {
  it("converts durations to and from seconds", () => {
    expect(toSelectorValue("duration", 3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
    expect(toSelectorValue("duration", null)).toBeUndefined();
    expect(fromSelectorValue("duration", { hours: 0, minutes: 2, seconds: 30 })).toBe(150);
  });
  it("converts booleans to and from yes/no option values", () => {
    expect(toSelectorValue("boolean", false)).toBe("false");
    expect(toSelectorValue("boolean", true)).toBe("true");
    expect(fromSelectorValue("boolean", "true")).toBe(true);
    expect(fromSelectorValue("boolean", "false")).toBe(false);
    expect(fromSelectorValue("boolean", "")).toBeNull();
  });
  it("passes numbers and select values through", () => {
    expect(fromSelectorValue("number", "0.5")).toBe(0.5);
    expect(fromSelectorValue("number", 0)).toBe(0);
    expect(fromSelectorValue("select", "hold")).toBe("hold");
    expect(fromSelectorValue("select", undefined)).toBeNull();
    expect(toSelectorValue("number", 0)).toBe(0);
  });
  it("formats inherited values for the helper text", () => {
    expect(formatInherited("duration", 1800)).toBe("30m");
    expect(formatInherited("boolean", true)).toBe("Yes");
    expect(formatInherited("boolean", false)).toBe("No");
    expect(formatInherited("number", 5)).toBe("5");
    expect(formatInherited("select", "hold")).toBe("hold");
  });
});

describe("multiplier", () => {
  it("always shows one decimal and the sign, so a column of them lines up", () => {
    expect(formatMultiplier(1)).toBe("1.0×");
    expect(formatMultiplier(0)).toBe("0.0×");
    expect(formatMultiplier(1.04)).toBe("1.0×");
    expect(formatMultiplier(2.5)).toBe("2.5×");
  });

  it("is a plain number across the selector boundary, and reads back as one", () => {
    expect(toSelectorValue("multiplier", 1.5)).toBe(1.5);
    expect(fromSelectorValue("multiplier", "2.5")).toBe(2.5);
    expect(fromSelectorValue("multiplier", "")).toBeNull();
    expect(formatInherited("multiplier", 1.5)).toBe("1.5×");
    expect(formatInherited("multiplier", null)).toBe("unset");
  });
});
