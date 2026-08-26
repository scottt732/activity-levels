"""Presence simulation: preconditions, switches, the service and the action log.

The clock is frozen throughout: plans are sampled from a hand-written profile whose
kitchen light is certain to be on between 18:00 and 23:00, so the only thing left to
assert is *whether* the runtime scheduled and executed the plan, never the sampler's
own randomness (that is covered by ``tests/patterns/test_planner.py``).
"""

from __future__ import annotations

import copy
from datetime import datetime
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant, State
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
    async_mock_service,
    mock_restore_cache,
)

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.patterns.profile import SLOTS
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config

LIGHT = "light.kitchen"
AWAY = "binary_sensor.nobody_home"
MOTION = "binary_sensor.kitchen_motion"
GROUP_SWITCH = "switch.kitchen_presence_simulation"
GLOBAL_SWITCH = "switch.activity_levels_presence_simulation"

DAY = "2026-08-26"  # a Wednesday, so day_type_now() is "weekday"
EVENING = f"{DAY} 17:00:00"
AFTERNOON = f"{DAY} 16:00:00"
AFTER_ON = f"{DAY} 18:30:00"
AFTER_OFF = f"{DAY} 23:30:00"


def _p_on() -> list[float]:
    """P(on) = 1 for every slot from 18:00 up to 23:00, 0 everywhere else."""
    curve = [0.0] * SLOTS
    for slot in range(72, 92):
        curve[slot] = 1.0
    return curve


def _profile(now: float) -> dict[str, Any]:
    return {
        "version": 1,
        "producer": {"name": "builtin", "version": "0.1.0"},
        "generated_at": now,
        "training_window": [now - 86400.0, now],
        "day_types": ["weekday", "weekend", "holiday"],
        "slot_minutes": 15,
        "groups": {
            "kitchen": {
                "ready": True,
                "days": 30,
                "expected": {"weekday": [[0.0, 0.0, 0.0] for _ in range(SLOTS)]},
                "lights": {
                    LIGHT: {
                        "p_on": {"weekday": _p_on()},
                        "on_starts": {"weekday": [1080]},
                        "off_starts": {"weekday": [1380]},
                        "brightness": 200,
                    }
                },
            }
        },
    }


def _config(area_id: str, quiet: list[str] | None) -> dict[str, Any]:
    config = copy.deepcopy(house_config())
    config["defaults"]["simulation"] = {
        "away_entity": AWAY,
        "quiet_hours": quiet if quiet is not None else ["01:00", "05:30"],
    }
    kitchen = config["groups"][0]["children"][1]
    assert kitchen["id"] == "kitchen"
    kitchen["area"] = area_id
    return config


