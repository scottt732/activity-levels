import { BOOLEAN_SELECTOR } from "./al-override-field";
import { emptyToNull, formatToList, parseToList } from "./convert";
import { formatDuration } from "./duration";
import { presetById } from "./model";
import type { Selector } from "./al-override-field";
import type { OverrideKind } from "./convert";
import type { Config, EnvelopeOverrides, Stimulus } from "./types";

/**
 * The schema, data and merge rules for editing one stimulus, kept out of any component so
 * the Groups editor and the mixer's controls row spell a stimulus the same way. Both show a
 * subset of the same fields, so everything here takes the field list it should cover.
 */

/** One row of an `ha-form` schema: a field name and the selector that edits it. */
export interface FormItem {
  name: string;
  selector: Selector;
}

/** The fields either editor can show, in the order the schema lists them. */
export type StimulusField = "entity" | "to" | "gain" | "key" | "envelope";

export const STIMULUS_LABELS: Record<string, string> = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset",
};

export const STIMULUS_HELPERS: Record<string, string> = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from.",
};

export const stimulusLabel = (item: FormItem): string => STIMULUS_LABELS[item.name] ?? item.name;
export const stimulusHelper = (item: FormItem): string => STIMULUS_HELPERS[item.name] ?? "";

/** Fields the top form owns, checked in order to name the coalescing key. */
export const STIMULUS_FORM_FIELDS: (keyof Stimulus)[] = ["entity", "gain", "key", "envelope"];

/** Milliseconds stay on: the backend takes sub-second debounce, wake and A/D/R values,
 * and a selector without the field would silently drop the `milliseconds` we hand it. */
export const DURATION_SELECTOR: Selector = { duration: { enable_millisecond: true } };
export const SUSTAIN_SELECTOR: Selector = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } };
export const GAIN_SELECTOR: Selector = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } };
export const RETRIGGER_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" },
    ],
  },
};
export const UNAVAILABLE_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" },
    ],
  },
};

/**
 * Named where "defaults" would otherwise be, when the envelope id on a stimulus (or on
 * `defaults.envelope`) matches no preset: the inherited numbers below are then the
 * engine's own fallbacks, not anything the user can see in the Envelopes tab.
 */
export const UNKNOWN_PRESET = "(unknown preset — using built-in defaults)";

export interface OverrideItem {
  name: keyof EnvelopeOverrides;
  label: string;
  kind: OverrideKind;
  selector: Selector;
}

export const OVERRIDES: OverrideItem[] = [
  { name: "attack", label: "Attack", kind: "duration", selector: DURATION_SELECTOR },
  { name: "decay", label: "Decay", kind: "duration", selector: DURATION_SELECTOR },
  { name: "sustain", label: "Sustain", kind: "number", selector: SUSTAIN_SELECTOR },
  { name: "release", label: "Release", kind: "duration", selector: DURATION_SELECTOR },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: BOOLEAN_SELECTOR },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: RETRIGGER_SELECTOR },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: UNAVAILABLE_SELECTOR },
  { name: "debounce", label: "Debounce", kind: "duration", selector: DURATION_SELECTOR },
];

/** What fires this stimulus. `gain` is not here: how loudly it plays is part of its shape. */
export const SOURCE_FIELDS: StimulusField[] = ["entity", "to", "key"];

/** The shape of one trigger: which preset it starts from, and how loud it is. */
export const ENVELOPE_FIELDS: StimulusField[] = ["envelope", "gain"];

export const ENVELOPE_DEFINITION = "How a single trigger rises and falls over time.";
export const SOURCE_DEFINITION = "What makes this stimulus fire, and what it is called in the mix.";
export const OVERRIDES_DEFINITION = "Change part of the preset for this stimulus only.";

/**
 * How many envelope fields this stimulus overrides. Only the eight in {@link OVERRIDES}
 * count: `gain` and the preset itself live in the Envelope panel above, and counting them
 * would badge a stimulus that has overridden nothing.
 */
export const overriddenCount = (stimulus: Stimulus): number =>
  OVERRIDES.filter((item) => stimulus[item.name] !== null && stimulus[item.name] !== undefined).length;

/** The preset dropdown's options: an empty value inherits `defaults.envelope`. */
export const envelopeOptions = (config: Config): { value: string; label: string }[] => [
  { value: "", label: "(default preset)" },
  ...config.envelopes.map((e) => ({ value: e.id, label: e.id })),
];

export function stimulusSchema(config: Config, fields: readonly StimulusField[]): FormItem[] {
  const selectors: Record<StimulusField, Selector> = {
    entity: { entity: {} },
    to: { text: {} },
    gain: GAIN_SELECTOR,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: envelopeOptions(config) } },
  };
  return fields.map((name) => ({ name, selector: selectors[name] }));
}

/** `toText` is the raw text of the "Active states" field while it is being edited. */
export function stimulusData(
  stimulus: Stimulus,
  toText: string | null,
  fields: readonly StimulusField[],
): Record<string, unknown> {
  const all: Record<StimulusField, unknown> = {
    entity: stimulus.entity,
    to: toText ?? formatToList(stimulus.to),
    gain: stimulus.gain,
    key: stimulus.key ?? "",
    envelope: stimulus.envelope ?? "",
  };
  return Object.fromEntries(fields.map((name) => [name, all[name]]));
}

/** Folds an `ha-form` payload back into the stimulus. Fields the form does not show are kept. */
export function mergeStimulus(stimulus: Stimulus, v: Record<string, unknown>): Stimulus {
  const merged: Stimulus = { ...stimulus };
  if ("entity" in v) merged.entity = String(v.entity ?? "");
  if ("to" in v) merged.to = parseToList(String(v.to ?? ""));
  if ("gain" in v) merged.gain = typeof v.gain === "number" ? v.gain : stimulus.gain;
  if ("key" in v) merged.key = emptyToNull(v.key as string | null | undefined);
  if ("envelope" in v) merged.envelope = emptyToNull(v.envelope as string | null | undefined);
  return merged;
}

/** The single field this edit touched, which names the coalescing key; `undefined` if none did. */
export function changedStimulusField(merged: Stimulus, stimulus: Stimulus): string | undefined {
  if (formatToList(merged.to) !== formatToList(stimulus.to)) return "to";
  return STIMULUS_FORM_FIELDS.find((k) => merged[k] !== stimulus[k]);
}

/**
 * True while the raw text still spells the stored list. `formatToList` is lossy mid-word -
 * a trailing separator in `on, playing,` parses back to `on, playing` - so an editor keeps
 * its raw text until the config underneath says something else.
 */
export const toTextMatches = (to: readonly string[], text: string): boolean =>
  formatToList(to) === formatToList(parseToList(text));

/** Where the effective value comes from when the stimulus does not override it. */
export function overrideSource(config: Config, stimulus: Stimulus, name: keyof EnvelopeOverrides): string {
  const preset = presetById(config, stimulus.envelope);
  if (!preset) return UNKNOWN_PRESET;
  return preset[name] === null || preset[name] === undefined
    ? "defaults"
    : (stimulus.envelope ?? config.defaults.envelope);
}

/**
 * How long this voice stays in its current phase, measured against the payload's own
 * `now` so a browser clock that disagrees with the server does not skew the countdown.
 */
export function phaseCountdown(now: number | undefined, at: number | null | undefined): string | null {
  if (at === null || at === undefined || now === undefined) return null;
  return formatDuration(Math.max(0, Math.round((at - now) * 1000) / 1000));
}
