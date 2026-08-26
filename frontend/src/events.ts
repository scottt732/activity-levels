import type { Config, Path } from "./types";

/** `al-change` also carries an optional key that merges rapid edits of one field into a single undo step. */
export interface AlChangeEvent extends CustomEvent<Config> {
  coalesceKey?: string;
  /**
   * Set when the edit added, removed or reordered a node. Validation errors are keyed by
   * path, so after one of those every path below the change may name a different node and
   * the shell drops the errors rather than pinning them to the wrong rows.
   */
  structural?: true;
}

/** Builds the `al-change` event an editor dispatches when it produces a new config. */
export function alChange(config: Config, coalesceKey?: string, structural?: true): AlChangeEvent {
  const ev = new CustomEvent<Config>("al-change", {
    detail: config,
    bubbles: true,
    composed: true,
  }) as AlChangeEvent;
  if (coalesceKey !== undefined) ev.coalesceKey = coalesceKey;
  if (structural) ev.structural = true;
  return ev;
}

/** Builds the `al-select` event: the path the editor pane should show, or `null` for nothing. */
export const alSelect = (path: Path | null): CustomEvent<Path | null> =>
  new CustomEvent<Path | null>("al-select", { detail: path, bubbles: true, composed: true });
