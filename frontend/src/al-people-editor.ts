import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fieldErrors } from "./errors";
import { alChange } from "./events";
import { newPresenceDevice, newPresencePerson, presenceSettings } from "./model";
import { setAt } from "./store";
import { sharedStyles } from "./styles";
import type { TemplateResult } from "lit";
import type { Selector } from "./al-override-field";
import type {
  Config,
  DeviceKind,
  HomeAssistant,
  PresenceDeviceConfig,
  PresencePerson,
  PresenceState,
  SignalRole,
  ValidationError,
} from "./types";
import { DEVICE_KINDS, SIGNAL_ROLES } from "./types";

/** What each device kind is drawn as, on the People card and in this editor. */
export const KIND_ICONS: Record<DeviceKind, string> = {
  phone: "mdi:cellphone",
  watch: "mdi:watch",
  tag: "mdi:tag",
  laptop: "mdi:laptop",
  other: "mdi:bluetooth",
};

export const KIND_LABELS: Record<DeviceKind, string> = {
  phone: "Phone",
  watch: "Watch",
  tag: "Tag",
  laptop: "Laptop",
  other: "Other",
};

export const SIGNAL_LABELS: Record<SignalRole, string> = {
  activity: "Activity",
  steps: "Steps",
  battery_state: "Battery state",
};

const TRACKER_SELECTOR: Selector = {
  entity: { filter: { domain: "device_tracker", integration: "bermuda" } },
};
const PERSON_SELECTOR: Selector = { entity: { filter: { domain: "person" } } };
const COMPANION_SELECTOR: Selector = {
  entity: { filter: { domain: "device_tracker", integration: "mobile_app" } },
};
const SIGNAL_SELECTOR: Selector = { entity: { filter: { domain: "sensor" } } };
const KIND_SELECTOR: Selector = {
  select: { mode: "dropdown", options: DEVICE_KINDS.map((kind) => ({ value: kind, label: KIND_LABELS[kind] })) },
};

/**
 * The People editor: who is followed, by which devices, with which companion sensors.
 *
 * A person is seeded from their `person.*` entity — every Bermuda tracker on it becomes
 * a device, a mobile_app tracker the companion — so the common case is picking the
 * person and leaving the rest blank. Everything here is the override for when the seed
 * gets it wrong: two phones, a watch with no app, a renamed sensor. The marks beside the
 * signal pickers come from the live state, so "found" means the coordinator can read it
 * right now, not that the picker holds a plausible id.
 */
