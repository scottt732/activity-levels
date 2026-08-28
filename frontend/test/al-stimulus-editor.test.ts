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
    retrigger: "only_in_release",
    debounce: 0,
    safety_refresh: 60,
    min_wake_interval: 1,
  },
  envelopes: [
    { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
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

/** Simulate a keystroke in the "Active states" field. */
const type = async (to: string): Promise<void> => {
  const form = el.shadowRoot?.querySelector("ha-form");
  form?.dispatchEvent(
    new CustomEvent("value-changed", {
      detail: { value: { ...formData(), to } },
      bubbles: true,
      composed: true,
    }),
  );
  await el.updateComplete;
};

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
  it("keeps a trailing separator on screen so a second state can be typed", async () => {
    await type("on,");
    expect(changes).toHaveLength(0);
    expect(formData().to).toBe("on,");
    await type("on, playing");
    expect(formData().to).toBe("on, playing");
    expect(changes.at(-1)?.groups[0]?.stimuli[0]?.to).toEqual(["on", "playing"]);
  });

  it("survives an unrelated re-render mid-word", async () => {
    await type("on, ");
    el.requestUpdate();
    await el.updateComplete;
    expect(formData().to).toBe("on, ");
  });

  it("writes only the parsed list into the config", async () => {
    await type("on, playing,");
    expect(formData().to).toBe("on, playing,");
    expect(changes.at(-1)?.groups[0]?.stimuli[0]?.to).toEqual(["on", "playing"]);
  });

  it("refreshes when the config changes underneath it, as undo does", async () => {
    await type("on, playing");
    const undone = baseConfig();
    el.config = undone;
    await el.updateComplete;
    expect(formData().to).toBe("on");
  });

  it("resets when the selection moves to another stimulus", async () => {
    await type("on, play");
    const next = baseConfig();
    next.groups[0]!.stimuli.push(newStimulus("binary_sensor.door"));
    next.groups[0]!.stimuli[1]!.to = ["off"];
    el.config = next;
    el.path = ["groups", 0, "stimuli", 1];
    await el.updateComplete;
    expect(formData().to).toBe("off");
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
