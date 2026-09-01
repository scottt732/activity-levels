import { durationToSeconds, formatDuration, secondsToDuration } from "./duration";
import type { HaDuration } from "./types";

/** How an override value is edited, and therefore how it crosses the `ha-selector` boundary.
 * `multiplier` is a number that reads as one — sustain, which is a factor on the peak. */
export type OverrideKind = "duration" | "number" | "boolean" | "select" | "multiplier";

/** A stored (config-shaped) override value. */
export type OverrideValue = number | boolean | string | null;

export const emptyToNull = (value: string | null | undefined): string | null =>
  value === undefined || value === null || value === "" ? null : value;

/** Stored value -> the value an `ha-selector` of this kind expects (`undefined` when unset). */
export function toSelectorValue(kind: OverrideKind, value: OverrideValue): unknown {
  if (value === null || value === undefined) return undefined;
  switch (kind) {
    case "duration":
      return secondsToDuration(value as number);
    case "boolean":
      return value ? "true" : "false";
    default:
      return value;
  }
}

/** `value-changed` payload -> the stored value (`null` means "inherit"). */
export function fromSelectorValue(kind: OverrideKind, raw: unknown): OverrideValue {
  if (raw === null || raw === undefined || raw === "") return null;
  switch (kind) {
    case "duration":
      return durationToSeconds(raw as HaDuration);
    case "boolean":
      return raw === true || raw === "true";
    case "number":
    case "multiplier": {
      const n = typeof raw === "number" ? raw : Number(raw);
      return Number.isNaN(n) ? null : n;
    }
    default:
      return String(raw);
  }
}

/** Human-readable rendering of an inherited value, for the "Inherited from …" helper. */
export function formatInherited(kind: OverrideKind, value: OverrideValue): string {
  if (value === null || value === undefined) return "unset";
  switch (kind) {
    case "duration":
      return formatDuration(value as number);
    case "boolean":
      return value ? "Yes" : "No";
    case "multiplier":
      return formatMultiplier(value as number);
    default:
      return String(value);
  }
}

/**
 * A factor on the peak, as the panel spells one: exactly one decimal and a trailing sign,
 * so `1`, `1.0` and `1.04` all read as `1.0×` and a column of them lines up.
 */
export const formatMultiplier = (value: number): string => `${value.toFixed(1)}×`;
