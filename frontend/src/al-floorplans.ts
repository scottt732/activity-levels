import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./al-floorplan-viewer";
import "./al-floorplan-import";
import { walkGroups } from "./model";
import type { PropertyValues } from "lit";
import { floorplanSource } from "./floorplan-store";
import type { FloorplanSource } from "./floorplan-store";
import { viewerOptions } from "./floorplan-style";
import type { ViewerSettings } from "./floorplan-style";
import type { Config, HomeAssistant, LiveState } from "./types";

/** Keep the import editor mounted while viewing geometry so a preview is not discarded by collapse. */
@customElement("al-floorplans")
export class AlFloorplans extends LitElement {
  static styles = css`
    :host { display: block; }
    details { margin: 0 16px 24px; border-top: 1px solid var(--divider-color, #aaa); }
    summary { cursor: pointer; padding: 16px 0; font-weight: 500; }
  `;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ type: Boolean }) disabled = false;

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
      this.lights=data.lights;
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
      <al-floorplan-viewer .config=${this.config} .live=${this.live} .hass=${this.hass} .lights=${this.lights}
        .settings=${this.settings} @al-viewer-settings=${this.saveSettings}></al-floorplan-viewer>
      <details .open=${!hasGeometry}><summary>Import or update floorplan</summary>
        <al-floorplan-import .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-floorplan-import>
      </details>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { "al-floorplans": AlFloorplans }
}
