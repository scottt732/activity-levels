"""Activity Levels integration."""

from __future__ import annotations

from collections.abc import Iterable

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ConfigEntryError, ServiceValidationError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.util import slugify

from .const import (
    ATTR_FORCE,
    ATTR_GROUP_ID,
    ATTR_PEAK,
    ATTR_PERSON,
    ATTR_ROOM,
    ATTR_VALUE,
    CONF_PRESENCE,
    DOMAIN,
    HUB_NAME,
    MANUFACTURER,
    MODEL,
    MODEL_BY_KIND,
    MODEL_HUB,
    MODEL_PRESENCE,
    SERVICE_LOCATE,
    SERVICE_REBUILD_PROFILE,
    SERVICE_RESET,
    SERVICE_SET_LEVEL,
    SERVICE_SIMULATE_NOW,
    SERVICE_TRIGGER,
)
from .coordinator import ActivityLevelsCoordinator
from .panel import async_register_panel, async_unregister_panel
from .patterns_coordinator import PatternsCoordinator
from .presence_coordinator import PresenceCoordinator, clear_presence_issues
from .runtime import ActivityLevelsConfigEntry, RuntimeData
from .schema import ConfigError, validate_config
from .topology import build_topology
from .tree import Tree, build_tree
from .websocket_api import async_register_websocket

# The one constant that needs a Home Assistant type to be spelled, so it lives here
# rather than in `const.py`: that module is imported by the pure side of the integration
# (`topology.py`, `presence/estimator.py`) and must not drag `homeassistant` in with it.
PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.SWITCH,
]

SERVICE_TRIGGER_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_GROUP_ID): cv.string,
        vol.Optional(ATTR_PEAK, default=1.0): vol.Coerce(float),
    }
)
SERVICE_SET_LEVEL_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_GROUP_ID): cv.string,
        vol.Required(ATTR_VALUE): vol.Coerce(float),
    }
)
SERVICE_RESET_SCHEMA = vol.Schema({vol.Optional(ATTR_GROUP_ID): cv.string})
SERVICE_REBUILD_PROFILE_SCHEMA = vol.Schema({vol.Optional(ATTR_FORCE, default=False): cv.boolean})
SERVICE_SIMULATE_NOW_SCHEMA = vol.Schema({vol.Required(ATTR_GROUP_ID): cv.string})
SERVICE_LOCATE_SCHEMA = vol.Schema(
    {vol.Required(ATTR_PERSON): cv.string, vol.Required(ATTR_ROOM): cv.string}
)


