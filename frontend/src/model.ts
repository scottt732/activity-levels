import { DEFAULT_CONNECTION, NODE_KINDS } from "./kinds";
import { getAt } from "./store";
import type { Connection, Kind } from "./kinds";
import type { Adjacency, Config, EnvelopeOverrides, EnvelopePreset, Group, Path, PresenceOverrides, PresenceSettings, Stimulus } from "./types";

export const newGroup = (id: string, kind: Kind): Group => ({
  id,
  name: null,
  kind,
  floor_id: null,
  area_id: null,
  mix: "sum",
  null_handling: "zero",
  max_value: null,
  precision: null,
  gain: 1,
  adjacent: [],
  exit: false,
  presence: newPresenceOverrides(),
  stimuli: [],
  children: [],
});

/** The key the live frame labels a room's presence voice with, in `LiveState.voices`. */
export const PRESENCE_KEY = "presence";

export const newPresenceOverrides = (): PresenceOverrides => ({
  gain: 1,
  envelope: null,
  activity_floor: null,
  attack: null,
  decay: null,
  sustain: null,
  release: null,
  impulse: null,
  retrigger: null,
  stack: null,
  unavailable: null,
  debounce: null,
});

/** The id an adjacency entry names, whether it is a plain id or a one-way `{ id, one_way }`. */
export const adjacencyId = (a: string | Adjacency): string => (typeof a === "string" ? a : a.id);

/** Whether an adjacency entry is a one-way door. A plain id is always two-way. */
export const isOneWay = (a: string | Adjacency): boolean => typeof a !== "string" && a.one_way;

/** How an adjacency entry joins the two groups. A plain id is a doorway. */
export const adjacencyConnection = (a: string | Adjacency): Connection =>
  typeof a === "string" ? DEFAULT_CONNECTION : a.connection;

/** Every group in the document, in tree order, with its path and its parent. */
export function walkGroups(config: Config): { group: Group; path: Path; parent: Group | null }[] {
  const out: { group: Group; path: Path; parent: Group | null }[] = [];
  const walk = (group: Group, path: Path, parent: Group | null): void => {
    out.push({ group, path, parent });
    group.children.forEach((child, i) => walk(child, [...path, "children", i], group));
  };
  config.groups.forEach((group, i) => walk(group, ["groups", i], null));
  return out;
}

/**
 * The edges *other* groups declare against this one. An edge is written once, from
 * whichever side read more naturally, so the table has to show both halves — the rows it
 * owns and can edit, and the rows somebody else owns and it can only read.
 */
export function declaredOn(config: Config, id: string): { group: Group; edge: Adjacency }[] {
  const out: { group: Group; edge: Adjacency }[] = [];
  for (const { group } of walkGroups(config)) {
    if (group.id === id) continue;
    for (const entry of group.adjacent ?? []) {
      if (adjacencyId(entry) !== id) continue;
      out.push({
        group,
        edge: {
          id,
          connection: adjacencyConnection(entry),
          one_way: isOneWay(entry),
        },
      });
    }
  }
  return out;
}

const PRESENCE_DEFAULTS: PresenceSettings = {
  enabled: false,
  devices: [],
  envelope: null,
  threshold: 0.6,
  stay: 0.9,
  escape: 0.001,
  scale: 3,
  floor: 0.05,
  stuck_after: 60,
  activity: { floor: 0.05 },
  scanner_areas: {},
};

/** The presence block with every default filled in; a config that predates it reads as off. */
export const presenceSettings = (config: Config): PresenceSettings => ({
  ...PRESENCE_DEFAULTS,
  ...(config.presence ?? {}),
});

export const newPreset = (id: string): EnvelopePreset => ({
  id,
  label: null,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: false,
  retrigger: null,
  stack: null,
  unavailable: null,
  debounce: null,
});

/**
 * What to call a preset on screen. The id is what stimuli name and what a rename has to
 * chase through the document, so it stays visible as the secondary line; the label is
 * free text and may be blank, in which case there is nothing to show but the id.
 */
export const presetLabel = (preset: EnvelopePreset): string =>
  preset.label !== null && preset.label.trim() !== "" ? preset.label : preset.id;

export const newStimulus = (entity: string): Stimulus => ({
  entity,
  to: ["on"],
  mode: "sustained",
  edges: ["enter", "leave"],
  gain: 1,
  key: null,
  envelope: null,
  attack: null,
  decay: null,
  sustain: null,
  release: null,
  impulse: null,
  retrigger: null,
  stack: null,
  unavailable: null,
  debounce: null,
});

/** A group's own precision, or the one it inherits from the defaults. */
export const effectivePrecision = (config: Config, group: Group): number =>
  group.precision ?? config.defaults.precision;

/**
 * A level printed the way the engine rounds it: `1.8342` at 1 dp is `1.8`, and `2` at 2 dp
 * is `2.00`, so a column of levels lines up. `toFixed` throws outside 0…100 digits and
 * truncates a fractional one, so the precision is squared up before it gets there - a
 * profile document or a live frame from a newer engine must not take the panel down.
 */
