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

const CAMERA_ACTIONS: [CameraAction, string][] = [
  ["reset", "Reset view"], ["top", "Top view"], ["left", "Rotate left"], ["right", "Rotate right"],
  ["up", "Tilt up"], ["down", "Tilt down"], ["in", "Zoom in"], ["out", "Zoom out"],
];
const format = (value: number): string => Number(value.toFixed(2)).toLocaleString();

@customElement("al-floorplan-viewer")
export class AlFloorplanViewer extends LitElement {
  static styles = [sharedStyles, css`
    :host { display: block; padding: 16px; }
    h2 { margin: 0 0 6px; }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 12px 0; }
    label { display: flex; align-items: center; gap: 8px; }
    button, select { font: inherit; color: var(--primary-text-color); background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #aaa); border-radius: 6px; padding: 8px 10px; }
    button { cursor: pointer; } button:disabled { cursor: default; opacity: .5; }
    .viewer { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 16px; }
    .viewport { position: relative; min-width: 0; height: clamp(320px, 58vh, 680px); border-radius: 12px; overflow: hidden;
      background: radial-gradient(ellipse at 50% 35%, #263a49, #101c27 80%); border: 1px solid #425461; }
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
    .ambient-toggle { display:none; } .alert { color:#ff7365; font-weight:600; }
    :host([ambient]) .stale {position:absolute; z-index:2; bottom:60px; left:20px; color:#bec8ce;}
    :host([ambient]) .sensor-status { position:absolute; z-index:2; bottom:32px; left:20px; color:#a7b2b9; }
    :host([scheme="night"]) .viewport, :host([scheme="security"]) .viewport { background:#020304; }
    :host([ambient]) { position:relative; padding:0; background:#020304; min-height:100%; }
    :host([ambient]) .viewer { display:block; }
    :host([ambient]) .viewport { height:100dvh; border:0; border-radius:0; }
    :host([ambient]) .ambient-toggle { display:block; position:absolute; z-index:3; right:12px; top:12px; opacity:.65; }
    :host([ambient]) .alert { position:absolute; z-index:2; top:12px; left:20px; }
    :host([ambient]:not([show-controls])) h2, :host([ambient]:not([show-controls])) > p:not(.alert):not(.sensor-status):not(.stale),
    :host([ambient]:not([show-controls])) .toolbar, :host([ambient]:not([show-controls])) aside,
    :host([ambient]:not([show-controls])) .settings, :host([ambient]:not([show-controls])) .issues { display:none; }
    :host([ambient]:not([show-controls])) .legend { opacity:.6; }
    @media (max-width: 760px) { .viewer { grid-template-columns: minmax(0, 1fr); } .groups { max-height: 220px; } }
  `];

