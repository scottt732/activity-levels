export const HA_ELEMENTS = [
  "ha-card",
  "ha-icon",
  "ha-icon-button",
  "ha-alert",
  "ha-button",
  "ha-switch",
  "ha-expansion-panel",
  "ha-top-app-bar-fixed",
  "ha-form",
  "ha-selector",
] as const;

/** How long the loader nudge gets before we stop waiting on it. */
export const NUDGE_TIMEOUT_MS = 2500;

/** How long each element gets to register after the nudge. */
export const DEFINE_TIMEOUT_MS = 8000;

/** A deadline that can be called off, so the loser of a race stops holding a timer. */
interface Timer {
  promise: Promise<void>;
  cancel: () => void;
}

function sleep(ms: number): Timer {
  let handle: ReturnType<typeof setTimeout> | undefined;
  const promise = new Promise<void>((resolve) => {
    handle = setTimeout(resolve, ms);
  });
  return { promise, cancel: () => clearTimeout(handle) };
}

/** Races `work` against its own budget and clears the timer either way. */
async function withDeadline<T>(work: Promise<T>, ms: number, onTimeout: T): Promise<T> {
  const timer = sleep(ms);
  try {
    return await Promise.race([work, timer.promise.then(() => onTimeout)]);
  } finally {
    timer.cancel();
  }
}

interface CardHelpers {
  createCardElement: (config: unknown) => {
    constructor: { getConfigElement?: () => Promise<unknown> };
  };
}

/**
 * Home Assistant lazy-loads most of its `ha-*` components. Building a card config
 * element pulls in the editor chunk that defines the form/selector family, which is
 * the cheapest documented way to force them to register from a standalone panel.
 */
async function nudgeLoader(): Promise<void> {
  try {
    const w = window as unknown as { loadCardHelpers?: () => Promise<CardHelpers> };
    const helpers = await w.loadCardHelpers?.();
    const card = helpers?.createCardElement({ type: "entities", entities: [] });
    await card?.constructor?.getConfigElement?.();
  } catch {
    /* best effort: the checks below decide whether it worked */
  }
}

/**
 * Resolves once every element we template against is registered, or once the budgets
 * run out. The nudge gets a shorter budget than the registrations that follow it, so a
 * frontend that never answers costs `nudgeMs + timeoutMs`, not twice the long one.
 */
export async function ensureHaElements(
  timeoutMs = DEFINE_TIMEOUT_MS,
  nudgeMs = NUDGE_TIMEOUT_MS,
): Promise<{ ok: boolean; missing: string[] }> {
  if (HA_ELEMENTS.every((t) => customElements.get(t))) return { ok: true, missing: [] };
  await withDeadline<void>(nudgeLoader(), nudgeMs, undefined);
  const results = await Promise.all(
    HA_ELEMENTS.map((t) =>
      withDeadline(
        customElements.whenDefined(t).then(() => true),
        timeoutMs,
        false,
      ),
    ),
  );
  const missing = HA_ELEMENTS.filter((_, i) => !results[i]);
  return { ok: missing.length === 0, missing: [...missing] };
}
