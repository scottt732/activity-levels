import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-mixer";
import { newGroup, newStimulus } from "../src/model";
import { initialNav, reduce } from "../src/navigation";
import type { AlMixer } from "../src/al-mixer";
import type { AlMasterStrip } from "../src/al-master-strip";
import type { AlStrip } from "../src/al-strip";
import type { AlChangeEvent } from "../src/events";
import type { MixerNav, NavAction } from "../src/navigation";
import type { Config, GroupLive, HomeAssistant } from "../src/types";

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

/** Property > (House > den, Garage, Outside): four tracks with the row fully open. */
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

let wsError: Error | null = null;
/** What `level/set` answers with, when the engine lands somewhere other than the ask. */
let levelResult: number | null = null;

const hassStub = (states: Record<string, { state: string; attributes?: Record<string, unknown> }> = {}): HomeAssistant =>
  ({
    states: Object.fromEntries(
      Object.entries(states).map(([entity_id, s]) => [
        entity_id,
        { entity_id, state: s.state, attributes: s.attributes ?? {}, last_changed: "" },
      ]),
    ),
    callWS: vi.fn(async (msg: { type: string; value?: number; muted?: boolean }) => {
      if (wsError) throw wsError;
      if (msg.type === "activity_levels/level/set" && levelResult !== null) return { value: levelResult };
      return { value: msg.value ?? 0, muted: msg.muted ?? false };
    }),
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
  muted: false,
  ...over,
});

let el: AlMixer;
let config: Config;
let navs: NavAction[];
let changes: AlChangeEvent[];
let sims: { gid: string; on: boolean }[];
let refreshes: number;

/** Waits out the update *and* the focus move it schedules on the microtask queue. */
const settle = async (): Promise<void> => {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
};

/** Wires `al-nav` back into the nav prop, the way the panel shell does. */
const withNavReducer = (): void => {
  el.addEventListener("al-nav", (e) => {
    el.nav = reduce(el.nav, (e as CustomEvent<NavAction>).detail);
  });
};

const strips = (): AlStrip[] => [...(el.shadowRoot?.querySelectorAll<AlStrip>("al-strip") ?? [])];
const master = (): AlMasterStrip | null => el.shadowRoot?.querySelector<AlMasterStrip>("al-master-strip") ?? null;
const container = (): HTMLElement | null => el.shadowRoot?.querySelector<HTMLElement>(".strips") ?? null;
const labels = (): string[] => strips().map((s) => s.label);

const ws = (type: string): Record<string, unknown>[] =>
  (el.hass as unknown as { callWS: { mock: { calls: [Record<string, unknown>][] } } }).callWS.mock.calls
    .map((call) => call[0])
    .filter((msg) => msg.type === type);

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

/** A settled fader move, as the strip's own fader reports it. */
const drag = async (strip: AlStrip, value: number): Promise<void> => {
  const fader = strip.shadowRoot?.querySelector("al-fader");
  fader?.dispatchEvent(new CustomEvent("value-changed", { detail: { value, live: true } }));
  fader?.dispatchEvent(new CustomEvent("value-changed", { detail: { value, live: false } }));
  await settle();
};

afterEach(() => {
  vi.useRealTimers();
});

