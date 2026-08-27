import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/al-timeline";
import { AlTimeline as AlTimelineClass, computePaths, timelineCache } from "../src/al-timeline";
import type { AlTimeline, TimelineRangeDetail } from "../src/al-timeline";
import type { GroupLive, HomeAssistant, LiveState, ProfileState, TimeseriesResponse } from "../src/types";

/** Minute-aligned: query windows are quantized to the minute, so a round `now` keeps the
    fixtures and the window the element asks for in agreement. */
const NOW = 1_700_000_040;
const DAY = 86_400;

/** A fresh group id per test, so the module-level cache never leaks between them. */
let gidSeq = 0;
const nextGid = (): string => `g${++gidSeq}`;

/**
 * A response shaped like the real endpoint: a bus series ending exactly at `now`, one
 * child, a 96-slot forecast starting at `now`, two day types, one light span in the
 * past and one plan span in the future.
 */
const makeResponse = (gid: string, points = 200): TimeseriesResponse => {
  const start = NOW - DAY;
  const step = DAY / (points - 1);
  const at = (i: number): number => start + i * step;
  return {
    series: {
      [gid]: Array.from({ length: points }, (_, i): [number, number] => [at(i), (i % 10) / 2]),
      [`${gid}_child`]: Array.from({ length: points }, (_, i): [number, number] => [at(i), (i % 5) / 5]),
    },
    forecast: {
      t0: NOW,
      step: 900,
      p25: Array.from({ length: 96 }, (_, i) => (i % 4) / 4),
      p50: Array.from({ length: 96 }, (_, i) => 1 + (i % 4) / 4),
      p75: Array.from({ length: 96 }, (_, i) => 2 + (i % 4) / 4),
    },
    day_types: [
      [NOW - DAY, NOW - DAY / 2, "weekday"],
      [NOW - DAY / 2, NOW + DAY, "weekend"],
    ],
    lights: { "light.den": [[NOW - 3600, NOW - 1800]] },
    plan: [[NOW + 3600, NOW + 5400, "light.den"]],
  };
};

const EMPTY: TimeseriesResponse = { series: {}, forecast: null, day_types: [], lights: {}, plan: [] };

const groupLive = (over: Partial<GroupLive> = {}): GroupLive => ({
  value: 0,
  real_value: 0,
  raw_value: 0,
  active: false,
  gated: false,
  active_voices: 0,
  last_activity: null,
  cooldown_at: null,
  contributors: {},
  name: "House",
  parent_id: null,
  precision: 1,
  max_value: 5,
  mix: "sum",
  next_wake: null,
  lights: 0,
  ...over,
});

/** One live frame: `now`, and the selected group reading `value`. */
const liveFor = (gid: string, now: number, value: number, over: Partial<GroupLive> = {}): LiveState => ({
  now,
  groups: { [gid]: groupLive({ value, ...over }) },
  voices: {},
});

interface Harness {
  hass: HomeAssistant;
  calls: Record<string, unknown>[];
  callWS: ReturnType<typeof vi.fn>;
}

const hassStub = (respond: (msg: Record<string, unknown>) => Promise<TimeseriesResponse>): Harness => {
  const calls: Record<string, unknown>[] = [];
  const callWS = vi.fn((msg: Record<string, unknown>) => {
    calls.push(msg);
    return respond(msg);
  });
  return { hass: { callWS } as unknown as HomeAssistant, calls, callWS };
};

/** Flushes the promise chain the load goes through, without leaning on real timers. */
const settle = async (el: AlTimeline): Promise<void> => {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
    await el.updateComplete;
  }
};

const mount = async (props: Partial<AlTimeline>, harness: Harness): Promise<AlTimeline> => {
  const el = document.createElement("al-timeline");
  el.hass = harness.hass;
  Object.assign(el, props);
  document.body.appendChild(el);
  await settle(el);
  return el;
};

const q = (el: AlTimeline, sel: string): Element | null => el.shadowRoot?.querySelector(sel) ?? null;
const qa = (el: AlTimeline, sel: string): Element[] => [...(el.shadowRoot?.querySelectorAll(sel) ?? [])];
/** jsdom's selector engine does not match a class selector against the `<svg>` root
    itself (it does against its children), so the chart is found by tag. */
