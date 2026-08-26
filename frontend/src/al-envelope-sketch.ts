import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { envelopeLabels, envelopePoints } from "./sketch";
import { sharedStyles } from "./styles";
import type { SketchEnvelope } from "./sketch";

const LEFT = 10;
const RIGHT = 190;
const TOP = 10;
const BASE = 58;
const LABEL_Y = 72;

const sx = (x: number): number => LEFT + x * (RIGHT - LEFT);
const sy = (y: number): number => BASE - y * (BASE - TOP);

/** One decimal is plenty for a 200x80 sketch, and keeps the markup readable. */
const n1 = (n: number): string => String(Math.round(n * 10) / 10);

const point = (x: number, y: number): string => `${n1(x)},${n1(y)}`;

/** Keeps a centred caption from overflowing the viewBox at either edge. */
const clampLabel = (x: number): number => Math.min(RIGHT - 6, Math.max(LEFT + 6, sx(x)));

/** A read-only ADSR curve for one resolved envelope. Purely presentational. */
@customElement("al-envelope-sketch")
export class AlEnvelopeSketch extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        background: none;
      }
      svg {
        width: 100%;
        max-width: 320px;
        height: auto;
        overflow: visible;
      }
      .curve {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 2;
        stroke-linejoin: round;
      }
      .area {
        fill: var(--primary-color);
        fill-opacity: 0.15;
        stroke: none;
      }
      .grid {
        stroke: var(--divider-color, currentColor);
        stroke-width: 1;
        stroke-dasharray: 3 3;
      }
      .caption {
        fill: var(--secondary-text-color);
        font-size: 9px;
      }
    `,
  ];

  @property({ attribute: false }) envelope: SketchEnvelope | null = null;

  override render() {
    const e = this.envelope;
    if (!e) return nothing;
    const pts = envelopePoints(e);
    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    const curve = pts.map((p) => point(sx(p.x), sy(p.y))).join(" ");
    const area = `${point(sx(first.x), BASE)} ${curve} ${point(sx(last.x), BASE)}`;
    const labels = envelopeLabels(e);
    const title = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";

    return html`
      <svg viewBox="0 0 200 80" role="img" aria-label=${title}>
        <title>${title}</title>
        <line class="grid" x1=${LEFT} y1=${BASE} x2=${RIGHT} y2=${BASE}></line>
        ${e.impulse
          ? nothing
          : svg`<line
              class="grid"
              x1=${LEFT}
              y1=${n1(sy(e.sustain))}
              x2=${RIGHT}
              y2=${n1(sy(e.sustain))}
            ></line>`}
        <polygon class="area" points=${area}></polygon>
        <polyline class="curve" points=${curve}></polyline>
        ${labels.map(
          (l) => svg`<text class="caption" x=${n1(clampLabel(l.x))} y=${LABEL_Y} text-anchor="middle">${l.text}</text>`,
        )}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-envelope-sketch": AlEnvelopeSketch;
  }
}
