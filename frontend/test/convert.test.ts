import { describe, expect, it } from "vitest";
import {
  formatInherited,
  formatMultiplier,
  formatToList,
  fromSelectorValue,
  parseToList,
  toSelectorValue,
} from "../src/convert";

describe("stimulus state-list conversion", () => {
  it("splits, trims and drops empty entries", () => {
    expect(parseToList(" on , playing ,, ")).toEqual(["on", "playing"]);
    expect(parseToList("")).toEqual([]);
    expect(parseToList("   ")).toEqual([]);
  });
  it("joins for display and round-trips", () => {
    expect(formatToList(["on", "playing"])).toBe("on, playing");
    expect(formatToList(null)).toBe("");
    expect(parseToList(formatToList(["on", "paused"]))).toEqual(["on", "paused"]);
  });
});

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

describe("state-list text while typing", () => {
  it("round-trips a finished multi-state list", () => {
    expect(parseToList("on, playing")).toEqual(["on", "playing"]);
    expect(formatToList(parseToList("on, playing"))).toBe("on, playing");
  });
  it("loses trailing separators on the way back, which is why raw text must be kept", () => {
    expect(parseToList("on, playing,")).toEqual(["on", "playing"]);
    expect(formatToList(parseToList("on, playing,"))).toBe("on, playing");
    expect(parseToList("on,")).toEqual(["on"]);
    expect(formatToList(parseToList("on,"))).toBe("on");
    expect(formatToList(parseToList("on, "))).toBe("on");
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
