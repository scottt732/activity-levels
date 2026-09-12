import type { Config, Group, RoomOpening } from "./types";
import { walkGroups } from "./model";

type Room = Pick<Group,"points"|"bounds">;
type XY = [number,number];
export function newOpening(kind:RoomOpening["kind"]="interior_door"):RoomOpening {
  return {id:crypto.randomUUID(),name:"",kind,position:[0,0,0],yaw:0,
    width:kind==="open_wall"?2:0.9,height:kind==="open_wall"?2.4:2,
    hinge:"left",swing:"in",open:kind==="open_wall"};
}
export function readOpening(value:unknown):RoomOpening|null {
  if(!value || typeof value!=="object")return null;
  const item={name:"",yaw:0,width:0.9,height:2,hinge:"left",swing:"in",open:false,...value} as RoomOpening;
  if(typeof item.id!=="string" || !item.id.length || item.id.length>100 || typeof item.name!=="string" || item.name.length>100 ||
    !["interior_door","exterior_door","open_wall"].includes(item.kind) || !["left","right"].includes(item.hinge) ||
    !["in","out"].includes(item.swing) || typeof item.open!=="boolean" ||
    !Array.isArray(item.position) || item.position.length!==3 ||
    ![...item.position,item.yaw,item.width,item.height].every(v=>typeof v==="number" && Number.isFinite(v)) ||
    Math.abs(item.yaw)>360 || item.width<0.1 || item.width>20 || item.height<0.1 || item.height>20 ||
    (item.entity!==undefined && (typeof item.entity!=="string" || !/^binary_sensor\.[a-z0-9_]+$/.test(item.entity))))return null;
  return item;
}
export function openingIsOpen(opening:RoomOpening,states:Record<string,{state:string}>):boolean {
  return opening.kind==="open_wall" || (opening.entity ? states[opening.entity]?.state==="on" : opening.open);
}
function walls(room:Room) {
  const b=room.bounds;
  const points=room.points ?? (b?[[b[0][0],b[0][1]],[b[1][0],b[0][1]],[b[1][0],b[1][1]],[b[0][0],b[1][1]]]:[]);
  const area=points.reduce((sum,a,i)=>{const c=points[(i+1)%points.length]!;return sum+a[0]*c[1]-c[0]*a[1];},0);
  return points.flatMap((a,i)=>{
    const c=points[(i+1)%points.length]!,dx=c[0]-a[0],dy=c[1]-a[1],length=Math.hypot(dx,dy);
    return length>0?[{a,dx:dx/length,dy:dy/length,length,sign:area>=0?1:-1}]:[];
  });
}
/** Width stays entirely on a single wall; an oversized opening is rejected by save. */
export function snapOpening(room:Room,position:[number,number,number],width=0.9):{position:[number,number,number];yaw:number} {
  let best={position,yaw:0},distance=Infinity;
  for(const wall of walls(room)) {
    if(wall.length+1e-6<width)continue;
    const t=Math.max(width/2,Math.min(wall.length-width/2,(position[0]-wall.a[0])*wall.dx+(position[1]-wall.a[1])*wall.dy));
    const x=wall.a[0]+t*wall.dx,y=wall.a[1]+t*wall.dy,d=Math.hypot(x-position[0],y-position[1]);
    if(d<distance){distance=d;best={position:[x,y,position[2]],yaw:Math.atan2(wall.dy,wall.dx)*180/Math.PI};}
  }
  return best;
}
function alignedWall(room:Room,opening:RoomOpening) {
  return walls(room).find(w=>{
    const x=opening.position[0]-w.a[0],y=opening.position[1]-w.a[1],t=x*w.dx+y*w.dy;
    return Math.abs(x*w.dy-y*w.dx)<1e-5 && t>=opening.width/2-1e-5 && t<=w.length-opening.width/2+1e-5 &&
      Math.abs(Math.sin(opening.yaw*Math.PI/180)*w.dx-Math.cos(opening.yaw*Math.PI/180)*w.dy)<1e-5;
  });
}
/** Inward normal derives from polygon winding, never from the editable yaw sign. */
export function openingWallNormal(room:Room,opening:RoomOpening):XY {
  const wall=alignedWall(room,opening);
  return wall?[-wall.dy*wall.sign,wall.dx*wall.sign]:[0,0];
}
/** Left/right are seen from inside facing outside; in swings toward that interior. */
export function openingSwing(room:Room,opening:RoomOpening):{hinge:XY;closed:XY;open:XY} {
  const [nx,ny]=openingWallNormal(room,opening),side=opening.hinge==="left"?1:-1;
  const lx=ny,ly=-nx;
  const hinge:XY=[opening.position[0]+side*lx*opening.width/2,opening.position[1]+side*ly*opening.width/2];
  const closed:XY=[opening.position[0]-side*lx*opening.width/2,opening.position[1]-side*ly*opening.width/2];
  const direction=opening.swing==="in"?1:-1;
  return {hinge,closed,open:[hinge[0]+direction*nx*opening.width,hinge[1]+direction*ny*opening.width]};
}
export function saveOpening(config:Config,room:string,opening:RoomOpening,originalId?:string):Config {
  const value=readOpening(opening);
  if(!value)throw new Error("Check the opening dimensions, type, and contact sensor.");
  const next=structuredClone(config),group=walkGroups(next).find(e=>e.group.id===room)?.group;
  if(!group?.bounds)throw new Error("Choose a placed room.");
  if(value.position[2]<group.bounds[0][2]-1e-6 || value.position[2]+value.height>group.bounds[1][2]+1e-6)
    throw new Error("Keep the whole opening between the floor and ceiling.");
  if(!alignedWall(group,value))throw new Error("Place and align the whole opening on one wall; reduce its width if needed.");
  const openings=group.openings ?? [],index=openings.findIndex(o=>o.id===originalId);
  if(openings.some((o,i)=>o.id===value.id && i!==index))throw new Error("This opening already exists in the room.");
  if(index<0 && openings.length>=128)throw new Error("Maximum 128 openings per room.");
  group.openings=index<0?[...openings,structuredClone(value)]:openings.map((o,i)=>i===index?structuredClone(value):o);
  return next;
}
