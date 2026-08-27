"""Diagnostics: config plus engine snapshot."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

from homeassistant.core import HomeAssistant

from .runtime import ActivityLevelsConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ActivityLevelsConfigEntry
) -> dict[str, Any]:
    """Return config, per-group state and the raw engine snapshot. No secrets involved."""
    coordinator = entry.runtime_data.coordinator
    return {
        "config": dict(entry.options),
        "groups": {gid: asdict(state) for gid, state in coordinator.data.items()},
        "voices": coordinator.voice_states(),
        "snapshot": coordinator.snapshot(),
        "profile": entry.runtime_data.patterns.profile,
        "topology": entry.runtime_data.topology.payload(),
        "presence": None,  # Task 5 fills this in
    }
