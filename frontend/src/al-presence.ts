import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./al-people-editor";
import { KIND_ICONS, KIND_LABELS } from "./al-people-editor";
import type { PresenceCorrection } from "./api";
import type { CorrectionStatus } from "./types";
import { entityLinks, registryLink } from "./ha-links";
import { correctPresence, getPresenceState, getTopology } from "./api";
import { durationToSeconds, secondsToDuration } from "./duration";
import { fieldErrors } from "./errors";
import { alChange } from "./events";
import { newPresenceDevice, newPresencePerson, presenceSettings, roomIds } from "./model";
import { setAt } from "./store";
import { envelopeOptions } from "./stimulus-form";
import { presenceStyles } from "./presence-styles";
import { sharedStyles } from "./styles";
import { branchRows } from "./topology";
import type { PropertyValues, TemplateResult } from "lit";
import type { Selector } from "./al-override-field";
import type {
  CarriedSettings,
  Config,
  HaDuration,
  HomeAssistant,
  PersonOutputs,
  PresenceDeviceRow,
  PresencePerson,
  PresenceSettings,
  PresenceState,
  ScannerRow,
  TopologyPayload,
  ValidationError,
} from "./types";

/** How often the room estimate is re-read. The estimator itself moves at Bermuda's pace. */
export const PRESENCE_POLL_MS = 2000;
/** The state that is not a room, as the backend spells it. */
const AWAY = "away";

export interface FormItem {
  name: string;
  selector: Selector;
}

const LABELS: Record<string, string> = {
  enabled: "Estimate room presence",
  devices: "Tracked devices",
  envelope: "Presence envelope",
  threshold: "Confidence threshold",
  stay: "Stay probability",
  escape: "Escape probability",
  scale: "Distance scale",
  floor: "Room floor",
  stuck_after: "Reset when stuck for",
  activity_floor: "Empty-room floor",
  carried_prior: "Carried prior",
  carried_flip: "Carried flip time",
  carried_recent: "Recent window",
  carried_nearby: "Parked nearby",
  carried_charging: "Charging weight",
  carried_moving: "Moving weight",
  carried_still_room_empty: "Still in an empty room weight",
  carried_jitter: "Jitter weight",
};

/** One line each, matching the README. */
const HELPERS: Record<string, string> = {
  enabled: "Estimate which room each tracked device is in. Needs Bermuda.",
  devices: "Bermuda device_trackers to follow — one per person.",
  envelope: "Preset the presence channel of every room starts from.",
  threshold: "How sure the estimate has to be before somebody counts as in the room.",
  stay: "Chance of staying put between two updates. Higher is steadier and slower.",
  escape: "Chance of turning up in a room with no path to this one. The way back from a wrong guess.",
  scale: "Distance, in metres, at which a scanner stops telling you anything.",
  floor: "Likelihood given to a room with no scanner of its own.",
  stuck_after: "How long the readings have to stay implausible before the estimate is reset.",
  activity_floor:
    "Likelihood given to a room whose activity level is 0.0 while another room is busy. Lower makes an empty room a stronger 'not here'.",
  carried_prior: "How likely a device is on its person before any signal says otherwise.",
  carried_flip: "Mean time between a device being picked up or put down. Longer is steadier.",
  carried_recent: "How far back 'moved lately' looks. A signal held this long is worth its whole weight.",
  carried_nearby: "Chance a parked device is in the same room as its person. A phone on the kitchen counter still says something about the kitchen.",
  carried_charging: "Log-odds added while the battery is charging or full. Negative: on a cable means on a table.",
  carried_moving: "Log-odds added while the companion app reports walking, or the step count rose lately.",
  carried_still_room_empty: "Log-odds added while the device sits still in a room whose level is 0.0.",
  carried_jitter: "Log-odds added while the device's closest distance wanders. A pocket moves; a shelf does not.",
};

/** Fields the form owns, checked in order to name the coalescing key. */
const FORM_FIELDS = [
  "enabled",
  "envelope",
  "threshold",
  "stay",
  "escape",
  "scale",
  "floor",
  "stuck_after",
  "activity_floor",
  "carried_prior",
  "carried_flip",
  "carried_recent",
  "carried_nearby",
  "carried_charging",
  "carried_moving",
  "carried_still_room_empty",
  "carried_jitter",
] as const;

