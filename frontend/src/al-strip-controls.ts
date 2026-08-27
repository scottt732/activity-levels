import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DEFAULT_MIN_DAYS } from "./constants";
import { anomalySensorId, expectedSensorId, simSwitchId } from "./entities";
import { fieldErrors, pathKey, subtreeErrorCount } from "./errors";
import { alChange, alRebuild, alSimToggle } from "./events";
import {
  MAX_VALUE_SELECTOR,
  PRECISION_SELECTOR,
  changedGroupField,
  groupData,
  groupHelper,
  groupLabel,
  groupSchema,
  mergeGroup,
} from "./group-form";
import {
  PRESENCE_KEY,
  effectivePrecision,
  formatLevel,
  groupAt,
  newPresenceOverrides,
  parentGroupPath,
  presenceSettings,
  resolvedEnvelope,
  roomIds,
  stimulusAt,
} from "./model";
import { setAt } from "./store";
import {
  GAIN_SELECTOR,
  OVERRIDES,
  changedStimulusField,
  envelopeOptions,
  mergeStimulus,
  overrideSource,
  phaseCountdown,
  stimulusData,
  stimulusHelper,
  stimulusLabel,
  stimulusSchema,
  toTextMatches,
} from "./stimulus-form";
import { sharedStyles } from "./styles";
import "./al-envelope-sketch";
import "./al-override-field";
import "./al-stimulus-editor";
import type { GroupField } from "./group-form";
import type { StimulusField } from "./stimulus-form";
import type { OverrideValue } from "./convert";
import type { PropertyValues, TemplateResult } from "lit";
import type {
  Config,
  EnvelopeOverrides,
  Group,
  HassEntity,
  HomeAssistant,
  LiveState,
  Path,
  ProfileState,
  SimulationLog,
  SimulationLogEntry,
  Stimulus,
  ValidationError,
} from "./types";

/**
 * The channel's tuning fields. `entity` is deliberately absent: repointing a stimulus at
 * another entity is structural, and structure stays in the Groups editor.
 */
const CHANNEL_FIELDS: StimulusField[] = ["envelope", "gain", "to", "key"];

/** The bus's tuning fields; `id` and `area` re-create entities, so they stay in the editor too. */
const BUS_FIELDS: GroupField[] = ["name", "mix", "null_handling", "gain"];

/** How many simulation actions the status card shows before it stops being a summary. */
const LOG_ROWS = 5;

/** A stimulus is a channel; anything else selectable in the mixer is a bus. */
const isChannel = (path: Path): boolean => path[path.length - 2] === "stimuli";

/**
 * Row 3 of the mixer page: everything about the selected strip that does not fit on the
 * strip itself.
 *
 * It owns no state but the half-typed "Active states" text. Config edits go out as
 * `al-change` against the draft store, keyed per field so a dragged slider is one undo
 * step; the presence simulation and the profile rebuild are Home Assistant's to perform,
 * so they go out as requests (`al-sim-toggle`, `al-rebuild`) for the shell to answer.
 */
