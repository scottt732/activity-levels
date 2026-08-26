import { emptyToNull } from "./convert";
import type { Selector } from "./al-override-field";
import type { FormItem } from "./stimulus-form";
import type { Group, Mix, NullHandling } from "./types";

/**
 * The schema, data and merge rules for editing one group, shared by the Groups editor and
 * the mixer's controls row. The mixer shows a subset (the identity fields stay in the
 * editor, where re-creating entities is an explicit act), so everything takes a field list.
 */

/** The fields either editor can show, in the order the schema lists them. */
export type GroupField = "id" | "name" | "area" | "mix" | "null_handling" | "gain";

export const GROUP_LABELS: Record<string, string> = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain",
};

export const GROUP_HELPERS: Record<string, string> = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent.",
};

export const groupLabel = (item: FormItem): string => GROUP_LABELS[item.name] ?? item.name;
export const groupHelper = (item: FormItem): string => GROUP_HELPERS[item.name] ?? "";

/** Fields the top form owns, checked in order to name the coalescing key. */
export const GROUP_FORM_FIELDS: (keyof Group)[] = ["id", "name", "area", "mix", "null_handling", "gain"];

export const MIX_OPTIONS = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" },
];

export const NULL_HANDLING_OPTIONS = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" },
];

export const MAX_VALUE_SELECTOR: Selector = { number: { min: 0.1, step: 0.1, mode: "box" } };
export const PRECISION_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((n) => ({ value: String(n), label: String(n) })),
  },
};
export const GROUP_GAIN_SELECTOR: Selector = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } };

/** Idle handling only means something for a mean; a root group scales into nothing. */
const applies = (name: GroupField, group: Group, isRoot: boolean): boolean =>
  name === "null_handling" ? group.mix === "mean" : name === "gain" ? !isRoot : true;

export function groupSchema(group: Group, isRoot: boolean, fields: readonly GroupField[]): FormItem[] {
  const selectors: Record<GroupField, Selector> = {
    id: { text: {} },
    name: { text: {} },
    area: { area: {} },
    mix: { select: { mode: "dropdown", options: MIX_OPTIONS } },
    null_handling: { select: { mode: "dropdown", options: NULL_HANDLING_OPTIONS } },
    gain: GROUP_GAIN_SELECTOR,
  };
  return fields.filter((name) => applies(name, group, isRoot)).map((name) => ({ name, selector: selectors[name] }));
}

/**
 * An unset area is left out entirely rather than sent as an empty string: `ha-selector`'s
 * area picker reads `""` as a chosen area that no longer exists.
 */
export function groupData(group: Group, isRoot: boolean, fields: readonly GroupField[]): Record<string, unknown> {
  const all: Record<GroupField, unknown> = {
    id: group.id,
    name: group.name ?? "",
    area: group.area,
    mix: group.mix,
    null_handling: group.null_handling,
    gain: group.gain,
  };
  return Object.fromEntries(
    fields
      .filter((name) => applies(name, group, isRoot) && !(name === "area" && group.area === null))
      .map((name) => [name, all[name]]),
  );
}

/** Folds an `ha-form` payload back into the group. Fields the form does not show are kept. */
export function mergeGroup(group: Group, v: Record<string, unknown>): Group {
  const merged: Group = { ...group };
  if ("id" in v) merged.id = String(v.id ?? "");
  if ("name" in v) merged.name = emptyToNull(v.name as string | null | undefined);
  if ("area" in v) merged.area = emptyToNull(v.area as string | null | undefined);
  if ("mix" in v) merged.mix = (v.mix as Mix | undefined) ?? group.mix;
  if ("null_handling" in v) merged.null_handling = (v.null_handling as NullHandling | undefined) ?? group.null_handling;
  if ("gain" in v) merged.gain = typeof v.gain === "number" ? v.gain : group.gain;
  return merged;
}

/** The single field this edit touched, which names the coalescing key; `undefined` if none did. */
export const changedGroupField = (merged: Group, group: Group): string | undefined =>
  GROUP_FORM_FIELDS.find((k) => merged[k] !== group[k]);