const WEIGHTS = ["charging", "moving", "still_room_empty", "jitter"] as const;

type FormField = (typeof FORM_FIELDS)[number];

/**
 * The device picker is an entity picker, not a device one: Bermuda publishes a
 * `device_tracker` per followed device, and that entity is what the estimator reads.
 */
const DEVICES_SELECTOR: Selector = {
  entity: { multiple: true, filter: { domain: "device_tracker", integration: "bermuda" } },
};
// Each of these mirrors the bound `schema.py` enforces, so a slider dragged to its end
// still saves. `stay` is open at both ends, `threshold` and `floor` are open at zero and
// closed at one, and a step of 0.01 is the smallest value the exclusive ends admit.
const STAY_SELECTOR: Selector = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } };
const THRESHOLD_SELECTOR: Selector = { number: { min: 0.01, max: 1, step: 0.01, mode: "slider" } };
const ESCAPE_SELECTOR: Selector = { number: { min: 0, max: 0.1, step: 0.001, mode: "box" } };
const SCALE_SELECTOR: Selector = { number: { min: 0.1, step: 0.1, mode: "box" } };
const FLOOR_SELECTOR: Selector = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } };
const DURATION_SELECTOR: Selector = { duration: {} };
// `carried.prior` and `carried.nearby` are open at both ends; a weight is [-10, 10].
const PRIOR_SELECTOR: Selector = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } };
const WEIGHT_SELECTOR: Selector = { number: { min: -10, max: 10, step: 0.5, mode: "box" } };

const ARROW = " → ";

/** What to do about a scanner nothing could be matched to. */
const UNMAPPED_FIX = "Give it an area that matches a room, or map it in Settings below.";
const DISABLED_FIX =
  "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:";

const number = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * The Presence tab: who the estimator thinks is where, what it is reading
 * that from, and the settings behind all of it.
 *
 * This tab owns its presence polling so leaving the page stops the requests. Topology
 * supplies the correction room choices; the separate Paths page owns route selection.
 */
