import type { Config, Path } from "./types";

/** `al-change` also carries an optional key that merges rapid edits of one field into a single undo step. */
export interface AlChangeEvent extends CustomEvent<Config> {
  coalesceKey?: string;
}

/** Builds the `al-change` event an editor dispatches when it produces a new config. */
export function alChange(config: Config, coalesceKey?: string): AlChangeEvent {
  const ev = new CustomEvent<Config>("al-change", {
    detail: config,
    bubbles: true,
    composed: true,
  }) as AlChangeEvent;
  if (coalesceKey !== undefined) ev.coalesceKey = coalesceKey;
  return ev;
}

/** Builds the `al-select` event: the path the editor pane should show, or `null` for nothing. */
export const alSelect = (path: Path | null): CustomEvent<Path | null> =>
  new CustomEvent<Path | null>("al-select", { detail: path, bubbles: true, composed: true });
