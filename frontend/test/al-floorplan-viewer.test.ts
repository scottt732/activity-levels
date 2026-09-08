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
afterEach(() => { document.body.innerHTML = ""; vi.useRealTimers(); delete (document as unknown as Record<string,unknown>).fullscreenElement; delete (document as unknown as Record<string,unknown>).exitFullscreen; });

describe("floorplan viewer", () => {
  it("publishes rotation speed changes without rebuilding the scene", async () => {
    const el=await mount();const builds=scene.setParts.mock.calls.length;
    const changed=vi.fn();el.addEventListener("al-viewer-settings",changed);
    const input=el.shadowRoot!.querySelector<HTMLInputElement>("#rotation-period")!;
    expect(input.value).toBe("180");input.value="360";input.dispatchEvent(new Event("change"));await settle(el);
    expect(changed.mock.calls[0]![0].detail.rotation_period).toBe(360);
    expect(scene.setActivity.mock.calls.at(-1)![3].rotation_period).toBe(360);
    expect(scene.setParts).toHaveBeenCalledTimes(builds);
  });
  it("exits ambient directly and publishes the preference without opening settings", async () => {
    const el=await mount();el.settings={ambient:true,ground_z:12.886};await settle(el);
    const changed=vi.fn();el.addEventListener("al-viewer-settings",changed);
    const exit=el.shadowRoot!.querySelector<HTMLButtonElement>("#exit-view")!;
    expect(exit).not.toBeNull();exit.click();await settle(el);
    expect(el.hasAttribute("ambient")).toBe(false);
    expect(changed.mock.calls[0]![0].detail).toEqual({ambient:false,ground_z:12.886});
  });
  it("exits owned fullscreen and handles the browser's native Escape exit", async () => {
    const el=await mount();el.settings={ambient:true};await settle(el);
    const fullscreen=vi.fn(()=>el as Element | null);Object.defineProperty(document,"fullscreenElement",{configurable:true,get:fullscreen});
    const exit=vi.fn().mockResolvedValue(undefined);Object.defineProperty(document,"exitFullscreen",{configurable:true,value:exit});
    document.dispatchEvent(new Event("fullscreenchange"));await settle(el);
    el.shadowRoot!.querySelector<HTMLButtonElement>("#exit-view")!.click();await settle(el);
    expect(exit).toHaveBeenCalledOnce();expect(el.settings.ambient).toBe(false);
    el.settings={ambient:true};await settle(el);
    fullscreen.mockReturnValue(null);document.dispatchEvent(new Event("fullscreenchange"));await settle(el);
    expect(el.settings.ambient).toBe(false);delete (document as unknown as Record<string,unknown>).fullscreenElement;
  });
  it("handles Escape within the viewer without requiring browser fullscreen", async () => {
    const el=await mount();el.settings={ambient:true};await settle(el);
    el.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));await settle(el);
    expect(el.settings.ambient).toBe(false);
  });
  it("applies a ground setting, presets, and light fills without changing the model", async () => {
    const el=await mount(); const settings=vi.fn();el.addEventListener("al-viewer-settings",settings);
    const input=el.shadowRoot!.querySelector<HTMLInputElement>('input[type="number"]')!;
    input.value="12.886";input.dispatchEvent(new Event("change"));await settle(el);
    expect(el.settings.ground_z).toBe(12.886);expect(settings).toHaveBeenCalledOnce();
    expect(scene.setParts.mock.calls.at(-1)![1]).toBe(12.886);
    el.settings={...el.settings,scheme:"security",ambient:true};await settle(el);
    expect(el.hasAttribute("ambient")).toBe(true);
    expect(scene.setActivity.mock.calls.at(-1)![3].scheme).toBe("security");
  });
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
