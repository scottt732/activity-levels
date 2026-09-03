export type { Connection, Kind } from "./kinds";
import type { Connection, Kind } from "./kinds";

export type Mix = "sum" | "max" | "mean";
export type NullHandling = "zero" | "ignore";
/** When a trigger arriving on an envelope that is already sounding is honoured. */
export type RetriggerWhen = "always" | "after_attack" | "after_decay" | "release" | "idle";
export type Unavailable = "hold" | "note_off";

export interface EnvelopeOverrides {
  attack: number | null;
  decay: number | null;
  sustain: number | null;
  release: number | null;
  impulse: boolean | null;
  retrigger: RetriggerWhen | null;
  stack: boolean | null;
  unavailable: Unavailable | null;
  debounce: number | null;
}

export interface EnvelopePreset {
  id: string;
  /** Display name. Null (or blank) falls back to the id, which is what stimuli name. */
  label: string | null;
  attack: number;
  decay: number;
  /** A multiplier on the peak, not a fraction of it: above 1 the decay climbs. */
  sustain: number;
  release: number;
  impulse: boolean;
  retrigger: RetriggerWhen | null;
  stack: boolean | null;
  unavailable: Unavailable | null;
  debounce: number | null;
}

/** How a stimulus reads its entity: hold a note while it is active, or fire on each crossing. */
export type StimulusMode = "sustained" | "momentary";

/** Which crossings of the active states a momentary stimulus fires on. */
export type StimulusEdge = "enter" | "leave";

export interface Stimulus extends EnvelopeOverrides {
  entity: string;
  to: string[];
  mode: StimulusMode;
  /** Momentary only, but carried in both modes: the mode radio flips back and forth. */
  edges: StimulusEdge[];
  gain: number;
  key: string | null;
  envelope: string | null;
}

/** One edge out of a group. A plain id in the document means `{ connection: "door", one_way: false }`. */
export interface Adjacency { id: string; connection: Connection; one_way: boolean }

/** A group's own presence-channel tuning: the same overridable shape as a stimulus's envelope. */
export interface PresenceOverrides extends EnvelopeOverrides {
  gain: number;
  envelope: string | null;
  /** This room's own empty-room floor; null inherits `presence.activity.floor`. 1 exempts a room people sleep in. */
  activity_floor: number | null;
}

export interface Group {
  id: string;
  name: string | null;
  /** What this group is on the property. Null only in a document the backend refused. */
  kind: Kind;
  /** The Home Assistant floor this group binds, for a `floor`. Optional: a floor need not exist. */
  floor_id: string | null;
  /** The Home Assistant area this group binds. Was `area`; the backend rewrites the old spelling. */
  area_id: string | null;
  mix: Mix;
  null_handling: NullHandling;
  max_value: number | null;
  precision: number | null;
  gain: number;
  /** Groups you can walk between from here. See {@link Adjacency}. */
  adjacent: (string | Adjacency)[];
  /** Whether presence can leave the property from here, to Away. */
  exit: boolean;
  presence: PresenceOverrides;
  stimuli: Stimulus[];
  children: Group[];
}

export interface Defaults {
  envelope: string;
  max_value: number;
  precision: number;
  unavailable: Unavailable;
  retrigger: RetriggerWhen;
  stack: boolean;
  debounce: number;
  safety_refresh: number;
  min_wake_interval: number;
  /**
   * Pattern-learning settings. Typed loosely: the engine owns the full shape and the panel
   * only reads `min_days`, so an option it does not know about survives a round trip.
   */
  patterns?: Record<string, unknown> & { min_days?: number };
}

export interface PresenceDevice { device: string; name: string | null }

export type DeviceKind = "phone" | "watch" | "tag" | "laptop" | "other";
export const DEVICE_KINDS: readonly DeviceKind[] = ["phone", "watch", "tag", "laptop", "other"];

/** The companion-app sensors a device's carried estimate reads, by role; null = discover. */
export interface PresenceSignals { activity: string | null; steps: string | null; battery_state: string | null }
export type SignalRole = keyof PresenceSignals;
export const SIGNAL_ROLES: readonly SignalRole[] = ["activity", "steps", "battery_state"];

/** One of a person's devices: a Bermuda tracker, and the companion app of the same phone if any. */
export interface PresenceDeviceConfig {
  tracker: string;
  name: string | null;
  kind: DeviceKind;
  companion: string | null;
  signals: PresenceSignals;
}

/** One person: a display name (null = after the first device), an optional person.* seed, devices. */
export interface PresencePerson { name: string | null; person: string | null; devices: PresenceDeviceConfig[] }

export interface CarriedWeights { charging: number; moving: number; still_room_empty: number; jitter: number }
/** The "is this device on its person" model's knobs; see the README's Rooms & presence. */
export interface CarriedSettings { prior: number; flip: number; recent: number; nearby: number; weights: CarriedWeights }

/** The top-level `presence` block, with every field the backend fills in filled in. */
export interface PresenceSettings {
  enabled: boolean;
  /** The older one-tracker-per-person list; the backend folds it into `people` on load. */
  devices: PresenceDevice[];
  people: PresencePerson[];
  carried: CarriedSettings;
  envelope: string | null;
  threshold: number;
  stay: number;
  escape: number;
  scale: number;
  floor: number;
  stuck_after: number;
  /** The room-activity evidence: the likelihood of a room whose level is 0.0. */
  activity: { floor: number };
  scanner_areas: Record<string, string>;
}

export interface Config {
  version: 1;
  defaults: Defaults;
  envelopes: EnvelopePreset[];
  groups: Group[];
  /** Optional: a config written before this feature shipped has none. Read via `presenceSettings`. */
  presence?: PresenceSettings;
}

