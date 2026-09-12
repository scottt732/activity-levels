import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { alChange } from "./events";
import { walkGroups } from "./model";
import { newFixture, saveFixture, snapWindow } from "./room-fixtures";
import { applyProfile, matchesProfile, parseProfiles, roomCandidates } from "./sensor-profiles";
import { SENSOR_CATALOG } from "./sensor-catalog";
import type { Config, HomeAssistant, LiveState, RoomDevice, RoomFixture, SensorProfile } from "./types";
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
  private preview?:Pick<Config,"groups">;
  private previewError="";
  private get group() { return this.config && walkGroups(this.config).find(e=>e.group.id===this.room)?.group; }
  private get candidates() {return this.config?roomCandidates(this.config,this.room,this.registry,this.hass,this.live):[];}
  private get profiles() {return [...(this.config?.sensor_profiles ?? []),...SENSOR_CATALOG];}
  protected override willUpdate(changed:PropertyValues):void {
    if(changed.has("room"))this.reset();
    // Live telemetry must not recreate every mesh or discard sensor state transitions.
    if(this.config && ["config","fixture","room","original"].some(key=>changed.has(key))) {
      let preview=this.config;this.previewError="";
      if(this.fixture.entity)try{preview=saveFixture(this.config,this.room,this.fixture,this.original);}
      catch(error){this.previewError=(error as Error).message;}
      this.preview={groups:preview.groups};
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
    const b=this.group?.bounds;
    this.fixture={...newFixture(),position:b ? [(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2,b[0][2]+Math.min(1.5,b[1][2]-b[0][2])] : [0,0,0]};
    this.original=undefined;this.error="";this.notice="";this.mode="place";this.profile="";this.profileName="";this.search="";
  }
  private select(entity:string):void {
    if(this.disabled)return;
    if(entity===this.fixture.entity)return;
    const saved=this.group?.fixtures?.find(f=>f.entity===entity);
    if(saved){this.fixture=structuredClone(saved);this.original=entity;this.profile=saved.profile_id ?? "";}
    else {
      const candidate=this.candidates.find(d=>d.entity===entity);if(!candidate)return;
      const position=this.fixture.position;
      const kind=entity.startsWith("light.")?"light":candidate.device_class==="window" || candidate.device_class==="opening"?"window":candidate.device_class==="occupancy" || candidate.device_class==="presence"?"occupancy":"motion";
      this.fixture={...newFixture(entity,kind),position,name:candidate.name};this.original=undefined;
      this.profile="";
    }
    if(this.fixture.kind==="window" && this.group)this.fixture={...this.fixture,...snapWindow(this.group,this.fixture.position,this.fixture.width)};
    if(!this.profile) {
      const candidate=this.candidates.find(d=>d.entity===entity);
      const matches=candidate?this.profiles.filter(p=>(p.kind==="light")===(this.fixture.kind==="light") && matchesProfile(p,candidate)):[];
      this.profile=matches.length===1?matches[0]!.id:"";
    }
    this.error="";this.notice="";this.profileName="";this.mode="place";
  }
  private patch(patch:Partial<RoomFixture>):void {if(!this.disabled){this.fixture={...this.fixture,...patch};this.error="";this.notice="";}}
  private save():void {
    if(!this.config || this.disabled)return;
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
        technology:this.fixture.technology,mount:this.fixture.mount,notes:existing?.notes ?? "",source:existing?.source ?? "",match:existing?.match ?? match}]))[0]!;
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
    return html`<label>${label}<input type="number" data-field=${key} min=${min} max=${max} step="any" .value=${String(this.fixture[key] ?? (key==="height"?1.2:1))}
      @input=${(e:Event)=>this.patch({[key]:(e.target as HTMLInputElement).valueAsNumber})}></label>`;
  }
  protected override render() {
    if(!this.config)return nothing;
    const rooms=walkGroups(this.config).filter(e=>e.group.bounds && !["property","structure","floor"].includes(e.group.kind));
    const group=this.group,b=group?.bounds;
    const candidates=this.candidates.filter(d=>`${d.name} ${d.entity}`.toLowerCase().includes(this.search.toLowerCase()));
    const device=this.candidates.find(d=>d.entity===this.fixture.entity);
    const suggestions=device?this.profiles.filter(p=>matchesProfile(p,device)):[];
    const profile=this.profiles.find(p=>p.id===this.profile);
    return html`<fieldset ?disabled=${this.disabled}>
      <label>Room<select id="device-room" .value=${this.room} @change=${(e:Event)=>{this.room=(e.target as HTMLSelectElement).value;this.reset();}}>
        <option value="">Choose a room</option>${rooms.map(e=>html`<option value=${e.group.id} .selected=${e.group.id===this.room}>${e.group.name || e.group.id}</option>`)}</select></label>
      ${b?html`<div class="workspace">
        <div class="scene-pane"><al-floorplan-viewer editing-preview .config=${this.preview} .room=${this.room} .live=${this.live} .hass=${this.hass} .lights=${this.lights} .settings=${{focus_activity:false,auto_rotate:false}}></al-floorplan-viewer></div>
        <div class="plan-pane"><h3>Top-down placement</h3><div>
        <div><button type="button" aria-pressed=${this.mode==="place"} @click=${()=>{this.mode="place";}}>Place / move</button>
          <button type="button" aria-pressed=${this.mode==="aim"} ?disabled=${!this.fixture.entity || (this.fixture.kind==="light" || this.fixture.kind==="window")} @click=${()=>{this.mode="aim";}}>Aim</button></div>
        <al-room-plan .group=${group} .hass=${this.hass} .fixture=${this.fixture} .mode=${this.mode} .disabled=${this.disabled}
          @al-fixture-position=${(e:CustomEvent<[number,number,number]>)=>{e.stopPropagation();this.patch(this.fixture.kind==="window" && this.group?snapWindow(this.group,e.detail,this.fixture.width):{position:e.detail});}}
          @al-fixture-aim=${(e:CustomEvent<number>)=>this.patch({yaw:Number(e.detail.toFixed(1))})}
          @al-fixture-select=${(e:CustomEvent<string>)=>this.select(e.detail)}></al-room-plan>
      </div></div><div class="editor-controls"><h3>Devices & windows</h3>
        <input aria-label="Find room device" placeholder="Find a sensor or light…" .value=${this.search} @input=${(e:Event)=>{this.search=(e.target as HTMLInputElement).value;}}>
        <p class="muted">Activity inputs first, then contributing now, then most recently changed.</p>
        <div class="devices">${candidates.map(d=>html`<button type="button" class="device" data-entity=${d.entity} aria-pressed=${this.fixture.entity===d.entity} @click=${()=>this.select(d.entity)}>
          ${d.name}<small>${d.entity}</small><small>${d.contributing?"Contributing now":d.input?"Activity input":"Room device"}${d.placed?" · placed":""} · ${this.hass?.states[d.entity]?.state ?? "unavailable"}</small>
          ${d.changed?html`<small>Changed ${new Date(d.changed*1000).toLocaleString()}</small>`:nothing}</button>`)}</div>
        ${!candidates.length?html`<p class="muted">No matching devices. Assign devices to this room's HA area or configure its activity inputs. No whole-home fallback is used.</p>`:nothing}
        ${this.registryError?html`<p class="error" role="alert">${this.registryError}</p>`:nothing}
        <button type="button" ?disabled=${this.loading} @click=${()=>void this.loadDevices()}>${this.loading?"Loading devices…":"Refresh room devices"}</button>
        ${device?html`<p class="muted">${[device.manufacturer,device.model,device.platform].filter(Boolean).join(" · ")}</p>`:nothing}
      ${this.fixture.entity?html`<h3>${this.fixture.name || this.fixture.entity}</h3>
        ${this.fixture.kind==="window"?html`<p class="muted">Click near a wall to snap the window onto it. Red = open; blue = closed; gray = unavailable.</p><div class="fields">${this.numeric("width","Window width (m)",0.1,20)}${this.numeric("height","Window height (m)",0.1,20)}</div>`:nothing}
        <div class="fields"><label>${this.fixture.kind==="window"?"Window center above floor (m)":"Height above floor (m)"}<input id="fixture-height" type="number" min="0" max=${b[1][2]-b[0][2]} step="any" .value=${String(Number((this.fixture.position[2]-b[0][2]).toFixed(3)))}
          @input=${(e:Event)=>this.patch({position:[this.fixture.position[0],this.fixture.position[1],b[0][2]+(e.target as HTMLInputElement).valueAsNumber]})}></label>
          <label>Sensor model profile<select id="sensor-profile" .value=${this.profile} @change=${(e:Event)=>{this.profile=(e.target as HTMLSelectElement).value;}}>
            <option value="">Choose a profile</option>${this.profiles.filter(p=>(p.kind==="light")===this.fixture.entity.startsWith("light.") && (p.kind==="window")===(this.fixture.kind==="window")).map(p=>html`<option value=${p.id} .selected=${p.id===this.profile}>${suggestions.includes(p)?"Suggested · ":""}${p.name}</option>`)}</select></label>
          <button type="button" ?disabled=${!profile} @click=${()=>this.useProfile()}>Apply profile</button></div>
        ${suggestions.length?html`<p class="muted">Suggested from device metadata: ${suggestions.map(p=>p.name).join(", ")}. Confirm the model and sensor entity before applying.</p>`:nothing}
        ${profile?html`<p class="muted">${profile.notes}</p>${/^https?:\/\//.test(profile.source)?html`<a href=${profile.source} target="_blank" rel="noopener noreferrer">Profile source</a>`:nothing}`:nothing}
        <details><summary>Adjust characteristics and precise position</summary><div class="fields">
          <label>Type<select id="fixture-kind" .value=${this.fixture.kind} @change=${(e:Event)=>{const kind=(e.target as HTMLSelectElement).value as RoomFixture["kind"];this.patch({kind,profile_id:undefined,...(kind==="window" && this.group?snapWindow(this.group,this.fixture.position,this.fixture.width):{})});this.profile="";}}>${["motion","occupancy","light","window"].map(k=>html`<option value=${k} .selected=${k===this.fixture.kind}>${k}</option>`)}</select></label>
          <label>Label<input maxlength="100" .value=${this.fixture.name} @input=${(e:Event)=>this.patch({name:(e.target as HTMLInputElement).value})}></label>
          <label>Mount<input maxlength="60" .value=${this.fixture.mount} @input=${(e:Event)=>this.patch({mount:(e.target as HTMLInputElement).value})}></label>
          <label>Model / technology<input maxlength="60" .value=${this.fixture.technology} @input=${(e:Event)=>this.patch({technology:(e.target as HTMLInputElement).value})}></label>
          ${([0,1] as const).map(i=>html`<label>${i===0?"X":"Y"} (m)<input type="number" step="any" .value=${String(this.fixture.position[i])} @input=${(e:Event)=>{const p=[...this.fixture.position] as [number,number,number];p[i]=(e.target as HTMLInputElement).valueAsNumber;this.patch({position:p});}}></label>`)}
          ${this.numeric("yaw","Direction (°)",-360,360)}${this.numeric("pitch","Tilt (°)",-90,90)}
          ${(this.fixture.kind==="motion" || this.fixture.kind==="occupancy")?html`${this.numeric("fov","Horizontal view (°)",1,170)}${this.numeric("vertical_fov","Vertical view (°)",1,170)}${this.numeric("range","Range (m; 0 = hidden)",0,100)}`:nothing}
        </div><p class="muted">Coverage is approximate; walls do not clip it. The top-down sector illustrates horizontal coverage; use 3D to inspect tilt.</p>
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
