import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import { floorplanSource } from "./floorplan-store";
import type { FloorplanSource, FloorplanSnapshot } from "./floorplan-store";
import { viewerOptions } from "./floorplan-style";
import type { ViewerSettings } from "./floorplan-style";
import "./al-floorplan-viewer";

export interface FloorplanCardConfig extends ViewerSettings { type: string }
/** Read-only dashboard host. The same viewer runs here and inside the editor panel. */
@customElement("activity-levels-floorplan-card")
export class ActivityLevelsFloorplanCard extends LitElement {
  static styles=css`:host { display:block; min-width:0; } .error {padding:12px;color:var(--error-color,#ff7365);} `;
  @property({attribute:false}) hass?: HomeAssistant;
  @state() private settings: ViewerSettings = {};
  @state() private snapshot: FloorplanSnapshot = {};
  private source?: FloorplanSource;
  private unsubscribe?: () => void;
  setConfig(config: FloorplanCardConfig): void { viewerOptions(config); this.settings={...config}; }
  static getStubConfig(): FloorplanCardConfig { return {type:"custom:activity-levels-floorplan-card"}; }
  getCardSize(): number { return 8; }
  getGridOptions() { return {columns:"full",rows:"auto"}; }
  override connectedCallback(): void { super.connectedCallback();this.connect(); }
  override disconnectedCallback(): void {super.disconnectedCallback();this.unsubscribe?.();this.unsubscribe=undefined;}
  protected override updated(changed: PropertyValues): void {if(changed.has("hass")) this.connect();}
  private connect(): void {
    if(!this.hass || !this.isConnected) return;
    const source=floorplanSource(this.hass);
    if(source===this.source && this.unsubscribe) return;
    this.unsubscribe?.();this.source=source;
    this.unsubscribe=source.subscribe(snapshot=>{this.snapshot=snapshot;});
  }
  protected override render() {
    const {data,error}=this.snapshot;
    return html`${error?html`<p class="error" role="alert">${error}</p>`:nothing}
      ${data?html`<al-floorplan-viewer .dashboard=${true} .config=${data.config} .live=${data.live}
        .hass=${this.hass} .lights=${data.lights} .settings=${this.settings}
        @al-viewer-settings=${(e:CustomEvent<ViewerSettings>)=>{this.settings=e.detail;}}></al-floorplan-viewer>`:html`<p role="status">Loading floorplan…</p>`}`;
  }
}
