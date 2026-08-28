import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { HA_ELEMENTS } from "../src/ha-elements";
import type { MixerNav } from "../src/navigation";
import type { Config, ProfileState } from "../src/types";

// Registered before the panel module loads: `ensureHaElements` then returns without
// waiting, which is what a real Home Assistant frontend gives us.
for (const tag of HA_ELEMENTS) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

await import("../src/activity-levels-panel");
// Every element the shell binds properties to is registered here, so the bindings are
// exercised against the real components rather than against unknown tags.
await import("../src/al-tree");
await import("../src/al-mixer");
await import("../src/al-timeline");
await import("../src/al-strip-controls");
await import("../src/al-patterns");
await import("../src/al-presence");

const { alChange, alLiveRefresh, alNav, alRebuild, alSelect, alSimToggle, alTimelineRange } = await import(
  "../src/events"
);
const { newGroup, newStimulus } = await import("../src/model");
const { presenceConfig, roomsConfig } = await import("./fixtures");

type Panel = HTMLElement & { hass: unknown; updateComplete: Promise<boolean> };

const config = (): Config => ({
  version: 1,
  defaults: {
    envelope: "default",
    max_value: 5,
    precision: 1,
    unavailable: "hold",
    retrigger: "only_in_release",
    debounce: 0,
    safety_refresh: 60,
    min_wake_interval: 1,
  },
  envelopes: [],
  groups: [],
});

/** House › (a stimulus, Kitchen); enough for a bus, a channel and a sub-bus. */
const houseConfig = (): Config => ({
  ...config(),
  groups: [
    {
      ...newGroup("house", "structure"),
      name: "House",
      max_value: 8,
      stimuli: [newStimulus("binary_sensor.front_door")],
      children: [{ ...newGroup("kitchen", "area"), name: "Kitchen" }],
    },
  ],
});

const profileState = (): ProfileState => ({
  trained: true,
  ready: { house: true, kitchen: false },
  profile: {
    version: 1,
    producer: { name: "activity_levels", version: "0.4.0" },
    generated_at: 1_700_000_000,
    training_window: [1_699_000_000, 1_700_000_000],
    day_types: ["weekday"],
    slot_minutes: 15,
    groups: { house: { ready: true, days: 21, expected: {}, lights: {} } },
  },
});

/** What `config/validate` answers next; reset per test. */
let validateResult: { ok: boolean; errors: { path: string; message: string }[] } = { ok: true, errors: [] };
/** What `config/get` answers next; reset per test. */
let current: Config = config();
/** Which groups `config/get` says it had to guess a kind for; reset per test. */
let inferredIds: string[] = [];
/** What `config/get` says the document lost on the way in; reset per test. */
let configWarnings: string[] = [];
/** What `profile/rebuild` answers next. */
let rebuilt = true;
/** Set to make `profile/rebuild` fail. */
let rebuildError: Error | null = null;
/** Set to make every service call fail. */
let serviceError: Error | null = null;
/**
 * When set, `activity_levels/state` answers are held open and their resolvers pushed here,
 * so a test can have two polls in flight and answer them out of order.
 */
let liveGate: ((frame: unknown) => void)[] | null = null;

const hass = () => ({
  states: {},
  areas: {},
  entities: {},
  user: { is_admin: true, name: "Test" },
  language: "en",
  localize: (k: string) => k,
  callWS: vi.fn(async (msg: { type: string }) => {
    switch (msg.type) {
      case "activity_levels/config/get":
        return { config: current, inferred: inferredIds, warnings: configWarnings };
      case "activity_levels/config/validate":
      case "activity_levels/config/save":
        return validateResult;
      case "activity_levels/profile/get":
        return profileState();
      case "activity_levels/profile/rebuild":
        if (rebuildError) throw rebuildError;
        return { rebuilt };
      case "activity_levels/simulation/log":
        return { entries: [], active: {}, blocked: {} };
      // Enough for the Presence tab to draw itself; its own tests cover the shapes.
      case "activity_levels/topology":
        return { nodes: [], edges: [], exits: [] };
      case "activity_levels/presence/state":
        return { bermuda: true, enabled: true, devices: {}, occupants: {}, scanners: [], unmapped: [], disabled: [] };
      case "activity_levels/state":
        if (liveGate) return new Promise((resolve) => liveGate?.push(resolve));
        return { now: 1000, groups: {}, voices: {} };
      // Enough for the timeline to draw an empty chart; its own tests cover the shapes.
      case "activity_levels/timeseries":
        return { series: {}, forecast: null, day_types: [], lights: {}, plan: [] };
      default:
        return {};
    }
  }),
  callService: vi.fn(async () => {
    if (serviceError) throw serviceError;
    return undefined;
  }),
});