  @property({ attribute: false }) config?: FloorplanConfig;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) lights: Record<string,string[]> = {};
  @property({ attribute: false }) settings: ViewerSettings = {};
  @property({type:Boolean}) dashboard = false;
  @state() private controlsVisible = false;
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
    this.now = Date.now() / 1000;
    this.timer = setInterval(() => { if (document.visibilityState === "visible") this.now = Date.now() / 1000; }, 1000);
    this.requestUpdate();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.timer);
    this.stopRenderer();
  }

  protected override willUpdate(changed: PropertyValues): void {
    this.options = viewerOptions(this.settings);
    const alert = activeRule(this.options.rules,this.hass?.states ?? {});
    if (alert?.scheme) this.options=viewerOptions({...this.settings,scheme:alert.scheme});
    this.toggleAttribute("ambient",this.options.ambient);
    this.setAttribute("scheme",this.options.scheme);
    if (changed.has("config")) {
      this.model = this.config ? floorplanModel(this.config) : { parts: [], groups: [], scopes: [], issues: [] };
      if (!this.model.scopes.some((group) => group.id === this.scope)) this.scope = "";
      if (!this.model.groups.some((group) => group.id === this.selected)) this.selected = "";
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (!this.isConnected) return;
    const parts = inScope(this.model.parts, this.scope);
    if (!parts.length) { this.stopRenderer(); return; }
    if (!this.renderer && !this.loading && !this.error) {
      // Start outside Lit's update transaction; loading changes need their own render.
      queueMicrotask(() => { void this.startRenderer(); });
      return;
    }
    if (changed.has("config") || changed.has("scope") || this.groundZ !== this.options.ground_z) {
      this.renderer?.setParts(parts,this.options.ground_z); this.groundZ=this.options.ground_z;
    }
    this.updateAppearance();
  }

  private stopRenderer(): void {
    this.sequence++;
    this.renderer?.dispose();
    this.renderer = undefined;
    this.loading = false;
  }

  private async startRenderer(): Promise<void> {
    if (!this.isConnected || this.renderer || this.loading || this.error || !inScope(this.model.parts, this.scope).length) return;
    const sequence = ++this.sequence;
    this.loading = true;
    try {
      const { FloorplanRenderer } = await import("./floorplan-renderer");
      if (sequence !== this.sequence || !this.isConnected) return;
      const host = this.renderRoot.querySelector<HTMLElement>("#scene")!;
      this.renderer = new FloorplanRenderer(host, (id) => { this.selected = id; }, (message) => {
        this.stopRenderer(); this.error = message;
      });
      this.renderer.setParts(inScope(this.model.parts, this.scope),this.options.ground_z);
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
    this.renderer?.setActivity(this.live,this.now,this.selected,this.options,fills,activeRule(this.options.rules,states));
  }
  private changeSettings(settings: ViewerSettings): void {
    try {
      viewerOptions(settings); this.settings=settings; this.settingsError="";
      this.dispatchEvent(new CustomEvent("al-viewer-settings",{detail:settings,bubbles:true,composed:true}));
    } catch(error) {this.settingsError=String((error as Error).message);}
  }
  private settingsControl() {
    return html`<details class="settings"><summary>Viewer settings</summary>
      <p class="muted">Settings apply to this display. Ground Z uses your floorplan's coordinates.</p>
      <button type="button" @click=${async()=>{try{await this.requestFullscreen();}catch{this.settingsError="Fullscreen is unavailable here. Use your dashboard's kiosk layout.";}}}>Enter fullscreen</button>
      <label>Scheme <select .value=${this.settings.scheme ?? "standard"} @change=${(e:Event)=>this.changeSettings({...this.settings,scheme:(e.target as HTMLSelectElement).value as ViewerOptions["scheme"]})}>
        ${["standard","night","security"].map(s=>html`<option value=${s} .selected=${s===(this.settings.scheme ?? "standard")}>${s}</option>`)}
      </select></label>
      <label>Ground Z <input type="number" step="any" .value=${this.settings.ground_z?.toString() ?? ""} placeholder="Not specified"
        @change=${(e:Event)=>{const v=(e.target as HTMLInputElement).value;this.changeSettings({...this.settings,ground_z:v===""?undefined:Number(v)});}}></label>
      <button type="button" @click=${()=>{const lowest=[...inScope(this.model.parts,this.scope)].sort((a,b)=>a.low-b.low)[0];if(lowest)this.changeSettings({...this.settings,ground_z:Number((lowest.high-0.9144).toFixed(3))});}}>Basement top 3 ft above ground</button>
      ${(["light_fill","ambient","auto_rotate","focus_activity"] as const).map(key=>html`<label><input type="checkbox" .checked=${this.options[key]}
        @change=${(e:Event)=>this.changeSettings({...this.settings,[key]:(e.target as HTMLInputElement).checked})}>${{light_fill:"Fill rooms from lights",ambient:"Ambient fullscreen layout",auto_rotate:"Slow orbit",focus_activity:"Focus on new activity"}[key]}</label>`)}
      <label>Maximum fill brightness <input type="range" min="0" max="1" step="0.01" .value=${String(this.options.fill_brightness)} @input=${(e:Event)=>this.changeSettings({...this.settings,fill_brightness:Number((e.target as HTMLInputElement).value)})}></label>
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

  private openGroup(group: FloorplanGroup): void {
    this.dispatchEvent(new CustomEvent("al-open-group", { detail: group.path, bubbles: true, composed: true }));
  }

  protected override render() {
    const parts = inScope(this.model.parts, this.scope);
    const groups = inScope(this.model.groups, this.scope);
    const selected = this.model.groups.find((group) => group.id === this.selected);
    const alert = activeRule(this.options.rules,this.hass?.states ?? {});
    const stale = this.live && this.now - this.live.now > STALE_SECONDS;
    return html`
      <button class="ambient-toggle" type="button" @click=${()=>{this.controlsVisible=!this.controlsVisible;this.toggleAttribute("show-controls",this.controlsVisible);}}> ${this.controlsVisible ? "Hide controls" : "Show controls"}</button>
      <h2>Your home, live</h2>
      <p class="muted">Room outlines show activity. Room fills show the color and brightness of your lights.</p>
      <div class="toolbar">
        <label>Floor or building <select id="scope" .value=${this.scope} @change=${(event: Event) => {
          this.scope = (event.target as HTMLSelectElement).value; this.selected = "";
        }}>
          <option value="" .selected=${this.scope === ""}>Whole home</option>
          ${this.model.scopes.map((group) => html`<option value=${group.id} .selected=${this.scope === group.id}>
            ${group.label} (${KIND_DEFS[group.kind]?.label ?? "Group"})
          </option>`)}
        </select></label>
        ${CAMERA_ACTIONS.map(([action, label]) => html`<button type="button" data-camera=${action}
          ?disabled=${!this.renderer || !!this.error} @click=${() => this.renderer?.cameraAction(action)}>${label}</button>`)}
      </div>
      <p role="status" class=${`muted live-status ${stale || !this.live ? "stale" : ""}`}>${stale ? "Activity readings are stale. Waiting for a fresh update…" :
        this.live ? "Live activity · updates every 2 seconds" : "Waiting for live activity readings…"}</p>
      ${alert ? html`<p class="alert" role="status">${alert.label ?? alert.entity}</p>` : nothing}
      ${this.options.rules.some(r=>!["on","off"].includes(this.hass?.states[r.entity]?.state ?? "")) ? html`<p class="sensor-status" role="status">Some alert sensors are unavailable</p>` : nothing}
      <div class="viewer">
        <div class="viewport" aria-describedby="floorplan-help">
          <div id="scene"></div>
          ${!parts.length ? html`<div class="overlay"><p>${this.model.groups.length ?
            "No placed geometry in this view. See the geometry notes below." : "Import a floorplan below to see your home in 3D."}</p></div>` :
            this.error ? html`<div class="overlay"><p role="alert">${this.error}</p>
              <button id="retry" type="button" @click=${() => { this.error = ""; }}>Retry 3D view</button></div>` :
              this.loading ? html`<div class="overlay"><p role="status">Loading 3D view…</p></div>` : nothing}
          ${parts.length && !this.error ? html`<div class="legend">${this.options.color_thresholds.map(t=>html`<span style=${`color:${t.color};margin-right:12px`}>● ≥${t.value}</span>`)} · gray = unknown
            <br>${this.options.ground_z === undefined ? "Reference grid · outdoor ground unspecified" : `Ground Z: ${this.options.ground_z} m`}</div>` : nothing}
        </div>
        <aside aria-label="Floorplan groups">
          <div class="groups" aria-label="Select a group">
            ${groups.map((group) => html`<button type="button" class="group" data-group=${group.id}
              aria-pressed=${group.id === this.selected ? "true" : "false"}
              @click=${() => { this.selected = group.id; }}>
              <span class="group-name" style=${`padding-inline-start:${Math.min(group.ancestors.length, 5) * 8}px`}>${group.label}</span>
              <span class="reading">${this.reading(group)}</span>
            </button>`)}
          </div>
          ${selected ? html`<section class="selection" aria-label="Selected group">
            <h3>${selected.label}</h3><p>${KIND_DEFS[selected.kind]?.label ?? "Group"} · ${selected.id}</p>
            <p>Activity: <strong>${this.reading(selected)}</strong></p>
            <p>${roomLight(this.lights[selected.id],this.hass?.states ?? {}).unknown ? "Some light readings unavailable" : `Lights: ${Math.round(roomLight(this.lights[selected.id],this.hass?.states ?? {}).brightness*100)}%`}</p>
            ${!this.dashboard ? html`<button id="open-group" type="button" @click=${() => this.openGroup(selected)}>Open group settings</button>` : nothing}
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
