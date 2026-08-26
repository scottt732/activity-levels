import { describe, expect, it } from "vitest";
import {
  groupAt,
  newGroup,
  newStimulus,
  presetReferences,
  renamePreset,
  resolvedEnvelope,
  stimulusAt,
  uniqueGroupId,
  uniquePresetId,
} from "../src/model";
import type { Config } from "../src/types";

const cfg: Config = {
  version: 1,
  defaults: { envelope: "default", max_value: 5, precision: 1, unavailable: "hold", retrigger: "only_in_release", debounce: 0, safety_refresh: 60, min_wake_interval: 1 },
  envelopes: [
    { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
    { id: "media", attack: 10, decay: 300, sustain: 0.6, release: 900, impulse: false, retrigger: "always", unavailable: null, debounce: 5 },
  ],
  groups: [newGroup("house"), { ...newGroup("house_2"), children: [newGroup("kitchen")] }],
};

describe("model", () => {
  it("resolves envelope through stimulus, preset, defaults", () => {
    const s = { ...newStimulus("media_player.tv"), envelope: "media", release: 120 };
    const e = resolvedEnvelope(cfg, s);
    expect(e).toEqual({ attack: 10, decay: 300, sustain: 0.6, release: 120, impulse: false, retrigger: "always", unavailable: "hold", debounce: 5 });
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
      ...newGroup("house"),
      stimuli: [
        { ...newStimulus("media_player.tv"), envelope: "media" },
        { ...newStimulus("binary_sensor.door"), envelope: null },
      ],
      children: [
        { ...newGroup("kitchen"), stimuli: [{ ...newStimulus("light.hob"), envelope: "media" }] },
        { ...newGroup("study"), stimuli: [{ ...newStimulus("light.desk"), envelope: "default" }] },
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
    const after = renamePreset(before, "media", "cinema");
    expect(after.envelopes.map((e) => e.id)).toEqual(["default", "cinema"]);
    expect(after.defaults.envelope).toBe("cinema");
    expect(after.groups[0]!.stimuli[0]!.envelope).toBe("cinema");
    expect(after.groups[0]!.children[0]!.stimuli[0]!.envelope).toBe("cinema");
  });

  it("leaves unrelated references alone", () => {
    const after = renamePreset(refCfg(), "media", "cinema");
    expect(after.groups[0]!.stimuli[1]!.envelope).toBeNull();
    expect(after.groups[0]!.children[1]!.stimuli[0]!.envelope).toBe("default");
  });

  it("does not mutate the config it was given", () => {
    const before = refCfg();
    const snapshot = JSON.stringify(before);
    const after = renamePreset(before, "media", "cinema");
    expect(JSON.stringify(before)).toBe(snapshot);
    expect(after).not.toBe(before);
  });

  it("is a no-op when the id is unchanged", () => {
    const before = refCfg();
    expect(renamePreset(before, "media", "media")).toBe(before);
  });

  it("ignores a rename of an id no preset uses", () => {
    const before = refCfg();
    const after = renamePreset(before, "nope", "cinema");
    expect(after.envelopes.map((e) => e.id)).toEqual(["default", "media"]);
    expect(after.defaults.envelope).toBe("media");
  });
});
