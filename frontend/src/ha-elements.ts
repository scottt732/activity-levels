export const HA_ELEMENTS = [
  "ha-card",
  "ha-icon",
  "ha-icon-button",
  "ha-alert",
  "ha-button",
  "ha-switch",
  "ha-expansion-panel",
  "ha-top-app-bar-fixed",
  "ha-menu-button",
  "ha-form",
  "ha-selector",
] as const;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

export async function ensureHaElements(timeoutMs = 8000): Promise<{ ok: boolean; missing: string[] }> {
  if (HA_ELEMENTS.every((t) => customElements.get(t))) return { ok: true, missing: [] };
  await nudgeLoader();
  const results = await Promise.all(
    HA_ELEMENTS.map((t) =>
      Promise.race([customElements.whenDefined(t).then(() => true), sleep(timeoutMs).then(() => false)]),
    ),
  );
  const missing = HA_ELEMENTS.filter((_, i) => !results[i]);
  return { ok: missing.length === 0, missing: [...missing] };
}
