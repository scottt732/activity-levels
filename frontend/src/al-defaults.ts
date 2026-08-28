import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { durationToSeconds, secondsToDuration } from "./duration";
import { fieldErrors } from "./errors";
import { alChange } from "./events";
import { setAt } from "./store";
import { sharedStyles } from "./styles";
import {
  RETRIGGER_HELPER,
  RETRIGGER_LABEL,
  RETRIGGER_SELECTOR,
  STACK_HELPER,
  STACK_LABEL,
} from "./stimulus-form";
import type { Selector } from "./al-override-field";
import type {
  Config,
  Defaults,
  HaDuration,
  HomeAssistant,
  RetriggerWhen,
  Unavailable,
  ValidationError,
} from "./types";

interface FormItem {
  name: string;
  selector: Selector;
}

const LABELS: Record<string, string> = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: RETRIGGER_LABEL,
  stack: STACK_LABEL,
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval",
};

/** One line each, matching the configuration reference in the README. */
const HELPERS: Record<string, string> = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its trigger.",
  retrigger: RETRIGGER_HELPER,
  stack: STACK_HELPER,
  debounce: "Minimum time between triggers per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay.",
};

/** Fields the form owns, checked in order to name the coalescing key. */
const FORM_FIELDS: (keyof Defaults)[] = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "stack",
  "debounce",
  "safety_refresh",
  "min_wake_interval",
];

/** Milliseconds stay on: the backend takes sub-second debounce, wake and A/D/R values,
 * and a selector without the field would silently drop the `milliseconds` we hand it. */
const DURATION_SELECTOR: Selector = { duration: { enable_millisecond: true } };
const MAX_VALUE_SELECTOR: Selector = { number: { min: 0.1, step: 0.1, mode: "box" } };
const PRECISION_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((n) => ({ value: String(n), label: String(n) })),
  },
};
const STACK_SELECTOR: Selector = { boolean: {} };
const UNAVAILABLE_SELECTOR: Selector = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "End the trigger" },
    ],
  },
};

/** Site-wide fallbacks every group, preset and stimulus inherits from. */
@customElement("al-defaults")
export class AlDefaults extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) errors: ValidationError[] = [];

  private computeLabel = (item: FormItem): string => LABELS[item.name] ?? item.name;
  private computeHelper = (item: FormItem): string => HELPERS[item.name] ?? "";

  private schemaFor(config: Config): FormItem[] {
    const options = config.envelopes.map((e) => ({ value: e.id, label: e.id }));
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options } } },
      { name: "max_value", selector: MAX_VALUE_SELECTOR },
      { name: "precision", selector: PRECISION_SELECTOR },
      { name: "unavailable", selector: UNAVAILABLE_SELECTOR },
      { name: "retrigger", selector: RETRIGGER_SELECTOR },
      { name: "stack", selector: STACK_SELECTOR },
      { name: "debounce", selector: DURATION_SELECTOR },
      { name: "safety_refresh", selector: DURATION_SELECTOR },
      { name: "min_wake_interval", selector: DURATION_SELECTOR },
    ];
  }

  private onFormChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const config = this.config;
    if (!config) return;
    const d = config.defaults;
    const v = ev.detail?.value ?? {};
    const precision = Number(v.precision);
    const merged: Defaults = {
      envelope: typeof v.envelope === "string" && v.envelope !== "" ? v.envelope : d.envelope,
      max_value: typeof v.max_value === "number" ? v.max_value : d.max_value,
      precision: Number.isFinite(precision) ? precision : d.precision,
      unavailable: (v.unavailable as Unavailable | undefined) ?? d.unavailable,
      retrigger: (v.retrigger as RetriggerWhen | undefined) ?? d.retrigger,
      stack: typeof v.stack === "boolean" ? v.stack : d.stack,
      debounce: durationToSeconds(v.debounce as HaDuration | undefined) ?? d.debounce,
      safety_refresh: durationToSeconds(v.safety_refresh as HaDuration | undefined) ?? d.safety_refresh,
      min_wake_interval: durationToSeconds(v.min_wake_interval as HaDuration | undefined) ?? d.min_wake_interval,
    };
    const field = FORM_FIELDS.find((k) => merged[k] !== d[k]);
    if (field === undefined) return;
    this.emitChange(setAt(config, ["defaults"], merged), `defaults:${field}`);
  }

  private emitChange(next: Config, coalesceKey?: string): void {
    this.dispatchEvent(alChange(next, coalesceKey));
  }

  override render() {
    const config = this.config;
    if (!config) return html`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const d = config.defaults;
    const fields = fieldErrors(this.errors, ["defaults"]);
    const own = this.errors.filter((e) => e.path === "defaults");
    const data: Record<string, unknown> = {
      envelope: d.envelope,
      max_value: d.max_value,
      precision: String(d.precision),
      unavailable: d.unavailable,
      retrigger: d.retrigger,
      stack: d.stack,
      debounce: secondsToDuration(d.debounce),
      safety_refresh: secondsToDuration(d.safety_refresh),
      min_wake_interval: secondsToDuration(d.min_wake_interval),
    };

    return html`
      <div class="pad">
        <ha-card header="Defaults">
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
          <div class="muted note">
            Groups, presets and stimuli inherit these unless they set their own value.
          </div>
        </ha-card>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-defaults": AlDefaults;
  }
}
