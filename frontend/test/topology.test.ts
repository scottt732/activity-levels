import { describe, expect, it } from "vitest";
import { COL_W, PAD, ROW_H, edgeBetween, edgePoint, layout, pathEdges } from "../src/topology";
import { roomsConfig } from "./fixtures";
import type { TopologyPayload } from "../src/types";

const TOPO: TopologyPayload = {
  nodes: ["kitchen", "dining_room", "hall", "bedroom", "back_patio"],
  edges: [
    ["kitchen", "dining_room", false],
    ["kitchen", "back_patio", false],
    ["dining_room", "hall", false],
    ["hall", "bedroom", true],
  ],
  exits: ["back_patio"],
};

describe("layout", () => {
  it("puts every room of one top-level branch on one row, in pre-order", () => {
    const map = layout(roomsConfig(), TOPO);
    expect(map.nodes.map((n) => n.id)).toEqual(TOPO.nodes);
    expect(new Set(map.nodes.map((n) => n.row))).toEqual(new Set([0]));
    expect(map.nodes.map((n) => n.col)).toEqual([0, 1, 2, 3, 4]);
    expect(map.nodes[0]).toMatchObject({ x: PAD, y: PAD, exit: false });
    expect(map.nodes[1]!.x).toBe(PAD + COL_W);
    expect(map.nodes[4]!.exit).toBe(true);
  });

  it("gives each depth-1 branch its own row", () => {
    const config = roomsConfig();
    config.groups[0]!.children.push({
      ...config.groups[0]!.children[0]!,
      id: "outside",
      name: "Outside",
      children: [
        { ...config.groups[0]!.children[0]!.children[4]!, id: "drive", name: "Drive", exit: true },
      ],
    });
    const map = layout(config, { ...TOPO, nodes: [...TOPO.nodes, "drive"], exits: ["back_patio", "drive"] });
    expect(map.nodes.find((n) => n.id === "drive")!.row).toBe(1);
    expect(map.height).toBe(PAD * 2 + ROW_H);
  });

  it("is deterministic", () => {
    expect(layout(roomsConfig(), TOPO)).toEqual(layout(roomsConfig(), TOPO));
  });

  it("uses the group's friendly name", () => {
    expect(layout(roomsConfig(), TOPO).nodes[1]!.label).toBe("Dining Room");
  });

  it("drops an edge whose endpoint is not on the map", () => {
    const map = layout(roomsConfig(), { ...TOPO, edges: [...TOPO.edges, ["kitchen", "atlantis", false]] });
    expect(map.edges).toHaveLength(4);
  });

  it("finds an edge in either orientation, and points along it", () => {
    const map = layout(roomsConfig(), TOPO);
    expect(edgeBetween(map, "dining_room", "kitchen")).toBeDefined();
    const edge = edgeBetween(map, "kitchen", "dining_room")!;
    expect(edgePoint(edge, 0.5)).toEqual({ x: PAD + COL_W / 2, y: PAD });
  });

  it("walks a path into its edges", () => {
    const map = layout(roomsConfig(), TOPO);
    expect(pathEdges(map, ["kitchen", "dining_room", "hall"])).toHaveLength(2);
    expect(pathEdges(map, ["kitchen", "bedroom"])).toHaveLength(0);
  });

  it("survives an empty graph", () => {
    const map = layout(roomsConfig(), { nodes: [], edges: [], exits: [] });
    expect(map.nodes).toEqual([]);
    expect(map.width).toBe(PAD * 2);
  });
});
