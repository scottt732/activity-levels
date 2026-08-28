import { describe, expect, it } from "vitest";
import { ALLOWED_CHILDREN, KINDS, KIND_DEFS, NODE_KINDS, allowedChildKinds, isDescendantPath } from "../src/kinds";

describe("kinds", () => {
  it("lists the layering outermost first, and defines every one of them", () => {
    expect(KINDS).toEqual(["property", "structure", "floor", "area", "outside"]);
    for (const kind of KINDS) {
      expect(KIND_DEFS[kind].label.length).toBeGreaterThan(0);
      expect(KIND_DEFS[kind].icon.startsWith("mdi:")).toBe(true);
      expect(KIND_DEFS[kind].definition.endsWith(".")).toBe(true);
    }
  });

  it("mirrors the backend's nesting table exactly", () => {
    expect(allowedChildKinds(null)).toEqual(["property"]);
    expect(ALLOWED_CHILDREN.property).toEqual(["property", "structure", "outside"]);
    expect(ALLOWED_CHILDREN.structure).toEqual(["floor", "area"]);
    expect(ALLOWED_CHILDREN.floor).toEqual(["area"]);
    expect(ALLOWED_CHILDREN.area).toEqual(["area"]);
    expect(ALLOWED_CHILDREN.outside).toEqual(["outside"]);
  });

  it("knows which kinds are places a person can be", () => {
    expect([...NODE_KINDS].sort()).toEqual(["area", "outside"]);
  });

  it("recognises a descendant path, and does not call a node its own descendant", () => {
    expect(isDescendantPath(["groups", 0], ["groups", 0, "children", 1])).toBe(true);
    expect(isDescendantPath(["groups", 0], ["groups", 0])).toBe(false);
    expect(isDescendantPath(["groups", 0], ["groups", 1, "children", 0])).toBe(false);
    // index 1 is not a prefix of index 10, whatever string concatenation would say
    expect(isDescendantPath(["groups", 1], ["groups", 10, "children", 0])).toBe(false);
  });
});
