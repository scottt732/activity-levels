import { describe, expect, it } from "vitest";
import { locate } from "../src/yaml-locate";

/** The example house, cut down to the shapes the backend's paths actually address. */
const DOC = `version: 1
defaults:
  envelope: default
  max_value: 5.0
  patterns:
    calendars:
      - id: vacation
        entity: calendar.school_holidays
envelopes:
  - id: default
    release: 30m
  - id: hour
    release: 1h
groups:
  - id: house
    kind: structure
    stimuli:
      - entity: binary_sensor.front_door
        gain: 2.0
    children:
      - id: kitchen
        kind: area
        adjacent:
          - hall
          - {id: back_patio, connection: exterior_door}
        stimuli:
          - entity: binary_sensor.kitchen_motion
presence:
  enabled: true
  devices:
    - device: device_tracker.phone
      name: Scott
`;

/** The 1-based line a path lands on, quoted back as text, so a failure reads plainly. */
const at = (path: string): string | null => {
  const line = locate(DOC, path);
  return line === null ? null : DOC.split("\n")[line - 1]!.trim();
};

describe("locate", () => {
  it("finds a top-level key", () => {
    expect(at("version")).toBe("version: 1");
    expect(at("groups")).toBe("groups:");
  });

  it("finds a nested key without being fooled by the same name elsewhere", () => {
    expect(at("defaults/envelope")).toBe("envelope: default");
    expect(at("defaults/max_value")).toBe("max_value: 5.0");
  });

  it("counts sequence items", () => {
    expect(at("envelopes/0/id")).toBe("- id: default");
    expect(at("envelopes/1/release")).toBe("release: 1h");
  });

  it("walks the recursive group tree", () => {
    expect(at("groups/0/id")).toBe("- id: house");
    expect(at("groups/0/children/0/kind")).toBe("kind: area");
    expect(at("groups/0/children/0/stimuli/0/entity")).toBe("- entity: binary_sensor.kitchen_motion");
  });

  it("tells the two stimulus lists apart", () => {
    expect(at("groups/0/stimuli/0/gain")).toBe("gain: 2.0");
    expect(at("groups/0/stimuli/0/entity")).toBe("- entity: binary_sensor.front_door");
  });

  it("finds a short-form sequence item, which is a whole line of its own", () => {
    expect(at("groups/0/children/0/adjacent/0")).toBe("- hall");
  });

  it("stops at the deepest line it can find rather than giving up", () => {
    // `connection` is inside a flow mapping, which this does not read into: the item's
    // own line is still a better answer than none.
    expect(at("groups/0/children/0/adjacent/1/connection")).toBe(
      "- {id: back_patio, connection: exterior_door}",
    );
    expect(at("defaults/patterns/calendars/0/entity")).toBe("entity: calendar.school_holidays");
  });

  it("returns null for a path that names nothing at all", () => {
    expect(locate(DOC, "nowhere")).toBeNull();
    expect(locate(DOC, "")).toBeNull();
  });

  it("looks past blank lines and comments", () => {
    const text = "groups:\n\n  # the house\n  - id: house\n    kind: structure\n";
    expect(locate(text, "groups/0/kind")).toBe(5);
  });

  it("does not confuse a deeper key for a sibling", () => {
    // `presence/enabled` is the top-level block's, not a group's.
    expect(locate(DOC, "presence/enabled")).toBe(DOC.split("\n").indexOf("  enabled: true") + 1);
    expect(at("presence/devices/0/name")).toBe("name: Scott");
  });

  it("handles quoted keys", () => {
    const text = 'presence:\n  scanner_areas:\n    "1a2b3c": kitchen\n';
    expect(locate(text, "presence/scanner_areas/1a2b3c")).toBe(3);
  });
});
