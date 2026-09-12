import type { SensorProfile } from "./types";

const boschSource="https://www.sourcesecurity.com/datasheets/bosch-isc-bpr2-w12-chi-intruder-detector/co-289-ga/BlueLine_Gen_2_Data_sheet_enUS_2603228171.pdf";
const boschNotes="Bosch specifies 12 m × 12 m coverage; the coverage diagram shows a 94° horizontal spread. Mount level on a wall or in a corner, 2.2–2.75 m above the floor; set your actual height and aim separately. The 45° vertical angle is an illustrative editor default, not a Bosch specification. The overlay approximates the footprint, not the individual segmented PIR beams or a pet exclusion volume. A separate look-down lobe is an illustrative near-floor approximation: confirm the physical look-down lens setting and toggle it to match your installation. Select the alarm/motion binary sensor, not tamper. Wired alarm/ESPHome bridges may expose their own manufacturer and model, so confirm the label and select this profile manually when needed. ";

// Both WP12 profiles deliberately share identification hints: registry metadata
// identifies the model, but cannot tell us its physical pet-immunity setting.
const boschProfiles:SensorProfile[]=[
  {id:"community:bosch-isc-bpr2-w12",name:"Bosch ISC-BPR2-W12 · non-pet",model:"ISC-BPR2-W12",mode:"The W12 is the non-pet model; selectable pet immunity requires the WP12."},
  {id:"community:bosch-isc-bpr2-wp12-pet-off",name:"Bosch ISC-BPR2-WP12 · pet immunity OFF",model:"ISC-BPR2-WP12",mode:"Use with hardware pet immunity OFF. Bosch specifies the same performance as the non-pet model. Choosing this profile does not change the detector's hardware setting."},
  {id:"community:bosch-isc-bpr2-wp12-pet-on",name:"Bosch ISC-BPR2-WP12 · pet immunity ON",model:"ISC-BPR2-WP12",mode:"Use with hardware pet immunity ON. Bosch rates pet immunity up to 20 kg (45 lb), subject to its installation instructions. Nominal coverage remains the same; this is not a smaller detection cone. Choosing this profile does not change the detector's hardware setting."},
].map(({id,name,model,mode})=>({
  id,name,look_down:!id.endsWith("pet-on"),kind:"motion",fov:94,vertical_fov:45,range:12,
  technology:"Wired PIR / NC alarm relay",mount:"Wall / corner",
  match:{manufacturer:"Bosch",model},notes:mode+" "+boschNotes,source:boschSource,
}));

/** Reviewed, bundled profiles. Suggestions never apply themselves to an installation. */
export const SENSOR_CATALOG:SensorProfile[]=[{
  id:"community:screek-2a",name:"SCREEK Human Sensor 2A · identification starter",kind:"occupancy",
  fov:60,vertical_fov:45,range:0,technology:"ESPHome / LD2450",mount:"",
  match:{},
  notes:"Choose the Any Presence binary sensor for whole-device presence. Zone-specific sensors may be appropriate for a configured radar zone. Confirm the 2A model on the enclosure: ESPHome project metadata can be shared across models. Coverage starts hidden; the angles are editor defaults, not verified hardware specifications. Set your coverage once and save a personal profile.",
  source:"https://github.com/screekworkshop/screek-human-sensor/blob/main/2a/yaml/human-sensor-2a-stable-github.yaml",
},...boschProfiles];
