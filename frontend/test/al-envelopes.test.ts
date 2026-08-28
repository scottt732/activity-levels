import { beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-envelopes";
import { newGroup, newStimulus } from "../src/model";
import type { AlEnvelopes } from "../src/al-envelopes";
import type { AlChangeEvent } from "../src/events";
import type { Config } from "../src/types";

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
    { id: "media", label: null, attack: 10, decay: 300, sustain: 0.6, release: 900, impulse: false, retrigger: "always", stack: null, unavailable: null, debounce: 5 },
  ],
  groups: [
    {
      ...newGroup("house", "structure"),
      stimuli: [{ ...newStimulus("media_player.tv"), envelope: "media" }],
      children: [{ ...newGroup("kitchen", "area"), stimuli: [newStimulus("binary_sensor.motion")] }],
    },
  ],
});

let el: AlEnvelopes;
let config: Config;
let changes: Config[];
let keys: (string | undefined)[];

const form = (): HTMLElement & { data?: Record<string, unknown> } => {
  const node = el.shadowRoot?.querySelector("ha-form") as (HTMLElement & { data?: Record<string, unknown> }) | null;
  expect(node, "missing ha-form").toBeTruthy();
  return node!;
};

/** Simulate an edit in the preset form, keeping every other field as rendered. */
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

const click = async (selector: string, index = 0): Promise<void> => {
  const nodes = el.shadowRoot?.querySelectorAll(selector) ?? [];
  const node = nodes[index];
  expect(node, "missing " + selector).toBeTruthy();
  node?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
  await el.updateComplete;
};

beforeEach(async () => {
  document.body.innerHTML = "";
  config = baseConfig();
  changes = [];
  keys = [];
  el = document.createElement("al-envelopes");
  el.config = config;
  el.errors = [];
  el.addEventListener("al-change", (e) => {
    const ev = e as AlChangeEvent;
    changes.push(ev.detail);
    keys.push(ev.coalesceKey);
    el.config = ev.detail;
  });
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-envelopes", () => {
  it("splits retriggering into a when and a stacking toggle", () => {
    const fields = [...(el.shadowRoot?.querySelectorAll("al-override-field") ?? [])] as (HTMLElement & {
      label?: string;
      hint?: string;
      selector?: { select?: { options?: { value: string }[] } };
    })[];
    expect(fields.map((f) => f.label)).toEqual(["Allow retrigger", "Stacks", "When unavailable", "Debounce"]);
    expect(fields[0]?.selector?.select?.options?.map((o) => o.value)).toEqual([
      "always",
      "after_attack",
      "after_decay",
      "release",
      "idle",
    ]);
    expect(fields[0]?.hint).toContain("still active");
    expect(fields[1]?.hint).toContain("on top of the current level");
  });

  it("lists every preset and sketches the selected one", () => {
    const names = [...(el.shadowRoot?.querySelectorAll(".preset .name") ?? [])].map((n) => n.textContent?.trim());
    expect(names).toEqual(["default", "media"]);
    const sketch = el.shadowRoot?.querySelector("al-envelope-sketch");
    expect(sketch).toBeTruthy();
    expect((sketch as HTMLElement & { envelope?: { release: number } }).envelope?.release).toBe(1800);
  });

  it("shows a preset's label over the id it is filed under", async () => {
    await edit({ label: "Thirty Minutes" });
    el.config = changes.at(-1)!;
    await el.updateComplete;
    const row = el.shadowRoot?.querySelectorAll(".preset")[0];
    expect(row?.querySelector(".name")?.textContent?.trim()).toBe("Thirty Minutes");
    expect(row?.querySelector(".id")?.textContent?.trim()).toBe("default");
    expect(changes.at(-1)?.envelopes[0]?.label).toBe("Thirty Minutes");
    expect(keys.at(-1)).toBe("envelopes/0:label");
  });

  it("stores a blank label as null rather than an empty string", async () => {
    await edit({ label: "Named" });
    await edit({ label: "   " });
    expect(changes.at(-1)?.envelopes[0]?.label).toBeNull();
  });

  it("rewrites the defaults and every referencing stimulus when a preset id changes", async () => {
    await click(".preset button.link", 1);
    await edit({ id: "cinema" });
    const next = changes.at(-1);
    expect(next?.envelopes.map((e) => e.id)).toEqual(["default", "cinema"]);
    expect(next?.groups[0]?.stimuli[0]?.envelope).toBe("cinema");
    expect(next?.defaults.envelope).toBe("default");
    expect(keys.at(-1)).toBe("envelopes/1:id");
  });

  it("carries the defaults reference along when the default preset is renamed", async () => {
    await edit({ id: "base" });
    const next = changes.at(-1);
    expect(next?.defaults.envelope).toBe("base");
    expect(next?.envelopes[0]?.id).toBe("base");
    expect(next?.groups[0]?.stimuli[0]?.envelope).toBe("media");
  });

  it("never mutates the config it was handed", async () => {
    const before = JSON.stringify(config);
    await edit({ id: "base" });
    await edit({ sustain: 0.25 });
    expect(JSON.stringify(config)).toBe(before);
    expect(changes.at(-1)).not.toBe(config);
  });

  it("edits a duration field through the seconds conversion", async () => {
    await edit({ attack: { hours: 0, minutes: 2, seconds: 30 } });
    expect(changes.at(-1)?.envelopes[0]?.attack).toBe(150);
    expect(keys.at(-1)).toBe("envelopes/0:attack");
  });

  it("stays quiet when the form reports no change", async () => {
    await edit({});
    expect(changes).toHaveLength(0);
  });

  it("refuses to delete a preset the defaults or a stimulus still point at", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    await click('ha-icon-button[label="Delete preset"]', 1);
    expect(changes).toHaveLength(0);
    expect(confirm).not.toHaveBeenCalled();
    const alert = el.shadowRoot?.querySelector("ha-alert");
    expect(alert?.textContent).toContain("media");
    expect(alert?.textContent).toContain("house");
    confirm.mockRestore();
  });

  it("deletes a preset nothing references", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    await click("ha-button");
    expect(changes.at(-1)?.envelopes.map((e) => e.id)).toEqual(["default", "media", "preset"]);
    await click('ha-icon-button[label="Delete preset"]', 2);
    expect(changes.at(-1)?.envelopes.map((e) => e.id)).toEqual(["default", "media"]);
    confirm.mockRestore();
  });

  it("points the defaults at a preset when its box is ticked", async () => {
    const boxes = [...(el.shadowRoot?.querySelectorAll(".default input") ?? [])] as HTMLInputElement[];
    expect(boxes.map((b) => b.checked)).toEqual([true, false]);
    // Radio semantics: the one already in force cannot be unticked into no default at all.
    expect(boxes[0]?.disabled).toBe(true);
    boxes[1]?.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(changes.at(-1)?.defaults.envelope).toBe("media");
    expect(keys.at(-1)).toBe("defaults:envelope");
  });

  it("adds presets with unique ids and selects the new one", async () => {
    await click("ha-button");
    await click("ha-button");
    expect(changes.at(-1)?.envelopes.map((e) => e.id)).toEqual(["default", "media", "preset", "preset_2"]);
    expect(form().data?.id).toBe("preset_2");
  });
});

