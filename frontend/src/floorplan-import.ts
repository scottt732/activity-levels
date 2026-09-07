import { allowedChildKinds } from "./kinds";
import type { Kind } from "./kinds";
import { newGroup, walkGroups } from "./model";
import type { Bounds, Config, Gps, Group } from "./types";

export interface FloorplanItem {
  key: string;
  source_id: string | null;
  name: string;
  context: string;
  kind: "floor" | "area";
  bounds?: Bounds;
  points?: [number, number][];
}
export interface FloorplanSource { gps?: Gps; items: FloorplanItem[] }
export type ImportParent = { id: string } | { key: string } | null;
export interface CreateChoice {
  action: "create";
  id: string;
  name: string;
  kind: Kind;
  parent: ImportParent;
}
export type ImportChoice = { action: "skip" } | { action: "existing"; id: string } | CreateChoice;
export type ImportChoices = Record<string, ImportChoice>;
export interface ImportResult { config: Config; summary: string[]; created: boolean }

const folded = (value: string): string => value.trim().toLocaleLowerCase();

/** Ambiguity is a reason to ask, including two source rows claiming the same group. */
export function suggestMatches(config: Config, source: FloorplanSource): ImportChoices {
  const groups = walkGroups(config).map(({ group }) => group);
  const choices: ImportChoices = {};
  const counts = new Map<string, number>();
  for (const item of source.items) {
    const ids = item.source_id ? groups.filter((group) => group.id === item.source_id) : [];
    const matches = ids.length ? ids : groups.filter((group) =>
      folded(group.name ?? group.id) === folded(item.name));
    const match = matches.length === 1 ? matches[0] : undefined;
    choices[item.key] = match ? { action: "existing", id: match.id } : { action: "skip" };
    if (match) counts.set(match.id, (counts.get(match.id) ?? 0) + 1);
  }
  for (const [key, choice] of Object.entries(choices)) {
    if (choice.action === "existing" && counts.get(choice.id)! > 1) choices[key] = { action: "skip" };
  }
  return choices;
}

export function creationDefaults(config: Config, item: FloorplanItem, choices: ImportChoices): CreateChoice {
  const used = new Set(walkGroups(config).map(({ group }) => group.id));
  Object.values(choices).forEach((choice) => { if (choice.action === "create") used.add(choice.id); });
  let base = (item.source_id ?? item.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (!/^[a-z]/.test(base)) base = `group_${base || "imported"}`;
  let id = base;
  for (let suffix = 2; used.has(id); suffix++) id = `${base}_${suffix}`;
  return { action: "create", id, name: item.name, kind: item.kind, parent: null };
}

/**
 * Plan and apply against one immutable draft snapshot. Physical placement is carried
 * on the group itself; the source floor never decides where a matched room belongs.
 * Construct new parents before their children, detecting dependency cycles explicitly.
 */
export function applyImport(config: Config, source: FloorplanSource, choices: ImportChoices, importGps: boolean): ImportResult {
  const next = structuredClone(config);
  const groups = new Map(walkGroups(next).map(({ group }) => [group.id, group]));
  const items = new Map(source.items.map((item) => [item.key, item]));
  const summary: string[] = [];
  const targets = new Set<string>();
  const pending = new Set<string>();
  const created = new Map<string, Group>();
  const newIds = new Set<string>();
  for (const [key, choice] of Object.entries(choices)) {
    if (!items.has(key)) throw new Error("Source changed. Parse the configuration again.");
    if (choice.action === "create") {
      if (!/^[a-z][a-z0-9_]*$/.test(choice.id) || groups.has(choice.id) || newIds.has(choice.id))
        throw new Error(`${items.get(key)!.name}: choose an unused ID with lowercase letters, digits and underscores.`);
      if (!choice.name.trim()) throw new Error("New groups need a name.");
      newIds.add(choice.id);
    }
  }

  const create = (key: string): Group => {
    const existing = created.get(key);
    if (existing) return existing;
    if (pending.has(key)) throw new Error("New group parents form a cycle.");
    const choice = choices[key];
    if (choice?.action !== "create") throw new Error("Choose an explicitly created group as the new parent.");
    pending.add(key);
    let parent: Group | undefined;
    if (choice.parent) {
      parent = "id" in choice.parent ? groups.get(choice.parent.id) : create(choice.parent.key);
      if (!parent) throw new Error(`${choice.name}: the selected parent no longer exists.`);
    } else if (choice.kind !== "property") {
      throw new Error(`${choice.name}: select a parent for this ${choice.kind}.`);
    }
    if (!allowedChildKinds(parent?.kind ?? null).includes(choice.kind))
      throw new Error(`${parent?.name ?? parent?.id ?? "Root"} cannot contain a ${choice.kind}.`);
    const group = { ...newGroup(choice.id, choice.kind), name: choice.name.trim() };
    (parent?.children ?? next.groups).push(group);
    created.set(key, group);
    pending.delete(key);
    return group;
  };

  for (const item of source.items) {
    const choice = choices[item.key];
    if (!choice || choice.action === "skip") continue;
    const target = choice.action === "create" ? create(item.key) : groups.get(choice.id);
    if (!target) throw new Error(`${item.name}: selected group no longer exists.`);
    if (targets.has(target.id)) throw new Error(`${target.name ?? target.id} is mapped more than once.`);
    targets.add(target.id);
    const name = target.name ?? target.id;
    if (item.points) {
      target.points = structuredClone(item.points);
      // A new footprint without elevation must not inherit the destination's old height.
      delete target.bounds;
    }
    if (item.bounds) target.bounds = structuredClone(item.bounds);
    if (choice.action === "create") {
      const parent = choice.parent;
      const parentName = parent ? ("id" in parent ? groups.get(parent.id)?.name ?? parent.id : created.get(parent.key)?.name) : "root";
      summary.push(`Create ${choice.kind} “${name}” (${target.id}) under ${parentName}.`);
    } else if (item.points || item.bounds) {
      const clearing = item.points && !item.bounds ? "; clear previous vertical bounds" : "";
      summary.push(`Update geometry: ${item.context ? `${item.context} / ` : ""}${item.name} → ${name} (${target.id})${clearing}.`);
    }
  }
  if (importGps && source.gps) {
    next.gps = structuredClone(source.gps);
    summary.push(`${config.gps ? "Replace" : "Add"} GPS origin.`);
  }
  return { config: summary.length ? next : config, summary, created: created.size > 0 };
}
