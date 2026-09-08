import { afterEach, describe, expect, it, vi } from "vitest";
import { BufferGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3 } from "three";
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
    renderer.setActivity(frame(0), 1000, "");
    const quiet = mesh.material.opacity;
    renderer.setActivity(frame(5), 1000, "");
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
