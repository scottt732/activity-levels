import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-people-editor";
import { presenceConfig } from "./fixtures";
import type { AlPeopleEditor } from "../src/al-people-editor";
import type { AlChangeEvent } from "../src/events";
import type { HomeAssistant, PresenceState } from "../src/types";

let el: AlPeopleEditor;
let changes: AlChangeEvent[];

type Field = HTMLElement & { value?: unknown; selector?: unknown };

const field = (selector: string): Field => el.shadowRoot!.querySelector<Field>(selector)!;

const change = (node: HTMLElement, value: unknown): Promise<void> => {
  node.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  return el.updateComplete.then(() => undefined);
};

const state = (): PresenceState => ({
  bermuda: true,
  enabled: true,
  people: {
    Scott: {
      t: 1,
      room: "kitchen",
      confidence: 0.9,
      moving: false,
      candidates: {},
      path: [],
      person: null,
      carried: { phone: 0.9 },
      device_rooms: { phone: "kitchen" },
      devices: {
        phone: {
          name: "Phone",
          kind: "phone",
          tracker: "device_tracker.scotts_phone",
          companion: "device_tracker.scotts_iphone",
          room: "kitchen",
          confidence: 0.9,
          carried: 0.9,
          signals: { activity: "sensor.scotts_iphone_activity", steps: null, battery_state: null },
          found: { activity: true, steps: false, battery_state: false },
        },
      },
    },
  },
  devices: {},
  occupants: {},
  scanners: [],
  unmapped: [],
  disabled: [],
});

beforeEach(async () => {
  document.body.innerHTML = "";
  changes = [];
  el = document.createElement("al-people-editor");
  el.hass = { states: {}, areas: {}, entities: {}, language: "en", localize: (k: string) => k } as unknown as HomeAssistant;
  el.config = presenceConfig();
  el.errors = [];
  el.presence = state();
  el.addEventListener("al-change", (e) => changes.push(e as AlChangeEvent));
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-people-editor", () => {
  it("shows a card per person with their devices", () => {
    expect(el.shadowRoot!.querySelectorAll(".person")).toHaveLength(1);
    expect(field(".person-name").value).toBe("Scott");
    expect(el.shadowRoot!.querySelectorAll(".device")).toHaveLength(1);
    expect(field(".tracker").value).toBe("device_tracker.scotts_phone");
    expect(field(".kind").value).toBe("phone");
    expect(field(".tracker").selector).toEqual({
      entity: { filter: { domain: "device_tracker", integration: "bermuda" } },
    });
    expect(field(".companion").selector).toEqual({
      entity: { filter: { domain: "device_tracker", integration: "mobile_app" } },
    });
    expect(field(".person-entity").selector).toEqual({ entity: { filter: { domain: "person" } } });
  });

  it("writes a person's name and person entity into presence.people", async () => {
    await change(field(".person-entity"), "person.scott");
    expect(changes.at(-1)!.detail.presence!.people[0]!.person).toBe("person.scott");
    expect(changes.at(-1)!.coalesceKey).toBe("presence:people:0:person");
    await change(field(".person-name"), "");
    expect(changes.at(-1)!.detail.presence!.people[0]!.name).toBeNull();
  });

  it("edits a device's kind, companion and one signal", async () => {
    await change(field(".kind"), "watch");
    expect(changes.at(-1)!.detail.presence!.people[0]!.devices[0]!.kind).toBe("watch");
    await change(field(".companion"), "device_tracker.scotts_iphone");
    expect(changes.at(-1)!.detail.presence!.people[0]!.devices[0]!.companion).toBe(
      "device_tracker.scotts_iphone",
    );
    await change(field(".signal-steps ha-selector"), "sensor.scotts_iphone_steps");
    expect(changes.at(-1)!.detail.presence!.people[0]!.devices[0]!.signals).toEqual({
      activity: null,
      steps: "sensor.scotts_iphone_steps",
      battery_state: null,
    });
  });

  it("marks each signal found or not from the live state", () => {
    expect(el.shadowRoot!.querySelector(".signal-activity .found")).toBeTruthy();
    expect(el.shadowRoot!.querySelector(".signal-steps .missing")).toBeTruthy();
  });

  it("adds and removes people and devices as structural changes", async () => {
    (el.shadowRoot!.querySelector(".add-person") as HTMLElement).click();
    await el.updateComplete;
    expect(changes.at(-1)!.detail.presence!.people).toHaveLength(2);
    expect(changes.at(-1)!.structural).toBe(true);
    el.config = changes.at(-1)!.detail;
    await el.updateComplete;
    (el.shadowRoot!.querySelectorAll(".add-device")[1] as HTMLElement).click();
    await el.updateComplete;
    expect(changes.at(-1)!.detail.presence!.people[1]!.devices).toHaveLength(1);
    el.config = changes.at(-1)!.detail;
    await el.updateComplete;
    (el.shadowRoot!.querySelectorAll(".remove-device")[1] as HTMLElement).click();
    await el.updateComplete;
    expect(changes.at(-1)!.detail.presence!.people[1]!.devices).toHaveLength(0);
    expect(changes.at(-1)!.structural).toBe(true);
    (el.shadowRoot!.querySelectorAll(".remove-person")[1] as HTMLElement).click();
    await el.updateComplete;
    expect(changes.at(-1)!.detail.presence!.people).toHaveLength(1);
  });

  it("surfaces a pathed error beside its field", async () => {
    el.errors = [{ path: "presence/people/0/devices/0/tracker", message: "a tracker belongs to one person" }];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".device .error")!.textContent).toContain("one person");
  });
});
