"""Coordinator behaviour: state events, timers, persistence."""

from collections.abc import AsyncGenerator
from datetime import timedelta
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.activity_levels.coordinator import ActivityLevelsCoordinator
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.tree import build_tree
from tests.fixtures import house_config


@pytest.fixture
async def coordinator(hass: HomeAssistant) -> AsyncGenerator[ActivityLevelsCoordinator]:
    hass.states.async_set("binary_sensor.front_door", "off")
    hass.states.async_set("binary_sensor.living_motion", "off")
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    hass.states.async_set("media_player.tv", "idle")
    coord = ActivityLevelsCoordinator(hass, "entry1", build_tree(validate_config(house_config())))
    await coord.async_start()
    yield coord
    await coord.async_stop()  # cancel timers so the harness sees no lingering handles


async def advance(hass: HomeAssistant, freezer: FrozenDateTimeFactory, seconds: float) -> None:
    freezer.tick(timedelta(seconds=seconds))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def test_note_on_propagates_up_the_tree(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    assert coordinator.data["house"].value == 0.0
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    assert coordinator.data["living_room"].value == pytest.approx(2.0)
    assert coordinator.data["house"].value == pytest.approx(2.0)  # max mix
    assert coordinator.data["living_room"].gated is True
    assert coordinator.data["living_room"].contributors["binary_sensor.living_motion"] == 2.0


async def test_note_off_then_decay_with_timer(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    await hass.async_block_till_done()
    k = coordinator.data["kitchen"]
    assert k.gated is False and k.cooldown_at is not None
    # release 5m is the time to fall from full scale (max_value 5.0); this voice's
    # gain is 1.0, so it is a fifth of the way up and falls in a fifth of the time.
    assert k.cooldown_at == pytest.approx(coordinator.now() + 60.0, abs=1.0)
    await advance(hass, freezer, 30.0)
    assert coordinator.data["kitchen"].value == pytest.approx(0.5, abs=0.06)
    await advance(hass, freezer, 28.0)  # display is 0.0 while the voice is still releasing
    assert coordinator.data["kitchen"].value == 0.0
    assert coordinator.data["kitchen"].contributors == {}  # no 0.0 entries
    await advance(hass, freezer, 40.0)
    assert coordinator.data["kitchen"].value == 0.0
    assert coordinator.data["kitchen"].active is False


async def test_listener_called_only_on_change(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    calls: list[int] = []
    coordinator.async_add_listener("house", lambda: calls.append(1))
    await advance(hass, freezer, 600.0)
    assert calls == []
    hass.states.async_set("binary_sensor.front_door", "on")
    await hass.async_block_till_done()
    assert len(calls) == 1


async def test_unavailable_hold_and_recovery(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("media_player.tv", "playing")
    await hass.async_block_till_done()
    assert coordinator.data["living_room"].gated is True
    hass.states.async_set("media_player.tv", "unavailable")
    await hass.async_block_till_done()
    assert coordinator.data["living_room"].gated is True
    hass.states.async_set("media_player.tv", "idle")
    await hass.async_block_till_done()
    assert coordinator.data["living_room"].gated is False


async def test_safety_wake_releases_a_voice_whose_entity_vanished(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    """A deleted entity never sends another event; the safety wake has to notice."""
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    assert coordinator.data["kitchen"].gated is True
    hass.states.async_remove("binary_sensor.kitchen_motion")
    await hass.async_block_till_done()
    assert coordinator.data["kitchen"].gated is True  # hold, until we know it is really gone
    await advance(hass, freezer, 61.0)  # safety_refresh
    assert coordinator.data["kitchen"].gated is False
    assert coordinator.data["kitchen"].cooldown_at is not None
    await advance(hass, freezer, 30.0)  # halfway down a 60s release
    assert 0.0 < coordinator.data["kitchen"].value < 1.0


async def test_safety_wake_keeps_holding_an_unavailable_entity(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    """Absence is the only thing the safety wake reconciles: 'unavailable' still holds."""
    hass.states.async_set("media_player.tv", "playing")
    await hass.async_block_till_done()
    hass.states.async_set("media_player.tv", "unavailable")
    await hass.async_block_till_done()
    await advance(hass, freezer, 61.0)
    assert coordinator.data["living_room"].gated is True


async def test_attribute_only_change_does_not_retrigger_impulse(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.front_door", "on")
    await hass.async_block_till_done()
    await advance(hass, freezer, 300.0)
    before = coordinator.data["house"].value
    hass.states.async_set("binary_sensor.front_door", "on", {"battery": 50})
    await hass.async_block_till_done()
    assert coordinator.data["house"].value == pytest.approx(before, abs=0.01)


async def test_trigger_and_reset(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    coordinator.trigger("kitchen", peak=3.0)
    assert coordinator.data["kitchen"].value == pytest.approx(3.0)
    assert coordinator.data["kitchen"].contributors["trigger"] == 3.0
    coordinator.reset("kitchen")
    assert coordinator.data["kitchen"].value == 0.0


async def test_snapshot_persists_and_restores(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    hass_storage: dict,
    coordinator: ActivityLevelsCoordinator,
) -> None:
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    await hass.async_block_till_done()
    await coordinator.async_stop()
    assert "activity_levels.entry1" in hass_storage
    await advance(hass, freezer, 20.0)  # a third of the way down a 60s release
    coord2 = ActivityLevelsCoordinator(hass, "entry1", build_tree(validate_config(house_config())))
    await coord2.async_start()
    assert coord2.data["kitchen"].value == pytest.approx(2.0 / 3.0, abs=0.05)
    await coord2.async_stop()


async def test_restore_reconciles_with_current_state(
    hass: HomeAssistant, hass_storage: dict, coordinator: ActivityLevelsCoordinator
) -> None:
    await coordinator.async_stop()
    hass.states.async_set("media_player.tv", "playing")  # held while we were down
    coord2 = ActivityLevelsCoordinator(hass, "entry1", build_tree(validate_config(house_config())))
    await coord2.async_start()
    assert coord2.data["living_room"].gated is True
    await coord2.async_stop()


async def test_timer_delay_is_floored(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.living_motion", "off")
    await hass.async_block_till_done()
    assert coordinator.next_wake("house") is not None
    assert coordinator.next_wake("house") - coordinator.now() >= 1.0


async def test_child_group_steps_are_scheduled(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    """A non-leading child's own rounding steps must drive the root's wake."""
    hass.states.async_set("binary_sensor.living_motion", "on")  # house pinned at 2.0
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    await hass.async_block_till_done()
    await advance(hass, freezer, 7.0)  # 1.0 falls in 60s -> a 0.1 display step every 6s
    assert coordinator.data["kitchen"].value == pytest.approx(0.9, abs=0.01)
    assert coordinator.next_wake("house") - coordinator.now() <= 7.0


async def test_trigger_rejects_non_positive_or_non_finite_peak(
    coordinator: ActivityLevelsCoordinator,
) -> None:
    for bad in (0.0, -1.0, float("inf"), float("nan")):
        with pytest.raises(ValueError, match="positive finite"):
            coordinator.trigger("kitchen", peak=bad)
    assert coordinator.data["kitchen"].value == 0.0


async def test_no_timers_or_saves_after_stop(coordinator: ActivityLevelsCoordinator) -> None:
    await coordinator.async_stop()
    assert coordinator.next_wake("house") is None
    coordinator.trigger("kitchen", peak=2.0)
    assert coordinator.next_wake("house") is None
    assert coordinator._timers == {}


async def test_mute_takes_a_child_out_of_its_parent(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    assert coordinator.data["house"].value == pytest.approx(2.0)
    coordinator.set_muted("living_room", True)
    assert coordinator.data["house"].value == 0.0
    assert coordinator.data["house"].contributors == {}
    # the room's own sensor keeps working while the house ignores it
    assert coordinator.data["living_room"].value == pytest.approx(2.0)
    assert coordinator.data["living_room"].muted is True
    assert coordinator.data["house"].muted is False
    coordinator.set_muted("living_room", False)
    assert coordinator.data["house"].value == pytest.approx(2.0)


async def test_muting_a_root_is_recorded_and_does_nothing(
    coordinator: ActivityLevelsCoordinator,
) -> None:
    coordinator.set_muted("house", True)
    assert coordinator.data["house"].muted is True
    assert coordinator.data["house"].value == 0.0


async def test_mute_publishes_and_reschedules_the_parent(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    calls: list[str] = []
    coordinator.async_add_listener("house", lambda: calls.append("house"))
    coordinator.async_add_listener("kitchen", lambda: calls.append("kitchen"))
    timer = coordinator._timers["house"]
    coordinator.set_muted("kitchen", True)
    assert sorted(calls) == ["house", "kitchen"]
    assert coordinator._timers["house"] is not timer


async def test_mute_survives_a_restart_and_forgets_vanished_groups(
    hass: HomeAssistant, hass_storage: dict, coordinator: ActivityLevelsCoordinator
) -> None:
    coordinator.set_muted("kitchen", True)
    await coordinator.async_stop()
    stored = hass_storage["activity_levels.entry1"]["data"]
    assert stored["muted"] == {"kitchen": True}
    stored["muted"]["conservatory"] = True  # a group the config no longer has
    coord2 = ActivityLevelsCoordinator(hass, "entry1", build_tree(validate_config(house_config())))
    await coord2.async_start()
    assert coord2.data["kitchen"].muted is True
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    assert coord2.data["kitchen"].value == pytest.approx(1.0)
    assert coord2.data["house"].value == 0.0
    await coord2.async_stop()
    assert hass_storage["activity_levels.entry1"]["data"]["muted"] == {"kitchen": True}


async def test_set_level_sizes_the_trigger_against_the_other_channels(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")  # a sum group, already at 2.0
    await hass.async_block_till_done()
    assert coordinator.set_level("living_room", 3.5) == pytest.approx(3.5)
    assert coordinator.data["living_room"].value == pytest.approx(3.5)
    # the override is not real activity, so real_value still reads the room itself
    assert coordinator.data["living_room"].real_value == pytest.approx(2.0)
    # and it is an absolute level: a second override replaces the first, never stacks
    assert coordinator.set_level("living_room", 3.0) == pytest.approx(3.0)


async def test_set_level_clamps_to_the_limiter_and_resets_at_zero(
    coordinator: ActivityLevelsCoordinator,
) -> None:
    assert coordinator.set_level("kitchen", 99.0) == pytest.approx(5.0)
    assert coordinator.set_level("kitchen", 0.0) == 0.0
    assert coordinator.data["kitchen"].contributors == {}


async def test_set_level_on_a_max_group_cannot_undercut_a_louder_child(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    assert coordinator.set_level("house", 4.0) == pytest.approx(4.0)
    # the living room is still at 2.0 and MAX keeps it; the caller is told what happened
    assert coordinator.set_level("house", 1.0) == pytest.approx(2.0)


def mean_config(null_handling: str) -> dict[str, Any]:
    """One MEAN group with a single stimulus, so an override has to carry the average."""
    return {
        "version": 1,
        "defaults": {"envelope": "default", "min_wake_interval": 1},
        "envelopes": [{"id": "default", "release": "30m"}],
        "groups": [
            {
                "id": "room",
                "name": "Room",
                "mix": "mean",
                "null_handling": null_handling,
                "max_value": 5.0,
                "stimuli": [{"entity": "binary_sensor.living_motion", "gain": 2.0}],
            }
        ],
    }


@pytest.mark.parametrize("null_handling", ["zero", "ignore"])
async def test_set_level_reaches_the_limiter_on_a_mean_group(
    hass: HomeAssistant, null_handling: str
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "off")
    coord = ActivityLevelsCoordinator(
        hass, "entry_mean", build_tree(validate_config(mean_config(null_handling)))
    )
    await coord.async_start()
    try:
        hass.states.async_set("binary_sensor.living_motion", "on")
        await hass.async_block_till_done()
        # averaging the stimulus at 2.0 with the trigger, the trigger has to reach 8.0
        # for the group to read its ceiling: a peak clamped at 5.0 tops out at 3.5
        assert coord.set_level("room", 5.0) == pytest.approx(5.0)
        assert coord.data["room"].value == pytest.approx(5.0)
    finally:
        await coord.async_stop()


async def test_set_level_rejects_negative_or_non_finite_values(
    coordinator: ActivityLevelsCoordinator,
) -> None:
    for bad in (-1.0, float("inf"), float("nan")):
        with pytest.raises(ValueError, match="non-negative finite"):
            coordinator.set_level("kitchen", bad)
    assert coordinator.data["kitchen"].value == 0.0
