import { afterEach, expect, it, vi } from "vitest";
import type { HomeAssistant } from "../src/types";
const events=vi.hoisted(()=>({subscribe:vi.fn(),unsubscribe:vi.fn()}));
vi.mock("../src/floorplan-store",()=>{const source={subscribe:events.subscribe};return {floorplanSource:()=>source};});
await import("../src/al-floorplan-card");
import type { ActivityLevelsFloorplanCard } from "../src/al-floorplan-card";
afterEach(()=>{document.body.innerHTML="";vi.clearAllMocks();});
it("passes read-only geometry, live states and card settings to the shared viewer",async()=>{
  events.subscribe.mockImplementation(listener=>{listener({data:{entry_id:"a",config:{groups:[]},lights:{room:["light.room"]},live:{now:1,groups:{},voices:{}}}});return events.unsubscribe;});
  const card=document.createElement("activity-levels-floorplan-card") as ActivityLevelsFloorplanCard;
  card.setConfig({type:"custom:activity-levels-floorplan-card",ambient:true,ground_z:12.886});
  card.hass={callWS:vi.fn(),states:{}} as unknown as HomeAssistant;document.body.append(card);await card.updateComplete;await card.updateComplete;
  const viewer=card.shadowRoot!.querySelector("al-floorplan-viewer")!;
  expect(viewer.dashboard).toBe(true);expect(viewer.settings.ground_z).toBe(12.886);expect(viewer.lights.room).toEqual(["light.room"]);
  card.remove();expect(events.unsubscribe).toHaveBeenCalledOnce();
});
