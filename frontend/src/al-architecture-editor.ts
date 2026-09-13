import { LitElement, css, html, svg, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { newGroup, walkGroups } from "./model";
import { footprint } from "./property-layout";
import {
  objectFootprint,
  outlineBounds,
  readArchitecture,
} from "./architecture";
import {
  defaultLengthUnit,
  formatLengthInput,
  parseLength,
} from "./measurement-units";
import { alChange } from "./events";
import type {
  ArchitecturalObject,
  Config,
  HomeAssistant,
  Group,
  LiveState,
} from "./types";
import "./al-floorplan-viewer";

@customElement("al-architecture-editor")
export class AlArchitectureEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      color: #d8edf2;
      font-size: 12px;
    }
    .layout {
      position: relative;
      height: 100%;
      display: grid;
      grid-template-columns: 55% 45%;
    }
    al-floorplan-viewer {
      height: 100%;
      min-width: 0;
    }
    .plan {
      padding: 60px 12px 12px;
      min-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
      background: #112632;
      touch-action: none;
      border: 1px solid #446779;
      border-radius: 8px;
    }
    .room {
      fill: #41657233;
      stroke: #7897a3;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .selected {
      stroke: #95e8ef;
      stroke-width: 2;
    }
    .grip {
      fill: #ffd16a;
      stroke: #102633;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
      cursor: grab;
    }
    .object {
      fill: #85939c88;
      stroke: #a8c3ce;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
      cursor: move;
    }
    text {
      fill: #c8e3ec;
      text-anchor: middle;
      font-size: 0.18px;
      pointer-events: none;
    }
    .panel {
      position: absolute;
      left: 62px;
      top: 60px;
      width: 260px;
      max-height: calc(100% - 84px);
      overflow: auto;
      padding: 10px;
      background: #102633f5;
      border: 1px solid #80ddeb;
      border-radius: 8px;
      box-sizing: border-box;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 7px 0;
    }
    input,
    select,
    button {
      font: inherit;
      color: inherit;
      background: #173440;
      border: 1px solid #426477;
      border-radius: 3px;
      padding: 5px;
      min-width: 0;
    }
    button {
      cursor: pointer;
      margin: 3px;
    }
    button:disabled {
      opacity: 0.4;
    }
    button:focus-visible,
    input:focus-visible {
      outline: 2px solid #ffd16a;
    }
    .list button {
      display: block;
      width: 100%;
      text-align: left;
    }
    .error {
      color: #ff8c83;
    }
    .tools {
      display: flex;
      flex-wrap: wrap;
    }
    .note {
      color: #91adba;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .plan-only {
      grid-template-columns: 100%;
    }
    .plan-only al-floorplan-viewer {
      display: none;
    }
    .plan-only .plan {
      padding-left: 340px;
    }
    @media (pointer: coarse) {
      button,
      input,
      select {
        min-height: 44px;
      }
      .panel {
        left: 76px;
      }
    }
    @media (max-width: 760px) {
      .layout {
        grid-template-columns: 100%;
      }
      .layout al-floorplan-viewer {
        display: none;
      }
      .panel {
        max-height: 42%;
        width: 230px;
      }
      .plan,
      .plan-only .plan {
        padding-left: 12px;
      }
    }
  `;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) room = "";
  @state() private selected = "";
  @state() private drawing = false;
  @state() private points: [number, number][] = [];
  @state() private name = "New room";
  @state() private error = "";
  @state() private planOnly = false;
  @state() private snap = true;
  @state() private scale = 1;
  private drag?: {
    pointer: number;
    corner?: number;
    object?: string;
    offset?: [number, number];
  };
  private get groups() {
    return this.config ? walkGroups(this.config) : [];
  }
  private get group() {
    return this.groups.find((e) => e.group.id === this.room)?.group;
  }
  private get object() {
    return this.group?.architecture?.find((o) => o.id === this.selected);
  }
  private get unit() {
    return defaultLengthUnit(this.hass);
  }
  private length(n: number) {
    return formatLengthInput(n, this.unit);
  }
  private commit(next: Config) {
    if (this.disabled) return;
    this.config = next;
    this.dispatchEvent(alChange(next));
    this.error = "";
  }
  public resetDraft() {
    this.selected = "";
    this.drawing = false;
    this.points = [];
    this.error = "";
  }
  public flushDraft() {
    return !this.drawing && !this.error;
  }
  private field(label: string, n: number, apply: (n: number) => void) {
    return html`<label
      >${label} (${this.unit})<input
        aria-label=${label}
        .value=${this.length(n)}
        @change=${(e: Event) => {
          const input = e.target as HTMLInputElement,
            v = parseLength(input.value, this.unit);
          if (v === null) {
            this.error = "Enter a valid length.";
            return;
          }
          apply(v);
        }}
    /></label>`;
  }
  private patch(patch: Partial<ArchitecturalObject>) {
    if (!this.config || !this.object || this.disabled) return;
    const o = readArchitecture({ ...this.object, ...patch });
    if (!o) {
      this.error =
        "Check dimensions: landings must leave a positive stair run.";
      return;
    }
    const next = structuredClone(this.config),
      g = walkGroups(next).find((e) => e.group.id === this.room)!.group;
    g.architecture = g.architecture!.map((v) => (v.id === o.id ? o : v));
    this.commit(next);
  }
  private addObject(kind: ArchitecturalObject["kind"]) {
    if (!this.config || !this.group?.bounds) return;
    if((this.group.architecture?.length ?? 0)>=128){this.error="Maximum 128 architectural objects per room.";return;}
    const next = structuredClone(this.config),
      g = walkGroups(next).find((e) => e.group.id === this.room)!.group,
      b = g.bounds!;
    const o: ArchitecturalObject = {
      id: crypto.randomUUID(),
      name: kind === "stairs" ? "Staircase" : kind,
      kind,
      position: [b[0][0], b[0][1], b[0][2]],
      yaw: 0,
      width: kind === "stairs" ? 0.9 : 0.6,
      run: kind === "stairs" ? 3 : 0.6,
      height: b[1][2] - b[0][2],
      steps: 14,
      landing_bottom: 0,
      landing_top: 0,
    };
    g.architecture = [...(g.architecture ?? []), o];
    this.selected = o.id;
    this.commit(next);
  }
  private saveOutline(points: [number, number][]) {
    if (!this.config || !this.group?.bounds) return;
    try {
      const next = structuredClone(this.config),
        g = walkGroups(next).find((e) => e.group.id === this.room)!.group;
      g.bounds = outlineBounds(points, g.bounds![0][2], g.bounds![1][2]);
      g.points = points;
      this.commit(next);
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  private roomParent(config: Config): Group {
    const entry=walkGroups(config).find(e=>e.group.id===this.room);
    if(entry && ["floor","structure"].includes(entry.group.kind))return entry.group;
    if(entry?.parent && ["floor","structure","area"].includes(entry.parent.kind))return entry.parent;
    let property=config.groups.find(g=>g.kind==="property");
    if(!property){property=newGroup(`property_${crypto.randomUUID().slice(0,8)}`,"property");property.name="Property";config.groups.push(property);}
    let building=property.children.find(g=>g.kind==="structure");
    if(!building){building=newGroup(`building_${crypto.randomUUID().slice(0,8)}`,"structure");building.name="Building";property.children.push(building);}
    return building;
  }
  private finishRoom() {
    if (!this.config) return;
    try {
      const next = structuredClone(this.config),
        parent = this.roomParent(next);
      const low = this.group?.bounds?.[0][2] ?? 0;
      const g = {
        ...newGroup(`room_${crypto.randomUUID().slice(0, 8)}`, "area"),
        name: this.name,
        points: this.points,
        bounds: outlineBounds(this.points, low, low + 2.4),
      };
      parent.children.push(g);
      this.room = g.id;
      this.drawing = false;
      this.points = [];
      this.commit(next);
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  private underRoom() {
    if (!this.config || !this.object) return;
    const next = structuredClone(this.config),
      entry = walkGroups(next).find((e) => e.group.id === this.room)!,
      o = entry.group.architecture!.find((o) => o.id === this.selected)!,
      points = objectFootprint(o);
    const g = {
      ...newGroup(`under_stairs_${crypto.randomUUID().slice(0, 8)}`, "area"),
      name: "Server closet",
      points,
      bounds: outlineBounds(points, o.position[2], o.position[2] + o.height),
    };
    this.roomParent(next).children.push(g);
    o.under_room = g.id;
    this.commit(next);
  }
  private point(e: MouseEvent): [number, number] | undefined {
    const canvas = this.renderRoot.querySelector("svg"),
      matrix = canvas?.getScreenCTM();
    if (!matrix) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      matrix.inverse(),
    );
    return [Math.round(p.x * 100) / 100, Math.round(-p.y * 100) / 100];
  }
  private clicked(e: MouseEvent) {
    if (this.disabled || !this.drawing) return;
    let p = this.point(e);
    if (!p) return;
    const last = this.points.at(-1);
    if (this.snap && last) {
      const length = Math.hypot(p[0] - last[0], p[1] - last[1]),
        a =
          (Math.round(
            Math.atan2(p[1] - last[1], p[0] - last[0]) / (Math.PI / 4),
          ) *
            Math.PI) /
          4;
      p = [last[0] + length * Math.cos(a), last[1] + length * Math.sin(a)];
    }
    this.points = [...this.points, p];
  }
  private move(e: PointerEvent) {
    if (this.disabled || this.drag?.pointer !== e.pointerId) return;
    const p = this.point(e);
    if (!p) return;
    if (this.drag.corner !== undefined && this.group) {
      const points = footprint(this.group).map(
        (v) => [...v] as [number, number],
      );
      points[this.drag.corner] = p;
      this.saveOutline(points);
    } else if (this.drag.object && this.object)
      this.patch({
        position: [
          p[0] - (this.drag.offset?.[0] ?? 0),
          p[1] - (this.drag.offset?.[1] ?? 0),
          this.object.position[2],
        ],
      });
  }
  protected override render() {
    if (!this.config) return nothing;
    const g = this.group,
      o = this.object,
      groups = this.groups.filter((e) => e.group.bounds),
      all = groups.flatMap((e) => footprint(e.group));
    const minX = Math.min(0, ...all.map((p) => p[0])) - 3,
      minY = Math.min(0, ...all.map((p) => p[1])) - 3,
      maxX = Math.max(10, ...all.map((p) => p[0])) + 3,
      maxY = Math.max(10, ...all.map((p) => p[1])) + 3;
    const width = (maxX - minX) / this.scale,
      height = (maxY - minY) / this.scale;
    return html`<div class=${`layout${this.planOnly ? " plan-only" : ""}`}>
      <al-floorplan-viewer
        workspace
        editing-preview
        .context=${true}
        .room=${this.room}
        .config=${this.config}
        .hass=${this.hass}
        .live=${this.live}
      ></al-floorplan-viewer>
      <div class="plan">
        <svg
          viewBox=${`${(minX + maxX - width) / 2} ${-(minY + maxY + height) / 2} ${width} ${height}`}
          aria-label="Architectural plan"
          @click=${this.clicked}
          @pointermove=${this.move}
          @pointerup=${() => {
            this.drag = undefined;
          }}
          @pointercancel=${() => {
            this.drag = undefined;
          }}
        >
          ${groups
   .filter(
     (e) =>
       !["property", "structure", "floor"].includes(e.group.kind) &&
       (!g?.bounds ||
         (e.group.bounds![0][2] < g.bounds[1][2] &&
           e.group.bounds![1][2] > g.bounds[0][2])),
   )
   .map(
     ({ group }) =>
       svg`<polygon class=${`room${group.id === this.room ? " selected" : ""}`} points=${footprint(
         group,
       )
         .map(([x, y]) => `${x},${-y}`)
         .join(" ")} @click=${(e: Event) => {
         if (!this.drawing) {
           e.stopPropagation();
           this.room = group.id;
           this.selected = "";
         }
       }}/>`,
   )}
          ${
   g?.bounds && !this.drawing && !o
     ? footprint(g).map(
         ([x, y], i, ps) =>
           svg`<circle class="grip" cx=${x} cy=${-y} r=".09" role="button" tabindex="0" aria-label=${`Corner ${i + 1}`} @keydown=${(
             e: KeyboardEvent,
           ) => {
             const delta: Record<string, [number, number]> = {
               ArrowLeft: [-0.01, 0],
               ArrowRight: [0.01, 0],
               ArrowUp: [0, 0.01],
               ArrowDown: [0, -0.01],
             };
             const d = delta[e.key];
             if (!d || this.disabled) return;
             e.preventDefault();
             const points = ps.map((p) => [...p] as [number, number]);
             points[i] = [
               x + d[0] * (e.shiftKey ? 10 : 1),
               y + d[1] * (e.shiftKey ? 10 : 1),
             ];
             this.saveOutline(points);
           }} @pointerdown=${(e: PointerEvent) => {
             e.stopPropagation();
             if (this.disabled) return;
             this.drag = { pointer: e.pointerId, corner: i };
             this.renderRoot
               .querySelector("svg")!
               .setPointerCapture(e.pointerId);
           }}/><text x=${(x + ps[(i + 1) % ps.length]![0]) / 2} y=${-(y + ps[(i + 1) % ps.length]![1]) / 2 - 0.15}>${this.length(Math.hypot(x - ps[(i + 1) % ps.length]![0], y - ps[(i + 1) % ps.length]![1]))}</text>`,
       )
     : nothing
 }
          ${g?.architecture?.map((obj) => {
   const pts = objectFootprint(obj);
   return svg`<g>${
     obj.kind === "stairs"
       ? svg`<g transform=${`translate(${obj.position[0]},${-obj.position[1]}) rotate(${-obj.yaw})`}><path d=${`M ${obj.width / 2} -.2 L ${obj.width / 2} ${-obj.run + 0.2} l -.12 .2 m .12 -.2 l .12 .2`} fill="none" stroke="#ffd16a" stroke-width=".025"/>${Array.from(
           { length: obj.steps },
           (_, i) => {
             const y = -(
               obj.landing_bottom +
               ((obj.run - obj.landing_bottom - obj.landing_top) * (i + 1)) /
                 obj.steps
             );
             return svg`<line x1="0" y1=${y} x2=${obj.width} y2=${y} stroke="#a8c3ce" stroke-width=".015"/>`;
           },
         )}</g>`
       : nothing
   }<polygon class="object" points=${pts.map(([x, y]) => `${x},${-y}`).join(" ")} @click=${(
     e: Event,
   ) => {
     e.stopPropagation();
     this.selected = obj.id;
   }} @pointerdown=${(e: PointerEvent) => {
     if (this.disabled) return;
     e.stopPropagation();
     this.selected = obj.id;
     const p = this.point(e);
     this.drag = {
       pointer: e.pointerId,
       object: obj.id,
       offset: p ? [p[0] - obj.position[0], p[1] - obj.position[1]] : [0, 0],
     };
     this.renderRoot.querySelector("svg")!.setPointerCapture(e.pointerId);
   }}/><text x=${pts.reduce((sum, p) => sum + p[0], 0) / 4} y=${-pts.reduce((sum, p) => sum + p[1], 0) / 4}>${obj.name}</text></g>`;
 })}
          ${this.drawing ? svg`<polyline class="selected room" points=${this.points.map(([x, y]) => `${x},${-y}`).join(" ")}/>` : nothing}
        </svg>
      </div>
      <div class="panel">
        <header>
          <strong>Architecture</strong
          ><button
            @click=${() => {
   this.planOnly = !this.planOnly;
 }}
          >
            2D / 3D
          </button>
        </header>
        <fieldset
          ?disabled=${this.disabled}
          style="border:0;padding:0;margin:0"
        >
          <label
            >Room or floor<select
              aria-label="Architecture room"
              .value=${this.room}
              @change=${(e: Event) => {
   this.room = (e.target as HTMLSelectElement).value;
   this.resetDraft();
 }}
            >
              <option value="">Choose…</option>
              ${groups.map((e) => html`<option value=${e.group.id} .selected=${e.group.id === this.room}>${e.group.name ?? e.group.id}</option>`)}
            </select></label
          >
          <div class="tools">
            <button
              @click=${() => {
   this.scale = Math.min(4, this.scale * 1.25);
 }}
            >
              Zoom +</button
            ><button
              @click=${() => {
   this.scale = Math.max(0.25, this.scale / 1.25);
 }}
            >
              Zoom −
            </button>
          </div>
          ${
   this.drawing
     ? html`<label
           >Room name<input
             .value=${this.name}
             @input=${(e: Event) => {
               this.name = (e.target as HTMLInputElement).value;
             }} /></label
         ><label
           ><input
             type="checkbox"
             .checked=${this.snap}
             @change=${(e: Event) => {
               this.snap = (e.target as HTMLInputElement).checked;
             }}
           />45° angle snap</label
         ><button @click=${() => this.finishRoom()}>Finish room</button
         ><button @click=${() => this.resetDraft()}>Cancel</button
         ><button
           @click=${() => {
             this.points = this.points.slice(0, -1);
           }}
         >
           Undo corner
         </button>`
     : o
       ? html`<header>
             <strong>${o.name}</strong
             ><button
               @click=${() => {
                 this.selected = "";
               }}
             >
               ×
             </button>
           </header>
           <label
             >Name<input
               .value=${o.name}
               @change=${(e: Event) => this.patch({ name: (e.target as HTMLInputElement).value })}
           /></label>
           ${this.field("X", o.position[0], (v) => this.patch({ position: [v, o.position[1], o.position[2]] }))}${this.field("Y", o.position[1], (v) => this.patch({ position: [o.position[0], v, o.position[2]] }))}${this.field("Width", o.width, (v) => this.patch({ width: v }))}${this.field(o.kind === "stairs" ? "Total run" : "Depth", o.run, (v) => this.patch({ run: v }))}${this.field(o.kind === "stairs" ? "Rise" : "Height", o.height, (v) => this.patch({ height: v }))}${this.field("Base elevation", o.position[2], (v) => this.patch({ position: [o.position[0], o.position[1], v] }))}
           <label
             >Direction (°)<input
               type="number"
               .value=${String(o.yaw)}
               @change=${(e: Event) => this.patch({ yaw: (e.target as HTMLInputElement).valueAsNumber })}
           /></label>
           ${
   o.kind === "stairs"
     ? html`<label
           >Destination floor<select
             aria-label="Destination floor" .value=${o.to_floor ?? ""}
             @change=${(e: Event) => {
               const target = groups.find(
                 (g) => g.group.id === (e.target as HTMLSelectElement).value,
               )?.group;
               if (!target) this.patch({to_floor:undefined});
               if (target?.bounds)
                 this.patch({ height: target.bounds[0][2] - o.position[2], to_floor:target.id });
             }}
           >
             <option value="">Set rise from floor…</option>
             ${groups.filter((e) => e.group.kind === "floor" && e.group.bounds![0][2] > o.position[2]).map((e) => html`<option value=${e.group.id} .selected=${e.group.id===o.to_floor}>${e.group.name ?? e.group.id}</option>`)}
           </select></label
         ><label
           >Steps<input
             type="number"
             min="1"
             max="100"
             .value=${String(o.steps)}
             @change=${(e: Event) => this.patch({ steps: (e.target as HTMLInputElement).valueAsNumber })} /></label
         >${this.field("Bottom landing", o.landing_bottom, (v) => this.patch({ landing_bottom: v }))}${this.field("Top landing", o.landing_top, (v) => this.patch({ landing_top: v }))}<label
           >Space below<select
             .value=${o.under_room ?? ""}
             @change=${(e: Event) => this.patch({ under_room: (e.target as HTMLSelectElement).value || undefined })}
           >
             <option value="">None</option>
             ${groups.filter((e) => e.group.kind === "area" && e.group.id !== this.room).map((e) => html`<option value=${e.group.id} .selected=${e.group.id === o.under_room}>${e.group.name ?? e.group.id}</option>`)}
           </select></label
         >${!o.under_room ? html`<button @click=${() => this.underRoom()}>Create space below</button>` : nothing}`
     : nothing
 }
           <button
             @click=${() => {
   const next = structuredClone(this.config!),
     room = walkGroups(next).find((e) => e.group.id === this.room)!.group;
   room.architecture = room.architecture?.filter((v) => v.id !== this.selected);
   this.selected = "";
   this.commit(next);
 }}
           >
             Delete object
           </button> `
       : html`<button
             @click=${() => {
               this.drawing = true;
               this.points = [];
             }}
           >
             Draw room</button
           >${
             g?.bounds
               ? html`<div class="tools">
                     ${(["stairs", "chimney", "column", "shaft", "solid"] as const).map((kind) => html`<button @click=${() => this.addObject(kind)}>Add ${kind}</button>`)}
                   </div>
                   <div class="list">
                     ${g.architecture?.map(
                       (obj) =>
                         html`<button
                           @click=${() => {
                             this.selected = obj.id;
                           }}
                         >
                           ${obj.name}
                         </button>`,
                     )}
                   </div>
                   ${this.field("Floor elevation", g.bounds[0][2], (v) => {
                     const next = structuredClone(this.config!),
                       room = walkGroups(next).find(
                         (e) => e.group.id === g.id,
                       )!.group;
                     try {
                       room.bounds = outlineBounds(
                         footprint(room),
                         v,
                         room.bounds![1][2],
                       );
                       this.commit(next);
                     } catch (e) {
                       this.error = (e as Error).message;
                     }
                   })}${this.field("Ceiling elevation", g.bounds[1][2], (v) => {
                     const next = structuredClone(this.config!),
                       room = walkGroups(next).find(
                         (e) => e.group.id === g.id,
                       )!.group;
                     try {
                       room.bounds = outlineBounds(
                         footprint(room),
                         room.bounds![0][2],
                         v,
                       );
                       this.commit(next);
                     } catch (e) {
                       this.error = (e as Error).message;
                     }
                   })}
                   <details>
                     <summary>Wall lengths & corners</summary>
                     ${footprint(g).map(
                       (p, i, ps) =>
                         html`${this.field(
                             `Wall ${i + 1}`,
                             Math.hypot(
                               p[0] - ps[(i + 1) % ps.length]![0],
                               p[1] - ps[(i + 1) % ps.length]![1],
                             ),
                             (v) => {
                               const points = ps.map(
                                   (p) => [...p] as [number, number],
                                 ),
                                 q = points[(i + 1) % ps.length]!,
                                 length = Math.hypot(q[0] - p[0], q[1] - p[1]);
                               if (v <= 0 || !length) {
                                 this.error = "Wall length must be positive.";
                                 return;
                               }
                               points[(i + 1) % ps.length] = [
                                 p[0] + ((q[0] - p[0]) * v) / length,
                                 p[1] + ((q[1] - p[1]) * v) / length,
                               ];
                               this.saveOutline(points);
                             },
                           )}<button
                             @click=${() => {
                               const next = ps.map(
                                   (p) => [...p] as [number, number],
                                 ),
                                 q = ps[(i + 1) % ps.length]!;
                               next.splice(i + 1, 0, [
                                 (p[0] + q[0]) / 2,
                                 (p[1] + q[1]) / 2,
                               ]);
                               this.saveOutline(next);
                             }}
                           >
                             Insert corner</button
                           ><button
                             ?disabled=${ps.length <= 3}
                             @click=${() => this.saveOutline(ps.filter((_, j) => j !== i))}
                           >
                             Remove corner ${i + 1}
                           </button>`,
                     )}
                   </details>`
               : nothing
           }`
 }
        </fieldset>
        ${this.error ? html`<p class="error" role="alert">${this.error}</p>` : nothing}
      </div>
    </div>`;
  }
}
