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
