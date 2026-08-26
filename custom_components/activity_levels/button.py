"""Button: fire a synthetic impulse on a group."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.const import EntityCategory, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import ActivityLevelsConfigEntry, ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity
from .tree import GroupInfo


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ActivityLevelsConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the trigger button every group gets."""
    coordinator = entry.runtime_data
    async_add_entities(TriggerButton(coordinator, info) for info in coordinator.tree.group_order())


class TriggerButton(ActivityLevelsEntity, ButtonEntity):
    """Pressing it acts as if a stimulus in the group had fired once."""

    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: ActivityLevelsCoordinator, info: GroupInfo) -> None:
        """Set up the trigger button for one group."""
        super().__init__(coordinator, info, "trigger", Platform.BUTTON)

    async def async_press(self) -> None:
        """Fire a unit impulse on this group."""
        self.coordinator.trigger(self.info.id, 1.0)
