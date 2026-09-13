import {
  Box3, BoxGeometry, CylinderGeometry, ConeGeometry, LineDashedMaterial, DoubleSide, EdgesGeometry, ExtrudeGeometry, GridHelper, LineBasicMaterial,
  LineSegments, Mesh, MeshBasicMaterial, PerspectiveCamera, Raycaster, Scene, Shape,
  Vector2, Vector3, WebGLRenderer, PlaneGeometry, ShapeGeometry, Float32BufferAttribute, Color, DataTexture, LinearFilter, SphereGeometry, Plane, BufferGeometry,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { activityReading } from "./floorplan-model";
import type { ScenePart, ActivityFrame } from "./floorplan-model";
import { viewerOptions, thresholdColor, roomLight } from "./floorplan-style";
import {objectFootprint,stairHeight,isCeilingFixture} from "./architecture";
import {coverageRays} from "./sensor-coverage";
import {openingIsOpen,openingSwing,openingFitsRoom,openingState} from "./room-openings";
import { fixtureAppearance, fixtureDirection, windowFitsRoom } from "./room-fixtures";
import type { ArchitecturalObject, SiteLayout, RoomOpening, RoomFixture, HassEntity } from "./types";
import type { ViewerOptions, RoomLight, AlertRule } from "./floorplan-style";

export type CameraAction = "reset" | "top" | "left" | "right" | "up" | "down" | "in" | "out";

/** Recenter before uploading float32 vertices; the geographic origin never moves a room. */
export function volumeGeometry(part: ScenePart, origin: Vector3, portals:RoomOpening[]=part.openings ?? [], under?:ArchitecturalObject, stairs:ArchitecturalObject[]=[]): ExtrudeGeometry {
  const shape = new Shape(part.footprint.map(([x, y]) => new Vector2(x - origin.x, y + origin.z)));
  const geometry = new ExtrudeGeometry(shape, { depth: part.high - part.low, bevelEnabled: false, steps: 1 });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, part.low - origin.y, 0);
  const openings=portals.filter(o=>o.kind==="open_wall");
  if(openings.length){
    const source=geometry.getAttribute("position"),normals=geometry.getAttribute("normal"),vertices:number[]=[];
    for(let i=0;i<source.count;i+=3)if(Math.abs(normals.getY(i))>.99)for(let j=0;j<3;j++)vertices.push(source.getX(i+j),source.getY(i+j),source.getZ(i+j));
    for(let i=0;i<part.footprint.length;i++){
      const a=part.footprint[i]!,b=part.footprint[(i+1)%part.footprint.length]!,length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dy=(b[1]-a[1])/length;
      const cuts=openings.filter(o=>Math.abs((o.position[0]-a[0])*dy-(o.position[1]-a[1])*dx)<1e-5 && Math.abs(Math.sin(o.yaw*Math.PI/180)*dx-Math.cos(o.yaw*Math.PI/180)*dy)<1e-5).map(o=>{const t=(o.position[0]-a[0])*dx+(o.position[1]-a[1])*dy;return {left:Math.max(0,t-o.width/2),right:Math.min(length,t+o.width/2),low:Math.max(part.low,o.position[2]),high:Math.min(part.high,o.position[2]+o.height)};}).filter(o=>o.left<o.right && o.low<o.high);
      const xs=[...new Set([0,length,...cuts.flatMap(c=>[c.left,c.right])])].sort((a,b)=>a-b),zs=[...new Set([part.low,part.high,...cuts.flatMap(c=>[c.low,c.high])])].sort((a,b)=>a-b);
      for(let x=0;x<xs.length-1;x++)for(let z=0;z<zs.length-1;z++){
        const l=xs[x]!,r=xs[x+1]!,low=zs[z]!,high=zs[z+1]!;
        if(cuts.some(c=>(l+r)/2>c.left && (l+r)/2<c.right && (low+high)/2>c.low && (low+high)/2<c.high))continue;
        const point=(t:number,h:number)=>[a[0]+dx*t-origin.x,h-origin.y,-a[1]-dy*t-origin.z];
        vertices.push(...point(l,low),...point(r,low),...point(r,high),...point(l,low),...point(r,high),...point(l,high));
      }
    }
    geometry.setAttribute("position",new Float32BufferAttribute(vertices,3));geometry.deleteAttribute("uv");geometry.clearGroups();geometry.deleteAttribute("normal");geometry.computeVertexNormals();
  }
  cutStairwells(geometry, origin, stairs);
  if(under){const positions=geometry.getAttribute("position");for(let i=0;i<positions.count;i++){const roof=Math.max(part.low,stairHeight(under,positions.getX(i)+origin.x,-positions.getZ(i)-origin.z)-.15);positions.setY(i,Math.min(positions.getY(i),roof-origin.y));}geometry.computeVertexNormals();}
  return geometry;
}

/** Subtract a straight stair footprint from horizontal faces it passes through.
 * Convex clipping works on individual triangles, including concave room caps.
 */
