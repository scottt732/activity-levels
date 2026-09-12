import type { Config, Group, RoomFixture } from "./types";
import { walkGroups } from "./model";

export function newFixture(entity = "", kind: RoomFixture["kind"] = "motion"): RoomFixture {
  return {entity, kind, name:"", position:[0,0,0], yaw:0, pitch:0, fov:60,
    vertical_fov:45, range:0, mount:"", technology:""};
}
export function fixtureDirection(fixture: RoomFixture): [number,number,number] {
  const yaw=fixture.yaw*Math.PI/180, pitch=fixture.pitch*Math.PI/180;
  // Local +X is yaw zero; +90 points along +Y. Three.js uses Y up and -Z north.
  return [Math.cos(yaw)*Math.cos(pitch), Math.sin(pitch), -Math.sin(yaw)*Math.cos(pitch)];
}
export function saveFixture(config: Config, room: string, fixture: RoomFixture, original?: string): Config {
  const next=structuredClone(config), group=walkGroups(next).find(e=>e.group.id===room)?.group;
  if (!group?.bounds) throw new Error("Choose a placed room.");
  if (!/^(binary_sensor|light)\.[a-z0-9_]+$/.test(fixture.entity) || fixture.entity.startsWith("light.") !== (fixture.kind==="light"))
    throw new Error("Choose a binary sensor for motion/occupancy or a light entity for a light.");
  if (![...fixture.position,fixture.yaw,fixture.pitch,fixture.fov,fixture.vertical_fov,fixture.range].every(Number.isFinite) ||
      Math.abs(fixture.yaw)>360 || Math.abs(fixture.pitch)>90 || fixture.range<0 || fixture.range>100 ||
      fixture.fov<1 || fixture.fov>170 || fixture.vertical_fov<1 || fixture.vertical_fov>170)
    throw new Error("Check position, angles, field of view (1–170°), and range (0–100 m).");
  if (!insideRoom(group,fixture.position)) throw new Error("Place the device inside this room, including its floor-to-ceiling height.");
  const fixtures=group.fixtures ?? [];
  if (fixtures.some(f=>f.entity===fixture.entity && f.entity!==original)) throw new Error("This entity already has a placement in the room.");
  const index=fixtures.findIndex(f=>f.entity===original);
  if (index<0 && fixtures.length>=128) throw new Error("Maximum 128 placements per room.");
  group.fixtures=index<0 ? [...fixtures,structuredClone(fixture)] : fixtures.map((f,i)=>i===index?structuredClone(fixture):f);
  return next;
}
export function insideRoom(group: Pick<Group,"points"|"bounds">, [x,y,z]: [number,number,number]): boolean {
  const b=group.bounds;
  if (!b || z<b[0][2]-1e-6 || z>b[1][2]+1e-6) return false;
  const points=group.points ?? [[b[0][0],b[0][1]],[b[1][0],b[0][1]],[b[1][0],b[1][1]],[b[0][0],b[1][1]]];
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++) {
    const a=points[j]!, c=points[i]!;
    const cross=(x-a[0]!)*(c[1]!-a[1]!)-(y-a[1]!)*(c[0]!-a[0]!);
    if(Math.abs(cross)<1e-6 && x>=Math.min(a[0]!,c[0]!)-1e-6 && x<=Math.max(a[0]!,c[0]!)+1e-6 && y>=Math.min(a[1]!,c[1]!)-1e-6 && y<=Math.max(a[1]!,c[1]!)+1e-6) return true;
    if((a[1]!>y)!==(c[1]!>y) && x<(c[0]!-a[0]!)*(y-a[1]!)/(c[1]!-a[1]!)+a[0]!) inside=!inside;
  }
  return inside;
}

/** A Code-tab draft may not yet have gone through backend normalization. */
export function readFixture(value: unknown): RoomFixture | null {
  if(!value || typeof value!=="object") return null;
  const fixture={...newFixture(),...value} as RoomFixture;
  if(typeof fixture.entity!=="string" || !/^(binary_sensor|light)\.[a-z0-9_]+$/.test(fixture.entity) ||
    !["motion","occupancy","light"].includes(fixture.kind) || fixture.entity.startsWith("light.")!==(fixture.kind==="light") ||
    !Array.isArray(fixture.position) || fixture.position.length!==3 ||
    ![...fixture.position,fixture.yaw,fixture.pitch,fixture.fov,fixture.vertical_fov,fixture.range].every(v=>typeof v==="number" && Number.isFinite(v)) ||
    Math.abs(fixture.yaw)>360 || Math.abs(fixture.pitch)>90 || fixture.fov<1 || fixture.fov>170 ||
    fixture.vertical_fov<1 || fixture.vertical_fov>170 || fixture.range<0 || fixture.range>100 ||
    typeof fixture.name!=="string" || typeof fixture.mount!=="string" || typeof fixture.technology!=="string") return null;
  return fixture;
}
