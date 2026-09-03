import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-presence";
import { PRESENCE_POLL_MS } from "../src/al-presence";
import { presenceConfig, roomsConfig } from "./fixtures";
import type { AlPresence, FormItem } from "../src/al-presence";
import type { AlChangeEvent } from "../src/events";
import type { Config, HomeAssistant, PresenceState, TopologyPayload } from "../src/types";

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

const SCOTT = {
  t: 1_700_000_000,
  room: "kitchen",
  confidence: 0.82,
  moving: false,
  candidates: { kitchen: 0.82, dining_room: 0.1 },
  path: ["dining_room", "kitchen"],
};

const presenceState = (over: Partial<PresenceState> = {}): PresenceState => ({
  bermuda: false,
  enabled: true,
  people: {
    Scott: {
      ...SCOTT,
      person: "person.scott",
      carried: { phone: 0.9, watch: 0.2 },
      device_rooms: { phone: "kitchen", watch: "dining_room" },
      devices: {
        phone: {
          name: "Phone",
          kind: "phone",
          tracker: "device_tracker.scotts_phone",
          companion: "device_tracker.scotts_iphone",
          room: "kitchen",
          confidence: 0.9,
          carried: 0.9,
          signals: { activity: "sensor.scotts_iphone_activity", steps: null, battery_state: null },
          found: { activity: true, steps: false, battery_state: false },
        },
        watch: {
          name: "Watch",
          kind: "watch",
          tracker: "device_tracker.scotts_watch",
          companion: null,
          room: "dining_room",
          confidence: 0.8,
          carried: 0.2,
          signals: { activity: null, steps: null, battery_state: null },
          found: { activity: false, steps: false, battery_state: false },
        },
      },
    },
  },
  devices: { Scott: SCOTT },
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
/** Holds the paths answer open, so a test can look at the page mid-request. */
let holdPaths = false;

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
          if (holdPaths) return new Promise(() => undefined);
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

const tab = async (
  over: Partial<PresenceState> = {},
  config: Config = presenceConfig(),
): Promise<{ el: AlPresence; calls: Call[] }> => {
  state = presenceState(over);
  document.body.innerHTML = "";
  el = document.createElement("al-presence") as AlPresence;
  el.hass = hassStub();
  el.config = config;
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
  holdPaths = false;
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

  it("lists a row per person with room, confidence and breadcrumb", async () => {
    const { el } = await tab();
    const row = el.shadowRoot!.querySelector("tr.person")!;
    expect(row.textContent).toContain("Scott");
    expect(row.textContent).toContain("Kitchen");
    expect(row.querySelector(".confidence")!.getAttribute("style")).toContain("82%");
    expect(norm(row.querySelector(".breadcrumb")!.textContent)).toContain("Dining Room → Kitchen");
  });

  it("draws a chip per device: carried percentage, and the room a parked one was left in", async () => {
    const { el } = await tab();
    const chips = el.shadowRoot!.querySelectorAll("tr.person .device-chip");
    expect(chips).toHaveLength(2);
    const phone = el.shadowRoot!.querySelector('.device-chip[data-device="phone"]')!;
    expect(phone.classList.contains("carried")).toBe(true);
    expect(norm(phone.textContent)).toBe("90%");
    expect(phone.querySelector("ha-icon")!.getAttribute("icon")).toBe("mdi:cellphone");
    const watch = el.shadowRoot!.querySelector('.device-chip[data-device="watch"]')!;
    expect(watch.classList.contains("parked")).toBe(true);
    expect(norm(watch.textContent)).toBe("20% Dining Room");
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

  it("waits for the answer before saying there is no route", async () => {
    const { el } = await tab();
    holdPaths = true;
    await select("kitchen");
    await select("bedroom");
    const paths = norm(el.shadowRoot!.querySelector(".paths")!.textContent);
    expect(paths).not.toContain("no route");
    expect(paths).toContain("Finding routes");
  });

  it("edits presence settings through the draft store", async () => {
    const { el } = await tab();
    const changed = listenFor<AlChangeEvent>(el, "al-change");
    el.shadowRoot!.querySelector("ha-form.presence-settings")!.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { threshold: 0.8, enabled: true } } }),
    );
    expect((await changed).detail.presence!.threshold).toBe(0.8);
  });

  it("edits the empty-room floor as presence.activity.floor", async () => {
    const { el } = await tab();
    const form = el.shadowRoot!.querySelector<HTMLElement & { schema: FormItem[]; data: Record<string, unknown> }>(
      "ha-form.presence-settings",
    )!;
    expect(form.schema.find((i) => i.name === "activity_floor")!.selector).toEqual({
      number: { min: 0.01, max: 1, step: 0.01, mode: "box" },
    });
    expect(form.data.activity_floor).toBe(0.05);
    const changed = listenFor<AlChangeEvent>(el, "al-change");
    form.dispatchEvent(new CustomEvent("value-changed", { detail: { value: { activity_floor: 0.2 } } }));
    const detail = (await changed).detail;
    expect(detail.presence!.activity).toEqual({ floor: 0.2 });
    expect(detail.presence!.floor).toBe(0.05);
  });

  it("edits the carried model as presence.carried, weights included", async () => {
    const { el } = await tab();
    const form = el.shadowRoot!.querySelector<HTMLElement & { schema: FormItem[]; data: Record<string, unknown> }>(
      "ha-form.presence-settings",
    )!;
    expect(form.schema.find((i) => i.name === "devices")).toBeUndefined();
    expect(form.data.carried_prior).toBe(0.7);
    expect(form.data.carried_charging).toBe(-3);
    expect(form.data.carried_flip).toEqual({ hours: 0, minutes: 5, seconds: 0 });
    const changed = listenFor<AlChangeEvent>(el, "al-change");
    form.dispatchEvent(new CustomEvent("value-changed", { detail: { value: { carried_charging: -5 } } }));
    const detail = (await changed).detail;
    expect(detail.presence!.carried.weights.charging).toBe(-5);
    expect(detail.presence!.carried.prior).toBe(0.7);
    const again = listenFor<AlChangeEvent>(el, "al-change");
    form.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { carried_flip: { hours: 0, minutes: 10, seconds: 0 } } } }),
    );
    expect((await again).detail.presence!.carried.flip).toBe(600);
  });

  it("hosts the people editor above the form", async () => {
    const { el } = await tab();
    const editor = el.shadowRoot!.querySelector("al-people-editor");
    expect(editor).toBeTruthy();
  });

  // The bounds are the ones PRESENCE_SCHEMA in schema.py enforces. A slider whose end
  // the backend rejects is worse than no slider: the save fails with a validation error
  // and the panel looks broken. `threshold` and `floor` are (0, 1]; `stay` is open at
  // both ends; `escape` is [0, 0.1]; `scale` is open at zero with no ceiling.
  it("bounds every number field to what the config schema accepts", async () => {
    const { el } = await tab();
    const form = el.shadowRoot!.querySelector<HTMLElement & { schema: FormItem[] }>("ha-form.presence-settings")!;
    const selectorFor = (name: string) => form.schema.find((i) => i.name === name)!.selector;
    expect(selectorFor("threshold")).toEqual({ number: { min: 0.01, max: 1, step: 0.01, mode: "slider" } });
    expect(selectorFor("stay")).toEqual({ number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } });
    expect(selectorFor("floor")).toEqual({ number: { min: 0.01, max: 1, step: 0.01, mode: "box" } });
    expect(selectorFor("escape")).toEqual({ number: { min: 0, max: 0.1, step: 0.001, mode: "box" } });
    expect(selectorFor("scale")).toEqual({ number: { min: 0.1, step: 0.1, mode: "box" } });
  });
});