@customElement("al-strip-controls")
export class AlStripControls extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        background: none;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 1em;
      }
      .cols {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px 24px;
        align-items: start;
      }
      .live {
        margin-top: 8px;
      }
      .chip {
        white-space: nowrap;
      }
      .status > * {
        margin-bottom: 8px;
      }
      .value {
        font-variant-numeric: tabular-nums;
      }
      .log {
        list-style: none;
        margin: 0;
        padding: 0;
        font-size: 0.9em;
      }
      .log li {
        display: flex;
        gap: 8px;
        align-items: baseline;
      }
      .log .entity {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .log .state {
        color: var(--secondary-text-color);
      }
      .stimuli {
        margin-top: 16px;
      }
      ha-expansion-panel {
        margin-bottom: 4px;
      }
      .stimulus-head {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 1;
      }
      .stimulus-head .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .badge {
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.75em;
        line-height: 1.6;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) path: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) live: LiveState | null = null;
  @property({ attribute: false }) profileState: ProfileState | null = null;
  @property({ attribute: false }) simLog: SimulationLog | null = null;

  /**
   * Raw text of the "Active states" field while it is being edited: the parsed list is
   * lossy mid-word, so re-rendering it on every keystroke would eat the separator that
   * makes a second state typeable. `null` means "not being edited".
   */
  @state() private toText: string | null = null;

  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !changed.has("config")) return;
    const { config, path } = this;
    const stimulus = config && path ? stimulusAt(config, path) : undefined;
    if (!stimulus) return;
    if (!toTextMatches(stimulus.to, this.toText)) this.toText = null;
  }

  private emitChange(next: Config, coalesceKey: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  /** Writes one nullable field of the selected node, e.g. an envelope or output override. */
  private setField(name: string, value: unknown): void {
    const { config, path } = this;
    if (!config || !path) return;
    this.emitChange(setAt(config, [...path, name], value), `${pathKey(path)}:${name}`);
  }

  private onChannelForm(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const { config, path } = this;
    if (!config || !path) return;
    const stimulus = stimulusAt(config, path);
    if (!stimulus) return;
    const v = ev.detail?.value ?? {};
    this.toText = String(v.to ?? "");
    const merged = mergeStimulus(stimulus, v);
    const field = changedStimulusField(merged, stimulus);
    if (field === undefined) return;
    this.emitChange(setAt(config, path, merged), `${pathKey(path)}:${field}`);
  }

  private onBusForm(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const { config, path } = this;
    if (!config || !path) return;
    const group = groupAt(config, path);
    if (!group) return;
    const merged = mergeGroup(group, ev.detail?.value ?? {});
    const field = changedGroupField(merged, group);
    if (field === undefined) return;
    this.emitChange(setAt(config, path, merged), `${pathKey(path)}:${field}`);
  }

  /** The switch is Home Assistant's, so this reports the wanted state and lets the shell call it. */
  private onSim(gid: string, ev: Event): void {
    this.dispatchEvent(alSimToggle(gid, (ev.target as unknown as { checked?: boolean }).checked === true));
  }

  private onRebuild(): void {
    this.dispatchEvent(alRebuild());
  }

  private renderChannel(config: Config, path: Path): TemplateResult {
    const stimulus = stimulusAt(config, path);
    if (!stimulus) return html`<ha-card><span class="muted">This channel no longer exists.</span></ha-card>`;
    const fields = fieldErrors(this.errors, path);
    const own = this.errors.filter((e) => e.path === pathKey(path));
    const resolved = resolvedEnvelope(config, stimulus);

    return html`
      <ha-card header=${stimulus.key ?? stimulus.entity}>
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${stimulusData(stimulus, this.toText, CHANNEL_FIELDS)}
              .schema=${stimulusSchema(config, CHANNEL_FIELDS)}
              .error=${fields}
              .computeLabel=${stimulusLabel}
              .computeHelper=${stimulusHelper}
              @value-changed=${this.onChannelForm}
            ></ha-form>
            ${this.renderVoice(config, path, stimulus)}
          </div>
          <div class="col">
            ${OVERRIDES.map(
              (item) => html`<al-override-field
                .hass=${this.hass}
                .label=${item.label}
                .kind=${item.kind}
                .selector=${item.selector}
                .value=${stimulus[item.name] as OverrideValue}
                .inherited=${resolved[item.name] as OverrideValue}
                .inheritedFrom=${overrideSource(config, stimulus, item.name)}
                .error=${fields[item.name]}
                @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) =>
                  this.setField(item.name as keyof EnvelopeOverrides, ev.detail.value)}
              ></al-override-field>`,
            )}
            <al-envelope-sketch .envelope=${resolved}></al-envelope-sketch>
          </div>
        </div>
      </ha-card>
    `;
  }

  /** The voice this channel is driving right now, matched the way the engine labels it. */
  private renderVoice(config: Config, path: Path, stimulus: Stimulus): TemplateResult | typeof nothing {
    const group = groupAt(config, parentGroupPath(path));
    const voice = this.live?.voices[group?.id ?? ""]?.find((v) => v.label === (stimulus.key ?? stimulus.entity));
    if (!voice) return nothing;
    const ends = phaseCountdown(this.live?.now, voice.phase_ends);
    return html`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${voice.phase}">${voice.phase}</span>
      <span class="chip value">${voice.value.toFixed(2)}</span>
      ${ends !== null ? html`<span class="muted chip">ends in ${ends}</span>` : nothing}
      <span class="dot ${voice.gate ? "gated" : ""}" title=${voice.gate ? "Gate open" : "Gate closed"}></span>
    </div>`;
  }

  private renderBus(config: Config, path: Path): TemplateResult {
    const group = groupAt(config, path);
    if (!group) return html`<ha-card><span class="muted">This bus no longer exists.</span></ha-card>`;
    const isRoot = path.length === 2;
    const fields = fieldErrors(this.errors, path);
    const own = this.errors.filter((e) => e.path === pathKey(path));

    return html`
      <ha-card header=${group.name ?? group.id}>
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${groupData(group, isRoot, BUS_FIELDS)}
              .schema=${groupSchema(group, isRoot, BUS_FIELDS)}
              .error=${fields}
              .computeLabel=${groupLabel}
              .computeHelper=${groupHelper}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${MAX_VALUE_SELECTOR}
              .value=${group.max_value}
              .inherited=${config.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${fields.max_value}
              @value-changed=${(ev: CustomEvent<{ value: number | null }>) =>
                this.setField("max_value", ev.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              label="Precision"
              kind="select"
              .selector=${PRECISION_SELECTOR}
              .value=${group.precision === null ? null : String(group.precision)}
              .inherited=${String(config.defaults.precision)}
              .inheritedFrom=${"defaults"}
              .error=${fields.precision}
              @value-changed=${(ev: CustomEvent<{ value: string | null }>) =>
                this.setField("precision", ev.detail.value === null ? null : Number(ev.detail.value))}
            ></al-override-field>
          </div>
          ${this.renderStatus(config, group)}
        </div>
        ${this.renderStimuli(config, group, path)}
      </ha-card>
    `;
  }

  /**
   * The group's stimuli, edited right here rather than on strips of their own: only groups
   * are tracks in the row above. Each one is the Groups tab's stimulus editor, collapsed -
   * a group with a dozen sensors would otherwise bury everything else on the page.
   */
  private renderStimuli(config: Config, group: Group, path: Path): TemplateResult {
    const presence = presenceSettings(config).enabled && roomIds(config).has(group.id);
    return html`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${presence ? this.renderPresence(config, group, path) : nothing}
        ${group.stimuli.length === 0 && !presence
          ? html`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>`
          : group.stimuli.map((stimulus, i) => this.renderStimulus(config, [...path, "stimuli", i], stimulus))}
      </div>
    `;
  }

  /**
   * The room's presence channel: a stimulus with no entity. It is fed by the room
   * estimate rather than by a sensor, so there is nothing to point at - but its gain
   * and its envelope are tuned here like any other channel's.
   */
  private renderPresence(config: Config, group: Group, path: Path): TemplateResult {
    const overrides = group.presence ?? newPresenceOverrides();
    const resolved = resolvedEnvelope(config, {
      ...overrides,
      envelope: overrides.envelope ?? presenceSettings(config).envelope,
    });
    const voice = this.live?.voices[group.id]?.find((v) => v.label === PRESENCE_KEY);
    const errors = fieldErrors(this.errors, [...path, "presence"]);
    return html`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${voice ? html`<span class="chip phase ${voice.phase}">${voice.phase}</span>` : nothing}
        </div>
        <ha-selector
          class="presence-envelope"
          .hass=${this.hass}
          .selector=${{ select: { mode: "dropdown", options: envelopeOptions(config) } }}
          .label=${"Envelope preset"}
          .required=${false}
          .value=${overrides.envelope ?? ""}
          @value-changed=${(ev: CustomEvent<{ value: string }>) =>
            this.setPresence(path, "envelope", ev.detail.value === "" ? null : ev.detail.value)}
        ></ha-selector>
        <al-override-field
          class="presence-gain"
          .hass=${this.hass}
          label="Gain"
          kind="number"
          .selector=${GAIN_SELECTOR}
          .value=${overrides.gain}
          .inherited=${1}
          .inheritedFrom=${"presence"}
          .error=${errors.gain}
          @value-changed=${(ev: CustomEvent<{ value: number | null }>) =>
            this.setPresence(path, "gain", ev.detail.value ?? 1)}
        ></al-override-field>
        ${OVERRIDES.map(
          (item) => html`<al-override-field
            class="presence-${item.name}"
            .hass=${this.hass}
            .label=${item.label}
            .kind=${item.kind}
            .selector=${item.selector}
            .value=${overrides[item.name] as OverrideValue}
            .inherited=${resolved[item.name] as OverrideValue}
            .inheritedFrom=${overrides.envelope ?? presenceSettings(config).envelope ?? "defaults"}
            .error=${errors[item.name]}
            @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) =>
              this.setPresence(path, item.name, ev.detail.value)}
          ></al-override-field>`,
        )}
        <al-envelope-sketch .envelope=${resolved}></al-envelope-sketch>
      </ha-expansion-panel>
    `;
  }

  private setPresence(path: Path, name: string, value: unknown): void {
    const config = this.config;
    if (!config) return;
    const group = groupAt(config, path);
    if (!group) return;
    const next = setAt(config, [...path, "presence"], {
      ...(group.presence ?? newPresenceOverrides()),
      [name]: value,
    });
    this.emitChange(next, `${pathKey(path)}:presence:${name}`);
  }

  private renderStimulus(config: Config, path: Path, stimulus: Stimulus): TemplateResult {
    const entity = this.hass?.states[stimulus.entity];
    const name =
      (entity?.attributes.friendly_name as string | undefined) ?? (stimulus.entity || "(no entity)");
    const count = subtreeErrorCount(this.errors, path);
    return html`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:flash"></ha-icon>
          <span class="name">${stimulus.key ?? name}</span>
          ${count ? html`<span class="badge" title="${count} problem(s)">${count}</span>` : nothing}
          ${entity ? html`<span class="muted chip">${entity.state}</span>` : nothing}
        </div>
        <al-stimulus-editor
          .hass=${this.hass}
          .config=${config}
          .path=${path}
          .errors=${this.errors}
          .live=${this.live}
        ></al-stimulus-editor>
      </ha-expansion-panel>
    `;
  }

  private renderStatus(config: Config, group: Group): TemplateResult {
    const gid = group.id;
    // The live frame is what the engine is actually rounding to; the config is the same
    // number for every group the engine already knows about, and the answer for one it
    // does not (a group added in this draft has no live entry yet).
    const dp = this.live?.groups[gid]?.precision ?? effectivePrecision(config, group);
    const lights = this.live?.groups[gid]?.lights ?? 0;
    const sim: HassEntity | undefined = this.hass?.states[simSwitchId(gid)];
    const blocked = this.simLog?.blocked[gid] ?? null;
    const entries = (this.simLog?.entries ?? [])
      .filter((e) => e.group_id === gid)
      .sort((a, b) => b.t - a.t)
      .slice(0, LOG_ROWS);

    return html`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${lights} light${lights === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${lights > 0
          ? html`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${sim?.state === "on"}
                .disabled=${sim === undefined}
                title=${sim === undefined ? "No simulation switch for this bus" : "Presence simulation"}
                @change=${(ev: Event) => this.onSim(gid, ev)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>`
          : nothing}
        ${blocked !== null ? html`<div class="muted blocked">Blocked: ${blocked}</div>` : nothing}
        ${this.renderSensor("expected", "Expected", expectedSensorId(gid), dp)}
        ${this.renderSensor("anomaly", "Anomaly", anomalySensorId(gid), dp)}
        <div class="muted readiness">${this.readiness(config, gid)}</div>
        ${entries.length > 0
          ? html`<ol class="log">
              ${entries.map((e) => this.renderLogEntry(e))}
            </ol>`
          : html`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
  }

  /**
   * One of the pattern sensors, with the day type it was measured against. The state is a
   * level, so it is printed at the group's precision rather than at whatever the sensor
   * happens to carry; anything that is not a number ("unknown", "unavailable") is a state,
   * not a level, and goes through untouched.
   */
  private renderSensor(cls: string, label: string, entityId: string, precision: number): TemplateResult {
    const entity = this.hass?.states[entityId];
    const dayType = entity?.attributes.day_type;
    const raw = entity?.state;
    const n = raw === undefined ? NaN : Number(raw);
    const value = raw === undefined ? "—" : raw.trim() !== "" && Number.isFinite(n) ? formatLevel(n, precision) : raw;
    return html`<div class="row ${cls}">
      <span class="muted">${label}</span>
      <span class="value">${value}</span>
      ${typeof dayType === "string" ? html`<span class="muted">${dayType}</span>` : nothing}
    </div>`;
  }

  private renderLogEntry(e: SimulationLogEntry): TemplateResult {
    return html`<li>
      <span class="muted">${new Date(e.t * 1000).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
    </li>`;
  }

  /**
   * How far the profile is from being usable. Days come from the profile document rather
   * than the readiness map, so a group that is still learning can say how much is left.
   */
  private readiness(config: Config, gid: string): string {
    const profileState = this.profileState;
    if (!profileState) return "Profile not loaded.";
    const days = profileState.profile.groups[gid]?.days ?? 0;
    const minDays = config.defaults.patterns?.min_days ?? DEFAULT_MIN_DAYS;
    return profileState.ready[gid] === true
      ? `Profile ready · ${days} days learned`
      : `Learning… ${days}/${minDays} days`;
  }

  override render() {
    const { config, path } = this;
    if (!config || !path || path.length === 0)
      return html`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>`;
    return isChannel(path) ? this.renderChannel(config, path) : this.renderBus(config, path);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-strip-controls": AlStripControls;
  }
}
