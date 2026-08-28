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

interface SelectOption {
  value: string;
  label: string;
}

/** The label a `select` selector shows for one of its stored values, if it has one. */
export function optionLabel(selector: Selector, value: string): string | undefined {
  const select = selector.select as { options?: readonly SelectOption[] } | undefined;
  return select?.options?.find((o) => o.value === value)?.label;
}

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
  /** What the field means, for the ones whose label does not say it. Shown before the
   * inherited/overridden state, which is what the helper is otherwise entirely made of. */
  @property() hint = "";
  @property() kind: OverrideKind = "number";
  @property() error?: string;

  private get overridden(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  /**
   * Fired on this element only. Every parent binds `@value-changed` directly on the field,
   * and a bubbling copy would also reach the `ha-form` above it, which reads the payload as
   * one of its own fields changing.
   */
  private emit(value: OverrideValue): void {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  }

  private onValueChanged(ev: CustomEvent<{ value?: unknown }>): void {
    ev.stopPropagation();
    this.emit(fromSelectorValue(this.kind, ev.detail?.value));
  }

  private onReset(): void {
    this.emit(null);
  }

  /**
   * The inherited value as the dropdown would spell it: a `select` stores enum ids like
   * `stack`, and the helper should read the way the options do -- "Stack (add on top)",
   * not the raw id.
   */
  private describeInherited(): string {
    const value = this.inherited;
    if (this.kind === "select" && value !== null && value !== undefined) {
      const label = optionLabel(this.selector, String(value));
      if (label !== undefined) return label;
    }
    return formatInherited(this.kind, value);
  }

  /**
   * `ha-selector` defaults `required` to true, which makes a duration selector spell an
   * inherited (null) value as `00:00:00` and hides the clear affordance, so it is passed
   * explicitly: an override that is not set must read as empty.
   */
  override render() {
    const state = this.overridden
      ? "Overridden"
      : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`;
    const helper = this.hint === "" ? state : `${this.hint} ${state}`;
    return html`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? BOOLEAN_SELECTOR : this.selector}
          .label=${this.label}
          .required=${false}
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
