import { describe, expect, it } from "vitest";
import { fieldErrors, subtreeErrorCount } from "../src/errors";

const errors = [
  { path: "groups/0/id", message: "bad id" },
  { path: "groups/0/children/1/stimuli/0/gain", message: "must be > 0" },
  { path: "groups/0/children/1", message: "needs a stimulus" },
];

describe("errors", () => {
  it("maps direct children of a prefix to fields", () => {
    expect(fieldErrors(errors, ["groups", 0])).toEqual({ id: "bad id" });
    expect(fieldErrors(errors, ["groups", 0, "children", 1, "stimuli", 0])).toEqual({ gain: "must be > 0" });
  });
  it("counts errors in a subtree including the node itself", () => {
    expect(subtreeErrorCount(errors, ["groups", 0])).toBe(3);
    expect(subtreeErrorCount(errors, ["groups", 0, "children", 1])).toBe(2);
    expect(subtreeErrorCount(errors, ["envelopes"])).toBe(0);
  });
});
