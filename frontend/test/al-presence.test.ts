import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-presence";
import { PRESENCE_POLL_MS } from "../src/al-presence";
import { presenceConfig } from "./fixtures";
import type { AlPresence, FormItem } from "../src/al-presence";
import type { AlChangeEvent } from "../src/events";
import type { HomeAssistant, PresenceState, TopologyPayload } from "../src/types";

const TOPO: TopologyPayload = {
  nodes: ["kitchen", "dining_room", "hall", "bedroom", "back_patio"],
  edges: [
    ["kitchen", "dining_room", false],
    ["kitchen", "back_patio", false],
    ["dining_room", "hall", false],
    ["hall", "bedroom", true],
  ],
  exits: ["back_patio"],
};

const PATHS = [["kitchen", "dining_room", "hall", "bedroom"]];

const presenceState = (over: Partial<PresenceState> = {}): PresenceState => ({
  enabled: true,
  devices: {
    Scott: {
      t: 1_700_000_000,
      room: "kitchen",
      confidence: 0.82,
      moving: false,
      candidates: { kitchen: 0.82, dining_room: 0.1 },
      path: ["dining_room", "kitchen"],
    },
  },
  occupants: { kitchen: ["Scott"] },
  scanners: [
    { key: "aa", device_id: "d1", name: "kitchen scanner", area_id: "kitchen_area", group_id: "kitchen" },
  ],
  unmapped: [],
  disabled: [],
  ...over,
});

interface Call extends Record<string, unknown> {
  type: string;
}

let calls: Call[];
let state: PresenceState;

const hassStub = (): HomeAssistant =>
  ({
    states: {},
    areas: { kitchen_area: { area_id: "kitchen_area", name: "Kitchen Area" } },
    entities: {},
    language: "en",
    localize: (k: string) => k,
    callWS: vi.fn(async (msg: Call) => {
      calls.push(msg);
      switch (msg.type) {
        case "activity_levels/topology":
          return TOPO;
        case "activity_levels/presence/state":
          return state;
        case "activity_levels/topology/paths":
          // Hall reaches Bedroom through a one-way door, so there is no way back.
          return { paths: msg.from === "bedroom" ? [] : PATHS };
        default:
          return {};
      }
    }),
  }) as unknown as HomeAssistant;

let el: AlPresence;

const settle = async (): Promise<void> => {
  for (let i = 0; i < 6; i++) await el.updateComplete;
};

const tab = async (over: Partial<PresenceState> = {}): Promise<{ el: AlPresence; calls: Call[] }> => {
  state = presenceState(over);
  document.body.innerHTML = "";
  el = document.createElement("al-presence") as AlPresence;
  el.hass = hassStub();
  el.config = presenceConfig();
  el.errors = [];
  document.body.appendChild(el);
  await settle();
  return { el, calls };
};

const listenFor = <T extends Event>(node: HTMLElement, type: string): Promise<T> =>
  new Promise<T>((resolve) => node.addEventListener(type, (ev) => resolve(ev as T), { once: true }));

const select = async (id: string): Promise<void> => {
  el.shadowRoot!.querySelector("al-graph-map")!.dispatchEvent(
    new CustomEvent("al-map-select", { detail: { id }, bubbles: true, composed: true }),
  );
  await settle();
};

const norm = (s: string | null | undefined): string => (s ?? "").replace(/\s+/g, " ").trim();

beforeEach(() => {
  vi.useFakeTimers();
  calls = [];
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("al-presence", () => {
  it("fetches the topology and polls the state while connected", async () => {
    const { el, calls } = await tab();
    expect(calls.map((c) => c.type)).toContain("activity_levels/topology");
    expect(calls.map((c) => c.type)).toContain("activity_levels/presence/state");
    vi.advanceTimersByTime(PRESENCE_POLL_MS);
    await el.updateComplete;
    expect(calls.filter((c) => c.type === "activity_levels/presence/state")).toHaveLength(2);
    el.remove();
    vi.advanceTimersByTime(PRESENCE_POLL_MS * 3);
    expect(calls.filter((c) => c.type === "activity_levels/presence/state")).toHaveLength(2);
  });

  it("refetches the topology when the draft's adjacency changes", async () => {
    const { el, calls } = await tab();
    const before = calls.filter((c) => c.type === "activity_levels/topology").length;
    el.config = presenceConfig();
    await settle();
    expect(calls.filter((c) => c.type === "activity_levels/topology")).toHaveLength(before + 1);
  });

  it("lists a row per tracked device with room, confidence and breadcrumb", async () => {
    const { el } = await tab();
    const row = el.shadowRoot!.querySelector("tr.device")!;
    expect(row.textContent).toContain("Scott");
    expect(row.textContent).toContain("Kitchen");
    expect(row.querySelector(".confidence")!.getAttribute("style")).toContain("82%");
    expect(norm(row.querySelector(".breadcrumb")!.textContent)).toContain("Dining Room → Kitchen");
  });

  it("flags an unmapped scanner and a disabled sensor with the fix", async () => {
    const { el } = await tab({
      scanners: [{ key: "aa", device_id: "d1", name: "hall scanner", area_id: null, group_id: null }],
      unmapped: ["aa"],
      disabled: ["sensor.scotts_phone_distance_to_bedroom"],
    });
    expect(el.shadowRoot!.querySelector("tr.scanner.unmapped")!.textContent).toContain("Give it an area");
    expect(el.shadowRoot!.querySelector(".disabled-sensors")!.textContent).toContain("Enable");
  });

  it("asks for the paths between two selected rooms and lists them", async () => {
    const { el, calls } = await tab();
    await select("kitchen");
    await select("bedroom");
    expect(calls.at(-1)).toMatchObject({
      type: "activity_levels/topology/paths",
      from: "kitchen",
      to: "bedroom",
    });
    expect(norm(el.shadowRoot!.querySelector(".paths")!.textContent)).toContain("Kitchen → Dining Room");
  });

  it("says so when there is no route between the pair", async () => {
    const { el } = await tab();
    await select("bedroom");
    await select("kitchen");
    expect(norm(el.shadowRoot!.querySelector(".paths")!.textContent)).toContain("no route");
  });

  it("edits presence settings through the draft store", async () => {
    const { el } = await tab();
    const changed = listenFor<AlChangeEvent>(el, "al-change");
    el.shadowRoot!.querySelector("ha-form.presence-settings")!.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { threshold: 0.8, enabled: true } } }),
    );
    expect((await changed).detail.presence!.threshold).toBe(0.8);
  });

  it("keeps the name of a device that is still selected when the picker changes", async () => {
    const { el } = await tab();
    const changed = listenFor<AlChangeEvent>(el, "al-change");
    el.shadowRoot!.querySelector("ha-form.presence-settings")!.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: { devices: ["device_tracker.scotts_phone", "device_tracker.erins_phone"] } },
      }),
    );
    expect((await changed).detail.presence!.devices).toEqual([
      { device: "device_tracker.scotts_phone", name: "Scott" },
      { device: "device_tracker.erins_phone", name: null },
    ]);
  });

  it("filters the device picker to Bermuda device_trackers", async () => {
    const { el } = await tab();
    const form = el.shadowRoot!.querySelector<HTMLElement & { schema: FormItem[] }>("ha-form.presence-settings")!;
    const item = form.schema.find((i) => i.name === "devices")!;
    expect(item.selector).toEqual({
      entity: { multiple: true, filter: { domain: "device_tracker", integration: "bermuda" } },
    });
  });
});
