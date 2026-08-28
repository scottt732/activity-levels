import { pathKey } from "./errors";
import type { Config, Group, Path, Stimulus } from "./types";

/**
 * The tree as a list. Rendering rows rather than nested panels is what lets the whole tree
 * share one drag-and-drop surface, one keyboard order and one action column — and it is
 * why this is a pure function with its own tests rather than a template with recursion in it.
 */
export interface Row {
  path: Path;
  depth: number;
  kind: "group" | "stimulus" | "placeholder";
  group?: Group;
  stimulus?: Stimulus;
  /** Whether there is anything under it to open. A leaf gets no caret, not a disabled one. */
  expandable: boolean;
  expanded: boolean;
  /** Where this row sits among the siblings sharing its level, and how many of them there are. */
  posinset: number;
  setsize: number;
}

export function flattenRows(config: Config, expanded: ReadonlySet<string>): Row[] {
  const rows: Row[] = [];
  const walk = (group: Group, path: Path, depth: number, posinset: number, setsize: number): void => {
    const key = pathKey(path);
    const expandable = group.children.length > 0 || group.stimuli.length > 0;
    const open = expandable && expanded.has(key);
    rows.push({ path, depth, kind: "group", group, expandable, expanded: open, posinset, setsize });
    if (!expanded.has(key)) return;
    // Child groups and stimuli share a level, so they share one numbering: the groups come
    // first, and a stimulus counts from where they leave off.
    const size = group.children.length + group.stimuli.length;
    group.children.forEach((child, i) => walk(child, [...path, "children", i], depth + 1, i + 1, size));
    group.stimuli.forEach((stimulus, i) =>
      rows.push({
        path: [...path, "stimuli", i],
        depth: depth + 1,
        kind: "stimulus",
        stimulus,
        expandable: false,
        expanded: false,
        posinset: group.children.length + i + 1,
        setsize: size,
      }),
    );
    // The placeholder is for a group that is open and holds nothing at all — not for one
    // whose stimuli list happens to be empty while it has children.
    if (!expandable)
      rows.push({
        path,
        depth: depth + 1,
        kind: "placeholder",
        group,
        expandable: false,
        expanded: false,
        posinset: 1,
        setsize: 1,
      });
  };
  config.groups.forEach((group, i) => walk(group, ["groups", i], 0, i + 1, config.groups.length));
  return rows;
}

export const EXPANDED_KEY = "activity_levels.groups_expanded";

/** Which rows were open last time. Per browser, like the mixer's own expansion. */
export function loadExpanded(): Set<string> {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    const parsed: unknown = raw === null ? null : JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((p): p is string => typeof p === "string"));
  } catch {
    /* unreadable or unparsable storage: everything starts closed, which is not a failure */
    return new Set();
  }
}

export function saveExpanded(expanded: ReadonlySet<string>): void {
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify([...expanded]));
  } catch {
    /* storage disabled or full: the expansion still applies to this session */
  }
}
