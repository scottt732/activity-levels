import { expect, it } from "vitest";
import { newGroup, newStimulus } from "../src/model";
import { newFixture } from "../src/room-fixtures";
import { applyProfile, matchesProfile, parseProfiles, roomCandidates } from "../src/sensor-profiles";
import type { HomeAssistant, RoomDevice, SensorProfile } from "../src/types";
import { roomsConfig } from "./fixtures";
const device=(entity:string,area_id="den"):RoomDevice=>({entity,area_id,manufacturer:"Acme",model:"PIR 1",platform:"zwave_js",device_class:"motion",entity_name:"Motion"});
const profile:SensorProfile={id:"personal:pir",name:"My PIR",kind:"motion",fov:100,vertical_fov:45,range:5,technology:"Z-Wave",mount:"",notes:"",source:"",match:{manufacturer:"Acme",model:"PIR 1",entity_name:"motion"}};
it("restricts room entities, inherits the room area, and ranks configured inputs first",()=>{
  const config=roomsConfig();config.groups=[{...newGroup("house","structure"),area_id:"den",children:[{...newGroup("room","area"),stimuli:[newStimulus("binary_sensor.input")]}]}];
  const hass={states:{"binary_sensor.input":{entity_id:"binary_sensor.input",state:"off",attributes:{},last_changed:"2026-09-01T00:00:00Z"},"binary_sensor.area":{entity_id:"binary_sensor.area",state:"on",attributes:{},last_changed:"2026-09-12T00:00:00Z"}}} as unknown as HomeAssistant;
  const rows=roomCandidates(config,"room",[device("binary_sensor.input","elsewhere"),device("binary_sensor.area"),device("binary_sensor.other","other")],hass);
  expect(rows.map(r=>r.entity)).toEqual(["binary_sensor.input","binary_sensor.area"]);
  config.groups[0]!.area_id=null;
  expect(roomCandidates(config,"room",[device("binary_sensor.area")]).map(r=>r.entity)).toEqual(["binary_sensor.input"]);
});
it("copies characteristics without moving or aiming the device",()=>{
  const fixture={...newFixture("binary_sensor.one"),position:[1,2,3] as [number,number,number],yaw:70,pitch:-10};
  const applied=applyProfile(fixture,profile);
  expect(applied.range).toBe(5);expect(applied.position).toEqual([1,2,3]);expect(applied.yaw).toBe(70);expect(applied.pitch).toBe(-10);expect(fixture.range).toBe(0);
  expect(matchesProfile(profile,device("binary_sensor.one"))).toBe(true);
  expect(matchesProfile(profile,{...device("binary_sensor.one"),model:"PIR 2"})).toBe(false);
  expect(matchesProfile({...profile,match:{platform:"zwave_js"}},device("binary_sensor.one"))).toBe(false);
});
it("round-trips shared profiles and rejects malformed data without exporting placements",()=>{
  expect(parseProfiles(JSON.stringify([{...profile,entity:"binary_sensor.private",position:[1,2,3],yaw:90}]))).toEqual([profile]);
  for(const value of [[profile,profile],[{...profile,range:undefined}],[{...profile,range:-1}],[{...profile,match:{model:""}}],[{...profile,match:{evil:".*"}}]])expect(()=>parseProfiles(JSON.stringify(value))).toThrow();
});
