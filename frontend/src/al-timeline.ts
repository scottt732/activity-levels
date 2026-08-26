import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getTimeseries } from "./api";
import { alTimelineRange } from "./events";
import { sharedStyles } from "./styles";
import {
  bandPolygon,
  cacheKey,
  decimate,
  forecastLine,
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
import type { HomeAssistant, LiveState, TimeseriesResponse } from "./types";

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
const CACHE_TTL_MS = 60_000;

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
  return span <= 2 * 86_400
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
  const band = f ? toPolygonPoints(bandPolygon(f, x, y)) : "";
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
        background: none;
      }
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
      svg.chart {
        display: block;
        width: 100%;
        height: auto;
        touch-action: none;
      }
      svg.chart:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      path.bus {
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
  @property({ attribute: false }) title = "";
  @property({ attribute: false }) range: Range = "7d";
  @property({ attribute: false }) horizon: Horizon = "24h";
  @property({ type: Boolean }) showChannels = true;
  @property({ type: Boolean }) showLights = true;
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ type: Number }) maxValue = 5;
  @property({ type: Boolean, reflect: true }) narrow = false;

  /** The sample the cursor is on, or `null` for no cursor. Read by tests and the host. */
  @state() cursorIndex: number | null = null;

  @state() private width = FALLBACK_WIDTH;
  @state() private loaded: { q: TimeseriesQuery; data: TimeseriesResponse } | null = null;
  @state() private error: string | null = null;

  private observer?: ResizeObserver;
  private timer?: ReturnType<typeof setInterval>;
  /** Only the newest load may write; a slow answer to an old window is dropped. */
  private seq = 0;
  private memo: { key: unknown[]; value: ComputedTimeline } | null = null;

  private get height(): number {
    return this.narrow ? NARROW_HEIGHT : HEIGHT;
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
    this.timer = setInterval(() => void this.load(), REFETCH_MS);
    void this.load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
  }

  override willUpdate(changed: PropertyValues<this>): void {
    const windowChanged =
      changed.has("groupId") || changed.has("range") || changed.has("horizon") || changed.has("showChannels");
    // `hass` is replaced on every live poll upstream; only its arrival is a reason to load.
    const hassArrived = changed.has("hass") && changed.get("hass") === undefined && this.hass !== undefined;
    if (windowChanged || hassArrived) {
      if (changed.has("groupId")) this.cursorIndex = null;
      void this.load();
    }
  }

  private query(groupId: string): TimeseriesQuery {
    const now = Math.floor(Date.now() / 1000);
    const w = windowFor(now, this.range, this.horizon);
    return {
      group_id: groupId,
      start: w.start,
      end: w.end,
      resolution: w.resolution,
      include_children: this.showChannels,
      ...(w.forecastUntil !== undefined ? { forecast_until: w.forecastUntil } : {}),
    };
  }

  private async load(): Promise<void> {
    const hass = this.hass;
    const groupId = this.groupId;
    if (!hass || groupId === null) return;
    const q = this.query(groupId);
    const key = cacheKey(q);

    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      this.seq++;
      this.loaded = { q, data: hit.data };
      this.error = null;
      return;
    }

    let pending = inflight.get(key);
    if (!pending) {
      pending = getTimeseries(hass, q);
      inflight.set(key, pending);
      void pending
        .then(
          (data) => cache.set(key, { at: Date.now(), data }),
          () => undefined,
        )
        .finally(() => inflight.delete(key));
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
      { start: loaded.q.start, end: loaded.q.end, until: loaded.q.forecast_until ?? loaded.q.end },
      { width: this.width, height: this.height, maxValue: this.maxValue, showChannels: this.showChannels },
    );
    this.memo = { key, value };
    return value;
  }

  /** "now" follows the live poll when there is one, so the line moves between refetches. */
  private nowAt(p: ComputedTimeline): number {
    return clamp(this.live?.now ?? this.loaded?.q.end ?? p.t1, p.t0, p.t1);
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
    this.cursorIndex = null;
    this.emitSettings();
  }

  private setHorizon(horizon: Horizon): void {
    if (this.horizon === horizon) return;
    this.horizon = horizon;
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

  private onMove(ev: MouseEvent): void {
    const p = this.paths;
    if (!p || p.bus.points.length === 0) return;
    this.cursorIndex = nearestIndex(p.bus.points, this.timeAt(ev, p));
  }

  private onLeave(): void {
    this.cursorIndex = null;
  }

  /** ←/→ walk the samples (×10 with Shift) so the tooltip is reachable without a mouse. */
  private onKeyDown(ev: KeyboardEvent): void {
    const p = this.paths;
    if (!p) return;
    const last = p.bus.points.length - 1;
    if (last < 0) return;
    if (ev.key === "Escape") {
      if (this.cursorIndex === null) return;
      ev.preventDefault();
      this.cursorIndex = null;
      return;
    }
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    ev.preventDefault();
    const step = (ev.key === "ArrowRight" ? 1 : -1) * (ev.shiftKey ? 10 : 1);
    // A first arrow press puts the cursor at the end it came from rather than jumping.
    this.cursorIndex =
      this.cursorIndex === null ? (step > 0 ? 0 : last) : clamp(this.cursorIndex + step, 0, last);
  }

  private renderChips(): TemplateResult {
    return html`
      <div class="toolbar">
        <span class="title">${this.title}</span>
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
        <div class="chips" role="group" aria-label="Forecast horizon">
          ${HORIZONS.map(
            (h) => html`
              <button
                class="chip horizon"
                data-horizon=${h}
                aria-pressed=${this.horizon === h ? "true" : "false"}
                @click=${() => this.setHorizon(h)}
              >
                ${h}
              </button>
            `,
          )}
        </div>
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
    const nowX = p.x(this.nowAt(p));
    const stripY = p.plotH + STRIP_OFFSET;
    const cursorX = this.cursorIndex === null ? null : p.x(p.bus.points[this.cursorIndex]?.[0] ?? p.t0);
    const label = `${this.title} activity, ${this.range} history, ${this.horizon} forecast`;
    return html`
      <svg
        class="chart"
        viewBox="0 0 ${w} ${h}"
        role="img"
        tabindex="0"
        aria-label=${label}
        @mousemove=${this.onMove}
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
          ${p.band ? svg`<polygon class="band" points=${p.band}></polygon>` : nothing}
          ${p.p50 ? svg`<path class="p50" d=${p.p50} stroke-dasharray="4 3"></path>` : nothing}
          ${p.children.map((c) => svg`<path class="child" d=${c.d} stroke=${c.color}></path>`)}
          ${p.bus.d ? svg`<path class="bus" d=${p.bus.d}></path>` : nothing}
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
          <line class="now" x1=${nowX} y1="0" x2=${nowX} y2=${p.plotH}></line>
          <text class="now-label" x=${nowX + 3} y="10">now</text>
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
    const i = this.cursorIndex;
    if (i === null) return nothing;
    const point = p.bus.points[i];
    if (!point) return nothing;
    const [t, v] = point;
    const cx = MARGIN_LEFT + p.x(t);
    const pct = (cx / this.width) * 100;
    const dayType = this.loaded?.data.day_types.find(([s, e]) => t >= s && t < e)?.[2];
    return html`
      <div class="tooltip ${pct > 60 ? "flip" : ""}" style="left: ${pct}%">
        <div class="tt-time">${new Date(t * 1000).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.title || p.busId}</span>
          <span class="tt-value">${tick(v)}</span>
        </div>
        ${p.children.map((c) => {
          const j = nearestIndex(c.points, t);
          const cp = c.points[j];
          return cp
            ? html`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${c.color}"></span>
                  <span class="tt-name">${c.id}</span>
                  <span class="tt-value">${tick(cp[1])}</span>
                </div>
              `
            : nothing;
        })}
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
