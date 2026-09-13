import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { activityReading, floorplanModel, inScope, STALE_SECONDS } from "./floorplan-model";
import type { FloorplanGroup, FloorplanModel, FloorplanConfig, ActivityFrame } from "./floorplan-model";
import type { CameraAction, FloorplanRenderer } from "./floorplan-renderer";
import { KIND_DEFS } from "./kinds";
import { sharedStyles } from "./styles";
import { viewerOptions, roomLight, activeRule } from "./floorplan-style";
import type { ViewerSettings, ViewerOptions } from "./floorplan-style";
import type { HomeAssistant } from "./types";

import "./al-room-hud";
import "./al-camera-control";
import type { FloorplanTelemetry } from "./floorplan-store";

const format = (value: number): string => Number(value.toFixed(2)).toLocaleString();

@customElement("al-floorplan-viewer")
export class AlFloorplanViewer extends LitElement {
  static styles = [sharedStyles, css`
    :host { display: block; padding: 16px; }
    :host([editing-preview]) { padding:0; position:relative; }
    :host([editing-preview]) .viewer, :host([editing-preview]) .viewport { height:100%; }
    :host([editing-preview]) h2, :host([editing-preview]) > p, :host([editing-preview]) .legend, :host([editing-preview]) .issues { display:none; }
    :host([editing-preview]) .viewport { border:0; border-radius:0; }
    :host([editing-preview]) .toolbar { position:absolute; bottom:10px; left:280px; right:12px; z-index:2; margin:0; justify-content:center; }
    :host([editing-preview]) al-camera-control { margin-left:auto; }
    :host([editing-preview]) .toolbar button { padding:5px; font-size:12px; }
    @media(max-width:1100px) { :host([editing-preview]) .toolbar { left:12px; } }
    h2 { margin: 0 0 6px; }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 12px 0; }
    label { display: flex; align-items: center; gap: 8px; }
    button, select { font: inherit; color: var(--primary-text-color); background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #aaa); border-radius: 6px; padding: 8px 10px; }
    button { cursor: pointer; } button:disabled { cursor: default; opacity: .5; }
    :host([room]:not([room=""])) .viewer { display:block; }
    :host([room]:not([room=""])) aside, :host([room]:not([room=""])) .settings, :host([room]:not([room=""])) .toolbar label, :host([room]:not([room=""])) .live-status { display:none; }
    .viewer { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 16px; }
    .viewport { position: relative; min-width: 0; height: clamp(320px, 58vh, 680px); border-radius: 12px; overflow: hidden;
      background: radial-gradient(ellipse at 50% 35%, #263a49, #101c27 80%); border: 1px solid #425461; }
    al-room-hud { position:absolute; top:64px; left:14px; width:min(280px,calc(100% - 28px)); max-height:calc(100% - 130px); overflow:auto; pointer-events:auto; }
    #scene { position: absolute; inset: 0; }
    .overlay { position: absolute; inset: 0; display: grid; place-content: center; padding: 28px; text-align: center;
      color: #e2edf3; background: #14212bc9; }
    .overlay button { color: #eef6fa; background: #304a5b; }
    .legend { color: #d0e0e9; position: absolute; left: 16px; bottom: 12px; pointer-events: none; font-size: 12px; }
    .gradient { display: inline-block; width: 72px; height: 8px; border-radius: 8px; margin: 0 6px;
      background: linear-gradient(to right, #5fbad2, #ffbc66); }
    .groups { max-height: 440px; overflow: auto; }
    .group { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;
      margin: 4px 0; text-align: left; border-color: transparent; }
    .group[aria-pressed="true"] { border-color: var(--primary-color, #03a9f4); background: var(--secondary-background-color, #eee); }
    .group-name { overflow-wrap: anywhere; } .reading { white-space: nowrap; font-size: 12px; }
    .selection { padding-top: 12px; border-top: 1px solid var(--divider-color, #aaa); }
    .selection h3 { margin-bottom: 6px; } .selection p { margin: 8px 0; }
    .issues { margin-top: 12px; } .help { font-size: 13px; }
    .settings { margin-top:16px; } .settings label { margin:10px 0; } textarea { width:100%; box-sizing:border-box; font:inherit; }
    .ambient-toggle { display:none; }
    .view-actions { position:absolute; z-index:3; right:12px; top:12px; display:flex; gap:8px; flex-wrap:wrap; max-width:calc(100% - 24px); }
    #exit-view { min-height:44px; }
    :host(:fullscreen) { overflow:auto; background:var(--card-background-color,#020304); } .alert { color:#ff7365; font-weight:600; }
    :host([ambient]) .stale {position:absolute; z-index:2; bottom:60px; left:20px; color:#bec8ce;}
    :host([ambient]) .sensor-status { position:absolute; z-index:2; bottom:32px; left:20px; color:#a7b2b9; }
    :host([scheme="night"]) .viewport, :host([scheme="security"]) .viewport { background:#020304; }
    :host([ambient]) { position:relative; padding:0; background:#020304; min-height:100%; }
    :host([ambient]) .viewer { display:block; }
    :host([ambient]) .viewport { height:100dvh; border:0; border-radius:0; }
    :host([ambient]) .ambient-toggle { display:block; }
    :host([ambient]) .alert { position:absolute; z-index:2; top:12px; left:20px; }
    :host([ambient]:not([show-controls])) h2, :host([ambient]:not([show-controls])) > p:not(.alert):not(.sensor-status):not(.stale),
    :host([ambient]:not([show-controls])) .toolbar, :host([ambient]:not([show-controls])) aside,
    :host([ambient]:not([show-controls])) .settings, :host([ambient]:not([show-controls])) .issues { display:none; }
    :host([ambient]:not([show-controls])) .legend { opacity:.6; }
    :host([workspace]) { position:relative; padding:0; height:100%; min-height:0; color:#d2e8ef; }
    :host([workspace]) .viewer { display:block; height:100%; }
    :host([workspace]) .viewport { height:100%; border:0; border-radius:0; }
    :host([workspace]) h2, :host([workspace]) > p:not(.alert):not(.sensor-status),
    :host([workspace]) .view-actions, :host([workspace]) .issues { display:none; }
    :host([workspace]) .toolbar { position:absolute; inset:0; z-index:3; margin:0; pointer-events:none; }
    :host([workspace]) .toolbar label { position:absolute; left:70px; top:12px; pointer-events:auto; }
    :host([workspace]) .toolbar al-camera-control { position:absolute; right:12px; top:54px; pointer-events:auto; }
    :host([workspace]) button, :host([workspace]) select { color:#d2e8ef; background:#112734eb; border-color:#446779; border-radius:4px; padding:5px 8px; font-size:12px; }
    :host([workspace][editing-preview]) .room-toggle { display:none; }
    :host([workspace]) .room-toggle { position:absolute; right:12px; top:12px; z-index:5; min-width:32px; min-height:32px; }
    :host([workspace]) aside { position:absolute; z-index:4; right:12px; top:54px; width:260px; max-height:calc(100% - 76px); overflow:auto; padding:12px; box-sizing:border-box; background:#102431f5; border:1px solid #446779; border-radius:8px; }
    :host([workspace]) aside[hidden] { display:none; }
    :host([workspace]) .groups { max-height:none; }
    :host([workspace]) .group { min-height:30px; margin:2px 0; }
    :host([workspace]) .selection { font-size:12px; }
    :host([workspace]) .settings { position:absolute; left:60px; top:60px; z-index:4; width:280px; max-width:calc(100% - 84px); max-height:calc(100% - 84px); overflow:auto; margin:0; padding:12px; box-sizing:border-box; background:#102431f5; border:1px solid #446779; border-radius:8px; font-size:12px; }
    :host([workspace]) .settings > summary { display:none; }
    :host([workspace]) .settings:not([open]) { display:none; }
    :host([workspace]) .settings label { display:flex; flex-wrap:wrap; margin:8px 0; }
    :host([workspace]) al-room-hud { top:60px; left:60px; width:min(280px,calc(100% - 84px)); max-height:calc(100% - 100px); }
    :host([workspace]) .legend { left:70px; font-size:10px; opacity:.65; }
    :host([workspace]) .alert, :host([workspace]) .sensor-status { position:absolute; left:70px; bottom:42px; z-index:2; font-size:12px; }
    :host([workspace]) .sensor-status { bottom:64px; }
    .scope-label-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
    @media (pointer:coarse) {
      :host([workspace]) button, :host([workspace]) select { min-height:44px; font-size:14px; }
      :host([workspace]) .toolbar al-camera-control, :host([workspace]) aside { top:64px; }
    }
    @media (max-width:600px) {
      :host([workspace]) .toolbar label { left:76px; top:60px; max-width:calc(100% - 88px); }
      :host([workspace]) .toolbar al-camera-control { top:auto; bottom:20px; }
      :host([workspace]) #scope { max-width:100%; }
      :host([workspace]) .settings, :host([workspace]) al-room-hud { top:116px; left:76px; max-width:calc(100% - 88px); }
      :host([workspace]) .legend { display:none; }
    }
    @media (max-width: 760px) { .viewer { grid-template-columns: minmax(0, 1fr); } .groups { max-height: 220px; } }
  `];

