import { describe, expect, it } from "vitest";
import {
  IDENTITY_FIELDS,
  MIX_FIELDS,
  bindArea,
  bindFloor,
  changedGroupField,
  groupData,
  groupSchema,
  isDefaultId,
  mergeGroup,
} from "../src/group-form";
import { newGroup } from "../src/model";
import { kindsConfig } from "./fixtures";
import type { Kind } from "../src/kinds";
import type { Group } from "../src/types";

const kitchen = (): Group => kindsConfig().groups[0]!.children[0]!.children[0]!.children[0]!;

describe("binding to Home Assistant", () => {
  it("treats the id the tree generated as still-default, and a typed one as the user's", () => {
    expect(isDefaultId({ ...newGroup("area", "area") })).toBe(true);
    expect(isDefaultId({ ...newGroup("area_3", "area") })).toBe(true);
    expect(isDefaultId({ ...newGroup("", "area") })).toBe(true);
    expect(isDefaultId({ ...newGroup("kitchen", "area") })).toBe(false);
  });

  it("prefills the id from the registry id and the name from the registry name", () => {
    // The registry id is what the entity ids downstream are made of, so it is what the
    // group's id is taken from; the friendly name is only ever the friendly name.
    const fresh = bindArea(newGroup("area", "area"), "larder", "The Larder");
    expect(fresh).toMatchObject({ area_id: "larder", id: "larder", name: "The Larder" });
  });

  it("prefills only while the id and the name are both still defaults", () => {
    const named = bindArea({ ...newGroup("larder", "area"), name: "Larder" }, "kitchen_area", "Kitchen");
    expect(named).toMatchObject({ area_id: "kitchen_area", id: "larder", name: "Larder" });
    const halfway = bindArea({ ...newGroup("area", "area"), name: "Larder" }, "kitchen_area", "Kitchen");
    expect(halfway).toMatchObject({ id: "kitchen_area", name: "Larder" });
  });

  it("never prefills an id another group already answers to", () => {
    const config = kindsConfig();
    expect(bindArea(newGroup("area", "area"), "kitchen", "Kitchen", config).id).toBe("kitchen_2");
    expect(bindArea(newGroup("area", "area"), "larder", "The Larder", config).id).toBe("larder");
  });

  it("clearing the binding leaves the id and the name alone", () => {
    const bound = bindArea(newGroup("area", "area"), "larder", "The Larder");
    expect(bindArea(bound, null, null)).toMatchObject({ area_id: null, id: "larder", name: "The Larder" });
  });

  it("binds a floor the same way", () => {
    expect(bindFloor(newGroup("floor", "floor"), "upstairs", "Upstairs")).toMatchObject({
      floor_id: "upstairs",
      id: "upstairs",
      name: "Upstairs",
    });
  });

  it("offers the registry picker that fits the kind, and only that one", () => {
    const names = (kind: Kind): string[] =>
      groupSchema({ ...newGroup("x", kind) }, false, IDENTITY_FIELDS).map((i) => i.name);
    expect(names("floor")).toEqual(["kind", "floor_id", "id", "name"]);
    expect(names("area")).toEqual(["kind", "area_id", "id", "name"]);
    expect(names("outside")).toEqual(["kind", "area_id", "id", "name"]);
    expect(names("property")).toEqual(["kind", "id", "name"]);
    expect(names("structure")).toEqual(["kind", "id", "name"]);
  });

  it("offers only the kinds this group's parent may contain", () => {
    const config = kindsConfig();
    const item = groupSchema(config.groups[0]!, false, ["kind"], config, "property")[0]!;
    const options = (item.selector.select as { options: { value: string }[] }).options;
    expect(options.map((o) => o.value)).toEqual(["property", "structure", "outside"]);
  });

  it("keeps a kind the parent forbids in the picker, so a wrong document still reads right", () => {
    // `house` is a structure; a structure may only hold floors and areas, so a document
    // that nested it under one is wrong - and the picker still has to say what it is.
    const config = kindsConfig();
    const item = groupSchema(config.groups[0]!.children[0]!, false, ["kind"], config, "structure")[0]!;
    const options = (item.selector.select as { options: { value: string }[] }).options;
    expect(options.map((o) => o.value)).toEqual(["floor", "area", "structure"]);
  });
});

describe("group fields", () => {
  it("asks how idle contributors count only for a mean, and for gain only off the root", () => {
    const group = kitchen();
    expect(groupSchema(group, false, MIX_FIELDS).map((i) => i.name)).toEqual(["mix", "gain"]);
    expect(groupSchema({ ...group, mix: "mean" }, false, MIX_FIELDS).map((i) => i.name)).toEqual([
      "mix",
      "null_handling",
      "gain",
    ]);
    expect(groupSchema(group, true, MIX_FIELDS).map((i) => i.name)).toEqual(["mix"]);
  });

  it("leaves an unbound registry id out of the payload rather than sending an empty string", () => {
    const data = groupData(kitchen(), false, IDENTITY_FIELDS);
    expect(data).toEqual({ kind: "area", area_id: "kitchen", id: "kitchen", name: "Kitchen" });
    const unbound = groupData({ ...kitchen(), area_id: null }, false, IDENTITY_FIELDS);
    expect("area_id" in unbound).toBe(false);
    const floor = kindsConfig().groups[0]!.children[0]!.children[0]!;
    expect(groupData(floor, false, IDENTITY_FIELDS).floor_id).toBe("downstairs");
    expect("floor_id" in groupData({ ...floor, floor_id: null }, false, IDENTITY_FIELDS)).toBe(false);
  });

  it("merges the identity fields back, blanking a cleared binding to null", () => {
    const group = kitchen();
    expect(mergeGroup(group, { kind: "outside" }).kind).toBe("outside");
    expect(mergeGroup(group, { area_id: "" }).area_id).toBeNull();
    expect(mergeGroup(group, { area_id: "larder" }).area_id).toBe("larder");
    expect(mergeGroup(group, { floor_id: "upstairs" }).floor_id).toBe("upstairs");
    expect(mergeGroup(group, { name: "" }).name).toBeNull();
  });

  it("leaves the adjacency alone: the table owns it, not the form", () => {
    const group = kitchen();
    const merged = mergeGroup(group, { adjacent: ["nonsense"], exit: true });
    expect(merged.adjacent).toBe(group.adjacent);
    expect(merged.exit).toBe(group.exit);
  });

  it("names the single field an edit touched", () => {
    const group = kitchen();
    expect(changedGroupField(mergeGroup(group, { kind: "outside" }), group)).toBe("kind");
    expect(changedGroupField(mergeGroup(group, { area_id: "larder" }), group)).toBe("area_id");
    expect(changedGroupField(mergeGroup(group, {}), group)).toBeUndefined();
  });
});