const svgOf = (el: AlTimeline): SVGSVGElement => {
  const node = q(el, "svg");
  expect(node, "no chart").toBeTruthy();
  return node as SVGSVGElement;
};

const hover = async (el: AlTimeline, clientX: number): Promise<void> => {
  svgOf(el).dispatchEvent(new MouseEvent("mousemove", { clientX, bubbles: true }));
  await el.updateComplete;
};

const press = async (el: AlTimeline, key: string, shiftKey = false): Promise<void> => {
  svgOf(el).dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true }));
  await el.updateComplete;
};

beforeEach(() => {
  document.body.innerHTML = "";
  timelineCache.clear();
  vi.useFakeTimers({ now: NOW * 1000 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("al-timeline refetch", () => {
  const setVisibility = (value: string): void => {
    Object.defineProperty(document, "visibilityState", { value, configurable: true });
  };

  afterEach(() => setVisibility("visible"));

  /** One element on the 60 s refetch timer, with its first load already answered. */
  const mounted = async (): Promise<{ el: AlTimeline; h: Harness }> => {
    const gid = nextGid();
    const h = hassStub(async (m) => makeResponse(m["group_id"] as string));
    const el = await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    return { el, h };
  };

  it("asks again on its own timer", async () => {
    const { el, h } = await mounted();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
  });

  it("skips the tick while the tab is hidden", async () => {
    const { el, h } = await mounted();
    setVisibility("hidden");
    await vi.advanceTimersByTimeAsync(180_000);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    setVisibility("visible");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
  });

  it("skips the tick while the host has it paused", async () => {
    const { el, h } = await mounted();
    el.paused = true;
    await vi.advanceTimersByTimeAsync(180_000);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    el.paused = false;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
  });
});

describe("al-timeline data loading", () => {
  it("asks for the window the range and horizon describe", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    await mount({ groupId: gid, heading: "House", range: "24h", horizon: "24h" }, h);
    expect(h.calls).toEqual([
      {
        type: "activity_levels/timeseries",
        group_id: gid,
        start: NOW - DAY,
        end: NOW,
        resolution: "5m",
        include_children: true,
        forecast_until: NOW + DAY,
      },
    ]);
  });

  it("drops forecast_until and coarsens the resolution for a longer range", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    await mount({ groupId: gid, range: "7d", horizon: "off" }, h);
    expect(h.calls[0]).toMatchObject({ start: NOW - 7 * DAY, end: NOW, resolution: "1h" });
    expect(h.calls[0]).not.toHaveProperty("forecast_until");
  });

  it("drops the last group's chart when the new group's load fails", async () => {
    const good = nextGid();
    const bad = nextGid();
    const h = hassStub(async (m) => {
      if (m["group_id"] !== good) throw new Error("no recorder data");
      return makeResponse(good);
    });
    const el = await mount({ groupId: good, heading: "House", range: "24h", horizon: "24h" }, h);
    expect(qa(el, "path.bus")).toHaveLength(1);
    el.groupId = bad;
    el.heading = "Garage";
    await settle(el);
    expect(qa(el, "path.bus")).toHaveLength(0);
    expect(q(el, ".error")?.textContent).toContain("no recorder data");
    expect(q(el, ".title")?.textContent?.trim()).toBe("Garage");
    el.remove();
  });

  it("asks nothing and shows a placeholder without a group", async () => {
    const h = hassStub(async () => makeResponse("nobody"));
    const el = await mount({ groupId: null }, h);
    expect(h.calls).toEqual([]);
    expect(el.shadowRoot?.textContent).toContain("Select a strip");
    expect(q(el, "svg")).toBeNull();
  });

  it("quantizes the window to the minute", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    vi.setSystemTime((NOW + 37) * 1000);
    await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    expect(h.calls[0]).toMatchObject({ start: NOW - DAY, end: NOW, forecast_until: NOW + DAY });
  });

  it("serves a second element from the cache within the TTL", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    const first = await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    // Half a minute later: a different instant, but the same quantized window, so the
    // second element must not go back to the server.
    vi.setSystemTime((NOW + 30) * 1000);
    const second = await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    expect(qa(second, "path.bus")).toHaveLength(1);
    first.remove();
    second.remove();
  });

  it("asks again once the window has moved on past the TTL", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    const first = await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    first.remove();
    vi.setSystemTime((NOW + 61) * 1000);
    await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    expect(h.calls[1]).toMatchObject({ start: NOW + 60 - DAY, end: NOW + 60 });
  });

  it("drops entries past the TTL as new ones arrive", async () => {
    const h = hassStub(async (m) => makeResponse(m["group_id"] as string));
    (await mount({ groupId: nextGid(), range: "24h", horizon: "24h" }, h)).remove();
    expect(timelineCache.size).toBe(1);
    vi.setSystemTime((NOW + 61) * 1000);
    (await mount({ groupId: nextGid(), range: "24h", horizon: "24h" }, h)).remove();
    expect(timelineCache.size).toBe(1);
  });

  it("caps the cache and evicts the oldest window first", async () => {
    const h = hassStub(async (m) => makeResponse(m["group_id"] as string));
    const gids = Array.from({ length: 40 }, () => nextGid());
    for (const gid of gids) (await mount({ groupId: gid, range: "24h", horizon: "24h" }, h)).remove();
    expect(h.callWS).toHaveBeenCalledTimes(40);
    expect(timelineCache.size).toBeLessThanOrEqual(32);
    // The newest window is still there; the first one asked for is long gone.
    await mount({ groupId: gids[39]!, range: "24h", horizon: "24h" }, h);
    expect(h.callWS).toHaveBeenCalledTimes(40);
    await mount({ groupId: gids[0]!, range: "24h", horizon: "24h" }, h);
    expect(h.callWS).toHaveBeenCalledTimes(41);
  });

  it("keeps the last good data and shows an inline error when a refetch fails", async () => {
    const gid = nextGid();
    let fail = false;
    const h = hassStub(async () => {
      if (fail) throw new Error("nope");
      return makeResponse(gid);
    });
    const el = await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    expect(q(el, ".error")).toBeNull();
    fail = true;
    el.range = "7d";
    await settle(el);
    expect(q(el, ".error")?.textContent).toContain("nope");
    expect(qa(el, "path.bus")).toHaveLength(1);
  });
});

