import { beforeEach, describe, expect, it, vi } from "vitest";
import { newGroup, newStimulus } from "../src/model";
import {
  EDIT_KEY,
  EXPANDED_KEY,
  bands,
  expandTo,
  initialNav,
  loadEditing,
  loadExpanded,
  mixerLayout,
  reduce,
  restoreNav,
  saveEditing,
  saveExpanded,
  visibleTracks,
  type MixerNav,
} from "../src/navigation";
import type { Config, Path } from "../src/types";

const defaults: Config["defaults"] = {
  envelope: "default",
  max_value: 5,
  precision: 1,
  unavailable: "hold",
  retrigger: "release",
  stack: false,
  debounce: 0,
  safety_refresh: 60,
  min_wake_interval: 1,
};
const envelopes: Config["envelopes"] = [
  { id: "default", label: null, attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
];

/** Property > House > (kitchen, living_room > den), each with a stimulus or two. */
const houseConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes,
  groups: [
    {
      ...newGroup("house", "structure"),
      name: "House",
      stimuli: [newStimulus("binary_sensor.front_door"), newStimulus("binary_sensor.back_door")],
      children: [
        { ...newGroup("kitchen", "area"), stimuli: [newStimulus("binary_sensor.kitchen_motion")] },
        {
          ...newGroup("living_room", "area"),
          name: "Living Room",
          children: [{ ...newGroup("den", "area"), stimuli: [newStimulus("binary_sensor.den_motion")] }],
        },
      ],
    },
  ],
});

const emptyConfig = (): Config => ({ version: 1, defaults, envelopes, groups: [] });

/** Two roots, so "every root expanded" and root-to-root walking have something to chew on. */
const twoRoots = (): Config => {
  const one = houseConfig();
  return { ...one, groups: [one.groups[0]!, { ...newGroup("shed", "structure"), children: [newGroup("workbench", "area")] }] };
};

const navOf = (ids: string[], selection: Path | null): MixerNav => ({ expanded: new Set(ids), selection });

const ids = (config: Config, nav: MixerNav): string[] => visibleTracks(config, nav).map((t) => t.id);

beforeEach(() => {
  localStorage.clear();
});

describe("initialNav", () => {
  it("expands every root and selects the first one", () => {
    expect(initialNav(houseConfig())).toEqual({ expanded: new Set(["house"]), selection: ["groups", 0] });
    expect(initialNav(twoRoots())).toEqual({ expanded: new Set(["house", "shed"]), selection: ["groups", 0] });
  });
  it("has nothing expanded or selected when the config has no groups", () => {
    expect(initialNav(emptyConfig())).toEqual({ expanded: new Set(), selection: null });
  });
});

describe("visibleTracks", () => {
  it("walks the tree in pre-order, descending only into expanded groups", () => {
    const config = houseConfig();
    expect(ids(config, navOf(["house"], null))).toEqual(["house", "kitchen", "living_room"]);
    expect(ids(config, navOf(["house", "living_room"], null))).toEqual([
      "house",
      "kitchen",
      "living_room",
      "den",
    ]);
  });

  it("hides every descendant of a collapsed ancestor, however deep", () => {
    const config = houseConfig();
    // living_room is expanded, but its parent is not: den must not surface anyway.
    expect(ids(config, navOf(["living_room"], null))).toEqual(["house"]);
  });

  it("reports the path, depth, and whether a group has children and is open", () => {
    expect(visibleTracks(houseConfig(), navOf(["house", "living_room"], null))).toEqual([
      { path: ["groups", 0], id: "house", depth: 0, hasChildren: true, expanded: true },
      { path: ["groups", 0, "children", 0], id: "kitchen", depth: 1, hasChildren: false, expanded: false },
      { path: ["groups", 0, "children", 1], id: "living_room", depth: 1, hasChildren: true, expanded: true },
      { path: ["groups", 0, "children", 1, "children", 0], id: "den", depth: 2, hasChildren: false, expanded: false },
    ]);
  });

  it("does not call a childless group expanded, even when its id is in the set", () => {
    const track = visibleTracks(houseConfig(), navOf(["house", "kitchen"], null))[1];
    expect(track?.id).toBe("kitchen");
    expect(track?.expanded).toBe(false);
  });

  it("lists every root, in config order", () => {
    expect(ids(twoRoots(), navOf([], null))).toEqual(["house", "shed"]);
  });

  it("is empty for a config with no groups", () => {
    expect(visibleTracks(emptyConfig(), initialNav(emptyConfig()))).toEqual([]);
  });
});

