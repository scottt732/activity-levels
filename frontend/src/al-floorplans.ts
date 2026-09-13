import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./al-floorplan-viewer";
import "./al-floorplan-import";
import "./al-property-layout";
import "./al-room-device-editor";
import { walkGroups } from "./model";
import type { PropertyValues } from "lit";
import { floorplanSource } from "./floorplan-store";
import type { FloorplanSource, FloorplanTelemetry } from "./floorplan-store";
import { viewerOptions } from "./floorplan-style";
import type { ViewerSettings } from "./floorplan-style";
import type { Config, HomeAssistant, LiveState } from "./types";

/** Keep the import editor mounted while viewing geometry so a preview is not discarded by collapse. */
@customElement("al-floorplans")
export class AlFloorplans extends LitElement {
  static styles = css`
    :host { display:block; position:relative; height:calc(100dvh - 64px); min-height:400px; overflow:hidden; color:#d8edf2; background:#101d27; --primary-text-color:#d8edf2; --secondary-text-color:#91adba; --card-background-color:#142b38; --secondary-background-color:#1b3a48; --divider-color:#345261; --primary-color:#80ddeb; }
    :host(:fullscreen) { height:100dvh; }
    .fullscreen { position:absolute; right:54px; top:12px; z-index:8; height:32px; }
    .scene { position:absolute; inset:0; } .scene.shifted { left:400px; }
    al-floorplan-viewer, al-room-device-editor { display:block; height:100%; }
    [hidden] { display:none !important; }
    .rail { position:absolute; left:10px; top:12px; z-index:8; display:flex; flex-direction:column; gap:6px; padding:6px; border:1px solid #426477; background:#10232ee8; border-radius:8px; }
    button { font:inherit; color:inherit; background:#152d3bdd; border:1px solid #36576b; border-radius:4px; padding:5px 8px; cursor:pointer; }
    button:focus-visible { outline:2px solid #9be6f3; outline-offset:2px; } button:disabled { opacity:.45; cursor:default; }
    .rail button { width:32px; height:32px; padding:0; font-size:18px; background:transparent; border-color:transparent; }
    button[aria-pressed=true] { color:#aff4ff; border-color:#7cd7e8; background:#244654; }
    .save { position:absolute; top:12px; left:50%; transform:translateX(-50%); z-index:9; display:flex; gap:6px; align-items:center; font-size:12px; }
    .status { position:absolute; bottom:10px; left:70px; max-width:calc(100% - 140px); z-index:10; font-size:12px; background:#142b38ed; padding:6px 10px; }
    .page { position:absolute; top:64px; bottom:16px; left:62px; width:330px; z-index:5; overflow:auto; border:1px solid #426477; border-left:2px solid #80ddeb; background:#102633f5; border-radius:8px; font-size:12px; }
    .page > al-property-layout, .page > al-floorplan-import { display:block; padding:0 12px; }
    .page header { position:sticky; top:0; background:#102633; z-index:1; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; font-size:14px; }
    @media(pointer:coarse) { .rail button { width:44px; height:44px; } button { min-height:44px; } .page { left:76px; } }
    @media(max-width:760px) { .scene.shifted { left:0; } .page { left:62px; right:12px; width:auto; } .save { left:auto; right:64px; transform:none; } }
  `;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ type: Boolean }) disabled = false;

  @property({type:Boolean}) dirty=false;
  @property({type:Boolean}) blocked=false;
  @property({type:String}) status="";
  @state() private page:"live"|"openings"|"sensors"|"lights"|"property"|"import"|"settings"="live";
  @state() private editRoom="";
  @state() private telemetry?: FloorplanTelemetry;
  @state() private lights: Record<string,string[]> = {};
  @state() private settings: ViewerSettings = {};
  @state() private error = "";
  @state() private preferenceError = "";
  private source?: FloorplanSource;
  private unsubscribe?: () => void;
  private entry = "";
  override connectedCallback(): void { super.connectedCallback(); this.connect(); }
  override disconnectedCallback(): void { super.disconnectedCallback(); this.unsubscribe?.(); this.unsubscribe=undefined; }
  protected override updated(changed: PropertyValues): void { if(changed.has("hass")) this.connect(); }
  private connect(): void {
    if(!this.hass || !this.isConnected) return;
    const source=floorplanSource(this.hass);
    if(this.source===source && this.unsubscribe) return;
    this.unsubscribe?.(); this.source=source;
    this.unsubscribe=source.subscribe(({data,error})=>{
      this.error=error ?? "";
      if(!data) return;
      this.lights=data.lights; this.telemetry=data.telemetry;
      if(this.entry!==data.entry_id) {
        this.entry=data.entry_id;
        try { const raw=localStorage.getItem(`al-floorplan:${this.entry}`); this.settings=raw?JSON.parse(raw):{}; viewerOptions(this.settings); }
        catch { this.settings={};this.preferenceError="Saved viewer settings could not be loaded. Defaults are shown."; }
      }
    });
  }
  private saveSettings(event: CustomEvent<ViewerSettings>): void {
    this.settings=event.detail; this.preferenceError="";
    try { if(this.entry) localStorage.setItem(`al-floorplan:${this.entry}`,JSON.stringify(this.settings)); }
    catch {this.preferenceError="Viewer settings changed, but this browser could not save them.";}
  }
  private navigate(page:typeof this.page):void {
    this.page=page;
    if (["openings","sensors","lights"].includes(page) && this.config) {
      const rooms=walkGroups(this.config).filter(e=>e.group.bounds && !["property","structure","floor"].includes(e.group.kind));
      if (!rooms.some(e=>e.group.id===this.editRoom)) this.editRoom=rooms[0]?.group.id ?? "";
      if (!this.editRoom) this.page="import";
    }
  }
  private action(name:string):void {
    const editor=this.renderRoot.querySelector("al-room-device-editor") as import("./al-room-device-editor").AlRoomDeviceEditor|null;
    if(name==="al-save-config" && editor && !editor.flushDraft())return;
    if(name==="al-discard-config")editor?.resetDraft();
    this.dispatchEvent(new CustomEvent(name,{bubbles:true,composed:true}));}
  protected override render() {
    if (!this.config) return nothing;
    const editing=["openings","sensors","lights"].includes(this.page),panel=this.page==="property" || this.page==="import";
    return html`
      <div class=${`scene${panel?" shifted":""}`} ?hidden=${editing}>
        <al-floorplan-viewer workspace .settingsOpen=${this.page==="settings"} .hideHud=${panel || this.page==="settings"}
          @al-room-selected=${(e:CustomEvent<string>)=>{this.editRoom=e.detail;}}
          @al-edit-room=${(e:CustomEvent<string>)=>{this.editRoom=e.detail;this.navigate("openings");}}
          .config=${this.config} .live=${this.live} .hass=${this.hass} .lights=${this.lights}
          .telemetry=${this.error ? undefined : this.telemetry} .settings=${this.settings} @al-viewer-settings=${this.saveSettings}></al-floorplan-viewer>
      </div>
      ${editing?html`<al-room-device-editor @al-editor-room=${(e:CustomEvent<string>)=>{this.editRoom=e.detail;}} workspace .section=${this.page} .room=${this.editRoom} .lights=${this.lights} .live=${this.live} .config=${this.config} .hass=${this.hass} .disabled=${this.disabled}></al-room-device-editor>`:nothing}
      <button class="fullscreen" aria-label="Toggle fullscreen" title="Fullscreen" @click=${async()=>{try{if(this.matches(":fullscreen"))await document.exitFullscreen();else await this.requestFullscreen();}catch{this.preferenceError="Fullscreen is unavailable in this browser.";}}}>⛶</button>
      <nav class="rail" aria-label="Floorplan tools">
        <button aria-label="Exit floorplan" title="Back to Activity Levels" @click=${()=>this.action("al-exit-floorplan")}>←</button>
        ${([ ["live","◈","Live telemetry"],["openings","▣","Doors & windows"],["sensors","◎","Motion & occupancy"],["lights","☼","Lights"],["property","⌖","Property layout"],["import","⇧","Import floorplan"],["settings","⚙","Viewer settings"] ] as const).map(([page,icon,label])=>html`<button aria-label=${label} title=${label} aria-pressed=${this.page===page} @click=${()=>this.navigate(page)}>${icon}</button>`)}
      </nav>
      <div class="save"><button ?disabled=${!this.dirty || this.disabled} @click=${()=>this.action("al-discard-config")}>Discard</button><button ?disabled=${!this.dirty || this.disabled || this.blocked} @click=${()=>this.action("al-save-config")}>${this.disabled?"Saving…":this.dirty?"Save changes":"Saved"}</button></div>
      <section class="page" aria-label="Property layout" ?hidden=${this.page!=="property"}><header>Property layout<button aria-label="Close property layout" @click=${()=>this.navigate("live")}>×</button></header><al-property-layout .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-property-layout></section>
      <section class="page" aria-label="Import floorplan" ?hidden=${this.page!=="import"}><header>Import floorplan<button aria-label="Close import" @click=${()=>this.navigate("live")}>×</button></header><al-floorplan-import .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-floorplan-import></section>
      ${this.error || this.preferenceError || this.status || this.blocked ? html`<div class="status" role="status">${this.error || this.preferenceError || this.status || "Configuration needs attention before saving. Exit to review validation errors."}</div>` : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap { "al-floorplans": AlFloorplans }
}
