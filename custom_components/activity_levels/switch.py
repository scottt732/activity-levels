"""Switches: the presence-simulation pair, and a mute switch per group.

The two simulation switches restore their own state, so an away-mode simulation that was
armed before a restart is armed again afterwards. That switch is only ever a
*permission*: the runtime still re-checks every precondition before it plans or executes
anything. Mute is different -- the coordinator persists it -- so that switch reads the
coordinator instead of restoring anything of its own.
"""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.const import STATE_ON, EntityCategory, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN
from .coordinator import ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity
from .runtime import ActivityLevelsConfigEntry
from .simulation import SimulationRuntime
from .tree import GroupInfo

SUFFIX = "presence_simulation"
MUTE_SUFFIX = "mute"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ActivityLevelsConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the global switch, a mute per group, and a simulation switch where it applies."""
    coordinator = entry.runtime_data.coordinator
    simulation = entry.runtime_data.patterns.simulation
    entities: list[SwitchEntity] = [GlobalPresenceSimulationSwitch(simulation, entry.entry_id)]
    entities.extend(MuteSwitch(coordinator, info) for info in coordinator.tree.group_order())
    entities.extend(
        PresenceSimulationSwitch(coordinator, simulation, info)
        for info in coordinator.tree.group_order()
        if simulation.has_switch(info.id)
    )
    async_add_entities(entities)


class MuteSwitch(ActivityLevelsEntity, SwitchEntity):
    """Takes one group out of its parent's mix, without stopping the group itself.

    Not a RestoreEntity: the coordinator persists the mutes and has already re-applied
    them to the engine tree by the time this entity exists, so a restored second copy
    could only disagree with what the mixer is actually doing. Muting a root group is
    allowed; it simply has no parent to be kept out of.
    """

    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator: ActivityLevelsCoordinator, info: GroupInfo) -> None:
        """Set up the mute switch for one group."""
        super().__init__(coordinator, info, MUTE_SUFFIX, Platform.SWITCH)

    @property
    def is_on(self) -> bool:
        """Whether this group is currently muted out of its parent."""
        return self.group_state.muted

    @property
    def icon(self) -> str:
        """A crossed-out speaker while muted, so the row reads at a glance."""
        return "mdi:volume-mute" if self.is_on else "mdi:volume-high"

    async def async_turn_on(self, **kwargs: object) -> None:
        """Mute the group: its parent stops mixing it in."""
        self.coordinator.set_muted(self.info.id, True)

    async def async_turn_off(self, **kwargs: object) -> None:
        """Unmute it: the parent counts it again."""
        self.coordinator.set_muted(self.info.id, False)


class PresenceSimulationSwitch(ActivityLevelsEntity, RestoreEntity, SwitchEntity):
    """Arms the presence simulation for one group."""

    def __init__(
        self,
        coordinator: ActivityLevelsCoordinator,
        simulation: SimulationRuntime,
        info: GroupInfo,
    ) -> None:
        """Set up the presence-simulation switch for one group."""
        super().__init__(coordinator, info, SUFFIX, Platform.SWITCH)
        self.simulation = simulation
        self._attr_is_on = False

    async def async_added_to_hass(self) -> None:
        """Restore the armed/disarmed choice and hand it to the runtime."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        self._attr_is_on = last is not None and last.state == STATE_ON
        self.simulation.set_group(self.info.id, self._attr_is_on)

    async def async_turn_on(self, **kwargs: object) -> None:
        """Arm this group's simulation."""
        self._set(True)

    async def async_turn_off(self, **kwargs: object) -> None:
        """Disarm it, cancelling any plan in flight."""
        self._set(False)

    def _set(self, on: bool) -> None:
        self._attr_is_on = on
        self.simulation.set_group(self.info.id, on)
        self.async_write_ha_state()


class GlobalPresenceSimulationSwitch(RestoreEntity, SwitchEntity):
    """The master switch: nothing simulates while this is off."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = f"global_{SUFFIX}"

    def __init__(self, simulation: SimulationRuntime, entry_id: str) -> None:
        """Set up the master switch on the integration's hub device."""
        self.simulation = simulation
        self._attr_unique_id = f"{entry_id}-{SUFFIX}"
        self.entity_id = f"{Platform.SWITCH}.{DOMAIN}_{SUFFIX}"
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, entry_id)})
        self._attr_is_on = False

    async def async_added_to_hass(self) -> None:
        """Restore the armed/disarmed choice and hand it to the runtime."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        self._attr_is_on = last is not None and last.state == STATE_ON
        self.simulation.set_global(self._attr_is_on)

    async def async_turn_on(self, **kwargs: object) -> None:
        """Allow every armed group to simulate."""
        self._set(True)

    async def async_turn_off(self, **kwargs: object) -> None:
        """Stop every running plan at once."""
        self._set(False)

    def _set(self, on: bool) -> None:
        self._attr_is_on = on
        self.simulation.set_global(on)
        self.async_write_ha_state()
