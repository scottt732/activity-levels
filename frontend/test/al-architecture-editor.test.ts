import {afterEach,expect,it,vi} from "vitest";
import {AlArchitectureEditor} from "../src/al-architecture-editor";
import {newGroup,walkGroups} from "../src/model";
import {roomsConfig} from "./fixtures";
vi.mock("../src/floorplan-renderer",()=>({FloorplanRenderer:class {setParts(){}setPlacement(){}setActivity(){}dispose(){}}}));
afterEach(()=>document.body.replaceChildren());
it("adds stairs, validates landings, and creates a named space below in the draft",async()=>{
 const el=new AlArchitectureEditor(),config=roomsConfig();config.groups=[{...newGroup("house","property"),children:[{...newGroup("building","structure"),children:[{...newGroup("room","area"),bounds:[[0,0,0],[5,5,3]]}]}]}];el.config=config;el.room="room";document.body.append(el);await el.updateComplete;
 const button=(text:string)=>[...el.shadowRoot!.querySelectorAll("button")].find(b=>b.textContent?.trim()===text)!;
 button("Add stairs").click();await el.updateComplete;
 expect(walkGroups(config).find(e=>e.group.id==="room")!.group.architecture).toBeUndefined();
 const input=el.shadowRoot!.querySelector<HTMLInputElement>('[aria-label="Top landing"]')!;input.value="4";input.dispatchEvent(new Event("change"));await el.updateComplete;expect(el.flushDraft()).toBe(false);
 input.value=".5";input.dispatchEvent(new Event("change"));await el.updateComplete;expect(el.flushDraft()).toBe(true);
 button("Create space below").click();await el.updateComplete;
 const objects=walkGroups(el.config!).find(e=>e.group.id==="room")!.group.architecture!;
 const closet=walkGroups(el.config!).find(e=>e.group.id===objects[0]!.under_room)!;
 expect(closet.group.name).toBe("Server closet");expect(closet.parent!.id).toBe("building");
});

it("uses a non-scaling corner focus highlight and preserves keyboard movement",async()=>{
 const el=new AlArchitectureEditor(),config=roomsConfig();
 config.groups=[{...newGroup("room","area"),bounds:[[0,0,0],[5,5,3]]}];el.config=config;el.room="room";
 document.body.append(el);await el.updateComplete;
 const corner=el.shadowRoot!.querySelector<SVGCircleElement>('circle[aria-label="Corner 1"]')!;
 expect(corner.getAttribute("tabindex")).toBe("0");
 const rule=AlArchitectureEditor.styles.cssText.match(/\.grip:focus\s*\{([^}]+)\}/)?.[1];
 expect(rule).toMatch(/outline:\s*none/);expect(rule).toMatch(/stroke:\s*white/);expect(rule).toMatch(/vector-effect:\s*non-scaling-stroke/);
 corner.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));await el.updateComplete;
 expect(el.config!.groups[0]!.points![0]).toEqual([.01,0]);
});
