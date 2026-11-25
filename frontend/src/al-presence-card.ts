import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import type { HomeAssistant } from "./types";
import { correctPresence } from "./api";
import type { PresenceCorrection } from "./api";
import { deviceIcon, deviceVerb, roomPeople, visibleDevices } from "./presence-card-model";
import type { PresenceDashboard, PresenceCardGroup } from "./presence-card-model";
import { presenceCardSource } from "./presence-card-store";
import type { PresenceCardSource } from "./presence-card-store";
import { presenceStyles } from "./presence-styles";

export interface PresenceCardConfig { type: string; group: string; title?: string; min_probability?: number }

@customElement("activity-levels-presence-card")
export class ActivityLevelsPresenceCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private config?: PresenceCardConfig;
  @state() private data?: PresenceDashboard;
  @state() private error?: string;
  @state() private selected?: { person: string; device?: string };
  @state() private adding = false;
  @state() private destination = "";
  @state() private pending = false;
  @state() private correctionError = "";
  @state() private notice = "";
  @state() private failedImages = new Set<string>();
  @state() private manual = new Set<string>();
  private source?: PresenceCardSource;
  private unsubscribe?: () => void;
  private trigger?: HTMLElement;

  static styles = [presenceStyles, css`
    :host { display: block; color: var(--primary-text-color); }
    ha-card { display: block; padding: 12px 16px; }
    h2 { font-size: 1.1em; margin-bottom: 12px; }
    .people { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-start; }
    .person { display: flex; align-items: flex-end; min-height: 62px; max-width: 100%; }
    .avatar, .add { flex: none; width: 52px; height: 52px; min-height: 52px; padding: 3px; border-radius: 50%; border: 2px solid var(--primary-color); overflow: hidden; align-self: flex-start; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
    .avatar.possible { border: 2px dashed var(--secondary-text-color); }
    .possible img { opacity: .5; filter: grayscale(1); }
    .devices { display: flex; flex-wrap: wrap; gap: 3px; margin-left: -16px; position: relative; max-width: calc(100% - 36px); }
    .device { display: grid; place-items: center; border-radius: 50%; width: 30px; min-height: 30px; height: 30px; padding: 4px; box-shadow: 0 0 0 2px var(--card-background-color); background: var(--secondary-background-color); }
    .device ha-icon { --mdc-icon-size: 17px; }
    .add { border: 1px dashed var(--secondary-text-color); font-size: 24px; }
    .hint { color: var(--secondary-text-color); font-size: .9em; }
    .error { color: var(--error-color); margin: 8px 0; }
    dialog { color: var(--primary-text-color); background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 8px; padding: 20px; width: min(680px, calc(100vw - 32px)); max-height: calc(100dvh - 48px); box-sizing: border-box; }
    dialog::backdrop { background: rgb(0 0 0 / .45); }
    dialog header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    dialog h2 { margin: 0; }
    .choices { display: grid; gap: 8px; }
    .choices button { text-align: left; }
    .primary { background: var(--primary-color); color: var(--text-primary-color, white); }
    label { display: grid; gap: 6px; margin: 14px 0; }
    select { width: 100%; }
    .notice { margin-top: 8px; }
    .split { display: grid; grid-template-columns: minmax(160px, 220px) 1fr; gap: 20px; }
    @media (max-width: 560px) { .split { grid-template-columns: 1fr; } }
    .people-list { display: grid; gap: 6px; align-content: start; }
    .row { display: grid; grid-template-columns: 32px 1fr auto; align-items: center; gap: 10px; text-align: left; padding: 6px 10px; }
    .mini { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: var(--secondary-background-color); }
    .mini img { width: 100%; height: 100%; object-fit: cover; }
    .add-row .mini { border: 1px dashed var(--secondary-text-color); background: none; }
    .detail h3 { margin: 0 0 8px; }
    .device-list { display: grid; gap: 6px; margin-top: 14px; }
    .device-row { display: grid; grid-template-columns: 20px 1fr auto; align-items: center; gap: 10px; text-align: left; }
    .device-row ha-icon { --mdc-icon-size: 18px; }
  `];

  setConfig(config: PresenceCardConfig): void {
    if (!config || typeof config.group !== "string" || !config.group.trim()) throw new Error("Select a room or floor group.");
    const threshold = config.min_probability ?? .1;
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) throw new Error("min_probability must be between 0 and 1.");
    this.config = { ...config };
    this.closeDialog();
  }
  static getConfigElement(): HTMLElement { return document.createElement("activity-levels-presence-card-editor"); }
  static getStubConfig(): PresenceCardConfig { return { type: "custom:activity-levels-presence-card", group: "" }; }
  getCardSize(): number { return this.config?.title ? 2 : 1; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 3, min_rows: 1 }; }
  connectedCallback(): void { super.connectedCallback(); this.connectSource(); }
  disconnectedCallback(): void { super.disconnectedCallback(); this.unsubscribe?.(); this.unsubscribe = undefined; this.closeDialog(); }
  protected updated(changed: PropertyValues): void { if (changed.has("hass")) this.connectSource(); }
  private connectSource(): void {
    if (!this.hass || !this.isConnected) return;
    const source = presenceCardSource(this.hass);
    if (source === this.source && this.unsubscribe) return;
    this.unsubscribe?.(); this.source = source;
    this.unsubscribe = source.subscribe(({ data, error }) => { this.data = data; this.error = error; });
  }
  private get group(): PresenceCardGroup | undefined { return this.data?.groups.find(g => g.id === this.config?.group); }
  private get canCorrect(): boolean { return this.hass?.user?.is_admin === true; }
  private closeDialog(): void {
    this.renderRoot?.querySelector<HTMLDialogElement>("dialog")?.close();
    this.selected = undefined; this.adding = false; this.manual = new Set();
    this.trigger?.focus();
  }
  private async openDialog(event: Event, person?: string, device?: string): Promise<void> {
    this.trigger = event.currentTarget as HTMLElement;
    this.selected = person ? { person, device } : undefined;
    this.adding = !person; this.destination = device && person ? (this.data?.people[person]?.devices[device]?.room ?? "away") : this.config?.group ?? ""; this.correctionError = "";
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLDialogElement>("dialog")?.showModal();
  }
  private async correct(request: PresenceCorrection, message: string): Promise<void> {
    if (!this.hass || !this.selected || this.pending || !this.canCorrect) return;
    this.pending = true; this.correctionError = "";
    try {
      await correctPresence(this.hass, this.selected.person, { ...request, ...(this.selected.device ? { device: this.selected.device } : {}) });
      this.notice = message; this.closeDialog(); await this.source?.refresh();
    } catch (error) { this.correctionError = String((error as { message?: string })?.message ?? error); }
    finally { this.pending = false; }
  }
  private locationRequest(id: string, certainty: "definite" | "probable" = "definite", exclude = false): PresenceCorrection {
    const group = this.data?.groups.find(g => g.id === id);
    return { ...(group?.kind === "floor" ? { floor: id } : { room: id }), certainty, ...(exclude ? { exclude: true } : {}) };
  }
  private location(id: string, certainty: "definite" | "probable" = "definite", exclude = false): void {
    const name = this.data?.groups.find(g => g.id === id)?.name ?? id;
    void this.correct(this.locationRequest(id, certainty, exclude), `${this.selected?.person}: ${exclude ? "not in" : certainty === "probable" ? "probably in" : "confirmed in"} ${name}.`);
  }
  private renderDetail(selected: { person: string; device?: string }) {
    const person = this.data?.people[selected.person];
    if (!person) return nothing;
    const device = selected.device ? person.devices[selected.device] : undefined;
    const busy = this.pending || !this.canCorrect;
    const probability = this.data && this.group ? roomPeople(this.data, this.group, 0).find(p => p.name === selected.person)?.probability ?? 0 : 0;
    return html`<h3>${device?.name ?? selected.person}</h3>
      ${device ? html`
        <p class="hint">${selected.person} · ${this.data?.groups.find(g => g.id === device.room)?.name ?? device.room ?? "Location unknown"}</p>
        <div class="choices">${[false, true].map(carried => html`<button ?disabled=${busy} @click=${() => void this.correct({ carried }, `${device.name}: ${deviceVerb(device.kind, carried).toLowerCase()}.`)}>${deviceVerb(device.kind, carried)}</button>`)}</div>
      ` : html`<p class="hint">${this.group?.name} · ${Math.round(probability * 100)}%</p><div class="choices">
        <button class="primary" ?disabled=${busy} @click=${() => this.location(this.config!.group)}>Definitely here</button>
        <button ?disabled=${busy} @click=${() => this.location(this.config!.group, "probable")}>Probably here</button>
        <button ?disabled=${busy} @click=${() => this.location(this.config!.group, "definite", true)}>Not here</button>
      </div>
      ${Object.keys(person.devices ?? {}).length ? html`<div class="device-list">${Object.entries(person.devices).map(([id, d]) => html`<button class="device-row" @click=${() => { this.selected = { person: selected.person, device: id }; this.destination = d.room ?? "away"; }}><ha-icon .icon=${deviceIcon(d.kind)}></ha-icon><span>${d.name}</span><span class="hint">${this.data?.groups.find(g => g.id === d.room)?.name ?? d.room ?? "Unknown"}</span></button>`)}</div>` : nothing}`}
      <label>${device ? "Device location" : "Somewhere else"}<select .value=${this.destination} ?disabled=${busy} @change=${(e: Event) => { this.destination = (e.target as HTMLSelectElement).value; }}>
        ${(this.data?.groups ?? []).filter(g => !device || g.kind !== "floor").map(g => html`<option value=${g.id} ?selected=${g.id === this.destination}>${g.kind === "floor" ? "Floor: " : ""}${g.name}</option>`)}
        <option value="away" ?selected=${this.destination === "away"}>Away</option>
      </select></label><div class="actions"><button ?disabled=${busy} @click=${() => this.location(this.destination)}>Definitely</button>${!device ? html`<button ?disabled=${busy} @click=${() => this.location(this.destination, "probable")}>Probably</button>` : nothing}
      <button ?disabled=${busy} @click=${() => void this.correct({ clear: true }, "Using automatic estimate.")}>Use automatic estimate</button></div>`;
  }
  private renderDialog() {
    const selected = this.selected;
    const listed = this.data && this.group ? roomPeople(this.data, this.group, this.config?.min_probability ?? .1) : [];
    const names = [...listed.map(p => p.name), ...[...this.manual].filter(name => !listed.some(p => p.name === name) && this.data?.people[name])];
    const others = Object.keys(this.data?.people ?? {}).filter(name => !names.includes(name));
    const image = (name: string) => { const entity = this.data?.people[name]?.person; const src = entity ? this.hass?.states[entity]?.attributes.entity_picture : undefined; return typeof src === "string" && !this.failedImages.has(src) ? src : undefined; };
    return html`<dialog @close=${() => { this.selected = undefined; this.adding = false; }} @cancel=${(e: Event) => { if (this.pending) e.preventDefault(); }} aria-label=${`People in ${this.group?.name ?? "this room"}`}>
      <header><h2>${this.group?.name ?? "People"}</h2><button ?disabled=${this.pending} aria-label="Close" @click=${() => this.closeDialog()}>×</button></header>
      <div class="split">
        <nav class="people-list" aria-label="People">
          ${names.map(name => { const p = listed.find(l => l.name === name); const src = image(name); return html`<button class="row" aria-pressed=${String(!this.adding && selected?.person === name)} @click=${() => this.choose(name)}>
            <span class="mini">${src ? html`<img src=${src} alt="" />` : name.slice(0, 1)}</span><span class="name">${name}</span><span class="hint">${p ? `${Math.round(p.probability * 100)}%` : "Added"}</span></button>`; })}
          ${this.canCorrect && others.length ? html`<button class="row add-row" aria-pressed=${String(this.adding)} @click=${() => { this.adding = true; this.selected = undefined; }}><span class="mini">+</span><span class="name">Add person</span></button>` : nothing}
        </nav>
        <section class="detail">
          ${this.adding ? html`<h3>Who else is here?</h3><div class="choices">${others.map(name => html`<button @click=${() => { this.manual = new Set([...this.manual, name]); this.choose(name); }}>${name}</button>`)}</div>`
            : selected ? this.renderDetail(selected) : html`<p class="hint">Select a person.</p>`}
          ${!this.canCorrect ? html`<p class="hint">An administrator can correct estimates.</p>` : nothing}
          ${this.correctionError ? html`<p class="error" role="alert">${this.correctionError}</p>` : nothing}
        </section>
      </div>
    </dialog>`;
  }
  private choose(name: string): void {
    this.adding = false; this.selected = { person: name }; this.destination = this.config?.group ?? ""; this.correctionError = "";
  }
  protected render() {
    const group = this.group;
    const people = this.data && group ? roomPeople(this.data, group, this.config?.min_probability ?? .1) : [];
    return html`<ha-card>${this.config?.title ? html`<h2>${this.config.title}</h2>` : nothing}
      ${!this.data ? html`<span class="hint">Loading presence…</span>` : !this.data.enabled ? html`<span class="hint">Presence is not enabled.</span>` : !group ? html`<span class="error">Select a valid room or floor in the card settings.</span>` : html`<div class="people">${people.map(({ name, person, probability }) => {
        const image = person.person ? this.hass?.states[person.person]?.attributes.entity_picture : undefined;
        return html`<div class="person"><button class="avatar ${probability >= .6 ? "" : "possible"}" aria-label=${`${name}, ${Math.round(probability * 100)}% in ${group.name}`} title=${`${name} · ${Math.round(probability * 100)}%`} @click=${(e: Event) => void this.openDialog(e, name)}>
          ${typeof image === "string" && !this.failedImages.has(image) ? html`<img src=${image} alt="" @error=${() => { this.failedImages = new Set([...this.failedImages, image]); }} />` : name.slice(0, 1)}
        </button><div class="devices">${visibleDevices(person, group).map(([id, device]) => html`<button class="device" aria-label=${`${name}: ${device.name}`} title=${`${device.name} · ${Math.round((device.confidence ?? 0) * 100)}%`} @click=${(e: Event) => void this.openDialog(e, name, id)}><ha-icon .icon=${deviceIcon(device.kind)}></ha-icon></button>`)}</div></div>`;
      })}${this.canCorrect && people.length < Object.keys(this.data.people ?? {}).length ? html`<button class="add" aria-label="Add person" @click=${(e: Event) => void this.openDialog(e)}>+</button>` : nothing}</div>`}
      ${this.error ? html`<p class="error" role="alert">Could not refresh presence: ${this.error}</p>` : nothing}
      ${this.notice ? html`<p class="notice" role="status">${this.notice}</p>` : nothing}${this.renderDialog()}
    </ha-card>`;
  }
}
