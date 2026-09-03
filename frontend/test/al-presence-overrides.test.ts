import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-presence-overrides";
import { presenceConfig } from "./fixtures";
import type { AlPresenceOverrides } from "../src/al-presence-overrides";
import type { AlChangeEvent } from "../src/events";
import type { Path } from "../src/types";

/** House › Downstairs › Kitchen, the room the presence fixture tunes. */
const KITCHEN: Path = ["groups", 0, "children", 0, "children", 0];

let el: AlPresenceOverrides;
let changes: AlChangeEvent[];

type Field = HTMLElement & { value?: unknown; inherited?: unknown; inheritedFrom?: unknown };

const field = (name: string): Field => el.shadowRoot!.querySelector<Field>(`.presence-${name}`)!;

beforeEach(async () => {
  document.body.innerHTML = "";
  changes = [];
  el = document.createElement("al-presence-overrides");
  el.config = presenceConfig();
  el.path = KITCHEN;
  el.errors = [];
  el.addEventListener("al-change", (e) => changes.push(e as AlChangeEvent));
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-presence-overrides", () => {
  it("shows the preset, the gain and every envelope override, over the sketch", () => {
    expect(field("envelope").value).toBe("");
    expect(field("gain").value).toBe(2);
    for (const name of ["attack", "decay", "sustain", "release", "impulse", "retrigger", "unavailable", "debounce"])
      expect(field(name), name).toBeTruthy();
    expect(el.shadowRoot!.querySelector("al-envelope-sketch")).toBeTruthy();
  });

  it("resolves what an unset override inherits through the presence preset", () => {
    // The presence block names the `hour` preset, whose release is 3600s.
    expect(field("release").inherited).toBe(3600);
    expect(field("release").inheritedFrom).toBe("hour");
  });

  it("writes one override back into the group's presence block", async () => {
    field("gain").dispatchEvent(new CustomEvent("value-changed", { detail: { value: 3 } }));
    await el.updateComplete;
    const next = changes.at(-1)!;
    expect(next.detail.groups[0]?.children[0]?.children[0]?.presence.gain).toBe(3);
    expect(next.coalesceKey).toBe(`${KITCHEN.join("/")}:presence:gain`);
  });

  it("offers the empty-room floor as an override that inherits the presence setting", async () => {
    expect(field("activity_floor").value).toBeNull();
    expect(field("activity_floor").inherited).toBe(0.05);
    expect(field("activity_floor").inheritedFrom).toBe("presence");
    field("activity_floor").dispatchEvent(new CustomEvent("value-changed", { detail: { value: 1 } }));
    await el.updateComplete;
    expect(changes.at(-1)!.detail.groups[0]?.children[0]?.children[0]?.presence.activity_floor).toBe(1);
    field("activity_floor").dispatchEvent(new CustomEvent("value-changed", { detail: { value: null } }));
    await el.updateComplete;
    expect(changes.at(-1)!.detail.groups[0]?.children[0]?.children[0]?.presence.activity_floor).toBeNull();
  });

  it("clears the preset back to the one the presence settings name", async () => {
    field("envelope").dispatchEvent(new CustomEvent("value-changed", { detail: { value: "" } }));
    await el.updateComplete;
    expect(changes.at(-1)!.detail.groups[0]?.children[0]?.children[0]?.presence.envelope).toBeNull();
  });

  it("draws nothing when the group it was pointed at has gone", async () => {
    el.path = ["groups", 9];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("al-override-field")).toBeNull();
  });
});
