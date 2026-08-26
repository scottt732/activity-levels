import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-defaults";
import { newGroup } from "../src/model";
import type { AlDefaults } from "../src/al-defaults";
import type { AlChangeEvent } from "../src/events";
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
    { id: "media", attack: 10, decay: 300, sustain: 0.6, release: 900, impulse: false, retrigger: null, unavailable: null, debounce: null },
  ],
  groups: [newGroup("house")],
});

let el: AlDefaults;
let config: Config;
let changes: Config[];
let keys: (string | undefined)[];

const form = (): HTMLElement & { data?: Record<string, unknown>; schema?: { name: string }[] } => {
  const node = el.shadowRoot?.querySelector("ha-form") as
    | (HTMLElement & { data?: Record<string, unknown>; schema?: { name: string }[] })
    | null;
  expect(node, "missing ha-form").toBeTruthy();
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

beforeEach(async () => {
  document.body.innerHTML = "";
  config = baseConfig();
  changes = [];
  keys = [];
  el = document.createElement("al-defaults");
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

describe("al-defaults", () => {
  it("renders every default as a field, with durations as objects", () => {
    expect(form().schema?.map((f) => f.name)).toEqual([
      "envelope",
      "max_value",
      "precision",
      "unavailable",
      "retrigger",
      "debounce",
      "safety_refresh",
      "min_wake_interval",
    ]);
    expect(form().data?.safety_refresh).toEqual({ hours: 0, minutes: 1, seconds: 0 });
    expect(form().data?.precision).toBe("1");
  });

  it("offers the preset ids as the envelope choices", () => {
    const item = form().schema?.[0] as { selector?: { select?: { options?: { value: string }[] } } };
    expect(item.selector?.select?.options?.map((o) => o.value)).toEqual(["default", "media"]);
  });

  it("converts a duration back to seconds and coalesces per field", async () => {
    await edit({ safety_refresh: { hours: 0, minutes: 5, seconds: 0 } });
    expect(changes.at(-1)?.defaults.safety_refresh).toBe(300);
    expect(keys.at(-1)).toBe("defaults:safety_refresh");
  });

  it("stores precision as a number even though the select yields a string", async () => {
    await edit({ precision: "3" });
    expect(changes.at(-1)?.defaults.precision).toBe(3);
    expect(keys.at(-1)).toBe("defaults:precision");
  });

  it("switches the default envelope preset", async () => {
    await edit({ envelope: "media" });
    expect(changes.at(-1)?.defaults.envelope).toBe("media");
  });

  it("stays quiet when nothing changed", async () => {
    await edit({});
    expect(changes).toHaveLength(0);
  });

  it("never mutates the config it was handed", async () => {
    const before = JSON.stringify(config);
    await edit({ max_value: 10 });
    expect(changes.at(-1)?.defaults.max_value).toBe(10);
    expect(JSON.stringify(config)).toBe(before);
    expect(changes.at(-1)).not.toBe(config);
    expect(changes.at(-1)?.envelopes).toBe(config.envelopes);
  });
});
