"""Sensors: activity level, last activity, cooldown at."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import EntityCategory, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_ACTIVE_VOICES,
    ATTR_CONTRIBUTORS,
    ATTR_COOLDOWN_AT,
    ATTR_GATED,
    ATTR_MAX_VALUE,
    ATTR_MIX,
)
from .coordinator import ActivityLevelsConfigEntry, ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity
from .tree import GroupInfo


def _ts(value: float | None) -> datetime | None:
    """Turn an engine timestamp into the tz-aware datetime HA wants."""
    return None if value is None else dt_util.utc_from_timestamp(value)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ActivityLevelsConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the three sensors every group gets."""
    coordinator = entry.runtime_data
    entities: list[SensorEntity] = []
    for info in coordinator.tree.group_order():
        entities.append(ActivityLevelSensor(coordinator, info))
        entities.append(LastActivitySensor(coordinator, info))
        entities.append(CooldownAtSensor(coordinator, info))
    async_add_entities(entities)


class ActivityLevelSensor(ActivityLevelsEntity, SensorEntity):
    """The group's current level, plus how it was arrived at."""

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, coordinator: ActivityLevelsCoordinator, info: GroupInfo) -> None:
        """Set up the level sensor for one group."""
        super().__init__(coordinator, info, "activity_level", Platform.SENSOR)
        self._attr_suggested_display_precision = info.precision

    @property
    def native_value(self) -> float:
        """The mixed level of this group."""
        return self.group_state.value

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Explain the level: how it mixes, what is gating it, who contributed."""
        s = self.group_state
        cooldown = _ts(s.cooldown_at)
        return {
            ATTR_MIX: self.info.mix,
            ATTR_MAX_VALUE: self.info.max_value,
            ATTR_GATED: s.gated,
            ATTR_ACTIVE_VOICES: s.active_voices,
            ATTR_COOLDOWN_AT: None if cooldown is None else cooldown.isoformat(),
            ATTR_CONTRIBUTORS: s.contributors,
        }


class LastActivitySensor(ActivityLevelsEntity, SensorEntity):
    """When this group last saw a stimulus start."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: ActivityLevelsCoordinator, info: GroupInfo) -> None:
        """Set up the last-activity sensor for one group."""
        super().__init__(coordinator, info, "last_activity", Platform.SENSOR)

    @property
    def native_value(self) -> datetime | None:
        """The last note-on in this group, or None if it never fired."""
        return _ts(self.group_state.last_activity)


class CooldownAtSensor(ActivityLevelsEntity, SensorEntity):
    """When this group is expected to reach zero."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: ActivityLevelsCoordinator, info: GroupInfo) -> None:
        """Set up the cooldown sensor for one group."""
        super().__init__(coordinator, info, "cooldown_at", Platform.SENSOR)

    @property
    def native_value(self) -> datetime | None:
        """The projected return to idle, or None while nothing is decaying."""
        return _ts(self.group_state.cooldown_at)
