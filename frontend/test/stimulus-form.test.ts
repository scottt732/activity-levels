import { describe, expect, it } from "vitest";
import { newStimulus } from "../src/model";
import { ENVELOPE_FIELDS, RETRIGGER_SELECTOR, SOURCE_FIELDS, overriddenCount } from "../src/stimulus-form";

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
    expect(SOURCE_FIELDS).toEqual(["entity", "to", "key"]);
    expect(ENVELOPE_FIELDS).toEqual(["envelope", "gain"]);
    expect([...SOURCE_FIELDS, ...ENVELOPE_FIELDS].sort()).toEqual(
      ["entity", "envelope", "gain", "key", "to"],
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
