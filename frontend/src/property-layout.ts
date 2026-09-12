import type { Config, Gps, Group } from "./types";
import { walkGroups } from "./model";

const R = 6378137;
const RAD = Math.PI / 180;
export type Point = [number, number];

export function validOrigin(gps: Gps): boolean {
  return Number.isFinite(gps.latitude) && Math.abs(gps.latitude) < 85 &&
    Number.isFinite(gps.longitude) && Math.abs(gps.longitude) <= 180 &&
    Number.isFinite(gps.rotation ?? 0) && Number.isFinite(gps.elevation ?? 0);
}

/** Local metres remain independent of the map's display projection and zoom. */
export function localToGeo([x, y]: Point, gps: Gps): Point {
  const a = (gps.rotation ?? 0) * RAD;
  const east = x * Math.cos(a) - y * Math.sin(a);
  const north = x * Math.sin(a) + y * Math.cos(a);
  return [gps.longitude + east / (R * Math.cos(gps.latitude * RAD)) / RAD,
    gps.latitude + north / R / RAD];
}
export function geoToLocal([lon, lat]: Point, gps: Gps): Point {
  const east = (lon - gps.longitude) * RAD * R * Math.cos(gps.latitude * RAD);
  const north = (lat - gps.latitude) * RAD * R;
  const a = (gps.rotation ?? 0) * RAD;
  return [east * Math.cos(a) + north * Math.sin(a), -east * Math.sin(a) + north * Math.cos(a)];
}
export function mapPixel([lon, lat]: Point, zoom: number): Point {
  const size = 256 * 2 ** zoom;
  const sine = Math.sin(Math.max(-85, Math.min(85, lat)) * RAD);
  return [(lon + 180) / 360 * size, (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size];
}
export function pixelGeo([x, y]: Point, zoom: number): Point {
  const size = 256 * 2 ** zoom;
  return [x / size * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * y / size))) / RAD];
}

export function footprint(group: Group): Point[] {
  if (group.points) return group.points;
  if (!group.bounds) return [];
  const [[x0, y0], [x1, y1]] = group.bounds;
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
}

/** A rigid placement updates absolute coordinates throughout the subtree once.
 * Materialize box footprints before rotating; their new bounds alone would enlarge them. */
export function placeStructure(config: Config, id: string, dx: number, dy: number, degrees: number): Config {
  if (![dx, dy, degrees].every(Number.isFinite)) throw new Error("Placement needs finite numbers.");
  const next = structuredClone(config);
  const group = walkGroups(next).find(entry => entry.group.id === id)?.group;
  if (!group || group.kind !== "structure" || !group.bounds) throw new Error("Choose a structure with dimensions.");
  const [[x0, y0], [x1, y1]] = group.bounds;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, a = degrees * RAD;
  const visit = (node: Group) => {
    const polygon = footprint(node);
    if (polygon.length) {
      node.points = polygon.map(([x, y]) => [cx + dx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a),
        cy + dy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
      if (node.bounds) {
        const xs = node.points.map(p => p[0]), ys = node.points.map(p => p[1]);
        node.bounds = [[Math.min(...xs), Math.min(...ys), node.bounds[0][2]],
          [Math.max(...xs), Math.max(...ys), node.bounds[1][2]]];
      }
    }
    node.children.forEach(visit);
  };
  visit(group);
  return next;
}

export function parsePolygon(text: string): Point[] {
  const rows = text.trim().split(/\n/).filter(Boolean);
  const points = rows.map(row => row.trim().split(/[,\s]+/).map(Number));
  if (points.length < 3 || points.length > 4096 || points.some(p => p.length !== 2 || !p.every(Number.isFinite)))
    throw new Error("Enter at least three X,Y coordinate pairs, one per line.");
  const area = points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length]!;
    return sum + p[0]! * q[1]! - q[0]! * p[1]!;
  }, 0);
  if (!Number.isFinite(area) || Math.abs(area) < 1e-8) throw new Error("The outline must enclose an area.");
  return points as Point[];
}
