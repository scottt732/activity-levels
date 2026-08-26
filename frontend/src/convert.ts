import { durationToSeconds, formatDuration, secondsToDuration } from "./duration";
import type { HaDuration } from "./types";

/** How an override value is edited, and therefore how it crosses the `ha-selector` boundary. */
export type OverrideKind = "duration" | "number" | "boolean" | "select";

/** A stored (config-shaped) override value. */
export type OverrideValue = number | boolean | string | null;

/** `"on, playing"` -> `["on", "playing"]`; blanks are dropped rather than silently defaulted. */
export const parseToList = (text: string): string[] =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

export const formatToList = (to: readonly string[] | null | undefined): string => (to ?? []).join(", ");

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
    case "number": {
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
    default:
      return String(value);
  }
}
