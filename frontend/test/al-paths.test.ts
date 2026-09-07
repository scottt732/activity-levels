import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/al-paths";
import type { AlPaths } from "../src/al-paths";
import type { HomeAssistant } from "../src/types";
import { roomsConfig } from "./fixtures";

afterEach(() => { document.body.innerHTML = ""; });
const topology = {
  nodes: ["kitchen", "dining_room", "hall", "bedroom", "back_patio"],
  edges: [["kitchen", "dining_room", false], ["dining_room", "hall", false], ["hall", "bedroom", true]],
  exits: ["back_patio"],
};
const route = [["kitchen", "dining_room", "hall", "bedroom"]];
const settle = async (el: AlPaths) => { for (let i = 0; i < 6; i++) await el.updateComplete; };
const mount = async (answer: (msg: Record<string, unknown>) => unknown = () => ({ paths: route })) => {
  const callWS = vi.fn(async (msg: Record<string, unknown>) => msg.type === "activity_levels/topology" ? topology : answer(msg));
  const el = document.createElement("al-paths");
  el.hass = { callWS } as unknown as HomeAssistant;
  el.config = roomsConfig();
  document.body.append(el);
  await settle(el);
  return { el, callWS };
};
const select = async (el: AlPaths, id: string) => {
  el.shadowRoot!.querySelector<HTMLButtonElement>(`[data-room="${id}"]`)!.click();
  await settle(el);
};

describe("Paths page", () => {
  it("shows a room hierarchy without polling presence", async () => {
    const { el, callWS } = await mount();
    expect(el.shadowRoot?.querySelector("nav details")).toBeTruthy();
    expect(el.shadowRoot?.querySelectorAll("button.room")).toHaveLength(5);
    expect(callWS.mock.calls.map(([msg]) => msg.type)).toEqual(["activity_levels/topology"]);
  });

  it("selects a room with children without collapsing or duplicating its header", async () => {
    const { el } = await mount();
    const config = roomsConfig();
    const rooms = config.groups[0]!.children[0]!.children;
    const dining = rooms.splice(1, 1)[0]!;
    rooms[0]!.children.push(dining);
    el.config = config;
    await settle(el);
    const buttons = el.shadowRoot!.querySelectorAll('[data-room="kitchen"]');
    expect(buttons).toHaveLength(1);
    const branch = buttons[0]!.closest("details")!;
    expect(branch.open).toBe(true);
    await select(el, "kitchen");
    expect(branch.open).toBe(true);
    expect(buttons[0]!.getAttribute("aria-pressed")).toBe("true");
  });

  it("selects endpoints in the tree and lists routes", async () => {
    const { el, callWS } = await mount();
    await select(el, "kitchen");
    await select(el, "bedroom");
    expect(callWS).toHaveBeenLastCalledWith(expect.objectContaining({ from: "kitchen", to: "bedroom" }));
    expect(el.shadowRoot?.querySelector(".paths")?.textContent).toContain("Kitchen → Dining Room");
    expect(el.shadowRoot?.querySelector('[data-room="bedroom"]')?.getAttribute("aria-pressed")).toBe("true");
    expect(el.shadowRoot?.querySelector("al-graph-map")?.paths).toEqual(route);
  });

  it("shares map selections with the tree and ignores superseded route answers", async () => {
    let resolve!: (value: unknown) => void;
    const { el } = await mount(() => new Promise((done) => { resolve = done; }));
    await select(el, "kitchen");
    await select(el, "bedroom");
    expect(el.shadowRoot?.querySelector(".paths")?.textContent).toContain("Finding routes");
    el.shadowRoot?.querySelector("al-graph-map")?.dispatchEvent(new CustomEvent("al-map-select", { detail: { id: "bedroom" } }));
    await settle(el);
    resolve({ paths: route });
    await settle(el);
    expect(el.shadowRoot?.querySelector(".paths")?.textContent).toContain("Select two rooms");
    expect(el.shadowRoot?.querySelector("al-graph-map")?.paths).toEqual([]);
  });

  it("distinguishes an empty route result from a failed request", async () => {
    const { el } = await mount(() => ({ paths: [] }));
    await select(el, "bedroom");
    await select(el, "kitchen");
    expect(el.shadowRoot?.querySelector(".paths")?.textContent).toContain("No route");
    el.remove();
    const failed = await mount(() => { throw new Error("offline"); });
    await select(failed.el, "kitchen");
    await select(failed.el, "bedroom");
    expect(failed.el.shadowRoot?.querySelector("ha-alert")?.textContent).toContain("Could not load routes");
    expect(failed.el.shadowRoot?.querySelector(".paths")?.textContent).not.toContain("No route");
  });
});
