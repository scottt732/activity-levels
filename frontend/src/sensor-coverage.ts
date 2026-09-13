import type { RoomFixture, RoomOpening } from "./types";

type Point = [number, number, number];
type States = Record<string, { state: string }>;
export interface CoverageRoom {
  id: string;
  footprint: [number, number][];
  low: number;
  high: number;
  openings?: RoomOpening[];
}
export interface CoverageLobe { origin: Point; rim: Point[]; center: Point }
const EPS = 1e-6;
const RAD = Math.PI / 180;

function pointAt(start: Point, direction: Point, t: number): Point {
  return [start[0] + direction[0] * t, start[1] + direction[1] * t, start[2] + direction[2] * t];
}
function contains(room: CoverageRoom, point: Point): boolean {
  if (point[2] < room.low || point[2] > room.high) return false;
  let inside = false;
  const polygon = room.footprint;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!, b = polygon[j]!;
    if ((a[1] > point[1]) !== (b[1] > point[1]) &&
      point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
function onSegment(point: Point, a: [number, number], b: [number, number]): boolean {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const length = Math.hypot(dx, dy);
  if (length < EPS) return false;
  return Math.abs((point[0] - a[0]) * dy - (point[1] - a[1]) * dx) < EPS * length &&
    (point[0] - a[0]) * dx + (point[1] - a[1]) * dy >= -EPS &&
    (point[0] - b[0]) * dx + (point[1] - b[1]) * dy <= EPS;
}
function openingAllows(opening: RoomOpening, point: Point, states: States): boolean {
  const isOpen = opening.kind === "open_wall" || (opening.entity
    ? states[opening.entity]?.state === "on" : opening.open);
  if (!isOpen) return false;
  const dx = point[0] - opening.position[0], dy = point[1] - opening.position[1];
  const c = Math.cos(opening.yaw * RAD), s = Math.sin(opening.yaw * RAD);
  return Math.abs(-dx * s + dy * c) < EPS && Math.abs(dx * c + dy * s) <= opening.width / 2 + EPS &&
    point[2] >= opening.position[2] - EPS && point[2] <= opening.position[2] + opening.height + EPS;
}

/** Intersect a metric ray with room shells. Only configured open doorways or open walls
 * transmit it. Testing membership on both sides of every crossing handles concave rooms,
 * shared walls, and vertex hits without depending on polygon winding or wall order. */
export function clipCoverageRay(start: Point, direction: Point, range: number, rooms: CoverageRoom[], states: States = {}): Point {
  if (!(range > 0)) return [...start];
  const events = [0, range];
  for (const room of rooms) {
    if (Math.abs(direction[2]) > EPS) {
      for (const z of [room.low, room.high]) {
        const t = (z - start[2]) / direction[2];
        if (t >= 0 && t <= range) events.push(t);
      }
    }
    for (let i = 0; i < room.footprint.length; i++) {
      const a = room.footprint[i]!, b = room.footprint[(i + 1) % room.footprint.length]!;
      const ex = b[0] - a[0], ey = b[1] - a[1];
      const cross = direction[0] * ey - direction[1] * ex;
      if (Math.abs(cross) < EPS) continue;
      const ax = a[0] - start[0], ay = a[1] - start[1];
      const t = (ax * ey - ay * ex) / cross;
      const u = (ax * direction[1] - ay * direction[0]) / cross;
      if (t >= -EPS && t <= range && u >= -EPS && u <= 1 + EPS) events.push(Math.max(0, t));
    }
  }
  events.sort((a, b) => a - b);
  const crossings = events.filter((t, i) => i === 0 || t - events[i - 1]! > EPS);
  for (let i = 0; i < crossings.length - 1; i++) {
    const t = crossings[i]!;
    // Mid-interval samples avoid jumping through a thin room or an opening's edge.
    const after = pointAt(start, direction, (t + crossings[i + 1]!) / 2);
    const before = pointAt(start, direction, i ? (crossings[i - 1]! + t) / 2 : -EPS);
    const entering = rooms.filter(room => contains(room, after));
    const leaving = rooms.filter(room => contains(room, before) || (t === 0 &&
      start[2] >= room.low && start[2] <= room.high && room.footprint.some((a, edge) =>
        onSegment(start, a, room.footprint[(edge + 1) % room.footprint.length]!))));
    if (t === 0 && entering.length) continue;
    const changed = rooms.filter(room => entering.includes(room) !== leaving.includes(room));
    if (!changed.length) continue;
    const hit = pointAt(start, direction, t);
    // Floors and ceilings stay solid even where an opening reaches their edge.
    if (changed.some(room => Math.abs(direction[2]) > EPS &&
      (Math.abs(hit[2] - room.low) < EPS || Math.abs(hit[2] - room.high) < EPS))) return hit;
    // Either side may own a doorway on a shared wall; duplicating it is unnecessary.
    const openings = changed.flatMap(room => room.openings ?? []);
    for (const room of changed) {
      for (let edge = 0; edge < room.footprint.length; edge++) {
        const a = room.footprint[edge]!, b = room.footprint[(edge + 1) % room.footprint.length]!;
        if (!onSegment(hit, a, b)) continue;
        const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
        if (Math.abs(direction[0] * dy - direction[1] * dx) < EPS * length) continue;
        // A vertex may hit two walls at once. Opening only one of them cannot
        // transmit a ray through the other wall's solid corner.
        if (!openings.some(opening => Math.abs(Math.cos(opening.yaw * RAD) * dy -
          Math.sin(opening.yaw * RAD) * dx) < EPS * length && openingAllows(opening, hit, states))) return hit;
      }
    }
  }
  return pointAt(start, direction, range);
}

function direction(yaw: number, pitch: number): Point {
  return [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)];
}

/** The display envelope is sampled at equal angular steps, with radial distances in
 * meters. It is an illustration rather than a hardware detection guarantee. */
export function coverageRays(fixture: RoomFixture, rooms: CoverageRoom[], states: States = {}): CoverageLobe[] {
  if (fixture.range <= 0) return [];
  const lobe = (pitch: number, horizontal: number, vertical: number, range: number): CoverageLobe => ({
    origin: [...fixture.position],
    center: clipCoverageRay(fixture.position, direction(fixture.yaw * RAD, pitch * RAD), range, rooms, states),
    rim: Array.from({ length: 32 }, (_, i) => {
      const angle = i * Math.PI / 16;
      return clipCoverageRay(fixture.position, direction((fixture.yaw + Math.cos(angle) * horizontal / 2) * RAD,
        (pitch + Math.sin(angle) * vertical / 2) * RAD), range, rooms, states);
    }),
  });
  // A PIR fan has independent horizontal and downward extents. An elliptical
  // cone incorrectly narrows the downward coverage to a point along its centerline.
  const fan:CoverageLobe = {
    origin:[...fixture.position],
    center:clipCoverageRay(fixture.position,direction(fixture.yaw*RAD,(fixture.pitch-fixture.vertical_fov/2)*RAD),fixture.range,rooms,states),
    rim:Array.from({length:64},(_,i)=>{
      const side=Math.floor(i/16),t=(i%16)/16;
      const horizontal=side===0?-0.5+t:side===1?0.5:side===2?0.5-t:-0.5;
      const down=side===0?0:side===1?t:side===2?1:1-t;
      return clipCoverageRay(fixture.position,direction((fixture.yaw+horizontal*fixture.fov)*RAD,Math.max(-90,Math.min(90,fixture.pitch-down*fixture.vertical_fov))*RAD),fixture.range,rooms,states);
    }),
  };
  const lobes = [fixture.coverage_shape==="fan"?fan:lobe(fixture.pitch, fixture.fov, fixture.vertical_fov, fixture.range)];
  if (fixture.look_down) {
    const room = rooms.find(candidate => contains(candidate, fixture.position) ||
      (fixture.position[2] >= candidate.low && fixture.position[2] <= candidate.high &&
        candidate.footprint.some((a, i) => onSegment(fixture.position, a, candidate.footprint[(i + 1) % candidate.footprint.length]!))));
    const height = Math.max(0, fixture.position[2] - (room?.low ?? fixture.position[2]));
    // This separate near-field lobe illustrates enabled look-down coverage. Bosch's
    // segmented Fresnel pattern is not a measured continuous cone: these angles are
    // deliberately approximate, and the room floor clips the downward rays.
    if (height > 0) lobes.push(lobe(fixture.pitch - 70, Math.min(fixture.fov, 70), 30,
      Math.min(fixture.range, height / Math.sin(55 * RAD))));
  }
  return lobes;
}

/** Horizontal section at mounting height, using the same radial range and clipping
 * as the 3D envelope. The caller closes the returned fan back to its origin. */
export function coverageFootprint(fixture: RoomFixture, rooms: CoverageRoom[], states: States = {}): [number, number][] {
  if (fixture.range <= 0) return [];
  return [[fixture.position[0], fixture.position[1]], ...Array.from({ length: 33 }, (_, i): [number, number] => {
    const yaw = (fixture.yaw - fixture.fov / 2 + fixture.fov * i / 32) * RAD;
    const hit = clipCoverageRay(fixture.position, direction(yaw, 0), fixture.range, rooms, states);
    return [hit[0], hit[1]];
  })];
}