describe("al-timeline refetch timer", () => {
  it("refetches every 60 s while connected and stops on disconnect", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    const el = await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60_000);
    await settle(el);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
    await vi.advanceTimersByTimeAsync(180_000);
    await settle(el);
    expect(h.callWS).toHaveBeenCalledTimes(2);
  });
});

describe("al-timeline rendering", () => {
  let el: AlTimeline;
  let h: Harness;
  let gid: string;

  beforeEach(async () => {
    gid = nextGid();
    h = hassStub(async () => makeResponse(gid));
    el = await mount({ groupId: gid, heading: "House", range: "24h", horizon: "24h" }, h);
  });

  it("draws the bus, the children, the forecast band and its median", () => {
    expect(qa(el, "path.bus")).toHaveLength(1);
    expect(qa(el, "path.child")).toHaveLength(1);
    expect(qa(el, "polygon.band")).toHaveLength(1);
    expect(qa(el, "path.p50")).toHaveLength(1);
    expect(q(el, "path.p50")?.getAttribute("stroke-dasharray")).toBeTruthy();
    expect(qa(el, "line.now")).toHaveLength(1);
  });

  it("shades the day types and lists them in a legend", () => {
    expect(qa(el, "rect.daytype")).toHaveLength(2);
    expect(qa(el, ".legend-item").map((n) => n.textContent?.trim())).toEqual(["weekday", "weekend"]);
  });

  it("draws light history solid and the simulation plan faded", () => {
    expect(qa(el, "rect.light")).toHaveLength(1);
    expect(qa(el, "rect.plan")).toHaveLength(1);
    const opacity = (n: Element | null): number => Number(n?.getAttribute("opacity"));
    expect(opacity(q(el, "rect.light"))).toBeGreaterThan(opacity(q(el, "rect.plan")));
  });

  it("labels itself for assistive technology and takes keyboard focus", () => {
    const svg = svgOf(el);
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("House activity, 24h history, 24h forecast");
    expect(svg.getAttribute("tabindex")).toBe("0");
  });

  it("hides the children and the light strip when their toggles are off", async () => {
    el.showChannels = false;
    el.showLights = false;
    await settle(el);
    expect(qa(el, "path.child")).toHaveLength(0);
    expect(qa(el, "rect.light")).toHaveLength(0);
    expect(qa(el, "rect.plan")).toHaveLength(0);
    expect(qa(el, "path.bus")).toHaveLength(1);
  });

  it("draws y ticks at 0, half and full scale and three time labels", () => {
    expect(qa(el, "text.ytick").map((n) => n.textContent?.trim())).toEqual(["5", "2.5", "0"]);
    expect(qa(el, "text.xlabel")).toHaveLength(3);
  });
});

