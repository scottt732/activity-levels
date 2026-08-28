import { describe, expect, it, vi } from "vitest";
import { newGroup } from "../src/model";
import { Draft, getAt, insertAt, legalDrop, moveAt, moveNode, removeAt, setAt } from "../src/store";
import { kindsConfig } from "./fixtures";
import type { Config, Path } from "../src/types";

const base: Config = {
  version: 1,
  defaults: { envelope: "default", max_value: 5, precision: 1, unavailable: "hold", retrigger: "only_in_release", debounce: 0, safety_refresh: 60, min_wake_interval: 1 },
  envelopes: [{ id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null }],
  groups: [{ ...newGroup("house", "structure"), name: "House", children: [newGroup("kitchen", "area")] }],
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

describe("getAt", () => {
  it("returns undefined when a step along the path is missing", () => {
    expect(getAt(base, ["groups", 5, "children", 0])).toBeUndefined();
    expect(getAt(base, ["groups", 0, "stimuli", 0, "entity"])).toBeUndefined();
    expect(getAt(base, ["groups", 0, "id"])).toBe("house");
  });
});

describe("Draft coalescing", () => {
  const PAUSE = 1500;
  const rename = (d: Draft, name: string, key?: string): void => {
    d.set(setAt(d.config, ["groups", 0, "name"], name), key);
  };

  it("merges rapid edits of one field into a single undo step", () => {
    vi.useFakeTimers();
    try {
      const d = new Draft(base);
      rename(d, "H", "groups/0:name");
      rename(d, "Ho", "groups/0:name");
      rename(d, "Hom", "groups/0:name");
      expect(d.config.groups[0]!.name).toBe("Hom");
      d.undo();
      expect(d.config).toBe(base);
      expect(d.canUndo).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps separate steps for another field, a pause, or an unkeyed edit", () => {
    vi.useFakeTimers();
    try {
      const d = new Draft(base);
      rename(d, "A", "groups/0:name");
      d.set(setAt(d.config, ["groups", 0, "id"], "home"), "groups/0:id");
      d.undo();
      expect(d.config.groups[0]!.id).toBe("house");
      expect(d.config.groups[0]!.name).toBe("A");

      vi.advanceTimersByTime(PAUSE);
      rename(d, "B", "groups/0:name");
      vi.advanceTimersByTime(PAUSE);
      rename(d, "C", "groups/0:name");
      d.undo();
      expect(d.config.groups[0]!.name).toBe("B");

      rename(d, "D");
      rename(d, "E");
      d.undo();
      expect(d.config.groups[0]!.name).toBe("D");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("legalDrop", () => {
  const cfg = kindsConfig();
  const PROPERTY: Path = ["groups", 0];
  const HOUSE: Path = ["groups", 0, "children", 0];
  const DOWNSTAIRS: Path = ["groups", 0, "children", 0, "children", 0];
  const KITCHEN: Path = ["groups", 0, "children", 0, "children", 0, "children", 0];
  const PATIO: Path = ["groups", 0, "children", 1];
  const KITCHEN_STIMULUS: Path = [...KITCHEN, "stimuli", 0];

  it("allows a move the nesting rules permit", () => {
    expect(legalDrop(cfg, KITCHEN, [...HOUSE, "children"], 1)).toEqual({ ok: true });
  });

  it("refuses a kind the destination cannot contain", () => {
    const verdict = legalDrop(cfg, KITCHEN, ["groups", 0, "children"], 0);
    expect(verdict.ok).toBe(false);
    expect(verdict).toMatchObject({ reason: expect.stringContaining("property cannot contain") });
  });

  it("refuses a group into itself or into its own descendant", () => {
    expect(legalDrop(cfg, HOUSE, [...HOUSE, "children"], 0).ok).toBe(false);
    expect(legalDrop(cfg, HOUSE, [...DOWNSTAIRS, "children"], 0)).toMatchObject({
      reason: expect.stringContaining("into itself"),
    });
  });

  it("only lets a root list take a property, and only a property", () => {
    expect(legalDrop(cfg, PATIO, ["groups"], 1)).toMatchObject({
      reason: expect.stringContaining("every root group is a property"),
    });
    expect(legalDrop(cfg, PROPERTY, ["groups"], 0)).toEqual({ ok: true });
  });

  it("keeps a stimulus inside a stimuli list and a group out of one", () => {
    expect(legalDrop(cfg, KITCHEN_STIMULUS, [...HOUSE, "children"], 0)).toMatchObject({
      reason: expect.stringContaining("belongs to a group"),
    });
    expect(legalDrop(cfg, KITCHEN, [...KITCHEN, "stimuli"], 0)).toMatchObject({
      reason: expect.stringContaining("not a stimulus"),
    });
  });

  it("refuses an index outside the destination list", () => {
    expect(legalDrop(cfg, KITCHEN, [...HOUSE, "children"], 9).ok).toBe(false);
    expect(legalDrop(cfg, KITCHEN, [...HOUSE, "children"], -1).ok).toBe(false);
  });

  it("refuses a path that names nothing", () => {
    expect(legalDrop(cfg, ["groups", 7], ["groups"], 0).ok).toBe(false);
    expect(legalDrop(cfg, KITCHEN, ["groups", 7, "children"], 0).ok).toBe(false);
  });
});

describe("moveNode", () => {
  const ids = (c: Config, path: Path): string[] =>
    (getAt<{ id: string }[]>(c, path) ?? []).map((g) => g.id);

  it("reparents a group and leaves the rest of the document shared", () => {
    const cfg = kindsConfig();
    const next = moveNode(cfg, ["groups", 0, "children", 0, "children", 0, "children", 0], ["groups", 0, "children", 0, "children"], 1);
    expect(ids(next, ["groups", 0, "children", 0, "children"])).toEqual(["downstairs", "kitchen"]);
    expect(ids(next, ["groups", 0, "children", 0, "children", 0, "children"])).toEqual(["hall"]);
    expect(next.envelopes).toBe(cfg.envelopes);
    expect(cfg.groups[0]!.children[0]!.children[0]!.children).toHaveLength(2);
  });

  it("compensates for its own removal when moving down inside one list", () => {
    const cfg = kindsConfig();
    const list: Path = ["groups", 0, "children", 0, "children", 0, "children"];
    expect(ids(cfg, list)).toEqual(["kitchen", "hall"]);
    // "put the kitchen at slot 2 of the list as it reads now" = after the hall
    expect(ids(moveNode(cfg, [...list, 0], list, 2), list)).toEqual(["hall", "kitchen"]);
    // and moving up needs no compensation at all
    expect(ids(moveNode(cfg, [...list, 1], list, 0), list)).toEqual(["hall", "kitchen"]);
  });

  it("is a no-op move, not a duplication, when the slot is where it already is", () => {
    const cfg = kindsConfig();
    const list: Path = ["groups", 0, "children", 0, "children", 0, "children"];
    expect(ids(moveNode(cfg, [...list, 0], list, 0), list)).toEqual(["kitchen", "hall"]);
  });

  /** Three root properties, each holding one building: room enough to move forwards. */
  const threeRoots = (): Config => ({
    ...base,
    groups: [
      { ...newGroup("a", "property"), children: [newGroup("a_house", "structure")] },
      { ...newGroup("b", "property"), children: [newGroup("b_house", "structure")] },
      { ...newGroup("c", "property"), children: [newGroup("c_house", "structure")] },
    ],
  });

  // The destination is named against the document as it reads *now*, and lifting the node
  // out shifts everything after it in its own list up by one — including the ancestor the
  // destination is inside. Without rebasing, this walked into a slot that no longer exists.
  it("rebases a destination that sits under a later sibling of the node it moves", () => {
    const next = moveNode(threeRoots(), ["groups", 0], ["groups", 2, "children"], 0);
    expect(ids(next, ["groups"])).toEqual(["b", "c"]);
    expect(ids(next, ["groups", 1, "children"])).toEqual(["a", "c_house"]);
  });

  it("lands a forward move before or after the row the caller named", () => {
    const list: Path = ["groups", 2, "children"];
    expect(ids(moveNode(threeRoots(), ["groups", 0], list, 0), ["groups", 1, "children"])).toEqual(["a", "c_house"]);
    expect(ids(moveNode(threeRoots(), ["groups", 0], list, 1), ["groups", 1, "children"])).toEqual(["c_house", "a"]);
  });

  it("moves one root property into another", () => {
    const next = moveNode(threeRoots(), ["groups", 0], ["groups", 1, "children"], 0);
    expect(ids(next, ["groups"])).toEqual(["b", "c"]);
    expect(ids(next, ["groups", 0, "children"])).toEqual(["a", "b_house"]);
  });

  it("leaves a backward move's destination alone", () => {
    const next = moveNode(threeRoots(), ["groups", 2], ["groups", 0, "children"], 0);
    expect(ids(next, ["groups"])).toEqual(["a", "b"]);
    expect(ids(next, ["groups", 0, "children"])).toEqual(["c", "a_house"]);
  });

  it("rebases a destination nested deeper under a later sibling", () => {
    const cfg: Config = {
      ...base,
      groups: [
        {
          ...newGroup("p", "property"),
          children: [
            { ...newGroup("h1", "structure"), children: [newGroup("f1", "floor")] },
            { ...newGroup("h2", "structure"), children: [newGroup("f2", "floor")] },
          ],
        },
      ],
    };
    const next = moveNode(cfg, ["groups", 0, "children", 0], ["groups", 0, "children", 1, "children"], 1);
    expect(ids(next, ["groups", 0, "children"])).toEqual(["h2"]);
    expect(ids(next, ["groups", 0, "children", 0, "children"])).toEqual(["f2", "h1"]);
  });

  it("moves a stimulus between groups", () => {
    const cfg = kindsConfig();
    const kitchen: Path = ["groups", 0, "children", 0, "children", 0, "children", 0];
    const hall: Path = ["groups", 0, "children", 0, "children", 0, "children", 1];
    const next = moveNode(cfg, [...kitchen, "stimuli", 0], [...hall, "stimuli"], 0);
    expect(getAt<unknown[]>(next, [...kitchen, "stimuli"])).toHaveLength(0);
    expect(getAt<{ entity: string }[]>(next, [...hall, "stimuli"])!.map((s) => s.entity)).toEqual([
      "binary_sensor.kitchen_motion",
      "binary_sensor.hall_motion",
    ]);
  });
});
