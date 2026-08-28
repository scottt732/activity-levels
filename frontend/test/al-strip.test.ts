import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-meter";
import { STEP_DEBOUNCE_MS } from "../src/al-strip";
import type { AlFader } from "../src/al-fader";
import type { AlMeter } from "../src/al-meter";
import type { AlStrip } from "../src/al-strip";
import type { FaderChangeDetail } from "../src/events";

/** Events the mixer listens for on its strip container, so they must reach `document.body`. */
const collect = (node: HTMLElement, type: string, into: unknown[]): void => {
  node.addEventListener(type, (e) => into.push((e as CustomEvent<unknown>).detail));
};

const click = async (host: { shadowRoot: ShadowRoot | null; updateComplete: Promise<boolean> }, sel: string): Promise<void> => {
  const node = host.shadowRoot?.querySelector(sel);
  expect(node, `missing ${sel}`).toBeTruthy();
  node?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
  await host.updateComplete;
};

describe("al-meter", () => {
  let el: AlMeter;
  beforeEach(async () => {
    document.body.innerHTML = "";
    el = document.createElement("al-meter");
    document.body.appendChild(el);
    await el.updateComplete;
  });

  it("is hidden from assistive technology", () => {
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("fills the bar with the fraction of the ceiling", async () => {
    el.value = 0.5;
    el.max = 2;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector<HTMLElement>(".fill")?.style.width).toBe("25%");
  });

  it("clamps over the ceiling and warns near it", async () => {
    el.value = 9;
    el.max = 3;
    await el.updateComplete;
    const fill = el.shadowRoot?.querySelector<HTMLElement>(".fill");
    expect(fill?.style.width).toBe("100%");
    expect(fill?.classList.contains("hot")).toBe(true);
  });

  it("reads a ceiling of zero as empty rather than dividing by it", async () => {
    el.value = 1;
    el.max = 0;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector<HTMLElement>(".fill")?.style.width).toBe("0%");
  });

  it("lights the dot while the group is gated", async () => {
    expect(el.shadowRoot?.querySelector(".dot")?.classList.contains("gated")).toBe(false);
    el.gated = true;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".dot")?.classList.contains("gated")).toBe(true);
  });
});

