import { describe, expect, it } from "vitest";
import {
  adjacencyConnection,
  declaredOn,
  effectivePrecision,
  formatLevel,
  groupAt,
  newGroup,
  newStimulus,
  presenceSettings,
  presetReferences,
  renamePreset,
  resolvedEnvelope,
  roomIds,
  stimulusAt,
  uniqueGroupId,
  uniquePresetId,
} from "../src/model";
import { houseConfig, kindsConfig, roomsConfig } from "./fixtures";
import type { Config } from "../src/types";

const cfg: Config = {
  version: 1,
  defaults: { envelope: "default", max_value: 5, precision: 1, unavailable: "hold", retrigger: "release", stack: false, debounce: 0, safety_refresh: 60, min_wake_interval: 1 },
  envelopes: [
    { id: "default", label: null, attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
    { id: "media", label: null, attack: 10, decay: 300, sustain: 0.6, release: 900, impulse: false, retrigger: "always", stack: null, unavailable: null, debounce: 5 },
  ],
  groups: [newGroup("house", "structure"), { ...newGroup("house_2", "structure"), children: [newGroup("kitchen", "area")] }],
};

describe("model", () => {
  it("resolves envelope through stimulus, preset, defaults", () => {
    const s = { ...newStimulus("media_player.tv"), envelope: "media", release: 120 };
    const e = resolvedEnvelope(cfg, s);
    expect(e).toEqual({ attack: 10, decay: 300, sustain: 0.6, release: 120, impulse: false, retrigger: "always", stack: false, unavailable: "hold", debounce: 5 });
    expect(resolvedEnvelope(cfg, newStimulus("binary_sensor.x")).release).toBe(1800);
  });
  it("returns undefined for a path whose node is gone", () => {
    expect(groupAt(cfg, ["groups", 9])).toBeUndefined();
    expect(groupAt(cfg, ["groups", 1, "children", 4])).toBeUndefined();
    expect(stimulusAt(cfg, ["groups", 0, "stimuli", 0])).toBeUndefined();
    expect(groupAt(cfg, ["groups", 0])?.id).toBe("house");
  });
  it("generates unique ids across the tree", () => {
    expect(uniqueGroupId(cfg, "house")).toBe("house_3");
    expect(uniqueGroupId(cfg, "kitchen")).toBe("kitchen_2");
    expect(uniqueGroupId(cfg, "Living Room!")).toBe("living_room");
  });
});

describe("preset ids", () => {
  it("generates unique preset ids against envelope ids, not group ids", () => {
    expect(uniquePresetId(cfg, "preset")).toBe("preset");
    expect(uniquePresetId(cfg, "media")).toBe("media_2");
    expect(uniquePresetId(cfg, "Slow Fade!")).toBe("slow_fade");
    expect(uniquePresetId(cfg, "house")).toBe("house");
  });
});

const refCfg = (): Config => ({
  ...cfg,
  defaults: { ...cfg.defaults, envelope: "media" },
  groups: [
    {
      ...newGroup("house", "structure"),
      stimuli: [
        { ...newStimulus("media_player.tv"), envelope: "media" },
        { ...newStimulus("binary_sensor.door"), envelope: null },
      ],
      children: [
        { ...newGroup("kitchen", "area"), stimuli: [{ ...newStimulus("light.hob"), envelope: "media" }] },
        { ...newGroup("study", "area"), stimuli: [{ ...newStimulus("light.desk"), envelope: "default" }] },
      ],
    },
  ],
});

describe("presetReferences", () => {
  it("finds the defaults reference and every referencing group, including nested ones", () => {
    expect(presetReferences(refCfg(), "media")).toEqual({ defaults: true, groups: ["house", "kitchen"] });
  });
  it("reports an unused preset as unreferenced", () => {
    expect(presetReferences(refCfg(), "unused")).toEqual({ defaults: false, groups: [] });
  });
  it("does not count stimuli that inherit the default preset", () => {
    expect(presetReferences(refCfg(), "default")).toEqual({ defaults: false, groups: ["study"] });
  });
});

describe("renamePreset", () => {
  it("rewrites the preset, the defaults and every referencing stimulus at once", () => {
    const before = refCfg();
    const after = renamePreset(before, 1, "cinema");
    expect(after.envelopes.map((e) => e.id)).toEqual(["default", "cinema"]);
    expect(after.defaults.envelope).toBe("cinema");
    expect(after.groups[0]!.stimuli[0]!.envelope).toBe("cinema");
    expect(after.groups[0]!.children[0]!.stimuli[0]!.envelope).toBe("cinema");
  });

  it("leaves unrelated references alone", () => {
    const after = renamePreset(refCfg(), 1, "cinema");
    expect(after.groups[0]!.stimuli[1]!.envelope).toBeNull();
    expect(after.groups[0]!.children[1]!.stimuli[0]!.envelope).toBe("default");
  });

  it("does not mutate the config it was given", () => {
    const before = refCfg();
    const snapshot = JSON.stringify(before);
    const after = renamePreset(before, 1, "cinema");
    expect(JSON.stringify(before)).toBe(snapshot);
    expect(after).not.toBe(before);
  });

  it("is a no-op when the id is unchanged", () => {
    const before = refCfg();
    expect(renamePreset(before, 1, "media")).toBe(before);
  });

  it("ignores an index no preset sits at", () => {
    const before = refCfg();
    expect(renamePreset(before, 7, "cinema")).toBe(before);
    expect(renamePreset(before, -1, "cinema")).toBe(before);
  });

  it("renames only the indexed preset while another preset still shares its old id", () => {
    // Mid-typing: "media" has been cleared and retyped as "default", so two presets
    // carry that id. The next keystroke must not drag the real "default"'s users along.
    const base = refCfg();
    const dup: Config = {
      ...base,
      defaults: { ...base.defaults, envelope: "default" },
      envelopes: [base.envelopes[0]!, { ...base.envelopes[1]!, id: "default" }],
    };
    const after = renamePreset(dup, 1, "default_slow");
    expect(after.envelopes.map((e) => e.id)).toEqual(["default", "default_slow"]);
    expect(after.defaults.envelope).toBe("default");
    expect(after.groups[0]!.children[1]!.stimuli[0]!.envelope).toBe("default");
  });
});

describe("formatLevel", () => {
  it("prints a level at the precision it was asked for", () => {
    expect(formatLevel(1.8342, 1)).toBe("1.8");
    expect(formatLevel(1.8342, 2)).toBe("1.83");
    expect(formatLevel(1.8342, 0)).toBe("2");
    expect(formatLevel(-0.4271, 1)).toBe("-0.4");
  });

  it("pads a short value out to the precision, so a column of levels lines up", () => {
    expect(formatLevel(2, 2)).toBe("2.00");
    expect(formatLevel(0, 1)).toBe("0.0");
  });

  it("survives a precision no `toFixed` would take", () => {
    expect(formatLevel(1.5, -3)).toBe("2");
    expect(formatLevel(1.5, 1.7)).toBe("1.5");
    expect(formatLevel(1.5, 500)).not.toBe("");
  });
});

describe("effectivePrecision", () => {
  it("prefers the group's own precision and falls back to the defaults", () => {
    expect(effectivePrecision(cfg, { ...newGroup("house", "structure"), precision: 3 })).toBe(3);
    expect(effectivePrecision(cfg, newGroup("house", "structure"))).toBe(1);
  });
});

describe("roomIds", () => {
  it("knows which groups are rooms", () => {
    expect(roomIds(roomsConfig())).toEqual(
      new Set(["kitchen", "dining_room", "hall", "bedroom", "back_patio"]),
    );
    expect(roomIds(houseConfig()).size).toBe(0);
  });
});

describe("presenceSettings", () => {
  it("fills in presence defaults for a config that has never been saved", () => {
    const config = { ...houseConfig() };
    delete (config as { presence?: unknown }).presence;
    expect(presenceSettings(config).enabled).toBe(false);
    expect(presenceSettings(config).threshold).toBe(0.6);
  });
});

describe("kinds on the model", () => {
  it("makes a new group of the kind it was asked for", () => {
    expect(newGroup("den", "area")).toMatchObject({ id: "den", kind: "area", area_id: null, floor_id: null });
  });

  it("reads a plain adjacency id as a two-way door", () => {
    expect(adjacencyConnection("hall")).toBe("door");
    expect(adjacencyConnection({ id: "hall", connection: "stairs", one_way: true })).toBe("stairs");
  });

  it("finds the edges other groups declare against one", () => {
    const declared = declaredOn(kindsConfig(), "hall");
    expect(declared).toHaveLength(1);
    expect(declared[0]!.group.id).toBe("kitchen");
    expect(declared[0]!.edge).toMatchObject({ id: "hall", connection: "open" });
    expect(declaredOn(kindsConfig(), "kitchen")).toEqual([]);
  });

  it("counts areas and outside areas as rooms, whatever they declare", () => {
    expect([...roomIds(kindsConfig())].sort()).toEqual(["back_patio", "hall", "kitchen"]);
  });
});
