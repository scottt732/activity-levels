"""Coordinator behaviour: state events, timers, persistence."""

from collections.abc import AsyncGenerator
from datetime import timedelta

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
    assert k.cooldown_at == pytest.approx(coordinator.now() + 300.0, abs=1.0)
    await advance(hass, freezer, 150.0)
    assert coordinator.data["kitchen"].value == pytest.approx(0.5, abs=0.06)
    await advance(hass, freezer, 200.0)
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
    await advance(hass, freezer, 100.0)
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
    await advance(hass, freezer, 31.0)  # 300s release from 1.0 -> 0.1 per 30s
    assert coordinator.data["kitchen"].value == pytest.approx(0.9, abs=0.01)
    assert coordinator.next_wake("house") - coordinator.now() <= 31.0


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
