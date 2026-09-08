import { describe, expect, it } from "vitest";
import { floorplanModel, inScope, activityReading } from "../src/floorplan-model";
import { newGroup } from "../src/model";
import { roomsConfig } from "./fixtures";
import type { GroupLive, LiveState } from "../src/types";

describe("floorplan scene model", () => {
  it("uses each room's physical coordinates independently of hierarchy and GPS", () => {
    const config = roomsConfig();
    config.gps = { latitude: 0, longitude: 0, elevation: 500 };
    const room = config.groups[0]!.children[0]!.children[0]!;
    room.points = [[4, 5], [7, 5], [7, 8], [5, 8], [5, 9], [4, 9]];
    room.bounds = [[4, 5, 11.8], [7, 9, 13.8]];
    const model = floorplanModel(config);
    expect(model.parts).toHaveLength(1);
    expect(model.parts[0]).toMatchObject({ id: "kitchen", low: 11.8, high: 13.8, footprint: room.points });
    expect(model.groups.map((group) => group.id)).toEqual(["house", "downstairs", "kitchen"]);
    expect(inScope(model.parts, "house")).toHaveLength(1);
    expect(inScope(model.parts, "kitchen")).toHaveLength(1);
    expect(inScope(model.parts, "bedroom")).toHaveLength(0);
  });

  it("turns bounds into rectangular outlines for containers", () => {
    const config = roomsConfig();
    config.groups[0]!.bounds = [[1, 2, 3], [5, 7, 9]];
    const part = floorplanModel(config).parts[0]!;
    expect(part.footprint).toEqual([[1, 2], [5, 2], [5, 7], [1, 7]]);
    expect(part.container).toBe(true);
  });

  it("does not invent placement for a footprint without vertical bounds", () => {
    const config = roomsConfig();
    config.groups[0]!.children[0]!.children[0]!.points = [[0, 0], [2, 0], [0, 2]];
    const model = floorplanModel(config);
    expect(model.parts).toEqual([]);
    expect(model.issues[0]).toMatchObject({ id: "kitchen", reason: expect.stringContaining("vertical bounds") });
    expect(model.groups.map((group) => group.id)).toContain("kitchen");
  });

  it("skips invalid draft geometry with a reason, and normalizes redundant vertices", () => {
    const config = roomsConfig();
    const rooms = config.groups[0]!.children[0]!.children;
    rooms[0]!.bounds = [[0, 0, 0], [3, 4, 2]];
    rooms[0]!.points = [[0, 0], [3, 0], [3, 0], [0, 4], [0, 0]];
    rooms[1]!.bounds = [[0, 0, 0], [3, Number.NaN, 2]];
    const model = floorplanModel(config);
    expect(model.parts[0]!.footprint).toHaveLength(3);
    expect(model.issues[0]!.id).toBe("dining_room");
  });

  it("filters by actual floor membership, even when two floors overlap in XY", () => {
    const config = roomsConfig();
    const structure = config.groups[0]!.children[0]!;
    structure.children = [
      { ...newGroup("ground", "floor"), bounds: [[0, 0, 0], [5, 5, 3]], children: [
        { ...newGroup("one", "area"), bounds: [[0, 0, 0], [2, 3, 3]] },
      ] },
      { ...newGroup("upper", "floor"), bounds: [[0, 0, 3], [5, 5, 6]], children: [
        { ...newGroup("two", "area"), bounds: [[0, 0, 3], [2, 3, 6]] },
      ] },
    ];
    const model = floorplanModel(config);
    expect(inScope(model.parts, "upper").map((part) => part.id)).toEqual(["upper", "two"]);
    expect(model.scopes.map((group) => group.id)).toContain("upper");
  });
});

describe("floorplan activity readings", () => {
  const frame = (value: number, max = 5): LiveState => ({ now: 1000, voices: {}, groups: {
    room: { value, max_value: max, active: value > 0 } as GroupLive,
  } });
  it("uses the selected group's own level and clamps shading", () => {
    expect(activityReading(frame(2), "room", 1001)).toMatchObject({ ratio: 0.4, value: 2, status: "live" });
    expect(activityReading(frame(20), "room", 1001).ratio).toBe(1);
    expect(activityReading(frame(0), "room", 1001).ratio).toBe(0);
  });
  it("distinguishes missing, invalid and stale data from an inactive room", () => {
    expect(activityReading(null, "room", 1001).status).toBe("missing");
    expect(activityReading(frame(2), "absent", 1001).ratio).toBeNull();
    expect(activityReading(frame(2), "room", 1011).status).toBe("stale");
    expect(activityReading(frame(Number.NaN), "room", 1001).ratio).toBeNull();
    expect(activityReading(frame(2, 0), "room", 1001).ratio).toBeNull();
  });
});
