"""Base entity: a view over one group's coordinator state."""

from __future__ import annotations

from homeassistant.const import Platform
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity
from homeassistant.util import slugify

from .const import DOMAIN
from .coordinator import ActivityLevelsCoordinator, GroupState
from .presence.estimator import Outputs
from .presence_coordinator import PresenceCoordinator
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


class PresenceEntity(Entity):
    """One tracked person's entity, hung off its own device under the hub.

    A person is not a group, so this does not extend :class:`ActivityLevelsEntity`: it
    follows the presence coordinator instead of the level one, and it is unavailable
    until the filter has actually answered -- an estimate nobody has made yet is not
    "unknown room", it is no reading.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        presence: PresenceCoordinator,
        name: str,
        suffix: str,
        platform: Platform,
    ) -> None:
        """Bind this entity to one tracked person and give it a stable id."""
        self.presence = presence
        self.person = name
        slug = slugify(name)
        self._attr_unique_id = f"{presence.entry.entry_id}-presence-{slug}-{suffix}"
        self.entity_id = f"{platform}.{slug}_{suffix}"
        self._attr_translation_key = suffix
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, f"presence_{slug}")})

    @property
    def outputs(self) -> Outputs | None:
        """This person's last estimate, or None while there has not been one."""
        track = self.presence.devices.get(self.person)
        return None if track is None else track.outputs

    @property
    def available(self) -> bool:
        """False until the filter has answered once."""
        return self.outputs is not None

    async def async_added_to_hass(self) -> None:
        """Write state whenever the filter has something new to say."""
        await super().async_added_to_hass()
        self.async_on_remove(self.presence.async_add_listener(self.async_write_ha_state))
