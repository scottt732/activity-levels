import { describe, expect, it } from "vitest";
import { edgeLabels, entityStateText, stateLabel, stateOptions } from "../src/entity-states";
import type { HomeAssistant } from "../src/types";

/** The one translation this fake knows, so the fallback chain is visible in every other case. */
const DOOR_OPEN = "component.binary_sensor.entity_component.door.state.on";

const hass = (over: Partial<HomeAssistant> = {}): HomeAssistant =>
  ({
    states: {
      "binary_sensor.door": {
        entity_id: "binary_sensor.door",
        state: "on",
        attributes: { device_class: "door" },
        last_changed: "",
      },
      "media_player.tv": {
        entity_id: "media_player.tv",
        state: "playing",
        attributes: {},
        last_changed: "",
      },
    },
    localize: (key: string) => (key === DOOR_OPEN ? "Open" : ""),
    ...over,
  }) as unknown as HomeAssistant;

describe("stateLabel", () => {
  it("prefers the device-class translation", () => {
    expect(stateLabel(hass(), "binary_sensor.door", "on")).toBe("Open");
  });

  it("humanizes the state when nothing is translated", () => {
    expect(stateLabel(hass(), "media_player.tv", "playing")).toBe("Playing");
    expect(stateLabel(hass(), "device_tracker.phone", "not_home")).toBe("Not home");
  });

  it("survives a missing hass", () => {
    expect(stateLabel(undefined, "binary_sensor.door", "on")).toBe("On");
  });

  it("survives a hass with no localize, which is what a half-built one looks like", () => {
    const bare = { states: {} } as unknown as HomeAssistant;
    expect(stateLabel(bare, "binary_sensor.door", "on")).toBe("On");
    expect(stateOptions(bare, "binary_sensor.door", [])).toEqual([
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
    ]);
  });
});

describe("stateOptions", () => {
  it("offers the states of the domain, labelled", () => {
    expect(stateOptions(hass(), "binary_sensor.door", ["on"])).toEqual([
      { value: "on", label: "Open" },
      { value: "off", label: "Off" },
    ]);
  });

  it("keeps a configured state the table does not know", () => {
    const values = stateOptions(hass(), "media_player.tv", ["announcing"]).map((o) => o.value);
    expect(values).toContain("announcing");
    expect(values).toContain("playing");
  });

  it("keeps the current state of an entity from a domain it has never heard of", () => {
    const h = hass({
      states: {
        "foo.bar": { entity_id: "foo.bar", state: "wibbling", attributes: {}, last_changed: "" },
      },
    } as Partial<HomeAssistant>);
    expect(stateOptions(h, "foo.bar", [])).toEqual([{ value: "wibbling", label: "Wibbling" }]);
  });

  it("never repeats a state", () => {
    const values = stateOptions(hass(), "binary_sensor.door", ["on", "on", "off"]).map((o) => o.value);
    expect(values).toEqual([...new Set(values)]);
  });

  it("is empty rather than broken for an entity that is not there at all", () => {
    expect(stateOptions(hass(), "foo.missing", [])).toEqual([]);
  });
});

describe("entityStateText", () => {
  it("prefers the frontend's own formatter", () => {
    expect(entityStateText(hass({ formatEntityState: () => "Ouvert" }), "binary_sensor.door")).toBe(
      "Ouvert",
    );
  });

  it("falls back to the localized state", () => {
    expect(entityStateText(hass(), "binary_sensor.door")).toBe("Open");
  });

  it("falls back again to the humanized state", () => {
    expect(entityStateText(hass(), "media_player.tv")).toBe("Playing");
  });

  it("is null for an entity that is not there", () => {
    expect(entityStateText(hass(), "binary_sensor.nope")).toBeNull();
    expect(entityStateText(undefined, "binary_sensor.door")).toBeNull();
  });
});

describe("edgeLabels", () => {
  it("names the state when exactly one is active", () => {
    expect(edgeLabels(hass(), "binary_sensor.door", ["on"])).toEqual({
      enter: "When it becomes Open",
      leave: "When it stops being Open",
    });
  });

  it("stays generic when several states are active", () => {
    expect(edgeLabels(hass(), "media_player.tv", ["playing", "buffering"])).toEqual({
      enter: "When it enters the active states",
      leave: "When it leaves them",
    });
  });

  it("stays generic when none are", () => {
    expect(edgeLabels(hass(), "binary_sensor.door", []).enter).toBe(
      "When it enters the active states",
    );
  });
});
