import { afterEach, expect, it, vi } from "vitest";
import type { AlFloorplanViewer } from "../src/al-floorplan-viewer";
import { AlRoomDeviceEditor } from "../src/al-room-device-editor";
import { newGroup, newStimulus } from "../src/model";
import { newFixture } from "../src/room-fixtures";
import { roomsConfig } from "./fixtures";
import type { HomeAssistant } from "../src/types";
vi.mock("../src/floorplan-renderer",()=>({FloorplanRenderer:class {setParts(){}setPlacement(){}setActivity(){}dispose(){}}}));
afterEach(()=>document.body.replaceChildren());
it("shows synchronized 3D and 2D views, places a room input, and reuses a saved model",async()=>{
  const el=new AlRoomDeviceEditor();const config=roomsConfig();
  config.groups=[{...newGroup("room","area"),bounds:[[0,0,10],[4,4,13]],stimuli:[newStimulus("binary_sensor.corner")],fixtures:[{...newFixture("binary_sensor.second"),position:[2,2,12],yaw:80}]}];el.config=config;
  el.hass={states:{},callWS:vi.fn().mockResolvedValue(["binary_sensor.corner","binary_sensor.second"].map(entity=>({entity,area_id:null,manufacturer:"Acme",model:"PIR",platform:"zwave_js",device_class:"motion",entity_name:"Motion"})))} as unknown as HomeAssistant;
  document.body.append(el);await el.updateComplete;
  const room=el.shadowRoot!.querySelector<HTMLSelectElement>("#device-room")!;
  room.value="room";room.dispatchEvent(new Event("change"));await el.updateComplete;
  expect(el.shadowRoot!.querySelector("al-room-plan")).not.toBeNull();expect(el.shadowRoot!.querySelector("al-floorplan-viewer")).not.toBeNull();
  el.shadowRoot!.querySelector<HTMLButtonElement>('[data-entity="binary_sensor.corner"]')!.click();await el.updateComplete;
  el.shadowRoot!.querySelector("al-room-plan")!.dispatchEvent(new CustomEvent("al-fixture-position",{detail:[0,0,12],bubbles:true}));await el.updateComplete;
  const preview=el.shadowRoot!.querySelector("al-floorplan-viewer") as AlFloorplanViewer;
  const previewConfig=preview.config;el.hass={...el.hass!};await el.updateComplete;
  expect(preview.config).toBe(previewConfig);
  const changed=vi.fn((e:Event)=>{el.config=(e as CustomEvent).detail;});el.addEventListener("al-change",changed);
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-fixture")!.click();await el.updateComplete;
  expect(el.config.groups[0]!.fixtures![1]!.position).toEqual([0,0,12]);expect(config.groups[0]!.fixtures).toHaveLength(1);
  const name=el.shadowRoot!.querySelector<HTMLInputElement>("#profile-name")!;name.value="My sensor";name.dispatchEvent(new Event("input"));await el.updateComplete;
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-profile")!.click();await el.updateComplete;
  expect(el.config.sensor_profiles![0]!.name).toBe("My sensor");expect(el.config.sensor_profiles![0]).not.toHaveProperty("position");
  el.shadowRoot!.querySelector<HTMLButtonElement>('[data-entity="binary_sensor.second"]')!.click();await el.updateComplete;
  expect(el.shadowRoot!.querySelector<HTMLSelectElement>("#sensor-profile")!.value).toBe(el.config.sensor_profiles![0]!.id);
  [...el.shadowRoot!.querySelectorAll("button")].find(b=>b.textContent==="Apply profile")!.click();await el.updateComplete;
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-fixture")!.click();await el.updateComplete;
  expect(el.config.groups[0]!.fixtures![0]!.position).toEqual([2,2,12]);expect(el.config.groups[0]!.fixtures![0]!.yaw).toBe(80);
  el.disabled=true;await el.updateComplete;
  const calls=changed.mock.calls.length;el.shadowRoot!.querySelector<HTMLButtonElement>("#save-fixture")!.click();expect(changed).toHaveBeenCalledTimes(calls);
});

