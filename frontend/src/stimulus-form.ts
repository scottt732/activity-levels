import { BOOLEAN_SELECTOR } from "./al-override-field";
import { emptyToNull } from "./convert";
import { formatDuration } from "./duration";
import { edgeLabels, stateOptions } from "./entity-states";
import { presetById } from "./model";
import type { Selector } from "./al-override-field";
import type { OverrideKind } from "./convert";
import type {
  Config,
  EnvelopeOverrides,
  HomeAssistant,
  Stimulus,
  StimulusEdge,
} from "./types";

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
export type StimulusField = "entity" | "mode" | "to" | "edges" | "gain" | "key" | "envelope";

export const STIMULUS_LABELS: Record<string, string> = {
  entity: "Entity",
  mode: "Mode",
  to: "Active states",
  edges: "Fire on",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset",
};

export const STIMULUS_HELPERS: Record<string, string> = {
  entity: "The entity whose state drives this stimulus.",
  mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
  to: "Which states of this entity count as active.",
  edges: "Which crossings fire a trigger. At least one.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this trigger; defaults to the entity id.",
  envelope: "Preset the overrides below start from.",
};

export const stimulusLabel = (item: FormItem): string => STIMULUS_LABELS[item.name] ?? item.name;
export const stimulusHelper = (item: FormItem): string => STIMULUS_HELPERS[item.name] ?? "";

/** Fields the top form owns, checked in order to name the coalescing key. */
export const STIMULUS_FORM_FIELDS: (keyof Stimulus)[] = ["entity", "mode", "gain", "key", "envelope"];

/** Milliseconds stay on: the backend takes sub-second debounce, wake and A/D/R values,
 * and a selector without the field would silently drop the `milliseconds` we hand it. */
export const DURATION_SELECTOR: Selector = { duration: { enable_millisecond: true } };
/** Sustain is a multiplier on the peak, so it has a floor but no ceiling: above 1 the
 * decay climbs to a level the attack never reached. */
export const SUSTAIN_SELECTOR: Selector = {
  number: { min: 0, step: 0.1, mode: "box", unit_of_measurement: "×" },
};
export const GAIN_SELECTOR: Selector = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } };
export const RETRIGGER_LABEL = "Allow retrigger";
export const RETRIGGER_HELPER = "When a new trigger is honoured while the envelope is still active.";
export const STACK_LABEL = "Stacks";
export const STACK_HELPER =
  "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.";

export const RETRIGGER_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [
      { value: "always", label: "Always" },
      { value: "after_attack", label: "After the attack" },
      { value: "after_decay", label: "After the decay" },
      { value: "release", label: "Only while releasing" },
      { value: "idle", label: "Only once fully released" },
    ],
  },
};
export const MODE_SELECTOR: Selector = {
  select: {
    mode: "list",
    options: [
      { value: "sustained", label: "Sustained — hold while it is active" },
      { value: "momentary", label: "Momentary — fire on each change" },
    ],
  },
};

/**
 * The overrides a momentary trigger cannot use. It is built as an impulse, which enters
 * its release immediately, so the two rising segments never run and the impulse flag
 * itself is not the stimulus's to give away.
 */
export const MOMENTARY_PINNED: readonly (keyof EnvelopeOverrides)[] = ["attack", "decay", "impulse"];

export const MOMENTARY_PINNED_HINT =
  "A momentary trigger is always an impulse: the state change is the whole event, so there " +
  "is nothing to hold the envelope open — it jumps to its peak and releases. Attack and " +
  "decay never run.";

/** Whether this override is pinned by the mode rather than free for the stimulus to set. */
export const overrideDisabled = (stimulus: Stimulus, name: keyof EnvelopeOverrides): boolean =>
  stimulus.mode === "momentary" && MOMENTARY_PINNED.includes(name);

export const UNAVAILABLE_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "End the trigger" },
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
  /** One line under the field, for the two whose names do not explain themselves. */
  hint?: string;
}

export const OVERRIDES: OverrideItem[] = [
  { name: "attack", label: "Attack", kind: "duration", selector: DURATION_SELECTOR },
  { name: "decay", label: "Decay", kind: "duration", selector: DURATION_SELECTOR },
  { name: "sustain", label: "Sustain", kind: "multiplier", selector: SUSTAIN_SELECTOR },
  { name: "release", label: "Release", kind: "duration", selector: DURATION_SELECTOR },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: BOOLEAN_SELECTOR },
  {
    name: "retrigger",
    label: RETRIGGER_LABEL,
    kind: "select",
    selector: RETRIGGER_SELECTOR,
    hint: RETRIGGER_HELPER,
  },
  { name: "stack", label: STACK_LABEL, kind: "boolean", selector: BOOLEAN_SELECTOR, hint: STACK_HELPER },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: UNAVAILABLE_SELECTOR },
  { name: "debounce", label: "Debounce", kind: "duration", selector: DURATION_SELECTOR },
];

/** What fires this stimulus. `gain` is not here: how loudly it plays is part of its shape. */
export const SOURCE_FIELDS: StimulusField[] = ["entity", "mode", "to", "edges", "key"];

