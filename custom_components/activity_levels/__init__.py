"""Activity Levels integration."""

from __future__ import annotations

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ConfigEntryError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr

from .const import (
    ATTR_FORCE,
    ATTR_GROUP_ID,
    ATTR_PEAK,
    DOMAIN,
    HUB_NAME,
    MANUFACTURER,
    MODEL,
    MODEL_HUB,
    PLATFORMS,
    SERVICE_REBUILD_PROFILE,
    SERVICE_RESET,
    SERVICE_TRIGGER,
)
from .coordinator import ActivityLevelsCoordinator
from .panel import async_register_panel, async_unregister_panel
from .patterns_coordinator import PatternsCoordinator
from .runtime import ActivityLevelsConfigEntry, RuntimeData
from .schema import ConfigError, validate_config
from .tree import Tree, build_tree
from .websocket_api import async_register_websocket

SERVICE_TRIGGER_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_GROUP_ID): cv.string,
        vol.Optional(ATTR_PEAK, default=1.0): vol.Coerce(float),
    }
)
SERVICE_RESET_SCHEMA = vol.Schema({vol.Optional(ATTR_GROUP_ID): cv.string})
SERVICE_REBUILD_PROFILE_SCHEMA = vol.Schema({vol.Optional(ATTR_FORCE, default=False): cv.boolean})


async def async_setup_entry(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> bool:
    """Set up Activity Levels from a config entry."""
    try:
        config = validate_config(entry.options)
    except ConfigError as err:
        raise ConfigEntryError(f"Invalid Activity Levels configuration: {err}") from err
    try:
        tree = build_tree(config)
    except Exception as err:  # a validated config the engine still cannot be built from
        raise ConfigEntryError(f"Could not build the Activity Levels tree: {err}") from err
    _create_devices(hass, entry, tree)
    coordinator = ActivityLevelsCoordinator(hass, entry.entry_id, tree)
    await coordinator.async_start()
    # Registered before anything that can fail, so a failed setup still tears the
    # timers down; async_stop is idempotent.
    entry.async_on_unload(coordinator.async_stop)
    patterns = PatternsCoordinator(hass, entry, coordinator, config)
    entry.async_on_unload(patterns.async_stop)
    await patterns.async_start()
    entry.runtime_data = RuntimeData(coordinator=coordinator, patterns=patterns)
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


def _create_devices(hass: HomeAssistant, entry: ConfigEntry, tree: Tree) -> None:
    """Mirror the group tree into the device registry; drop groups that went away."""
    registry = dr.async_get(hass)
    registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=HUB_NAME,
        manufacturer=MANUFACTURER,
        model=MODEL_HUB,
    )
    for info in tree.group_order():
        registry.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={(DOMAIN, info.id)},
            name=info.name,
            manufacturer=MANUFACTURER,
            model=MODEL,
            suggested_area=info.area,
            # roots hang off the hub, so the whole integration is one tree in the UI
            via_device=(DOMAIN, info.parent_id or entry.entry_id),
        )
    wanted = {(DOMAIN, gid) for gid in tree.groups} | {(DOMAIN, entry.entry_id)}
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
    def handle_reset(call: ServiceCall) -> None:
        coordinator = _runtime(hass).coordinator
        group_id: str | None = call.data.get(ATTR_GROUP_ID)
        if group_id is not None:
            _resolve_group(coordinator, group_id)
        coordinator.reset(group_id)

    async def handle_rebuild_profile(call: ServiceCall) -> None:
        await _runtime(hass).patterns.async_rebuild(force=call.data[ATTR_FORCE])

    hass.services.async_register(
        DOMAIN, SERVICE_TRIGGER, handle_trigger, schema=SERVICE_TRIGGER_SCHEMA
    )
    hass.services.async_register(DOMAIN, SERVICE_RESET, handle_reset, schema=SERVICE_RESET_SCHEMA)
    hass.services.async_register(
        DOMAIN,
        SERVICE_REBUILD_PROFILE,
        handle_rebuild_profile,
        schema=SERVICE_REBUILD_PROFILE_SCHEMA,
    )
