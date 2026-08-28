import { emptyToNull } from "./convert";
import { KIND_DEFS, NODE_KINDS, allowedChildKinds } from "./kinds";
import { slugify, uniqueGroupId } from "./model";
import type { Selector } from "./al-override-field";
import type { Kind } from "./kinds";
import type { FormItem } from "./stimulus-form";
import type { Config, Group, Mix, NullHandling } from "./types";

/**
 * The schema, data and merge rules for editing one group, shared by the Groups editor and
 * the mixer's controls row. The mixer shows a subset (the identity fields stay in the
 * editor, where re-creating entities is an explicit act), so everything takes a field list.
 */

/** The fields either editor can show, in the order the schema lists them. */
export type GroupField = "id" | "name" | "kind" | "floor_id" | "area_id" | "mix" | "null_handling" | "gain";

/** Identity, in the order the panel reads: what it is, what it binds, then what it is called. */
export const IDENTITY_FIELDS: GroupField[] = ["kind", "floor_id", "area_id", "id", "name"];
export const MIX_FIELDS: GroupField[] = ["mix", "null_handling", "gain"];

export const GROUP_LABELS: Record<string, string> = {
  id: "ID",
  name: "Name",
  kind: "Kind",
  floor_id: "Home Assistant floor",
  area_id: "Home Assistant area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain",
  max_value: "Max value",
  precision: "Precision",
};

export const GROUP_HELPERS: Record<string, string> = {
  id: "Identifies the group and its entities. Changing it re-creates them.",
  name: "Friendly name; falls back to the area's name, then to the id.",
  kind: "What this is on the property. It decides what can go inside it.",
  floor_id: "Bind this to a Home Assistant floor to reuse its name.",
  area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent.",
};

export const groupLabel = (item: FormItem): string => GROUP_LABELS[item.name] ?? item.name;
export const groupHelper = (item: FormItem): string => GROUP_HELPERS[item.name] ?? "";

/** Fields the top form owns, checked in order to name the coalescing key. */
export const GROUP_FORM_FIELDS: (keyof Group)[] = [
  "id",
  "name",
  "kind",
  "floor_id",
  "area_id",
  "mix",
  "null_handling",
  "gain",
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

/** The panel subtitles the group editor heads its sections with. See spec §2 and §4. */
export const MIX_DEFINITION = "How this group's stimuli and children combine into one level.";
export const ADJACENCY_DEFINITION =
  "Adjacent groups are ones you can walk between without passing through another group in " +
  "this configuration. Sensors don't matter here — an unobserved hallway is still a room.";
export const PRESENCE_DEFINITION = "How loudly 'somebody is here' plays in this group's mix.";

export const MAX_VALUE_SELECTOR: Selector = { number: { min: 0.1, step: 0.1, mode: "box" } };
export const PRECISION_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((n) => ({ value: String(n), label: String(n) })),
  },
};
export const GROUP_GAIN_SELECTOR: Selector = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } };

/** Only a floor binds a floor, and only a place people are in binds an area. */
const applies = (name: GroupField, group: Group, isRoot: boolean): boolean => {
  switch (name) {
    case "null_handling":
      return group.mix === "mean";
    case "gain":
      return !isRoot;
    case "floor_id":
      return group.kind === "floor";
    case "area_id":
      return NODE_KINDS.has(group.kind);
    default:
      return true;
  }
};

/**
 * The kinds this picker offers: what the parent may contain, plus whatever this group
 * already is. A document that is already wrong has to stay readable — a picker that
 * cannot show the current value reads as though the value were something else.
 */
const kindSelector = (group: Group, parentKind: Kind | null): Selector => {
  const options = [...allowedChildKinds(parentKind)];
  if (!options.includes(group.kind)) options.push(group.kind);
  return {
    select: {
      mode: "dropdown",
      options: options.map((kind) => ({ value: kind, label: KIND_DEFS[kind].label })),
    },
  };
};

/**
 * `config` is accepted for symmetry with `groupData` (every caller has one to hand and
 * passes the same arguments to both), but the schema is decided by the group and by what
 * its parent may contain, which the caller passes as `parentKind`.
 */
export function groupSchema(
  group: Group,
  isRoot: boolean,
  fields: readonly GroupField[],
  config?: Config,
  parentKind: Kind | null = null,
): FormItem[] {
  const selectors: Record<GroupField, Selector> = {
    id: { text: {} },
    name: { text: {} },
    kind: kindSelector(group, parentKind),
    floor_id: { floor: {} },
    area_id: { area: {} },
    mix: { select: { mode: "dropdown", options: MIX_OPTIONS } },
    null_handling: { select: { mode: "dropdown", options: NULL_HANDLING_OPTIONS } },
    gain: GROUP_GAIN_SELECTOR,
  };
  return fields.filter((name) => applies(name, group, isRoot)).map((name) => ({ name, selector: selectors[name] }));
}

