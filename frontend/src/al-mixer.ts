import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./al-master-strip";
import "./al-strip";
import { pathKey, subtreeErrorCount } from "./errors";
import { alChange, alNav, alSimToggle } from "./events";
import { groupAt, resolvedEnvelope, stimulusAt } from "./model";
import { breadcrumb, channelPaths } from "./navigation";
import { setAt } from "./store";
import { sharedStyles } from "./styles";
import type { StripLevel } from "./al-meter";
import type { GainChangeDetail } from "./events";
import type { MixerNav, NavAction } from "./navigation";
import type { Config, Group, HomeAssistant, LiveState, Mix, Path, ValidationError } from "./types";

/** What the shell knows about a group's presence simulation, beyond the switch entity itself. */
export interface SimState {
  on: boolean;
  blocked: string | null;
}

/** The entity Home Assistant exposes for a group's presence simulation. */
const simEntityId = (gid: string): string => `switch.${gid}_presence_simulation`;

/** What every strip needs regardless of what it stands for. */
interface SharedStrip {
  index: number;
  selected: boolean;
  errors: number;
  tabindex: number;
}

/** A channel path names a stimulus or a child bus by its last-but-one step. */
const isBusChannel = (path: Path): boolean => path[path.length - 2] === "children";

/**
 * Row 2 of the mixer page: the current bus, drawn as a DAW channel strip row.
 *
 * The mixer owns no state of its own. Navigation goes out as `al-nav` for the shell to
 * reduce, edits as `al-change` against the draft store, and the presence simulation as
 * `al-sim-toggle` (the switch is Home Assistant's, so only the shell may call it). That
 * keeps the mixer a pure function of `config` + `nav` + `live`, which is what makes the
 * strips cheap to re-render on every live poll.
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
      .crumbs {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        min-height: 28px;
        margin-bottom: 8px;
      }
      .link {
        background: none;
        border: none;
        margin: 0;
        padding: 2px 4px;
        font: inherit;
        color: inherit;
        border-radius: 4px;
        cursor: pointer;
      }
      .link:disabled {
        color: var(--disabled-text-color, #9e9e9e);
        cursor: default;
      }
      .link:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      .crumb:last-of-type {
        font-weight: 600;
      }
      .sep {
        color: var(--secondary-text-color);
      }
      .strips {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        overflow-x: auto;
        padding: 4px;
        outline: none;
      }
      /* The master sits at the right of the row, past any channels, like a console. */
      al-master-strip {
        margin-left: auto;
      }
      al-master-strip[selected] {
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
  @property({ attribute: false }) nav: MixerNav = { busPath: [], selection: null };
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ attribute: false }) simState: Record<string, SimState> = {};
  @property({ type: Boolean, reflect: true }) narrow = false;

  /**
   * Set by whatever just asked for a different bus or selection, so focus follows the
   * roving tabindex only when the move was the user's. A fader drag also selects the
   * strip it is on, and pulling focus out of the fader mid-drag would strand the
   * keyboard on a control the pointer is still holding.
   */
  private pendingFocus = false;

  private get bus(): Group | undefined {
    return this.config ? groupAt(this.config, this.nav.busPath) : undefined;
  }

  private get channels(): Path[] {
    return this.config ? channelPaths(this.config, this.nav.busPath) : [];
  }

  private isSelected(path: Path): boolean {
    return this.nav.selection !== null && pathKey(this.nav.selection) === pathKey(path);
  }

  /** The ceiling a channel's meter is drawn against: the bus it mixes into, not its own. */
  private busCeiling(bus: Group): number {
    const live = this.live?.groups[bus.id];
    return live?.max_value ?? bus.max_value ?? this.config?.defaults.max_value ?? 5;
  }

  private navigate(action: NavAction): void {
    this.pendingFocus = true;
    this.dispatchEvent(alNav(action));
  }

  private emitChange(next: Config, coalesceKey?: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  /** Which strip an event came from: strips are identical, so the row index is the key. */
  private pathOf(ev: Event): Path | null {
    const index = (ev.target as HTMLElement | null)?.dataset?.index;
    if (index === undefined) return null;
    return this.channels[Number(index)] ?? null;
  }

  private onStripSelect(ev: Event): void {
    const path = this.pathOf(ev);
    if (path) this.dispatchEvent(alNav({ type: "select", path }));
  }

  private onStripOpen(ev: Event): void {
    const path = this.pathOf(ev);
    if (path) this.navigate({ type: "open", path });
  }

  /**
   * Both the live moves of a drag and the value it settles on are reported: the coalesce
   * key folds the flood into one undo step, and reporting the moves is what lets the
   * meters and the timeline follow the fader while it is still under the pointer.
   */
  private onStripGain(ev: Event): void {
    const path = this.pathOf(ev);
    const config = this.config;
    if (!path || !config) return;
    const { value } = (ev as CustomEvent<GainChangeDetail>).detail;
    this.emitChange(setAt(config, [...path, "gain"], value), `${pathKey(path)}:gain`);
  }

  private onMasterSelect(): void {
    this.dispatchEvent(alNav({ type: "select", path: this.nav.busPath }));
  }

  private onMix(ev: Event): void {
    const config = this.config;
    if (!config) return;
    const { mix } = (ev as CustomEvent<{ mix: Mix }>).detail;
    this.emitChange(setAt(config, [...this.nav.busPath, "mix"], mix));
  }

  private onLimiter(ev: Event): void {
    const config = this.config;
    if (!config) return;
    const { value } = (ev as CustomEvent<{ value: number }>).detail;
    this.emitChange(setAt(config, [...this.nav.busPath, "max_value"], value), `${pathKey(this.nav.busPath)}:limiter`);
  }

  private onSim(ev: Event): void {
    const bus = this.bus;
    if (!bus) return;
    const { on } = (ev as CustomEvent<{ on: boolean }>).detail;
    this.dispatchEvent(alSimToggle(bus.id, on));
  }

  /** Console keys: ←/→ walk the row, Enter drills into a bus, Backspace comes back up. */
  private onKeyDown(ev: KeyboardEvent): void {
    const config = this.config;
    if (!config) return;
    switch (ev.key) {
      case "ArrowRight":
      case "ArrowLeft":
        ev.preventDefault();
        this.navigate({ type: "arrow", delta: ev.key === "ArrowRight" ? 1 : -1, config });
        break;
      case "Enter": {
        const selection = this.nav.selection;
        if (!selection || !isBusChannel(selection) || !this.channels.some((p) => pathKey(p) === pathKey(selection)))
          return;
        ev.preventDefault();
        this.navigate({ type: "open", path: selection });
        break;
      }
      case "Backspace":
        // Always swallowed, so the browser never reads it as "go back" from inside the row.
        ev.preventDefault();
        if (this.nav.busPath.length >= 4) this.navigate({ type: "up" });
        break;
      case "Home":
      case "End": {
        ev.preventDefault();
        const first = this.channels[0] ?? this.nav.busPath;
        this.navigate({ type: "select", path: ev.key === "Home" ? first : this.nav.busPath });
        break;
      }
      default:
        break;
    }
  }

  override updated(changed: PropertyValues<this>): void {
    if (!this.pendingFocus || !changed.has("nav")) return;
    this.pendingFocus = false;
    void this.focusSelected();
  }

  /** Keeps focus on the one strip in the tab order after the row has been re-rendered. */
  private async focusSelected(): Promise<void> {
    await this.updateComplete;
    this.shadowRoot?.querySelector<HTMLElement>('.strips > [tabindex="0"]')?.focus();
  }

  private renderCrumbs(config: Config): TemplateResult {
    const crumbs = breadcrumb(config, this.nav.busPath);
    return html`
      <div class="crumbs">
        <button
          class="link up"
          title="Up one bus"
          ?disabled=${this.nav.busPath.length < 4}
          @click=${() => this.navigate({ type: "up" })}
        >
          ⌃ up
        </button>
        ${crumbs.map(
          (crumb, i) => html`
            ${i > 0 ? html`<span class="sep">›</span>` : nothing}
            <button class="link crumb" @click=${() => this.navigate({ type: "open", path: crumb.path })}>
              ${crumb.label}
            </button>
          `,
        )}
      </div>
    `;
  }

  private renderChannel(config: Config, bus: Group, path: Path, index: number): TemplateResult {
    const selected = this.isSelected(path);
    const shared: SharedStrip = {
      index,
      selected,
      errors: subtreeErrorCount(this.errors, path),
      tabindex: selected ? 0 : -1,
    };
    return isBusChannel(path)
      ? this.renderBusChannel(config, bus, path, shared)
      : this.renderStimulusChannel(config, bus, path, shared);
  }

  private renderBusChannel(config: Config, bus: Group, path: Path, shared: SharedStrip): TemplateResult {
    const child = groupAt(config, path);
    if (!child) return html``;
    const live = this.live?.groups[child.id];
    const level: StripLevel | null = live ? { value: live.value, max: this.busCeiling(bus), gated: live.gated } : null;
    return html`
      <al-strip
        kind="bus"
        data-index=${shared.index}
        tabindex=${shared.tabindex}
        ?narrow=${this.narrow}
        .label=${child.name ?? child.id}
        .sublabel=${`bus · ${child.stimuli.length + child.children.length}`}
        .envelope=${resolvedEnvelope(config, {})}
        .gain=${child.gain}
        .live=${level}
        .selected=${shared.selected}
        .errors=${shared.errors}
      ></al-strip>
    `;
  }

  private renderStimulusChannel(config: Config, bus: Group, path: Path, shared: SharedStrip): TemplateResult {
    const stimulus = stimulusAt(config, path);
    if (!stimulus) return html``;
    const entity = this.hass?.states[stimulus.entity];
    // A voice is keyed by the label the engine gave it: the stimulus key, or its entity.
    const voice = this.live?.voices[bus.id]?.find((v) => v.label === (stimulus.key ?? stimulus.entity));
    const level: StripLevel | null = voice
      ? { value: voice.value, max: this.busCeiling(bus), gated: voice.gate }
      : null;
    return html`
      <al-strip
        kind="channel"
        data-index=${shared.index}
        tabindex=${shared.tabindex}
        ?narrow=${this.narrow}
        .label=${(entity?.attributes.friendly_name as string | undefined) ?? stimulus.entity}
        .sublabel=${entity?.state ?? "unknown"}
        .envelope=${resolvedEnvelope(config, stimulus)}
        .gain=${stimulus.gain}
        .live=${level}
        .selected=${shared.selected}
        .errors=${shared.errors}
        .entityIcon=${(entity?.attributes.icon as string | undefined) ?? null}
      ></al-strip>
    `;
  }

  private renderMaster(config: Config, bus: Group): TemplateResult {
    const live = this.live?.groups[bus.id];
    const level: StripLevel | null = live ? { value: live.value, max: live.max_value, gated: live.gated } : null;
    const entityId = simEntityId(bus.id);
    const selected = this.isSelected(this.nav.busPath);
    return html`
      <al-master-strip
        tabindex=${selected ? 0 : -1}
        ?selected=${selected}
        ?narrow=${this.narrow}
        .label=${(bus.name ?? bus.id).toUpperCase()}
        .mix=${bus.mix}
        .maxValue=${bus.max_value ?? config.defaults.max_value}
        .precision=${bus.precision ?? config.defaults.precision}
        .live=${level}
        .lights=${live?.lights ?? 0}
        .simEntityId=${entityId}
        .simOn=${this.hass?.states[entityId]?.state === "on"}
        .blockedReason=${this.simState[bus.id]?.blocked ?? null}
        @click=${this.onMasterSelect}
      ></al-master-strip>
    `;
  }

  override render() {
    const config = this.config;
    const bus = this.bus;
    if (!config || !bus) return html`<div class="empty muted">No bus to mix: add a group first.</div>`;
    return html`
      ${this.renderCrumbs(config)}
      <div
        class="strips"
        role="group"
        aria-label="Mixer"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-open-strip=${this.onStripOpen}
        @al-gain-changed=${this.onStripGain}
        @al-mix-changed=${this.onMix}
        @al-limiter-changed=${this.onLimiter}
        @al-sim-toggled=${this.onSim}
      >
        ${this.channels.map((path, i) => this.renderChannel(config, bus, path, i))}${this.renderMaster(config, bus)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-mixer": AlMixer;
  }
}
