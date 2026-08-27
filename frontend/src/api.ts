import type { Config, HomeAssistant, LiveState, ProfileState, SimulationLog, TimeseriesResponse, ValidationError } from "./types";

export interface ValidateResult {
  ok: boolean;
  errors: ValidationError[];
}

interface RawValidateResult {
  ok: boolean;
  errors?: ValidationError[];
}

const normalize = (r: RawValidateResult): ValidateResult => ({ ok: r.ok, errors: r.errors ?? [] });

export const getConfig = (hass: HomeAssistant): Promise<Config> =>
  hass.callWS<{ config: Config }>({ type: "activity_levels/config/get" }).then((r) => r.config);

export const validateConfig = (hass: HomeAssistant, config: Config): Promise<ValidateResult> =>
  hass.callWS<RawValidateResult>({ type: "activity_levels/config/validate", config }).then(normalize);

export async function saveConfig(hass: HomeAssistant, config: Config): Promise<ValidateResult> {
  try {
    return normalize(await hass.callWS<RawValidateResult>({ type: "activity_levels/config/save", config }));
  } catch (err) {
    const e = err as { code?: string; message?: string };
    return { ok: false, errors: [{ path: "", message: e.message ?? String(err) }] };
  }
}

export const getState = (hass: HomeAssistant): Promise<LiveState> =>
  hass.callWS<LiveState>({ type: "activity_levels/state" });

export interface TimeseriesQuery {
  group_id: string;
  start: number;
  end: number;
  resolution: "5m" | "1h";
  include_children?: boolean;
  forecast_until?: number;
}

export const getTimeseries = (hass: HomeAssistant, q: TimeseriesQuery): Promise<TimeseriesResponse> =>
  hass.callWS<TimeseriesResponse>({ type: "activity_levels/timeseries", ...q });

export const getProfile = (hass: HomeAssistant): Promise<ProfileState> =>
  hass.callWS<ProfileState>({ type: "activity_levels/profile/get" });

export const rebuildProfile = (hass: HomeAssistant, force = false): Promise<{ rebuilt: boolean }> =>
  hass.callWS<{ rebuilt: boolean }>({ type: "activity_levels/profile/rebuild", force });

export const getSimulationLog = (hass: HomeAssistant, group_id?: string, limit = 50): Promise<SimulationLog> =>
  hass.callWS<SimulationLog>({
    type: "activity_levels/simulation/log",
    ...(group_id !== undefined ? { group_id } : {}),
    limit,
  });

/**
 * Runtime commands. None of these touch the config: they move the engine now, and the
 * next live frame is what says where it ended up.
 */

/**
 * Sizes the group's built-in trigger voice so its level reads `value`. The answer is the
 * level actually reached, which the limiter - or a louder channel of a `max` group - can
 * put somewhere other than where the fader was dragged.
 */
export const setLevel = (hass: HomeAssistant, group_id: string, value: number): Promise<number> =>
  hass.callWS<{ value: number }>({ type: "activity_levels/level/set", group_id, value }).then((r) => r.value);

/** Mutes a group out of its parent's mix; its own value keeps being published either way. */
export const setMuted = (hass: HomeAssistant, group_id: string, muted: boolean): Promise<boolean> =>
  hass.callWS<{ muted: boolean }>({ type: "activity_levels/mute", group_id, muted }).then((r) => r.muted);

/** Drops every voice the group is holding, back to zero. */
export const resetGroup = (hass: HomeAssistant, group_id: string): Promise<void> =>
  hass.callWS<Record<string, never>>({ type: "activity_levels/reset", group_id }).then(() => undefined);

export const callService = (
  hass: HomeAssistant,
  domain: string,
  service: string,
  data?: Record<string, unknown>,
): Promise<void> => hass.callService(domain, service, data);
