import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-mixer";
import { newGroup, newStimulus } from "../src/model";
import { initialNav, reduce } from "../src/navigation";
import type { AlMixer } from "../src/al-mixer";
import type { AlMasterStrip } from "../src/al-master-strip";
import type { AlStrip } from "../src/al-strip";
import type { AlChangeEvent } from "../src/events";
import type { NavAction } from "../src/navigation";
import type { Config, GroupLive, HomeAssistant, LiveState, VoiceLive } from "../src/types";

const defaults: Config["defaults"] = {
  envelope: "default",
  max_value: 5,
  precision: 1,
  unavailable: "hold",
  retrigger: "only_in_release",
  debounce: 0,
  safety_refresh: 60,
  min_wake_interval: 1,
};

const envelopes: Config["envelopes"] = [
  { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
];

/** Property > (House > front door + den, Garage, Outside): three channels and a MASTER. */
const houseConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes,
  groups: [
    {
      ...newGroup("property"),
      name: "Property",
      mix: "sum",
      children: [
        {
          ...newGroup("house"),
          name: "House",
          gain: 2,
          stimuli: [{ ...newStimulus("binary_sensor.front_door"), gain: 3 }],
          children: [newGroup("den")],
        },
        { ...newGroup("garage"), name: "Garage" },
        newGroup("outside"),
      ],
    },
  ],
});

const hassStub = (states: Record<string, { state: string; attributes?: Record<string, unknown> }>): HomeAssistant =>
  ({
    states: Object.fromEntries(
      Object.entries(states).map(([entity_id, s]) => [
        entity_id,
        { entity_id, state: s.state, attributes: s.attributes ?? {}, last_changed: "" },
      ]),
    ),
  }) as unknown as HomeAssistant;

const groupLive = (over: Partial<GroupLive> = {}): GroupLive => ({
  value: 0,
  real_value: 0,
  raw_value: 0,
  active: false,
  gated: false,
  active_voices: 0,
  last_activity: null,
  cooldown_at: null,
  contributors: {},
  name: "",
  parent_id: null,
  precision: 1,
  max_value: 5,
  mix: "sum",
  next_wake: null,
  lights: 0,
  ...over,
});

const voiceLive = (over: Partial<VoiceLive> = {}): VoiceLive => ({
  label: "binary_sensor.front_door",
  entity: "binary_sensor.front_door",
  phase: "sustain",
  value: 1,
  gain: 1,
  gate: true,
  phase_started: null,
  phase_ends: null,
  ...over,
});

let el: AlMixer;
let config: Config;
let navs: NavAction[];
let changes: AlChangeEvent[];
let sims: { gid: string; on: boolean }[];

/** Waits out the update *and* the focus move it schedules on the microtask queue. */
const settle = async (): Promise<void> => {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
};

/** Wires `al-nav` back into the nav prop, the way the panel shell will. */
const withNavReducer = (): void => {
  el.addEventListener("al-nav", (e) => {
    el.nav = reduce(el.nav, (e as CustomEvent<NavAction>).detail);
  });
};

const strips = (): AlStrip[] => [...(el.shadowRoot?.querySelectorAll<AlStrip>("al-strip") ?? [])];
const master = (): AlMasterStrip | null => el.shadowRoot?.querySelector<AlMasterStrip>("al-master-strip") ?? null;
const container = (): HTMLElement | null => el.shadowRoot?.querySelector<HTMLElement>(".strips") ?? null;

const clickIn = async (host: AlStrip | AlMasterStrip, sel: string): Promise<void> => {
  const node = host.shadowRoot?.querySelector(sel);
  expect(node, `missing ${sel}`).toBeTruthy();
  node?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
  await settle();
};

const press = async (key: string, from?: HTMLElement): Promise<void> => {
  (from ?? container())?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
  await settle();
};