beforeEach(async () => {
  document.body.innerHTML = "";
  wsError = null;
  levelResult = null;
  config = houseConfig();
  navs = [];
  changes = [];
  sims = [];
  refreshes = 0;
  el = document.createElement("al-mixer");
  el.hass = hassStub({ "switch.property_presence_simulation": { state: "off" } });
  el.config = config;
  el.nav = initialNav(config);
  el.errors = [];
  el.addEventListener("al-nav", (e) => navs.push((e as CustomEvent<NavAction>).detail));
  el.addEventListener("al-change", (e) => changes.push(e as AlChangeEvent));
  el.addEventListener("al-sim-toggle", (e) => sims.push((e as CustomEvent<{ gid: string; on: boolean }>).detail));
  el.addEventListener("al-live-refresh", () => refreshes++);
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-mixer rendering", () => {
  it("draws one strip per visible track, roots open", () => {
    expect(labels()).toEqual(["Property", "House", "Garage", "outside"]);
    expect(strips().map((s) => s.depth)).toEqual([0, 1, 1, 1]);
    expect(strips().map((s) => s.hasChildren)).toEqual([true, true, false, false]);
    expect(strips().map((s) => s.childCount)).toEqual([3, 1, 0, 0]);
    expect(strips().map((s) => s.expanded)).toEqual([true, false, false, false]);
  });

  it("shows a group's children only while it is open", async () => {
    el.nav = { expanded: new Set(["property", "house"]), selection: ["groups", 0] };
    await el.updateComplete;
    expect(labels()).toEqual(["Property", "House", "den", "Garage", "outside"]);
    expect(strips().map((s) => s.depth)).toEqual([0, 1, 2, 1, 1]);
  });

  it("keeps a collapsed root's whole subtree out of the row", async () => {
    el.nav = { expanded: new Set(["house"]), selection: null };
    await el.updateComplete;
    expect(labels()).toEqual(["Property"]);
  });

  it("groups the strips for assistive technology", () => {
    expect(container()?.getAttribute("role")).toBe("group");
    expect(container()?.getAttribute("aria-label")).toBe("Mixer");
  });

  it("hands each strip its live level, ceiling, precision and mute", async () => {
    el.live = {
      now: 0,
      groups: {
        property: groupLive({ value: 3, real_value: 3, max_value: 8, precision: 2 }),
        house: groupLive({ value: 2, real_value: 0.5, max_value: 8, muted: true }),
      },
      voices: {},
    };
    await el.updateComplete;
    const [property, house, garage] = strips();
    expect(property?.value).toBe(3);
    expect(property?.maxValue).toBe(8);
    expect(property?.precision).toBe(2);
    expect(house?.realValue).toBe(0.5);
    expect(house?.muted).toBe(true);
    // No live entry: the config's own ceiling and precision, and a level of zero.
    expect(garage?.value).toBe(0);
    expect(garage?.maxValue).toBe(5);
    expect(garage?.precision).toBe(1);
    expect(garage?.muted).toBe(false);
  });

  it("prefers the group's own ceiling over the site default when there is no live frame", async () => {
    el.config = { ...config, groups: [{ ...config.groups[0]!, max_value: 12, precision: 3 }] };
    await el.updateComplete;
    expect(strips()[0]?.maxValue).toBe(12);
    expect(strips()[0]?.precision).toBe(3);
  });

  it("marks the selected strip and badges each subtree's problems", async () => {
    el.errors = [
      { path: "groups/0/children/0/stimuli/0/entity", message: "unknown entity" },
      { path: "groups/0/children/0/gain", message: "out of range" },
      { path: "groups/0/children/1", message: "no lights" },
    ];
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 1] };
    await el.updateComplete;
    expect(strips().map((s) => s.errors)).toEqual([3, 2, 1, 0]);
    expect(strips().map((s) => s.selected)).toEqual([false, false, true, false]);
  });

  it("passes narrow down to every strip", async () => {
    expect(strips()[0]?.hasAttribute("narrow")).toBe(false);
    el.narrow = true;
    await el.updateComplete;
    expect(strips().every((s) => s.hasAttribute("narrow"))).toBe(true);
    expect(master()?.hasAttribute("narrow")).toBe(true);
  });

  it("says so rather than drawing a row when there is nothing configured", async () => {
    el.config = { ...config, groups: [] };
    await el.updateComplete;
    expect(strips()).toHaveLength(0);
    expect(master()).toBeNull();
    expect(el.shadowRoot?.textContent).toContain("Nothing to mix");
    el.config = undefined;
    await el.updateComplete;
    expect(el.shadowRoot?.textContent).toContain("Nothing to mix");
  });
});

describe("al-mixer master strip", () => {
  it("follows the selected group", async () => {
    expect(master()?.label).toBe("PROPERTY");
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    expect(master()?.label).toBe("HOUSE");
    expect(master()?.mix).toBe("sum");
    expect(master()?.maxValue).toBe(5);
    expect(master()?.precision).toBe(1);
    expect(master()?.simEntityId).toBe("switch.house_presence_simulation");
  });

  it("follows the group that owns a selected stimulus", async () => {
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 0, "stimuli", 0] };
    await el.updateComplete;
    expect(master()?.label).toBe("HOUSE");
  });

  it("renders empty with nothing selected", async () => {
    el.nav = { expanded: new Set(["property"]), selection: null };
    await el.updateComplete;
    expect(master()).toBeNull();
    expect(strips()).toHaveLength(4);
  });

  it("renders empty when the selection no longer names a group", async () => {
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 9] };
    await el.updateComplete;
    expect(master()).toBeNull();
  });

  it("shows the selected group's live level against its own ceiling", async () => {
    el.live = { now: 0, groups: { property: groupLive({ value: 3, max_value: 8, gated: true }) }, voices: {} };
    await el.updateComplete;
    expect(master()?.live).toEqual({ value: 3, max: 8, gated: true });
  });
});

