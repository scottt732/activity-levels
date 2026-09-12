import { describe, expect, it } from "vitest";
import { newGroup } from "../src/model";
import { fixtureAppearance, snapWindow, fixtureDirection, insideRoom, newFixture, readFixture, saveFixture } from "../src/room-fixtures";
import { placeStructure } from "../src/property-layout";
import { roomsConfig } from "./fixtures";

function config() {
  const config=roomsConfig();
  config.groups=[{...newGroup("house","structure"),bounds:[[0,0,0],[4,4,6]],children:[{...newGroup("room","area"),bounds:[[0,0,2],[4,4,5]]}]}];
  return config;
}
describe("room fixtures",()=>{
  it("normalizes optional geometry and rejects malformed draft data",()=>{
    expect(readFixture({entity:"binary_sensor.motion",kind:"motion",position:[1,2,3]})?.range).toBe(0);
    expect(readFixture({...newFixture("binary_sensor.motion"),position:[1,NaN,3]})).toBeNull();
    expect(readFixture({...newFixture("light.ceiling"),kind:"motion"})).toBeNull();
  });
  it("saves and edits without mutating the source and rejects duplicates",()=>{
    const original=config(),fixture={...newFixture("binary_sensor.motion"),position:[1,2,3] as [number,number,number]};
    const next=saveFixture(original,"room",fixture);
    expect(original.groups[0]!.children[0]!.fixtures).toBeUndefined();
    expect(next.groups[0]!.children[0]!.fixtures).toEqual([fixture]);
    expect(()=>saveFixture(next,"room",fixture)).toThrow(/already/);
    const edited=saveFixture(next,"room",{...fixture,yaw:90},fixture.entity);
    expect(edited.groups[0]!.children[0]!.fixtures![0]!.yaw).toBe(90);
    expect(()=>saveFixture(original,"room",{...fixture,position:[1,2,6]})).toThrow(/inside/);
    expect(()=>saveFixture(original,"room",{...fixture,kind:"light"})).toThrow(/binary sensor/);
  });
  it("accepts corners, rejects concave cutouts, and validates height",()=>{
    const group={bounds:[[0,0,0],[4,4,3]] as [[number,number,number],[number,number,number]],points:[[0,0],[4,0],[4,2],[2,2],[2,4],[0,4]] as [number,number][]};
    expect(insideRoom(group,[0,0,3])).toBe(true);
    expect(insideRoom(group,[3,3,1])).toBe(false);
    expect(insideRoom(group,[1,1,4])).toBe(false);
  });
  it("rotates device positions and aim with structures, preserving height",()=>{
    const placed=saveFixture(config(),"room",{...newFixture("binary_sensor.motion"),position:[1,2,3],yaw:350});
    const moved=placeStructure(placed,"house",10,20,90).groups[0]!.children[0]!.fixtures![0]!;
    expect(moved.position).toEqual([12,21,3]);expect(moved.yaw).toBe(80);
    expect(fixtureDirection({...moved,yaw:90,pitch:0})[2]).toBeCloseTo(-1);
    expect(fixtureDirection({...moved,pitch:-90})[1]).toBeCloseTo(-1);
  });
});

it("snaps windows to polygon walls and validates dimensions and center height",()=>{
  const source=config(),group=source.groups[0]!.children[0]!;
  const snapped=snapWindow(group,[0.1,2,3.5]);
  expect(snapped.position).toEqual([0,2,3.5]);expect(Math.abs(snapped.yaw)).toBe(90);
  const window={...newFixture("binary_sensor.window","window"),...snapped,width:1.4,height:1.2};
  expect(saveFixture(source,"room",window).groups[0]!.children[0]!.fixtures![0]).toEqual(window);
  expect(()=>saveFixture(source,"room",{...window,height:10})).toThrow(/whole window/);
  expect(()=>saveFixture(source,"room",{...window,width:NaN})).toThrow(/dimensions/);
  expect(()=>saveFixture(source,"room",{...window,position:[2,2,3.5]})).toThrow(/wall/);
  expect(readFixture({...window,height:0})).toBeNull();
});
it("leaves sensor beams off when idle or unavailable and turns them red on detection",()=>{
  for(const kind of ["motion","occupancy"] as const){
    expect(fixtureAppearance(kind,"off").opacity).toBe(0);
    expect(fixtureAppearance(kind,"unavailable").opacity).toBe(0);
    expect(fixtureAppearance(kind,"on")).toEqual({color:"#ff3535",opacity:0.16});
  }
});
