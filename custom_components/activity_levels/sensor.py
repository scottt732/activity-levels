"""Sensors: activity level, last activity, cooldown at, expected, anomaly, profile."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import EntityCategory, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_ACTIVE_VOICES,
    ATTR_CANDIDATES,
    ATTR_CONFIDENCE,
    ATTR_CONTRIBUTORS,
    ATTR_COOLDOWN_AT,
    ATTR_DAY_TYPE,
    ATTR_GATED,
    ATTR_GROUP_ID,
    ATTR_GROUPS_READY,
    ATTR_GROUPS_TOTAL,
    ATTR_MAX_VALUE,
    ATTR_MIX,
    ATTR_MOVING,
    ATTR_P25,
    ATTR_P75,
    ATTR_PATH,
    ATTR_PRODUCER,
    ATTR_PRODUCER_VERSION,
    ATTR_READY,
    ATTR_TRAINED,
    ATTR_UPDATED,
    ATTR_WHO,
    AWAY,
    DOMAIN,
)
from .coordinator import ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity, PresenceEntity
from .patterns.profile import group_ready
from .patterns_coordinator import PatternsCoordinator
from .presence_coordinator import PresenceCoordinator
from .runtime import ActivityLevelsConfigEntry
from .tree import GroupInfo


def _ts(value: float | None) -> datetime | None:
    """Turn an engine timestamp into the tz-aware datetime HA wants."""
    return None if value is None else dt_util.utc_from_timestamp(value)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ActivityLevelsConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the per-group sensors plus the entry's profile diagnostic."""
    coordinator = entry.runtime_data.coordinator
    patterns = entry.runtime_data.patterns
    entities: list[SensorEntity] = [ProfileSensor(patterns, entry.entry_id)]
    for info in coordinator.tree.group_order():
        entities.append(ActivityLevelSensor(coordinator, info))
        entities.append(LastActivitySensor(coordinator, info))
        entities.append(CooldownAtSensor(coordinator, info))
        entities.append(ExpectedActivitySensor(coordinator, patterns, info))
        entities.append(ActivityAnomalySensor(coordinator, patterns, info))
    presence = entry.runtime_data.presence
    if presence is not None and presence.ready:
        entities.extend(RoomSensor(presence, name) for name in sorted(presence.devices))
        entities.extend(
            OccupantsSensor(coordinator, presence, coordinator.tree.groups[gid])
            for gid in entry.runtime_data.topology.nodes
        )
    async_add_entities(entities)


class ActivityLevelSensor(ActivityLevelsEntity, SensorEntity):
    """The group's current level, plus how it was arrived at."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    # a dict that changes on every step: valuable live, dead weight in the recorder
    _unrecorded_attributes = frozenset({ATTR_CONTRIBUTORS})

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


class _PatternsGroupSensor(ActivityLevelsEntity, SensorEntity):
    """A group sensor that also follows the profile and the 15-minute bucket clock."""

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self,
        coordinator: ActivityLevelsCoordinator,
        patterns: PatternsCoordinator,
        info: GroupInfo,
        suffix: str,
    ) -> None:
        super().__init__(coordinator, info, suffix, Platform.SENSOR)
        self.patterns = patterns

    async def async_added_to_hass(self) -> None:
        """Follow the level coordinator (for the actual value) and the profile."""
        await super().async_added_to_hass()
        self.async_on_remove(self.patterns.async_add_listener(self.async_write_ha_state))


class ExpectedActivitySensor(_PatternsGroupSensor):
    """What this group's level normally looks like in the current bucket."""

    def __init__(
        self,
        coordinator: ActivityLevelsCoordinator,
        patterns: PatternsCoordinator,
        info: GroupInfo,
    ) -> None:
        """Set up the expected-activity sensor for one group."""
        super().__init__(coordinator, patterns, info, "expected_activity")
        self._attr_suggested_display_precision = info.precision

    @property
    def native_value(self) -> float | None:
        """The learned p50 for this bucket, or None while nothing is learned."""
        band = self.patterns.expected_now(self.info.id)
        return None if band is None else band[1]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """The band around the median, and where the number came from."""
        band = self.patterns.expected_now(self.info.id)
        return {
            ATTR_P25: None if band is None else band[0],
            ATTR_P75: None if band is None else band[2],
            ATTR_DAY_TYPE: self.patterns.day_type_now(),
            ATTR_READY: group_ready(self.patterns.profile, self.info.id),
            ATTR_PRODUCER: self.patterns.producer,
        }


