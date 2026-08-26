"""Light transition log store and light-group membership resolution."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.recorder import migration as _recorder_migration
from homeassistant.components.recorder.core import Recorder as _Recorder
from homeassistant.core import HomeAssistant, State
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import recorder as _recorder_helper
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)
from pytest_homeassistant_custom_component.components.recorder.common import (
    async_wait_recording_done,
)
from sqlalchemy.orm.session import Session as _Session

from custom_components.activity_levels.lightlog import LightLog, resolve_group_lights

# Python 3.14 evaluates deferred annotations eagerly when `unittest.mock.create_autospec`
# inspects a function's signature. `recorder.migration` and `helpers.recorder` only import
# `Recorder`/`Session` under `TYPE_CHECKING`, so the pytest-homeassistant-custom-component
# recorder fixtures -- which autospec-patch several of their functions -- hit a `NameError`
# before any of our code runs. Backfilling the names on the modules is enough for
# annotation evaluation to succeed; it changes no behaviour.
_recorder_migration.Recorder = _Recorder
_recorder_helper.Recorder = _Recorder
_recorder_helper.Session = _Session

T0 = datetime(2026, 1, 1, tzinfo=UTC).timestamp()


@pytest.fixture(autouse=True)
def _auto_enable_custom_integrations() -> None:
    """Override the project-wide autouse fixture (which pulls in ``hass``) for this file.

    ``recorder_mock`` needs to prepare the recorder's database *before* the ``hass``
    fixture body runs; nothing here sets up the ``activity_levels`` config entry through
    the real component loader, so custom-integration loading is not needed and the
    default override would otherwise force ``hass`` to initialize too early.
    """
    return None


@pytest.fixture
def entry(hass: HomeAssistant) -> MockConfigEntry:
    config_entry = MockConfigEntry(domain="activity_levels", data={})
    config_entry.add_to_hass(hass)
    return config_entry


# -- resolve_group_lights -----------------------------------------------------


def _light(
    entity_registry: er.EntityRegistry,
    entry: MockConfigEntry,
    object_id: str,
    *,
    device_id: str | None = None,
    area_id: str | None = None,
    disabled: bool = False,
) -> str:
    registered = entity_registry.async_get_or_create(
        "light",
        "test",
        object_id,
        config_entry=entry,
        device_id=device_id,
        disabled_by=er.RegistryEntryDisabler.USER if disabled else None,
    )
    if area_id is not None:
        entity_registry.async_update_entity(registered.entity_id, area_id=area_id)
    return registered.entity_id


def test_resolve_group_lights_by_device_and_entity_area(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    entity_registry: er.EntityRegistry,
    device_registry: dr.DeviceRegistry,
    area_registry: ar.AreaRegistry,
) -> None:
    kitchen = area_registry.async_create("Kitchen").id
    garage = area_registry.async_create("Garage").id
    device = device_registry.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("test", "kitchen-hub")}
    )
    device_registry.async_update_device(device.id, area_id=kitchen)

    via_device = _light(entity_registry, entry, "kitchen_ceiling", device_id=device.id)
    via_entity = _light(entity_registry, entry, "kitchen_lamp", area_id=kitchen)
    elsewhere = _light(entity_registry, entry, "garage_light", area_id=garage)
    # device area is overridden by an explicit (different) entity area
    overridden = _light(
        entity_registry, entry, "kitchen_hub_light", device_id=device.id, area_id=garage
    )
    disabled = _light(entity_registry, entry, "kitchen_disabled", area_id=kitchen, disabled=True)
    entity_registry.async_get_or_create("switch", "test", "kitchen_switch", config_entry=entry)
    entity_registry.async_update_entity(
        entity_registry.async_get_entity_id("switch", "test", "kitchen_switch"), area_id=kitchen
    )

    result = resolve_group_lights(hass, kitchen, [], [])

    assert result == sorted([via_device, via_entity])
    assert elsewhere not in result
    assert overridden not in result
    assert disabled not in result


def test_resolve_group_lights_include_and_exclude(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    entity_registry: er.EntityRegistry,
    area_registry: ar.AreaRegistry,
) -> None:
    kitchen = area_registry.async_create("Kitchen").id
    kitchen_lamp = _light(entity_registry, entry, "kitchen_lamp", area_id=kitchen)

    # include adds an entity with no area membership at all
    result = resolve_group_lights(hass, kitchen, ["light.floor_lamp"], [])
    assert result == sorted([kitchen_lamp, "light.floor_lamp"])

    # exclude removes a light that would otherwise be a member
    result = resolve_group_lights(hass, kitchen, [], [kitchen_lamp])
    assert result == []

    # exclude wins over include for the same entity
    result = resolve_group_lights(hass, kitchen, [kitchen_lamp], [kitchen_lamp])
    assert result == []


def test_resolve_group_lights_no_area_only_include(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    entity_registry: er.EntityRegistry,
    area_registry: ar.AreaRegistry,
) -> None:
    kitchen = area_registry.async_create("Kitchen").id
    _light(entity_registry, entry, "kitchen_lamp", area_id=kitchen)

    result = resolve_group_lights(hass, None, ["light.floor_lamp"], [])
    assert result == ["light.floor_lamp"]


# -- LightLog: record / transitions / prune / save --------------------------


def _state(entity_id: str, on: bool, brightness: int | None = None) -> State:
    attrs = {"brightness": brightness} if brightness is not None else {}
    return State(entity_id, "on" if on else "off", attrs)


async def test_record_ignores_unchanged_on_off(hass: HomeAssistant) -> None:
    log = LightLog(hass, "entry1", history_days=180)
    await log.async_load()

    log.record("light.kitchen", _state("light.kitchen", True, brightness=200), T0)
    log.record("light.kitchen", _state("light.kitchen", True, brightness=210), T0 + 5)  # no change
    log.record("light.kitchen", _state("light.kitchen", False), T0 + 10)

    rows = log.transitions(["light.kitchen"], T0, T0 + 100)
    assert [(r.t, r.on, r.brightness) for r in rows] == [
        (T0, True, 200),
        (T0 + 10, False, None),
    ]


async def test_record_first_observation_always_recorded_even_if_off(hass: HomeAssistant) -> None:
    log = LightLog(hass, "entry1", history_days=180)
    await log.async_load()

    log.record("light.kitchen", _state("light.kitchen", False), T0)

    rows = log.transitions(["light.kitchen"], T0, T0 + 1)
    assert [(r.t, r.on) for r in rows] == [(T0, False)]


async def test_record_none_state_treated_as_off(hass: HomeAssistant) -> None:
    log = LightLog(hass, "entry1", history_days=180)
    await log.async_load()

    log.record("light.kitchen", _state("light.kitchen", True), T0)
    log.record("light.kitchen", None, T0 + 5)

    rows = log.transitions(["light.kitchen"], T0, T0 + 100)
    assert [(r.t, r.on, r.brightness) for r in rows] == [
        (T0, True, None),
        (T0 + 5, False, None),
    ]


async def test_transitions_filters_by_entity_and_window(hass: HomeAssistant) -> None:
    log = LightLog(hass, "entry1", history_days=180)
    await log.async_load()

    log.record("light.kitchen", _state("light.kitchen", True), T0)
    log.record("light.living", _state("light.living", True), T0 + 1)
    log.record("light.kitchen", _state("light.kitchen", False), T0 + 20)
    log.record("light.living", _state("light.living", False), T0 + 30)

    rows = log.transitions(["light.kitchen"], T0, T0 + 20)
    assert [(r.entity_id, r.t) for r in rows] == [("light.kitchen", T0)]  # end exclusive

    rows_all = log.transitions(["light.kitchen", "light.living"], T0, T0 + 31)
    assert [r.t for r in rows_all] == [T0, T0 + 1, T0 + 20, T0 + 30]


async def test_prune_drops_rows_older_than_history_days(hass: HomeAssistant) -> None:
    log = LightLog(hass, "entry1", history_days=1)
    await log.async_load()

    now = T0 + 10 * 86400
    old_t = now - 2 * 86400
    recent_t = now - 3600

    log.record("light.kitchen", _state("light.kitchen", True), old_t)
    log.record("light.kitchen", _state("light.kitchen", False), recent_t)

    log.prune(now)

    rows = log.transitions(["light.kitchen"], 0, now + 1)
    assert [r.t for r in rows] == [recent_t]


async def test_async_save_and_load_round_trip(hass: HomeAssistant, hass_storage: dict) -> None:
    log = LightLog(hass, "entry1", history_days=180)
    await log.async_load()
    log.record("light.kitchen", _state("light.kitchen", True, brightness=128), T0)
    log.record("light.kitchen", _state("light.kitchen", False), T0 + 5)
    await log.async_save()

    stored = hass_storage["activity_levels.lights.entry1"]
    assert stored["data"] == {
        "version": 1,
        "rows": [[T0, "light.kitchen", True, 128], [T0 + 5, "light.kitchen", False, None]],
    }

    reloaded = LightLog(hass, "entry1", history_days=180)
    await reloaded.async_load()
    rows = reloaded.transitions(["light.kitchen"], T0, T0 + 6)
    assert [(r.t, r.on, r.brightness) for r in rows] == [(T0, True, 128), (T0 + 5, False, None)]


async def test_record_schedules_a_delayed_save(
    hass: HomeAssistant, hass_storage: dict, freezer: FrozenDateTimeFactory
) -> None:
    log = LightLog(hass, "entry1", history_days=180)
    await log.async_load()
    log.record("light.kitchen", _state("light.kitchen", True), T0)

    assert "activity_levels.lights.entry1" not in hass_storage

    freezer.tick(timedelta(seconds=11))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert "activity_levels.lights.entry1" in hass_storage
    assert hass_storage["activity_levels.lights.entry1"]["data"]["rows"] == [
        [T0, "light.kitchen", True, None]
    ]


# -- LightLog: recorder back-fill --------------------------------------------


async def test_async_backfill_from_recorder_history(
    recorder_mock: None, hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    since = dt_now = datetime.now(UTC)
    freezer.tick(timedelta(seconds=1))  # keep every state change strictly after `since`
    hass.states.async_set("light.kitchen", "off")
    await hass.async_block_till_done()
    await async_wait_recording_done(hass)

    freezer.tick(timedelta(seconds=10))
    async_fire_time_changed(hass)
    hass.states.async_set("light.kitchen", "on", {"brightness": 180})
    await hass.async_block_till_done()
    await async_wait_recording_done(hass)

    freezer.tick(timedelta(seconds=10))
    async_fire_time_changed(hass)
    hass.states.async_set("light.kitchen", "off")
    await hass.async_block_till_done()
    await async_wait_recording_done(hass)

    log = LightLog(hass, "entry1", history_days=180)
    await log.async_load()
    added = await log.async_backfill(["light.kitchen"], since)

    assert added == 3
    rows = log.transitions(["light.kitchen"], 0, dt_now.timestamp() + 3600)
    assert [(r.entity_id, r.on) for r in rows] == [
        ("light.kitchen", False),
        ("light.kitchen", True),
        ("light.kitchen", False),
    ]
    assert rows[1].brightness == 180


async def test_async_backfill_merges_without_duplicating_existing_rows(
    recorder_mock: None, hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    since = datetime.now(UTC)
    freezer.tick(timedelta(seconds=1))  # keep the state change strictly after `since`
    hass.states.async_set("light.kitchen", "on", {"brightness": 100})
    await hass.async_block_till_done()
    await async_wait_recording_done(hass)

    log = LightLog(hass, "entry1", history_days=180)
    await log.async_load()
    first = await log.async_backfill(["light.kitchen"], since)
    assert first == 1

    second = await log.async_backfill(["light.kitchen"], since)
    assert second == 0
    rows = log.transitions(["light.kitchen"], 0, since.timestamp() + 3600)
    assert len(rows) == 1
