import { footprint } from './property-layout';
import type { Group } from './types';
type Point = [number, number];

/** Corners win over axis alignment so a shared junction stays a single point. */
export function snapPlanPoint(point: Point, outlines: Point[][], tolerance: number, previous?: Point): Point {
  const corners = outlines.flat();
  const nearest = corners.reduce<Point | undefined>((best, p) =>
    Math.hypot(p[0]-point[0],p[1]-point[1]) <= tolerance &&
    (!best || Math.hypot(p[0]-point[0],p[1]-point[1]) < Math.hypot(best[0]-point[0],best[1]-point[1])) ? p : best, undefined);
  if (nearest && (!previous || Math.min(Math.abs(nearest[0]-previous[0]), Math.abs(nearest[1]-previous[1])) < 1e-6)) return [...nearest];
  const p: Point = [...point];
  if (previous) {
    if (Math.abs(p[0]-previous[0]) < Math.abs(p[1]-previous[1])) p[0]=previous[0];
    else p[1]=previous[1];
  }
  for (const axis of [0,1] as const) {
    if (previous && p[axis]===previous[axis]) continue;
    const closest=corners.reduce<number | undefined>((best,c)=>Math.abs(c[axis]-p[axis])<=tolerance && (best===undefined || Math.abs(c[axis]-p[axis])<Math.abs(best-p[axis])) ? c[axis] : best,undefined);
    if(closest!==undefined)p[axis]=closest;
  }
  return p;
}

/** Translate one wall normal to itself, preserving its length and attached objects. */
export function moveRoomWall(room: Group, index: number, displacement: Point, neighbors: Point[][], tolerance: number): Group {
  const points=footprint(room).map(p=>[...p] as Point), a=points[index]!, b=points[(index+1)%points.length]!;
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(!length)return room;
  const normal:Point=[-(b[1]-a[1])/length,(b[0]-a[0])/length];
  let distance=displacement[0]*normal[0]+displacement[1]*normal[1];
  let best=tolerance;
  for(const outline of neighbors)for(let i=0;i<outline.length;i++) {
    const c=outline[i]!,d=outline[(i+1)%outline.length]!;
    const otherLength=Math.hypot(d[0]-c[0],d[1]-c[1]);
    if(!otherLength || Math.abs(((d[0]-c[0])*normal[0]+(d[1]-c[1])*normal[1])/otherLength)>1e-4)continue;
    // Only snap to walls whose projections overlap; distant collinear rooms aren't targets.
    const tangent:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length];
    const cAlong=(c[0]-a[0])*tangent[0]+(c[1]-a[1])*tangent[1];
    const dAlong=(d[0]-a[0])*tangent[0]+(d[1]-a[1])*tangent[1];
    if(Math.max(cAlong,dAlong)<-tolerance || Math.min(cAlong,dAlong)>length+tolerance)continue;
    const candidate=(c[0]-a[0])*normal[0]+(c[1]-a[1])*normal[1];
    if(Math.abs(candidate-distance)<=best){best=Math.abs(candidate-distance);distance=candidate;}
  }
  const delta:Point=[normal[0]*distance,normal[1]*distance];
  const attached=(p:number[])=> {
    const along=((p[0]!-a[0])*(b[0]-a[0])+(p[1]!-a[1])*(b[1]-a[1]))/length;
    return Math.abs((p[0]!-a[0])*normal[0]+(p[1]!-a[1])*normal[1])<.025 && along>=-.025 && along<=length+.025;
  };
  const shift=(p:[number,number,number]):[number,number,number]=>[p[0]+delta[0],p[1]+delta[1],p[2]];
  points[index]=[a[0]+delta[0],a[1]+delta[1]];
  points[(index+1)%points.length]=[b[0]+delta[0],b[1]+delta[1]];
  return {...room,points,openings:room.openings?.map(o=>attached(o.position)?{...o,position:shift(o.position)}:o),fixtures:room.fixtures?.map(f=>attached(f.position)?{...f,position:shift(f.position)}:f)};
}
