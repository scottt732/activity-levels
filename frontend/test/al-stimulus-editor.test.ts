import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-stimulus-editor";
import { newGroup, newStimulus } from "../src/model";
import { loadPanelOpen } from "../src/panel-state";
import type { AlStimulusEditor } from "../src/al-stimulus-editor";
import type { Config, Stimulus } from "../src/types";

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

let el: AlStimulusEditor;
let changes: Config[];

const panel = (name: string): HTMLElement =>
  el.shadowRoot!.querySelector<HTMLElement>(`ha-expansion-panel[data-panel="${name}"]`)!;

/** `baseConfig()` with the one stimulus patched, e.g. with some overrides set. */
const withStimulus = (patch: Partial<Stimulus>): Config => {
  const config = baseConfig();
  config.groups[0]!.stimuli[0] = { ...config.groups[0]!.stimuli[0]!, ...patch };
  return config;
};

/** The `data` object the editor last handed to the Source panel's `ha-form`. */
const formData = (): Record<string, unknown> => {
  const form = el.shadowRoot?.querySelector("ha-form") as (HTMLElement & { data?: Record<string, unknown> }) | null;
  expect(form, "missing ha-form").toBeTruthy();
  return form?.data ?? {};
};

/** Hand the Source form a new value, the way `ha-form` does. */
const edit = async (patch: Record<string, unknown>): Promise<void> => {
  const form = el.shadowRoot?.querySelector("ha-form");
  form?.dispatchEvent(
    new CustomEvent("value-changed", {
      detail: { value: { ...formData(), ...patch } },
      bubbles: true,
      composed: true,
    }),
  );
  await el.updateComplete;
};

/** The override fields the editor is currently rendering, by their label. */
const overrides = (): Map<string, HTMLElement & { disabled?: boolean; hint?: string }> =>
  new Map(
    [...el.shadowRoot!.querySelectorAll<HTMLElement & { label?: string }>("al-override-field")].map(
      (f) => [f.label ?? "", f],
    ),
  );

beforeEach(async () => {
  document.body.innerHTML = "";
  localStorage.clear();
  changes = [];
  el = document.createElement("al-stimulus-editor");
  el.config = baseConfig();
  el.path = ["groups", 0, "stimuli", 0];
  el.errors = [];
  el.addEventListener("al-change", (e) => {
    const next = (e as CustomEvent<Config>).detail;
    changes.push(next);
    el.config = next;
  });
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-stimulus-editor: the 'to' field", () => {
  it("hands the form the stored list, not text", () => {
    expect(formData().to).toEqual(["on"]);
  });

  it("writes the picked states straight through", async () => {
    await edit({ to: ["on", "playing"] });
    expect(changes.at(-1)?.groups[0]?.stimuli[0]?.to).toEqual(["on", "playing"]);
  });

  it("refreshes when the config changes underneath it, as undo does", async () => {
    await edit({ to: ["on", "playing"] });
    el.config = baseConfig();
    await el.updateComplete;
    expect(formData().to).toEqual(["on"]);
  });

  it("follows the selection to another stimulus", async () => {
    const next = baseConfig();
    next.groups[0]!.stimuli.push(newStimulus("binary_sensor.door"));
    next.groups[0]!.stimuli[1]!.to = ["off"];
    el.config = next;
    el.path = ["groups", 0, "stimuli", 1];
    await el.updateComplete;
    expect(formData().to).toEqual(["off"]);
  });
});

describe("al-stimulus-editor: mode", () => {
  it("shows the edge checkboxes only in momentary mode", async () => {
    expect(formData().edges).toBeUndefined();
    await edit({ mode: "momentary" });
    expect(formData().edges).toEqual(["enter", "leave"]);
    expect(changes.at(-1)?.groups[0]?.stimuli[0]?.mode).toBe("momentary");
  });

  it("declines to uncheck the last edge", async () => {
    await edit({ mode: "momentary" });
    await edit({ edges: ["enter"] });
    expect(changes.at(-1)?.groups[0]?.stimuli[0]?.edges).toEqual(["enter"]);
    const before = changes.length;
    await edit({ edges: [] });
    expect(changes).toHaveLength(before); // nothing changed, so nothing was emitted
  });

  it("pins and explains the overrides a momentary trigger cannot use", async () => {
    expect(overrides().get("Attack")?.disabled).toBe(false);
    el.config = withStimulus({ mode: "momentary" });
    await el.updateComplete;
    const fields = overrides();
    expect(fields.get("Attack")?.disabled).toBe(true);
    expect(fields.get("Decay")?.disabled).toBe(true);
    expect(fields.get("Impulse")?.disabled).toBe(true);
    expect(fields.get("Release")?.disabled).toBe(false);
    expect(fields.get("Attack")?.hint).toContain("always an impulse");
  });
});

describe("al-stimulus-editor panels", () => {
  it("opens Source and Envelope, and leaves the overrides collapsed", async () => {
    expect(panel("source").hasAttribute("expanded")).toBe(true);
    expect(panel("envelope").hasAttribute("expanded")).toBe(true);
    expect(panel("overrides").hasAttribute("expanded")).toBe(false);
    expect(panel("envelope").textContent).toContain("rises and falls over time");
  });

  it("badges the overrides panel with how many are set, and drops the badge at zero", async () => {
    expect(panel("overrides").querySelector(".badge")).toBeNull();
    el.config = withStimulus({ release: 600, attack: 5 });
    await el.updateComplete;
    expect(panel("overrides").querySelector(".badge")!.textContent).toContain("2 overridden");
  });

  it("remembers the overrides panel once it has been opened", async () => {
    panel("overrides").dispatchEvent(new CustomEvent("expanded-changed", { detail: { expanded: true } }));
    await el.updateComplete;
    expect(loadPanelOpen("stimulus:overrides", false)).toBe(true);
  });
});