beforeEach(async () => {
  document.body.innerHTML = "";
  config = houseConfig();
  navs = [];
  changes = [];
  sims = [];
  el = document.createElement("al-mixer");
  el.hass = hassStub({
    "binary_sensor.front_door": { state: "on", attributes: { friendly_name: "Front Door", icon: "mdi:door" } },
    "switch.property_presence_simulation": { state: "off" },
  });
  el.config = config;
  el.nav = initialNav(config);
  el.errors = [];
  el.addEventListener("al-nav", (e) => navs.push((e as CustomEvent<NavAction>).detail));
  el.addEventListener("al-change", (e) => changes.push(e as AlChangeEvent));
  el.addEventListener("al-sim-toggle", (e) => sims.push((e as CustomEvent<{ gid: string; on: boolean }>).detail));
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-mixer rendering", () => {
  it("shows the current bus's channels and the bus itself as MASTER", () => {
    expect(strips().map((s) => s.label)).toEqual(["House", "Garage", "outside"]);
    expect(strips().map((s) => s.kind)).toEqual(["bus", "bus", "bus"]);
    expect(strips().map((s) => s.sublabel)).toEqual(["bus · 2", "bus · 0", "bus · 0"]);
    expect(strips()[0]?.gain).toBe(2);
    expect(master()?.label).toBe("PROPERTY");
    expect(master()?.mix).toBe("sum");
    expect(master()?.maxValue).toBe(5);
    expect(master()?.precision).toBe(1);
    expect(master()?.simEntityId).toBe("switch.property_presence_simulation");
  });

  it("names the bus in a breadcrumb and disables 'up' at a root bus", () => {
    const crumbs = [...(el.shadowRoot?.querySelectorAll(".crumb") ?? [])];
    expect(crumbs.map((c) => c.textContent?.trim())).toEqual(["Property"]);
    expect(el.shadowRoot?.querySelector<HTMLButtonElement>(".up")?.disabled).toBe(true);
  });

  it("marks only the last breadcrumb as the current location", async () => {
    el.nav = { busPath: ["groups", 0, "children", 0], selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    const crumbs = [...(el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".crumb") ?? [])];
    expect(crumbs.map((c) => c.getAttribute("aria-current"))).toEqual([null, "location"]);
  });

  it("gives a bus channel no envelope to sketch — that is a channel strip's story", () => {
    expect(strips()[0]?.envelope).toBeNull();
  });

  it("groups the strips for assistive technology", () => {
    expect(container()?.getAttribute("role")).toBe("group");
    expect(container()?.getAttribute("aria-label")).toBe("Mixer");
  });

  it("renders stimulus channels from the entity's own state once a sub-bus is open", async () => {
    el.nav = { busPath: ["groups", 0, "children", 0], selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    const [stimulus, child] = strips();
    expect(stimulus?.kind).toBe("channel");
    expect(stimulus?.label).toBe("Front Door");
    expect(stimulus?.sublabel).toBe("on");
    expect(stimulus?.entityIcon).toBe("mdi:door");
    expect(stimulus?.gain).toBe(3);
    expect(stimulus?.envelope).toMatchObject({ attack: 0, release: 1800, impulse: false });
    expect(child?.label).toBe("den");
    expect(master()?.label).toBe("HOUSE");
  });

  it("falls back to the entity id and 'unknown' for a stimulus Home Assistant has never heard of", async () => {
    el.config = { ...config, groups: [{ ...config.groups[0]!, stimuli: [newStimulus("binary_sensor.ghost")] }] };
    await el.updateComplete;
    expect(strips()[0]?.label).toBe("binary_sensor.ghost");
    expect(strips()[0]?.sublabel).toBe("unknown");
    expect(strips()[0]?.entityIcon).toBeNull();
  });

  it("marks the selected strip and badges each subtree's problems", async () => {
    el.errors = [
      { path: "groups/0/children/0/stimuli/0/entity", message: "unknown entity" },
      { path: "groups/0/children/0/gain", message: "out of range" },
      { path: "groups/0/children/1", message: "no lights" },
    ];
    el.nav = { busPath: ["groups", 0], selection: ["groups", 0, "children", 1] };
    await el.updateComplete;
    expect(strips().map((s) => s.errors)).toEqual([2, 1, 0]);
    expect(strips().map((s) => s.selected)).toEqual([false, true, false]);
  });

  it("hands the strips their live level against the bus ceiling", async () => {
    const live: LiveState = {
      now: 0,
      groups: { property: groupLive({ value: 3, max_value: 8 }), house: groupLive({ value: 2, max_value: 8, gated: true }) },
      voices: {},
    };
    el.live = live;
    await el.updateComplete;
    expect(strips()[0]?.live).toEqual({ value: 2, max: 8, gated: true });
    expect(strips()[1]?.live).toBeNull();
    expect(master()?.live).toEqual({ value: 3, max: 8, gated: false });
  });

  it("matches a stimulus channel's voice by its label", async () => {
    el.nav = { busPath: ["groups", 0, "children", 0], selection: null };
    el.live = {
      now: 0,
      groups: { house: groupLive({ max_value: 4 }) },
      voices: { house: [voiceLive({ value: 0.5, gate: false })] },
    };
    await el.updateComplete;
    expect(strips()[0]?.live).toEqual({ value: 0.5, max: 4, gated: false });
  });

  it("passes narrow down to every strip", async () => {
    expect(strips()[0]?.hasAttribute("narrow")).toBe(false);
    el.narrow = true;
    await el.updateComplete;
    expect(strips().every((s) => s.hasAttribute("narrow"))).toBe(true);
    expect(master()?.hasAttribute("narrow")).toBe(true);
  });

  it("says so rather than mixing the config document itself when the nav has no bus", async () => {
    el.nav = { busPath: [], selection: null };
    await el.updateComplete;
    expect(strips()).toHaveLength(0);
    expect(master()).toBeNull();
    expect(el.shadowRoot?.textContent).toContain("No bus");
  });

  it("says so rather than rendering an empty bus when there is no config", async () => {
    el.config = undefined;
    await el.updateComplete;
    expect(strips()).toHaveLength(0);
    expect(master()).toBeNull();
    expect(el.shadowRoot?.textContent).toContain("No bus");
  });
});

describe("al-mixer multi-root breadcrumb", () => {
  /** Property (with its own tree) alongside a second root bus to switch to. */
  const twoRoots = (): Config => {
    const one = houseConfig();
    return { ...one, groups: [one.groups[0]!, { ...newGroup("shed"), name: "Shed" }] };
  };

  const rootSelect = (): HTMLSelectElement | null =>
    el.shadowRoot?.querySelector<HTMLSelectElement>("select.root") ?? null;

  const crumbButtons = (): string[] =>
    [...(el.shadowRoot?.querySelectorAll("button.crumb") ?? [])].map((c) => c.textContent?.trim() ?? "");

  it("offers no root selector when there is only one root bus", () => {
    expect(rootSelect()).toBeNull();
    expect(crumbButtons()).toEqual(["Property"]);
  });

  it("starts the breadcrumb with a selector over the root buses", async () => {
    el.config = twoRoots();
    await el.updateComplete;
    const select = rootSelect();
    expect([...(select?.options ?? [])].map((o) => o.textContent?.trim())).toEqual(["Property", "Shed"]);
    expect(select?.value).toBe("0");
    // The selector stands in for the root crumb rather than doubling it.
    expect(crumbButtons()).toEqual([]);
  });

  it("opens the root bus the selector was changed to", async () => {
    el.config = twoRoots();
    await el.updateComplete;
    const select = rootSelect();
    if (select) select.value = "1";
    select?.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    expect(navs).toEqual([{ type: "open", path: ["groups", 1] }]);
  });

  it("keeps the crumbs below the root and leaves up disabled at a root bus", async () => {
    el.config = twoRoots();
    el.nav = { busPath: ["groups", 1], selection: ["groups", 1] };
    await el.updateComplete;
    expect(rootSelect()?.value).toBe("1");
    expect(crumbButtons()).toEqual([]);
    expect(el.shadowRoot?.querySelector<HTMLButtonElement>(".up")?.disabled).toBe(true);
    el.nav = { busPath: ["groups", 0, "children", 0], selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    expect(rootSelect()?.value).toBe("0");
    expect(crumbButtons()).toEqual(["House"]);
    expect(el.shadowRoot?.querySelector<HTMLButtonElement>(".up")?.disabled).toBe(false);
  });
});

describe("al-mixer navigation", () => {
  it("opens the child bus a strip's 'open ▸' asks for", async () => {
    await clickIn(strips()[0]!, ".open");
    expect(navs).toEqual([{ type: "open", path: ["groups", 0, "children", 0] }]);
  });

  it("selects the strip that was clicked", async () => {
    await clickIn(strips()[1]!, ".name");
    expect(navs).toEqual([{ type: "select", path: ["groups", 0, "children", 1] }]);
  });

  it("selects the bus itself when the master strip is clicked", async () => {
    master()?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await settle();
    expect(navs).toEqual([{ type: "select", path: ["groups", 0] }]);
  });

  it("opens the bus a breadcrumb names", async () => {
    el.nav = { busPath: ["groups", 0, "children", 0], selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    const crumbs = [...(el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".crumb") ?? [])];
    expect(crumbs.map((c) => c.textContent?.trim())).toEqual(["Property", "House"]);
    crumbs[0]?.click();
    await settle();
    expect(navs).toEqual([{ type: "open", path: ["groups", 0] }]);
  });

  it("goes up from a sub-bus", async () => {
    el.nav = { busPath: ["groups", 0, "children", 0], selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    const up = el.shadowRoot?.querySelector<HTMLButtonElement>(".up");
    expect(up?.disabled).toBe(false);
    up?.click();
    await settle();
    expect(navs).toEqual([{ type: "up" }]);
  });
});

describe("al-mixer keyboard", () => {
  beforeEach(() => withNavReducer());

  it("cycles the selection right from the master through the channels and wraps", async () => {
    // `initialNav` lands on the bus itself, so the row starts with the master selected.
    expect(el.nav.selection).toEqual(["groups", 0]);
    await press("ArrowRight");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 0]);
    await press("ArrowRight");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 1]);
    await press("ArrowRight");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 2]);
    await press("ArrowRight");
    expect(el.nav.selection).toEqual(["groups", 0]);
    expect(master()?.hasAttribute("selected")).toBe(true);
  });

  it("cycles left the other way", async () => {
    await press("ArrowLeft");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 2]);
  });

  it("keeps the tab stop on the selected strip and follows it with focus", async () => {
    expect(strips().map((s) => s.getAttribute("tabindex"))).toEqual(["-1", "-1", "-1"]);
    expect(master()?.getAttribute("tabindex")).toBe("0");
    await press("ArrowRight");
    expect(strips().map((s) => s.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(master()?.getAttribute("tabindex")).toBe("-1");
    expect(el.shadowRoot?.activeElement).toBe(strips()[0]);
    await press("ArrowLeft");
    expect(master()?.getAttribute("tabindex")).toBe("0");
    expect(el.shadowRoot?.activeElement).toBe(master());
  });

  it("opens the selected bus on Enter and comes back up on Backspace", async () => {
    await press("ArrowRight");
    await press("Enter");
    expect(el.nav.busPath).toEqual(["groups", 0, "children", 0]);
    expect(strips().map((s) => s.label)).toEqual(["Front Door", "den"]);
    await press("Backspace");
    expect(el.nav.busPath).toEqual(["groups", 0]);
  });

  it("does nothing on Enter while the master itself is selected", async () => {
    await press("Enter");
    expect(navs).toEqual([]);
    expect(el.nav.busPath).toEqual(["groups", 0]);
  });

  it("does not open a stimulus channel on Enter", async () => {
    el.nav = { busPath: ["groups", 0, "children", 0], selection: ["groups", 0, "children", 0, "stimuli", 0] };
    await el.updateComplete;
    navs.length = 0;
    await press("Enter");
    expect(navs).toEqual([]);
  });

  it("stays put on Backspace at a root bus", async () => {
    await press("Backspace");
    expect(navs).toEqual([]);
    expect(el.nav.busPath).toEqual(["groups", 0]);
  });

  it("jumps to the first channel with Home and the master with End", async () => {
    await press("End");
    expect(el.nav.selection).toEqual(["groups", 0]);
    await press("Home");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 0]);
  });
});

