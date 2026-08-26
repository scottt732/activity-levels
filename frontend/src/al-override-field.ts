import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatInherited, fromSelectorValue, toSelectorValue } from "./convert";
import { sharedStyles } from "./styles";
import type { OverrideKind, OverrideValue } from "./convert";
import type { HomeAssistant } from "./types";

/** An HA selector config, e.g. `{ number: { min: 0, max: 1 } }`. */
export type Selector = Record<string, unknown>;

export const BOOLEAN_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
};

/**
 * One nullable override: an `ha-selector` plus a reset button. `null` means
 * "inherit", and the helper text names where the effective value comes from.
 */
@customElement("al-override-field")
export class AlOverrideField extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        background: none;
        margin-bottom: 8px;
      }
      .field {
        flex: 1;
        min-width: 0;
      }
      .msg {
        margin-left: 4px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property() label = "";
  @property({ attribute: false }) selector: Selector = { text: {} };
  @property({ attribute: false }) value: OverrideValue = null;
  @property({ attribute: false }) inherited: OverrideValue = null;
  @property({ attribute: "inherited-from" }) inheritedFrom = "defaults";
  @property() kind: OverrideKind = "number";
  @property() error?: string;

  private get overridden(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  private emit(value: OverrideValue): void {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value }, bubbles: true, composed: true }));
  }

  private onValueChanged(ev: CustomEvent<{ value?: unknown }>): void {
    ev.stopPropagation();
    this.emit(fromSelectorValue(this.kind, ev.detail?.value));
  }

  private onReset(): void {
    this.emit(null);
  }

  override render() {
    const helper = this.overridden
      ? "Overridden"
      : `Inherited from ${this.inheritedFrom}: ${formatInherited(this.kind, this.inherited)}`;
    return html`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? BOOLEAN_SELECTOR : this.selector}
          .label=${this.label}
          .value=${toSelectorValue(this.kind, this.value)}
          .helper=${helper}
          @value-changed=${this.onValueChanged}
        ></ha-selector>
        <ha-icon-button
          label="Reset to inherited"
          title="Reset to inherited"
          .disabled=${!this.overridden}
          @click=${this.onReset}
        >
          <ha-icon icon="mdi:backup-restore"></ha-icon>
        </ha-icon-button>
      </div>
      ${this.error ? html`<div class="muted error msg">${this.error}</div>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-override-field": AlOverrideField;
  }
}
