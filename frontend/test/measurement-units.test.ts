import { expect, it } from "vitest";
import { defaultLengthUnit, formatLength, fromMeters, toMeters } from "../src/measurement-units";

it("defaults to HA's measurement system with metric fallback", () => {
  expect(defaultLengthUnit()).toBe("m");
  expect(defaultLengthUnit({config:{unit_system:{length:"km"}}})).toBe("m");
  expect(defaultLengthUnit({config:{unit_system:{length:"mi"}}})).toBe("ft");
  expect(defaultLengthUnit({config:{unit_system:{length:"ft"}}})).toBe("ft");
});

it("converts display units without rounding the stored geometry", () => {
  expect(toMeters(10, "ft")).toBe(3.048);
  expect(fromMeters(3.048, "ft")).toBe(10);
  expect(toMeters(fromMeters(2.37412, "ft"), "ft")).toBeCloseTo(2.37412, 12);
  expect(toMeters(2.37412, "m")).toBe(2.37412);
  expect(formatLength(3.048, "ft")).toBe("10 ft");
});
