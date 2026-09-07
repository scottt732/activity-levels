import { afterEach, beforeEach, expect, it, vi } from "vitest";
import "../src/cards";
import type { ActivityLevelsPresenceCard } from "../src/al-presence-card";
import type { HomeAssistant } from "../src/types";
import type { PresenceDashboard } from "../src/presence-card-model";
let card: ActivityLevelsPresenceCard;
let state: PresenceDashboard;
let calls: Record<string, unknown>[];
beforeEach(() => {
  vi.useFakeTimers();
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
  const person = { person: "person.scott", room: "theater", confidence: .8, probabilities: { theater: .8 }, devices: {
    watch: { name: "Apple Watch", kind: "watch", room: "theater", confidence: .8, carrying_correction: null },
  } };
  state = { enabled: true, groups: [{ id: "theater", name: "Theater", kind: "room", rooms: ["theater"] }, { id: "upstairs", name: "Upstairs", kind: "floor", rooms: ["bedroom"] }], people: { Scott: person, Danielle: { ...person, person: null, probabilities: {} } } } as unknown as PresenceDashboard;
  calls = [];
  card = document.createElement("activity-levels-presence-card") as ActivityLevelsPresenceCard;
  card.setConfig({ type: "custom:activity-levels-presence-card", group: "theater" });
  card.hass = { states: { "person.scott": { attributes: { entity_picture: "/api/image/serve/scott" } } }, user: { is_admin: true }, callWS: vi.fn(async (request: Record<string, unknown>) => { calls.push(request); return request.type === "activity_levels/presence/dashboard" ? state : {}; }) } as unknown as HomeAssistant;
  document.body.append(card);
});
afterEach(() => { card.remove(); vi.useRealTimers(); });
async function settle() { await vi.advanceTimersByTimeAsync(0); await card.updateComplete; }
async function click(selector: string) { (card.shadowRoot!.querySelector(selector) as HTMLButtonElement).click(); await settle(); }
async function action(text: string) { const b = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>("dialog button")].find(b => b.textContent?.trim() === text)!; b.click(); await settle(); }
it("uses photos, independent watch controls and only missing people in the add picker", async () => {
  await settle(); expect(card.shadowRoot!.querySelector("img")?.getAttribute("src")).toBe("/api/image/serve/scott");
  await click(".device"); expect(card.shadowRoot!.querySelector("dialog")!.textContent).toContain("Not wearing");
  await action("Not wearing"); expect(calls.at(-2)).toMatchObject({ type: "activity_levels/presence/correct", person: "Scott", device: "watch", carried: false });
  await click(".add"); const buttons = [...card.shadowRoot!.querySelectorAll("dialog .choices button")].map(b => b.textContent);
  expect(buttons).toEqual(["Danielle"]);
});
it("hides explicitly parked devices and the add button when everyone is shown", async () => {
  state.people.Danielle!.probabilities = { theater: .4 };
  state.people.Scott!.devices.watch!.carrying_correction = { value: false, strength: .8, t: 1, reason: "Confirmed" };
  state.people.Danielle!.devices = {};
  card.requestUpdate();
  await settle(); expect(card.shadowRoot!.querySelectorAll(".avatar")).toHaveLength(2);
  expect(card.shadowRoot!.querySelector(".device")).toBeNull(); expect(card.shadowRoot!.querySelector(".add")).toBeNull();
});
it("sends floor, tentative, and negative feedback without inventing a room", async () => {
  await settle(); await click(".avatar");
  const select = card.shadowRoot!.querySelector("select")!; select.value = "upstairs"; select.dispatchEvent(new Event("change")); await settle();
  await action("Probably"); expect(calls.at(-2)).toMatchObject({ floor: "upstairs", certainty: "probable" });
  await click(".avatar"); await action("Not here"); expect(calls.at(-2)).toMatchObject({ room: "theater", exclude: true });
});
it("keeps read-only viewers from submitting and falls back from broken photos", async () => {
  card.hass = { ...card.hass!, user: { is_admin: false, name: "Guest" } };
  await settle(); card.shadowRoot!.querySelector("img")!.dispatchEvent(new Event("error")); await settle();
  expect(card.shadowRoot!.querySelector("img")).toBeNull(); expect(card.shadowRoot!.querySelector(".add")).toBeNull();
  await click(".avatar"); expect([...card.shadowRoot!.querySelectorAll<HTMLButtonElement>("dialog .choices button")].every(b => b.disabled)).toBe(true);
});
it("shows failed corrections without closing the dialog", async () => {
  await settle(); await click(".device");
  card.hass!.callWS = vi.fn().mockRejectedValue(new Error("Connection lost"));
  await action("Not wearing"); expect(card.shadowRoot!.querySelector("dialog")!.open).toBe(true);
  expect(card.shadowRoot!.querySelector('[role="alert"]')!.textContent).toContain("Connection lost");
});
it("validates configuration and exposes an editor that preserves options", async () => {
  await settle();
  expect(() => card.setConfig({ type: "custom:activity-levels-presence-card", group: "" })).toThrow("Select a room");
  expect(() => card.setConfig({ type: "custom:activity-levels-presence-card", group: "theater", min_probability: 2 })).toThrow("min_probability");
  const editor = document.createElement("activity-levels-presence-card-editor") as HTMLElement & { hass: HomeAssistant; setConfig(config: unknown): void; updateComplete: Promise<boolean> };
  editor.hass = card.hass!; editor.setConfig({ type: "custom:activity-levels-presence-card", group: "theater", title: "People" });
  const changed = vi.fn(); editor.addEventListener("config-changed", changed); document.body.append(editor);
  await settle(); await editor.updateComplete;
  const select = editor.shadowRoot!.querySelector("select")!; select.value = "upstairs"; select.dispatchEvent(new Event("change"));
  expect(changed.mock.calls[0]![0].detail.config).toMatchObject({ group: "upstairs", title: "People" }); editor.remove();
});
