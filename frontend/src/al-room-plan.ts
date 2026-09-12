import { LitElement, css, html, svg, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Group, RoomFixture } from "./types";
import { footprint } from "./property-layout";
import { insideRoom } from "./room-fixtures";

@customElement("al-room-plan")
export class AlRoomPlan extends LitElement {
  static styles=css`
    :host { display:block; min-width:0; } svg { width:100%; height:clamp(320px,48vh,550px); display:block; background:radial-gradient(#203b4b,#102330); border:1px solid #4c7186; border-radius:12px; touch-action:none; }
    .outline { fill:#2b536177; stroke:#8ed9ea; stroke-width:2; vector-effect:non-scaling-stroke; }
    .marker { fill:#8ed9ea; stroke:#102330; stroke-width:2; vector-effect:non-scaling-stroke; cursor:grab; }
    .selected { fill:#ffcd69; } .marker:focus { stroke:white; outline:none; }
    .coverage { fill:#ffcd6929; stroke:#ffcd6988; vector-effect:non-scaling-stroke; }
    .aim { stroke:#ffcd69; stroke-width:2; vector-effect:non-scaling-stroke; }
    p { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f77); }
  `;
  @property({attribute:false}) group?:Group;
  @property({attribute:false}) fixture?:RoomFixture;
  @property({type:String}) mode:"place"|"aim"="place";
  @property({type:Boolean}) disabled=false;
  @state() private error="";
  private drag?:number;
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
    if(this.disabled || !this.fixture?.entity || !this.group)return;
    const point=this.point(event);if(!point)return;
    this.error="";
    if(this.mode==="aim" && this.drag===undefined) {
      const [x,y]=this.fixture.position;
      if(Math.hypot(point[0]-x,point[1]-y)>.001)this.emit("al-fixture-aim",Math.atan2(point[1]-y,point[0]-x)*180/Math.PI);
      return;
    }
    const position:[number,number,number]=[Number(point[0].toFixed(3)),Number(point[1].toFixed(3)),this.fixture.position[2]];
    if(!insideRoom(this.group,position)){this.error="Choose a point inside the room outline.";return;}
    this.emit("al-fixture-position",position);
  }
  protected override render() {
    const group=this.group,b=group?.bounds;if(!group || !b)return nothing;
    const points=footprint(group),width=b[1][0]-b[0][0],height=b[1][1]-b[0][1],pad=Math.max(width,height)*.12;
    const radius=Math.max(width,height)*.018;
    const fixtures=[...(group.fixtures ?? []).filter(f=>f.entity!==this.fixture?.entity),...(this.fixture?.entity?[this.fixture]:[])];
    const f=this.fixture;
    let coverage:TemplateResult|typeof nothing=nothing;
    if(f?.entity && f.range>0 && f.kind!=="light" && Number.isFinite(f.yaw) && Number.isFinite(f.fov)) {
      const arc=Array.from({length:25},(_,i)=>{const a=(f.yaw-f.fov/2+f.fov*i/24)*Math.PI/180;return `${f.position[0]+f.range*Math.cos(a)},${-f.position[1]-f.range*Math.sin(a)}`;});
      coverage=svg`<polygon class="coverage" points=${`${f.position[0]},${-f.position[1]} ${arc.join(" ")}`} />`;
    }
    return html`<svg viewBox=${`${b[0][0]-pad} ${-b[1][1]-pad} ${width+pad*2} ${height+pad*2}`} aria-label="Top-down room placement" role="group"
      @click=${(e:MouseEvent)=>{if(this.suppressClick){this.suppressClick=false;return;}this.place(e);}}
      @pointermove=${(e:PointerEvent)=>{if(this.drag===e.pointerId){this.dragged=true;this.place(e);}}}
      @pointerup=${()=>{this.suppressClick=this.dragged;this.drag=undefined;this.dragged=false;}}
      @pointercancel=${()=>{this.drag=undefined;this.dragged=false;}}>
      <polygon class="outline" points=${points.map(([x,y])=>`${x},${-y}`).join(" ")} />
      ${coverage}
      ${fixtures.filter(item=>item.position.every(Number.isFinite)).map(item=>svg`<g>
        <circle class=${`marker ${item.entity===f?.entity?"selected":""}`} cx=${item.position[0]} cy=${-item.position[1]} r=${radius} role="button" tabindex=${this.disabled?-1:0} aria-label=${`Select ${item.name || item.entity}`}
          @pointerdown=${(e:PointerEvent)=>{if(this.disabled || e.button!==0)return;e.stopPropagation();this.emit("al-fixture-select",item.entity);this.drag=e.pointerId;this.dragged=false;this.renderRoot.querySelector("svg")!.setPointerCapture(e.pointerId);}}
          @click=${(e:Event)=>{e.stopPropagation();if(!this.disabled)this.emit("al-fixture-select",item.entity);}}
          @keydown=${(e:KeyboardEvent)=>{if(!this.disabled && ["Enter"," "].includes(e.key)){e.preventDefault();this.emit("al-fixture-select",item.entity);}}}><title>${item.name || item.entity}</title></circle>
        ${item.entity===f?.entity?svg`<line class="aim" x1=${item.position[0]} y1=${-item.position[1]} x2=${item.position[0]+radius*5*Math.cos(item.yaw*Math.PI/180)} y2=${-item.position[1]-radius*5*Math.sin(item.yaw*Math.PI/180)}/>`:nothing}
      </g>`)}
    </svg><p>${this.fixture?.entity?(this.mode==="place"?"Click to place · drag a marker to move it · select Aim to set direction":"Click in the direction the sensor faces"):"Select a device to start placing it."} · Top = +Y</p>
    ${this.error?html`<p class="error" role="alert">${this.error}</p>`:nothing}`;
  }
}
