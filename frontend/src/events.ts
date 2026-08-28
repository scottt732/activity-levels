import type { NavAction } from "./navigation";
import type { Horizon, Range } from "./timeseries";
import type { Config, Path, ValidationError } from "./types";

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

/**
 * What the Code tab last made of the draft. `valid` is whether the text parsed as YAML at
 * all; `errors` is what the backend said about the document it parsed to. They are apart
 * because they disable Save for different reasons and only one of them has anything to
 * list: unparseable text has no paths to attach a problem to.
 */
export interface CodeStatus {
  valid: boolean;
  errors: ValidationError[];
}

/** Reports the Code tab's verdict to the shell, which owns Save and the shared errors. */
export const alCodeStatus = (valid: boolean, errors: ValidationError[]): CustomEvent<CodeStatus> =>
  new CustomEvent<CodeStatus>("al-code-status", { detail: { valid, errors }, bubbles: true, composed: true });

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
export interface FaderChangeDetail {
  value: number;
  live: boolean;
}

export const alSelectStrip = (): CustomEvent<null> => stripEvent<null>("al-select-strip", null);

/**
 * Drag the group's level somewhere: a simulated stimulus, which cools down from there.
 * This is runtime state, not config - it never reaches the draft store.
 */
export const alLevelOverride = (value: number): CustomEvent<{ value: number }> =>
  stripEvent("al-level-override", { value });

/** Mute or unmute a group out of its parent's mix. */
export const alMuteToggle = (muted: boolean): CustomEvent<{ muted: boolean }> =>
  stripEvent("al-mute-toggle", { muted });

/** Drop everything a group is holding: every voice off, back to zero. */
export const alReset = (): CustomEvent<null> => stripEvent<null>("al-reset", null);

/**
 * The mixer's own events. Navigation is a request, not a move: the shell owns the nav
 * state and reduces the action, so a mixer inside a dialog or a card behaves the same.
 */
export const alNav = (action: NavAction): CustomEvent<NavAction> =>
  new CustomEvent<NavAction>("al-nav", { detail: action, bubbles: true, composed: true });

/**
 * Asks the shell for a live frame now rather than at the next tick of its poll. A runtime
 * command (a level override, a mute, a reset) lands in the engine immediately, and waiting
 * up to two seconds to see it would read as the button not having worked.
 */
export const alLiveRefresh = (): CustomEvent<null> =>
  new CustomEvent<null>("al-live-refresh", { detail: null, bubbles: true, composed: true });

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

/**
 * A room picked on the map. Which pair of rooms is being routed between is the host's
 * business, not the map's: it keeps the last two and asks for the paths between them.
 */
export const alMapSelect = (id: string): CustomEvent<{ id: string }> =>
  new CustomEvent<{ id: string }>("al-map-select", { detail: { id }, bubbles: true, composed: true });
