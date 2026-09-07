import { getTimeseries } from "./api";
import { forecastLine } from "./timeseries";
import { sampleAt } from "./transport";
import type { HomeAssistant, TimeseriesResponse } from "./types";

/** Values outside known samples stay unknown; a preview must never borrow live state. */
export function previewValue(data: TimeseriesResponse, id: string, t: number, now: number, maxGap = 450): number | null {
  if (t > now) {
    const f = data.forecast;
    if (!f || f.step <= 0) return null;
    const value = sampleAt(forecastLine(f, "p50"), t);
    return value !== null && Number.isFinite(value) ? value : null;
  }
  const points = data.series[id] ?? [];
  let low = 0, high = points.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (points[middle]![0] < t) low = middle + 1; else high = middle;
  }
  const after = points[low], before = points[low - 1];
  if (after?.[0] === t) return Number.isFinite(after[1]) ? after[1] : null;
  if (!before || !after || after[0] - before[0] > maxGap) return null;
  const value = before[1] + (after[1] - before[1]) * (t - before[0]) / (after[0] - before[0]);
  return Number.isFinite(value) ? value : null;
}

/** Small per-panel cache and four request workers. Superseded queues stop before I/O. */
export class PreviewData {
  private cache = new Map<string, { at: number; data: TimeseriesResponse }>();
  private generation = 0;
  private active = 0;
  private waiting: (() => void)[] = [];
  cancel(): void { this.generation++; }
  private async slot(): Promise<void> {
    if (this.active >= 4) await new Promise<void>((resolve) => this.waiting.push(resolve));
    else this.active++;
  }
  private release(): void {
    const next = this.waiting.shift();
    if (next) next(); else this.active--;
  }
  peek(ids: string[], t: number, now: number, resolution: "5m" | "1h" = "5m"): {values: Record<string, number|null>; complete: boolean} {
    const {start, end, until} = previewQuery(t, now, resolution);
    const values: Record<string, number|null> = {};
    let complete = true;
    for (const id of ids) {
      const cached = this.cache.get(JSON.stringify([id, start, end, until, resolution]));
      if (!cached || Date.now() - cached.at > 60000) { complete = false; values[id] = null; }
      else values[id] = previewValue(cached.data, id, t, now, resolution === "5m" ? 450 : 5400);
    }
    return {values, complete};
  }
  async load(hass: HomeAssistant, ids: string[], t: number, now: number, resolution: "5m" | "1h" = "5m"): Promise<{values: Record<string, number | null>; failed: boolean}> {
    const generation = ++this.generation;
    const values: Record<string, number | null> = {};
    let failed = false;
    const {start, end, until} = previewQuery(t, now, resolution);
    let index = 0;
    await Promise.all(Array.from({length: Math.min(4, ids.length)}, async () => {
      while (index < ids.length && generation === this.generation) {
        const id = ids[index++]!;
        const key = JSON.stringify([id, start, end, until, resolution]);
        let data = this.cache.get(key);
        if (!data || Date.now() - data.at > 60000) {
          await this.slot();
          try {
            if (generation !== this.generation) return;
            data = { at: Date.now(), data: await getTimeseries(hass, {group_id: id, start, end,
              resolution, include_children: false, ...(until === undefined ? {} : {forecast_until: until})}) };
            this.cache.set(key, data);
            while (this.cache.size > 128) this.cache.delete(this.cache.keys().next().value!);
          } catch {
            failed = true;
            values[id] = null;
            continue;
          } finally { this.release(); }
        }
        values[id] = previewValue(data.data, id, t, now, resolution === "5m" ? 450 : 5400);
      }
    }));
    return {values, failed};
  }
}

function previewQuery(t: number, now: number, resolution: "5m" | "1h"): {start:number;end:number;until?:number} {
  const future = t > now;
  const bucket = Math.floor(t / 3600) * 3600;
  const minute = Math.floor(now / 60) * 60;
  const step = resolution === "5m" ? 300 : 3600;
  const end = future ? minute : Math.min(bucket + 3600 + step, minute);
  const start = future ? end - step : bucket - step;
  return {start, end, ...(future ? {until: Math.min(bucket + 3900, end + 7 * 86400)} : {})};
}
