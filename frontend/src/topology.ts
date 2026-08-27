import type { Config, Group, TopologyPayload } from "./types";

/**
 * Deterministic geometry for the room graph. A row per top-level branch, in tree order;
 * rooms in pre-order across it. No force layout, no randomness: the map has to look the
 * same every time it is drawn, because people navigate by where things were last time.
 */

export const COL_W = 160;
export const ROW_H = 110;
export const PAD = 60;
export const NODE_W = 120;
export const NODE_H = 54;

export interface MapNode {
  id: string;
  label: string;
  row: number;
  col: number;
  x: number;
  y: number;
  exit: boolean;
}

export interface MapEdge {
  a: string;
  b: string;
  oneWay: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MapLayout {
  nodes: MapNode[];
  edges: MapEdge[];
  width: number;
  height: number;
}

/**
 * Every group in pre-order, tagged with the branch whose row it belongs on: itself for a
 * root or a root's child, and its ancestor's tag below that. "Downstairs" and "Upstairs"
 * therefore get a row each, which is how a house actually reads.
 */
export function branchRows(config: Config): { id: string; label: string; branch: string }[] {
  const out: { id: string; label: string; branch: string }[] = [];
  const walk = (group: Group, depth: number, branch: string): void => {
    const tag = depth <= 1 ? group.id : branch;
    out.push({ id: group.id, label: group.name ?? group.id, branch: tag });
    group.children.forEach((child) => walk(child, depth + 1, tag));
  };
  config.groups.forEach((group) => walk(group, 0, group.id));
  return out;
}

export function layout(config: Config, topology: TopologyPayload): MapLayout {
  const rooms = new Set(topology.nodes);
  const exits = new Set(topology.exits);
  const rows: string[][] = [];
  const rowOf = new Map<string, number>();
  const labels = new Map<string, string>();
  for (const entry of branchRows(config)) {
    labels.set(entry.id, entry.label);
    if (!rooms.has(entry.id)) continue;
    let index = rowOf.get(entry.branch);
    if (index === undefined) {
      index = rows.length;
      rowOf.set(entry.branch, index);
      rows.push([]);
    }
    rows[index]!.push(entry.id);
  }
  const nodes: MapNode[] = [];
  rows.forEach((ids, row) =>
    ids.forEach((id, col) =>
      nodes.push({
        id,
        label: labels.get(id) ?? id,
        row,
        col,
        x: PAD + col * COL_W,
        y: PAD + row * ROW_H,
        exit: exits.has(id),
      }),
    ),
  );
  const at = new Map(nodes.map((n) => [n.id, n]));
  const edges: MapEdge[] = [];
  for (const [a, b, oneWay] of topology.edges) {
    const from = at.get(a);
    const to = at.get(b);
    // an edge to something the map does not draw
    if (!from || !to) continue;
    edges.push({ a, b, oneWay, x1: from.x, y1: from.y, x2: to.x, y2: to.y });
  }
  const cols = rows.reduce((most, row) => Math.max(most, row.length), 1);
  return {
    nodes,
    edges,
    width: PAD * 2 + (cols - 1) * COL_W,
    height: PAD * 2 + (Math.max(rows.length, 1) - 1) * ROW_H,
  };
}

/** A point a fraction of the way along an edge: where a person in transit is drawn. */
export const edgePoint = (edge: MapEdge, f: number): { x: number; y: number } => ({
  x: edge.x1 + (edge.x2 - edge.x1) * f,
  y: edge.y1 + (edge.y2 - edge.y1) * f,
});

export const nodeById = (map: MapLayout, id: string): MapNode | undefined =>
  map.nodes.find((n) => n.id === id);

/** The edge between two rooms, in whichever orientation the map holds it. */
export const edgeBetween = (map: MapLayout, a: string, b: string): MapEdge | undefined =>
  map.edges.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));

/** The edges a route walks along, for highlighting one. */
export function pathEdges(map: MapLayout, path: readonly string[]): MapEdge[] {
  const out: MapEdge[] = [];
  for (let i = 1; i < path.length; i++) {
    const edge = edgeBetween(map, path[i - 1]!, path[i]!);
    if (edge) out.push(edge);
  }
  return out;
}