describe("al-mixer navigation", () => {
  it("selects the strip that was clicked", async () => {
    await clickIn(strips()[2]!, ".name");
    expect(navs).toEqual([{ type: "select", path: ["groups", 0, "children", 1] }]);
  });

  it("toggles the track whose chevron was clicked, without selecting it", async () => {
    await clickIn(strips()[1]!, ".chevron");
    expect(navs).toEqual([{ type: "toggle", id: "house" }]);
  });

  // The master follows the selection; it is not the selection. Outlining it too drew a
  // second focus ring, and a tab stop of its own put two of them in a row that is meant
  // to be one.
  it("leaves the row's single tab stop and its outline on the track that is selected", async () => {
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    // Shadow content is not matched here, so this is the row itself: strips and master.
    expect([...(container()?.querySelectorAll('[tabindex="0"]') ?? [])]).toEqual([strips()[1]]);
    expect(master()?.getAttribute("tabindex")).toBe("-1");
    expect(master()?.hasAttribute("selected")).toBe(false);
    expect(strips()[1]?.hasAttribute("selected")).toBe(true);
    // what it does say is which bus it is following
    expect(master()?.label).toBe("HOUSE");
  });

  it("keeps the master's own controls reachable while it follows the selection", async () => {
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    await master()?.updateComplete;
    expect(
      [...(master()?.shadowRoot?.querySelectorAll("select, input") ?? [])].map((n) => n.getAttribute("tabindex")),
    ).toEqual(["0", "0"]);
  });

  it("selects the group itself when the master strip is clicked", async () => {
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    master()?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await settle();
    expect(navs).toEqual([{ type: "select", path: ["groups", 0, "children", 0] }]);
  });

  // jsdom has no scrollIntoView at all, which is exactly why the mixer calls it optionally.
  it("scrolls the selected strip into view", async () => {
    const seen: { on: unknown; arg: unknown }[] = [];
    const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
    expect(proto.scrollIntoView).toBeUndefined();
    proto.scrollIntoView = function (this: HTMLElement, arg?: unknown) {
      seen.push({ on: this, arg });
    };
    try {
      el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 1] };
      await settle();
      expect(seen).toEqual([{ on: strips()[2], arg: { inline: "nearest", block: "nearest" } }]);
    } finally {
      delete proto.scrollIntoView;
    }
  });

  it("selects without scrolling or throwing where there is nothing to scroll", async () => {
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 1] };
    await settle();
    expect(strips()[2]?.getAttribute("tabindex")).toBe("0");
  });
});