describe("reduce: toggle", () => {
  it("opens a collapsed group and closes an open one", () => {
    const nav = navOf(["house"], ["groups", 0]);
    const closed = reduce(nav, { type: "toggle", id: "house" });
    expect(closed).toEqual(navOf([], ["groups", 0]));
    expect(reduce(closed, { type: "toggle", id: "house" })).toEqual(navOf(["house"], ["groups", 0]));
  });
  it("leaves the previous state alone", () => {
    const nav = navOf(["house"], null);
    reduce(nav, { type: "toggle", id: "house" });
    expect([...nav.expanded]).toEqual(["house"]);
  });
});

describe("reduce: select", () => {
  it("only changes the selection", () => {
    const nav = navOf(["house"], ["groups", 0]);
    expect(reduce(nav, { type: "select", path: ["groups", 0, "children", 0] })).toEqual(
      navOf(["house"], ["groups", 0, "children", 0]),
    );
  });
  it("accepts null to clear the selection", () => {
    expect(reduce(navOf(["house"], ["groups", 0]), { type: "select", path: null })).toEqual(navOf(["house"], null));
  });
});

describe("reduce: arrow", () => {
  const config = houseConfig();
  const nav = navOf(["house", "living_room"], ["groups", 0]);
  const list: Path[] = [
    ["groups", 0],
    ["groups", 0, "children", 0],
    ["groups", 0, "children", 1],
    ["groups", 0, "children", 1, "children", 0],
  ];

  it("steps forward through the visible row", () => {
    let cur = nav;
    for (let i = 1; i < list.length; i++) {
      cur = reduce(cur, { type: "arrow", delta: 1, config });
      expect(cur.selection).toEqual(list[i]);
    }
  });
  it("wraps at the end and at the start", () => {
    expect(reduce({ ...nav, selection: list[list.length - 1]! }, { type: "arrow", delta: 1, config }).selection).toEqual(
      list[0],
    );
    expect(reduce(nav, { type: "arrow", delta: -1, config }).selection).toEqual(list[list.length - 1]);
  });
  it("skips a track that a collapsed parent has hidden", () => {
    const collapsed = navOf(["house"], ["groups", 0, "children", 1]);
    expect(reduce(collapsed, { type: "arrow", delta: 1, config }).selection).toEqual(["groups", 0]);
  });
  it("comes in at the end the arrow came from when nothing is selected", () => {
    expect(reduce({ ...nav, selection: null }, { type: "arrow", delta: 1, config }).selection).toEqual(list[0]);
    expect(reduce({ ...nav, selection: null }, { type: "arrow", delta: -1, config }).selection).toEqual(
      list[list.length - 1],
    );
  });
  it("comes in at the first track when the selection no longer names a visible one", () => {
    const dangling = navOf(["house"], ["groups", 0, "children", 1, "children", 0]);
    expect(reduce(dangling, { type: "arrow", delta: 1, config }).selection).toEqual(list[0]);
  });
  it("is a no-op with no groups to walk", () => {
    const empty = initialNav(emptyConfig());
    expect(reduce(empty, { type: "arrow", delta: 1, config: emptyConfig() })).toEqual(empty);
  });
});

describe("reduce: home / end", () => {
  const config = houseConfig();
  const nav = navOf(["house", "living_room"], ["groups", 0, "children", 0]);

  it("jumps to the first and the last visible track", () => {
    expect(reduce(nav, { type: "home", config }).selection).toEqual(["groups", 0]);
    expect(reduce(nav, { type: "end", config }).selection).toEqual(["groups", 0, "children", 1, "children", 0]);
  });
  it("ends on the last visible track, not the last group in the config", () => {
    expect(reduce(navOf(["house"], null), { type: "end", config }).selection).toEqual(["groups", 0, "children", 1]);
  });
  it("is a no-op with no groups to jump to", () => {
    const empty = initialNav(emptyConfig());
    expect(reduce(empty, { type: "home", config: emptyConfig() })).toEqual(empty);
    expect(reduce(empty, { type: "end", config: emptyConfig() })).toEqual(empty);
  });
});

