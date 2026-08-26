import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./al-envelope-sketch";
import "./al-fader";
import "./al-meter";
import { formatDuration } from "./duration";
import { alGainChanged, alOpenStrip, alSelectStrip } from "./events";
import type { GainChangeDetail } from "./events";
import type { StripLevel } from "./al-meter";
import type { SketchEnvelope } from "./sketch";

/** Sustain is a fraction of the peak, not a duration, so it gets two decimals of its own. */
const level = (v: number): string => String(Math.round(v * 100) / 100);

/** The one-line A/D/S/R hint under the sketch; an impulse has no shape to spell out. */
export function adsrHint(e: SketchEnvelope): string {
  if (e.impulse) return `impulse · R ${formatDuration(e.release)}`;
  return `A ${formatDuration(e.attack)} · D ${formatDuration(e.decay)} · S ${level(e.sustain)} · R ${formatDuration(e.release)}`;
}

/**
 * One mixer strip: a stimulus channel or a child bus of the current bus.
 *
 * It reports intent and nothing else - the mixer owns the config. Its events bubble and
 * are composed so the mixer can listen once on the strip container; which strip they came
 * from is the event's `target`, since a strip does not know its own place in the bus.
 */
@customElement("al-strip")
export class AlStrip extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 96px;
      flex: 0 0 auto;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 6px;
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
      cursor: pointer;
      outline: none;
    }
    :host([narrow]) {
      width: 72px;
    }
    :host([kind="bus"]) {
      border-style: double;
      border-width: 4px;
    }
    :host([selected]),
    :host(:focus-visible) {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    .strip {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      min-width: 0;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .link {
      background: none;
      border: none;
      margin: 0;
      padding: 0;
      font: inherit;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }
    .link:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    .name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }
    .sub,
    .adsr {
      color: var(--secondary-text-color);
      font-size: 0.7em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    al-fader {
      align-self: center;
    }
    .foot {
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 20px;
    }
    .badge {
      background: var(--error-color, #db4437);
      color: var(--text-primary-color, #fff);
      border-radius: 10px;
      padding: 0 6px;
      font-size: 0.7em;
      line-height: 1.6;
    }
    .open {
      margin-left: auto;
      color: var(--primary-color);
      font-size: 0.75em;
    }
    .icon {
      font-size: 0.8em;
    }
  `;

  @property({ type: String, reflect: true }) kind: "channel" | "bus" = "channel";
  @property({ type: String }) label = "";
  @property({ type: String }) sublabel: string | null = null;
  @property({ attribute: false }) envelope: SketchEnvelope | null = null;
  @property({ type: Number }) gain = 1;
  @property({ attribute: false }) live: StripLevel | null = null;
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Number }) errors = 0;
  @property({ type: String }) entityIcon: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    // The mixer hands out the roving tabindex; until it does, the strip stays out of the
    // tab order but can still be focused. Set natively so `tabIndex` writes land at once.
    if (!this.hasAttribute("tabindex")) this.tabIndex = -1;
  }

  private select(): void {
    this.dispatchEvent(alSelectStrip());
  }

  /** Drilling into a bus is its own intent: it must not also read as selecting the strip. */
  private open(ev: Event): void {
    ev.stopPropagation();
    this.dispatchEvent(alOpenStrip());
  }

  private onGain(ev: CustomEvent<GainChangeDetail>): void {
    ev.stopPropagation();
    this.dispatchEvent(alGainChanged(ev.detail));
  }

  override render() {
    // A bus has no envelope of its own - the sketch and its A/D/S/R hint are a channel
    // strip's story to tell - so a bus ignores whatever it was handed rather than trust
    // every caller to remember to pass `null`.
    const e = this.kind === "bus" ? null : this.envelope;
    return html`
      <div class="strip" @click=${this.select}>
        <div class="head">
          ${this.entityIcon
            ? html`<ha-icon class="icon" .icon=${this.entityIcon}></ha-icon>`
            : html`<span class="icon">${this.kind === "bus" ? "▤" : "⚡"}</span>`}
          <button class="link name" title=${this.label}>${this.label}</button>
        </div>
        <div class="sub" title=${this.sublabel ?? ""}>${this.sublabel ?? ""}</div>
        ${e ? html`<al-envelope-sketch .envelope=${e}></al-envelope-sketch>` : nothing}
        <div class="adsr" title=${e ? adsrHint(e) : ""}>${e ? adsrHint(e) : ""}</div>
        <al-fader .value=${this.gain} label=${`${this.label} gain`} @value-changed=${this.onGain}></al-fader>
        ${this.live
          ? html`<al-meter .value=${this.live.value} .max=${this.live.max} .gated=${this.live.gated}></al-meter>`
          : nothing}
        <div class="foot">
          ${this.errors > 0
            ? html`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >`
            : nothing}
          ${this.kind === "bus" ? html`<button class="link open" @click=${this.open}>open ▸</button>` : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-strip": AlStrip;
  }
}
