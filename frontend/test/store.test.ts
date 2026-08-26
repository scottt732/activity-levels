import { describe, expect, it } from "vitest";
import { Draft, getAt, insertAt, moveAt, removeAt, setAt } from "../src/store";
import type { Config } from "../src/types";

const base: Config = {
  version: 1,
  defaults: { envelope: "default", max_value: 5, precision: 1, unavailable: "hold", retrigger: "only_in_release", debounce: 0, safety_refresh: 60, min_wake_interval: 1 },
  envelopes: [{ id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null }],
  groups: [{ id: "house", name: "House", area: null, mix: "sum", null_handling: "zero", max_value: null, precision: null, gain: 1, stimuli: [], children: [
    { id: "kitchen", name: null, area: null, mix: "sum", null_handling: "zero", max_value: null, precision: null, gain: 1, stimuli: [], children: [] },
  ] }],
};

describe("path ops", () => {
  it("get/set with structural sharing", () => {
    const next = setAt(base, ["groups", 0, "children", 0, "name"], "Kitchen");
    expect(getAt(next, ["groups", 0, "children", 0, "name"])).toBe("Kitchen");
    expect(next.envelopes).toBe(base.envelopes);
    expect(next.groups).not.toBe(base.groups);
    expect(base.groups[0]!.children[0]!.name).toBeNull();
  });
  it("insert/remove/move in lists", () => {
    const g = { ...base.groups[0]!.children[0]!, id: "bath" };
    let next = insertAt(base, ["groups", 0, "children"], 1, g);
    expect(next.groups[0]!.children.map((c) => c.id)).toEqual(["kitchen", "bath"]);
    next = moveAt(next, ["groups", 0, "children"], 1, 0);
    expect(next.groups[0]!.children.map((c) => c.id)).toEqual(["bath", "kitchen"]);
    next = removeAt(next, ["groups", 0, "children", 0]);
    expect(next.groups[0]!.children.map((c) => c.id)).toEqual(["kitchen"]);
  });
});

describe("Draft", () => {
  it("tracks dirty, undo, redo", () => {
    const d = new Draft(base);
    expect(d.dirty).toBe(false);
    d.set(setAt(d.config, ["groups", 0, "name"], "Home"));
    expect(d.dirty).toBe(true);
    expect(d.canUndo).toBe(true);
    d.undo();
    expect(d.dirty).toBe(false);
    expect(d.canRedo).toBe(true);
    d.redo();
    expect(d.config.groups[0]!.name).toBe("Home");
    d.reset(d.config);
    expect(d.dirty).toBe(false);
    expect(d.canUndo).toBe(false);
  });
});
