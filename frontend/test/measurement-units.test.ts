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

import { parseLength, formatLengthInput } from "../src/measurement-units";
it("accepts decimal feet, inch marks, mixed feet/inches and fractions",()=>{
  for(const text of ["2'6\"",'30"',"2.5","2 ft 6 in","2′6″"," 2 feet 6 inches "])expect(parseLength(text,"ft")).toBeCloseTo(.762);
  expect(parseLength("2'6 1/2\"","ft")).toBeCloseTo(.7747);
  expect(parseLength('-30"',"ft")).toBeCloseTo(-.762);
  expect(parseLength("2.5","m")).toBe(2.5);
  expect(parseLength('30"',"m")).toBeCloseTo(.762);
  for(const text of ["", "2'6", "abc", "Infinity", '1/0"', '2" garbage', "2-6", "2' -6\""])expect(parseLength(text,"ft")).toBeNull();
  expect(formatLengthInput(.762,"ft")).toBe("2'6\"");
  expect(formatLengthInput(-.762,"ft")).toBe("-2'6\"");
  expect(formatLengthInput(.3048-.00000001,"ft")).toBe("1'0\"");
});
