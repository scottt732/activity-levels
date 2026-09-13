import { describe, expect, it } from "vitest";
import { clipCoverageRay, coverageFootprint, coverageRays, type CoverageRoom } from "../src/sensor-coverage";
import type { RoomFixture, RoomOpening } from "../src/types";

const room: CoverageRoom = { id: "room", footprint: [[0, 0], [4, 0], [4, 4], [0, 4]], low: 0, high: 3 };
const neighbor: CoverageRoom = { id: "next", footprint: [[4, 0], [8, 0], [8, 4], [4, 4]], low: 0, high: 3 };
const door: RoomOpening = { id: "door", name: "Door", kind: "interior_door", position: [4, 2, 0],
  yaw: 90, width: 1, height: 2.5, hinge: "left", swing: "in", open: true };
const fixture: RoomFixture = { entity: "binary_sensor.motion", name: "PIR", kind: "motion",
  position: [1, 2, 2.2], yaw: 0, pitch: 0, fov: 90, vertical_fov: 45, range: 12, mount: "wall", technology: "PIR" };

describe("coverage shell clipping", () => {
  it("clips walls, ceilings and floors and permits a wall-mounted sensor to aim inward", () => {
    expect(clipCoverageRay([2, 2, 1], [1, 0, 0], 12, [room])).toEqual([4, 2, 1]);
    expect(clipCoverageRay([2, 2, 1], [0, 0, 1], 12, [room])).toEqual([2, 2, 3]);
    expect(clipCoverageRay([2, 2, 1], [0, 0, -1], 12, [room])).toEqual([2, 2, 0]);
    expect(clipCoverageRay([0, 2, 1], [1, 0, 0], 12, [room])).toEqual([4, 2, 1]);
    expect(clipCoverageRay([0, 2, 1], [-1, 0, 0], 12, [room])).toEqual([0, 2, 1]);
  });
  it("crosses a shared doorway declared on either side, only when open", () => {
    const start: [number, number, number] = [2, 2, 1];
    expect(clipCoverageRay(start, [1, 0, 0], 12, [room, { ...neighbor, openings: [door] }])).toEqual([8, 2, 1]);
    expect(clipCoverageRay(start, [1, 0, 0], 12, [{ ...room, openings: [{ ...door, open: false }] }, neighbor])).toEqual([4, 2, 1]);
    const linked = { ...room, openings: [{ ...door, entity: "binary_sensor.door" }] };
    expect(clipCoverageRay(start, [1, 0, 0], 12, [linked, neighbor])).toEqual([4, 2, 1]);
    expect(clipCoverageRay(start, [1, 0, 0], 12, [linked, neighbor], { "binary_sensor.door": { state: "unavailable" } })).toEqual([4, 2, 1]);
    expect(clipCoverageRay(start, [1, 0, 0], 12, [linked, neighbor], { "binary_sensor.door": { state: "on" } })).toEqual([8, 2, 1]);
    expect(clipCoverageRay([2, 3, 1], [1, 0, 0], 12, [linked, neighbor], { "binary_sensor.door": { state: "on" } })).toEqual([4, 3, 1]);
  });
  it("permits open walls but clips above their lintel", () => {
    const open = { ...room, openings: [{ ...door, kind: "open_wall" as const, open: false }] };
    expect(clipCoverageRay([2, 2, 1], [1, 0, 0], 12, [open, neighbor])).toEqual([8, 2, 1]);
    expect(clipCoverageRay([2, 2, 2.8], [1, 0, 0], 12, [open, neighbor])).toEqual([4, 2, 2.8]);
  });
  it("stops at concave notches and exact corner hits", () => {
    const concave = { ...room, footprint: [[0, 0], [4, 0], [4, 1], [1, 1], [1, 4], [0, 4]] as [number, number][] };
    expect(clipCoverageRay([0.5, 2, 1], [1, 0, 0], 12, [concave])).toEqual([1, 2, 1]);
    const diagonal = Math.SQRT1_2;
    const hit = clipCoverageRay([2, 2, 1], [diagonal, diagonal, 0], 12, [room]);
    expect(hit[0]).toBeCloseTo(4);
    expect(hit[1]).toBeCloseTo(4);
    expect(clipCoverageRay([0, 0, 1], [diagonal, -diagonal, 0], 12, [room])).toEqual([0, 0, 1]);
    const cornerOpening = { ...door, position: [4, 4, 0] as [number, number, number] };
    const closedCorner = clipCoverageRay([2, 2, 1], [diagonal, diagonal, 0], 12,
      [{ ...room, openings: [cornerOpening] }]);
    expect(closedCorner[0]).toBeCloseTo(4);
    expect(closedCorner[1]).toBeCloseTo(4);
  });
  it("adds a separate approximate look-down lobe clipped at the floor", () => {
    const lobes = coverageRays({ ...fixture, look_down: true }, [room]);
    expect(lobes).toHaveLength(2);
    expect(lobes[1]!.center[2]).toBeCloseTo(0);
    expect(lobes[1]!.center[0]).toBeGreaterThan(fixture.position[0]);
    expect(lobes[1]!.rim.every(point => point[2] >= -1e-6)).toBe(true);
    expect(coverageRays(fixture, [room])).toHaveLength(1);
    expect(coverageRays({ ...fixture, range: 0 }, [room])).toEqual([]);
  });
  it("uses the same radial metric for the plan and 3D center", () => {
    const short = { ...fixture, range: 1 };
    const footprint = coverageFootprint(short, [room]);
    expect(footprint[17]).toEqual(coverageRays(short, [room])[0]!.center.slice(0, 2));
    for (const point of footprint.slice(1)) expect(Math.hypot(point[0] - 1, point[1] - 2)).toBeCloseTo(1);
  });
});


it("keeps downward fan coverage broad at floor level without upward rays",()=>{
 const fan=coverageRays({...fixture,coverage_shape:"fan",vertical_fov:75},[room])[0]!;
 expect(fan.rim.every(p=>p[2]<=fixture.position[2]+1e-6)).toBe(true);
 const floor=fan.rim.filter(p=>Math.abs(p[2])<1e-6);
 expect(floor.length).toBeGreaterThan(16);
 expect(Math.max(...floor.map(p=>p[1]))-Math.min(...floor.map(p=>p[1]))).toBeGreaterThan(1);
});
