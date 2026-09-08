import type { HomeAssistant } from "./types";
import type { FloorplanConfig, ActivityFrame } from "./floorplan-model";
export interface FloorplanDashboard { entry_id: string; config: FloorplanConfig; lights: Record<string,string[]>; live: ActivityFrame }
export interface FloorplanSnapshot { data?: FloorplanDashboard; error?: string }
type Listener = (snapshot: FloorplanSnapshot) => void;
const sources = new WeakMap<object,FloorplanSource>();
/** One polling stream per HA connection, shared by panel and cards. */
export class FloorplanSource {
  private listeners = new Set<Listener>();
  private timer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  private pending = false;
  private snapshot: FloorplanSnapshot = {};
  constructor(public hass: HomeAssistant) {}
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener); listener(this.snapshot);
    if (this.listeners.size === 1) { document.addEventListener("visibilitychange",this.visibility); void this.refresh(); }
    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size) { clearTimeout(this.timer); this.generation++; this.pending=false; document.removeEventListener("visibilitychange",this.visibility); }
    };
  }
  private visibility = () => { if (document.visibilityState === "visible") void this.refresh(); else clearTimeout(this.timer); };
  async refresh(): Promise<void> {
    if (this.pending || !this.listeners.size || document.visibilityState !== "visible") return;
    clearTimeout(this.timer); this.pending=true;
    const generation=this.generation;
    try {
      const data=await this.hass.callWS<FloorplanDashboard>({type:"activity_levels/floorplan/dashboard"});
      if (generation !== this.generation) return;
      // Preserve geometry identity across live frames so the camera is not reset by polling.
      if (JSON.stringify(data.config) === JSON.stringify(this.snapshot.data?.config)) data.config=this.snapshot.data!.config;
      this.snapshot={data};
    } catch (error) {
      if (generation === this.generation) this.snapshot={...this.snapshot,error:String((error as {message?:string})?.message ?? error)};
    } finally {
      if (generation === this.generation) {
        this.pending=false; for (const listener of this.listeners) listener(this.snapshot);
        if (this.listeners.size && document.visibilityState === "visible") this.timer=setTimeout(()=>void this.refresh(),2000);
      }
    }
  }
}
export function floorplanSource(hass: HomeAssistant): FloorplanSource {
  const key=(hass as HomeAssistant & {connection?: object}).connection ?? hass.callWS;
  let source=sources.get(key);
  if (!source) {source=new FloorplanSource(hass);sources.set(key,source);} source.hass=hass;
  return source;
}
