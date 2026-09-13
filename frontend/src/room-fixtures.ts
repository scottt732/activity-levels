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

/** Snap a window's center to the nearest wall and align its width with that wall. */
export function snapWindow(group: Pick<Group,"points"|"bounds">, position: [number,number,number], width=1): {position:[number,number,number];yaw:number} {
  const b=group.bounds;
  if(!b)return {position,yaw:0};
  const points=group.points ?? [[b[0][0],b[0][1]],[b[1][0],b[0][1]],[b[1][0],b[1][1]],[b[0][0],b[1][1]]];
  let best={position,yaw:0},distance=Infinity;
  points.forEach((a,i)=>{
    const c=points[(i+1)%points.length]!,dx=c[0]-a[0],dy=c[1]-a[1],length=dx*dx+dy*dy;
    if(!length)return;
    const margin=Math.min(0.5,width/(2*Math.sqrt(length)));
    const t=Math.max(margin,Math.min(1-margin,((position[0]-a[0])*dx+(position[1]-a[1])*dy)/length));
    const x=a[0]+t*dx,y=a[1]+t*dy,d=Math.hypot(x-position[0],y-position[1]);
    if(d<distance){distance=d;best={position:[x,y,position[2]],yaw:Math.atan2(dy,dx)*180/Math.PI};}
  });
  return best;
}

export function fixtureAppearance(kind:RoomFixture["kind"],state?:string):{color:string;opacity:number} {
  if(state!=="on" && state!=="off")return {color:"#7a8790",opacity:0};
  return {color:state==="on"?(kind==="light"?"#ffce62":"#ff3535"):"#53b6ce",opacity:state==="on"?0.16:0};
}
export function saveFixture(config: Config, room: string, fixture: RoomFixture, original?: string): Config {
  const next=structuredClone(config), group=walkGroups(next).find(e=>e.group.id===room)?.group;
  if (!group?.bounds) throw new Error("Choose a placed room.");
  if (!/^(binary_sensor|light)\.[a-z0-9_]+$/.test(fixture.entity) || fixture.entity.startsWith("light.") !== (fixture.kind==="light"))
    throw new Error("Choose a binary sensor for motion/occupancy/window or a light entity for a light.");
  if (![...fixture.position,fixture.yaw,fixture.pitch,fixture.fov,fixture.vertical_fov,fixture.range].every(Number.isFinite) ||
      Math.abs(fixture.yaw)>360 || Math.abs(fixture.pitch)>90 || fixture.range<0 || fixture.range>100 ||
      fixture.fov<1 || fixture.fov>170 || fixture.vertical_fov<1 || fixture.vertical_fov>170)
    throw new Error("Check position, angles, field of view (1–170°), and range (0–100 m).");
  if (!insideRoom(group,fixture.position)) throw new Error("Place the device inside this room, including its floor-to-ceiling height.");
  if(!readFixture(fixture))throw new Error("Check device type and window dimensions (0.1–20 m).");
  if(fixture.kind==="window") {
    const halfHeight=(fixture.height ?? 1.2)/2;
    if(fixture.position[2]-halfHeight<group.bounds[0][2] || fixture.position[2]+halfHeight>group.bounds[1][2])
      throw new Error("Keep the whole window between the floor and ceiling; height is measured at its center.");
    const snapped=snapWindow(group,fixture.position,fixture.width ?? 1);
    if(Math.hypot(snapped.position[0]-fixture.position[0],snapped.position[1]-fixture.position[1])>0.01 || Math.abs(Math.sin((snapped.yaw-fixture.yaw)*Math.PI/180))>0.001)
      throw new Error("Place and align the whole window on a wall using the 2D plan.");
    const halfWidth=(fixture.width ?? 1)/2,angle=fixture.yaw*Math.PI/180;
    if(![-1,1].every(sign=>insideRoom(group,[fixture.position[0]+sign*halfWidth*Math.cos(angle),fixture.position[1]+sign*halfWidth*Math.sin(angle),fixture.position[2]])))
      throw new Error("The window is wider than this wall. Reduce its width.");
  }
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
    !["motion","occupancy","light","window"].includes(fixture.kind) || fixture.entity.startsWith("light.")!==(fixture.kind==="light") ||
    !Array.isArray(fixture.position) || fixture.position.length!==3 ||
    ![...fixture.position,fixture.yaw,fixture.pitch,fixture.fov,fixture.vertical_fov,fixture.range].every(v=>typeof v==="number" && Number.isFinite(v)) ||
    Math.abs(fixture.yaw)>360 || Math.abs(fixture.pitch)>90 || fixture.fov<1 || fixture.fov>170 ||
    fixture.vertical_fov<1 || fixture.vertical_fov>170 || fixture.range<0 || fixture.range>100 ||
    typeof fixture.name!=="string" || typeof fixture.mount!=="string" || typeof fixture.technology!=="string") return null;
  if(fixture.coverage_shape!==undefined && !["cone","fan"].includes(fixture.coverage_shape))return null;
  if(fixture.look_down!==undefined && typeof fixture.look_down!=="boolean")return null;
  if([fixture.width,fixture.height].some(v=>v!==undefined && (typeof v!=="number" || !Number.isFinite(v) || v<0.1 || v>20)))return null;
  return fixture;
}

/** Pick an interior point even when a concave room's bounding-box center is outside. */
export function initialFixturePosition(group: Pick<Group,"points"|"bounds">): [number,number,number] {
  const b=group.bounds;if(!b)return [0,0,0];
  const z=b[0][2]+Math.min(1.5,(b[1][2]-b[0][2])/2);
  const center:[number,number,number]=[(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2,z];
  if(insideRoom(group,center))return center;
  const points=group.points ?? [],levels=[...new Set(points.map(p=>p[1]))].sort((a,b)=>a-b);
  let best=center,span=0;
  for(let j=1;j<levels.length;j++) {
    const y=(levels[j-1]!+levels[j]!)/2,xs:number[]=[];
    points.forEach((a,i)=>{const c=points[(i+1)%points.length]!;if((a[1]>y)!==(c[1]>y))xs.push(a[0]+(y-a[1])*(c[0]-a[0])/(c[1]-a[1]));});
    xs.sort((a,b)=>a-b);
    for(let i=0;i+1<xs.length;i+=2)if(xs[i+1]!-xs[i]!>span){span=xs[i+1]!-xs[i]!;best=[(xs[i]!+xs[i+1]!)/2,y,z];}
  }
  return best;
}

export function windowFitsRoom(group:Pick<Group,"points"|"bounds">,fixture:RoomFixture):boolean {
  if(!group.bounds || !insideRoom(group,fixture.position))return false;
  const width=fixture.width ?? 1,height=fixture.height ?? 1.2,angle=fixture.yaw*Math.PI/180;
  const snap=snapWindow(group,fixture.position,width);
  return fixture.position[2]-height/2>=group.bounds[0][2] && fixture.position[2]+height/2<=group.bounds[1][2] &&
    Math.hypot(snap.position[0]-fixture.position[0],snap.position[1]-fixture.position[1])<=.01 && Math.abs(Math.sin((snap.yaw-fixture.yaw)*Math.PI/180))<=.001 &&
    [-1,1].every(sign=>insideRoom(group,[fixture.position[0]+sign*width/2*Math.cos(angle),fixture.position[1]+sign*width/2*Math.sin(angle),fixture.position[2]]));
}
