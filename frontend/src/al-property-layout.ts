import { LitElement, css, html, nothing, svg } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { alChange } from "./events";
import { walkGroups } from "./model";
import type { Config, Gps, HomeAssistant, SiteKind } from "./types";
import { footprint, geoToLocal, localToGeo, mapPixel, parsePolygon, pixelGeo, placeStructure, validOrigin } from "./property-layout";
import type { Point } from "./property-layout";

const colors: Record<SiteKind, string> = {property:"#74836b", lawn:"#65964d", driveway:"#89919a", path:"#b5a58a", pool:"#59aac7"};
const SIZE = 512;

@customElement("al-property-layout")
export class AlPropertyLayout extends LitElement {
  static styles = css`
    :host { display:block; } fieldset { border:0; padding:0; margin:16px 0; }
    .row { display:flex; flex-wrap:wrap; gap:12px; align-items:end; margin:12px 0; }
    label { display:flex; flex-direction:column; gap:4px; }
    input, select, textarea, button { font:inherit; color:var(--primary-text-color,#e4edf3);
      background:var(--card-background-color,#263d4c); border:1px solid var(--divider-color,#526674);
      border-radius:6px; padding:8px; } button:disabled { opacity:0.5; cursor:default; }
    input { max-width:150px; } button { padding:8px; cursor:pointer; } a { color:var(--primary-color,#69c8e0); }
    .map { position:relative; max-width:768px; background:#253743; }
    svg { display:block; width:100%; touch-action:manipulation; }
    .credit { background:#fff; color:#222; font-size:12px; padding:4px 8px; } .credit a { color:#145273; }
    textarea { width:min(95%,500px); min-height:100px; } .error { color:var(--error-color,#ef6b6b); }
    .hint { color:var(--secondary-text-color); } li { margin:8px 0; }
  `;
  @property({attribute:false}) config?: Config;
  @property({attribute:false}) hass?: HomeAssistant;
  @property({type:Boolean}) disabled = false;
  @state() private latitude = "";
  @state() private longitude = "";
  @state() private elevation = "";
  @state() private rotation = "0";
  @state() private loadedLocation = false;
  @state() private error = "";
  @state() private mapOpen = false;
  @state() private tileError = false;
  @state() private zoom = 19;
  @state() private center?: Point;
  @state() private provider = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  @state() private attribution = "© OpenStreetMap contributors";
  @state() private editing: number | null = null;
  @state() private name = "";
  @state() private kind: SiteKind = "property";
  @state() private vertices = "";
  @state() private structure = "";
  @state() private dx = "0";
  @state() private dy = "0";
  @state() private angle = "0";
  @state() private busy = false;

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("config") && this.config?.gps && !this.latitude && !this.longitude) {
      this.latitude = String(this.config.gps.latitude);
      this.longitude = String(this.config.gps.longitude);
      this.elevation = this.config.gps.elevation === undefined ? "" : String(this.config.gps.elevation);
      this.rotation = String(this.config.gps.rotation ?? 0);
    }
    if (changed.has("config") && this.editing !== null) {
      // A shared undo/redo may replace or reorder the feature list while editing.
      this.editing = null; this.vertices = ""; this.name = "";
    }
  }
  private editFeature(index: number): void {
    if (this.disabled) return;
    const feature = this.config?.site?.features[index];
    if (!feature) return;
    this.editing=index; this.name=feature.name; this.kind=feature.kind;
    this.vertices=feature.points.map(p=>p.join(", ")).join("\n");
  }
  private async useHome(): Promise<void> {
    if (!this.hass || this.disabled) return;
    this.busy = true; this.error = "";
    try {
      const data = await this.hass.callWS<Gps>({type:"get_config"});
      if (!validOrigin(data)) throw new Error("Home Assistant location is outside the supported map range. Edit Home information first.");
      this.latitude = String(data.latitude); this.longitude = String(data.longitude);
      this.elevation = String(data.elevation ?? 0); this.loadedLocation = true;
    } catch (e) { this.error = e instanceof Error ? e.message : String(e); }
    finally { this.busy = false; }
  }
  private applyOrigin(): void {
    if (!this.config || this.disabled) return;
    try {
      if (!this.latitude.trim() || !this.longitude.trim()) throw new Error("Enter latitude and longitude.");
      const gps: Gps = {latitude:Number(this.latitude), longitude:Number(this.longitude), rotation:Number(this.rotation)};
      if (this.elevation.trim()) gps.elevation = Number(this.elevation);
      if (!validOrigin(gps)) throw new Error("Enter valid coordinates (latitude between −85 and 85) and finite elevation/rotation.");
      this.dispatchEvent(alChange({...this.config, gps}));
      this.center = [gps.longitude, gps.latitude]; this.error = "";
    } catch (e) { this.error = (e as Error).message; }
  }
  private loadMap(): void {
    try {
      if (!this.config?.gps || !validOrigin(this.config.gps)) throw new Error("Apply a valid geographic origin first.");
      const url = new URL(this.provider);
      if (url.protocol !== "https:" || !["{x}","{y}","{z}"].every(token => this.provider.includes(token)) || !this.attribution.trim())
        throw new Error("Use an HTTPS tile template with {z}, {x}, {y} and attribution.");
      this.center = [this.config.gps.longitude, this.config.gps.latitude];
      this.mapOpen = true; this.tileError = false; this.error = "";
    } catch (e) { this.error = (e as Error).message; }
  }
  private originPixel(): Point { return mapPixel(this.center!, this.zoom); }
  private screen(point: Point): Point {
    const p = mapPixel(localToGeo(point, this.config!.gps!), this.zoom), c = this.originPixel();
    return [p[0] - c[0] + SIZE / 2, p[1] - c[1] + SIZE / 2];
  }
  private pan(x: number, y: number): void {
    const c = this.originPixel(); this.center = pixelGeo([c[0] + x * 128, c[1] + y * 128], this.zoom);
  }
  private addVertex(event: MouseEvent): void {
    if (this.disabled || !this.config?.gps) return;
    const bounds = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    const c = this.originPixel();
    const point = geoToLocal(pixelGeo([c[0] + (event.clientX - bounds.left) / bounds.width * SIZE - SIZE / 2,
      c[1] + (event.clientY - bounds.top) / bounds.height * SIZE - SIZE / 2], this.zoom), this.config.gps);
    this.vertices = [this.vertices.trim(), point.map(v => v.toFixed(3)).join(", ")].filter(Boolean).join("\n");
  }
  private addFeature(): void {
    if (!this.config || this.disabled) return;
    try {
      if (!this.name.trim()) throw new Error("Give the feature a name.");
      const points = parsePolygon(this.vertices);
      const site = this.config.site ?? {ground_z:0, features:[]};
      if (this.editing === null && site.features.length >= 128) throw new Error("Maximum 128 ground features.");
      const feature = {name:this.name.trim(), kind:this.kind, points};
      const features = this.editing === null ? [...site.features, feature] : site.features.map((f,i)=>i===this.editing?feature:f);
      this.dispatchEvent(alChange({...this.config, site:{...site, features}}));
      this.editing = null;
      this.vertices = ""; this.name = ""; this.error = "";
    } catch (e) { this.error = (e as Error).message; }
  }
  private removeFeature(index: number): void {
    if (this.disabled || !this.config?.site) return;
    this.dispatchEvent(alChange({...this.config, site:{...this.config.site, features:this.config.site.features.filter((_, i) => i !== index)}}));
  }
  private place(): void {
    if (!this.config || this.disabled) return;
    try {
      this.dispatchEvent(alChange(placeStructure(this.config, this.structure, Number(this.dx), Number(this.dy), Number(this.angle))));
      this.dx = this.dy = this.angle = "0"; this.error = "";
    } catch (e) { this.error = (e as Error).message; }
  }
  private tiles() {
    const [cx, cy] = this.originPixel(), count = 2 ** this.zoom;
    const left = cx - SIZE / 2, top = cy - SIZE / 2;
    const tiles = [];
    for (let y = Math.floor(top / 256); y <= Math.floor((top + SIZE) / 256); y++) {
      if (y < 0 || y >= count) continue;
      for (let x = Math.floor(left / 256); x <= Math.floor((left + SIZE) / 256); x++) {
        const url = this.provider.replace("{z}", String(this.zoom)).replace("{x}", String(((x % count) + count) % count)).replace("{y}", String(y));
        tiles.push(svg`<image href=${url} x=${x * 256 - left} y=${y * 256 - top} width="256" height="256"
          @error=${() => {this.tileError = true;}}></image>`);
      }
    }
    return tiles;
  }
  private polygon(points: Point[]): string { return points.map(p => this.screen(p).join(",")).join(" "); }
  protected override render() {
    if (!this.config) return nothing;
    const gps = this.config.gps;
    const structures = walkGroups(this.config).map(e => e.group).filter(g => g.kind === "structure" && g.bounds);
    const draft = this.vertices.trim().split("\n").map(row=>row.trim().split(/[,\s]+/).map(Number))
      .filter(p=>p.length===2 && p.every(Number.isFinite)) as Point[];
    return html`
      <p>Use your home location, trace outdoor features, and place existing buildings. Changes join the panel draft; use Save to keep them.</p>
      ${gps ? html`<p>Current origin: ${gps.latitude}, ${gps.longitude}; rotation ${gps.rotation ?? 0}°.</p>` : html`<p>No geographic origin configured yet.</p>`}
      <fieldset ?disabled=${this.disabled || this.busy}>
        <legend>Location</legend>
        <button @click=${this.useHome}>Use Home Assistant location</button>
        <a href="/config/general" target="_blank" rel="noopener">Edit Home Assistant home information</a>
        ${this.loadedLocation ? html`<p>Home location loaded below. Apply it to this floorplan when ready.</p>` : nothing}
        <div class="row">
          <label>Latitude<input type="number" step="any" .value=${this.latitude} @input=${(e:Event) => {this.latitude = (e.target as HTMLInputElement).value;}}></label>
          <label>Longitude<input type="number" step="any" .value=${this.longitude} @input=${(e:Event) => {this.longitude = (e.target as HTMLInputElement).value;}}></label>
          <label>Elevation above sea level (m)<input type="number" step="any" .value=${this.elevation} @input=${(e:Event) => {this.elevation = (e.target as HTMLInputElement).value;}}></label>
          <label>Origin rotation (°)<input type="number" step="any" .value=${this.rotation} @input=${(e:Event) => {this.rotation = (e.target as HTMLInputElement).value;}}></label>
          <button @click=${this.applyOrigin}>${gps ? "Replace floorplan origin" : "Apply floorplan origin"}</button>
        </div>
        <p class="hint">Local room coordinates stay unchanged. The map origin identifies local X=0, Y=0; it may differ from the home pin.</p>
        <button @click=${this.loadMap}>Load map</button>
        <details><summary>Map provider</summary><p>Street map by default. Supply an HTTPS tile provider and its attribution for other imagery.</p>
          <label>Tile URL<textarea .value=${this.provider} @change=${(e:Event) => {this.mapOpen=false;this.provider=(e.target as HTMLTextAreaElement).value;}}></textarea></label>
          <label>Attribution<input .value=${this.attribution} @input=${(e:Event) => {this.attribution=(e.target as HTMLInputElement).value;}}></label>
        </details>
      </fieldset>
      ${this.mapOpen && gps && this.center ? html`
        <div class="row"><button @click=${() => {this.zoom=Math.min(19,this.zoom+1);}}>Zoom in</button><button @click=${() => {this.zoom=Math.max(3,this.zoom-1);}}>Zoom out</button>
          <button @click=${() => this.pan(-1,0)}>West</button><button @click=${() => this.pan(1,0)}>East</button><button @click=${() => this.pan(0,-1)}>North</button><button @click=${() => this.pan(0,1)}>South</button></div>
        <p>Click the map to add outline vertices, or enter local coordinates below.</p>
        <div class="map"><svg viewBox=${`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Property map; use coordinate fields below for keyboard editing" @click=${this.addVertex}>
          ${this.tiles()}
          ${this.config.site?.features.map(f => svg`<polygon points=${this.polygon(f.points)} fill=${colors[f.kind]} fill-opacity="0.35" stroke=${colors[f.kind]} stroke-width="2"></polygon>`)}
          ${structures.map(g => svg`<polygon points=${this.polygon(footprint(g))} fill="#46b6ff" fill-opacity="0.15" stroke="#159ce9" stroke-width="2"></polygon>`)}
          <polyline points=${this.polygon(draft)} fill="#ffcc55" fill-opacity="0.2" stroke="#ffcc55" stroke-width="3"></polyline>
          ${draft.map(p=>{const [x,y]=this.screen(p);return svg`<circle cx=${x} cy=${y} r="4" fill="#ffcc55"></circle>`;})}
        </svg><div class="credit">${this.attribution} · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></div></div>
        ${this.tileError ? html`<p role="status">Some map tiles could not load. Coordinates and layout editing remain available.</p>` : nothing}
      ` : nothing}
      <fieldset ?disabled=${this.disabled}><legend>Ground features</legend>
        <label>Local ground Z (m)<input type="number" step="any" .value=${String(this.config.site?.ground_z ?? 0)} @change=${(e:Event) => {
          const ground_z=Number((e.target as HTMLInputElement).value);
          if (Number.isFinite(ground_z)) this.dispatchEvent(alChange({...this.config!,site:{features:this.config!.site?.features ?? [],ground_z}}));
        }}></label>
        <p class="hint">Local ground height is separate from geographic elevation; use the same Z reference as your rooms.</p>
        <div class="row"><label>Name<input maxlength="100" .value=${this.name} @input=${(e:Event) => {this.name=(e.target as HTMLInputElement).value;}}></label>
          <label>Type<select .value=${this.kind} @change=${(e:Event) => {this.kind=(e.target as HTMLSelectElement).value as SiteKind;}}>${Object.keys(colors).map(kind => html`<option value=${kind}>${kind}</option>`)}</select></label></div>
        <label>Outline coordinates (X, Y metres; one vertex per line)<textarea .value=${this.vertices} @input=${(e:Event) => {this.vertices=(e.target as HTMLTextAreaElement).value;}}></textarea></label>
        <div class="row"><button @click=${this.addFeature}>${this.editing === null ? "Add ground feature" : "Update ground feature"}</button><button @click=${() => {this.vertices="";this.editing=null;}}>Clear drawing</button></div>
        <ul>${this.config.site?.features.map((f,i) => html`<li>${f.name} (${f.kind}) <button @click=${() => this.editFeature(i)}>Edit ${f.name}</button> <button @click=${() => this.removeFeature(i)}>Remove ${f.name}</button></li>`)}</ul>
      </fieldset>
      <fieldset ?disabled=${this.disabled}><legend>Place existing structures</legend>
        <p>Move in local metres and rotate counterclockwise around the building centre. All descendant rooms move together; their dimensions and heights are preserved.</p>
        <div class="row"><label>Structure<select .value=${this.structure} @change=${(e:Event) => {this.structure=(e.target as HTMLSelectElement).value;}}><option value="">Choose a building</option>${structures.map(g => html`<option value=${g.id}>${g.name ?? g.id}</option>`)}</select></label>
          <label>Move X (m)<input type="number" step="any" .value=${this.dx} @input=${(e:Event) => {this.dx=(e.target as HTMLInputElement).value;}}></label>
          <label>Move Y (m)<input type="number" step="any" .value=${this.dy} @input=${(e:Event) => {this.dy=(e.target as HTMLInputElement).value;}}></label>
          <label>Rotate (°)<input type="number" step="any" .value=${this.angle} @input=${(e:Event) => {this.angle=(e.target as HTMLInputElement).value;}}></label>
          <button @click=${this.place}>Apply placement</button></div>
      </fieldset>
      ${this.error ? html`<p class="error" role="alert">${this.error}</p>` : nothing}`;
  }
}
