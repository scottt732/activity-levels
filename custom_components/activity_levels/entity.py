"""Base entity: a view over one group's coordinator state."""

from __future__ import annotations

from homeassistant.const import Platform
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .coordinator import ActivityLevelsCoordinator, GroupState
from .tree import GroupInfo


class ActivityLevelsEntity(Entity):
    """Shared plumbing: identity, device link and the coordinator subscription."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: ActivityLevelsCoordinator,
        info: GroupInfo,
        suffix: str,
        platform: Platform,
    ) -> None:
        """Bind this entity to one group and give it a stable id."""
        self.coordinator = coordinator
        self.info = info
        self._attr_unique_id = f"{coordinator.entry_id}-{info.id}-{suffix}"
        self.entity_id = f"{platform}.{info.id}_{suffix}"
        self._attr_translation_key = suffix
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, info.id)})

    @property
    def group_state(self) -> GroupState:
        """The group's most recently published state."""
        return self.coordinator.data[self.info.id]

    async def async_added_to_hass(self) -> None:
        """Write state only when the coordinator publishes a change."""
        await super().async_added_to_hass()
        self.async_on_remove(
            self.coordinator.async_add_listener(self.info.id, self.async_write_ha_state)
        )
