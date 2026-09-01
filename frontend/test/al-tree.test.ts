import { beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-tree";
import { newGroup, newStimulus } from "../src/model";
import { kindsConfig } from "./fixtures";
import type { AlTree } from "../src/al-tree";
import type { AlChangeEvent } from "../src/events";
import type { Config, HomeAssistant, LiveState, Path } from "../src/types";

const baseConfig = (): Config => ({
  version: 1,
  defaults: {
    envelope: "default",
    max_value: 5,
    precision: 1,
    unavailable: "hold",
    retrigger: "release",
    stack: false,
    debounce: 0,
    safety_refresh: 60,
    min_wake_interval: 1,
  },
  envelopes: [
    { id: "default", label: null, attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
  ],
  groups: [{ ...newGroup("house", "structure"), stimuli: [newStimulus("binary_sensor.motion")] }],
});

let el: AlTree;
let config: Config;
let changes: Config[];
let changeEvents: AlChangeEvent[];
let selects: (Path | null)[];

beforeEach(async () => {
  document.body.innerHTML = "";
  localStorage.clear();
  config = baseConfig();
  changes = [];
  changeEvents = [];
  selects = [];
  el = document.createElement("al-tree");
  el.config = config;
  el.errors = [];
  el.addEventListener("al-change", (e) => {
    changes.push((e as CustomEvent<Config>).detail);
    changeEvents.push(e as AlChangeEvent);
  });
  el.addEventListener("al-select", (e) => selects.push((e as CustomEvent<Path | null>).detail));
  document.body.appendChild(el);
  await el.updateComplete;
});

const click = async (selector: string): Promise<void> => {
  const node = el.shadowRoot?.querySelector(selector);
  expect(node, `missing ${selector}`).toBeTruthy();
  node?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
  await el.updateComplete;
};

const rows = (): HTMLElement[] => [...(el.shadowRoot?.querySelectorAll<HTMLElement>(".row") ?? [])];
const rowFor = (path: string): HTMLElement =>
  rows().find((r) => r.dataset.path === path) ?? (expect.fail(`no row ${path}`) as never);

/** Opens a row's caret, the only thing that expands one. */
const expand = async (path: string): Promise<void> => {
  rowFor(path).querySelector<HTMLElement>(".caret")!.click();
  await el.updateComplete;
};

/**
 * A DataTransfer that lies the way a real one does: the *type list* is readable throughout
 * the drag, but the data behind it is only readable during `dragstart` and `drop`. Every
 * other event sees the drag data store in protected mode, where `getData` returns "".
 */
const dragEvent = (type: string, data: Record<string, string>, clientY = 0): DragEvent => {
  const store = new Map(Object.entries(data));
  const readable = type === "dragstart" || type === "drop";
  const dataTransfer = {
    effectAllowed: "move",
    dropEffect: "move",
    get types(): string[] {
      return [...store.keys()];
    },
    setData: (k: string, v: string) => void store.set(k, v),
    getData: (k: string) => (readable ? (store.get(k) ?? "") : ""),
    setDragImage: () => undefined,
  } as unknown as DataTransfer;
  const ev = new MouseEvent(type, { bubbles: true, composed: true, cancelable: true, clientY }) as DragEvent;
  Object.defineProperty(ev, "dataTransfer", { value: dataTransfer });
  return ev;
};

describe("al-tree", () => {
  it("adds a root group without mutating the current config", async () => {
    const before = JSON.stringify(config);
    await click("ha-button");
    expect(changes).toHaveLength(1);
    expect(changes[0]).not.toBe(config);
    expect(changes[0]?.groups.map((g) => g.id)).toEqual(["house", "property"]);
    expect(changes[0]?.groups[1]?.kind).toBe("property");
    expect(JSON.stringify(config)).toBe(before);
    expect(selects[0]).toEqual(["groups", 1]);
  });

  // A group is added empty, so the only thing to see inside it is the placeholder that
  // says so — and a group nobody opened shows nothing at all.
  it("opens a group it has just added, so what is inside it is reachable", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    rowFor("groups/0/children/0").querySelector<HTMLElement>('[data-action="add-group"]')!.click();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.add-menu button[data-kind="area"]')!.click();
    await el.updateComplete;
    el.config = changes.at(-1)!;
    await el.updateComplete;
    const added = rowFor("groups/0/children/0/children/1");
    expect(added).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".placeholder")?.textContent).toContain("Nothing in here yet");
  });

  it("adds a stimulus to a group and selects it", async () => {
    await click('ha-icon-button[label="Add stimulus"]');
    expect(changes[0]?.groups[0]?.stimuli).toHaveLength(2);
    expect(changes[0]?.groups[0]?.stimuli[1]?.entity).toBe("");
    expect(selects[0]).toEqual(["groups", 0, "stimuli", 1]);
  });
});