let el: Panel;

/** The panel loads its config in `connectedCallback`; settle that before asserting. */
const mount = async (cfg?: Config): Promise<void> => {
  current = cfg ?? config();
  document.body.innerHTML = "";
  el = document.createElement("activity-levels-panel") as Panel;
  el.hass = hass();
  document.body.appendChild(el);
  // The load, the profile and the first live frame each land a microtask apart.
  for (let i = 0; i < 8; i++) await el.updateComplete;
};

const tabs = (): HTMLButtonElement[] =>
  Array.from(el.shadowRoot?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);

/** Activates a tab the way a click does, and lets the tab's fetches settle. */
const selectTab = async (index: number): Promise<void> => {
  tabs()[index]?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
  for (let i = 0; i < 3; i++) await el.updateComplete;
};

const settle = async (): Promise<void> => {
  for (let i = 0; i < 5; i++) await el.updateComplete;
};

const wsCalls = (type: string): Record<string, unknown>[] =>
  (el.hass as { callWS: Mock }).callWS.mock.calls
    .map((call) => call[0] as Record<string, unknown>)
    .filter((msg) => msg.type === type);

const mixerNav = (): MixerNav => (el.shadowRoot?.querySelector("al-mixer") as unknown as { nav: MixerNav }).nav;

const press = async (key: string): Promise<void> => {
  el.shadowRoot?.querySelector('[role="tablist"]')?.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, composed: true }),
  );
  await el.updateComplete;
  await el.updateComplete;
};

beforeEach(async () => {
  validateResult = { ok: true, errors: [] };
  inferredIds = [];
  configWarnings = [];
  rebuilt = true;
  rebuildError = null;
  serviceError = null;
  liveGate = null;
  localStorage.clear();
  await mount();
});

describe("activity-levels-panel tabs", () => {
  it("is a tablist of six tabs, the Mixer selected", () => {
    expect(el.shadowRoot?.querySelector('[role="tablist"]')).toBeTruthy();
    expect(tabs().map((t) => t.textContent?.trim())).toEqual([
      "Mixer",
      "Groups",
      "Envelopes",
      "Defaults",
      "Patterns",
      "Presence",
    ]);
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual([
      "true",
      "false",
      "false",
      "false",
      "false",
      "false",
    ]);
    expect(tabs().map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1", "-1"]);
    expect(el.shadowRoot?.querySelector('[role="tabpanel"]')).toBeTruthy();
    // The default config here has no groups yet, so the Mixer tab shows the empty-state
    // card rather than a mixer with nothing to mix.
    expect(el.shadowRoot?.querySelector("al-mixer")).toBeNull();
  });

  it("moves the roving tabindex with the arrow keys without switching tabs", async () => {
    await press("ArrowRight");
    expect(tabs().map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "0", "-1", "-1", "-1", "-1"]);
    expect(tabs()[0]?.getAttribute("aria-selected")).toBe("true");
    expect(el.shadowRoot?.activeElement).toBe(tabs()[1]);
  });

  it("wraps around at both ends", async () => {
    await press("ArrowLeft");
    expect(tabs()[5]?.getAttribute("tabindex")).toBe("0");
    await press("ArrowRight");
    expect(tabs()[0]?.getAttribute("tabindex")).toBe("0");
  });

  it("activates the focused tab on Enter and on Space", async () => {
    await press("ArrowRight");
    await press("Enter");
    expect(tabs()[1]?.getAttribute("aria-selected")).toBe("true");
    expect(el.shadowRoot?.querySelector("al-tree")).toBeTruthy();
    await press("ArrowRight");
    await press(" ");
    expect(tabs()[2]?.getAttribute("aria-selected")).toBe("true");
    expect(el.shadowRoot?.querySelector("al-envelopes")).toBeTruthy();
  });

  it("activates a tab on click", async () => {
    await selectTab(4);
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual([
      "false",
      "false",
      "false",
      "false",
      "true",
      "false",
    ]);
    expect(tabs()[4]?.getAttribute("tabindex")).toBe("0");
    expect(el.shadowRoot?.querySelector("al-patterns")).toBeTruthy();
  });
});

