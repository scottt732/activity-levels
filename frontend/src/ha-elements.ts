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

/**
 * Elements the panel wants but can live without. `ha-yaml-editor` is only the Code tab,
 * and it is further down Home Assistant's lazy-loading tree than everything above — so a
 * frontend that never registers it should cost one tab, not the whole panel, which is
 * what putting it in {@link HA_ELEMENTS} would have done.
 */
export const HA_OPTIONAL_ELEMENTS = ["ha-yaml-editor", "ha-state-icon"] as const;

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
 * `ha-yaml-editor` is not in the chunk the card-helper nudge pulls in, so it needs a nudge
 * of its own. `ha-selector` imports each concrete selector on demand, the moment its
 * `selector` property is set, and `ha-selector-object` is the one that imports the YAML
 * editor — so an object selector mounted off-screen for a moment is what registers it.
 * Runs alongside {@link nudgeLoader} and shares its budget: `ha-selector` is what that one
 * is loading, so this simply waits for it to arrive.
 */
async function nudgeYamlEditor(): Promise<void> {
  if (customElements.get("ha-yaml-editor")) return;
  let probe: HTMLElement | undefined;
  try {
    await customElements.whenDefined("ha-selector");
    probe = document.createElement("ha-selector");
    (probe as HTMLElement & { selector?: unknown }).selector = { object: {} };
    probe.style.display = "none";
    document.body.appendChild(probe);
    await customElements.whenDefined("ha-yaml-editor");
  } catch {
    /* best effort: the Code tab says so for itself if this did not work */
  } finally {
    probe?.remove();
  }
}

/**
 * Resolves once every element we template against is registered, or once the budgets
 * run out. The nudges get a shorter budget than the registrations that follow them, so a
 * frontend that never answers costs `nudgeMs + timeoutMs`, not twice the long one.
 *
 * `missing` is what the panel cannot run without; `optionalMissing` is what only costs a
 * tab. They are separate so that one lazily-loaded editor cannot blank the whole page.
 */
export async function ensureHaElements(
  timeoutMs = DEFINE_TIMEOUT_MS,
  nudgeMs = NUDGE_TIMEOUT_MS,
): Promise<{ ok: boolean; missing: string[]; optionalMissing: string[] }> {
  const wanted = [...HA_ELEMENTS, ...HA_OPTIONAL_ELEMENTS];
  if (wanted.every((t) => customElements.get(t))) return { ok: true, missing: [], optionalMissing: [] };
  await withDeadline<void>(
    Promise.all([nudgeLoader(), nudgeYamlEditor()]).then(() => undefined),
    nudgeMs,
    undefined,
  );
  const results = await Promise.all(
    wanted.map((t) =>
      withDeadline(
        customElements.whenDefined(t).then(() => true),
        timeoutMs,
        false,
      ),
    ),
  );
  const absent = wanted.filter((_, i) => !results[i]);
  const optional: readonly string[] = HA_OPTIONAL_ELEMENTS;
  const missing = absent.filter((t) => !optional.includes(t));
  return {
    ok: missing.length === 0,
    missing,
    optionalMissing: absent.filter((t) => optional.includes(t)),
  };
}