class ActivityAnomalySensor(_PatternsGroupSensor):
    """How far outside its usual band this group currently sits."""

    def __init__(
        self,
        coordinator: ActivityLevelsCoordinator,
        patterns: PatternsCoordinator,
        info: GroupInfo,
    ) -> None:
        """Set up the anomaly sensor for one group."""
        super().__init__(coordinator, patterns, info, "activity_anomaly")
        self._attr_suggested_display_precision = 2

    @property
    def native_value(self) -> float | None:
        """Signed band-normalized deviation; None (unknown) until the group is ready."""
        return self.patterns.anomaly_now(self.info.id)


class ProfileSensor(SensorEntity):
    """When the learned profile was last generated, and by whom."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_translation_key = "profile"

    def __init__(self, patterns: PatternsCoordinator, entry_id: str) -> None:
        """Set up the profile diagnostic on the integration's hub device."""
        self.patterns = patterns
        self._attr_unique_id = f"{entry_id}-profile"
        self.entity_id = "sensor.activity_levels_profile"
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, entry_id)})

    @property
    def native_value(self) -> datetime | None:
        """The document's generated_at stamp."""
        generated_at = self.patterns.profile.get("generated_at")
        return None if generated_at is None else _ts(float(generated_at))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Who produced the profile, and how much of the house it covers."""
        producer = self.patterns.profile.get("producer", {})
        return {
            ATTR_PRODUCER: producer.get("name"),
            ATTR_PRODUCER_VERSION: producer.get("version"),
            ATTR_GROUPS_READY: self.patterns.groups_ready(),
            ATTR_GROUPS_TOTAL: len(self.patterns.coordinator.tree.groups),
            # the empty document written at setup time is valid but carries no group,
            # which is what tells "not trained yet" apart from "trained, nothing ready"
            ATTR_TRAINED: self.patterns.trained,
            ATTR_READY: self.patterns.ready_map(),
        }

    async def async_added_to_hass(self) -> None:
        """Rewrite whenever a producer replaces the document."""
        await super().async_added_to_hass()
        self.async_on_remove(self.patterns.async_add_listener(self.async_write_ha_state))


class RoomSensor(PresenceEntity, SensorEntity):
    """Which room this person is believed to be in."""

    # candidates and path change on every update: worth having live, dead weight recorded
    _unrecorded_attributes = frozenset({ATTR_CANDIDATES, ATTR_PATH})

    def __init__(self, presence: PresenceCoordinator, name: str) -> None:
        """Set up the room sensor for one tracked person."""
        super().__init__(presence, name, "room", Platform.SENSOR)

    @property
    def native_value(self) -> str | None:
        """The room's friendly name, or "Away". Names, not ids: this is a display."""
        out = self.outputs
        return None if out is None else self.presence.room_name(out.room)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """The id an automation wants, and everything behind the answer."""
        out = self.outputs
        if out is None:
            return {}
        return {
            ATTR_GROUP_ID: None if out.room == AWAY else out.room,
            ATTR_CONFIDENCE: out.confidence,
            ATTR_MOVING: out.moving,
            ATTR_CANDIDATES: {
                self.presence.room_name(room): p for room, p in out.candidates.items()
            },
            ATTR_PATH: [self.presence.room_name(room) for room in out.path],
            ATTR_UPDATED: dt_util.utc_from_timestamp(out.t).isoformat(),
        }


class OccupantsSensor(ActivityLevelsEntity, SensorEntity):
    """How many people are believed to be in this room.

    On the *group's* device rather than a person's: it is a property of the room, it
    belongs next to the room's activity level, and an automation that reads one wants
    the other in reach.
    """

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self,
        coordinator: ActivityLevelsCoordinator,
        presence: PresenceCoordinator,
        info: GroupInfo,
    ) -> None:
        """Set up the occupants sensor for one room."""
        super().__init__(coordinator, info, "occupants", Platform.SENSOR)
        self.presence = presence

    @property
    def native_value(self) -> int:
        """People confidently placed here. Someone mid-doorway counts nowhere."""
        return len(self.presence.occupants.get(self.info.id, []))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Who, by name, is being counted."""
        return {ATTR_WHO: list(self.presence.occupants.get(self.info.id, []))}

    async def async_added_to_hass(self) -> None:
        """Follow the presence coordinator as well as the level one."""
        await super().async_added_to_hass()
        self.async_on_remove(self.presence.async_add_listener(self.async_write_ha_state))
