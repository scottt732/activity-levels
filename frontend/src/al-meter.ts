import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

/** The live reading one strip shows: the group's level against the ceiling it mixes into. */
export interface StripLevel {
  value: number;
  max: number;
  gated: boolean;
}

/** One decimal of a percent is under a pixel on any strip, and keeps the markup stable. */
const pct = (ratio: number): string => `${Math.round(ratio * 1000) / 10}%`;

/**
 * A strip's level meter. Purely decorative: the number it draws is already in the strip's
 * text, so it is hidden from assistive technology rather than announced twice.
 */
@customElement("al-meter")
export class AlMeter extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .meter {
      flex: 1;
      height: 6px;
      min-width: 0;
      border-radius: 3px;
      background: var(--divider-color, #e0e0e0);
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 120ms linear;
    }
    .fill.hot {
      background: var(--warning-color, #ffbe50);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--disabled-text-color, #9e9e9e);
      flex-shrink: 0;
    }
    .dot.gated {
      background: var(--primary-color);
    }
  `;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) max = 1;
  @property({ type: Boolean }) gated = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("aria-hidden", "true");
  }

  /** 0..1. A ceiling of zero reads as empty rather than as a division by it. */
  private get ratio(): number {
    if (!(this.max > 0)) return 0;
    return Math.min(1, Math.max(0, this.value / this.max));
  }

  override render() {
    const ratio = this.ratio;
    return html`
      <div class="meter">
        <div class=${classMap({ fill: true, hot: ratio > 0.9 })} style="width: ${pct(ratio)}"></div>
      </div>
      <div class=${classMap({ dot: true, gated: this.gated })}></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-meter": AlMeter;
  }
}
