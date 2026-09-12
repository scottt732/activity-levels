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
    :host { display: block; }
    button { font:inherit; color:var(--primary-text-color); background:var(--card-background-color); border:1px solid var(--divider-color,#888); border-radius:6px; padding:8px 12px; cursor:pointer; }
    details { margin: 0 16px 24px; border-top: 1px solid var(--divider-color, #aaa); }
    summary { cursor: pointer; padding: 16px 0; font-weight: 500; }
  `;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ type: Boolean }) disabled = false;

  @state() private editing=false;
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
  protected override render() {
    if (!this.config) return nothing;
    const hasGeometry = walkGroups(this.config).some(({ group }) => group.bounds || group.points);
    return html`
      ${this.error || this.preferenceError ? html`<p role="status">${this.error || this.preferenceError}</p>` : nothing}
      <div style="margin:0 16px 12px"><button type="button" @click=${()=>{this.editing=!this.editing;}}>${this.editing?"Done placing · return to live view":"Place devices & windows"}</button><span> ${this.editing?"Add placements to the draft, then use the panel’s Save to persist them.":""}</span></div>
      ${this.editing?html`<al-room-device-editor style="margin:0 16px 24px" .room=${this.editRoom} .lights=${this.lights} .live=${this.live} .config=${this.config} .hass=${this.hass} .disabled=${this.disabled}></al-room-device-editor>`:html`<al-floorplan-viewer @al-edit-room=${(e:CustomEvent<string>)=>{this.editRoom=e.detail;this.editing=true;}} .config=${this.config} .live=${this.live} .hass=${this.hass} .lights=${this.lights}
        .telemetry=${this.error ? undefined : this.telemetry} .settings=${this.settings} @al-viewer-settings=${this.saveSettings}></al-floorplan-viewer>`}
      <details><summary>Property layout</summary><al-property-layout .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-property-layout></details>
      <details .open=${!hasGeometry}><summary>Import or update floorplan</summary>
        <al-floorplan-import .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-floorplan-import>
      </details>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { "al-floorplans": AlFloorplans }
}
