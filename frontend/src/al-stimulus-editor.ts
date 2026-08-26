import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fieldErrors, pathKey } from "./errors";
import { alChange } from "./events";
import { groupAt, parentGroupPath, resolvedEnvelope, stimulusAt } from "./model";
import { setAt } from "./store";
import {
  OVERRIDES,
  changedStimulusField,
  mergeStimulus,
  overrideSource,
  phaseCountdown,
  stimulusData,
  stimulusHelper,
  stimulusLabel,
  stimulusSchema,
  toTextMatches,
} from "./stimulus-form";
import { sharedStyles } from "./styles";
import "./al-envelope-sketch";
import "./al-override-field";
import type { StimulusField } from "./stimulus-form";
import type { OverrideValue } from "./convert";
import type { PropertyValues } from "lit";
import type { Config, EnvelopeOverrides, HomeAssistant, LiveState, Path, ValidationError } from "./types";

const FIELDS: StimulusField[] = ["entity", "to", "gain", "key", "envelope"];

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
    if (!toTextMatches(stimulus.to, this.toText)) this.toText = null;
  }

  private emitChange(next: Config, coalesceKey?: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  private onFormChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const { config, path } = this;
    if (!config || !path) return;
    const stimulus = stimulusAt(config, path);
    if (!stimulus) return;
    const v = ev.detail?.value ?? {};
    this.toText = String(v.to ?? "");
    const merged = mergeStimulus(stimulus, v);
    const field = changedStimulusField(merged, stimulus);
    if (field === undefined) return;
    this.emitChange(setAt(config, path, merged), `${pathKey(path)}:${field}`);
  }

  private setOverride(name: keyof EnvelopeOverrides, value: OverrideValue): void {
    const { config, path } = this;
    if (!config || !path) return;
    this.emitChange(setAt(config, [...path, name], value), `${pathKey(path)}:${name}`);
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
    const voice = this.live?.voices[group?.id ?? ""]?.find(
      (v) => v.label === (stimulus.key ?? stimulus.entity),
    );
    const phaseEnds = phaseCountdown(this.live?.now, voice?.phase_ends);

    return html`
      <ha-card header="Stimulus">
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${stimulusData(stimulus, this.toText, FIELDS)}
          .schema=${stimulusSchema(config, FIELDS)}
          .error=${fields}
          .computeLabel=${stimulusLabel}
          .computeHelper=${stimulusHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${voice
          ? html`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip phase ${voice.phase}">${voice.phase}</span>
              <span class="chip">${voice.value.toFixed(2)}</span>
              ${phaseEnds !== null
                ? html`<span class="muted chip">ends in ${phaseEnds}</span>`
                : nothing}
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
            .inheritedFrom=${overrideSource(config, stimulus, item.name)}
            .error=${fields[item.name]}
            @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) =>
              this.setOverride(item.name, ev.detail.value)}
          ></al-override-field>`,
        )}
        <h3>Envelope shape</h3>
        <al-envelope-sketch .envelope=${resolved}></al-envelope-sketch>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-stimulus-editor": AlStimulusEditor;
  }
}