/**
 * The Source fields this stimulus actually shows. A sustained trigger has no crossings to
 * choose between, so offering the checkboxes would be asking a question with no consequence
 * — but the key stays in the document either way, because the mode radio flips back and
 * forth and a document that will not save because of a hidden field is worse than a spare one.
 */
export const visibleSourceFields = (stimulus: Stimulus): StimulusField[] =>
  SOURCE_FIELDS.filter((name) => name !== "edges" || stimulus.mode === "momentary");

/** The shape of one trigger: which preset it starts from, and how loud it is. */
export const ENVELOPE_FIELDS: StimulusField[] = ["envelope", "gain"];

export const ENVELOPE_DEFINITION = "How a single trigger rises and falls over time.";
export const SOURCE_DEFINITION = "What makes this stimulus fire, and what it is called in the mix.";
export const OVERRIDES_DEFINITION = "Change part of the preset for this stimulus only.";

/**
 * How many envelope fields this stimulus overrides. Only the ones in {@link OVERRIDES}
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

/**
 * The form schema. It takes the stimulus and `hass` as well as the config, because two of
 * the selectors are built from the entity itself: the active states it can be in, and the
 * names its two edges get.
 */
export function stimulusSchema(
  config: Config,
  stimulus: Stimulus,
  hass: HomeAssistant | undefined,
  fields: readonly StimulusField[],
): FormItem[] {
  const edges = edgeLabels(hass, stimulus.entity, stimulus.to);
  const selectors: Record<StimulusField, Selector> = {
    entity: { entity: {} },
    mode: MODE_SELECTOR,
    to: {
      select: {
        mode: "dropdown",
        multiple: true,
        // The table behind `stateOptions` cannot know every domain, so an exotic entity
        // can still be typed at. The field just stops *asking* to be typed at.
        custom_value: true,
        options: stateOptions(hass, stimulus.entity, stimulus.to),
      },
    },
    edges: {
      select: {
        mode: "list",
        multiple: true,
        options: [
          { value: "enter", label: edges.enter },
          { value: "leave", label: edges.leave },
        ],
      },
    },
    gain: GAIN_SELECTOR,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: envelopeOptions(config) } },
  };
  return fields.map((name) => ({ name, selector: selectors[name] }));
}

export function stimulusData(
  stimulus: Stimulus,
  fields: readonly StimulusField[],
): Record<string, unknown> {
  const all: Record<StimulusField, unknown> = {
    entity: stimulus.entity,
    mode: stimulus.mode,
    to: stimulus.to,
    edges: stimulus.edges,
    gain: stimulus.gain,
    key: stimulus.key ?? "",
    envelope: stimulus.envelope ?? "",
  };
  return Object.fromEntries(fields.map((name) => [name, all[name]]));
}

const asList = (raw: unknown): string[] =>
  Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string" && s !== "") : [];

/** Folds an `ha-form` payload back into the stimulus. Fields the form does not show are kept. */
export function mergeStimulus(stimulus: Stimulus, v: Record<string, unknown>): Stimulus {
  const merged: Stimulus = { ...stimulus };
  if ("entity" in v) merged.entity = String(v.entity ?? "");
  if ("mode" in v && (v.mode === "sustained" || v.mode === "momentary")) merged.mode = v.mode;
  if ("to" in v) merged.to = asList(v.to);
  if ("edges" in v) {
    // Unchecking the last edge is declined rather than stored: a momentary stimulus with
    // no edges can never fire, and the backend refuses it anyway, so the form does not
    // build the document that would come back rejected.
    const edges = asList(v.edges).filter((e): e is StimulusEdge => e === "enter" || e === "leave");
    if (edges.length > 0) merged.edges = edges;
  }
  if ("gain" in v) merged.gain = typeof v.gain === "number" ? v.gain : stimulus.gain;
  if ("key" in v) merged.key = emptyToNull(v.key as string | null | undefined);
  if ("envelope" in v) merged.envelope = emptyToNull(v.envelope as string | null | undefined);
  return merged;
}

const sameList = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((value, i) => value === b[i]);

/** The single field this edit touched, which names the coalescing key; `undefined` if none did. */
export function changedStimulusField(merged: Stimulus, stimulus: Stimulus): string | undefined {
  if (!sameList(merged.to, stimulus.to)) return "to";
  if (!sameList(merged.edges, stimulus.edges)) return "edges";
  return STIMULUS_FORM_FIELDS.find((k) => merged[k] !== stimulus[k]);
}

/** Where the effective value comes from when the stimulus does not override it. */
export function overrideSource(config: Config, stimulus: Stimulus, name: keyof EnvelopeOverrides): string {
  const preset = presetById(config, stimulus.envelope);
  if (!preset) return UNKNOWN_PRESET;
  return preset[name] === null || preset[name] === undefined
    ? "defaults"
    : (stimulus.envelope ?? config.defaults.envelope);
}

/**
 * How long this trigger stays in its current phase, measured against the payload's own
 * `now` so a browser clock that disagrees with the server does not skew the countdown.
 */
export function phaseCountdown(now: number | undefined, at: number | null | undefined): string | null {
  if (at === null || at === undefined || now === undefined) return null;
  return formatDuration(Math.max(0, Math.round((at - now) * 1000) / 1000));
}