describe("al-tree structural changes", () => {
  it("flags an add, so the shell can drop path-keyed errors that no longer line up", async () => {
    await click("ha-button");
    expect(changeEvents[0]?.structural).toBe(true);
  });

  it("flags a delete", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      await expand("groups/0");
      await click('ha-icon-button[label="Delete stimulus"]');
      expect(changeEvents[0]?.structural).toBe(true);
    } finally {
      confirm.mockRestore();
    }
  });
});

describe("al-tree rows", () => {
  it("draws one flat row per node, with no expansion panels", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("ha-expansion-panel")).toBeNull();
    expect(rows()).toHaveLength(1); // only the root until something is expanded
    await expand("groups/0");
    expect(rows().map((r) => r.dataset.path)).toEqual(["groups/0", "groups/0/children/0", "groups/0/children/1"]);
  });

  it("indents each row by its depth and draws no up or down arrows", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    expect(rowFor("groups/0").style.getPropertyValue("--al-indent").trim()).toBe("0");
    expect(rowFor("groups/0/children/0").style.getPropertyValue("--al-indent").trim()).toBe("1");
    expect(el.shadowRoot?.querySelector('ha-icon-button[label="Move up"]')).toBeNull();
    expect(el.shadowRoot?.querySelector('ha-icon-button[label="Move down"]')).toBeNull();
  });

  it("selects from the label and toggles only from the caret", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>(".label")!.click();
    await el.updateComplete;
    expect(selects).toEqual([["groups", 0]]);
    expect(rows()).toHaveLength(1); // selecting did not expand
    rowFor("groups/0").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    expect(selects).toHaveLength(1); // toggling did not select
    expect(rows().length).toBeGreaterThan(1);
  });

  it("selects from blank row space too, and keeps the expansion across a reload", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    rowFor("groups/0/children/0").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(selects).toEqual([["groups", 0, "children", 0]]);
    const fresh = document.createElement("al-tree");
    fresh.config = kindsConfig();
    document.body.appendChild(fresh);
    await fresh.updateComplete;
    expect(fresh.shadowRoot?.querySelectorAll(".row")).toHaveLength(3);
  });

  it("offers only the kinds the nesting rules allow here", async () => {
    el.config = kindsConfig();
    el.selection = ["groups", 0, "children", 0];
    await el.updateComplete;
    await expand("groups/0");
    rowFor("groups/0/children/0").querySelector<HTMLElement>('[data-action="add-group"]')!.click();
    await el.updateComplete;
    const items = [...el.shadowRoot!.querySelectorAll<HTMLElement>(".add-menu button")].map((b) => b.dataset.kind);
    expect(items).toEqual(["floor", "area"]); // a structure takes floors and areas
  });

  it("adds a group of the kind that was picked", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>('[data-action="add-group"]')!.click();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.add-menu button[data-kind="outside"]')!.click();
    await el.updateComplete;
    expect(changes[0]!.groups[0]!.children.at(-1)).toMatchObject({ kind: "outside" });
    expect(changeEvents[0]!.structural).toBe(true);
  });

  it("moves a node on a legal drop, computing before/after from the pointer", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    const source = rowFor("groups/0/children/1");
    const target = rowFor("groups/0/children/0");
    source.dispatchEvent(dragEvent("dragstart", {}));
    const path = JSON.stringify(["groups", 0, "children", 1]);
    target.dispatchEvent(dragEvent("dragover", { "text/plain": path }, 1)); // top third: before
    target.dispatchEvent(dragEvent("drop", { "text/plain": path }, 1));
    await el.updateComplete;
    expect(changes.at(-1)!.groups[0]!.children.map((g) => g.id)).toEqual(["back_patio", "house"]);
  });

  // The drop target is named against the tree as the pointer saw it, and the dragged row
  // sits above it in the same list — so lifting it out moves the destination. This used to
  // insert into a slot that no longer existed and throw on the way.
  it("lands a forward drop into a later sibling, after its own removal moved it", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    await expand("groups/0/children/0");
    await expand("groups/0/children/0/children/0");
    const rooms: Path = ["groups", 0, "children", 0, "children", 0, "children"];
    rowFor("groups/0/children/0/children/0/children/0").dispatchEvent(dragEvent("dragstart", {}));
    const target = rowFor("groups/0/children/0/children/0/children/1"); // the hall, after it
    const path = JSON.stringify([...rooms, 0]);
    target.dispatchEvent(dragEvent("drop", { "text/plain": path }, 12)); // middle third: into
    await el.updateComplete;
    const downstairs = changes.at(-1)!.groups[0]!.children[0]!.children[0]!;
    expect(downstairs.children.map((g) => g.id)).toEqual(["hall"]);
    expect(downstairs.children[0]!.children.map((g) => g.id)).toEqual(["kitchen"]);
    expect(selects.at(-1)).toEqual([...rooms, 0, "children", 0]);
  });

  it("shows the drop target during dragover, when the data store is protected", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    rowFor("groups/0/children/1").dispatchEvent(dragEvent("dragstart", {}));
    const target = rowFor("groups/0/children/0");
    const over = dragEvent("dragover", { "text/plain": "unreadable until the drop" }, 1);
    expect(target.dispatchEvent(over)).toBe(false); // preventDefault: a drop may land here
    await el.updateComplete;
    expect(target.classList.contains("drop-before")).toBe(true);
    expect(over.dataTransfer?.dropEffect).toBe("move");
  });

  it("ignores a drag that did not start in the tree", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    const target = rowFor("groups/0/children/0");
    const over = dragEvent("dragover", { "text/plain": "a paragraph from another page" }, 1);
    expect(target.dispatchEvent(over)).toBe(true); // not prevented: nothing may land here
    await el.updateComplete;
    expect(target.className).not.toContain("drop-");
  });

  it("drops a stimulus into a group that has none yet", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    await expand("groups/0/children/0");
    await expand("groups/0/children/0/children/0");
    await expand("groups/0/children/0/children/0/children/1");
    const from = "groups/0/children/0/children/0/children/1/stimuli/0";
    rowFor(from).dispatchEvent(dragEvent("dragstart", {}));
    const path = JSON.stringify(["groups", 0, "children", 0, "children", 0, "children", 1, "stimuli", 0]);
    const house = rowFor("groups/0/children/0");
    house.dispatchEvent(dragEvent("dragover", { "text/plain": path }, 12)); // middle third: into
    house.dispatchEvent(dragEvent("drop", { "text/plain": path }, 12));
    await el.updateComplete;
    const moved = changes.at(-1)!.groups[0]!.children[0]!;
    expect(moved.stimuli.map((s) => s.entity)).toEqual(["binary_sensor.hall_motion"]);
    expect(moved.children[0]!.children[1]!.stimuli).toEqual([]);
    expect(selects.at(-1)).toEqual(["groups", 0, "children", 0, "stimuli", 0]);
  });

  it("refuses an illegal drop and says why in the row", async () => {
    el.config = kindsConfig();
    el.selection = null;
    await el.updateComplete;
    await expand("groups/0");
    const target = rowFor("groups/0/children/0");
    const path = JSON.stringify(["groups", 0, "children", 1]); // the patio, into the house
    rowFor("groups/0/children/1").dispatchEvent(dragEvent("dragstart", {}));
    target.dispatchEvent(dragEvent("dragover", { "text/plain": path }, 12)); // middle: into
    await el.updateComplete;
    expect(target.classList.contains("illegal")).toBe(true);
    expect(target.querySelector(".hint")?.textContent).toContain("cannot contain");
    target.dispatchEvent(dragEvent("drop", { "text/plain": path }, 12));
    await el.updateComplete;
    expect(changes).toHaveLength(0);
  });

  it("reorders and reparents with Alt+arrows", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    const patio = rowFor("groups/0/children/1");
    patio.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", altKey: true, bubbles: true }));
    await el.updateComplete;
    expect(changes.at(-1)!.groups[0]!.children.map((g) => g.id)).toEqual(["back_patio", "house"]);
    // outdenting the patio would make it a root, and a root has to be a property
    el.config = changes.at(-1)!;
    await el.updateComplete;
    rowFor("groups/0/children/0").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true }),
    );
    await el.updateComplete;
    expect(changes).toHaveLength(1); // refused, and nothing was emitted
  });

  it("indents a node under the sibling above it with Alt+Right", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    await expand("groups/0/children/0");
    await expand("groups/0/children/0/children/0");
    rowFor("groups/0/children/0/children/0/children/1").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", altKey: true, bubbles: true }),
    );
    await el.updateComplete;
    const kitchen = changes.at(-1)!.groups[0]!.children[0]!.children[0]!.children;
    expect(kitchen.map((g) => g.id)).toEqual(["kitchen"]);
    expect(kitchen[0]!.children.map((g) => g.id)).toEqual(["hall"]);
  });

  it("leaves a stimulus where it is when Alt+Left or Alt+Right asks it to be a group", async () => {
    el.config = {
      ...baseConfig(),
      groups: [
        {
          ...newGroup("house", "structure"),
          stimuli: [newStimulus("binary_sensor.one"), newStimulus("binary_sensor.two")],
        },
      ],
    };
    await el.updateComplete;
    await expand("groups/0");
    const second = rowFor("groups/0/stimuli/1");
    second.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", altKey: true, bubbles: true }));
    second.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true }));
    await el.updateComplete;
    expect(changes).toHaveLength(0);
  });

  it("selects a row with Enter and moves focus with the plain arrows", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    rowFor("groups/0").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await el.updateComplete;
    expect(selects).toEqual([["groups", 0]]);
    const root = rowFor("groups/0");
    root.focus();
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot?.activeElement).toBe(rowFor("groups/0/children/0"));
    rowFor("groups/0/children/0").dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot?.activeElement).toBe(rowFor("groups/0/children/1"));
    expect(selects).toHaveLength(1); // walking the tree is not choosing anything
    expect(changes).toHaveLength(0);
  });

  it("opens a group with plain Right and closes it with plain Left", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    const root = rowFor("groups/0");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await el.updateComplete;
    expect(rows()).toHaveLength(3);
    rowFor("groups/0").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await el.updateComplete;
    expect(rows()).toHaveLength(1);
  });

  it("keeps one tab stop, on the selected row, and numbers the rows within their level", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    await expand("groups/0");
    expect(rows().map((r) => r.tabIndex)).toEqual([0, -1, -1]); // no selection: the first row
    el.selection = ["groups", 0, "children", 1];
    await el.updateComplete;
    expect(rows().map((r) => r.tabIndex)).toEqual([-1, -1, 0]);
    expect(rowFor("groups/0").getAttribute("aria-setsize")).toBe("1");
    expect(rowFor("groups/0/children/1").getAttribute("aria-posinset")).toBe("2");
    expect(rowFor("groups/0/children/1").getAttribute("aria-setsize")).toBe("2");
  });

  // A group with nothing in it has no caret, so the only way to be looking inside one is
  // to have emptied it while it was open — which is exactly when the placeholder is wanted.
  it("shows the placeholder only for an expanded group with nothing left in it", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      el.config = kindsConfig();
      await el.updateComplete;
      await expand("groups/0");
      await expand("groups/0/children/1");
      expect(el.shadowRoot?.querySelector(".placeholder")).toBeNull(); // it still has a stimulus
      rowFor("groups/0/children/1/stimuli/0").querySelector<HTMLElement>('[data-action="delete"]')!.click();
      await el.updateComplete;
      el.config = changes.at(-1)!;
      await el.updateComplete;
      expect(el.shadowRoot?.querySelectorAll(".placeholder")).toHaveLength(1);
      expect(el.shadowRoot?.querySelector(".placeholder")?.textContent).toContain("Nothing in here yet");
      expect(rowFor("groups/0/children/1").querySelector(".caret")?.tagName.toLowerCase()).toBe("span");
    } finally {
      confirm.mockRestore();
    }
  });
});

