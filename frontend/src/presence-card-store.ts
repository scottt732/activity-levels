import type { HomeAssistant } from "./types";
import type { PresenceDashboard } from "./presence-card-model";
export interface DashboardSnapshot { data?: PresenceDashboard; error?: string }
type Listener = (snapshot: DashboardSnapshot) => void;
const sources = new WeakMap<object, PresenceCardSource>();

/** Share requests across all room cards; the last unsubscribe owns timer cleanup. */
export class PresenceCardSource {
  private listeners = new Set<Listener>();
  private timer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  private pending = false;
  private snapshot: DashboardSnapshot = {};
  constructor(public hass: HomeAssistant) {}
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    if (this.listeners.size === 1) void this.refresh();
    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size) { clearTimeout(this.timer); this.generation++; this.pending = false; }
    };
  }
  async refresh(): Promise<void> {
    if (this.pending || !this.listeners.size) return;
    clearTimeout(this.timer);
    this.pending = true;
    const generation = this.generation;
    try {
      const data = await this.hass.callWS<PresenceDashboard>({ type: "activity_levels/presence/dashboard" });
      if (generation !== this.generation) return;
      this.snapshot = { data };
    } catch (error) {
      if (generation !== this.generation) return;
      this.snapshot = { ...this.snapshot, error: error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error) };
    } finally {
      if (generation === this.generation) {
        this.pending = false;
        for (const listener of this.listeners) listener(this.snapshot);
        if (this.listeners.size) this.timer = setTimeout(() => void this.refresh(), 2000);
      }
    }
  }
}
export function presenceCardSource(hass: HomeAssistant): PresenceCardSource {
  const key = (hass as HomeAssistant & { connection?: object }).connection ?? hass.callWS;
  let source = sources.get(key);
  if (!source) { source = new PresenceCardSource(hass); sources.set(key, source); }
  source.hass = hass;
  return source;
}
