"""What one loaded config entry carries in ``entry.runtime_data``."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.config_entries import ConfigEntry

from .coordinator import ActivityLevelsCoordinator
from .patterns_coordinator import PatternsCoordinator


@dataclass
class RuntimeData:
    """The two coordinators an entry owns: the live engine and the learned profile."""

    coordinator: ActivityLevelsCoordinator
    patterns: PatternsCoordinator


type ActivityLevelsConfigEntry = ConfigEntry[RuntimeData]