describe("al-tree live view", () => {
  const live: LiveState = {
    now: 1000,
    groups: {
      house: {
        value: 2.5,
        real_value: 2.5,
        raw_value: 2.5432,
        active: true,
        gated: true,
        active_voices: 1,
        last_activity: 900,
        cooldown_at: null,
        contributors: {},
        name: "house",
        parent_id: null,
        precision: 1,
        max_value: 5,
        mix: "sum",
        next_wake: 1090,
        lights: 0,
        muted: false,
      },
    },
    voices: {
      house: [
        {
          label: "binary_sensor.motion",
          entity: "binary_sensor.motion",
          phase: "release",
          value: 0.75,
          gain: 1,
          gate: false,
          phase_started: 950,
          phase_ends: 1030.5,
        },
      ],
    },
  };

  beforeEach(async () => {
    el.live = live;
    await el.updateComplete;
    await expand("groups/0");
  });

  it("fills the meter to the group's share of its limit", () => {
    const fill = el.shadowRoot?.querySelector(".meter > div") as HTMLElement | null;
    expect(fill?.getAttribute("style")).toContain("width: 50%");
  });

  it("names the raw value and the next wake in the meter's tooltip", () => {
    const title = el.shadowRoot?.querySelector(".meter")?.getAttribute("title") ?? "";
    expect(title).toContain("2.5 of 5");
    expect(title).toContain("raw 2.543");
    expect(title).toContain("next wake in 1m 30s");
  });

  it("colours the voice's phase chip and counts down to the end of the phase", () => {
    const chip = rowFor("groups/0/stimuli/0").querySelector(".phase");
    expect(chip?.className).toContain("release");
    expect(chip?.textContent?.trim()).toBe("release");
    expect(chip?.getAttribute("title")).toBe("Phase: release, ends in 30.5s");
  });
});

