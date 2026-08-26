import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./al-meter";
import { alLimiterChanged, alMixChanged, alSimToggled } from "./events";
import type { StripLevel } from "./al-meter";
import type { Mix } from "./types";

const MIXES: Mix[] = ["sum", "max", "mean"];

/**
 * The MASTER strip: the current bus itself, at the right of the mixer.
 *
 * Mix and limiter are config and go back as events for the draft store; the ⏻ is Home
 * Assistant's own switch entity, so it is hidden outright for a bus with no lights to
 * simulate, and explains itself in a tooltip when the integration is blocking it.
 */
@customElement("al-master-strip")
export class AlMasterStrip extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 96px;
      flex: 0 0 auto;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 6px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    :host([narrow]) {
      width: 72px;
    }
    .strip {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    .name {
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 600;
      font-size: 0.8em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    label {
      display: block;
      color: var(--secondary-text-color);
      font-size: 0.7em;
    }
    select,
    input {
      width: 100%;
      box-sizing: border-box;
      font: inherit;
      font-size: 0.8em;
      color: var(--primary-text-color);
      background: var(--card-background-color, var(--primary-background-color));
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      padding: 2px 4px;
    }
    select:focus-visible,
    input:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -1px;
    }
    .sim {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .muted {
      color: var(--secondary-text-color);
      font-size: 0.7em;
    }
  `;

  @property({ type: String }) label = "";
  @property({ type: String }) mix: Mix = "sum";
  @property({ type: Number }) maxValue = 5;
  @property({ type: Number }) precision = 1;
  @property({ attribute: false }) live: StripLevel | null = null;
  @property({ type: Number }) lights = 0;
  @property({ type: String }) simEntityId: string | null = null;
  @property({ type: Boolean }) simOn = false;
  @property({ type: String }) blockedReason: string | null = null;

  private onMix(ev: Event): void {
    this.dispatchEvent(alMixChanged((ev.target as HTMLSelectElement).value as Mix));
  }

  /** An empty or unreadable box is a half-typed number, not a request for a ceiling of NaN. */
  private onLimiter(ev: Event): void {
    const raw = (ev.target as HTMLInputElement).value.trim();
    const value = Number(raw);
    if (raw === "" || !Number.isFinite(value)) return;
    this.dispatchEvent(alLimiterChanged(value));
  }

  private onSim(ev: Event): void {
    this.dispatchEvent(alSimToggled((ev.target as unknown as { checked?: boolean }).checked === true));
  }

  override render() {
    const blocked = this.blockedReason;
    return html`
      <div class="strip">
        <div class="name" title=${this.label}>${this.label}</div>
        <div class="muted">master</div>
        <div>
          <label for="mix">mix</label>
          <select id="mix" class="mix" .value=${this.mix} @change=${this.onMix}>
            ${MIXES.map((m) => html`<option value=${m} ?selected=${m === this.mix}>${m}</option>`)}
          </select>
        </div>
        <div>
          <label for="limiter">limiter</label>
          <input
            id="limiter"
            class="limiter"
            type="number"
            min="0.1"
            step="0.1"
            .value=${String(this.maxValue)}
            @change=${this.onLimiter}
          />
        </div>
        <div class="muted">${this.precision} dp · ${this.lights} light${this.lights === 1 ? "" : "s"}</div>
        ${this.lights > 0
          ? html`<div class="sim">
              <ha-switch
                .checked=${this.simOn}
                .disabled=${this.simEntityId === null}
                title=${blocked ?? (this.simEntityId === null ? "No simulation switch for this group" : "Presence simulation")}
                @change=${this.onSim}
              ></ha-switch>
              <span class="muted">⏻</span>
            </div>`
          : nothing}
        ${this.live
          ? html`<al-meter .value=${this.live.value} .max=${this.live.max} .gated=${this.live.gated}></al-meter>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-master-strip": AlMasterStrip;
  }
}