it("opens an externally selected room and saves a window contact with wall geometry",async()=>{
  const el=new AlRoomDeviceEditor();el.room="room";const config=roomsConfig();
  config.groups=[{...newGroup("room","area"),area_id:"den",bounds:[[0,0,0],[4,4,3]]}];el.config=config;
  el.hass={states:{},callWS:vi.fn().mockResolvedValue([{entity:"binary_sensor.window",area_id:"den",device_class:"window",entity_name:"Window"}])} as unknown as HomeAssistant;
  document.body.append(el);await el.updateComplete;await el.updateComplete;
  el.shadowRoot!.querySelector<HTMLButtonElement>('[data-entity="binary_sensor.window"]')!.click();await el.updateComplete;
  expect(el.shadowRoot!.querySelector<HTMLSelectElement>("#fixture-kind")!.value).toBe("window");
  el.shadowRoot!.querySelector("al-room-plan")!.dispatchEvent(new CustomEvent("al-fixture-position",{detail:[0.1,2,1.5],bubbles:true}));await el.updateComplete;
  const changed=vi.fn();el.addEventListener("al-change",changed);
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-fixture")!.click();
  const fixture=changed.mock.calls[0]![0].detail.groups[0].fixtures[0];
  expect(fixture.kind).toBe("window");expect(fixture.position).toEqual([0,2,1.5]);
  expect(Math.abs(fixture.yaw)).toBe(90);
  expect(el.shadowRoot!.querySelector(".editor-controls")!.parentElement!.className).toBe("workspace");
});

it("defaults to HA feet without moving geometry and saves a snapped exterior door",async()=>{
  const el=new AlRoomDeviceEditor();el.room="room";const config=roomsConfig();
  config.groups=[{...newGroup("room","area"),bounds:[[0,0,0],[4,4,3]]}];el.config=config;
  el.hass={config:{unit_system:{length:"mi"}},states:{},callWS:vi.fn().mockResolvedValue([])} as unknown as HomeAssistant;
  document.body.append(el);await el.updateComplete;
  [...el.shadowRoot!.querySelectorAll("button")].find(b=>b.textContent==="Add door")!.click();await el.updateComplete;
  const width=el.shadowRoot!.querySelector<HTMLInputElement>('[aria-label="Opening width"]')!;
  expect(width.value).toBe('2\'11.4331"');
  width.value="3";width.dispatchEvent(new Event("change"));await el.updateComplete;
  for(const [label,value] of [["Opening type","exterior_door"],["Door hinge","right"],["Door swing","out"]]){
    const select=el.shadowRoot!.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)!;
    select.value=value!;select.dispatchEvent(new Event("change"));await el.updateComplete;
  }
  el.shadowRoot!.querySelector("al-room-plan")!.dispatchEvent(new CustomEvent("al-opening-position",{detail:[4,2,0]}));await el.updateComplete;
  const units=el.shadowRoot!.querySelector<HTMLSelectElement>("#length-unit")!;units.value="m";units.dispatchEvent(new Event("change"));await el.updateComplete;
  expect(Number(el.shadowRoot!.querySelector<HTMLInputElement>('[aria-label="Opening width"]')!.value)).toBeCloseTo(.9144);
  const changed=vi.fn();el.addEventListener("al-change",changed);
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-opening")!.click();
  expect(changed.mock.calls[0]![0].detail.groups[0].openings[0]).toMatchObject({kind:"exterior_door",width:.9144000000000001,hinge:"right",swing:"out",position:[4,2,0]});
  expect(config.groups[0]!.openings).toBeUndefined();
});

