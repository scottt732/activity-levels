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
await import("../src/al-tree");

const { alChange, alRebuild, alSelect, alSimToggle, alTimelineRange } = await import("../src/events");
const { newGroup, newStimulus } = await import("../src/model");

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
      ...newGroup("house"),
      name: "House",
      max_value: 8,
      stimuli: [newStimulus("binary_sensor.front_door")],
      children: [{ ...newGroup("kitchen"), name: "Kitchen" }],
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
/** What `profile/rebuild` answers next. */
let rebuilt = true;
/** Set to make `profile/rebuild` fail. */
let rebuildError: Error | null = null;
/** Set to make every service call fail. */
let serviceError: Error | null = null;

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
        return { config: current };
      case "activity_levels/config/validate":
        return validateResult;
      case "activity_levels/profile/get":
        return profileState();
      case "activity_levels/profile/rebuild":
        if (rebuildError) throw rebuildError;
        return { rebuilt };
      case "activity_levels/simulation/log":
        return { entries: [], active: {}, blocked: {} };
      case "activity_levels/state":
        return { now: 1000, groups: {}, voices: {} };
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
  rebuilt = true;
  rebuildError = null;
  serviceError = null;
  localStorage.clear();
  await mount();
});

describe("activity-levels-panel tabs", () => {
  it("is a tablist of five tabs, the Mixer selected", () => {
    expect(el.shadowRoot?.querySelector('[role="tablist"]')).toBeTruthy();
    expect(tabs().map((t) => t.textContent?.trim())).toEqual(["Mixer", "Groups", "Envelopes", "Defaults", "Patterns"]);
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false", "false", "false"]);
    expect(tabs().map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1"]);
    expect(el.shadowRoot?.querySelector('[role="tabpanel"]')).toBeTruthy();
    // The default config here has no groups yet, so the Mixer tab shows the empty-state
    // card rather than a mixer with nothing to mix.
    expect(el.shadowRoot?.querySelector("al-mixer")).toBeNull();
  });

  it("moves the roving tabindex with the arrow keys without switching tabs", async () => {
    await press("ArrowRight");
    expect(tabs().map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "0", "-1", "-1", "-1"]);
    expect(tabs()[0]?.getAttribute("aria-selected")).toBe("true");
    expect(el.shadowRoot?.activeElement).toBe(tabs()[1]);
  });

  it("wraps around at both ends", async () => {
    await press("ArrowLeft");
    expect(tabs()[4]?.getAttribute("tabindex")).toBe("0");
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
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "false", "false", "false", "true"]);
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

describe("activity-levels-panel notices", () => {
  it("offers a first group when there are none", async () => {
    await selectTab(1);
    const tree = el.shadowRoot?.querySelector("al-tree");
    const button = tree?.shadowRoot?.querySelector("ha-button");
    expect(button?.textContent?.trim()).toBe("Add your first group");
  });
});

describe("activity-levels-panel validation errors", () => {
  const tree = (): (HTMLElement & { errors?: unknown[] }) | null => el.shadowRoot?.querySelector("al-tree") ?? null;

  /** An edit arriving from the tree, exactly as the tree dispatches it. */
  const change = async (structural?: true): Promise<void> => {
    tree()?.dispatchEvent(alChange({ ...config(), groups: [newGroup("x")] }, undefined, structural));
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
  it("leaves an unselected editor pane unselected after an edit, and still moves the bus", async () => {
    await selectTab(1);
    const placeholder = (): string | undefined => el.shadowRoot?.querySelector("ha-card span.muted")?.textContent?.trim();
    expect(placeholder()).toBe("Select a group or stimulus.");
    el.shadowRoot
      ?.querySelector("al-tree")
      ?.dispatchEvent(alChange({ ...config(), groups: [newGroup("x")] }, undefined, true));
    await settle();
    expect(placeholder()).toBe("Select a group or stimulus.");
    await selectTab(0);
    expect(mixerNav()).toEqual({ busPath: ["groups", 0], selection: null });
  });

  it("starts on the first root bus", async () => {
    await mount(houseConfig());
    expect(mixerNav()).toEqual({ busPath: ["groups", 0], selection: ["groups", 0] });
  });

  it("moves the bus to the parent group when a stimulus is selected in the tree", async () => {
    await mount(houseConfig());
    await selectTab(1);
    el.shadowRoot?.querySelector("al-tree")?.dispatchEvent(alSelect(["groups", 0, "stimuli", 0]));
    await settle();
    await selectTab(0);
    expect(mixerNav()).toEqual({ busPath: ["groups", 0], selection: ["groups", 0, "stimuli", 0] });
  });

  it("shows a selected sub-bus as the master of its own bus", async () => {
    await mount(houseConfig());
    await selectTab(1);
    el.shadowRoot?.querySelector("al-tree")?.dispatchEvent(alSelect(["groups", 0, "children", 0]));
    await settle();
    await selectTab(0);
    expect(mixerNav()).toEqual({
      busPath: ["groups", 0, "children", 0],
      selection: ["groups", 0, "children", 0],
    });
  });

  it("hands the selected strip's bus to the timeline, with the bus limiter", async () => {
    await mount(houseConfig());
    const timeline = el.shadowRoot?.querySelector("al-timeline") as unknown as {
      groupId: string | null;
      title: string;
      maxValue: number;
    };
    expect(timeline.groupId).toBe("house");
    expect(timeline.title).toBe("House");
    expect(timeline.maxValue).toBe(8);
  });
});

describe("activity-levels-panel live frame", () => {
  const treeLive = (): unknown => (el.shadowRoot?.querySelector("al-tree") as unknown as { live: unknown }).live;

  it("drops the last frame when leaving the Mixer with Live off, rather than showing it as live", async () => {
    await selectTab(1);
    expect(treeLive()).toBeNull();
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
