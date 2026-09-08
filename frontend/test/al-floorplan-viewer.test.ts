import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AlFloorplanViewer } from "../src/al-floorplan-viewer";
import type { Config, GroupLive, LiveState } from "../src/types";
import { newGroup } from "../src/model";
import { roomsConfig } from "./fixtures";

const scene = vi.hoisted(() => ({
  created: vi.fn(), setParts: vi.fn(), setActivity: vi.fn(), cameraAction: vi.fn(), dispose: vi.fn(),
  fail: false, select: (_id: string) => { void _id; }, contextLost: (_message: string) => { void _message; },
}));
vi.mock("../src/floorplan-renderer", () => ({ FloorplanRenderer: class {
  constructor(_host: HTMLElement, select: (id: string) => void, fail: (message: string) => void) {
    if (scene.fail) throw new Error("No WebGL");
    scene.created(); scene.select = select; scene.contextLost = fail;
  }
  setParts = scene.setParts; setActivity = scene.setActivity;
  cameraAction = scene.cameraAction; dispose = scene.dispose;
} }));
await import("../src/al-floorplan-viewer");

const modelConfig = (): Config => {
  const config = roomsConfig();
  const building = config.groups[0]!.children[0]!;
  building.children = [{ ...newGroup("ground", "floor"), name: "Ground", children: [
    { ...newGroup("kitchen", "area"), name: "Kitchen", bounds: [[0, 0, 0], [3, 4, 3]] },
  ] }, { ...newGroup("upper", "floor"), name: "Upper", children: [
    { ...newGroup("bedroom", "area"), name: "Bedroom", bounds: [[0, 0, 3], [3, 4, 6]] },
  ] }];
  return config;
};
const live = (): LiveState => ({ now: Date.now() / 1000, voices: {}, groups: {
  kitchen: { value: 2, max_value: 5 } as GroupLive,
  ground: { value: 7, max_value: 10 } as GroupLive,
} });
const settle = async (el: AlFloorplanViewer) => { for (let i = 0; i < 15; i++) await el.updateComplete; };
const mount = async (config = modelConfig()) => {
  const el = document.createElement("al-floorplan-viewer");
  el.config = config; el.live = live(); document.body.append(el); await settle(el);
  // Dynamic module imports settle on the next event-loop turn in Vitest.
  await vi.waitFor(() => expect(scene.created).toHaveBeenCalled()); await settle(el);
  return el;
};
beforeEach(() => { scene.fail = false; vi.clearAllMocks(); });
afterEach(() => { document.body.innerHTML = ""; vi.useRealTimers(); });

describe("floorplan viewer", () => {
  it("loads the renderer for geometry, isolates floors and wires camera controls", async () => {
    const el = await mount();
    expect(scene.setParts.mock.calls.at(-1)![0]).toHaveLength(2);
    const select = el.shadowRoot!.querySelector<HTMLSelectElement>("#scope")!;
    select.value = "upper"; select.dispatchEvent(new Event("change")); await settle(el);
    expect(scene.setParts.mock.calls.at(-1)![0].map((p: { id: string }) => p.id)).toEqual(["bedroom"]);
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-camera="top"]')!.click();
    expect(scene.cameraAction).toHaveBeenCalledWith("top");
  });

  it("selects groups from the list or canvas and opens their existing settings", async () => {
    const el = await mount();
    const open = vi.fn(); el.addEventListener("al-open-group", open);
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-group="ground"]')!.click(); await settle(el);
    expect(el.shadowRoot!.querySelector(".selection")!.textContent).toContain("7 / 10");
    scene.select("kitchen"); await settle(el);
    expect(el.shadowRoot!.querySelector(".selection")!.textContent).toContain("2 / 5");
    el.shadowRoot!.querySelector<HTMLButtonElement>("#open-group")!.click();
    expect(open.mock.calls[0]![0].detail).toEqual(["groups", 0, "children", 0, "children", 0, "children", 0]);
  });

  it("updates readings without resetting the scene or camera and expires stale state", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const el = await mount();
    const builds = scene.setParts.mock.calls.length;
    el.live = { ...live(), groups: {} }; await settle(el);
    expect(scene.setParts).toHaveBeenCalledTimes(builds);
    await vi.advanceTimersByTimeAsync(12_000); await settle(el);
    expect(el.shadowRoot!.textContent).toContain("stale");
  });

  it("does not allocate WebGL for empty or unplaced geometry", async () => {
    const el = document.createElement("al-floorplan-viewer");
    el.config = roomsConfig(); document.body.append(el); await settle(el);
    expect(scene.created).not.toHaveBeenCalled();
    expect(el.shadowRoot!.textContent).toContain("Import a floorplan");
    const config = roomsConfig(); config.groups[0]!.points = [[0, 0], [2, 0], [0, 2]];
    el.config = config; await settle(el);
    expect(scene.created).not.toHaveBeenCalled();
    expect(el.shadowRoot!.textContent).toContain("vertical bounds");
  });

  it("keeps the group list usable after WebGL fails and supports retry", async () => {
    scene.fail = true;
    const el = document.createElement("al-floorplan-viewer");
    el.config = modelConfig(); document.body.append(el); await settle(el);
    await vi.waitFor(() => expect(el.shadowRoot!.textContent).toContain("WebGL"));
    expect(el.shadowRoot!.querySelector('[data-group="kitchen"]')).toBeTruthy();
    scene.fail = false;
    el.shadowRoot!.querySelector<HTMLButtonElement>("#retry")!.click(); await settle(el);
    await vi.waitFor(() => expect(scene.created).toHaveBeenCalled());
    scene.contextLost("WebGL context lost"); await settle(el);
    expect(scene.dispose).toHaveBeenCalled();
    expect(el.shadowRoot!.textContent).toContain("context lost");
  });

  it("disposes the renderer on disconnect", async () => {
    const el = await mount(); el.remove();
    expect(scene.dispose).toHaveBeenCalledOnce();
  });
});
