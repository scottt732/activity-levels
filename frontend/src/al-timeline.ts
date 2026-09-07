import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getTimeseries } from "./api";
import { formatLevel } from "./model";
import { DEFAULT_MIN_DAYS } from "./constants";
import { alTimelineRange } from "./events";
import { boundWindow, sampleAt, zoomWindow } from "./transport";
import type { TransportDetail, TransportWindow } from "./transport";
import { sharedStyles } from "./styles";
import {
  bandPolygon,
  cacheKey,
  decimate,
  forecastLine,
  liveTail,
  nearestIndex,
  pathFor,
  spanRects,
  windowFor,
  xScale,
  yScale,
} from "./timeseries";
import type { PropertyValues, TemplateResult } from "lit";
import type { TimeseriesQuery } from "./api";
import type { Horizon, Range } from "./timeseries";
import type { HomeAssistant, LiveState, ProfileState, TimeseriesResponse } from "./types";

/** Room for the y tick labels at the left and the light strip + time labels at the foot. */
const MARGIN_LEFT = 32;
const MARGIN_BOTTOM = 28;
/** The light strip sits in the bottom margin, clear of the plot itself. */
const STRIP_OFFSET = 4;
const STRIP_HEIGHT = 8;
/** What jsdom (and anything else without a `ResizeObserver`) draws against. */
const FALLBACK_WIDTH = 800;
const HEIGHT = 220;
const NARROW_HEIGHT = 160;
/** More points than this in one path is more than the display can resolve anyway. */
const MAX_POINTS = 2000;
const REFETCH_MS = 60_000;
/**
 * How long after the live value moves the recorder is asked to catch up. Long enough that
 * a burst of movement costs one round trip, short enough that the tail is not left
 * carrying the chart on its own.
 */
const LIVE_REFETCH_MS = 10_000;
const CACHE_TTL_MS = 60_000;
/** Enough for a few strips at a few ranges; past that the oldest entries are dropped. */
const CACHE_MAX = 32;

const RANGES: Range[] = ["24h", "7d", "30d"];
const HORIZONS: Horizon[] = ["off", "24h", "7d"];

/**
 * Day types are shaded rather than coloured: the chart's information is the lines, and a
 * background that competes with them makes both harder to read. Two alternating alphas
 * are enough to tell "this stretch is a different kind of day" at a glance, and the
 * legend carries the names.
 */
const DAY_TYPE_FILLS = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"];

/** Faint but distinguishable child lines; the same hue labels the child in the tooltip. */
const childColor = (i: number): string => `hsl(${(i * 67) % 360} 55% 62%)`;

/**
 * Responses are shared by every timeline on the page: switching strips back and forth, or
 * mounting a second chart of the same group, should not re-ask for a window the server
 * answered a moment ago. Keyed by the query, so a different window is a different entry.
 */
const cache = new Map<string, { at: number; data: TimeseriesResponse }>();

/** Requests still in the air, so two elements asking at once cost one round trip. */
const inflight = new Map<string, Promise<TimeseriesResponse>>();

/**
 * Test hook. The cache is module-level state whose bounds are part of this element's
 * contract, so the tests assert on it and clear it between cases. Nothing in the app
 * touches it through this name.
 */
export const timelineCache = cache;

/**
 * Stores a response and keeps the cache bounded: a panel left open all day walks through
 * a new window every minute, so entries have to leave as well as arrive. Anything past
 * the TTL is dead weight and goes first; past that the oldest entries are dropped.
 */
function remember(key: string, data: TimeseriesResponse): void {
  const now = Date.now();
  for (const [k, v] of cache) if (now - v.at >= CACHE_TTL_MS) cache.delete(k);
  // Delete before set so a refreshed key counts as the newest, not its original age.
  cache.delete(key);
  cache.set(key, { at: now, data });
  for (const k of cache.keys()) {
    if (cache.size <= CACHE_MAX) break;
    cache.delete(k);
  }
}

export type { TimelineRangeDetail } from "./events";

/** The time domain the chart draws: history `start`…`end`, then forecast out to `until`. */
export interface TimelineWindow {
  start: number;
  end: number;
  until: number;
}

/** Everything about the drawing that does not depend on the cursor or the live state. */
export interface TimelineGeometry {
  width: number;
  height: number;
  maxValue: number;
  showChannels: boolean;
}

export interface TimelineSeries {
  id: string;
  points: [number, number][];
  d: string;
  color: string;
}

export interface TimelineSpan {
  x0: number;
  x1: number;
  tag: string;
  fill: string;
}