describe("reduce: sync", () => {
  it("leaves a nav that still resolves untouched", () => {
    const config = houseConfig();
    const nav = navOf(["house", "living_room"], ["groups", 0, "children", 1]);
    const synced = reduce(nav, { type: "sync", config });
    expect(synced).toEqual(nav);
    // Nothing changed, so the set is shared rather than rebuilt on every keystroke.
    expect(synced.expanded).toBe(nav.expanded);
  });

  it("drops expanded ids of groups that were deleted", () => {
    const config = houseConfig();
    const withoutLivingRoom: Config = {
      ...config,
      groups: [{ ...config.groups[0]!, children: [config.groups[0]!.children[0]!] }],
    };
    const nav = navOf(["house", "living_room", "den"], ["groups", 0]);
    expect(reduce(nav, { type: "sync", config: withoutLivingRoom })).toEqual(navOf(["house"], ["groups", 0]));
  });

  it("drops the expanded id of a group that was renamed, leaving it collapsed", () => {
    const config = houseConfig();
    const renamed: Config = { ...config, groups: [{ ...config.groups[0]!, id: "property" }] };
    const nav = navOf(["house"], ["groups", 0]);
    expect(reduce(nav, { type: "sync", config: renamed })).toEqual(navOf([], ["groups", 0]));
  });

  it("falls back to the first root when the selection is gone", () => {
    const config = houseConfig();
    const nav = navOf(["house"], ["groups", 0, "children", 9]);
    expect(reduce(nav, { type: "sync", config }).selection).toEqual(["groups", 0]);
  });

  it("has nothing to select when the last group is gone", () => {
    const nav = navOf(["house"], ["groups", 0]);
    expect(reduce(nav, { type: "sync", config: emptyConfig() })).toEqual(navOf([], null));
  });

  it("keeps a selection that names a stimulus of a group that still exists", () => {
    const config = houseConfig();
    const nav = navOf(["house"], ["groups", 0, "stimuli", 1]);
    expect(reduce(nav, { type: "sync", config }).selection).toEqual(["groups", 0, "stimuli", 1]);
  });
});

describe("expandTo", () => {
  const config = houseConfig();

  it("opens every ancestor of a path, but not the node itself", () => {
    expect(expandTo(config, new Set(), ["groups", 0, "children", 1, "children", 0])).toEqual(
      new Set(["house", "living_room"]),
    );
  });
  it("opens the owning group of a stimulus", () => {
    expect(expandTo(config, new Set(), ["groups", 0, "children", 0, "stimuli", 0])).toEqual(new Set(["house"]));
  });
  it("returns the same set when nothing had to open", () => {
    const expanded = new Set(["house"]);
    expect(expandTo(config, expanded, ["groups", 0, "children", 0])).toBe(expanded);
    expect(expandTo(config, expanded, ["groups", 0])).toBe(expanded);
    expect(expandTo(config, expanded, null)).toBe(expanded);
  });
  it("stops at a path step that names nothing", () => {
    expect(expandTo(config, new Set(), ["groups", 9, "children", 0])).toEqual(new Set());
  });
});

describe("expansion in localStorage", () => {
  it("round-trips the open groups", () => {
    saveExpanded(new Set(["house", "living_room"]));
    expect(localStorage.getItem(EXPANDED_KEY)).toBe(JSON.stringify(["house", "living_room"]));
    expect(loadExpanded(houseConfig())).toEqual(new Set(["house", "living_room"]));
  });

  it("ignores ids the config no longer knows about", () => {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(["house", "attic"]));
    expect(loadExpanded(houseConfig())).toEqual(new Set(["house"]));
  });

  it.each(["{not json", '"house"', "42"])("reads %o as nothing stored", (raw) => {
    localStorage.setItem(EXPANDED_KEY, raw);
    expect(loadExpanded(houseConfig())).toBeNull();
  });

  it("reads an empty store as nothing stored", () => {
    expect(loadExpanded(houseConfig())).toBeNull();
  });

  it("survives storage that refuses to be read or written", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    try {
      expect(loadExpanded(houseConfig())).toBeNull();
      expect(() => saveExpanded(new Set(["house"]))).not.toThrow();
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });
});

describe("restoreNav", () => {
  it("opens what was left open last time", () => {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(["living_room"]));
    expect(restoreNav(houseConfig())).toEqual(navOf(["living_room"], ["groups", 0]));
  });

  it("falls back to every root expanded when nothing usable is stored", () => {
    localStorage.setItem(EXPANDED_KEY, "{not json");
    expect(restoreNav(twoRoots())).toEqual(initialNav(twoRoots()));
  });

  it("honours a stored empty set rather than re-opening the roots", () => {
    localStorage.setItem(EXPANDED_KEY, "[]");
    expect(restoreNav(houseConfig())).toEqual(navOf([], ["groups", 0]));
  });
});

