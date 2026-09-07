import { describe, expect, it, vi } from "vitest";
import { render } from "lit";
import { entityLinks, registryLink } from "../src/ha-links";
import type { HomeAssistant } from "../src/types";

describe("Home Assistant links", () => {
  it("opens entity details and resolves the device from its registry entry", () => {
    const host = document.createElement("div");
    const listener = vi.fn();
    host.addEventListener("hass-more-info", listener);
    const hass = { states: {}, entities: { "sensor.motion": { entity_id: "sensor.motion", device_id: "real-id" } } } as unknown as HomeAssistant;
    render(entityLinks(host, hass, "sensor.motion"), host);
    (host.querySelector("ha-button") as HTMLElement).click();
    expect(listener.mock.calls[0]![0].detail).toEqual({ entityId: "sensor.motion" });
    expect(host.querySelector("a")?.getAttribute("href")).toBe("/config/devices/device/real-id");
  });

  it("does not invent links for missing targets", () => {
    const host = document.createElement("div");
    render(entityLinks(host, undefined, "sensor.missing"), host);
    expect(host.querySelector("a, ha-button")).toBeNull();
    render(registryLink("area", null, "Unmapped"), host);
    expect(host.textContent).toBe("Unmapped");
  });
});
