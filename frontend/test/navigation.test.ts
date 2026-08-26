import { describe, expect, it } from "vitest";
import { newGroup, newStimulus } from "../src/model";
import { breadcrumb, channelPaths, initialNav, reduce, type MixerNav } from "../src/navigation";
import type { Config, Path } from "../src/types";


const defaults: Config["defaults"] = {
  envelope: "default",
  max_value: 5,
  precision: 1,
  unavailable: "hold",
  retrigger: "only_in_release",
  debounce: 0,
  safety_refresh: 60,
  min_wake_interval: 1,
};
const envelopes: Config["envelopes"] = [
  { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
];

/** Property > House > (kitchen, living_room > den), each with a stimulus or two. */
const houseConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes,
  groups: [
    {
      ...newGroup("house"),
      name: "House",
      stimuli: [newStimulus("binary_sensor.front_door"), newStimulus("binary_sensor.back_door")],
      children: [
        { ...newGroup("kitchen"), stimuli: [newStimulus("binary_sensor.kitchen_motion")] },
        {
          ...newGroup("living_room"),
          name: "Living Room",
          children: [{ ...newGroup("den"), stimuli: [newStimulus("binary_sensor.den_motion")] }],
        },
      ],
    },
  ],
});

const emptyConfig = (): Config => ({ version: 1, defaults, envelopes, groups: [] });

describe("initialNav", () => {
  it("lands on the first root group with it selected", () => {
    expect(initialNav(houseConfig())).toEqual({ busPath: ["groups", 0], selection: ["groups", 0] });
  });
  it("has no bus or selection when the config has no groups", () => {
    expect(initialNav(emptyConfig())).toEqual({ busPath: [], selection: null });
  });
});

describe("channelPaths", () => {
  it("lists stimuli first, then children, in config order", () => {
    expect(channelPaths(houseConfig(), ["groups", 0])).toEqual([
      ["groups", 0, "stimuli", 0],
      ["groups", 0, "stimuli", 1],
      ["groups", 0, "children", 0],
      ["groups", 0, "children", 1],
    ]);
  });
  it("is empty for a group with no stimuli or children", () => {
    expect(channelPaths(houseConfig(), ["groups", 0, "children", 0, "children", 0])).toEqual([]);
  });
  it("is empty when the bus path does not resolve to a group", () => {
    expect(channelPaths(houseConfig(), ["groups", 9])).toEqual([]);
  });
});

describe("reduce: open / select / up", () => {
  it("open sets both the bus and the selection to the opened path", () => {
    const nav = initialNav(houseConfig());
    const path: Path = ["groups", 0, "children", 1];
    expect(reduce(nav, { type: "open", path })).toEqual({ busPath: path, selection: path });
  });
  it("select only changes the selection", () => {
    const nav = initialNav(houseConfig());
    const path: Path = ["groups", 0, "stimuli", 0];
    expect(reduce(nav, { type: "select", path })).toEqual({ busPath: nav.busPath, selection: path });
  });
  it("select accepts null to clear the selection", () => {
    const nav = initialNav(houseConfig());
    expect(reduce(nav, { type: "select", path: null })).toEqual({ busPath: nav.busPath, selection: null });
  });
  it("up moves to the parent bus and selects it", () => {
    const nav: MixerNav = { busPath: ["groups", 0, "children", 1, "children", 0], selection: ["groups", 0, "children", 1, "children", 0] };
    expect(reduce(nav, { type: "up" })).toEqual({ busPath: ["groups", 0, "children", 1], selection: ["groups", 0, "children", 1] });
  });
  it("up is a no-op at a root group", () => {
    const nav = initialNav(houseConfig());
    expect(reduce(nav, { type: "up" })).toEqual(nav);
  });
  it("up is a no-op when there is no bus at all", () => {
    const nav = initialNav(emptyConfig());
    expect(reduce(nav, { type: "up" })).toEqual(nav);
  });
});

