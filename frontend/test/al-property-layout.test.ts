import { afterEach, expect, it, vi } from "vitest";
import "../src/al-property-layout";
import type { AlPropertyLayout } from "../src/al-property-layout";
import type { HomeAssistant } from "../src/types";
import { roomsConfig } from "./fixtures";

afterEach(() => {document.body.innerHTML="";});
const mount = async () => {
  const el = document.createElement("al-property-layout") as AlPropertyLayout;
  el.config = roomsConfig(); document.body.append(el); await el.updateComplete; return el;
};
const button = (el:AlPropertyLayout, text:string) => [...el.shadowRoot!.querySelectorAll("button")].find(b=>b.textContent?.includes(text))!;
const field = (el:AlPropertyLayout, text:string, value:string) => {
  const label = [...el.shadowRoot!.querySelectorAll("label")].find(l=>l.textContent?.includes(text))!;
  const input = label.querySelector("input,textarea") as HTMLInputElement;
  input.value=value; input.dispatchEvent(new Event("input",{bubbles:true}));
};
it("loads HA location without silently changing the draft or requesting map tiles", async () => {
  const el=await mount(), change=vi.fn(); el.addEventListener("al-change",change);
  const callWS=vi.fn().mockResolvedValue({latitude:40,longitude:-74,elevation:22});
  el.hass={callWS} as unknown as HomeAssistant;
  button(el,"Use Home Assistant").click(); await vi.waitFor(()=>expect(callWS).toHaveBeenCalled()); await el.updateComplete;
  expect(change).not.toHaveBeenCalled(); expect(el.shadowRoot!.querySelector("image")).toBeNull();
  button(el,"Apply floorplan origin").click();
  expect(change.mock.calls[0]![0].detail.gps).toEqual({latitude:40,longitude:-74,elevation:22,rotation:0});
});
it("adds a polygon as one immutable draft edit and respects disabled editing", async () => {
  const el=await mount(), change=vi.fn(); el.addEventListener("al-change",change);
  field(el,"Name","Garden"); field(el,"Outline coordinates","0,0\n10,0\n10,10\n0,10");
  button(el,"Add ground feature").click();
  expect(change).toHaveBeenCalledOnce();
  expect(change.mock.calls[0]![0].detail.site.features[0].name).toBe("Garden");
  expect(el.config!.site).toBeUndefined();
  el.disabled=true; await el.updateComplete; button(el,"Add ground feature").click(); expect(change).toHaveBeenCalledOnce();
});
