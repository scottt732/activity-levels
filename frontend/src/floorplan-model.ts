import {readArchitecture} from "./architecture";
import { readOpening } from "./room-openings";
import { readFixture } from "./room-fixtures";
import type { Kind } from "./kinds";
import type { ArchitecturalObject, Bounds, GroupLive, Path, SiteLayout, RoomOpening, RoomFixture } from "./types";

export interface ActivityFrame { now: number; groups: Record<string, Pick<GroupLive,"value" | "max_value"> & Partial<Pick<GroupLive,"last_activity">>> }
export interface FloorplanNode { architecture?:ArchitecturalObject[]; id: string; name: string | null; kind: Kind; bounds?: Bounds; points?: [number,number][]; children: FloorplanNode[]; fixtures?: RoomFixture[]; openings?:RoomOpening[] }
export interface FloorplanConfig { gps?: {rotation?:number}; site?: SiteLayout; groups: FloorplanNode[] }

export interface FloorplanGroup {
  id: string;
  label: string;
  kind: Kind;
  path: Path;
  ancestors: string[];
}
export interface ScenePart extends FloorplanGroup {
  architecture?:ArchitecturalObject[];
  footprint: [number, number][];
  low: number;
  high: number;
  container: boolean;
  openings?:RoomOpening[];
  fixtures?: RoomFixture[];
}
export interface FloorplanModel {
  parts: ScenePart[];
  groups: FloorplanGroup[];
  scopes: FloorplanGroup[];
  issues: { id: string; label: string; reason: string }[];
}
export interface ActivityReading {
  status: "live" | "missing" | "stale";
  value: number | null;
  max: number | null;
  ratio: number | null;
}
export const STALE_SECONDS = 10;

/** Missing/stale readings have no color intensity; zero is reserved for known inactivity. */
export function activityReading(live: ActivityFrame | null, id: string, now: number): ActivityReading {
  const group = live?.groups[id];
  const unknown = { value: null, max: null, ratio: null };
  if (!live || !group || !Number.isFinite(live.now) || !Number.isFinite(group.value) ||
      !Number.isFinite(group.max_value) || group.max_value <= 0) return { status: "missing", ...unknown };
  if (now - live.now > STALE_SECONDS) return { status: "stale", ...unknown };
  return { status: "live", value: group.value, max: group.max_value,
    ratio: Math.min(1, Math.max(0, group.value / group.max_value)) };
}

const finiteTuple = (value: unknown, size: number): value is number[] =>
  Array.isArray(value) && value.length === size && value.every((v) => typeof v === "number" && Number.isFinite(v));

/** A draft may not yet have passed server validation. Report bad geometry without crashing the editor. */
function polygon(value: unknown): [number, number][] | null {
  if (!Array.isArray(value) || value.length < 3 || value.length > 4096) return null;
  const result: [number, number][] = [];
  for (const point of value) {
    if (!finiteTuple(point, 2)) return null;
    const previous = result.at(-1);
    if (!previous || previous[0] !== point[0] || previous[1] !== point[1]) result.push([point[0]!, point[1]!]);
  }
  if (result.length > 1 && result[0]![0] === result.at(-1)![0] && result[0]![1] === result.at(-1)![1]) result.pop();
  if (result.length < 3) return null;
  const [x, y] = result[0]!;
  const area = result.reduce((sum, a, i) => {
    const b = result[(i + 1) % result.length]!;
    return sum + (a[0] - x) * (b[1] - y) - (b[0] - x) * (a[1] - y);
  }, 0);
  return Number.isFinite(area) && area !== 0 ? result : null;
}

export function floorplanModel(config: FloorplanConfig): FloorplanModel {
  const parts: ScenePart[] = [];
  const issues: FloorplanModel["issues"] = [];
  const entries: {group: FloorplanNode; path: Path; parent: FloorplanNode | null}[] = [];
  const visit = (groups: FloorplanNode[], path: Path, parent: FloorplanNode | null) => {
    groups.forEach((group, i) => { const here = [...path, i]; entries.push({group,path:here,parent}); visit(group.children, [...here,"children"], group); });
  };
  visit(config.groups, ["groups"], null);
  const all = new Map<string, FloorplanGroup>();
  const relevant = new Set<string>();
  for (const { group, path, parent } of entries) {
    const ancestors = parent ? [...all.get(parent.id)!.ancestors, parent.id] : [];
    const info = { id: group.id, label: group.name ?? group.id, kind: group.kind, path, ancestors };
    all.set(group.id, info);
    if (group.bounds === undefined && group.points === undefined) continue;
    [group.id, ...ancestors].forEach((id) => relevant.add(id));
    const invalid = (reason: string) => issues.push({ id: group.id, label: info.label, reason });
    const b = group.bounds;
    if (b === undefined) { invalid("Footprint has no vertical bounds. Add bounds in Code to place it in 3D."); continue; }
    if (!Array.isArray(b) || b.length !== 2 || !finiteTuple(b[0], 3) || !finiteTuple(b[1], 3) ||
        b[0].some((n, i) => n >= b[1][i]!)) { invalid("Invalid bounds in the draft."); continue; }
    const footprint = group.points === undefined
      ? [[b[0][0], b[0][1]], [b[1][0], b[0][1]], [b[1][0], b[1][1]], [b[0][0], b[1][1]]] as [number, number][]
      : polygon(group.points);
    if (!footprint) { invalid("Invalid footprint in the draft."); continue; }
    const fixtures=Array.isArray(group.fixtures) ? group.fixtures.slice(0,128).map(readFixture).filter(f=>f!==null) : [];
    if(group.fixtures!==undefined && (!Array.isArray(group.fixtures) || fixtures.length!==group.fixtures.length))
      invalid("Some device placements are invalid and could not be displayed.");
    const openings=Array.isArray(group.openings)?group.openings.slice(0,128).map(readOpening).filter(o=>o!==null):[];
    parts.push({ ...info, architecture:Array.isArray(group.architecture)?group.architecture.slice(0,128).map(readArchitecture).filter(o=>o!==null):[], openings, fixtures, footprint, low: b[0][2], high: b[1][2],
      container: ["property", "structure", "floor"].includes(group.kind) });
  }
  const groups = [...all.values()].filter((group) => relevant.has(group.id));
  return { parts, groups, issues, scopes: groups.filter((group) => ["property", "structure", "floor"].includes(group.kind)) };
}

/** Scope is a view filter, never a transformation of physical coordinates. */
export const inScope = <T extends { id: string; ancestors: string[] }>(parts: T[], id: string): T[] =>
  id ? parts.filter((part) => part.id === id || part.ancestors.includes(id)) : parts;
