"""PresenceCoordinator: discovery, repair issues, observations, occupancy, persistence."""

from __future__ import annotations

from datetime import timedelta
from itertools import count
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.activity_levels.const import (
    DOMAIN,
    ISSUE_BERMUDA_MISSING,
    ISSUE_DISABLED_SENSORS,
    ISSUE_NOT_BERMUDA,
    ISSUE_TRANSITION,
    ISSUE_UNMAPPED_SCANNERS,
    PRESENCE_KEY,
    PRESENCE_STORAGE_VERSION,
    presence_labels_key,
    presence_storage_key,
)
from custom_components.activity_levels.diagnostics import async_get_config_entry_diagnostics
from custom_components.activity_levels.presence_coordinator import (
    OBSERVATION_DEBOUNCE,
    REGISTRY_DEBOUNCE,
)
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import build_topology
from tests.fixtures import (
    FakeBermuda,
    fake_bermuda,
    fake_companion,
    fake_person,
    fake_watch,
    presence_config,
    rooms_config,
)

ROOM_SENSORS = (
    "binary_sensor.kitchen_motion",
    "binary_sensor.dining_motion",
    "binary_sensor.hall_motion",
    "binary_sensor.bedroom_motion",
    "binary_sensor.patio_motion",
)
ROOMS = {"kitchen", "dining_room", "hall", "bedroom", "back_patio"}


async def add_entry(hass: HomeAssistant, config: dict[str, Any] | None = None) -> MockConfigEntry:
    for entity_id in ROOM_SENSORS:
        hass.states.async_set(entity_id, "off")
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={},
        options=validate_config(config or presence_config()),
        title="Activity Levels",
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


_TICK = count()


async def observe(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    bermuda: FakeBermuda,
    near: str,
    *,
    home: bool = True,
) -> None:
    """Write one batch of distances, then let the debounce fire.

    Every batch carries a millimetre of jitter, because a reading written twice with the
    same value fires no state event at all -- and a real radio never repeats itself.
    """
    jitter = 0.001 * (next(_TICK) % 7)
    hass.states.async_set(bermuda.tracker, "home" if home else "not_home")
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, f"{(0.5 if room == near else 8.0) + jitter:.3f}")
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def blank(hass: HomeAssistant, bermuda: FakeBermuda) -> None:
    """Take every reading away, so only a belief can still name a room."""
    for entity_id in bermuda.sensors.values():
        hass.states.async_set(entity_id, STATE_UNKNOWN)
    await hass.async_block_till_done()


# -- discovery ---------------------------------------------------------------


