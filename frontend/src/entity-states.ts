import type { HomeAssistant } from "./types";

/**
 * What states an entity can be in, and what Home Assistant calls them. The panel needs
 * both — the "Active states" picker needs a list to offer, and a stimulus row needs one
 * state spelled the way the more-info dialog spells it. Neither is answerable from the
 * `hass` object alone: a state machine reports the state an entity *is* in, never the set
 * it could be in, so the set comes from the table below and the names come from Home
 * Assistant's own translations.
 *
 * The table is deliberately partial, and that is safe. Every list is unioned with the
 * entity's current state and with whatever the configuration already chose, so a domain
 * nobody thought of degrades to "what you have and what it is doing" — which is still
 * strictly more than the free-text box this replaced ever offered.
 */

const ON_OFF = ["on", "off"];

/** The states worth offering, per domain, in the order a picker should list them. */
const DOMAIN_STATES: Record<string, readonly string[]> = {
  automation: ON_OFF,
  binary_sensor: ON_OFF,
  fan: ON_OFF,
  humidifier: ON_OFF,
  input_boolean: ON_OFF,
  light: ON_OFF,
  remote: ON_OFF,
  siren: ON_OFF,
  switch: ON_OFF,
  update: ON_OFF,
  alarm_control_panel: [
    "disarmed",
    "armed_home",
    "armed_away",
    "armed_night",
    "armed_vacation",
    "arming",
    "pending",
    "triggered",
  ],
  climate: ["heat", "cool", "heat_cool", "auto", "dry", "fan_only", "off"],
  cover: ["open", "opening", "closing", "closed"],
  device_tracker: ["home", "not_home"],
  lock: ["locked", "unlocked", "locking", "unlocking", "open", "opening", "jammed"],
  media_player: ["playing", "paused", "buffering", "idle", "standby", "on", "off"],
  person: ["home", "not_home"],
  timer: ["active", "paused", "idle"],
  vacuum: ["cleaning", "returning", "docked", "idle", "paused", "error"],
  water_heater: ["eco", "electric", "performance", "high_demand", "heat_pump", "gas", "off"],
};

const domainOf = (entityId: string): string => entityId.split(".")[0] ?? "";

/** `not_home` -> `Not home`. The last resort, when nothing at all is translated. */
const humanize = (state: string): string => {
  const words = state.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * The state as Home Assistant names it. The device-class translation comes first, because
 * a `door` binary sensor is Open and Closed rather than On and Off; the domain's own
 * table is the fallback, and a humanized state id the fallback to that.
 */
export function stateLabel(
  hass: HomeAssistant | undefined,
  entityId: string,
  state: string,
): string {
  const domain = domainOf(entityId);
  const deviceClass = hass?.states[entityId]?.attributes.device_class;
  const keys = [
    typeof deviceClass === "string"
      ? `component.${domain}.entity_component.${deviceClass}.state.${state}`
      : null,
    `component.${domain}.entity_component._.state.${state}`,
  ];
  // `localize` is guarded rather than called: a partially-built `hass` reaches the panel
  // in tests and, briefly, during a frontend reload, and a label is never worth a throw
  // that takes the whole row down with it.
  if (typeof hass?.localize === "function") {
    for (const key of keys) {
      if (key === null) continue;
      const label = hass.localize(key);
      if (typeof label === "string" && label !== "") return label;
    }
  }
  return humanize(state);
}

/**
 * The options the "Active states" picker offers. Always a superset of what is already
 * chosen, so an entity whose states this file has never heard of still shows the states
 * the configuration named rather than dropping them from the list meant to display them.
 */
export function stateOptions(
  hass: HomeAssistant | undefined,
  entityId: string,
  selected: readonly string[],
): { value: string; label: string }[] {
  const values = [...(DOMAIN_STATES[domainOf(entityId)] ?? [])];
  for (const state of [hass?.states[entityId]?.state, ...selected]) {
    if (typeof state === "string" && state !== "" && !values.includes(state)) values.push(state);
  }
  return values.map((value) => ({ value, label: stateLabel(hass, entityId, value) }));
}

/** How a stimulus row spells the entity's state right now; `null` when it is not there. */
export function entityStateText(
  hass: HomeAssistant | undefined,
  entityId: string,
): string | null {
  const stateObj = hass?.states[entityId];
  if (!stateObj) return null;
  const formatted = hass?.formatEntityState?.(stateObj);
  if (typeof formatted === "string" && formatted !== "") return formatted;
  return stateLabel(hass, entityId, stateObj.state);
}

/**
 * What the two momentary edge checkboxes are called. One active state can be named, which
 * is the case worth spelling out — "When it becomes Open" beats "When it enters the active
 * states" for every door in the house. With several, naming them all reads worse than the
 * generic phrasing, so the generic phrasing wins.
 */
export function edgeLabels(
  hass: HomeAssistant | undefined,
  entityId: string,
  to: readonly string[],
): { enter: string; leave: string } {
  const only = to.length === 1 ? to[0] : undefined;
  if (only === undefined) {
    return { enter: "When it enters the active states", leave: "When it leaves them" };
  }
  const label = stateLabel(hass, entityId, only);
  return { enter: `When it becomes ${label}`, leave: `When it stops being ${label}` };
}
