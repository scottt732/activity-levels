/** Gain fader: a log scale over [0.1, 10] so unity gain sits at the middle of the throw. */
export const FADER_MIN = 0.1;
export const FADER_MAX = 10;

const LOG_MIN = Math.log10(FADER_MIN);
const LOG_MAX = Math.log10(FADER_MAX);
const LOG_RANGE = LOG_MAX - LOG_MIN;

const clamp = (v: number): number => Math.min(FADER_MAX, Math.max(FADER_MIN, v));
const round2 = (v: number): number => Math.round(v * 100) / 100;

/** A gain the fader can actually hold: inside [0.1, 10], rounded to 2 decimals. */
export const clampGain = (value: number): number => round2(clamp(value));

/** Value -> position in [0, 1]. `toPosition(1) === 0.5`. */
export function toPosition(value: number): number {
  return (Math.log10(clamp(value)) - LOG_MIN) / LOG_RANGE;
}

/** Position in [0, 1] -> value, rounded to 2 decimals and clamped to the fader range. */
export function fromPosition(pos: number): number {
  const clampedPos = Math.min(1, Math.max(0, pos));
  return round2(clamp(Math.pow(10, LOG_MIN + clampedPos * LOG_RANGE)));
}

/** One keyboard/scroll step: ×1.25 per notch, or ×1.05 with `fine` (e.g. Shift held). */
export function stepValue(value: number, dir: 1 | -1, fine = false): number {
  const factor = fine ? 1.05 : 1.25;
  return round2(clamp(dir === 1 ? value * factor : value / factor));
}

/** 2 decimals, trailing zeros trimmed but at least one decimal kept: "1.0", "2.5", "0.12". */
export function formatGain(value: number): string {
  let s = value.toFixed(2).replace(/0+$/, "");
  if (s.endsWith(".")) s += "0";
  return s;
}
