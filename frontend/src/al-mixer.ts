import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./al-strip";
import { resetGroup, setLevel, setMuted } from "./api";
import { pathKey, subtreeErrorCount } from "./errors";
import { alLiveRefresh, alNav } from "./events";
import { effectivePrecision, groupAt, groupPathFor } from "./model";
import { loadEditing, mixerLayout, saveEditing, visibleTracks } from "./navigation";
import { sharedStyles } from "./styles";
import type { AlStrip } from "./al-strip";
import type { Band, MixerLayout, MixerNav, NavAction, VisibleTrack } from "./navigation";
import type { Config, Group, HomeAssistant, LiveState, Path, ValidationError } from "./types";

/** How long a failed command's notice stays up before it stops being news. */
const ERROR_MS = 8000;

export interface MixerPreview {
  time: number;
  values: Record<string, number | null>;
  mode: "history" | "forecast";
}

const message = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/**
 * Row 2 of the mixer page: every group, as one horizontally scrolling console of track
 * strips under the bracket headers that say how they nest.
 *
 * Every strip is the same size and sits on one baseline; the tree is drawn *above* them,
 * as a band per group that has children, spanning its own strip and its whole subtree and
 * stepping up a row per level of nesting. Closing a band takes its subtree off the row and
 * leaves only the group's own strip, with an expand button in its header.
 *
 * The row reads levels by default. **Edit** turns the meters back into faders and puts the
 * mute and reset buttons back; it is a per-browser preference, not part of the config.
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
      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 4px;
        flex-wrap: wrap;
      }
      .preview-status {
        color: var(--secondary-text-color);
        font-size: 0.85em;
        font-variant-numeric: tabular-nums;
      }
      .open-group {
        margin-left: auto;
        border: 1px solid var(--divider-color);
        border-radius: 16px;
        padding: 5px 12px;
        background: transparent;
        color: var(--primary-color);
        font: inherit;
        font-size: 0.85em;
        cursor: pointer;
      }
      .open-group:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .edit {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }
      /* The strips share one row below the expanded group headers. */
      .grid {
        display: grid;
        gap: 8px;
        align-items: stretch;
        justify-content: start;
        overflow-x: auto;
        padding: 4px;
        outline: none;
        --al-strip-w: 96px;
      }
      :host([narrow]) .grid {
        --al-strip-w: 72px;
      }
      /* A bracket over the run of strips it owns: open at the bottom, into them. */
      .band {
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
        box-sizing: border-box;
        padding: 2px 6px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-bottom: none;
        border-radius: 6px 6px 0 0;
        background: var(--secondary-background-color);
      }
      .band .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.8em;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .caret {
        flex: 0 0 auto;
        background: none;
        border: 1px solid transparent;
        margin: 0;
        padding: 0 2px;
        font: inherit;
        font-size: 0.8em;
        color: var(--secondary-text-color);
        border-radius: 4px;
        cursor: pointer;
      }
      .caret:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
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
  @property({ type: Boolean, reflect: true }) narrow = false;
  @property({ attribute: false }) preview: MixerPreview | null = null;

  /**
   * Whether the strips may be operated. Off, the row is a set of meters; on, it is a
   * console. Remembered per browser rather than per config: it is how this screen is being
   * used right now, not something about the home.
   */
  @state() private editing = loadEditing();

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

  /** The group the selection names, or the one that owns the selected stimulus. */
  private get selected(): { path: Path; group: Group } | null {
    const { config, nav } = this;
    if (!config || nav.selection === null) return null;
    const path = groupPathFor(nav.selection);
    const group = groupAt(config, path);
    return group === undefined ? null : { path, group };
  }

  /**
   * Only the selected group adds its band caret to the tab order.
   */
  private get selectedId(): string | null {
    return this.selected?.group.id ?? null;
  }

  private isSelected(path: Path): boolean {
    return this.nav.selection !== null && pathKey(this.nav.selection) === pathKey(path);
  }

  private navigate(action: NavAction): void {
    this.pendingFocus = true;
    this.dispatchEvent(alNav(action));
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
    if (!hass || this.preview) return;
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

  private onLevelOverride(ev: Event): void {
    const track = this.trackOf(ev);
    if (!track || this.preview) return;
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
    if (!track || this.preview) return;
    const { muted } = (ev as CustomEvent<{ muted: boolean }>).detail;
    void this.command(`${muted ? "mute" : "unmute"} ${track.id}`, (hass) => setMuted(hass, track.id, muted));
  }

  private onReset(ev: Event): void {
    const track = this.trackOf(ev);
    if (!track || this.preview) return;
    void this.command(`reset ${track.id}`, (hass) => resetGroup(hass, track.id));
  }

  private onEditToggle(ev: Event): void {
    if (this.preview) return;
    this.editing = (ev.target as unknown as { checked?: boolean }).checked === true;
    saveEditing(this.editing);
  }

  /** Opening or closing a band is its own intent: it must not also read as a selection. */
  private onBandToggle(ev: Event): void {
    ev.stopPropagation();
    const id = (ev.currentTarget as HTMLElement).dataset.band;
    if (id !== undefined) this.navigate({ type: "toggle", id });
  }

  /** Native buttons turn Enter and Space into clicks; keep those keys out of the row. */
  private onBandKey(ev: KeyboardEvent): void {
    if (ev.key === "Enter" || ev.key === " ") ev.stopPropagation();
  }

  /** Console keys: ←/→ walk the row, Enter or Space opens and closes, Home/End jump. */
  private onKeyDown(ev: KeyboardEvent): void {
    const config = this.config;
    if (!config) return;
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
    const node = this.shadowRoot?.querySelector<HTMLElement>('al-strip[tabindex="0"]');
    if (!node) return;
    if (focus) node.focus();
    try {
      node.scrollIntoView?.({ inline: "nearest", block: "nearest" });
    } catch {
      /* no layout to scroll (jsdom, a detached row): the strip is still selected */
    }
  }

  private renderTrack(config: Config, track: VisibleTrack, index: number, layout: MixerLayout): TemplateResult {
    const group = groupAt(config, track.path);
    if (!group) return html``;
    const live = this.live?.groups[group.id];
    const selected = this.isSelected(track.path);
    return html`
      <al-strip
        data-index=${index}
        style="grid-column: ${layout.columns[index]}; grid-row: ${layout.rows + 1};"
        tabindex=${selected ? 0 : -1}
        ?editable=${this.editing && !this.preview}
        .expandable=${track.hasChildren && !track.expanded}
        .label=${group.name ?? group.id}
        .value=${this.preview ? this.preview.values[group.id] ?? null : live?.value ?? 0}
        .liveNow=${this.live?.now ?? 0}
        .realValue=${this.preview ? null : live?.real_value ?? 0}
        .maxValue=${live?.max_value ?? group.max_value ?? config.defaults.max_value}
        .precision=${live?.precision ?? effectivePrecision(config, group)}
        .muted=${this.preview ? false : live?.muted ?? false}
        .selected=${selected}
        .errors=${subtreeErrorCount(this.errors, track.path)}
      ></al-strip>
    `;
  }

  private renderBand(band: Band): TemplateResult {
    const style = `grid-column: ${band.colStart} / ${band.colEnd}; grid-row: ${band.depth + 1};`;
    const stop = band.id === this.selectedId ? 0 : -1;
    return html`
      <div class="band" role="group" aria-label=${band.label} style=${style}>
        <button
          class="caret"
          type="button"
          data-band=${band.id}
          tabindex=${stop}
          aria-expanded="true"
          aria-label=${`Collapse ${band.label}`}
          title=${`Collapse ${band.label}`}
          @click=${this.onBandToggle}
          @keydown=${this.onBandKey}
        >▾</button>
        <span class="label" title=${band.label}>${band.label}</span>
      </div>
    `;
  }

  override render() {
    const config = this.config;
    if (!config || config.groups.length === 0)
      return html`<div class="empty muted">Nothing to mix: add a group first.</div>`;
    const layout = mixerLayout(config, this.nav);
    const columns = layout.kinds.map(() => "var(--al-strip-w)").join(" ");
    // `repeat(0, ...)` is not a track list: with nothing open there are no band rows at all.
    const rows = layout.rows > 0 ? `repeat(${layout.rows}, auto) auto` : "auto";
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
      <div class="toolbar">
        <label class="edit">
          <ha-switch class="edit-switch" .disabled=${!!this.preview} .checked=${this.editing && !this.preview} @change=${this.onEditToggle}></ha-switch>
          <span>Edit</span>
        </label>
        <span class="preview-status">${this.preview
          ? `${this.preview.mode === "history" ? "History" : "Forecast"} · ${new Date(this.preview.time * 1000).toLocaleString()} · Read-only`
          : "Live"}</span>
        ${this.selected ? html`<button class="open-group" type="button"
          @click=${() => this.dispatchEvent(new CustomEvent("al-open-group", {
            detail: this.selected!.path, bubbles: true, composed: true,
          }))}>Group settings</button>` : nothing}
      </div>
      <div
        class="grid"
        role="group"
        aria-label="Mixer"
        style="grid-template-columns: ${columns}; grid-template-rows: ${rows};"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-expand-strip=${(event: Event) => {
          const track = this.trackOf(event);
          if (track?.hasChildren) this.navigate({ type: "toggle", id: track.id });
        }}
        @al-level-override=${this.onLevelOverride}
        @al-mute-toggle=${this.onMuteToggle}
        @al-reset=${this.onReset}
      >
        ${layout.bands.map((band) => this.renderBand(band))}
        ${this.tracks.map((track, i) => this.renderTrack(config, track, i, layout))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-mixer": AlMixer;
  }
}
