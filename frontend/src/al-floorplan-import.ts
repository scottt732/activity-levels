import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { parseFloorplan, validateConfig } from "./api";
import { alChange } from "./events";
import { applyImport, creationDefaults, suggestMatches } from "./floorplan-import";
import type { CreateChoice, FloorplanItem, FloorplanSource, ImportChoice, ImportChoices, ImportResult } from "./floorplan-import";
import { allowedChildKinds, KIND_DEFS, KINDS } from "./kinds";
import type { Kind } from "./kinds";
import { walkGroups } from "./model";
import { sharedStyles } from "./styles";
import type { Config, HomeAssistant } from "./types";

const MAX_LENGTH = 1_000_000;
const errorText = (error: unknown): string =>
  typeof error === "object" && error !== null && "message" in error ? String(error.message) : "Import failed. Try again.";

/** The import stays local to this editor until one validated al-change reaches the draft. */
@customElement("al-floorplan-import")
export class AlFloorplanImport extends LitElement {
  static styles = [sharedStyles, css`
    :host { display: block; padding: 16px; max-width: 1000px; }
    textarea { box-sizing: border-box; width: 100%; min-height: 180px; font-family: monospace; }
    input, select, textarea { color: var(--primary-text-color); background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #aaa); border-radius: 4px; padding: 8px; max-width: 100%; }
    label { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
    .check { flex-direction: row; align-items: center; }
    .mapping { border: 1px solid var(--divider-color, #aaa); border-radius: 6px; padding: 12px; margin: 12px 0; min-width: 0; }
    .creation { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
    .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin: 12px 0; }
    .error { color: var(--error-color, #b00020); }
    .summary { border-top: 1px solid var(--divider-color, #aaa); margin-top: 20px; }
    button { cursor: pointer; padding: 10px 16px; border-radius: 4px; }
    button:disabled { cursor: default; }
  `];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ type: Boolean }) disabled = false;
  @state() private text = "";
  @state() private source: FloorplanSource | null = null;
  @state() private choices: ImportChoices = {};
  @state() private importGps = false;
  @state() private busy: "file" | "parse" | "apply" | null = null;
  @state() private error = "";
  @state() private notice = "";
  private sequence = 0;
  private snapshot?: Config;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sequence++;
    this.busy = null;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has("config") && this.snapshot && this.config !== this.snapshot) {
      this.resetPreview();
      this.error = "The draft changed. Parse again to review matches against the current groups.";
    }
  }

  private resetPreview(): void {
    this.sequence++;
    this.source = null;
    this.snapshot = undefined;
    this.choices = {};
    this.importGps = false;
    this.busy = null;
    this.error = "";
    this.notice = "";
  }

  private onSourceInput(event: Event): void {
    this.resetPreview();
    this.text = (event.target as HTMLTextAreaElement).value;
  }

  private async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.resetPreview();
    const sequence = this.sequence;
    if (file.size > MAX_LENGTH) { this.error = "File is too large (maximum 1 MB)."; input.value = ""; return; }
    this.busy = "file";
    try {
      const text = await file.text();
      if (sequence === this.sequence && this.isConnected) this.text = text;
    } catch {
      if (sequence === this.sequence) this.error = "Could not read the file. Paste the YAML or try another file.";
    } finally {
      if (sequence === this.sequence) this.busy = null;
      input.value = "";
    }
  }

  private async parse(): Promise<void> {
    if (!this.hass || !this.config || this.disabled || this.busy) return;
    this.resetPreview();
    if (this.text.length > MAX_LENGTH) { this.error = "Paste is too large (maximum 1 MB of text)."; return; }
    const sequence = this.sequence;
    const config = this.config;
    this.busy = "parse";
    try {
      const source = await parseFloorplan(this.hass, this.text);
      if (sequence !== this.sequence || !this.isConnected) return;
      if (this.config !== config) { this.error = "The draft changed. Parse again to review matches."; return; }
      this.source = source;
      this.snapshot = config;
      this.choices = suggestMatches(config, source);
    } catch (error) {
      if (sequence === this.sequence) this.error = errorText(error);
    } finally {
      if (sequence === this.sequence) this.busy = null;
    }
  }

  private choose(key: string, choice: ImportChoice): void {
    this.sequence++;
    this.choices = { ...this.choices, [key]: choice };
    this.error = "";
  }

  private destination(item: FloorplanItem, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.choose(item.key, value === "create" ? creationDefaults(this.config!, item, this.choices) :
      value === "skip" ? { action: "skip" } : { action: "existing", id: value.slice("existing:".length) });
  }

  private preview(): { result?: ImportResult; error?: string } {
    if (!this.config || !this.source) return {};
    try { return { result: applyImport(this.config, this.source, this.choices, this.importGps) }; }
    catch (error) { return { error: errorText(error) }; }
  }

  private async apply(): Promise<void> {
    if (!this.hass || this.disabled || this.busy || this.config !== this.snapshot) return;
    const { result } = this.preview();
    if (!result?.summary.length) return;
    const sequence = ++this.sequence;
    const config = this.config;
    this.busy = "apply";
    this.error = "";
    try {
      const validation = await validateConfig(this.hass, result.config);
      if (sequence !== this.sequence || this.config !== config || !this.isConnected || this.disabled) return;
      if (!validation.ok) {
        this.error = validation.errors.map((error) => `${error.path}: ${error.message}`).join("; ") || "Configuration validation failed.";
        return;
      }
      this.resetPreview();
      this.notice = "Import applied to the draft. Use Save to persist it, or Undo to revert the import.";
      this.dispatchEvent(alChange(result.config, undefined, result.created ? true : undefined));
    } catch (error) {
      if (sequence === this.sequence) this.error = errorText(error);
    } finally {
      if (sequence === this.sequence) this.busy = null;
    }
  }

  private renderCreation(item: FloorplanItem, choice: CreateChoice) {
    const locked = this.disabled || this.busy === "apply";
    const groups = walkGroups(this.config!).map(({ group }) => group);
    const parentValue = choice.parent ? "id" in choice.parent ? `existing:${choice.parent.id}` : `new:${choice.parent.key}` : "";
    return html`<div class="creation">
      <label>Name <input .value=${choice.name} ?disabled=${locked}
        @input=${(event: Event) => this.choose(item.key, { ...choice, name: (event.target as HTMLInputElement).value })}></label>
      <label>ID <input .value=${choice.id} ?disabled=${locked}
        @input=${(event: Event) => this.choose(item.key, { ...choice, id: (event.target as HTMLInputElement).value })}></label>
      <label>Kind <select .value=${choice.kind} ?disabled=${locked}
        @change=${(event: Event) => this.choose(item.key, { ...choice, kind: (event.target as HTMLSelectElement).value as Kind, parent: null })}>
        ${KINDS.map((kind) => html`<option value=${kind} .selected=${choice.kind === kind}>${KIND_DEFS[kind].label}</option>`)}
      </select></label>
      <label>Parent <select class="parent" .value=${parentValue} ?disabled=${locked}
        @change=${(event: Event) => {
          const value = (event.target as HTMLSelectElement).value;
          this.choose(item.key, { ...choice, parent: !value ? null : value.startsWith("existing:") ?
            { id: value.slice(9) } : { key: value.slice(4) } });
        }}>
        <option value="" .selected=${parentValue === ""}>${choice.kind === "property" ? "Root of configuration" : "Choose a parent…"}</option>
        ${groups.filter((group) => allowedChildKinds(group.kind).includes(choice.kind)).map((group) =>
          html`<option value=${`existing:${group.id}`} .selected=${parentValue === `existing:${group.id}`}>${group.name ?? group.id} (${group.id})</option>`)}
        ${Object.entries(this.choices).filter(([key, other]) => key !== item.key && other.action === "create" &&
          allowedChildKinds(other.kind).includes(choice.kind)).map(([key, other]) =>
          html`<option value=${`new:${key}`} .selected=${parentValue === `new:${key}`}>New: ${(other as CreateChoice).name} (${(other as CreateChoice).id})</option>`)}
      </select></label>
    </div>`;
  }

  private renderItem(item: FloorplanItem) {
    const choice = this.choices[item.key] ?? { action: "skip" };
    const value = choice.action === "existing" ? `existing:${choice.id}` : choice.action;
    return html`<fieldset class="mapping" data-key=${item.key}>
      <legend>${item.context ? `${item.context} / ` : ""}${item.name} · ${KIND_DEFS[item.kind].label}</legend>
      <p class="muted">${item.points ? `${item.points.length} outline vertices. ` : ""}
        ${item.bounds ? `Elevation ${item.bounds[0][2]}–${item.bounds[1][2]} m.` : "No vertical bounds supplied."}</p>
      <label>Destination <select class="destination" .value=${value} ?disabled=${this.disabled || this.busy === "apply"}
        @change=${(event: Event) => this.destination(item, event)}>
        <option value="skip" .selected=${value === "skip"}>Skip</option>
        <option value="create" .selected=${value === "create"}>Create new group…</option>
        ${walkGroups(this.config!).map(({ group }) => html`<option value=${`existing:${group.id}`} .selected=${value === `existing:${group.id}`}>
          ${group.name ?? group.id} (${group.id}) · ${KIND_DEFS[group.kind].label}
        </option>`)}
      </select></label>
      ${choice.action === "create" ? this.renderCreation(item, choice) : nothing}
    </fieldset>`;
  }

  protected override render() {
    const preview = this.preview();
    const locked = this.disabled || this.busy === "apply";
    return html`
      <h2>Import floorplan</h2>
      <p>Paste an ESPresense configuration or choose a file. Only GPS and floor/room geometry are imported.
        Match each source to your current groups; your existing names, hierarchy and activity settings stay in place.</p>
      <label>ESPresense YAML <textarea .value=${this.text} ?disabled=${locked} spellcheck="false"
        @input=${this.onSourceInput}></textarea></label>
      <div class="actions">
        <label>Import file <input type="file" accept=".yaml,.yml,.json,text/yaml,application/json" ?disabled=${locked}
          @change=${this.onFile}></label>
        <button id="parse" type="button" ?disabled=${!this.text.trim() || !!this.busy || this.disabled}
          @click=${this.parse}>${this.busy === "parse" ? "Parsing…" : "Parse and match"}</button>
      </div>
      ${this.error ? html`<p class="error" role="alert">${this.error}</p>` : nothing}
      ${this.notice ? html`<p role="status">${this.notice}</p>` : nothing}
      ${this.source ? html`
        <h3>Review mappings</h3>
        <p>Matches are suggestions. Unmatched entries are skipped. Creating a group is always an explicit choice.</p>
        ${this.source.gps ? html`<label class="check"><input id="gps" type="checkbox" .checked=${this.importGps}
          ?disabled=${locked} @change=${(event: Event) => { this.importGps = (event.target as HTMLInputElement).checked; this.error = ""; }}>
          ${this.config?.gps ? "Replace" : "Import"} GPS origin (${this.source.gps.latitude}, ${this.source.gps.longitude})
        </label>` : nothing}
        ${this.source.items.map((item) => this.renderItem(item))}
        <section class="summary" aria-label="Import changes">
          <h3>Changes to apply</h3>
          ${preview.error ? html`<p class="error" role="alert">${preview.error}</p>` : html`
            <ul>${preview.result?.summary.map((line) => html`<li>${line}</li>`)}</ul>
            ${preview.result?.summary.length ? nothing : html`<p>No changes selected.</p>`}`}
          <button id="apply" type="button" ?disabled=${!preview.result?.summary.length || !!this.busy || this.disabled}
            @click=${this.apply}>${this.busy === "apply" ? "Validating…" : "Apply to draft"}</button>
        </section>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { "al-floorplan-import": AlFloorplanImport }
}