describe("al-timeline live refetch", () => {
  const setVisibility = (value: string): void => {
    Object.defineProperty(document, "visibilityState", { value, configurable: true });
  };
  afterEach(() => setVisibility("visible"));

  /** A mounted chart whose first load has been answered, watching `gid` at 1.0. */
  const watching = async (): Promise<{ el: AlTimeline; h: Harness; gid: string }> => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    const el = await mount(
      { groupId: gid, range: "24h", horizon: "24h", live: liveFor(gid, NOW, 1) },
      h,
    );
    expect(h.callWS).toHaveBeenCalledTimes(1);
    return { el, h, gid };
  };

  /** A new live frame `seconds` on, reading `value`. */
  const frame = async (el: AlTimeline, gid: string, seconds: number, value: number): Promise<void> => {
    el.live = liveFor(gid, NOW + seconds, value);
    await el.updateComplete;
  };

  it("asks the recorder to catch up 10 s after the live value moves", async () => {
    const { el, h, gid } = await watching();
    await frame(el, gid, 1, 1.2);
    await vi.advanceTimersByTimeAsync(9_000);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
  });

  it("bypasses the cache, so the second ask actually reaches the server", async () => {
    const { el, h, gid } = await watching();
    await frame(el, gid, 1, 1.2);
    await vi.advanceTimersByTimeAsync(10_000);
    // Same minute, so the same quantized window and the same cache key as the first load:
    // a second call can only mean the forced path went past the entry it would have hit.
    expect(h.callWS).toHaveBeenCalledTimes(2);
    expect(h.calls[1]).toEqual(h.calls[0]);
    el.remove();
  });

  it("sits still for a move smaller than half a display step", async () => {
    const { el, h, gid } = await watching();
    // Half a step at 1 dp is 0.05, and neither frame is that far from the 1.0 baseline.
    await frame(el, gid, 1, 1.02);
    await frame(el, gid, 2, 1.04);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    el.remove();
  });

  it("reads the step off the group's own precision", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    const el = await mount(
      {
        groupId: gid,
        range: "24h",
        horizon: "24h",
        live: { now: NOW, groups: { [gid]: groupLive({ value: 1, precision: 2 }) }, voices: {} },
      },
      h,
    );
    // 0.01 moves half a step at 2 dp, where it would be far too small at 1 dp.
    el.live = { now: NOW + 1, groups: { [gid]: groupLive({ value: 1.01, precision: 2 }) }, voices: {} };
    await el.updateComplete;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
  });

  it("coalesces every move inside the 10 s into one refetch", async () => {
    const { el, h, gid } = await watching();
    await frame(el, gid, 1, 1.2);
    await vi.advanceTimersByTimeAsync(4_000);
    await frame(el, gid, 5, 2.4);
    await vi.advanceTimersByTimeAsync(4_000);
    await frame(el, gid, 9, 3.6);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    // …and the timer is free again for the next move.
    await frame(el, gid, 12, 4.8);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(3);
    el.remove();
  });

  it("drops the pending refetch on disconnect", async () => {
    const { el, h, gid } = await watching();
    await frame(el, gid, 1, 1.2);
    el.remove();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(h.callWS).toHaveBeenCalledTimes(1);
  });

  it("drops the pending refetch when the selection moves to another group", async () => {
    const { el, h, gid } = await watching();
    await frame(el, gid, 1, 1.2);
    el.groupId = nextGid();
    await settle(el);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
  });

  it("skips the refetch while the host has it paused", async () => {
    const { el, h, gid } = await watching();
    el.paused = true;
    await frame(el, gid, 1, 1.2);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    el.paused = false;
    await frame(el, gid, 12, 2.4);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
  });

  it("skips the refetch while the tab is hidden", async () => {
    const { el, h, gid } = await watching();
    setVisibility("hidden");
    await frame(el, gid, 1, 1.2);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    setVisibility("visible");
    await frame(el, gid, 12, 2.4);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    el.remove();
  });

  it("does not refetch just because a live frame arrived", async () => {
    const { el, h, gid } = await watching();
    await frame(el, gid, 1, 1);
    await frame(el, gid, 2, 1);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    el.remove();
  });
});

