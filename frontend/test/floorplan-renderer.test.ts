import { afterEach, describe, expect, it, vi } from "vitest";
import { BufferGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3 } from "three";
import { viewerOptions } from "../src/floorplan-style";
import type { ScenePart } from "../src/floorplan-model";
import type { GroupLive, LiveState } from "../src/types";

const gpu = vi.hoisted(() => ({ render: vi.fn(), dispose: vi.fn(), setSize: vi.fn() }));
vi.mock("three", async (original) => ({
  ...await original<typeof import("three")>(),
  WebGLRenderer: class {
    domElement = document.createElement("canvas");
    setPixelRatio = vi.fn();
    setClearColor = vi.fn();
    setSize = gpu.setSize;
    render = gpu.render;
    dispose = gpu.dispose;
  },
}));
const observe = vi.fn();
const disconnect = vi.fn();
vi.stubGlobal("ResizeObserver", class { observe = observe; disconnect = disconnect; });
const { FloorplanRenderer, volumeGeometry } = await import("../src/floorplan-renderer");

const part = (): ScenePart => ({
  id: "room", label: "Room", kind: "area", path: ["groups", 0], ancestors: [],
  footprint: [[4, 5], [7, 5], [7, 8], [5, 8], [5, 9], [4, 9]], low: 11.8, high: 13.8, container: false,
});
const host = () => { const el = document.createElement("div"); document.body.append(el); return el; };
const frame = (value: number): LiveState => ({ now: 1000, voices: {}, groups: {
  room: { value, max_value: 5 } as GroupLive,
} });
afterEach(() => { vi.clearAllMocks(); document.body.innerHTML = ""; });