describe("activity-levels-panel mixer empty state", () => {
  it("offers a card that sends the user to Groups instead of a mixer with nothing to mix", async () => {
    expect(el.shadowRoot?.querySelector("al-timeline")).toBeNull();
    expect(el.shadowRoot?.querySelector("al-strip-controls")).toBeNull();
    const button = el.shadowRoot?.querySelector<HTMLElement>(".mixer-empty ha-button");
    expect(button?.textContent?.trim()).toBe("Go to Groups");
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await settle();
    expect(tabs()[1]?.getAttribute("aria-selected")).toBe("true");
    expect(el.shadowRoot?.querySelector("al-tree")).toBeTruthy();
  });

  it("shows the real mixer again once a group exists", async () => {
    await mount(houseConfig());
    expect(el.shadowRoot?.querySelector(".mixer-empty")).toBeNull();
    expect(el.shadowRoot?.querySelector("al-mixer")).toBeTruthy();
  });
});

describe("activity-levels-panel mixer timeline wiring", () => {
  it("hands the timeline the profile state and the configured minimum training days", async () => {
    await mount({
      ...houseConfig(),
      defaults: { ...houseConfig().defaults, patterns: { min_days: 30 } },
    });
    await settle();
    const timeline = el.shadowRoot?.querySelector("al-timeline") as unknown as {
      profileState: unknown;
      minDays: number;
    };
    expect(timeline.profileState).toMatchObject({ trained: true });
    expect(timeline.minDays).toBe(30);
  });

  it("falls back to 14 minimum days when the config names none", async () => {
    await mount(houseConfig());
    const timeline = el.shadowRoot?.querySelector("al-timeline") as unknown as { minDays: number };
    expect(timeline.minDays).toBe(14);
  });
});

describe("activity-levels-panel mixer sim state", () => {
  const simState = (): unknown =>
    (el.shadowRoot?.querySelector("al-mixer") as unknown as { simState: unknown }).simState;

  // The Mixer re-renders on every live poll; a fresh object each time would re-render
  // every strip with it for nothing.
  it("hands the mixer the same object while nothing it is derived from has changed", async () => {
    await mount(houseConfig());
    const first = simState();
    expect(first).toMatchObject({ house: { blocked: null }, kitchen: { blocked: null } });
    (el as unknown as { requestUpdate: () => void }).requestUpdate();
    await settle();
    expect(simState()).toBe(first);
  });
});

describe("activity-levels-panel notices", () => {
  it("offers a first property when there are none", async () => {
    await selectTab(1);
    const tree = el.shadowRoot?.querySelector("al-tree");
    const button = tree?.shadowRoot?.querySelector("ha-button");
    expect(button?.textContent?.trim()).toBe("Add your first property");
  });
});

