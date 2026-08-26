"""Websocket commands used by the sidebar panel."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .coordinator import ActivityLevelsCoordinator
from .schema import ConfigError, validate_config
from .tree import build_tree

_REGISTERED = f"{DOMAIN}_websocket_registered"


def _coordinator(hass: HomeAssistant) -> ActivityLevelsCoordinator | None:
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        coordinator: ActivityLevelsCoordinator = entry.runtime_data
        return coordinator
    return None


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    """Register the panel's websocket commands once, no matter how often entries reload."""
    if hass.data.get(_REGISTERED):
        return
    hass.data[_REGISTERED] = True
    websocket_api.async_register_command(hass, ws_config_get)
    websocket_api.async_register_command(hass, ws_config_validate)
    websocket_api.async_register_command(hass, ws_config_save)
    websocket_api.async_register_command(hass, ws_state)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config/get"})
@callback
def ws_config_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "not_found", "Activity Levels is not configured")
        return
    connection.send_result(msg["id"], {"config": dict(entries[0].options)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/config/validate", vol.Required("config"): dict}
)
@callback
def ws_config_validate(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    try:
        validate_config(msg["config"])
    except ConfigError as err:
        connection.send_result(msg["id"], {"ok": False, "errors": err.errors})
        return
    connection.send_result(msg["id"], {"ok": True, "errors": []})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/config/save", vol.Required("config"): dict}
)
@websocket_api.async_response
async def ws_config_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "not_found", "Activity Levels is not configured")
        return
    try:
        config = validate_config(msg["config"])
    except ConfigError as err:  # same pathed shape as config/validate
        connection.send_result(msg["id"], {"ok": False, "errors": err.errors})
        return
    try:
        build_tree(config)
    except Exception as err:  # a validated config that still will not build
        connection.send_error(msg["id"], "invalid_config", str(err))
        return
    hass.config_entries.async_update_entry(entries[0], options=config)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/state"})
@callback
def ws_state(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    coordinator = _coordinator(hass)
    if coordinator is None:
        connection.send_error(msg["id"], "not_loaded", "Activity Levels is not loaded")
        return
    groups = {
        gid: {
            **asdict(state),
            "name": coordinator.tree.groups[gid].name,
            "parent_id": coordinator.tree.groups[gid].parent_id,
        }
        for gid, state in coordinator.data.items()
    }
    connection.send_result(msg["id"], {"groups": groups, "voices": coordinator.voice_states()})
