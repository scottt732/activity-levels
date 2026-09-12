import { afterEach, expect, it, vi } from "vitest";
import { AlCameraControl } from "../src/al-camera-control";

afterEach(() => document.body.replaceChildren());

function pointer(target: HTMLElement, type: string, x: number, y: number, id = 1) {
  const event = new MouseEvent(type, {clientX:x,clientY:y,button:0,bubbles:true});
  Object.defineProperty(event, "pointerId", {value:id});
  target.dispatchEvent(event);
}

it("provides all camera actions as accessible buttons", async () => {
  const element = new AlCameraControl();document.body.append(element);await element.updateComplete;
  const actions:string[] = [];
  element.addEventListener("al-camera-action", event => actions.push((event as CustomEvent<string>).detail));
  for (const button of element.shadowRoot!.querySelectorAll("button")) button.click();
  expect(actions).toEqual(["up", "left", "reset", "right", "down", "out", "in", "top"]);
  element.disabled = true;await element.updateComplete;
  for (const button of element.shadowRoot!.querySelectorAll("button")) button.click();
  expect(actions).toHaveLength(8);
});

it("orbits continuously after a drag threshold and suppresses the following click", async () => {
  const element = new AlCameraControl();document.body.append(element);await element.updateComplete;
  const orbit = element.shadowRoot!.querySelector<HTMLElement>(".orbit")!;
  const release = vi.fn();
  Object.defineProperties(orbit, {setPointerCapture:{value:vi.fn()},hasPointerCapture:{value:() => true},releasePointerCapture:{value:release}});
  const actions = vi.fn();element.addEventListener("al-camera-action", actions);
  pointer(orbit, "pointerdown", 50, 50);
  pointer(orbit, "pointermove", 60, 50);
  expect(actions).not.toHaveBeenCalled();
  pointer(orbit, "pointermove", 74, 50);
  expect(actions).toHaveBeenCalledTimes(2);
  expect(actions.mock.lastCall![0].detail).toBe("right");
  pointer(orbit, "pointermove", 74, 26);
  expect(actions.mock.lastCall![0].detail).toBe("up");
  pointer(orbit, "pointerup", 74, 26);
  expect(release).toHaveBeenCalledWith(1);
  element.shadowRoot!.querySelector("button")!.dispatchEvent(new MouseEvent("click", {bubbles:true,detail:1}));
  expect(actions).toHaveBeenCalledTimes(4);
  element.shadowRoot!.querySelector("button")!.click();
  expect(actions).toHaveBeenCalledTimes(5);
  pointer(orbit, "pointermove", 200, 200);
  expect(actions).toHaveBeenCalledTimes(5);
});
