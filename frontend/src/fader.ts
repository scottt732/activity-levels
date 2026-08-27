import { formatLevel } from "./model";

/**
 * What a fader needs to know about the quantity it is holding. `al-fader` draws and
 * announces itself entirely through one of these, so a gain fader (log, unity mid-throw)
 * and a level fader (linear, 0…the group's ceiling) are the same component.
 */
export interface FaderScale {
  min: number;
  max: number;
  /** Value -> position in [0, 1], measured from the bottom of the track. */
  toPosition(value: number): number;
  fromPosition(pos: number): number;
  /** A value this scale can hold: inside the range, at the resolution it works in. */
  clamp(value: number): number;
  /** One arrow-key or wheel notch; `fine` is the smaller step (e.g. Shift held). */
  step(value: number, dir: 1 | -1, fine?: boolean): number;
  /** One Page-key jump. */
  page(value: number, dir: 1 | -1): number;
  format(value: number): string;
  /** What a double-click snaps to, or `null` when the scale has no home to go to. */
  reset: number | null;
}

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

/** The gain fader, as a scale: the log throw above, with unity as its double-click home. */
export const gainScale: FaderScale = {
  min: FADER_MIN,
  max: FADER_MAX,
  toPosition,
  fromPosition,
  clamp: clampGain,
  step: (value, dir, fine = false) => stepValue(value, dir, fine),
  page: (value, dir) => clampGain(dir === 1 ? value * 2 : value / 2),
  format: formatGain,
  reset: 1,
};

/** `toFixed` throws outside 0…100 digits, so a precision from anywhere is squared up first. */
const digits = (precision: number): number => Math.min(6, Math.max(0, Math.trunc(precision)));

/**
 * A group's level: linear from 0 to its ceiling, quantised to the precision the engine
 * rounds that group to - dragging past what the group can express is not a finer setting,
 * it is a number nothing will ever read back.
 *
 * A ceiling of zero (or worse) would make every position the same value, so it reads as 1:
 * a fader with a usable throw beats one that cannot move.
 */
export function levelScale(max: number, precision: number): FaderScale {
  const ceiling = max > 0 ? max : 1;
  const dp = digits(precision);
  const quantum = 10 ** -dp;
  const quantize = (value: number): number =>
    Number(Math.min(ceiling, Math.max(0, value)).toFixed(dp));
  // A tenth of the throw per notch, rounded to something the group can actually hold,
  // and never less than one quantum - the finest step is the quantum itself.
  const notch = Math.max(quantum, Number((ceiling / 10).toFixed(dp)));
  return {
    min: 0,
    max: ceiling,
    toPosition: (value) => Math.min(1, Math.max(0, value / ceiling)),
    fromPosition: (pos) => quantize(Math.min(1, Math.max(0, pos)) * ceiling),
    clamp: quantize,
    step: (value, dir, fine = false) => quantize(value + dir * (fine ? quantum : notch)),
    page: (value, dir) => quantize(value + (dir * ceiling) / 4),
    format: (value) => formatLevel(quantize(value), dp),
    reset: null,
  };
}
