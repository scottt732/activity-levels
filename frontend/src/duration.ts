import type { HaDuration } from "./types";

/**
 * Splits seconds for `ha-duration-input`, which wants whole numbers in every field. A
 * fractional value becomes an integer `seconds` plus `milliseconds`; a whole one omits
 * `milliseconds` entirely, so the common case stays a plain h/m/s duration.
 */
export function secondsToDuration(total: number): HaDuration {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total - hours * 3600) / 60);
  const rest = Math.round((total - hours * 3600 - minutes * 60) * 1000) / 1000;
  const seconds = Math.floor(rest);
  const milliseconds = Math.round((rest - seconds) * 1000);
  return milliseconds === 0 ? { hours, minutes, seconds } : { hours, minutes, seconds, milliseconds };
}

export function durationToSeconds(d: HaDuration | null | undefined): number | null {
  if (!d) return null;
  const s = (d.days ?? 0) * 86400 + d.hours * 3600 + d.minutes * 60 + d.seconds + (d.milliseconds ?? 0) / 1000;
  return Math.round(s * 1000) / 1000;
}

export function formatDuration(total: number): string {
  if (total === 0) return "0s";
  const parts: string[] = [];
  let rest = total;
  const units: [string, number][] = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [label, size] of units) {
    const n = Math.floor(rest / size);
    if (n > 0) { parts.push(`${n}${label}`); rest -= n * size; }
  }
  rest = Math.round(rest * 1000) / 1000;
  if (rest > 0) parts.push(`${rest}s`);
  return parts.join(" ");
}