describe("activity-levels-panel validation errors", () => {
  const tree = (): (HTMLElement & { errors?: unknown[] }) | null => el.shadowRoot?.querySelector("al-tree") ?? null;

  /** An edit arriving from the tree, exactly as the tree dispatches it. */
  const change = async (structural?: true): Promise<void> => {
    tree()?.dispatchEvent(alChange({ ...config(), groups: [newGroup("x", "area")] }, undefined, structural));
    await el.updateComplete;
  };

  const save = async (): Promise<void> => {
    const buttons = el.shadowRoot?.querySelectorAll<HTMLElement>("ha-button");
    buttons?.[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    for (let i = 0; i < 5; i++) await el.updateComplete;
  };

  it("clears errors on a structural edit but keeps them on a field edit", async () => {
    await selectTab(1);
    validateResult = { ok: false, errors: [{ path: "groups/0", message: "bad" }] };
    await change();
    await save();
    expect(tree()?.errors).toHaveLength(1);
    await change();
    expect(tree()?.errors).toHaveLength(1);
    await change(true);
    expect(tree()?.errors).toHaveLength(0);
  });
});

describe("activity-levels-panel shared selection", () => {
  it("leaves an unselected editor pane unselected after an edit", async () => {
    await selectTab(1);
    const placeholder = (): string | undefined => el.shadowRoot?.querySelector("ha-card span.muted")?.textContent?.trim();
    expect(placeholder()).toBe("Select a group or stimulus.");
    el.shadowRoot
      ?.querySelector("al-tree")
      ?.dispatchEvent(alChange({ ...config(), groups: [newGroup("x", "area")] }, undefined, true));
    await settle();
    expect(placeholder()).toBe("Select a group or stimulus.");
    await selectTab(0);
    expect(mixerNav()).toEqual({ expanded: new Set(), selection: null });
  });

  it("starts with every root open and the first one selected", async () => {
    await mount(houseConfig());
    expect(mixerNav()).toEqual({ expanded: new Set(["house"]), selection: ["groups", 0] });
  });

  it("keeps a stimulus selected when the tree picks one", async () => {
    await mount(houseConfig());
    await selectTab(1);
    el.shadowRoot?.querySelector("al-tree")?.dispatchEvent(alSelect(["groups", 0, "stimuli", 0]));
    await settle();
    await selectTab(0);
    expect(mixerNav()).toEqual({ expanded: new Set(["house"]), selection: ["groups", 0, "stimuli", 0] });
  });

  it("opens whatever the mixer row needs open to show a node the tree selected", async () => {
    await mount(houseConfig());
    // Collapse the root, then pick something underneath it in the tree.
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alNav({ type: "toggle", id: "house" }));
    await settle();
    expect(mixerNav().expanded).toEqual(new Set());
    await selectTab(1);
    el.shadowRoot?.querySelector("al-tree")?.dispatchEvent(alSelect(["groups", 0, "children", 0]));
    await settle();
    await selectTab(0);
    expect(mixerNav()).toEqual({
      expanded: new Set(["house"]),
      selection: ["groups", 0, "children", 0],
    });
  });

  it("hands the selected group to the timeline, with its limiter", async () => {
    await mount(houseConfig());
    const timeline = el.shadowRoot?.querySelector("al-timeline") as unknown as {
      groupId: string | null;
      heading: string;
      maxValue: number;
    };
    expect(timeline.groupId).toBe("house");
    expect(timeline.heading).toBe("House");
    expect(timeline.maxValue).toBe(8);
    // The element is registered in this file, so the binding reached a live timeline and
    // came out the other side as the toolbar heading.
    const chart = el.shadowRoot?.querySelector("al-timeline") as HTMLElement;
    expect(chart.shadowRoot?.querySelector(".title")?.textContent?.trim()).toBe("House");
  });
});