describe("al-timeline live tail", () => {
  /** The chart is 800 wide with 32 of left margin, so the plot spans 768px of 48h. */
  const tailD = (el: AlTimeline): string => q(el, "path.tail")?.getAttribute("d") ?? "";

  const mountWith = async (live: LiveState | null, data?: TimeseriesResponse): Promise<AlTimeline> => {
    const gid = nextGid();
    const h = hassStub(async () => data ?? makeResponse(gid));
    return mount({ groupId: gid, heading: "House", range: "24h", horizon: "24h", live }, h);
  };

  it("continues the history line from its last sample to the live reading", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    const el = await mount(
      { groupId: gid, heading: "House", range: "24h", horizon: "24h", live: liveFor(gid, NOW + 30, 2.5) },
      h,
    );
    const bus = q(el, "path.bus")?.getAttribute("d") ?? "";
    const d = tailD(el);
    expect(d.split(" ")).toHaveLength(2);
    // It starts exactly where the recorded line stopped: it is that line, continued.
    expect(d.split(" ")[0]).toBe(`M${bus.split(" ").at(-1)!.slice(1)}`);
    // …and ends at (now, value): 30s past the middle of a 48h plot, at half of a 5 scale.
    expect(d.split(" ")[1]).toBe(`L${((DAY + 30) / (2 * DAY)) * 768},96`);
    el.remove();
  });

  it("is drawn in the history line's own style, being that line continued", () => {
    const sheet = String([AlTimelineClass.styles]).replace(/\s+/g, " ");
    expect(sheet).toContain("path.bus, path.tail {");
  });

  it("leaves the tail off when the line on screen is not this group's history", async () => {
    // The live frame names a group the response did not key its bus by: nothing to continue.
    const el = await mountWith(liveFor("nobody", NOW + 30, 2.5));
    expect(q(el, "path.tail")).toBeNull();
    el.remove();
  });

  it("leaves the tail off without a live frame, an entry for the group, or any history", async () => {
    const none = await mountWith(null);
    expect(q(none, "path.tail")).toBeNull();
    none.remove();

    const gid = nextGid();
    const empty = await mount(
      { groupId: gid, range: "24h", horizon: "24h", live: { now: NOW + 30, groups: {}, voices: {} } },
      hassStub(async () => makeResponse(gid)),
    );
    expect(q(empty, "path.tail")).toBeNull();
    empty.remove();

    const noHistory = await mountWith(liveFor("x", NOW + 30, 2.5), EMPTY);
    expect(q(noHistory, "path.tail")).toBeNull();
    noHistory.remove();
  });

  it("leaves the tail off when the recorded history already reaches the live frame", async () => {
    const gid = nextGid();
    const el = await mount(
      { groupId: gid, range: "24h", horizon: "24h", live: liveFor(gid, NOW - 60, 2.5) },
      hassStub(async () => makeResponse(gid)),
    );
    expect(q(el, "path.tail")).toBeNull();
    el.remove();
  });

  it("draws nothing rather than a tail across the forecast when the live frame is off the window", async () => {
    const gid = nextGid();
    const el = await mount(
      { groupId: gid, range: "24h", horizon: "24h", live: liveFor(gid, NOW + 2 * DAY, 2.5) },
      hassStub(async () => makeResponse(gid)),
    );
    expect(q(el, "path.tail")).toBeNull();
    el.remove();
  });

  it("redraws the tail on every live frame without going back to the server", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid));
    const el = await mount(
      { groupId: gid, range: "24h", horizon: "24h", live: liveFor(gid, NOW + 10, 1) },
      h,
    );
    const first = tailD(el);
    el.live = liveFor(gid, NOW + 20, 4);
    await el.updateComplete;
    expect(tailD(el)).not.toBe(first);
    expect(h.callWS).toHaveBeenCalledTimes(1);
    el.remove();
  });
});

