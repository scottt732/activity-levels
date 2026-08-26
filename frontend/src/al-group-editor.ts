import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { emptyToNull } from "./convert";
import { fieldErrors, pathKey } from "./errors";
import { alChange, alSelect } from "./events";
import { groupAt, parentGroupPath } from "./model";
import { removeAt, setAt } from "./store";
import { sharedStyles } from "./styles";
import "./al-override-field";
import type { Selector } from "./al-override-field";
import type { Config, Group, HomeAssistant, Mix, NullHandling, Path, ValidationError } from "./types";

interface FormItem {
  name: string;
  selector: Selector;
}

const LABELS: Record<string, string> = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain",
};

const HELPERS: Record<string, string> = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent.",
};

/** Fields the top form owns, checked in order to name the coalescing key. */
const FORM_FIELDS: (keyof Group)[] = ["id", "name", "area", "mix", "null_handling", "gain"];

const MIX_OPTIONS = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" },
];

const NULL_HANDLING_OPTIONS = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" },
];

const MAX_VALUE_SELECTOR: Selector = { number: { min: 0.1, step: 0.1, mode: "box" } };
const PRECISION_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((n) => ({ value: String(n), label: String(n) })),
  },
};

const schemaFor = (group: Group, isRoot: boolean): FormItem[] => [
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: MIX_OPTIONS } } },
  ...(group.mix === "mean"
    ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: NULL_HANDLING_OPTIONS } } }]
    : []),
  ...(isRoot ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]),
];

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

  private computeLabel = (item: FormItem): string => LABELS[item.name] ?? item.name;
  private computeHelper = (item: FormItem): string => HELPERS[item.name] ?? "";

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
    const v = ev.detail?.value ?? {};
    const merged: Group = {
      ...group,
      id: String(v.id ?? ""),
      name: emptyToNull(v.name as string | null | undefined),
      area: emptyToNull(v.area as string | null | undefined),
      mix: (v.mix as Mix | undefined) ?? group.mix,
      null_handling: (v.null_handling as NullHandling | undefined) ?? group.null_handling,
      gain: typeof v.gain === "number" ? v.gain : group.gain,
    };
    const field = FORM_FIELDS.find((k) => merged[k] !== group[k]);
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
    const fields = fieldErrors(this.errors, path);
    const own = this.errors.filter((e) => e.path === pathKey(path));
    const data: Record<string, unknown> = {
      id: group.id,
      name: group.name ?? "",
      mix: group.mix,
    };
    if (group.mix === "mean") data.null_handling = group.null_handling;
    if (group.area !== null) data.area = group.area;
    if (!isRoot) data.gain = group.gain;

    return html`
      <ha-card header="Group">
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${schemaFor(group, isRoot)}
          .error=${fields}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
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