export interface ComputedTimeline {
  busId: string;
  bus: TimelineSeries;
  children: TimelineSeries[];
  band: string;
  p50: string;
  dayTypes: TimelineSpan[];
  legend: { tag: string; fill: string }[];
  lights: { x0: number; x1: number; tag: string }[];
  plan: { x0: number; x1: number; tag: string }[];
  x: (t: number) => number;
  y: (v: number) => number;
  t0: number;
  t1: number;
  plotW: number;
  plotH: number;
}

/**
 * `bandPolygon` speaks SVG path syntax, which is what a `<path>` wants; the band is a
 * closed shape, so it draws as a real `<polygon>` and needs the same vertices as bare
 * "x,y x,y" pairs. Converting once here keeps the Task 1 primitive the only place the
 * band's geometry is decided.
 */
const toPolygonPoints = (d: string): string => (d ? d.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "");

/** An axis label reads as a clock over a day or two and as a date over anything longer. */
const timeLabel = (t: number, span: number): string => {
  const d = new Date(t * 1000);
  return span < 86_400
    ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/** Trims a tick label: `2.5` stays, `5.0` becomes `5`. */
const tick = (v: number): string => String(Math.round(v * 100) / 100);

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/**
 * Turns one response into every path, polygon and rect the chart draws, in plot-local
 * pixels (the caller translates past the left margin). Pure, and the one place the shape
 * of the drawing is decided, so the component can memoise it on its inputs and re-render
 * the cursor and the live "now" line without touching any of this.
 */
export function computePaths(
  data: TimeseriesResponse,
  groupId: string,
  win: TimelineWindow,
  geom: TimelineGeometry,
): ComputedTimeline {
  const plotW = Math.max(1, geom.width - MARGIN_LEFT);
  const plotH = Math.max(1, geom.height - MARGIN_BOTTOM);
  const t0 = win.start;
  const t1 = Math.max(win.until, win.end);
  const x = xScale(t0, t1, plotW);
  const y = yScale(geom.maxValue, plotH);

  const ids = Object.keys(data.series);
  // A response normally keys the bus by the group asked for; if it does not, the first
  // series is the bus rather than dropping the chart on the floor.
  const busId = ids.includes(groupId) ? groupId : (ids[0] ?? groupId);
  const line = (id: string, color: string): TimelineSeries => {
    const points = decimate(data.series[id] ?? [], MAX_POINTS);
    return { id, points, d: pathFor(points, x, y), color };
  };

  const bus = line(busId, "var(--primary-color)");
  const children = geom.showChannels
    ? ids.filter((id) => id !== busId).map((id, i) => line(id, childColor(i)))
    : [];

  const f = data.forecast;
  const band = f ? toPolygonPoints(bandPolygon(f, x, y, MAX_POINTS)) : "";
  const p50 = f ? pathFor(decimate(forecastLine(f, "p50"), MAX_POINTS), x, y) : "";

  const order: string[] = [];
  for (const [, , tag] of data.day_types) if (!order.includes(tag)) order.push(tag);
  const fillOf = (tag: string): string => DAY_TYPE_FILLS[order.indexOf(tag) % DAY_TYPE_FILLS.length]!;
  const dayTypes = spanRects<string>(
    data.day_types.map(([s, e, tag]): [number, number | null, string] => [s, e, tag]),
    x,
    t1,
  ).map((r) => ({ ...r, fill: fillOf(r.tag) }));

  const lights = spanRects<string>(
    Object.entries(data.lights).flatMap(([entity, spans]) =>
      spans.map(([s, e]): [number, number | null, string] => [s, e, entity]),
    ),
    x,
    t1,
  );
  const plan = spanRects<string>(data.plan, x, t1);

  return {
    busId,
    bus,
    children,
    band,
    p50,
    dayTypes,
    legend: order.map((tag) => ({ tag, fill: fillOf(tag) })),
    lights,
    plan,
    x,
    y,
    t0,
    t1,
    plotW,
    plotH,
  };
}

/**
 * Row 1 of the mixer page: one group's history and forecast, drawn as a single overlay
 * chart in plain SVG.
 *
 * The element owns its fetching (a shared 60 s cache plus a 60 s refetch while it is on
 * screen) but not its settings: a chip reports the new range/horizon/toggles as
 * `al-timeline-range` and applies it locally, so the chart is usable on its own while the
 * shell is free to persist the choice.
 */
@customElement("al-timeline")
export class AlTimeline extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        position: relative;
        background: var(--card-background-color, #222);
        border: 1px solid var(--divider-color, #4444);
        border-radius: 12px;
        padding: 12px;
        overflow: hidden;
      }
      .transport { margin-top: 10px; }
      .transport-status { font-size: 0.85em; margin-left: auto; }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }
      .title {
        font-weight: 600;
        margin-right: auto;
      }
      .chips {
        display: flex;
        gap: 2px;
      }
      .chip {
        border: 1px solid var(--divider-color, #4444);
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 0.85em;
        padding: 2px 8px;
        border-radius: 12px;
        cursor: pointer;
      }
      .chip[aria-pressed="true"] {
        color: var(--primary-color);
        border-color: var(--primary-color);
      }
      .chip:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      .chip:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .hint {
        white-space: nowrap;
      }
      /* Too narrow for one row of chips: the forecast controls (and everything after
         them) break onto a second row rather than the toolbar scrolling sideways. */
      :host([narrow]) .chips.horizons {
        flex-basis: 100%;
      }
      svg.chart {
        overflow: hidden;
        display: block;
        width: 100%;
        height: auto;
        touch-action: none;
      }
      svg.chart:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      /* The tail is the bus line continued, so it is the same line to look at. */
      path.bus,
      path.tail {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 2;
        stroke-linejoin: round;
      }
      path.child {
        fill: none;
        stroke-width: 1;
        opacity: 0.35;
      }
      polygon.band {
        fill: rgba(255, 190, 80, 0.18);
        stroke: none;
      }
      path.p50 {
        fill: none;
        stroke: rgba(255, 190, 80, 0.8);
        stroke-width: 1.5;
      }
      line.now {
        stroke: var(--primary-text-color, currentColor);
        stroke-width: 1;
        opacity: 0.5;
      }
      line.cursor {
        stroke: var(--primary-color);
        stroke-width: 1;
        pointer-events: none;
      }
      line.grid {
        stroke: var(--divider-color, currentColor);
        stroke-width: 1;
        opacity: 0.4;
      }
      text.ytick,
      text.xlabel,
      text.now-label {
        fill: var(--secondary-text-color);
        font-size: 10px;
      }
      .legend {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        border: 1px solid var(--divider-color, #4444);
      }
      .tooltip {
        position: absolute;
        top: 34px;
        z-index: 1;
        pointer-events: none;
        background: var(--card-background-color, #222);
        border: 1px solid var(--divider-color, #4444);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 0.8em;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }
      .tooltip.flip {
        transform: translateX(-100%);
      }
      .tt-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .tt-value {
        margin-left: auto;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .tt-swatch {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .placeholder {
        padding: 24px 8px;
        text-align: center;
      }
      .error {
        font-size: 0.8em;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) groupId: string | null = null;
  /** The bus this chart is of, named for the toolbar; `heading` so it is not the host's tooltip. */
  @property({ attribute: false }) heading = "";
  @property({ attribute: false }) labels: Record<string, string> = {};
  @property({ attribute: false }) precisions: Record<string, number> = {};
  @state() private cursorTime: number | null = null;
  @state() private viewport: TransportWindow | null = null;
  private pinnedTime: number | null = null;
  private dragging = false;
  @property({ attribute: false }) range: Range = "7d";
  @property({ attribute: false }) horizon: Horizon = "24h";
  @property({ type: Boolean }) showChannels = true;
  @property({ type: Boolean }) showLights = true;
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ type: Number }) maxValue = 5;
  @property({ attribute: false }) profileState: ProfileState | null = null;
  @property({ type: Number }) minDays = DEFAULT_MIN_DAYS;
  @property({ type: Boolean, reflect: true }) narrow = false;
  /**
   * Set by the host while a save is in flight: the config the current window describes is
   * about to be replaced, so there is nothing worth refreshing into.
   */
  @property({ type: Boolean }) paused = false;

  /** The sample the cursor is on, or `null` for no cursor. Read by tests and the host. */
  @state() cursorIndex: number | null = null;

  @state() private width = FALLBACK_WIDTH;
  @state() private loaded: { q: TimeseriesQuery; data: TimeseriesResponse } | null = null;
  @state() private error: string | null = null;

  private observer?: ResizeObserver;
  private timer?: ReturnType<typeof setInterval>;
  /** The pending "the live value moved" refetch, if one is already on its way. */
  private viewportTimer?: ReturnType<typeof setTimeout>;
  private liveTimer?: ReturnType<typeof setTimeout>;
  /** The live value that refetch was scheduled against; `null` until the first frame. */
  private liveValue: number | null = null;
  /** Only the newest load may write; a slow answer to an old window is dropped. */
  private seq = 0;
  private memo: { key: unknown[]; value: ComputedTimeline } | null = null;

  private get height(): number {
    return this.narrow ? NARROW_HEIGHT : HEIGHT;
  }

  /**
   * Whether a fetch is worth making right now. A background tab has nobody watching the
   * chart, and a save is about to replace the config this window describes: either way the
   * round trip buys nothing. Both the periodic tick and the live refetch ask this.
   */
  private get refetchable(): boolean {
    return !this.paused && document.visibilityState === "visible";
  }

  /**
   * A forecast is only worth showing once the profile has actually seen this group: a
   * document that has never been trained, or one that has been trained but has nothing
   * for this particular group yet (it was just added, say), both read the same way here.
   * History is unaffected either way - it comes straight from the recorder, not the profile.
   */
  private get forecastReady(): boolean {
    const gid = this.groupId;
    const ps = this.profileState;
    if (gid === null || !ps || !ps.trained) return false;
    return ps.profile.groups[gid] !== undefined;
  }

  /** "learning… n/min_days days", or null once the forecast is worth asking for. */
  private get learningHint(): string | null {
    if (this.forecastReady) return null;
    const gid = this.groupId;
    const days = (gid !== null ? this.profileState?.profile.groups[gid]?.days : undefined) ?? 0;
    return `learning… ${days}/${this.minDays} days`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // jsdom has no ResizeObserver, and neither does a very old browser: both draw at the
    // fallback width rather than at zero.
    if (typeof ResizeObserver !== "undefined") {
      this.observer = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? 0;
        if (w > 0) this.width = w;
      });
      this.observer.observe(this);
    }
    this.timer = setInterval(() => {
      if (!this.refetchable) return;
      void this.load();
    }, REFETCH_MS);
    void this.load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    this.resetLiveWatch();
    this.clearViewportTimer();
    this.seq++;
    this.dragging = false;
  }

  /** Forgets the pending refetch and the value it was measured against. */
  private resetLiveWatch(): void {
    if (this.liveTimer !== undefined) clearTimeout(this.liveTimer);
    this.liveTimer = undefined;
    this.liveValue = null;
  }

  /**
   * Schedules the catch-up refetch when the selected group's live value has moved by more
   * than half a display step - less than that rounds to the same readout, so the recorded
   * history is not visibly behind the tail. Everything that moves inside the 10 s rides on
   * the timer the first move started, so a busy group still costs one round trip.
   */
  private watchLive(): void {
    const gid = this.groupId;
    const group = gid === null ? undefined : this.live?.groups[gid];
    if (!group) return;
    const previous = this.liveValue;
    // The first frame is the baseline, not a change: there is nothing to catch up to yet.
    if (previous === null) {
      this.liveValue = group.value;
      return;
    }
    if (Math.abs(group.value - previous) <= Math.pow(10, -group.precision) / 2) return;
    this.liveValue = group.value;
    if (this.liveTimer !== undefined) return;
    this.liveTimer = setTimeout(() => {
      this.liveTimer = undefined;
      // Paused or hidden, the same way the periodic tick is: the next move will ask again.
      if (!this.refetchable) return;
      void this.load(true);
    }, LIVE_REFETCH_MS);
  }

  override willUpdate(changed: PropertyValues<this>): void {
    const windowChanged =
      changed.has("groupId") || changed.has("range") || changed.has("horizon") || changed.has("showChannels");
    // `hass` is replaced on every live poll upstream; only its arrival is a reason to load.
    const hassArrived = changed.has("hass") && changed.get("hass") === undefined && this.hass !== undefined;
    if (windowChanged || hassArrived) {
      // A new group starts from nothing: keeping the last one's response would leave its
      // chart on screen under the new title if this load fails or is slow to answer.
      if (changed.has("groupId")) {
        this.cursorIndex = null;
        this.loaded = null;
      }
      void this.load();
    }
    // Another group's movement is not this one's, and the load above is already the
    // freshest history there is - so the watch starts over rather than firing into it.
    if (changed.has("groupId")) this.resetLiveWatch();
    if (changed.has("live")) this.watchLive();
  }

  private query(groupId: string): TimeseriesQuery {
    // Quantized to the minute: an exact `now` would make every load a new window and a
    // new cache key, so the shared cache could never hit. The "now" line still moves on
    // the real clock — it is drawn from `nowAt`, not from the window.
    const now = Math.floor(Date.now() / 1000 / 60) * 60;
    const w = windowFor(now, this.range, this.horizon);
    if (this.viewport) {
      const end = Math.min(now, this.viewport.end);
      return {
        group_id: groupId,
        start: Math.min(this.viewport.start, end - 3600),
        end,
        resolution: end - Math.min(this.viewport.start, end - 3600) <= 86400 ? "5m" : "1h",
        include_children: this.showChannels,
        ...(this.viewport.end > now ? { forecast_until: Math.min(now + 7 * 86400, this.viewport.end) } : {}),
      };
    }
    return {
      group_id: groupId,
      start: w.start,
      end: w.end,
      resolution: w.resolution,
      include_children: this.showChannels,
      ...(w.forecastUntil !== undefined ? { forecast_until: w.forecastUntil } : {}),
    };
  }

  /**
   * Loads the current window. `force` is the catch-up refetch's path: the point of it is
   * that the recorder has something newer than the answer already in hand, and the shared
   * cache would serve that same answer straight back for the rest of its minute.
   */
  private async load(force = false): Promise<void> {
    const hass = this.hass;
    const groupId = this.groupId;
    if (!hass || groupId === null) return;
    const q = this.query(groupId);
    const key = cacheKey(q);

    const hit = force ? undefined : cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      this.seq++;
      this.loaded = { q, data: hit.data };
      this.error = null;
      // A hit is still a use: re-inserting it keeps it off the front of the eviction
      // queue, so a strip that is actually being watched does not lose its cache entry
      // to one nobody has looked at since.
      remember(key, hit.data);
      return;
    }

    let pending = force ? undefined : inflight.get(key);
    if (!pending) {
      const started = getTimeseries(hass, q);
      pending = started;
      inflight.set(key, started);
      void started
        .then(
          (data) => remember(key, data),
          () => undefined,
        )
        // A forced load overwrote whatever was registered here, so only the request that
        // is still the one in the air may clear the entry.
        .finally(() => {
          if (inflight.get(key) === started) inflight.delete(key);
        });
    }

    const seq = ++this.seq;
    try {
      const data = await pending;
      if (seq !== this.seq) return;
      this.loaded = { q, data };
      this.error = null;
    } catch (err) {
      if (seq !== this.seq) return;
      // The last good window stays on screen: a failed refresh should not blank the chart.
      this.error = (err as Error).message || String(err);
    }
  }

  /** Recomputed only when something it depends on actually changed. */
  private get paths(): ComputedTimeline | null {
    const loaded = this.loaded;
    if (!loaded) return null;
    const key: unknown[] = [
      loaded.data,
      this.viewport,
      loaded.q.group_id,
      loaded.q.start,
      loaded.q.end,
      loaded.q.forecast_until,
      this.width,
      this.height,
      this.maxValue,
      this.showChannels,
    ];
    const memo = this.memo;
    if (memo && memo.key.length === key.length && memo.key.every((v, i) => v === key[i])) return memo.value;
    const value = computePaths(
      loaded.data,
      loaded.q.group_id,
      this.viewport ? { ...this.viewport, until: this.viewport.end } :
      { start: loaded.q.start, end: loaded.q.end, until: loaded.q.forecast_until ?? loaded.q.end },
      { width: this.width, height: this.height, maxValue: this.maxValue, showChannels: this.showChannels },
    );
    this.memo = { key, value };
    return value;
  }

  /**
   * "now" follows the live poll when there is one and the real clock otherwise, so the
   * line keeps moving between refetches even though the window itself is quantized.
   */
  private nowAt(): number {
    return this.live?.now ?? Math.floor(Date.now() / 1000);
  }

  /**
   * The live tail, in plot-local pixels: the recorded line's last sample joined to the
   * reading this live frame carries. It costs no round trip, so it moves on every frame
   * while the recorded history behind it catches up on its own schedule.
   */
  private tailPath(p: ComputedTimeline): string {
    const gid = this.groupId;
    const live = this.live;
    if (gid === null || live === null) return "";
    const group = live.groups[gid];
    // The tail belongs to the line that is drawn; a response that keyed its bus by some
    // other id is not this group's history, so there is nothing to continue.
    if (!group || p.bus.id !== gid) return "";
    return pathFor(liveTail(p.bus.points, live.now, group.value, p.t0, p.t1), p.x, p.y);
  }

  private emitSettings(): void {
    this.dispatchEvent(
      alTimelineRange({
        range: this.range,
        horizon: this.horizon,
        showChannels: this.showChannels,
        showLights: this.showLights,
      }),
    );
  }

  private setRange(range: Range): void {
    if (this.range === range) return;
    this.range = range;
    this.resetTransport();
    this.cursorIndex = null;
    this.emitSettings();
  }

  private setHorizon(horizon: Horizon): void {
    if (this.horizon === horizon) return;
    this.horizon = horizon;
    this.resetTransport();
    this.cursorIndex = null;
    this.emitSettings();
  }

  private toggleChannels(): void {
    this.showChannels = !this.showChannels;
    this.emitSettings();
  }

  private toggleLights(): void {
    this.showLights = !this.showLights;
    this.emitSettings();
  }

  /**
   * The instant under the pointer. The SVG scales to its box, so pixels are converted
   * back through the `viewBox` ratio; a zero-width box (jsdom, a hidden card) reads
   * `clientX` as viewBox units rather than dividing by zero.
   */
  private timeAt(ev: MouseEvent, p: ComputedTimeline): number {
    const target = ev.currentTarget as SVGSVGElement;
    const rect = target.getBoundingClientRect();
    const scale = rect.width > 0 ? this.width / rect.width : 1;
    const px = (ev.clientX - rect.left) * scale - MARGIN_LEFT;
    const ratio = clamp(px / p.plotW, 0, 1);
    return p.t0 + ratio * (p.t1 - p.t0);
  }

  private emitTransport(): void {
    const detail: TransportDetail = { time: this.cursorTime, window: this.viewport };
    this.dispatchEvent(new CustomEvent("al-transport", { detail, bubbles: true, composed: true }));
  }

  private clearViewportTimer(): void {
    if (this.viewportTimer !== undefined) clearTimeout(this.viewportTimer);
    this.viewportTimer = undefined;
  }

  private resetTransport(): void {
    this.clearViewportTimer();
    this.seq++;
    this.viewport = null;
    this.pinnedTime = null;
    this.cursorTime = null;
    this.cursorIndex = null;
    this.emitTransport();
    void this.load();
  }

  private selectTime(time: number | null): void {
    this.cursorTime = time;
    const points = this.paths?.bus.points ?? [];
    this.cursorIndex = time === null || !points.length ? null : nearestIndex(points, time);
    this.emitTransport();
  }

  private onMove(ev: MouseEvent): void {
    const p = this.paths;
    if (!p) return;
    const time = this.timeAt(ev, p);
    if (this.dragging) this.pinnedTime = time;
    this.selectTime(time);
  }

  private onPin(ev: MouseEvent): void {
    const p = this.paths;
    if (!p) return;
    this.pinnedTime = this.timeAt(ev, p);
    this.selectTime(this.pinnedTime);
  }

  private onPointerDown(ev: PointerEvent): void {
    if (ev.button !== 0) return;
    this.dragging = true;
    (ev.currentTarget as Element).setPointerCapture?.(ev.pointerId);
    this.onPin(ev);
  }

  private onPointerUp(ev: PointerEvent): void {
    if (!this.dragging) return;
    this.onPin(ev);
    this.dragging = false;
  }

  private onLeave(): void {
    if (!this.dragging) this.selectTime(this.pinnedTime);
  }

  private changeWindow(window: TransportWindow, immediate = false): void {
    this.clearViewportTimer();
    this.seq++;
    this.viewport = boundWindow(window, Date.now() / 1000);
    this.emitTransport();
    if (immediate) void this.load();
    else this.viewportTimer = setTimeout(() => {
      this.viewportTimer = undefined;
      void this.load();
    }, 100);
  }

  private zoom(factor: number, time?: number): void {
    const p = this.paths;
    if (!p) return;
    this.changeWindow(zoomWindow({ start: p.t0, end: p.t1 }, time ?? this.cursorTime ?? (p.t0 + p.t1) / 2,
      factor, Date.now() / 1000));
  }

  private onWheel(ev: WheelEvent): void {
    const p = this.paths;
    if (!p) return;
    if (ev.ctrlKey || ev.metaKey) {
      ev.preventDefault();
      this.zoom(Math.exp(clamp(ev.deltaY, -100, 100) * 0.01), this.timeAt(ev, p));
    } else if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) {
      ev.preventDefault();
      const delta = ev.deltaX * (ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? p.plotW : 1);
      const offset = delta / p.plotW * (p.t1 - p.t0);
      this.changeWindow({ start: p.t0 + offset, end: p.t1 + offset });
    }
  }

  private jump(days: number): void {
    const p = this.paths;
    if (!p) return;
    const now = Date.now() / 1000;
    const time = Math.min(now + 7 * 86400, (this.cursorTime ?? this.pinnedTime ?? now) + days * 86400);
    this.pinnedTime = time;
    this.selectTime(time);
    const span = p.t1 - p.t0;
    this.changeWindow({ start: time - span / 2, end: time + span / 2 }, true);
  }

  /** ←/→ walk the samples (×10 with Shift) so the tooltip is reachable without a mouse. */
  private onKeyDown(ev: KeyboardEvent): void {
    const p = this.paths;
    if (!p) return;
    if (ev.key === "Escape") {
      if (this.cursorTime === null && this.pinnedTime === null) return;
      ev.preventDefault();
      this.pinnedTime = null;
      this.selectTime(null);
      return;
    }
    const last = p.bus.points.length - 1;
    if (last < 0) return;
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    ev.preventDefault();
    const step = (ev.key === "ArrowRight" ? 1 : -1) * (ev.shiftKey ? 10 : 1);
    // A first arrow press puts the cursor at the end it came from rather than jumping.
    this.cursorIndex =
      this.cursorIndex === null ? (step > 0 ? 0 : last) : clamp(this.cursorIndex + step, 0, last);
    this.pinnedTime = p.bus.points[this.cursorIndex]![0];
    this.selectTime(this.pinnedTime);
  }

  private renderChips(): TemplateResult {
    const hint = this.learningHint;
    return html`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${RANGES.map(
            (r) => html`
              <button
                class="chip range"
                data-range=${r}
                aria-pressed=${this.range === r ? "true" : "false"}
                @click=${() => this.setRange(r)}
              >
                ${r}
              </button>
            `,
          )}
        </div>
        <div class="chips horizons" role="group" aria-label="Forecast horizon">
          ${HORIZONS.map((h) => {
            const disabled = h !== "off" && !this.forecastReady;
            return html`
              <button
                class="chip horizon"
                data-horizon=${h}
                aria-pressed=${this.horizon === h ? "true" : "false"}
                ?disabled=${disabled}
                aria-disabled=${disabled ? "true" : "false"}
                title=${disabled ? (hint ?? "") : ""}
                @click=${() => this.setHorizon(h)}
              >
                ${h}
              </button>
            `;
          })}
        </div>
        ${hint ? html`<span class="muted hint" title=${hint}>${hint}</span>` : nothing}
        <button
          class="chip channels"
          aria-pressed=${this.showChannels ? "true" : "false"}
          @click=${this.toggleChannels}
        >
          channels
        </button>
        <button class="chip lights" aria-pressed=${this.showLights ? "true" : "false"} @click=${this.toggleLights}>
          lights
        </button>
      </div>
    `;
  }

  private renderChart(p: ComputedTimeline): TemplateResult {
    const w = this.width;
    const h = this.height;
    const nowX = p.x(this.nowAt());
    const tail = this.tailPath(p);
    const stripY = p.plotH + STRIP_OFFSET;
    const cursorX = this.cursorTime === null ? null : p.x(this.cursorTime);
    const label = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
    return html`
      <svg
        class="chart"
        viewBox="0 0 ${w} ${h}"
        role="img"
        tabindex="0"
        aria-label=${label}
        @mousemove=${this.onMove}
        @pointermove=${this.onMove}
        @pointerdown=${this.onPointerDown}
        @pointerup=${this.onPointerUp}
        @pointercancel=${() => { this.dragging = false; this.onLeave(); }}
        @lostpointercapture=${() => { this.dragging = false; }}
        @click=${this.onPin}
        @wheel=${this.onWheel}
        @mouseleave=${this.onLeave}
        @keydown=${this.onKeyDown}
      >
        ${[1, 0.5, 0].map(
          (f) => svg`
            <line class="grid" x1=${MARGIN_LEFT} y1=${p.y(this.maxValue * f)} x2=${w} y2=${p.y(this.maxValue * f)}></line>
            <text class="ytick" x=${MARGIN_LEFT - 4} y=${p.y(this.maxValue * f) + 3} text-anchor="end">
              ${tick(this.maxValue * f)}
            </text>
          `,
        )}
        <g transform="translate(${MARGIN_LEFT},0)">
          ${p.dayTypes.map(
            (r) => svg`<rect
              class="daytype"
              x=${r.x0}
              y="0"
              width=${Math.max(0, r.x1 - r.x0)}
              height=${p.plotH}
              fill=${r.fill}
            ></rect>`,
          )}
          ${this.forecastReady && p.band ? svg`<polygon class="band" points=${p.band}></polygon>` : nothing}
          ${this.forecastReady && p.p50 ? svg`<path class="p50" d=${p.p50} stroke-dasharray="4 3"></path>` : nothing}
          ${p.children.map((c) => svg`<path class="child" d=${c.d} stroke=${c.color}></path>`)}
          ${p.bus.d ? svg`<path class="bus" d=${p.bus.d}></path>` : nothing}
          ${tail ? svg`<path class="tail" d=${tail}></path>` : nothing}
          ${this.showLights
            ? p.lights.map(
                (r) => svg`<rect
                  class="light"
                  x=${r.x0}
                  y=${stripY}
                  width=${Math.max(1, r.x1 - r.x0)}
                  height=${STRIP_HEIGHT}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`,
              )
            : nothing}
          ${this.showLights
            ? p.plan.map(
                (r) => svg`<rect
                  class="plan"
                  x=${r.x0}
                  y=${stripY}
                  width=${Math.max(1, r.x1 - r.x0)}
                  height=${STRIP_HEIGHT}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`,
              )
            : nothing}
          ${nowX >= 0 && nowX <= p.plotW ? svg`<line class="now" x1=${nowX} y1="0" x2=${nowX} y2=${p.plotH}></line>
          <text class="now-label" x=${nowX + 3} y="10">now</text>` : nothing}
          ${cursorX === null
            ? nothing
            : svg`<line class="cursor" x1=${cursorX} y1="0" x2=${cursorX} y2=${p.plotH}></line>`}
          ${this.renderXLabels(p)}
        </g>
      </svg>
    `;
  }

  private renderXLabels(p: ComputedTimeline): unknown {
    const y = this.height - 6;
    const stops: [number, string][] = [
      [0, "start"],
      [0.5, "middle"],
      [1, "end"],
    ];
    return stops.map(
      ([f, anchor]) => svg`<text class="xlabel" x=${f * p.plotW} y=${y} text-anchor=${anchor}>
        ${timeLabel(p.t0 + f * (p.t1 - p.t0), p.t1 - p.t0)}
      </text>`,
    );
  }

  private renderTooltip(p: ComputedTimeline): unknown {
    const t = this.cursorTime;
    if (t === null || t < p.t0 || t > p.t1) return nothing;
    const forecast = this.forecastReady ? this.loaded?.data.forecast : null;
    const maxGap = this.loaded?.q.resolution === "5m" ? 600 : 7200;
    const v = t > this.nowAt()
      ? (forecast ? sampleAt(forecastLine(forecast, "p50"), t) : null)
      : sampleAt(p.bus.points, t, maxGap);
    const cx = MARGIN_LEFT + p.x(t);
    const pct = (cx / this.width) * 100;
    const dayType = this.loaded?.data.day_types.find(([s, e]) => t >= s && t < e)?.[2];
    return html`
      <div class="tooltip ${pct > 60 ? "flip" : ""}" style="left: ${pct}%">
        <div class="tt-time">${new Date(t * 1000).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || p.busId}</span>
          <span class="tt-value">${v === null ? "—" : formatLevel(v, this.precisions[p.busId] ?? this.live?.groups[p.busId]?.precision ?? 1)}</span>
        </div>
        ${p.children.slice(0, 5).map((c) => {
          const value = sampleAt(c.points, t, maxGap);
          return value !== null
            ? html`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${c.color}"></span>
                  <span class="tt-name">${this.labels[c.id] ?? c.id.replaceAll("_", " ")}</span>
                  <span class="tt-value">${formatLevel(value, this.precisions[c.id] ?? this.live?.groups[c.id]?.precision ?? 1)}</span>
                </div>
              `
            : nothing;
        })}
        ${p.children.length > 5 ? html`<div class="muted">+${p.children.length - 5} channels</div>` : nothing}
        ${dayType ? html`<div class="tt-daytype muted">${dayType}</div>` : nothing}
      </div>
    `;
  }

  override render(): unknown {
    if (this.groupId === null) {
      return html`<div class="placeholder muted">Select a strip to see its timeline.</div>`;
    }
    const p = this.paths;
    return html`
      ${this.renderChips()}
      ${p ? this.renderChart(p) : html`<div class="placeholder muted">Loading…</div>`}
      <div class="transport toolbar" role="group" aria-label="Timeline transport">
        <button class="chip" aria-label="Zoom out" @click=${() => this.zoom(2)}>−</button>
        <button class="chip" aria-label="Zoom in" @click=${() => this.zoom(0.5)}>+</button>
        ${[-7, -3, -1].map((days) => html`<button class="chip" data-days=${days} @click=${() => this.jump(days)}>${days}d</button>`)}
        <button class="chip transport-now" @click=${this.resetTransport}>Now</button>
        ${[1, 3, 7].map((days) => html`<button class="chip" data-days=${days} @click=${() => this.jump(days)}>+${days}d</button>`)}
        <span class="muted transport-status">${this.cursorTime === null ? "Live" : `${this.cursorTime > this.nowAt() ? "Forecast" : "History"} · ${new Date(this.cursorTime * 1000).toLocaleString()}`}</span>
      </div>
      ${p && p.legend.length > 0
        ? html`
            <div class="legend">
              ${p.legend.map(
                (l) => html`
                  <span class="legend-item">
                    <span class="swatch" style="background: ${l.fill}"></span>${l.tag}
                  </span>
                `,
              )}
            </div>
          `
        : nothing}
      ${this.error ? html`<div class="error">Timeline: ${this.error}</div>` : nothing}
      ${p ? this.renderTooltip(p) : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-timeline": AlTimeline;
  }
}
