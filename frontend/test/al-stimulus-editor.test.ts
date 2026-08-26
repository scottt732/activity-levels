import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-stimulus-editor";
import { newGroup, newStimulus } from "../src/model";
import type { AlStimulusEditor } from "../src/al-stimulus-editor";
import type { Config } from "../src/types";

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
  groups: [{ ...newGroup("house"), stimuli: [newStimulus("binary_sensor.motion")] }],
});

let el: AlStimulusEditor;
let changes: Config[];

/** The `data` object the editor last handed to `ha-form`. */
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
