import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("activity-levels-panel")
export class ActivityLevelsPanel extends LitElement {
  render() { return html`<p style="padding:16px">Activity Levels panel is loading…</p>`; }
}
declare global { interface HTMLElementTagNameMap { "activity-levels-panel": ActivityLevelsPanel } }
