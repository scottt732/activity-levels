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

it('draws rectangles snapped to neighboring corners and creates symmetric ceiling grids',async()=>{
 const el=new AlArchitectureEditor(),config=roomsConfig();
 config.groups=[{...newGroup('building','structure'),children:[{...newGroup('room','area'),bounds:[[0,0,0],[5,5,3]]}]}];el.config=config;el.room='room';document.body.append(el);await el.updateComplete;
 const button=(text:string)=>[...el.shadowRoot!.querySelectorAll('button')].find(b=>b.textContent?.trim()===text)!;
 button('Add symmetric grid').click();await el.updateComplete;
 const objects=walkGroups(el.config!).find(e=>e.group.id==='room')!.group.architecture!;
 expect(objects).toHaveLength(4);expect(objects.every(o=>o.kind==='recessed_light' && o.position[2]===3)).toBe(true);
 el.resetDraft();await el.updateComplete;button('Draw room').click();await el.updateComplete;
 vi.stubGlobal('DOMPoint',class {constructor(public x:number,public y:number){}matrixTransform(){return this;}});
 const canvas=el.shadowRoot!.querySelector('svg')!;Object.defineProperty(canvas,'getScreenCTM',{value:()=>({a:100,b:0,inverse:()=>({})})});
 canvas.dispatchEvent(new MouseEvent('click',{clientX:5.05,clientY:-.03,bubbles:true}));await el.updateComplete;
 canvas.dispatchEvent(new MouseEvent('click',{clientX:8,clientY:-4.98,bubbles:true}));await el.updateComplete;
 button('Finish room').click();await el.updateComplete;
 const room=walkGroups(el.config!).find(e=>e.group.id===el.room)!.group;
 expect(room.points).toEqual([[5,0],[8,0],[8,5],[5,5]]);vi.unstubAllGlobals();
});

it('drags a whole wall to the neighboring wall and moves its attached window',async()=>{
 const el=new AlArchitectureEditor(),config=roomsConfig();
 config.groups=[{...newGroup('room','area'),bounds:[[0,0,0],[4,4,3]]},{...newGroup('next','area'),bounds:[[0,-5,0],[4,-2,3]]}];el.config=config;el.room='room';document.body.append(el);await el.updateComplete;
 vi.stubGlobal('DOMPoint',class {constructor(public x:number,public y:number){}matrixTransform(){return this;}});
 const canvas=el.shadowRoot!.querySelector('svg')!;Object.defineProperty(canvas,'getScreenCTM',{value:()=>({a:100,b:0,inverse:()=>({})})});Object.defineProperty(canvas,'setPointerCapture',{value:vi.fn()});
 const pointer=(type:string,x:number,y:number)=>{const e=new MouseEvent(type,{clientX:x,clientY:y,bubbles:true});Object.defineProperty(e,'pointerId',{value:1});return e;};
 el.shadowRoot!.querySelector('[aria-label="Move wall 1"]')!.dispatchEvent(pointer('pointerdown',2,0));
 canvas.dispatchEvent(pointer('pointermove',2,1.94));canvas.dispatchEvent(pointer('pointerup',2,1.94));await el.updateComplete;
 expect(el.config!.groups[0]!.points).toEqual([[0,-2],[4,-2],[4,4],[0,4]]);
 expect(el.config!.groups[1]!.bounds).toEqual([[0,-5,0],[4,-2,3]]);vi.unstubAllGlobals();
});

it('selects chimney floors even when floor bounds are inferred from rooms',async()=>{
 const el=new AlArchitectureEditor(),config=roomsConfig();
 config.groups=[{...newGroup('building','structure'),children:[{...newGroup('ground','floor'),name:'Ground',children:[{...newGroup('room','area'),bounds:[[0,0,0],[4,4,3]]}]},{...newGroup('upper','floor'),name:'Upper',children:[{...newGroup('bedroom','area'),bounds:[[0,0,3],[4,4,6]]}]}]}];el.config=config;el.room='room';document.body.append(el);await el.updateComplete;
 const button=(text:string)=>[...el.shadowRoot!.querySelectorAll('button')].find(b=>b.textContent?.trim()===text)!;
 button('Add chimney').click();await el.updateComplete;
 for(const name of ['Ground','Upper']){
 const label=[...el.shadowRoot!.querySelectorAll('label')].find(l=>l.textContent?.trim()===name)!;
 const input=label.querySelector('input')!;input.checked=true;input.dispatchEvent(new Event('change'));await el.updateComplete;
 }
 const chimney=walkGroups(el.config!).find(e=>e.group.id==='room')!.group.architecture![0]!;
 expect(chimney.floors).toEqual(['ground','upper']);expect(chimney.position[2]).toBe(0);expect(chimney.height).toBe(6);
});