describe("mixerLayout", () => {
  it("gives every visible strip a column of its own, in row order", () => {
    const layout = mixerLayout(houseConfig(), navOf(["house", "living_room"], null));
    expect(layout.columns).toEqual([1, 2, 3, 4]);
    expect(layout.kinds).toEqual(["strip", "strip", "strip", "strip"]);
  });

  it("brackets an open group from its own strip to the end of its subtree", () => {
    const layout = mixerLayout(houseConfig(), navOf(["house", "living_room"], null));
    expect(layout.bands).toEqual([
      { id: "house", label: "House", depth: 0, colStart: 1, colEnd: 5, expanded: true },
      { id: "living_room", label: "Living Room", depth: 1, colStart: 3, colEnd: 5, expanded: true },
    ]);
    // One band row per level of nesting that has a band, with the strips below them.
    expect(layout.rows).toBe(2);
  });

  it("gives a closed group a narrow column of its own, right of its strip", () => {
    const layout = mixerLayout(houseConfig(), navOf(["house"], null));
    expect(layout.columns).toEqual([1, 2, 3]);
    expect(layout.kinds).toEqual(["strip", "strip", "strip", "tab"]);
    expect(layout.bands).toEqual([
      // The open root spans the tab too: the closed branch is still inside it.
      { id: "house", label: "House", depth: 0, colStart: 1, colEnd: 5, expanded: true },
      { id: "living_room", label: "Living Room", depth: 1, colStart: 4, colEnd: 5, expanded: false },
    ]);
    expect(layout.rows).toBe(1);
  });

  it("has no band rows at all when every group is closed", () => {
    const layout = mixerLayout(houseConfig(), navOf([], null));
    expect(layout.columns).toEqual([1]);
    expect(layout.kinds).toEqual(["strip", "tab"]);
    expect(layout.bands).toEqual([
      { id: "house", label: "House", depth: 0, colStart: 2, colEnd: 3, expanded: false },
    ]);
    expect(layout.rows).toBe(0);
  });

  it("closes each band at its own subtree, not at the end of the row", () => {
    // house(1) kitchen(2) living_room(3) [its tab](4) shed(5) workbench(6)
    const layout = mixerLayout(twoRoots(), navOf(["house", "shed"], null));
    expect(layout.bands).toEqual([
      { id: "house", label: "House", depth: 0, colStart: 1, colEnd: 5, expanded: true },
      { id: "living_room", label: "Living Room", depth: 1, colStart: 4, colEnd: 5, expanded: false },
      { id: "shed", label: "shed", depth: 0, colStart: 5, colEnd: 7, expanded: true },
    ]);
  });

  it("names a group with no name of its own by its id", () => {
    const layout = mixerLayout(houseConfig(), navOf(["kitchen"], null));
    expect(layout.bands).toEqual([
      { id: "house", label: "House", depth: 0, colStart: 2, colEnd: 3, expanded: false },
    ]);
  });

  it("gives a group with no children no band, open or closed", () => {
    const config = { ...emptyConfig(), groups: [newGroup("shed", "structure")] };
    expect(mixerLayout(config, navOf(["shed"], null))).toEqual({
      columns: [1],
      kinds: ["strip"],
      bands: [],
      rows: 0,
    });
  });

  it("is empty for a config with no groups", () => {
    const config = emptyConfig();
    expect(mixerLayout(config, initialNav(config))).toEqual({ columns: [], kinds: [], bands: [], rows: 0 });
  });

  it("is what bands() reports", () => {
    const config = houseConfig();
    const nav = navOf(["house", "living_room"], null);
    expect(bands(config, nav)).toEqual(mixerLayout(config, nav).bands);
  });
});

describe("edit mode", () => {
  it("is off until this browser has turned it on", () => {
    expect(loadEditing()).toBe(false);
    saveEditing(true);
    expect(localStorage.getItem(EDIT_KEY)).toBe("true");
    expect(loadEditing()).toBe(true);
    saveEditing(false);
    expect(loadEditing()).toBe(false);
  });

  it("reads anything else stored under the key as off", () => {
    localStorage.setItem(EDIT_KEY, "yes");
    expect(loadEditing()).toBe(false);
  });

  it("survives storage that refuses to answer", () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    try {
      expect(loadEditing()).toBe(false);
      expect(() => saveEditing(true)).not.toThrow();
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  });
});
