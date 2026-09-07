import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import type { HomeAssistant } from "./types";
import type { PresenceCardConfig } from "./al-presence-card";
import type { PresenceDashboard } from "./presence-card-model";
import { presenceStyles } from "./presence-styles";
import { presenceCardSource } from "./presence-card-store";

@customElement("activity-levels-presence-card-editor")
export class PresenceCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private config: PresenceCardConfig = { type: "custom:activity-levels-presence-card", group: "" };
  @state() private data?: PresenceDashboard;
  @state() private error?: string;
  private unsubscribe?: () => void;
  static styles = presenceStyles;
  setConfig(config: PresenceCardConfig): void { this.config = { ...config }; }
  connectedCallback(): void { super.connectedCallback(); this.connect(); }
  disconnectedCallback(): void { super.disconnectedCallback(); this.unsubscribe?.(); this.unsubscribe = undefined; }
  protected updated(changed: PropertyValues): void { if (changed.has("hass")) this.connect(); }
  private connect(): void {
    if (!this.hass || !this.isConnected || this.unsubscribe) return;
    this.unsubscribe = presenceCardSource(this.hass).subscribe(({ data, error }) => { this.data = data; this.error = error; });
  }
  private change(group: string): void {
    this.config = { ...this.config, group };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this.config }, bubbles: true, composed: true }));
  }
  protected render() {
    return html`<label>Room or floor <select aria-label="Room or floor" .value=${this.config.group} @change=${(e: Event) => this.change((e.target as HTMLSelectElement).value)}>
      <option value="">Choose a room or floor…</option>${this.data?.groups.map(g => html`<option value=${g.id}>${g.kind === "floor" ? "Floor: " : ""}${g.name}</option>`)}
    </select></label>${this.error ? html`<p role="alert">${this.error}</p>` : ""}`;
  }
}
