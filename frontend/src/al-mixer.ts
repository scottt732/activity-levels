import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./al-master-strip";
import "./al-strip";
import { resetGroup, setLevel, setMuted } from "./api";
import { simSwitchId } from "./entities";
import { pathKey, subtreeErrorCount } from "./errors";
import { alChange, alLiveRefresh, alNav, alSimToggle } from "./events";
import { effectivePrecision, groupAt, groupPathFor } from "./model";
import { visibleTracks } from "./navigation";
import { setAt } from "./store";
import { sharedStyles } from "./styles";
import type { StripLevel } from "./al-meter";
import type { AlStrip } from "./al-strip";
import type { MixerNav, NavAction, VisibleTrack } from "./navigation";
import type { Config, Group, HomeAssistant, LiveState, Mix, Path, ValidationError } from "./types";

/** What the shell knows about a group's presence simulation, beyond the switch entity itself. */
export interface SimState {
  /** Why the group cannot be simulated right now, or null when nothing is stopping it. */
  blocked: string | null;
}

/** How long a failed command's notice stays up before it stops being news. */
const ERROR_MS = 8000;

/**
 * True when the key was typed into a control that wants it: the master strip's limiter box
 * and mix selector are real form elements, and a composed keydown from inside their shadow
 * root reaches the strip row. Space there is a space, not "toggle this track".
 */
const isTextEntry = (ev: Event): boolean => {
  const target = ev.composedPath()[0];
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
};

const message = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/**
 * Row 2 of the mixer page: every group, in one horizontally scrolling row of track strips,
 * with groups opening and closing in place.
 *
 * Config edits go out as `al-change` against the draft store and navigation as `al-nav`
 * for the shell to reduce. Runtime commands - a level override, a mute, a reset - are the
 * engine's, not the draft's: they go straight down the websocket from here, and the shell
 * is asked for a fresh live frame so the row shows what actually happened.
 */
