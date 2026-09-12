import type { SensorProfile } from "./types";

/** Reviewed, bundled profiles. Suggestions never apply themselves to an installation. */
export const SENSOR_CATALOG:SensorProfile[]=[{
  id:"community:screek-2a",name:"SCREEK Human Sensor 2A · identification starter",kind:"occupancy",
  fov:60,vertical_fov:45,range:0,technology:"ESPHome / LD2450",mount:"",
  match:{},
  notes:"Choose the Any Presence binary sensor for whole-device presence. Zone-specific sensors may be appropriate for a configured radar zone. Confirm the 2A model on the enclosure: ESPHome project metadata can be shared across models. Coverage starts hidden; the angles are editor defaults, not verified hardware specifications. Set your coverage once and save a personal profile.",
  source:"https://github.com/screekworkshop/screek-human-sensor/blob/main/2a/yaml/human-sensor-2a-stable-github.yaml",
}];
