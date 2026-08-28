import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-fader";
import { FADER_MAX, FADER_MIN, formatGain } from "../src/fader";
import type { AlFader } from "../src/al-fader";
import type { FaderChangeDetail } from "../src/events";

let el: AlFader;
let events: FaderChangeDetail[];

const slider = (): HTMLElement => el.shadowRoot?.querySelector<HTMLElement>('[role="slider"]') as HTMLElement;
const track = (): HTMLElement => el.shadowRoot?.querySelector<HTMLElement>(".track") as HTMLElement;

/** jsdom ships no PointerEvent; the fader only reads `clientY`, which MouseEvent carries. */
const pointer = (type: string, clientY: number): MouseEvent =>
  new MouseEvent(type, { clientY, bubbles: true, composed: true });

/** A 120 px track whose top is at y=100, so y=220 is silence and y=100 is full. */
const stubTrack = (): HTMLElement => {
  const t = track();
  t.getBoundingClientRect = (): DOMRect =>
    ({ top: 100, bottom: 220, left: 0, right: 20, width: 20, height: 120, x: 0, y: 100, toJSON: () => ({}) }) as DOMRect;
  return t;
};

const key = async (k: string, shiftKey = false): Promise<void> => {
  slider().dispatchEvent(new KeyboardEvent("keydown", { key: k, shiftKey, bubbles: true, composed: true }));
  await el.updateComplete;
};

beforeEach(async () => {
  document.body.innerHTML = "";
  events = [];
  el = document.createElement("al-fader");
  el.value = 1;
  el.label = "House gain";
  el.addEventListener("value-changed", (e) => events.push((e as CustomEvent<FaderChangeDetail>).detail));
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-fader semantics", () => {
  it("is an ARIA slider over the fader range", () => {
    const s = slider();
    expect(s.getAttribute("aria-orientation")).toBe("vertical");
    expect(s.getAttribute("aria-valuemin")).toBe(String(FADER_MIN));
    expect(s.getAttribute("aria-valuemax")).toBe(String(FADER_MAX));
    expect(s.getAttribute("aria-valuenow")).toBe("1");
    expect(s.getAttribute("aria-valuetext")).toBe("1.0");
    expect(s.getAttribute("aria-label")).toBe("House gain");
    expect(s.getAttribute("tabindex")).toBe("0");
  });

  it("follows the value the host gives it", async () => {
    el.value = 2.5;
    await el.updateComplete;
    expect(slider().getAttribute("aria-valuenow")).toBe("2.5");
    expect(slider().getAttribute("aria-valuetext")).toBe(formatGain(2.5));
  });

  it("takes itself out of the tab order when the host says it is not focusable", async () => {
    // The strip hands this out with its roving tabindex: only the selected strip's fader
    // is a tab stop, but an unfocusable fader still works under the pointer.
    el.focusable = false;
    await el.updateComplete;
    expect(slider().getAttribute("tabindex")).toBe("-1");
    expect(slider().getAttribute("aria-disabled")).toBe("false");
    await key("ArrowUp");
    expect(events).toHaveLength(1);
  });

  it("takes itself out of the tab order when disabled", async () => {
    el.disabled = true;
    await el.updateComplete;
    expect(slider().getAttribute("tabindex")).toBe("-1");
    expect(slider().getAttribute("aria-disabled")).toBe("true");
    await key("ArrowUp");
    expect(events).toEqual([]);
  });
});

describe("al-fader keyboard", () => {
  it("steps up by a notch and commits the value", async () => {
    await key("ArrowUp");
    expect(events).toEqual([{ value: 1.25, live: false }]);
  });

  it("treats ArrowRight as up and ArrowLeft as down", async () => {
    await key("ArrowRight");
    await key("ArrowLeft");
    expect(events.map((e) => e.value)).toEqual([1.25, 0.8]);
  });

  it("uses the fine step with shift held", async () => {
    await key("ArrowUp", true);
    expect(events[0]?.value).toBe(1.05);
  });

  it("jumps to the extremes with Home and End", async () => {
    await key("Home");
    await key("End");
    expect(events.map((e) => e.value)).toEqual([FADER_MIN, FADER_MAX]);
  });

  it("halves and doubles with PageDown and PageUp, clamped", async () => {
    await key("PageUp");
    await key("PageDown");
    el.value = FADER_MAX;
    await el.updateComplete;
    await key("PageUp");
    expect(events.map((e) => e.value)).toEqual([2, 0.5, FADER_MAX]);
  });

  it("ignores keys it does not own", async () => {
    await key("a");
    await key("Enter");
    expect(events).toEqual([]);
  });
});