describe("activity-levels-panel mixer expansion", () => {
  it("remembers what the row was left open at", async () => {
    await mount(houseConfig());
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alNav({ type: "toggle", id: "house" }));
    await settle();
    expect(JSON.parse(localStorage.getItem("activity_levels.mixer.expanded") ?? "null")).toEqual([]);
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alNav({ type: "toggle", id: "kitchen" }));
    await settle();
    expect(JSON.parse(localStorage.getItem("activity_levels.mixer.expanded") ?? "null")).toEqual(["kitchen"]);
  });

  it("opens the row the way it was left", async () => {
    localStorage.setItem("activity_levels.mixer.expanded", JSON.stringify(["kitchen", "attic"]));
    await mount(houseConfig());
    expect(mixerNav().expanded).toEqual(new Set(["kitchen"]));
  });

  it("starts from every root open when the stored expansion is unreadable", async () => {
    localStorage.setItem("activity_levels.mixer.expanded", "{not json");
    await mount(houseConfig());
    expect(mixerNav().expanded).toEqual(new Set(["house"]));
  });

  // Opening the row to reveal what the tree picked is a change to the expansion like any
  // other; leaving it unwritten meant the row closed itself again on the next reload.
  it("remembers what it had to open to show a node the tree selected", async () => {
    await mount(houseConfig());
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alNav({ type: "toggle", id: "house" }));
    await settle();
    expect(JSON.parse(localStorage.getItem("activity_levels.mixer.expanded") ?? "null")).toEqual([]);
    await selectTab(1);
    el.shadowRoot?.querySelector("al-tree")?.dispatchEvent(alSelect(["groups", 0, "children", 0]));
    await settle();
    expect(JSON.parse(localStorage.getItem("activity_levels.mixer.expanded") ?? "null")).toEqual(["house"]);
  });

  it("leaves the stored expansion alone when the row already shows what was selected", async () => {
    await mount(houseConfig());
    await selectTab(1);
    el.shadowRoot?.querySelector("al-tree")?.dispatchEvent(alSelect(["groups", 0, "children", 0]));
    await settle();
    expect(localStorage.getItem("activity_levels.mixer.expanded")).toBeNull();
  });

  it("does not write the expansion back for a move that only changed the selection", async () => {
    await mount(houseConfig());
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alNav({ type: "select", path: ["groups", 0] }));
    await settle();
    expect(localStorage.getItem("activity_levels.mixer.expanded")).toBeNull();
  });
});

describe("activity-levels-panel live frame", () => {
  const treeLive = (): unknown => (el.shadowRoot?.querySelector("al-tree") as unknown as { live: unknown }).live;

  it("drops the last frame when leaving the Mixer with Live off, rather than showing it as live", async () => {
    await selectTab(1);
    expect(treeLive()).toBeNull();
  });

  // A command's refresh lands on top of the periodic poll, so two are routinely in
  // flight; the older answer describes a mixer that has already moved on.
  it("keeps the newest frame when an older poll answers after it", async () => {
    await mount(houseConfig());
    const mixerLive = (): { now: number } | null =>
      (el.shadowRoot?.querySelector("al-mixer") as unknown as { live: { now: number } | null }).live;
    const pending: ((frame: unknown) => void)[] = [];
    liveGate = pending;
    const mixer = el.shadowRoot?.querySelector("al-mixer");
    mixer?.dispatchEvent(alLiveRefresh());
    await settle();
    mixer?.dispatchEvent(alLiveRefresh());
    await settle();
    expect(pending).toHaveLength(2);
    pending[1]?.({ now: 2000, groups: {}, voices: {} });
    await settle();
    expect(mixerLive()?.now).toBe(2000);
    pending[0]?.({ now: 1000, groups: {}, voices: {} });
    await settle();
    expect(mixerLive()?.now).toBe(2000);
  });

  it("keeps the frame when Live is on", async () => {
    await selectTab(1);
    const sw = el.shadowRoot?.querySelector("ha-switch") as (HTMLElement & { checked?: boolean }) | null;
    if (sw) sw.checked = true;
    sw?.dispatchEvent(new Event("change"));
    await settle();
    await selectTab(0);
    await selectTab(1);
    expect(treeLive()).not.toBeNull();
  });
});