  private cameraMatrix:number[]=[];
  @property({type:Boolean,reflect:true}) workspace=false;
  @property({type:Boolean,reflect:true,attribute:"settings-open"}) settingsOpen=false;
  @property({type:Boolean}) hideHud=false;
  @state() private roomsOpen=false;
  @property({ attribute: false }) telemetry?: FloorplanTelemetry;
  @property({type:Boolean}) context=false;
  @property({type:String,reflect:true}) room = "";
  @property({attribute:false}) placementHeight?: number;
  @state() private hovered = "";
  @property({ attribute: false }) config?: FloorplanConfig;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) lights: Record<string,string[]> = {};
  @property({ attribute: false }) settings: ViewerSettings = {};
  @property({type:Boolean}) dashboard = false;
  @state() private controlsVisible = false;
  @state() private fullscreen = false;
  @state() private settingsError = "";
  private groundZ?: number;
  private options: ViewerOptions = viewerOptions();
  @property({ attribute: false }) live: ActivityFrame | null = null;
  @state() private scope = "";
  @state() private selected = "";
  @state() private now = Date.now() / 1000;
  @state() private loading = false;
  @state() private error = "";
  private model: FloorplanModel = { parts: [], groups: [], scopes: [], issues: [] };
  private renderer?: FloorplanRenderer;
  private sequence = 0;
  private timer?: ReturnType<typeof setInterval>;

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("fullscreenchange",this.fullscreenChanged);
    this.addEventListener("keydown",this.escapeView);
    this.now = Date.now() / 1000;
    this.timer = setInterval(() => { if (document.visibilityState === "visible") this.now = Date.now() / 1000; }, 1000);
    this.requestUpdate();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("fullscreenchange",this.fullscreenChanged);
    this.removeEventListener("keydown",this.escapeView);
    clearInterval(this.timer);
    this.stopRenderer();
  }

  /** Fullscreen is retargeted at shadow boundaries, so inspect the viewer's own root. */
  private ownsFullscreen(): boolean {
    return (this.getRootNode() as Document | ShadowRoot).fullscreenElement === this;
  }
  private readonly fullscreenChanged = (): void => {
    const wasFullscreen=this.fullscreen;
    this.fullscreen=this.ownsFullscreen();
    if(wasFullscreen && !this.fullscreen && this.settings.ambient) this.leaveAmbient();
  };
  private readonly escapeView = (event: KeyboardEvent): void => {
    if(!this.workspace && event.key === "Escape" && (this.settings.ambient || this.ownsFullscreen())) {
      event.preventDefault();void this.exitView();
    }
  };
  private leaveAmbient(): void {
    this.controlsVisible=false;this.removeAttribute("show-controls");
    this.changeSettings({...this.settings,ambient:false});
  }
  private async exitView(): Promise<void> {
    this.leaveAmbient();
    if(this.ownsFullscreen()) {
      try {await document.exitFullscreen();}
      catch {this.settingsError="Could not exit browser fullscreen. Try Escape or your device's Back control.";}
    }
    await this.updateComplete;
    this.renderRoot.querySelector("al-camera-control")?.shadowRoot?.querySelector<HTMLButtonElement>("button")?.focus({preventScroll:true});
  }

  protected override willUpdate(changed: PropertyValues): void {
    this.options = viewerOptions(this.settings);
    const alert = activeRule(this.options.rules,this.hass?.states ?? {});
    if (alert?.scheme) this.options=viewerOptions({...this.settings,scheme:alert.scheme});
    this.toggleAttribute("ambient",this.options.ambient && !this.workspace);
    this.setAttribute("scheme",this.options.scheme);
    if (changed.has("config")) {
      this.model = this.config ? floorplanModel(this.config) : { parts: [], groups: [], scopes: [], issues: [] };
      if (!this.model.scopes.some((group) => group.id === this.scope)) this.scope = "";
      if (!this.model.groups.some((group) => group.id === this.selected)) this.selected = "";
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (!this.isConnected) return;
    if(changed.has("settings") && this.options.ambient && !(changed.get("settings") as ViewerSettings | undefined)?.ambient)
      this.renderRoot.querySelector<HTMLButtonElement>("#exit-view")?.focus({preventScroll:true});
    const parts = this.visibleParts;
    if (!parts.length && !this.config?.site?.features.length) { this.stopRenderer(); return; }
    if (!this.renderer && !this.loading && !this.error) {
      // Start outside Lit's update transaction; loading changes need their own render.
      queueMicrotask(() => { void this.startRenderer(); });
      return;
    }
    if (changed.has("config") || changed.has("scope") || changed.has("room") || changed.has("context") || this.groundZ !== this.options.ground_z) {
      this.renderer?.setParts(parts,this.options.ground_z,this.context?undefined:this.config?.site,this.context?this.room:undefined,this.model.parts.flatMap(p=>p.architecture ?? []).filter(o=>parts.some(p=>o.position[2]<=p.high && o.position[2]+o.height>=p.low))); this.groundZ=this.options.ground_z;
    }
    this.updateAppearance();
  }

  private get visibleParts() {
    const selected=this.model.parts.find(p=>p.id===this.room);
    return this.context && selected ? this.model.parts.filter(p=>!p.container && p.low<selected.high-0.01 && p.high>selected.low+0.01) : inScope(this.model.parts,this.room || this.scope);
  }
  private stopRenderer(): void {
    this.sequence++;
    this.renderer?.dispose();
    this.renderer = undefined;
    this.loading = false;
  }

  private async startRenderer(): Promise<void> {
    if (!this.isConnected || this.renderer || this.loading || this.error || (!this.visibleParts.length && !this.config?.site?.features.length)) return;
    const sequence = ++this.sequence;
    this.loading = true;
    try {
      const { FloorplanRenderer } = await import("./floorplan-renderer");
      if (sequence !== this.sequence || !this.isConnected) return;
      const host = this.renderRoot.querySelector<HTMLElement>("#scene")!;
      this.renderer = new FloorplanRenderer(host, (id) => { this.selectRoom(id); }, (message) => {
        this.stopRenderer(); this.error = message;
      }, (id)=>{this.hovered=id;}, (position)=>{this.dispatchEvent(new CustomEvent("al-fixture-position",{detail:position,bubbles:true,composed:true}));},matrix=>{if(matrix.some((v,i)=>Math.abs(v-(this.cameraMatrix[i] ?? Infinity))>1e-7)){this.cameraMatrix=matrix;const control=this.renderRoot.querySelector("al-camera-control") as import("./al-camera-control").AlCameraControl|null;if(control)control.matrix=matrix;}});
      this.renderer.setParts(this.visibleParts,this.options.ground_z,this.context?undefined:this.config?.site,this.context?this.room:undefined);
      this.groundZ=this.options.ground_z;
      this.updateAppearance();
    } catch {
      if (sequence === this.sequence) {
        this.renderer?.dispose(); this.renderer = undefined;
        this.renderRoot.querySelector("#scene")?.replaceChildren();
        this.error = "The 3D view could not start. WebGL may be unavailable. Use the group list or retry.";
      }
    } finally {
      if (sequence === this.sequence) this.loading = false;
    }
  }

  private updateAppearance(): void {
    const states=this.hass?.states ?? {};
    const fills=Object.fromEntries(this.model.groups.map(g=>[g.id,roomLight(this.lights[g.id],states)]));
    this.renderer?.setPlacement(this.placementHeight);
    this.renderer?.setActivity(this.live,this.now,this.room || this.selected,this.options,fills,activeRule(this.options.rules,states),states);
  }
  private changeSettings(settings: ViewerSettings): void {
    try {
      viewerOptions(settings); this.settings=settings; this.settingsError="";
      this.dispatchEvent(new CustomEvent("al-viewer-settings",{detail:settings,bubbles:true,composed:true}));
    } catch(error) {this.settingsError=String((error as Error).message);}
  }
  private settingsControl() {
    return html`<details class="settings" .open=${this.workspace ? this.settingsOpen : undefined}><summary>Viewer settings</summary>
      <p class="muted">Settings apply to this display. Ground Z uses your floorplan's coordinates.</p>
      ${!this.workspace ? html`<button type="button" @click=${async()=>{try{await this.requestFullscreen();}catch{this.settingsError="Fullscreen is unavailable here. Use your dashboard's kiosk layout.";}}}>Enter fullscreen</button>` : nothing}
      <label>Scheme <select .value=${this.settings.scheme ?? "standard"} @change=${(e:Event)=>this.changeSettings({...this.settings,scheme:(e.target as HTMLSelectElement).value as ViewerOptions["scheme"]})}>
        ${["standard","night","security"].map(s=>html`<option value=${s} .selected=${s===(this.settings.scheme ?? "standard")}>${s}</option>`)}
      </select></label>
      <label>Ground Z <input type="number" step="any" .value=${this.settings.ground_z?.toString() ?? ""} placeholder="Not specified"
        @change=${(e:Event)=>{const v=(e.target as HTMLInputElement).value;this.changeSettings({...this.settings,ground_z:v===""?undefined:Number(v)});}}></label>
      <button type="button" @click=${()=>{const lowest=[...inScope(this.model.parts,this.scope)].sort((a,b)=>a.low-b.low)[0];if(lowest)this.changeSettings({...this.settings,ground_z:Number((lowest.high-0.9144).toFixed(3))});}}>Basement top 3 ft above ground</button>
      ${(["light_fill","ambient","auto_rotate","focus_activity"] as const).filter(key=>!this.workspace || key!=="ambient").map(key=>html`<label><input type="checkbox" .checked=${this.options[key]}
        @change=${(e:Event)=>this.changeSettings({...this.settings,[key]:(e.target as HTMLInputElement).checked})}>${{light_fill:"Ceiling glow from lights",ambient:"Ambient fullscreen layout",auto_rotate:"Slow orbit",focus_activity:"Focus on new activity"}[key]}</label>`)}
      <label>Seconds per rotation <input id="rotation-period" type="number" min="1" step="any" .value=${String(this.options.rotation_period)}
        @change=${(e:Event)=>this.changeSettings({...this.settings,rotation_period:Number((e.target as HTMLInputElement).value)})}></label>
      <p class="help muted">Larger values rotate more slowly. Default: 180 seconds per revolution.</p>
      <label>Maximum ceiling brightness <input type="range" min="0" max="1" step="0.01" .value=${String(this.options.fill_brightness)} @input=${(e:Event)=>this.changeSettings({...this.settings,fill_brightness:Number((e.target as HTMLInputElement).value)})}></label>
      <details><summary>Advanced settings (JSON)</summary><p>Configure color_thresholds and binary-sensor rules here.</p>
        <textarea aria-label="Viewer settings JSON" rows="12" .value=${JSON.stringify(this.settings,null,2)}></textarea>
        <button type="button" @click=${()=>{try{this.changeSettings(JSON.parse(this.renderRoot.querySelector<HTMLTextAreaElement>("textarea")!.value) as ViewerSettings);}catch(error){this.settingsError=String(error);}}}>Apply viewer settings</button>
      </details>${this.settingsError?html`<p role="alert">${this.settingsError}</p>`:nothing}
    </details>`;
  }

  private reading(group: FloorplanGroup): string {
    const reading = activityReading(this.live, group.id, this.now);
    return reading.status === "live" ? `${format(reading.value!)} / ${format(reading.max!)}` :
      reading.status === "stale" ? "Stale" : "No reading";
  }

  private selectRoom(id:string):void {
    this.selected=id;
    this.roomsOpen=false;
    this.dispatchEvent(new CustomEvent("al-room-selected",{detail:id,bubbles:true,composed:true}));
  }

  private openGroup(group: FloorplanGroup): void {
    this.dispatchEvent(new CustomEvent("al-open-group", { detail: group.path, bubbles: true, composed: true }));
  }

  protected override render() {
    const parts = this.visibleParts;
    const groups = inScope(this.model.groups, this.scope);
    const selected = this.model.groups.find((group) => group.id === this.selected);
    const alert = activeRule(this.options.rules,this.hass?.states ?? {});
    const stale = this.live && this.now - this.live.now > STALE_SECONDS;
    return html`
      <div class="view-actions">
      ${!this.workspace && (this.options.ambient || this.fullscreen) ? html`<button id="exit-view" type="button" @click=${()=>void this.exitView()}>${this.options.ambient ? "Exit ambient" : "Exit fullscreen"}</button>` : nothing}
      <button class="ambient-toggle" type="button" @click=${()=>{this.controlsVisible=!this.controlsVisible;this.toggleAttribute("show-controls",this.controlsVisible);}}> ${this.controlsVisible ? "Hide controls" : "Show controls"}</button>
      </div>
      <h2>${this.room ? this.model.groups.find(g=>g.id===this.room)?.label ?? "Room preview" : "Your home, live"}</h2>
      <p class="muted">Room color shows activity from blue (0) to red (5). Ceiling glow shows your lights.</p>
      <div class="toolbar">
        <label><span class=${this.workspace ? "scope-label-hidden" : ""}>Floor or building</span> <select aria-label="Floor or building" id="scope" .value=${this.scope} @change=${(event: Event) => {
          this.scope = (event.target as HTMLSelectElement).value; this.selectRoom("");
        }}>
          <option value="" .selected=${this.scope === ""}>Whole home</option>
          ${this.model.scopes.map((group) => html`<option value=${group.id} .selected=${this.scope === group.id}>
            ${group.label} (${KIND_DEFS[group.kind]?.label ?? "Group"})
          </option>`)}
        </select></label>
        <al-camera-control .matrix=${this.cameraMatrix} .north=${this.config?.gps?.rotation} .disabled=${!this.renderer || !!this.error} @al-camera-action=${(e:CustomEvent<CameraAction>)=>this.renderer?.cameraAction(e.detail)}></al-camera-control>
      </div>
      <p role="status" class=${`muted live-status ${stale || !this.live ? "stale" : ""}`}>${stale ? "Activity readings are stale. Waiting for a fresh update…" :
        this.live ? "Live activity · updates every 2 seconds" : "Waiting for live activity readings…"}</p>
      ${alert ? html`<p class="alert" role="status">${alert.label ?? alert.entity}</p>` : nothing}
      ${this.options.rules.some(r=>!["on","off"].includes(this.hass?.states[r.entity]?.state ?? "")) ? html`<p class="sensor-status" role="status">Some alert sensors are unavailable</p>` : nothing}
      ${this.workspace ? html`<button type="button" class="room-toggle" aria-label="Rooms" title="Rooms" aria-expanded=${String(this.roomsOpen)} aria-controls="room-drawer" @click=${()=>{this.roomsOpen=!this.roomsOpen;}}>☷</button>` : nothing}
      <div class="viewer">
        <div class="viewport" aria-describedby="floorplan-help">
          <div id="scene"></div>
          ${!this.room && !this.hideHud && !(this.workspace && this.settingsOpen) && (this.hovered || this.selected) ? html`<al-room-hud .room=${this.model.parts.find(p=>p.id===(this.hovered || this.selected))} .live=${this.live} .telemetry=${this.telemetry} .hass=${this.hass} .now=${this.now} @al-dismiss-hud=${()=>{this.selectRoom("");this.hovered="";}}></al-room-hud>` : nothing}
          ${!parts.length && !this.config?.site?.features.length ? html`<div class="overlay"><p>${this.model.groups.length ?
            "No placed geometry in this view. See the geometry notes below." : "Import a floorplan below to see your home in 3D."}</p></div>` :
            this.error ? html`<div class="overlay"><p role="alert">${this.error}</p>
              <button id="retry" type="button" @click=${() => { this.error = ""; }}>Retry 3D view</button></div>` :
              this.loading ? html`<div class="overlay"><p role="status">Loading 3D view…</p></div>` : nothing}
          ${parts.length && !this.error ? html`<div class="legend">${this.options.color_thresholds.map(t=>html`<span style=${`color:${t.color};margin-right:12px`}>● ${t.value}</span>`)} · no fill = unknown
            <br>${(this.options.ground_z ?? this.config?.site?.ground_z) === undefined ? "Reference grid · outdoor ground unspecified" : `Ground Z: ${this.options.ground_z ?? this.config?.site?.ground_z} m`}</div>` : nothing}
        </div>
        <aside id="room-drawer" aria-label="Floorplan groups" ?hidden=${this.workspace && !this.roomsOpen}>
          <div class="groups" aria-label="Select a group">
            ${groups.map((group) => html`<button type="button" class="group" data-group=${group.id}
              aria-pressed=${group.id === this.selected ? "true" : "false"}
              @click=${() => { this.selectRoom(group.id); }}>
              <span class="group-name" style=${`padding-inline-start:${Math.min(group.ancestors.length, 5) * 8}px`}>${group.label}</span>
              <span class="reading">${this.reading(group)}</span>
            </button>`)}
          </div>
          ${selected ? html`<section class="selection" aria-label="Selected group">
            <h3>${selected.label}</h3><p>${KIND_DEFS[selected.kind]?.label ?? "Group"} · ${selected.id}</p>
            <p>Activity: <strong>${this.reading(selected)}</strong></p>
            <p>${roomLight(this.lights[selected.id],this.hass?.states ?? {}).unknown ? "Some light readings unavailable" : `Lights: ${Math.round(roomLight(this.lights[selected.id],this.hass?.states ?? {}).brightness*100)}%`}</p>
            ${!this.dashboard ? html`<button id="edit-room" type="button" @click=${()=>this.dispatchEvent(new CustomEvent("al-edit-room",{detail:selected.id,bubbles:true,composed:true}))}>Place devices & windows</button><button id="open-group" type="button" @click=${() => this.openGroup(selected)}>Open group settings</button>` : nothing}
          </section>` : html`<p class="muted">Select a room in the scene or a group in this list.</p>`}
        </aside>
      </div>
      ${this.settingsControl()}
      <p id="floorplan-help" class="help muted">Drag to rotate · Right-drag to pan · Scroll or pinch to zoom.
        Camera buttons and the group list also work with a keyboard. Each group shows its own activity level.</p>
      ${this.model.issues.length ? html`<details class="issues" open><summary>Geometry notes (${this.model.issues.length})</summary>
        <ul>${this.model.issues.map((issue) => html`<li>${issue.label}: ${issue.reason}</li>`)}</ul>
      </details>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { "al-floorplan-viewer": AlFloorplanViewer }
}
