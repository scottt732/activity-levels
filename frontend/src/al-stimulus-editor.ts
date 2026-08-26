import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { emptyToNull, formatToList, parseToList } from "./convert";
import { fieldErrors, pathKey } from "./errors";
import { alChange } from "./events";
import { groupAt, parentGroupPath, presetById, resolvedEnvelope, stimulusAt } from "./model";
import { setAt } from "./store";
import { sharedStyles } from "./styles";
import "./al-override-field";
import { BOOLEAN_SELECTOR } from "./al-override-field";
import type { Selector } from "./al-override-field";
import type { OverrideKind, OverrideValue } from "./convert";
import type { PropertyValues } from "lit";
import type {
  Config,
  EnvelopeOverrides,
  HomeAssistant,
  LiveState,
  Path,
  Stimulus,
  ValidationError,
} from "./types";

interface FormItem {
  name: string;
  selector: Selector;
}

const LABELS: Record<string, string> = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset",
};

const HELPERS: Record<string, string> = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from.",
};

/** Fields the top form owns, checked in order to name the coalescing key. */
const FORM_FIELDS: (keyof Stimulus)[] = ["entity", "gain", "key", "envelope"];

const DURATION_SELECTOR: Selector = { duration: {} };
const SUSTAIN_SELECTOR: Selector = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } };
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

interface OverrideItem {
  name: keyof EnvelopeOverrides;
  label: string;
  kind: OverrideKind;
  selector: Selector;
}

const OVERRIDES: OverrideItem[] = [
  { name: "attack", label: "Attack", kind: "duration", selector: DURATION_SELECTOR },
  { name: "decay", label: "Decay", kind: "duration", selector: DURATION_SELECTOR },
  { name: "sustain", label: "Sustain", kind: "number", selector: SUSTAIN_SELECTOR },
  { name: "release", label: "Release", kind: "duration", selector: DURATION_SELECTOR },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: BOOLEAN_SELECTOR },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: RETRIGGER_SELECTOR },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: UNAVAILABLE_SELECTOR },
  { name: "debounce", label: "Debounce", kind: "duration", selector: DURATION_SELECTOR },
];

/** Editor for one stimulus: what triggers it, and its envelope overrides. */
@customElement("al-stimulus-editor")
export class AlStimulusEditor extends LitElement {
  static styles = [
    sharedStyles,
    css`
      h3 {
        margin: 16px 0 8px;
        font-size: 1em;
      }
      .live {
        margin-top: 8px;
      }
      .chip {
        white-space: nowrap;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) path: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) live: LiveState | null = null;

  /**
   * Raw text of the "Active states" field while it is being edited. `formatToList` is lossy
   * mid-word - a trailing separator in `on, playing,` parses back to `on, playing` - so rendering
   * the parsed list on every keystroke would eat the separator and make a second state
   * untypeable. `null` means "not being edited": show the config's value.
   */
  @state() private toText: string | null = null;

  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !changed.has("config")) return;
    const { config, path } = this;
    const stimulus = config && path ? stimulusAt(config, path) : undefined;
    if (!stimulus) return;
    if (formatToList(stimulus.to) !== formatToList(parseToList(this.toText))) this.toText = null;
  }

  private computeLabel = (item: FormItem): string => LABELS[item.name] ?? item.name;
  private computeHelper = (item: FormItem): string => HELPERS[item.name] ?? "";

  private emitChange(next: Config, coalesceKey?: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  private schemaFor(config: Config): FormItem[] {
    const options = [
      { value: "", label: "(default preset)" },
      ...config.envelopes.map((e) => ({ value: e.id, label: e.id })),
    ];
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "to", selector: { text: {} } },
      { name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } },
      { name: "key", selector: { text: {} } },
      { name: "envelope", selector: { select: { mode: "dropdown", options } } },
    ];
  }

  private onFormChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const { config, path } = this;
    if (!config || !path) return;
    const stimulus = stimulusAt(config, path);
    if (!stimulus) return;
    const v = ev.detail?.value ?? {};
    const toText = String(v.to ?? "");
    this.toText = toText;
    const merged: Stimulus = {
      ...stimulus,
      entity: String(v.entity ?? ""),
      to: parseToList(toText),
      gain: typeof v.gain === "number" ? v.gain : stimulus.gain,
      key: emptyToNull(v.key as string | null | undefined),
      envelope: emptyToNull(v.envelope as string | null | undefined),
    };
    const field =
      formatToList(merged.to) !== formatToList(stimulus.to)
        ? "to"
        : FORM_FIELDS.find((k) => merged[k] !== stimulus[k]);
    if (field === undefined) return;
    this.emitChange(setAt(config, path, merged), `${pathKey(path)}:${field}`);
  }

  private setOverride(name: keyof EnvelopeOverrides, value: OverrideValue): void {
    const { config, path } = this;
    if (!config || !path) return;
    this.emitChange(setAt(config, [...path, name], value), `${pathKey(path)}:${name}`);
  }

  /** Where the effective value comes from when the stimulus does not override it. */
  private sourceOf(config: Config, stimulus: Stimulus, name: keyof EnvelopeOverrides): string {
    const preset = presetById(config, stimulus.envelope);
    if (!preset) return "defaults";
    return preset[name] === null || preset[name] === undefined
      ? "defaults"
      : (stimulus.envelope ?? config.defaults.envelope);
  }

  override render() {
    const { config, path } = this;
    if (!config || !path || path.length < 3)
      return html`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const stimulus = stimulusAt(config, path);
    if (!stimulus) return html`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;

    const group = groupAt(config, parentGroupPath(path));
    const fields = fieldErrors(this.errors, path);
    const own = this.errors.filter((e) => e.path === pathKey(path));
    const resolved = resolvedEnvelope(config, stimulus);
    const data: Record<string, unknown> = {
      entity: stimulus.entity,
      to: this.toText ?? formatToList(stimulus.to),
      gain: stimulus.gain,
      key: stimulus.key ?? "",
      envelope: stimulus.envelope ?? "",
    };
    const voice = this.live?.voices[group?.id ?? ""]?.find(
      (v) => v.label === (stimulus.key ?? stimulus.entity),
    );

    return html`
      <ha-card header="Stimulus">
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${this.schemaFor(config)}
          .error=${fields}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${voice
          ? html`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip">${voice.phase}</span>
              <span class="chip">${voice.value.toFixed(2)}</span>
              <span class="dot ${voice.gate ? "gated" : ""}" title=${voice.gate ? "Gate open" : "Gate closed"}></span>
            </div>`
          : nothing}

        <h3>Envelope overrides</h3>
        ${OVERRIDES.map(
          (item) => html`<al-override-field
            .hass=${this.hass}
            .label=${item.label}
            .kind=${item.kind}
            .selector=${item.selector}
            .value=${stimulus[item.name] as OverrideValue}
            .inherited=${resolved[item.name] as OverrideValue}
            .inheritedFrom=${this.sourceOf(config, stimulus, item.name)}
            .error=${fields[item.name]}
            @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) =>
              this.setOverride(item.name, ev.detail.value)}
          ></al-override-field>`,
        )}
        <!-- TODO(task 6): render <al-envelope-sketch> for the resolved envelope here. -->
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-stimulus-editor": AlStimulusEditor;
  }
}