export function cutStairwells(geometry:BufferGeometry,origin:Vector3,stairs:ArchitecturalObject[]):void {
 if(!stairs.length)return;
 const expanded=geometry.index?geometry.toNonIndexed():geometry;
 const p=expanded.getAttribute("position"),vertices:number[]=[];
 type Point=[number,number];
 for(let i=0;i<p.count;i+=3){
  const level=p.getY(i), horizontal=[1,2].every(j=>Math.abs(p.getY(i+j)-level)<1e-5);
  const cuts=horizontal?stairs.filter(o=>(o.kind==="chimney"?o.position[2]<=level+origin.y+1e-5:o.position[2]<level+origin.y-1e-5) && o.position[2]+o.height>=level+origin.y-1e-5):[];
  if(!cuts.length){for(let j=0;j<3;j++)vertices.push(p.getX(i+j),p.getY(i+j),p.getZ(i+j));continue;}
  let polygons:Point[][]=[[0,1,2].map(j=>[p.getX(i+j)+origin.x,-p.getZ(i+j)-origin.z])];
  for(const o of cuts){
   const rectangle=objectFootprint(o),remaining:Point[][]=[];
   for(const polygon of polygons){
    let inside=polygon;
    for(let edge=0;edge<4 && inside.length;edge++){
     const a=rectangle[edge]!,b=rectangle[(edge+1)%4]!;
     const distance=(v:Point)=>(b[0]-a[0])*(v[1]-a[1])-(b[1]-a[1])*(v[0]-a[0]);
     const clip=(positive:boolean):Point[]=>{
      const out:Point[]=[];
      for(let j=0;j<inside.length;j++){
       const v=inside[j]!,w=inside[(j+1)%inside.length]!,dv=distance(v),dw=distance(w),iv=positive?dv>=0:dv<=0,iw=positive?dw>=0:dw<=0;
       if(iv)out.push(v);
       if(iv!==iw){const t=dv/(dv-dw);out.push([v[0]+t*(w[0]-v[0]),v[1]+t*(w[1]-v[1])]);}
      }
      return out;
     };
     const outside=clip(false),next=clip(true);
     if(outside.length>=3)remaining.push(outside);
     inside=next;
    }
   }
   polygons=remaining;
  }
  for(const polygon of polygons)for(let j=1;j<polygon.length-1;j++)for(const v of [polygon[0]!,polygon[j]!,polygon[j+1]!])vertices.push(v[0]-origin.x,level,-v[1]-origin.z);
 }
 geometry.setIndex(null);geometry.setAttribute("position",new Float32BufferAttribute(vertices,3));geometry.deleteAttribute("uv");geometry.clearGroups();geometry.deleteAttribute("normal");geometry.computeVertexNormals();
 if(expanded!==geometry)expanded.dispose();
}

interface Volume {
  part: ScenePart;
  mesh: Mesh<ExtrudeGeometry, MeshBasicMaterial>;
  edges: LineSegments<EdgesGeometry, LineBasicMaterial>;
  liquid?: Mesh<ExtrudeGeometry, MeshBasicMaterial>;
  ceiling?: Mesh<ShapeGeometry, MeshBasicMaterial>;
  wash?: Mesh<ExtrudeGeometry, MeshBasicMaterial>;
  targetColor: Color;
  targetOpacity: number;
}

/** Surfaces follow the actual polygon, including concave rooms. */
function surfaceGeometry(part: Pick<ScenePart, "footprint"> & {high?:number}, origin: Vector3, stairs:ArchitecturalObject[]=[]): ShapeGeometry {
  const geometry = new ShapeGeometry(new Shape(part.footprint.map(
    ([x, y]) => new Vector2(x - origin.x, y + origin.z),
  )));
  geometry.rotateX(-Math.PI / 2);
  cutStairwells(geometry, new Vector3(origin.x, part.high ?? 0, origin.z), stairs);
  if(stairs.length){const p=geometry.getAttribute("position"),uv:number[]=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i),-p.getZ(i));geometry.setAttribute("uv",new Float32BufferAttribute(uv,2));}
  return geometry;
}

/** A soft ceiling patch suggests a light source without per-room real lights or shadows. */
function ceilingGlow(): DataTexture {
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const distance = Math.hypot((x + 0.5) / size * 2 - 1, (y + 0.5) / size * 2 - 1);
    const offset = (y * size + x) * 4;
    pixels.set([255, 255, 255, Math.round(255 * Math.max(0, 1 - distance) ** 2)], offset);
  }
  const texture = new DataTexture(pixels, size, size);
  texture.magFilter = texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Owns only presentation resources. The host owns live data, selection, and navigation. */
export class FloorplanRenderer {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(38, 1, 0.01, 1000);
  private readonly controls: OrbitControls;
  private readonly observer: ResizeObserver;
  private readonly raycaster = new Raycaster();
  private volumes: Volume[] = [];
  private grid?: GridHelper;
  private boundsKey = "";
  private origin = new Vector3();
  private placementHeight?: number;
  private structures:Mesh<BufferGeometry,MeshBasicMaterial>[]=[];
  private markers: {room:string; fixture:RoomFixture; marker:Mesh<BufferGeometry,MeshBasicMaterial>; coverage?:Mesh<BufferGeometry,MeshBasicMaterial>; boundary?:LineSegments<BufferGeometry,LineDashedMaterial>; previous?:string;coverageKey?:string;invalid?:boolean}[] = [];
  private coverageRooms:ScenePart[]=[];
  private doors:{part:ScenePart;opening:RoomOpening;leaf:Mesh<BufferGeometry,MeshBasicMaterial>;frame:LineSegments<BufferGeometry,LineBasicMaterial>;arc:LineSegments<BufferGeometry,LineBasicMaterial>;key?:string}[]=[];
  private siteMeshes: Mesh<ShapeGeometry, MeshBasicMaterial>[] = [];
  private radius = 1;
  private ground?: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private options = viewerOptions();
  private animation?: ReturnType<typeof setTimeout>;
  private lastTick = 0;
  private pauseUntil = 0;
  private focusUntil = 0;
  private focusTarget?: Vector3;
  private focusDistance = 0;
  private focusEvents = new Map<string, number>();
  private alertKey = "";
  private lastSelected = "";
  private lastFocus = 0;
  private readonly reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  private disposed = false;
  private lost = false;
  private pointer: { id: number; x: number; y: number; moved: boolean } | null = null;

