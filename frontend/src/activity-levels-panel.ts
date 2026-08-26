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
import { simSwitchId } from "./entities";
import { ensureHaElements } from "./ha-elements";
import { groupAt } from "./model";
import { busPathFor, initialNav, reduce } from "./navigation";
import { runSave } from "./save-flow";
import { Draft } from "./store";
import { sharedStyles } from "./styles";
import type { SimState } from "./al-mixer";
import type { AlChangeEvent, TimelineRangeDetail } from "./events";
import type { MixerNav, NavAction } from "./navigation";
import type { Banner } from "./save-flow";
import type { Horizon, Range } from "./timeseries";
import type {
  Config,
  Group,
  HomeAssistant,
  LiveState,
  Path,
  ProfileState,
  SimulationLog,
  ValidationError,
} from "./types";

type Tab = "mixer" | "groups" | "envelopes" | "defaults" | "patterns";

const TABS: Tab[] = ["mixer", "groups", "envelopes", "defaults", "patterns"];
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
  @state() private tab: Tab = "mixer";
  @state() private selection: Path | null = null;
  @state() private nav: MixerNav = { busPath: [], selection: null };
  @state() private errors: ValidationError[] = [];
  @state() private banner: Banner | null = null;
  @state() private live: LiveState | null = null;
  @state() private liveOn = false;
  @state() private busy = false;
  @state() private missing: string[] = [];
  @state() private profileState: ProfileState | null = null;
  @state() private simLog: SimulationLog | null = null;
  @state() private timeline: TimelineRangeDetail = DEFAULT_TIMELINE;

  /** Which tab the roving tabindex sits on; arrow keys move it without activating. */
  @state() private tabFocus = 0;

  private liveTimer?: number;
  private simTimer?: number;
  /** When the profile was last read, so switching tabs does not re-ask for it every time. */
  private profileAt = 0;

  private readonly onVisibilityChange = (): void => this.updatePolling();

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.restoreTimeline();
    const { ok, missing } = await ensureHaElements();
    this.missing = ok ? [] : missing;
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
  }

  private async load(): Promise<void> {
    try {
      const cfg = await getConfig(this.hass);
      this.draft = new Draft(cfg);
      this.nav = initialNav(cfg);
      this.selection = this.nav.selection;
      this.errors = [];
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
    this.setConfig(ev.detail, ev.coalesceKey);
  };

  private setConfig(next: Config, coalesceKey?: string): void {
    this.draft?.set(next, coalesceKey);
    this.syncNav();
    this.requestUpdate();
  }

  /**
   * Re-points the navigation at the current config after an edit, and keeps the shared
   * selection with it: a node that is gone can neither be the current bus nor be shown in
   * the editor pane, so the reducer walks up to something that still exists. Nothing
   * selected stays nothing selected, though - the reducer falls back to the bus, which
   * is right after a deletion but would make the Groups tab's editor pane open itself
   * on the first edit the user makes with no row selected.
   */
  private syncNav(): void {
    const config = this.draft?.config;
    if (!config) return;
    const had = this.selection;
    const nav = reduce({ busPath: this.nav.busPath, selection: had }, { type: "sync", config });
    this.nav = had === null ? { busPath: nav.busPath, selection: null } : nav;
    this.selection = this.nav.selection !== null && this.nav.selection.length > 0 ? this.nav.selection : null;
  }

  /** One selection for both views: the mixer's bus follows what the tree picked, and back. */
  private select(path: Path | null): void {
    this.selection = path;
    this.nav = path === null ? { ...this.nav, selection: null } : { busPath: busPathFor(path), selection: path };
  }

  private onNav = (ev: CustomEvent<NavAction>): void => {
    const nav = reduce(this.nav, ev.detail);
    this.nav = nav;
    this.selection = nav.selection;
  };

  private async save(): Promise<void> {
    const draft = this.draft;
    if (!draft) return;
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
    this.banner = null;
    this.requestUpdate();
  }

  private undo(): void {
    this.draft?.undo();
    this.syncNav();
    this.requestUpdate();
  }

  private redo(): void {
    this.draft?.redo();
    this.syncNav();
    this.requestUpdate();
  }

  private toggleLive(on: boolean): void {
    this.liveOn = on;
    if (!on && this.tab !== "mixer") this.live = null;
    this.updatePolling();
  }

  /** The Mixer and Patterns tabs both read the profile and the simulation log. */
  private get patternsVisible(): boolean {
    return this.tab === "mixer" || this.tab === "patterns";
  }

  private updatePolling(): void {
    const awake = !this.busy && document.visibilityState === "visible";
    this.updateLivePolling(awake);
    this.updateSimPolling(awake);
  }

  /**
   * Starts or pauses the live poll to match the current conditions. It runs while the
   * toggle is on - or unconditionally on the Mixer tab, whose meters are the point of the
   * page - as long as no save is in flight (a reload is about to replace the config the
   * frame describes) and the tab is actually on screen. Pausing keeps the last frame, so
   * resuming redraws immediately rather than blanking the meters.
   */
  private updateLivePolling(awake: boolean): void {
    if (!((this.liveOn || this.tab === "mixer") && awake)) {
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

  private async pollLive(): Promise<void> {
    try {
      this.live = await getState(this.hass);
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

  /**
   * What the mixer needs beyond the live frame. Whether the simulation is running is not
   * in here: the strips read that off the switch entity they are given.
   */
  private simStates(config: Config): Record<string, SimState> {
    const states: Record<string, SimState> = {};
    const walk = (g: Group): void => {
      states[g.id] = { blocked: this.simLog?.blocked[g.id] ?? null };
      g.children.forEach(walk);
    };
    config.groups.forEach(walk);
    return states;
  }

  private restoreTimeline(): void {
    try {
      this.timeline = parseTimeline(localStorage.getItem(TIMELINE_KEY)) ?? DEFAULT_TIMELINE;
    } catch {
      /* unreadable or unparseable storage: the defaults are a fine place to start */
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
    const next = TABS[index];
    if (next === undefined) return;
    // The Mixer polls whether or not Live is on, so leaving it with Live off would strand
    // the last frame on the other tabs' meters, where it would read as current.
    if (next !== "mixer" && !this.liveOn) this.live = null;
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
    const last = TABS.length - 1;
    switch (ev.key) {
      case "ArrowRight":
        this.focusTab((this.tabFocus + 1) % TABS.length);
        break;
      case "ArrowLeft":
        this.focusTab((this.tabFocus + last) % TABS.length);
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
          <ha-button .disabled=${!d?.dirty || this.busy} @click=${this.save}
            >${d?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${TABS.map(
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

  /** The Mixer polls regardless, so offering a switch that changes nothing would be a lie. */
  private renderLiveToggle() {
    if (this.tab === "mixer") return nothing;
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
    }
  }

  /**
   * The mixer page, three rows deep: the selected strip's history and forecast on top, the
   * bus it lives on in the middle, and everything that does not fit on a strip below it.
   * A channel is charted as its bus - a stimulus has no series of its own.
   */
  private renderMixer(d: Draft) {
    const config = d.config;
    const busPath = busPathFor(this.selection ?? this.nav.busPath);
    const group = groupAt(config, busPath);
    return html`<div class="rows">
      <al-timeline
        .hass=${this.hass}
        .groupId=${group?.id ?? null}
        .title=${group ? (group.name ?? group.id) : ""}
        .range=${this.timeline.range}
        .horizon=${this.timeline.horizon}
        .showChannels=${this.timeline.showChannels}
        .showLights=${this.timeline.showLights}
        .live=${this.live}
        .maxValue=${group?.max_value ?? config.defaults.max_value}
        .narrow=${this.narrow}
        @al-timeline-range=${this.onTimelineRange}
      ></al-timeline>
      <al-mixer
        .hass=${this.hass}
        .config=${config}
        .nav=${this.nav}
        .errors=${this.errors}
        .live=${this.live}
        .simState=${this.simStates(config)}
        .narrow=${this.narrow}
        @al-nav=${this.onNav}
        @al-change=${this.onChange}
        @al-sim-toggle=${this.onSimToggle}
      ></al-mixer>
      <al-strip-controls
        .hass=${this.hass}
        .config=${config}
        .path=${this.nav.selection}
        .errors=${this.errors}
        .live=${this.live}
        .profileState=${this.profileState}
        .simLog=${this.simLog}
        @al-change=${this.onChange}
        @al-rebuild=${this.onRebuild}
        @al-sim-toggle=${this.onSimToggle}
      ></al-strip-controls>
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
      : html`<al-group-editor
          .hass=${this.hass}
          .config=${d.config}
          .path=${selection}
          .errors=${this.errors}
          @al-change=${this.onChange}
          @al-select=${(e: CustomEvent<Path | null>) => this.select(e.detail)}
        ></al-group-editor>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "activity-levels-panel": ActivityLevelsPanel;
  }
}
