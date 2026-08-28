import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { gainScale, levelScale } from "./fader";
import type { FaderScale } from "./fader";
import type { FaderChangeDetail } from "./events";

/** Keeps the knob inside the track: half its height at either end. */
const KNOB = 12;

/** One decimal of a percent is well under a pixel of throw, and keeps the markup stable. */
const pct = (ratio: number): string => `${Math.round(ratio * 1000) / 10}%`;

/**
 * A vertical fader over one of the scales in `fader.ts`: a **gain** (log, unity mid-throw)
 * or a group's **level** (linear, 0 to its ceiling, quantised to its precision).
 *
 * The value is the host's: the fader never writes to `value`, it asks for a new one. While
 * a drag is in flight the pending value lives in `dragValue` so the host can re-render
 * (or refuse the change) without the knob jumping out from under the pointer.
 */
@customElement("al-fader")
export class AlFader extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .fader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      outline: none;
    }
    .fader:focus-visible .track {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
    .track {
      position: relative;
      width: 18px;
      height: 120px;
      border-radius: 9px;
      background: var(--divider-color, #e0e0e0);
      cursor: ns-resize;
      touch-action: none;
    }
    .fill {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 9px;
      background: var(--primary-color);
      opacity: 0.35;
    }
    .knob {
      position: absolute;
      left: -3px;
      right: -3px;
      height: ${KNOB}px;
      border-radius: 3px;
      background: var(--primary-color);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    .unity {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 50%;
      border-top: 1px dashed var(--secondary-text-color);
      opacity: 0.5;
    }
    /* Where the group would sit without the simulated stimulus holding it up. */
    .tick {
      position: absolute;
      left: -4px;
      right: -4px;
      border-top: 2px solid var(--warning-color, #ffa600);
    }
    .value {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }
    :host([disabled]) .track {
      cursor: default;
      opacity: 0.5;
    }
    /* Nothing to take hold of, so nothing that invites it. */
    :host([readonly]) .track {
      cursor: default;
    }
  `;

  @property({ type: Number }) value = 1;
  @property({ type: Boolean, reflect: true }) disabled = false;
  /**
   * Whether the fader is a tab stop. A strip row is one stop, not four, so only the
   * selected strip lets its fader into the tab order; the keyboard still works once
   * focus is there, which is what separates this from `disabled`.
   */
  @property({ type: Boolean }) focusable = true;
  /**
   * A fader with nothing to hold: no knob, no pointer or keyboard control, and out of the
   * tab order however `focusable` is set. The fill still reads the value, so this is the
   * same bar the mixer draws when it is showing levels rather than setting them - a meter,
   * which is what it announces itself as, rather than a slider that quietly refuses.
   */
  @property({ type: Boolean, reflect: true, attribute: "readonly" }) readOnly = false;
  @property({ type: String }) label = "Gain";

  /** Which quantity the fader is holding: a gain into a parent, or a group's own level. */
  @property({ type: String }) mode: "gain" | "level" = "gain";
  /** The level scale's ceiling; ignored in gain mode, which has a range of its own. */
  @property({ type: Number }) max = 5;
  /** Decimals the level scale quantises to; ignored in gain mode. */
  @property({ type: Number }) precision = 1;
  /**
   * A second, read-only reading to mark on the track - the group's real value while a
   * simulated one is holding the fill above it. Null, or equal to the value, draws nothing.
   */
  @property({ type: Number }) tick: number | null = null;

  /** The pending value of a drag, or null when the host's value is the one on show. */
  @state() private dragValue: number | null = null;

  private dragging = false;

  private get scale(): FaderScale {
    return this.mode === "level" ? levelScale(this.max, this.precision) : gainScale;
  }

  /** What the fader is showing: the drag if there is one, otherwise what the host gave it. */
  private get current(): number {
    return this.dragValue ?? this.value;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Not declarative: the wheel listener has to be non-passive to be allowed to preventDefault.
    this.addEventListener("wheel", this.onWheel, { passive: false });
  }

  override disconnectedCallback(): void {
    this.removeEventListener("wheel", this.onWheel);
    super.disconnectedCallback();
  }

  private emit(value: number, live: boolean): void {
    this.dispatchEvent(new CustomEvent<FaderChangeDetail>("value-changed", { detail: { value, live } }));
  }

  /** A value the host should keep: ends any drag and reports it as settled. */
  private commit(value: number): void {
    this.dragging = false;
    this.dragValue = null;
    this.emit(value, false);
  }

  private readonly onWheel = (ev: WheelEvent): void => {
    if (this.disabled || ev.deltaY === 0) return;
    ev.preventDefault();
    this.commit(this.scale.step(this.current, ev.deltaY < 0 ? 1 : -1, ev.shiftKey));
  };

  private onKeyDown(ev: KeyboardEvent): void {
    if (this.disabled) return;
    const scale = this.scale;
    const v = this.current;
    let next: number;
    switch (ev.key) {
      case "ArrowUp":
      case "ArrowRight":
        next = scale.step(v, 1, ev.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next = scale.step(v, -1, ev.shiftKey);
        break;
      case "Home":
        next = scale.min;
        break;
      case "End":
        next = scale.max;
        break;
      case "PageUp":
        next = scale.page(v, 1);
        break;
      case "PageDown":
        next = scale.page(v, -1);
        break;
      default:
        return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    this.commit(next);
  }

  /** Only a scale with a home to go back to answers a double-click; a level has none. */
  private onDoubleClick(): void {
    const reset = this.scale.reset;
    if (this.disabled || reset === null) return;
    this.commit(reset);
  }

  /** Maps a pointer's y onto the track: its top is the top of the scale, its bottom the floor. */
  private moveTo(ev: MouseEvent, track: HTMLElement): void {
    const rect = track.getBoundingClientRect();
    if (rect.height <= 0) return;
    const value = this.scale.fromPosition(1 - (ev.clientY - rect.top) / rect.height);
    if (value === this.dragValue) return;
    this.dragValue = value;
    this.emit(value, true);
  }

  private onPointerDown(ev: PointerEvent): void {
    if (this.disabled) return;
    const track = ev.currentTarget as HTMLElement;
    ev.preventDefault();
    this.dragging = true;
    try {
      track.setPointerCapture(ev.pointerId);
    } catch {
      /* no capture (or no pointer events at all, under jsdom): the track's own listeners do */
    }
    this.moveTo(ev, track);
  }

  private onPointerMove(ev: PointerEvent): void {
    if (!this.dragging) return;
    this.moveTo(ev, ev.currentTarget as HTMLElement);
  }

  private onPointerUp(ev: PointerEvent): void {
    if (!this.dragging) return;
    try {
      (ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId);
    } catch {
      /* nothing was captured */
    }
    this.commit(this.current);
  }

  override render() {
    const scale = this.scale;
    const value = scale.clamp(this.current);
    const pos = scale.toPosition(value);
    // A tick that lands on the value itself is not a second reading, just a duplicate line.
    const tick = this.tick === null || scale.clamp(this.tick) === value ? null : scale.clamp(this.tick);
    const marks = html`
      ${this.mode === "gain" ? html`<div class="unity"></div>` : nothing}
      <div class="fill" style="height: ${pct(pos)}"></div>
      ${tick === null
        ? nothing
        : html`<div class="tick" style="bottom: ${pct(scale.toPosition(tick))}" title=${scale.format(tick)}></div>`}
    `;
    if (this.readOnly)
      return html`
        <div
          class="fader"
          role="meter"
          aria-label=${this.label}
          aria-valuemin=${scale.min}
          aria-valuemax=${scale.max}
          aria-valuenow=${value}
          aria-valuetext=${scale.format(value)}
        >
          <div class="track">${marks}</div>
          <div class="value">${scale.format(value)}</div>
        </div>
      `;
    return html`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled || !this.focusable ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${scale.min}
        aria-valuemax=${scale.max}
        aria-valuenow=${value}
        aria-valuetext=${scale.format(value)}
        aria-disabled=${this.disabled ? "true" : "false"}
        @keydown=${this.onKeyDown}
        @dblclick=${this.onDoubleClick}
      >
        <div
          class="track"
          @pointerdown=${this.onPointerDown}
          @pointermove=${this.onPointerMove}
          @pointerup=${this.onPointerUp}
          @pointercancel=${this.onPointerUp}
        >
          ${marks}
          <div class="knob" style="bottom: calc(${pct(pos)} - ${Math.round((pos - 0.5) * KNOB * 10) / 10}px - ${KNOB / 2}px)"></div>
        </div>
        <div class="value">${scale.format(value)}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-fader": AlFader;
  }
}
