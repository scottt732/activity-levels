import type { Path } from "./types";

/**
 * What a group is on the property, and the rules that follow from it. Pure, and imported
 * by both `model.ts` and `store.ts` — which is why it lives on its own: `model.ts` already
 * imports `store.ts`, so putting these there and reading them from the reducers would
 * close a cycle the bundler would have to guess its way out of.
 */

export type Kind = "property" | "structure" | "floor" | "area" | "outside";
export type Connection = "open" | "door" | "stairs" | "exterior_door";

/** Outermost first, which is the order the picker offers them in. */
export const KINDS: readonly Kind[] = ["property", "structure", "floor", "area", "outside"];

export const CONNECTIONS: readonly Connection[] = ["open", "door", "stairs", "exterior_door"];

/** A bare id in `adjacent` is a doorway: the commonest thing, so it is the default. */
export const DEFAULT_CONNECTION: Connection = "door";

export interface KindDef {
  label: string;
  icon: string;
  /** One line, rendered as the Identity panel's subtitle and under the kind picker. */
  definition: string;
}

export const KIND_DEFS: Record<Kind, KindDef> = {
  property: {
    label: "Property",
    icon: "mdi:home-city",
    definition: "The whole lot: everything you own, inside and out. Every configuration starts with one.",
  },
  structure: {
    label: "Structure",
    icon: "mdi:home",
    definition: "A building on the property — the house, a garage, a shed.",
  },
  floor: {
    label: "Floor",
    icon: "mdi:layers",
    definition: "One level of a structure. Bind it to a Home Assistant floor to reuse its name.",
  },
  area: {
    label: "Area",
    icon: "mdi:door",
    definition:
      "A room or zone people occupy. Bind it to a Home Assistant area to reuse its name and put its entities in the right place.",
  },
  outside: {
    label: "Outside",
    icon: "mdi:tree",
    definition: "An outdoor area — a yard, a patio, the driveway. Outside areas can lead off the property.",
  },
};

export const CONNECTION_LABELS: Record<Connection, string> = {
  open: "Open (no door)",
  door: "Door",
  stairs: "Stairs",
  exterior_door: "Exterior door",
};

/** The nesting table, mirroring `ALLOWED_CHILDREN` in `const.py`. */
export const ALLOWED_CHILDREN: Record<Kind, readonly Kind[]> = {
  property: ["property", "structure", "outside"],
  structure: ["floor", "area"],
  floor: ["area"],
  area: ["area"],
  outside: ["outside"],
};

/** Every root is a property. */
export const ROOT_KINDS: readonly Kind[] = ["property"];

/** The kinds a person can be in, and therefore the ones the room graph has states for. */
export const NODE_KINDS: ReadonlySet<Kind> = new Set<Kind>(["area", "outside"]);

/** What may go inside a group of this kind; `null` asks what may be a root. */
export const allowedChildKinds = (parent: Kind | null): readonly Kind[] =>
  parent === null ? ROOT_KINDS : ALLOWED_CHILDREN[parent];

/**
 * Whether `candidate` is inside `ancestor`. Compared step by step rather than by joining
 * to a string, because `groups/1` is a string prefix of `groups/10` and is not its parent.
 */
export function isDescendantPath(ancestor: Path, candidate: Path): boolean {
  if (candidate.length <= ancestor.length) return false;
  return ancestor.every((step, i) => candidate[i] === step);
}
