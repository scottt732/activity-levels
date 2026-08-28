import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fieldErrors, pathKey } from "./errors";
import { alChange, alSelect } from "./events";
import {
  ADJACENCY_DEFINITION,
  GROUP_LABELS,
  PRESENCE_DEFINITION,
  IDENTITY_FIELDS,
  MAX_VALUE_SELECTOR,
  MIX_DEFINITION,
  MIX_FIELDS,
  PRECISION_SELECTOR,
  bindArea,
  bindFloor,
  changedGroupField,
  groupData,
  groupHelper,
  groupLabel,
  groupSchema,
  mergeGroup,
} from "./group-form";
import { KIND_DEFS, NODE_KINDS } from "./kinds";
import { groupAt, parentGroupPath, presenceSettings } from "./model";
import { renderPanel } from "./panels";
import { removeAt, setAt } from "./store";
import { sharedStyles } from "./styles";
import "./al-adjacency-table";
import "./al-override-field";
import "./al-presence-overrides";
import type { TemplateResult } from "lit";
import type { Config, Group, HomeAssistant, Path, ValidationError } from "./types";

const EXIT_HELPER = "People can leave the property from here, so presence can move from here to Away.";

/** Editor for one group: what it is, how it mixes, what it adjoins, and how presence plays. */
@customElement("al-group-editor")
export class AlGroupEditor extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .note {
        margin: 4px 0 12px;
      }
      .exit {
        align-items: flex-start;
        margin-top: 16px;
      }
      .danger {
        margin-top: 24px;
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) path: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];

  private emitChange(next: Config, coalesceKey?: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  private emitSelect(path: Path | null): void {
    this.dispatchEvent(alSelect(path));
  }

  /**
   * An identity edit. The two registry pickers route through the binding helpers, because
   * the prefill needs the registry *name* and only this element can see `hass`.
   */
  private onIdentityChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const { config, path } = this;
    if (!config || !path) return;
    const group = groupAt(config, path);
    if (!group) return;
    const v = ev.detail?.value ?? {};
    let merged = mergeGroup(group, v);
    if ("area_id" in v && merged.area_id !== group.area_id)
      merged = bindArea(
        merged,
        merged.area_id,
        merged.area_id === null ? null : this.areaName(merged.area_id),
        config,
      );
    if ("floor_id" in v && merged.floor_id !== group.floor_id)
      merged = bindFloor(
        merged,
        merged.floor_id,
        merged.floor_id === null ? null : this.floorName(merged.floor_id),
        config,
      );
    const field = changedGroupField(merged, group);
    if (field === undefined) return;
    this.emitChange(setAt(config, path, merged), `${pathKey(path)}:${field}`);
  }

  private areaName(id: string): string | null {
    return this.hass?.areas[id]?.name ?? null;
  }

  private floorName(id: string): string | null {
    return this.hass?.floors?.[id]?.name ?? null;
  }

  private onMixChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const { config, path } = this;
    if (!config || !path) return;
    const group = groupAt(config, path);
    if (!group) return;
    const merged = mergeGroup(group, ev.detail?.value ?? {});
    const field = changedGroupField(merged, group);
    if (field === undefined) return;
    this.emitChange(setAt(config, path, merged), `${pathKey(path)}:${field}`);
  }

  private setField(key: string, value: unknown): void {
    const { config, path } = this;
    if (!config || !path) return;
    this.emitChange(setAt(config, [...path, key], value), `${pathKey(path)}:${key}`);
  }

  private onDelete(): void {
    const { config, path } = this;
    if (!config || !path) return;
    const group = groupAt(config, path);
    if (!group) return;
    if (!window.confirm(`Delete group "${group.name || group.id}" and everything in it?`)) return;
    this.emitChange(removeAt(config, path));
    const parent = parentGroupPath(path);
    this.emitSelect(parent.length ? parent : null);
  }

  override render() {
    const { config, path } = this;
    if (!config || !path || path.length === 0)
      return html`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const group = groupAt(config, path);
    if (!group) return html`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;

    const isRoot = path.length === 2;
    const own = this.errors.filter((e) => e.path === pathKey(path));
    const fields: Record<string, string> = fieldErrors(this.errors, path);
    const parent = path.length > 2 ? groupAt(config, parentGroupPath(path)) : undefined;

    return html`
      <ha-card header="Group">
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${renderPanel(
          "group",
          "identity",
          "Identity",
          KIND_DEFS[group.kind].definition,
          true,
          html`
            <ha-form
              .hass=${this.hass}
              .data=${groupData(group, isRoot, IDENTITY_FIELDS, config)}
              .schema=${groupSchema(group, isRoot, IDENTITY_FIELDS, config, parent?.kind ?? null)}
              .error=${fields}
              .computeLabel=${groupLabel}
              .computeHelper=${groupHelper}
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(config, group, fields)}
          `,
        )}
        ${renderPanel("group", "mix", "Mix", MIX_DEFINITION, true, this.renderMix(config, group, isRoot, fields))}
        ${this.renderAdjacency(config, group, fields)} ${this.renderPresence(config, group, path)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }

  /** Mix, gain, limiter and precision: everything about how this group sums up. */
  private renderMix(
    config: Config,
    group: Group,
    isRoot: boolean,
    fields: Record<string, string>,
  ): TemplateResult {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${groupData(group, isRoot, MIX_FIELDS, config)}
        .schema=${groupSchema(group, isRoot, MIX_FIELDS, config)}
        .error=${fields}
        .computeLabel=${groupLabel}
        .computeHelper=${groupHelper}
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${GROUP_LABELS.max_value}
        kind="number"
        .selector=${MAX_VALUE_SELECTOR}
        .value=${group.max_value}
        .inherited=${config.defaults.max_value}
        .inheritedFrom=${"defaults"}
        .error=${fields.max_value}
        @value-changed=${(ev: CustomEvent<{ value: number | null }>) => this.setField("max_value", ev.detail.value)}
      ></al-override-field>
      <al-override-field
        .hass=${this.hass}
        .label=${GROUP_LABELS.precision}
        kind="select"
        .selector=${PRECISION_SELECTOR}
        .value=${group.precision === null ? null : String(group.precision)}
        .inherited=${String(config.defaults.precision)}
        .inheritedFrom=${"defaults"}
        .error=${fields.precision}
        @value-changed=${(ev: CustomEvent<{ value: string | null }>) =>
          this.setField("precision", ev.detail.value === null ? null : Number(ev.detail.value))}
      ></al-override-field>
    `;
  }

  /**
   * The Adjacent groups panel, for the kinds a person can be in. "Leads off the property"
   * sits under the table rather than in it, because an exit is a property of the group,
   * not of an edge - it is the one way out that leads nowhere this document models.
   */
  private renderAdjacency(config: Config, group: Group, fields: Record<string, string>) {
    if (!NODE_KINDS.has(group.kind)) return nothing;
    return renderPanel(
      "group",
      "adjacent",
      "Adjacent groups",
      ADJACENCY_DEFINITION,
      true,
      html`
        <al-adjacency-table
          .config=${config}
          .path=${this.path}
          .errors=${this.errors}
        ></al-adjacency-table>
        ${this.renderExit(group, fields)}
      `,
    );
  }

  /**
   * Every room may lead off the property, indoors or out: a front door in the hall and a
   * gate on the driveway are both exits. Only the kinds nobody stands in refuse one, and
   * this is only ever reached from the adjacency panel, which those kinds do not get.
   */
  private renderExit(group: Group, fields: Record<string, string>) {
    return html`<div class="exit row">
      <ha-switch
        .checked=${group.exit === true}
        @change=${(e: Event) => this.setField("exit", (e.target as HTMLInputElement).checked === true)}
      ></ha-switch>
      <div>
        <div>Leads off the property</div>
        <div class="muted">${EXIT_HELPER}</div>
        ${fields.exit ? html`<div class="error">${fields.exit}</div>` : nothing}
      </div>
    </div>`;
  }

  /** The group's own presence channel, tuned like any other: only when presence is on. */
  private renderPresence(config: Config, group: Group, path: Path) {
    if (!presenceSettings(config).enabled) return nothing;
    return renderPanel(
      "group",
      "presence",
      "Presence",
      PRESENCE_DEFINITION,
      false,
      html`<al-presence-overrides
        .hass=${this.hass}
        .config=${config}
        .path=${path}
        .errors=${this.errors}
      ></al-presence-overrides>`,
    );
  }

  /**
   * A group whose kind cannot walk anywhere, still carrying adjacency or a way out from
   * before it was one. The backend refuses the document, so the panel that names the kind
   * is where the way out of that has to be - an error with nothing to click is a dead end.
   */
  private renderStale(config: Config, group: Group, fields: Record<string, string>) {
    if (NODE_KINDS.has(group.kind)) return nothing;
    const stale = [
      group.adjacent.length > 0 ? "adjacent groups" : null,
      group.exit === true ? "a way off the property" : null,
    ].filter((s): s is string => s !== null);
    if (stale.length === 0) return nothing;
    const message =
      fields.adjacent ??
      fields.exit ??
      `${KIND_DEFS[group.kind].label} groups have no ${stale.join(" and no ")}.`;
    return html`<div class="stale row">
      <div class="grow error">${message}</div>
      <ha-button appearance="plain" @click=${() => this.clearStale(config)}>Remove</ha-button>
    </div>`;
  }

  /** Drops both in one edit, so the document goes from refused to valid in a single undo step. */
  private clearStale(config: Config): void {
    const path = this.path;
    if (!path) return;
    const next = setAt(setAt(config, [...path, "adjacent"], []), [...path, "exit"], false);
    // Structural: the errors below are keyed by paths the emptied list renumbers.
    this.dispatchEvent(alChange(next, undefined, true));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-group-editor": AlGroupEditor;
  }
}
