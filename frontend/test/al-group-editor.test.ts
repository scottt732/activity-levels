import { beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-group-editor";
import { loadPanelOpen } from "../src/panel-state";
import { kindsConfig, presenceConfig } from "./fixtures";
import type { AlGroupEditor } from "../src/al-group-editor";
import type { AlChangeEvent } from "../src/events";
import type { Config, HomeAssistant, Path } from "../src/types";

/** Property › House › Downstairs › (Kitchen, Hall), with Back Patio outside. */
const KITCHEN: Path = ["groups", 0, "children", 0, "children", 0, "children", 0];
const HOUSE: Path = ["groups", 0, "children", 0];
const PATIO: Path = ["groups", 0, "children", 1];

const hass = () =>
  ({
    states: {},
    areas: { larder: { area_id: "larder", name: "The Larder" } },
    floors: { upstairs: { floor_id: "upstairs", name: "Upstairs" } },
    entities: {},
    language: "en",
    localize: (k: string) => k,
    callWS: vi.fn(),
    callService: vi.fn(),
  }) as unknown as HomeAssistant;

let el: AlGroupEditor;
let config: Config;
let changes: Config[];
let keys: (string | undefined)[];
let selects: (Path | null)[];

const panel = (name: string): HTMLElement =>
  el.shadowRoot!.querySelector<HTMLElement>(`ha-expansion-panel[data-panel="${name}"]`)!;

type SchemaItem = { name: string; selector?: { select?: { options?: { value: string }[] } } };
type Form = HTMLElement & { data?: Record<string, unknown>; schema?: SchemaItem[] };

const form = (name: string): Form => {
  const node = panel(name)?.querySelector<Form>("ha-form");
  expect(node, `missing ha-form in the ${name} panel`).toBeTruthy();
  return node!;
};

const fields = (name: string): (HTMLElement & { value?: unknown })[] =>
  Array.from(panel(name).querySelectorAll<HTMLElement & { value?: unknown }>("al-override-field"));

/** The precision override, which stores a number but talks to a string dropdown. */
const precision = (): HTMLElement & { value?: unknown } => {
  const node = fields("mix")[1];
  expect(node, "missing precision field").toBeTruthy();
  return node!;
};

const edit = async (name: string, patch: Record<string, unknown>): Promise<void> => {
  form(name).dispatchEvent(
    new CustomEvent("value-changed", {
      detail: { value: { ...form(name).data, ...patch } },
      bubbles: true,
      composed: true,
    }),
  );
  await el.updateComplete;
};

const show = async (path: Path): Promise<void> => {
  el.path = path;
  await el.updateComplete;
};

const deleteGroup = async (): Promise<void> => {
  (el.shadowRoot?.querySelector(".danger ha-button") as HTMLElement | null)?.dispatchEvent(
    new MouseEvent("click", { bubbles: true, composed: true }),
  );
  await el.updateComplete;
};

beforeEach(async () => {
  document.body.innerHTML = "";
  localStorage.clear();
  config = kindsConfig();
  changes = [];
  keys = [];
  selects = [];
  el = document.createElement("al-group-editor");
  el.hass = hass();
  el.config = config;
  el.errors = [];
  el.path = KITCHEN;
  el.addEventListener("al-change", (e) => {
    const ev = e as AlChangeEvent;
    changes.push(ev.detail);
    keys.push(ev.coalesceKey);
  });
  el.addEventListener("al-select", (e) => selects.push((e as CustomEvent<Path | null>).detail));
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-group-editor panels", () => {
  it("shows Identity and Mix open, and the kind's own definition as the Identity subtitle", () => {
    expect(panel("identity").hasAttribute("expanded")).toBe(true);
    expect(panel("mix").hasAttribute("expanded")).toBe(true);
    expect(panel("identity").textContent).toContain("A room or zone people occupy");
    expect(panel("mix").textContent).toContain("combine into one level");
  });

  it("shows the adjacency table only for an area or an outside area", async () => {
    expect(el.shadowRoot!.querySelector("al-adjacency-table")).toBeTruthy();
    await show(HOUSE); // the house: a structure
    expect(el.shadowRoot!.querySelector("al-adjacency-table")).toBeNull();
    expect(panel("adjacent")).toBeNull();
  });

  it("renders Leads off the property as a switch with its own helper, off the table", async () => {
    await show(PATIO);
    const exit = el.shadowRoot!.querySelector<HTMLElement>(".exit")!;
    expect(exit.textContent).toContain("Leads off the property");
    expect(exit.textContent).toContain("presence can move from here to Away");
    expect(exit.closest("table")).toBeNull();
  });

  it("offers the way out only where the document may have one", async () => {
    // The property has an outside area, so leaving happens from there, not from a room -
    // but a room that already claims the exit keeps the switch that turns it back off.
    expect(el.shadowRoot!.querySelector(".exit")).toBeNull();
    await show(["groups", 0, "children", 0, "children", 0, "children", 1]);
    expect(el.shadowRoot!.querySelector(".exit")).toBeNull();
    el.config = { ...config, groups: [{ ...config.groups[0]!, children: [config.groups[0]!.children[0]!] }] };
    await show(KITCHEN);
    expect(el.shadowRoot!.querySelector(".exit")).toBeTruthy();
  });

  it("flips the exit through the draft", async () => {
    await show(PATIO);
    const toggle = el.shadowRoot!.querySelector<HTMLElement & { checked?: boolean }>(".exit ha-switch")!;
    expect(toggle.checked).toBe(true);
    toggle.checked = false;
    toggle.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(changes.at(-1)?.groups[0]?.children[1]?.exit).toBe(false);
    expect(keys.at(-1)).toBe("groups/0/children/1:exit");
  });

  it("shows Presence collapsed, and only when presence is enabled", async () => {
    expect(el.shadowRoot!.querySelector('[data-panel="presence"]')).toBeNull();
    el.config = presenceConfig();
    await show(["groups", 0, "children", 0, "children", 0]);
    expect(panel("presence").hasAttribute("expanded")).toBe(false);
    expect(panel("presence").textContent).toContain("somebody is here");
  });

  it("remembers a panel the user closed", async () => {
    panel("mix").dispatchEvent(new CustomEvent("expanded-changed", { detail: { expanded: false } }));
    await el.updateComplete;
    expect(loadPanelOpen("group:mix", true)).toBe(false);
    document.body.innerHTML = "";
    const again = document.createElement("al-group-editor");
    again.config = config;
    again.path = KITCHEN;
    document.body.appendChild(again);
    await again.updateComplete;
    expect(
      again.shadowRoot!.querySelector('ha-expansion-panel[data-panel="mix"]')!.hasAttribute("expanded"),
    ).toBe(false);
  });
});

describe("al-group-editor schema", () => {
  it("offers no gain on a root group: it has no parent to scale into", async () => {
    await show(["groups", 0]);
    expect(form("identity").schema?.map((f) => f.name)).toEqual(["kind", "id", "name"]);
    expect(form("mix").schema?.map((f) => f.name)).toEqual(["mix"]);
  });

  it("offers gain, and the area picker, on a child area", () => {
    expect(form("identity").schema?.map((f) => f.name)).toEqual(["kind", "area_id", "id", "name"]);
    expect(form("mix").schema?.map((f) => f.name)).toEqual(["mix", "gain"]);
    expect(form("mix").data?.gain).toBe(1);
  });

  it("offers only the kinds the parent may contain", () => {
    const item = form("identity").schema?.find((f) => f.name === "kind");
    expect(item?.selector?.select?.options?.map((o) => o.value)).toEqual(["area"]);
  });

  it("asks how idle contributors count only when the mix is a mean", async () => {
    expect(form("mix").schema?.map((f) => f.name)).not.toContain("null_handling");
    const groups = structuredClone(config.groups);
    groups[0]!.children[0]!.children[0]!.children[0]!.mix = "mean";
    el.config = { ...config, groups };
    await el.updateComplete;
    expect(form("mix").schema?.map((f) => f.name)).toContain("null_handling");
    expect(form("mix").data?.null_handling).toBe("zero");
  });
});

describe("al-group-editor identity binding", () => {
  it("prefills the id and the name from a freshly picked area", async () => {
    await show(["groups", 0, "children", 0, "children", 0, "children", 1]); // Hall, named
    const groups = structuredClone(config.groups);
    const hall = groups[0]!.children[0]!.children[0]!.children[1]!;
    hall.id = "area";
    hall.name = null;
    hall.area_id = null;
    el.config = { ...config, groups };
    await el.updateComplete;
    await edit("identity", { area_id: "larder" });
    const next = changes.at(-1)!.groups[0]!.children[0]!.children[0]!.children[1]!;
    expect(next).toMatchObject({ area_id: "larder", id: "the_larder", name: "The Larder" });
  });

  it("leaves an id and a name the user chose alone", async () => {
    await edit("identity", { area_id: "larder" });
    const next = changes.at(-1)!.groups[0]!.children[0]!.children[0]!.children[0]!;
    expect(next).toMatchObject({ area_id: "larder", id: "kitchen", name: "Kitchen" });
  });

  it("prefills from a floor the same way", async () => {
    await show(["groups", 0, "children", 0, "children", 0]); // Downstairs
    const groups = structuredClone(config.groups);
    const downstairs = groups[0]!.children[0]!.children[0]!;
    downstairs.id = "floor_2";
    downstairs.name = null;
    downstairs.floor_id = null;
    el.config = { ...config, groups };
    await el.updateComplete;
    await edit("identity", { floor_id: "upstairs" });
    const next = changes.at(-1)!.groups[0]!.children[0]!.children[0]!;
    expect(next).toMatchObject({ floor_id: "upstairs", id: "upstairs", name: "Upstairs" });
  });
});

describe("al-group-editor precision", () => {
  it("shows the stored number as the dropdown's string", async () => {
    const groups = structuredClone(config.groups);
    groups[0]!.children[0]!.children[0]!.children[0]!.precision = 2;
    el.config = { ...config, groups };
    await el.updateComplete;
    expect(precision().value).toBe("2");
  });

  it("leaves an inherited precision empty", () => {
    expect(precision().value).toBeNull();
  });

  it("stores the chosen string back as a number", async () => {
    precision().dispatchEvent(new CustomEvent("value-changed", { detail: { value: "3" } }));
    await el.updateComplete;
    expect(changes.at(-1)?.groups[0]?.children[0]?.children[0]?.children[0]?.precision).toBe(3);
    expect(keys.at(-1)).toBe(`${KITCHEN.join("/")}:precision`);
  });

  it("stores a reset as null, back to inherited", async () => {
    precision().dispatchEvent(new CustomEvent("value-changed", { detail: { value: null } }));
    await el.updateComplete;
    expect(changes.at(-1)?.groups[0]?.children[0]?.children[0]?.children[0]?.precision).toBeNull();
  });
});

describe("al-group-editor form merge", () => {
  it("changes one field and keeps the stimuli and children untouched", async () => {
    const before = config.groups[0]!.children[0]!.children[0]!.children[0]!;
    await edit("identity", { name: "The kitchen" });
    const next = changes.at(-1)?.groups[0]?.children[0]?.children[0]?.children[0];
    expect(next?.name).toBe("The kitchen");
    expect(keys.at(-1)).toBe(`${KITCHEN.join("/")}:name`);
    expect(next?.stimuli).toBe(before.stimuli);
    expect(next?.children).toBe(before.children);
    expect(changes.at(-1)).not.toBe(config);
  });

  it("blanks a name back to null rather than to an empty string", async () => {
    await edit("identity", { name: "" });
    expect(changes.at(-1)?.groups[0]?.children[0]?.children[0]?.children[0]?.name).toBeNull();
  });

  it("stays quiet when nothing changed", async () => {
    await edit("identity", {});
    await edit("mix", {});
    expect(changes).toHaveLength(0);
  });
});

describe("al-group-editor delete", () => {
  it("removes a child group and selects its parent", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      await deleteGroup();
      expect(changes.at(-1)?.groups[0]?.children[0]?.children[0]?.children).toHaveLength(1);
      expect(selects).toEqual([["groups", 0, "children", 0, "children", 0]]);
    } finally {
      confirm.mockRestore();
    }
  });

  it("selects nothing after deleting a root group", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      await show(["groups", 0]);
      await deleteGroup();
      expect(changes.at(-1)?.groups).toHaveLength(0);
      expect(selects).toEqual([null]);
    } finally {
      confirm.mockRestore();
    }
  });

  it("keeps the group when the confirmation is declined", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    try {
      await deleteGroup();
      expect(changes).toHaveLength(0);
      expect(selects).toEqual([]);
    } finally {
      confirm.mockRestore();
    }
  });
});
