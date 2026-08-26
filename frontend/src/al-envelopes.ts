import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { durationToSeconds, secondsToDuration } from "./duration";
import { fieldErrors, pathKey, subtreeErrorCount } from "./errors";
import { alChange } from "./events";
import { newPreset, presetReferences, renamePreset, uniquePresetId } from "./model";
import { insertAt, removeAt, setAt } from "./store";
import { sharedStyles } from "./styles";
import "./al-envelope-sketch";
import "./al-override-field";
import { BOOLEAN_SELECTOR } from "./al-override-field";
import type { Selector } from "./al-override-field";
import type { OverrideKind, OverrideValue } from "./convert";
import type { PropertyValues } from "lit";
import type { Config, EnvelopePreset, HaDuration, HomeAssistant, Path, ValidationError } from "./types";

interface FormItem {
  name: string;
  selector: Selector;
}

const LABELS: Record<string, string> = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse",
};

const HELPERS: Record<string, string> = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the sustain level back to zero.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release.",
};

/** Fields the top form owns, checked in order to name the coalescing key. */
const FORM_FIELDS: (keyof EnvelopePreset)[] = ["id", "attack", "decay", "sustain", "release", "impulse"];

/** Milliseconds stay on: the backend takes sub-second debounce, wake and A/D/R values,
 * and a selector without the field would silently drop the `milliseconds` we hand it. */
const DURATION_SELECTOR: Selector = { duration: { enable_millisecond: true } };
const SUSTAIN_SELECTOR: Selector = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } };
const IMPULSE_SELECTOR: Selector = { boolean: {} };
const RETRIGGER_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" },
    ],
  },
};
const UNAVAILABLE_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" },
    ],
  },
};

const SCHEMA: FormItem[] = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: DURATION_SELECTOR },
  { name: "decay", selector: DURATION_SELECTOR },
  { name: "sustain", selector: SUSTAIN_SELECTOR },
  { name: "release", selector: DURATION_SELECTOR },
  { name: "impulse", selector: IMPULSE_SELECTOR },
];

/** The preset fields that may be left unset, falling through to `defaults`. */
type PresetOverride = "retrigger" | "unavailable" | "debounce";

interface OverrideItem {
  name: PresetOverride;
  label: string;
  kind: OverrideKind;
  selector: Selector;
}

const OVERRIDES: OverrideItem[] = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: RETRIGGER_SELECTOR },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: UNAVAILABLE_SELECTOR },
  { name: "debounce", label: "Debounce", kind: "duration", selector: DURATION_SELECTOR },
];

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
      }
      .preset.selected {
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
        --mdc-icon-button-size: 32px;
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

  private computeLabel = (item: FormItem): string => LABELS[item.name] ?? item.name;
  private computeHelper = (item: FormItem): string => HELPERS[item.name] ?? "";

  private emitChange(next: Config, coalesceKey?: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  private selectPreset(index: number): void {
    this.selected = index;
    this.blocked = null;
  }

  private addPreset(): void {
    const config = this.config;
    if (!config) return;
    this.blocked = null;
    const index = config.envelopes.length;
    this.emitChange(insertAt(config, ["envelopes"], index, newPreset(uniquePresetId(config, "preset"))));
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

  private onFormChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const config = this.config;
    const index = this.selected;
    const preset = config?.envelopes[index];
    if (!config || !preset) return;
    const v = ev.detail?.value ?? {};
    const merged: EnvelopePreset = {
      ...preset,
      id: String(v.id ?? ""),
      attack: durationToSeconds(v.attack as HaDuration | undefined) ?? preset.attack,
      decay: durationToSeconds(v.decay as HaDuration | undefined) ?? preset.decay,
      sustain: typeof v.sustain === "number" ? v.sustain : preset.sustain,
      release: durationToSeconds(v.release as HaDuration | undefined) ?? preset.release,
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
    if (!config) return html`<ha-card><span class="muted">Loading…</span></ha-card>`;
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
        ${config.envelopes.map((preset, i) => {
          const count = subtreeErrorCount(this.errors, ["envelopes", i]);
          return html`<div class="row preset ${this.selected === i ? "selected" : ""}">
            <button type="button" class="link grow" title="Edit this preset" @click=${() => this.selectPreset(i)}>
              ${preset.id || "(unnamed preset)"}
            </button>
            ${count ? html`<span class="badge" title="${count} problem(s)">${count}</span>` : nothing}
            <ha-icon-button label="Delete preset" title="Delete preset" @click=${() => this.removePreset(i)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>`;
        })}
        ${config.envelopes.length === 0 ? html`<p class="muted">No presets yet.</p>` : nothing}
        ${blocked ? html`<ha-alert alert-type="warning">${describeBlocked(blocked)}</ha-alert>` : nothing}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }

  private renderEditor(config: Config) {
    const index = this.selected;
    const preset = config.envelopes[index];
    if (!preset) return html`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const path: Path = ["envelopes", index];
    const fields = fieldErrors(this.errors, path);
    const own = this.errors.filter((e) => e.path === pathKey(path));
    const data: Record<string, unknown> = {
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
          (item) => html`<al-override-field
            .hass=${this.hass}
            .label=${item.label}
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
function describeIdProblem(config: Config, index: number, preset: EnvelopePreset): string | null {
  if (preset.id.trim() === "") return "This preset needs an id before stimuli can name it.";
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
    where.push(`group${blocked.groups.length > 1 ? "s" : ""} ${blocked.groups.join(", ")}`);
  }
  return `"${blocked.id}" is still used by ${where.join(" and ")}. Point those at another preset first.`;
}

declare global {
  interface HTMLElementTagNameMap {
    "al-envelopes": AlEnvelopes;
  }
}
