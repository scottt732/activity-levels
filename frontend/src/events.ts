import type { NavAction } from "./navigation";
import type { Horizon, Range } from "./timeseries";
import type { Config, Mix, Path } from "./types";

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

/**
 * Mixer strip events cross the shadow boundary and bubble, so `al-mixer` can listen once on
 * the strip container instead of wiring a handler per strip. Which strip it was is the
 * event's `target`: a strip does not know its own place in the bus.
 */
const stripEvent = <T>(type: string, detail: T): CustomEvent<T> =>
  new CustomEvent<T>(type, { detail, bubbles: true, composed: true });

/** A fader move: `live` is true while the pointer is still down, false for the value to keep. */
export interface GainChangeDetail {
  value: number;
  live: boolean;
}

export const alSelectStrip = (): CustomEvent<null> => stripEvent<null>("al-select-strip", null);

export const alOpenStrip = (): CustomEvent<null> => stripEvent<null>("al-open-strip", null);

export const alGainChanged = (detail: GainChangeDetail): CustomEvent<GainChangeDetail> =>
  stripEvent("al-gain-changed", detail);

export const alMixChanged = (mix: Mix): CustomEvent<{ mix: Mix }> => stripEvent("al-mix-changed", { mix });

export const alLimiterChanged = (value: number): CustomEvent<{ value: number }> =>
  stripEvent("al-limiter-changed", { value });

export const alSimToggled = (on: boolean): CustomEvent<{ on: boolean }> => stripEvent("al-sim-toggled", { on });

/**
 * The mixer's own events. Navigation is a request, not a move: the shell owns the nav
 * state and reduces the action, so a mixer inside a dialog or a card behaves the same.
 */
export const alNav = (action: NavAction): CustomEvent<NavAction> =>
  new CustomEvent<NavAction>("al-nav", { detail: action, bubbles: true, composed: true });

/** What the timeline's toolbar settled on. The chart applies it itself; the host persists it. */
export interface TimelineRangeDetail {
  range: Range;
  horizon: Horizon;
  showChannels: boolean;
  showLights: boolean;
}

/** Reports a timeline toolbar change. Composed, so a card wrapping the chart still hears it. */
export const alTimelineRange = (detail: TimelineRangeDetail): CustomEvent<TimelineRangeDetail> =>
  new CustomEvent<TimelineRangeDetail>("al-timeline-range", { detail, bubbles: true, composed: true });

/** Asks the shell to flip a group's presence simulation; only it may call the switch. */
export const alSimToggle = (gid: string, on: boolean): CustomEvent<{ gid: string; on: boolean }> =>
  new CustomEvent<{ gid: string; on: boolean }>("al-sim-toggle", { detail: { gid, on }, bubbles: true, composed: true });

/**
 * Asks the shell to retrain the pattern profile. What to rebuild is not the caller's
 * call — the shell rebuilds every group and re-reads `profile/get`. The one thing it
 * does carry is `force`, which retrains even a profile an external producer owns.
 */
export const alRebuild = (force = false): CustomEvent<{ force: boolean }> =>
  new CustomEvent<{ force: boolean }>("al-rebuild", { detail: { force }, bubbles: true, composed: true });
