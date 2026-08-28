import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fieldErrors, pathKey } from "./errors";
import { alChange, alSelect } from "./events";
import {
  IDENTITY_FIELDS,
  MAX_VALUE_SELECTOR,
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
import { groupAt, hasOutside, newPresenceOverrides, parentGroupPath, presenceSettings, resolvedEnvelope } from "./model";
import { loadPanelOpen, savePanelOpen } from "./panel-state";
import { GAIN_SELECTOR, OVERRIDES, envelopeOptions } from "./stimulus-form";
import { removeAt, setAt } from "./store";
import { sharedStyles } from "./styles";
import { ADJACENCY_DEFINITION } from "./al-adjacency-table";
import "./al-adjacency-table";
import "./al-override-field";
import type { OverrideValue } from "./convert";
import type { TemplateResult } from "lit";
import type { Config, Group, HomeAssistant, Path, ValidationError } from "./types";

/** The Mix panel's own definition; the others are the kind's, or the table's own. */
const MIX_DEFINITION = "How this group's stimuli and children combine into one level.";
const PRESENCE_DEFINITION = "How loudly 'somebody is here' plays in this group's mix.";

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
      merged = bindArea(merged, merged.area_id, merged.area_id === null ? null : this.areaName(merged.area_id));
    if ("floor_id" in v && merged.floor_id !== group.floor_id)
      merged = bindFloor(merged, merged.floor_id, merged.floor_id === null ? null : this.floorName(merged.floor_id));
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

  /** One presence override, written as a whole block so a config that predates it fills in. */
  private setPresence(group: Group, name: string, value: unknown): void {
    const { config, path } = this;
    if (!config || !path) return;
    const next = setAt(config, [...path, "presence"], {
      ...(group.presence ?? newPresenceOverrides()),
      [name]: value,
    });
    this.emitChange(next, `${pathKey(path)}:presence:${name}`);
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

  /** One panel: a header, the definition that says what it is for, and its stored state. */
  private renderPanel(id: string, header: string, definition: string, fallback: boolean, body: unknown) {
    return html`<ha-expansion-panel
      outlined
      left-chevron
      data-panel=${id}
      ?expanded=${loadPanelOpen(`group:${id}`, fallback)}
      @expanded-changed=${(ev: CustomEvent<{ expanded: boolean }>) => {
        savePanelOpen(`group:${id}`, ev.detail.expanded);
      }}
    >
      <div slot="header" class="panel-header">
        <span>${header}</span>
        <div class="muted">${definition}</div>
      </div>
      <div class="panel-body">${body}</div>
    </ha-expansion-panel>`;
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
        ${this.renderPanel(
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
          `,
        )}
        ${this.renderPanel("mix", "Mix", MIX_DEFINITION, true, this.renderMix(config, group, isRoot, fields))}
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
        label="Max value"
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
        label="Precision"
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
    return this.renderPanel(
      "adjacent",
      "Adjacent groups",
      ADJACENCY_DEFINITION,
      true,
      html`
        <al-adjacency-table
          .hass=${this.hass}
          .config=${config}
          .path=${this.path}
          .errors=${this.errors}
        ></al-adjacency-table>
        ${this.renderExit(config, group, fields)}
      `,
    );
  }

  /**
   * Leaving the property happens from outside where there is an outside, so a room only
   * offers the switch when nothing outdoors is modelled - or when it already claims the
   * exit, because a document the rules now refuse still has to be fixable from here.
   */
  private renderExit(config: Config, group: Group, fields: Record<string, string>) {
    const allowed = group.kind === "outside" || !hasOutside(config) || group.exit === true;
    if (!allowed) return nothing;
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
    const overrides = group.presence ?? newPresenceOverrides();
    const resolved = resolvedEnvelope(config, {
      ...overrides,
      envelope: overrides.envelope ?? presenceSettings(config).envelope,
    });
    const errors = fieldErrors(this.errors, [...path, "presence"]);
    return this.renderPanel(
      "presence",
      "Presence",
      PRESENCE_DEFINITION,
      false,
      html`
        <ha-selector
          class="presence-envelope"
          .hass=${this.hass}
          .selector=${{ select: { mode: "dropdown", options: envelopeOptions(config) } }}
          .label=${"Envelope preset"}
          .required=${false}
          .value=${overrides.envelope ?? ""}
          @value-changed=${(ev: CustomEvent<{ value: string }>) =>
            this.setPresence(group, "envelope", ev.detail.value === "" ? null : ev.detail.value)}
        ></ha-selector>
        <al-override-field
          class="presence-gain"
          .hass=${this.hass}
          label="Gain"
          kind="number"
          .selector=${GAIN_SELECTOR}
          .value=${overrides.gain}
          .inherited=${1}
          .inheritedFrom=${"presence"}
          .error=${errors.gain}
          @value-changed=${(ev: CustomEvent<{ value: number | null }>) =>
            this.setPresence(group, "gain", ev.detail.value ?? 1)}
        ></al-override-field>
        ${OVERRIDES.map(
          (item) => html`<al-override-field
            class="presence-${item.name}"
            .hass=${this.hass}
            .label=${item.label}
            .kind=${item.kind}
            .selector=${item.selector}
            .value=${overrides[item.name] as OverrideValue}
            .inherited=${resolved[item.name] as OverrideValue}
            .inheritedFrom=${overrides.envelope ?? presenceSettings(config).envelope ?? "defaults"}
            .error=${errors[item.name]}
            @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) =>
              this.setPresence(group, item.name, ev.detail.value)}
          ></al-override-field>`,
        )}
      `,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-group-editor": AlGroupEditor;
  }
}
