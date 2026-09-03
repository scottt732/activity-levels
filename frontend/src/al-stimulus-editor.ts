import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fieldErrors, pathKey } from "./errors";
import { alChange } from "./events";
import { groupAt, parentGroupPath, resolvedEnvelope, stimulusAt } from "./model";
import { renderPanel } from "./panels";
import { setAt } from "./store";
import {
  ENVELOPE_DEFINITION,
  ENVELOPE_FIELDS,
  MOMENTARY_PINNED_HINT,
  OVERRIDES,
  OVERRIDES_DEFINITION,
  SOURCE_DEFINITION,
  changedStimulusField,
  mergeStimulus,
  overrideDisabled,
  overriddenCount,
  overrideSource,
  phaseCountdown,
  stimulusData,
  stimulusHelper,
  stimulusLabel,
  stimulusSchema,
  visibleSourceFields,
} from "./stimulus-form";
import { sharedStyles } from "./styles";
import "./al-envelope-sketch";
import "./al-override-field";
import type { OverrideItem } from "./stimulus-form";
import type { OverrideValue } from "./convert";
import type { TemplateResult } from "lit";
import type {
  Config,
  EnvelopeOverrides,
  HomeAssistant,
  LiveState,
  Path,
  Stimulus,
  ValidationError,
  VoiceLive,
} from "./types";

/** Editor for one stimulus: what triggers it, and its envelope overrides. */
@customElement("al-stimulus-editor")
export class AlStimulusEditor extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .live {
        margin-top: 8px;
      }
      .chip {
        white-space: nowrap;
      }
      /* Base shape of a badge; the .panel-header .badge rule in the shared styles gives it
         the neutral colour a count of overrides deserves, as opposed to a count of problems. */
      .badge {
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.75em;
        line-height: 1.6;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) path: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) live: LiveState | null = null;

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

  /** The live-voice chips: phase, value, time left in the phase and the gate dot. */
  private renderLive(voice: VoiceLive | undefined, phaseEnds: string | null): TemplateResult | typeof nothing {
    if (!voice) return nothing;
    return html`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${voice.phase}">${voice.phase}</span>
      <span class="chip">${voice.value.toFixed(2)}</span>
      ${phaseEnds !== null ? html`<span class="muted chip">ends in ${phaseEnds}</span>` : nothing}
      <span class="dot ${voice.gate ? "gated" : ""}" title=${voice.gate ? "Gate open" : "Gate closed"}></span>
    </div>`;
  }

  /** One override field, bound to the stimulus, the resolved preset and its errors. */
  private renderOverride(
    item: OverrideItem,
    stimulus: Stimulus,
    resolved: EnvelopeOverrides,
    fields: Record<string, string>,
  ): TemplateResult {
    const { config } = this;
    // A momentary trigger's attack, decay and impulse belong to the mode, not to
    // the stimulus. They stay on screen, pinned and explained, rather than vanishing.
    const disabled = overrideDisabled(stimulus, item.name);
    return html`<al-override-field
      .hass=${this.hass}
      .label=${item.label}
      .disabled=${disabled}
      .hint=${disabled ? MOMENTARY_PINNED_HINT : (item.hint ?? "")}
      .kind=${item.kind}
      .selector=${item.selector}
      .value=${stimulus[item.name] as OverrideValue}
      .inherited=${resolved[item.name] as OverrideValue}
      .inheritedFrom=${config ? overrideSource(config, stimulus, item.name) : "defaults"}
      .error=${fields[item.name]}
      @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) => this.setOverride(item.name, ev.detail.value)}
    ></al-override-field>`;
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
    const overridden = overriddenCount(stimulus);

    return html`
      <ha-card header="Stimulus">
        ${own.map((e) => html`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${renderPanel(
          "stimulus",
          "source",
          "Source",
          SOURCE_DEFINITION,
          true,
          html`
            <ha-form
              .hass=${this.hass}
              .data=${stimulusData(stimulus, visibleSourceFields(stimulus))}
              .schema=${stimulusSchema(config, stimulus, this.hass, visibleSourceFields(stimulus))}
              .error=${fields}
              .computeLabel=${stimulusLabel}
              .computeHelper=${stimulusHelper}
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `,
        )}
        ${renderPanel(
          "stimulus",
          "envelope",
          "Envelope",
          ENVELOPE_DEFINITION,
          true,
          html`
            <ha-form
              .hass=${this.hass}
              .data=${stimulusData(stimulus, ENVELOPE_FIELDS)}
              .schema=${stimulusSchema(config, stimulus, this.hass, ENVELOPE_FIELDS)}
              .error=${fields}
              .computeLabel=${stimulusLabel}
              .computeHelper=${stimulusHelper}
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(voice, phaseEnds)}
            <al-envelope-sketch .envelope=${resolved}></al-envelope-sketch>
          `,
        )}
        ${renderPanel(
          "stimulus",
          "overrides",
          "Override preset",
          OVERRIDES_DEFINITION,
          false,
          OVERRIDES.map((item) => this.renderOverride(item, stimulus, resolved, fields)),
          overridden === 0 ? nothing : html`<span class="badge">${overridden} overridden</span>`,
        )}
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-stimulus-editor": AlStimulusEditor;
  }
}