describe("al-mixer keyboard and the master's own controls", () => {
  beforeEach(() => withNavReducer());

  /** The keydown a real browser fires from inside the master strip's shadow root. */
  const typeInto = async (sel: string, key: string): Promise<KeyboardEvent> => {
    const node = master()?.shadowRoot?.querySelector(sel);
    expect(node, `missing ${sel}`).toBeTruthy();
    const ev = new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true });
    node?.dispatchEvent(ev);
    await settle();
    return ev;
  };

  it.each(["Backspace", "ArrowRight", "ArrowLeft", "Home", "End", "Enter"])(
    "leaves %s typed into the limiter box to the limiter box",
    async (key) => {
      const ev = await typeInto(".limiter", key);
      expect(navs).toEqual([]);
      expect(el.nav).toEqual(initialNav(config));
      expect(ev.defaultPrevented).toBe(false);
    },
  );

  it.each(["Backspace", "ArrowRight", "ArrowLeft", "Home", "End"])(
    "leaves %s typed into the mix selector to the mix selector",
    async (key) => {
      const ev = await typeInto(".mix", key);
      expect(navs).toEqual([]);
      expect(el.nav).toEqual(initialNav(config));
      expect(ev.defaultPrevented).toBe(false);
    },
  );

  it("still navigates on a key from the strip itself", async () => {
    master()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true }));
    await settle();
    expect(el.nav.selection).toEqual(["groups", 0, "children", 0]);
  });
});

