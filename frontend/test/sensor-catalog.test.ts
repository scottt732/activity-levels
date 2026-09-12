import { expect, it } from "vitest";
import { SENSOR_CATALOG } from "../src/sensor-catalog";
import { matchesProfile, parseProfiles } from "../src/sensor-profiles";
import type { RoomDevice } from "../src/types";

const device=(model:string):RoomDevice=>({entity:"binary_sensor.motion",area_id:"den",manufacturer:"Bosch",model,platform:"alarm_bridge",device_class:"motion",entity_name:"Motion"});
const suggestions=(model:string)=>SENSOR_CATALOG.filter(profile=>matchesProfile(profile,device(model)));

it("keeps bundled profiles valid for personal import and export",()=>{
  expect(parseProfiles(JSON.stringify(SENSOR_CATALOG))).toEqual(SENSOR_CATALOG);
});

it("does not suggest pet immunity for the non-pet W12 model",()=>{
  expect(suggestions("ISC-BPR2-W12").map(profile=>profile.id)).toEqual(["community:bosch-isc-bpr2-w12"]);
  expect(suggestions("ISC-BPR2-W12-CHI")).toEqual([]);
});

it("requires an explicit choice of WP12 hardware mode instead of inferring it",()=>{
  const profiles=suggestions("isc-bpr2-wp12");
  expect(profiles.map(profile=>profile.id)).toEqual([
    "community:bosch-isc-bpr2-wp12-pet-off",
    "community:bosch-isc-bpr2-wp12-pet-on",
  ]);
  expect(profiles[0]!.range).toBe(profiles[1]!.range);
  expect(profiles[0]!.fov).toBe(profiles[1]!.fov);
  expect(profiles[0]!.vertical_fov).toBe(profiles[1]!.vertical_fov);
  expect(SENSOR_CATALOG.filter(profile=>matchesProfile(profile,{...device("ISC-BPR2-WP12"),manufacturer:"Bridge vendor",model:"Generic input"}))).toEqual([]);
});
