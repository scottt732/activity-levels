import type { HaDuration } from "./types";

export function secondsToDuration(total: number): HaDuration {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total - hours * 3600) / 60);
  const seconds = Math.round((total - hours * 3600 - minutes * 60) * 1000) / 1000;
  return { hours, minutes, seconds };
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