describe("activity-levels-panel timeline settings", () => {
  it("restores the persisted range, horizon and toggles", async () => {
    localStorage.setItem(
      "activity_levels.timeline",
      JSON.stringify({ range: "30d", horizon: "off", showChannels: false, showLights: false }),
    );
    await mount(houseConfig());
    const timeline = el.shadowRoot?.querySelector("al-timeline") as unknown as {
      range: string;
      horizon: string;
      showChannels: boolean;
      showLights: boolean;
    };
    expect(timeline.range).toBe("30d");
    expect(timeline.horizon).toBe("off");
    expect(timeline.showChannels).toBe(false);
    expect(timeline.showLights).toBe(false);
  });

  it("persists what the toolbar settles on", async () => {
    await mount(houseConfig());
    el.shadowRoot
      ?.querySelector("al-timeline")
      ?.dispatchEvent(alTimelineRange({ range: "24h", horizon: "7d", showChannels: false, showLights: true }));
    await settle();
    expect(JSON.parse(localStorage.getItem("activity_levels.timeline") ?? "{}")).toEqual({
      range: "24h",
      horizon: "7d",
      showChannels: false,
      showLights: true,
    });
  });

  it("ignores unreadable stored settings", async () => {
    localStorage.setItem("activity_levels.timeline", "{not json");
    await mount(houseConfig());
    const timeline = el.shadowRoot?.querySelector("al-timeline") as unknown as { range: string };
    expect(timeline.range).toBe("7d");
  });
});

