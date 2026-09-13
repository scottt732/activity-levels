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

/** Unsuffixed numbers use the selected unit. Explicit marks are imperial lengths. */
export function parseLength(text: string, unit: LengthUnit): number | null {
  const value = text.trim().toLowerCase().replace(/[′’]/g, "'").replace(/[″“”]/g, '"');
  if (!value) return null;
  const decimal = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
    const result = toMeters(Number(value), unit);
    return Number.isFinite(result) ? result : null;
  }
  const match = /^([+-]?)\s*(?:(\d+(?:\.\d*)?|\.\d+)\s*(?:'|feet|foot|ft)\s*)?(?:(\d+(?:\.\d*)?|\.\d+|\d+\s+\d+\/\d+|\d+\/\d+)\s*(?:"|inches|inch|in))?$/.exec(value);
  if (!match || (!match[2] && !match[3])) return null;
  const inchText = match[3] ?? "0";
  let inches: number;
  if (decimal.test(inchText)) inches = Number(inchText);
  else {
    const fraction = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(inchText)!;
    if (Number(fraction[3]) === 0) return null;
    inches = Number(fraction[1] ?? 0) + Number(fraction[2]) / Number(fraction[3]);
  }
  const meters = (Number(match[2] ?? 0) * 12 + inches) * .0254 * (match[1] === "-" ? -1 : 1);
  return Number.isFinite(meters) ? meters : null;
}

export function formatLengthInput(meters: number, unit: LengthUnit): string {
  if (unit === "m") return String(Number(meters.toFixed(4)));
  const totalInches = Number((Math.abs(meters) / .0254).toFixed(4));
  const feet = Math.floor(totalInches / 12);
  const inches = Number((totalInches - feet * 12).toFixed(4));
  return `${meters < 0 ? "-" : ""}${feet}'${inches}"`;
}
