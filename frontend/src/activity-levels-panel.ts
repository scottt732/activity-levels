import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  callService,
  getConfig,
  getProfile,
  getSimulationLog,
  getState,
  rebuildProfile,
  saveConfig,
  validateConfig,
} from "./api";
import { DEFAULT_MIN_DAYS } from "./constants";
import { simSwitchId } from "./entities";
import { ensureHaElements } from "./ha-elements";
import { effectivePrecision, groupAt, groupPathFor } from "./model";
import { expandTo, reduce, restoreNav, saveExpanded, visibleTracks } from "./navigation";
import { runSave } from "./save-flow";
import { Draft } from "./store";
import { sharedStyles } from "./styles";
import { PreviewData } from "./mixer-preview";
import type { TransportDetail } from "./transport";
import type { AlChangeEvent, CodeStatus, TimelineRangeDetail } from "./events";
import type { MixerNav, NavAction } from "./navigation";
import type { Banner } from "./save-flow";
import type { Horizon, Range } from "./timeseries";
import type {
  Config,
  HomeAssistant,
  LiveState,
  Path,
  ProfileState,
  SimulationLog,
  ValidationError,
} from "./types";

type Tab = "mixer" | "groups" | "envelopes" | "defaults" | "patterns" | "presence" | "paths" | "floorplans" | "code";

/**
 * Every tab, always. Presence used to appear only while it was enabled, which meant the
 * only way to switch it on was to write `presence.enabled` into the options by hand — and
 * the tab is where you turn it on, so it has to be reachable before it is on.
 */
const TABS: Tab[] = ["mixer", "groups", "envelopes", "defaults", "patterns", "presence", "paths", "floorplans", "code"];
const LIVE_POLL_MS = 2000;
const SIM_POLL_MS = 10_000;
/** A profile only changes when it is retrained, so anything fresher than this will do. */
const PROFILE_TTL_MS = 5 * 60_000;
const RELOAD_GRACE_MS = 1500;
/** Where the timeline toolbar's choices survive a reload. */
const TIMELINE_KEY = "activity_levels.timeline";
const RANGES: Range[] = ["24h", "7d", "30d"];
const HORIZONS: Horizon[] = ["off", "24h", "7d"];
const DEFAULT_TIMELINE: TimelineRangeDetail = { range: "7d", horizon: "24h", showChannels: true, showLights: true };

/** Reads back stored timeline settings, rejecting anything this build does not offer. */
function parseTimeline(raw: string | null): TimelineRangeDetail | null {
  if (raw === null) return null;
  const value = JSON.parse(raw) as Partial<TimelineRangeDetail>;
  if (!RANGES.includes(value.range as Range) || !HORIZONS.includes(value.horizon as Horizon)) return null;
  return {
    range: value.range as Range,
    horizon: value.horizon as Horizon,
    showChannels: value.showChannels !== false,
    showLights: value.showLights !== false,
  };
}

