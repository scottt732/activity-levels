import type { Config, HomeAssistant, LiveState, ValidationError } from "./types";

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