describe("activity-levels-panel patterns", () => {
  it("toggles a group's presence simulation through its switch entity", async () => {
    await mount(houseConfig());
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alSimToggle("kitchen", true));
    await settle();
    expect((el.hass as { callService: Mock }).callService).toHaveBeenCalledWith("switch", "turn_on", {
      entity_id: "switch.kitchen_presence_simulation",
    });
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alSimToggle("kitchen", false));
    await settle();
    expect((el.hass as { callService: Mock }).callService).toHaveBeenCalledWith("switch", "turn_off", {
      entity_id: "switch.kitchen_presence_simulation",
    });
  });

  it("fetches the profile for the Mixer tab and hands it to the controls row", async () => {
    await mount(houseConfig());
    expect(wsCalls("activity_levels/profile/get")).toHaveLength(1);
    const controls = el.shadowRoot?.querySelector("al-strip-controls") as unknown as {
      profileState: ProfileState | null;
    };
    expect(controls.profileState?.trained).toBe(true);
  });

  it("rebuilds the profile and refetches it", async () => {
    await mount(houseConfig());
    const before = wsCalls("activity_levels/profile/get").length;
    el.shadowRoot?.querySelector("al-strip-controls")?.dispatchEvent(alRebuild(true));
    await settle();
    expect(wsCalls("activity_levels/profile/rebuild")).toEqual([
      { type: "activity_levels/profile/rebuild", force: true },
    ]);
    expect(wsCalls("activity_levels/profile/get").length).toBe(before + 1);
    expect(el.shadowRoot?.querySelector("ha-alert")?.textContent).toContain("Profile rebuilt");
  });

  it("says so when the rebuild was skipped", async () => {
    rebuilt = false;
    await mount(houseConfig());
    el.shadowRoot?.querySelector("al-strip-controls")?.dispatchEvent(alRebuild());
    await settle();
    expect(el.shadowRoot?.querySelector("ha-alert")?.textContent).toContain("Rebuild skipped");
  });

  it("says when the simulation switch would not move", async () => {
    serviceError = new Error("no such switch");
    await mount(houseConfig());
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alSimToggle("kitchen", true));
    await settle();
    expect(el.shadowRoot?.querySelector("ha-alert")?.textContent).toContain(
      "Could not start the simulation for kitchen: no such switch",
    );
  });

  it("says when the rebuild itself failed", async () => {
    rebuildError = new Error("busy");
    await mount(houseConfig());
    el.shadowRoot?.querySelector("al-strip-controls")?.dispatchEvent(alRebuild());
    await settle();
    expect(el.shadowRoot?.querySelector("ha-alert")?.textContent).toContain("Could not rebuild the profile: busy");
  });

  it("polls the simulation log while the Mixer tab is open", async () => {
    await mount(houseConfig());
    expect(wsCalls("activity_levels/simulation/log").length).toBe(1);
    await selectTab(2);
    vi.useFakeTimers();
    try {
      await vi.advanceTimersByTimeAsync(30_000);
      expect(wsCalls("activity_levels/simulation/log").length).toBe(1);
      await selectTab(4);
      expect(wsCalls("activity_levels/simulation/log").length).toBe(2);
      await vi.advanceTimersByTimeAsync(10_000);
      expect(wsCalls("activity_levels/simulation/log").length).toBe(3);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("activity-levels-panel runtime commands", () => {
  it("polls a fresh live frame the moment the mixer asks for one", async () => {
    await mount(houseConfig());
    const before = wsCalls("activity_levels/state").length;
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alLiveRefresh());
    await settle();
    expect(wsCalls("activity_levels/state").length).toBe(before + 1);
  });
});

describe("activity-levels-panel live view", () => {
  const polls = (): number => wsCalls("activity_levels/state").length;

  const setVisibility = (value: string): void => {
    Object.defineProperty(document, "visibilityState", { value, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  };

  /** Flip the Live switch the way the toolbar does. */
  const toggleLive = async (on: boolean): Promise<void> => {
    const sw = el.shadowRoot?.querySelector("ha-switch") as (HTMLElement & { checked?: boolean }) | null;
    expect(sw, "missing ha-switch").toBeTruthy();
    if (sw) sw.checked = on;
    sw?.dispatchEvent(new Event("change"));
    await el.updateComplete;
  };

  it("polls on a timer, pauses while the tab is hidden, and resumes when it comes back", async () => {
    await selectTab(1);
    vi.useFakeTimers();
    try {
      const base = polls();
      await toggleLive(true);
      expect(polls()).toBe(base + 1);
      await vi.advanceTimersByTimeAsync(2000);
      expect(polls()).toBe(base + 2);
      setVisibility("hidden");
      await vi.advanceTimersByTimeAsync(6000);
      expect(polls()).toBe(base + 2);
      setVisibility("visible");
      await el.updateComplete;
      expect(polls()).toBe(base + 3);
      await vi.advanceTimersByTimeAsync(2000);
      expect(polls()).toBe(base + 4);
      await toggleLive(false);
      await vi.advanceTimersByTimeAsync(6000);
      expect(polls()).toBe(base + 4);
    } finally {
      setVisibility("visible");
      vi.useRealTimers();
    }
  });

  it("polls while the Mixer tab is open whatever the Live toggle says", async () => {
    await selectTab(1);
    vi.useFakeTimers();
    try {
      const base = polls();
      await vi.advanceTimersByTimeAsync(6000);
      expect(polls()).toBe(base);
      await selectTab(0);
      expect(polls()).toBe(base + 1);
      await vi.advanceTimersByTimeAsync(2000);
      expect(polls()).toBe(base + 2);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("activity-levels-panel presence tab", () => {
  it("always lists the Presence tab, whether presence is on or off", async () => {
    await mount(houseConfig());
    expect(tabs().map((t) => t.textContent?.trim())).toEqual([
      "Mixer",
      "Groups",
      "Envelopes",
      "Defaults",
      "Patterns",
      "Presence",
    ]);

    await mount(presenceConfig());
    expect(tabs().map((t) => t.textContent?.trim())).toEqual([
      "Mixer",
      "Groups",
      "Envelopes",
      "Defaults",
      "Patterns",
      "Presence",
    ]);
    await selectTab(5);
    expect(el.shadowRoot?.querySelector("al-presence")).toBeTruthy();
  });

  it("stays on the Presence tab, with the tablist unchanged, when an undo turns presence off", async () => {
    await mount(roomsConfig());
    await selectTab(1);
    el.shadowRoot?.querySelector("al-tree")?.dispatchEvent(alChange(presenceConfig()));
    await settle();
    await selectTab(5);
    expect(el.shadowRoot?.querySelector("al-presence")).toBeTruthy();

    el.shadowRoot
      ?.querySelector('ha-icon-button[title="Undo"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await settle();
    expect(tabs()).toHaveLength(6);
    expect(tabs().filter((t) => t.getAttribute("tabindex") === "0")).toHaveLength(1);
    expect(el.shadowRoot?.querySelector(".tab.active")?.textContent?.trim()).toBe("Presence");
    expect(el.shadowRoot?.querySelector("al-presence")).toBeTruthy();
  });

  it("stays on the Presence tab, showing the setup card, when presence is turned off mid-edit", async () => {
    await mount(presenceConfig());
    await selectTab(5);
    const off = structuredClone(presenceConfig());
    off.presence!.enabled = false;
    el.shadowRoot?.querySelector("al-presence")?.dispatchEvent(alChange(off));
    await settle();
    expect(tabs().map((t) => t.textContent?.trim())).toEqual([
      "Mixer",
      "Groups",
      "Envelopes",
      "Defaults",
      "Patterns",
      "Presence",
    ]);
    expect(el.shadowRoot?.querySelector(".tab.active")?.textContent?.trim()).toBe("Presence");
    const presence = el.shadowRoot?.querySelector("al-presence");
    expect(presence).toBeTruthy();
    expect(presence?.shadowRoot?.querySelector(".setup")).toBeTruthy();
  });
});

describe("activity-levels-panel inferred kinds", () => {
  const warning = (): HTMLElement | null =>
    el.shadowRoot?.querySelector<HTMLElement>("ha-alert.inferred-notice") ?? null;

  it("says so, once, when the loader had to guess the kinds", async () => {
    inferredIds = ["groups/0", "groups/0/children/0"];
    await mount(houseConfig());
    const banner = warning()!;
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("inferred");
    expect(banner.textContent).toContain("2 groups");
    expect(el.shadowRoot?.querySelector(".inferred-fix")).toBeTruthy();
  });

  it("counts one group as one group", async () => {
    inferredIds = ["groups/0"];
    await mount(houseConfig());
    expect(warning()?.textContent).toContain("1 group has");
  });

  it("says nothing when every kind came from the document", async () => {
    await mount(houseConfig());
    expect(warning()).toBeNull();
  });

  it("shows what the document lost, apart from the count of guesses", async () => {
    inferredIds = ["groups/0"];
    configWarnings = ["groups/0: 'kitchen' declares doors but is a root group."];
    await mount(houseConfig());
    const lost = el.shadowRoot?.querySelector<HTMLElement>("ha-alert.config-warnings");
    expect(lost).toBeTruthy();
    expect(lost!.textContent).toContain("declares doors but is a root group");
    // the two notices are separate: one counts guesses, the other quotes the document
    expect(warning()!.textContent).toContain("1 group has");
    expect(warning()!.textContent).not.toContain("declares doors");
  });

  it("says nothing about what was lost when nothing was", async () => {
    await mount(houseConfig());
    expect(el.shadowRoot?.querySelector("ha-alert.config-warnings")).toBeNull();
  });

  it("shows the first guess: the Groups tab, with that group selected", async () => {
    inferredIds = ["groups/0/children/0"];
    await mount(houseConfig());
    el.shadowRoot?.querySelector<HTMLElement>(".inferred-fix")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, composed: true }),
    );
    await settle();
    expect(tabs()[1]?.getAttribute("aria-selected")).toBe("true");
    const tree = el.shadowRoot?.querySelector("al-tree") as unknown as { selection: unknown };
    expect(tree.selection).toEqual(["groups", 0, "children", 0]);
  });

  it("clears the notice once the guesses have been saved", async () => {
    inferredIds = ["groups/0"];
    await mount(houseConfig());
    expect(warning()).toBeTruthy();
    // The save writes the kinds, so the reload that follows it reads a document with
    // nothing left to guess - which is the moment the notice has done its job.
    const edited = houseConfig();
    edited.groups[0]!.name = "Home";
    el.shadowRoot?.querySelector("al-mixer")?.dispatchEvent(alChange(edited));
    await settle();
    inferredIds = [];
    const save = Array.from(el.shadowRoot?.querySelectorAll("ha-button") ?? []).find(
      (b) => b.textContent?.trim() === "Save",
    );

    vi.useFakeTimers();
    try {
      save?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
      await vi.advanceTimersByTimeAsync(2000);
      for (let k = 0; k < 5; k++) await el.updateComplete;
      expect(warning()).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
