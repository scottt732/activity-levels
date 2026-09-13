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

import {expandSpaces,collapseSpaces} from '../src/floorplan-spaces';
it('associates a drawn space with an existing activity group without duplicating it or losing inputs',async()=>{
 const el=new AlArchitectureEditor(),config=roomsConfig(),target={...newGroup('bathroom','area'),area_id:'ha_bath',name:'Bathroom',gain:2};
 config.groups=[{...newGroup('floor','floor'),architecture:[{id:'stairs',name:'Stairs',kind:'stairs',position:[1,2,0],width:1,run:3,height:3,yaw:0,steps:14,landing_bottom:0,landing_top:0,under_room:'space'}],children:[target]}];config.spaces=[{id:'space',name:'Bathroom outline',parent_id:'floor',bounds:[[1,2,0],[3,4,3]]}];
 el.config=expandSpaces(config);el.room='space';document.body.append(el);await el.updateComplete;
 const association=el.shadowRoot!.querySelector<HTMLSelectElement>('[aria-label="Activity association"]')!;association.value='group:bathroom';association.dispatchEvent(new Event('change'));await el.updateComplete;
 [...el.shadowRoot!.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Associate space')!.click();await el.updateComplete;
 const saved=collapseSpaces(el.config!),groups=walkGroups(saved);expect(groups).toHaveLength(2);expect(saved.spaces).toBeUndefined();
 expect(groups[1]!.group).toMatchObject({id:'bathroom',area_id:'ha_bath',gain:2,bounds:[[1,2,0],[3,4,3]]});expect(el.room).toBe('bathroom');expect(saved.groups[0]!.architecture![0]!.under_room).toBe('bathroom');
});
it('converts a space to a newly associated Home Assistant area only when explicitly chosen',async()=>{
 const el=new AlArchitectureEditor(),config=roomsConfig();config.groups=[newGroup('floor','floor')];config.spaces=[{id:'closet',name:'Closet',parent_id:'floor',bounds:[[0,0,0],[1,1,3]]}];el.config=expandSpaces(config);el.room='closet';
 el.hass={states:{},areas:{linen:{area_id:'linen',name:'Linen closet'}},callWS:vi.fn()} as unknown as import('../src/types').HomeAssistant;document.body.append(el);await el.updateComplete;
 const picker=el.shadowRoot!.querySelector<HTMLSelectElement>('[aria-label="Activity association"]')!;expect(picker.value).toBe('none');picker.value='area:linen';picker.dispatchEvent(new Event('change'));await el.updateComplete;
 [...el.shadowRoot!.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Associate space')!.click();await el.updateComplete;
 const saved=collapseSpaces(el.config!);expect(saved.spaces).toBeUndefined();expect(saved.groups[0]!.children[0]).toMatchObject({id:'closet',area_id:'linen'});
});
