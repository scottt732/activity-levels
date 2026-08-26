import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import type { Config, HomeAssistant, LiveState, Path, ValidationError } from "./types";

/** Placeholder element; the real editor arrives in a later task. */
@customElement("al-tree")
export class AlTree extends LitElement {
  static styles = [sharedStyles];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) selection: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) live: LiveState | null = null;

  render() {
    return html`<ha-card>Coming soon</ha-card>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-tree": AlTree;
  }
}
