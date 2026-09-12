import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { activityReading, STALE_SECONDS } from "./floorplan-model";
import type { ActivityFrame, ScenePart } from "./floorplan-model";
import type { FloorplanTelemetry } from "./floorplan-store";
import type { HomeAssistant } from "./types";

const elapsed = (seconds: number): string => seconds < 60 ? `${Math.ceil(seconds)}s` : seconds < 3600 ? `${Math.ceil(seconds/60)}m` : `${Math.ceil(seconds/3600)}h`;

@customElement("al-room-hud")
export class AlRoomHud extends LitElement {
  static styles = css`
    :host { display:block; color:#dbf7ff; font:12px/1.5 var(--paper-font-body1_-_font-family,system-ui); }
    button { float:right; color:#c8eff6; background:transparent; border:1px solid #61cbe555; border-radius:4px; width:32px; height:32px; cursor:pointer; }
    section { background:linear-gradient(120deg,#0a1c2ef2,#102838dc); border:1px solid #61cbe577;
      border-left:3px solid #7ee3ef; border-radius:2px 14px 2px 14px; padding:14px; box-shadow:0 0 24px #26c7ef18; }
    .eyebrow { color:#8ad8e4; letter-spacing:.18em; font-size:10px; text-transform:uppercase; }
    h3 { margin:2px 0 8px; font-size:19px; font-weight:500; overflow-wrap:anywhere; }
    .value { font-size:26px; font-variant-numeric:tabular-nums; } .muted { color:#a4bdc9; }
    .meter { height:3px; background:#436775; margin:6px 0 10px; }
    .meter span { display:block; height:100%; background:#8be8f7; }
    p { margin:6px 0; } .people { display:flex; flex-wrap:wrap; gap:12px; margin:10px 0; }
    .person { display:flex; align-items:center; gap:7px; } img,.initial { width:32px; height:32px; border-radius:50%; border:1px solid #77cddb; object-fit:cover; }
    .initial { display:grid; place-items:center; background:#274557; }
    ul { margin:6px 0 0; padding:0; list-style:none; } li { overflow-wrap:anywhere; }
  `;
  @property({attribute:false}) room?: ScenePart;
  @property({attribute:false}) live: ActivityFrame | null = null;
  @property({attribute:false}) telemetry?: FloorplanTelemetry;
  @property({attribute:false}) hass?: HomeAssistant;
  @property({type:Number}) now=0;
  protected override render() {
    const room=this.room;
    if(!room) return nothing;
    const reading=activityReading(this.live,room.id,this.now);
    const fresh=this.telemetry && Number.isFinite(this.telemetry.now) && Math.abs(this.now-this.telemetry.now)<=STALE_SECONDS;
    const detail=fresh ? this.telemetry?.rooms[room.id] : undefined;
    const last=this.live?.groups[room.id]?.last_activity;
    const people=detail?.people.filter(p=>p.t!==null && Number.isFinite(p.t) && this.now-p.t<=120) ?? [];
    return html`<section aria-label="Room telemetry">
      <button type="button" aria-label="Dismiss room details" @click=${()=>this.dispatchEvent(new CustomEvent("al-dismiss-hud",{bubbles:true,composed:true}))}>×</button>
      <div class="eyebrow">Room telemetry · ${reading.status==="live"?"live":"awaiting update"}</div>
      <h3>${room.label}</h3>
      <span class="value">${reading.value===null?"—":reading.value.toFixed(1)}</span><span class="muted"> / ${reading.max ?? 5} activity</span>
      <div class="meter"><span style=${`width:${(reading.ratio ?? 0)*100}%`}></span></div>
      <p>Last active <strong>${last!=null && Number.isFinite(last)?`${elapsed(Math.max(0,this.now-last))} ago`:"unknown"}</strong></p>
      <p>${!detail ? "Idle forecast unavailable" : detail.idle_by===null ? "Held by ongoing input" : detail.idle_by<=this.now ? "Idle" : `Idle within ${elapsed(detail.idle_by-this.now)}`}</p>
      ${detail && detail.idle_by!==null && detail.idle_by>this.now ? html`<p class="muted">Assuming no further activity</p>` : nothing}
      <div class="people">${people.map(person=>{
        const entity=person.entity?this.hass?.states[person.entity]:undefined;
        const picture=entity?.attributes.entity_picture;
        const src=typeof picture==="string" && (picture.startsWith("/") || /^https?:\/\//.test(picture))?picture:undefined;
        return html`<div class="person">${src?html`<img src=${src} alt="" @error=${(e:Event)=>{(e.target as HTMLImageElement).hidden=true;}}>`:html`<span class="initial">${person.name.slice(0,1)}</span>`}
          <span>${person.name}<br><span class="muted">Estimated${person.confidence===null?"":` · ${Math.round(person.confidence*100)}%`}</span></span></div>`;
      })}</div>
      ${!people.length?html`<p class="muted">No current person estimate</p>`:nothing}
      ${detail?.devices.length?html`<p class="eyebrow">Estimated devices</p><ul>${detail.devices.map(d=>html`<li>${d.name ?? d.entity}${d.confidence===null?"":` · ${Math.round(d.confidence*100)}%`}</li>`)}</ul>`:nothing}
      ${room.fixtures?.length?html`<p class="eyebrow">Placed devices</p><ul>${room.fixtures.map(f=>html`<li>${f.name || this.hass?.states[f.entity]?.attributes.friendly_name || f.entity} · ${this.hass?.states[f.entity]?.state ?? "unavailable"}</li>`)}</ul>`:nothing}
    </section>`;
  }
}