async def test_discovery_finds_the_scanners_and_the_distance_sensors(
    hass: HomeAssistant,
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence

    assert presence is not None and presence.ready
    assert set(presence.devices) == {"Scott"}
    (track,) = presence.people["Scott"].devices.values()
    assert track.tracker == bermuda.tracker
    assert set(track.sensors.values()) == set(presence.scanner_map)
    assert set(presence.scanner_map.values()) == ROOMS
    assert presence.unmapped == []
    # the device-level "area" sensor is not a per-scanner reading
    assert all("_area" not in entity_id for entity_id in track.sensors)


async def test_an_unnamed_device_is_called_after_its_device_not_its_tracker(
    hass: HomeAssistant,
) -> None:
    """Bermuda calls every tracker "Bermuda Tracker", so the device is the only name."""
    fake_bermuda(hass)
    config = presence_config()
    config["presence"]["devices"] = [{"device": "device_tracker.scotts_phone", "name": None}]
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence

    assert presence is not None and presence.ready
    assert set(presence.devices) == {"Scott's Phone"}


async def test_scanner_areas_override_the_area_mapping(hass: HomeAssistant) -> None:
    bermuda = fake_bermuda(hass, unmapped=("hall",))
    config = presence_config()
    config["presence"]["scanner_areas"] = {bermuda.scanner_devices["hall"]: "hall"}
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence
    assert presence is not None
    assert presence.unmapped == []
    assert set(presence.scanner_map.values()) == ROOMS


# -- people and devices ------------------------------------------------------


def people_config(**person: Any) -> dict[str, Any]:
    """`presence_config` with the legacy list replaced by one explicit person."""
    config = presence_config()
    config["presence"]["devices"] = []
    config["presence"]["people"] = [{"name": "Scott", **person}]
    return config


async def test_a_person_entity_seeds_the_devices_and_pairs_the_companion(
    hass: HomeAssistant,
) -> None:
    bermuda = fake_bermuda(hass)
    watch = fake_watch(hass, bermuda)
    companion = fake_companion(hass)
    fake_person(hass, [bermuda.tracker, watch.tracker, companion.tracker])
    entry = await add_entry(hass, people_config(person="person.scott", devices=[]))
    presence = entry.runtime_data.presence
    assert presence is not None and presence.ready

    scott = presence.people["Scott"]
    assert scott.person == "person.scott"
    by_tracker = {device.tracker: device for device in scott.devices.values()}
    assert set(by_tracker) == {bermuda.tracker, watch.tracker}
    # two Bermuda devices and one companion: nothing is paired by guesswork
    assert by_tracker[bermuda.tracker].companion is None
    assert by_tracker[watch.tracker].companion is None
    assert by_tracker[bermuda.tracker].name == "Scott's Phone"
    assert by_tracker[bermuda.tracker].kind == "other"


async def test_one_bermuda_device_and_one_companion_pair_up(hass: HomeAssistant) -> None:
    bermuda = fake_bermuda(hass)
    companion = fake_companion(hass)
    fake_person(hass, [bermuda.tracker, companion.tracker])
    entry = await add_entry(hass, people_config(person="person.scott", devices=[]))
    presence = entry.runtime_data.presence
    assert presence is not None
    (device,) = presence.people["Scott"].devices.values()
    assert device.companion == companion.tracker
    assert device.kind == "phone"
    assert device.signals == companion.signals
    assert device.found == {"activity": True, "steps": True, "battery_state": True}


async def test_explicit_config_wins_over_the_seed(hass: HomeAssistant) -> None:
    bermuda = fake_bermuda(hass)
    companion = fake_companion(hass)
    fake_person(hass, [bermuda.tracker, companion.tracker])
    entry = await add_entry(
        hass,
        people_config(
            person="person.scott",
            devices=[
                {
                    "tracker": bermuda.tracker,
                    "name": "Pocket phone",
                    "kind": "phone",
                    "companion": companion.tracker,
                    "signals": {"steps": "sensor.somewhere_else"},
                }
            ],
        ),
    )
    presence = entry.runtime_data.presence
    assert presence is not None
    (device,) = presence.people["Scott"].devices.values()
    assert device.name == "Pocket phone"
    assert device.signals["steps"] == "sensor.somewhere_else"
    assert device.found["steps"] is False
    assert device.signals["activity"] == companion.signals["activity"]
    assert device.found["activity"] is True


async def test_a_person_without_a_name_is_called_after_the_first_device(
    hass: HomeAssistant,
) -> None:
    bermuda = fake_bermuda(hass)
    config = presence_config()
    config["presence"]["devices"] = []
    config["presence"]["people"] = [{"devices": [{"tracker": bermuda.tracker}]}]
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence
    assert presence is not None
    assert set(presence.people) == {"Scott's Phone"}


async def test_the_person_filter_runs_over_every_device(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    watch = fake_watch(hass, bermuda)
    entry = await add_entry(
        hass,
        people_config(
            devices=[
                {"tracker": bermuda.tracker, "kind": "phone"},
                {"tracker": watch.tracker, "kind": "watch"},
            ]
        ),
    )
    presence = entry.runtime_data.presence
    assert presence is not None
    hass.states.async_set(bermuda.tracker, "home")
    hass.states.async_set(watch.tracker, "home")
    for _ in range(4):
        for room, entity_id in bermuda.sensors.items():
            hass.states.async_set(entity_id, f"{0.5 if room == 'kitchen' else 8.0:.3f}")
        for room, entity_id in watch.sensors.items():
            hass.states.async_set(entity_id, f"{0.5 if room == 'kitchen' else 8.0:.3f}")
        await hass.async_block_till_done()
        freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
        # a real radio never repeats itself
        for entity_id in (*bermuda.sensors.values(), *watch.sensors.values()):
            state = hass.states.get(entity_id)
            hass.states.async_set(entity_id, f"{float(state.state) + 0.001:.3f}")
    out = presence.people["Scott"].outputs
    assert out is not None and out.room == "kitchen"
    assert set(out.carried) == set(presence.people["Scott"].devices)
    assert presence.occupants["kitchen"] == ["Scott"]
    for device in presence.people["Scott"].devices.values():
        assert device.outputs is not None and device.outputs.room == "kitchen"


async def test_a_charging_phone_is_read_as_parked(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    companion = fake_companion(hass)
    entry = await add_entry(
        hass,
        people_config(
            devices=[{"tracker": bermuda.tracker, "kind": "phone", "companion": companion.tracker}]
        ),
    )
    presence = entry.runtime_data.presence
    assert presence is not None
    hass.states.async_set(companion.signals["battery_state"], "charging")
    hass.states.async_set(companion.signals["activity"], "stationary")
    for _ in range(3):
        await observe(hass, freezer, bermuda, "kitchen")
        freezer.tick(timedelta(seconds=120))
    (device,) = presence.people["Scott"].devices
    out = presence.people["Scott"].outputs
    assert out is not None and out.carried[device] < 0.5
    frame = presence._frame(presence.people["Scott"].devices[device], presence.coordinator.now())
    assert frame.signals.charging is True
    assert frame.signals.moving is False


async def test_walking_and_rising_steps_read_as_moving(hass: HomeAssistant) -> None:
    bermuda = fake_bermuda(hass)
    companion = fake_companion(hass)
    entry = await add_entry(
        hass,
        people_config(
            devices=[{"tracker": bermuda.tracker, "kind": "phone", "companion": companion.tracker}]
        ),
    )
    presence = entry.runtime_data.presence
    assert presence is not None
    (device,) = presence.people["Scott"].devices.values()
    hass.states.async_set(companion.signals["activity"], "walking")
    assert presence._frame(device, 100.0).signals.moving is True
    hass.states.async_set(companion.signals["activity"], "stationary")
    hass.states.async_set(companion.signals["steps"], "1000")
    assert presence._frame(device, 200.0).signals.moving is False
    hass.states.async_set(companion.signals["steps"], "1020")
    assert presence._frame(device, 210.0).signals.moving is True
    assert presence._frame(device, 210.0 + 121.0).signals.moving is False


async def test_jitter_is_a_wandering_closest_distance(hass: HomeAssistant) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass, people_config(devices=[{"tracker": bermuda.tracker}]))
    presence = entry.runtime_data.presence
    assert presence is not None
    (device,) = presence.people["Scott"].devices.values()
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, "0.5" if room == "kitchen" else "8.0")
    assert presence._frame(device, 0.0).signals.jitter is None  # one sample says nothing
    assert presence._frame(device, 10.0).signals.jitter is False
    hass.states.async_set(bermuda.sensors["kitchen"], "2.5")
    assert presence._frame(device, 20.0).signals.jitter is True


async def test_the_parked_phone_scenario_end_to_end(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """The phone stays in the dining room; the watch and the motion go to the kitchen."""
    bermuda = fake_bermuda(hass)
    watch = fake_watch(hass, bermuda)
    entry = await add_entry(
        hass,
        people_config(
            devices=[
                {"tracker": bermuda.tracker, "kind": "phone"},
                {"tracker": watch.tracker, "kind": "watch"},
            ]
        ),
    )
    presence = entry.runtime_data.presence
    assert presence is not None
    hass.states.async_set(bermuda.tracker, "home")
    hass.states.async_set(watch.tracker, "home")

    async def tick(phone_room: str, watch_room: str, jitter: float) -> None:
        for room, entity_id in bermuda.sensors.items():
            hass.states.async_set(entity_id, f"{0.5 if room == phone_room else 8.0:.3f}")
        for room, entity_id in watch.sensors.items():
            hass.states.async_set(entity_id, f"{(0.5 if room == watch_room else 8.0) + jitter:.3f}")
        await hass.async_block_till_done()
        freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
        state = hass.states.get(bermuda.sensors[phone_room])
        hass.states.async_set(bermuda.sensors[phone_room], f"{float(state.state) + 0.001:.3f}")

    hass.states.async_set("binary_sensor.dining_motion", "on")
    for i in range(6):
        await tick("dining_room", "dining_room", 0.3 * (i % 2))
    assert presence.people["Scott"].outputs.room == "dining_room"

    hass.states.async_set("binary_sensor.dining_motion", "off")
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    freezer.tick(timedelta(hours=3))  # the dining room's level runs out
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    out = None
    for i in range(30):
        await tick("dining_room", "kitchen", 0.3 * (i % 2))
        out = presence.people["Scott"].outputs
        phone = next(d for d in presence.people["Scott"].devices.values() if d.kind == "phone")
        if out.room == "kitchen" and out.carried[phone.id] < 0.5:
            break
    assert out is not None and out.room == "kitchen"
    assert out.carried[phone.id] < 0.5
    assert out.device_rooms[phone.id] == "dining_room"


# -- corrections -------------------------------------------------------------


async def test_a_correction_moves_the_person_and_keeps_a_label(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    before = presence.people["Scott"].outputs
    assert before is not None and before.room == "kitchen"

    updates: list[None] = []
    presence.async_add_listener(lambda: updates.append(None))
    out = presence.correct("Scott", "hall", source="panel")
    assert out.room == "hall" and out.confidence == pytest.approx(1.0)
    assert out.carried == before.carried
    assert presence.people["Scott"].outputs is out
    assert presence.occupants["hall"] == ["Scott"] and presence.occupants["kitchen"] == []
    assert len(updates) == 1

    (label,) = presence.labels
    assert label["person"] == "Scott" and label["room"] == "hall" and label["source"] == "panel"
    (device_id,) = presence.people["Scott"].devices
    frame = label["frames"][device_id]
    assert set(frame) == {"distances", "home", "signals"}
    assert frame["home"] is True
    assert set(frame["distances"]) == set(presence.scanner_map)
    assert label["carried"] == before.carried
    assert set(label["activity"]) == ROOMS

    await presence.async_stop()
    await hass.async_block_till_done()
    stored = hass_storage[presence_labels_key(entry.entry_id)]["data"]
    assert stored["labels"][0]["room"] == "hall"


async def test_corrections_are_capped_newest_first(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    config = presence_config()
    config["presence"]["labels"] = {"keep": 100}
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence
    assert presence is not None
    await observe(hass, freezer, bermuda, "kitchen")
    for i in range(101):
        freezer.tick(timedelta(seconds=1))
        presence.correct("Scott", "hall" if i % 2 else "kitchen", source="service")
    assert len(presence.labels) == 100
    assert presence.labels[0]["t"] > presence.labels[-1]["t"]
    assert presence.delete_label(presence.labels[0]["t"], "Scott") is True
    assert len(presence.labels) == 99
    assert presence.delete_label(0.0, "Scott") is False


async def test_a_correction_refuses_an_unknown_person_or_room(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    with pytest.raises(ValueError, match="person"):
        presence.correct("Nobody", "hall", source="panel")
    with pytest.raises(ValueError, match="room"):
        presence.correct("Scott", "downstairs", source="panel")  # a branch, not a room


async def test_the_websocket_corrects_lists_and_deletes(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    await observe(hass, freezer, bermuda, "kitchen")
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/presence/correct", "person": "Scott", "room": "hall"}
    )
    msg = await client.receive_json()
    assert msg["success"]
    assert msg["result"]["room"] == "hall" and msg["result"]["confidence"] == 1.0

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/presence/correct", "person": "Scott", "room": "nope"}
    )
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "not_found"
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/presence/correct", "person": "Nobody", "room": "hall"}
    )
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "not_found"

    await client.send_json_auto_id({"type": f"{DOMAIN}/presence/labels", "limit": 10})
    msg = await client.receive_json()
    assert msg["success"]
    (label,) = msg["result"]["labels"]
    assert label["room"] == "hall" and label["source"] == "panel"
    assert msg["result"]["total"] == 1

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/presence/labels/delete", "t": label["t"], "person": "Scott"}
    )
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["deleted"] is True
    await client.send_json_auto_id({"type": f"{DOMAIN}/presence/labels"})
    msg = await client.receive_json()
    assert msg["result"]["labels"] == [] and msg["result"]["total"] == 0


async def test_the_locate_service_corrects_a_person(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    await observe(hass, freezer, bermuda, "kitchen")
    await hass.services.async_call(
        DOMAIN, "locate", {"person": "Scott", "room": "hall"}, blocking=True
    )
    assert presence.people["Scott"].outputs.room == "hall"
    assert presence.labels[0]["source"] == "service"
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "locate", {"person": "Scott", "room": "nope"}, blocking=True
        )


# -- repair issues -----------------------------------------------------------


async def test_no_bermuda_raises_an_issue_and_leaves_the_entry_loaded(
    hass: HomeAssistant,
) -> None:
    entry = await add_entry(hass)  # no fake_bermuda call at all
    assert entry.state is ConfigEntryState.LOADED
    presence = entry.runtime_data.presence
    assert presence is not None and presence.ready is False
    assert presence.devices == {}
    issues = ir.async_get(hass)
    assert issues.async_get_issue(DOMAIN, f"{ISSUE_BERMUDA_MISSING}_{entry.entry_id}")


async def test_a_device_that_is_not_bermudas_raises_an_issue(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    # one entity that does not exist at all, one that exists but belongs to somebody else
    er.async_get(hass).async_get_or_create(
        "device_tracker", "demo", "someone", suggested_object_id="the_neighbour"
    )
    config = presence_config()
    config["presence"]["devices"] = [
        {"device": "device_tracker.somebody_elses", "name": "Ghost"},
        {"device": "device_tracker.the_neighbour", "name": "Neighbour"},
    ]
    entry = await add_entry(hass, config)
    issues = ir.async_get(hass)
    issue = issues.async_get_issue(DOMAIN, f"{ISSUE_NOT_BERMUDA}_{entry.entry_id}")
    assert issue is not None
    assert issue.translation_placeholders is not None
    named = issue.translation_placeholders["entities"]
    # the two mistakes have different fixes, so the issue has to tell them apart
    assert "device_tracker.somebody_elses (no such entity)" in named
    assert "device_tracker.the_neighbour (not a Bermuda entity)" in named
    assert entry.runtime_data.presence is not None
    assert entry.runtime_data.presence.devices == {}


async def test_disabled_distance_sensors_raise_an_issue_naming_the_fix(
    hass: HomeAssistant,
) -> None:
    bermuda = fake_bermuda(hass, disabled=("bedroom",))
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    assert bermuda.sensors["bedroom"] in presence.disabled
    assert "bedroom" not in presence.scanner_map.values()
    issue = ir.async_get(hass).async_get_issue(DOMAIN, f"{ISSUE_DISABLED_SENSORS}_{entry.entry_id}")
    assert issue is not None and issue.is_fixable is False


async def test_an_unmapped_scanner_raises_an_issue_and_is_ignored(
    hass: HomeAssistant,
) -> None:
    fake_bermuda(hass, unmapped=("hall",))
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    assert len(presence.unmapped) == 1
    assert "hall" not in presence.scanner_map.values()
    assert ir.async_get(hass).async_get_issue(DOMAIN, f"{ISSUE_UNMAPPED_SCANNERS}_{entry.entry_id}")


async def test_issues_are_cleared_when_the_problem_goes_away(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass, unmapped=("hall",))
    entry = await add_entry(hass)
    issues = ir.async_get(hass)
    assert issues.async_get_issue(DOMAIN, f"{ISSUE_UNMAPPED_SCANNERS}_{entry.entry_id}")

    dr.async_get(hass).async_update_device(
        bermuda.scanner_devices["hall"], area_id=bermuda.areas["hall"]
    )
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=REGISTRY_DEBOUNCE + 1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    presence = entry.runtime_data.presence
    assert presence is not None
    assert presence.unmapped == []
    assert set(presence.scanner_map.values()) == ROOMS
    assert issues.async_get_issue(DOMAIN, f"{ISSUE_UNMAPPED_SCANNERS}_{entry.entry_id}") is None


async def test_an_infeasible_transition_setting_raises_an_issue(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    config = presence_config()
    config["presence"].update(stay=0.99, escape=0.1)
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence
    assert presence is not None and presence.ready is False
    assert presence.devices == {}
    assert ir.async_get(hass).async_get_issue(DOMAIN, f"{ISSUE_TRANSITION}_{entry.entry_id}")


async def test_bermuda_still_starting_up_is_not_bermuda_missing(hass: HomeAssistant) -> None:
    """Nothing orders the two integrations, so a configured entry has to be enough."""
    bermuda = fake_bermuda(hass)
    hass.config.components.remove("bermuda")  # its component has not finished loading
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None and presence.ready
    assert set(presence.scanner_map.values()) == ROOMS
    assert (
        ir.async_get(hass).async_get_issue(DOMAIN, f"{ISSUE_BERMUDA_MISSING}_{entry.entry_id}")
        is None
    )
    (track,) = presence.people["Scott"].devices.values()
    assert track.tracker == bermuda.tracker


async def test_turning_presence_off_clears_the_issues_it_left_behind(
    hass: HomeAssistant,
) -> None:
    entry = await add_entry(hass)  # no Bermuda at all, so an issue is raised
    issues = ir.async_get(hass)
    assert issues.async_get_issue(DOMAIN, f"{ISSUE_BERMUDA_MISSING}_{entry.entry_id}")

    hass.config_entries.async_update_entry(entry, options=validate_config(rooms_config()))
    await hass.async_block_till_done()
    assert entry.runtime_data.presence is None
    # nothing is left to clear it, so setup has to
    assert issues.issues == {}


async def test_a_store_it_cannot_read_is_a_uniform_prior_not_a_failed_setup(
    hass: HomeAssistant, hass_storage: dict[str, Any]
) -> None:
    fake_bermuda(hass)
    for entity_id in ROOM_SENSORS:
        hass.states.async_set(entity_id, "off")
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={},
        options=validate_config(presence_config()),
        title="Activity Levels",
    )
    entry.add_to_hass(hass)
    key = presence_storage_key(entry.entry_id)
    hass_storage[key] = {"version": PRESENCE_STORAGE_VERSION, "key": key, "data": ["nonsense"]}

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    presence = entry.runtime_data.presence
    assert presence is not None and presence.ready


# -- observations and occupancy ---------------------------------------------


async def test_observations_are_coalesced_and_drive_the_room(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    updates: list[None] = []
    presence.async_add_listener(lambda: updates.append(None))

    await observe(hass, freezer, bermuda, "kitchen")
    outputs = presence.devices["Scott"].outputs
    assert outputs is not None and outputs.room == "kitchen"
    # five sensors and a tracker moved; one observation, so one notification
    assert len(updates) == 1


async def test_a_reading_in_feet_is_read_as_metres(hass: HomeAssistant) -> None:
    """A US-customary install converts every distance sensor to feet in the state machine.

    The filter's ``scale`` and ``floor`` are tuned for metres. Read feet as metres and a
    phone three metres from its scanner looks ten away -- far enough that every room
    with no scanner outranks it and the belief wanders the house all night.
    """
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    (track,) = presence.people["Scott"].devices.values()

    for room, entity_id in bermuda.sensors.items():
        feet = 9.84 if room == "kitchen" else 32.81  # 3 m and 10 m
        hass.states.async_set(entity_id, str(feet), {"unit_of_measurement": "ft"})
    hass.states.async_set(
        bermuda.sensors["hall"], "5.0", {"unit_of_measurement": "m"}
    )  # a sensor left in metres still reads as metres

    distances = presence._frame(track, 0.0).distances
    by_room = {presence.scanner_map[key]: value for key, value in distances.items()}
    assert by_room["kitchen"] == pytest.approx(3.0, abs=0.01)
    assert by_room["dining_room"] == pytest.approx(10.0, abs=0.01)
    assert by_room["hall"] == pytest.approx(5.0)


async def test_the_evidence_level_leaves_the_presence_channel_out(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    # the kitchen's only contributor is now its presence voice ...
    coordinator = entry.runtime_data.coordinator
    assert coordinator.data["kitchen"].contributors[PRESENCE_KEY] > 0.0
    # ... and the evidence level must not see it
    activity = presence._activity(coordinator.now())
    assert activity["kitchen"].level == 0.0
    assert set(activity) == ROOMS


async def test_a_room_s_activity_floor_override_reaches_the_filter(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    config = presence_config()
    config["groups"][0]["children"][0]["children"][0]["presence"]["activity_floor"] = 1.0
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence
    assert presence is not None
    activity = presence._activity(entry.runtime_data.coordinator.now())
    assert activity["kitchen"].floor == 1.0
    assert activity["hall"].floor is None


async def test_an_active_room_reads_as_active_evidence(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    hass.states.async_set("binary_sensor.hall_motion", "on")
    await hass.async_block_till_done()
    activity = presence._activity(entry.runtime_data.coordinator.now())
    assert activity["hall"].level > 0.0
    assert activity["kitchen"].level == 0.0


async def test_an_empty_room_loses_a_distance_tie(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Kitchen and dining room read the same; only the dining room shows any life."""
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    hass.states.async_set("binary_sensor.dining_motion", "on")
    hass.states.async_set(bermuda.tracker, "home")
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, "1.0" if room in ("kitchen", "dining_room") else "8.0")
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    out = presence.devices["Scott"].outputs
    assert out is not None and out.room == "dining_room"


async def test_a_room_emptying_out_is_a_frame_of_its_own(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """The kitchen's level falling to 0.0 re-runs the filter with no Bermuda change."""
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await observe(hass, freezer, bermuda, "kitchen")
    before = presence.devices["Scott"].outputs
    assert before is not None
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    await hass.async_block_till_done()
    # the kitchen's release (an hour, plus the presence voice's own) has to run out
    freezer.tick(timedelta(hours=3))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    after = presence.devices["Scott"].outputs
    assert after is not None and after.t > before.t


async def test_occupancy_notes_the_presence_voice_on_and_off(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    coordinator = entry.runtime_data.coordinator

    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    assert presence.occupants["kitchen"] == ["Scott"]
    assert coordinator.data["kitchen"].contributors[PRESENCE_KEY] > 0.0
    level = hass.states.get("sensor.kitchen_activity_level")
    assert level is not None and level.state != "0.0"

    for _ in range(6):
        await observe(hass, freezer, bermuda, "dining_room")
    assert presence.occupants["kitchen"] == []
    assert presence.occupants["dining_room"] == ["Scott"]
    assert coordinator.tree.groups["kitchen"].presence is not None
    assert coordinator.tree.groups["kitchen"].presence.gate is False
    assert coordinator.tree.groups["dining_room"].presence is not None
    assert coordinator.tree.groups["dining_room"].presence.gate is True


async def test_a_closed_gate_reopens_on_the_next_tick(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """``reset`` closes the gate under the coordinator; the next evaluation restores it."""
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    coordinator = entry.runtime_data.coordinator

    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    assert coordinator.tree.groups["kitchen"].presence is not None
    assert coordinator.tree.groups["kitchen"].presence.gate is True

    coordinator.reset("kitchen")
    assert coordinator.tree.groups["kitchen"].presence.gate is False

    await observe(hass, freezer, bermuda, "kitchen")
    assert presence.occupants["kitchen"] == ["Scott"]
    assert coordinator.tree.groups["kitchen"].presence.gate is True


async def test_every_tracker_vanishing_releases_the_gates(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Somebody deleting the Bermuda entity must not leave a room occupied forever.

    Discovery drops the device, so there is no longer anything to observe -- and an
    occupancy that is only recomputed when a filter ran would keep the last answer, with
    the presence voice held on in a room nothing can see into any more.
    """
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    coordinator = entry.runtime_data.coordinator

    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    assert presence.occupants["kitchen"] == ["Scott"]
    assert coordinator.tree.groups["kitchen"].presence is not None
    assert coordinator.tree.groups["kitchen"].presence.gate is True

    er.async_get(hass).async_remove(bermuda.tracker)
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=REGISTRY_DEBOUNCE + 1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert presence.devices == {}
    assert all(who == [] for who in presence.occupants.values())
    assert coordinator.tree.groups["kitchen"].presence.gate is False


async def test_below_the_threshold_nobody_is_an_occupant(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    config = presence_config()
    config["presence"]["threshold"] = 0.99
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence
    assert presence is not None

    hass.states.async_set(bermuda.tracker, "home")
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, "1.0" if room in ("kitchen", "dining_room") else "8.0")
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert all(who == [] for who in presence.occupants.values())
    outputs = presence.devices["Scott"].outputs
    assert outputs is not None and outputs.moving is True


async def test_going_away_empties_every_room(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    assert presence.occupants["kitchen"] == ["Scott"]

    for _ in range(6):
        await observe(hass, freezer, bermuda, "none", home=False)
    assert all(who == [] for who in presence.occupants.values())
    outputs = presence.devices["Scott"].outputs
    assert outputs is not None and outputs.room == "away"
    assert presence.room_name("away") == "Away"
    assert presence.room_name("kitchen") == "Kitchen"


# -- persistence and lifecycle ----------------------------------------------


async def test_the_belief_survives_a_reload(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "hall")
    assert entry.runtime_data.presence is not None
    await entry.runtime_data.presence.async_stop()
    await hass.async_block_till_done()
    stored = hass_storage[presence_storage_key(entry.entry_id)]["data"]
    assert stored["people"]["Scott"]["states"][0] == "kitchen"
    # HA's slugify spells the apostrophe out, as it does for entity ids
    assert stored["people"]["Scott"]["devices"] == ["scott_s_phone"]
    assert stored["devices"]["Scott"]["scott_s_phone"]["states"][0] == "kitchen"

    # with no readings left, only a restored belief can still name the hall
    await blank(hass, bermuda)
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    presence = entry.runtime_data.presence
    assert presence is not None
    outputs = presence.people["Scott"].outputs
    assert outputs is not None and outputs.room == "hall"
    (device,) = presence.people["Scott"].devices.values()
    assert device.outputs is not None and device.outputs.room == "hall"


async def test_a_store_from_before_people_had_devices_still_restores(
    hass: HomeAssistant, hass_storage: dict[str, Any]
) -> None:
    """The old store held one belief per name; it seeds the one device's filter."""
    bermuda = fake_bermuda(hass)
    topo = build_topology(validate_config(presence_config()))
    belief = [0.0] * len(topo.states)
    belief[topo.index("hall")] = 1.0
    hass_storage[presence_storage_key("legacy")] = {
        "version": PRESENCE_STORAGE_VERSION,
        "data": {"beliefs": {"Scott": {"states": list(topo.states), "belief": belief, "t": 1.0}}},
    }
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={},
        options=validate_config(presence_config()),
        title="Activity Levels",
        entry_id="legacy",
    )
    for entity_id in ROOM_SENSORS:
        hass.states.async_set(entity_id, "off")
    await blank(hass, bermuda)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    presence = entry.runtime_data.presence
    assert presence is not None
    (device,) = presence.people["Scott"].devices.values()
    assert device.outputs is not None and device.outputs.room == "hall"


async def test_a_changed_topology_discards_the_stored_belief(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "hall")
    assert entry.runtime_data.presence is not None
    await entry.runtime_data.presence.async_stop()
    await blank(hass, bermuda)

    smaller = presence_config()
    downstairs_children = smaller["groups"][0]["children"][0]["children"]
    downstairs_children[2]["adjacent"] = []  # hall no longer points to the bedroom
    del downstairs_children[3]  # an area with no edges is still a node now, so drop it outright
    hass.config_entries.async_update_entry(entry, options=validate_config(smaller))
    await hass.async_block_till_done()
    presence = entry.runtime_data.presence
    assert presence is not None
    estimator = presence.devices["Scott"].estimator
    assert estimator is not None and "bedroom" not in estimator.states
    # nothing restored, so the belief is the uniform prior it starts from
    outputs = presence.devices["Scott"].outputs
    assert outputs is not None and outputs.confidence < 0.5


async def test_presence_off_constructs_nothing(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    entry = await add_entry(hass, rooms_config())  # presence absent
    assert entry.runtime_data.presence is None
    assert entry.runtime_data.topology.nodes  # the graph still exists
    assert ir.async_get(hass).issues == {}
    coordinator = entry.runtime_data.coordinator
    assert coordinator.tree.groups["kitchen"].presence is None


# -- what the panel and a bug report see -------------------------------------


async def test_the_websocket_answers_with_the_presence_state(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass, disabled=("bedroom",))
    await add_entry(hass)
    await observe(hass, freezer, bermuda, "kitchen")

    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/presence/state"})
    msg = await client.receive_json()
    assert msg["success"]
    result = msg["result"]
    assert result["enabled"] is True
    assert result["devices"]["Scott"]["room"] == "kitchen"
    assert result["occupants"]["kitchen"] == ["Scott"]
    assert {scanner["group_id"] for scanner in result["scanners"]} == ROOMS - {"bedroom"}
    assert result["unmapped"] == []
    assert result["disabled"] == [bermuda.sensors["bedroom"]]


async def test_the_websocket_says_presence_is_off(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    await add_entry(hass, rooms_config())
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/presence/state"})
    msg = await client.receive_json()
    assert msg["success"]
    assert msg["result"] == {
        "bermuda": False,
        "enabled": False,
        "devices": {},
        "occupants": {},
        "scanners": [],
        "unmapped": [],
        "disabled": [],
    }


async def test_diagnostics_carry_the_presence_block(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    await observe(hass, freezer, bermuda, "kitchen")

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["presence"]["ready"] is True
    assert set(diag["presence"]["scanner_map"].values()) == ROOMS
    assert diag["presence"]["occupants"]["kitchen"] == ["Scott"]
    device = diag["presence"]["devices"]["Scott"]
    assert device["outputs"]["room"] == "kitchen"
    assert device["belief"]["states"][0] == "kitchen"
    assert device["resets"] == 0
