export type Mix = "sum" | "max" | "mean";
export type NullHandling = "zero" | "ignore";
export type Retrigger = "only_in_release" | "always";
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

export interface Group {
  id: string;
  name: string | null;
  area: string | null;
  mix: Mix;
  null_handling: NullHandling;
  max_value: number | null;
  precision: number | null;
  gain: number;
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
}

export interface Config {
  version: 1;
  defaults: Defaults;
  envelopes: EnvelopePreset[];
  groups: Group[];
}

export interface ValidationError { path: string; message: string }

export interface GroupLive {
  value: number; real_value: number; raw_value: number; active: boolean; gated: boolean; active_voices: number;
  last_activity: number | null; cooldown_at: number | null; contributors: Record<string, number>;
  name: string; parent_id: string | null; precision: number; max_value: number; mix: Mix; next_wake: number | null;
}
export interface VoiceLive {
  label: string; entity: string | null; phase: "idle" | "attack" | "decay" | "sustain" | "release";
  value: number; gain: number; gate: boolean; phase_started: number | null; phase_ends: number | null;
}
export interface LiveState { now: number; groups: Record<string, GroupLive>; voices: Record<string, VoiceLive[]> }

export interface HaDuration { days?: number; hours: number; minutes: number; seconds: number; milliseconds?: number }

export interface HassEntity { entity_id: string; state: string; attributes: Record<string, unknown>; last_changed: string }
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  areas: Record<string, { area_id: string; name: string }>;
  entities: Record<string, { entity_id: string; name?: string; area_id?: string | null }>;
  user?: { is_admin: boolean; name: string };
  language: string;
  localize: (key: string, ...args: unknown[]) => string;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
}

export type Path = (string | number)[];
