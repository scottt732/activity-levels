import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { keyed } from "lit/directives/keyed.js";
import { customElement, property, state } from "lit/decorators.js";
import { alChange } from "./events";
import { walkGroups } from "./model";
import { newFixture, saveFixture, snapWindow, initialFixturePosition, insideRoom } from "./room-fixtures";
import { applyProfile, matchesProfile, parseProfiles, roomCandidates } from "./sensor-profiles";
import {newOpening,saveOpening,snapOpening} from "./room-openings";
import {defaultLengthUnit,formatLengthInput,parseLength} from "./measurement-units";
import type {LengthUnit} from "./measurement-units";
import "./al-orientation-control";
import { SENSOR_CATALOG } from "./sensor-catalog";
import type { Config, HomeAssistant, LiveState, RoomDevice, RoomOpening, RoomFixture, SensorProfile } from "./types";
import "./al-room-plan";
import "./al-floorplan-viewer";

@customElement("al-room-device-editor")
export class AlRoomDeviceEditor extends LitElement {
  static styles=css`
    :host { display:block; } fieldset { border:0; padding:0; margin:0; min-width:0; }
    .workspace { position:relative; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); min-height:760px; border:1px solid #425461; border-radius:12px; overflow:hidden; background:#13232e; }
    .scene-pane { min-width:0; height:760px; } .scene-pane al-floorplan-viewer { height:100%; }
    .plan-pane { align-self:center; padding:20px; min-width:0; }
    .editor-controls { position:absolute; top:16px; left:16px; width:250px; max-width:23%; max-height:calc(100% - 32px); overflow:auto; box-sizing:border-box; padding:14px; background:#112531ed; border:1px solid #4c7186; border-left:3px solid #7edbec; border-radius:12px 12px 0 12px; }
    .editor-controls select,.editor-controls input:not([type=number]) { width:100%; min-width:0; } .editor-controls label { min-width:0; } .editor-controls .fields { display:block; }
    .editor-controls .devices { max-height:150px; }
    .fields { display:flex; flex-wrap:wrap; gap:12px; } label { display:flex; flex-direction:column; gap:4px; margin:6px 0; }
    input,select,button,textarea { font:inherit; padding:8px; color:var(--primary-text-color); background:var(--card-background-color,white); border:1px solid var(--divider-color,#888); border-radius:6px; box-sizing:border-box; }
    button { cursor:pointer; margin:6px 8px 6px 0; } button:disabled { opacity:.5; cursor:default; }
    button[aria-pressed=true] { border-color:var(--primary-color,#6edbec); background:var(--secondary-background-color,#304b60); }
    input[type=number] { width:110px; } .muted { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f66); }
    .devices { max-height:300px; overflow:auto; } .device { display:block; width:100%; text-align:left; margin:4px 0; overflow-wrap:anywhere; }
    .device small { display:block; } details { margin:16px 0; } summary { cursor:pointer; padding:8px 0; }
    textarea { width:100%; min-height:100px; } .status { min-height:20px; } h3 { margin:8px 0; }
    @media(max-width:1100px) { .workspace { display:flex; flex-direction:column; } .editor-controls { position:static; order:-1; width:auto; max-width:none; max-height:420px; margin:12px; } .scene-pane { height:450px; } .plan-pane { width:100%; box-sizing:border-box; } }
  `;
  @property({attribute:false}) config?:Config;
  @property({attribute:false}) lights:Record<string,string[]>={};
  @property({attribute:false}) hass?:HomeAssistant;
  @property({attribute:false}) live:LiveState|null=null;
  @property({type:Boolean}) disabled=false;
  @property({type:String}) room="";
  @state() private unitChoice:"auto"|LengthUnit="auto";
  @state() private addKind:RoomFixture["kind"]|""="";
  @state() private opening?:RoomOpening;
  @state() private originalOpening?:string;
  @state() private fixture=newFixture();
  @state() private original?:string;
  @state() private mode:"place"|"aim"="place";
  @state() private error="";
  @state() private notice="";
  @state() private registry:RoomDevice[]=[];
  @state() private registryError="";
  @state() private loading=false;
  @state() private search="";
  @state() private profile="";
  @state() private profileName="";
  @state() private profileText="";