describe("al-timeline cursor", () => {
  let el: AlTimeline;
  let gid: string;

  beforeEach(async () => {
    gid = nextGid();
    el = await mount({ groupId: gid, heading: "House", range: "24h", horizon: "24h" }, hassStub(async () => makeResponse(gid)));
  });

  it("has no cursor until the pointer arrives", () => {
    expect(el.cursorIndex).toBeNull();
    expect(q(el, ".tooltip")).toBeNull();
    expect(qa(el, "line.cursor")).toHaveLength(0);
  });

  /** 800 wide, 32 of left margin: the plot starts at 32 and `now` sits at its middle. */
  it("moves the cursor to the sample under the pointer", async () => {
    await hover(el, 32);
    expect(el.cursorIndex).toBe(0);
    await hover(el, 32 + 384);
    expect(el.cursorIndex).toBe(199);
    expect(qa(el, "line.cursor")).toHaveLength(1);
  });

  it("shows the instant, the bus value, each child and the day type", async () => {
    await hover(el, 32 + 384);
    const tip = q(el, ".tooltip");
    expect(tip?.textContent).toContain(new Date(NOW * 1000).toLocaleString());
    expect(tip?.textContent).toContain("weekend");
    expect(qa(el, ".tooltip .tt-row")).toHaveLength(2);
  });

  it("walks the cursor with the arrow keys and clears it on Escape", async () => {
    await hover(el, 32);
    await press(el, "ArrowRight");
    expect(el.cursorIndex).toBe(1);
    await press(el, "ArrowRight", true);
    expect(el.cursorIndex).toBe(11);
    await press(el, "ArrowLeft");
    expect(el.cursorIndex).toBe(10);
    await press(el, "Escape");
    expect(el.cursorIndex).toBeNull();
  });

  it("starts at the first sample when an arrow arrives with no cursor", async () => {
    await press(el, "ArrowRight");
    expect(el.cursorIndex).toBe(0);
  });

  it("stops at both ends rather than wrapping", async () => {
    await hover(el, 32);
    await press(el, "ArrowLeft");
    expect(el.cursorIndex).toBe(0);
    await hover(el, 32 + 384);
    await press(el, "ArrowRight", true);
    expect(el.cursorIndex).toBe(199);
  });

  it("drops the cursor when the pointer leaves", async () => {
    await hover(el, 100);
    svgOf(el).dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await el.updateComplete;
    expect(el.cursorIndex).toBeNull();
  });
});

describe("al-timeline toolbar", () => {
  let el: AlTimeline;
  let h: Harness;
  let gid: string;
  let events: TimelineRangeDetail[];

  beforeEach(async () => {
    gid = nextGid();
    h = hassStub(async () => makeResponse(gid));
    el = await mount({ groupId: gid, heading: "House", range: "24h", horizon: "24h" }, h);
    events = [];
    el.addEventListener("al-timeline-range", (e) => events.push((e as CustomEvent<TimelineRangeDetail>).detail));
  });

  const chip = (sel: string): HTMLButtonElement => {
    const node = q(el, sel);
    expect(node, `no chip ${sel}`).toBeTruthy();
    return node as HTMLButtonElement;
  };

  it("marks the active range and horizon chips", () => {
    expect(chip('.chip[data-range="24h"]').getAttribute("aria-pressed")).toBe("true");
    expect(chip('.chip[data-range="7d"]').getAttribute("aria-pressed")).toBe("false");
    expect(chip('.chip[data-horizon="24h"]').getAttribute("aria-pressed")).toBe("true");
    expect(chip(".chip.channels").getAttribute("aria-pressed")).toBe("true");
    expect(chip(".chip.lights").getAttribute("aria-pressed")).toBe("true");
  });

  it("announces and applies a range change, refetching the new window", async () => {
    chip('.chip[data-range="7d"]').click();
    await settle(el);
    expect(events).toEqual([{ range: "7d", horizon: "24h", showChannels: true, showLights: true }]);
    expect(el.range).toBe("7d");
    expect(h.calls[1]).toMatchObject({ start: NOW - 7 * DAY, resolution: "1h" });
  });

  it("announces a horizon change", async () => {
    chip('.chip[data-horizon="off"]').click();
    await settle(el);
    expect(events).toEqual([{ range: "24h", horizon: "off", showChannels: true, showLights: true }]);
    expect(h.calls[1]).not.toHaveProperty("forecast_until");
  });

  it("re-requests without children when the channels toggle goes off", async () => {
    chip(".chip.channels").click();
    await settle(el);
    expect(events).toEqual([{ range: "24h", horizon: "24h", showChannels: false, showLights: true }]);
    expect(h.calls[1]).toMatchObject({ include_children: false });
    expect(qa(el, "path.child")).toHaveLength(0);
  });

  it("announces the lights toggle without refetching", async () => {
    chip(".chip.lights").click();
    await settle(el);
    expect(events).toEqual([{ range: "24h", horizon: "24h", showChannels: true, showLights: false }]);
    expect(h.callWS).toHaveBeenCalledTimes(1);
  });
});

