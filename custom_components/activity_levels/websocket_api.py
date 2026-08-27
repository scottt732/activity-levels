"""Websocket commands used by the sidebar panel."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .coordinator import ActivityLevelsCoordinator
from .patterns.profile import ProfileError
from .runtime import RuntimeData
from .schema import ConfigError, validate_config
from .simulation import MAX_LOG_ROWS
from .tree import build_tree

_REGISTERED = f"{DOMAIN}_websocket_registered"

DAY_SECONDS = 86400.0
"""The widest window 5-minute recorder history is served over."""


def _runtime(hass: HomeAssistant) -> RuntimeData | None:
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        runtime: RuntimeData = entry.runtime_data
        return runtime
    return None


def _coordinator(hass: HomeAssistant) -> ActivityLevelsCoordinator | None:
    runtime = _runtime(hass)
    return None if runtime is None else runtime.coordinator


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
    websocket_api.async_register_command(hass, ws_profile_get)
    websocket_api.async_register_command(hass, ws_profile_save)
    websocket_api.async_register_command(hass, ws_profile_rebuild)
    websocket_api.async_register_command(hass, ws_timeseries)
    websocket_api.async_register_command(hass, ws_simulation_log)
    websocket_api.async_register_command(hass, ws_mute)
    websocket_api.async_register_command(hass, ws_level_set)
    websocket_api.async_register_command(hass, ws_reset)


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
    # One frame, one clock: the countdowns the panel draws are measured against the
    # `now` it is handed, so every value in the frame has to come from that same instant.
    now = coordinator.now()
    details = coordinator.group_details(now)
    groups = {
        gid: {
            **asdict(state),
            "name": coordinator.tree.groups[gid].name,
            "parent_id": coordinator.tree.groups[gid].parent_id,
            **details[gid],
        }
        for gid, state in coordinator.data.items()
    }
    connection.send_result(
        msg["id"],
        {"now": now, "groups": groups, "voices": coordinator.voice_states(now)},
    )


def _loaded(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> RuntimeData | None:
    """The loaded entry's runtime, or None after answering the caller with why not."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_found", "Activity Levels is not loaded")
    return runtime


def _known_group(
    runtime: RuntimeData, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> str | None:
    """The message's group id, or None after answering the caller with why not."""
    group_id: str = msg["group_id"]
    if group_id not in runtime.coordinator.tree.groups:
        connection.send_error(msg["id"], "not_found", f"Unknown group '{group_id}'")
        return None
    return group_id


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/profile/get"})
@callback
def ws_profile_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    patterns = runtime.patterns
    # `trained` separates "no profile yet" from the perfectly valid empty document the
    # integration writes at setup time, which a panel would otherwise render as a profile.
    connection.send_result(
        msg["id"],
        {
            "profile": patterns.profile,
            "ready": patterns.ready_map(),
            "trained": patterns.trained,
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/profile/save", vol.Required("profile"): dict}
)
@websocket_api.async_response
async def ws_profile_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    try:
        await runtime.patterns.async_set_profile(msg["profile"])
    except ProfileError as err:  # same pathed shape as config/save
        connection.send_result(msg["id"], {"ok": False, "errors": err.errors})
        return
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/profile/rebuild",
        vol.Optional("force", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_profile_rebuild(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    # False is an answer, not a failure: no recorder, or a document another producer owns.
    rebuilt = await runtime.patterns.async_rebuild(force=msg["force"])
    connection.send_result(msg["id"], {"rebuilt": rebuilt})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/timeseries",
        vol.Required("group_id"): str,
        vol.Required("start"): vol.Coerce(float),
        vol.Required("end"): vol.Coerce(float),
        vol.Required("resolution"): vol.In(("5m", "1h")),
        vol.Optional("include_children", default=False): bool,
        vol.Optional("forecast_until", default=None): vol.Any(None, vol.Coerce(float)),
    }
)
@websocket_api.async_response
async def ws_timeseries(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    if (group_id := _known_group(runtime, connection, msg)) is None:
        return
    start: float = msg["start"]
    end: float = msg["end"]
    if end <= start:
        connection.send_error(msg["id"], "invalid_range", "end must be after start")
        return
    # 5-minute points come from raw recorder history, which is far too much of it to
    # read (and to draw) over more than a day; longer windows have to ask for hours.
    if msg["resolution"] == "5m" and end - start > DAY_SECONDS:
        connection.send_error(
            msg["id"], "invalid_range", "5m resolution is limited to a 24-hour window"
        )
        return
    result = await runtime.patterns.async_timeseries(
        group_id,
        start,
        end,
        msg["resolution"],
        include_children=msg["include_children"],
        forecast_until=msg["forecast_until"],
    )
    connection.send_result(msg["id"], result)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/simulation/log",
        vol.Optional("group_id"): str,
        vol.Optional("limit", default=50): vol.All(int, vol.Range(min=1, max=MAX_LOG_ROWS)),
    }
)
@callback
def ws_simulation_log(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    group_id: str | None = msg.get("group_id")
    if group_id is not None and group_id not in runtime.coordinator.tree.groups:
        connection.send_error(msg["id"], "not_found", f"Unknown group '{group_id}'")
        return
    gids = [group_id] if group_id is not None else list(runtime.coordinator.tree.groups)
    simulation = runtime.patterns.simulation
    # narrowed first, then cut to `limit`, so asking about one group does not hand back
    # fewer rows than asked for just because other groups were busier
    wanted = set(gids)
    entries = [row for row in simulation.log(MAX_LOG_ROWS) if row.get("group_id") in wanted]
    connection.send_result(
        msg["id"],
        {
            "entries": entries[: msg["limit"]],
            "active": {gid: simulation.is_active(gid) for gid in gids},
            "blocked": {gid: simulation.blocked_reason(gid) for gid in gids},
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/mute",
        vol.Required("group_id"): str,
        vol.Required("muted"): bool,
    }
)
@callback
def ws_mute(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    if (group_id := _known_group(runtime, connection, msg)) is None:
        return
    muted: bool = msg["muted"]
    runtime.coordinator.set_muted(group_id, muted)
    connection.send_result(msg["id"], {"muted": muted})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/level/set",
        vol.Required("group_id"): str,
        vol.Required("value"): vol.All(vol.Coerce(float), vol.Range(min=0)),
    }
)
@callback
def ws_level_set(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    if (group_id := _known_group(runtime, connection, msg)) is None:
        return
    # the level actually reached, which the limiter -- or a louder channel of a MAX
    # group -- can put somewhere other than where the fader was dragged
    reached = runtime.coordinator.set_level(group_id, msg["value"])
    connection.send_result(msg["id"], {"value": reached})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/reset", vol.Required("group_id"): str}
)
@callback
def ws_reset(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    if (group_id := _known_group(runtime, connection, msg)) is None:
        return
    runtime.coordinator.reset(group_id)
    connection.send_result(msg["id"], {})