describe("al-mixer keyboard", () => {
  beforeEach(() => withNavReducer());

  it("walks the visible row with the arrow keys and wraps", async () => {
    expect(el.nav.selection).toEqual(["groups", 0]);
    await press("ArrowRight");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 0]);
    await press("ArrowRight");
    await press("ArrowRight");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 2]);
    await press("ArrowRight");
    expect(el.nav.selection).toEqual(["groups", 0]);
    await press("ArrowLeft");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 2]);
  });

  it.each(["Enter", " "])("opens and closes the selected track on %o", async (key) => {
    await press("ArrowRight");
    await press(key);
    expect(el.nav.expanded.has("house")).toBe(true);
    expect(labels()).toEqual(["Property", "House", "den", "Garage", "outside"]);
    await press(key);
    expect(el.nav.expanded.has("house")).toBe(false);
    expect(labels()).toEqual(["Property", "House", "Garage", "outside"]);
  });

  it("does nothing on Enter for a track with no children", async () => {
    await press("ArrowRight");
    await press("ArrowRight");
    navs.length = 0;
    await press("Enter");
    expect(navs).toEqual([]);
  });

  it("does nothing on Enter with nothing selected", async () => {
    el.nav = { expanded: new Set(["property"]), selection: null };
    await el.updateComplete;
    await press("Enter");
    expect(navs).toEqual([]);
  });

  it("jumps to the first and last visible track with Home and End", async () => {
    await press("End");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 2]);
    await press("Home");
    expect(el.nav.selection).toEqual(["groups", 0]);
  });

  it("keeps the tab stop on the selected strip and follows it with focus", async () => {
    expect(strips().map((s) => s.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1"]);
    await press("ArrowRight");
    expect(strips().map((s) => s.getAttribute("tabindex"))).toEqual(["-1", "0", "-1", "-1"]);
    expect(el.shadowRoot?.activeElement).toBe(strips()[1]);
  });

  it("keeps the whole strip out of the tab order, controls included, until it is selected", async () => {
    const stops = (host: AlStrip): number => (host.shadowRoot?.querySelectorAll('[tabindex="0"]') ?? []).length;
    const slider = (host: AlStrip): Element | null | undefined =>
      host.shadowRoot?.querySelector("al-fader")?.shadowRoot?.querySelector('[role="slider"]');
    const house = strips()[1]!;
    await house.updateComplete;
    expect(stops(house)).toBe(0);
    expect(slider(house)?.getAttribute("tabindex")).toBe("-1");
    await press("ArrowRight");
    await house.updateComplete;
    await house.shadowRoot?.querySelector("al-fader")?.updateComplete;
    expect(house.shadowRoot?.querySelector(".chevron")?.getAttribute("tabindex")).toBe("0");
    expect(house.shadowRoot?.querySelector(".mute")?.getAttribute("tabindex")).toBe("0");
    expect(slider(house)?.getAttribute("tabindex")).toBe("0");
    expect(stops(strips()[2]!)).toBe(0);
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

  it.each(["Backspace", "ArrowRight", "ArrowLeft", "Home", "End", "Enter", " "])(
    "leaves %o typed into the limiter box to the limiter box",
    async (key) => {
      const ev = await typeInto(".limiter", key);
      expect(navs).toEqual([]);
      expect(el.nav).toEqual(initialNav(config));
      expect(ev.defaultPrevented).toBe(false);
    },
  );

  it.each(["ArrowRight", "ArrowLeft", "Home", "End", " "])(
    "leaves %o typed into the mix selector to the mix selector",
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

describe("al-mixer runtime commands", () => {
  it("sends a dragged level to the engine and asks for a live frame", async () => {
    await drag(strips()[1]!, 3.5);
    expect(ws("activity_levels/level/set")).toEqual([
      { type: "activity_levels/level/set", group_id: "house", value: 3.5 },
    ]);
    expect(refreshes).toBe(1);
    // A level override is runtime state, never a config edit.
    expect(changes).toEqual([]);
  });

  /** What the fader on a strip is showing right now. */
  const shown = async (strip: AlStrip): Promise<number | undefined> => {
    await strip.updateComplete;
    return strip.shadowRoot?.querySelector("al-fader")?.value;
  };

  it("shows the level the engine reached rather than the one that was asked for", async () => {
    // A MAX group cannot be pulled below its loudest child: the answer comes back higher.
    levelResult = 4.2;
    const house = strips()[1]!;
    await drag(house, 1);
    expect(await shown(house)).toBe(4.2);
  });

  it("lets the fader go when a level override does not land", async () => {
    wsError = new Error("not loaded");
    const house = strips()[1]!;
    await drag(house, 3.5);
    expect(el.shadowRoot?.querySelector(".command-error")?.textContent?.trim()).toBe(
      "Could not set the level of house: not loaded",
    );
    expect(await shown(house)).toBe(0);
  });

  it("hands each strip the live frame's own stamp, so an unchanged level still answers", async () => {
    el.live = { now: 1234, groups: { house: groupLive({ value: 2 }) }, voices: {} };
    await el.updateComplete;
    expect(strips().map((s) => s.liveNow)).toEqual([1234, 1234, 1234, 1234]);
  });

  it("mutes and unmutes the strip's own group", async () => {
    await clickIn(strips()[2]!, ".mute");
    expect(ws("activity_levels/mute")).toEqual([
      { type: "activity_levels/mute", group_id: "garage", muted: true },
    ]);
    expect(refreshes).toBe(1);
  });

  it("resets the strip's own group", async () => {
    await clickIn(strips()[0]!, ".reset");
    expect(ws("activity_levels/reset")).toEqual([{ type: "activity_levels/reset", group_id: "property" }]);
    expect(refreshes).toBe(1);
  });

  it("says so when a command does not land, and does not claim a fresh frame", async () => {
    wsError = new Error("not loaded");
    await clickIn(strips()[1]!, ".mute");
    const alert = el.shadowRoot?.querySelector(".command-error");
    expect(alert?.textContent?.trim()).toBe("Could not mute house: not loaded");
    expect(alert?.getAttribute("alert-type")).toBe("error");
    expect(refreshes).toBe(0);
  });

  it("clears the notice once a command lands again", async () => {
    wsError = new Error("not loaded");
    await clickIn(strips()[1]!, ".mute");
    expect(el.shadowRoot?.querySelector(".command-error")).toBeTruthy();
    wsError = null;
    await clickIn(strips()[1]!, ".reset");
    expect(el.shadowRoot?.querySelector(".command-error")).toBeFalsy();
  });

  it("lets the notice be dismissed", async () => {
    wsError = new Error("not loaded");
    await clickIn(strips()[1]!, ".mute");
    el.shadowRoot?.querySelector(".command-error")?.dispatchEvent(new Event("alert-dismissed-clicked"));
    await settle();
    expect(el.shadowRoot?.querySelector(".command-error")).toBeFalsy();
  });

  it("takes the notice down again on its own", async () => {
    // The notice has to be raised under the fake clock for its own timer to be on it, so
    // the click is dispatched by hand rather than through `settle`'s real timeout.
    vi.useFakeTimers();
    try {
      wsError = new Error("not loaded");
      strips()[1]
        ?.shadowRoot?.querySelector(".mute")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
      await vi.advanceTimersByTimeAsync(0);
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector(".command-error")).toBeTruthy();
      await vi.advanceTimersByTimeAsync(10_000);
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector(".command-error")).toBeFalsy();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("al-mixer edits", () => {
  beforeEach(async () => {
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
  });

  it("writes the master's mix onto the selected group", async () => {
    const select = master()?.shadowRoot?.querySelector<HTMLSelectElement>(".mix");
    if (select) select.value = "max";
    select?.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    const next = changes[0]!.detail;
    expect(next.groups[0]?.children[0]?.mix).toBe("max");
    // Everything the edit did not touch is shared with the config it came from.
    expect(next.defaults).toBe(config.defaults);
    expect(next.groups[0]?.children[1]).toBe(config.groups[0]?.children[1]);
  });

  it("writes the master's limiter onto the selected group's ceiling", async () => {
    const input = master()?.shadowRoot?.querySelector<HTMLInputElement>(".limiter");
    if (input) input.value = "9";
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    expect(changes[0]?.detail.groups[0]?.children[0]?.max_value).toBe(9);
    expect(changes[0]?.coalesceKey).toBe("groups/0/children/0:limiter");
  });
});

describe("al-mixer simulation", () => {
  it("hides the ⏻ for a group with no lights and shows it once there are some", async () => {
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

  it("asks the shell to toggle presence simulation for the selected group", async () => {
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

describe("al-mixer track resolution", () => {
  it("ignores a strip event that does not come from a strip", async () => {
    for (const type of ["al-select-strip", "al-toggle-strip", "al-reset"]) {
      container()?.dispatchEvent(new CustomEvent(type, { detail: null, bubbles: true, composed: true }));
    }
    container()?.dispatchEvent(
      new CustomEvent("al-level-override", { detail: { value: 2 }, bubbles: true, composed: true }),
    );
    container()?.dispatchEvent(
      new CustomEvent("al-mute-toggle", { detail: { muted: true }, bubbles: true, composed: true }),
    );
    await settle();
    expect(navs).toEqual([]);
    expect(changes).toEqual([]);
    expect(refreshes).toBe(0);
  });

  it("does nothing without a Home Assistant connection to talk to", async () => {
    const nav: MixerNav = el.nav;
    el.hass = undefined;
    await el.updateComplete;
    await clickIn(strips()[0]!, ".reset");
    expect(refreshes).toBe(0);
    expect(el.nav).toBe(nav);
  });
});