describe("al-strip", () => {
  let el: AlStrip;
  let bus: HTMLElement;
  let selects: unknown[];
  let toggles: unknown[];
  let levels: unknown[];
  let mutes: unknown[];
  let resets: unknown[];

  const fader = (): AlFader => el.shadowRoot?.querySelector("al-fader") as AlFader;

  /** What the fader reports: `live` moves during a drag, `live: false` for a settled value. */
  const move = async (value: number, live: boolean): Promise<void> => {
    fader().dispatchEvent(new CustomEvent<FaderChangeDetail>("value-changed", { detail: { value, live } }));
    await el.updateComplete;
  };

  beforeEach(async () => {
    document.body.innerHTML = "";
    selects = [];
    toggles = [];
    levels = [];
    mutes = [];
    resets = [];
    bus = document.createElement("div");
    document.body.appendChild(bus);
    el = document.createElement("al-strip");
    el.label = "Downstairs";
    el.value = 2;
    el.realValue = 2;
    el.maxValue = 5;
    el.precision = 1;
    bus.appendChild(el);
    collect(bus, "al-select-strip", selects);
    collect(bus, "al-toggle-strip", toggles);
    collect(bus, "al-level-override", levels);
    collect(bus, "al-mute-toggle", mutes);
    collect(bus, "al-reset", resets);
    await el.updateComplete;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("names the group in plain text, so the name is not a tab stop of its own", () => {
    const name = el.shadowRoot?.querySelector(".name");
    expect(name?.textContent?.trim()).toBe("Downstairs");
    expect(name?.tagName.toLowerCase()).toBe("span");
    expect(el.shadowRoot?.querySelector("button.name")).toBeFalsy();
  });

  it("has none of the old channel-strip furniture", () => {
    const root = el.shadowRoot;
    expect(root?.querySelector("al-envelope-sketch")).toBeFalsy();
    expect(root?.querySelector(".adsr")).toBeFalsy();
    expect(root?.querySelector(".sub")).toBeFalsy();
    expect(root?.querySelector(".open")).toBeFalsy();
    expect(root?.querySelector("al-meter")).toBeFalsy();
  });

  // Depth is the mixer's to draw, as the bands over the row: every strip is the same
  // shape, whatever it is nested under, so nothing on it says where it sits.
  it("draws neither a depth marker nor a chevron of its own", () => {
    expect(el.style.getPropertyValue("--al-depth")).toBe("");
    expect(el.shadowRoot?.querySelector(".depth")).toBeFalsy();
    expect(el.shadowRoot?.querySelector(".chevron")).toBeFalsy();
  });

  it("selects when the strip is clicked", async () => {
    await click(el, ".name");
    expect(selects).toHaveLength(1);
    expect(toggles).toHaveLength(0);
  });

  describe("value fader", () => {
    beforeEach(async () => {
      el.editable = true;
      await el.updateComplete;
    });

    it("is a level fader over the group's own range", () => {
      const f = fader();
      expect(f.mode).toBe("level");
      expect(f.value).toBe(2);
      expect(f.max).toBe(5);
      expect(f.precision).toBe(1);
      expect(f.label).toBe("Downstairs level");
    });

    it("marks the real value when a simulated one is holding the level up", async () => {
      expect(fader().tick).toBe(2);
      el.realValue = 0.5;
      await el.updateComplete;
      expect(fader().tick).toBe(0.5);
    });

    it("reads the level out below the fader, at the group's precision", async () => {
      expect(el.shadowRoot?.querySelector(".readout")?.textContent?.trim()).toBe("2.0");
      el.value = 1.8342;
      el.precision = 2;
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector(".readout")?.textContent?.trim()).toBe("1.83");
    });

    it("follows the live value while nothing is being dragged", async () => {
      el.value = 3.5;
      await el.updateComplete;
      expect(fader().value).toBe(3.5);
      expect(el.shadowRoot?.querySelector(".readout")?.textContent?.trim()).toBe("3.5");
    });

    it("shows the dragged value, and asks for it once on release", async () => {
      await move(4, true);
      expect(fader().value).toBe(4);
      expect(el.shadowRoot?.querySelector(".readout")?.textContent?.trim()).toBe("4.0");
      expect(levels).toEqual([]);
      await move(4.5, true);
      await move(4.5, false);
      expect(levels).toEqual([{ value: 4.5 }]);
    });

    it("keeps the dragged value against a live frame arriving mid-drag", async () => {
      await move(4, true);
      el.value = 1;
      await el.updateComplete;
      expect(fader().value).toBe(4);
    });

    it("snaps back to the live value on the next frame after the drag", async () => {
      await move(4, true);
      await move(4, false);
      el.value = 1;
      await el.updateComplete;
      expect(fader().value).toBe(1);
    });

    // A frame answers the ask by arriving, not by carrying a different number: a MAX group
    // pulled below a louder child, or an override the engine refused, leaves the level
    // exactly where it was. Waiting for it to move would strand the fader at the ask.
    it("snaps back on a frame that carries the same value it did before", async () => {
      await move(4, true);
      await move(4, false);
      el.liveNow = 1000;
      await el.updateComplete;
      expect(fader().value).toBe(2);
      expect(el.shadowRoot?.querySelector(".readout")?.textContent?.trim()).toBe("2.0");
    });

    it("keeps the dragged value against a frame arriving mid-drag", async () => {
      await move(4, true);
      el.liveNow = 1000;
      await el.updateComplete;
      expect(fader().value).toBe(4);
    });

    it("shows the level the engine actually reached, and lets a refusal go", async () => {
      await move(4, true);
      await move(4, false);
      el.settle(4.8);
      await el.updateComplete;
      expect(fader().value).toBe(4.8);
      el.settle(null);
      await el.updateComplete;
      expect(fader().value).toBe(2);
    });

    it("leaves a settled answer alone while a new drag holds the fader", async () => {
      await move(4, true);
      el.settle(1);
      await el.updateComplete;
      expect(fader().value).toBe(4);
    });

    it("coalesces a run of keyboard steps into one override", async () => {
      vi.useFakeTimers();
      await move(2.5, false);
      await move(3, false);
      expect(levels).toEqual([]);
      await vi.advanceTimersByTimeAsync(STEP_DEBOUNCE_MS);
      expect(levels).toEqual([{ value: 3 }]);
    });

    it("steps on from where the last step left it, not from the stale live value", async () => {
      vi.useFakeTimers();
      await move(2.5, false);
      expect(fader().value).toBe(2.5);
      await vi.advanceTimersByTimeAsync(STEP_DEBOUNCE_MS);
      expect(levels).toEqual([{ value: 2.5 }]);
    });

    it("does not hold up a release behind the debounce", async () => {
      vi.useFakeTimers();
      await move(4, true);
      await move(4, false);
      expect(levels).toEqual([{ value: 4 }]);
    });

    it("drops a pending step when the strip goes away", async () => {
      vi.useFakeTimers();
      await move(3, false);
      el.remove();
      await vi.advanceTimersByTimeAsync(STEP_DEBOUNCE_MS * 4);
      expect(levels).toEqual([]);
    });
  });

  describe("mute and reset", () => {
    beforeEach(async () => {
      el.editable = true;
      await el.updateComplete;
    });

    it("shows the mute as a pressed toggle and asks for the other state", async () => {
      const mute = (): Element | null | undefined => el.shadowRoot?.querySelector(".mute");
      expect(mute()?.getAttribute("aria-pressed")).toBe("false");
      await click(el, ".mute");
      expect(mutes).toEqual([{ muted: true }]);
      el.muted = true;
      await el.updateComplete;
      expect(mute()?.getAttribute("aria-pressed")).toBe("true");
      expect(el.hasAttribute("muted")).toBe(true);
      await click(el, ".mute");
      expect(mutes).toEqual([{ muted: true }, { muted: false }]);
    });

    it("asks for a reset", async () => {
      await click(el, ".reset");
      expect(resets).toEqual([null]);
    });
  });

  it("badges the validation errors below it", async () => {
    expect(el.shadowRoot?.querySelector(".badge")).toBeFalsy();
    el.errors = 2;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".badge")?.textContent?.trim()).toBe("2");
  });

  it("reflects selection so the outline can be styled", async () => {
    el.selected = true;
    await el.updateComplete;
    expect(el.hasAttribute("selected")).toBe(true);
  });

  it("is focusable so the mixer can hand it the roving tabindex", () => {
    expect(el.getAttribute("tabindex")).toBe("-1");
    el.tabIndex = 0;
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("keeps its own controls out of the tab order until the strip is selected", async () => {
    el.editable = true;
    await el.updateComplete;
    await fader().updateComplete;
    expect(el.shadowRoot?.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
    expect(fader().shadowRoot?.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
    el.selected = true;
    await el.updateComplete;
    await fader().updateComplete;
    expect([...(el.shadowRoot?.querySelectorAll("button") ?? [])].map((b) => b.getAttribute("tabindex"))).toEqual([
      "0",
      "0",
    ]);
    expect(fader().shadowRoot?.querySelector('[role="slider"]')?.getAttribute("tabindex")).toBe("0");
  });

  describe("read-only, which is how it starts", () => {
    it("shows the level as a meter, with no fader to take hold of", async () => {
      expect(el.editable).toBe(false);
      await fader().updateComplete;
      expect(fader().hasAttribute("readonly")).toBe(true);
      expect(fader().shadowRoot?.querySelector('[role="slider"]')).toBeFalsy();
      expect(fader().shadowRoot?.querySelector('[role="meter"]')).toBeTruthy();
      // The reading itself is still there, on the fader and under it.
      expect(el.shadowRoot?.querySelector(".readout")?.textContent?.trim()).toBe("2.0");
    });

    it("has no mute or reset button at all", () => {
      expect(el.shadowRoot?.querySelector(".mute")).toBeFalsy();
      expect(el.shadowRoot?.querySelector(".reset")).toBeFalsy();
      expect(el.shadowRoot?.querySelectorAll("button")).toHaveLength(0);
    });

    it("still selects when it is clicked", async () => {
      await click(el, ".name");
      expect(selects).toHaveLength(1);
    });

    // Nothing should reach the fader here, but the level is the engine's: a move that got
    // through some other way must still not be sent as an override.
    it("asks for no override however the fader reports a move", async () => {
      await move(4, true);
      await move(4, false);
      expect(levels).toEqual([]);
      expect(fader().value).toBe(2);
    });

    it("drops a pending step when Edit is switched back off", async () => {
      vi.useFakeTimers();
      el.editable = true;
      await el.updateComplete;
      await move(3, false);
      el.editable = false;
      await el.updateComplete;
      await vi.advanceTimersByTimeAsync(STEP_DEBOUNCE_MS * 4);
      expect(levels).toEqual([]);
      expect(fader().value).toBe(2);
    });

    it("puts the console back when Edit is switched on", async () => {
      el.editable = true;
      await el.updateComplete;
      await fader().updateComplete;
      expect(el.hasAttribute("editable")).toBe(true);
      expect(fader().hasAttribute("readonly")).toBe(false);
      expect(el.shadowRoot?.querySelector(".mute")).toBeTruthy();
      expect(el.shadowRoot?.querySelector(".reset")).toBeTruthy();
    });
  });
});