it("keeps partial imperial input out of geometry and refuses invalid lengths",async()=>{
  const el=new AlRoomDeviceEditor();el.room="room";const config=roomsConfig();
  config.groups=[{...newGroup("room","area"),bounds:[[0,0,0],[4,4,3]]}];el.config=config;
  el.hass={config:{unit_system:{length:"mi"}},states:{},callWS:vi.fn().mockResolvedValue([])} as unknown as HomeAssistant;
  document.body.append(el);await el.updateComplete;
  [...el.shadowRoot!.querySelectorAll("button")].find(b=>b.textContent==="Add door")!.click();await el.updateComplete;
  const width=el.shadowRoot!.querySelector<HTMLInputElement>('[aria-label="Opening width"]')!;
  const changed=vi.fn();el.addEventListener("al-change",changed);
  width.value="2'6";width.dispatchEvent(new Event("input"));await el.updateComplete;
  expect(width.value).toBe("2'6");expect(width.validity.valid).toBe(false);
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-opening")!.click();expect(changed).not.toHaveBeenCalled();
  for(const text of ["2'6\"",'30"',"2.5"]){
    width.value=text;width.dispatchEvent(new Event("input"));width.dispatchEvent(new Event("change"));await el.updateComplete;
    expect(width.value).toBe("2'6\"");expect(width.validity.valid).toBe(true);
    el.shadowRoot!.querySelector<HTMLButtonElement>("#save-opening")!.click();
    expect(changed.mock.calls.at(-1)![0].detail.groups[0].openings[0].width).toBeCloseTo(.762);
  }
  width.value='-30"';width.dispatchEvent(new Event("change"));await el.updateComplete;
  expect(width.validity.valid).toBe(false);
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-opening")!.click();expect(changed).toHaveBeenCalledTimes(3);
  const units=el.shadowRoot!.querySelector<HTMLSelectElement>("#length-unit")!;
  units.value="m";units.dispatchEvent(new Event("change"));await el.updateComplete;
  const metric=el.shadowRoot!.querySelector<HTMLInputElement>('[aria-label="Opening width"]')!;
  expect(metric.validity.valid).toBe(true);expect(Number(metric.value)).toBeCloseTo(.762);
});

it("starts a typed sensor inside the selected room after editing a door",async()=>{
  const el=new AlRoomDeviceEditor();el.room="room";const config=roomsConfig();
  config.groups=[{...newGroup("room","area"),area_id:"office",bounds:[[10,20,12],[14,24,15]]}];el.config=config;
  el.hass={states:{},callWS:vi.fn().mockResolvedValue([{entity:"binary_sensor.motion",area_id:"office",device_class:"motion",entity_name:"Motion"}])} as unknown as HomeAssistant;
  document.body.append(el);await el.updateComplete;await el.updateComplete;
  el.shadowRoot!.querySelector<HTMLButtonElement>("#new-door")!.click();await el.updateComplete;
  el.shadowRoot!.querySelector<HTMLButtonElement>('[data-add-kind="occupancy"]')!.click();await el.updateComplete;
  el.shadowRoot!.querySelector<HTMLButtonElement>('[data-entity="binary_sensor.motion"]')!.click();await el.updateComplete;
  const plan=el.shadowRoot!.querySelector("al-room-plan") as import("../src/al-room-plan").AlRoomPlan;
  expect(plan.fixture!.kind).toBe("occupancy");expect(plan.fixture!.position).toEqual([12,22,13.5]);
  plan.dispatchEvent(new CustomEvent("al-fixture-position",{detail:[10,24,13.5],bubbles:true}));await el.updateComplete;
  const changed=vi.fn();el.addEventListener("al-change",changed);
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-fixture")!.click();
  expect(changed.mock.calls[0]![0].detail.groups[0].fixtures[0].position).toEqual([10,24,13.5]);
});

it("previews an oversized door but refuses to save it",async()=>{
  const el=new AlRoomDeviceEditor();el.room="room";const config=roomsConfig();
  config.groups=[{...newGroup("room","area"),bounds:[[0,0,0],[4,4,3]]}];el.config=config;
  el.hass={states:{},callWS:vi.fn().mockResolvedValue([])} as unknown as HomeAssistant;
  document.body.append(el);await el.updateComplete;
  el.shadowRoot!.querySelector<HTMLButtonElement>("#new-door")!.click();await el.updateComplete;
  const width=el.shadowRoot!.querySelector<HTMLInputElement>('[aria-label="Opening width"]')!;
  width.value="6";width.dispatchEvent(new Event("change"));await el.updateComplete;
  const viewer=el.shadowRoot!.querySelector("al-floorplan-viewer") as AlFloorplanViewer;
  expect(viewer.config!.groups[0]!.openings![0]!.width).toBe(6);
  expect(config.groups[0]!.openings).toBeUndefined();
  const changed=vi.fn();el.addEventListener("al-change",changed);
  el.shadowRoot!.querySelector<HTMLButtonElement>("#save-opening")!.click();expect(changed).not.toHaveBeenCalled();
});