describe("reduce: arrow", () => {
  const config = houseConfig();
  const list: Path[] = [
    ["groups", 0, "stimuli", 0],
    ["groups", 0, "stimuli", 1],
    ["groups", 0, "children", 0],
    ["groups", 0, "children", 1],
    ["groups", 0],
  ];

  it("steps forward through channels then lands on the master strip last", () => {
    let nav: MixerNav = { busPath: ["groups", 0], selection: list[0]! };
    for (let i = 1; i < list.length; i++) {
      nav = reduce(nav, { type: "arrow", delta: 1, config });
      expect(nav.selection).toEqual(list[i]);
    }
  });
  it("wraps from the master strip back to the first channel", () => {
    const nav: MixerNav = { busPath: ["groups", 0], selection: list[list.length - 1]! };
    expect(reduce(nav, { type: "arrow", delta: 1, config }).selection).toEqual(list[0]);
  });
  it("steps backward and wraps from the first channel to the master strip", () => {
    const nav: MixerNav = { busPath: ["groups", 0], selection: list[0]! };
    expect(reduce(nav, { type: "arrow", delta: -1, config }).selection).toEqual(list[list.length - 1]);
  });
  it("starts from the first channel when nothing is selected", () => {
    const nav: MixerNav = { busPath: ["groups", 0], selection: null };
    expect(reduce(nav, { type: "arrow", delta: 1, config }).selection).toEqual(list[0]);
  });
});

describe("reduce: sync", () => {
  it("leaves a nav that still resolves untouched", () => {
    const config = houseConfig();
    const nav: MixerNav = { busPath: ["groups", 0, "children", 0], selection: ["groups", 0, "children", 0, "stimuli", 0] };
    expect(reduce(nav, { type: "sync", config })).toEqual(nav);
  });
  it("falls back the bus to its nearest surviving ancestor group when the bus itself is gone", () => {
    const config = houseConfig();
    const nav: MixerNav = { busPath: ["groups", 0, "children", 1, "children", 0], selection: ["groups", 0, "children", 1, "children", 0] };
    // "den" (children,1,children,0) has been removed from the config the nav is synced against.
    const withoutDen: Config = { ...config, groups: [{ ...config.groups[0]!, children: [config.groups[0]!.children[0]!, { ...config.groups[0]!.children[1]!, children: [] }] }] };
    expect(reduce(nav, { type: "sync", config: withoutDen })).toEqual({
      busPath: ["groups", 0, "children", 1],
      selection: ["groups", 0, "children", 1],
    });
  });
  it("falls back to initialNav when the whole bus chain is gone", () => {
    const nav: MixerNav = { busPath: ["groups", 5], selection: ["groups", 5] };
    const config = houseConfig();
    expect(reduce(nav, { type: "sync", config })).toEqual(initialNav(config));
  });
  it("resets a dangling selection to the (still valid) bus", () => {
    const config = houseConfig();
    const nav: MixerNav = { busPath: ["groups", 0], selection: ["groups", 0, "stimuli", 9] };
    expect(reduce(nav, { type: "sync", config })).toEqual({ busPath: ["groups", 0], selection: ["groups", 0] });
  });
  it("resets a null selection to the bus", () => {
    const config = houseConfig();
    const nav: MixerNav = { busPath: ["groups", 0], selection: null };
    expect(reduce(nav, { type: "sync", config })).toEqual({ busPath: ["groups", 0], selection: ["groups", 0] });
  });
});

describe("breadcrumb", () => {
  it("lists each ancestor group from the root down to the bus, preferring name over id", () => {
    const config = houseConfig();
    expect(breadcrumb(config, ["groups", 0, "children", 1, "children", 0])).toEqual([
      { path: ["groups", 0], label: "House" },
      { path: ["groups", 0, "children", 1], label: "Living Room" },
      { path: ["groups", 0, "children", 1, "children", 0], label: "den" },
    ]);
  });
  it("is a single crumb for a root bus", () => {
    const config = houseConfig();
    expect(breadcrumb(config, ["groups", 0])).toEqual([{ path: ["groups", 0], label: "House" }]);
  });
  it("is empty for an empty bus path", () => {
    expect(breadcrumb(houseConfig(), [])).toEqual([]);
  });
});
