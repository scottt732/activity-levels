import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./al-floorplan-viewer";
import "./al-floorplan-import";
import { walkGroups } from "./model";
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

  protected override render() {
    if (!this.config) return nothing;
    const hasGeometry = walkGroups(this.config).some(({ group }) => group.bounds || group.points);
    return html`
      <al-floorplan-viewer .config=${this.config} .live=${this.live}></al-floorplan-viewer>
      <details .open=${!hasGeometry}><summary>Import or update floorplan</summary>
        <al-floorplan-import .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-floorplan-import>
      </details>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { "al-floorplans": AlFloorplans }
}
