import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export type CameraAction = "reset" | "top" | "left" | "right" | "up" | "down" | "in" | "out";

/** Discrete orbit steps reuse the viewer's existing camera constraints. */
@customElement("al-camera-control")
export class AlCameraControl extends LitElement {
  static styles = css`
    :host { display:block; }
    .controls { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .orbit { width:144px; height:144px; position:relative; border-radius:50%; border:1px solid #658d9f; background:radial-gradient(#244859,#102633); touch-action:none; cursor:grab; }
    .orbit.active { cursor:grabbing; outline:2px solid #ffcd69; }
    .orbit button { position:absolute; width:44px; height:44px; padding:0; border-radius:50%; }
    .up { top:1px; left:50px; } .down { bottom:1px; left:50px; }
    .left { left:1px; top:50px; } .right { right:1px; top:50px; }
    .reset { left:50px; top:50px; }
    .extras { display:flex; flex-direction:column; gap:6px; }
    .zoom { display:flex; gap:6px; }
    button { min-width:44px; min-height:44px; border:1px solid #638b9e; border-radius:8px; background:var(--secondary-background-color,#243c4b); color:var(--primary-text-color,#fff); cursor:pointer; font-size:18px; }
    button:focus-visible { outline:2px solid #ffcd69; outline-offset:2px; }
    button:disabled, .orbit[aria-disabled="true"] { opacity:.45; cursor:default; }
    p { margin:6px 0; font-size:12px; color:var(--secondary-text-color,#bdd7e0); }
  `;
  @property({ type:Boolean }) disabled = false;
  @state() private dragging = false;
  private pointer?: number;
  private captureTarget?: HTMLElement;
  private lastX = 0;
  private lastY = 0;
  private suppressClick = false;

  private action(action: CameraAction): void {
    if (this.disabled || this.suppressClick) return;
    this.dispatchEvent(new CustomEvent("al-camera-action", { detail:action, bubbles:true, composed:true }));
  }

  private start(event: PointerEvent): void {
    if (this.disabled || event.button !== 0 || this.pointer !== undefined) return;
    this.suppressClick = false;
    this.pointer = event.pointerId;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.dragging = true;
    // Capture on a button when the gesture starts there, preserving ordinary clicks.
    this.captureTarget = event.target as HTMLElement;
    this.captureTarget.setPointerCapture(event.pointerId);
  }

  private move(event: PointerEvent): void {
    if (this.disabled || event.pointerId !== this.pointer) return;
    const dx = event.clientX - this.lastX, dy = event.clientY - this.lastY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const delta = horizontal ? dx : dy;
    // Bound a single jump so a captured pointer crossing the screen cannot spin indefinitely.
    const steps = Math.min(8, Math.floor(Math.abs(delta) / 12));
    this.suppressClick = false;
    for (let i = 0; i < steps; i++) this.action(horizontal ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    this.suppressClick = true;
    if (horizontal) this.lastX = event.clientX;
    else this.lastY = event.clientY;
  }

  private finish(event: PointerEvent): void {
    if (this.pointer !== event.pointerId) return;
    const target = this.captureTarget;
    this.pointer = undefined;
    this.captureTarget = undefined;
    this.dragging = false;
    if (target?.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
  }

  private handleClick(event: MouseEvent): void {
    if (this.suppressClick && event.detail !== 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    this.suppressClick = false;
  }

  protected override render() {
    return html`<div class="controls">
      <div class=${`orbit${this.dragging ? " active" : ""}`} role="group" aria-label="Camera orbit" aria-disabled=${this.disabled ? "true" : "false"}
        @pointerdown=${this.start} @pointermove=${this.move} @pointerup=${this.finish} @pointercancel=${this.finish} @lostpointercapture=${this.finish}
        @click=${{handleEvent:(event:MouseEvent) => this.handleClick(event),capture:true}}>
        <button class="up" aria-label="Tilt up" title="Tilt up" ?disabled=${this.disabled} @click=${() => this.action("up")}>↑</button>
        <button class="left" aria-label="Rotate left" title="Rotate left" ?disabled=${this.disabled} @click=${() => this.action("left")}>←</button>
        <button class="reset" aria-label="Reset view" title="Reset view" ?disabled=${this.disabled} @click=${() => this.action("reset")}>⌂</button>
        <button class="right" aria-label="Rotate right" title="Rotate right" ?disabled=${this.disabled} @click=${() => this.action("right")}>→</button>
        <button class="down" aria-label="Tilt down" title="Tilt down" ?disabled=${this.disabled} @click=${() => this.action("down")}>↓</button>
      </div>
      <div class="extras"><div class="zoom">
        <button aria-label="Zoom out" title="Zoom out" ?disabled=${this.disabled} @click=${() => {this.suppressClick=false;this.action("out");}}>−</button>
        <button aria-label="Zoom in" title="Zoom in" ?disabled=${this.disabled} @click=${() => {this.suppressClick=false;this.action("in");}}>+</button>
      </div><button aria-label="Top view" ?disabled=${this.disabled} @click=${() => {this.suppressClick=false;this.action("top");}}>Top</button></div>
    </div><p role="status">${this.dragging ? "Orbiting — drag to rotate or tilt" : "Drag the orbit pad or use its buttons."}</p>`;
  }
}
