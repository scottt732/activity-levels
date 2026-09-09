import type { HassEntity } from "./types";
export type Scheme = "standard" | "night" | "security";
export interface Threshold { value: number; color: string }
export interface AlertRule { entity: string; state: string; label?: string; group?: string; priority?: number; scheme?: Scheme; color?: string }
export interface ViewerSettings {
  scheme?: Scheme; color_thresholds?: Threshold[]; ground_z?: number;
  light_fill?: boolean; fill_brightness?: number; ambient?: boolean;
  auto_rotate?: boolean; rotation_period?: number; focus_activity?: boolean; rules?: AlertRule[];
}
export interface ViewerOptions extends ViewerSettings {
  scheme: Scheme; color_thresholds: Threshold[]; light_fill: boolean; fill_brightness: number;
  ambient: boolean; auto_rotate: boolean; rotation_period: number; focus_activity: boolean; rules: AlertRule[];
}
const COLORS: Threshold[] = [{value:0,color:"#2189EF"},{value:1.25,color:"#35cddd"},
  {value:2.5,color:"#f5df62"},{value:3.75,color:"#f39c12"},{value:5,color:"#ef493e"}];
const schemes = ["standard", "night", "security"];
const isColor = (s: unknown): s is string => typeof s === "string" && /^#[0-9a-f]{6}$/i.test(s);
export function viewerOptions(settings: ViewerSettings = {}): ViewerOptions {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error("Viewer settings must be an object.");
  const scheme = settings.scheme ?? "standard";
  if (!schemes.includes(scheme)) throw new Error("Unknown color scheme.");
  const thresholds = settings.color_thresholds ?? (scheme === "security" ? [{value:0,color:"#697780"},{value:3,color:"#d31400"}] : COLORS);
  if (!Array.isArray(thresholds) || !thresholds.length || thresholds.length > 32 || thresholds.some(t=>!t || !Number.isFinite(t.value) || !isColor(t.color)) || new Set(thresholds.map(t=>t.value)).size !== thresholds.length)
    throw new Error("color_thresholds needs unique finite values and #RRGGBB colors (1–32 entries).");
  if (settings.ground_z !== undefined && !Number.isFinite(settings.ground_z)) throw new Error("ground_z must be finite.");
  const brightness = settings.fill_brightness ?? (scheme === "standard" ? 0.3 : 0.12);
  if (!Number.isFinite(brightness) || brightness < 0 || brightness > 1) throw new Error("fill_brightness must be between 0 and 1.");
  for (const key of ["light_fill","ambient","auto_rotate","focus_activity"] as const)
    if (settings[key] !== undefined && typeof settings[key] !== "boolean") throw new Error(`${key} must be true or false.`);
  const rotationPeriod=settings.rotation_period ?? 180;
  if (!Number.isFinite(rotationPeriod) || rotationPeriod < 1) throw new Error("rotation_period must be at least 1 second per revolution.");
  const rules = settings.rules ?? [];
  if (!Array.isArray(rules) || rules.length > 64 || rules.some(r=>!r || !/^binary_sensor\.[a-z0-9_]+$/.test(r.entity) || !["on","off"].includes(r.state) ||
    (r.priority !== undefined && !Number.isFinite(r.priority)) || (r.scheme !== undefined && !schemes.includes(r.scheme)) || (r.color !== undefined && !isColor(r.color)) ||
    (r.group !== undefined && typeof r.group !== "string") || (r.label !== undefined && typeof r.label !== "string"))) throw new Error("Invalid binary sensor rule (maximum 64).");
  return {...settings,scheme,color_thresholds:[...thresholds].sort((a,b)=>a.value-b.value),light_fill:settings.light_fill ?? true,
    fill_brightness:brightness,ambient:settings.ambient ?? false,auto_rotate:settings.auto_rotate ?? false,rotation_period:rotationPeriod,focus_activity:settings.focus_activity ?? false,rules};
}
export function thresholdColor(value: number, options: ViewerOptions): string {
  const stops = options.color_thresholds;
  const upper = stops.findIndex(t => t.value > value);
  if (upper === 0) return stops[0]!.color;
  if (upper === -1) return stops.at(-1)!.color;
  const a = stops[upper - 1]!, b = stops[upper]!;
  const fraction = (value - a.value) / (b.value - a.value);
  // Interpolate display RGB just like the legend's CSS gradient.
  return "#" + [1, 3, 5].map(offset => {
    const start = parseInt(a.color.slice(offset, offset + 2), 16);
    const end = parseInt(b.color.slice(offset, offset + 2), 16);
    return Math.round(start + (end - start) * fraction).toString(16).padStart(2, "0");
  }).join("");
}
export function activeRule(rules: AlertRule[], states: Record<string,HassEntity>): AlertRule | undefined {
  return rules.filter(r=>states[r.entity]?.state === r.state).sort((a,b)=>(b.priority ?? 0)-(a.priority ?? 0))[0];
}
export interface RoomLight { rgb: [number,number,number]; brightness: number; unknown: boolean }
const clamp = (v: number) => Math.min(1,Math.max(0,v));
const linear = (v: number) => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4;
const tuple = (v: unknown, size: number): v is number[] => Array.isArray(v) && v.length >= size && v.every(n=>typeof n === "number" && Number.isFinite(n));
/** Return linear RGB so mixing and WebGL use the same color space. HA normally supplies RGB
 * for its supported color modes; the fallbacks also support minimal integrations. */
