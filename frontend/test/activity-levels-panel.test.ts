import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { HA_ELEMENTS } from "../src/ha-elements";
import type { Config } from "../src/types";

// Registered before the panel module loads: `ensureHaElements` then returns without
// waiting, which is what a real Home Assistant frontend gives us.
for (const tag of HA_ELEMENTS) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

await import("../src/activity-levels-panel");
await import("../src/al-tree");

const { alChange } = await import("../src/events");
const { newGroup } = await import("../src/model");

type Panel = HTMLElement & { hass: unknown; updateComplete: Promise<boolean> };

const config = (): Config => ({
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
  groups: [],
});

/** What `config/validate` answers next; reset per test. */
let validateResult: { ok: boolean; errors: { path: string; message: string }[] } = { ok: true, errors: [] };

const hass = () => ({
  states: {},
  areas: {},
  entities: {},
  user: { is_admin: true, name: "Test" },
  language: "en",
  localize: (k: string) => k,
  callWS: vi.fn(async (msg: { type: string }) => {
    if (msg.type === "activity_levels/config/get") return { config: config() };
    if (msg.type === "activity_levels/config/validate") return validateResult;
    return {};
  }),
});

let el: Panel;

/** The panel loads its config in `connectedCallback`; settle that before asserting. */
const mount = async (): Promise<void> => {
  document.body.innerHTML = "";
  el = document.createElement("activity-levels-panel") as Panel;
  el.hass = hass();
  document.body.appendChild(el);
  await el.updateComplete;
  await el.updateComplete;
  await el.updateComplete;
};

const tabs = (): HTMLButtonElement[] =>
  Array.from(el.shadowRoot?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);

const press = async (key: string): Promise<void> => {
  el.shadowRoot?.querySelector('[role="tablist"]')?.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, composed: true }),
  );
  await el.updateComplete;
  await el.updateComplete;
};

beforeEach(async () => {
  validateResult = { ok: true, errors: [] };
  await mount();
});

describe("activity-levels-panel tabs", () => {
  it("is a tablist of tabs, one of them selected", () => {
    expect(el.shadowRoot?.querySelector('[role="tablist"]')).toBeTruthy();
    expect(tabs().map((t) => t.tagName)).toEqual(["BUTTON", "BUTTON", "BUTTON"]);
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false"]);
    expect(tabs().map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(el.shadowRoot?.querySelector('[role="tabpanel"]')).toBeTruthy();
  });

  it("moves the roving tabindex with the arrow keys without switching tabs", async () => {
    await press("ArrowRight");
    expect(tabs().map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false"]);
    expect(el.shadowRoot?.activeElement).toBe(tabs()[1]);
  });

  it("wraps around at both ends", async () => {
    await press("ArrowLeft");
    expect(tabs()[2]?.getAttribute("tabindex")).toBe("0");
    await press("ArrowRight");
    expect(tabs()[0]?.getAttribute("tabindex")).toBe("0");
  });

  it("activates the focused tab on Enter and on Space", async () => {
    await press("ArrowRight");
    await press("Enter");
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "true", "false"]);
    expect(el.shadowRoot?.querySelector("al-envelopes")).toBeTruthy();
    await press("ArrowRight");
    await press(" ");
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "false", "true"]);
    expect(el.shadowRoot?.querySelector("al-defaults")).toBeTruthy();
  });

  it("activates a tab on click", async () => {
    tabs()[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "true", "false"]);
    expect(tabs().map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
  });
});

describe("activity-levels-panel notices", () => {
  it("offers a first group when there are none", () => {
    const tree = el.shadowRoot?.querySelector("al-tree");
    const button = tree?.shadowRoot?.querySelector("ha-button");
    expect(button?.textContent?.trim()).toBe("Add your first group");
  });
});

describe("activity-levels-panel validation errors", () => {
  const tree = (): (HTMLElement & { errors?: unknown[] }) | null =>
    el.shadowRoot?.querySelector("al-tree") ?? null;

  /** An edit arriving from the tree, exactly as the tree dispatches it. */
  const change = async (structural?: true): Promise<void> => {
    tree()?.dispatchEvent(alChange({ ...config(), groups: [newGroup("x")] }, undefined, structural));
    await el.updateComplete;
  };

  const save = async (): Promise<void> => {
    const buttons = el.shadowRoot?.querySelectorAll<HTMLElement>("ha-button");
    buttons?.[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    for (let i = 0; i < 5; i++) await el.updateComplete;
  };

  it("clears errors on a structural edit but keeps them on a field edit", async () => {
    validateResult = { ok: false, errors: [{ path: "groups/0", message: "bad" }] };
    await change();
    await save();
    expect(tree()?.errors).toHaveLength(1);
    await change();
    expect(tree()?.errors).toHaveLength(1);
    await change(true);
    expect(tree()?.errors).toHaveLength(0);
  });
});

describe("activity-levels-panel live view", () => {
  const polls = (): number =>
    (el.hass as { callWS: Mock }).callWS.mock.calls.filter(
      (call) => (call[0] as { type: string }).type === "activity_levels/state",
    ).length;

  const setVisibility = (value: string): void => {
    Object.defineProperty(document, "visibilityState", { value, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  };

  /** Flip the Live switch the way the toolbar does. */
  const toggleLive = async (on: boolean): Promise<void> => {
    const sw = el.shadowRoot?.querySelector("ha-switch") as (HTMLElement & { checked?: boolean }) | null;
    expect(sw, "missing ha-switch").toBeTruthy();
    if (sw) sw.checked = on;
    sw?.dispatchEvent(new Event("change"));
    await el.updateComplete;
  };

  it("polls on a timer, pauses while the tab is hidden, and resumes when it comes back", async () => {
    vi.useFakeTimers();
    try {
      await toggleLive(true);
      expect(polls()).toBe(1);
      await vi.advanceTimersByTimeAsync(2000);
      expect(polls()).toBe(2);
      setVisibility("hidden");
      await vi.advanceTimersByTimeAsync(6000);
      expect(polls()).toBe(2);
      setVisibility("visible");
      await el.updateComplete;
      expect(polls()).toBe(3);
      await vi.advanceTimersByTimeAsync(2000);
      expect(polls()).toBe(4);
      await toggleLive(false);
      await vi.advanceTimersByTimeAsync(6000);
      expect(polls()).toBe(4);
    } finally {
      setVisibility("visible");
      vi.useRealTimers();
    }
  });
});
