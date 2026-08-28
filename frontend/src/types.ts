export type { Connection, Kind } from "./kinds";
import type { Connection, Kind } from "./kinds";

export type Mix = "sum" | "max" | "mean";
export type NullHandling = "zero" | "ignore";
export type Retrigger = "stack" | "only_in_release" | "always";
export type Unavailable = "hold" | "note_off";

export interface EnvelopeOverrides {
  attack: number | null;
  decay: number | null;
  sustain: number | null;
  release: number | null;
  impulse: boolean | null;
  retrigger: Retrigger | null;
  unavailable: Unavailable | null;
  debounce: number | null;
}

export interface EnvelopePreset {
  id: string;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  impulse: boolean;
  retrigger: Retrigger | null;
  unavailable: Unavailable | null;
  debounce: number | null;
}

export interface Stimulus extends EnvelopeOverrides {
  entity: string;
  to: string[];
  gain: number;
  key: string | null;
  envelope: string | null;
}

/** One edge out of a group. A plain id in the document means `{ connection: "door", one_way: false }`. */
export interface Adjacency { id: string; connection: Connection; one_way: boolean }

/** A group's own presence-channel tuning: the same overridable shape as a stimulus's envelope. */
export interface PresenceOverrides extends EnvelopeOverrides { gain: number; envelope: string | null }

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
  retrigger: Retrigger;
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

/** The top-level `presence` block, with every field the backend fills in filled in. */
export interface PresenceSettings {
  enabled: boolean;
  devices: PresenceDevice[];
  envelope: string | null;
  threshold: number;
  stay: number;
  escape: number;
  scale: number;
  floor: number;
  stuck_after: number;
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
  enabled: boolean;
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
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void>;
}

export type Path = (string | number)[];
