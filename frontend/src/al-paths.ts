import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./al-graph-map";
import { getTopology, getTopologyPaths } from "./api";
import { branchRows } from "./topology";
import { sharedStyles } from "./styles";
import { presenceStyles } from "./presence-styles";
import type { Config, Group, HomeAssistant, TopologyPayload } from "./types";

/** Room routing is independent of presence estimation and needs no polling. */
@customElement("al-paths")
export class AlPaths extends LitElement {
  static styles = [sharedStyles, presenceStyles, css`
    .paths-layout { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 16px; }
    .paths-layout > * { min-width: 0; }
    .room-tree { max-height: 70vh; overflow: auto; }
    .branch { margin-left: 14px; border-left: 1px solid var(--al-control-border); padding-left: 8px; }
    summary { cursor: pointer; padding: 10px 0; font-weight: 600; }
    .room { width: 100%; text-align: left; margin: 3px 0; display: flex; justify-content: space-between; gap: 8px; }
    summary .room { display: inline-flex; width: calc(100% - 20px); }
    .endpoint { color: var(--primary-text-color); font-size: 0.85em; font-weight: 600; }
    .instructions { margin: 0 0 16px; }
    .paths { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--al-control-border); }
    .paths li { padding: 6px 0; }
    .narrow .paths-layout { grid-template-columns: 1fr; }
    .narrow .room-tree { max-height: 35vh; }
    @media (max-width: 800px) {
      .paths-layout { grid-template-columns: 1fr; }
      .room-tree { max-height: 35vh; }
    }
  `];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ type: Boolean }) narrow = false;
  @state() private topology: TopologyPayload | null = null;
  @state() private selected: [string | null, string | null] = [null, null];
  @state() private paths: string[][] = [];
  @state() private pending = false;
  @state() private error: string | null = null;
  @state() private loading = false;
  private pathSeq = 0;
  private topologySeq = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.refreshTopology();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.pathSeq++;
    this.topologySeq++;
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("config") && changed.get("config") !== undefined) {
      this.selected = [null, null];
      this.paths = [];
      this.pathSeq++;
      this.pending = false;
      void this.refreshTopology();
    }
  }

  private async refreshTopology(): Promise<void> {
    if (!this.hass) return;
    const seq = ++this.topologySeq;
    this.loading = true;
    this.error = null;
    try {
      const topology = await getTopology(this.hass);
      if (seq === this.topologySeq) this.topology = topology;
    } catch {
      if (seq === this.topologySeq) this.error = "Could not load room connections. Try again.";
    } finally {
      if (seq === this.topologySeq) this.loading = false;
    }
  }

  private roomName(id: string): string {
    return this.config ? branchRows(this.config).find((row) => row.id === id)?.label ?? id : id;
  }

  private async select(id: string): Promise<void> {
    const pair = this.selected.filter((room): room is string => room !== null);
    const next = pair.includes(id) ? pair.filter((room) => room !== id) : [...pair, id].slice(-2);
    this.selected = [next[0] ?? null, next[1] ?? null];
    this.paths = [];
    this.error = null;
    const seq = ++this.pathSeq;
    const [from, to] = this.selected;
    this.pending = false;
    if (!this.hass || !from || !to) return;
    this.pending = true;
    try {
      const paths = await getTopologyPaths(this.hass, from, to);
      if (seq === this.pathSeq) this.paths = paths;
    } catch {
      if (seq === this.pathSeq) this.error = "Could not load routes. Select the rooms again to retry.";
    } finally {
      if (seq === this.pathSeq) this.pending = false;
    }
  }

  private renderTree(groups: Group[], rooms: Set<string>): TemplateResult[] {
    return groups.map((group) => {
      const endpoint = this.selected[0] === group.id ? "From" : this.selected[1] === group.id ? "To" : "";
      const label = group.name ?? group.id;
      const button = html`<button class="room" type="button" data-room=${group.id}
        aria-pressed=${endpoint ? "true" : "false"} @click=${(event: Event) => {
          // Selecting a room in a branch summary must not also collapse the branch.
          event.preventDefault();
          event.stopPropagation();
          void this.select(group.id);
        }}>
        <span>${label}</span><span class="endpoint">${endpoint}</span>
      </button>`;
      return group.children.length ? html`<details open>
        <summary>${rooms.has(group.id) ? button : label}</summary>
        <div class="branch">${this.renderTree(group.children, rooms)}</div>
      </details>` : rooms.has(group.id) ? button : html``;
    });
  }

  private renderRoutes(): TemplateResult {
    const [from, to] = this.selected;
    if (!from || !to) return html`<div class="paths">Select two rooms in the tree or map to see their routes.</div>`;
    const heading = `${this.roomName(from)} → ${this.roomName(to)}`;
    return html`<div class="paths" role="status">
      ${this.pending ? `Finding routes from ${heading}…` : this.error ? nothing : html`
        <div>${this.paths.length ? `${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${heading}` : `No route from ${heading}`}</div>
        <ol>${this.paths.map((path) => html`<li>${path.map((id) => this.roomName(id)).join(" → ")}</li>`)}</ol>
      `}
    </div>`;
  }

  override render() {
    return html`<div class="page ${this.narrow ? "narrow" : ""}">
      ${this.error ? html`<ha-alert alert-type="error">${this.error}
        ${!this.topology ? html`<button type="button" @click=${() => void this.refreshTopology()}>Retry</button>` : nothing}
      </ha-alert>` : nothing}
      <div class="paths-layout">
        <ha-card><h2>Rooms</h2><nav class="room-tree" aria-label="Room hierarchy">
          ${this.loading ? html`<p role="status">Loading rooms…</p>` : this.topology && this.config
            ? this.renderTree(this.config.groups, new Set(this.topology.nodes)) : nothing}
        </nav></ha-card>
        <ha-card><h2>Paths</h2>
          <p class="instructions">Select a start room and a destination. Select a room again to clear it.</p>
          <al-graph-map .hass=${this.hass} .config=${this.config} .topology=${this.topology}
            .selected=${this.selected} .paths=${this.paths}
            @al-map-select=${(event: CustomEvent<{ id: string }>) => void this.select(event.detail.id)}
          ></al-graph-map>
          ${this.renderRoutes()}
        </ha-card>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { "al-paths": AlPaths; }
}
