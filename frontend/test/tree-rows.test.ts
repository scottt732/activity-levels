import { beforeEach, describe, expect, it, vi } from "vitest";
import { EXPANDED_KEY, flattenRows, loadExpanded, saveExpanded } from "../src/tree-rows";
import { kindsConfig } from "./fixtures";
import { newGroup } from "../src/model";

const keys = (config = kindsConfig(), expanded = new Set<string>()): string[] =>
  flattenRows(config, expanded).map((r) => `${r.path.join("/")}:${r.kind}`);

describe("flattenRows", () => {
  beforeEach(() => localStorage.clear());

  it("shows only the roots when nothing is expanded", () => {
    expect(keys()).toEqual(["groups/0:group"]);
  });

  it("walks children then stimuli, in document order, at increasing depth", () => {
    const expanded = new Set(["groups/0", "groups/0/children/0", "groups/0/children/0/children/0"]);
    const rows = flattenRows(kindsConfig(), expanded);
    expect(rows.map((r) => r.path.join("/"))).toEqual([
      "groups/0",
      "groups/0/children/0",
      "groups/0/children/0/children/0",
      "groups/0/children/0/children/0/children/0",
      "groups/0/children/0/children/0/children/1",
      "groups/0/children/1",
    ]);
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 2, 3, 3, 1]);
  });

  it("puts a group's stimuli after its child groups", () => {
    const config = kindsConfig();
    const rows = flattenRows(config, new Set(["groups/0", "groups/0/children/1"]));
    expect(rows.map((r) => r.path.join("/"))).toEqual([
      "groups/0",
      "groups/0/children/0",
      "groups/0/children/1",
      "groups/0/children/1/stimuli/0",
    ]);
    expect(rows[3]!.kind).toBe("stimulus");
  });

  it("marks a childless group unexpandable and gives it the placeholder when open", () => {
    const config = kindsConfig();
    config.groups[0]!.children[1]!.stimuli = [];
    const rows = flattenRows(config, new Set(["groups/0", "groups/0/children/1"]));
    const patio = rows.find((r) => r.path.join("/") === "groups/0/children/1")!;
    expect(patio.expandable).toBe(false);
    expect(rows.at(-1)!.kind).toBe("placeholder");
    expect(rows.at(-1)!.depth).toBe(2);
  });

  it("numbers each row among the siblings it shares a level with", () => {
    const rows = flattenRows(kindsConfig(), new Set(["groups/0", "groups/0/children/1"]));
    const at = (path: string) => rows.find((r) => r.path.join("/") === path)!;
    expect([at("groups/0").posinset, at("groups/0").setsize]).toEqual([1, 1]);
    expect([at("groups/0/children/1").posinset, at("groups/0/children/1").setsize]).toEqual([2, 2]);
    // a stimulus shares its level with the child groups, and is counted after them
    const stimulus = at("groups/0/children/1/stimuli/0");
    expect([stimulus.posinset, stimulus.setsize]).toEqual([1, 1]);
  });

  it("shows no placeholder for a group that has something in it", () => {
    expect(keys(kindsConfig(), new Set(["groups/0"])).some((k) => k.endsWith(":placeholder"))).toBe(false);
  });
});

describe("expansion persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips through localStorage", () => {
    saveExpanded(new Set(["groups/0", "groups/0/children/1"]));
    expect(localStorage.getItem(EXPANDED_KEY)).toContain("groups/0");
    expect([...loadExpanded()].sort()).toEqual(["groups/0", "groups/0/children/1"]);
  });

  it("survives unreadable or nonsense storage", () => {
    localStorage.setItem(EXPANDED_KEY, "{not json");
    expect(loadExpanded().size).toBe(0);
    localStorage.setItem(EXPANDED_KEY, '{"groups/0": true}');
    expect(loadExpanded().size).toBe(0);
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    expect(() => saveExpanded(new Set(["groups/0"]))).not.toThrow();
    spy.mockRestore();
  });

  it("keeps a root expanded by default so an empty panel is not a blank page", () => {
    expect(flattenRows({ ...kindsConfig(), groups: [newGroup("only", "property")] }, new Set()).length).toBe(1);
  });
});