async def _setup(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    *,
    quiet: list[str] | None = None,
    when: str = EVENING,
    away: str = "on",
    restore: bool = False,
) -> MockConfigEntry:
    """A loaded entry whose kitchen owns ``light.kitchen`` and a ready profile."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(when)

    area = ar.async_get(hass).async_get_or_create("kitchen")
    entities = er.async_get(hass)
    light = entities.async_get_or_create(
        "light", "demo", "kitchen-light", suggested_object_id="kitchen"
    )
    entities.async_update_entity(light.entity_id, area_id=area.id)
    assert light.entity_id == LIGHT

    hass.states.async_set(LIGHT, "off")
    hass.states.async_set(AWAY, away)
    for entity_id in ("binary_sensor.front_door", "binary_sensor.living_motion", MOTION):
        hass.states.async_set(entity_id, "off")
    hass.states.async_set("media_player.tv", "idle")

    if restore:
        mock_restore_cache(hass, (State(GLOBAL_SWITCH, "on"), State(GROUP_SWITCH, "on")))

    entry = MockConfigEntry(
        domain=DOMAIN,
        data={},
        options=validate_config(_config(area.id, quiet)),
        title="Activity Levels",
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await entry.runtime_data.patterns.async_set_profile(_profile(dt_util.utcnow().timestamp()))
    await hass.async_block_till_done()
    return entry


async def _switch(hass: HomeAssistant, entity_id: str, on: bool) -> None:
    await hass.services.async_call(
        "switch", "turn_on" if on else "turn_off", {"entity_id": entity_id}, blocking=True
    )
    await hass.async_block_till_done()


async def _arm(hass: HomeAssistant) -> None:
    await _switch(hass, GLOBAL_SWITCH, True)
    await _switch(hass, GROUP_SWITCH, True)


async def _advance(hass: HomeAssistant, freezer: FrozenDateTimeFactory, when: str) -> None:
    freezer.move_to(when)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


def _local(t: float) -> datetime:
    return dt_util.as_local(dt_util.utc_from_timestamp(t))


# -- entities -----------------------------------------------------------------


async def test_switches_exist_for_a_group_with_lights(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await _setup(hass, freezer)

    assert hass.states.get(GLOBAL_SWITCH) is not None
    assert hass.states.get(GROUP_SWITCH) is not None
    # the living room has an area but no lights in it, and the house has no area at all
    assert hass.states.get("switch.living_room_presence_simulation") is None
    assert hass.states.get("switch.house_presence_simulation") is None


async def test_switch_state_is_restored(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    entry = await _setup(hass, freezer, restore=True)

    assert (state := hass.states.get(GROUP_SWITCH)) is not None and state.state == "on"
    assert (state := hass.states.get(GLOBAL_SWITCH)) is not None and state.state == "on"
    simulation = entry.runtime_data.patterns.simulation
    assert simulation.global_on is True
    assert simulation.group_on("kitchen") is True
    assert simulation.is_active("kitchen") is True


# -- the happy path -----------------------------------------------------------


async def test_plan_drives_the_light(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    calls = async_mock_service(hass, "light", "turn_on")
    entry = await _setup(hass, freezer)
    simulation = entry.runtime_data.patterns.simulation

    await _arm(hass)
    assert simulation.is_active("kitchen") is True
    plan = simulation.plan_for("kitchen")
    assert [action.on for action in plan] == [True, False]

    await _advance(hass, freezer, AFTER_ON)
    assert [call.data["entity_id"] for call in calls] == [LIGHT]
    assert calls[0].data["brightness"] == 200


async def test_executed_actions_reach_the_log(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    async_mock_service(hass, "light", "turn_on")
    entry = await _setup(hass, freezer)
    simulation = entry.runtime_data.patterns.simulation

    await _arm(hass)
    await _advance(hass, freezer, AFTER_ON)

    rows = simulation.log()
    assert len(rows) == 1
    assert rows[0]["entity_id"] == LIGHT
    assert rows[0]["group_id"] == "kitchen"
    assert rows[0]["on"] is True
    assert rows[0]["brightness"] == 200


# -- preconditions ------------------------------------------------------------


async def test_real_activity_cancels_the_plan(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    on_calls = async_mock_service(hass, "light", "turn_on")
    off_calls = async_mock_service(hass, "light", "turn_off")
    entry = await _setup(hass, freezer)
    simulation = entry.runtime_data.patterns.simulation

    await _arm(hass)
    await _advance(hass, freezer, AFTER_ON)
    assert len(on_calls) == 1

    hass.states.async_set(MOTION, "on")
    await hass.async_block_till_done()
    assert entry.runtime_data.coordinator.data["kitchen"].real_value > 0.0
    assert simulation.is_active("kitchen") is False

    await _advance(hass, freezer, AFTER_OFF)
    assert off_calls == []


async def test_group_switch_off_cancels_the_plan(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    off_calls = async_mock_service(hass, "light", "turn_off")
    async_mock_service(hass, "light", "turn_on")
    entry = await _setup(hass, freezer)
    simulation = entry.runtime_data.patterns.simulation

    await _arm(hass)
    await _switch(hass, GROUP_SWITCH, False)
    assert simulation.is_active("kitchen") is False
    assert simulation.plan_for("kitchen") == []

    await _advance(hass, freezer, AFTER_OFF)
    assert off_calls == []


async def test_global_switch_off_cancels_the_plan(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    async_mock_service(hass, "light", "turn_on")
    entry = await _setup(hass, freezer)
    simulation = entry.runtime_data.patterns.simulation

    await _arm(hass)
    await _switch(hass, GLOBAL_SWITCH, False)
    assert simulation.is_active("kitchen") is False


async def test_coming_home_cancels_the_plan(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    off_calls = async_mock_service(hass, "light", "turn_off")
    async_mock_service(hass, "light", "turn_on")
    entry = await _setup(hass, freezer)
    simulation = entry.runtime_data.patterns.simulation

    await _arm(hass)
    hass.states.async_set(AWAY, "off")
    await hass.async_block_till_done()
    assert simulation.is_active("kitchen") is False

    await _advance(hass, freezer, AFTER_OFF)
    assert off_calls == []


async def test_nothing_runs_while_someone_is_home(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    entry = await _setup(hass, freezer, away="off")
    simulation = entry.runtime_data.patterns.simulation

    await _arm(hass)
    assert simulation.is_active("kitchen") is False

    hass.states.async_set(AWAY, "on")
    await hass.async_block_till_done()
    assert simulation.is_active("kitchen") is True


# -- quiet hours --------------------------------------------------------------


async def test_quiet_hours_hold_the_light_off(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    entry = await _setup(hass, freezer, quiet=["17:00", "20:00"], when=AFTERNOON)
    simulation = entry.runtime_data.patterns.simulation

    await _arm(hass)
    ons = [action for action in simulation.plan_for("kitchen") if action.on]
    assert ons, "the plan should still switch the light on, just not inside quiet hours"
    for action in ons:
        assert _local(action.t).hour >= 20


# -- the service --------------------------------------------------------------


async def test_simulate_now_ignores_the_switches(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    calls = async_mock_service(hass, "light", "turn_on")
    entry = await _setup(hass, freezer)
    simulation = entry.runtime_data.patterns.simulation
    assert simulation.is_active("kitchen") is False

    await hass.services.async_call(DOMAIN, "simulate_now", {"group_id": "kitchen"}, blocking=True)
    await hass.async_block_till_done()
    assert simulation.is_active("kitchen") is True

    await _advance(hass, freezer, AFTER_ON)
    assert [call.data["entity_id"] for call in calls] == [LIGHT]


async def test_simulate_now_still_needs_the_house_empty(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    entry = await _setup(hass, freezer, away="off")

    await hass.services.async_call(DOMAIN, "simulate_now", {"group_id": "kitchen"}, blocking=True)
    await hass.async_block_till_done()
    assert entry.runtime_data.patterns.simulation.is_active("kitchen") is False


async def test_simulate_now_rejects_an_unknown_group(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await _setup(hass, freezer)

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "simulate_now", {"group_id": "no_such_group"}, blocking=True
        )
