import { allGroupIds } from "./model";
import { getAt } from "./store";
import type { Config, Group, Path } from "./types";

/**
 * Which groups the mixer row has open, and which track is selected.
 *
 * The row is one flat list, Ableton track-group style: every group is a track, and a group
 * with children hides or shows them in place. Expansion is keyed by group **id** rather
 * than by path so that reordering the tree does not silently open a different branch.
 */
export interface MixerNav {
  expanded: Set<string>;
  selection: Path | null;
}

/** One track of the row: a group, and what the strip needs to draw itself. */
export interface VisibleTrack {
  path: Path;
  id: string;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

export type NavAction =
  | { type: "toggle"; id: string }
  | { type: "select"; path: Path | null }
  | { type: "arrow"; delta: 1 | -1; config: Config }
  | { type: "home"; config: Config }
  | { type: "end"; config: Config }
  | { type: "sync"; config: Config };

/** Where the open groups survive a reload; per browser, never per config. */
export const EXPANDED_KEY = "activity_levels.mixer.expanded";

const pathEq = (a: Path, b: Path): boolean => a.length === b.length && a.every((v, i) => v === b[i]);

const firstRoot = (config: Config): Path | null => (config.groups.length > 0 ? ["groups", 0] : null);

/** Every root open, the left-most one selected: the whole tree at a glance. */
export function initialNav(config: Config): MixerNav {
  return { expanded: new Set(config.groups.map((g) => g.id)), selection: firstRoot(config) };
}

/**
 * The row, as a pre-order walk of the tree that descends only into open groups. A group
 * with no children is never "expanded", however its id got into the set - there is nothing
 * for a chevron to open.
 */
export function visibleTracks(config: Config, nav: MixerNav): VisibleTrack[] {
  const tracks: VisibleTrack[] = [];
  const walk = (groups: Group[], base: Path, depth: number): void => {
    groups.forEach((group, i) => {
      const path: Path = [...base, i];
      const hasChildren = group.children.length > 0;
      const expanded = hasChildren && nav.expanded.has(group.id);
      tracks.push({ path, id: group.id, depth, hasChildren, expanded });
      if (expanded) walk(group.children, [...path, "children"], depth + 1);
    });
  };
  walk(config.groups, ["groups"], 0);
  return tracks;
}

export function reduce(nav: MixerNav, action: NavAction): MixerNav {
  switch (action.type) {
    case "toggle": {
      const expanded = new Set(nav.expanded);
      if (!expanded.delete(action.id)) expanded.add(action.id);
      return { ...nav, expanded };
    }
    case "select":
      return { ...nav, selection: action.path };
    case "arrow": {
      const list = visibleTracks(action.config, nav);
      if (list.length === 0) return nav;
      const selection = nav.selection;
      const found = selection === null ? -1 : list.findIndex((t) => pathEq(t.path, selection));
      // Nothing selected (or nothing visible under it): the row is entered from the end the
      // arrow came from, so right lands on the first track and left on the last.
      const from = found === -1 && action.delta < 0 ? list.length : found;
      const next = (((from + action.delta) % list.length) + list.length) % list.length;
      return { ...nav, selection: list[next]!.path };
    }
    case "home":
    case "end": {
      const list = visibleTracks(action.config, nav);
      if (list.length === 0) return nav;
      return { ...nav, selection: (action.type === "home" ? list[0] : list[list.length - 1])!.path };
    }
    case "sync": {
      const { config } = action;
      const known = allGroupIds(config);
      const kept = [...nav.expanded].filter((id) => known.has(id));
      // The set is shared when nothing was dropped: an edit per keystroke must not hand
      // every strip a new identity to diff against.
      const expanded = kept.length === nav.expanded.size ? nav.expanded : new Set(kept);
      const selection =
        nav.selection !== null && getAt(config, nav.selection) !== undefined ? nav.selection : firstRoot(config);
      return { expanded, selection };
    }
  }
}

/**
 * Opens whatever it takes for `path` to be a visible track - every group strictly above it,
 * which for a stimulus means the group that owns it and everything above that. The set
 * itself comes back when nothing had to open, so this is safe to call on every selection.
 */
export function expandTo(config: Config, expanded: Set<string>, path: Path | null): Set<string> {
  if (path === null) return expanded;
  // A stimulus is not a track; what has to be reachable is the group that owns it.
  const target = path[path.length - 2] === "stimuli" ? path.slice(0, -2) : path;
  const next = new Set(expanded);
  let opened = false;
  for (let end = 2; end + 2 <= target.length; end += 2) {
    const group = getAt<Group>(config, target.slice(0, end));
    if (group === undefined || typeof group.id !== "string") break;
    if (!next.has(group.id)) {
      next.add(group.id);
      opened = true;
    }
  }
  return opened ? next : expanded;
}

/**
 * The open groups this browser last saw, or `null` for "nothing usable stored". Ids the
 * config no longer knows are dropped rather than kept as ghosts, and storage that is
 * disabled, empty or full of something else reads as nothing stored - a mixer that will
 * not open because of a stale key is worse than one that forgets.
 */
export function loadExpanded(config: Config): Set<string> | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(EXPANDED_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const known = allGroupIds(config);
    return new Set(parsed.filter((id): id is string => typeof id === "string" && known.has(id)));
  } catch {
    return null;
  }
}

/** Remembers the open groups. Best effort: a full or disabled store just forgets. */
export function saveExpanded(expanded: Set<string>): void {
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify([...expanded]));
  } catch {
    /* storage disabled or full: the expansion still applies to this session */
  }
}

/** {@link initialNav}, with the expansion this browser was left with when there is one. */
export function restoreNav(config: Config): MixerNav {
  const nav = initialNav(config);
  const stored = loadExpanded(config);
  return stored === null ? nav : { ...nav, expanded: stored };
}