@customElement("activity-levels-panel")
export class ActivityLevelsPanel extends LitElement {
  static styles = [sharedStyles];

  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) narrow = false;

  @state() private draft?: Draft;
  /** Ids of the groups whose kind the config loader had to guess. */
  @state() private inferred: string[] = [];
  @state() private warnings: string[] = [];
  @state() private tab: Tab = "mixer";
  @state() private selection: Path | null = null;
  @state() private nav: MixerNav = { expanded: new Set(), selection: null };
  @state() private errors: ValidationError[] = [];
  @state() private banner: Banner | null = null;
  @state() private live: LiveState | null = null;
  @state() private liveOn = false;
  @state() private busy = false;
  @state() private missing: string[] = [];
  @state() private profileState: ProfileState | null = null;
  @state() private simLog: SimulationLog | null = null;
  @state() private timeline: TimelineRangeDetail = DEFAULT_TIMELINE;
  @state() private preview: {time: number; values: Record<string, number | null>; mode: "history" | "forecast"} | null = null;
  @state() private previewError = false;
  private previewData = new PreviewData();
  private previewSeq = 0;
  private transportWindow: TransportDetail["window"] = null;
  private get previewResolution(): "5m" | "1h" {
    const end = Math.min(this.live?.now ?? Date.now() / 1000, this.transportWindow?.end ?? Infinity);
    const span = this.transportWindow ? end - Math.min(this.transportWindow.start, end - 3600) : (this.timeline.range === "24h" ? 86400 : 7 * 86400);
    return span <= 86400 ? "5m" : "1h";
  }
  private previewTimer?: ReturnType<typeof setTimeout>;

  private onTransport = (event: CustomEvent<TransportDetail>): void => {
    const time = event.detail.time;
    this.transportWindow = event.detail.window;
    this.previewSeq++;
    this.previewError = false;
    if (time === null || !Number.isFinite(time)) {
      this.previewData.cancel(); clearTimeout(this.previewTimer); this.previewTimer = undefined;
      this.preview = null; return;
    }
    const now = this.live?.now ?? Date.now() / 1000;
    const ids = this.previewIds(time, now);
    const cached = this.previewData.peek(ids, time, now, this.previewResolution);
    this.preview = {time, values: cached.values, mode: time > now ? "forecast" : "history"};
    if (!cached.complete && this.previewTimer === undefined) this.previewTimer = setTimeout(() => {
      this.previewTimer = undefined;
      if (this.preview) void this.loadPreview(this.preview.time, this.live?.now ?? Date.now() / 1000, this.previewSeq);
    }, 100);
  };

  private previewIds(time: number, now: number): string[] {
    const config = this.draft?.config;
    if (!config) return [];
    const ids = visibleTracks(config, this.nav).map((track) => track.id);
    return time > now ? ids.filter((id) => this.profileState?.trained &&
      Object.keys(this.profileState.profile.groups[id]?.expected ?? {}).length > 0) : ids;
  }

  private async loadPreview(time: number, now: number, seq: number): Promise<void> {
    const config = this.draft?.config;
    if (!config || seq !== this.previewSeq || !this.isConnected) return;
    const ids = this.previewIds(time, now);
    const result = await this.previewData.load(this.hass, ids, time, now, this.previewResolution);
    if (seq !== this.previewSeq || !this.isConnected) return;
    this.preview = {time, values: result.values, mode: time > now ? "forecast" : "history"};
    this.previewError = result.failed;
  }

  private openMixerGroup = (event: CustomEvent<Path>): void => {
    this.select(event.detail);
    this.selectTab(this.tabs.indexOf("groups"));
  };

  private get timelinePrecisions(): Record<string, number> {
    const config = this.draft?.config;
    const precisions: Record<string, number> = {};
    if (!config) return precisions;
    const walk = (groups: Config["groups"]): void => {
      for (const group of groups) {
        precisions[group.id] = this.live?.groups[group.id]?.precision ?? effectivePrecision(config, group);
        walk(group.children);
      }
    };
    walk(config.groups);
    return precisions;
  }

  private get timelineLabels(): Record<string, string> {
    const labels: Record<string, string> = {};
    const walk = (groups: Config["groups"]): void => {
      for (const group of groups) { labels[group.id] = group.name ?? group.id; walk(group.children); }
    };
    walk(this.draft?.config.groups ?? []);
    return labels;
  }
  /**
   * The Code tab's last verdict on the draft, or null when nothing has one. It is separate
   * from {@link errors} because it is the only thing that may *disable* Save: the shared
   * error list also holds what a failed save said, and those stay on screen while the user
   * fixes them in a form, where disabling Save would be a trap with no way out.
   */
  @state() private codeStatus: CodeStatus | null = null;
  /** Whether `ha-yaml-editor` registered. Nothing but the Code tab needs it. */
  @state() private yamlEditor = true;

  /** Which tab the roving tabindex sits on; arrow keys move it without activating. */
  @state() private tabFocus = 0;

  private liveTimer?: number;
  private simTimer?: number;
  /** Which live poll is the current one; an older answer resolving late is dropped. */
  private liveSeq = 0;
  /** When the profile was last read, so switching tabs does not re-ask for it every time. */
  private profileAt = 0;
  private get tabs(): Tab[] {
    return TABS;
  }

  private readonly onVisibilityChange = (): void => this.updatePolling();

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.restoreTimeline();
    const { ok, missing, optionalMissing } = await ensureHaElements();
    this.missing = ok ? [] : missing;
    this.yamlEditor = !optionalMissing.includes("ha-yaml-editor");
    await this.load();
    // Both awaits can outlive the panel: a disconnected element must not start timers.
    if (!this.isConnected) return;
    this.updatePolling();
    void this.refreshProfile();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.clearLiveTimer();
    this.clearSimTimer();
    clearTimeout(this.previewTimer);
    this.previewTimer = undefined;
    this.previewSeq++;
    this.previewData.cancel();
  }

  private async load(): Promise<void> {
    try {
      const { config, inferred, warnings } = await getConfig(this.hass);
      this.draft = new Draft(config);
      this.inferred = inferred;
      this.warnings = warnings;
      this.syncTabs();
      this.nav = restoreNav(config);
      this.selection = this.nav.selection;
      this.errors = [];
      this.codeStatus = null;
      this.banner = null;
    } catch (err) {
      this.banner = { kind: "error", text: `Could not load configuration: ${(err as Error).message}` };
    }
  }

  /**
   * Applies an edit from an editor. A structural one - a node added, removed or moved -
   * invalidates the path-keyed validation errors, which would otherwise stay pinned to
   * rows that have since shifted.
   */
  private onChange = (ev: AlChangeEvent): void => {
    if (ev.structural) this.errors = [];
    // An edit from a form is a draft the Code tab has not seen, so its verdict no longer
    // describes anything. Dropping it is what stops a document that was broken in the
    // editor from leaving Save disabled after it has been fixed somewhere else.
    if (this.tab !== "code") this.codeStatus = null;
    this.setConfig(ev.detail, ev.coalesceKey);
  };

  /** The Code tab's verdict, which both feeds the shared error list and gates Save. */
  private onCodeStatus = (ev: CustomEvent<CodeStatus>): void => {
    this.codeStatus = ev.detail;
    this.errors = ev.detail.errors;
  };

  /** Whether the Code tab is holding Save shut: unparseable text, or a live validation error. */
  private get blocked(): boolean {
    const status = this.codeStatus;
    return status !== null && (!status.valid || status.errors.length > 0);
  }

  private setConfig(next: Config, coalesceKey?: string): void {
    this.draft?.set(next, coalesceKey);
    this.syncNav();
    this.requestUpdate();
  }

  /**
   * Re-points the navigation at the current config after an edit, and keeps the shared
   * selection with it: a node that is gone can neither be a track nor be shown in the
   * editor pane, so the reducer falls back to the first root, and expanded ids that name
   * nothing are dropped. Nothing selected stays nothing selected, though - the reducer
   * falls back to a group, which is right after a deletion but would make the Groups tab's
   * editor pane open itself on the first edit the user makes with no row selected.
   */
  private syncNav(): void {
    this.syncTabs();
    const config = this.draft?.config;
    if (!config) return;
    const had = this.selection;
    const nav = reduce({ ...this.nav, selection: had }, { type: "sync", config });
    this.nav = had === null ? { ...nav, selection: null } : nav;
    this.selection = this.nav.selection !== null && this.nav.selection.length > 0 ? this.nav.selection : null;
  }

  /**
   * Keeps the shown tab in the list. Every tab is listed all the time now, so `this.tab`
   * can no longer fall outside `this.tabs` in practice - but the type only promises `Tab`,
   * not membership in whatever `tabs` happens to be, so this stays the one place that
   * would notice if that ever stopped being true and send the tablist back to Mixer
   * instead of leaving the roving tabindex past the end of the list.
   */
  private syncTabs(): void {
    if (!this.tabs.includes(this.tab)) this.selectTab(0);
  }

  /**
   * One selection for both views. Picking a node in the tree also opens whatever the mixer
   * row needs open for it to be a visible track - a selected strip nobody can see is not a
   * shared selection.
   */
  private select(path: Path | null): void {
    const config = this.draft?.config;
    this.selection = path;
    if (path === null || !config) {
      this.nav = { ...this.nav, selection: path };
      return;
    }
    const expanded = expandTo(config, this.nav.expanded, path);
    // Opening the row to reveal the selection is a change to the expansion like any
    // other, so it is remembered the way the mixer's own toggles are.
    if (expanded !== this.nav.expanded) saveExpanded(expanded);
    this.nav = { expanded, selection: path };
  }

  private onNav = (ev: CustomEvent<NavAction>): void => {
    const nav = reduce(this.nav, ev.detail);
    if (nav.expanded !== this.nav.expanded) saveExpanded(nav.expanded);
    this.nav = nav;
    this.selection = nav.selection;
    if (this.preview) this.onTransport(new CustomEvent("al-transport", {detail: {time: this.preview.time, window: this.transportWindow}}));
  };

  private async save(): Promise<void> {
    const draft = this.draft;
    if (!draft || this.busy || this.blocked) return;
    this.busy = true;
    this.updatePolling();
    try {
      const outcome = await runSave(draft.config, {
        validate: (config) => validateConfig(this.hass, config),
        save: (config) => saveConfig(this.hass, config),
      });
      if (outcome.errors !== null) this.errors = outcome.errors;
      this.banner = outcome.banner;
      if (outcome.reload) {
        await new Promise<void>((resolve) => setTimeout(resolve, RELOAD_GRACE_MS));
        await this.load();
      }
    } finally {
      this.busy = false;
      this.updatePolling();
    }
  }

  private discard(): void {
    if (!this.draft) return;
    this.draft.reset(this.draft.original);
    this.syncNav();
    this.errors = [];
    this.codeStatus = null;
    this.banner = null;
    this.requestUpdate();
  }

  private undo(): void {
    this.draft?.undo();
    // Undo and Redo move the draft from the app bar, which is reachable from every tab —
    // including the Code tab, whose verdict was about the document they just replaced.
    this.codeStatus = null;
    this.syncNav();
    this.requestUpdate();
  }

  private redo(): void {
    this.draft?.redo();
    this.codeStatus = null;
    this.syncNav();
    this.requestUpdate();
  }

  private toggleLive(on: boolean): void {
    this.liveOn = on;
    if (!on && !this.liveRequired) this.live = null;
    this.updatePolling();
  }

  private get liveRequired(): boolean {
    return this.tab === "mixer" || this.tab === "floorplans";
  }

  /** Mixer, Groups and Patterns read the profile and simulation log. */
  private get patternsVisible(): boolean {
    return this.tab === "mixer" || this.tab === "patterns" || this.tab === "groups";
  }

  private updatePolling(): void {
    const awake = !this.busy && document.visibilityState === "visible";
    this.updateLivePolling(awake);
    this.updateSimPolling(awake);
  }

  /**
   * Starts or pauses the live poll to match the current conditions. It runs while the
   * toggle is on - or unconditionally on Mixer and Floorplans, whose readings are the point of the
   * page - as long as no save is in flight (a reload is about to replace the config the
   * frame describes) and the tab is actually on screen. Pausing keeps the last frame, so
   * resuming redraws immediately rather than blanking the meters.
   */
  private updateLivePolling(awake: boolean): void {
    if (!((this.liveOn || this.liveRequired) && awake)) {
      this.clearLiveTimer();
      return;
    }
    if (this.liveTimer !== undefined) return;
    void this.pollLive();
    this.liveTimer = window.setInterval(() => void this.pollLive(), LIVE_POLL_MS);
  }

  /** The simulation log moves at the pace of light switches, so it gets its own slower timer. */
  private updateSimPolling(awake: boolean): void {
    if (!(this.patternsVisible && awake)) {
      this.clearSimTimer();
      return;
    }
    if (this.simTimer !== undefined) return;
    void this.pollSim();
    this.simTimer = window.setInterval(() => void this.pollSim(), SIM_POLL_MS);
  }

  /** A runtime command just landed: show what it did without waiting for the next tick. */
  private onLiveRefresh = (): void => {
    void this.pollLive();
  };

  private async pollLive(): Promise<void> {
    // A command's refresh lands on top of the periodic poll, so two are routinely in
    // flight; only the newest may write, or a slow answer would put a stale frame back
    // on the meters after a fresher one has already drawn.
    const seq = ++this.liveSeq;
    try {
      const state = await getState(this.hass);
      if (seq === this.liveSeq) this.live = state;
    } catch {
      /* transient websocket failure: keep the last frame and retry */
    }
  }

  private async pollSim(): Promise<void> {
    try {
      this.simLog = await getSimulationLog(this.hass);
    } catch {
      /* transient websocket failure: keep the last log and retry */
    }
  }

  private clearLiveTimer(): void {
    if (this.liveTimer === undefined) return;
    clearInterval(this.liveTimer);
    this.liveTimer = undefined;
  }

  private clearSimTimer(): void {
    if (this.simTimer === undefined) return;
    clearInterval(this.simTimer);
    this.simTimer = undefined;
  }

  /** Reads the profile at most every `PROFILE_TTL_MS`, or right now after a rebuild. */
  private async refreshProfile(force = false): Promise<void> {
    if (!this.patternsVisible) return;
    if (!force && this.profileState !== null && Date.now() - this.profileAt < PROFILE_TTL_MS) return;
    try {
      this.profileState = await getProfile(this.hass);
      this.profileAt = Date.now();
    } catch {
      /* keep the document we have: a stale profile still describes the groups */
    }
  }

  private onRebuild = async (ev: CustomEvent<{ force: boolean }>): Promise<void> => {
    try {
      const { rebuilt } = await rebuildProfile(this.hass, ev.detail?.force === true);
      this.banner = rebuilt
        ? { kind: "info", text: "Profile rebuilt." }
        : { kind: "warning", text: "Rebuild skipped (external profile)." };
      await this.refreshProfile(true);
    } catch (err) {
      this.banner = { kind: "error", text: `Could not rebuild the profile: ${(err as Error).message}` };
    }
  };

  /** The simulation switch is Home Assistant's; the strips ask, and only the shell calls it. */
  private onSimToggle = async (ev: CustomEvent<{ gid: string; on: boolean }>): Promise<void> => {
    const { gid, on } = ev.detail;
    try {
      await callService(this.hass, "switch", on ? "turn_on" : "turn_off", { entity_id: simSwitchId(gid) });
    } catch (err) {
      this.banner = {
        kind: "error",
        text: `Could not ${on ? "start" : "stop"} the simulation for ${gid}: ${(err as Error).message}`,
      };
    }
  };

  private restoreTimeline(): void {
    try {
      this.timeline = parseTimeline(localStorage.getItem(TIMELINE_KEY)) ?? DEFAULT_TIMELINE;
    } catch {
      /* unreadable or unparsable storage: the defaults are a fine place to start */
    }
  }

  private onTimelineRange = (ev: CustomEvent<TimelineRangeDetail>): void => {
    this.timeline = ev.detail;
    try {
      localStorage.setItem(TIMELINE_KEY, JSON.stringify(ev.detail));
    } catch {
      /* storage disabled or full: the setting still applies to this session */
    }
  };

  private selectTab(index: number): void {
    const next = this.tabs[index];
    if (next === undefined) return;
    // Mixer and Floorplans poll whether or not Live is on, so leaving with Live off would strand
    // the last frame on the other tabs' meters, where it would read as current.
    if (next !== "mixer" && next !== "floorplans" && !this.liveOn) this.live = null;
    if (next !== "mixer") {
      clearTimeout(this.previewTimer);
      this.previewTimer = undefined;
      this.previewSeq++;
      this.previewData.cancel();
      this.preview = null;
    }
    this.tab = next;
    this.tabFocus = index;
    this.updatePolling();
    void this.refreshProfile();
  }

  /** Moves the roving tabindex, and the focus with it, without changing the shown tab. */
  private focusTab(index: number): void {
    this.tabFocus = index;
    void this.updateComplete.then(() => {
      this.renderRoot.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
    });
  }

  /** Manual-activation tablist: arrows (and Home/End) move, Enter/Space activate. */
  private onTabsKeydown = (ev: KeyboardEvent): void => {
    const last = this.tabs.length - 1;
    switch (ev.key) {
      case "ArrowRight":
        this.focusTab((this.tabFocus + 1) % this.tabs.length);
        break;
      case "ArrowLeft":
        this.focusTab((this.tabFocus + last) % this.tabs.length);
        break;
      case "Home":
        this.focusTab(0);
        break;
      case "End":
        this.focusTab(last);
        break;
      case "Enter":
      case " ":
        this.selectTab(this.tabFocus);
        break;
      default:
        return;
    }
    ev.preventDefault();
  };

  override render() {
    if (this.missing.length) return this.renderMissing();
    const d = this.draft;
    return html`
      <ha-top-app-bar-fixed .narrow=${this.narrow}>
        <ha-menu-button slot="navigationIcon"></ha-menu-button>
        <div slot="title">Activity Levels</div>
        <div slot="actionItems" class="row">
          ${this.renderLiveToggle()}
          <ha-icon-button .disabled=${!d?.canUndo} @click=${this.undo} title="Undo">
            <ha-icon icon="mdi:undo"></ha-icon>
          </ha-icon-button>
          <ha-icon-button .disabled=${!d?.canRedo} @click=${this.redo} title="Redo">
            <ha-icon icon="mdi:redo"></ha-icon>
          </ha-icon-button>
          <ha-button appearance="plain" .disabled=${!d?.dirty || this.busy} @click=${this.discard}>Discard</ha-button>
          <ha-button .disabled=${!d?.dirty || this.busy || this.blocked} @click=${this.save}
            >${d?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()} ${this.renderInferred()} ${this.renderWarnings()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${this.tabs.map(
            (t, i) => html`<button
              type="button"
              id="tab-${t}"
              class="tab ${this.tab === t ? "active" : ""}"
              role="tab"
              aria-selected=${this.tab === t ? "true" : "false"}
              aria-controls="tabpanel"
              tabindex=${i === this.tabFocus ? 0 : -1}
              @click=${() => this.selectTab(i)}
            >
              ${t[0]!.toUpperCase() + t.slice(1)}
            </button>`,
          )}
        </div>
        <div id="tabpanel" role="tabpanel" aria-labelledby="tab-${this.tab}">
          ${d ? this.renderTab(d) : html`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
  }

  /** These views poll regardless, so offering a switch that changes nothing would be a lie. */
  private renderLiveToggle() {
    if (this.liveRequired) return nothing;
    return html`
      <span class="muted">Live</span>
      <ha-switch
        .checked=${this.liveOn}
        @change=${(e: Event) => this.toggleLive((e.target as HTMLInputElement).checked)}
      ></ha-switch>
    `;
  }

  private renderMissing() {
    return html`
      <div style="padding:16px">
        <p>
          <strong>Activity Levels</strong>: some Home Assistant UI components did not load
          (${this.missing.join(", ")}). Open <em>Settings → Devices &amp; services</em> once, then return here and
          reload the page.
        </p>
      </div>
    `;
  }

  private renderBanner() {
    const banner = this.banner;
    if (!banner) return nothing;
    return html`<ha-alert
      alert-type=${banner.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
        this.banner = null;
      }}
      >${banner.text}</ha-alert
    >`;
  }

  /**
   * The one-time migration notice. A document written before kinds existed loads with them
   * guessed; nothing is written back until a human agrees, so this stays up until the next
   * Save — which is the moment the guesses become the document.
   */
  private renderInferred() {
    const count = this.inferred.length;
    if (count === 0) return nothing;
    return html`<ha-alert class="inferred-notice" alert-type="warning">
      ${count} ${count === 1 ? "group has" : "groups have"} an inferred kind — check them and save. Until you
      do, the kinds above are a guess and nothing has been written.
      <ha-button
        class="inferred-fix"
        slot="action"
        @click=${() => {
          this.selectTab(this.tabs.indexOf("groups"));
          this.select(this.inferred[0]!.split("/").map((s) => (/^\d+$/.test(s) ? Number(s) : s)));
        }}
        >Show me</ha-button
      >
    </ha-alert>`;
  }

  /**
   * What the document said that this schema cannot honour. Separate from the migration
   * notice above it on purpose: that one counts guesses somebody has to confirm, this one
   * quotes back a thing the file asked for and did not get, which no amount of confirming
   * will fix. Both can be up at once, and usually are.
   */
  private renderWarnings() {
    if (this.warnings.length === 0) return nothing;
    return html`<ha-alert class="config-warnings" alert-type="warning">
      <ul>
        ${this.warnings.map((w) => html`<li>${w}</li>`)}
      </ul>
    </ha-alert>`;
  }

  private renderTab(d: Draft) {
    switch (this.tab) {
      case "mixer":
        return this.renderMixer(d);
      case "groups":
        return html`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree
            .hass=${this.hass}
            .config=${d.config}
            .selection=${this.selection}
            .errors=${this.errors}
            .live=${this.live}
            @al-select=${(e: CustomEvent<Path>) => this.select(e.detail)}
            @al-change=${this.onChange}
          ></al-tree>
          <div>${this.renderEditor(d)}</div>
        </div>`;
      case "envelopes":
        return html`<al-envelopes
          .hass=${this.hass}
          .config=${d.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
      case "defaults":
        return html`<al-defaults
          .hass=${this.hass}
          .config=${d.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
      case "patterns":
        return html`<al-patterns
          .hass=${this.hass}
          .config=${d.config}
          .profileState=${this.profileState}
          .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild}
        ></al-patterns>`;
      case "code":
        return html`<al-code
          .hass=${this.hass}
          .config=${d.config}
          .errors=${this.errors}
          .available=${this.yamlEditor}
          @al-change=${this.onChange}
          @al-code-status=${this.onCodeStatus}
        ></al-code>`;
      case "floorplans":
        return html`<al-floorplans .hass=${this.hass} .config=${d.config} .live=${this.live}
          .disabled=${this.busy} @al-change=${this.onChange} @al-open-group=${this.openMixerGroup}></al-floorplans>`;
      case "paths":
        return html`<al-paths .hass=${this.hass} .config=${d.config} .narrow=${this.narrow}></al-paths>`;
      case "presence":
        return html`<al-presence
          .hass=${this.hass}
          .config=${d.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-presence>`;
    }
  }

  /**
   * The mixer page pairs the timeline transport with the visible track strips.
   * Settings and simulation status live in Groups. A stimulus is charted as its group - it has no series of its own.
   */
  private renderMixer(d: Draft) {
    const config = d.config;
    if (config.groups.length === 0) return this.renderMixerEmpty();
    const selection = this.nav.selection;
    const group = selection === null ? undefined : groupAt(config, groupPathFor(selection));
    return html`<div class="rows">
      <al-timeline
        .hass=${this.hass}
        .groupId=${group?.id ?? null}
        .heading=${group ? (group.name ?? group.id) : ""}
        .range=${this.timeline.range}
        .horizon=${this.timeline.horizon}
        .showChannels=${this.timeline.showChannels}
        .showLights=${this.timeline.showLights}
        .live=${this.live}
        .maxValue=${group?.max_value ?? config.defaults.max_value}
        .profileState=${this.profileState}
        .minDays=${config.defaults.patterns?.min_days ?? DEFAULT_MIN_DAYS}
        .paused=${this.busy}
        .narrow=${this.narrow}
        .labels=${this.timelineLabels}
        .precisions=${this.timelinePrecisions}
        @al-transport=${this.onTransport}
        @al-timeline-range=${this.onTimelineRange}
      ></al-timeline>
      ${this.previewError ? html`<ha-alert alert-type="warning">Some preview data could not be loaded. Missing values are shown as —.</ha-alert>` : nothing}
      <al-mixer
        .preview=${this.preview}
        @al-open-group=${this.openMixerGroup}
        .hass=${this.hass}
        .config=${config}
        .nav=${this.nav}
        .errors=${this.errors}
        .live=${this.live}
        .narrow=${this.narrow}
        @al-nav=${this.onNav}
        @al-change=${this.onChange}
        @al-sim-toggle=${this.onSimToggle}
        @al-live-refresh=${this.onLiveRefresh}
      ></al-mixer>

    </div>`;
  }

  /** Nothing to mix until there is at least one group: Groups is where that starts. */
  private renderMixerEmpty() {
    return html`<div class="rows">
      <ha-card class="mixer-empty">
        <p class="muted">Add your first group in Groups.</p>
        <ha-button @click=${() => this.selectTab(this.tabs.indexOf("groups"))}>Go to Groups</ha-button>
      </ha-card>
    </div>`;
  }

  private renderEditor(d: Draft) {
    const selection = this.selection;
    if (!selection) return html`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
    const isStimulus = selection[selection.length - 2] === "stimuli";
    return isStimulus
      ? html`<al-stimulus-editor
          .hass=${this.hass}
          .config=${d.config}
          .path=${selection}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>`
      : html`<div><al-group-editor
          .hass=${this.hass}
          .config=${d.config}
          .path=${selection}
          .errors=${this.errors}
          @al-change=${this.onChange}
          @al-select=${(e: CustomEvent<Path | null>) => this.select(e.detail)}
        ></al-group-editor>
        <al-strip-controls .statusOnly=${true} .hass=${this.hass} .config=${d.config}
          .path=${selection} .live=${this.live} .profileState=${this.profileState} .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild} @al-sim-toggle=${this.onSimToggle}></al-strip-controls>
        </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "activity-levels-panel": ActivityLevelsPanel;
  }
}