describe("the setup card", () => {
  it("is the whole tab while presence is off", async () => {
    const { el } = await tab({ bermuda: true, enabled: false }, roomsConfig());
    expect(el.shadowRoot!.querySelector(".setup")).toBeTruthy();
    expect(el.shadowRoot!.querySelector("al-graph-map")).toBeNull();
    expect(el.shadowRoot!.querySelector('ha-card[header="People"]')).toBeNull();
    expect(el.shadowRoot!.querySelector(".setup")!.textContent).toContain(
      "which room each tracked device is in",
    );
    expect(el.shadowRoot!.querySelector(".setup")!.textContent).toContain("per-scanner distance sensors");
  });

  it("reports whether Bermuda was found", async () => {
    let { el } = await tab({ bermuda: true, enabled: false }, roomsConfig());
    expect(el.shadowRoot!.querySelector(".bermuda")!.textContent).toContain("Bermuda is installed");
    ({ el } = await tab({ bermuda: false, enabled: false }, roomsConfig()));
    expect(el.shadowRoot!.querySelector(".bermuda")!.textContent).toContain("Bermuda was not found");
    // discouraged, not forbidden: somebody may be installing it in another tab
    expect(el.shadowRoot!.querySelector(".enable ha-switch")!.hasAttribute("disabled")).toBe(false);
  });

  it("switches presence on through the ordinary config change", async () => {
    const { el } = await tab({ bermuda: true, enabled: false }, roomsConfig());
    const changed = listenFor<AlChangeEvent>(el, "al-change");
    el.shadowRoot!
      .querySelector(".enable ha-switch")!
      .dispatchEvent(new CustomEvent("change", { detail: {} }));
    expect((await changed).detail.presence!.enabled).toBe(true);
  });

  it("writes the device picker into the draft's people, keeping a selected person intact", async () => {
    const config = presenceConfig();
    const { el } = await tab({ bermuda: true, enabled: false }, { ...config, presence: { ...config.presence!, enabled: false } });
    const changed = listenFor<AlChangeEvent>(el, "al-change");
    el.shadowRoot!.querySelector(".setup-devices")!.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: ["device_tracker.scotts_phone", "device_tracker.erins_phone"] },
      }),
    );
    const people = (await changed).detail.presence!.people;
    expect(people).toHaveLength(2);
    expect(people[0]).toEqual(config.presence!.people[0]);
    expect(people[1]!.name).toBeNull();
    expect(people[1]!.devices.map((d) => d.tracker)).toEqual(["device_tracker.erins_phone"]);
    expect(people[1]!.devices[0]!.kind).toBe("other");
  });

  it("gives way to the real tab once presence is on", async () => {
    const { el } = await tab({ bermuda: true, enabled: true }, presenceConfig());
    expect(el.shadowRoot!.querySelector(".setup")).toBeNull();
    expect(el.shadowRoot!.querySelector("al-graph-map")).toBeTruthy();
  });
});
