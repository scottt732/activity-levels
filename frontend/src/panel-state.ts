/**
 * Which editor panels the reader left open. One object under one key, because the panels
 * are a set the user tunes once — spreading them over a key each would fill the browser's
 * storage with a row per field group and make them impossible to clear together.
 */
export const PANELS_KEY = "activity_levels.panels";

function read(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PANELS_KEY);
    const parsed: unknown = raw === null ? null : JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, boolean>;
  } catch {
    /* unreadable or unparsable storage: every panel opens at its own default */
    return {};
  }
}

/** Whether this panel is open. `fallback` is what the design says before anyone has touched it. */
export function loadPanelOpen(id: string, fallback: boolean): boolean {
  const stored = read()[id];
  return typeof stored === "boolean" ? stored : fallback;
}

export function savePanelOpen(id: string, open: boolean): void {
  try {
    localStorage.setItem(PANELS_KEY, JSON.stringify({ ...read(), [id]: open }));
  } catch {
    /* storage disabled or full: the panel still stays where it was put this session */
  }
}
