import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { alRebuild } from "./events";
import { sharedStyles } from "./styles";
import type { TemplateResult } from "lit";
import type { Config, Group, HomeAssistant, ProfileState, SimulationLog, SimulationLogEntry } from "./types";

/** How many simulated light changes the log shows; the endpoint returns at most this many. */
const LOG_ROWS = 50;

/** The engine's own default training window, used when the config does not name one. */
const DEFAULT_MIN_DAYS = 14;

interface Row {
  id: string;
  label: string;
}

/** Every group in the tree, depth first, the way the config spells it. */
function groupRows(config: Config | undefined): Row[] {
  const rows: Row[] = [];
  const walk = (g: Group): void => {
    rows.push({ id: g.id, label: g.name ?? g.id });
    g.children.forEach(walk);
  };
  config?.groups.forEach(walk);
  return rows;
}

const date = (seconds: number): string => new Date(seconds * 1000).toLocaleDateString();

/**
 * The Patterns tab: what the pattern profile knows, how close each group is to being
 * usable, and what the presence simulation has been doing with it.
 *
 * Presentational: the shell owns the fetching (`profile/get`, `simulation/log`) so the
 * Mixer tab and this one share one copy, and asks for a retrain on `al-rebuild`.
 */
@customElement("al-patterns")
export class AlPatterns extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .page {
        display: grid;
        gap: 16px;
        padding: 16px;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 1em;
      }
      .status > div {
        margin-bottom: 4px;
      }
      .trained.no {
        color: var(--warning-color, #ffa600);
      }
      table.readiness {
        width: 100%;
        border-collapse: collapse;
      }
      table.readiness th {
        text-align: left;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      table.readiness th,
      table.readiness td {
        padding: 4px 8px 4px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      td.ready.no {
        color: var(--warning-color, #ffa600);
      }
      td.days,
      td.expected {
        font-variant-numeric: tabular-nums;
      }
      .rebuild-row {
        margin-top: 16px;
      }
      ol.log,
      ul.blocked {
        list-style: none;
        margin: 0;
        padding: 0;
        font-size: 0.9em;
      }
      ol.log li,
      ul.blocked li {
        display: flex;
        gap: 8px;
        align-items: baseline;
        padding: 2px 0;
      }
      ol.log {
        max-height: 320px;
        overflow-y: auto;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) profileState: ProfileState | null = null;
  @property({ attribute: false }) simLog: SimulationLog | null = null;

  /** Retrain even a profile an external producer owns; off unless the user asks for it. */
  @state() private force = false;

  private onRebuild(): void {
    this.dispatchEvent(alRebuild(this.force));
  }

  private renderStatus(): TemplateResult {
    const loaded = this.profileState;
    if (!loaded) return html`<div class="status muted">Profile not loaded yet.</div>`;
    const { producer, generated_at, training_window, day_types, slot_minutes } = loaded.profile;
    return html`
      <div class="status">
        <div class="trained ${loaded.trained ? "yes" : "no"}">
          ${loaded.trained ? "Trained" : "Not trained yet — learning from history."}
        </div>
        <div><span class="muted">Producer</span> <span class="producer">${producer.name} ${producer.version}</span></div>
        <div>
          <span class="muted">Generated</span>
          <span class="generated">${new Date(generated_at * 1000).toLocaleString()}</span>
        </div>
        <div>
          <span class="muted">Learned from</span>
          <span class="window">${date(training_window[0])} – ${date(training_window[1])}</span>
        </div>
        <div class="muted">${day_types.join(", ")} · ${slot_minutes}-minute slots</div>
      </div>
    `;
  }

  private renderReadiness(): TemplateResult {
    const loaded = this.profileState;
    const rows = groupRows(this.config);
    if (!loaded || rows.length === 0)
      return html`<div class="muted">${rows.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
    const minDays = this.config?.defaults.patterns?.min_days ?? DEFAULT_MIN_DAYS;
    return html`
      <table class="readiness">
        <thead>
          <tr>
            <th>Group</th>
            <th>Ready</th>
            <th>Days</th>
            <th>Expected now</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => this.renderRow(row, loaded, minDays))}
        </tbody>
      </table>
    `;
  }

  private renderRow(row: Row, loaded: ProfileState, minDays: number): TemplateResult {
    const ready = loaded.ready[row.id] === true;
    const days = loaded.profile.groups[row.id]?.days ?? 0;
    const expected = this.hass?.states[`sensor.${row.id}_expected_activity`]?.state;
    return html`<tr>
      <td class="group">${row.label}</td>
      <td class="ready ${ready ? "yes" : "no"}" title=${ready ? "Ready" : `Needs ${minDays} days`}>
        ${ready ? "✓" : "✗"}
      </td>
      <td class="days">${days}</td>
      <td class="expected">${expected ?? "—"}</td>
    </tr>`;
  }

  /** Why a group cannot be simulated right now; the first failing precondition, per group. */
  private renderBlocked(): TemplateResult | typeof nothing {
    const blocked = Object.entries(this.simLog?.blocked ?? {}).filter(
      (pair): pair is [string, string] => typeof pair[1] === "string",
    );
    if (blocked.length === 0) return nothing;
    const label = (gid: string): string => groupRows(this.config).find((r) => r.id === gid)?.label ?? gid;
    return html`<ul class="blocked">
      ${blocked.map(([gid, reason]) => html`<li><span class="group">${label(gid)}:</span> <span>${reason}</span></li>`)}
    </ul>`;
  }

  private renderLog(): TemplateResult {
    const entries = [...(this.simLog?.entries ?? [])].sort((a, b) => b.t - a.t).slice(0, LOG_ROWS);
    if (entries.length === 0) return html`<div class="muted log-empty">No simulated light changes yet.</div>`;
    return html`<ol class="log">
      ${entries.map((e) => this.renderEntry(e))}
    </ol>`;
  }

  private renderEntry(e: SimulationLogEntry): TemplateResult {
    return html`<li>
      <span class="muted">${new Date(e.t * 1000).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
      ${e.brightness !== null ? html`<span class="muted">${e.brightness}</span>` : nothing}
    </li>`;
  }

  override render() {
    return html`
      <div class="page">
        <ha-card header="Pattern profile">
          ${this.renderStatus()}
          <div class="row rebuild-row">
            <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
            <ha-switch
              class="force"
              .checked=${this.force}
              @change=${(ev: Event) => {
                this.force = (ev.target as unknown as { checked?: boolean }).checked === true;
              }}
            ></ha-switch>
            <span class="muted">force</span>
          </div>
        </ha-card>
        <ha-card header="Readiness">${this.renderReadiness()}</ha-card>
        <ha-card header="Simulation">${this.renderBlocked()} ${this.renderLog()}</ha-card>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-patterns": AlPatterns;
  }
}
