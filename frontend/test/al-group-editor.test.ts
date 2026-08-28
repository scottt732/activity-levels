import { beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-group-editor";
import { newGroup, newStimulus } from "../src/model";
import type { AlGroupEditor } from "../src/al-group-editor";
import type { AlChangeEvent } from "../src/events";
import type { Config, Group, Path } from "../src/types";

const child = (): Group => ({
  ...newGroup("kitchen", "area"),
  stimuli: [newStimulus("binary_sensor.kitchen")],
});

const baseConfig = (): Config => ({
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
  groups: [
    {
      ...newGroup("house", "structure"),
      stimuli: [newStimulus("binary_sensor.hall")],
      children: [child()],
    },
  ],
});

let el: AlGroupEditor;
let config: Config;
let changes: Config[];
let keys: (string | undefined)[];
let selects: (Path | null)[];

const form = (): HTMLElement & { data?: Record<string, unknown>; schema?: { name: string }[] } => {
  const node = el.shadowRoot?.querySelector("ha-form") as
    | (HTMLElement & { data?: Record<string, unknown>; schema?: { name: string }[] })
    | null;
  expect(node, "missing ha-form").toBeTruthy();
  return node!;
};

const fields = (): (HTMLElement & { value?: unknown })[] =>
  Array.from(el.shadowRoot?.querySelectorAll<HTMLElement & { value?: unknown }>("al-override-field") ?? []);

/** The precision override, which stores a number but talks to a string dropdown. */
const precision = (): HTMLElement & { value?: unknown } => {
  const node = fields()[1];
  expect(node, "missing precision field").toBeTruthy();
  return node!;
};

const edit = async (patch: Record<string, unknown>): Promise<void> => {
  form().dispatchEvent(
    new CustomEvent("value-changed", {
      detail: { value: { ...form().data, ...patch } },
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
  config = baseConfig();
  changes = [];
  keys = [];
  selects = [];
  el = document.createElement("al-group-editor");
  el.config = config;
  el.errors = [];
  el.path = ["groups", 0];
  el.addEventListener("al-change", (e) => {
    const ev = e as AlChangeEvent;
    changes.push(ev.detail);
    keys.push(ev.coalesceKey);
  });
  el.addEventListener("al-select", (e) => selects.push((e as CustomEvent<Path | null>).detail));
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-group-editor schema", () => {
  it("offers no gain on a root group: it has no parent to scale into", () => {
    expect(form().schema?.map((f) => f.name)).toEqual(["id", "name", "area_id", "mix", "adjacent", "exit"]);
  });

  it("offers gain on a child group", async () => {
    await show(["groups", 0, "children", 0]);
    expect(form().schema?.map((f) => f.name)).toEqual([
      "id",
      "name",
      "area_id",
      "mix",
      "gain",
      "adjacent",
      "exit",
    ]);
    expect(form().data?.gain).toBe(1);
  });

  it("asks how idle contributors count only when the mix is a mean", async () => {
    expect(form().schema?.map((f) => f.name)).not.toContain("null_handling");
    config.groups[0]!.mix = "mean";
    el.config = { ...config };
    await el.updateComplete;
    expect(form().schema?.map((f) => f.name)).toContain("null_handling");
    expect(form().data?.null_handling).toBe("zero");
  });
});

describe("al-group-editor precision", () => {
  it("shows the stored number as the dropdown's string", async () => {
    config.groups[0]!.precision = 2;
    el.config = { ...config };
    await el.updateComplete;
    expect(precision().value).toBe("2");
  });

  it("leaves an inherited precision empty", () => {
    expect(precision().value).toBeNull();
  });

  it("stores the chosen string back as a number", async () => {
    precision().dispatchEvent(new CustomEvent("value-changed", { detail: { value: "3" } }));
    await el.updateComplete;
    expect(changes.at(-1)?.groups[0]?.precision).toBe(3);
    expect(keys.at(-1)).toBe("groups/0:precision");
  });

  it("stores a reset as null, back to inherited", async () => {
    precision().dispatchEvent(new CustomEvent("value-changed", { detail: { value: null } }));
    await el.updateComplete;
    expect(changes.at(-1)?.groups[0]?.precision).toBeNull();
  });
});

describe("al-group-editor form merge", () => {
  it("changes one field and keeps the stimuli and children untouched", async () => {
    await edit({ name: "The house" });
    const next = changes.at(-1)?.groups[0];
    expect(next?.name).toBe("The house");
    expect(keys.at(-1)).toBe("groups/0:name");
    expect(next?.stimuli).toBe(config.groups[0]?.stimuli);
    expect(next?.children).toBe(config.groups[0]?.children);
    expect(changes.at(-1)).not.toBe(config);
  });

  it("blanks a name back to null rather than to an empty string", async () => {
    config.groups[0]!.name = "The house";
    el.config = { ...config };
    await el.updateComplete;
    await edit({ name: "" });
    expect(changes.at(-1)?.groups[0]?.name).toBeNull();
  });

  it("stays quiet when nothing changed", async () => {
    await edit({});
    expect(changes).toHaveLength(0);
  });
});

describe("al-group-editor delete", () => {
  it("removes a child group and selects its parent", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      await show(["groups", 0, "children", 0]);
      await deleteGroup();
      expect(changes.at(-1)?.groups[0]?.children).toHaveLength(0);
      expect(selects).toEqual([["groups", 0]]);
    } finally {
      confirm.mockRestore();
    }
  });

  it("selects nothing after deleting a root group", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
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
