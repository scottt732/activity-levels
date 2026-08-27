import { emptyToNull } from "./convert";
import { adjacencyId, allGroupIds } from "./model";
import type { Selector } from "./al-override-field";
import type { FormItem } from "./stimulus-form";
import type { Config, Group, Mix, NullHandling } from "./types";

/**
 * The schema, data and merge rules for editing one group, shared by the Groups editor and
 * the mixer's controls row. The mixer shows a subset (the identity fields stay in the
 * editor, where re-creating entities is an explicit act), so everything takes a field list.
 */

/** The fields either editor can show, in the order the schema lists them. */
export type GroupField = "id" | "name" | "area" | "mix" | "null_handling" | "gain" | "adjacent" | "exit";

export const GROUP_LABELS: Record<string, string> = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain",
  adjacent: "Adjacent rooms",
  exit: "Way out of the house",
};

export const GROUP_HELPERS: Record<string, string> = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent.",
  adjacent:
    "Rooms you can walk to from here. Symmetric: naming one from either side is enough. One-way connections are shown with an arrow and edited in YAML.",
  exit: "People can leave the house from this room, so presence can move from here to Away.",
};

export const groupLabel = (item: FormItem): string => GROUP_LABELS[item.name] ?? item.name;
export const groupHelper = (item: FormItem): string => GROUP_HELPERS[item.name] ?? "";

/** Fields the top form owns, checked in order to name the coalescing key. */
export const GROUP_FORM_FIELDS: (keyof Group)[] = [
  "id",
  "name",
  "area",
  "mix",
  "null_handling",
  "gain",
  "adjacent",
  "exit",
];

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

const EXIT_SELECTOR: Selector = { boolean: {} };

/** Every other group, in tree order: what a room can be adjacent to. */
function adjacentSelector(config: Config, group: Group): Selector {
  const options: { value: string; label: string }[] = [];
  const walk = (g: Group): void => {
    if (g.id !== group.id) options.push({ value: g.id, label: g.name ?? g.id });
    g.children.forEach(walk);
  };
  config.groups.forEach(walk);
  return { select: { multiple: true, mode: "dropdown", sort: false, options } };
}

/** Idle handling only means something for a mean; a root group scales into nothing. */
const applies = (name: GroupField, group: Group, isRoot: boolean): boolean =>
  name === "null_handling" ? group.mix === "mean" : name === "gain" ? !isRoot : true;

export function groupSchema(
  group: Group,
  isRoot: boolean,
  fields: readonly GroupField[],
  config?: Config,
): FormItem[] {
  const selectors: Record<GroupField, Selector> = {
    id: { text: {} },
    name: { text: {} },
    area: { area: {} },
    mix: { select: { mode: "dropdown", options: MIX_OPTIONS } },
    null_handling: { select: { mode: "dropdown", options: NULL_HANDLING_OPTIONS } },
    gain: GROUP_GAIN_SELECTOR,
    adjacent: config ? adjacentSelector(config, group) : { select: { multiple: true, options: [] } },
    exit: EXIT_SELECTOR,
  };
  return fields.filter((name) => applies(name, group, isRoot)).map((name) => ({ name, selector: selectors[name] }));
}

/**
 * An unset area is left out entirely rather than sent as an empty string: `ha-selector`'s
 * area picker reads `""` as a chosen area that no longer exists.
 *
 * `adjacent` is spelled out as plain ids, dropped to only those that still name a group in
 * `config`: a picker option list built from the current tree cannot show a value that is
 * not one of its options.
 */
export function groupData(
  group: Group,
  isRoot: boolean,
  fields: readonly GroupField[],
  config?: Config,
): Record<string, unknown> {
  const known = config ? allGroupIds(config) : null;
  const adjacent = (group.adjacent ?? [])
    .map(adjacencyId)
    .filter((id) => known === null || known.has(id));
  const all: Record<GroupField, unknown> = {
    id: group.id,
    name: group.name ?? "",
    area: group.area,
    mix: group.mix,
    null_handling: group.null_handling,
    gain: group.gain,
    adjacent,
    exit: group.exit === true,
  };
  return Object.fromEntries(
    fields
      .filter((name) => applies(name, group, isRoot) && !(name === "area" && group.area === null))
      .map((name) => [name, all[name]]),
  );
}

/**
 * Folds an `ha-form` payload back into the group. Fields the form does not show are kept.
 * The adjacency picker only ever produces ids, so a one-way edge that is still selected
 * keeps the object it had - dropping to a plain id would silently make a laundry chute a
 * doorway.
 */
export function mergeGroup(group: Group, v: Record<string, unknown>): Group {
  const merged: Group = { ...group };
  if ("id" in v) merged.id = String(v.id ?? "");
  if ("name" in v) merged.name = emptyToNull(v.name as string | null | undefined);
  if ("area" in v) merged.area = emptyToNull(v.area as string | null | undefined);
  if ("mix" in v) merged.mix = (v.mix as Mix | undefined) ?? group.mix;
  if ("null_handling" in v) merged.null_handling = (v.null_handling as NullHandling | undefined) ?? group.null_handling;
  if ("gain" in v) merged.gain = typeof v.gain === "number" ? v.gain : group.gain;
  if ("adjacent" in v) {
    const chosen = Array.isArray(v.adjacent) ? (v.adjacent as string[]).map(String) : [];
    const existing = new Map((group.adjacent ?? []).map((a) => [adjacencyId(a), a]));
    merged.adjacent = chosen.map((id) => existing.get(id) ?? id);
  }
  if ("exit" in v) merged.exit = v.exit === true;
  return merged;
}

/** The single field this edit touched. Adjacency is a list, so it is compared as one. */
export const changedGroupField = (merged: Group, group: Group): string | undefined => {
  const before = (group.adjacent ?? []).map(adjacencyId).join(",");
  const after = (merged.adjacent ?? []).map(adjacencyId).join(",");
  if (before !== after) return "adjacent";
  return GROUP_FORM_FIELDS.filter((k) => k !== "adjacent").find((k) => merged[k] !== group[k]);
};
