import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { keyed } from "lit/directives/keyed.js";
import { customElement, property, state } from "lit/decorators.js";
import { alChange } from "./events";
import { walkGroups } from "./model";
import { newFixture, saveFixture, snapWindow, initialFixturePosition, insideRoom, readFixture } from "./room-fixtures";
import { applyProfile, matchesProfile, parseProfiles, roomCandidates } from "./sensor-profiles";
import {newOpening,saveOpening,snapOpening,readOpening,openingEntities,openingState} from "./room-openings";
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
    [hidden] { display:none !important; }
    :host([workspace]) { height:100%; font-size:12px; color:#d8edf2; }
    :host([workspace]) fieldset, :host([workspace]) .workspace { height:100%; min-height:0; }
    :host([workspace]) .workspace { display:grid; grid-template-columns:58% 42%; border:0; border-radius:0; }
    :host([workspace]) .scene-pane { height:100%; }
    :host([workspace]) .plan-pane { height:100%; box-sizing:border-box; padding:66px 12px 12px; --room-plan-height:calc(100% - 1px); }
    :host([workspace]) .plan-pane > div, :host([workspace]) al-room-plan { height:100%; }
    :host([workspace]) .plan-pane h3 { font-size:12px; text-transform:uppercase; letter-spacing:.15em; margin:0 0 8px; }
    :host([workspace]) .editor-controls { position:absolute; top:60px; left:62px; width:260px; max-width:none; max-height:calc(100% - 78px); margin:0; padding:10px; border-radius:8px; background:#102633f2; }
    :host([workspace]) button, :host([workspace]) select, :host([workspace]) input, :host([workspace]) textarea { padding:4px 6px; font-size:12px; border-radius:3px; background:#163140; border-color:#355365; }
    :host([workspace]) button { margin:3px 3px 3px 0; min-height:28px; }
    :host([workspace]) details { margin:4px 0; } :host([workspace]) summary { padding:5px 0; }
    :host([workspace]) label { margin:5px 0; } :host([workspace]) .muted { font-size:11px; }
    :host([workspace]) .device { background:transparent; border-color:transparent; padding:5px 4px; margin:0; }
    :host([workspace]) .device:hover { background:#244652; } :host([workspace]) .device small { font-size:10px; color:#91adba; }
    :host([workspace]) .editor-controls input[type=checkbox] { width:auto; }
    :host([workspace]) label.check, .check { display:flex; flex-direction:row; align-items:center; gap:6px; }
    .device-information { position:absolute; z-index:6; top:60px; left:340px; width:280px; max-height:calc(100% - 90px); overflow:auto; padding:12px; background:#102633f5; border:1px solid #80ddeb; border-radius:8px; font-size:12px; }
    .device-information header { display:flex; justify-content:space-between; align-items:center; }
    @media(max-width:760px){.device-information{left:76px;right:12px;width:auto;}}
    .view-toggle { display:none; }
    .page-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:8px 0; }
    .page-heading h3 { font-size:14px; margin:0; }
    .room-tools { display:grid; grid-template-columns:minmax(0,1fr) 95px; align-items:center; gap:5px; } .room-tools > label:first-child { flex:1; }
    .room-tools label { min-width:0; } .room-tools select { width:100%; }
    :host([workspace]) .status:empty { display:none; }
    @media(pointer:coarse) { :host([workspace]) button, :host([workspace]) select, :host([workspace]) input:not([type=checkbox]) { min-height:44px; font-size:14px; } :host([workspace]) .editor-controls { left:76px; } }
    @media(max-width:760px) { .view-toggle { display:inline-block; } :host([workspace]) .workspace { grid-template-columns:100%; } :host([workspace]) .scene-pane { height:100%; } :host([workspace]) .plan-pane { display:none; } :host([workspace][plan-view]) .scene-pane { display:none; } :host([workspace][plan-view]) .plan-pane { display:block; } :host([workspace]) .editor-controls { top:60px; width:230px; max-height:42%; } }

  `;
  @property({type:Boolean,reflect:true}) workspace=false;
  @property({type:String}) section:"all"|"openings"|"sensors"|"lights"="all";
  @state() private aimSnap=0;
  @state() private information=false;
  @state() private adding=false;
  @state() private profilesPage=false;
  @property({attribute:false}) config?:Config;
  @property({attribute:false}) lights:Record<string,string[]>={};
  @property({attribute:false}) hass?:HomeAssistant;
  @property({attribute:false}) live:LiveState|null=null;
  @property({type:Boolean}) disabled=false;
  @property({type:String}) room="";
  @state() private unitChoice:"auto"|LengthUnit="auto";
  @state() private contactSearch="";
  @state() private allContacts=false;
  @state() private legacyWindow?:string;
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
    if(changed.has("room") || changed.has("section"))this.reset();
    // Live telemetry must not recreate every mesh or discard sensor state transitions.
    if(this.config && ["config","fixture","room","original","opening","originalOpening"].some(key=>changed.has(key))) {
      let preview=this.opening?this.openingConfig():this.config;this.previewError="";
      try{if(this.opening)preview=saveOpening(this.openingConfig(),this.room,this.opening,this.originalOpening);else if(this.fixture.entity)preview=saveFixture(this.config,this.room,this.fixture,this.original);}
      catch(error){
        this.previewError=(error as Error).message;
        // Valid finite geometry remains visible while it is being fitted to the room.
        // This copy only feeds the previews; Save still runs full placement validation.
        const opening=this.opening && readOpening(this.opening),fixture=readFixture(this.fixture);
        if(opening || fixture){preview=structuredClone(this.opening?this.openingConfig():this.config);const room=walkGroups(preview).find(e=>e.group.id===this.room)?.group;
          if(room && opening)room.openings=[...(room.openings ?? []).filter(o=>o.id!==(this.originalOpening ?? opening.id)),opening];
          else if(room && fixture)room.fixtures=[...(room.fixtures ?? []).filter(f=>f.entity!==(this.original ?? fixture.entity)),fixture];
        }
      }
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
    this.information=false;this.adding=false;this.profilesPage=false;this.legacyWindow=undefined;this.addKind="";
    this.fixture={...newFixture(),position:this.group?initialFixturePosition(this.group):[0,0,0]};
    this.opening=undefined;this.originalOpening=undefined;this.original=undefined;this.error="";this.notice="";this.mode="place";this.profile="";this.profileName="";this.search="";
  }
  private select(entity:string):void {
    if(this.disabled)return;
    if(entity===this.fixture.entity && !this.opening)return;
    this.opening=undefined;this.originalOpening=undefined;this.legacyWindow=undefined;
    const saved=this.group?.fixtures?.find(f=>f.entity===entity);
    if(saved?.kind==="window"){this.editLegacyWindow(saved);return;}
    if(saved){this.fixture=structuredClone(saved);this.original=entity;this.profile=saved.profile_id ?? "";}
    else {
      const candidate=this.candidates.find(d=>d.entity===entity);if(!candidate)return;
      const position=this.group?initialFixturePosition(this.group):[0,0,0] as [number,number,number];
      const kind=this.addKind || (entity.startsWith("light.")?"light":candidate.device_class==="window" || candidate.device_class==="opening"?"window":candidate.device_class==="occupancy" || candidate.device_class==="presence"?"occupancy":"motion");
      if(kind==="window"){this.editOpening(undefined,"window");this.patchOpening({entities:[entity],name:candidate.name});return;}
      this.fixture={...newFixture(entity,kind),position,name:candidate.name};this.original=undefined;
      this.profile="";
    }
    if(this.fixture.kind==="window" && this.group)this.fixture={...this.fixture,...snapWindow(this.group,this.fixture.position,this.fixture.width)};
    if(!this.profile) {
      const candidate=this.candidates.find(d=>d.entity===entity);
      const matches=candidate?this.profiles.filter(p=>(p.kind==="light")===(this.fixture.kind==="light") && matchesProfile(p,candidate)):[];
      this.profile=matches.length===1?matches[0]!.id:"";
    }
    this.addKind="";this.error="";this.notice="";this.profileName="";this.mode="place";if(this.workspace)this.flushDraft();
  }
  public resetDraft():void {this.reset();}
  public flushDraft():boolean {
    if(this.disabled)return false;
    if(!this.validLengths())return false;
    if(!this.workspace || (!this.fixture.entity && !this.opening))return true;
    try {
      const next=this.opening?saveOpening(this.openingConfig(),this.room,this.opening,this.originalOpening):saveFixture(this.config!,this.room,this.fixture,this.original);
      if(JSON.stringify(next)!==JSON.stringify(this.config)){this.config=next;this.dispatchEvent(alChange(next));}
      if(this.opening){this.originalOpening=this.opening.id;this.legacyWindow=undefined;}else this.original=this.fixture.entity;
      this.error="";return true;
    } catch(error){this.error=(error as Error).message;return false;}
  }
  private patch(patch:Partial<RoomFixture>):void {if(!this.disabled){this.fixture={...this.fixture,...patch};this.error="";this.notice="";if(this.workspace)this.flushDraft();}}
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
        coverage_shape:this.fixture.coverage_shape,kind:this.fixture.kind,fov:this.fixture.fov,vertical_fov:this.fixture.vertical_fov,range:this.fixture.range,
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
    this.legacyWindow=undefined;this.contactSearch="";this.allContacts=false;this.addKind="";this.fixture=newFixture();this.original=undefined;this.mode="place";this.error="";
    const b=this.group.bounds;
    const opening=value?structuredClone(value):newOpening(kind);
    if(!value)Object.assign(opening,snapOpening(this.group,[(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2,b[0][2]+(kind==="window"?Math.max(0,(b[1][2]-b[0][2]-opening.height)/2):0)],opening.width));
    this.opening=opening;this.originalOpening=value?.id;if(this.workspace && !value)this.flushDraft();
  }
  private openingConfig():Config {
    const config=structuredClone(this.config!);
    if(this.legacyWindow){const group=walkGroups(config).find(e=>e.group.id===this.room)?.group;if(group)group.fixtures=group.fixtures?.filter(f=>f.entity!==this.legacyWindow);}
    return config;
  }
  private editLegacyWindow(f:RoomFixture):void {
    this.editOpening({...newOpening("window"),name:f.name,entities:[f.entity],position:[f.position[0],f.position[1],f.position[2]-(f.height ?? 1.2)/2],yaw:f.yaw,width:f.width ?? 1,height:f.height ?? 1.2});
    this.legacyWindow=f.entity;
  }
  private objectTree() {
    const g=this.group;if(!g)return nothing;
    return ([ ["Windows",["window"]],["Doors",["interior_door","exterior_door"]],["Openings",["open_wall"]],["Motion sensors",["motion"]],["Occupancy sensors",["occupancy"]],["Lights",["light"]] ] as [string,string[]][]).map(([label,kinds])=>{
      if(this.section==="openings" && !["Windows","Doors","Openings"].includes(label) || this.section==="sensors" && !["Motion sensors","Occupancy sensors"].includes(label) || this.section==="lights" && label!=="Lights")return nothing;
      const openings=(g.openings ?? []).filter(o=>kinds.includes(o.kind)),fixtures=(g.fixtures ?? []).filter(f=>kinds.includes(f.kind));
      return html`<details open class="object-category"><summary>${label} (${openings.length+fixtures.length})</summary>
        ${openings.map(o=>html`<button class="device" type="button" data-object=${o.id} aria-pressed=${this.opening?.id===o.id} @click=${()=>this.editOpening(o)}>${o.name || o.kind.replaceAll("_"," ")}<small>${openingEntities(o).length} linked sensors · ${openingState(o,this.hass?.states ?? {})}</small></button>`)}
        ${fixtures.map(f=>html`<button class="device" type="button" data-entity=${f.entity} aria-pressed=${this.fixture.entity===f.entity || this.legacyWindow===f.entity} @click=${()=>this.select(f.entity)}>${f.name || f.entity}<small>${f.entity}</small></button>`)}
      </details>`;
    });
  }
  private contactsControl(o:RoomOpening) {
    const selected=openingEntities(o),roomIds=new Set(this.candidates.map(d=>d.entity));
    const ids=[...new Set([...selected,...this.registry.map(d=>d.entity),...Object.keys(this.hass?.states ?? {})])].filter(id=>id.startsWith("binary_sensor.") && (this.allContacts || roomIds.has(id) || selected.includes(id)) && (!this.contactSearch || `${id} ${this.hass?.states[id]?.attributes.friendly_name ?? ""}`.toLowerCase().includes(this.contactSearch.toLowerCase())));
    return html`<h4>Associated sensors / alarm circuits (${selected.length})</h4>
      <p class="muted">Link none, one, or several entities. Shared alarm circuits can be linked to every window or door they cover. Any active entity tints all linked objects red; it cannot tell us which one opened.</p>
      <label><input type="checkbox" .checked=${this.allContacts} @change=${(e:Event)=>{this.allContacts=(e.target as HTMLInputElement).checked;}}>Include sensors outside this room</label>
      <input aria-label="Find associated sensor" placeholder="Find a contact or alarm circuit…" .value=${this.contactSearch} @input=${(e:Event)=>{this.contactSearch=(e.target as HTMLInputElement).value;}}>
      <div class="devices">${ids.map(id=>html`<label><input type="checkbox" data-contact=${id} .checked=${selected.includes(id)} @change=${(e:Event)=>this.patchOpening({entity:undefined,entities:(e.target as HTMLInputElement).checked?[...selected,id]:selected.filter(v=>v!==id)})}>${this.hass?.states[id]?.attributes.friendly_name ?? id}<small>${id} · ${this.hass?.states[id]?.state ?? "unavailable"}</small></label>`)}</div>
      ${!selected.length?html`<label><input type="checkbox" .checked=${o.open} @change=${(e:Event)=>this.patchOpening({open:(e.target as HTMLInputElement).checked})}>Manually open</label>`:html`<p class="muted">State: ${openingState(o,this.hass?.states ?? {})}. All contacts must be off to show closed; unavailable contacts leave the state unknown.</p>`}`;
  }
  private patchOpening(patch:Partial<RoomOpening>):void {if(this.opening && !this.disabled){this.opening={...this.opening,...patch};this.error="";if(this.workspace)this.flushDraft();}}
  private saveDoor():void {
    if(!this.config || !this.opening || this.disabled || !this.validLengths())return;
    try{this.dispatchEvent(alChange(saveOpening(this.openingConfig(),this.room,this.opening,this.originalOpening)));this.legacyWindow=undefined;this.originalOpening=this.opening.id;this.notice="Opening added to draft. Use the panel's Save to persist it.";this.error="";}
    catch(error){this.error=(error as Error).message;}
  }
  private openingControl() {
    const o=this.opening;if(!o)return nothing;
    return html`<h3>${o.kind==="open_wall"?"Open wall":o.kind==="window"?"Window":"Door"}</h3>
      <label>Name<input aria-label="Opening name" .value=${o.name} @input=${(e:Event)=>this.patchOpening({name:(e.target as HTMLInputElement).value})}></label>
      <label>Opening type<select aria-label="Opening type" .value=${o.kind} @change=${(e:Event)=>this.patchOpening({kind:(e.target as HTMLSelectElement).value as RoomOpening["kind"]})}>${["interior_door","exterior_door","open_wall","window"].map(kind=>html`<option value=${kind} .selected=${o.kind===kind}>${kind.replaceAll("_"," ")}</option>`)}</select></label>
      ${(["width","height"] as const).map(key=>html`<label>${key} (${this.unit})${this.lengthInput(`Opening ${key}`,o[key],v=>this.patchOpening({[key]:v}),.1,20)}</label>`)}
      <label>Bottom above floor (${this.unit})${this.lengthInput("Opening elevation",o.position[2]-(this.group?.bounds?.[0][2] ?? 0),v=>this.patchOpening({position:[o.position[0],o.position[1],(this.group?.bounds?.[0][2] ?? 0)+v]}),0)}</label>
      ${o.kind!=="open_wall" && o.kind!=="window"?html`<p class="muted">Hinge left/right is viewed from inside this room facing the doorway.</p>
        <label>Hinge<select aria-label="Door hinge" .value=${o.hinge} @change=${(e:Event)=>this.patchOpening({hinge:(e.target as HTMLSelectElement).value as RoomOpening["hinge"]})}>${["left","right"].map(v=>html`<option .selected=${o.hinge===v} value=${v}>${v}</option>`)}</select></label>
        <label>Swing<select aria-label="Door swing" .value=${o.swing} @change=${(e:Event)=>this.patchOpening({swing:(e.target as HTMLSelectElement).value as RoomOpening["swing"]})}>${["in","out"].map(v=>html`<option .selected=${o.swing===v} value=${v}>${v}</option>`)}</select></label>
        `:nothing}
      ${o.kind!=="open_wall"?this.contactsControl(o):nothing}
      <p class="muted">Click near a wall to place and align the opening. An open wall always lets coverage pass.</p>
      <button ?hidden=${this.workspace} id="save-opening" type="button" @click=${()=>this.saveDoor()}>${this.originalOpening?"Update":"Add"} opening to draft</button>
      ${this.originalOpening || this.legacyWindow?html`<button type="button" @click=${()=>{if(!this.config || this.disabled)return;const next=this.openingConfig(),g=walkGroups(next).find(e=>e.group.id===this.room)?.group;if(g)g.openings=g.openings?.filter(v=>v.id!==this.originalOpening);this.dispatchEvent(alChange(next));this.opening=undefined;this.originalOpening=undefined;this.legacyWindow=undefined;}}>Remove opening</button>`:nothing}`;
  }
  protected override render() {
    if(!this.config)return nothing;
    const rooms=walkGroups(this.config).filter(e=>e.group.bounds && !["property","structure","floor"].includes(e.group.kind));
    const group=this.group,b=group?.bounds;
    const contextGroups=this.preview?walkGroups(this.preview).map(e=>e.group).filter(g=>g.bounds && !["property","structure","floor"].includes(g.kind) && (!b || (g.bounds[0][2]<b[1][2]-0.01 && g.bounds[1][2]>b[0][2]+0.01))):[];
    const previewGroup=contextGroups.find(g=>g.id===this.room) ?? group;
    const candidates=this.candidates.filter(d=>!d.placed && (!this.addKind || (this.addKind==="light")===d.entity.startsWith("light."))).filter(d=>`${d.name} ${d.entity}`.toLowerCase().includes(this.search.toLowerCase()));
    const device=this.candidates.find(d=>d.entity===this.fixture.entity);
    const suggestions=device?this.profiles.filter(p=>matchesProfile(p,device)):[];
    const profile=this.profiles.find(p=>p.id===this.profile);
    return html`<fieldset ?disabled=${this.disabled}>
      ${!this.workspace?html`      <label>Measurements<select id="length-unit" .value=${this.unitChoice} @change=${(e:Event)=>{this.unitChoice=(e.target as HTMLSelectElement).value as "auto"|LengthUnit;}}><option value="auto" .selected=${this.unitChoice==="auto"}>HA (${defaultLengthUnit(this.hass)})</option><option value="m" .selected=${this.unitChoice==="m"}>Meters</option><option value="ft" .selected=${this.unitChoice==="ft"}>Feet & inches</option></select></label>
      ${this.unit==="ft"?html`<p class="muted">Enter feet and inches (2′6″), inches (30″), or decimal feet (2.5).</p>`:nothing}
      <label>Room<select id="device-room" .value=${this.room} @change=${(e:Event)=>{this.room=(e.target as HTMLSelectElement).value;this.reset();this.dispatchEvent(new CustomEvent("al-editor-room",{detail:this.room,bubbles:true,composed:true}));}}>
        <option value="" disabled>Choose a room</option>${rooms.map(e=>html`<option value=${e.group.id} .selected=${e.group.id===this.room}>${e.group.name || e.group.id}</option>`)}</select></label>
`:nothing}
      ${b?html`<div class="workspace">
        <div class="scene-pane"><al-floorplan-viewer .workspace=${this.workspace} editing-preview .context=${true} .config=${this.preview} .room=${this.room} .live=${this.live} .hass=${this.hass} .lights=${this.lights} .settings=${{focus_activity:false,auto_rotate:false}}></al-floorplan-viewer></div>
        <div class="plan-pane"><h3 ?hidden=${this.workspace}>Top-down placement</h3><div>
        <div ?hidden=${this.workspace}><button type="button" aria-pressed=${this.mode==="place"} @click=${()=>{this.mode="place";}}>Place / move</button>
          <button type="button" aria-pressed=${this.mode==="aim"} ?disabled=${!this.fixture.entity || (this.fixture.kind==="light" || this.fixture.kind==="window")} @click=${()=>{this.mode="aim";}}>Aim</button></div>
        <al-room-plan .minimal=${this.workspace} .group=${previewGroup} .neighbors=${contextGroups} .opening=${this.opening} .hass=${this.hass} .fixture=${this.fixture} .mode=${this.mode} .disabled=${this.disabled}
          @al-fixture-position=${(e:CustomEvent<[number,number,number]>)=>{e.stopPropagation();this.patch(this.fixture.kind==="window" && this.group?snapWindow(this.group,e.detail,this.fixture.width):{position:e.detail});}}
          @al-fixture-aim=${(e:CustomEvent<number>)=>this.patch({yaw:this.aimSnap?Math.round(e.detail/this.aimSnap)*this.aimSnap:Number(e.detail.toFixed(1))})}
          @al-opening-position=${(e:CustomEvent<[number,number,number]>)=>{if(this.opening && this.group)this.patchOpening(snapOpening(this.group,e.detail,this.opening.width));}}
          @al-opening-select=${(e:CustomEvent<string>)=>{const opening=group?.openings?.find(o=>o.id===e.detail);if(opening)this.editOpening(opening);}}
          @al-fixture-select=${(e:CustomEvent<string>)=>this.select(e.detail)}></al-room-plan>
      </div></div><div class="editor-controls">
        ${this.workspace && !this.fixture.entity && !this.opening?html`<div class="room-tools">      <label><select aria-label="Room" id="device-room" .value=${this.room} @change=${(e:Event)=>{this.room=(e.target as HTMLSelectElement).value;this.reset();this.dispatchEvent(new CustomEvent("al-editor-room",{detail:this.room,bubbles:true,composed:true}));}}>
        <option value="" disabled>Choose a room</option>${rooms.map(e=>html`<option value=${e.group.id} .selected=${e.group.id===this.room}>${e.group.name || e.group.id}</option>`)}</select></label>
      <label><select aria-label="Measurements" id="length-unit" .value=${this.unitChoice} @change=${(e:Event)=>{this.unitChoice=(e.target as HTMLSelectElement).value as "auto"|LengthUnit;}}><option value="auto" .selected=${this.unitChoice==="auto"}>HA (${defaultLengthUnit(this.hass)})</option><option value="m" .selected=${this.unitChoice==="m"}>Meters</option><option value="ft" .selected=${this.unitChoice==="ft"}>Feet & inches</option></select></label>
</div><button type="button" class="view-toggle" aria-label="Toggle 2D view on narrow screens" @click=${()=>this.toggleAttribute("plan-view")}>2D / 3D</button>`:this.workspace?nothing:html`<h3>Room editor</h3>`}
        <div class="page-heading">${this.workspace && this.original?html`<button type="button" aria-label="Delete device" title="Delete device" @click=${()=>this.removeFixture()}>⌫</button>`:nothing}<h3>${this.section==="openings"?"Doors & windows":this.section==="sensors"?"Motion & occupancy":this.section==="lights"?"Lights":"Devices & windows"}</h3>
          ${this.workspace && (this.fixture.entity || this.opening || this.adding || this.profilesPage)?html`<button type="button" aria-label="Close object editor" @click=${()=>this.reset()}>×</button>`:this.workspace?html`<button type="button" @click=${()=>{this.adding=true;}}>+ Add</button>`:nothing}
        </div>
        ${!this.workspace || (!this.fixture.entity && !this.opening && !this.profilesPage)?html`
        <details class="add-menu" ?hidden=${this.workspace && !this.adding} .open=${this.workspace && this.adding}><summary>Add…</summary>
          <button ?hidden=${this.section!=="all" && this.section!=="openings"} id="new-door" type="button" @click=${()=>this.editOpening()}>Add door</button><button ?hidden=${this.section!=="all" && this.section!=="openings"} id="new-open-wall" type="button" @click=${()=>this.editOpening(undefined,"open_wall")}>Add open wall</button>
          <button ?hidden=${this.section!=="all" && this.section!=="openings"} type="button" data-add-window @click=${()=>this.editOpening(undefined,"window")}>Add window</button>
          ${(["motion","occupancy","light"] as const).map(kind=>html`<button ?hidden=${this.section!=="all" && (kind==="light"?this.section!=="lights":this.section!=="sensors")} type="button" data-add-kind=${kind} @click=${()=>{this.reset();this.adding=true;this.addKind=kind;}}>Add ${kind==="motion"?"motion sensor":kind==="occupancy"?"occupancy sensor":kind}</button>`)}
        </details>
        ${this.addKind?html`<p>Choose a room entity for the new ${this.addKind} placement.</p><button @click=${()=>{this.addKind="";}}>Show all devices</button>`:nothing}
        ${!this.workspace || !this.adding?this.objectTree():nothing}
        <details class="available-entities" ?hidden=${this.workspace && !this.adding} ?open=${!!this.addKind}><summary>Available room entities to add</summary>
        <input aria-label="Find room device" placeholder="Find a sensor or light…" .value=${this.search} @input=${(e:Event)=>{this.search=(e.target as HTMLInputElement).value;}}>
        <p class="muted">Activity inputs first, then contributing now, then most recently changed.</p>
        <div class="devices">${candidates.map(d=>html`<button type="button" class="device" data-entity=${d.entity} aria-pressed=${this.fixture.entity===d.entity} @click=${()=>this.select(d.entity)}>
          ${d.name}<small>${group?.fixtures?.find(f=>f.entity===d.entity)?.kind ?? d.device_class ?? "device"} · ${d.entity}</small><small>${d.contributing?"Contributing now":d.input?"Activity input":"Room device"}${d.placed?" · placed":""} · ${this.hass?.states[d.entity]?.state ?? "unavailable"}</small>
          ${d.changed?html`<small>Changed ${new Date(d.changed*1000).toLocaleString()}</small>`:nothing}</button>`)}</div>
        ${!candidates.length?html`<p class="muted">No matching devices. Assign devices to this room's HA area or configure its activity inputs. No whole-home fallback is used.</p>`:nothing}
        </details>
        ${this.registryError?html`<p class="error" role="alert">${this.registryError}</p>`:nothing}
        <button type="button" ?disabled=${this.loading} @click=${()=>void this.loadDevices()}>${this.loading?"Loading devices…":"Refresh room devices"}</button>
        ${this.workspace && this.section==="sensors"?html`<button type="button" @click=${()=>{this.profilesPage=true;}}>Model profiles</button>`:nothing}
        `:nothing}
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
        ${profile?html`<button type="button" @click=${()=>{this.information=!this.information;}}>Device information</button>`:nothing}
        ${(this.fixture.kind==="motion" || this.fixture.kind==="occupancy")?html`<al-orientation-control .snap=${this.aimSnap} @al-aim-snap=${(e:CustomEvent<number>)=>{this.aimSnap=e.detail;}} .yaw=${this.fixture.yaw} .pitch=${this.fixture.pitch} .disabled=${this.disabled} @al-orientation-change=${(e:CustomEvent<{yaw:number;pitch:number}>)=>this.patch(e.detail)}></al-orientation-control>
        <label class="check"><input type="checkbox" .checked=${this.fixture.look_down ?? false} @change=${(e:Event)=>this.patch({look_down:(e.target as HTMLInputElement).checked})}>Separate look-down coverage</label><p class="muted">Look-down shape is approximate. Match the physical lens setting.</p>`:nothing}
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
        <button ?hidden=${this.workspace} id="save-fixture" type="button" @click=${()=>this.save()}>${this.original?"Update":"Add"} placement to draft</button>
        ${this.original?html`<button ?hidden=${this.workspace} type="button" @click=${()=>this.removeFixture()}>Remove placement</button>`:nothing}
      `:nothing}
      ${this.previewError?html`<p class="error" role="status">Placement needs adjustment: ${this.previewError}</p>`:nothing}
      <p class="status" role="status">${this.notice}</p>${this.error?html`<p class="error" role="alert">${this.error}</p>`:nothing}
      <details ?hidden=${this.workspace && !this.profilesPage} .open=${this.workspace && this.profilesPage}><summary>Personal profiles · import / export</summary><p class="muted">Copy profiles between installations or contribute them to the bundled community catalog. Placement coordinates, linked entity ids and aiming angles are excluded. Import updates matching profile ids in the draft.</p>
        <textarea aria-label="Profile JSON" .value=${this.profileText} @input=${(e:Event)=>{this.profileText=(e.target as HTMLTextAreaElement).value;}}></textarea>
        <button type="button" @click=${()=>{this.profileText=JSON.stringify(parseProfiles(JSON.stringify(this.config?.sensor_profiles ?? [])),null,2);}}>Export personal profiles</button>
        <button type="button" @click=${()=>this.importProfiles()}>Import profiles to draft</button>
      </details></div>
      ${this.information && profile?html`<aside class="device-information" aria-label="Device information"><header>Device information <button type="button" aria-label="Close device information" @click=${()=>{this.information=false;}}>×</button></header><h3>${profile.name}</h3><p>${profile.notes}</p>${/^https?:\/\//.test(profile.source)?html`<a href=${profile.source} target="_blank" rel="noopener noreferrer">Profile source</a>`:nothing}</aside>`:nothing}
      </div>`:html`<p class="muted">Choose a room with floorplan dimensions first.</p>`}
    </fieldset>`;
  }
}
