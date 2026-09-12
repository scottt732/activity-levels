import { LitElement, css, html, svg, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Group, HomeAssistant, RoomOpening, RoomFixture } from "./types";
import { footprint } from "./property-layout";
import {openingIsOpen,openingSwing} from "./room-openings";
import {coverageFootprint} from "./sensor-coverage";
import { fixtureAppearance, insideRoom, snapWindow } from "./room-fixtures";

@customElement("al-room-plan")
export class AlRoomPlan extends LitElement {
  static styles=css`
    :host { display:block; min-width:0; } svg { width:100%; height:clamp(320px,48vh,550px); display:block; background:radial-gradient(#203b4b,#102330); border:1px solid #4c7186; border-radius:12px; touch-action:none; }
    svg.aiming { cursor:crosshair; border-color:#ffcd69; box-shadow:0 0 0 2px #ffcd69; }
    .outline { fill:#2b536177; stroke:#8ed9ea; stroke-width:2; vector-effect:non-scaling-stroke; }
    .marker { fill:#8ed9ea; stroke:#102330; stroke-width:2; vector-effect:non-scaling-stroke; cursor:grab; }
    .selected { fill:#ffcd69; } .marker:focus { stroke:white; outline:none; }
    .coverage { fill:#ffcd6929; stroke:#ffcd6988; vector-effect:non-scaling-stroke; }
    .aim { stroke:#ffcd69; stroke-width:2; vector-effect:non-scaling-stroke; }
    p { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f77); }
  `;
  @property({attribute:false}) hass?:HomeAssistant;
  @property({attribute:false}) group?:Group;
  @property({attribute:false}) neighbors:Group[]=[];
  @property({attribute:false}) opening?:RoomOpening;
  @property({attribute:false}) fixture?:RoomFixture;
  @property({type:String}) mode:"place"|"aim"="place";
  @property({type:Boolean}) disabled=false;
  @state() private error="";
  private drag?:number;
  private movingMarker=false;
  private dragged=false;
  private suppressClick=false;
  private emit(name:string,detail:unknown):void {this.dispatchEvent(new CustomEvent(name,{detail,bubbles:true,composed:true}));}
  private point(event:MouseEvent):[number,number]|undefined {
    const canvas=this.renderRoot.querySelector("svg"),matrix=canvas?.getScreenCTM();
    if(!canvas || !matrix)return;
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    return [point.x,-point.y];
  }
  private place(event:MouseEvent):void {
    if(this.disabled || (!this.fixture?.entity && !this.opening) || !this.group)return;
    const point=this.point(event);if(!point)return;
    this.error="";
    if(this.opening){this.emit("al-opening-position",[point[0],point[1],this.opening.position[2]]);return;}
    if(!this.fixture)return;
    if(this.mode==="aim" && this.fixture.kind!=="window" && !this.movingMarker) {
      const [x,y]=this.fixture.position;
      if(Math.hypot(point[0]-x,point[1]-y)>.001)this.emit("al-fixture-aim",Math.atan2(point[1]-y,point[0]-x)*180/Math.PI);
      return;
    }
    const position:[number,number,number]=[Number(point[0].toFixed(3)),Number(point[1].toFixed(3)),this.fixture.position[2]];
    if(this.fixture.kind==="window"){this.emit("al-fixture-position",snapWindow(this.group,position,this.fixture.width).position);return;}
    if(!insideRoom(this.group,position)){this.error="Choose a point inside the room outline.";return;}
    this.emit("al-fixture-position",position);
  }
  protected override render() {
    const group=this.group,b=group?.bounds;if(!group || !b)return nothing;
    const points=footprint(group),width=b[1][0]-b[0][0],height=b[1][1]-b[0][1],pad=Math.max(width,height)*(this.neighbors.length>1?.65:.12);
    const radius=Math.max(width,height)*.018;
    const fixtures=[...(group.fixtures ?? []).filter(f=>f.entity!==this.fixture?.entity),...(this.fixture?.entity?[this.fixture]:[])];
    const f=this.fixture;
    let coverage:TemplateResult|typeof nothing=nothing;
    if(f?.entity && f.range>0 && (f.kind==="motion" || f.kind==="occupancy") && Number.isFinite(f.yaw) && Number.isFinite(f.fov)) {
      const arc=coverageFootprint(f,(this.neighbors.length?this.neighbors:[group]).filter(g=>g.bounds).map(g=>({id:g.id,footprint:footprint(g),low:g.bounds![0][2],high:g.bounds![1][2],openings:g.openings})),this.hass?.states);
      const appearance=fixtureAppearance(f.kind,this.hass?.states[f.entity]?.state);
      coverage=svg`<polygon class="coverage" style=${`fill:${appearance.color};fill-opacity:${appearance.opacity};stroke:${appearance.color};stroke-dasharray:4 4`} points=${arc.map(([x,y])=>`${x},${-y}`).join(" ")} />`;
    }
    return html`<svg viewBox=${`${b[0][0]-pad} ${-b[1][1]-pad} ${width+pad*2} ${height+pad*2}`} aria-label="Top-down room placement" role="group" class=${this.mode==="aim"?"aiming":""}
      @pointerdown=${(e:PointerEvent)=>{if(this.disabled || e.button!==0)return;this.movingMarker=false;this.drag=e.pointerId;this.dragged=false;this.renderRoot.querySelector("svg")!.setPointerCapture(e.pointerId);this.place(e);}}
      @click=${(e:MouseEvent)=>{if(this.suppressClick){this.suppressClick=false;return;}this.place(e);}}
      @pointermove=${(e:PointerEvent)=>{if(this.drag===e.pointerId){this.dragged=true;this.place(e);}}}
      @pointerup=${()=>{this.suppressClick=this.dragged;this.drag=undefined;this.dragged=false;this.movingMarker=false;}}
      @pointercancel=${()=>{this.drag=undefined;this.dragged=false;this.movingMarker=false;}}>
      ${this.neighbors.filter(g=>g.id!==group.id && g.bounds).map(g=>svg`<polygon fill="#25374444" stroke="#607584" stroke-width="1" vector-effect="non-scaling-stroke" points=${footprint(g).map(([x,y])=>`${x},${-y}`).join(" ")}/><text fill="#94acb7" text-anchor="middle" font-size=${radius*1.8} x=${(g.bounds![0][0]+g.bounds![1][0])/2} y=${-(g.bounds![0][1]+g.bounds![1][1])/2}>${g.name || g.id}</text>`)}
      <polygon class="outline" points=${points.map(([x,y])=>`${x},${-y}`).join(" ")} />
      ${coverage}
      ${(this.neighbors.length?this.neighbors:[group]).flatMap(g=>(g.openings ?? []).filter(o=>o.id!==this.opening?.id).map(o=>({g,o}))).concat(this.opening?[{g:group,o:this.opening}]:[]).map(({g,o})=>{
        const shape=openingSwing(g,o),opened=openingIsOpen(o,this.hass?.states ?? {}),end=opened?shape.open:shape.closed;
        const a=Math.atan2(shape.closed[1]-shape.hinge[1],shape.closed[0]-shape.hinge[0]),b=Math.atan2(shape.open[1]-shape.hinge[1],shape.open[0]-shape.hinge[0]);
        const delta=Math.atan2(Math.sin(b-a),Math.cos(b-a));
        const arc=Array.from({length:17},(_,i)=>`${shape.hinge[0]+o.width*Math.cos(a+delta*i/16)},${-shape.hinge[1]-o.width*Math.sin(a+delta*i/16)}`).join(" ");
        return svg`<g><line x1=${shape.hinge[0]} y1=${-shape.hinge[1]} x2=${shape.closed[0]} y2=${-shape.closed[1]} stroke="#102330" stroke-width="8" vector-effect="non-scaling-stroke"/>
          <line x1=${shape.hinge[0]} y1=${-shape.hinge[1]} x2=${o.kind==="open_wall"?shape.closed[0]:end[0]} y2=${-(o.kind==="open_wall"?shape.closed[1]:end[1])} stroke="#87eac8" stroke-width="3" stroke-dasharray=${o.kind==="open_wall"?"4 4":"none"} vector-effect="non-scaling-stroke"/>
          ${o.kind!=="open_wall"?svg`<polyline points=${arc} fill="none" stroke="#87eac8" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>`:nothing}
          ${g.id===group.id?svg`<circle cx=${o.position[0]} cy=${-o.position[1]} r=${radius} fill=${o.id===this.opening?.id?"#ffcd69":"#87eac8"} role="button" tabindex=${this.disabled?-1:0} aria-label=${`Select ${o.name || o.kind}`} @pointerdown=${(e:PointerEvent)=>{if(this.disabled)return;e.stopPropagation();this.emit("al-opening-select",o.id);this.drag=e.pointerId;this.dragged=false;this.renderRoot.querySelector("svg")!.setPointerCapture(e.pointerId);}} @click=${(e:Event)=>{e.stopPropagation();if(!this.disabled)this.emit("al-opening-select",o.id);}} @keydown=${(e:KeyboardEvent)=>{if(!this.disabled && ["Enter"," "].includes(e.key)){e.preventDefault();this.emit("al-opening-select",o.id);}}}/>`:nothing}</g>`;
      })}
      ${fixtures.filter(item=>item.position.every(Number.isFinite)).map(item=>svg`<g>
        ${item.kind==="window"?svg`<line class="window" stroke=${fixtureAppearance(item.kind,this.hass?.states[item.entity]?.state).color} stroke-width="7" vector-effect="non-scaling-stroke"
          x1=${item.position[0]-(item.width ?? 1)/2*Math.cos(item.yaw*Math.PI/180)} y1=${-item.position[1]+(item.width ?? 1)/2*Math.sin(item.yaw*Math.PI/180)}
          x2=${item.position[0]+(item.width ?? 1)/2*Math.cos(item.yaw*Math.PI/180)} y2=${-item.position[1]-(item.width ?? 1)/2*Math.sin(item.yaw*Math.PI/180)}/>`:nothing}
        <circle class=${`marker ${item.entity===f?.entity?"selected":""}`} cx=${item.position[0]} cy=${-item.position[1]} r=${radius} role="button" tabindex=${this.disabled?-1:0} aria-label=${`Select ${item.name || item.entity}`}
          @pointerdown=${(e:PointerEvent)=>{if(this.disabled || e.button!==0)return;e.stopPropagation();this.emit("al-fixture-select",item.entity);this.movingMarker=true;this.drag=e.pointerId;this.dragged=false;this.renderRoot.querySelector("svg")!.setPointerCapture(e.pointerId);}}
          @click=${(e:Event)=>{e.stopPropagation();if(!this.disabled)this.emit("al-fixture-select",item.entity);}}
          @keydown=${(e:KeyboardEvent)=>{if(!this.disabled && ["Enter"," "].includes(e.key)){e.preventDefault();this.emit("al-fixture-select",item.entity);}}}><title>${item.name || item.entity}</title></circle>
        ${item.entity===f?.entity && item.kind!=="window"?svg`<line class="aim" x1=${item.position[0]} y1=${-item.position[1]} x2=${item.position[0]+radius*5*Math.cos(item.yaw*Math.PI/180)} y2=${-item.position[1]-radius*5*Math.sin(item.yaw*Math.PI/180)}/>`:nothing}
      </g>`)}
    </svg><p>${this.opening?"Place opening: click near a wall or drag its marker":this.fixture?.entity?(this.fixture.kind==="window"?"Click near a wall to place a window · drag its marker to move it":this.mode==="place"?"Click to place · drag a marker to move it · select Aim to set direction":"AIM MODE — press and drag toward the direction the sensor faces"):"Select a device to start placing it."} · Top = +Y</p>
    ${this.error?html`<p class="error" role="alert">${this.error}</p>`:nothing}`;
  }
}