export interface ValidationError { path: string; message: string }

export interface GroupLive {
  value: number; real_value: number; raw_value: number; active: boolean; gated: boolean; active_voices: number;
  last_activity: number | null; cooldown_at: number | null; contributors: Record<string, number>;
  name: string; parent_id: string | null; precision: number; max_value: number; mix: Mix; next_wake: number | null;
  /** Light entities the group owns right now; 0 means it cannot be simulated. */
  lights: number;
  /** Whether the group is muted out of its parent's mix. Runtime state, not config. */
  muted: boolean;
}
export interface VoiceLive {
  label: string; entity: string | null; phase: "idle" | "attack" | "decay" | "sustain" | "release";
  value: number; gain: number; gate: boolean; phase_started: number | null; phase_ends: number | null;
}
export interface LiveState { now: number; groups: Record<string, GroupLive>; voices: Record<string, VoiceLive[]> }

/** `[p25, p50, p75]` for one 15-minute slot. */
export type Band = [number, number, number];
/** Anything keyed by day type ("weekday", "weekend", a calendar id, …). */
export type ByDayType<T> = Record<string, T>;

export interface ProfileLight {
  p_on: ByDayType<number[]>;
  on_starts: ByDayType<number[]>;
  off_starts: ByDayType<number[]>;
  brightness: number | null;
}
export interface ProfileGroup {
  ready: boolean;
  days: number;
  expected: ByDayType<Band[]>;
  lights: Record<string, ProfileLight>;
}
export interface ProfileDoc {
  version: 1;
  producer: { name: string; version: string };
  generated_at: number;
  training_window: [number, number];
  day_types: string[];
  slot_minutes: number;
  groups: Record<string, ProfileGroup>;
}
/** `activity_levels/profile/get`. `trained` is false for the empty setup-time document. */
export interface ProfileState { profile: ProfileDoc; ready: Record<string, boolean>; trained: boolean }

export interface Forecast {
  t0: number; step: number; p25: number[]; p50: number[]; p75: number[];
  /** Present only when the requested horizon was cut back to the server cap. */
  truncated?: true;
}
export type DayTypeSpan = [number, number, string];
export type LightSpan = [number, number];
/** `[on, off, entity]`; a null end is a light the plan never turns back off. */
export type PlanSpan = [number, number | null, string];
/** `activity_levels/timeseries`. */
export interface TimeseriesResponse {
  series: Record<string, [number, number][]>;
  forecast: Forecast | null;
  day_types: DayTypeSpan[];
  lights: Record<string, LightSpan[]>;
  plan: PlanSpan[];
}

export interface SimulationLogEntry {
  t: number; group_id: string; entity_id: string; on: boolean; brightness: number | null;
}
/** `activity_levels/simulation/log`; `blocked` names the first failing precondition. */
export interface SimulationLog {
  entries: SimulationLogEntry[];
  active: Record<string, boolean>;
  blocked: Record<string, string | null>;
}

/** `activity_levels/topology`. `edges` is `[from, to, one_way]`. */
export interface TopologyPayload { nodes: string[]; edges: [string, string, boolean][]; exits: string[] }

/** One tracked device's room estimate, as `presence/state` reports it. */
export interface PresenceOutputs {
  t: number;
  room: string;
  confidence: number;
  moving: boolean;
  candidates: Record<string, number>;
  path: string[];
}

/** One of a person's devices as `presence/state` reports it: where the object is, and whether it is on them. */
export interface PresenceDeviceRow {
  name: string;
  kind: DeviceKind;
  tracker: string;
  companion: string | null;
  room: string | null;
  confidence: number | null;
  carried: number | null;
  signals: PresenceSignals;
  found: Record<string, boolean>;
}

/** One person's estimate: the room outputs plus everything about their devices. */
export interface PersonOutputs extends PresenceOutputs {
  carried: Record<string, number>;
  device_rooms: Record<string, string>;
  person: string | null;
  devices: Record<string, PresenceDeviceRow>;
}

/** One Bermuda scanner, as discovered from the device and entity registries. */
export interface ScannerRow {
  key: string;
  device_id: string;
  name: string;
  area_id: string | null;
  group_id: string | null;
}

/** `activity_levels/presence/state`. */
export interface PresenceState {
  /** Whether the Bermuda integration is loaded. The setup card asks before offering to turn presence on. */
  bermuda: boolean;
  enabled: boolean;
  people: Record<string, PersonOutputs>;
  /** The people's room outputs under the name this carried before people had devices. */
  devices: Record<string, PresenceOutputs>;
  occupants: Record<string, string[]>;
  scanners: ScannerRow[];
  unmapped: string[];
  disabled: string[];
}

export interface HaDuration { days?: number; hours: number; minutes: number; seconds: number; milliseconds?: number }

export interface HassEntity { entity_id: string; state: string; attributes: Record<string, unknown>; last_changed: string }
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  areas: Record<string, { area_id: string; name: string }>;
  /** Optional: an older frontend has no floor registry, and a home need not use one. */
  floors?: Record<string, { floor_id: string; name: string }>;
  entities: Record<string, { entity_id: string; name?: string; area_id?: string | null }>;
  user?: { is_admin: boolean; name: string };
  language: string;
  localize: (key: string, ...args: unknown[]) => string;
  /** Optional: an older frontend has no state formatter, so callers fall back to `localize`. */
  formatEntityState?: (stateObj: HassEntity) => string;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void>;
}

export type Path = (string | number)[];