describe("al-timeline forecast readiness", () => {
  const trainedFor = (gid: string, days = 21): ProfileState => ({
    trained: true,
    ready: { [gid]: true },
    profile: {
      version: 1,
      producer: { name: "activity_levels", version: "0.4.0" },
      generated_at: 0,
      training_window: [0, 0],
      day_types: ["weekday"],
      slot_minutes: 15,
      groups: { [gid]: { ready: true, days, expected: {}, lights: {} } },
    },
  });

  const horizonChip = (el: AlTimeline, h: string): HTMLButtonElement =>
    q(el, `.chip[data-horizon="${h}"]`) as HTMLButtonElement;

  it("disables the forecast chips and shows a learning hint with no profile at all", async () => {
    const gid = nextGid();
    const el = await mount(
      { groupId: gid, heading: "House", range: "24h", horizon: "24h" },
      hassStub(async () => makeResponse(gid)),
    );
    expect(horizonChip(el, "off").disabled).toBe(false);
    expect(horizonChip(el, "24h").disabled).toBe(true);
    expect(horizonChip(el, "7d").disabled).toBe(true);
    expect(q(el, ".hint")?.textContent?.trim()).toBe("learning… 0/14 days");
    // History is unaffected: the bus line still draws.
    expect(qa(el, "path.bus")).toHaveLength(1);
  });

  it("enables the forecast chips once the profile is trained and knows this group", async () => {
    const gid = nextGid();
    const el = await mount(
      { groupId: gid, heading: "House", range: "24h", horizon: "24h", profileState: trainedFor(gid, 30) },
      hassStub(async () => makeResponse(gid)),
    );
    expect(horizonChip(el, "24h").disabled).toBe(false);
    expect(horizonChip(el, "7d").disabled).toBe(false);
    expect(q(el, ".hint")).toBeNull();
  });

  it("still shows the hint for a trained profile that has no entry for this group", async () => {
    const gid = nextGid();
    const el = await mount(
      { groupId: gid, heading: "House", range: "24h", horizon: "24h", profileState: trainedFor(`${gid}-other`) },
      hassStub(async () => makeResponse(gid)),
    );
    expect(horizonChip(el, "24h").disabled).toBe(true);
    expect(q(el, ".hint")?.textContent?.trim()).toBe("learning… 0/14 days");
  });

  it("reads the day count off the profile and the minimum off the caller", async () => {
    const gid = nextGid();
    const el = await mount(
      {
        groupId: gid,
        heading: "House",
        range: "24h",
        horizon: "24h",
        profileState: { ...trainedFor(gid, 5), trained: false },
        minDays: 30,
      },
      hassStub(async () => makeResponse(gid)),
    );
    expect(q(el, ".hint")?.textContent?.trim()).toBe("learning… 5/30 days");
  });
});

