import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

/** Pointer capture makes aiming continuous even when a finger leaves the dial. */
@customElement("al-orientation-control")
export class AlOrientationControl extends LitElement {
  static styles = css`
    :host { display:block; }
    .controls { display:flex; align-items:center; flex-wrap:wrap; gap:12px; }
    svg { width:132px; height:132px; touch-action:none; cursor:crosshair; border-radius:50%; }
    svg:focus { outline:2px solid var(--primary-color,#8ed9ea); outline-offset:3px; }
    circle { fill:#16313f; stroke:#638b9e; stroke-width:2; }
    line { stroke:#ffcd69; stroke-width:3; }
    .tip { fill:#ffcd69; }
    text { fill:#bdd7e0; font-size:10px; text-anchor:middle; }
    .active circle { stroke:#ffcd69; stroke-width:4; }
    .buttons { display:grid; gap:8px; }
    .row { display:flex; align-items:center; gap:8px; }
    output { min-width:92px; font-variant-numeric:tabular-nums; }
    button { min-width:44px; min-height:44px; border:1px solid #638b9e; border-radius:8px; background:var(--secondary-background-color,#243c4b); color:var(--primary-text-color,#fff); cursor:pointer; }
    button:disabled, [aria-disabled="true"] { opacity:.45; cursor:default; }
    p { margin:8px 0; font-size:12px; color:var(--secondary-text-color,#bdd7e0); }
  `;
  @property({ type:Number }) yaw = 0;
  @property({ type:Number }) pitch = 0;
  @property({ type:Boolean }) disabled = false;
  @state() private aiming = false;
  private pointer?: number;

  private change(yaw: number, pitch: number): void {
    if (this.disabled) return;
    this.yaw = ((yaw % 360) + 360) % 360;
    this.pitch = Math.max(-90, Math.min(90, pitch));
    this.dispatchEvent(new CustomEvent("al-orientation-change", {
      detail:{ yaw:this.yaw, pitch:this.pitch }, bubbles:true, composed:true,
    }));
  }

  private aim(event: PointerEvent): void {
    const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = rect.top + rect.height / 2 - event.clientY;
    if (Math.hypot(x, y) < 4) return;
    this.change(Math.round(Math.atan2(y, x) * 180 / Math.PI), this.pitch);
  }

  private start(event: PointerEvent): void {
    if (this.disabled || event.button !== 0 || this.pointer !== undefined) return;
    event.preventDefault();
    this.pointer = event.pointerId;
    this.aiming = true;
    (event.currentTarget as SVGSVGElement).setPointerCapture(event.pointerId);
    this.aim(event);
  }

  private finish(event: PointerEvent): void {
    if (this.pointer !== event.pointerId) return;
    const target = event.currentTarget as SVGSVGElement;
    this.pointer = undefined;
    this.aiming = false;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
  }

  private key(event: KeyboardEvent): void {
    if (this.disabled) return;
    const step = event.shiftKey ? 15 : 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      this.change(this.yaw + (event.key === "ArrowLeft" ? step : -step), this.pitch);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      this.change(this.yaw, this.pitch + (event.key === "ArrowUp" ? step : -step));
    } else if (event.key === "Home") {
      event.preventDefault();
      this.change(0, 0);
    }
  }

  protected override render() {
    const radians = this.yaw * Math.PI / 180;
    const x = 66 + 42 * Math.cos(radians), y = 66 - 42 * Math.sin(radians);
    return html`<div class="controls">
      <svg viewBox="0 0 132 132" role="slider" tabindex=${this.disabled ? -1 : 0}
        aria-label="Sensor direction" aria-valuemin="0" aria-valuemax="359" aria-valuenow=${Math.round(this.yaw)}
        aria-valuetext=${`${Math.round(this.yaw)} degrees; tilt ${Math.round(this.pitch)} degrees`}
        aria-disabled=${this.disabled ? "true" : "false"} class=${this.aiming ? "active" : ""}
        @pointerdown=${this.start} @pointermove=${(event:PointerEvent) => { if (event.pointerId === this.pointer) this.aim(event); }}
        @pointerup=${this.finish} @pointercancel=${this.finish} @lostpointercapture=${this.finish} @keydown=${this.key}>
        <circle cx="66" cy="66" r="62" />
        <text x="66" y="16">90°</text><text x="117" y="70">0°</text>
        <text x="66" y="124">270°</text><text x="18" y="70">180°</text>
        <line x1="66" y1="66" x2=${x} y2=${y} /><circle class="tip" cx=${x} cy=${y} r="5" />
      </svg>
      <div class="buttons">
        <div class="row"><button aria-label="Decrease direction" ?disabled=${this.disabled} @click=${() => this.change(this.yaw - 5, this.pitch)}>−</button>
          <output>Yaw ${Math.round(this.yaw)}°</output><button aria-label="Increase direction" ?disabled=${this.disabled} @click=${() => this.change(this.yaw + 5, this.pitch)}>+</button></div>
        <div class="row"><button aria-label="Tilt down" ?disabled=${this.disabled} @click=${() => this.change(this.yaw, this.pitch - 5)}>−</button>
          <output>Tilt ${Math.round(this.pitch)}°</output><button aria-label="Tilt up" ?disabled=${this.disabled} @click=${() => this.change(this.yaw, this.pitch + 5)}>+</button></div>
        <button ?disabled=${this.disabled} @click=${() => this.change(0, 0)}>Reset aim</button>
      </div>
    </div><p role="status">${this.aiming ? "Aiming — drag to rotate" : "Drag the dial to aim. Arrow keys adjust direction and tilt; Shift makes larger steps."}</p>`;
  }
}
