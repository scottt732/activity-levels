import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-master-strip";
import "../src/al-meter";
import "../src/al-strip";
import type { AlMasterStrip } from "../src/al-master-strip";
import type { AlMeter } from "../src/al-meter";
import type { AlStrip } from "../src/al-strip";
import type { GainChangeDetail } from "../src/events";

const envelope = { attack: 30, decay: 0, sustain: 1, release: 1800, impulse: false };

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
  let opens: unknown[];
  let gains: unknown[];

  beforeEach(async () => {
    document.body.innerHTML = "";
    selects = [];
    opens = [];
    gains = [];
    bus = document.createElement("div");
    document.body.appendChild(bus);
    el = document.createElement("al-strip");
    el.label = "Downstairs";
    el.sublabel = "bus · 3";
    el.envelope = envelope;
    el.gain = 2;
    bus.appendChild(el);
    collect(bus, "al-select-strip", selects);
    collect(bus, "al-open-strip", opens);
    collect(bus, "al-gain-changed", gains);
    await el.updateComplete;
  });

  it("renders the name, sublabel, sketch and ADSR hint", () => {
    const root = el.shadowRoot;
    expect(root?.querySelector(".name")?.textContent?.trim()).toBe("Downstairs");
    expect(root?.querySelector(".sub")?.textContent?.trim()).toBe("bus · 3");
    expect(root?.querySelector("al-envelope-sketch")).toBeTruthy();
    expect(root?.querySelector(".adsr")?.textContent).toContain("30s");
    expect(root?.querySelector(".adsr")?.textContent).toContain("30m");
  });

  it("falls back to a glyph per kind when the entity has no icon", async () => {
    expect(el.shadowRoot?.querySelector("ha-icon")).toBeFalsy();
    expect(el.shadowRoot?.querySelector(".icon")?.textContent?.trim()).toBe("⚡");
    el.kind = "bus";
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".icon")?.textContent?.trim()).toBe("▤");
  });

  it("prefers the entity's own icon when it has one", async () => {
    el.entityIcon = "mdi:sofa";
    await el.updateComplete;
    const icon = el.shadowRoot?.querySelector(".icon");
    expect(icon?.tagName.toLowerCase()).toBe("ha-icon");
    expect((icon as unknown as { icon?: string }).icon).toBe("mdi:sofa");
    el.entityIcon = null;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("ha-icon")).toBeFalsy();
    expect(el.shadowRoot?.querySelector(".icon")?.textContent?.trim()).toBe("⚡");
  });

  it("is focusable so the mixer can hand it the roving tabindex", () => {
    expect(el.getAttribute("tabindex")).toBe("-1");
    el.tabIndex = 0;
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("hands the fader the gain and re-emits its moves", async () => {
    const fader = el.shadowRoot?.querySelector("al-fader");
    expect(fader?.value).toBe(2);
    fader?.dispatchEvent(new CustomEvent<GainChangeDetail>("value-changed", { detail: { value: 3, live: true } }));
    await el.updateComplete;
    expect(gains).toEqual([{ value: 3, live: true }]);
  });

  it("selects when the strip is clicked", async () => {
    await click(el, ".name");
    expect(selects).toHaveLength(1);
    expect(opens).toHaveLength(0);
  });

  it("offers open only on a bus, and opening does not also select", async () => {
    expect(el.shadowRoot?.querySelector(".open")).toBeFalsy();
    el.kind = "bus";
    await el.updateComplete;
    expect(el.getAttribute("kind")).toBe("bus");
    await click(el, ".open");
    expect(opens).toHaveLength(1);
    expect(selects).toHaveLength(0);
  });

  it("shows a meter only when there is live state", async () => {
    expect(el.shadowRoot?.querySelector("al-meter")).toBeFalsy();
    el.live = { value: 1, max: 5, gated: true };
    await el.updateComplete;
    const meter = el.shadowRoot?.querySelector("al-meter");
    expect(meter?.value).toBe(1);
    expect(meter?.max).toBe(5);
    expect(meter?.gated).toBe(true);
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

  it("shows a meter only when there is live state", async () => {
    expect(el.shadowRoot?.querySelector("al-meter")).toBeFalsy();
    el.live = { value: 2, max: 5, gated: false };
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("al-meter")?.value).toBe(2);
  });
});
