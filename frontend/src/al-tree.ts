import { LitElement, css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatDuration } from "./duration";
import { pathKey, subtreeErrorCount } from "./errors";
import { alChange, alSelect } from "./events";
import { newGroup, newStimulus, parentGroupPath, parentListPath, uniqueGroupId } from "./model";
import { insertAt, moveAt, removeAt } from "./store";
import { sharedStyles } from "./styles";
import type {
  Config,
  Group,
  GroupLive,
  HomeAssistant,
  LiveState,
  Path,
  Stimulus,
  ValidationError,
  VoiceLive,
} from "./types";

const stop = (ev: Event): void => ev.stopPropagation();

/** Keeps Enter/Space on an inner control from also reaching the expansion panel summary. */
const stopSelectKeys = (ev: KeyboardEvent): void => {
  if (ev.key === "Enter" || ev.key === " ") ev.stopPropagation();
};

/** Group/stimulus tree with inline add, reorder and delete affordances. */
@customElement("al-tree")
export class AlTree extends LitElement {
  static styles = [
    sharedStyles,
    css`
      ha-expansion-panel {
        margin-bottom: 4px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
      }
      .stimulus {
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .selected {
        background: var(--secondary-background-color);
      }
      .link {
        background: none;
        border: none;
        margin: 0;
        padding: 0;
        font: inherit;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }
      .link:focus-visible,
      .stimulus:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .badge {
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.75em;
        line-height: 1.6;
      }
      .chip {
        white-space: nowrap;
      }
      .children {
        padding-left: 8px;
      }
      .body {
        padding: 0 8px 8px 8px;
      }
      ha-icon-button {
        --ha-icon-button-size: 32px;
        --mdc-icon-size: 18px;
      }
      .empty {
        padding: 4px;
      }
      .blurb {
        margin: 0 0 12px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) selection: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) live: LiveState | null = null;

  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  private emitChange(next: Config): void {
    this.dispatchEvent(alChange(next, undefined, true));
  }

  private emitSelect(path: Path | null): void {
    this.dispatchEvent(alSelect(path));
  }

  private isSelected(path: Path): boolean {
    return this.selection !== null && pathKey(this.selection) === pathKey(path);
  }

  private select(ev: Event, path: Path): void {
    ev.stopPropagation();
    this.emitSelect(path);
  }

  private selectOnKey(ev: KeyboardEvent, path: Path): void {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    ev.preventDefault();
    ev.stopPropagation();
    this.emitSelect(path);
  }

  private addGroup(listPath: Path, index: number): void {
    const config = this.config;
    if (!config) return;
    this.emitChange(insertAt(config, listPath, index, newGroup(uniqueGroupId(config, "new_group"))));
    this.emitSelect([...listPath, index]);
  }

  private addStimulus(groupPath: Path, index: number): void {
    const config = this.config;
    if (!config) return;
    const listPath = [...groupPath, "stimuli"];
    this.emitChange(insertAt(config, listPath, index, newStimulus("")));
    this.emitSelect([...listPath, index]);
  }

  private move(path: Path, delta: number): void {
    const config = this.config;
    if (!config) return;
    const listPath = parentListPath(path);
    const from = path[path.length - 1] as number;
    const to = from + delta;
    this.emitChange(moveAt(config, listPath, from, to));
    this.emitSelect([...listPath, to]);
  }

  private removeNode(path: Path, label: string): void {
    const config = this.config;
    if (!config) return;
    if (!window.confirm(`Delete ${label}? This cannot be undone after saving.`)) return;
    this.emitChange(removeAt(config, path));
    const parent = parentGroupPath(path);
    this.emitSelect(parent.length ? parent : null);
  }

  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  private countdown(at: number | null): string | null {
    const now = this.live?.now;
    if (at === null || now === undefined) return null;
    return formatDuration(Math.max(0, Math.round((at - now) * 1000) / 1000));
  }

  /** Tooltip for a voice's phase chip: what it is doing, and how long that lasts. */
  private voiceTitle(voice: VoiceLive): string {
    const ends = this.countdown(voice.phase_ends);
    return ends === null ? `Phase: ${voice.phase}` : `Phase: ${voice.phase}, ends in ${ends}`;
  }

  /** Tooltip for a group's meter: the displayed value, the unrounded mix, and the next wake. */
  private meterTitle(live: GroupLive, max: number, isRoot: boolean): string {
    const parts = [`${live.value} of ${max}`, `raw ${live.raw_value.toFixed(3)}`];
    const wake = isRoot ? this.countdown(live.next_wake) : null;
    if (wake !== null) parts.push(`next wake in ${wake}`);
    return parts.join(" · ");
  }

  override render() {
    const config = this.config;
    if (!config) return html`<ha-card><span class="muted">Loading…</span></ha-card>`;
    if (config.groups.length === 0) return this.renderEmpty();
    return html`
      <ha-card>
        ${config.groups.map((g, i) => this.renderGroup(config, g, ["groups", i], 0, i, config.groups.length))}
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], config.groups.length)}>Add group</ha-button>
        </div>
      </ha-card>
    `;
  }

  private renderEmpty(): TemplateResult {
    return html`
      <ha-card>
        <p class="muted blurb">
          Nothing is configured yet. A group is a room, a floor, or the whole house: it mixes the stimuli you
          give it into one activity level, and groups can nest inside each other.
        </p>
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], 0)}>Add your first group</ha-button>
        </div>
      </ha-card>
    `;
  }

  private renderGroup(
    config: Config,
    group: Group,
    path: Path,
    depth: number,
    index: number,
    siblings: number,
  ): TemplateResult {
    const count = subtreeErrorCount(this.errors, path);
    const live = this.live?.groups[group.id];
    const max = live?.max_value ?? group.max_value ?? config.defaults.max_value;
    const pct = live ? Math.max(0, Math.min(100, (live.value / (max || 1)) * 100)) : 0;
    return html`
      <ha-expansion-panel outlined left-chevron ?expanded=${depth < 2}>
        <div slot="header" class="header ${this.isSelected(path) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(ev: Event) => this.select(ev, path)}
            @keydown=${stopSelectKeys}
          >
            ${group.name || group.id || "(unnamed group)"}
          </button>
          ${count ? html`<span class="badge" title="${count} problem(s) in this group">${count}</span>` : nothing}
          ${live
            ? html`<div class="meter" title=${this.meterTitle(live, max, depth === 0)}>
                  <div style="width: ${pct}%"></div>
                </div>
                <span class="dot ${live.gated ? "gated" : ""}" title=${live.gated ? "Gate open" : "Gate closed"}></span>`
            : nothing}
        </div>
        <div slot="icons" class="row" @click=${stop}>
          <ha-icon-button label="Add stimulus" title="Add stimulus" @click=${() => this.addStimulus(path, group.stimuli.length)}>
            <ha-icon icon="mdi:plus"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Add child group"
            title="Add child group"
            @click=${() => this.addGroup([...path, "children"], group.children.length)}
          >
            <ha-icon icon="mdi:folder-plus"></ha-icon>
          </ha-icon-button>
          <ha-icon-button label="Move up" title="Move up" .disabled=${index === 0} @click=${() => this.move(path, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Move down"
            title="Move down"
            .disabled=${index === siblings - 1}
            @click=${() => this.move(path, 1)}
          >
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Delete group"
            title="Delete group"
            @click=${() => this.removeNode(path, `group "${group.name || group.id}" and everything in it`)}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="body">
          ${group.stimuli.map((s, i) =>
            this.renderStimulus(s, [...path, "stimuli", i], i, group.stimuli.length, group.id),
          )}
          ${group.stimuli.length === 0
            ? html`<div class="muted empty">
                No stimuli yet — use the + button above to point this group at an entity.
              </div>`
            : nothing}
          <div class="children">
            ${group.children.map((c, i) =>
              this.renderGroup(config, c, [...path, "children", i], depth + 1, i, group.children.length),
            )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }

  private renderStimulus(
    stimulus: Stimulus,
    path: Path,
    index: number,
    siblings: number,
    groupId: string,
  ): TemplateResult {
    const entity = this.hass?.states[stimulus.entity];
    const name = (entity?.attributes.friendly_name as string | undefined) ?? (stimulus.entity || "(no entity)");
    const count = subtreeErrorCount(this.errors, path);
    const voice = this.live?.voices[groupId]?.find((v) => v.label === (stimulus.key ?? stimulus.entity));
    return html`
      <div
        class="row stimulus ${this.isSelected(path) ? "selected" : ""}"
        role="button"
        tabindex="0"
        @click=${(ev: Event) => this.select(ev, path)}
        @keydown=${(ev: KeyboardEvent) => this.selectOnKey(ev, path)}
      >
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="name grow" title=${stimulus.entity}>${name}</span>
        ${count ? html`<span class="badge" title="${count} problem(s)">${count}</span>` : nothing}
        ${entity ? html`<span class="muted chip">${entity.state}</span>` : nothing}
        ${voice
          ? html`<span class="chip phase ${voice.phase}" title=${this.voiceTitle(voice)}>${voice.phase}</span>
              <span class="muted chip">${voice.value.toFixed(2)}</span>`
          : nothing}
        <div class="row" @click=${stop}>
          <ha-icon-button label="Move up" title="Move up" .disabled=${index === 0} @click=${() => this.move(path, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Move down"
            title="Move down"
            .disabled=${index === siblings - 1}
            @click=${() => this.move(path, 1)}
          >
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </ha-icon-button>
          <ha-icon-button label="Delete stimulus" title="Delete stimulus" @click=${() => this.removeNode(path, `stimulus "${name}"`)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-tree": AlTree;
  }
}
