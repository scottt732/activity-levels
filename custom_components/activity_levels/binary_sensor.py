"""Binary sensor: group is active (level > 0)."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity
from .runtime import ActivityLevelsConfigEntry
from .tree import GroupInfo


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ActivityLevelsConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the active binary sensor every group gets."""
    coordinator = entry.runtime_data.coordinator
    async_add_entities(
        ActiveBinarySensor(coordinator, info) for info in coordinator.tree.group_order()
    )


class ActiveBinarySensor(ActivityLevelsEntity, BinarySensorEntity):
    """On while the group's level is above zero."""

    _attr_device_class = BinarySensorDeviceClass.OCCUPANCY

    def __init__(self, coordinator: ActivityLevelsCoordinator, info: GroupInfo) -> None:
        """Set up the active sensor for one group."""
        super().__init__(coordinator, info, "active", Platform.BINARY_SENSOR)

    @property
    def is_on(self) -> bool:
        """Whether this group counts as active right now."""
        return self.group_state.active
