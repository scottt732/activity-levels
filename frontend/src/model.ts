import { getAt } from "./store";
import type { Config, EnvelopeOverrides, EnvelopePreset, Group, Path, Stimulus } from "./types";

export const newGroup = (id: string): Group => ({
  id,
  name: null,
  area: null,
  mix: "sum",
  null_handling: "zero",
  max_value: null,
  precision: null,
  gain: 1,
  stimuli: [],
  children: [],
});

export const newStimulus = (entity: string): Stimulus => ({
  entity,
  to: ["on"],
  gain: 1,
  key: null,
  envelope: null,
  attack: null,
  decay: null,
  sustain: null,
  release: null,
  impulse: null,
  retrigger: null,
  unavailable: null,
  debounce: null,
});

export function allGroupIds(config: Config): Set<string> {
  const ids = new Set<string>();
  const walk = (g: Group): void => {
    ids.add(g.id);
    g.children.forEach(walk);
  };
  config.groups.forEach(walk);
  return ids;
}

export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^[^a-z]+/, "");
  return s || "group";
}

export function uniqueGroupId(config: Config, base: string): string {
  const ids = allGroupIds(config);
  const slug = slugify(base);
  if (!ids.has(slug)) return slug;
  let n = 2;
  while (ids.has(`${slug}_${n}`)) n++;
  return `${slug}_${n}`;
}

export const groupAt = (config: Config, path: Path): Group | undefined => getAt<Group>(config, path);

export const stimulusAt = (config: Config, path: Path): Stimulus | undefined => getAt<Stimulus>(config, path);

/** The list a node lives in: `["groups", 2]` -> `["groups"]`. */
export const parentListPath = (path: Path): Path => path.slice(0, -1);

/** The group that owns a node: `[..., "stimuli", 0]` -> `[...]`. Empty for a root group. */
export const parentGroupPath = (path: Path): Path => path.slice(0, -2);

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
    unavailable: pick(s.unavailable, p?.unavailable, d.unavailable),
    debounce: pick(s.debounce, p?.debounce, d.debounce),
  };
}