function lightColor(a: Record<string,unknown>): [number,number,number] {
  let rgb: number[] = [1,1,1];
  if (tuple(a.rgb_color,3)) rgb=a.rgb_color.slice(0,3).map(v=>clamp(v/255));
  else if (tuple(a.hs_color,2)) {
    const h=((a.hs_color[0]!%360)+360)%360/60, s=clamp(a.hs_color[1]!/100);
    rgb=[5,3,1].map(n=>1-s*Math.max(0,Math.min((n+h)%6,4-(n+h)%6,1)));
  } else if (tuple(a.xy_color,2) && a.xy_color[1]! > 0) {
    const [x,y]=a.xy_color as [number,number], X=x/y, Z=(1-x-y)/y;
    const raw=[3.2406*X-1.5372-0.4986*Z,-0.9689*X+1.8758+0.0415*Z,0.0557*X-0.204+1.057*Z];
    const scale=Math.max(1,...raw);
    return raw.map(v=>clamp(v/scale)) as [number,number,number];
  } else {
    const kelvin=typeof a.color_temp_kelvin === "number" ? a.color_temp_kelvin : typeof a.color_temp === "number" && a.color_temp>0 ? 1e6/a.color_temp : NaN;
    if (Number.isFinite(kelvin)) {
      const t=Math.max(1000,Math.min(40000,kelvin))/100;
      rgb=[t<=66?255:329.698727446*(t-60)**-0.1332047592,
        t<=66?99.4708025861*Math.log(t)-161.1195681661:288.1221695283*(t-60)**-0.0755148492,
        t>=66?255:t<=19?0:138.5177312231*Math.log(t-10)-305.0447927307].map(v=>clamp(v/255));
    }
  }
  return rgb.map(linear) as [number,number,number];
}
export function roomLight(ids: string[] | undefined, states: Record<string,HassEntity>): RoomLight {
  const sum=[0,0,0]; let weight=0, brightness=0, unknown=ids === undefined;
  for (const id of new Set(ids ?? [])) {
    const state=states[id];
    if (!state || !["on","off"].includes(state.state)) {unknown=true;continue;}
    if (state.state === "off") continue;
    const raw=state.attributes.brightness;
    const b=typeof raw === "number" && Number.isFinite(raw) ? clamp(raw/255) : 1;
    const rgb=lightColor(state.attributes);
    rgb.forEach((v,i)=>{sum[i]!+=v*b;}); weight+=b; brightness=Math.max(brightness,b);
  }
  return {rgb:sum.map(v=>weight?v/weight:0) as [number,number,number],brightness,unknown};
}
