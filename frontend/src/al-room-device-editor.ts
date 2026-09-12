import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { alChange } from "./events";
import { walkGroups } from "./model";
import { newFixture, saveFixture } from "./room-fixtures";
import type { Config, HomeAssistant, RoomFixture } from "./types";
import "./al-floorplan-viewer";

@customElement("al-room-device-editor")
export class AlRoomDeviceEditor extends LitElement {
  static styles=css`
    :host { display:block; } fieldset { border:0; padding:0; margin:0; min-width:0; }
    .fields { display:flex; flex-wrap:wrap; gap:12px; } label { display:flex; flex-direction:column; gap:4px; margin:6px 0; }
    input,select,button { font:inherit; padding:8px; color:var(--primary-text-color); background:var(--card-background-color,white); border:1px solid var(--divider-color,#888); border-radius:6px; }
    button { cursor:pointer; margin:6px 8px 6px 0; } button:disabled { opacity:.5; cursor:default; }
    input[type=number] { width:110px; } .check { flex-direction:row; align-items:center; }
    .muted { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f66); }
    ul { padding:0; list-style:none; } li { border-bottom:1px solid var(--divider-color,#888); padding:4px 0; }
  `;
  @property({attribute:false}) config?: Config;
  @property({attribute:false}) hass?: HomeAssistant;
  @property({type:Boolean}) disabled=false;
  @state() private room="";
  @state() private fixture=newFixture();
  @state() private original?:string;
  @state() private placing=false;
  @state() private error="";
  private get group() { return this.config && walkGroups(this.config).find(e=>e.group.id===this.room)?.group; }
  private reset():void {
    const b=this.group?.bounds;
    this.fixture={...newFixture(),position:b ? [(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2,b[0][2]+Math.min(1.5,b[1][2]-b[0][2])] : [0,0,0]};
    this.original=undefined;this.error="";this.placing=false;
  }
  private patch(patch:Partial<RoomFixture>):void { this.fixture={...this.fixture,...patch};this.error=""; }
  private save():void {
    if(!this.config || this.disabled) return;
    try {this.dispatchEvent(alChange(saveFixture(this.config,this.room,this.fixture,this.original)));this.original=this.fixture.entity;this.placing=false;this.error="";}
    catch(error) {this.error=(error as Error).message;}
  }
  private removeFixture(entity:string):void {
    if(!this.config || this.disabled) return;
    const next=structuredClone(this.config),group=walkGroups(next).find(e=>e.group.id===this.room)?.group;
    if(!group) return;
    group.fixtures=group.fixtures?.filter(f=>f.entity!==entity);
    this.dispatchEvent(alChange(next));if(entity===this.original)this.reset();
  }
  private numeric(key:"yaw"|"pitch"|"fov"|"vertical_fov"|"range",label:string,min:number,max:number) {
    return html`<label>${label}<input type="number" data-field=${key} min=${min} max=${max} step="any" .value=${String(this.fixture[key])}
      @input=${(e:Event)=>this.patch({[key]:(e.target as HTMLInputElement).valueAsNumber})}></label>`;
  }
  protected override render() {
    if(!this.config)return nothing;
    const rooms=walkGroups(this.config).filter(e=>e.group.bounds && !["property","structure","floor"].includes(e.group.kind));
    const group=this.group, b=group?.bounds;
    let preview=this.config;
    if(group && b) {
      // Invalid form values remain editable but are never uploaded to GPU geometry.
      try {preview=saveFixture(this.config,this.room,{...this.fixture,entity:this.fixture.entity || "binary_sensor.placement_preview"},this.original);}
      catch { /* The existing valid placements remain visible until the form is valid. */ }
    }
    return html`<p>Place motion sensors, occupancy sensors, and lights in a room. Changes join your configuration draft; use the panel's Save to persist them.</p>
      <fieldset ?disabled=${this.disabled}>
        <label>Room<select id="device-room" .value=${this.room} @change=${(e:Event)=>{this.room=(e.target as HTMLSelectElement).value;this.reset();}}>
          <option value="">Choose a room</option>${rooms.map(e=>html`<option value=${e.group.id} .selected=${e.group.id===this.room}>${e.group.name || e.group.id}</option>`)}
        </select></label>
        ${b?html`<ul>${group?.fixtures?.map(f=>html`<li>${f.name || f.entity} · ${f.kind}
          <button type="button" @click=${()=>{this.fixture=structuredClone(f);this.original=f.entity;this.error="";}}>Edit</button>
          <button type="button" @click=${()=>this.removeFixture(f.entity)}>Remove</button></li>`)}</ul>
        <button type="button" @click=${()=>this.reset()}>New placement</button>
        <div class="fields">
          <label>Type<select id="fixture-kind" .value=${this.fixture.kind} @change=${(e:Event)=>this.patch({kind:(e.target as HTMLSelectElement).value as RoomFixture["kind"]})}>
            ${["motion","occupancy","light"].map(k=>html`<option .selected=${k===this.fixture.kind} value=${k}>${k}</option>`)}</select></label>
          <label>Home Assistant entity<input id="fixture-entity" list="room-entities" .value=${this.fixture.entity} placeholder=${this.fixture.kind==="light"?"light.ceiling":"binary_sensor.motion"}
            @input=${(e:Event)=>this.patch({entity:(e.target as HTMLInputElement).value})}></label>
          <datalist id="room-entities">${Object.values(this.hass?.states ?? {}).filter(e=>e.entity_id.startsWith(this.fixture.kind==="light"?"light.":"binary_sensor.")).map(e=>html`<option value=${e.entity_id}>${e.attributes.friendly_name ?? e.entity_id}</option>`)}</datalist>
          <label>Label<input maxlength="100" .value=${this.fixture.name} @input=${(e:Event)=>this.patch({name:(e.target as HTMLInputElement).value})}></label>
          <label>Mount<input maxlength="60" placeholder="Corner, wall, plug-in…" .value=${this.fixture.mount} @input=${(e:Event)=>this.patch({mount:(e.target as HTMLInputElement).value})}></label>
          <label>Model / technology<input maxlength="60" placeholder="Z-Wave, ESPHome, Screek 2A…" .value=${this.fixture.technology} @input=${(e:Event)=>this.patch({technology:(e.target as HTMLInputElement).value})}></label>
        </div>
        <div class="fields">
          ${([0,1] as const).map(i=>html`<label>${i===0?"X":"Y"} (m)<input type="number" step="any" .value=${String(this.fixture.position[i])} @input=${(e:Event)=>{const p=[...this.fixture.position] as [number,number,number];p[i]=(e.target as HTMLInputElement).valueAsNumber;this.patch({position:p});}}></label>`)}
          <label>Height above floor (m)<input id="fixture-height" type="number" min="0" max=${b[1][2]-b[0][2]} step="any" .value=${String(Number((this.fixture.position[2]-b[0][2]).toFixed(3)))}
            @input=${(e:Event)=>this.patch({position:[this.fixture.position[0],this.fixture.position[1],b[0][2]+(e.target as HTMLInputElement).valueAsNumber]})}></label>
          ${this.numeric("yaw","Direction (°)",-360,360)}${this.numeric("pitch","Tilt (°)",-90,90)}
          ${this.fixture.kind!=="light"?html`${this.numeric("fov","Horizontal view (°)",1,170)}${this.numeric("vertical_fov","Vertical view (°)",1,170)}${this.numeric("range","Range (m; 0 = hidden)",0,100)}`:nothing}
        </div>
        <p class="muted">Direction 0° points along +X; 90° along +Y. Negative tilt aims down. Coverage is an approximate cone, not a detection boundary or a person's location; walls do not clip it.</p>
        <label class="check"><input id="place-device" type="checkbox" .checked=${this.placing} @change=${(e:Event)=>{this.placing=(e.target as HTMLInputElement).checked;}}>Click in the 3D room to place at the chosen height</label>
        <button id="save-fixture" type="button" @click=${()=>this.save()}>${this.original?"Update":"Add"} placement to draft</button>
        ${this.error?html`<p class="error" role="alert">${this.error}</p>`:nothing}
        <al-floorplan-viewer .config=${{groups:preview.groups}} .room=${this.room} .hass=${this.hass}
          .placementHeight=${this.placing && !this.disabled && Number.isFinite(this.fixture.position[2])?this.fixture.position[2]:undefined}
          @al-fixture-position=${(e:CustomEvent<[number,number,number]>)=>{e.stopPropagation();if(!this.disabled)this.patch({position:e.detail.map(v=>Number(v.toFixed(3))) as [number,number,number]});}}></al-floorplan-viewer>
        `:html`<p class="muted">Choose a room with floorplan dimensions first.</p>`}
      </fieldset>`;
  }
}
