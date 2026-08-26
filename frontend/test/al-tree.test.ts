import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-tree";
import { newGroup, newStimulus } from "../src/model";
import type { AlTree } from "../src/al-tree";
import type { Config, Path } from "../src/types";

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

  it("selects a group from its header row", async () => {
    await click(".header");
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
