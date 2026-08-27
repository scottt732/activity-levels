import { describe, expect, it, vi } from "vitest";
import { callService, getConfig, getProfile, getSimulationLog, getTimeseries, rebuildProfile, resetGroup, saveConfig, setLevel, setMuted, validateConfig } from "../src/api";
import type { Config, HomeAssistant, ProfileState, SimulationLog, TimeseriesResponse } from "../src/types";

const config: Config = {
  version: 1,
  defaults: {
    envelope: "default",
    max_value: 5,
    precision: 1,
    unavailable: "hold",
    retrigger: "only_in_release",
    debounce: 0,
    safety_refresh: 60,
    min_wake_interval: 1,
  },
  envelopes: [],
  groups: [],
};

/** A Home Assistant whose websocket answers with, or rejects with, whatever is given. */
const hassWith = (callWS: (msg: { type: string }) => Promise<unknown>): HomeAssistant =>
  ({ callWS }) as unknown as HomeAssistant;

describe("api", () => {
  it("unwraps the config out of the config/get result", async () => {
    const hass = hassWith(vi.fn(async () => ({ config })));
    await expect(getConfig(hass)).resolves.toBe(config);
  });

  it("fills in an empty error list when validate reports none", async () => {
    const hass = hassWith(vi.fn(async () => ({ ok: true })));
    await expect(validateConfig(hass, config)).resolves.toEqual({ ok: true, errors: [] });
  });

  it("turns a rejected save into an unpathed error instead of throwing", async () => {
    // Home Assistant rejects a websocket command with `{ code, message }`, and the save
    // button has nowhere to put a thrown error - it needs the same shape validate returns.
    const hass = hassWith(
      vi.fn(() => Promise.reject({ code: "invalid_config", message: "duplicate group id: house" })),
    );
    await expect(saveConfig(hass, config)).resolves.toEqual({
      ok: false,
      errors: [{ path: "", message: "duplicate group id: house" }],
    });
  });
});

describe("getTimeseries", () => {
  it("sends the query alongside the message type and returns the response as-is", async () => {
    const response: TimeseriesResponse = { series: {}, forecast: null, day_types: [], lights: {}, plan: [] };
    const callWS = vi.fn(async () => response);
    const hass = hassWith(callWS);
    const query = { group_id: "house", start: 0, end: 100, resolution: "5m" as const };
    await expect(getTimeseries(hass, query)).resolves.toBe(response);
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/timeseries", ...query });
  });
});

describe("getProfile", () => {
  it("requests the profile state", async () => {
    const profile: ProfileState = { profile: {} as never, ready: {}, trained: false };
    const callWS = vi.fn(async () => profile);
    const hass = hassWith(callWS);
    await expect(getProfile(hass)).resolves.toBe(profile);
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/profile/get" });
  });
});

describe("rebuildProfile", () => {
  it("defaults force to false", async () => {
    const callWS = vi.fn(async () => ({ rebuilt: true }));
    const hass = hassWith(callWS);
    await expect(rebuildProfile(hass)).resolves.toEqual({ rebuilt: true });
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/profile/rebuild", force: false });
  });
  it("passes force through when given", async () => {
    const callWS = vi.fn(async () => ({ rebuilt: true }));
    const hass = hassWith(callWS);
    await rebuildProfile(hass, true);
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/profile/rebuild", force: true });
  });
});

describe("getSimulationLog", () => {
  it("defaults limit to 50 and omits group_id when not given", async () => {
    const log: SimulationLog = { entries: [], active: {}, blocked: {} };
    const callWS = vi.fn(async () => log);
    const hass = hassWith(callWS);
    await expect(getSimulationLog(hass)).resolves.toBe(log);
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/simulation/log", limit: 50 });
  });
  it("passes group_id and limit through when given", async () => {
    const callWS = vi.fn(async () => ({ entries: [], active: {}, blocked: {} }));
    const hass = hassWith(callWS);
    await getSimulationLog(hass, "house", 10);
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/simulation/log", group_id: "house", limit: 10 });
  });
});

describe("callService", () => {
  it("delegates straight to hass.callService", async () => {
    const svc = vi.fn(async () => undefined);
    const hass = { callService: svc } as unknown as HomeAssistant;
    await callService(hass, "light", "turn_on", { entity_id: "light.x" });
    expect(svc).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.x" });
  });
});

describe("runtime commands", () => {
  it("asks for a level and answers with the one actually reached", async () => {
    // In a `max` group a target below a louder channel cannot be reached, so the engine's
    // answer is the level it settled at, not the one that was asked for.
    const callWS = vi.fn(async () => ({ value: 3.2 }));
    const hass = hassWith(callWS);
    await expect(setLevel(hass, "house", 1)).resolves.toBe(3.2);
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/level/set", group_id: "house", value: 1 });
  });

  it("mutes and unmutes, answering with the state that stuck", async () => {
    const callWS = vi.fn(async () => ({ muted: true }));
    const hass = hassWith(callWS);
    await expect(setMuted(hass, "house", true)).resolves.toBe(true);
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/mute", group_id: "house", muted: true });
  });

  it("resets a group", async () => {
    const callWS = vi.fn(async () => ({}));
    const hass = hassWith(callWS);
    await expect(resetGroup(hass, "house")).resolves.toBeUndefined();
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/reset", group_id: "house" });
  });
});