/**
 * An unset registry binding is left out entirely rather than sent as an empty string:
 * `ha-selector`'s area and floor pickers read `""` as a chosen registry entry that no
 * longer exists.
 *
 * `config` is accepted for symmetry with `groupSchema` (every caller has one to hand and
 * passes the same arguments to both), but is not needed here.
 */
export function groupData(
  group: Group,
  isRoot: boolean,
  fields: readonly GroupField[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- see doc comment above
  config?: Config,
): Record<string, unknown> {
  const all: Record<GroupField, unknown> = {
    id: group.id,
    name: group.name ?? "",
    kind: group.kind,
    floor_id: group.floor_id,
    area_id: group.area_id,
    mix: group.mix,
    null_handling: group.null_handling,
    gain: group.gain,
  };
  return Object.fromEntries(
    fields
      .filter(
        (name) =>
          applies(name, group, isRoot) &&
          !(name === "area_id" && group.area_id === null) &&
          !(name === "floor_id" && group.floor_id === null),
      )
      .map((name) => [name, all[name]]),
  );
}

/**
 * Folds an `ha-form` payload back into the group. Fields the form does not show are kept -
 * `adjacent` and `exit` among them: the Adjacent groups table owns those, and a form that
 * merged them would flatten a one-way laundry chute into a doorway on the next keystroke.
 */
export function mergeGroup(group: Group, v: Record<string, unknown>): Group {
  const merged: Group = { ...group };
  if ("id" in v) merged.id = String(v.id ?? "");
  if ("name" in v) merged.name = emptyToNull(v.name as string | null | undefined);
  if ("kind" in v && typeof v.kind === "string") merged.kind = v.kind as Kind;
  if ("floor_id" in v) merged.floor_id = emptyToNull(v.floor_id as string | null | undefined);
  if ("area_id" in v) merged.area_id = emptyToNull(v.area_id as string | null | undefined);
  if ("mix" in v) merged.mix = (v.mix as Mix | undefined) ?? group.mix;
  if ("null_handling" in v) merged.null_handling = (v.null_handling as NullHandling | undefined) ?? group.null_handling;
  if ("gain" in v) merged.gain = typeof v.gain === "number" ? v.gain : group.gain;
  return merged;
}

/** The single field this edit touched, which names the undo step it coalesces into. */
export const changedGroupField = (merged: Group, group: Group): string | undefined =>
  GROUP_FORM_FIELDS.find((k) => merged[k] !== group[k]);

/**
 * Whether the id is still the one the tree made up. "Add group" has to produce something
 * that validates, so a new group gets its kind as its id (`area`, `area_2`); that is the
 * marker for "nobody has named this yet", and picking an area is then allowed to replace
 * it. The moment the user types anything else, the id is theirs and nothing rewrites it.
 */
export const isDefaultId = (group: Group): boolean =>
  group.id === "" || new RegExp(`^${group.kind}(_\\d+)?$`).test(group.id);

/**
 * The id comes from the registry *id*, slugged - not from the friendly name. The registry
 * id is what Home Assistant's own entity ids are built from, so taking it keeps this
 * group's entities recognisably the same thing as the area's; a friendly name is free text
 * that may not survive being slugged into anything readable. `config`, when given, keeps
 * the prefill off an id another group already answers to.
 */
function bind(
  group: Group,
  field: "area_id" | "floor_id",
  id: string | null,
  name: string | null,
  config?: Config,
): Group {
  const bound: Group = { ...group, [field]: id };
  // Clearing a binding is not an edit to the identity: the names it prefilled are the
  // user's now, and taking them away would delete work nobody asked to delete.
  if (id === null) return bound;
  if (isDefaultId(group)) bound.id = config ? uniqueGroupId(config, id) : slugify(id);
  if (group.name === null && name !== null) bound.name = name;
  return bound;
}

/** Bind a Home Assistant area, prefilling the id and the name while both are untouched. */
export const bindArea = (group: Group, areaId: string | null, areaName: string | null, config?: Config): Group =>
  bind(group, "area_id", areaId, areaName, config);

export const bindFloor = (group: Group, floorId: string | null, floorName: string | null, config?: Config): Group =>
  bind(group, "floor_id", floorId, floorName, config);
