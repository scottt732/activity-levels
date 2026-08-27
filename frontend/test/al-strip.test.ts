import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-master-strip";
import "../src/al-meter";
import { STEP_DEBOUNCE_MS } from "../src/al-strip";
import type { AlFader } from "../src/al-fader";
import type { AlMasterStrip } from "../src/al-master-strip";
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
    el.depth = 1;
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

  it("publishes its depth as a CSS variable and draws a marker for it", async () => {
    expect(el.style.getPropertyValue("--al-depth")).toBe("1");
    expect(el.shadowRoot?.querySelector(".depth")).toBeTruthy();
    el.depth = 3;
    await el.updateComplete;
    expect(el.style.getPropertyValue("--al-depth")).toBe("3");
  });

  it("selects when the strip is clicked", async () => {
    await click(el, ".name");
    expect(selects).toHaveLength(1);
    expect(toggles).toHaveLength(0);
  });

  describe("chevron", () => {
    beforeEach(async () => {
      el.hasChildren = true;
      el.childCount = 3;
      await el.updateComplete;
    });

    it("appears only for a group with children, with the count beside it", async () => {
      expect(el.shadowRoot?.querySelector(".chevron")?.textContent?.trim()).toBe("▸ 3");
      el.expanded = true;
      await el.updateComplete;
      const chevron = el.shadowRoot?.querySelector(".chevron");
      expect(chevron?.textContent?.trim()).toBe("▾ 3");
      expect(chevron?.getAttribute("aria-expanded")).toBe("true");
      el.hasChildren = false;
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector(".chevron")).toBeFalsy();
    });

    it("toggles without also selecting the strip", async () => {
      await click(el, ".chevron");
      expect(toggles).toHaveLength(1);
      expect(selects).toHaveLength(0);
    });

    // The mixer listens for Enter/Space on the whole row; the button already answers them,
    // and both firing would toggle the same track twice.
    it.each(["Enter", " "])("keeps %o typed on the chevron inside the strip", async (key) => {
      const seen: string[] = [];
      bus.addEventListener("keydown", (e) => seen.push((e as KeyboardEvent).key));
      el.shadowRoot
        ?.querySelector(".chevron")
        ?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
      await el.updateComplete;
      expect(seen).toEqual([]);
    });

    it("lets other keys through to the row", async () => {
      const seen: string[] = [];
      bus.addEventListener("keydown", (e) => seen.push((e as KeyboardEvent).key));
      el.shadowRoot
        ?.querySelector(".chevron")
        ?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true }));
      await el.updateComplete;
      expect(seen).toEqual(["ArrowRight"]);
    });
  });

  describe("value fader", () => {
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
    el.hasChildren = true;
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
      "0",
    ]);
    expect(fader().shadowRoot?.querySelector('[role="slider"]')?.getAttribute("tabindex")).toBe("0");
  });
});

describe("al-master-strip", () => {
  let el: AlMasterStrip;
  let bus: HTMLElement;
  let mixes: unknown[];
  let limits: unknown[];
  let sims: unknown[];

  beforeEach(async () => {
    document.body.innerHTML = "";
    mixes = [];
    limits = [];
    sims = [];
    bus = document.createElement("div");
    document.body.appendChild(bus);
    el = document.createElement("al-master-strip");
    el.label = "Property";
    el.mix = "sum";
    el.maxValue = 5;
    el.precision = 1;
    el.lights = 4;
    el.simEntityId = "switch.property_presence_simulation";
    bus.appendChild(el);
    collect(bus, "al-mix-changed", mixes);
    collect(bus, "al-limiter-changed", limits);
    collect(bus, "al-sim-toggled", sims);
    await el.updateComplete;
  });

  it("shows the bus name in caps and the current mix", () => {
    expect(el.shadowRoot?.querySelector(".name")?.textContent?.trim()).toBe("Property");
    expect(el.shadowRoot?.querySelector<HTMLSelectElement>(".mix")?.value).toBe("sum");
  });

  it("emits the chosen mix", async () => {
    const sel = el.shadowRoot?.querySelector<HTMLSelectElement>(".mix");
    expect([...(sel?.options ?? [])].map((o) => o.value)).toEqual(["sum", "max", "mean"]);
    if (sel) sel.value = "max";
    sel?.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    expect(mixes).toEqual([{ mix: "max" }]);
  });

  it("commits the limiter ceiling on change", async () => {
    const input = el.shadowRoot?.querySelector<HTMLInputElement>(".limiter");
    expect(input?.value).toBe("5");
    expect(input?.min).toBe("0.1");
    if (input) input.value = "8";
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    expect(limits).toEqual([{ value: 8 }]);
  });

  it("accepts a fractional ceiling at the floor and above", async () => {
    const input = el.shadowRoot?.querySelector<HTMLInputElement>(".limiter");
    if (input) input.value = "2.5";
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    if (input) input.value = "0.1";
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    expect(limits).toEqual([{ value: 2.5 }, { value: 0.1 }]);
  });

  // `min` is only advice to the browser: a typed or pasted 0 still reaches `.value`, and a
  // ceiling of zero would divide every meter by nothing. Note jsdom sanitizes "abc" on a
  // number input to "", so that case lands on the empty branch rather than the NaN one.
  it.each(["0", "-3", "abc", ""])("refuses %o and puts the committed ceiling back", async (typed) => {
    const input = el.shadowRoot?.querySelector<HTMLInputElement>(".limiter");
    if (input) input.value = typed;
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    expect(limits).toEqual([]);
    expect(input?.value).toBe("5");
  });

  it("hides the simulation switch for a bus with no lights", async () => {
    expect(el.shadowRoot?.querySelector("ha-switch")).toBeTruthy();
    el.lights = 0;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("ha-switch")).toBeFalsy();
  });

  it("emits the simulation toggle and explains a block in the tooltip", async () => {
    el.blockedReason = "quiet hours";
    await el.updateComplete;
    const sw = el.shadowRoot?.querySelector("ha-switch");
    expect(sw?.getAttribute("title")).toBe("quiet hours");
    (sw as unknown as { checked: boolean }).checked = true;
    sw?.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    expect(sims).toEqual([{ on: true }]);
  });

  // The mixer listens for keydown on the whole strip row, so a key typed into one of these
  // controls must not escape and be read as console navigation.
  it.each([".mix", ".limiter"])("keeps keys typed into %s inside the strip", async (sel) => {
    const seen: string[] = [];
    bus.addEventListener("keydown", (e) => seen.push((e as KeyboardEvent).key));
    const node = el.shadowRoot?.querySelector(sel);
    node?.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, composed: true }));
    node?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true }));
    await el.updateComplete;
    expect(seen).toEqual([]);
  });

  it("keeps its own controls out of the tab order until the strip is selected", async () => {
    const stops = (): string[] =>
      [...(el.shadowRoot?.querySelectorAll("select, input, ha-switch") ?? [])].map(
        (n) => n.getAttribute("tabindex") ?? "",
      );
    expect(stops()).toEqual(["-1", "-1", "-1"]);
    el.selected = true;
    await el.updateComplete;
    expect(stops()).toEqual(["0", "0", "0"]);
  });

  it("shows a meter only when there is live state", async () => {
    expect(el.shadowRoot?.querySelector("al-meter")).toBeFalsy();
    el.live = { value: 2, max: 5, gated: false };
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("al-meter")?.value).toBe(2);
  });
});
