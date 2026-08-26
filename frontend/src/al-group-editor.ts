import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import type { Config, HomeAssistant, Path, ValidationError } from "./types";

/** Placeholder element; the real editor arrives in a later task. */
@customElement("al-group-editor")
export class AlGroupEditor extends LitElement {
  static styles = [sharedStyles];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) path: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];

  render() {
    return html`<ha-card>Coming soon</ha-card>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-group-editor": AlGroupEditor;
  }
}
