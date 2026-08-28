import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { durationToSeconds, secondsToDuration } from "./duration";
import { fieldErrors, pathKey, subtreeErrorCount } from "./errors";
import { alChange } from "./events";
import {
  newPreset,
  presetLabel,
  presetReferences,
  renamePreset,
  uniquePresetId,
} from "./model";
import {
  DURATION_SELECTOR,
  RETRIGGER_HELPER,
  RETRIGGER_LABEL,
  RETRIGGER_SELECTOR,
  STACK_HELPER,
  STACK_LABEL,
  SUSTAIN_SELECTOR,
  UNAVAILABLE_SELECTOR,
} from "./stimulus-form";
import { insertAt, removeAt, reorderAt, setAt } from "./store";
import { sharedStyles } from "./styles";
import "./al-envelope-sketch";
import "./al-override-field";
import { BOOLEAN_SELECTOR } from "./al-override-field";
import type { Selector } from "./al-override-field";
import type { OverrideKind, OverrideValue } from "./convert";
import type { PropertyValues } from "lit";
import type {
  Config,
  EnvelopePreset,
  HaDuration,
  HomeAssistant,
  Path,
  ValidationError,
} from "./types";

interface FormItem {
  name: string;
  selector: Selector;
}

const LABELS: Record<string, string> = {
  label: "Name",
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse",
};

const HELPERS: Record<string, string> = {
  label: "What this preset is called in the panel. Blank shows the id instead.",
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to travel from the peak to the sustain level.",
  sustain:
    "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
  release:
    "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
  impulse:
    "Fire and forget: the trigger ends the moment it starts, leaving only the release.",
};

/** Fields the top form owns, checked in order to name the coalescing key. */
const FORM_FIELDS: (keyof EnvelopePreset)[] = [
  "label",
  "id",
  "attack",
  "decay",
  "sustain",
  "release",
  "impulse",
];

const IMPULSE_SELECTOR: Selector = { boolean: {} };

const SCHEMA: FormItem[] = [
  { name: "label", selector: { text: {} } },
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: DURATION_SELECTOR },
  { name: "decay", selector: DURATION_SELECTOR },
  { name: "sustain", selector: SUSTAIN_SELECTOR },
  { name: "release", selector: DURATION_SELECTOR },
  { name: "impulse", selector: IMPULSE_SELECTOR },
];

/** The preset fields that may be left unset, falling through to `defaults`. */
type PresetOverride = "retrigger" | "stack" | "unavailable" | "debounce";

interface OverrideItem {
  name: PresetOverride;
  label: string;
  kind: OverrideKind;
  selector: Selector;
  hint?: string;
}

const OVERRIDES: OverrideItem[] = [
  {
    name: "retrigger",
    label: RETRIGGER_LABEL,
    kind: "select",
    selector: RETRIGGER_SELECTOR,
    hint: RETRIGGER_HELPER,
  },
  {
    name: "stack",
    label: STACK_LABEL,
    kind: "boolean",
    selector: BOOLEAN_SELECTOR,
    hint: STACK_HELPER,
  },
  {
    name: "unavailable",
    label: "When unavailable",
    kind: "select",
    selector: UNAVAILABLE_SELECTOR,
  },
  {
    name: "debounce",
    label: "Debounce",
    kind: "duration",
    selector: DURATION_SELECTOR,
  },
];

/** The MIME type the reorder drag carries, mirroring the tree's. */
const DRAG_TYPE = "text/plain";

/** Fallback row height for `dragover` maths when nothing has been laid out yet. */
const ROW_HEIGHT = 36;

const stop = (ev: Event): void => ev.stopPropagation();

/** A preset that could not be deleted, and what is still pointing at it. */
interface Blocked {
  id: string;
  defaults: boolean;
  groups: string[];
}