describe("al-mixer edits", () => {
  it("writes a fader move to the strip's gain, sharing everything it did not touch", async () => {
    const fader = strips()[0]?.shadowRoot?.querySelector("al-fader");
    fader?.dispatchEvent(new CustomEvent("value-changed", { detail: { value: 4, live: false } }));
    await settle();
    expect(changes).toHaveLength(1);
    const next = changes[0]!.detail;
    expect(next.groups[0]?.children[0]?.gain).toBe(4);
    expect(changes[0]!.coalesceKey).toBe("groups/0/children/0:gain");
    expect(next).not.toBe(config);
    expect(next.envelopes).toBe(config.envelopes);
    expect(next.defaults).toBe(config.defaults);
    expect(next.groups[0]?.children[1]).toBe(config.groups[0]?.children[1]);
    expect(next.groups[0]?.children[2]).toBe(config.groups[0]?.children[2]);
    expect(config.groups[0]?.children[0]?.gain).toBe(2);
  });

  it("reports the live moves of a drag under the same coalesce key", async () => {
    const fader = strips()[0]?.shadowRoot?.querySelector("al-fader");
    fader?.dispatchEvent(new CustomEvent("value-changed", { detail: { value: 4, live: true } }));
    fader?.dispatchEvent(new CustomEvent("value-changed", { detail: { value: 5, live: false } }));
    await settle();
    expect(changes.map((c) => c.detail.groups[0]?.children[0]?.gain)).toEqual([4, 5]);
    expect(new Set(changes.map((c) => c.coalesceKey))).toEqual(new Set(["groups/0/children/0:gain"]));
  });

  it("writes a stimulus fader move to the stimulus gain", async () => {
    el.nav = { busPath: ["groups", 0, "children", 0], selection: null };
    await el.updateComplete;
    const fader = strips()[0]?.shadowRoot?.querySelector("al-fader");
    fader?.dispatchEvent(new CustomEvent("value-changed", { detail: { value: 0.5, live: false } }));
    await settle();
    expect(changes[0]?.detail.groups[0]?.children[0]?.stimuli[0]?.gain).toBe(0.5);
  });

  it("writes the master's mix onto the current bus", async () => {
    const select = master()?.shadowRoot?.querySelector<HTMLSelectElement>(".mix");
    if (select) select.value = "max";
    select?.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    expect(changes[0]?.detail.groups[0]?.mix).toBe("max");
    expect(changes[0]?.detail.groups[0]?.children).toBe(config.groups[0]?.children);
  });

  it("writes the master's limiter onto the current bus's ceiling", async () => {
    const input = master()?.shadowRoot?.querySelector<HTMLInputElement>(".limiter");
    if (input) input.value = "9";
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    expect(changes[0]?.detail.groups[0]?.max_value).toBe(9);
  });
});

