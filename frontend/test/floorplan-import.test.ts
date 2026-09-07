import { describe, expect, it } from "vitest";
import { applyImport, suggestMatches, creationDefaults } from "../src/floorplan-import";
import type { ImportChoices } from "../src/floorplan-import";
import { newGroup } from "../src/model";
import { roomsConfig } from "./fixtures";
import { Draft } from "../src/store";
import { source } from "./floorplan-fixture";


describe("floorplan import", () => {
  it("suggests a unique match without creating unmatched floors", () => {
    expect(suggestMatches(roomsConfig(), source())).toEqual({
      "floors/0": { action: "skip" },
      "floors/0/rooms/0": { action: "existing", id: "kitchen" },
    });
  });

  it("does not guess ambiguous names or map two source rows onto one group", () => {
    const config = roomsConfig();
    config.groups[0]!.children.push({ ...newGroup("second_kitchen", "structure"), name: "Kitchen" });
    expect(suggestMatches(config, source())["floors/0/rooms/0"]).toEqual({ action: "skip" });
    const input = source();
    input.items.push({ ...input.items[1]!, key: "floors/0/rooms/1" });
    expect(Object.values(suggestMatches(roomsConfig(), input)).every((c) => c.action === "skip")).toBe(true);
  });

  it("updates only geometry despite a different source hierarchy and makes one undoable edit", () => {
    const config = roomsConfig();
    const before = structuredClone(config);
    const draft = new Draft(config);
    const applied = applyImport(config, source(), suggestMatches(config, source()), false);
    draft.set(applied.config);
    const kitchen = applied.config.groups[0]!.children[0]!.children[0]!;
    expect(kitchen.bounds![0][2]).toBe(11.8);
    const { points, bounds, ...settings } = kitchen;
    expect(points).toHaveLength(3);
    expect(bounds).toBeDefined();
    expect(settings).toEqual(before.groups[0]!.children[0]!.children[0]);
    expect(applied.config.gps).toBeUndefined();
    expect(config).toEqual(before);
    draft.undo(); expect(draft.config).toEqual(before);
    draft.redo(); expect(draft.config).toEqual(applied.config);
  });

  it("supports GPS-only explicit opt-in, keeping existing GPS otherwise", () => {
    const config = roomsConfig();
    config.gps = { latitude: 1, longitude: 2 };
    expect(applyImport(config, source(), {}, false).config).toBe(config);
    expect(applyImport(config, source(), {}, true).config.gps).toEqual(source().gps);
  });

  it("creates only explicitly chosen groups under explicitly chosen parents", () => {
    const config = roomsConfig();
    const choices: ImportChoices = {
      "floors/0": { action: "create", id: "new_floor", name: "New floor", kind: "floor", parent: { id: "downstairs" } },
      "floors/0/rooms/0": { action: "create", id: "new_room", name: "New room", kind: "area", parent: { key: "floors/0" } },
    };
    const applied = applyImport(config, source(), choices, false);
    const created = applied.config.groups[0]!.children[0]!.children.at(-1)!;
    expect(created.id).toBe("new_floor");
    expect(created.children[0]!.bounds![1][2]).toBe(13.8);
    expect(created.children[0]!.area_id).toBeNull();
    expect(created.floor_id).toBeNull();
    expect(applied.created).toBe(true);
  });

  it("lets an empty config start with explicit property and structure creation", () => {
    const config = { ...roomsConfig(), groups: [] };
    const choices: ImportChoices = {
      "floors/0": { action: "create", id: "home", name: "Home", kind: "property", parent: null },
      "floors/0/rooms/0": { action: "create", id: "house", name: "House", kind: "structure", parent: { key: "floors/0" } },
    };
    expect(applyImport(config, source(), choices, false).config.groups[0]!.children[0]!.id).toBe("house");
  });

  it("requires a parent, compatible nesting, unique IDs and unique destinations", () => {
    const config = roomsConfig();
    const row = source().items[0]!;
    const create = creationDefaults(config, row, {});
    expect(() => applyImport(config, source(), { [row.key]: create }, false)).toThrow(/parent/i);
    expect(() => applyImport(config, source(), { [row.key]: { ...create, id: "kitchen", parent: { id: "downstairs" } } }, false)).toThrow(/ID/);
    expect(() => applyImport(config, source(), { [row.key]: { ...create, parent: { id: "house" } } }, false)).toThrow(/contain/);
    expect(() => applyImport(config, source(), {
      "floors/0": { action: "existing", id: "kitchen" },
      "floors/0/rooms/0": { action: "existing", id: "kitchen" },
    }, false)).toThrow(/more than once/);
  });

  it("rejects cyclic or missing creation parents", () => {
    const config = roomsConfig();
    const choice = { action: "create" as const, id: "room", name: "Room", kind: "area" as const, parent: { key: "floors/0/rooms/0" } };
    expect(() => applyImport(config, source(), { "floors/0/rooms/0": choice }, false)).toThrow(/cycle/);
    expect(() => applyImport(config, source(), { "floors/0": { ...choice, parent: { id: "gone" } } }, false)).toThrow(/parent/);
  });

  it("does not preserve stale height when replacing a footprint with no vertical data", () => {
    const config = roomsConfig();
    config.groups[0]!.children[0]!.children[0]!.bounds = [[0, 0, 0], [3, 4, 3]];
    const input = source(); delete input.items[1]!.bounds;
    const applied = applyImport(config, input, suggestMatches(config, input), false);
    expect(applied.config.groups[0]!.children[0]!.children[0]!.bounds).toBeUndefined();
  });
});