  constructor(
    private readonly host: HTMLElement,
    private readonly select: (id: string) => void,
    private readonly fail: (message: string) => void,
    private readonly hover?: (id: string) => void,
    private readonly place?: (position: [number,number,number]) => void,
    private readonly orientation?: (matrix:number[]) => void,
  ) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    const canvas = this.renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.setAttribute("aria-label", "3D house. Drag to rotate; use the camera controls and group list for keyboard access.");
    canvas.setAttribute("role", "img");
    this.host.append(canvas);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = false;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.addEventListener("change", this.draw);
    this.controls.addEventListener("start", this.pauseMotion);
    document.addEventListener("visibilitychange", this.scheduleMotion);
    this.reduced?.addEventListener("change", this.scheduleMotion);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(host);
    this.resize();
  }

  private readonly resize = (): void => {
    if (this.disposed) return;
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.draw();
  };

  private readonly draw = (): void => {
    if (!this.disposed && !this.lost && document.visibilityState === "visible") {
      this.renderer.render(this.scene, this.camera);
      this.orientation?.([...this.camera.matrixWorldInverse.elements]);
    }
  };

  setParts(parts: ScenePart[], groundZ?: number, site?: SiteLayout, focusRoom?:string, objects?:ArchitecturalObject[]): void {
    this.clearParts();
    this.coverageRooms=parts.filter(p=>!p.container);
    this.focusTarget=undefined; this.focusEvents.clear();
    if (!parts.length && !site?.features.length) { this.draw(); return; }
    const box = new Box3();
    for (const part of parts) for (const [x, y] of part.footprint) {
      box.expandByPoint(new Vector3(x, part.low, -y));
      box.expandByPoint(new Vector3(x, part.high, -y));
    }
    const architecture=objects ?? parts.flatMap(p=>p.architecture ?? []);
    const portals=parts.flatMap(p=>p.openings ?? []);
    for(const o of architecture)for(const [x,y] of objectFootprint(o)){box.expandByPoint(new Vector3(x,o.position[2],-y));box.expandByPoint(new Vector3(x,isCeilingFixture(o.kind)?o.position[2]-(o.drop ?? 0)-o.height:o.position[2]+o.height,-y));}
    groundZ ??= site?.ground_z;
    for (const feature of site?.features ?? []) for (const [x, y] of feature.points)
      box.expandByPoint(new Vector3(x, site!.ground_z, -y));
    if (groundZ !== undefined) {
      box.expandByPoint(new Vector3(box.min.x, groundZ, box.min.z));
      box.expandByPoint(new Vector3(box.max.x, groundZ, box.max.z));
    }
    const focused=parts.find(p=>p.id===focusRoom);
    const focusBox=focused?new Box3().setFromPoints(focused.footprint.flatMap(([x,y])=>[new Vector3(x,focused.low,-y),new Vector3(x,focused.high,-y)])):box;
    const boundsKey=JSON.stringify([focusBox.min.toArray(),focusBox.max.toArray(),focusRoom]);
    const resetCamera=this.boundsKey!==boundsKey;
    this.boundsKey=boundsKey;
    const origin = focusBox.getCenter(new Vector3());
    this.origin.copy(origin);
    this.radius = Math.max(focusBox.getSize(new Vector3()).length() / 2, 0.1);
    for (const part of parts) {
      const under=architecture.find(o=>o.kind==="stairs" && o.under_room===part.id);
      const geometry = volumeGeometry(part, origin,portals,under,architecture.filter(o=>(o.kind==="stairs" && o.under_room!==part.id) || (o.kind==="chimney" && !!o.floors?.some(id=>id===part.id || part.ancestors.includes(id)))));
      const mesh = new Mesh(geometry, new MeshBasicMaterial({
        color: 0x60c8e5, transparent: true, opacity: 0.025, side: DoubleSide, depthWrite: false,
      }));
      const edges = new LineSegments(new EdgesGeometry(geometry), new LineBasicMaterial({
        color: 0x91a6b4, transparent: true, opacity: 0.4, depthWrite: false,
      }));
      if (part.container) mesh.material.opacity = 0;
      this.scene.add(mesh, edges);
      const floor = part.low - origin.y;
      const volume: Volume = { part, mesh, edges, targetColor: new Color(), targetOpacity: 0.015 };
      mesh.material.opacity = 0;
      if (!part.container) {
        // Activity changes the color and opacity of this fixed, full-height room volume.
        // The separate invisible mesh continues to own picking and camera bounds.
        volume.liquid = new Mesh(geometry.clone(), new MeshBasicMaterial({
          transparent: true, opacity: 0.015, side: DoubleSide, depthWrite: false,
        }));
        volume.ceiling = new Mesh(surfaceGeometry(part, origin, architecture.filter(o=>(o.kind==="stairs" && o.under_room!==part.id) || (o.kind==="chimney" && !!o.floors?.some(id=>id===part.id || part.ancestors.includes(id))))), new MeshBasicMaterial({
          transparent: true, opacity: 0, side: DoubleSide, depthWrite: false,
        }));
        volume.ceiling.position.y = part.high - origin.y;
        if(under){const vertices=volume.ceiling.geometry.getAttribute("position");for(let i=0;i<vertices.count;i++)vertices.setY(i,Math.max(part.low,stairHeight(under,vertices.getX(i)+origin.x,-vertices.getZ(i)-origin.z)-.15)-part.high);volume.ceiling.geometry.computeVertexNormals();}
        const ceilingGeometry = volume.ceiling.geometry;
        ceilingGeometry.computeBoundingBox();
        const bounds = ceilingGeometry.boundingBox!;
        const ceilingPositions = ceilingGeometry.getAttribute("position");
        const uv = ceilingGeometry.getAttribute("uv");
        for (let i = 0; i < uv.count; i++) uv.setXY(i,
          (ceilingPositions.getX(i) - bounds.min.x) / (bounds.max.x - bounds.min.x),
          (ceilingPositions.getZ(i) - bounds.min.z) / (bounds.max.z - bounds.min.z));
        volume.ceiling.material.map = ceilingGlow();
        const washGeometry = geometry.clone();
        const positions = washGeometry.getAttribute("position");
        const colors: number[] = [];
        for (let i = 0; i < positions.count; i++) {
          const intensity = Math.max(0, Math.min(1, (positions.getY(i) - floor) / (part.high - part.low)));
          // Vertex alpha fades the light down the walls without tinting the liquid.
          colors.push(1, 1, 1, intensity * intensity);
        }
        washGeometry.setAttribute("color", new Float32BufferAttribute(colors, 4));
        volume.wash = new Mesh(washGeometry, new MeshBasicMaterial({
          transparent: true, opacity: 0, side: DoubleSide, depthWrite: false, vertexColors: true,
        }));
        volume.liquid.name = "activity-volume";
        volume.ceiling.name = "light-ceiling";
        volume.wash.name = "light-wash";
        volume.liquid.visible = false;
        this.scene.add(volume.liquid, volume.ceiling, volume.wash);
      }
      this.volumes.push(volume);
      for (const fixture of part.fixtures ?? []) {
        const marker = new Mesh(fixture.kind==="window" ? new BoxGeometry(fixture.width ?? 1,fixture.height ?? 1.2,0.06) : new SphereGeometry(Math.min(0.15,Math.max(this.radius*0.008,0.06)),12,8), new MeshBasicMaterial({color:0x82cddb,transparent:true,opacity:fixture.kind==="window"?0.35:1}));
        if(fixture.kind==="window")marker.rotation.y=fixture.yaw*Math.PI/180;
        marker.position.set(fixture.position[0]-origin.x,fixture.position[2]-origin.y,-fixture.position[1]-origin.z);
        marker.name=fixture.kind==="window"?"room-window":"room-fixture";
        this.scene.add(marker);
        let coverage: Mesh<BufferGeometry,MeshBasicMaterial> | undefined;
        let boundary: LineSegments<BufferGeometry,LineDashedMaterial> | undefined;
        if (fixture.range>0 && (fixture.kind==="motion" || fixture.kind==="occupancy")) {
          coverage=new Mesh(new BufferGeometry(),new MeshBasicMaterial({color:0x53b6ce,transparent:true,opacity:0,side:DoubleSide,depthWrite:false}));
          boundary=new LineSegments(new BufferGeometry(),new LineDashedMaterial({color:0x53b6ce,dashSize:0.06,gapSize:0.08,transparent:true,opacity:0.65,depthWrite:false}));
          coverage.name="sensor-coverage";boundary.name="sensor-boundary";this.scene.add(coverage,boundary);
        }
        if(fixture.kind==="window") {
          boundary=new LineSegments(new EdgesGeometry(marker.geometry),new LineDashedMaterial({color:0x53b6ce,dashSize:1,gapSize:0,transparent:true,opacity:0.65,depthWrite:false}));
          boundary.computeLineDistances();boundary.position.copy(marker.position);boundary.quaternion.copy(marker.quaternion);boundary.name="window-boundary";
          this.scene.add(boundary);
        }
        this.markers.push({room:part.id,fixture,marker,coverage,boundary,invalid:fixture.kind==="window" && !windowFitsRoom({points:part.footprint,bounds:[[0,0,part.low],[0,0,part.high]]},fixture)});
      }
    }
    for(const o of architecture){
      const a=o.yaw*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
      const block=(start:number,run:number,height:number,base=0)=>{
        if(run<=0 || height<=0)return;
        const mesh=new Mesh(new BoxGeometry(o.width,height,run),new MeshBasicMaterial({color:o.kind==="stairs"?0x7797a2:0x6b7077,transparent:true,opacity:.72}));
        mesh.rotation.y=a;
        mesh.position.set(o.position[0]+o.width/2*c-(start+run/2)*s-origin.x,o.position[2]+base+height/2-origin.y,-o.position[1]-o.width/2*s-(start+run/2)*c-origin.z);
        mesh.name=o.kind==="stairs"?"stair-step":"architectural-solid";this.structures.push(mesh);this.scene.add(mesh);
      };
      if(isCeilingFixture(o.kind)) {
        const x=o.position[0]+o.width/2*c-o.run/2*s-origin.x,
          z=-o.position[1]-o.width/2*s-o.run/2*c-origin.z,
          ceiling=o.position[2]-origin.y,drop=o.drop ?? 0;
        const add=(geometry:BufferGeometry,y:number,color:number,name:string)=>{
          const mesh=new Mesh(geometry,new MeshBasicMaterial({color,transparent:true,opacity:.9}));
          mesh.position.set(x,y,z);mesh.name=name;mesh.userData.entity=o.entity;
          mesh.userData.baseColor=color;this.structures.push(mesh);this.scene.add(mesh);return mesh;
        };
        if(drop>0)add(new CylinderGeometry(.012,.012,drop,8),ceiling-drop/2,0x65747e,"ceiling-stem");
        const y=ceiling-drop-o.height/2,radius=Math.min(o.width,o.run)/2;
        if(o.kind==="ceiling_fan") {
          add(new CylinderGeometry(.09,.09,o.height,16),y,0x9aadb5,"ceiling-fan-hub");
          for(let blade=0;blade<4;blade++) {
            const angle=a+blade*Math.PI/2,mesh=add(new BoxGeometry(radius*.85,.025,.12),y,0x718b98,"ceiling-fan-blade");
            mesh.position.x+=Math.cos(angle)*radius*.52;mesh.position.z-=Math.sin(angle)*radius*.52;mesh.rotation.y=angle;
          }
        } else if(o.kind==="pendant_light") {
          const shape=o.shape ?? "globe",geometry=shape==="cone"?new ConeGeometry(radius,o.height,24):shape==="cylinder"?new CylinderGeometry(radius,radius,o.height,24):new SphereGeometry(1,24,12);
          const mesh=add(geometry,y,0xffd891,"pendant-light");if(shape==="globe")mesh.scale.set(o.width/2,o.height/2,o.run/2);
        } else {
          add(new CylinderGeometry(radius,radius,o.height,24),y,o.kind==="recessed_light"?0xffe5ac:0x7a8d96,o.kind);
          if(o.kind==="recessed_speaker")add(new CylinderGeometry(radius*.8,radius*.8,.005,24),y-o.height/2-.003,0x34454c,"speaker-grille");
        }
      } else if(o.kind!=="stairs")block(0,o.run,o.height);
      else {
        const run=(o.run-o.landing_bottom-o.landing_top)/o.steps;
        for(let step=0;step<o.steps;step++){
          const height=o.height*(step+1)/o.steps,start=o.landing_bottom+step*run;
          // Open beneath the treads so an under-stair room remains visible.
          const mesh=new Mesh(new BoxGeometry(o.width,.12,run),new MeshBasicMaterial({color:0x7797a2,transparent:true,opacity:.8}));mesh.rotation.y=a;
          mesh.position.set(o.position[0]+o.width/2*c-(start+run/2)*s-origin.x,o.position[2]+height-.06-origin.y,-o.position[1]-o.width/2*s-(start+run/2)*c-origin.z);mesh.name="stair-step";this.structures.push(mesh);this.scene.add(mesh);
        }
        block(0,o.landing_bottom,.12);block(o.run-o.landing_top,o.landing_top,.12,o.height-.12);
      }
    }
    for(const part of this.coverageRooms)for(const opening of part.openings ?? []) {
      const leaf=new Mesh(new BufferGeometry(),new MeshBasicMaterial({color:0x78cebd,transparent:true,opacity:0.22,side:DoubleSide,depthWrite:false}));
      const frame=new LineSegments(new BufferGeometry(),new LineBasicMaterial({color:0x87eac8,transparent:true,opacity:0.8,depthWrite:false}));
      const arc=new LineSegments(new BufferGeometry(),new LineBasicMaterial({color:0x87eac8,transparent:true,opacity:0.35,depthWrite:false}));
      leaf.name="door-leaf";frame.name="opening-frame";arc.name="door-swing";
      this.doors.push({part,opening,leaf,frame,arc});this.scene.add(leaf,frame,arc);
    }
    const siteColors = {property:0x425044, lawn:0x506b40, driveway:0x697179, path:0x8d8069, pool:0x367c9b};
    const features = [...(site?.features ?? [])].sort((a, b) => Number(b.kind === "property") - Number(a.kind === "property"));
    features.forEach((feature, index) => {
      const geometry = surfaceGeometry({footprint:feature.points}, origin);
      const mesh = new Mesh(geometry, new MeshBasicMaterial({color:siteColors[feature.kind], side:DoubleSide,
        transparent:true, opacity:0.5, depthWrite:false}));
      mesh.position.y = site!.ground_z - origin.y + index * 0.002;
      mesh.name = "site-feature";
      this.scene.add(mesh); this.siteMeshes.push(mesh);
    });
    this.grid = new GridHelper(this.radius * 2.8, 16, 0x69818e, 0x69818e);
    this.grid.position.y = (groundZ ?? box.min.y - this.radius * 0.015) - origin.y;
    if (groundZ !== undefined) {
      this.ground = new Mesh(new PlaneGeometry(this.radius * 2.8, this.radius * 2.8), new MeshBasicMaterial({color:0x75818a,transparent:true,opacity:0,side:DoubleSide,depthWrite:false}));
      this.ground.rotation.x = -Math.PI / 2;
      this.ground.position.y = this.grid.position.y;
      this.scene.add(this.ground);
    }
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.14;
    this.scene.add(this.grid);
    this.camera.near = Math.max(this.radius / 1000, 0.001);
    this.camera.far = this.radius * 100;
    this.controls.minDistance = this.radius * 0.1;
    this.controls.maxDistance = this.radius * 30;
    if(resetCamera) {this.cameraAction("reset");this.pauseUntil=0;}
    else this.draw();
  }

  setActivity(live: ActivityFrame | null, now: number, selected: string, options: ViewerOptions = viewerOptions(), fills: Record<string,RoomLight> = {}, alert?: AlertRule, states: Record<string,HassEntity> = {}): void {
    for(const mesh of this.structures)if(mesh.userData.entity){const state=states[mesh.userData.entity]?.state;mesh.material.color.set(state==="on"?0xffce62:mesh.userData.baseColor);}
    if (selected !== this.lastSelected) { this.pauseMotion(); this.lastSelected=selected; }
    this.options = options;
    if (!options.focus_activity) this.focusTarget=undefined;
    for (const volume of this.volumes) {
      const { part, edges, liquid, ceiling, wash } = volume;
      const reading = activityReading(live, part.id, now);
      const highlighted = part.id === selected || part.ancestors.includes(selected);
      const alerted = alert && (!alert.group || part.id === alert.group || part.ancestors.includes(alert.group));
      edges.material.color.set(alerted && alert.color ? alert.color : highlighted ? "#d7e8f1" : "#8596a1");
      edges.material.opacity = highlighted || alerted ? 0.9 : part.container ? 0.07 : 0.24;
      if (!liquid || !ceiling || !wash) continue;
      const wasVisible = liquid.visible;
      // Expired activity returns to blue; never-received data stays unknown.
      const ratio = reading.status === "stale" ? 0 : reading.ratio;
      liquid.visible = ratio !== null;
      if (ratio !== null) {
        const value = reading.status === "stale" ? 0 : reading.value!;
        volume.targetColor.set(thresholdColor(value, options));
        // Use the absolute 0–5 activity scale, not the room maximum. Keep even
        // the hottest rooms translucent so overlapping structures remain legible.
        volume.targetOpacity = 0.015 + 0.225 * Math.min(1, Math.max(0, value / 5));
        if (!wasVisible || this.reduced?.matches) {
          liquid.material.color.copy(volume.targetColor);
          liquid.material.opacity = volume.targetOpacity;
        }
        this.updateColor(volume, 0);
      }
      const fill = fills[part.id];
      const strength = options.light_fill ? (fill?.brightness ?? 0) * options.fill_brightness : 0;
      ceiling.material.color.setRGB(...(fill?.rgb ?? [0, 0, 0]));
      wash.material.color.copy(ceiling.material.color);
      ceiling.material.opacity = Math.min(1, strength * 3);
      wash.material.opacity = strength * 0.25;
      ceiling.visible = wash.visible = strength > 0;
    }
    const previousFocus=this.lastFocus;
    const key = alert ? `${alert.entity}:${alert.state}:${alert.group ?? ""}` : "";
    let candidate = key && key !== this.alertKey ? this.volumes.find(v=>v.part.id === alert?.group) : undefined;
    const fresh: {volume: Volume; event: number}[] = [];
    for (const volume of this.volumes) {
      const event = live?.groups[volume.part.id]?.last_activity;
      if (event != null && Number.isFinite(event)) {
        const previous = this.focusEvents.get(volume.part.id);
        this.focusEvents.set(volume.part.id,event);
        if (!volume.part.container && previous !== undefined && event > previous && now-event < 10 && activityReading(live,volume.part.id,now).status === "live") fresh.push({volume,event});
      }
    }
    if (!alert) candidate ??= fresh.sort((a,b)=>b.event-a.event)[0]?.volume;
    let alertBox: Box3 | undefined;
    if (key && key !== this.alertKey) {
      const members=this.volumes.filter(v=>!alert?.group || v.part.id===alert.group || v.part.ancestors.includes(alert.group));
      if (members.length) {
        alertBox=new Box3();
        for (const {mesh} of members) {mesh.geometry.computeBoundingBox();alertBox.union(mesh.geometry.boundingBox!);}
      }
    }
    this.alertKey = key;
    if ((candidate || alertBox) && options.focus_activity && !this.reduced?.matches && Date.now() >= this.pauseUntil && (key || now-this.lastFocus >= 12)) {
      candidate?.mesh.geometry.computeBoundingBox();
      const box = alertBox ?? candidate!.mesh.geometry.boundingBox!;
      this.focusTarget = box.getCenter(new Vector3());
      this.focusDistance = Math.min(this.fitDistance(), Math.max(box.getSize(new Vector3()).length()*2, this.radius));
      this.focusUntil = Date.now()+8000; this.lastFocus=now;
    }
    const portalKey=JSON.stringify(this.coverageRooms.flatMap(p=>(p.openings ?? []).map(o=>openingIsOpen(o,states))));
    for(const door of this.doors)this.updateDoor(door,states);
    let sensorTarget: typeof this.markers[number] | undefined;
    for (const item of this.markers) {
      const state=states[item.fixture.entity];
      const known=state?.state==="on" || state?.state==="off";
      const on=state?.state==="on";
      const appearance=fixtureAppearance(item.fixture.kind,state?.state);
      if(item.invalid)appearance.color="#ff3535";
      item.marker.material.color.set(appearance.color);
      if (item.fixture.kind==="light" && on) {
        const light=roomLight([item.fixture.entity],states);
        item.marker.material.color.setRGB(...light.rgb);
      }
      if(item.coverage && item.boundary && item.coverageKey!==portalKey) {
        const vertices:number[]=[],lines:number[]=[];
        const local=(p:[number,number,number])=>[p[0]-this.origin.x,p[2]-this.origin.y,-p[1]-this.origin.z];
        for(const lobe of coverageRays(item.fixture,this.coverageRooms,states)) {
          for(let i=0;i<lobe.rim.length;i++) {
            const a=lobe.rim[i]!,b=lobe.rim[(i+1)%lobe.rim.length]!;
            vertices.push(...local(lobe.origin),...local(a),...local(b),...local(lobe.center),...local(b),...local(a));
            lines.push(...local(a),...local(b));if(i%8===0)lines.push(...local(lobe.origin),...local(a));
          }
        }
        item.coverage.geometry.dispose();item.boundary.geometry.dispose();
        item.coverage.geometry=new BufferGeometry().setAttribute("position",new Float32BufferAttribute(vertices,3));
        item.boundary.geometry=new BufferGeometry().setAttribute("position",new Float32BufferAttribute(lines,3));item.boundary.computeLineDistances();item.coverageKey=portalKey;
      }
      if (item.coverage) {
        item.coverage.material.color.copy(item.marker.material.color);
        item.coverage.material.opacity=appearance.opacity;
      }
      if(item.boundary){item.boundary.material.color.set(appearance.color);item.boundary.material.opacity=known?0.65:0.25;}
      if ((item.fixture.kind==="motion" || item.fixture.kind==="occupancy") && item.previous==="off" && on) sensorTarget=item;
      item.previous=state?.state;
    }
    if (sensorTarget && options.focus_activity && !alert && !this.reduced?.matches && Date.now()>=this.pauseUntil && now-previousFocus>=12) {
      const direction=new Vector3(...fixtureDirection(sensorTarget.fixture));
      this.focusTarget=sensorTarget.marker.position.clone().addScaledVector(direction,Math.min(sensorTarget.fixture.range,3)*0.5);
      this.focusDistance=Math.max(this.radius*0.6,2);
      this.focusUntil=Date.now()+8000; this.lastFocus=now;
    }
    this.scheduleMotion();
    this.draw();
  }

  private updateDoor(door:typeof this.doors[number],states:Record<string,HassEntity>):void {
    const open=openingIsOpen(door.opening,states),state=openingState(door.opening,states),key=`${open}:${state}`;if(door.key===key)return;door.key=key;
    const p=door.part,o=door.opening;
    const group={points:p.footprint,bounds:[[Math.min(...p.footprint.map(v=>v[0])),Math.min(...p.footprint.map(v=>v[1])),p.low],[Math.max(...p.footprint.map(v=>v[0])),Math.max(...p.footprint.map(v=>v[1])),p.high]] as [[number,number,number],[number,number,number]]};
    const color=!openingFitsRoom(group,o) || state==="on"?0xff3535:state==="unknown"?0x7a8790:0x53b6ce;
    door.frame.material.color.setHex(color);door.leaf.material.color.setHex(color);door.arc.material.color.setHex(color);
    const swing=openingSwing(group,o),end=open?swing.open:swing.closed;
    const point=(v:[number,number],z:number)=>[v[0]-this.origin.x,z-this.origin.y,-v[1]-this.origin.z];
    const bottom=o.position[2],top=bottom+o.height;
    const a=point(swing.hinge,bottom),b=point(swing.closed,bottom),c=point(swing.closed,top),d=point(swing.hinge,top),e=point(end,bottom),f=point(end,top);
    door.frame.geometry.dispose();door.leaf.geometry.dispose();door.arc.geometry.dispose();
    door.frame.geometry=new BufferGeometry().setAttribute("position",new Float32BufferAttribute([...a,...b,...b,...c,...c,...d,...d,...a],3));
    door.leaf.geometry=new BufferGeometry().setAttribute("position",new Float32BufferAttribute([...a,...e,...f,...a,...f,...d],3));door.leaf.visible=o.kind!=="open_wall";
    const angle=Math.atan2(swing.closed[1]-swing.hinge[1],swing.closed[0]-swing.hinge[0]);
    const target=Math.atan2(swing.open[1]-swing.hinge[1],swing.open[0]-swing.hinge[0]),delta=Math.atan2(Math.sin(target-angle),Math.cos(target-angle));
    const lines:number[]=[];
    for(let i=0;i<16;i++)for(const t of [i/16,(i+1)/16])lines.push(...point([swing.hinge[0]+o.width*Math.cos(angle+delta*t),swing.hinge[1]+o.width*Math.sin(angle+delta*t)],bottom+0.01));
    door.arc.geometry=new BufferGeometry().setAttribute("position",new Float32BufferAttribute(lines,3));door.arc.visible=o.kind!=="open_wall" && o.kind!=="window";
  }

  setPlacement(height?: number): void { this.placementHeight=height; }

  private updateColor(volume: Volume, blend: number): void {
    if (!volume.liquid?.visible) return;
    const color = volume.liquid.material.color;
    color.lerp(volume.targetColor, blend);
    volume.liquid.material.opacity += (volume.targetOpacity - volume.liquid.material.opacity) * blend;
    if (!this.colorPending(volume)) {
      color.copy(volume.targetColor);
      volume.liquid.material.opacity = volume.targetOpacity;
    }
  }

  private colorPending(volume: Volume): boolean {
    const color = volume.liquid?.material.color;
    return !!volume.liquid?.visible && !!color &&
      Math.abs(color.r - volume.targetColor.r) + Math.abs(color.g - volume.targetColor.g) +
      Math.abs(color.b - volume.targetColor.b) +
      Math.abs(volume.liquid.material.opacity - volume.targetOpacity) > 0.001;
  }

  private colorChanging(): boolean {
    return this.volumes.some(volume => this.colorPending(volume));
  }

  private readonly pauseMotion = (): void => {
    this.pauseUntil = Date.now()+30000; this.focusTarget=undefined;
  };
  private readonly scheduleMotion = (): void => {
    clearTimeout(this.animation);
    this.animation=undefined;
    if (this.disposed || this.lost || this.reduced?.matches || document.visibilityState !== "visible" || (!this.options.auto_rotate && !this.focusTarget && !this.colorChanging())) return;
    this.lastTick=performance.now();
    this.animation=setTimeout(this.animate, 1000/30);
  };
  private readonly animate = (): void => {
    if (this.disposed || this.lost || document.visibilityState !== "visible" || this.reduced?.matches) return;
    const time=performance.now(), delta=Math.min((time-this.lastTick)/1000,0.1); this.lastTick=time;
    for (const volume of this.volumes) this.updateColor(volume, 1 - Math.exp(-delta * 8));
    this.draw();
    if (Date.now() >= this.pauseUntil) {
      if (this.focusTarget) {
        const returning=Date.now() > this.focusUntil;
        const destination=returning ? new Vector3() : this.focusTarget;
        const offset=this.camera.position.clone().sub(this.controls.target);
        const distance=returning ? this.fitDistance() : this.focusDistance;
        offset.setLength(offset.length()+(distance-offset.length())*Math.min(1,delta*2));
        this.controls.target.lerp(destination,Math.min(1,delta*2));
        this.camera.position.copy(this.controls.target).add(offset);
        if (returning && this.controls.target.length()<0.01 && Math.abs(offset.length()-distance)<0.01) this.focusTarget=undefined;
      }
      if (this.options.auto_rotate) this.controls.rotateLeft(delta*2*Math.PI/this.options.rotation_period);
      this.controls.update(); this.draw();
    }
    if (this.options.auto_rotate || this.focusTarget || this.colorChanging()) this.animation=setTimeout(this.animate,1000/30);
  };
  private fitDistance(): number {
    const vertical=this.camera.fov*Math.PI/360;
    return this.radius/Math.sin(Math.min(vertical,Math.atan(Math.tan(vertical)*this.camera.aspect)))*1.2;
  }

  cameraAction(action: CameraAction): void {
    this.pauseMotion();
    if (action === "reset" || action === "top") {
      const vertical = this.camera.fov * Math.PI / 360;
      const angle = Math.min(vertical, Math.atan(Math.tan(vertical) * this.camera.aspect));
      const distance = this.radius / Math.sin(angle) * 1.2;
      this.controls.target.set(0, 0, 0);
      const direction = action === "top" ? new Vector3(0, 1, 0.0001) : new Vector3(1, 0.8, 1);
      this.camera.position.copy(direction.normalize().multiplyScalar(distance));
      this.camera.updateProjectionMatrix();
    } else if (action === "left" || action === "right") this.controls.rotateLeft(action === "left" ? 0.2 : -0.2);
    else if (action === "up" || action === "down") this.controls.rotateUp(action === "up" ? 0.15 : -0.15);
    else if (action === "in") this.controls.dollyIn(1 / 1.2);
    else this.controls.dollyOut(1 / 1.2);
    this.controls.update();
    this.draw();
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0) { this.pointer = null; return; }
    this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  };
  private readonly onPointerLeave = (): void => { this.hover?.(""); };
  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.pointer && this.hover) {
      const rect=this.renderer.domElement.getBoundingClientRect();
      if (rect.width && rect.height) {
        this.raycaster.setFromCamera(new Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),this.camera);
        const hit=this.raycaster.intersectObjects(this.volumes.filter(v=>!v.part.container).map(v=>v.mesh))[0];
        this.hover(this.volumes.find(v=>v.mesh===hit?.object)?.part.id ?? "");
      }
    }
    if (this.pointer && Math.hypot(event.clientX - this.pointer.x, event.clientY - this.pointer.y) > 5)
      this.pointer.moved = true;
  };
  private readonly onPointerCancel = (): void => { this.pointer = null; };
  private readonly onPointerUp = (event: PointerEvent): void => {
    const start = this.pointer;
    this.pointer = null;
    if (!start || start.id !== event.pointerId || start.moved) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.raycaster.setFromCamera(new Vector2(
      (event.clientX - rect.left) / rect.width * 2 - 1,
      -(event.clientY - rect.top) / rect.height * 2 + 1,
    ), this.camera);
    if (this.placementHeight !== undefined && this.place) {
      const hit=this.raycaster.ray.intersectPlane(new Plane(new Vector3(0,1,0),this.origin.y-this.placementHeight),new Vector3());
      if (hit) this.place([hit.x+this.origin.x,-hit.z-this.origin.z,this.placementHeight]);
      return;
    }
    // Enclosing floor/building boxes must not intercept clicks intended for their rooms.
    const rooms = this.volumes.filter(({ part }) => !part.container);
    const hits = this.raycaster.intersectObjects(rooms.map(({ mesh }) => mesh));
    const hit = hits[0] ?? this.raycaster.intersectObjects(this.volumes.map(({ mesh }) => mesh))[0];
    const volume = this.volumes.find(({ mesh }) => mesh === hit?.object);
    if (volume) this.select(volume.part.id);
  };
  private readonly onContextLost = (event: Event): void => {
    event.preventDefault();
    this.lost = true;
    this.fail("The WebGL context was lost. You can still use the group list, or retry the 3D view.");
  };

  private clearParts(): void {
    for(const mesh of this.structures){this.scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}this.structures=[];
    for (const item of this.markers) for (const mesh of [item.marker,item.coverage,item.boundary]) {
      if (mesh) {this.scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}
    }
    this.markers=[];
    for(const door of this.doors)for(const mesh of [door.leaf,door.frame,door.arc]){this.scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}
    this.doors=[];
    for (const mesh of this.siteMeshes) {
      this.scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose();
    }
    this.siteMeshes = [];
    if (this.ground) { this.scene.remove(this.ground); this.ground.geometry.dispose(); this.ground.material.dispose(); this.ground=undefined; }
    for (const { mesh, edges, liquid, ceiling, wash } of this.volumes) {
      ceiling?.material.map?.dispose();
      for (const layer of [liquid, ceiling, wash]) {
        if (layer) {
          this.scene.remove(layer);
          layer.geometry.dispose(); layer.material.dispose();
        }
      }
      this.scene.remove(mesh, edges);
      mesh.geometry.dispose(); mesh.material.dispose();
      edges.geometry.dispose(); edges.material.dispose();
    }
    this.volumes = [];
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.geometry.dispose(); this.grid.material.dispose(); this.grid = undefined;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    clearTimeout(this.animation);
    document.removeEventListener("visibilitychange", this.scheduleMotion);
    this.reduced?.removeEventListener("change", this.scheduleMotion);
    this.controls.removeEventListener("start", this.pauseMotion);
    this.observer.disconnect();
    this.controls.removeEventListener("change", this.draw);
    this.controls.dispose();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener("pointerdown", this.onPointerDown);
    canvas.removeEventListener("pointermove", this.onPointerMove);
    canvas.removeEventListener("pointerup", this.onPointerUp);
    canvas.removeEventListener("pointercancel", this.onPointerCancel);
    canvas.removeEventListener("pointerleave", this.onPointerLeave);
    canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.clearParts();
    this.renderer.dispose();
    canvas.remove();
  }
}
