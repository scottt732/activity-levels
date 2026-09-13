import { afterEach, expect, it, vi } from "vitest";
import { AlRoomPlan } from "../src/al-room-plan";
import { newGroup } from "../src/model";
import { newFixture } from "../src/room-fixtures";
afterEach(()=>{document.body.replaceChildren();vi.unstubAllGlobals();});
it("places inside the actual polygon, aims visually, and supports keyboard marker selection",async()=>{
  const el=new AlRoomPlan();el.group={...newGroup("room","area"),bounds:[[0,0,0],[4,4,3]],points:[[0,0],[4,0],[4,2],[2,2],[2,4],[0,4]]};
  el.fixture={...newFixture("binary_sensor.motion"),position:[1,1,2]};document.body.append(el);await el.updateComplete;
  vi.stubGlobal("DOMPoint",class {constructor(public x:number,public y:number){}matrixTransform(){return this;}});
  const canvas=el.shadowRoot!.querySelector("svg")!;
  Object.defineProperty(canvas,"getScreenCTM",{value:()=>({inverse:()=>({})})});
  const placed=vi.fn(),aim=vi.fn(),select=vi.fn();el.addEventListener("al-fixture-position",placed);el.addEventListener("al-fixture-aim",aim);el.addEventListener("al-fixture-select",select);
  canvas.dispatchEvent(new MouseEvent("click",{clientX:3,clientY:-3}));await el.updateComplete;
  expect(placed).not.toHaveBeenCalled();expect(el.shadowRoot!.textContent).toContain("inside the room");
  canvas.dispatchEvent(new MouseEvent("click",{clientX:1,clientY:-2}));expect(placed.mock.calls[0]![0].detail).toEqual([1,2,2]);
  el.mode="aim";await el.updateComplete;canvas.dispatchEvent(new MouseEvent("click",{clientX:1,clientY:-3}));expect(aim.mock.calls[0]![0].detail).toBe(90);
  el.shadowRoot!.querySelector("circle")!.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter"}));expect(select).toHaveBeenCalledOnce();
  el.disabled=true;await el.updateComplete;canvas.dispatchEvent(new MouseEvent("click",{clientX:1,clientY:-1}));expect(aim).toHaveBeenCalledOnce();
});


it("aims with a dedicated handle without switching placement mode",async()=>{
 const el=new AlRoomPlan();el.group={...newGroup("room","area"),bounds:[[0,0,0],[4,4,3]]};el.fixture={...newFixture("binary_sensor.motion"),position:[1,1,2]};el.minimal=true;
 document.body.append(el);await el.updateComplete;
 const aim=vi.fn();el.addEventListener("al-fixture-aim",aim);
 el.shadowRoot!.querySelector('[aria-label="Aim sensor"]')!.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowLeft",shiftKey:true}));
 expect(aim.mock.calls[0]![0].detail).toBe(15);
 expect(el.shadowRoot!.querySelector("p")!.hidden).toBe(true);
 expect(el.mode).toBe("place");
});

import {newOpening,snapOpening} from "../src/room-openings";
it("selects neighbors without moving an opening and requires a deliberate marker drag",async()=>{
 const el=new AlRoomPlan();el.group={...newGroup("room","area"),bounds:[[0,0,0],[4,4,3]]};el.opening={...newOpening("window"),position:[2,0,1]};el.neighbors=[el.group,{...newGroup("next","area"),name:"Next",bounds:[[4,0,0],[8,4,3]]}];
 document.body.append(el);await el.updateComplete;
 vi.stubGlobal("DOMPoint",class {constructor(public x:number,public y:number){}matrixTransform(){return this;}});
 const canvas=el.shadowRoot!.querySelector("svg")!;Object.defineProperty(canvas,"getScreenCTM",{value:()=>({inverse:()=>({})})});Object.defineProperty(canvas,"setPointerCapture",{value:vi.fn()});
 const moved=vi.fn(),selected=vi.fn();el.addEventListener("al-opening-position",moved);el.addEventListener("al-plan-select",selected);
 const pointer=(type:string,x:number,y:number)=>{const e=new MouseEvent(type,{bubbles:true,clientX:x,clientY:y,button:0});Object.defineProperty(e,"pointerId",{value:1});return e;};
 canvas.dispatchEvent(pointer("pointerdown",3,-2));canvas.dispatchEvent(pointer("pointerup",3,-2));canvas.dispatchEvent(new MouseEvent("click",{bubbles:true,clientX:3,clientY:-2}));expect(moved).not.toHaveBeenCalled();
 el.shadowRoot!.querySelector('[aria-label="Select room Next"]')!.dispatchEvent(new MouseEvent("click",{bubbles:true}));expect(selected.mock.calls[0]![0].detail).toEqual({room:"next",opening:undefined});expect(moved).not.toHaveBeenCalled();
 el.shadowRoot!.querySelector(".opening-marker")!.dispatchEvent(pointer("pointerdown",2,0));canvas.dispatchEvent(pointer("pointermove",3,0));expect(moved).not.toHaveBeenCalled();canvas.dispatchEvent(pointer("pointermove",6,-1));expect(moved.mock.calls[0]![0].detail).toEqual([6,1,1]);
});
it("switches to a perpendicular wall and skips walls too short for the window",()=>{
 const room={bounds:[[0,0,0],[4,4,3]] as [[number,number,number],[number,number,number]]};
 expect(snapOpening(room,[3,0.1,1],2).position).toEqual([3,0,1]);
 expect(snapOpening(room,[3.9,1.2,1],2).position).toEqual([4,1.2,1]);
 const narrow={bounds:[[0,0,0],[1,4,3]] as typeof room.bounds};
 expect(Math.abs(snapOpening(narrow,[.8,.1,1],2).yaw)).toBe(90);
});

it("snaps sensors to corners before walls within twelve screen pixels",async()=>{
 const el=new AlRoomPlan();el.group={...newGroup("room","area"),bounds:[[10,10,0],[14,14,3]]};el.fixture={...newFixture("binary_sensor.motion"),position:[12,12,2]};
 document.body.append(el);await el.updateComplete;
 vi.stubGlobal("DOMPoint",class {constructor(public x:number,public y:number){}matrixTransform(){return {x:this.x/100,y:this.y/100};}});
 const canvas=el.shadowRoot!.querySelector("svg")!;Object.defineProperty(canvas,"getScreenCTM",{value:()=>({a:100,b:0,inverse:()=>({})})});
 const placed=vi.fn();el.addEventListener("al-fixture-position",placed);
 canvas.dispatchEvent(new MouseEvent("click",{clientX:1006,clientY:-1006}));
 expect(placed.mock.calls.at(-1)![0].detail).toEqual([10,10,2]);
 // Slightly outside the room can still snap to its exact boundary.
 canvas.dispatchEvent(new MouseEvent("click",{clientX:994,clientY:-1200}));
 expect(placed.mock.calls.at(-1)![0].detail).toEqual([10,12,2]);
 canvas.dispatchEvent(new MouseEvent("click",{clientX:1030,clientY:-1030}));
 expect(placed.mock.calls.at(-1)![0].detail).toEqual([10.3,10.3,2]);
 // Light placement remains free even close to a wall.
 el.fixture={...el.fixture,kind:"light"};await el.updateComplete;
 canvas.dispatchEvent(new MouseEvent("click",{clientX:1006,clientY:-1006}));
 expect(placed.mock.calls.at(-1)![0].detail).toEqual([10.06,10.06,2]);
});
