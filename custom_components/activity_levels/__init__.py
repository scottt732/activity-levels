"""Activity Levels integration."""

from __future__ import annotations

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ConfigEntryError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr

from .const import (
    ATTR_GROUP_ID,
    ATTR_PEAK,
    DOMAIN,
    MANUFACTURER,
    MODEL,
    PLATFORMS,
    SERVICE_RESET,
    SERVICE_TRIGGER,
)
from .coordinator import ActivityLevelsConfigEntry, ActivityLevelsCoordinator
from .panel import async_register_panel, async_unregister_panel
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
    entry.runtime_data = coordinator
    # Registered before the platforms so a failing forward still tears the timers down.
    entry.async_on_unload(coordinator.async_stop)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    _register_services(hass)
    async_register_websocket(hass)
    await async_register_panel(hass)
    entry.async_on_unload(lambda: async_unregister_panel(hass))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> bool:
    """Unload a config entry; the coordinator is stopped by its async_on_unload hook."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_update_listener(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> None:
    """Reload the entry whenever its options change."""
    await hass.config_entries.async_reload(entry.entry_id)


def _create_devices(hass: HomeAssistant, entry: ConfigEntry, tree: Tree) -> None:
    """Mirror the group tree into the device registry; drop groups that went away."""
    registry = dr.async_get(hass)
    for info in tree.group_order():
        registry.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={(DOMAIN, info.id)},
            name=info.name,
            manufacturer=MANUFACTURER,
            model=MODEL,
            suggested_area=info.area,
            via_device=(DOMAIN, info.parent_id) if info.parent_id else None,
        )
    wanted = {(DOMAIN, gid) for gid in tree.groups}
    for device in dr.async_entries_for_config_entry(registry, entry.entry_id):
        if not device.identifiers & wanted:
            registry.async_update_device(device.id, remove_config_entry_id=entry.entry_id)


def _coordinator(hass: HomeAssistant) -> ActivityLevelsCoordinator:
    """Return the coordinator of the single loaded entry, or explain that there is none."""
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        coordinator: ActivityLevelsCoordinator = entry.runtime_data
        return coordinator
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
        coordinator = _coordinator(hass)
        group_id = _resolve_group(coordinator, call.data[ATTR_GROUP_ID])
        try:
            coordinator.trigger(group_id, call.data[ATTR_PEAK])
        except ValueError as err:
            raise ServiceValidationError(str(err)) from err

    @callback
    def handle_reset(call: ServiceCall) -> None:
        coordinator = _coordinator(hass)
        group_id: str | None = call.data.get(ATTR_GROUP_ID)
        if group_id is not None:
            _resolve_group(coordinator, group_id)
        coordinator.reset(group_id)

    hass.services.async_register(
        DOMAIN, SERVICE_TRIGGER, handle_trigger, schema=SERVICE_TRIGGER_SCHEMA
    )
    hass.services.async_register(DOMAIN, SERVICE_RESET, handle_reset, schema=SERVICE_RESET_SCHEMA)