export function formatLevel(value: number, precision: number): string {
  return value.toFixed(Math.min(100, Math.max(0, Math.trunc(precision))));
}

export function allGroupIds(config: Config): Set<string> {
  const ids = new Set<string>();
  const walk = (g: Group): void => {
    ids.add(g.id);
    g.children.forEach(walk);
  };
  config.groups.forEach(walk);
  return ids;
}

/**
 * Which groups are rooms — the states the room graph has. The document says so now, so
 * this is the kind and nothing else: a room with no doorway declared yet is still a room.
 */
export function roomIds(config: Config): Set<string> {
  return new Set(
    walkGroups(config)
      .filter(({ group }) => NODE_KINDS.has(group.kind))
      .map(({ group }) => group.id),
  );
}

export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^[^a-z]+/, "");
  return s || "group";
}

export const allPresetIds = (config: Config): Set<string> => new Set(config.envelopes.map((e) => e.id));

function uniqueIn(ids: Set<string>, base: string): string {
  const slug = slugify(base);
  if (!ids.has(slug)) return slug;
  let n = 2;
  while (ids.has(`${slug}_${n}`)) n++;
  return `${slug}_${n}`;
}

export const uniqueGroupId = (config: Config, base: string): string => uniqueIn(allGroupIds(config), base);

export const uniquePresetId = (config: Config, base: string): string => uniqueIn(allPresetIds(config), base);

/** Where a preset is still in use. Deleting one that is referenced would strand those stimuli. */
export function presetReferences(config: Config, id: string): { defaults: boolean; groups: string[] } {
  const groups: string[] = [];
  const walk = (g: Group): void => {
    if (g.stimuli.some((s) => s.envelope === id)) groups.push(g.id);
    g.children.forEach(walk);
  };
  config.groups.forEach(walk);
  return { defaults: config.defaults.envelope === id, groups };
}

/**
 * Renames the preset at `index` and every reference to it - `defaults.envelope` and each
 * stimulus that named it - so a rename lands as one config, never as a dangling reference.
 *
 * References are only rewritten when the OLD id was unique among the presets. Typing an id
 * passes through states where two presets share one (clear `default_slow`, type `default`),
 * and in those the other preset's users must not be dragged along: the preset itself is
 * renamed, everything pointing at the ambiguous id is left for the next keystroke to settle.
 */
export function renamePreset(config: Config, index: number, newId: string): Config {
  const preset = config.envelopes[index];
  if (!preset || preset.id === newId) return config;
  const oldId = preset.id;
  const envelopes = config.envelopes.map((e, i) => (i === index ? { ...e, id: newId } : e));
  if (config.envelopes.some((e, i) => i !== index && e.id === oldId)) return { ...config, envelopes };
  const renameGroup = (g: Group): Group => ({
    ...g,
    stimuli: g.stimuli.map((s) => (s.envelope === oldId ? { ...s, envelope: newId } : s)),
    children: g.children.map(renameGroup),
  });
  return {
    ...config,
    defaults: config.defaults.envelope === oldId ? { ...config.defaults, envelope: newId } : config.defaults,
    envelopes,
    groups: config.groups.map(renameGroup),
  };
}

export const groupAt = (config: Config, path: Path): Group | undefined => getAt<Group>(config, path);

export const stimulusAt = (config: Config, path: Path): Stimulus | undefined => getAt<Stimulus>(config, path);

/** The list a node lives in: `["groups", 2]` -> `["groups"]`. */
export const parentListPath = (path: Path): Path => path.slice(0, -1);

/** The group that owns a node: `[..., "stimuli", 0]` -> `[...]`. Empty for a root group. */
export const parentGroupPath = (path: Path): Path => path.slice(0, -2);

/**
 * The group a selected node belongs to: a stimulus resolves to the group that owns it, and
 * a group to itself. Only groups are tracks in the mixer and only groups have a level
 * series, so this is what the strip row, the timeline and the controls row all follow.
 */
export const groupPathFor = (path: Path): Path =>
  path[path.length - 2] === "stimuli" ? parentGroupPath(path) : path;

export const presetById = (config: Config, id: string | null | undefined): EnvelopePreset | undefined =>
  config.envelopes.find((e) => e.id === (id ?? config.defaults.envelope));

export function resolvedEnvelope(
  config: Config,
  s: Partial<EnvelopeOverrides> & { envelope?: string | null },
): Required<EnvelopeOverrides> {
  const p = presetById(config, s.envelope);
  const d = config.defaults;
  const pick = <T>(a: T | null | undefined, b: T | null | undefined, c: T): T => a ?? b ?? c;
  return {
    attack: pick(s.attack, p?.attack, 0),
    decay: pick(s.decay, p?.decay, 0),
    sustain: pick(s.sustain, p?.sustain, 1),
    release: pick(s.release, p?.release, 1800),
    impulse: pick(s.impulse, p?.impulse, false),
    retrigger: pick(s.retrigger, p?.retrigger, d.retrigger),
    stack: pick(s.stack, p?.stack, d.stack),
    unavailable: pick(s.unavailable, p?.unavailable, d.unavailable),
    debounce: pick(s.debounce, p?.debounce, d.debounce),
  };
}
