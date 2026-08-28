import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./al-fader";
import { alLevelOverride, alMuteToggle, alReset, alSelectStrip } from "./events";
import { formatLevel } from "./model";
import type { FaderChangeDetail } from "./events";
import type { PropertyValues } from "lit";

/**
 * How long a keyboard (or wheel) run of steps is allowed to keep going before the level it
 * arrived at is sent. A drag has a pointer-up to say "this one"; a run of arrow keys does
 * not, and one websocket command per keypress would fight the engine's own cooldown.
 */
export const STEP_DEBOUNCE_MS = 250;

/**
 * One mixer track: a group, as a channel of the console.
 *
 * Every strip is the same shape whatever its place in the tree - name, meter, readout, on
 * one baseline. Where a group sits is the mixer's business, drawn as the bands above the
 * row rather than as furniture on the strip itself; the strip only says which group it is
 * and how loud it is.
 *
 * Read-only unless the mixer says otherwise: `editable` is what turns the meter back into
 * a fader and puts the mute and reset buttons back. It reports intent and nothing else -
 * the mixer owns the config and calls the engine. Its events bubble and are composed so
 * the mixer can listen once on the strip container; which strip they came from is the
 * event's `target`, since a strip does not know its own place in the row.
 */
@customElement("al-strip")
export class AlStrip extends LitElement {
  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 6px;
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
      cursor: pointer;
      outline: none;
    }
    :host([selected]),
    :host(:focus-visible) {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    :host([muted]) .name,
    :host([muted]) .readout {
      opacity: 0.55;
    }
    /* One column, one baseline: the name is a fixed line and the fader a fixed height, so
       the meter and the readout land at the same place on every strip in the row. */
    .strip {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      min-width: 0;
      height: 100%;
    }
    .head {
      display: flex;
      align-items: center;
      min-width: 0;
      height: 1.4em;
    }
    .name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }
    button {
      background: none;
      border: 1px solid transparent;
      margin: 0;
      padding: 0 4px;
      font: inherit;
      font-size: 0.75em;
      color: inherit;
      border-radius: 4px;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    al-fader {
      align-self: center;
    }
    .readout {
      text-align: center;
      font-size: 0.85em;
      font-variant-numeric: tabular-nums;
    }
    .buttons {
      display: flex;
      justify-content: center;
      gap: 4px;
    }
    .buttons button {
      border-color: var(--divider-color, #e0e0e0);
      min-width: 22px;
      line-height: 1.6;
    }
    .mute[aria-pressed="true"] {
      background: var(--warning-color, #ffa600);
      color: var(--text-primary-color, #fff);
      border-color: var(--warning-color, #ffa600);
    }
    /* Pushed to the bottom, so a badge on one strip does not shorten the others. */
    .foot {
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 20px;
      margin-top: auto;
    }
    .badge {
      background: var(--error-color, #db4437);
      color: var(--text-primary-color, #fff);
      border-radius: 10px;
      padding: 0 6px;
      font-size: 0.7em;
      line-height: 1.6;
    }
  `;

  @property({ type: String }) label = "";

  /**
   * Whether the mixer is in Edit mode. Off - the default - the fader is a meter and the
   * mute and reset buttons are not rendered at all: a mixer left open on a wall tablet
   * reads levels, and nothing on it can be leant on by accident.
   */
  @property({ type: Boolean, reflect: true }) editable = false;

  /** The group's live level, and what it would be without a simulated stimulus holding it. */
  @property({ type: Number }) value = 0;
  @property({ type: Number }) realValue = 0;
  @property({ type: Number }) maxValue = 5;
  @property({ type: Number }) precision = 1;

  /**
   * The stamp of the live frame `value` came from. A frame answers a pending ask by
   * arriving, not by carrying a different number: a MAX group pulled below a louder
   * child, a SUM group whose override reset it back to where it already was, a command
   * that never landed - all leave the level exactly where it was, and a fader waiting for
   * it to move would sit at the ask forever.
   */
  @property({ type: Number }) liveNow = 0;

  @property({ type: Boolean, reflect: true }) muted = false;
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Number }) errors = 0;

  /**
   * The level the user has just put the fader at, until a live frame carrying it (or
   * anything else) arrives. Without it a run of arrow keys would step from the live value
   * every time and never get anywhere, and the readout would not follow the drag.
   */
  @state() private pending: number | null = null;

  private dragging = false;
  private stepTimer?: number;

  override connectedCallback(): void {
    super.connectedCallback();
    // The mixer hands out the roving tabindex; until it does, the strip stays out of the
    // tab order but can still be focused. Set natively so `tabIndex` writes land at once.
    if (!this.hasAttribute("tabindex")) this.tabIndex = -1;
  }

  override disconnectedCallback(): void {
    this.clearStepTimer();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    // A fresh live frame is the answer to whatever was asked for: stop showing the ask.
    // Not mid-drag, though - the pointer is still holding the fader where it is.
    if ((changed.has("liveNow") || changed.has("value")) && !this.dragging) this.pending = null;
    // Leaving Edit mode takes the fader out from under whatever was holding it: drop the
    // ask and the drag with it, so the meter shows the engine rather than a leftover.
    if (changed.has("editable") && !this.editable) {
      this.dragging = false;
      this.pending = null;
      this.clearStepTimer();
    }
  }

  /**
   * The engine's own answer to the last override, ahead of the live frame that will carry
   * it: the level actually reached, or `null` for "the ask never landed". Either way the
   * fader stops showing what was asked for. A drag that has already taken the fader back
   * over outranks it - the pointer is the newer intent.
   */
  settle(value: number | null): void {
    if (this.dragging) return;
    this.pending = value;
  }

  /** `0` on the selected strip, `-1` on every other one: the row is a single tab stop. */
  private get stop(): number {
    return this.selected ? 0 : -1;
  }

  private select(): void {
    this.dispatchEvent(alSelectStrip());
  }

  private clearStepTimer(): void {
    if (this.stepTimer === undefined) return;
    clearTimeout(this.stepTimer);
    this.stepTimer = undefined;
  }

  private sendOverride(value: number): void {
    this.clearStepTimer();
    this.dispatchEvent(alLevelOverride(value));
  }

  /**
   * A fader move. A drag reports its steps live and settles on pointer-up, which is the
   * user saying "there" - that goes out at once. A keyboard or wheel step settles
   * immediately with no live moves before it, so a run of them is coalesced instead.
   *
   * A read-only fader reports nothing, but the guard is here as well: the level is the
   * engine's, and Edit mode is the only thing that says it may be written to.
   */
  private onFader(ev: CustomEvent<FaderChangeDetail>): void {
    ev.stopPropagation();
    if (!this.editable) return;
    const { value, live } = ev.detail;
    this.pending = value;
    if (live) {
      this.dragging = true;
      return;
    }
    if (this.dragging) {
      this.dragging = false;
      this.sendOverride(value);
      return;
    }
    this.clearStepTimer();
    this.stepTimer = window.setTimeout(() => {
      this.stepTimer = undefined;
      this.dispatchEvent(alLevelOverride(value));
    }, STEP_DEBOUNCE_MS);
  }

  private onMute(): void {
    this.dispatchEvent(alMuteToggle(!this.muted));
  }

  private onReset(): void {
    this.dispatchEvent(alReset());
  }

  override render() {
    const shown = this.pending ?? this.value;
    return html`
      <div class="strip" @click=${this.select}>
        <div class="head">
          <span class="name" title=${this.label}>${this.label}</span>
        </div>
        <al-fader
          mode="level"
          ?readonly=${!this.editable}
          .value=${shown}
          .max=${this.maxValue}
          .precision=${this.precision}
          .tick=${this.realValue}
          .focusable=${this.selected}
          label=${`${this.label} level`}
          @value-changed=${this.onFader}
        ></al-fader>
        <div class="readout">${formatLevel(shown, this.precision)}</div>
        ${this.editable
          ? html`<div class="buttons">
              <button
                class="mute"
                type="button"
                tabindex=${this.stop}
                aria-pressed=${this.muted ? "true" : "false"}
                title=${this.muted ? `Unmute ${this.label}` : `Mute ${this.label}`}
                @click=${this.onMute}
              >
                M
              </button>
              <button
                class="reset"
                type="button"
                tabindex=${this.stop}
                title=${`Reset ${this.label}`}
                @click=${this.onReset}
              >
                R
              </button>
            </div>`
          : nothing}
        <div class="foot">
          ${this.errors > 0
            ? html`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >`
            : nothing}
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
