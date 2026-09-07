import { describe, expect, it } from "vitest";
import { deviceVerb, roomPeople, visibleDevices } from "../src/presence-card-model";
import type { DashboardPerson, PresenceDashboard } from "../src/presence-card-model";
const group = { id: "upstairs", name: "Upstairs", kind: "floor", rooms: ["bedroom", "hall"] };
describe("presence card evidence", () => {
  it("sums all floor beliefs, including rooms below the individual candidate cutoff", () => {
    const person = { probabilities: { bedroom: .08, hall: .08, kitchen: .84 } } as unknown as DashboardPerson;
    expect(roomPeople({ people: { Scott: person } } as unknown as PresenceDashboard, group, .1)[0]?.probability).toBe(.16);
    expect(roomPeople({ people: { Scott: { probabilities: {} } } } as unknown as PresenceDashboard, group, 0)).toEqual([]);
  });
  it("hides explicitly not-carried devices only while the correction is active", () => {
    const device = { room: "bedroom", confidence: .8, carrying_correction: { value: false, strength: 1 } };
    const person = { devices: { watch: device } } as unknown as DashboardPerson;
    expect(visibleDevices(person, group)).toEqual([]);
    device.carrying_correction.strength = 0;
    expect(visibleDevices(person, group)).toHaveLength(1);
    device.room = "kitchen";
    expect(visibleDevices(person, group)).toEqual([]);
  });
  it("uses wearing only for watches", () => {
    expect(deviceVerb("watch", false)).toBe("Not wearing");
    expect(deviceVerb("watch", true)).toBe("Wearing");
    expect(deviceVerb("phone", false)).toBe("Not carrying");
  });
});
