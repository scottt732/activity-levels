import { LitElement, css, html, svg, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export type CameraAction = "reset" | "top" | "left" | "right" | "up" | "down" | "in" | "out";

/** Discrete orbit steps reuse the viewer's existing camera constraints. */
@customElement("al-camera-control")
export class AlCameraControl extends LitElement {
  static styles = css`
    :host { display:block; --orbit-size:108px; --target-size:30px; color:#c9edf3; }
    .controls { display:flex; align-items:center; gap:6px; width:max-content; }
    .orbit {
      width:var(--orbit-size); height:var(--orbit-size); position:relative; box-sizing:border-box;
      border-radius:50%; border:1px solid #78b9c55c;
      background:radial-gradient(circle, #14303ddb 0 29%, transparent 30% 54%, #14303d80 55% 57%, transparent 58%), #091f2bd9;
      box-shadow:inset 0 0 18px #79c6d00a; touch-action:none; cursor:grab;
    }
    .orbit::before, .orbit::after {
      content:""; position:absolute; pointer-events:none; background:#8edbea30;
      top:50%; left:8%; width:84%; height:1px;
    }
    .orbit::after { transform:rotate(90deg); }
    .orbit.active { cursor:grabbing; outline:1px solid #ffcd69; box-shadow:0 0 14px #ffcd6926; }
    .orbit button {
      position:absolute; z-index:1; width:var(--target-size); height:var(--target-size);
      padding:0; border-radius:50%; border-color:transparent; background:#102b39b8;
    }
    .up { top:2px; left:calc((100% - var(--target-size)) / 2); }
    .down { bottom:2px; left:calc((100% - var(--target-size)) / 2); }
    .left { left:2px; top:calc((100% - var(--target-size)) / 2); }
    .right { right:2px; top:calc((100% - var(--target-size)) / 2); }
    .reset { left:calc((100% - var(--target-size)) / 2); top:calc((100% - var(--target-size)) / 2); }
    .extras, .zoom { display:flex; flex-direction:column; gap:3px; }
    button {
      box-sizing:border-box; min-width:var(--target-size); min-height:var(--target-size);
      padding:0 5px; border:1px solid #78b9c54d; border-radius:3px; background:#0b2431e6;
      color:inherit; cursor:pointer; font:18px/1 system-ui,sans-serif;
    }
    button:hover:not(:disabled) { border-color:#94e7ef; background:#215267; color:#fff; }
    button:focus-visible { outline:2px solid #ffcd69; outline-offset:2px; }
    button:disabled, .orbit[aria-disabled="true"] { opacity:.45; cursor:default; }
    .cube { position:absolute; left:calc(50% - 19px); top:calc(50% - 19px); width:38px; height:38px; pointer-events:none; }
    .compass { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
    .top { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; }
    .status { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
    @media (pointer:coarse) {
      :host { --orbit-size:144px; --target-size:44px; }
      .controls { gap:8px; }
      .top { font-size:12px; }
    }
  `;
  @property({attribute:false}) matrix:number[]=[];
  @property({type:Number}) north?:number;
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

  private project(x:number,y:number,z:number):[number,number,number] {
    const m=this.matrix;if(m.length!==16)return [x,-y,z];
    return [m[0]!*x+m[4]!*y+m[8]!*z,-(m[1]!*x+m[5]!*y+m[9]!*z),m[2]!*x+m[6]!*y+m[10]!*z];
  }
  private cube() {
    const vertices=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(v=>this.project(v[0]!,v[1]!,v[2]!));
    const faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]].map((ids,i)=>({ids,i,depth:ids.reduce((sum,j)=>sum+vertices[j]![2],0)})).sort((a,b)=>a.depth-b.depth);
    return svg`<svg class="cube" viewBox="-2 -2 4 4" role="img" aria-label="Camera orientation cube">${faces.map(({ids,i})=>svg`<polygon points=${ids.map(j=>vertices[j]!.slice(0,2).join(",")).join(" ")} fill=${["#26414f","#456975","#1a303b","#a2d5de","#335562","#628e9a"][i]} stroke="#b5e7ec" stroke-width=".06"/>`)}</svg>`;
  }
  private compass() {
    if(this.north===undefined || !Number.isFinite(this.north))return nothing;
    const angle=this.north*Math.PI/180,[x,y]=this.project(Math.sin(angle),0,-Math.cos(angle)),length=Math.hypot(x,y);
    if(length<.01)return nothing;
    return svg`<svg class="compass" viewBox="-60 -60 120 120" role="img" aria-label="Configured north"><text x=${x/length*51} y=${y/length*51+3} text-anchor="middle" fill="#ffce77" font-size="10">N</text></svg>`;
  }
  protected override render() {
    return html`<div class="controls">
      <div class=${`orbit${this.dragging ? " active" : ""}`} role="group" aria-label="Camera orbit" title="Drag to orbit, or use the directional buttons" aria-disabled=${this.disabled ? "true" : "false"}
        @pointerdown=${this.start} @pointermove=${this.move} @pointerup=${this.finish} @pointercancel=${this.finish} @lostpointercapture=${this.finish}
        @click=${{handleEvent:(event:MouseEvent) => this.handleClick(event),capture:true}}>
        <button class="up" aria-label="Tilt up" title="Tilt up" ?disabled=${this.disabled} @click=${() => this.action("up")}>↑</button>
        <button class="left" aria-label="Rotate left" title="Rotate left" ?disabled=${this.disabled} @click=${() => this.action("left")}>←</button>
        ${this.cube()}${this.compass()}
        <button class="right" aria-label="Rotate right" title="Rotate right" ?disabled=${this.disabled} @click=${() => this.action("right")}>→</button>
        <button class="down" aria-label="Tilt down" title="Tilt down" ?disabled=${this.disabled} @click=${() => this.action("down")}>↓</button>
      </div>
      <div class="extras"><div class="zoom">
        <button aria-label="Zoom out" title="Zoom out" ?disabled=${this.disabled} @click=${() => {this.suppressClick=false;this.action("out");}}>−</button>
        <button aria-label="Zoom in" title="Zoom in" ?disabled=${this.disabled} @click=${() => {this.suppressClick=false;this.action("in");}}>+</button>
      </div><button aria-label="Reset view" title="Home view" ?disabled=${this.disabled} @click=${()=>{this.suppressClick=false;this.action("reset");}}>⌂</button><button class="top" aria-label="Top view" title="Top view" ?disabled=${this.disabled} @click=${() => {this.suppressClick=false;this.action("top");}}>Top</button></div>
    </div><span class="status" role="status">${this.dragging ? "Orbiting — drag to rotate or tilt" : ""}</span>`;
  }
}
