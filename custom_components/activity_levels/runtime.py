"""What one loaded config entry carries in ``entry.runtime_data``."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.config_entries import ConfigEntry

from .coordinator import ActivityLevelsCoordinator
from .patterns_coordinator import PatternsCoordinator
from .topology import Topology


@dataclass
class RuntimeData:
    """The coordinators an entry owns, plus the room graph they all read."""

    coordinator: ActivityLevelsCoordinator
    patterns: PatternsCoordinator
    topology: Topology
    presence: None = None  # Task 5 replaces the type with PresenceCoordinator | None


type ActivityLevelsConfigEntry = ConfigEntry[RuntimeData]
