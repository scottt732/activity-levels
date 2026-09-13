import {expect,it} from "vitest";
import {objectFootprint,outlineBounds,readArchitecture,stairHeight} from "../src/architecture";
import {newOpening,resizeOpening,setOpeningOffset,openingSwing} from "../src/room-openings";
const stairs=readArchitecture({id:"stairs",kind:"stairs",position:[10,20,1],yaw:90,width:1,run:5,height:3,landing_bottom:1,landing_top:1})!;
it("rotates stair geometry and preserves level landings",()=>{
 expect(objectFootprint(stairs)).toEqual([[10,20],[10,21],[5,21],[5,20]]);
 expect(stairHeight(stairs,9.5,20.5)).toBe(1);
 expect(stairHeight(stairs,7.5,20.5)).toBeCloseTo(2.5);
 expect(stairHeight(stairs,5.5,20.5)).toBe(4);
 expect(readArchitecture({...stairs,landing_top:4})).toBeNull();
 expect(readArchitecture({...stairs,steps:1.5})).toBeNull();
 expect(readArchitecture({...stairs,position:[NaN,0,0]})).toBeNull();
});
it("allows concave outlines but rejects crossing and duplicate corners",()=>{
 expect(outlineBounds([[0,0],[4,0],[4,2],[2,2],[2,4],[0,4]],1,4)).toEqual([[0,0,1],[4,4,4]]);
 expect(()=>outlineBounds([[0,0],[4,4],[0,4],[3,0]],0,3)).toThrow(/cross/);
 expect(()=>outlineBounds([[0,0],[4,0],[4,0],[0,4]],0,3)).toThrow(/distinct|cross/);
});
it("resizes either jamb while fixing the opposite and measures hinge offsets",()=>{
 const door={...newOpening(),position:[2,0,0] as [number,number,number],width:1};
 expect(resizeOpening(door,1,[3.5,0])).toEqual({width:2,position:[2.5,0,0]});
 expect(resizeOpening(door,-1,[.5,0])).toEqual({width:2,position:[1.5,0,0]});
 const room={bounds:[[0,0,0],[4,4,3]] as [[number,number,number],[number,number,number]]};
 const shifted={...door,...setOpeningOffset(room,door,.25,true)};
 expect(openingSwing(room,shifted).hinge[0]).toBeCloseTo(.25);
});

it("centers symmetric ceiling grids with safe spacing and height",async()=>{
 const {makeCeilingFixtures}=await import("../src/architecture");
 const room={bounds:[[10,20,0],[16,24,3]] as [[number,number,number],[number,number,number]]};
 const fixtures=makeCeilingFixtures(room,"recessed_light",2,3);
 expect(fixtures).toHaveLength(6);expect(new Set(fixtures.map(o=>o.id)).size).toBe(6);
 expect(fixtures.map(o=>o.position[0]+o.width/2)).toEqual([11,13,15,11,13,15]);
 expect(fixtures.map(o=>o.position[1]+o.run/2)).toEqual([21,21,21,23,23,23]);
 expect(fixtures.every(o=>o.position[2]===3 && o.drop===0)).toBe(true);
 expect(makeCeilingFixtures(room,"pendant_light")[0]).toMatchObject({drop:.5,shape:"globe",height:.3});
 expect(()=>makeCeilingFixtures(room,"ceiling_fan",10,10)).toThrow(/spacing/);
 expect(()=>makeCeilingFixtures(room,"recessed_light",1.5,2)).toThrow(/128/);
 expect(()=>makeCeilingFixtures({...room,points:[[10,20],[16,20],[16,21],[11,21],[11,24],[10,24]]},"pendant_light")).toThrow(/outside/);
 expect(readArchitecture({...fixtures[0],floors:["first","first"]})).toBeNull();
 expect(readArchitecture({...fixtures[0],drop:-1})).toBeNull();
});
