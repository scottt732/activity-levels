/** Geometry stays in meters; units apply only at the editor boundary. */
export type LengthUnit = "m" | "ft";

export function defaultLengthUnit(hass?: { config?: { unit_system?: { length?: string } } }): LengthUnit {
  const length = hass?.config?.unit_system?.length?.toLowerCase();
  return length === "mi" || length === "ft" || length === "in" ? "ft" : "m";
}

export function fromMeters(value: number, unit: LengthUnit): number {
  return unit === "ft" ? value / 0.3048 : value;
}

export function toMeters(value: number, unit: LengthUnit): number {
  return unit === "ft" ? value * 0.3048 : value;
}

export function formatLength(value: number, unit: LengthUnit): string {
  return `${Number(fromMeters(value, unit).toFixed(2))} ${unit}`;
}