describe("al-fader pointer and wheel", () => {
  it("resets to unity gain on double click", async () => {
    el.value = 4;
    await el.updateComplete;
    slider().dispatchEvent(new MouseEvent("dblclick", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(events).toEqual([{ value: 1, live: false }]);
  });

  it("tracks a drag live and commits once on release", async () => {
    const t = stubTrack();
    t.dispatchEvent(pointer("pointerdown", 220));
    await el.updateComplete;
    t.dispatchEvent(pointer("pointermove", 160));
    await el.updateComplete;
    t.dispatchEvent(pointer("pointermove", 100));
    await el.updateComplete;
    expect(events).toEqual([
      { value: FADER_MIN, live: true },
      { value: 1, live: true },
      { value: FADER_MAX, live: true },
    ]);
    t.dispatchEvent(pointer("pointerup", 100));
    await el.updateComplete;
    expect(events[events.length - 1]).toEqual({ value: FADER_MAX, live: false });
  });

  it("shows the dragged value without overwriting the host's value", async () => {
    const t = stubTrack();
    t.dispatchEvent(pointer("pointerdown", 100));
    await el.updateComplete;
    expect(slider().getAttribute("aria-valuenow")).toBe(String(FADER_MAX));
    expect(el.value).toBe(1);
  });

  it("does not repeat a move that lands on the same value", async () => {
    const t = stubTrack();
    t.dispatchEvent(pointer("pointerdown", 160));
    t.dispatchEvent(pointer("pointermove", 160));
    await el.updateComplete;
    expect(events).toEqual([{ value: 1, live: true }]);
  });

  it("ignores a move that is not part of a drag", async () => {
    stubTrack().dispatchEvent(pointer("pointermove", 100));
    await el.updateComplete;
    expect(events).toEqual([]);
  });

  it("steps on the wheel, up for a scroll away from the user", async () => {
    el.dispatchEvent(new WheelEvent("wheel", { deltaY: -1, bubbles: true }));
    el.dispatchEvent(new WheelEvent("wheel", { deltaY: 1, bubbles: true }));
    await el.updateComplete;
    expect(events).toEqual([
      { value: 1.25, live: false },
      { value: 0.8, live: false },
    ]);
  });
});

describe("al-fader in level mode", () => {
  /** A 0…5 level fader at one decimal, the way a strip hands one out. */
  const asLevel = async (over: { value?: number; tick?: number | null } = {}): Promise<void> => {
    el.mode = "level";
    el.max = 5;
    el.precision = 1;
    el.value = over.value ?? 2;
    el.tick = over.tick ?? null;
    el.label = "House level";
    await el.updateComplete;
  };

  it("announces the group's own range and precision", async () => {
    await asLevel();
    const s = slider();
    expect(s.getAttribute("aria-valuemin")).toBe("0");
    expect(s.getAttribute("aria-valuemax")).toBe("5");
    expect(s.getAttribute("aria-valuenow")).toBe("2");
    expect(s.getAttribute("aria-valuetext")).toBe("2.0");
    expect(el.shadowRoot?.querySelector(".value")?.textContent?.trim()).toBe("2.0");
  });

  it("fills the track with the level, not with a log position", async () => {
    await asLevel({ value: 1 });
    expect(el.shadowRoot?.querySelector<HTMLElement>(".fill")?.style.height).toBe("20%");
  });

  it("drops the unity line: there is no unity level", async () => {
    expect(el.shadowRoot?.querySelector(".unity")).toBeTruthy();
    await asLevel();
    expect(el.shadowRoot?.querySelector(".unity")).toBeFalsy();
  });

  it("marks the real value while a simulated one is holding the level up", async () => {
    await asLevel({ value: 4, tick: 1 });
    const tick = el.shadowRoot?.querySelector<HTMLElement>(".tick");
    expect(tick?.style.bottom).toBe("20%");
    expect(tick?.getAttribute("title")).toBe("1.0");
  });

  it("draws no tick when the real value is the value", async () => {
    await asLevel({ value: 2, tick: 2 });
    expect(el.shadowRoot?.querySelector(".tick")).toBeFalsy();
    el.tick = null;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".tick")).toBeFalsy();
  });

  it("steps a tenth of the throw, or one decimal with shift", async () => {
    await asLevel();
    await key("ArrowUp");
    expect(events).toEqual([{ value: 2.5, live: false }]);
    await key("ArrowDown", true);
    expect(events[1]).toEqual({ value: 1.9, live: false });
  });

  it("goes to the floor and the ceiling with Home and End", async () => {
    await asLevel();
    await key("Home");
    await key("End");
    expect(events.map((e) => e.value)).toEqual([0, 5]);
  });

  it("pages by a quarter of the throw", async () => {
    await asLevel();
    await key("PageUp");
    expect(events[0]?.value).toBe(3.3);
  });

  it("ignores a double click: a level has no home to snap back to", async () => {
    await asLevel();
    slider().dispatchEvent(new MouseEvent("dblclick", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(events).toEqual([]);
  });

  it("maps a drag linearly onto the ceiling", async () => {
    await asLevel();
    const t = stubTrack();
    t.dispatchEvent(pointer("pointerdown", 160));
    await el.updateComplete;
    expect(events).toEqual([{ value: 2.5, live: true }]);
    t.dispatchEvent(pointer("pointerup", 160));
    await el.updateComplete;
    expect(events[1]).toEqual({ value: 2.5, live: false });
  });

  it("shows the live value again once the drag is over", async () => {
    await asLevel();
    const t = stubTrack();
    t.dispatchEvent(pointer("pointerdown", 100));
    await el.updateComplete;
    expect(slider().getAttribute("aria-valuenow")).toBe("5");
    t.dispatchEvent(pointer("pointerup", 100));
    await el.updateComplete;
    expect(slider().getAttribute("aria-valuenow")).toBe("2");
  });
});

describe("al-fader read-only", () => {
  beforeEach(async () => {
    el.mode = "level";
    el.max = 5;
    el.precision = 1;
    el.value = 2;
    el.readOnly = true;
    await el.updateComplete;
  });

  it("announces itself as a meter rather than a slider", () => {
    expect(el.shadowRoot?.querySelector('[role="slider"]')).toBeFalsy();
    const meter = el.shadowRoot?.querySelector('[role="meter"]');
    expect(meter?.getAttribute("aria-valuenow")).toBe("2");
    expect(meter?.getAttribute("aria-valuemax")).toBe("5");
    expect(meter?.getAttribute("aria-label")).toBe("House gain");
    // Not a tab stop at all: there is nothing here to operate from the keyboard.
    expect(meter?.hasAttribute("tabindex")).toBe(false);
    expect(el.hasAttribute("readonly")).toBe(true);
  });

  it("draws the fill but no grip", () => {
    expect(el.shadowRoot?.querySelector<HTMLElement>(".fill")?.style.height).toBe("40%");
    expect(el.shadowRoot?.querySelector(".knob")).toBeFalsy();
  });

  it("still marks the value the group would be at without a simulated one", async () => {
    el.tick = 0.5;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".tick")).toBeTruthy();
  });

  it("reports nothing from a drag or a key", async () => {
    const t = stubTrack();
    t.dispatchEvent(pointer("pointerdown", 160));
    t.dispatchEvent(pointer("pointerup", 160));
    el.shadowRoot
      ?.querySelector(".fader")
      ?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, composed: true }));
    await el.updateComplete;
    expect(events).toEqual([]);
  });

  it("is a slider again once the host says it may be moved", async () => {
    el.readOnly = false;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[role="slider"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".knob")).toBeTruthy();
  });
});
