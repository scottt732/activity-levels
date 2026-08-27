from datetime import timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.sensor import ActivityLevelSensor
from tests.fixtures import house_config


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    for e in (
        "binary_sensor.front_door",
        "binary_sensor.living_motion",
        "binary_sensor.kitchen_motion",
    ):
        hass.states.async_set(e, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def advance(hass: HomeAssistant, freezer: FrozenDateTimeFactory, seconds: float) -> None:
    freezer.tick(timedelta(seconds=seconds))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def test_level_sensor_and_attributes(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    s = hass.states.get("sensor.living_room_activity_level")
    assert s.state == "2.0"
    assert s.attributes["mix"] == "sum" and s.attributes["max_value"] == 5.0
    assert s.attributes["gated"] is True and s.attributes["active_voices"] == 1
    assert s.attributes["contributors"] == {"binary_sensor.living_motion": 2.0}
    assert s.attributes["cooldown_at"] is None
    assert hass.states.get("binary_sensor.living_room_active").state == "on"
    assert hass.states.get("sensor.living_room_last_activity").state != "unknown"
    assert hass.states.get("sensor.house_activity_level").state == "2.0"
    # The recorder reads the union Entity builds in __init_subclass__, not the class
    # attribute we set, so assert against the set that actually keeps `contributors`
    # out of the database.
    assert "contributors" in ActivityLevelSensor._Entity__combined_unrecorded_attributes


async def test_decay_updates_and_timestamps(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    await hass.async_block_till_done()
    cooldown = hass.states.get("sensor.kitchen_cooldown_at").state
    assert cooldown not in ("unknown", "unavailable")
    await advance(hass, freezer, 30.0)  # halfway down: 1.0 out of a full scale of 5.0
    assert float(hass.states.get("sensor.kitchen_activity_level").state) == pytest.approx(
        0.5, abs=0.1
    )
    await advance(hass, freezer, 200.0)
    assert hass.states.get("sensor.kitchen_activity_level").state == "0.0"
    assert hass.states.get("binary_sensor.kitchen_active").state == "off"
    assert hass.states.get("sensor.kitchen_cooldown_at").state == "unknown"


async def test_idle_groups_do_not_write_state(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    events: list[Event] = []

    def track(event: Event) -> None:
        if str(event.data.get("entity_id", "")).endswith("_activity_level"):
            events.append(event)

    hass.bus.async_listen(EVENT_STATE_CHANGED, track)
    for _ in range(5):
        await advance(hass, freezer, 120.0)
    assert events == []


async def test_diagnostic_entities_and_button(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    ent = er.async_get(hass)
    assert ent.async_get("sensor.kitchen_last_activity").entity_category == "diagnostic"
    assert ent.async_get("button.kitchen_trigger").entity_category == "diagnostic"
    await hass.services.async_call(
        "button", "press", {"entity_id": "button.kitchen_trigger"}, blocking=True
    )
    assert hass.states.get("sensor.kitchen_activity_level").state == "1.0"