async def async_setup_entry(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> bool:
    """Set up Activity Levels from a config entry."""
    try:
        config = validate_config(entry.options)
    except ConfigError as err:
        raise ConfigEntryError(f"Invalid Activity Levels configuration: {err}") from err
    try:
        tree = build_tree(config)
        topology = build_topology(config)
    except Exception as err:  # a validated config the engine still cannot be built from
        raise ConfigEntryError(f"Could not build the Activity Levels tree: {err}") from err
    wanted = _create_devices(hass, entry, tree)
    coordinator = ActivityLevelsCoordinator(hass, entry.entry_id, tree)
    await coordinator.async_start()
    # Registered before anything that can fail, so a failed setup still tears the
    # timers down; async_stop is idempotent.
    entry.async_on_unload(coordinator.async_stop)
    patterns = PatternsCoordinator(hass, entry, coordinator, config)
    coordinator.patterns = patterns
    entry.async_on_unload(patterns.async_stop)
    await patterns.async_start()
    presence: PresenceCoordinator | None = None
    if config[CONF_PRESENCE]["enabled"]:
        presence = PresenceCoordinator(hass, entry, coordinator, topology, config)
        entry.async_on_unload(presence.async_stop)
        await presence.async_start()
        wanted |= _create_presence_devices(hass, entry, sorted(presence.devices))
    else:
        # nothing is left to clear whatever the presence side raised while it was on
        clear_presence_issues(hass, entry.entry_id)
    _prune_devices(hass, entry, wanted)
    entry.runtime_data = RuntimeData(
        coordinator=coordinator, patterns=patterns, topology=topology, presence=presence
    )
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    _register_services(hass)
    async_register_websocket(hass)
    await async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> bool:
    """Unload a config entry; the coordinators are stopped by their async_on_unload hooks."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> None:
    """Remove the sidebar panel when the integration is deleted.

    Deliberately not done on unload: every Save reloads the entry, and removing the panel
    fires EVENT_PANELS_UPDATED, which makes the frontend recreate the panel element.
    """
    async_unregister_panel(hass)


async def _async_update_listener(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> None:
    """Reload the entry whenever its options change."""
    await hass.config_entries.async_reload(entry.entry_id)


def _create_devices(hass: HomeAssistant, entry: ConfigEntry, tree: Tree) -> set[tuple[str, str]]:
    """Mirror the group tree into the device registry; return the identifiers it owns."""
    registry = dr.async_get(hass)
    registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=HUB_NAME,
        manufacturer=MANUFACTURER,
        model=MODEL_HUB,
    )
    areas = ar.async_get(hass)
    for info in tree.group_order():
        # A floor binds a Home Assistant *floor*, and Home Assistant devices belong to
        # areas, not floors -- so only an area-bound group suggests anything.
        area = areas.async_get_area(info.area_id) if info.area_id else None
        registry.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={(DOMAIN, info.id)},
            # a group that was never named takes the name of the area it binds, which is
            # the whole point of binding one: nobody should type "Kitchen" twice
            name=info.name if info.name_set or area is None else area.name,
            manufacturer=MANUFACTURER,
            model=MODEL_BY_KIND.get(info.kind, MODEL),
            # `suggested_area` is a *name*: Home Assistant looks it up and creates the area
            # if it does not exist. Handing it an id would invent a second, badly named
            # area beside the one the group is actually bound to. The id is the fallback
            # only for the case that cannot happen -- an `area_id` naming no area at all.
            suggested_area=area.name if area is not None else info.area_id,
            # roots hang off the hub, so the whole integration is one tree in the UI
            via_device=(DOMAIN, info.parent_id or entry.entry_id),
        )
    return {(DOMAIN, gid) for gid in tree.groups} | {(DOMAIN, entry.entry_id)}


def _create_presence_devices(
    hass: HomeAssistant, entry: ConfigEntry, names: Iterable[str]
) -> set[tuple[str, str]]:
    """One device per tracked person, under the hub. Empty when presence is off."""
    registry = dr.async_get(hass)
    wanted: set[tuple[str, str]] = set()
    for name in names:
        identifier = (DOMAIN, f"presence_{slugify(name)}")
        registry.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={identifier},
            name=f"Presence: {name}",
            manufacturer=MANUFACTURER,
            model=MODEL_PRESENCE,
            via_device=(DOMAIN, entry.entry_id),
        )
        wanted.add(identifier)
    return wanted


def _prune_devices(hass: HomeAssistant, entry: ConfigEntry, wanted: set[tuple[str, str]]) -> None:
    """Drop this entry from any device the current configuration no longer describes.

    Separate from creation, and run after *both* passes: a person's device is created
    later than the groups', and pruning in between would take it away every reload.
    """
    registry = dr.async_get(hass)
    for device in dr.async_entries_for_config_entry(registry, entry.entry_id):
        if not device.identifiers & wanted:
            registry.async_update_device(device.id, remove_config_entry_id=entry.entry_id)


def _runtime(hass: HomeAssistant) -> RuntimeData:
    """Return the runtime data of the single loaded entry, or explain that there is none."""
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        runtime: RuntimeData = entry.runtime_data
        return runtime
    raise ServiceValidationError("Activity Levels is not loaded")


def _resolve_group(coordinator: ActivityLevelsCoordinator, group_id: str) -> str:
    if group_id not in coordinator.tree.groups:
        raise ServiceValidationError(f"Unknown group '{group_id}'")
    return group_id


def _register_services(hass: HomeAssistant) -> None:
    """Register the domain services once, no matter how often entries are reloaded."""
    if hass.services.has_service(DOMAIN, SERVICE_TRIGGER):
        return

    @callback
    def handle_trigger(call: ServiceCall) -> None:
        coordinator = _runtime(hass).coordinator
        group_id = _resolve_group(coordinator, call.data[ATTR_GROUP_ID])
        try:
            coordinator.trigger(group_id, call.data[ATTR_PEAK])
        except ValueError as err:
            raise ServiceValidationError(str(err)) from err

    @callback
    def handle_set_level(call: ServiceCall) -> None:
        coordinator = _runtime(hass).coordinator
        group_id = _resolve_group(coordinator, call.data[ATTR_GROUP_ID])
        try:
            coordinator.set_level(group_id, call.data[ATTR_VALUE])
        except ValueError as err:
            raise ServiceValidationError(str(err)) from err

    @callback
    def handle_reset(call: ServiceCall) -> None:
        coordinator = _runtime(hass).coordinator
        group_id: str | None = call.data.get(ATTR_GROUP_ID)
        if group_id is not None:
            _resolve_group(coordinator, group_id)
        coordinator.reset(group_id)

    async def handle_rebuild_profile(call: ServiceCall) -> None:
        await _runtime(hass).patterns.async_rebuild(force=call.data[ATTR_FORCE])

    async def handle_simulate_now(call: ServiceCall) -> None:
        runtime = _runtime(hass)
        group_id = _resolve_group(runtime.coordinator, call.data[ATTR_GROUP_ID])
        simulation = runtime.patterns.simulation
        if not await simulation.async_simulate_now(group_id):
            reason = simulation.blocked_reason(group_id, forced=True) or "there is nothing to do"
            raise ServiceValidationError(f"Nothing to simulate: {reason}")

    hass.services.async_register(
        DOMAIN, SERVICE_TRIGGER, handle_trigger, schema=SERVICE_TRIGGER_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_LEVEL, handle_set_level, schema=SERVICE_SET_LEVEL_SCHEMA
    )
    hass.services.async_register(DOMAIN, SERVICE_RESET, handle_reset, schema=SERVICE_RESET_SCHEMA)
    hass.services.async_register(
        DOMAIN,
        SERVICE_REBUILD_PROFILE,
        handle_rebuild_profile,
        schema=SERVICE_REBUILD_PROFILE_SCHEMA,
    )

    @callback
    def handle_locate(call: ServiceCall) -> None:
        """A correction from an automation or a companion notification action."""
        presence = _runtime(hass).presence
        if presence is None or not presence.ready:
            raise ServiceValidationError("Presence is not running")
        try:
            presence.correct(call.data[ATTR_PERSON], call.data[ATTR_ROOM], source="service")
        except ValueError as err:
            raise ServiceValidationError(str(err)) from err

    hass.services.async_register(
        DOMAIN,
        SERVICE_SIMULATE_NOW,
        handle_simulate_now,
        schema=SERVICE_SIMULATE_NOW_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_LOCATE, handle_locate, schema=SERVICE_LOCATE_SCHEMA
    )