describe("al-envelopes: id warnings", () => {
  /** Text of the warnings the editor pane is showing, if any. */
  const warnings = (): string[] =>
    [...(el.shadowRoot?.querySelectorAll('ha-alert[alert-type="warning"]') ?? [])].map(
      (n) => n.textContent?.trim() ?? "",
    );

  it("says nothing about an id that is unique and non-empty", () => {
    expect(warnings()).toEqual([]);
  });

  it("warns when the id duplicates another preset's", async () => {
    await edit({ id: "media" });
    expect(warnings().join(" ")).toContain('Another preset already uses the id "media"');
  });

  it("warns when the id has been cleared", async () => {
    await edit({ id: "" });
    expect(warnings().join(" ")).toContain("needs an id");
  });
});

describe("al-envelopes: reordering", () => {
  /** A `dragover`/`drop` on row `index`, landing in its top or bottom half. */
  const dragTo = async (index: number, half: "top" | "bottom", type = "drop"): Promise<void> => {
    const row = el.shadowRoot?.querySelectorAll(".preset")[index] as HTMLElement;
    row.getBoundingClientRect = () => ({ top: 0, height: 40 }) as DOMRect;
    const ev = new Event(type, { bubbles: true, composed: true }) as DragEvent;
    Object.defineProperty(ev, "clientY", { value: half === "top" ? 5 : 35 });
    Object.defineProperty(ev, "dataTransfer", {
      value: { types: ["text/plain"], getData: () => "", setData: () => undefined, dropEffect: "" },
    });
    row.dispatchEvent(ev);
    await el.updateComplete;
  };

  const startDrag = async (index: number): Promise<void> => {
    const row = el.shadowRoot?.querySelectorAll(".preset")[index] as HTMLElement;
    const ev = new Event("dragstart", { bubbles: true, composed: true }) as DragEvent;
    Object.defineProperty(ev, "dataTransfer", {
      value: { types: ["text/plain"], setData: () => undefined, effectAllowed: "" },
    });
    row.dispatchEvent(ev);
    await el.updateComplete;
  };

  it("moves a preset above the one it was dropped on", async () => {
    await startDrag(1);
    await dragTo(0, "top");
    expect(changes.at(-1)?.envelopes.map((e) => e.id)).toEqual(["media", "default"]);
  });

  it("marks the row the drop would land on while the pointer is over it", async () => {
    await startDrag(1);
    await dragTo(0, "top", "dragover");
    expect(el.shadowRoot?.querySelectorAll(".preset")[0]?.classList.contains("drop-before")).toBe(true);
  });

  it("does nothing when a preset is dropped back where it already was", async () => {
    await startDrag(0);
    await dragTo(0, "bottom");
    expect(changes).toHaveLength(0);
  });

  it("ignores a drag that is not one of its own rows", async () => {
    await dragTo(0, "top");
    expect(changes).toHaveLength(0);
  });

  it("moves a preset with Alt+Down as well as with a pointer", async () => {
    const button = el.shadowRoot?.querySelectorAll(".preset button.link")[0] as HTMLElement;
    button.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", altKey: true, bubbles: true }));
    await el.updateComplete;
    expect(changes.at(-1)?.envelopes.map((e) => e.id)).toEqual(["media", "default"]);
  });

  it("keeps the selection on the preset it was editing", async () => {
    await click(".preset button.link", 1);
    await startDrag(0);
    await dragTo(1, "bottom");
    expect(form().data?.id).toBe("media");
  });
});