@customElement("al-people-editor")
export class AlPeopleEditor extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .person {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      }
      .person-head,
      .device-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .person-head h4,
      .device-head h5 {
        margin: 0;
        flex: 1;
        font-weight: 600;
      }
      .device {
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
        margin-top: 8px;
      }
      .fields {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 8px;
      }
      .signal {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .signal ha-selector {
        flex: 1;
      }
      .found {
        color: var(--success-color, #4caf50);
      }
      .missing {
        color: var(--warning-color, #ffa600);
      }
      .error {
        color: var(--error-color);
        font-size: 0.85em;
      }
      .empty {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-bottom: 8px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) presence: PresenceState | null = null;

  private get people(): PresencePerson[] {
    return this.config ? presenceSettings(this.config).people : [];
  }

  private emit(people: PresencePerson[], key: string, structural = false): void {
    const config = this.config;
    if (!config) return;
    const settings = { ...presenceSettings(config), people };
    const next = setAt(config, ["presence"], settings);
    // Structural: the errors are keyed by `…/people/i/devices/j`, and a removal renumbers them.
    this.dispatchEvent(structural ? alChange(next, undefined, true) : alChange(next, `presence:people:${key}`));
  }

  private editPerson(index: number, patch: Partial<PresencePerson>, key: string): void {
    this.emit(
      this.people.map((person, i) => (i === index ? { ...person, ...patch } : person)),
      `${index}:${key}`,
    );
  }

  private editDevice(index: number, d: number, patch: Partial<PresenceDeviceConfig>, key: string): void {
    const person = this.people[index];
    if (!person) return;
    const devices = person.devices.map((device, i) => (i === d ? { ...device, ...patch } : device));
    this.emit(
      this.people.map((p, i) => (i === index ? { ...p, devices } : p)),
      `${index}:${d}:${key}`,
    );
  }

  private addPerson(): void {
    this.emit([...this.people, newPresencePerson()], "add", true);
  }

  private removePerson(index: number): void {
    this.emit(
      this.people.filter((_, i) => i !== index),
      "remove",
      true,
    );
  }

  private addDevice(index: number): void {
    const person = this.people[index];
    if (!person) return;
    this.editPerson(index, { devices: [...person.devices, newPresenceDevice("")] }, "add-device");
  }

  private removeDevice(index: number, d: number): void {
    const person = this.people[index];
    if (!person) return;
    this.emit(
      this.people.map((p, i) => (i === index ? { ...p, devices: p.devices.filter((_, j) => j !== d) } : p)),
      `${index}:remove-device`,
      true,
    );
  }

  /** What the coordinator found for this device, if it reported on it at all. */
  private found(person: PresencePerson, device: PresenceDeviceConfig): Record<string, boolean> | null {
    // `people` is optional-chained too: a state from before people had devices has none
    const rows = person.name === null ? [] : Object.values(this.presence?.people?.[person.name]?.devices ?? {});
    const row = rows.find((r) => r.tracker === device.tracker);
    return row ? row.found : null;
  }

  private text(value: string | null): string {
    return value ?? "";
  }

  private renderSignal(
    index: number,
    d: number,
    device: PresenceDeviceConfig,
    role: SignalRole,
    found: Record<string, boolean> | null,
    errors: Record<string, string>,
  ): TemplateResult {
    const mark =
      found === null
        ? nothing
        : found[role]
          ? html`<ha-icon class="found" icon="mdi:check-circle-outline" title="Found"></ha-icon>`
          : html`<ha-icon class="missing" icon="mdi:alert-circle-outline" title="Not found"></ha-icon>`;
    return html`<div class="signal signal-${role}">
      <ha-selector
        .hass=${this.hass}
        .selector=${SIGNAL_SELECTOR}
        .label=${SIGNAL_LABELS[role]}
        .helper=${device.companion ? "Blank: found on the companion device." : ""}
        .required=${false}
        .value=${this.text(device.signals[role])}
        @value-changed=${(ev: CustomEvent<{ value?: string }>) =>
          this.editDevice(
            index,
            d,
            { signals: { ...device.signals, [role]: ev.detail.value ? ev.detail.value : null } },
            role,
          )}
      ></ha-selector>
      ${mark}
      ${errors[role] ? html`<div class="error">${errors[role]}</div>` : nothing}
    </div>`;
  }

  private renderDevice(index: number, d: number, person: PresencePerson, device: PresenceDeviceConfig): TemplateResult {
    const errors = fieldErrors(this.errors, ["presence", "people", index, "devices", d]);
    const signalErrors = fieldErrors(this.errors, ["presence", "people", index, "devices", d, "signals"]);
    const found = this.found(person, device);
    return html`<div class="device">
      <div class="device-head">
        <ha-icon icon=${KIND_ICONS[device.kind]}></ha-icon>
        <h5>${device.name ?? (device.tracker || "New device")}</h5>
        <ha-icon-button
          class="remove-device"
          label="Remove device"
          @click=${() => this.removeDevice(index, d)}
          ><ha-icon icon="mdi:close"></ha-icon
        ></ha-icon-button>
      </div>
      <div class="fields">
        <ha-selector
          class="tracker"
          .hass=${this.hass}
          .selector=${TRACKER_SELECTOR}
          .label=${"Bermuda tracker"}
          .required=${true}
          .value=${device.tracker}
          @value-changed=${(ev: CustomEvent<{ value?: string }>) =>
            this.editDevice(index, d, { tracker: ev.detail.value ?? "" }, "tracker")}
        ></ha-selector>
        ${errors.tracker ? html`<div class="error">${errors.tracker}</div>` : nothing}
        <ha-selector
          class="device-name"
          .hass=${this.hass}
          .selector=${{ text: {} }}
          .label=${"Name"}
          .helper=${"Blank: the Bermuda device's name."}
          .required=${false}
          .value=${this.text(device.name)}
          @value-changed=${(ev: CustomEvent<{ value?: string }>) =>
            this.editDevice(index, d, { name: ev.detail.value ? ev.detail.value : null }, "name")}
        ></ha-selector>
        <ha-selector
          class="kind"
          .hass=${this.hass}
          .selector=${KIND_SELECTOR}
          .label=${"Kind"}
          .required=${true}
          .value=${device.kind}
          @value-changed=${(ev: CustomEvent<{ value?: DeviceKind }>) =>
            this.editDevice(index, d, { kind: ev.detail.value ?? "other" }, "kind")}
        ></ha-selector>
        <ha-selector
          class="companion"
          .hass=${this.hass}
          .selector=${COMPANION_SELECTOR}
          .label=${"Companion app tracker"}
          .helper=${"The mobile_app device_tracker of the same phone; its sensors say whether it is carried."}
          .required=${false}
          .value=${this.text(device.companion)}
          @value-changed=${(ev: CustomEvent<{ value?: string }>) =>
            this.editDevice(index, d, { companion: ev.detail.value ? ev.detail.value : null }, "companion")}
        ></ha-selector>
        ${SIGNAL_ROLES.map((role) => this.renderSignal(index, d, device, role, found, signalErrors))}
      </div>
    </div>`;
  }

  private renderPerson(index: number, person: PresencePerson): TemplateResult {
    const errors = fieldErrors(this.errors, ["presence", "people", index]);
    return html`<div class="person">
      <div class="person-head">
        <ha-icon icon="mdi:account"></ha-icon>
        <h4>${person.name ?? person.devices[0]?.name ?? person.person ?? "New person"}</h4>
        <ha-icon-button class="remove-person" label="Remove person" @click=${() => this.removePerson(index)}
          ><ha-icon icon="mdi:close"></ha-icon
        ></ha-icon-button>
      </div>
      <div class="fields">
        <ha-selector
          class="person-name"
          .hass=${this.hass}
          .selector=${{ text: {} }}
          .label=${"Name"}
          .helper=${"Blank: the first device's name. Entities are keyed off it."}
          .required=${false}
          .value=${this.text(person.name)}
          @value-changed=${(ev: CustomEvent<{ value?: string }>) =>
            this.editPerson(index, { name: ev.detail.value ? ev.detail.value : null }, "name")}
        ></ha-selector>
        ${errors.name ? html`<div class="error">${errors.name}</div>` : nothing}
        <ha-selector
          class="person-entity"
          .hass=${this.hass}
          .selector=${PERSON_SELECTOR}
          .label=${"Person"}
          .helper=${"Its device_trackers seed the devices below: Bermuda ones to follow, a mobile_app one as the companion."}
          .required=${false}
          .value=${this.text(person.person)}
          @value-changed=${(ev: CustomEvent<{ value?: string }>) =>
            this.editPerson(index, { person: ev.detail.value ? ev.detail.value : null }, "person")}
        ></ha-selector>
        ${errors.person ? html`<div class="error">${errors.person}</div>` : nothing}
      </div>
      ${person.devices.map((device, d) => this.renderDevice(index, d, person, device))}
      <ha-button class="add-device" @click=${() => this.addDevice(index)}>Add device</ha-button>
    </div>`;
  }

  override render() {
    if (!this.config) return nothing;
    const people = this.people;
    return html`
      ${people.length === 0
        ? html`<div class="empty">Nobody is followed yet. Add a person and pick their person entity.</div>`
        : nothing}
      ${people.map((person, index) => this.renderPerson(index, person))}
      <ha-button class="add-person" @click=${() => this.addPerson()}>Add person</ha-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-people-editor": AlPeopleEditor;
  }
}