@customElement("al-presence")
export class AlPresence extends LitElement {
  static styles = [
    sharedStyles,
    presenceStyles,
    css`
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      th,
      td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        vertical-align: top;
      }
      td.when,
      td.room {
        font-variant-numeric: tabular-nums;
      }
      .meter {
        width: 100%;
        min-width: 60px;
      }
      .device-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        --mdc-icon-size: 18px;
        text-align: left;
      }
      .device-entry + .device-entry { margin-top: 12px; }
      .device-chip .carried-pct { font-variant-numeric: tabular-nums; }
      .correction-panel { display: grid; gap: 16px; padding: 16px; }
      .correction-panel .question { font-weight: 600; }
      .correction-fields { display: flex; flex-wrap: wrap; gap: 16px; }
      .correction-fields label { display: grid; gap: 6px; min-width: 200px; }
      .correct td { background: var(--secondary-background-color); padding: 0; }
      .who { width: 120px; }
      .when { white-space: nowrap; }
      .devices { min-width: 260px; }
      .confidence-label { display: block; margin-bottom: 6px; font-variant-numeric: tabular-nums; }
      .settings-body { display: grid; gap: 20px; padding-top: 16px; }
      summary { cursor: pointer; font-weight: 600; padding: 8px 0; }
      .moving { display: block; font-size: 0.85em; margin-top: 4px; }
      .notice,
      .hint {
        margin-top: 8px;
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }
      h3 {
        margin: 12px 0 8px;
        font-size: 1em;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .breadcrumb {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      tr.scanner.unmapped td.room {
        color: var(--warning-color, #ffa600);
      }
      .disabled-sensors {
        margin-top: 12px;
        color: var(--warning-color, #ffa600);
        font-size: 0.9em;
      }
      .disabled-sensors ul {
        margin: 4px 0 0;
        padding-left: 20px;
      }
      .empty {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      @media (max-width: 850px) {
        .people-table, .people-table tbody { display: block; }
        .people-table thead { display: none; }
        .people-table tr.person { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        .people-table tr.person td { width: auto; min-width: 0; padding: 12px 4px; }
        .people-table td[data-label]::before {
          content: attr(data-label);
          display: block;
          color: var(--secondary-text-color);
          font-size: 0.85em;
          margin-bottom: 6px;
        }
        .people-table td.devices { grid-column: 1 / -1; }
        .people-table tr.correct, .people-table tr.correct td { display: block; }
        .device-chip { flex-wrap: wrap; max-width: 100%; }
        .correction-panel { padding: 12px; }
        .correction-fields label { min-width: 0; width: 100%; }
        .correction-fields select { width: 100%; }
        .when { white-space: normal; }
      }
      .setup p {
        margin: 0 0 12px;
      }
      .setup .row {
        margin-bottom: 12px;
      }
      .setup ha-selector {
        display: block;
        margin-bottom: 12px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ type: Boolean }) narrow = false;

  @state() private topology: TopologyPayload | null = null;
  @state() private presence: PresenceState | null = null;
  /** The person whose room picker is open, if any. One at a time: it is a question. */
  @state() private correcting: string | null = null;
  @state() private correctingDevice: { person: string; device: string } | null = null;
  @state() private carryingChoices: Record<string, boolean> = {};
  @state() private correctionPending = false;
  @state() private correctionError: string | null = null;
  /** The last correction's outcome, shown once under the People card. */
  @state() private notice: string | null = null;

  private timer?: ReturnType<typeof setInterval>;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.refreshTopology();
    void this.refreshPresence();
    this.timer = setInterval(() => {
      // A hidden panel is not being read: the next tick after it comes back will catch up.
      if (document.visibilityState === "hidden") return;
      void this.refreshPresence();
    }, PRESENCE_POLL_MS);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
  }

  override willUpdate(changed: PropertyValues<this>): void {
    // Refresh the correction room choices when the configuration changes.
    if (changed.has("config") && changed.get("config") !== undefined) void this.refreshTopology();
  }

  private async refreshTopology(): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    try {
      this.topology = await getTopology(hass);
    } catch {
      /* transient websocket failure: keep the graph we have and retry on the next edit */
    }
  }

  private async refreshPresence(): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    try {
      this.presence = await getPresenceState(hass);
    } catch {
      /* transient websocket failure: keep the last frame and retry on the next tick */
    }
  }

  /**
   * "No, I'm in the studio." The estimate moves at once and the moment is kept as a
   * label; the state is re-read straight after so the row shows the answer rather than
   * waiting a poll for it.
   */
  private async correct(person: string, correction: string | PresenceCorrection): Promise<void> {
    const hass = this.hass;
    if (!hass || this.correctionPending) return;
    const request = typeof correction === "string"
      ? { room: correction, ...(Object.keys(this.carryingChoices).length ? { carrying: this.carryingChoices } : {}) }
      : correction;
    this.correctionPending = true;
    this.correctionError = null;
    this.notice = null;
    try {
      await correctPresence(hass, person, request);
      this.notice = request.device ? "Device correction saved." : request.room
        ? `Moved ${person} to ${this.roomName(request.room)}.` : "Automatic estimate restored.";
      this.correcting = null;
      this.correctingDevice = null;
      this.carryingChoices = {};
      await this.refreshPresence();
    } catch (err) {
      const message = err && typeof err === "object" && "message" in err ? String(err.message) : String(err);
      this.correctionError = `Could not save correction: ${message}`;
    } finally {
      this.correctionPending = false;
    }
  }

  private correctionStatus(status: CorrectionStatus | null | undefined): TemplateResult | typeof nothing {
    if (!status) return nothing;
    const value = typeof status.value === "boolean" ? (status.value ? "Carrying" : "Not carrying") : this.roomName(status.value);
    const reason = status.reason.replaceAll("_", " ");
    return html`<div class="hint correction-status" role="status">${value} — ${reason}
      (${Math.round(status.strength * 100)}%) · <time datetime=${new Date(status.t * 1000).toISOString()}>${new Date(status.t * 1000).toLocaleTimeString()}</time></div>`;
  }

  /** Every room a person can be said to be in: the graph's nodes, then Away. */
  private get correctionRooms(): string[] {
    const config = this.config;
    const ids = this.topology?.nodes ?? (config ? [...roomIds(config)] : []);
    return [...ids, AWAY];
  }

  /** Friendly names for every group, so a room id never reaches the page. */
  private get labels(): Map<string, string> {
    const config = this.config;
    return new Map(config ? branchRows(config).map((row) => [row.id, row.label]) : []);
  }

  private roomName(id: string | null | undefined): string {
    if (id === null || id === undefined || id === "") return "—";
    if (id === AWAY) return "Away";
    return this.labels.get(id) ?? id;
  }

  private areaName(areaId: string | null): string {
    if (areaId === null) return "—";
    return this.hass?.areas[areaId]?.name ?? areaId;
  }

  private trail(path: readonly string[]): string {
    return path.map((id) => this.roomName(id)).join(ARROW);
  }

  private computeLabel = (item: FormItem): string => LABELS[item.name] ?? item.name;
  private computeHelper = (item: FormItem): string => HELPERS[item.name] ?? "";

  private schemaFor(config: Config): FormItem[] {
    return [
      { name: "enabled", selector: { boolean: {} } },
      { name: "envelope", selector: { select: { mode: "dropdown", options: envelopeOptions(config) } } },
      { name: "threshold", selector: THRESHOLD_SELECTOR },
      { name: "stay", selector: STAY_SELECTOR },
      { name: "escape", selector: ESCAPE_SELECTOR },
      { name: "scale", selector: SCALE_SELECTOR },
      { name: "floor", selector: FLOOR_SELECTOR },
      { name: "stuck_after", selector: DURATION_SELECTOR },
      { name: "activity_floor", selector: FLOOR_SELECTOR },
      { name: "carried_prior", selector: PRIOR_SELECTOR },
      { name: "carried_flip", selector: DURATION_SELECTOR },
      { name: "carried_recent", selector: DURATION_SELECTOR },
      { name: "carried_nearby", selector: PRIOR_SELECTOR },
      ...WEIGHTS.map((weight) => ({ name: `carried_${weight}`, selector: WEIGHT_SELECTOR })),
    ];
  }

  /**
   * The setup picker speaks Bermuda tracker ids; the config keeps a person around each.
   * A person whose tracker is still picked survives untouched — re-picking the same phone
   * must not quietly rename the person standing behind it — and a new tracker becomes a
   * one-device person to be named later.
   */
  private mergePeople(value: unknown, current: readonly PresencePerson[]): PresencePerson[] {
    if (!Array.isArray(value)) return [...current];
    const picked = (value as unknown[]).filter((id): id is string => typeof id === "string");
    const kept = current.filter((person) => person.devices.some((device) => picked.includes(device.tracker)));
    const known = new Set(kept.flatMap((person) => person.devices.map((device) => device.tracker)));
    const added = picked
      .filter((tracker) => !known.has(tracker))
      .map((tracker) => ({ ...newPresencePerson(), devices: [newPresenceDevice(tracker)] }));
    return [...kept, ...added];
  }

  private onFormChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const config = this.config;
    if (!config) return;
    const s = presenceSettings(config);
    const v = ev.detail?.value ?? {};
    const weights: CarriedSettings["weights"] = {
      charging: number(v.carried_charging) ?? s.carried.weights.charging,
      moving: number(v.carried_moving) ?? s.carried.weights.moving,
      still_room_empty: number(v.carried_still_room_empty) ?? s.carried.weights.still_room_empty,
      jitter: number(v.carried_jitter) ?? s.carried.weights.jitter,
    };
    const merged: PresenceSettings = {
      ...s,
      enabled: typeof v.enabled === "boolean" ? v.enabled : s.enabled,
      envelope:
        v.envelope === undefined
          ? s.envelope
          : typeof v.envelope === "string" && v.envelope !== ""
            ? v.envelope
            : null,
      threshold: number(v.threshold) ?? s.threshold,
      stay: number(v.stay) ?? s.stay,
      escape: number(v.escape) ?? s.escape,
      scale: number(v.scale) ?? s.scale,
      floor: number(v.floor) ?? s.floor,
      stuck_after: durationToSeconds(v.stuck_after as HaDuration | undefined) ?? s.stuck_after,
      activity: { floor: number(v.activity_floor) ?? s.activity.floor },
      carried: {
        prior: number(v.carried_prior) ?? s.carried.prior,
        flip: durationToSeconds(v.carried_flip as HaDuration | undefined) ?? s.carried.flip,
        recent: durationToSeconds(v.carried_recent as HaDuration | undefined) ?? s.carried.recent,
        nearby: number(v.carried_nearby) ?? s.carried.nearby,
        weights,
      },
    };
    // The form flattens `activity.floor` and `carried.*` to `activity_floor` and
    // `carried_*`; the document keeps the nesting.
    const same = (key: FormField): boolean => {
      switch (key) {
        case "activity_floor":
          return merged.activity.floor === s.activity.floor;
        case "carried_prior":
        case "carried_flip":
        case "carried_recent":
        case "carried_nearby": {
          const field = key.slice("carried_".length) as "prior" | "flip" | "recent" | "nearby";
          return merged.carried[field] === s.carried[field];
        }
        case "carried_charging":
        case "carried_moving":
        case "carried_still_room_empty":
        case "carried_jitter": {
          const weight = key.slice("carried_".length) as (typeof WEIGHTS)[number];
          return merged.carried.weights[weight] === s.carried.weights[weight];
        }
        default:
          return merged[key] === s[key];
      }
    };
    const field = FORM_FIELDS.find((key) => !same(key));
    if (field === undefined) return;
    this.dispatchEvent(alChange(setAt(config, ["presence"], merged), `presence:${field}`));
  }

  /**
   * Writes one field of the presence block into the draft, exactly as `onFormChanged` does
   * for the full settings form. The setup card only ever touches `enabled`, but the helper
   * is generic so it stays the one place that builds the block.
   */
  private setSetting<K extends keyof PresenceSettings>(key: K, value: PresenceSettings[K]): void {
    const config = this.config;
    if (!config) return;
    const s = presenceSettings(config);
    const merged: PresenceSettings = { ...s, [key]: value };
    this.dispatchEvent(alChange(setAt(config, ["presence"], merged), `presence:${key}`));
  }

  private onDevicesChanged = (ev: CustomEvent<{ value?: unknown }>): void => {
    ev.stopPropagation();
    const config = this.config;
    if (!config) return;
    const s = presenceSettings(config);
    const merged: PresenceSettings = { ...s, people: this.mergePeople(ev.detail?.value, s.people) };
    this.dispatchEvent(alChange(setAt(config, ["presence"], merged), "presence:people"));
  };

  /**
   * What the tab is before presence exists. The tab is always listed, because a feature you
   * cannot find is a feature nobody turns on — and everything here is the Settings form
   * afterwards, reduced to the two fields that start it.
   */
  private renderSetup(config: Config): TemplateResult {
    const found = this.presence?.bermuda === true;
    const s = presenceSettings(config);
    return html`<ha-card class="setup" header="Room presence">
      <p>
        Activity Levels can work out which room each tracked device is in, from the Bluetooth
        distances <a href="https://github.com/agittins/bermuda">Bermuda</a> reports to every
        scanner in the house.
      </p>
      <p class="muted">
        Turning it on gives each area a <em>presence</em> channel in its mix, a
        <code>sensor.&lt;area&gt;_occupants</code>, and one <code>sensor.&lt;name&gt;_room</code>
        per person — and it uses the adjacency you have already drawn, because the estimate
        walks that graph rather than jumping across it.
      </p>
      <div class="bermuda row">
        <ha-icon icon=${found ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}></ha-icon>
        <span>
          ${found
            ? "Bermuda is installed."
            : "Bermuda was not found. Install it first, or this will have nothing to read."}
        </span>
      </div>
      <div class="enable row">
        <ha-switch .checked=${false} @change=${() => this.setSetting("enabled", true)}></ha-switch>
        <span>Estimate room presence</span>
      </div>
      <ha-selector
        class="setup-devices"
        .hass=${this.hass}
        .selector=${DEVICES_SELECTOR}
        .label=${LABELS.devices}
        .helper=${HELPERS.devices}
        .required=${false}
        .value=${s.people.flatMap((person) => person.devices.map((device) => device.tracker))}
        @value-changed=${this.onDevicesChanged}
      ></ha-selector>
      <p class="muted">
        Bermuda ships its per-scanner distance sensors disabled. Enable them under
        <em>Settings → Devices &amp; services → Bermuda</em> before expecting a room out of
        this, and give each scanner device the area of the room it sits in.
      </p>
    </ha-card>`;
  }

  private renderPeople(): TemplateResult {
    const people = Object.entries(this.presence?.people ?? {})
      .filter(([, outputs]) => typeof outputs.room === "string")
      .sort(([a], [b]) => a.localeCompare(b));
    if (people.length === 0)
      return html`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >`;
    return html`<ha-card><h2>People</h2>
      <div class="muted hint">Select a person or device to correct its estimate.</div>
      <div class="table-scroll"><table class="people-table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Room</th>
            <th>Confidence</th>
            <th>Devices</th>
            <th>Came from</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          ${people.flatMap(([name, outputs]) => [
            this.renderPerson(name, outputs),
            this.correcting === name ? this.renderCorrection(name, outputs) : nothing,
            this.correctingDevice?.person === name ? this.renderDeviceCorrection(name, outputs) : nothing,
          ])}
        </tbody>
      </table></div>
      ${this.notice === null ? nothing : html`<div class="notice" role="status">${this.notice}</div>`}
    </ha-card>`;
  }

  /**
   * "Where is Scott?" -- the rooms the estimate was weighing first, because one of them
   * is usually right, then every room for when none of them is.
   */
  private renderCorrection(name: string, outputs: PersonOutputs): TemplateResult {
    const candidates = Object.entries(outputs.candidates)
      .sort(([, a], [, b]) => b - a)
      .map(([room]) => room);
    return html`<tr class="correct">
      <td colspan="6"><div class="correction-panel">
        <span class="question">Where is ${name}?</span>
        <div class="correction-fields">${Object.entries(outputs.devices ?? {}).map(([id, device]) => html`<label>${device.name}
          <select data-carrying=${id} ?disabled=${this.correctionPending} aria-label=${`Carrying ${device.name}`} .value=${String(this.carryingChoices[id] ?? "")}
            @change=${(ev: Event) => {
              const value = (ev.target as HTMLSelectElement).value;
              const choices = { ...this.carryingChoices };
              if (value === "") delete choices[id]; else choices[id] = value === "true";
              this.carryingChoices = choices;
            }}>
            <option value="">Keep estimate (${device.carried === null ? "unknown" : `${Math.round(device.carried * 100)}% carrying`})</option>
            <option value="true">Carrying</option><option value="false">Not carrying</option>
          </select></label>`)}</div>
        ${this.correctionError ? html`<div role="alert">${this.correctionError}</div>` : nothing}
        <div class="actions">${candidates.map(
          (room) =>
            html`<button type="button" class="candidate" ?disabled=${this.correctionPending} @click=${() => void this.correct(name, room)}
              >${this.roomName(room)}</button
            >`,
        )}
        <select
          class="every-room" aria-label="Person room" ?disabled=${this.correctionPending}
          @change=${(ev: Event) => {
            const room = (ev.target as HTMLSelectElement).value;
            if (room !== "") void this.correct(name, room);
          }}
        >
          <option value="">Somewhere else…</option>
          ${this.correctionRooms.map((room) => html`<option value=${room}>${this.roomName(room)}</option>`)}
        </select>
        <button type="button" class="automatic-person" ?disabled=${this.correctionPending} @click=${() => void this.correct(name, { clear: true })}>Use automatic estimate</button>
        <button type="button" class="cancel" @click=${() => (this.correcting = null)}>Close</button></div>
      </div></td>
    </tr>`;
  }

  private renderPerson(name: string, outputs: PersonOutputs): TemplateResult {
    const percent = Math.round(outputs.confidence * 100);
    const devices = Object.entries(outputs.devices ?? {}).sort(([a], [b]) => a.localeCompare(b));
    return html`<tr class="device person">
      <td class="who" data-label="Person">
        <button
          class="link" type="button"
          aria-expanded=${this.correcting === name ? "true" : "false"}
          title="Say where ${name} really is"
          @click=${() => {
            this.correcting = this.correcting === name ? null : name;
            this.correctingDevice = null;
            this.carryingChoices = {};
            this.correctionError = null;
          }}
        >
          ${name}
        </button>
      </td>
      <td class="room" data-label="Room">
        ${this.roomName(outputs.room)}
        ${this.correctionStatus(outputs.correction)}
        ${outputs.moving ? html`<span class="chip moving">moving</span>` : nothing}
      </td>
      <td data-label="Confidence">
        <span class="confidence-label">${percent}%</span>
        <div class="meter" title=${`${percent}%`}>
          <div class="confidence" style=${`width: ${percent}%`}></div>
        </div>
      </td>
      <td class="devices" data-label="Devices">${devices.map(([id, device]) => this.renderDeviceChip(name, id, device))}</td>
      <td class="breadcrumb" data-label="Came from">${outputs.path.length === 0 ? "—" : this.trail(outputs.path)}</td>
      <td class="when" data-label="Updated">${new Date(outputs.t * 1000).toLocaleTimeString()}</td>
    </tr>`;
  }

  /**
   * One device: what it is, how likely it is on the person, and — when it probably is
   * not — where it was left. A parked phone's room is the answer to "where did I put it".
   */
  private renderDeviceChip(person: string, id: string, device: PresenceDeviceRow): TemplateResult {
    const carried = device.carried;
    const parked = carried !== null && carried < 0.5;
    const percent = carried === null ? "—" : `${Math.round(carried * 100)}%`;
    const title = `${device.name} (${KIND_LABELS[device.kind]}): carried ${percent}${
      parked && device.room ? `, in ${this.roomName(device.room)}` : ""
    }`;
    return html`<div class="device-entry"><button type="button" aria-expanded=${this.correctingDevice?.person === person && this.correctingDevice.device === id ? "true" : "false"} aria-label=${`Correct ${device.name}`} @click=${() => { this.correctingDevice = { person, device: id }; this.correcting = null; this.correctionError = null; }} class="chip device-chip ${parked ? "parked" : "carried"}" data-device=${id} title=${title}>
      <ha-icon icon=${KIND_ICONS[device.kind] ?? KIND_ICONS.other}></ha-icon>
      <span class="device-name">${device.name}</span>
      <span class="carried-pct">${percent} carrying</span>
      ${parked && device.room ? html`<span class="parked-room">${this.roomName(device.room)}</span>` : nothing}
    </button>${this.correctionStatus(device.correction)}${this.correctionStatus(device.carrying_correction)}</div>`;
  }

  private renderDeviceCorrection(person: string, outputs: PersonOutputs): TemplateResult | typeof nothing {
    const id = this.correctingDevice?.device;
    const device = id ? outputs.devices[id] : undefined;
    if (!id || !device) return nothing;
    return html`<tr class="correct device-correction"><td colspan="6"><div class="correction-panel">
      <div class="question">${device.name}</div>
      <div class="resource-links">${entityLinks(this, this.hass, device.tracker, "Open tracker", device.device_id, "Open Bermuda device", true)}</div>
      <div class="correction-fields"><label>Device room <select aria-label="Device room" ?disabled=${this.correctionPending} @change=${(ev: Event) => {
        const room = (ev.target as HTMLSelectElement).value;
        if (room) void this.correct(person, { device: id, room });
      }}><option value="">Choose a room…</option>${this.correctionRooms.map((room) => html`<option value=${room}>${this.roomName(room)}</option>`)}</select></label></div>
      <div class="actions"><button type="button" class="carrying" ?disabled=${this.correctionPending} @click=${() => void this.correct(person, { device: id, carried: true })}>Carrying</button>
      <button type="button" class="not-carrying" ?disabled=${this.correctionPending} @click=${() => void this.correct(person, { device: id, carried: false })}>Not carrying</button>
      <button type="button" class="automatic-device" ?disabled=${this.correctionPending} @click=${() => void this.correct(person, { device: id, clear: true })}>Use automatic estimate</button>
      <button type="button" @click=${() => { this.correctingDevice = null; }}>Close</button></div>
      <div class="hint">Movement can return this device to automatic estimation. Missing companion sensors are optional.</div>
      ${this.correctionError ? html`<div role="alert">${this.correctionError}</div>` : nothing}
    </div></td></tr>`;
  }

  private renderScanners(): TemplateResult {
    const scanners = this.presence?.scanners ?? [];
    const unmapped = new Set(this.presence?.unmapped ?? []);
    return html`<ha-card><h2>Scanners</h2>
      ${scanners.length === 0
        ? html`<div class="empty">No Bermuda scanners have been discovered.</div>`
        : html`<div class="table-scroll"><table>
            <thead>
              <tr>
                <th>Scanner</th>
                <th>Area</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              ${scanners.map((scanner) => this.renderScanner(scanner, unmapped.has(scanner.key)))}
            </tbody>
          </table></div>`}
      ${this.renderDisabled()}
    </ha-card>`;
  }

  private renderScanner(scanner: ScannerRow, unmapped: boolean): TemplateResult {
    return html`<tr class="scanner ${unmapped ? "unmapped" : ""}">
      <td class="name">${registryLink("device", scanner.device_id, scanner.name)}</td>
      <td class="area">${registryLink("area", scanner.area_id, this.areaName(scanner.area_id))}</td>
      <td class="room">${unmapped ? UNMAPPED_FIX : this.roomName(scanner.group_id)}</td>
    </tr>`;
  }

  private renderDisabled(): TemplateResult | typeof nothing {
    const disabled = this.presence?.disabled ?? [];
    if (disabled.length === 0) return nothing;
    return html`<div class="disabled-sensors">
      ${DISABLED_FIX}
      <ul>
        ${disabled.map((entity) => html`<li>${entity}</li>`)}
      </ul>
    </div>`;
  }

  private renderSettings(config: Config): TemplateResult {
    const s = presenceSettings(config);
    const fields = fieldErrors(this.errors, ["presence"]);
    const own = this.errors.filter((e) => e.path === "presence");
    const data: Record<string, unknown> = {
      enabled: s.enabled,
      envelope: s.envelope ?? "",
      threshold: s.threshold,
      stay: s.stay,
      escape: s.escape,
      scale: s.scale,
      floor: s.floor,
      stuck_after: secondsToDuration(s.stuck_after),
      activity_floor: s.activity.floor,
      carried_prior: s.carried.prior,
      carried_flip: secondsToDuration(s.carried.flip),
      carried_recent: secondsToDuration(s.carried.recent),
      carried_nearby: s.carried.nearby,
      ...Object.fromEntries(WEIGHTS.map((weight) => [`carried_${weight}`, s.carried.weights[weight]])),
    };
    return html`<ha-card><details><summary>Presence settings</summary><div class="settings-body">
      ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
      <h3>People</h3>
      <al-people-editor
        .hass=${this.hass}
        .config=${config}
        .errors=${this.errors}
        .presence=${this.presence}
      ></al-people-editor>
      <ha-form
        class="presence-settings"
        .hass=${this.hass}
        .data=${data}
        .schema=${this.schemaFor(config)}
        .error=${fields}
        .computeLabel=${this.computeLabel}
        .computeHelper=${this.computeHelper}
        @value-changed=${this.onFormChanged}
      ></ha-form>
    </div></details></ha-card>`;
  }

  override render() {
    const config = this.config;
    if (!config) return html`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    if (!presenceSettings(config).enabled) return html`<div class="page">${this.renderSetup(config)}</div>`;
    return html`<div class="page">
      ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(config)}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-presence": AlPresence;
  }
}
