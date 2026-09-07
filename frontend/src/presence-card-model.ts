import type { PersonOutputs, PresenceDeviceRow, PresenceState } from "./types";

export interface PresenceCardGroup { id: string; name: string; kind: string; rooms: string[] }
export interface DashboardPerson extends PersonOutputs { probabilities?: Record<string, number> }
export interface PresenceDashboard extends Omit<PresenceState, "people"> {
  people: Record<string, DashboardPerson>;
  groups: PresenceCardGroup[];
}
export const deviceVerb = (kind: string, carried: boolean): string =>
  kind === "watch" ? (carried ? "Wearing" : "Not wearing") : (carried ? "Carrying" : "Not carrying");
export const deviceIcon = (kind: string): string => ({ watch: "mdi:watch", phone: "mdi:cellphone", laptop: "mdi:laptop", tag: "mdi:tag" })[kind] ?? "mdi:devices";

export function roomPeople(state: PresenceDashboard, group: PresenceCardGroup, threshold: number) {
  return Object.entries(state.people ?? {}).map(([name, person]) => {
    const probabilities = person.probabilities ?? person.candidates ?? {};
    const probability = Math.min(1, group.rooms.reduce((sum, room) => sum + (probabilities[room] ?? 0), 0));
    return { name, person, probability };
  }).filter(({ probability }) => probability > 0 && probability >= threshold);
}

export function visibleDevices(person: DashboardPerson, group: PresenceCardGroup): [string, PresenceDeviceRow][] {
  return Object.entries(person.devices ?? {}).filter(([, device]) => {
    const correction = device.carrying_correction;
    return !(correction?.value === false && correction.strength > 0)
      && device.room !== null && group.rooms.includes(device.room)
      && (device.confidence ?? 0) > 0;
  });
}
