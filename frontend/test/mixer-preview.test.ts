import { describe, expect, it, vi } from "vitest";
import { PreviewData, previewValue } from "../src/mixer-preview";
import type { HomeAssistant, TimeseriesResponse } from "../src/types";
const data = (): TimeseriesResponse => ({ series: { room: [[1000, 2], [1300, 4]] }, forecast: null, day_types: [], lights: {}, plan: [] });
describe("mixer preview", () => {
  it("uses hourly samples and exposes cached values without another request", async () => {
    const loader = new PreviewData();
    const callWS = vi.fn().mockResolvedValue({...data(), series: {room: [[0, 2], [3600, 4]]}});
    await loader.load({callWS} as unknown as HomeAssistant, ["room"], 1800, 7200, "1h");
    expect(callWS.mock.calls[0]![0].resolution).toBe("1h");
    expect(loader.peek(["room"], 1800, 7200, "1h")).toEqual({values: {room: 3}, complete: true});
    expect(loader.peek(["room"], 1800, 7200, "5m").complete).toBe(false);
  });
  it("limits requests and stops queued work when a preview is cancelled", async () => {
    const loader = new PreviewData();
    const pending: (() => void)[] = [];
    const callWS = vi.fn(() => new Promise<TimeseriesResponse>((resolve) => pending.push(() => resolve(data()))));
    const result = loader.load({callWS} as unknown as HomeAssistant, ["a", "b", "c", "d", "e", "f"], 1000, 2000);
    await Promise.resolve();
    expect(callWS).toHaveBeenCalledTimes(4);
    loader.cancel();
    pending.forEach((resolve) => resolve());
    await result;
    expect(callWS).toHaveBeenCalledTimes(4);
  });
  it("does not replace missing or out-of-range history with zero or an endpoint", () => {
    expect(previewValue(data(), "room", 1150, 2000)).toBe(3);
    expect(previewValue(data(), "room", 100, 2000)).toBeNull();
    expect(previewValue(data(), "missing", 1000, 2000)).toBeNull();
  });
  it("reads future values only from the forecast", () => {
    const d = data(); d.forecast = { t0: 2000, step: 900, p50: [2, 5], p25: [], p75: [] };
    expect(previewValue(d, "room", 2450, 2000)).toBe(3.5);
    expect(previewValue(d, "room", 4000, 2000)).toBeNull();
  });
  it("reuses a time bucket while scrubbing and reports failed data as missing", async () => {
    const loader = new PreviewData();
    const callWS = vi.fn().mockResolvedValue(data());
    const hass = { callWS } as unknown as HomeAssistant;
    await loader.load(hass, ["room"], 1000, 2000);
    await loader.load(hass, ["room"], 1100, 2000);
    expect(callWS).toHaveBeenCalledTimes(1);
    callWS.mockRejectedValue(new Error("offline"));
    const result = await loader.load(hass, ["other"], 1100, 2000);
    expect(result.values.other).toBeNull();
    expect(result.failed).toBe(true);
  });
});
