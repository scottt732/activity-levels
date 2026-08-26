import { describe, expect, it, vi } from "vitest";
import { getConfig, saveConfig, validateConfig } from "../src/api";
import type { Config, HomeAssistant } from "../src/types";

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
