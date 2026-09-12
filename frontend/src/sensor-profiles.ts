import type { Config, HomeAssistant, LiveState, RoomDevice, RoomFixture, SensorProfile } from "./types";
import { walkGroups } from "./model";
import { newFixture, readFixture } from "./room-fixtures";

const matchKeys=["manufacturer","model","platform","device_class","entity_name"] as const;
const norm=(value:string)=>value.trim().toLowerCase();
export function matchesProfile(profile:SensorProfile,device:RoomDevice):boolean {
  const keys=matchKeys.filter(key=>profile.match[key]);
  return !!profile.match.model && !!(profile.match.manufacturer || profile.match.platform) && keys.every(key=>key==="entity_name"
    ? norm(device[key] ?? "").includes(norm(profile.match[key]!))
    : norm(device[key] ?? "")===norm(profile.match[key]!));
}
export function applyProfile(fixture:RoomFixture,profile:SensorProfile):RoomFixture {
  return {...fixture,look_down:profile.look_down ?? false,profile_id:profile.id,kind:profile.kind,fov:profile.fov,vertical_fov:profile.vertical_fov,
    range:profile.range,technology:profile.technology,mount:profile.mount};
}
export function parseProfiles(text:string):SensorProfile[] {
  if(text.length>500_000)throw new Error("Profile file is too large.");
  const rows:unknown=JSON.parse(text);
  if(!Array.isArray(rows) || rows.length>128)throw new Error("Expected an array of at most 128 profiles.");
  const ids=new Set<string>();
  return rows.map((value:unknown)=>{
    if(!value || typeof value!=="object")throw new Error("Invalid profile.");
    const p={technology:"",mount:"",notes:"",source:"",match:{},...value} as SensorProfile;
    const textFields={id:100,name:100,technology:60,mount:60,notes:2000,source:500};
    for(const [key,max] of Object.entries(textFields)) {
      const field=p[key as keyof typeof textFields];
      if(typeof field!=="string" || field.length>max || ((key==="id" || key==="name") && !field.trim()))throw new Error(`Invalid profile ${key}.`);
    }
    if(p.look_down!==undefined && typeof p.look_down!=="boolean")throw new Error("Invalid look-down flag.");
    if(!["motion","occupancy","light","window"].includes(p.kind) || ![p.fov,p.vertical_fov,p.range].every(v=>typeof v==="number" && Number.isFinite(v)))throw new Error("Profile kind and coverage fields are required.");
    if(!readFixture({...newFixture(p.kind==="light"?"light.profile":"binary_sensor.profile"),...p}) || ids.has(p.id))throw new Error("Invalid coverage or duplicate profile id.");
    if(!p.match || typeof p.match!=="object" || Array.isArray(p.match))throw new Error("Invalid identification rules.");
    for(const [key,value] of Object.entries(p.match))if(!matchKeys.includes(key as typeof matchKeys[number]) || typeof value!=="string" || !value.trim() || value.length>200)throw new Error("Invalid identification rule.");
    ids.add(p.id);
    // Export/import only characteristics and identification rules, never installation data.
    return {...(p.look_down===undefined?{}:{look_down:p.look_down}),id:p.id,name:p.name,kind:p.kind,fov:p.fov,vertical_fov:p.vertical_fov,range:p.range,
      technology:p.technology,mount:p.mount,notes:p.notes,source:p.source,match:{...p.match}};
  });
}
export interface DeviceCandidate extends RoomDevice { name:string; input:boolean; contributing:boolean; changed:number; placed:boolean }
export function roomCandidates(config:Config,room:string,registry:RoomDevice[],hass?:HomeAssistant,live?:LiveState|null):DeviceCandidate[] {
  const groups=walkGroups(config),entry=groups.find(e=>e.group.id===room);
  if(!entry)return [];
  // Path ancestry is structural; a sibling area's entities must never leak into this list.
  let area=entry.group.area_id;
  if(!area) {
    const parents=groups.filter(e=>e.path.length<entry.path.length && e.path.every((p,i)=>entry.path[i]===p)).sort((a,b)=>b.path.length-a.path.length);
    area=parents.find(e=>e.group.area_id)?.group.area_id ?? null;
  }
  const subtree=groups.filter(e=>entry.path.every((p,i)=>e.path[i]===p));
  const inputs=new Set(subtree.flatMap(e=>e.group.stimuli.map(s=>s.entity)));
  const placed=new Set(entry.group.fixtures?.map(f=>f.entity));
  const registryById=new Map(registry.map(d=>[d.entity,d]));
  const ids=new Set([...registry.filter(d=>area && d.area_id===area).map(d=>d.entity),...inputs,...placed]);
  const contributing=new Set(subtree.flatMap(e=>(live?.voices[e.group.id] ?? []).filter(v=>v.value>0 && v.entity).map(v=>v.entity!)));
  return [...ids].filter(id=>/^(binary_sensor|light)\./.test(id)).map(id=>{
    const state=hass?.states[id],device=registryById.get(id);
    return {entity:id,area_id:null,manufacturer:null,model:null,platform:"",device_class:null,entity_name:"",...device,
      name:String(state?.attributes.friendly_name ?? device?.entity_name ?? id) || id,input:inputs.has(id),contributing:contributing.has(id),placed:placed.has(id),
      changed:Number.isFinite(Date.parse(state?.last_changed ?? ""))?Date.parse(state!.last_changed)/1000:0};
  }).sort((a,b)=>Number(b.input)-Number(a.input) || Number(b.contributing)-Number(a.contributing) || b.changed-a.changed || a.name.localeCompare(b.name));
}
