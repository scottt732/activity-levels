import { afterEach, expect, it } from "vitest";
import { AlRoomHud } from "../src/al-room-hud";
afterEach(()=>document.body.replaceChildren());
it("shows conditional idle timing, estimated people and held input without a false countdown", async()=>{
  const el=new AlRoomHud();el.now=1000;
  el.room={id:"room",label:"Living room",kind:"area",path:[],ancestors:[],footprint:[],low:0,high:3,container:false};
  el.live={now:1000,groups:{room:{value:2,max_value:5,last_activity:995}}};
  el.telemetry={now:1000,rooms:{room:{idle_by:1030,people:[{name:"Scott",entity:"person.scott",confidence:.9,t:999}],devices:[]}}};
  document.body.append(el);await el.updateComplete;
  expect(el.shadowRoot!.textContent).toContain("Idle within 30s");
  expect(el.shadowRoot!.textContent).toContain("Scott");
  expect(el.shadowRoot!.textContent).toContain("Estimated · 90%");
  el.telemetry={now:1000,rooms:{room:{idle_by:null,people:[],devices:[]}}};await el.updateComplete;
  expect(el.shadowRoot!.textContent).toContain("Held by ongoing input");
  expect(el.shadowRoot!.textContent).not.toContain("Idle within");
  el.now=1011;await el.updateComplete;
  expect(el.shadowRoot!.textContent).toContain("Idle forecast unavailable");
});
