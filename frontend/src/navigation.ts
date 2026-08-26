import { getAt } from "./store";
import type { Config, Group, Path } from "./types";

export interface MixerNav {
  busPath: Path;
  selection: Path | null;
}

export type NavAction =
  | { type: "open"; path: Path }
  | { type: "up" }
  | { type: "select"; path: Path | null }
  | { type: "arrow"; delta: 1 | -1; config: Config }
  | { type: "sync"; config: Config };

const pathEq = (a: Path, b: Path): boolean => a.length === b.length && a.every((v, i) => v === b[i]);

/** Strips a trailing `"children", <index>` pair, landing on the parent group's path. */
const parentBusPath = (busPath: Path): Path | null => (busPath.length >= 4 ? busPath.slice(0, -2) : null);

/**
 * The bus a selected node is shown on: a stimulus is a channel of the group that owns it,
 * and a group is the MASTER of its own bus, with its channels below it.
 */
export const busPathFor = (path: Path): Path => (path[path.length - 2] === "stimuli" ? path.slice(0, -2) : path);

export function initialNav(config: Config): MixerNav {
  const busPath: Path = config.groups.length > 0 ? ["groups", 0] : [];
  return { busPath, selection: busPath.length > 0 ? busPath : null };
}

/** Channel strips for a bus, in config order: stimuli first, then child (sub-bus) groups. */
export function channelPaths(config: Config, busPath: Path): Path[] {
  const group = getAt<Group>(config, busPath);
  if (!group) return [];
  const paths: Path[] = [];
  group.stimuli.forEach((_, i) => paths.push([...busPath, "stimuli", i]));
  group.children.forEach((_, j) => paths.push([...busPath, "children", j]));
  return paths;
}

function nearestExistingBusPath(config: Config, busPath: Path): Path {
  let p = busPath;
  while (p.length > 0) {
    if (getAt(config, p) !== undefined) return p;
    const parent = parentBusPath(p);
    if (parent === null) break;
    p = parent;
  }
  return initialNav(config).busPath;
}

export function reduce(nav: MixerNav, action: NavAction): MixerNav {
  switch (action.type) {
    case "open":
      return { busPath: action.path, selection: action.path };
    case "up": {
      const parent = parentBusPath(nav.busPath);
      return parent === null ? nav : { busPath: parent, selection: parent };
    }
    case "select":
      return { ...nav, selection: action.path };
    case "arrow": {
      const list = [...channelPaths(action.config, nav.busPath), nav.busPath];
      if (list.length === 0) return nav;
      const idx = nav.selection ? list.findIndex((p) => pathEq(p, nav.selection!)) : -1;
      const next = (((idx + action.delta) % list.length) + list.length) % list.length;
      return { ...nav, selection: list[next]! };
    }
    case "sync": {
      const { config } = action;
      const busPath =
        nav.busPath.length > 0 && getAt(config, nav.busPath) !== undefined
          ? nav.busPath
          : nearestExistingBusPath(config, nav.busPath);
      const selection = nav.selection !== null && getAt(config, nav.selection) !== undefined ? nav.selection : busPath;
      return { busPath, selection };
    }
  }
}

export function breadcrumb(config: Config, busPath: Path): { path: Path; label: string }[] {
  const crumbs: { path: Path; label: string }[] = [];
  for (let end = 2; end <= busPath.length; end += 2) {
    const path = busPath.slice(0, end);
    const group = getAt<Group>(config, path);
    if (!group) break;
    crumbs.push({ path, label: group.name ?? group.id });
  }
  return crumbs;
}