describe("al-timeline cache recency", () => {
  it("keeps an entry that is used again ahead of ones that were not, once the cache is full", async () => {
    const h = hassStub(async (m) => makeResponse(m["group_id"] as string));
    const touched = nextGid();
    (await mount({ groupId: touched, range: "24h", horizon: "24h" }, h)).remove();
    const others = Array.from({ length: 31 }, () => nextGid());
    for (const gid of others) (await mount({ groupId: gid, range: "24h", horizon: "24h" }, h)).remove();
    expect(timelineCache.size).toBe(32);
    const beforeTouch = h.callWS.mock.calls.length;
    // Touched again, still inside the TTL: a hit, and (per the fix) a re-insertion.
    (await mount({ groupId: touched, range: "24h", horizon: "24h" }, h)).remove();
    expect(h.callWS.mock.calls.length).toBe(beforeTouch);
    // Now flood past the cap with entries nobody re-visits.
    const flood = Array.from({ length: 10 }, () => nextGid());
    for (const gid of flood) (await mount({ groupId: gid, range: "24h", horizon: "24h" }, h)).remove();
    expect(timelineCache.size).toBe(32);
    const beforeRecheck = h.callWS.mock.calls.length;
    await mount({ groupId: touched, range: "24h", horizon: "24h" }, h);
    // Still resident: the flood evicted the untouched entries first, not this one.
    expect(h.callWS.mock.calls.length).toBe(beforeRecheck);
  });
});

describe("al-timeline decimation", () => {
  it("never draws more than 2,000 points per series", async () => {
    const gid = nextGid();
    const h = hassStub(async () => makeResponse(gid, 5000));
    const el = await mount({ groupId: gid, range: "24h", horizon: "24h" }, h);
    const d = q(el, "path.bus")?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(0);
    expect(d.split(" ")).toHaveLength(2000);
  });
});

describe("computePaths", () => {
  const gid = "house";
  const win = { start: NOW - DAY, end: NOW, until: NOW + DAY };
  const geom = { width: 800, height: 220, maxValue: 5, showChannels: true };

  it("maps every layer into the plot box", () => {
    const out = computePaths(makeResponse(gid), gid, win, geom);
    expect(out.plotW).toBe(768);
    expect(out.plotH).toBe(192);
    expect(out.bus.d.startsWith("M0,")).toBe(true);
    expect(out.bus.points).toHaveLength(200);
    expect(out.children.map((c) => c.id)).toEqual([`${gid}_child`]);
    expect(out.band).not.toContain("M");
    expect(out.band.split(" ")).toHaveLength(192);
    expect(out.p50.length).toBeGreaterThan(0);
    expect(out.dayTypes.map((r) => r.tag)).toEqual(["weekday", "weekend"]);
    expect(out.dayTypes[0]?.x0).toBe(0);
    expect(out.dayTypes[1]?.x1).toBe(768);
    expect(out.lights).toHaveLength(1);
    expect(out.plan).toHaveLength(1);
    expect(out.x(NOW)).toBe(384);
  });

  it("leaves the children out when they are toggled off", () => {
    const out = computePaths(makeResponse(gid), gid, win, { ...geom, showChannels: false });
    expect(out.children).toEqual([]);
    expect(out.bus.points).toHaveLength(200);
  });

  it("gives each day type its own swatch, reused between the rects and the legend", () => {
    const out = computePaths(makeResponse(gid), gid, win, geom);
    expect(out.legend.map((l) => l.tag)).toEqual(["weekday", "weekend"]);
    expect(out.legend[0]?.fill).not.toBe(out.legend[1]?.fill);
    expect(out.dayTypes[1]?.fill).toBe(out.legend[1]?.fill);
  });

  it("draws nothing for a series the response does not carry and no band without a forecast", () => {
    const empty: TimeseriesResponse = { series: {}, forecast: null, day_types: [], lights: {}, plan: [] };
    const out = computePaths(empty, gid, win, geom);
    expect(out.bus.d).toBe("");
    expect(out.bus.points).toEqual([]);
    expect(out.band).toBe("");
    expect(out.p50).toBe("");
    expect(out.children).toEqual([]);
  });

  it("falls back to the first series when the response does not key one by the group id", () => {
    const data = makeResponse("other");
    const out = computePaths(data, gid, win, geom);
    expect(out.busId).toBe("other");
    expect(out.children.map((c) => c.id)).toEqual(["other_child"]);
  });

  it("decimates a long series before it becomes a path", () => {
    const out = computePaths(makeResponse(gid, 5000), gid, win, geom);
    expect(out.bus.points.length).toBeLessThanOrEqual(2000);
    expect(out.bus.points.length).toBeGreaterThan(1000);
    expect(out.bus.points[0]?.[0]).toBe(NOW - DAY);
    expect(out.bus.points[out.bus.points.length - 1]?.[0]).toBe(NOW);
  });
});