describe("al-mixer simulation", () => {
  it("hides the ⏻ for a bus with no lights and shows it once there are some", async () => {
    expect(master()?.lights).toBe(0);
    expect(master()?.shadowRoot?.querySelector("ha-switch")).toBeFalsy();
    el.live = { now: 0, groups: { property: groupLive({ lights: 4 }) }, voices: {} };
    await el.updateComplete;
    await master()?.updateComplete;
    expect(master()?.lights).toBe(4);
    expect(master()?.shadowRoot?.querySelector("ha-switch")).toBeTruthy();
  });

  it("takes the switch's own state and the shell's block reason", async () => {
    el.hass = hassStub({ "switch.property_presence_simulation": { state: "on" } });
    el.live = { now: 0, groups: { property: groupLive({ lights: 4 }) }, voices: {} };
    el.simState = { property: { blocked: "quiet hours" } };
    await el.updateComplete;
    expect(master()?.simOn).toBe(true);
    expect(master()?.blockedReason).toBe("quiet hours");
  });

  it("asks the shell to toggle presence simulation for the current bus", async () => {
    el.live = { now: 0, groups: { property: groupLive({ lights: 4 }) }, voices: {} };
    await el.updateComplete;
    await master()?.updateComplete;
    const sw = master()?.shadowRoot?.querySelector("ha-switch");
    (sw as unknown as { checked: boolean }).checked = true;
    sw?.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    expect(sims).toEqual([{ gid: "property", on: true }]);
    expect(changes).toHaveLength(0);
  });
});

describe("al-mixer path resolution", () => {
  it("ignores a strip event that does not come from a strip", async () => {
    container()?.dispatchEvent(new CustomEvent("al-select-strip", { detail: null, bubbles: true, composed: true }));
    container()?.dispatchEvent(new CustomEvent("al-open-strip", { detail: null, bubbles: true, composed: true }));
    container()?.dispatchEvent(
      new CustomEvent("al-gain-changed", { detail: { value: 2, live: false }, bubbles: true, composed: true }),
    );
    await settle();
    expect(navs).toEqual([]);
    expect(changes).toEqual([]);
  });
});
