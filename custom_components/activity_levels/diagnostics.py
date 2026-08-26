"""Diagnostics: config plus engine snapshot."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

from homeassistant.core import HomeAssistant

from .coordinator import ActivityLevelsConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ActivityLevelsConfigEntry
) -> dict[str, Any]:
    """Return config, per-group state and the raw engine snapshot. No secrets involved."""
    coordinator = entry.runtime_data
    return {
        "config": dict(entry.options),
        "groups": {gid: asdict(state) for gid, state in coordinator.data.items()},
        "voices": coordinator.voice_states(),
        "snapshot": coordinator.snapshot(),
    }