describe("al-tree stimulus rows", () => {
  const hass = {
    states: {
      "binary_sensor.motion": {
        entity_id: "binary_sensor.motion",
        state: "on",
        attributes: { device_class: "motion", friendly_name: "Hall Motion" },
        last_changed: "",
      },
    },
    localize: (key: string) =>
      key === "component.binary_sensor.entity_component.motion.state.on" ? "Detected" : "",
  } as unknown as HomeAssistant;

  beforeEach(async () => {
    await expand("groups/0");
  });

  it("wears the entity's own icon and spells its state the way HA does", async () => {
    el.hass = hass;
    await el.updateComplete;
    const row = rowFor("groups/0/stimuli/0");
    expect(row.querySelector("ha-state-icon")).not.toBeNull();
    expect(row.querySelector('ha-icon[icon="mdi:flash"]')).toBeNull();
    expect(row.querySelector(".chip")?.textContent?.trim()).toBe("Detected");
  });

  it("falls back to the generic bolt when the entity is not there", async () => {
    el.hass = { states: {}, localize: () => "" } as unknown as HomeAssistant;
    await el.updateComplete;
    const row = rowFor("groups/0/stimuli/0");
    expect(row.querySelector("ha-state-icon")).toBeNull();
    expect(row.querySelector('ha-icon[icon="mdi:flash"]')).not.toBeNull();
  });
});

describe("al-tree empty states", () => {
  it("invites a first property when the config has none", async () => {
    el.config = { ...baseConfig(), groups: [] };
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("ha-button")?.textContent?.trim()).toBe("Add your first property");
    await click("ha-button");
    expect(changes[0]?.groups.map((g) => g.id)).toEqual(["property"]);
    expect(changes[0]?.groups[0]?.kind).toBe("property");
  });
});
