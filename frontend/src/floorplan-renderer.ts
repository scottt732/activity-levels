import {
  Box3, DoubleSide, EdgesGeometry, ExtrudeGeometry, GridHelper, LineBasicMaterial,
  LineSegments, Mesh, MeshBasicMaterial, PerspectiveCamera, Raycaster, Scene, Shape,
  Vector2, Vector3, WebGLRenderer, PlaneGeometry,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { activityReading } from "./floorplan-model";
import type { ScenePart, ActivityFrame } from "./floorplan-model";
import { viewerOptions, thresholdColor } from "./floorplan-style";
import type { ViewerOptions, RoomLight, AlertRule } from "./floorplan-style";

export type CameraAction = "reset" | "top" | "left" | "right" | "up" | "down" | "in" | "out";

/** Recenter before uploading float32 vertices; the geographic origin never moves a room. */
export function volumeGeometry(part: ScenePart, origin: Vector3): ExtrudeGeometry {
  const shape = new Shape(part.footprint.map(([x, y]) => new Vector2(x - origin.x, y + origin.z)));
  const geometry = new ExtrudeGeometry(shape, { depth: part.high - part.low, bevelEnabled: false, steps: 1 });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, part.low - origin.y, 0);
  return geometry;
}

interface Volume {
  part: ScenePart;
  mesh: Mesh<ExtrudeGeometry, MeshBasicMaterial>;
  edges: LineSegments<EdgesGeometry, LineBasicMaterial>;
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
    if (!this.disposed && !this.lost && document.visibilityState === "visible")
      this.renderer.render(this.scene, this.camera);
  };

  setParts(parts: ScenePart[], groundZ?: number): void {
    this.clearParts();
    this.focusTarget=undefined; this.focusEvents.clear();
    if (!parts.length) { this.draw(); return; }
    const box = new Box3();
    for (const part of parts) for (const [x, y] of part.footprint) {
      box.expandByPoint(new Vector3(x, part.low, -y));
      box.expandByPoint(new Vector3(x, part.high, -y));
    }
    if (groundZ !== undefined) {
      box.expandByPoint(new Vector3(box.min.x, groundZ, box.min.z));
      box.expandByPoint(new Vector3(box.max.x, groundZ, box.max.z));
    }
    const origin = box.getCenter(new Vector3());
    this.radius = Math.max(box.getSize(new Vector3()).length() / 2, 0.1);
    for (const part of parts) {
      const geometry = volumeGeometry(part, origin);
      const mesh = new Mesh(geometry, new MeshBasicMaterial({
        color: 0x60c8e5, transparent: true, opacity: 0.025, side: DoubleSide, depthWrite: false,
      }));
      const edges = new LineSegments(new EdgesGeometry(geometry), new LineBasicMaterial({
        color: 0x91a6b4, transparent: true, opacity: 0.4, depthWrite: false,
      }));
      if (part.container) mesh.material.opacity = 0;
      this.scene.add(mesh, edges);
      this.volumes.push({ part, mesh, edges });
    }
    this.grid = new GridHelper(this.radius * 2.8, 16, 0x69818e, 0x69818e);
    this.grid.position.y = (groundZ ?? box.min.y - this.radius * 0.015) - origin.y;
    if (groundZ !== undefined) {
      this.ground = new Mesh(new PlaneGeometry(this.radius * 2.8, this.radius * 2.8), new MeshBasicMaterial({color:0x75818a,transparent:true,opacity:0.045,side:DoubleSide,depthWrite:false}));
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
    this.cameraAction("reset");
    this.pauseUntil=0;
  }

  setActivity(live: ActivityFrame | null, now: number, selected: string, options: ViewerOptions = viewerOptions(), fills: Record<string,RoomLight> = {}, alert?: AlertRule): void {
    if (selected !== this.lastSelected) { this.pauseMotion(); this.lastSelected=selected; }
    this.options = options;
    if (!options.focus_activity) this.focusTarget=undefined;
    for (const { part, mesh, edges } of this.volumes) {
      const reading = activityReading(live, part.id, now);
      const highlighted = part.id === selected || part.ancestors.includes(selected);
      const alerted = alert && (!alert.group || part.id === alert.group || part.ancestors.includes(alert.group));
      const color = reading.ratio === null ? "#8596a1" : thresholdColor(reading.value!, options);
      edges.material.color.set(alerted && alert.color ? alert.color : color);
      edges.material.opacity = highlighted || alerted ? 1 : part.container ? 0.3 : 0.75;
      const fill = fills[part.id];
      if (options.light_fill) {
        mesh.material.color.setRGB(...(fill?.rgb ?? [0,0,0]));
        mesh.material.opacity = part.container ? 0 : (fill?.brightness ?? 0) * options.fill_brightness;
      } else {
        mesh.material.color.set(color);
        mesh.material.opacity = part.container || reading.ratio === null ? 0 : reading.ratio * options.fill_brightness;
      }
    }
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
    this.scheduleMotion();
    this.draw();
  }

  private readonly pauseMotion = (): void => {
    this.pauseUntil = Date.now()+30000; this.focusTarget=undefined;
  };
  private readonly scheduleMotion = (): void => {
    clearTimeout(this.animation);
    this.animation=undefined;
    if (this.disposed || this.lost || this.reduced?.matches || document.visibilityState !== "visible" || (!this.options.auto_rotate && !this.focusTarget)) return;
    this.lastTick=performance.now();
    this.animation=setTimeout(this.animate, 1000/30);
  };
  private readonly animate = (): void => {
    if (this.disposed || this.lost || document.visibilityState !== "visible" || this.reduced?.matches) return;
    const time=performance.now(), delta=Math.min((time-this.lastTick)/1000,0.1); this.lastTick=time;
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
      if (this.options.auto_rotate) this.controls.rotateLeft(delta*Math.PI/90);
      this.controls.update(); this.draw();
    }
    if (this.options.auto_rotate || this.focusTarget) this.animation=setTimeout(this.animate,1000/30);
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
  private readonly onPointerMove = (event: PointerEvent): void => {
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
    if (this.ground) { this.scene.remove(this.ground); this.ground.geometry.dispose(); this.ground.material.dispose(); this.ground=undefined; }
    for (const { mesh, edges } of this.volumes) {
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
    canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.clearParts();
    this.renderer.dispose();
    canvas.remove();
  }
}
