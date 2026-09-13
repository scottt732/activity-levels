import { afterEach, expect, it, vi } from "vitest";
import { AlOrientationControl } from "../src/al-orientation-control";

afterEach(() => document.body.replaceChildren());

async function setup() {
  const element = new AlOrientationControl();
  document.body.append(element);
  await element.updateComplete;
  return element;
}

function pointer(target: SVGSVGElement, type: string, x: number, y: number, id = 1) {
  const event = new MouseEvent(type, { clientX:x, clientY:y, button:0, bubbles:true });
  Object.defineProperty(event, "pointerId", { value:id });
  target.dispatchEvent(event);
}

it("updates aim while dragging, shows active mode, and releases capture", async () => {
  const element = await setup();
  const dial = element.shadowRoot!.querySelector("svg")!;
  vi.spyOn(dial, "getBoundingClientRect").mockReturnValue({left:0,top:0,width:132,height:132} as DOMRect);
  const capture = vi.fn(), release = vi.fn();
  Object.defineProperties(dial, {
    setPointerCapture:{value:capture}, hasPointerCapture:{value:() => true}, releasePointerCapture:{value:release},
  });
  const change = vi.fn();
  element.addEventListener("al-orientation-change", change);
  pointer(dial, "pointerdown", 120, 66);
  pointer(dial, "pointermove", 66, 0);
  await element.updateComplete;
  expect(capture).toHaveBeenCalledWith(1);
  expect(element.yaw).toBe(90);
  expect(element.shadowRoot!.textContent).toContain("Aiming — drag");
  expect(change.mock.lastCall![0].detail).toEqual({yaw:90,pitch:0});
  expect(change.mock.lastCall![0].composed).toBe(true);
  pointer(dial, "pointermove", 0, 66, 2);
  expect(element.yaw).toBe(90);
  pointer(dial, "pointerup", 66, 0);
  await element.updateComplete;
  expect(release).toHaveBeenCalledWith(1);
  pointer(dial, "pointermove", 0, 66);
  expect(element.yaw).toBe(90);
  expect(element.shadowRoot!.textContent).not.toContain("Aiming — drag");
});

it("supports keyboard precision, bounded tilt, reset, and disabled controls", async () => {
  const element = await setup();
  const dial = element.shadowRoot!.querySelector("svg")!;
  dial.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowRight"}));
  expect(element.yaw).toBe(359);
  dial.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowLeft",shiftKey:true}));
  expect(element.yaw).toBe(14);
  element.pitch = 89;
  dial.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowUp",shiftKey:true}));
  expect(element.pitch).toBe(90);
  dial.dispatchEvent(new KeyboardEvent("keydown", {key:"Home"}));
  expect([element.yaw, element.pitch]).toEqual([0, 0]);
  element.disabled = true;
  await element.updateComplete;
  dial.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowLeft"}));
  expect(element.yaw).toBe(0);
  expect(dial.getAttribute("tabindex")).toBe("-1");
  expect([...element.shadowRoot!.querySelectorAll("button")].every(button => button.disabled)).toBe(true);
});


it("snaps direction to selected increments without changing the other axis",async()=>{
 const el=await setup();el.yaw=7;el.pitch=-8;await el.updateComplete;
 const select=el.shadowRoot!.querySelector<HTMLSelectElement>('[aria-label="Aim snap"]')!;
 select.value="15";select.dispatchEvent(new Event("change"));await el.updateComplete;
 el.shadowRoot!.querySelector<HTMLButtonElement>('[aria-label="Increase direction"]')!.click();
 expect(el.yaw).toBe(15);expect(el.pitch).toBe(-8);
 select.value="45";select.dispatchEvent(new Event("change"));await el.updateComplete;
 el.shadowRoot!.querySelector("svg")!.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowLeft"}));
 expect(el.yaw).toBe(45);expect(el.pitch).toBe(-8);
});
