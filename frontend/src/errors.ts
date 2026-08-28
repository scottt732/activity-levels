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
