"""Binary sensor: group is active (level > 0)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import ATTR_PROBABILITY
from .coordinator import ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity, DeviceEntity, PresenceEntity
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
        entities.extend(MovingBinarySensor(presence, name) for name in sorted(presence.people))
        entities.extend(
            CarriedBinarySensor(presence, name, device_id)
            for name, person in sorted(presence.people.items())
            for device_id in person.devices
        )
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


class CarriedBinarySensor(DeviceEntity, BinarySensorEntity):
    """On while this device is probably on its person.

    The person filter's marginal, cut at one half; the probability itself is an
    attribute, because "probably not" and "certainly not" are different answers to an
    automation deciding whether to trust the phone.
    """

    _attr_icon = "mdi:hand-back-right"

    def __init__(self, presence: PresenceCoordinator, name: str, device_id: str) -> None:
        """Set up the carried sensor for one of a person's devices."""
        super().__init__(presence, name, device_id, "carried", Platform.BINARY_SENSOR)

    @property
    def probability(self) -> float | None:
        out = self.outputs
        carried = getattr(out, "carried", None)
        return None if carried is None else carried.get(self.device_id)

    @property
    def available(self) -> bool:
        """False until the person filter has said something about this device."""
        return self.probability is not None

    @property
    def is_on(self) -> bool:
        p = self.probability
        return p is not None and p >= 0.5

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        p = self.probability
        return {} if p is None else {ATTR_PROBABILITY: p}