  private loadedFor?:HomeAssistant["callWS"];
  private sequence=0;
  private preview?:Config;
  private previewError="";
  private get unit():LengthUnit{return this.unitChoice==="auto"?defaultLengthUnit(this.hass):this.unitChoice;}
  private length(value:number):string{return formatLengthInput(value,this.unit);}
  private validLengths():boolean {
    const invalid=this.renderRoot.querySelector<HTMLInputElement>('input[data-length]:invalid');
    if(invalid){invalid.reportValidity();return false;}return true;
  }
  private lengthInput(label:string,value:number,apply:(meters:number)=>void,min=-Infinity,max=Infinity,id="",field="") {
    const validate=(input:HTMLInputElement)=>{
      const meters=parseLength(input.value,this.unit);
      input.setCustomValidity(meters===null ? 'Enter a length, such as 2.5, 2′6″, or 30″.' : meters<min || meters>max ? 'Length is outside the allowed range.' : '');
      return meters;
    };
    return keyed(JSON.stringify([this.room,this.fixture.entity,this.opening?.id,this.unit]),html`<input type="text" data-length aria-label=${label} id=${id} data-field=${field} .value=${this.length(value)}
      @input=${(e:Event)=>validate(e.target as HTMLInputElement)}
      @change=${(e:Event)=>{const input=e.target as HTMLInputElement,meters=validate(input);if(input.reportValidity() && meters!==null){apply(meters);input.value=this.length(meters);}}}>`);
  }
  private get group() { return this.config && walkGroups(this.config).find(e=>e.group.id===this.room)?.group; }
  private get candidates() {return this.config?roomCandidates(this.config,this.room,this.registry,this.hass,this.live):[];}
  private get profiles() {return [...(this.config?.sensor_profiles ?? []),...SENSOR_CATALOG];}
  protected override willUpdate(changed:PropertyValues):void {
    if(changed.has("room"))this.reset();
    // Live telemetry must not recreate every mesh or discard sensor state transitions.
    if(this.config && ["config","fixture","room","original","opening","originalOpening"].some(key=>changed.has(key))) {
      let preview=this.config;this.previewError="";
      try{if(this.opening)preview=saveOpening(this.config,this.room,this.opening,this.originalOpening);else if(this.fixture.entity)preview=saveFixture(this.config,this.room,this.fixture,this.original);}
      catch(error){this.previewError=(error as Error).message;}
      this.preview=preview;
    }
  }
  protected override updated(changed:PropertyValues):void {
    if(this.room && (changed.has("room") || changed.has("hass") || changed.has("disabled")) && this.hass?.callWS!==this.loadedFor && !this.disabled)void this.loadDevices();
  }
  override disconnectedCallback():void {super.disconnectedCallback();this.sequence++;this.loadedFor=undefined;this.loading=false;}
  override connectedCallback():void {super.connectedCallback();if(this.room && this.hass && !this.disabled)void this.loadDevices();}
  private async loadDevices():Promise<void> {
    if(!this.hass || this.disabled || this.loading)return;
    const sequence=++this.sequence;this.loadedFor=this.hass.callWS;this.loading=true;this.registryError="";this.registry=[];
    try {
      const rows=await this.hass.callWS<RoomDevice[]>({type:"activity_levels/floorplan/devices"});
      if(sequence!==this.sequence)return;
      if(!Array.isArray(rows))throw new Error("Invalid device registry response.");
      this.registry=rows;
    } catch(error) {if(sequence===this.sequence)this.registryError=`Could not load room devices: ${(error as Error).message}. Configured inputs and saved placements remain available.`;}
    finally {if(sequence===this.sequence)this.loading=false;}
  }
  private reset():void {
    this.addKind="";
    this.fixture={...newFixture(),position:this.group?initialFixturePosition(this.group):[0,0,0]};
    this.opening=undefined;this.originalOpening=undefined;this.original=undefined;this.error="";this.notice="";this.mode="place";this.profile="";this.profileName="";this.search="";
  }
  private select(entity:string):void {
    if(this.disabled)return;
    if(entity===this.fixture.entity && !this.opening)return;
    this.opening=undefined;this.originalOpening=undefined;
    const saved=this.group?.fixtures?.find(f=>f.entity===entity);
    if(saved){this.fixture=structuredClone(saved);this.original=entity;this.profile=saved.profile_id ?? "";}
    else {
      const candidate=this.candidates.find(d=>d.entity===entity);if(!candidate)return;
      const position=this.group?initialFixturePosition(this.group):[0,0,0] as [number,number,number];
      const kind=this.addKind || (entity.startsWith("light.")?"light":candidate.device_class==="window" || candidate.device_class==="opening"?"window":candidate.device_class==="occupancy" || candidate.device_class==="presence"?"occupancy":"motion");
      this.fixture={...newFixture(entity,kind),position,name:candidate.name};this.original=undefined;
      this.profile="";
    }
    if(this.fixture.kind==="window" && this.group)this.fixture={...this.fixture,...snapWindow(this.group,this.fixture.position,this.fixture.width)};
    if(!this.profile) {
      const candidate=this.candidates.find(d=>d.entity===entity);
      const matches=candidate?this.profiles.filter(p=>(p.kind==="light")===(this.fixture.kind==="light") && matchesProfile(p,candidate)):[];
      this.profile=matches.length===1?matches[0]!.id:"";
    }
    this.addKind="";this.error="";this.notice="";this.profileName="";this.mode="place";
  }
  private patch(patch:Partial<RoomFixture>):void {if(!this.disabled){this.fixture={...this.fixture,...patch};this.error="";this.notice="";}}
  private save():void {
    if(!this.config || this.disabled || !this.validLengths())return;
    try {this.dispatchEvent(alChange(saveFixture(this.config,this.room,this.fixture,this.original)));this.original=this.fixture.entity;this.notice="Placement added to draft. Use Save in the panel to persist it.";this.error="";}
    catch(error){this.error=(error as Error).message;}
  }
  private removeFixture():void {
    if(!this.config || !this.original || this.disabled)return;
    const next=structuredClone(this.config),group=walkGroups(next).find(e=>e.group.id===this.room)?.group;
    if(!group)return;
    group.fixtures=group.fixtures?.filter(f=>f.entity!==this.original);this.dispatchEvent(alChange(next));this.reset();
  }
  private useProfile():void {
    const profile=this.profiles.find(p=>p.id===this.profile);if(!profile || this.disabled)return;
    if((profile.kind==="light")!==this.fixture.entity.startsWith("light.") || (profile.kind==="window")!==(this.fixture.kind==="window")){this.error="Choose a profile matching this entity's domain.";return;}
    this.patch(applyProfile(this.fixture,profile));this.profileName=profile.name;
  }
  private saveProfile():void {
    if(!this.config || this.disabled)return;
    try {
      const device=this.candidates.find(d=>d.entity===this.fixture.entity);
      const existing=this.config.sensor_profiles?.find(p=>p.id===this.profile);
      const match:SensorProfile["match"]={};
      for(const key of ["manufacturer","model","platform","device_class","entity_name"] as const)if(device?.[key])match[key]=device[key];
      const profile=parseProfiles(JSON.stringify([{id:existing?.id ?? `personal:${crypto.randomUUID()}`,name:this.profileName,
        kind:this.fixture.kind,fov:this.fixture.fov,vertical_fov:this.fixture.vertical_fov,range:this.fixture.range,
        technology:this.fixture.technology,mount:this.fixture.mount,...(this.fixture.look_down===undefined?{}:{look_down:this.fixture.look_down}),notes:existing?.notes ?? "",source:existing?.source ?? "",match:existing?.match ?? match}]))[0]!;
      const profiles=[...(this.config.sensor_profiles ?? []).filter(p=>p.id!==profile.id),profile];
      parseProfiles(JSON.stringify(profiles));this.dispatchEvent(alChange({...this.config,sensor_profiles:profiles}));
      this.profile=profile.id;this.notice="Model profile added to draft. Apply it to any matching device.";this.error="";
    } catch(error){this.error=(error as Error).message;}
  }
  private importProfiles():void {
    if(!this.config || this.disabled)return;
    try {
      const incoming=parseProfiles(this.profileText),ids=new Set(incoming.map(p=>p.id));
      if(incoming.some(p=>p.id.startsWith("community:")))throw new Error("Use personal profile ids when importing; community ids are reserved.");
      const profiles=parseProfiles(JSON.stringify([...(this.config.sensor_profiles ?? []).filter(p=>!ids.has(p.id)),...incoming]));
      this.dispatchEvent(alChange({...this.config,sensor_profiles:profiles}));this.notice="Profiles added to draft. Matching ids were updated.";this.error="";
    } catch(error){this.error=(error as Error).message;}
  }
  private numeric(key:"yaw"|"pitch"|"fov"|"vertical_fov"|"range"|"width"|"height",label:string,min:number,max:number) {
    const length=["range","width","height"].includes(key),value=this.fixture[key] ?? (key==="height"?1.2:1);
    const title=length?label.replace("(m",`(${this.unit}`):label;
    return html`<label>${title}${length?this.lengthInput(title,value,v=>this.patch({[key]:v}),min,max,"",key):html`<input type="number" data-field=${key} min=${min} max=${max} step="any" .value=${String(value)} @input=${(e:Event)=>this.patch({[key]:(e.target as HTMLInputElement).valueAsNumber})}>`}</label>`;
  }
  private editOpening(value?:RoomOpening,kind:RoomOpening["kind"]="interior_door"):void {
    if(this.disabled || !this.group?.bounds)return;
    this.addKind="";this.fixture=newFixture();this.original=undefined;this.mode="place";this.error="";
    const b=this.group.bounds;
    const opening=value?structuredClone(value):newOpening(kind);
    if(!value)Object.assign(opening,snapOpening(this.group,[(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2,b[0][2]],opening.width));
    this.opening=opening;this.originalOpening=value?.id;
  }
  private patchOpening(patch:Partial<RoomOpening>):void {if(this.opening && !this.disabled){this.opening={...this.opening,...patch};this.error="";}}
  private saveDoor():void {
    if(!this.config || !this.opening || this.disabled || !this.validLengths())return;
    try{this.dispatchEvent(alChange(saveOpening(this.config,this.room,this.opening,this.originalOpening)));this.originalOpening=this.opening.id;this.notice="Opening added to draft. Use the panel's Save to persist it.";this.error="";}
    catch(error){this.error=(error as Error).message;}
  }
  private openingControl() {
    const o=this.opening;if(!o)return nothing;
    return html`<h3>${o.kind==="open_wall"?"Open wall":"Door"}</h3>
      <label>Name<input aria-label="Opening name" .value=${o.name} @input=${(e:Event)=>this.patchOpening({name:(e.target as HTMLInputElement).value})}></label>
      <label>Opening type<select aria-label="Opening type" .value=${o.kind} @change=${(e:Event)=>this.patchOpening({kind:(e.target as HTMLSelectElement).value as RoomOpening["kind"]})}>${["interior_door","exterior_door","open_wall"].map(kind=>html`<option value=${kind} .selected=${o.kind===kind}>${kind.replaceAll("_"," ")}</option>`)}</select></label>
      ${(["width","height"] as const).map(key=>html`<label>${key} (${this.unit})${this.lengthInput(`Opening ${key}`,o[key],v=>this.patchOpening({[key]:v}),.1,20)}</label>`)}
      <label>Bottom above floor (${this.unit})${this.lengthInput("Opening elevation",o.position[2]-(this.group?.bounds?.[0][2] ?? 0),v=>this.patchOpening({position:[o.position[0],o.position[1],(this.group?.bounds?.[0][2] ?? 0)+v]}),0)}</label>
      ${o.kind!=="open_wall"?html`<p class="muted">Hinge left/right is viewed from inside this room facing the doorway.</p>
        <label>Hinge<select aria-label="Door hinge" .value=${o.hinge} @change=${(e:Event)=>this.patchOpening({hinge:(e.target as HTMLSelectElement).value as RoomOpening["hinge"]})}>${["left","right"].map(v=>html`<option .selected=${o.hinge===v} value=${v}>${v}</option>`)}</select></label>
        <label>Swing<select aria-label="Door swing" .value=${o.swing} @change=${(e:Event)=>this.patchOpening({swing:(e.target as HTMLSelectElement).value as RoomOpening["swing"]})}>${["in","out"].map(v=>html`<option .selected=${o.swing===v} value=${v}>${v}</option>`)}</select></label>
        <label>Contact sensor (optional)<select aria-label="Door contact" .value=${o.entity ?? ""} @change=${(e:Event)=>this.patchOpening({entity:(e.target as HTMLSelectElement).value || undefined})}><option value="">Manual open / closed</option>${this.candidates.filter(d=>d.entity.startsWith("binary_sensor.")).map(d=>html`<option value=${d.entity} .selected=${o.entity===d.entity}>${d.name}</option>`)}</select></label>
        ${!o.entity?html`<label><input type="checkbox" .checked=${o.open} @change=${(e:Event)=>this.patchOpening({open:(e.target as HTMLInputElement).checked})}>Door is open</label>`:html`<p class="muted">Door state: ${this.hass?.states[o.entity]?.state ?? "unavailable"}. Unknown contacts block coverage.</p>`}`:nothing}
      <p class="muted">Click near a wall to place and align the opening. An open wall always lets coverage pass.</p>
      <button id="save-opening" type="button" @click=${()=>this.saveDoor()}>${this.originalOpening?"Update":"Add"} opening to draft</button>
      ${this.originalOpening?html`<button type="button" @click=${()=>{if(!this.config || this.disabled)return;const next=structuredClone(this.config),g=walkGroups(next).find(e=>e.group.id===this.room)?.group;if(g)g.openings=g.openings?.filter(v=>v.id!==this.originalOpening);this.dispatchEvent(alChange(next));this.opening=undefined;this.originalOpening=undefined;}}>Remove opening</button>`:nothing}`;
  }
  protected override render() {
    if(!this.config)return nothing;
    const rooms=walkGroups(this.config).filter(e=>e.group.bounds && !["property","structure","floor"].includes(e.group.kind));
    const group=this.group,b=group?.bounds;
    const contextGroups=this.preview?walkGroups(this.preview).map(e=>e.group).filter(g=>g.bounds && !["property","structure","floor"].includes(g.kind) && (!b || (g.bounds[0][2]<b[1][2]-0.01 && g.bounds[1][2]>b[0][2]+0.01))):[];
    const previewGroup=contextGroups.find(g=>g.id===this.room) ?? group;
    const candidates=this.candidates.filter(d=>(!this.addKind || (!d.placed && (this.addKind==="light")===d.entity.startsWith("light.")))).filter(d=>`${d.name} ${d.entity}`.toLowerCase().includes(this.search.toLowerCase()));
    const device=this.candidates.find(d=>d.entity===this.fixture.entity);
    const suggestions=device?this.profiles.filter(p=>matchesProfile(p,device)):[];
    const profile=this.profiles.find(p=>p.id===this.profile);
    return html`<fieldset ?disabled=${this.disabled}>
      <label>Measurements<select id="length-unit" .value=${this.unitChoice} @change=${(e:Event)=>{this.unitChoice=(e.target as HTMLSelectElement).value as "auto"|LengthUnit;}}><option value="auto" .selected=${this.unitChoice==="auto"}>Home Assistant (${defaultLengthUnit(this.hass)})</option><option value="m" .selected=${this.unitChoice==="m"}>Meters</option><option value="ft" .selected=${this.unitChoice==="ft"}>Feet & inches</option></select></label>
      ${this.unit==="ft"?html`<p class="muted">Enter feet and inches (2′6″), inches (30″), or decimal feet (2.5).</p>`:nothing}
      <label>Room<select id="device-room" .value=${this.room} @change=${(e:Event)=>{this.room=(e.target as HTMLSelectElement).value;this.reset();}}>
        <option value="">Choose a room</option>${rooms.map(e=>html`<option value=${e.group.id} .selected=${e.group.id===this.room}>${e.group.name || e.group.id}</option>`)}</select></label>
      ${b?html`<div class="workspace">
        <div class="scene-pane"><al-floorplan-viewer editing-preview .context=${true} .config=${this.preview} .room=${this.room} .live=${this.live} .hass=${this.hass} .lights=${this.lights} .settings=${{focus_activity:false,auto_rotate:false}}></al-floorplan-viewer></div>
        <div class="plan-pane"><h3>Top-down placement</h3><div>
        <div><button type="button" aria-pressed=${this.mode==="place"} @click=${()=>{this.mode="place";}}>Place / move</button>
          <button type="button" aria-pressed=${this.mode==="aim"} ?disabled=${!this.fixture.entity || (this.fixture.kind==="light" || this.fixture.kind==="window")} @click=${()=>{this.mode="aim";}}>Aim</button></div>
        <al-room-plan .group=${previewGroup} .neighbors=${contextGroups} .opening=${this.opening} .hass=${this.hass} .fixture=${this.fixture} .mode=${this.mode} .disabled=${this.disabled}
          @al-fixture-position=${(e:CustomEvent<[number,number,number]>)=>{e.stopPropagation();this.patch(this.fixture.kind==="window" && this.group?snapWindow(this.group,e.detail,this.fixture.width):{position:e.detail});}}
          @al-fixture-aim=${(e:CustomEvent<number>)=>this.patch({yaw:Number(e.detail.toFixed(1))})}
          @al-opening-position=${(e:CustomEvent<[number,number,number]>)=>{if(this.opening && this.group)this.patchOpening(snapOpening(this.group,e.detail,this.opening.width));}}
          @al-opening-select=${(e:CustomEvent<string>)=>{const opening=group?.openings?.find(o=>o.id===e.detail);if(opening)this.editOpening(opening);}}
          @al-fixture-select=${(e:CustomEvent<string>)=>this.select(e.detail)}></al-room-plan>
      </div></div><div class="editor-controls"><h3>Room editor</h3>
        <h3>Devices & windows</h3>
        <details class="add-menu"><summary>Add…</summary>
          <button id="new-door" type="button" @click=${()=>this.editOpening()}>Add door</button><button id="new-open-wall" type="button" @click=${()=>this.editOpening(undefined,"open_wall")}>Add open wall</button>
          ${(["window","motion","occupancy","light"] as const).map(kind=>html`<button type="button" data-add-kind=${kind} @click=${()=>{this.reset();this.addKind=kind;}}>Add ${kind==="motion"?"motion sensor":kind==="occupancy"?"occupancy sensor":kind}</button>`)}
        </details>
        ${this.addKind?html`<p>Choose a room entity for the new ${this.addKind} placement.</p><button @click=${()=>{this.addKind="";}}>Show all devices</button>`:nothing}
        ${!this.addKind?(group?.openings ?? []).map(o=>html`<button type="button" class="device" aria-pressed=${this.opening?.id===o.id} @click=${()=>this.editOpening(o)}>${o.name || o.kind.replaceAll("_"," ")}<small>${o.kind.replaceAll("_"," ")}</small></button>`):nothing}
        <input aria-label="Find room device" placeholder="Find a sensor or light…" .value=${this.search} @input=${(e:Event)=>{this.search=(e.target as HTMLInputElement).value;}}>
        <p class="muted">Activity inputs first, then contributing now, then most recently changed.</p>
        <div class="devices">${candidates.map(d=>html`<button type="button" class="device" data-entity=${d.entity} aria-pressed=${this.fixture.entity===d.entity} @click=${()=>this.select(d.entity)}>
          ${d.name}<small>${group?.fixtures?.find(f=>f.entity===d.entity)?.kind ?? d.device_class ?? "device"} · ${d.entity}</small><small>${d.contributing?"Contributing now":d.input?"Activity input":"Room device"}${d.placed?" · placed":""} · ${this.hass?.states[d.entity]?.state ?? "unavailable"}</small>
          ${d.changed?html`<small>Changed ${new Date(d.changed*1000).toLocaleString()}</small>`:nothing}</button>`)}</div>
        ${!candidates.length?html`<p class="muted">No matching devices. Assign devices to this room's HA area or configure its activity inputs. No whole-home fallback is used.</p>`:nothing}
        ${this.registryError?html`<p class="error" role="alert">${this.registryError}</p>`:nothing}
        <button type="button" ?disabled=${this.loading} @click=${()=>void this.loadDevices()}>${this.loading?"Loading devices…":"Refresh room devices"}</button>
        ${this.openingControl()}
        ${device?html`<p class="muted">${[device.manufacturer,device.model,device.platform].filter(Boolean).join(" · ")}</p>`:nothing}
      ${this.fixture.entity?html`<h3>${this.fixture.name || this.fixture.entity}</h3>
        ${!insideRoom(group!,this.fixture.position)?html`<p class="error">This saved placement is outside the room.</p><button type="button" @click=${()=>this.patch(this.fixture.kind==="window"?snapWindow(group!,initialFixturePosition(group!),this.fixture.width):{position:initialFixturePosition(group!)})}>Move into room</button>`:nothing}
        ${this.fixture.kind==="window"?html`<p class="muted">Click near a wall to snap the window onto it. Red = open; blue = closed; gray = unavailable.</p><div class="fields">${this.numeric("width","Window width (m)",0.1,20)}${this.numeric("height","Window height (m)",0.1,20)}</div>`:nothing}
        <div class="fields"><label>${this.fixture.kind==="window"?`Window center above floor (${this.unit})`:`Height above floor (${this.unit})`}${this.lengthInput("Height above floor",this.fixture.position[2]-b[0][2],v=>this.patch({position:[this.fixture.position[0],this.fixture.position[1],b[0][2]+v]}),0,b[1][2]-b[0][2],"fixture-height")}</label>
          <label>Sensor model profile<select id="sensor-profile" .value=${this.profile} @change=${(e:Event)=>{this.profile=(e.target as HTMLSelectElement).value;}}>
            <option value="">Choose a profile</option>${this.profiles.filter(p=>(p.kind==="light")===this.fixture.entity.startsWith("light.") && (p.kind==="window")===(this.fixture.kind==="window")).map(p=>html`<option value=${p.id} .selected=${p.id===this.profile}>${suggestions.includes(p)?"Suggested · ":""}${p.name}</option>`)}</select></label>
          <button type="button" ?disabled=${!profile} @click=${()=>this.useProfile()}>Apply profile</button></div>
        ${suggestions.length?html`<p class="muted">Suggested from device metadata: ${suggestions.map(p=>p.name).join(", ")}. Confirm the model and sensor entity before applying.</p>`:nothing}
        ${profile?html`<p class="muted">${profile.notes}</p>${/^https?:\/\//.test(profile.source)?html`<a href=${profile.source} target="_blank" rel="noopener noreferrer">Profile source</a>`:nothing}`:nothing}
        ${(this.fixture.kind==="motion" || this.fixture.kind==="occupancy")?html`<al-orientation-control .yaw=${this.fixture.yaw} .pitch=${this.fixture.pitch} .disabled=${this.disabled} @al-orientation-change=${(e:CustomEvent<{yaw:number;pitch:number}>)=>this.patch(e.detail)}></al-orientation-control>
        <label><input type="checkbox" .checked=${this.fixture.look_down ?? false} @change=${(e:Event)=>this.patch({look_down:(e.target as HTMLInputElement).checked})}>Separate look-down coverage</label><p class="muted">Look-down shape is approximate. Match the physical lens setting.</p>`:nothing}
        <details><summary>Adjust characteristics and precise position</summary><div class="fields">
          <label>Type<select id="fixture-kind" .value=${this.fixture.kind} @change=${(e:Event)=>{const kind=(e.target as HTMLSelectElement).value as RoomFixture["kind"];this.patch({kind,profile_id:undefined,...(kind==="window" && this.group?snapWindow(this.group,this.fixture.position,this.fixture.width):{})});this.profile="";}}>${["motion","occupancy","light","window"].map(k=>html`<option value=${k} .selected=${k===this.fixture.kind}>${k}</option>`)}</select></label>
          <label>Label<input maxlength="100" .value=${this.fixture.name} @input=${(e:Event)=>this.patch({name:(e.target as HTMLInputElement).value})}></label>
          <label>Mount<input maxlength="60" .value=${this.fixture.mount} @input=${(e:Event)=>this.patch({mount:(e.target as HTMLInputElement).value})}></label>
          <label>Model / technology<input maxlength="60" .value=${this.fixture.technology} @input=${(e:Event)=>this.patch({technology:(e.target as HTMLInputElement).value})}></label>
          ${([0,1] as const).map(i=>html`<label>${i===0?"X":"Y"} (${this.unit})${this.lengthInput(i===0?"X":"Y",this.fixture.position[i],v=>{const p=[...this.fixture.position] as [number,number,number];p[i]=v;this.patch({position:p});})}</label>`)}
          ${this.numeric("yaw","Direction (°)",-360,360)}${this.numeric("pitch","Tilt (°)",-90,90)}
          ${(this.fixture.kind==="motion" || this.fixture.kind==="occupancy")?html`${this.numeric("fov","Horizontal view (°)",1,170)}${this.numeric("vertical_fov","Vertical view (°)",1,170)}${this.numeric("range","Range (m; 0 = hidden)",0,100)}`:nothing}
        </div><p class="muted">Coverage is approximate and clipped by solid room boundaries. The top-down sector illustrates horizontal coverage; use 3D to inspect tilt.</p>
        <label>Personal model name<input id="profile-name" maxlength="100" .value=${this.profileName} @input=${(e:Event)=>{this.profileName=(e.target as HTMLInputElement).value;}}></label>
        <button id="save-profile" type="button" @click=${()=>this.saveProfile()}>${this.config.sensor_profiles?.some(p=>p.id===this.profile)?"Update":"Save"} personal model profile</button></details>
        <button id="save-fixture" type="button" @click=${()=>this.save()}>${this.original?"Update":"Add"} placement to draft</button>
        ${this.original?html`<button type="button" @click=${()=>this.removeFixture()}>Remove placement</button>`:nothing}
      `:nothing}
      ${this.previewError?html`<p class="error" role="status">Preview unchanged: ${this.previewError}</p>`:nothing}
      <p class="status" role="status">${this.notice}</p>${this.error?html`<p class="error" role="alert">${this.error}</p>`:nothing}
      <details><summary>Personal profiles · import / export</summary><p class="muted">Copy profiles between installations or contribute them to the bundled community catalog. Placement coordinates, linked entity ids and aiming angles are excluded. Import updates matching profile ids in the draft.</p>
        <textarea aria-label="Profile JSON" .value=${this.profileText} @input=${(e:Event)=>{this.profileText=(e.target as HTMLTextAreaElement).value;}}></textarea>
        <button type="button" @click=${()=>{this.profileText=JSON.stringify(parseProfiles(JSON.stringify(this.config?.sensor_profiles ?? [])),null,2);}}>Export personal profiles</button>
        <button type="button" @click=${()=>this.importProfiles()}>Import profiles to draft</button>
      </details></div></div>`:html`<p class="muted">Choose a room with floorplan dimensions first.</p>`}
    </fieldset>`;
  }
}
