import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fieldErrors, pathKey } from "./errors";
import { alChange } from "./events";
import { groupAt, newPresenceOverrides, presenceSettings, resolvedEnvelope } from "./model";
import { GAIN_SELECTOR, OVERRIDES, envelopeOptions } from "./stimulus-form";
import { setAt } from "./store";
import { sharedStyles } from "./styles";
import "./al-envelope-sketch";
import "./al-override-field";
import type { OverrideValue } from "./convert";
import type { Selector } from "./al-override-field";
import type { Config, HomeAssistant, Path, ValidationError } from "./types";

/** Mirrors `schema.py`: open at zero, closed at one. */
const ACTIVITY_FLOOR_SELECTOR: Selector = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } };

/**
 * A group's presence channel: a stimulus with no entity, fed by the room estimate rather
 * than by a sensor, so there is nothing to point it at - but its preset, its gain and its
 * envelope are tuned like any other channel's.
 *
 * It is one element because both surfaces show it: the Groups editor's Presence panel and
 * the mixer's controls row. They used to carry a copy each, and the copies had already
 * drifted apart over which of them drew the envelope sketch.
 */
@customElement("al-presence-overrides")
export class AlPresenceOverrides extends LitElement {
  static styles = [sharedStyles];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) path: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];

  /** One override, written as a whole block so a config that predates presence fills in. */
  private setPresence(name: string, value: unknown): void {
    const { config, path } = this;
    if (!config || !path) return;
    const group = groupAt(config, path);
    if (!group) return;
    const next = setAt(config, [...path, "presence"], {
      ...(group.presence ?? newPresenceOverrides()),
      [name]: value,
    });
    this.dispatchEvent(alChange(next, `${pathKey(path)}:presence:${name}`));
  }

  override render() {
    const { config, path } = this;
    const group = config && path ? groupAt(config, path) : undefined;
    if (!config || !path || !group) return nothing;
    const overrides = group.presence ?? newPresenceOverrides();
    const preset = overrides.envelope ?? presenceSettings(config).envelope;
    const resolved = resolvedEnvelope(config, { ...overrides, envelope: preset });
    const errors = fieldErrors(this.errors, [...path, "presence"]);
    return html`
      <ha-selector
        class="presence-envelope"
        .hass=${this.hass}
        .selector=${{ select: { mode: "dropdown", options: envelopeOptions(config) } }}
        .label=${"Envelope preset"}
        .required=${false}
        .value=${overrides.envelope ?? ""}
        @value-changed=${(ev: CustomEvent<{ value: string }>) =>
          this.setPresence("envelope", ev.detail.value === "" ? null : ev.detail.value)}
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
          this.setPresence("gain", ev.detail.value ?? 1)}
      ></al-override-field>
      <al-override-field
        class="presence-activity_floor"
        .hass=${this.hass}
        label="Empty-room floor"
        hint="Likelihood of this room at an activity level of 0.0. Set 1 for a room people sleep in: a still sleeper trips no motion, and the estimator must not read that as an empty room."
        kind="number"
        .selector=${ACTIVITY_FLOOR_SELECTOR}
        .value=${overrides.activity_floor}
        .inherited=${presenceSettings(config).activity.floor}
        .inheritedFrom=${"presence"}
        .error=${errors.activity_floor}
        @value-changed=${(ev: CustomEvent<{ value: number | null }>) =>
          this.setPresence("activity_floor", ev.detail.value ?? null)}
      ></al-override-field>
      ${OVERRIDES.map(
        (item) => html`<al-override-field
          class="presence-${item.name}"
          .hass=${this.hass}
          .label=${item.label}
          .hint=${item.hint ?? ""}
          .kind=${item.kind}
          .selector=${item.selector}
          .value=${overrides[item.name] as OverrideValue}
          .inherited=${resolved[item.name] as OverrideValue}
          .inheritedFrom=${preset ?? "defaults"}
          .error=${errors[item.name]}
          @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) =>
            this.setPresence(item.name, ev.detail.value)}
        ></al-override-field>`,
      )}
      <al-envelope-sketch .envelope=${resolved}></al-envelope-sketch>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-presence-overrides": AlPresenceOverrides;
  }
}
