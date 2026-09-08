import {
  Box3, Color, DoubleSide, EdgesGeometry, ExtrudeGeometry, GridHelper, LineBasicMaterial,
  LineSegments, Mesh, MeshBasicMaterial, PerspectiveCamera, Raycaster, Scene, Shape,
  Vector2, Vector3, WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { activityReading } from "./floorplan-model";
import type { ScenePart } from "./floorplan-model";
import type { LiveState } from "./types";

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

  setParts(parts: ScenePart[]): void {
    this.clearParts();
    if (!parts.length) { this.draw(); return; }
    const box = new Box3();
    for (const part of parts) for (const [x, y] of part.footprint) {
      box.expandByPoint(new Vector3(x, part.low, -y));
      box.expandByPoint(new Vector3(x, part.high, -y));
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
    this.grid.position.y = box.min.y - origin.y - this.radius * 0.015;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.14;
    this.scene.add(this.grid);
    this.camera.near = Math.max(this.radius / 1000, 0.001);
    this.camera.far = this.radius * 100;
    this.controls.minDistance = this.radius * 0.1;
    this.controls.maxDistance = this.radius * 30;
    this.cameraAction("reset");
  }

  setActivity(live: LiveState | null, now: number, selected: string): void {
    for (const { part, mesh, edges } of this.volumes) {
      const ratio = activityReading(live, part.id, now).ratio;
      const highlighted = part.id === selected || part.ancestors.includes(selected);
      const color = ratio === null ? new Color(0x8596a1) : new Color(0x5fbad2).lerp(new Color(0xffbc66), ratio);
      mesh.material.color.copy(color);
      mesh.material.opacity = part.container ? 0 : ratio === null ? 0.008 : 0.025 + ratio * 0.28;
      edges.material.color.copy(highlighted ? new Color(0xffffff) : color);
      edges.material.opacity = highlighted ? 1 : (part.container ? 0.18 : 0.35) + (ratio ?? 0) * 0.55;
    }
    this.draw();
  }

  cameraAction(action: CameraAction): void {
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
