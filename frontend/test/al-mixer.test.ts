import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-mixer";
import { newGroup, newStimulus } from "../src/model";
import { EDIT_KEY, initialNav, reduce } from "../src/navigation";
import type { AlMixer } from "../src/al-mixer";
import type { AlStrip } from "../src/al-strip";
import type { AlChangeEvent } from "../src/events";
import type { MixerNav, NavAction } from "../src/navigation";
import type { Config, GroupLive, HomeAssistant } from "../src/types";

const defaults: Config["defaults"] = {
  envelope: "default",
  max_value: 5,
  precision: 1,
  unavailable: "hold",
  retrigger: "release",
  stack: false,
  debounce: 0,
  safety_refresh: 60,
  min_wake_interval: 1,
};

const envelopes: Config["envelopes"] = [
  { id: "default", label: null, attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
];

/** Property > (House > den, Garage, Outside): four tracks with the row fully open. */
const houseConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes,
  groups: [
    {
      ...newGroup("property", "property"),
      name: "Property",
      mix: "sum",
      children: [
        {
          ...newGroup("house", "structure"),
          name: "House",
          gain: 2,
          stimuli: [{ ...newStimulus("binary_sensor.front_door"), gain: 3 }],
          children: [newGroup("den", "area")],
        },
        { ...newGroup("garage", "structure"), name: "Garage" },
        newGroup("outside", "outside"),
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
const container = (): HTMLElement | null => el.shadowRoot?.querySelector<HTMLElement>(".grid") ?? null;
const labels = (): string[] => strips().map((s) => s.label);
const bands = (): HTMLElement[] => [...(el.shadowRoot?.querySelectorAll<HTMLElement>(".band") ?? [])];
const tabs = (): HTMLElement[] => [...(el.shadowRoot?.querySelectorAll<HTMLElement>(".tab") ?? [])];
const textOf = (nodes: HTMLElement[]): string[] =>
  nodes.map((n) => n.querySelector(".label")?.textContent?.trim() ?? "");
/** Where a band, a tab or a strip was placed. jsdom parses no grid shorthands, so this
    reads the inline style the mixer wrote rather than a computed track. */
const placed = (node: HTMLElement | undefined): string => node?.getAttribute("style") ?? "";

/** Flips the mixer's own Edit switch, the way a click on it does. */
const setEditing = async (on: boolean): Promise<void> => {
  const sw = el.shadowRoot?.querySelector(".edit-switch");
  expect(sw, "missing edit switch").toBeTruthy();
  (sw as unknown as { checked: boolean }).checked = on;
  sw?.dispatchEvent(new Event("change", { bubbles: true }));
  await settle();
};

const ws = (type: string): Record<string, unknown>[] =>
  (el.hass as unknown as { callWS: { mock: { calls: [Record<string, unknown>][] } } }).callWS.mock.calls
    .map((call) => call[0])
    .filter((msg) => msg.type === type);

const clickIn = async (host: AlStrip, sel: string): Promise<void> => {
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
  localStorage.clear();
  wsError = null;
  levelResult = null;
  config = houseConfig();
  navs = [];
  changes = [];
  refreshes = 0;
  el = document.createElement("al-mixer");
  el.hass = hassStub({ "switch.property_presence_simulation": { state: "off" } });
  el.config = config;
  el.nav = initialNav(config);
  el.errors = [];
  el.addEventListener("al-nav", (e) => navs.push((e as CustomEvent<NavAction>).detail));
  el.addEventListener("al-change", (e) => changes.push(e as AlChangeEvent));
  el.addEventListener("al-live-refresh", () => refreshes++);
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-mixer rendering", () => {
  it("draws one strip per visible track, roots open", () => {
    expect(labels()).toEqual(["Property", "House", "Garage", "outside"]);
  });

  it("shows a group's children only while it is open", async () => {
    el.nav = { expanded: new Set(["property", "house"]), selection: ["groups", 0] };
    await el.updateComplete;
    expect(labels()).toEqual(["Property", "House", "den", "Garage", "outside"]);
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

  // Strip width is the grid's now, not the strip's: narrow is reflected so the column
  // template's --al-strip-w can be narrowed for the whole row at once.
  it("reflects narrow, which is what narrows the columns", async () => {
    expect(el.hasAttribute("narrow")).toBe(false);
    el.narrow = true;
    await el.updateComplete;
    expect(el.hasAttribute("narrow")).toBe(true);
    expect(placed(container() ?? undefined)).toContain("var(--al-strip-w)");
  });

  it("says so rather than drawing a row when there is nothing configured", async () => {
    el.config = { ...config, groups: [] };
    await el.updateComplete;
    expect(strips()).toHaveLength(0);
    expect(bands()).toEqual([]);
    expect(el.shadowRoot?.textContent).toContain("Nothing to mix");
    el.config = undefined;
    await el.updateComplete;
    expect(el.shadowRoot?.textContent).toContain("Nothing to mix");
  });
});

describe("al-mixer navigation", () => {
  it("selects the strip that was clicked", async () => {
    await clickIn(strips()[2]!, ".name");
    expect(navs).toEqual([{ type: "select", path: ["groups", 0, "children", 1] }]);
  });

  it("leaves the row's single strip tab stop and its outline on the track that is selected", async () => {
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    expect(strips().map((s) => s.getAttribute("tabindex"))).toEqual(["-1", "0", "-1", "-1"]);
    expect(strips()[1]?.hasAttribute("selected")).toBe(true);
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
    await setEditing(true);
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
    expect(house.shadowRoot?.querySelector(".mute")?.getAttribute("tabindex")).toBe("0");
    expect(slider(house)?.getAttribute("tabindex")).toBe("0");
    expect(stops(strips()[2]!)).toBe(0);
  });
});

describe("al-mixer runtime commands", () => {
  // Every one of these is an edit to what the engine is doing, so they only exist at all
  // once the Edit switch is on.
  beforeEach(async () => {
    await setEditing(true);
  });

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

describe("al-mixer track resolution", () => {
  it("ignores a strip event that does not come from a strip", async () => {
    for (const type of ["al-select-strip", "al-reset"]) {
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
    await setEditing(true);
    const nav: MixerNav = el.nav;
    el.hass = undefined;
    await el.updateComplete;
    await clickIn(strips()[0]!, ".reset");
    expect(refreshes).toBe(0);
    expect(el.nav).toBe(nav);
  });
});

describe("al-mixer bands", () => {
  // Property(1) House(2) [House's tab](3) Garage(4) outside(5), one band row above.
  it("brackets each open group over its own strip and its subtree", () => {
    expect(textOf(bands())).toEqual(["Property"]);
    expect(placed(bands()[0])).toBe("grid-column: 1 / 6; grid-row: 1;");
    expect(bands()[0]?.getAttribute("role")).toBe("group");
    expect(bands()[0]?.getAttribute("aria-label")).toBe("Property");
  });

  it("puts the strips on the row below every band", () => {
    expect(strips().map((n) => placed(n))).toEqual([
      "grid-column: 1; grid-row: 2;",
      "grid-column: 2; grid-row: 2;",
      "grid-column: 4; grid-row: 2;",
      "grid-column: 5; grid-row: 2;",
    ]);
  });

  it("steps a nested band up one row per level", async () => {
    el.nav = { expanded: new Set(["property", "house"]), selection: null };
    await el.updateComplete;
    expect(textOf(bands())).toEqual(["Property", "House"]);
    expect(placed(bands()[0])).toBe("grid-column: 1 / 6; grid-row: 1;");
    expect(placed(bands()[1])).toBe("grid-column: 2 / 4; grid-row: 2;");
    expect(strips().map((n) => placed(n))).toEqual([
      "grid-column: 1; grid-row: 3;",
      "grid-column: 2; grid-row: 3;",
      "grid-column: 3; grid-row: 3;",
      "grid-column: 4; grid-row: 3;",
      "grid-column: 5; grid-row: 3;",
    ]);
  });

  it("gives a group with no children no band of its own", async () => {
    el.nav = { expanded: new Set(["property", "house"]), selection: null };
    await el.updateComplete;
    // Garage, outside and den all have children of nobody: four of the five strips.
    expect(textOf(bands())).toEqual(["Property", "House"]);
  });

  it("labels the caret with what it will do", () => {
    const caret = bands()[0]?.querySelector(".caret");
    expect(caret?.getAttribute("aria-expanded")).toBe("true");
    expect(caret?.getAttribute("aria-label")).toBe("Collapse Property");
  });

  it("closes the band the caret was clicked on, without selecting anything", async () => {
    bands()[0]?.querySelector(".caret")?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await settle();
    expect(navs).toEqual([{ type: "toggle", id: "property" }]);
  });
});

describe("al-mixer collapsed bands", () => {
  it("stands a closed band on end, right of the group's own strip", () => {
    expect(textOf(tabs())).toEqual(["House"]);
    // Column 3 is the one immediately after House's strip; the strips' own row.
    expect(placed(tabs()[0])).toBe("grid-column: 3 / 4; grid-row: 2;");
    expect(tabs()[0]?.getAttribute("role")).toBe("button");
    expect(tabs()[0]?.getAttribute("aria-expanded")).toBe("false");
    expect(tabs()[0]?.getAttribute("aria-label")).toBe("Expand House");
  });

  it("opens the subtree again when it is clicked", async () => {
    withNavReducer();
    tabs()[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await settle();
    expect(el.nav.expanded.has("house")).toBe(true);
    expect(labels()).toEqual(["Property", "House", "den", "Garage", "outside"]);
    expect(tabs()).toEqual([]);
  });

  it.each(["Enter", " "])("opens it on %o, and does not toggle it twice", async (key) => {
    withNavReducer();
    const ev = new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true });
    tabs()[0]?.dispatchEvent(ev);
    await settle();
    expect(navs).toEqual([{ type: "toggle", id: "house" }]);
    expect(ev.defaultPrevented).toBe(true);
  });

  // The caret is a real button: the key press is already its click, so all the band has to
  // do is keep the row from hearing it as well.
  it.each(["Enter", " "])("keeps %o typed on a caret from reaching the row", async (key) => {
    bands()[0]
      ?.querySelector(".caret")
      ?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
    await settle();
    expect(navs).toEqual([]);
  });

  it("gives the band controls the tab stop only for the selected group", async () => {
    expect(bands()[0]?.querySelector(".caret")?.getAttribute("tabindex")).toBe("0");
    expect(tabs()[0]?.getAttribute("tabindex")).toBe("-1");
    el.nav = { expanded: new Set(["property"]), selection: ["groups", 0, "children", 0] };
    await el.updateComplete;
    expect(bands()[0]?.querySelector(".caret")?.getAttribute("tabindex")).toBe("-1");
    expect(tabs()[0]?.getAttribute("tabindex")).toBe("0");
  });
});

describe("al-mixer edit mode", () => {
  it("starts read-only, with no fader grip and no mute or reset", async () => {
    const house = strips()[1]!;
    await house.updateComplete;
    expect(strips().every((s) => s.editable === false)).toBe(true);
    expect(house.shadowRoot?.querySelector(".mute")).toBeFalsy();
    expect(house.shadowRoot?.querySelector(".reset")).toBeFalsy();
    await house.shadowRoot?.querySelector("al-fader")?.updateComplete;
    expect(house.shadowRoot?.querySelector("al-fader")?.shadowRoot?.querySelector('[role="slider"]')).toBeFalsy();
  });

  it("sends nothing to the engine from a fader move while it is read-only", async () => {
    await drag(strips()[1]!, 3.5);
    expect(ws("activity_levels/level/set")).toEqual([]);
    expect(refreshes).toBe(0);
  });

  it("hands the strips the console back, and remembers the switch", async () => {
    await setEditing(true);
    const house = strips()[1]!;
    await house.updateComplete;
    expect(strips().every((s) => s.editable)).toBe(true);
    expect(house.shadowRoot?.querySelector(".mute")).toBeTruthy();
    expect(localStorage.getItem(EDIT_KEY)).toBe("true");
    await setEditing(false);
    expect(strips().every((s) => s.editable === false)).toBe(true);
    expect(localStorage.getItem(EDIT_KEY)).toBe("false");
  });

  it("comes up in Edit mode when this browser left it there", async () => {
    localStorage.setItem(EDIT_KEY, "true");
    const other = document.createElement("al-mixer");
    other.config = config;
    other.nav = initialNav(config);
    document.body.appendChild(other);
    await other.updateComplete;
    expect(other.shadowRoot?.querySelector<AlStrip>("al-strip")?.editable).toBe(true);
  });

  it("still selects, walks and opens the row while it is read-only", async () => {
    withNavReducer();
    await clickIn(strips()[2]!, ".name");
    expect(el.nav.selection).toEqual(["groups", 0, "children", 1]);
    await press("Home");
    expect(el.nav.selection).toEqual(["groups", 0]);
    await press("Enter");
    expect(el.nav.expanded.has("property")).toBe(false);
  });
});
