import { LitElement, css, html, svg, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { newGroup, walkGroups } from "./model";
import { footprint } from "./property-layout";
import {
  objectFootprint,
  outlineBounds,
  readArchitecture,
  makeCeilingFixtures,
  isCeilingFixture,
} from "./architecture";
import {
  defaultLengthUnit,
  formatLengthInput,
  parseLength,
} from "./measurement-units";
import { snapPlanPoint, moveRoomWall } from "./plan-snapping";
import { alChange } from "./events";
import type {
  ArchitecturalObject,
  CeilingKind,
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
    /* Native SVG focus outlines scale with the plan's meter coordinates. */
    .grip:focus {
      outline: none;
      stroke: white;
      stroke-width: 2;
      vector-effect: non-scaling-stroke;
    }
    .wall { stroke: transparent; stroke-width: 12; vector-effect: non-scaling-stroke; cursor: move; }
    .wall:hover, .wall:focus { outline:none; stroke: #ffd16a; stroke-width: 3; }
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
  @state() private association = "none";
  @state() private error = "";
  @state() private planOnly = false;
  @state() private snap = true;
  @state() private rectangle = true;
  @state() private ceilingKind: CeilingKind = "recessed_light";
  @state() private rows = 2;
  @state() private columns = 2;
  @state() private scale = 1;
  private drag?: {
    pointer: number;
    corner?: number;
    wall?: number;
    start?: [number, number];
    original?: Group;
    object?: string;
    offset?: [number, number];
  };
  private suppressClick = false;
  private get groups() {
    return this.config ? walkGroups(this.config) : [];
  }
  private get floors() {
    const descendants=(g:Group):Group[]=>[g,...g.children.flatMap(descendants)];
    return this.groups.filter(e=>e.group.kind==="floor").flatMap(({group})=>{
      const bounds=descendants(group).flatMap(g=>g.bounds?[g.bounds]:[]);
      if(!bounds.length)return [];
      return [{...group,bounds:group.bounds ?? [
        [Math.min(...bounds.map(b=>b[0][0])),Math.min(...bounds.map(b=>b[0][1])),Math.min(...bounds.map(b=>b[0][2]))],
        [Math.max(...bounds.map(b=>b[1][0])),Math.max(...bounds.map(b=>b[1][1])),Math.max(...bounds.map(b=>b[1][2]))]
      ] as NonNullable<Group["bounds"]>}];
    });
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
    this.association = "none";
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
    if(isCeilingFixture(o.kind) && this.group?.bounds && o.position[2]-(o.drop??0)-o.height<this.group.bounds[0][2]) {
      this.error="The fixture must fit above the floor.";return;
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
  private saveOutline(points: [number, number][], source?: Group) {
    if (!this.config || !this.group?.bounds) return;
    try {
      const next = structuredClone(this.config),
        g = walkGroups(next).find((e) => e.group.id === this.room)!.group;
      const bounds = outlineBounds(points, g.bounds![0][2], g.bounds![1][2]);
      if(source)Object.assign(g,source);
      g.bounds = bounds;
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
  private associationPicker() {
    const groups=this.groups.filter(e=>!e.group.geometry_only && ["area","outside"].includes(e.group.kind));
    return html`<label>Activity association<select aria-label="Activity association" .value=${this.association} @change=${(e:Event)=>{this.association=(e.target as HTMLSelectElement).value;if(this.name==="New room" && this.association.startsWith("area:"))this.name=this.hass?.areas[this.association.slice(5)]?.name??this.name;}}>
      <option value="none">None · floorplan only</option>
      <optgroup label="Existing Activity Levels groups">${groups.map(({group:g})=>html`<option value=${`group:${g.id}`}>${g.name??g.id}</option>`)}</optgroup>
      <optgroup label="Home Assistant areas">${Object.values(this.hass?.areas??{}).map(area=>html`<option value=${`area:${area.area_id}`}>${area.name}</option>`)}</optgroup>
    </select></label>${this.association!=="none"?html`<p class="note">Uses this outline for the selected group or area. Existing activity inputs are preserved.</p>`:nothing}`;
  }
  private associatedGroup(config:Config):Group|undefined {
    if(this.association.startsWith("group:"))return walkGroups(config).find(e=>e.group.id===this.association.slice(6) && !e.group.geometry_only)?.group;
    if(this.association.startsWith("area:"))return walkGroups(config).find(e=>e.group.area_id===this.association.slice(5) && !e.group.geometry_only)?.group;
    return undefined;
  }
  private selectedRoom(id:string) {
    this.room=id;this.selected="";this.association="none";
    this.dispatchEvent(new CustomEvent("al-editor-room",{detail:id,bubbles:true,composed:true}));
  }
  private finishRoom() {
    if (!this.config) return;
    try {
      const next = structuredClone(this.config), target=this.associatedGroup(next);
      if(this.association.startsWith("group:") && !target)throw new Error("Choose an existing activity group.");
      const low = target?.bounds?.[0][2] ?? this.group?.bounds?.[0][2] ?? 0;
      const high = target?.bounds?.[1][2] ?? this.group?.bounds?.[1][2] ?? low+2.4;
      const points=this.drawnPoints(), bounds=outlineBounds(points,low,high);
      let room=target;
      if(room){room.points=points;room.bounds=bounds;}
      else {
        const parent=this.roomParent(next), area=this.association.startsWith("area:")?this.association.slice(5):null;
        room={...newGroup(`room_${crypto.randomUUID().slice(0,8)}`,"area"),name:this.name,points,bounds,area_id:area,...(!area?{geometry_only:true}:{})};
        parent.children.push(room);
      }
      this.drawing=false;this.points=[];this.selectedRoom(room.id);this.commit(next);
    } catch (e) {this.error=(e as Error).message;}
  }
  private associateSpace() {
    if(!this.config || !this.group?.geometry_only || this.association==="none")return;
    const next=structuredClone(this.config), entry=walkGroups(next).find(e=>e.group.id===this.room)!, space=entry.group;
    let target=this.associatedGroup(next);
    if(this.association.startsWith("group:") && !target){this.error="Choose an existing activity group.";return;}
    if(target) {
      target.bounds=space.bounds;target.points=space.points;
      target.openings=[...new Map([...(target.openings??[]),...(space.openings??[])].map(o=>[o.id,o])).values()];
      target.fixtures=[...new Map([...(target.fixtures??[]),...(space.fixtures??[])].map(o=>[o.entity,o])).values()];
      target.architecture=[...new Map([...(target.architecture??[]),...(space.architecture??[])].map(o=>[o.id,o])).values()];
      entry.parent!.children=entry.parent!.children.filter(g=>g.id!==space.id);
      for(const {group} of walkGroups(next))for(const object of group.architecture??[])
        if(object.under_room===space.id)object.under_room=target.id;
    } else {
      delete space.geometry_only;space.area_id=this.association.slice(5);target=space;
    }
    this.selectedRoom(target.id);this.commit(next);
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
  private tolerance() {
    const m=this.renderRoot.querySelector("svg")?.getScreenCTM();
    const scale=m?Math.hypot(m.a,m.b):0;
    return scale>0 ? 12/scale : .15;
  }
  private neighbors() {
    const b=this.group?.bounds;
    return this.groups.filter(({group:g})=>g.id!==this.room && g.bounds && !["property","structure","floor"].includes(g.kind) && (!b || g.bounds[0][2]<b[1][2] && g.bounds[1][2]>b[0][2])).map(({group})=>footprint(group));
  }
  private drawnPoints():[number,number][] {
    if(!this.rectangle || this.points.length!==2)return this.points;
    const [a,b]=this.points as [[number,number],[number,number]];
    return [a,[b[0],a[1]],b,[a[0],b[1]]];
  }
  private addCeiling(grid:boolean) {
    if(!this.config || !this.group?.bounds)return;
    try {
      const objects=makeCeilingFixtures(this.group,this.ceilingKind,grid?this.rows:1,grid?this.columns:1);
      const next=structuredClone(this.config), g=walkGroups(next).find(e=>e.group.id===this.room)!.group;
      g.architecture=[...(g.architecture??[]),...objects];
      this.selected=objects[0]!.id;
      this.commit(next);
    }catch(e){this.error=(e as Error).message;}
  }
  private chimneyFloors(ids:string[]) {
    const floors=this.floors.filter(g=>ids.includes(g.id));
    if(!floors.length){this.patch({floors:[]});return;}
    const low=Math.min(...floors.map(g=>g.bounds![0][2])),high=Math.max(...floors.map(g=>g.bounds![1][2]));
    this.patch({floors:ids,position:[this.object!.position[0],this.object!.position[1],low],height:high-low});
  }
  private clicked(e: MouseEvent) {
    if(this.suppressClick){this.suppressClick=false;return;}
    if (this.disabled || !this.drawing) return;
    let p = this.point(e);
    if (!p) return;
    const outlines=[...this.neighbors(),...(this.group?[footprint(this.group)]:[])];
    p=snapPlanPoint(p,outlines,this.tolerance(),this.snap && !this.rectangle?this.points.at(-1):undefined);
    this.points=this.rectangle && this.points.length===2?[p]:[...this.points,p];
  }
  private move(e: PointerEvent) {
    if (this.disabled || this.drag?.pointer !== e.pointerId) return;
    const p = this.point(e);
    if (!p) return;
    if (this.drag.corner !== undefined && this.group) {
      const points = footprint(this.group).map(
        (v) => [...v] as [number, number],
      );
      points[this.drag.corner] = snapPlanPoint(p,this.neighbors(),this.tolerance());
      this.suppressClick=true;
      this.saveOutline(points);
    } else if(this.drag.wall!==undefined && this.drag.original && this.drag.start) {
      const next=moveRoomWall(this.drag.original,this.drag.wall,[p[0]-this.drag.start[0],p[1]-this.drag.start[1]],this.neighbors(),this.tolerance());
      this.suppressClick=true;
      this.saveOutline(next.points!,next);
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
         if(this.suppressClick){e.stopPropagation();this.suppressClick=false;return;}
         if (!this.drawing) {
           e.stopPropagation();
           this.selectedRoom(group.id);
         }
       }} />`,
   )}
          ${g?.bounds && !this.drawing && !o ? footprint(g).map((a,i,ps)=> {
            const b=ps[(i+1)%ps.length]!;
            return svg`<line class="wall" x1=${a[0]} y1=${-a[1]} x2=${b[0]} y2=${-b[1]} tabindex="0" role="button" aria-label=${`Move wall ${i+1}`} @keydown=${(e:KeyboardEvent)=>{
              const amount=(e.key==="ArrowUp" || e.key==="ArrowRight")?.01:(e.key==="ArrowDown" || e.key==="ArrowLeft")?-.01:0;
              if(!amount || this.disabled)return;e.preventDefault();
              const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
              const next=moveRoomWall(g,i,[-(b[1]-a[1])/length*amount,(b[0]-a[0])/length*amount],[],0);
              this.saveOutline(next.points!,next);
            }} @pointerdown=${(e:PointerEvent)=>{
              if(this.disabled)return;e.stopPropagation();
              this.drag={pointer:e.pointerId,wall:i,start:this.point(e),original:structuredClone(g)};
              this.renderRoot.querySelector("svg")!.setPointerCapture(e.pointerId);
            }} /> `;
          }):nothing}
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
           }} /><text x=${(x + ps[(i + 1) % ps.length]![0]) / 2} y=${-(y + ps[(i + 1) % ps.length]![1]) / 2 - 0.15}>${this.length(Math.hypot(x - ps[(i + 1) % ps.length]![0], y - ps[(i + 1) % ps.length]![1]))}</text>`,
       )
     : nothing
 }
          ${this.groups.flatMap(({group:owner})=>owner.id===this.room?[]:(owner.architecture??[]).filter(obj=>obj.kind==="chimney" && obj.floors?.some(id=>{let entry=this.groups.find(e=>e.group.id===this.room);while(entry){if(entry.group.id===id)return true;entry=entry.parent?this.groups.find(e=>e.group.id===entry!.parent!.id):undefined;}return false;})).map(obj=>svg`<polygon class="object" style="pointer-events:none;fill:#283440" points=${objectFootprint(obj).map(([x,y])=>`${x},${-y}`).join(" ")} />`))}
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
   }} />${isCeilingFixture(obj.kind)?svg`<g style="pointer-events:none" transform=${`translate(${pts.reduce((sum,p)=>sum+p[0],0)/4},${-pts.reduce((sum,p)=>sum+p[1],0)/4})`}><circle r=${Math.min(obj.width,obj.run)*.4} fill="none" stroke="#ffe2a1" stroke-width="1" vector-effect="non-scaling-stroke"/>${obj.kind==="ceiling_fan"?svg`<path d=${`M ${-obj.width*.4} 0 H ${obj.width*.4} M 0 ${-obj.run*.4} V ${obj.run*.4}`} stroke="#ffe2a1" stroke-width="2" vector-effect="non-scaling-stroke"/>`:nothing}</g>`:nothing}<text x=${pts.reduce((sum, p) => sum + p[0], 0) / 4} y=${-pts.reduce((sum, p) => sum + p[1], 0) / 4}>${obj.name}</text></g>`;
 })}
          ${this.drawing ? svg`<polygon class="selected room" points=${this.drawnPoints().map(([x, y]) => `${x},${-y}`).join(" ")} />` : nothing}
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
   this.selectedRoom((e.target as HTMLSelectElement).value);
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
         >${this.associationPicker()}<label><input type="checkbox" .checked=${this.rectangle} @change=${(e:Event)=>{this.rectangle=(e.target as HTMLInputElement).checked;this.points=[];}} />Rectangle · pick opposite corners</label><label
           ><input
             type="checkbox"
             .checked=${this.snap}
             @change=${(e: Event) => {
               this.snap = (e.target as HTMLInputElement).checked;
             }}
           />Right-angle polygon walls</label
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
           ${this.field("X", o.position[0], (v) => this.patch({ position: [v, o.position[1], o.position[2]] }))}${this.field("Y", o.position[1], (v) => this.patch({ position: [o.position[0], v, o.position[2]] }))}${this.field("Width", o.width, (v) => this.patch({ width: v }))}${this.field(o.kind === "stairs" ? "Total run" : "Depth", o.run, (v) => this.patch({ run: v }))}${this.field(o.kind === "stairs" ? "Rise" : "Height", o.height, (v) => this.patch({ height: v }))}${this.field(isCeilingFixture(o.kind)?"Ceiling elevation":"Base elevation", o.position[2], (v) => this.patch({ position: [o.position[0], o.position[1], v] }))}
           <label
             >Direction (°)<input
               type="number"
               .value=${String(o.yaw)}
               @change=${(e: Event) => this.patch({ yaw: (e.target as HTMLInputElement).valueAsNumber })}
           /></label>
           ${isCeilingFixture(o.kind)?html`
             ${this.field("Drop from ceiling",o.drop??0,v=>this.patch({drop:v}))}
             ${o.kind==="pendant_light"?html`<label>Shape<select aria-label="Pendant shape" .value=${o.shape??"globe"} @change=${(e:Event)=>this.patch({shape:(e.target as HTMLSelectElement).value as ArchitecturalObject["shape"]})}>${["globe","cone","cylinder"].map(shape=>html`<option value=${shape} .selected=${shape===o.shape}>${shape}</option>`)}</select></label>`:nothing}
             <label>Home Assistant entity (optional)<input .value=${o.entity??""} @change=${(e:Event)=>this.patch({entity:(e.target as HTMLInputElement).value||undefined})} /></label>
           `:nothing}
           ${o.kind==="chimney"?html`<details open><summary>Floors crossed</summary>${this.floors.map(floor=>html`<label><input type="checkbox" .checked=${o.floors?.includes(floor.id)??false} @change=${(e:Event)=>this.chimneyFloors((e.target as HTMLInputElement).checked?[...(o.floors??[]),floor.id]:(o.floors??[]).filter(id=>id!==floor.id))} />${floor.name??floor.id}</label>`)}</details>`:nothing}
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
               this.association="none";
               this.points = [];
             }}
           >
             Draw room</button
           >${
             g?.bounds
               ? html`${g.geometry_only?html`<label>Space name<input aria-label="Space name" .value=${g.name??""} @change=${(e:Event)=>{const next=structuredClone(this.config!),room=walkGroups(next).find(x=>x.group.id===g.id)!.group;room.name=(e.target as HTMLInputElement).value;this.commit(next);}} /></label>${this.associationPicker()}<button ?disabled=${this.association==="none"} @click=${()=>this.associateSpace()}>Associate space</button><button @click=${()=>{const next=structuredClone(this.config!),entry=walkGroups(next).find(x=>x.group.id===g.id)!;entry.parent!.children=entry.parent!.children.filter(x=>x.id!==g.id);this.selectedRoom(entry.parent!.id);this.commit(next);}}>Delete floorplan space</button>`:nothing}<div class="tools">
                     ${(["stairs", "chimney", "column", "shaft", "solid"] as const).map((kind) => html`<button @click=${() => this.addObject(kind)}>Add ${kind}</button>`)}
                   </div>
                   <details><summary>Ceiling fixtures</summary>
                     <label>Type<select aria-label="Ceiling fixture type" .value=${this.ceilingKind} @change=${(e:Event)=>{this.ceilingKind=(e.target as HTMLSelectElement).value as CeilingKind;}}>${(["ceiling_fan","recessed_light","pendant_light","recessed_speaker"] as const).map(kind=>html`<option value=${kind} .selected=${kind===this.ceilingKind}>${kind.replaceAll("_"," ")}</option>`)}</select></label>
                     <button @click=${()=>this.addCeiling(false)}>Add individual</button>
                     <label>Rows<input aria-label="Grid rows" type="number" min="1" max="12" .value=${String(this.rows)} @change=${(e:Event)=>{this.rows=(e.target as HTMLInputElement).valueAsNumber;}} /></label>
                     <label>Columns<input aria-label="Grid columns" type="number" min="1" max="12" .value=${String(this.columns)} @change=${(e:Event)=>{this.columns=(e.target as HTMLInputElement).valueAsNumber;}} /></label>
                     <button @click=${()=>this.addCeiling(true)}>Add symmetric grid</button>
                   </details>
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
