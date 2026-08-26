import { describe, expect, it } from "vitest";
import { groupAt, newGroup, newStimulus, resolvedEnvelope, stimulusAt, uniqueGroupId } from "../src/model";
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