describe("floorplan renderer", () => {
  it("moves the camera closer for Zoom in and farther for Zoom out", () => {
    const renderer = new FloorplanRenderer(host(), vi.fn(), vi.fn());
    renderer.setParts([part()]);
    const camera = gpu.render.mock.calls.at(-1)![1] as PerspectiveCamera;
    const before = camera.position.length();
    renderer.cameraAction("in");
    expect(camera.position.length()).toBeLessThan(before);
    renderer.cameraAction("out");
    expect(camera.position.length()).toBeCloseTo(before);
    renderer.dispose();
  });
  it("places ground at 12.886 while the basement ceiling stays 0.914 m above it", () => {
    const renderer=new FloorplanRenderer(host(),vi.fn(),vi.fn()); renderer.setParts([part()],12.886);
    const scene=gpu.render.mock.calls.at(-1)![0] as Scene;
    const meshes=scene.children.filter(n=>n instanceof Mesh) as Mesh[];
    const room=meshes.find(m=>m.geometry.type==="ExtrudeGeometry")!;
    const ground=meshes.find(m=>m.geometry.type==="PlaneGeometry")!;
    room.geometry.computeBoundingBox();
    expect(room.geometry.boundingBox!.max.y-ground.position.y).toBeCloseTo(.914,3);
    expect(room.geometry.boundingBox!.min.y).toBeLessThan(ground.position.y);
    renderer.dispose();
  });
  it("keeps threshold outlines independent of light color and selection", () => {
    const renderer=new FloorplanRenderer(host(),vi.fn(),vi.fn());renderer.setParts([part()]);
    renderer.setActivity(frame(3),1000,"room",viewerOptions(),{room:{rgb:[0,0,1],brightness:1,unknown:false}});
    const scene=gpu.render.mock.calls.at(-1)![0] as Scene;
    const mesh=scene.children.find(n=>n instanceof Mesh) as Mesh<BufferGeometry,MeshBasicMaterial>;
    expect(mesh.material.color.b).toBe(1);expect(mesh.material.color.r).toBe(0);
    const edges=scene.children.find(n=>n.type==="LineSegments") as import("three").LineSegments<BufferGeometry,import("three").LineBasicMaterial>;
    expect(edges.material.color.getHexString()).toBe("f39c12");renderer.dispose();
  });
  it("moves automatically, pauses for interaction, and clears animation on dispose", async () => {
    vi.useFakeTimers();const renderer=new FloorplanRenderer(host(),vi.fn(),vi.fn());renderer.setParts([part()]);
    renderer.setActivity(frame(0),1000,"",viewerOptions({auto_rotate:true}));
    const camera=gpu.render.mock.calls.at(-1)![1] as PerspectiveCamera;
    const before=camera.position.clone();await vi.advanceTimersByTimeAsync(1000);
    expect(camera.position.equals(before)).toBe(false);
    renderer.cameraAction("left");const paused=camera.position.clone();await vi.advanceTimersByTimeAsync(1000);
    expect(camera.position.equals(paused)).toBe(true);
    renderer.dispose();expect(vi.getTimerCount()).toBe(0);vi.useRealTimers();
  });
  it("focuses once for fresh room activity and returns to overview", async () => {
    vi.useFakeTimers();vi.setSystemTime(1000000);
    const renderer=new FloorplanRenderer(host(),vi.fn(),vi.fn());renderer.setParts([part()]);
    renderer.setParts([part(),{...part(),id:"other",footprint:part().footprint.map(([x,y])=>[x+20,y])}]);
    const options=viewerOptions({focus_activity:true});const initial=frame(0);initial.groups.room!.last_activity=990;
    renderer.setActivity(initial,1000,"",options);
    const camera=gpu.render.mock.calls.at(-1)![1] as PerspectiveCamera;const distance=camera.position.length();
    const event=frame(3);event.groups.room!.last_activity=1000;renderer.setActivity(event,1000,"",options);
    await vi.advanceTimersByTimeAsync(2500);
    expect(camera.position.length()).toBeLessThan(distance);
    renderer.setActivity(event,1002.5,"",options);
    await vi.advanceTimersByTimeAsync(14000);
    expect(camera.position.length()).toBeCloseTo(distance,1);
    renderer.dispose();vi.useRealTimers();
  });
  it("extrudes a nonrectangular footprint with Z elevation mapped to world Y", () => {
    const geometry = volumeGeometry(part(), new Vector3());
    geometry.computeBoundingBox();
    expect(geometry.boundingBox!.min.toArray()).toEqual([4, expect.closeTo(11.8), -9]);
    expect(geometry.boundingBox!.max.toArray()).toEqual([7, expect.closeTo(13.8), -5]);
    geometry.dispose();
  });

  it("updates activity without rebuilding geometry and releases GPU resources on disposal", () => {
    const container = host();
    const disposeGeometry = vi.spyOn(BufferGeometry.prototype, "dispose");
    const renderer = new FloorplanRenderer(container, vi.fn(), vi.fn());
    renderer.setParts([part()]);
    const scene = gpu.render.mock.calls.at(-1)![0] as Scene;
    let mesh!: Mesh<BufferGeometry, MeshBasicMaterial>;
    scene.traverse((node) => { if (node instanceof Mesh) mesh = node as typeof mesh; });
    const geometry = mesh.geometry;
    renderer.setActivity(frame(0), 1000, "",viewerOptions(),{room:{rgb:[1,0,0],brightness:0.1,unknown:false}});
    const quiet = mesh.material.opacity;
    renderer.setActivity(frame(5), 1000, "",viewerOptions(),{room:{rgb:[1,0,0],brightness:1,unknown:false}});
    expect(mesh.material.opacity).toBeGreaterThan(quiet);
    expect(mesh.geometry).toBe(geometry);
    renderer.setActivity(frame(5), 1011, "");
    expect(mesh.material.opacity).toBeLessThan(quiet);
    renderer.dispose();
    expect(container.querySelector("canvas")).toBeNull();
    expect(disposeGeometry).toHaveBeenCalled();
    expect(gpu.dispose).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
    disposeGeometry.mockRestore();
  });

  it("releases old geometry when parts change and reports context loss", () => {
    const error = vi.fn();
    const container = host();
    const renderer = new FloorplanRenderer(container, vi.fn(), error);
    renderer.setParts([part()]);
    const disposeGeometry = vi.spyOn(BufferGeometry.prototype, "dispose");
    renderer.setParts([]);
    expect(disposeGeometry).toHaveBeenCalled();
    container.querySelector("canvas")!.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    expect(error).toHaveBeenCalledWith(expect.stringContaining("context"));
    renderer.dispose(); disposeGeometry.mockRestore();
  });
});
