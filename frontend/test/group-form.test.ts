import { describe, expect, it } from "vitest";
import { changedGroupField, groupData, groupSchema, mergeGroup } from "../src/group-form";
import { houseConfig, roomsConfig } from "./fixtures";
import type { Group } from "../src/types";

const FIELDS = ["id", "name", "adjacent", "exit"] as const;
const kitchen = (): Group => roomsConfig().groups[0]!.children[0]!.children[0]!;

describe("adjacency fields", () => {
  it("offers every other group, never the group itself", () => {
    const config = roomsConfig();
    const item = groupSchema(kitchen(), false, FIELDS, config).find((i) => i.name === "adjacent")!;
    const options = (item.selector.select as { options: { value: string }[] }).options;
    expect(options.map((o) => o.value)).not.toContain("kitchen");
    expect(options.map((o) => o.value)).toContain("dining_room");
    expect((item.selector.select as { multiple?: boolean }).multiple).toBe(true);
  });

  it("spells the current value as plain ids", () => {
    expect(groupData(kitchen(), false, FIELDS, roomsConfig()).adjacent).toEqual([
      "dining_room",
      "back_patio",
    ]);
    expect(groupData(kitchen(), false, FIELDS, roomsConfig()).exit).toBe(false);
  });

  it("keeps a one-way edge one-way when the picker did not touch it", () => {
    const hall = roomsConfig().groups[0]!.children[0]!.children[2]!;
    const merged = mergeGroup(hall, { adjacent: ["bedroom", "dining_room"] });
    expect(merged.adjacent).toEqual([{ id: "bedroom", one_way: true }, "dining_room"]);
    expect(changedGroupField(merged, hall)).toBe("adjacent");
  });

  it("drops an edge the picker deselected", () => {
    const merged = mergeGroup(kitchen(), { adjacent: ["dining_room"] });
    expect(merged.adjacent).toEqual(["dining_room"]);
  });

  it("reports no change when the selection is the same set", () => {
    const group = kitchen();
    expect(changedGroupField(mergeGroup(group, { adjacent: ["dining_room", "back_patio"] }), group))
      .toBeUndefined();
  });

  it("merges the exit toggle", () => {
    expect(mergeGroup(kitchen(), { exit: true }).exit).toBe(true);
  });

  it("leaves a config with no adjacency alone", () => {
    const group = houseConfig().groups[0]!;
    expect(groupData(group, true, FIELDS, houseConfig()).adjacent).toEqual([]);
  });

  it("keeps a dangling adjacency id through an unrelated edit, for the backend to catch on save", () => {
    // A sibling group named here was deleted elsewhere; `al-group-editor`'s delete does no
    // adjacency cleanup. The id must survive the round trip through `ha-form` so the
    // backend's `unknown group` validation catches it on Save - not vanish silently the
    // next time some other field on this group is edited.
    const config = roomsConfig();
    const group: Group = { ...kitchen(), adjacent: ["dining_room", "deleted_room"] };
    const data = groupData(group, false, FIELDS, config);
    expect(data.adjacent).toEqual(["dining_room", "deleted_room"]);
    const merged = mergeGroup(group, { ...data, name: "Kitchen 2" });
    expect(merged.adjacent).toEqual(["dining_room", "deleted_room"]);
  });

  it("badges a one-way edge with an arrow, leaving a symmetric edge alone", () => {
    const config = roomsConfig();
    const hall = config.groups[0]!.children[0]!.children[2]!;
    const item = groupSchema(hall, false, FIELDS, config).find((i) => i.name === "adjacent")!;
    const options = (item.selector.select as { options: { value: string; label: string }[] }).options;
    expect(options.find((o) => o.value === "bedroom")?.label).toBe("Bedroom →");
    expect(options.find((o) => o.value === "dining_room")?.label).toBe("Dining Room");
  });
});
