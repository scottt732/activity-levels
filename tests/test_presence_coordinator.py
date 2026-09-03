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
    presence_storage_key,
)
from custom_components.activity_levels.diagnostics import async_get_config_entry_diagnostics
from custom_components.activity_levels.presence_coordinator import (
    OBSERVATION_DEBOUNCE,
    REGISTRY_DEBOUNCE,
)
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import FakeBermuda, fake_bermuda, presence_config, rooms_config

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
    track = presence.devices["Scott"]
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
    assert presence.devices["Scott"].tracker == bermuda.tracker


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
    track = presence.devices["Scott"]

    for room, entity_id in bermuda.sensors.items():
        feet = 9.84 if room == "kitchen" else 32.81  # 3 m and 10 m
        hass.states.async_set(entity_id, str(feet), {"unit_of_measurement": "ft"})
    hass.states.async_set(
        bermuda.sensors["hall"], "5.0", {"unit_of_measurement": "m"}
    )  # a sensor left in metres still reads as metres

    distances = presence._observation(track, 0.0).distances
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
    assert stored["beliefs"]["Scott"]["states"][0] == "kitchen"

    # with no readings left, only a restored belief can still name the hall
    await blank(hass, bermuda)
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    presence = entry.runtime_data.presence
    assert presence is not None
    outputs = presence.devices["Scott"].outputs
    assert outputs is not None and outputs.room == "hall"


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