/** The envelope preset library: a list on the left, the selected preset's editor on the right. */
@customElement("al-envelopes")
export class AlEnvelopes extends LitElement {
  static styles = [
    sharedStyles,
    css`
      h3 {
        margin: 16px 0 8px;
        font-size: 1em;
      }
      .preset {
        padding: 4px;
        border-radius: 4px;
        min-height: 36px;
        cursor: grab;
      }
      .preset.selected {
        background: var(--secondary-background-color);
      }
      .preset.dragging {
        opacity: 0.5;
      }
      /* The insertion point, drawn on the row the pointer is over rather than as a
         separate element, so the list never reflows mid-drag. */
      .preset.drop-before {
        box-shadow: inset 0 2px 0 0 var(--primary-color);
      }
      .preset.drop-after {
        box-shadow: inset 0 -2px 0 0 var(--primary-color);
      }
      .handle {
        color: var(--secondary-text-color);
        --mdc-icon-size: 18px;
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .names .id {
        font-size: 0.8em;
      }
      .default {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
      }
      .default input {
        accent-color: var(--primary-color);
        margin: 0;
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .link:focus-visible {
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
      ha-icon-button {
        --ha-icon-button-size: 32px;
        --mdc-icon-size: 18px;
      }
      .sketch {
        margin-top: 8px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ type: Boolean }) narrow = false;

  /** Index into `config.envelopes`; this tab owns its own selection. */
  @state() private selected = 0;
  @state() private blocked: Blocked | null = null;

  /** The preset being dragged, by index; `dragover` cannot read the payload back. */
  @state() private dragging: number | null = null;
  /** The slot a drop would land in, counted in the list as it reads now. */
  @state() private dropAt: number | null = null;

  /**
   * Keeps the selection pointing at a preset that still exists after an edit elsewhere, and
   * drops the delete warning: the references it names were counted against the old config.
   */
  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!changed.has("config")) return;
    this.blocked = null;
    const count = this.config?.envelopes.length ?? 0;
    if (this.selected >= count) this.selected = Math.max(0, count - 1);
  }

  private computeLabel = (item: FormItem): string =>
    LABELS[item.name] ?? item.name;
  private computeHelper = (item: FormItem): string => HELPERS[item.name] ?? "";

  private emitChange(next: Config, coalesceKey?: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  private selectPreset(index: number): void {
    this.selected = index;
    this.blocked = null;
  }

  /**
   * Points `defaults.envelope` at this preset. There is always exactly one default, so
   * the checkbox reads as a radio: the one already checked is disabled rather than
   * clearing to a document with no default preset at all, which the backend refuses.
   */
  private setDefault(index: number): void {
    const config = this.config;
    const preset = config?.envelopes[index];
    if (!config || !preset || config.defaults.envelope === preset.id) return;
    this.emitChange(
      setAt(config, ["defaults", "envelope"], preset.id),
      "defaults:envelope",
    );
  }

  /**
   * Moves the preset at `from` into the slot `before` names in the list as it reads now.
   * Order is meaningful -- it is the order the panel lists presets in, and it round-trips
   * through the document -- so this is a real edit, one undo step per drop.
   *
   * The selection follows the preset it was on rather than its index, which is the only
   * reading that survives a drag that steps over it.
   */
  private reorder(from: number, before: number): void {
    const config = this.config;
    if (!config) return;
    const next = reorderAt(config, ["envelopes"], from, before);
    if (next === config) return;
    const selectedId = config.envelopes[this.selected]?.id;
    const landed = next.envelopes.findIndex((e) => e.id === selectedId);
    this.selected = landed === -1 ? 0 : landed;
    this.blocked = null;
    this.emitChange(next);
  }

  private onDragStart(ev: DragEvent, index: number): void {
    ev.dataTransfer?.setData(DRAG_TYPE, String(index));
    if (ev.dataTransfer) ev.dataTransfer.effectAllowed = "move";
    this.dragging = index;
  }

  private onDragEnd(): void {
    this.dragging = null;
    this.dropAt = null;
  }

  /**
   * Which slot the pointer is naming: the top half of a row means "above it", the bottom
   * half "below it". A row the browser has not laid out yet reports a zero height, so the
   * stylesheet's `min-height` stands in and the answer is still one of the two.
   */
  private slotFor(ev: DragEvent, index: number): number {
    const box = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const height = box.height || ROW_HEIGHT;
    return ev.clientY - box.top < height / 2 ? index : index + 1;
  }

  /**
   * Whether this drag is ours. `getData` is unreadable during `dragover` -- the browser
   * holds the store in protected mode -- so the index comes from the state set at
   * `dragstart` and the type list is what says the thing over the row is one of our rows.
   */
  private isOurs(ev: DragEvent): boolean {
    return (
      this.dragging !== null &&
      ev.dataTransfer?.types.includes(DRAG_TYPE) === true
    );
  }

  private onDragOver(ev: DragEvent, index: number): void {
    if (!this.isOurs(ev)) return;
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
    this.dropAt = this.slotFor(ev, index);
  }

  private onDrop(ev: DragEvent, index: number): void {
    const from = this.dragging;
    if (from === null) return;
    ev.preventDefault();
    this.reorder(from, this.slotFor(ev, index));
    this.onDragEnd();
  }

  /** Alt+Up/Down does what a drag does, for anyone not holding a mouse. */
  private onRowKeydown(ev: KeyboardEvent, index: number): void {
    if (!ev.altKey || (ev.key !== "ArrowUp" && ev.key !== "ArrowDown")) return;
    ev.preventDefault();
    this.reorder(index, ev.key === "ArrowUp" ? index - 1 : index + 2);
  }

  private addPreset(): void {
    const config = this.config;
    if (!config) return;
    this.blocked = null;
    const index = config.envelopes.length;
    this.emitChange(
      insertAt(
        config,
        ["envelopes"],
        index,
        newPreset(uniquePresetId(config, "preset")),
      ),
    );
    this.selected = index;
  }

  private removePreset(index: number): void {
    const config = this.config;
    if (!config) return;
    const preset = config.envelopes[index];
    if (!preset) return;
    const refs = presetReferences(config, preset.id);
    if (refs.defaults || refs.groups.length > 0) {
      this.selected = index;
      this.blocked = { id: preset.id, ...refs };
      return;
    }
    if (!window.confirm(`Delete envelope preset "${preset.id}"?`)) return;
    this.blocked = null;
    this.emitChange(removeAt(config, ["envelopes", index]));
    if (this.selected >= index && this.selected > 0) this.selected -= 1;
  }

  private onFormChanged(
    ev: CustomEvent<{ value?: Record<string, unknown> }>,
  ): void {
    ev.stopPropagation();
    const config = this.config;
    const index = this.selected;
    const preset = config?.envelopes[index];
    if (!config || !preset) return;
    const v = ev.detail?.value ?? {};
    const label = typeof v.label === "string" ? v.label : (preset.label ?? "");
    const merged: EnvelopePreset = {
      ...preset,
      // Blank is "no label": the list falls back to the id, and the document carries a
      // null rather than an empty string nobody can tell apart from an unset one.
      label: label.trim() === "" ? null : label,
      id: String(v.id ?? ""),
      attack:
        durationToSeconds(v.attack as HaDuration | undefined) ?? preset.attack,
      decay:
        durationToSeconds(v.decay as HaDuration | undefined) ?? preset.decay,
      sustain: typeof v.sustain === "number" ? v.sustain : preset.sustain,
      release:
        durationToSeconds(v.release as HaDuration | undefined) ??
        preset.release,
      impulse: typeof v.impulse === "boolean" ? v.impulse : preset.impulse,
    };
    const field = FORM_FIELDS.find((k) => merged[k] !== preset[k]);
    if (field === undefined) return;
    const path: Path = ["envelopes", index];
    // Rename first, so defaults.envelope and every stimulus follow the id in the same change.
    const next = setAt(renamePreset(config, index, merged.id), path, merged);
    this.emitChange(next, `${pathKey(path)}:${field}`);
  }

  private setOverride(name: PresetOverride, value: OverrideValue): void {
    const config = this.config;
    const index = this.selected;
    if (!config || !config.envelopes[index]) return;
    const path: Path = ["envelopes", index, name];
    this.emitChange(setAt(config, path, value), pathKey(path));
  }

  override render() {
    const config = this.config;
    if (!config)
      return html`<ha-card><span class="muted">Loading…</span></ha-card>`;
    return html`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(config)}</div>
        <div>${this.renderEditor(config)}</div>
      </div>
    `;
  }

  private renderList(config: Config) {
    const blocked = this.blocked;
    return html`
      <ha-card>
        <h3>Presets</h3>
        ${config.envelopes.map((preset, i) => this.renderPresetRow(config, preset, i))}
        ${config.envelopes.length === 0 ? html`<p class="muted">No presets yet.</p>` : nothing}
        ${blocked ? html`<ha-alert alert-type="warning">${describeBlocked(blocked)}</ha-alert>` : nothing}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }

  /**
   * One row of the preset list: a drag handle, the display name over the id it is filed
   * under, its error count, the "is this the default" checkbox and delete.
   */
  private renderPresetRow(config: Config, preset: EnvelopePreset, i: number) {
    const count = subtreeErrorCount(this.errors, ["envelopes", i]);
    const isDefault = config.defaults.envelope === preset.id;
    const drop =
      this.dragging === null || this.dropAt === null ? "" : this.dropClass(i);
    const classes = [
      "row",
      "preset",
      this.selected === i ? "selected" : "",
      this.dragging === i ? "dragging" : "",
      drop,
    ]
      .filter(Boolean)
      .join(" ");
    return html`<div
      class=${classes}
      data-index=${i}
      draggable="true"
      @dragstart=${(ev: DragEvent) => this.onDragStart(ev, i)}
      @dragend=${this.onDragEnd}
      @dragover=${(ev: DragEvent) => this.onDragOver(ev, i)}
      @drop=${(ev: DragEvent) => this.onDrop(ev, i)}
    >
      <ha-icon class="handle" icon="mdi:drag-horizontal-variant"></ha-icon>
      <button
        type="button"
        class="link grow names"
        title="Edit this preset"
        @click=${() => this.selectPreset(i)}
        @keydown=${(ev: KeyboardEvent) => this.onRowKeydown(ev, i)}
      >
        <span class="name"
          >${preset.id === "" && preset.label === null ? "(unnamed preset)" : presetLabel(preset)}</span
        >
        ${
          preset.label !== null && preset.label.trim() !== ""
            ? html`<span class="muted id">${preset.id}</span>`
            : nothing
        }
      </button>
      ${count ? html`<span class="badge" title="${count} problem(s)">${count}</span>` : nothing}
      <label
        class="default"
        title=${isDefault ? "This is the default preset" : "Set as default"}
      >
        <input
          type="checkbox"
          aria-label="Set as default"
          .checked=${isDefault}
          .disabled=${isDefault}
          draggable="false"
          @dragstart=${stop}
          @click=${stop}
          @change=${() => this.setDefault(i)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
        @dragstart=${stop}
        @click=${() => this.removePreset(i)}
      >
        <ha-icon icon="mdi:delete"></ha-icon>
      </ha-icon-button>
    </div>`;
  }

  /**
   * Which edge of row `i` wears the insertion line. A slot sits between two rows, so it
   * is drawn on the row above it unless it is past the end of the list.
   */
  private dropClass(i: number): string {
    const at = this.dropAt;
    const count = this.config?.envelopes.length ?? 0;
    if (at === null) return "";
    if (at === i) return "drop-before";
    if (at === i + 1 && at === count) return "drop-after";
    return "";
  }

  private renderEditor(config: Config) {
    const index = this.selected;
    const preset = config.envelopes[index];
    if (!preset)
      return html`<ha-card
        ><span class="muted">Select a preset.</span></ha-card
      >`;
    const path: Path = ["envelopes", index];
    const fields = fieldErrors(this.errors, path);
    const own = this.errors.filter((e) => e.path === pathKey(path));
    const data: Record<string, unknown> = {
      label: preset.label ?? "",
      id: preset.id,
      attack: secondsToDuration(preset.attack),
      decay: secondsToDuration(preset.decay),
      sustain: preset.sustain,
      release: secondsToDuration(preset.release),
      impulse: preset.impulse,
    };

    const idWarning = describeIdProblem(config, index, preset);

    return html`
      <ha-card header="Envelope preset">
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${idWarning ? html`<ha-alert alert-type="warning">${idWarning}</ha-alert>` : nothing}
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${SCHEMA}
          .error=${fields}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${preset}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${OVERRIDES.map(
          (item) =>
            html`<al-override-field
              .hass=${this.hass}
              .label=${item.label}
              .hint=${item.hint ?? ""}
              .kind=${item.kind}
              .selector=${item.kind === "boolean" ? BOOLEAN_SELECTOR : item.selector}
              .value=${preset[item.name] as OverrideValue}
              .inherited=${config.defaults[item.name] as OverrideValue}
              .inheritedFrom=${"defaults"}
              .error=${fields[item.name]}
              @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) =>
              this.setOverride(item.name, ev.detail.value)}
            ></al-override-field>`,
        )}
      </ha-card>
    `;
  }
}

/**
 * Flags an id that cannot address this preset: blank, or shared with another one. Saving
 * rejects both, but the warning lands while the id is still being typed - and a duplicate
 * is worth naming, since `renamePreset` deliberately stops following references while two
 * presets answer to the same id.
 */
function describeIdProblem(
  config: Config,
  index: number,
  preset: EnvelopePreset,
): string | null {
  if (preset.id.trim() === "")
    return "This preset needs an id before stimuli can name it.";
  if (config.envelopes.some((e, i) => i !== index && e.id === preset.id)) {
    return `Another preset already uses the id "${preset.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.`;
  }
  return null;
}

/** Explains, in one sentence, why a preset cannot be deleted yet. */
function describeBlocked(blocked: Blocked): string {
  const where: string[] = [];
  if (blocked.defaults) where.push("the defaults");
  if (blocked.groups.length > 0) {
    where.push(
      `group${blocked.groups.length > 1 ? "s" : ""} ${blocked.groups.join(", ")}`,
    );
  }
  return `"${blocked.id}" is still used by ${where.join(" and ")}. Point those at another preset first.`;
}

declare global {
  interface HTMLElementTagNameMap {
    "al-envelopes": AlEnvelopes;
  }
}
