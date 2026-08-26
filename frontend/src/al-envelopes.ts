import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import type { Config, HomeAssistant, ValidationError } from "./types";

/** Placeholder element; the real editor arrives in a later task. */
@customElement("al-envelopes")
export class AlEnvelopes extends LitElement {
  static styles = [sharedStyles];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) errors: ValidationError[] = [];

  render() {
    return html`<ha-card>Coming soon</ha-card>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-envelopes": AlEnvelopes;
  }
}
