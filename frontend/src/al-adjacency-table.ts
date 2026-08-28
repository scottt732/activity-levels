import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { alChange } from "./events";
import { CONNECTIONS, CONNECTION_LABELS, DEFAULT_CONNECTION, NODE_KINDS } from "./kinds";
import { adjacencyConnection, adjacencyId, declaredOn, groupAt, isOneWay, walkGroups } from "./model";
import { setAt } from "./store";
import { sharedStyles } from "./styles";
import type { Connection } from "./kinds";
import type { TemplateResult } from "lit";
import type { Adjacency, Config, Group, HomeAssistant, Path, ValidationError } from "./types";

export const ADJACENCY_DEFINITION =
  "Adjacent groups are ones you can walk between without passing through another group in " +
  "this configuration. Sensors don't matter here — an unobserved hallway is still a room.";

/**
 * The Adjacent groups table. An edge is written once, on whichever side read more
 * naturally, so this shows two kinds of row: the ones this group declares, which it can
 * edit, and the ones another group declares against it, which it can only read. Editing
 * the second kind from here would move the edge to the other end of itself.
 */
@customElement("al-adjacency-table")
export class AlAdjacencyTable extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        background: none;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        font-weight: 600;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      th,
      td {
        padding: 4px 8px 4px 0;
        vertical-align: middle;
      }
      tr.declared td {
        color: var(--secondary-text-color);
      }
      select,
      .add-edge {
        font: inherit;
        color: inherit;
        background: var(--card-background-color, transparent);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 4px;
        max-width: 100%;
      }
      .definition {
        margin: 0 0 12px;
      }
      .error {
        font-size: 0.85em;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) path: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];

  private get group(): Group | undefined {
    return this.config && this.path ? groupAt(this.config, this.path) : undefined;
  }

  /** Normalized, so the table never has to care which spelling the document used. */
  private get edges(): Adjacency[] {
    return (this.group?.adjacent ?? []).map((entry) => ({
      id: adjacencyId(entry),
      connection: adjacencyConnection(entry),
      one_way: isOneWay(entry),
    }));
  }

  private emit(edges: Adjacency[]): void {
    const { config, path } = this;
    if (!config || !path) return;
    // Structural: the errors are keyed by `…/adjacent/j`, and removing a row renumbers them.
    this.dispatchEvent(alChange(setAt(config, [...path, "adjacent"], edges), undefined, true));
  }

  private edit(index: number, patch: Partial<Adjacency>): void {
    this.emit(this.edges.map((edge, i) => (i === index ? { ...edge, ...patch } : edge)));
  }

  private nameOf(id: string): string {
    const found = this.config ? walkGroups(this.config).find(({ group }) => group.id === id) : undefined;
    return found?.group.name ?? id;
  }

  /** Areas and outside areas, minus this one and minus every group already on the table. */
  private candidates(): Group[] {
    const group = this.group;
    if (!this.config || !group) return [];
    const listed = new Set([
      group.id,
      ...this.edges.map((e) => e.id),
      ...declaredOn(this.config, group.id).map((d) => d.group.id),
    ]);
    return walkGroups(this.config)
      .map(({ group: g }) => g)
      .filter((g) => NODE_KINDS.has(g.kind) && !listed.has(g.id));
  }

  private errorFor(index: number): string | undefined {
    const prefix = `${(this.path ?? []).join("/")}/adjacent/${index}`;
    return this.errors.find((e) => e.path === prefix || e.path.startsWith(`${prefix}/`))?.message;
  }

  override render() {
    const group = this.group;
    if (!this.config || !group) return nothing;
    const declared = declaredOn(this.config, group.id);
    const candidates = this.candidates();
    return html`
      <p class="muted definition">${ADJACENCY_DEFINITION}</p>
      <table>
        <thead>
          <tr>
            <th scope="col">Group</th>
            <th scope="col">Connection</th>
            <th scope="col">Both ways</th>
            <th scope="col"><span class="visually-hidden">Remove</span></th>
          </tr>
        </thead>
        <tbody>
          ${this.edges.map((edge, i) => this.renderOwn(edge, i))}
          ${declared.map(({ group: other, edge }) => this.renderDeclared(other, edge))}
          ${this.edges.length === 0 && declared.length === 0
            ? html`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>`
            : nothing}
        </tbody>
      </table>
      ${candidates.length === 0
        ? nothing
        : html`<select
            class="add-edge"
            aria-label="Add an adjacent group"
            .value=${""}
            @change=${(ev: Event) => {
              const target = ev.target as HTMLSelectElement;
              if (target.value === "") return;
              this.emit([...this.edges, { id: target.value, connection: DEFAULT_CONNECTION, one_way: false }]);
              target.value = "";
            }}
          >
            <option value="">Add an adjacent group…</option>
            ${candidates.map((g) => html`<option value=${g.id}>${g.name ?? g.id}</option>`)}
          </select>`}
    `;
  }

  private renderOwn(edge: Adjacency, index: number): TemplateResult {
    const error = this.errorFor(index);
    const name = this.nameOf(edge.id);
    return html`<tr class="own" data-id=${edge.id}>
      <td>${name} ${error ? html`<div class="muted error">${error}</div>` : nothing}</td>
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${name}"
          .value=${edge.connection}
          @change=${(ev: Event) =>
            this.edit(index, { connection: (ev.target as HTMLSelectElement).value as Connection })}
        >
          ${CONNECTIONS.map(
            (c) => html`<option value=${c} ?selected=${c === edge.connection}>${CONNECTION_LABELS[c]}</option>`,
          )}
        </select>
      </td>
      <td>
        <input
          class="both-ways"
          type="checkbox"
          aria-label="You can walk both ways between here and ${name}"
          title="Unchecked means you can only go this way"
          .checked=${!edge.one_way}
          @change=${(ev: Event) => this.edit(index, { one_way: !(ev.target as HTMLInputElement).checked })}
        />
      </td>
      <td>
        <ha-icon-button
          label="Remove ${name}"
          data-action="remove"
          @click=${() => this.emit(this.edges.filter((_, i) => i !== index))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
      </td>
    </tr>`;
  }

  private renderDeclared(other: Group, edge: Adjacency): TemplateResult {
    const name = other.name ?? other.id;
    return html`<tr class="declared" data-id=${other.id}>
      <td>${name} <span class="muted">declared on ${name}</span></td>
      <td>${CONNECTION_LABELS[edge.connection]}</td>
      <td>${edge.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-adjacency-table": AlAdjacencyTable;
  }
}
