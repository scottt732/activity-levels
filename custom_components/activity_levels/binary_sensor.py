"""Binary sensor: group is active (level > 0)."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity, PresenceEntity
from .presence_coordinator import PresenceCoordinator
from .runtime import ActivityLevelsConfigEntry
from .tree import GroupInfo


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ActivityLevelsConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the active binary sensor every group gets, plus each tracked person's moving."""
    coordinator = entry.runtime_data.coordinator
    entities: list[BinarySensorEntity] = [
        ActiveBinarySensor(coordinator, info) for info in coordinator.tree.group_order()
    ]
    presence = entry.runtime_data.presence
    if presence is not None and presence.ready:
        entities.extend(MovingBinarySensor(presence, name) for name in sorted(presence.devices))
    async_add_entities(entities)


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


class MovingBinarySensor(PresenceEntity, BinarySensorEntity):
    """On while this person's top two rooms are adjacent and both plausible.

    The counterpart to the confidence threshold: somebody in a doorway is an occupant
    of neither room, and this is how an automation notices them anyway.
    """

    _attr_device_class = BinarySensorDeviceClass.MOVING

    def __init__(self, presence: PresenceCoordinator, name: str) -> None:
        """Set up the moving sensor for one tracked person."""
        super().__init__(presence, name, "moving", Platform.BINARY_SENSOR)

    @property
    def is_on(self) -> bool:
        """Whether the filter currently reads this person as between two rooms."""
        out = self.outputs
        return out is not None and out.moving
