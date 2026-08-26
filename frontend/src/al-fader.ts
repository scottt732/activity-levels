import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { FADER_MAX, FADER_MIN, clampGain, formatGain, fromPosition, stepValue, toPosition } from "./fader";
import type { GainChangeDetail } from "./events";

/** Keeps the knob inside the track: half its height at either end. */
const KNOB = 12;

/** One decimal of a percent is well under a pixel of throw, and keeps the markup stable. */
const pct = (ratio: number): string => `${Math.round(ratio * 1000) / 10}%`;

/**
 * A vertical gain fader on the log scale from `fader.ts`, so unity gain sits mid-throw.
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
    .value {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }
    :host([disabled]) .track {
      cursor: default;
      opacity: 0.5;
    }
  `;

  @property({ type: Number }) value = 1;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) label = "Gain";

  /** The pending value of a drag, or null when the host's value is the one on show. */
  @state() private dragValue: number | null = null;

  private dragging = false;

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
    this.dispatchEvent(new CustomEvent<GainChangeDetail>("value-changed", { detail: { value, live } }));
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
    this.commit(stepValue(this.current, ev.deltaY < 0 ? 1 : -1, ev.shiftKey));
  };

  private onKeyDown(ev: KeyboardEvent): void {
    if (this.disabled) return;
    const v = this.current;
    let next: number;
    switch (ev.key) {
      case "ArrowUp":
      case "ArrowRight":
        next = stepValue(v, 1, ev.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next = stepValue(v, -1, ev.shiftKey);
        break;
      case "Home":
        next = FADER_MIN;
        break;
      case "End":
        next = FADER_MAX;
        break;
      case "PageUp":
        next = clampGain(v * 2);
        break;
      case "PageDown":
        next = clampGain(v / 2);
        break;
      default:
        return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    this.commit(next);
  }

  private onDoubleClick(): void {
    if (this.disabled) return;
    this.commit(1);
  }

  /** Maps a pointer's y onto the track: its top is full gain, its bottom is silence. */
  private moveTo(ev: MouseEvent, track: HTMLElement): void {
    const rect = track.getBoundingClientRect();
    if (rect.height <= 0) return;
    const value = fromPosition(1 - (ev.clientY - rect.top) / rect.height);
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
    const value = this.current;
    const pos = toPosition(value);
    return html`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${FADER_MIN}
        aria-valuemax=${FADER_MAX}
        aria-valuenow=${value}
        aria-valuetext=${formatGain(value)}
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
          <div class="unity"></div>
          <div class="fill" style="height: ${pct(pos)}"></div>
          <div class="knob" style="bottom: calc(${pct(pos)} - ${Math.round((pos - 0.5) * KNOB * 10) / 10}px - ${KNOB / 2}px)"></div>
        </div>
        <div class="value">${formatGain(value)}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-fader": AlFader;
  }
}
