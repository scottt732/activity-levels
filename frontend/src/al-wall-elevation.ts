import { LitElement, css, html, svg, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { openingWall, resizeOpening, openingFitsRoom } from "./room-openings";
import { formatLengthInput } from "./measurement-units";
import type { LengthUnit } from "./measurement-units";
import type { Group, RoomOpening } from "./types";
@customElement("al-wall-elevation")
export class AlWallElevation extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    svg {
      width: 100%;
      height: 100%;
      touch-action: none;
      background: #112632;
      border: 1px solid #446779;
    }
    rect {
      fill: #45657433;
      stroke: #8ac9d4;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .grip {
      fill: #ffcd69;
      cursor: grab;
    }
    text {
      fill: #d8edf2;
      font-size: 0.14px;
      text-anchor: middle;
    }
    .opening {
      fill: #7ad1d633;
      stroke: #7ad1d6;
      cursor: move;
    }
  `;
  @property({ attribute: false }) group?: Group;
  @property({ attribute: false }) opening?: RoomOpening;
  @property({ type: String }) unit: LengthUnit = "m";
  @property({ type: Boolean }) disabled = false;
  private drag?: {
    pointer: number;
    kind: "move" | "left" | "right" | "top" | "bottom";
    x: number;
    z: number;
    opening: RoomOpening;
  };
  private point(e: MouseEvent) {
    const matrix = this.renderRoot.querySelector("svg")?.getScreenCTM();
    if (!matrix) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      matrix.inverse(),
    );
    return [p.x, -p.y] as const;
  }
  private start(e: PointerEvent, kind: NonNullable<typeof this.drag>["kind"]) {
    if (this.disabled || !this.opening) return;
    e.preventDefault();
    const p = this.point(e);
    if (!p) return;
    this.drag = {
      pointer: e.pointerId,
      kind,
      x: p[0],
      z: p[1],
      opening: structuredClone(this.opening),
    };
    this.renderRoot.querySelector("svg")!.setPointerCapture(e.pointerId);
  }
  private move(e: PointerEvent) {
    const d = this.drag,
      o = d?.opening,
      g = this.group,
      p = this.point(e);
    if (this.disabled || !d || d.pointer !== e.pointerId || !o || !g || !p)
      return;
    const w = openingWall(g, o);
    if (!w) return;
    let patch: Partial<RoomOpening>;
    if (d.kind === "move")
      patch = {
        position: [
          o.position[0] + (p[0] - d.x) * w.dx,
          o.position[1] + (p[0] - d.x) * w.dy,
          o.position[2] + p[1] - d.z,
        ],
      };
    else if (d.kind === "left" || d.kind === "right") {
      const side = d.kind === "left" ? -1 : 1;
      const direction =
        Math.cos((o.yaw * Math.PI) / 180) * w.dx +
        Math.sin((o.yaw * Math.PI) / 180) * w.dy;
      patch = resizeOpening(o, (side * (direction >= 0 ? 1 : -1)) as -1 | 1, [
        w.a[0] + p[0] * w.dx,
        w.a[1] + p[0] * w.dy,
      ]);
    } else if (d.kind === "top")
      patch = { height: Math.max(0.1, p[1] - o.position[2]) };
    else {
      const bottom = Math.min(o.position[2] + o.height - 0.1, p[1]);
      patch = {
        height: o.position[2] + o.height - bottom,
        position: [o.position[0], o.position[1], bottom],
      };
    }
    this.dispatchEvent(
      new CustomEvent("al-opening-resize", {
        detail: patch,
        bubbles: true,
        composed: true,
      }),
    );
  }
  protected override render() {
    const o = this.opening,
      g = this.group;
    if (!o || !g?.bounds) return nothing;
    const w = openingWall(g, o);
    if (!w) return html`Select an opening aligned with a wall.`;
    const x = (o.position[0] - w.a[0]) * w.dx + (o.position[1] - w.a[1]) * w.dy,
      z = o.position[2],
      low = g.bounds[0][2],
      high = g.bounds[1][2];
    return html`<svg
      aria-label="Wall elevation"
      viewBox=${`-.4 ${-high - 0.4} ${w.length + 0.8} ${high - low + 0.8}`}
      @pointermove=${this.move}
      @pointerup=${() => {
        this.drag = undefined;
      }}
      @pointercancel=${() => {
        this.drag = undefined;
      }}
    >
      <rect x="0" y=${-high} width=${w.length} height=${high - low} />
      <rect
        style=${openingFitsRoom(g, o) ? "" : "stroke:#ff5e52;fill:#ff5e5233"}
        class="opening"
        x=${x - o.width / 2}
        y=${-z - o.height}
        width=${o.width}
        height=${o.height}
        @pointerdown=${(e: PointerEvent) => this.start(e, "move")}
      />
      ${(
        [
          ["left", x - o.width / 2, -z - o.height / 2],
          ["right", x + o.width / 2, -z - o.height / 2],
          ["top", x, -z - o.height],
          ["bottom", x, -z],
        ] as const
      ).map(
        ([kind, cx, cy]) =>
          svg`<circle class="grip" cx=${cx} cy=${cy} r=".06" aria-label=${`Resize ${kind}`} @pointerdown=${(e: PointerEvent) => this.start(e, kind)}/>`,
      )}
      <text x=${x} y=${-z - o.height - 0.15}>
        ${formatLengthInput(o.width, this.unit)}
      </text>
      <text x=${(x - o.width / 2) / 2} y=${-low + 0.2}>
        ${formatLengthInput(x - o.width / 2, this.unit)}
      </text>
      <text x=${x + o.width / 2 + 0.3} y=${-z - o.height / 2}>
        ${formatLengthInput(o.height, this.unit)}
      </text>
    </svg>`;
  }
}