@customElement("al-mixer")
export class AlMixer extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        background: none;
      }
      .strips {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        overflow-x: auto;
        padding: 4px;
        outline: none;
      }
      /* The master sits at the right of the row, past every track, like a console. */
      al-master-strip {
        margin-left: auto;
        position: sticky;
        right: 0;
      }
      .empty {
        padding: 8px 4px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) nav: MixerNav = { expanded: new Set(), selection: null };
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ attribute: false }) simState: Record<string, SimState> = {};
  @property({ type: Boolean, reflect: true }) narrow = false;

  /** What the last command that failed said, until it stops being worth reading. */
  @state() private commandError: string | null = null;

  private errorTimer?: number;

  /**
   * Set by whatever just asked for a different selection, so focus follows the roving
   * tabindex only when the move was the user's. A fader drag also selects the strip it is
   * on, and pulling focus out of the fader mid-drag would strand the keyboard on a control
   * the pointer is still holding.
   */
  private pendingFocus = false;

  override disconnectedCallback(): void {
    this.clearErrorTimer();
    super.disconnectedCallback();
  }

  private get tracks(): VisibleTrack[] {
    return this.config ? visibleTracks(this.config, this.nav) : [];
  }

  /** The group the master strip follows: whatever is selected, or the group that owns it. */
  private get selected(): { path: Path; group: Group } | null {
    const { config, nav } = this;
    if (!config || nav.selection === null) return null;
    const path = groupPathFor(nav.selection);
    const group = groupAt(config, path);
    return group === undefined ? null : { path, group };
  }

  private isSelected(path: Path): boolean {
    return this.nav.selection !== null && pathKey(this.nav.selection) === pathKey(path);
  }

  private navigate(action: NavAction): void {
    this.pendingFocus = true;
    this.dispatchEvent(alNav(action));
  }

  private emitChange(next: Config, coalesceKey?: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  private clearErrorTimer(): void {
    if (this.errorTimer === undefined) return;
    clearTimeout(this.errorTimer);
    this.errorTimer = undefined;
  }

  private fail(text: string): void {
    this.commandError = text;
    this.clearErrorTimer();
    this.errorTimer = window.setTimeout(() => {
      this.errorTimer = undefined;
      this.commandError = null;
    }, ERROR_MS);
  }

  /**
   * Runs one engine command. A command that lands is followed by a request for a live
   * frame rather than a wait for the next poll: two seconds of a mute button that looks
   * like it did nothing is two seconds of pressing it again.
   *
   * `strip` is the track the command came from, when it was one that holds the fader
   * against its answer: a refused command has no answer coming, so the fader is let go
   * here rather than left at a level the engine never took.
   */
  private async command(
    what: string,
    run: (hass: HomeAssistant) => Promise<unknown>,
    strip?: AlStrip,
  ): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    try {
      await run(hass);
      this.commandError = null;
      this.clearErrorTimer();
      this.dispatchEvent(alLiveRefresh());
    } catch (err) {
      strip?.settle(null);
      this.fail(`Could not ${what}: ${message(err)}`);
    }
  }

  /** Which track an event came from: strips are identical, so the row index is the key. */
  private trackOf(ev: Event): VisibleTrack | null {
    const index = (ev.target as HTMLElement | null)?.dataset?.index;
    if (index === undefined) return null;
    return this.tracks[Number(index)] ?? null;
  }

  private onStripSelect(ev: Event): void {
    const track = this.trackOf(ev);
    if (track) this.dispatchEvent(alNav({ type: "select", path: track.path }));
  }

  private onStripToggle(ev: Event): void {
    const track = this.trackOf(ev);
    if (track) this.navigate({ type: "toggle", id: track.id });
  }

  private onLevelOverride(ev: Event): void {
    const track = this.trackOf(ev);
    if (!track) return;
    const strip = ev.target as AlStrip;
    const { value } = (ev as CustomEvent<{ value: number }>).detail;
    // The engine answers with the level it actually reached, which a limiter or a louder
    // channel of a MAX group can put somewhere other than the ask. Showing it at once
    // means the fader stops lying about where the group is a whole poll earlier.
    void this.command(
      `set the level of ${track.id}`,
      async (hass) => strip.settle(await setLevel(hass, track.id, value)),
      strip,
    );
  }

  private onMuteToggle(ev: Event): void {
    const track = this.trackOf(ev);
    if (!track) return;
    const { muted } = (ev as CustomEvent<{ muted: boolean }>).detail;
    void this.command(`${muted ? "mute" : "unmute"} ${track.id}`, (hass) => setMuted(hass, track.id, muted));
  }

  private onReset(ev: Event): void {
    const track = this.trackOf(ev);
    if (!track) return;
    void this.command(`reset ${track.id}`, (hass) => resetGroup(hass, track.id));
  }

  private onMasterSelect(): void {
    const selection = this.selected;
    if (selection) this.dispatchEvent(alNav({ type: "select", path: selection.path }));
  }

  private onMix(ev: Event): void {
    const { config } = this;
    const selection = this.selected;
    if (!config || !selection) return;
    const { mix } = (ev as CustomEvent<{ mix: Mix }>).detail;
    this.emitChange(setAt(config, [...selection.path, "mix"], mix));
  }

  private onLimiter(ev: Event): void {
    const { config } = this;
    const selection = this.selected;
    if (!config || !selection) return;
    const { value } = (ev as CustomEvent<{ value: number }>).detail;
    this.emitChange(
      setAt(config, [...selection.path, "max_value"], value),
      `${pathKey(selection.path)}:limiter`,
    );
  }

  private onSim(ev: Event): void {
    const selection = this.selected;
    if (!selection) return;
    const { on } = (ev as CustomEvent<{ on: boolean }>).detail;
    this.dispatchEvent(alSimToggle(selection.group.id, on));
  }

  /** Console keys: ←/→ walk the row, Enter or Space opens and closes, Home/End jump. */
  private onKeyDown(ev: KeyboardEvent): void {
    const config = this.config;
    // No `preventDefault` on the way out: the control the key was typed into still wants it.
    if (!config || isTextEntry(ev)) return;
    switch (ev.key) {
      case "ArrowRight":
      case "ArrowLeft":
        ev.preventDefault();
        this.navigate({ type: "arrow", delta: ev.key === "ArrowRight" ? 1 : -1, config });
        break;
      case "Enter":
      case " ": {
        const selection = this.nav.selection;
        const track = selection === null ? undefined : this.tracks.find((t) => pathKey(t.path) === pathKey(selection));
        if (!track?.hasChildren) return;
        ev.preventDefault();
        this.navigate({ type: "toggle", id: track.id });
        break;
      }
      case "Home":
      case "End":
        ev.preventDefault();
        this.navigate({ type: ev.key === "Home" ? "home" : "end", config });
        break;
      default:
        break;
    }
  }

  override updated(changed: PropertyValues<this>): void {
    if (!changed.has("nav")) return;
    const focus = this.pendingFocus;
    this.pendingFocus = false;
    void this.revealSelected(focus);
  }

  /**
   * Keeps the one strip in the tab order on screen after the row has been re-rendered, and
   * on the keyboard when the move was the user's.
   */
  private async revealSelected(focus: boolean): Promise<void> {
    await this.updateComplete;
    const node = this.shadowRoot?.querySelector<HTMLElement>('.strips > [tabindex="0"]');
    if (!node) return;
    if (focus) node.focus();
    try {
      node.scrollIntoView?.({ inline: "nearest", block: "nearest" });
    } catch {
      /* no layout to scroll (jsdom, a detached row): the strip is still selected */
    }
  }

  private renderTrack(config: Config, track: VisibleTrack, index: number): TemplateResult {
    const group = groupAt(config, track.path);
    if (!group) return html``;
    const live = this.live?.groups[group.id];
    const selected = this.isSelected(track.path);
    return html`
      <al-strip
        data-index=${index}
        tabindex=${selected ? 0 : -1}
        ?narrow=${this.narrow}
        .label=${group.name ?? group.id}
        .depth=${track.depth}
        .hasChildren=${track.hasChildren}
        .expanded=${track.expanded}
        .childCount=${group.children.length}
        .value=${live?.value ?? 0}
        .liveNow=${this.live?.now ?? 0}
        .realValue=${live?.real_value ?? 0}
        .maxValue=${live?.max_value ?? group.max_value ?? config.defaults.max_value}
        .precision=${live?.precision ?? effectivePrecision(config, group)}
        .muted=${live?.muted ?? false}
        .selected=${selected}
        .errors=${subtreeErrorCount(this.errors, track.path)}
      ></al-strip>
    `;
  }

  private renderMaster(config: Config): TemplateResult | typeof nothing {
    const selection = this.selected;
    // Nothing selected is nothing to master: the row is the whole tree, so there is no
    // "current bus" left to fall back to.
    if (!selection) return nothing;
    const { group, path } = selection;
    const live = this.live?.groups[group.id];
    const level: StripLevel | null = live ? { value: live.value, max: live.max_value, gated: live.gated } : null;
    const entityId = simSwitchId(group.id);
    // The master follows the selection rather than being it: the row's one tab stop and
    // its outline belong to the track strip, and the bus name says which one this is.
    // The property still travels, so the master's own controls join the tab order behind
    // the strip they belong to.
    const selected = this.isSelected(path);
    return html`
      <al-master-strip
        tabindex="-1"
        .selected=${selected}
        ?narrow=${this.narrow}
        .label=${(group.name ?? group.id).toUpperCase()}
        .mix=${group.mix}
        .maxValue=${group.max_value ?? config.defaults.max_value}
        .precision=${live?.precision ?? effectivePrecision(config, group)}
        .live=${level}
        .lights=${live?.lights ?? 0}
        .simEntityId=${entityId}
        .simOn=${this.hass?.states[entityId]?.state === "on"}
        .blockedReason=${this.simState[group.id]?.blocked ?? null}
        @click=${this.onMasterSelect}
      ></al-master-strip>
    `;
  }

  override render() {
    const config = this.config;
    if (!config || config.groups.length === 0)
      return html`<div class="empty muted">Nothing to mix: add a group first.</div>`;
    return html`
      ${this.commandError === null
        ? nothing
        : html`<ha-alert
            class="command-error"
            alert-type="error"
            dismissable
            @alert-dismissed-clicked=${() => {
              this.clearErrorTimer();
              this.commandError = null;
            }}
            >${this.commandError}</ha-alert
          >`}
      <div
        class="strips"
        role="group"
        aria-label="Mixer"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-toggle-strip=${this.onStripToggle}
        @al-level-override=${this.onLevelOverride}
        @al-mute-toggle=${this.onMuteToggle}
        @al-reset=${this.onReset}
        @al-mix-changed=${this.onMix}
        @al-limiter-changed=${this.onLimiter}
        @al-sim-toggled=${this.onSim}
      >
        ${this.tracks.map((track, i) => this.renderTrack(config, track, i))}${this.renderMaster(config)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-mixer": AlMixer;
  }
}
