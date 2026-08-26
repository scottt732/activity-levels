"""PatternsCoordinator: long-term-statistics fetch, rebuild, profile store, sensors.

Long-term statistics are seeded with ``recorder.statistics.async_import_statistics``:
the harness's short-term -> LTS compilation needs a running clock the frozen-time
tests cannot provide, while importing hourly rows directly writes exactly the
``start``/``mean``/``max`` rows ``statistics_during_period`` returns.
"""

from __future__ import annotations

import math
from datetime import UTC, datetime, timedelta
from itertools import pairwise
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.recorder.models import StatisticMeanType
from homeassistant.components.recorder.statistics import async_import_statistics
from homeassistant.core import HomeAssistant, ServiceResponse, SupportsResponse
from homeassistant.helpers import device_registry as dr
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed
from pytest_homeassistant_custom_component.components.recorder.common import (
    async_wait_recording_done,
)

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.patterns.profile import SLOTS, ProfileError, empty_profile
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config

TRAINING_DAYS = 20
STATISTIC_ID = "sensor.kitchen_activity_level"


def _top_of_hour() -> datetime:
    return dt_util.utcnow().replace(minute=0, second=0, microsecond=0)


def _seed_statistics(hass: HomeAssistant, end: datetime, days: int = TRAINING_DAYS) -> None:
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
            "statistic_id": STATISTIC_ID,
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
    assert isinstance(float(anomaly.state), float)

    profile_sensor = hass.states.get("sensor.activity_levels_profile")
    assert profile_sensor is not None
    assert dt_util.parse_datetime(profile_sensor.state) is not None
    assert profile_sensor.attributes["producer"] == "builtin"
    assert profile_sensor.attributes["groups_total"] == 3
    assert profile_sensor.attributes["groups_ready"] == 1


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
