import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-tree";
import { newGroup, newStimulus } from "../src/model";
import type { AlTree } from "../src/al-tree";
import type { Config, LiveState, Path } from "../src/types";

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

let el: AlTree;
let config: Config;
let changes: Config[];
let selects: (Path | null)[];

beforeEach(async () => {
  document.body.innerHTML = "";
  config = baseConfig();
  changes = [];
  selects = [];
  el = document.createElement("al-tree");
  el.config = config;
  el.errors = [];
  el.addEventListener("al-change", (e) => changes.push((e as CustomEvent<Config>).detail));
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

describe("al-tree", () => {
  it("adds a root group without mutating the current config", async () => {
    const before = JSON.stringify(config);
    await click("ha-button");
    expect(changes).toHaveLength(1);
    expect(changes[0]).not.toBe(config);
    expect(changes[0]?.groups.map((g) => g.id)).toEqual(["house", "new_group"]);
    expect(JSON.stringify(config)).toBe(before);
    expect(selects[0]).toEqual(["groups", 1]);
  });

  it("adds a stimulus to a group and selects it", async () => {
    await click('ha-icon-button[label="Add stimulus"]');
    expect(changes[0]?.groups[0]?.stimuli).toHaveLength(2);
    expect(changes[0]?.groups[0]?.stimuli[1]?.entity).toBe("");
    expect(selects[0]).toEqual(["groups", 0, "stimuli", 1]);
  });

  it("selects a group from its name button, and leaves the header row unfocusable", async () => {
    const header = el.shadowRoot?.querySelector(".header");
    expect(header?.getAttribute("role")).toBeNull();
    expect(header?.getAttribute("tabindex")).toBeNull();
    await click(".header button.link");
    expect(selects).toEqual([["groups", 0]]);
    expect(changes).toHaveLength(0);
  });

  it("selects a stimulus row with the keyboard", async () => {
    const row = el.shadowRoot?.querySelector(".stimulus");
    row?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }));
    await el.updateComplete;
    expect(selects).toEqual([["groups", 0, "stimuli", 0]]);
  });
});
describe("al-tree live view", () => {
  const live: LiveState = {
    now: 1000,
    groups: {
      house: {
        value: 2.5,
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
    const chip = el.shadowRoot?.querySelector(".stimulus .phase");
    expect(chip?.className).toContain("release");
    expect(chip?.textContent?.trim()).toBe("release");
    expect(chip?.getAttribute("title")).toBe("Phase: release, ends in 30.5s");
  });
});

describe("al-tree empty states", () => {
  it("invites a first group when the config has none", async () => {
    el.config = { ...baseConfig(), groups: [] };
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("ha-button")?.textContent?.trim()).toBe("Add your first group");
    await click("ha-button");
    expect(changes[0]?.groups.map((g) => g.id)).toEqual(["new_group"]);
  });

  it("hints at the + button when a group has no stimuli", async () => {
    const next = baseConfig();
    next.groups[0]!.stimuli = [];
    el.config = next;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".empty")?.textContent).toContain("+ button");
  });
});
