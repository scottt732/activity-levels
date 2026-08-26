"""PatternsCoordinator: long-term-statistics fetch, rebuild, profile store, sensors.

Long-term statistics are seeded with ``recorder.statistics.async_import_statistics``:
the harness's short-term -> LTS compilation needs a running clock the frozen-time
tests cannot provide, while importing hourly rows directly writes exactly the
``start``/``mean``/``max`` rows ``statistics_during_period`` returns.
"""

from __future__ import annotations

import asyncio
import logging
import math
from datetime import UTC, date, datetime, timedelta
from itertools import pairwise
from typing import Any
from unittest.mock import patch

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.recorder.models import StatisticMeanType
from homeassistant.components.recorder.statistics import async_import_statistics
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import (
    CoreState,
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed
from pytest_homeassistant_custom_component.components.recorder.common import (
    async_wait_recording_done,
)

from custom_components.activity_levels import patterns_coordinator
from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.lightlog import LightLog
from custom_components.activity_levels.patterns.profile import SLOTS, ProfileError, empty_profile
from custom_components.activity_levels.patterns_coordinator import REGISTRY_DEBOUNCE, START_DELAY
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config

TRAINING_DAYS = 20
STATISTIC_ID = "sensor.kitchen_activity_level"


def _top_of_hour() -> datetime:
    return dt_util.utcnow().replace(minute=0, second=0, microsecond=0)


def _seed_statistics(
    hass: HomeAssistant,
    end: datetime,
    days: int = TRAINING_DAYS,
    statistic_id: str = STATISTIC_ID,
) -> None:
    """Import ``days`` of hourly activity statistics ending just before ``end``."""
    rows: list[dict[str, Any]] = []
    t = end - timedelta(days=days)
    while t < end:
        value = 2.0 + 1.5 * math.cos(2 * math.pi * (t.hour - 18) / 24)
        if t.weekday() >= 5:
            value += 1.0
        rows.append({"start": t, "mean": value, "max": value + 0.5})
        t += timedelta(hours=1)
    async_import_statistics(
        hass,
        {
            "has_sum": False,
            "mean_type": StatisticMeanType.ARITHMETIC,
            "name": None,
            "source": "recorder",
            "statistic_id": statistic_id,
            "unit_class": None,
            "unit_of_measurement": None,
        },
        rows,
    )


async def _add_entry(hass: HomeAssistant, config: dict[str, Any] | None = None) -> MockConfigEntry:
    for entity_id in (
        "binary_sensor.front_door",
        "binary_sensor.living_motion",
        "binary_sensor.kitchen_motion",
    ):
        hass.states.async_set(entity_id, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={},
        options=validate_config(config or house_config()),
        title="Activity Levels",
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    """A loaded entry without a recorder (no statistics, so nothing is learned)."""
    return await _add_entry(hass)


@pytest.fixture
async def trained(recorder_ready: None, hass: HomeAssistant) -> MockConfigEntry:
    """A loaded entry whose kitchen group has 20 days of hourly statistics behind it."""
    _seed_statistics(hass, _top_of_hour())
    await async_wait_recording_done(hass)
    entry = await _add_entry(hass)
    assert await entry.runtime_data.patterns.async_rebuild() is True
    await hass.async_block_till_done()
    return entry


# -- rebuild + sensors --------------------------------------------------------


async def test_rebuild_learns_the_group_from_statistics(
    trained: MockConfigEntry, hass: HomeAssistant
) -> None:
    patterns = trained.runtime_data.patterns
    profile = patterns.profile

    assert profile["producer"]["name"] == "builtin"
    kitchen = profile["groups"]["kitchen"]
    assert kitchen["ready"] is True
    assert kitchen["days"] >= 20
    assert len(next(iter(kitchen["expected"].values()))) == SLOTS
    assert patterns.ready is True

    band = patterns.expected_now("kitchen")
    assert band is not None
    p25, p50, p75 = band
    assert 0.0 <= p25 <= p50 <= p75
    assert patterns.day_type_now() in profile["day_types"]


async def test_expected_and_anomaly_sensors_publish(
    trained: MockConfigEntry, hass: HomeAssistant
) -> None:
    expected = hass.states.get("sensor.kitchen_expected_activity")
    assert expected is not None
    assert float(expected.state) >= 0.0
    assert expected.attributes["day_type"] == trained.runtime_data.patterns.day_type_now()
    assert expected.attributes["ready"] is True
    assert expected.attributes["producer"] == "builtin"
    assert expected.attributes["p25"] <= float(expected.state) <= expected.attributes["p75"]

    anomaly = hass.states.get("sensor.kitchen_activity_anomaly")
    assert anomaly is not None
    # band-normalized, and anomaly_score floors each half-width at 5% of max_value,
    # so a score can never leave +/- 20 however collapsed the learned band is
    assert -20.0 <= float(anomaly.state) <= 20.0

    profile_sensor = hass.states.get("sensor.activity_levels_profile")
    assert profile_sensor is not None
    assert dt_util.parse_datetime(profile_sensor.state) is not None
    assert profile_sensor.attributes["producer"] == "builtin"
    assert profile_sensor.attributes["groups_total"] == 3
    assert profile_sensor.attributes["groups_ready"] == 1
    assert profile_sensor.attributes["trained"] is True
    assert profile_sensor.attributes["ready"] == {
        "house": False,
        "living_room": False,
        "kitchen": True,
    }


async def test_anomaly_is_unknown_until_the_group_is_ready(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    assert hass.states.get("sensor.kitchen_activity_anomaly").state == "unknown"
    assert hass.states.get("sensor.kitchen_expected_activity").state == "unknown"
    assert entry.runtime_data.patterns.ready is False


async def test_anomaly_scores_the_real_value(trained: MockConfigEntry, hass: HomeAssistant) -> None:
    coordinator = trained.runtime_data.coordinator
    quiet = float(hass.states.get("sensor.kitchen_activity_anomaly").state)

    coordinator.trigger("kitchen", 5.0)
    await hass.async_block_till_done()

    # the trigger voice is excluded from real_value, so the anomaly does not move
    assert float(hass.states.get("sensor.kitchen_activity_anomaly").state) == quiet


# -- producer guard -----------------------------------------------------------


def _external_profile() -> dict[str, Any]:
    doc = empty_profile("prophet-addon", "9.9.9", ["weekday", "weekend"])
    doc["groups"]["kitchen"] = {
        "ready": True,
        "days": 42,
        "expected": {"weekday": [[1.0, 2.0, 3.0]] * SLOTS},
        "lights": {},
    }
    return doc


async def test_external_producer_is_not_overwritten_without_force(
    trained: MockConfigEntry, hass: HomeAssistant
) -> None:
    patterns = trained.runtime_data.patterns
    await patterns.async_set_profile(_external_profile())
    assert patterns.profile["producer"]["name"] == "prophet-addon"

    assert await patterns.async_rebuild() is False
    assert patterns.profile["producer"]["name"] == "prophet-addon"
    assert patterns.profile["groups"]["kitchen"]["days"] == 42

    assert await patterns.async_rebuild(force=True) is True
    assert patterns.profile["producer"]["name"] == "builtin"
    assert patterns.profile["groups"]["kitchen"]["days"] != 42


async def test_set_profile_rejects_a_malformed_document(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    with pytest.raises(ProfileError):
        await entry.runtime_data.patterns.async_set_profile({"version": 1})


async def test_profile_survives_a_reload(trained: MockConfigEntry, hass: HomeAssistant) -> None:
    await trained.runtime_data.patterns.async_set_profile(_external_profile())
    await hass.config_entries.async_reload(trained.entry_id)
    await hass.async_block_till_done()

    patterns = trained.runtime_data.patterns
    assert patterns.profile["producer"]["name"] == "prophet-addon"
    assert patterns.profile["groups"]["kitchen"]["days"] == 42


# -- rebuild_profile service --------------------------------------------------


async def test_rebuild_profile_service(trained: MockConfigEntry, hass: HomeAssistant) -> None:
    patterns = trained.runtime_data.patterns
    await patterns.async_set_profile(_external_profile())

    await hass.services.async_call(DOMAIN, "rebuild_profile", {}, blocking=True)
    assert patterns.profile["producer"]["name"] == "prophet-addon"

    await hass.services.async_call(DOMAIN, "rebuild_profile", {"force": True}, blocking=True)
    assert patterns.profile["producer"]["name"] == "builtin"


# -- hub device ---------------------------------------------------------------


async def test_hub_device_is_the_root_groups_via_device(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    registry = dr.async_get(hass)
    hub = registry.async_get_device(identifiers={(DOMAIN, entry.entry_id)})
    house = registry.async_get_device(identifiers={(DOMAIN, "house")})
    kitchen = registry.async_get_device(identifiers={(DOMAIN, "kitchen")})
    assert hub is not None and house is not None and kitchen is not None
    assert hub.name == "Activity Levels"
    assert hub.model == "Hub"
    assert house.via_device_id == hub.id
    assert kitchen.via_device_id == house.id


# -- real_value ---------------------------------------------------------------


async def test_real_value_excludes_the_trigger_voice(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    coordinator = entry.runtime_data.coordinator
    coordinator.trigger("kitchen", 3.0)
    await hass.async_block_till_done()

    state = coordinator.data["kitchen"]
    assert state.value == 3.0
    assert state.real_value == 0.0

    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    moved = coordinator.data["kitchen"]
    assert moved.value == 4.0
    assert moved.real_value == 1.0


async def test_ws_state_carries_real_value(
    hass: HomeAssistant, entry: MockConfigEntry, hass_ws_client: Any
) -> None:
    entry.runtime_data.coordinator.trigger("kitchen", 2.0)
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/state"})
    result = await client.receive_json()
    assert result["success"]
    assert result["result"]["groups"]["kitchen"]["real_value"] == 0.0
    assert result["result"]["groups"]["kitchen"]["value"] == 2.0


# -- timeseries ---------------------------------------------------------------


async def test_timeseries_hourly_window_with_forecast(
    trained: MockConfigEntry, hass: HomeAssistant
) -> None:
    patterns = trained.runtime_data.patterns
    end = dt_util.utcnow().timestamp()
    start = end - 7 * 86400
    result = await patterns.async_timeseries(
        "kitchen", start, end, "1h", include_children=False, forecast_until=end + 86400
    )

    assert set(result) == {"series", "forecast", "day_types", "lights", "plan"}
    assert list(result["series"]) == ["kitchen"]
    points = result["series"]["kitchen"]
    assert len(points) > 100  # ~168 hourly rows
    assert all(len(p) == 2 for p in points)
    assert start <= points[0][0] <= points[-1][0] <= end

    forecast = result["forecast"]
    assert forecast["step"] == 900
    assert len(forecast["p50"]) == SLOTS  # 96 slots for one forecast day
    assert len(forecast["p25"]) == len(forecast["p75"]) == SLOTS
    triples = zip(forecast["p25"], forecast["p50"], forecast["p75"], strict=True)
    assert all(a <= b <= c for a, b, c in triples)
    assert result["day_types"]
    assert all(len(d) == 3 for d in result["day_types"])


async def test_timeseries_five_minute_window_includes_children(
    trained: MockConfigEntry, hass: HomeAssistant
) -> None:
    await async_wait_recording_done(hass)
    end = dt_util.utcnow().timestamp()
    start = end - 86400
    result = await trained.runtime_data.patterns.async_timeseries(
        "house", start, end, "5m", include_children=True, forecast_until=None
    )

    assert set(result["series"]) == {"house", "living_room", "kitchen"}
    assert result["forecast"] is None
    for points in result["series"].values():
        assert points  # the recorder has the entities' own states behind it
        assert all(len(p) == 2 and start <= p[0] <= end for p in points)
        assert all(b[0] - a[0] == 300 for a, b in pairwise(points))


# -- day types ----------------------------------------------------------------


def _calendar_config(entity: str) -> dict[str, Any]:
    config = house_config()
    config["defaults"]["patterns"] = {
        "calendars": [{"id": "vacation", "entity": entity}],
        "workday_entity": "binary_sensor.workday",
    }
    return config


async def test_day_type_now_follows_the_workday_entity(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    freezer.move_to(datetime(2026, 6, 17, 12, 0, tzinfo=UTC))  # a Wednesday
    hass.states.async_set("binary_sensor.workday", "on")
    entry = await _add_entry(hass, _calendar_config("calendar.family_vacation"))
    patterns = entry.runtime_data.patterns
    assert patterns.day_type_now() == "weekday"

    hass.states.async_set("binary_sensor.workday", "off")
    await hass.async_block_till_done()
    assert patterns.day_type_now() == "holiday"


async def test_rebuild_labels_days_from_the_calendar(
    recorder_ready: None, hass: HomeAssistant
) -> None:
    end = _top_of_hour()
    _seed_statistics(hass, end)
    await async_wait_recording_done(hass)

    start_iso = (end - timedelta(days=3)).isoformat()
    end_iso = (end + timedelta(days=1)).isoformat()

    async def get_events(call: Any) -> ServiceResponse:
        return {
            "calendar.family_vacation": {
                "events": [{"start": start_iso, "end": end_iso, "summary": "Away"}]
            }
        }

    hass.services.async_register(
        "calendar", "get_events", get_events, supports_response=SupportsResponse.ONLY
    )
    hass.states.async_set("calendar.family_vacation", "on")

    entry = await _add_entry(hass, _calendar_config("calendar.family_vacation"))
    patterns = entry.runtime_data.patterns
    assert await patterns.async_rebuild() is True

    assert patterns.day_type_now() == "vacation"
    assert "vacation" in patterns.profile["day_types"]
    assert patterns.day_type_of((end - timedelta(days=10)).date()) != "vacation"


# -- scheduling ---------------------------------------------------------------


async def test_startup_and_nightly_rebuilds_are_scheduled(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await hass.config.async_set_time_zone("UTC")  # rebuild_time is a *local* time
    freezer.move_to(datetime(2026, 6, 17, 2, 0, tzinfo=UTC))
    entry = await _add_entry(hass)
    patterns = entry.runtime_data.patterns
    calls: list[bool] = []

    async def fake_rebuild(*, force: bool = False) -> bool:
        calls.append(force)
        return True

    patterns.async_rebuild = fake_rebuild  # type: ignore[method-assign]

    # no profile in the store, so a rebuild is queued a minute after start
    freezer.move_to(datetime(2026, 6, 17, 2, 2, tzinfo=UTC))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert calls == [False]
    calls.clear()

    freezer.move_to(datetime(2026, 6, 17, 3, 0, 30, tzinfo=UTC))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert calls == [False]


# -- live calendar day types --------------------------------------------------


async def test_day_type_now_reads_the_live_calendar_before_any_rebuild(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Between local midnight and rebuild_time nothing has labelled the new date yet."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(datetime(2026, 6, 17, 0, 30, tzinfo=UTC))  # a Wednesday, just past midnight
    hass.states.async_set("binary_sensor.workday", "on")
    hass.states.async_set("calendar.family_vacation", "on")

    entry = await _add_entry(hass, _calendar_config("calendar.family_vacation"))
    patterns = entry.runtime_data.patterns

    assert patterns.day_type_now() == "vacation"
    expected = hass.states.get("sensor.kitchen_expected_activity")
    assert expected.attributes["day_type"] == "vacation"

    hass.states.async_set("calendar.family_vacation", "off")
    await hass.async_block_till_done()
    assert patterns.day_type_now() == "weekday"


async def test_bucket_tick_relabels_today_once_the_date_rolls(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(datetime(2026, 6, 17, 23, 50, tzinfo=UTC))  # Wednesday evening
    windows: list[tuple[str, str]] = []

    async def get_events(call: ServiceCall) -> ServiceResponse:
        windows.append((call.data["start_date_time"], call.data["end_date_time"]))
        return {
            "calendar.family_vacation": {
                "events": [
                    {
                        "start": "2026-06-18T00:00:00+00:00",
                        "end": "2026-06-19T00:00:00+00:00",
                        "summary": "Away",
                    }
                ]
            }
        }

    hass.services.async_register(
        "calendar", "get_events", get_events, supports_response=SupportsResponse.ONLY
    )
    entry = await _add_entry(hass, _calendar_config("calendar.family_vacation"))
    patterns = entry.runtime_data.patterns
    assert patterns.day_type_of(date(2026, 6, 18)) == "weekday"  # nothing cached for it yet

    freezer.move_to(datetime(2026, 6, 18, 0, 0, 30, tzinfo=UTC))
    async_fire_time_changed(hass)
    await hass.async_block_till_done(wait_background_tasks=True)

    assert patterns.day_type_of(date(2026, 6, 18)) == "vacation"
    assert patterns.day_type_now() == "vacation"
    # only the new day was asked for, not the whole training window
    assert windows == [("2026-06-18T00:00:00+00:00", "2026-06-19T00:00:00+00:00")]


# -- startup scheduling -------------------------------------------------------


async def test_catch_up_waits_for_home_assistant_to_start(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(datetime(2026, 6, 17, 2, 0, tzinfo=UTC))
    hass.set_state(CoreState.not_running)
    entry = await _add_entry(hass)
    patterns = entry.runtime_data.patterns
    calls: list[bool] = []

    async def fake_rebuild(*, force: bool = False) -> bool:
        calls.append(force)
        return True

    patterns.async_rebuild = fake_rebuild  # type: ignore[method-assign]

    # the settle delay alone means nothing while Home Assistant is still starting
    freezer.move_to(datetime(2026, 6, 17, 2, 2, tzinfo=UTC))
    async_fire_time_changed(hass)
    await hass.async_block_till_done(wait_background_tasks=True)
    assert calls == []

    hass.set_state(CoreState.running)
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await hass.async_block_till_done(wait_background_tasks=True)
    assert calls == []  # the settle delay starts now

    freezer.move_to(datetime(2026, 6, 17, 2, 3, 5, tzinfo=UTC))
    async_fire_time_changed(hass)
    await hass.async_block_till_done(wait_background_tasks=True)
    assert calls == [False]


def _slotted_profile(day_types: list[str]) -> dict[str, Any]:
    """A profile whose kitchen p50 is the slot number, so every tick moves it."""
    doc = empty_profile(day_types=day_types)
    doc["groups"]["kitchen"] = {
        "ready": True,
        "days": 30,
        "expected": {"weekday": [[float(s), s + 1.0, s + 2.0] for s in range(SLOTS)]},
        "lights": {},
    }
    return doc


async def test_bucket_tick_rewrites_the_expected_sensor(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(datetime(2026, 6, 17, 8, 0, 5, tzinfo=UTC))  # Wednesday, slot 32
    entry = await _add_entry(hass)
    patterns = entry.runtime_data.patterns
    await patterns.async_set_profile(_slotted_profile(patterns.day_types))
    await hass.async_block_till_done()

    assert float(hass.states.get("sensor.kitchen_expected_activity").state) == 33.0

    freezer.move_to(datetime(2026, 6, 17, 8, 15, 5, tzinfo=UTC))  # slot 33
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert float(hass.states.get("sensor.kitchen_expected_activity").state) == 34.0


async def test_light_backfill_is_deferred_until_after_start(
    recorder_ready: None, hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    config = house_config()
    config["groups"][0]["children"][1]["simulation"] = {"lights": {"include": ["light.kitchen"]}}
    asked: list[list[str]] = []

    async def fake_backfill(self: LightLog, entity_ids: list[str], since: datetime) -> int:
        asked.append(list(entity_ids))
        return 0

    with patch.object(LightLog, "async_backfill", fake_backfill):
        await _add_entry(hass, config)
        assert asked == []  # setup never blocks on a 180-day history query

        freezer.tick(timedelta(seconds=START_DELAY + 5))
        async_fire_time_changed(hass)
        await hass.async_block_till_done(wait_background_tasks=True)

        assert asked == [["light.kitchen"]]


# -- rebuild lock -------------------------------------------------------------


async def test_concurrent_rebuilds_fit_only_once(
    trained: MockConfigEntry, hass: HomeAssistant, monkeypatch: pytest.MonkeyPatch
) -> None:
    patterns = trained.runtime_data.patterns
    fits = 0
    real = patterns_coordinator.fit_groups

    def counting_fit(*args: Any, **kwargs: Any) -> dict[str, Any]:
        nonlocal fits
        fits += 1
        return real(*args, **kwargs)

    monkeypatch.setattr(patterns_coordinator, "fit_groups", counting_fit)

    results = await asyncio.gather(patterns.async_rebuild(), patterns.async_rebuild())

    # the second caller waits, sees the fresh document and does not refit
    assert sorted(results, reverse=True) == [True, False]
    assert fits == 1


# -- registry changes ---------------------------------------------------------


async def test_a_new_light_joins_its_group_without_a_reload(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, caplog: pytest.LogCaptureFixture
) -> None:
    """Lights bought after setup have to find their group on their own."""
    area = ar.async_get(hass).async_get_or_create("kitchen")
    config = house_config()
    config["groups"][0]["children"][1]["area"] = area.id
    entry = await _add_entry(hass, config)
    patterns = entry.runtime_data.patterns
    assert patterns.lights["kitchen"] == []

    entities = er.async_get(hass)
    light = entities.async_get_or_create("light", "demo", "late-lamp")
    entities.async_update_entity(light.entity_id, area_id=area.id)
    await hass.async_block_till_done()
    assert patterns.lights["kitchen"] == []  # debounced, not immediate

    freezer.tick(timedelta(seconds=REGISTRY_DEBOUNCE + 1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert patterns.lights["kitchen"] == [light.entity_id]
    # the switch platform ran at setup; a group that has just grown its first light
    # cannot be given one now, so say so rather than stay silently switch-less
    assert "reload" in caplog.text


async def test_a_light_leaving_its_area_leaves_the_group(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    area = ar.async_get(hass).async_get_or_create("kitchen")
    entities = er.async_get(hass)
    light = entities.async_get_or_create("light", "demo", "kitchen-lamp")
    entities.async_update_entity(light.entity_id, area_id=area.id)
    config = house_config()
    config["groups"][0]["children"][1]["area"] = area.id
    entry = await _add_entry(hass, config)
    patterns = entry.runtime_data.patterns
    assert patterns.lights["kitchen"] == [light.entity_id]

    entities.async_update_entity(light.entity_id, area_id=None)
    freezer.tick(timedelta(seconds=REGISTRY_DEBOUNCE + 1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert patterns.lights["kitchen"] == []


# -- statistic ids ------------------------------------------------------------


async def test_statistics_follow_a_renamed_entity(
    recorder_ready: None, hass: HomeAssistant
) -> None:
    """Renaming the activity-level sensor must not blind the learner.

    Long-term statistics are keyed by entity id, so a rename moves the rows; only the
    entity registry knows where they went.
    """
    renamed = "sensor.kitchen_busyness"
    entry = await _add_entry(hass)
    entities = er.async_get(hass)
    unique_id = f"{entry.entry_id}-kitchen-activity_level"
    original = entities.async_get_entity_id("sensor", DOMAIN, unique_id)
    assert original == STATISTIC_ID
    entities.async_update_entity(original, new_entity_id=renamed)
    await hass.async_block_till_done()

    _seed_statistics(hass, _top_of_hour(), statistic_id=renamed)
    await async_wait_recording_done(hass)

    patterns = entry.runtime_data.patterns
    assert await patterns.async_rebuild() is True
    assert patterns.profile["groups"]["kitchen"]["ready"] is True


async def test_a_group_with_no_statistics_names_the_id_it_looked_for(
    recorder_ready: None, hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    entry = await _add_entry(hass)
    caplog.clear()

    assert await entry.runtime_data.patterns.async_rebuild() is True

    warnings = [
        record.getMessage()
        for record in caplog.records
        if record.levelno >= logging.WARNING and record.name.startswith("custom_components")
    ]
    assert any("sensor.kitchen_activity_level" in message for message in warnings)
    assert any("sensor.house_activity_level" in message for message in warnings)


async def test_ws_state_reports_each_groups_light_count(
    hass: HomeAssistant, hass_ws_client: Any
) -> None:
    """The panel needs to know a group owns lights before it offers to simulate it."""
    area = ar.async_get(hass).async_get_or_create("kitchen")
    entities = er.async_get(hass)
    light = entities.async_get_or_create("light", "demo", "kitchen-lamp")
    entities.async_update_entity(light.entity_id, area_id=area.id)
    config = house_config()
    config["groups"][0]["children"][1]["area"] = area.id
    await _add_entry(hass, config)

    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/state"})
    result = await client.receive_json()

    assert result["success"]
    assert result["result"]["groups"]["kitchen"]["lights"] == 1
    assert result["result"]["groups"]["house"]["lights"] == 0
