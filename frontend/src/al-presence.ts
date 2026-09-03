import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./al-graph-map";
import "./al-people-editor";
import { KIND_ICONS, KIND_LABELS } from "./al-people-editor";
import { getPresenceState, getTopology, getTopologyPaths } from "./api";
import { durationToSeconds, secondsToDuration } from "./duration";
import { fieldErrors } from "./errors";
import { alChange } from "./events";
import { newPresenceDevice, newPresencePerson, presenceSettings } from "./model";
import { setAt } from "./store";
import { envelopeOptions } from "./stimulus-form";
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
 * The Presence tab: the room graph, who the estimator thinks is where, what it is reading
 * that from, and the settings behind all of it.
 *
 * Unlike the other tabs this one fetches its own data. The topology and the presence state
 * are read nowhere else in the panel, and holding them in the shell would keep two
 * websocket polls alive on every tab that does not draw them.
 */
@customElement("al-presence")
export class AlPresence extends LitElement {
  static styles = [
    sharedStyles,
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
        padding: 4px 8px 4px 0;
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
      .chip {
        border-radius: 10px;
        padding: 1px 8px;
        font-size: 0.8em;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .device-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin: 0 4px 2px 0;
        --mdc-icon-size: 16px;
      }
      .device-chip.parked {
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color);
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
      .paths {
        margin-top: 12px;
      }
      .paths ol {
        margin: 4px 0 0;
        padding-left: 20px;
      }
      .empty {
        color: var(--secondary-text-color);
        font-size: 0.9em;
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
  /** The pair of rooms the map is routing between; a third pick shifts the older one out. */
  @state() private selected: [string | null, string | null] = [null, null];
  @state() private paths: string[][] = [];
  /** A request is out. Until it lands there is no verdict to report, only a wait. */
  @state() private pathsPending = false;

  private timer?: ReturnType<typeof setInterval>;
  /** Which paths request is the current one; an older answer resolving late is dropped. */
  private pathSeq = 0;

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
    // Adjacency is part of the draft, so the map has to follow an edit, not just a save.
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
   * Keeps the last two rooms picked. Picking one that is already in the pair drops it, so
   * a mis-click is undone by repeating it rather than by picking two more rooms.
   */
  private onMapSelect = (ev: CustomEvent<{ id: string }>): void => {
    ev.stopPropagation();
    const id = ev.detail.id;
    const pair = this.selected.filter((x): x is string => x !== null);
    const next = pair.includes(id) ? pair.filter((x) => x !== id) : [...pair, id].slice(-2);
    this.selected = [next[0] ?? null, next[1] ?? null];
    this.paths = [];
    void this.refreshPaths();
  };

  private async refreshPaths(): Promise<void> {
    const [from, to] = this.selected;
    const hass = this.hass;
    const seq = ++this.pathSeq;
    if (!hass || from === null || to === null || from === to) {
      this.pathsPending = false;
      return;
    }
    this.pathsPending = true;
    try {
      const paths = await getTopologyPaths(hass, from, to);
      if (seq === this.pathSeq) this.paths = paths;
    } catch {
      /* a room that has gone away answers with an error; the empty list is the honest answer */
    } finally {
      if (seq === this.pathSeq) this.pathsPending = false;
    }
  }

  /** Friendly names for every group, so a room id never reaches the page. */
  private get labels(): Map<string, string> {
    const config = this.config;
    return new Map(config ? branchRows(config).map((row) => [row.id, row.label]) : []);
  }

  private roomName(id: string | null | undefined): string {
    if (id === null || id === undefined || id === "") return "—";
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

  private renderMap(config: Config): TemplateResult {
    return html`<ha-card header="Rooms">
      <al-graph-map
        .hass=${this.hass}
        .config=${config}
        .topology=${this.topology}
        .presence=${this.presence}
        .selected=${this.selected}
        .paths=${this.paths}
        @al-map-select=${this.onMapSelect}
      ></al-graph-map>
      ${this.renderPaths()}
    </ha-card>`;
  }

  private renderPaths(): TemplateResult {
    const [from, to] = this.selected;
    if (from === null || to === null)
      return html`<div class="paths empty">Pick two rooms on the map to see the routes between them.</div>`;
    const heading = `${this.roomName(from)}${ARROW}${this.roomName(to)}`;
    // Only an answered request can say there is no route; before that it is still looking.
    if (this.pathsPending) return html`<div class="paths muted">Finding routes from ${heading}…</div>`;
    if (this.paths.length === 0)
      return html`<div class="paths">
        <div class="muted">no route from ${heading}</div>
      </div>`;
    return html`<div class="paths">
      <div class="muted">
        ${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${heading}
      </div>
      <ol>
        ${this.paths.map((path) => html`<li class="path">${this.trail(path)}</li>`)}
      </ol>
    </div>`;
  }

  private renderPeople(): TemplateResult {
    const people = Object.entries(this.presence?.people ?? {})
      .filter(([, outputs]) => typeof outputs.room === "string")
      .sort(([a], [b]) => a.localeCompare(b));
    if (people.length === 0)
      return html`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >`;
    return html`<ha-card header="People">
      <table>
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
          ${people.map(([name, outputs]) => this.renderPerson(name, outputs))}
        </tbody>
      </table>
    </ha-card>`;
  }

  private renderPerson(name: string, outputs: PersonOutputs): TemplateResult {
    const percent = Math.round(outputs.confidence * 100);
    const devices = Object.entries(outputs.devices ?? {}).sort(([a], [b]) => a.localeCompare(b));
    return html`<tr class="device person">
      <td class="who">${name}</td>
      <td class="room">
        ${this.roomName(outputs.room)}
        ${outputs.moving ? html`<span class="chip moving">moving</span>` : nothing}
      </td>
      <td>
        <div class="meter" title=${`${percent}%`}>
          <div class="confidence" style=${`width: ${percent}%`}></div>
        </div>
      </td>
      <td class="devices">${devices.map(([id, device]) => this.renderDeviceChip(id, device))}</td>
      <td class="breadcrumb">${outputs.path.length === 0 ? "—" : this.trail(outputs.path)}</td>
      <td class="when">${new Date(outputs.t * 1000).toLocaleTimeString()}</td>
    </tr>`;
  }

  /**
   * One device: what it is, how likely it is on the person, and — when it probably is
   * not — where it was left. A parked phone's room is the answer to "where did I put it".
   */
  private renderDeviceChip(id: string, device: PresenceDeviceRow): TemplateResult {
    const carried = device.carried;
    const parked = carried !== null && carried < 0.5;
    const percent = carried === null ? "—" : `${Math.round(carried * 100)}%`;
    const title = `${device.name} (${KIND_LABELS[device.kind]}): carried ${percent}${
      parked && device.room ? `, in ${this.roomName(device.room)}` : ""
    }`;
    return html`<span class="chip device-chip ${parked ? "parked" : "carried"}" data-device=${id} title=${title}>
      <ha-icon icon=${KIND_ICONS[device.kind] ?? KIND_ICONS.other}></ha-icon>
      <span class="carried-pct">${percent}</span>
      ${parked && device.room ? html`<span class="parked-room">${this.roomName(device.room)}</span>` : nothing}
    </span>`;
  }

  private renderScanners(): TemplateResult {
    const scanners = this.presence?.scanners ?? [];
    const unmapped = new Set(this.presence?.unmapped ?? []);
    return html`<ha-card header="Scanners">
      ${scanners.length === 0
        ? html`<div class="empty">No Bermuda scanners have been discovered.</div>`
        : html`<table>
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
          </table>`}
      ${this.renderDisabled()}
    </ha-card>`;
  }

  private renderScanner(scanner: ScannerRow, unmapped: boolean): TemplateResult {
    return html`<tr class="scanner ${unmapped ? "unmapped" : ""}">
      <td class="name">${scanner.name}</td>
      <td class="area">${this.areaName(scanner.area_id)}</td>
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
    return html`<ha-card header="Settings">
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
    </ha-card>`;
  }

  override render() {
    const config = this.config;
    if (!config) return html`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    if (!presenceSettings(config).enabled) return html`<div class="page">${this.renderSetup(config)}</div>`;
    return html`<div class="page">
      ${this.renderMap(config)} ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(config)}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-presence": AlPresence;
  }
}
