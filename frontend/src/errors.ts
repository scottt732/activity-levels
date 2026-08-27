import type { Path, ValidationError } from "./types";

export const pathKey = (p: Path): string => p.join("/");

export function fieldErrors(errors: ValidationError[], prefix: Path): Record<string, string> {
  const pre = pathKey(prefix);
  const out: Record<string, string> = {};
  for (const e of errors) {
    if (!e.path.startsWith(pre + "/")) continue;
    const rest = e.path.slice(pre.length + 1);
    if (!rest.includes("/")) out[rest] = e.message;
  }
  return out;
}

export function subtreeErrorCount(errors: ValidationError[], prefix: Path): number {
  const pre = pathKey(prefix);
  return errors.filter((e) => e.path === pre || e.path.startsWith(pre + "/")).length;
}

/**
 * The first error under `prefix/field/<index>`, for a field whose errors are indexed.
 * `fieldErrors` only keeps leaf paths, so `groups/0/adjacent/1` would otherwise land
 * nowhere - and an unknown room has to be shown against the picker that chose it.
 */
export function listFieldError(errors: ValidationError[], prefix: Path, field: string): string | undefined {
  const pre = `${pathKey(prefix)}/${field}/`;
  return errors.find((e) => e.path.startsWith(pre))?.message;
}
