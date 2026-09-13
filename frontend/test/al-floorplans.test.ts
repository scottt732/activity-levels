import {afterEach,expect,it,vi} from "vitest";
import type {AlRoomDeviceEditor} from "../src/al-room-device-editor";
import {AlFloorplans} from "../src/al-floorplans";
import {newGroup} from "../src/model";
import {roomsConfig} from "./fixtures";
vi.mock("../src/floorplan-renderer",()=>({FloorplanRenderer:class {setParts(){}setPlacement(){}setActivity(){}dispose(){}}}));
afterEach(()=>document.body.replaceChildren());
it("keeps import drafts mounted, selects an eligible editor room, and exposes save and exit",async()=>{
 const el=new AlFloorplans();el.config=roomsConfig();el.config.groups=[{...newGroup("house","structure"),bounds:[[0,0,0],[8,4,3]],children:[{...newGroup("room","area"),bounds:[[0,0,0],[4,4,3]]}]}];document.body.append(el);await el.updateComplete;
 const root=el.shadowRoot!;const importer=root.querySelector("al-floorplan-import");
 const click=async(label:string)=>{root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click();await el.updateComplete;};
 root.querySelector("al-floorplan-viewer")!.dispatchEvent(new CustomEvent("al-room-selected",{detail:"house"}));
 await click("Doors & windows");expect(root.querySelector<AlRoomDeviceEditor>("al-room-device-editor")!.room).toBe("room");
 await click("Motion & occupancy");expect(root.querySelector<AlRoomDeviceEditor>("al-room-device-editor")!.section).toBe("sensors");
 await click("Import floorplan");expect(root.querySelector("al-floorplan-import")).toBe(importer);expect(root.querySelector<HTMLElement>('[aria-label="Import floorplan"].page')!.hidden).toBe(false);
 const save=vi.fn(),exit=vi.fn();el.addEventListener("al-save-config",save);el.addEventListener("al-exit-floorplan",exit);
 const saveButton=root.querySelectorAll<HTMLButtonElement>(".save button")[1]!;expect(saveButton.disabled).toBe(true);
 el.dirty=true;await el.updateComplete;saveButton.click();expect(save).toHaveBeenCalledOnce();
 el.blocked=true;await el.updateComplete;expect(saveButton.disabled).toBe(true);
 await click("Exit floorplan");expect(exit).toHaveBeenCalledOnce();
});

it('saves geometry-only editor changes outside the activity tree and retains the space across tools',async()=>{
 const el=new AlFloorplans();el.config=roomsConfig();el.config.groups=[{...newGroup('floor','floor'),children:[{...newGroup('room','area'),bounds:[[0,0,0],[4,4,3]]}]}];
 el.config.spaces=[{id:'closet',name:'Closet',parent_id:'floor',bounds:[[1,1,0],[2,2,3]]}];document.body.append(el);await el.updateComplete;
 el.shadowRoot!.querySelector('al-floorplan-viewer')!.dispatchEvent(new CustomEvent('al-room-selected',{detail:'closet'}));
 el.shadowRoot!.querySelector<HTMLButtonElement>('[aria-label="Doors & windows"]')!.click();await el.updateComplete;
 const editor=el.shadowRoot!.querySelector<AlRoomDeviceEditor>('al-room-device-editor')!;expect(editor.room).toBe('closet');
 const changed=vi.fn();el.addEventListener('al-change',changed);
 editor.dispatchEvent(new CustomEvent('al-change',{detail:editor.config,bubbles:true,composed:true}));
 expect(changed).toHaveBeenCalledOnce();expect(changed.mock.calls[0]![0].detail).toEqual(el.config);
});
