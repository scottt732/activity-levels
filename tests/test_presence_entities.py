"""The entities the presence side creates, and the ones it must not."""

from __future__ import annotations

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.presence_coordinator import OBSERVATION_DEBOUNCE
from tests.fixtures import fake_bermuda, fake_watch, presence_config, rooms_config
from tests.test_presence_coordinator import add_entry, observe


async def test_presence_entities_and_their_device(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")

    room = hass.states.get("sensor.scott_room")
    assert room.state == "Kitchen"  # the group's friendly name
    assert room.attributes["group_id"] == "kitchen"
    assert room.attributes["confidence"] > 0.6
    assert room.attributes["moving"] is False
    assert "Kitchen" in room.attributes["candidates"]
    assert room.attributes["path"][-1] == "Kitchen"
    assert room.attributes["updated"] is not None
    assert hass.states.get("binary_sensor.scott_moving").state == "off"

    devices = dr.async_get(hass)
    device = devices.async_get_device(identifiers={(DOMAIN, "presence_scott")})
    assert device is not None and device.name == "Presence: Scott"
    hub = devices.async_get_device(identifiers={(DOMAIN, entry.entry_id)})
    assert device.via_device_id == hub.id

    entities = er.async_get(hass)
    assert entities.async_get("sensor.scott_room").unique_id == (
        f"{entry.entry_id}-presence-scott-room"
    )


async def test_floor_sensor_names_the_floor_and_sums_its_rooms(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    floor = hass.states.get("sensor.scott_floor")
    assert floor is not None
    # rooms_config declares no kinds: `downstairs` is inferred to be a floor
    assert floor.state == "Downstairs"
    assert floor.attributes["group_id"] == "downstairs"
    room = hass.states.get("sensor.scott_room")
    assert floor.attributes["confidence"] >= room.attributes["confidence"]
    assert "Kitchen" in floor.attributes["rooms"]
    assert floor.attributes["updated"] == room.attributes["updated"]


async def test_floor_sensor_uses_the_floor_registry_name(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    floor = fr.async_get(hass).async_create("Ground floor")
    bermuda = fake_bermuda(hass)
    config = presence_config()
    config["groups"][0]["children"][0]["floor_id"] = floor.floor_id
    await add_entry(hass, config)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    assert hass.states.get("sensor.scott_floor").state == "Ground floor"


async def test_floor_sensor_reads_away_when_away(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    for _ in range(6):
        await observe(hass, freezer, bermuda, "none", home=False)
    floor = hass.states.get("sensor.scott_floor")
    assert floor.state == "Away"
    assert floor.attributes["group_id"] is None
    assert floor.attributes["rooms"] == {}


async def test_each_device_gets_a_carried_and_an_object_room_entity(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    watch = fake_watch(hass, bermuda)
    config = presence_config()
    config["presence"]["devices"] = []
    config["presence"]["people"] = [
        {
            "name": "Scott",
            "devices": [
                {"tracker": bermuda.tracker, "name": "Phone", "kind": "phone"},
                {"tracker": watch.tracker, "name": "Watch", "kind": "watch"},
            ],
        }
    ]
    entry = await add_entry(hass, config)
    hass.states.async_set(watch.tracker, "home")
    for room, entity_id in watch.sensors.items():
        hass.states.async_set(entity_id, "0.5" if room == "kitchen" else "8.0")
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")

    carried = hass.states.get("binary_sensor.scott_phone_carried")
    assert carried is not None
    assert carried.state == "on"
    assert 0.0 <= carried.attributes["probability"] <= 1.0
    assert carried.attributes["friendly_name"] == "Presence: Scott Phone carried"
    room = hass.states.get("sensor.scott_phone_room")
    assert room is not None and room.state == "Kitchen"
    assert room.attributes["group_id"] == "kitchen"
    assert room.attributes["confidence"] > 0.5
    assert room.attributes["friendly_name"] == "Presence: Scott Phone room"
    assert hass.states.get("sensor.scott_watch_room").state == "Kitchen"
    assert hass.states.get("binary_sensor.scott_watch_carried") is not None

    entities = er.async_get(hass)
    assert entities.async_get("binary_sensor.scott_phone_carried").unique_id == (
        f"{entry.entry_id}-presence-scott-phone-carried"
    )
    devices = dr.async_get(hass)
    person_device = devices.async_get_device(identifiers={(DOMAIN, "presence_scott")})
    assert entities.async_get("sensor.scott_phone_room").device_id == person_device.id


async def test_occupants_sensor_counts_and_names(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")

    occupants = hass.states.get("sensor.kitchen_occupants")
    assert occupants.state == "1"
    assert occupants.attributes["who"] == ["Scott"]
    assert hass.states.get("sensor.dining_room_occupants").state == "0"
    # branches are not rooms and get no occupants sensor
    assert hass.states.get("sensor.downstairs_occupants") is None


async def test_away_reads_as_away(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    for _ in range(6):
        await observe(hass, freezer, bermuda, "none", home=False)
    room = hass.states.get("sensor.scott_room")
    assert room.state == "Away"
    assert room.attributes["group_id"] is None


async def test_moving_turns_on_between_two_adjacent_rooms(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    hass.states.async_set(bermuda.tracker, "home")
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, "1.0" if room in ("kitchen", "dining_room") else "8.0")
    await hass.async_block_till_done()
    # let the debounce fire directly, rather than through `observe()`: that helper
    # rewrites every sensor's reading (including the two set above) before ticking,
    # which would erase the very setup this test depends on
    freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get("binary_sensor.scott_moving").state == "on"


async def test_presence_off_creates_no_presence_entities(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    await add_entry(hass, rooms_config())
    assert hass.states.get("sensor.scott_room") is None
    assert hass.states.get("binary_sensor.scott_moving") is None
    assert hass.states.get("sensor.kitchen_occupants") is None
    assert dr.async_get(hass).async_get_device(identifiers={(DOMAIN, "presence_scott")}) is None


async def test_no_bermuda_creates_no_presence_entities(hass: HomeAssistant) -> None:
    await add_entry(hass)  # presence on, Bermuda absent
    assert hass.states.get("sensor.scott_room") is None
    assert hass.states.get("sensor.kitchen_occupants") is None
    # and the ordinary entities are untouched
    assert hass.states.get("sensor.kitchen_activity_level") is not None


async def test_a_removed_tracked_device_takes_its_device_with_it(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    fake_bermuda(hass)
    entry = await add_entry(hass)
    devices = dr.async_get(hass)
    assert devices.async_get_device(identifiers={(DOMAIN, "presence_scott")}) is not None

    options = dict(entry.options)
    options["presence"] = {**options["presence"], "devices": [], "people": []}
    hass.config_entries.async_update_entry(entry, options=options)
    await hass.async_block_till_done()

    stale = devices.async_get_device(identifiers={(DOMAIN, "presence_scott")})
    assert stale is None or entry.entry_id not in stale.config_entries
