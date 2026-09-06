import { html, nothing } from "lit";
import type { HomeAssistant } from "./types";

/** HA routes use registry IDs; absent targets remain plain text. */
export function registryLink(kind: "device" | "area", id: string | null | undefined, label: string) {
  if (!id) return label;
  const section = kind === "device" ? "devices" : "areas";
  return html`<a href=${`/config/${section}/${kind}/${encodeURIComponent(id)}`}>${label}</a>`;
}

/** Entity details stay in HA's more-info dialog, preserving the panel's unsaved edits. */
export function entityLinks(host: HTMLElement, hass: HomeAssistant | undefined, entity: string | null | undefined,
  label = "Open entity", deviceId?: string | null, deviceLabel = "Open device") {
  const known = entity && (hass?.states?.[entity] || hass?.entities?.[entity]);
  const device = deviceId ?? (entity ? hass?.entities?.[entity]?.device_id : null);
  return html`${known ? html`<ha-button @click=${() => host.dispatchEvent(new CustomEvent("hass-more-info", {
    detail: { entityId: entity }, bubbles: true, composed: true,
  }))}>${label}</ha-button>` : nothing}
    ${device ? registryLink("device", device, deviceLabel) : nothing}`;
}
