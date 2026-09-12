import { describe, expect, it } from "vitest";
import { newGroup } from "../src/model";
import { newOpening, openingIsOpen, openingSwing, openingWallNormal, readOpening, saveOpening, snapOpening } from "../src/room-openings";
import type { Group } from "../src/types";
import { roomsConfig } from "./fixtures";

const room:Group={...newGroup("room","area"),bounds:[[0,0,0],[4,4,3]]};
describe("architectural openings",()=>{
  it("normalizes without guessing unknown contact states",()=>{
    const opening=newOpening();
    expect(readOpening({id:"door",kind:"interior_door",position:[2,0,0]})).toEqual({...opening,id:"door",position:[2,0,0]});
    expect(readOpening({...opening,entity:"light.invalid"})).toBeNull();
    expect(readOpening({...opening,width:NaN})).toBeNull();
    expect(readOpening({...opening,open:1})).toBeNull();
    expect(openingIsOpen({...opening,open:true,entity:"binary_sensor.door"},{})).toBe(false);
    expect(openingIsOpen({...opening,entity:"binary_sensor.door"},{"binary_sensor.door":{state:"on"}})).toBe(true);
    expect(openingIsOpen({...opening,kind:"open_wall"},{})).toBe(true);
  });
  it.each(["left","right"] as const)("resolves %s hinges and both swings from the interior on every wall",hinge=>{
    for(const [position,normal] of [ [[2,0,0],[0,1]],[[4,2,0],[-1,0]],[[2,4,0],[0,-1]],[[0,2,0],[1,0]]] as const) {
      for(const clockwise of [false,true]) {
        const group=clockwise?{...room,points:[[0,4],[4,4],[4,0],[0,0]] as [number,number][]}:room;
        for(const swing of ["in","out"] as const) {
          const opening={...newOpening(),...snapOpening(group,[...position]),width:1,hinge,swing};
          const n=openingWallNormal(group,opening),geometry=openingSwing(group,opening);
          expect(n[0]).toBeCloseTo(normal[0]);expect(n[1]).toBeCloseTo(normal[1]);
          const side=hinge==="left"?1:-1,direction=swing==="in"?1:-1;
          expect(geometry.hinge[0]).toBeCloseTo(position[0]+side*normal[1]/2);
          expect(geometry.hinge[1]).toBeCloseTo(position[1]-side*normal[0]/2);
          expect(geometry.open[0]-geometry.hinge[0]).toBeCloseTo(direction*normal[0]);
          expect(geometry.open[1]-geometry.hinge[1]).toBeCloseTo(direction*normal[1]);
        }
      }
    }
  });
  it("clamps to concave walls, validates the entire span and saves immutably",()=>{
    const source=roomsConfig(),group={...room,points:[[0,0],[4,0],[4,2],[2,2],[2,4],[0,4]] as [number,number][]};
    source.groups=[group];
    const opening={...newOpening(),...snapOpening(group,[2.1,3.9,0],1),width:1};
    expect(opening.position).toEqual([2,3.5,0]);
    const next=saveOpening(source,"room",opening);
    expect(source.groups[0]!.openings).toBeUndefined();
    expect(next.groups[0]!.openings).toEqual([opening]);
    expect(()=>saveOpening(next,"room",opening)).toThrow(/already/);
    expect(saveOpening(next,"room",{...opening,name:"Patio"},opening.id).groups[0]!.openings![0]!.name).toBe("Patio");
    expect(()=>saveOpening(source,"room",{...opening,width:3})).toThrow(/whole opening/);
    expect(()=>saveOpening(source,"room",{...opening,height:4})).toThrow(/ceiling/);
    expect(()=>saveOpening(source,"room",{...opening,yaw:45})).toThrow(/align/);
    expect(()=>saveOpening(source,"room",{...opening,position:[3,3,0]})).toThrow(/wall/);
  });
});
