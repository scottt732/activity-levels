import { describe, expect, it } from "vitest";
import { newStimulus } from "../src/model";
import {
  ENVELOPE_FIELDS,
  MOMENTARY_PINNED_HINT,
  RETRIGGER_SELECTOR,
  SOURCE_FIELDS,
  changedStimulusField,
  mergeStimulus,
  overrideDisabled,
  overriddenCount,
  stimulusData,
  stimulusSchema,
  visibleSourceFields,
} from "../src/stimulus-form";
import type { Config } from "../src/types";

describe("stimulus form selectors", () => {
  it("lists the retrigger modes widest first", () => {
    expect((RETRIGGER_SELECTOR.select as { options: unknown }).options).toEqual([
      { value: "always", label: "Always" },
      { value: "after_attack", label: "After the attack" },
      { value: "after_decay", label: "After the decay" },
      { value: "release", label: "Only while releasing" },
      { value: "idle", label: "Only once fully released" },
    ]);
  });
});

describe("stimulus panels", () => {
  it("splits the fields between Source and Envelope with nothing left over", () => {
    expect(SOURCE_FIELDS).toEqual(["entity", "mode", "to", "edges", "key"]);
    expect(ENVELOPE_FIELDS).toEqual(["envelope", "gain"]);
    expect([...SOURCE_FIELDS, ...ENVELOPE_FIELDS].sort()).toEqual(
      ["edges", "entity", "envelope", "gain", "key", "mode", "to"],
    );
  });

  it("counts only the envelope fields a stimulus actually overrides", () => {
    const stimulus = newStimulus("binary_sensor.x");
    expect(overriddenCount(stimulus)).toBe(0);
    expect(overriddenCount({ ...stimulus, release: 600 })).toBe(1);
    expect(overriddenCount({ ...stimulus, release: 600, impulse: false, sustain: 0 })).toBe(3);
    expect(overriddenCount({ ...stimulus, retrigger: "idle", stack: false })).toBe(2);
    // gain and the preset are not overrides of the preset's shape: they are the panel above
    expect(overriddenCount({ ...stimulus, gain: 4, envelope: "hour" })).toBe(0);
  });
});
describe("stimulus mode", () => {
  const cfg = {
    envelopes: [{ id: "default", label: null }],
    defaults: { envelope: "default" },
  } as unknown as Config;

  it("hides the edge checkboxes for a sustained stimulus", () => {
    const stimulus = newStimulus("binary_sensor.door");
    expect(visibleSourceFields(stimulus)).toEqual(["entity", "mode", "to", "key"]);
    expect(visibleSourceFields({ ...stimulus, mode: "momentary" })).toEqual([
      "entity",
      "mode",
      "to",
      "edges",
      "key",
    ]);
  });

  it("builds the active-states picker from the entity, and keeps it typeable", () => {
    const stimulus = newStimulus("binary_sensor.door");
    const item = stimulusSchema(cfg, stimulus, undefined, ["to"])[0]!;
    const select = item.selector.select as {
      multiple: boolean;
      custom_value: boolean;
      options: unknown;
    };
    expect(select.multiple).toBe(true);
    expect(select.custom_value).toBe(true);
    expect(select.options).toEqual([
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
    ]);
  });

  it("names the edge checkboxes after the active state", () => {
    const stimulus = { ...newStimulus("binary_sensor.door"), mode: "momentary" as const };
    const item = stimulusSchema(cfg, stimulus, undefined, ["edges"])[0]!;
    expect((item.selector.select as { options: unknown }).options).toEqual([
      { value: "enter", label: "When it becomes On" },
      { value: "leave", label: "When it stops being On" },
    ]);
  });

  it("hands the form the stored lists rather than text", () => {
    const stimulus = { ...newStimulus("binary_sensor.door"), mode: "momentary" as const };
    expect(stimulusData(stimulus, ["mode", "to", "edges"])).toEqual({
      mode: "momentary",
      to: ["on"],
      edges: ["enter", "leave"],
    });
  });

  it("keeps the previous edges when the form hands back an empty list", () => {
    const stimulus = { ...newStimulus("binary_sensor.door"), mode: "momentary" as const };
    expect(mergeStimulus(stimulus, { edges: [] }).edges).toEqual(["enter", "leave"]);
    expect(mergeStimulus(stimulus, { edges: ["enter"] }).edges).toEqual(["enter"]);
    expect(mergeStimulus(stimulus, { edges: ["enter", "sideways"] }).edges).toEqual(["enter"]);
  });

  it("only takes a mode it recognises", () => {
    const stimulus = newStimulus("binary_sensor.door");
    expect(mergeStimulus(stimulus, { mode: "momentary" }).mode).toBe("momentary");
    expect(mergeStimulus(stimulus, { mode: "latching" }).mode).toBe("sustained");
  });

  it("disables the shape overrides a momentary trigger cannot use", () => {
    const stimulus = newStimulus("binary_sensor.door");
    expect(overrideDisabled(stimulus, "attack")).toBe(false);
    const momentary = { ...stimulus, mode: "momentary" as const };
    expect(overrideDisabled(momentary, "attack")).toBe(true);
    expect(overrideDisabled(momentary, "decay")).toBe(true);
    expect(overrideDisabled(momentary, "impulse")).toBe(true);
    expect(overrideDisabled(momentary, "release")).toBe(false);
    expect(overrideDisabled(momentary, "sustain")).toBe(false);
    expect(MOMENTARY_PINNED_HINT).toContain("always an impulse");
  });

  it("names the changed field so edits coalesce", () => {
    const stimulus = newStimulus("binary_sensor.door");
    expect(changedStimulusField({ ...stimulus, to: ["off"] }, stimulus)).toBe("to");
    expect(changedStimulusField({ ...stimulus, edges: ["enter"] }, stimulus)).toBe("edges");
    expect(changedStimulusField({ ...stimulus, mode: "momentary" }, stimulus)).toBe("mode");
    expect(changedStimulusField(stimulus, stimulus)).toBeUndefined();
  });
});
