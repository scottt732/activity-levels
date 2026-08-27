import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fieldErrors, listFieldError, pathKey } from "./errors";
import { alChange, alSelect } from "./events";
import {
  MAX_VALUE_SELECTOR,
  PRECISION_SELECTOR,
  changedGroupField,
  groupData,
  groupHelper,
  groupLabel,
  groupSchema,
  mergeGroup,
} from "./group-form";
import { groupAt, parentGroupPath } from "./model";
import { removeAt, setAt } from "./store";
import { sharedStyles } from "./styles";
import "./al-override-field";
import type { GroupField } from "./group-form";
import type { Config, HomeAssistant, Path, ValidationError } from "./types";

const FIELDS: GroupField[] = ["id", "name", "area", "mix", "null_handling", "gain", "adjacent", "exit"];

/** Editor for one group: identity, mixing, and the overridable output settings. */
@customElement("al-group-editor")
export class AlGroupEditor extends LitElement {
  static styles = [
    sharedStyles,
    css`
      h3 {
        margin: 16px 0 8px;
        font-size: 1em;
      }
      .note {
        margin: 4px 0 12px;
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

  private onFormChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
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
    const fields: Record<string, string> = { ...fieldErrors(this.errors, path) };
    const adjacentError = listFieldError(this.errors, path, "adjacent");
    if (adjacentError !== undefined) fields.adjacent = adjacentError;

    return html`
      <ha-card header="Group">
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${groupData(group, isRoot, FIELDS, config)}
          .schema=${groupSchema(group, isRoot, FIELDS, config)}
          .error=${fields}
          .computeLabel=${groupLabel}
          .computeHelper=${groupHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="muted note">Changing the id re-creates this group's entities.</div>

        <h3>Output</h3>
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

        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-group-editor": AlGroupEditor;
  }
}
