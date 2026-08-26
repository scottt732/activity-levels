"""The patterns half of the websocket API: profile, timeseries and the simulation log.

Long-term statistics are imported directly (see ``tests/test_patterns_coordinator.py``
for why), and the simulation log is seeded through its own store before setup, so the
log command can be exercised without driving a whole plan through the clock.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.recorder.models import StatisticMeanType
from homeassistant.components.recorder.statistics import async_import_statistics
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed
from pytest_homeassistant_custom_component.components.recorder.common import (
    async_wait_recording_done,
)
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.patterns.profile import SLOTS
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.simulation import (
    SIMLOG_STORAGE_VERSION,
    STARTUP_GRACE,
    simlog_storage_key,
)
from tests.fixtures import house_config

STATISTIC_ID = "sensor.kitchen_activity_level"
ENTRY_ID = "patterns-ws-entry"
DAY = 86400.0

LOG_ROWS = [
    {"t": 1.0, "group_id": "kitchen", "entity_id": "light.kitchen", "on": True, "brightness": 200},
    {"t": 2.0, "group_id": "living_room", "entity_id": "light.lamp", "on": False},
    {"t": 3.0, "group_id": "kitchen", "entity_id": "light.kitchen", "on": False},
]


def _top_of_hour() -> datetime:
    return dt_util.utcnow().replace(minute=0, second=0, microsecond=0)


def _seed_statistics(hass: HomeAssistant, end: datetime, days: int = 20) -> None:
    """Import ``days`` of hourly activity statistics for the kitchen, ending at ``end``."""
    rows: list[dict[str, Any]] = []
    t = end - timedelta(days=days)
    while t < end:
        value = 2.0 + 1.5 * math.cos(2 * math.pi * (t.hour - 18) / 24)
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


def _curve(peak: float) -> list[list[float]]:
    return [[0.0, peak, peak + 1.0] for _ in range(SLOTS)]


def _profile(now: float) -> dict[str, Any]:
    """A hand-written document: the kitchen is trained, the other groups are not."""
    return {
        "version": 1,
        "producer": {"name": "acme", "version": "9.9"},
        "generated_at": now,
        "training_window": [now - 30 * DAY, now],
        "day_types": ["weekday", "weekend", "holiday"],
        "slot_minutes": 15,
        "groups": {
            "kitchen": {
                "ready": True,
                "days": 30,
                "expected": {"weekday": _curve(1.0), "weekend": _curve(2.0)},
                "lights": {
                    "light.kitchen": {
                        "p_on": {"weekday": [0.5] * SLOTS},
                        "on_starts": {"weekday": [1080]},
                        "off_starts": {"weekday": [1380]},
                        "brightness": 200,
                    }
                },
            }
        },
    }


async def _add_entry(hass: HomeAssistant) -> MockConfigEntry:
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
        options=validate_config(house_config()),
        title="Activity Levels",
        entry_id=ENTRY_ID,
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
async def entry(hass: HomeAssistant, hass_storage: dict[str, Any]) -> MockConfigEntry:
    """A loaded entry with a seeded simulation log and no recorder behind it."""
    key = simlog_storage_key(ENTRY_ID)
    hass_storage[key] = {
        "version": SIMLOG_STORAGE_VERSION,
        "key": key,
        "data": {"actions": LOG_ROWS},
    }
    return await _add_entry(hass)


@pytest.fixture
async def trained(recorder_ready: None, hass: HomeAssistant) -> MockConfigEntry:
    """A loaded entry with hourly statistics behind it and an external profile stored."""
    _seed_statistics(hass, _top_of_hour())
    await async_wait_recording_done(hass)
    entry = await _add_entry(hass)
    await entry.runtime_data.patterns.async_set_profile(_profile(dt_util.utcnow().timestamp()))
    return entry


# -- profile ------------------------------------------------------------------


async def test_profile_get_reports_readiness_and_training(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/profile/get"})
    msg = await client.receive_json()

    assert msg["success"]
    # the setup-time document is valid but empty: every group unready, nothing trained
    assert msg["result"]["trained"] is False
    assert msg["result"]["ready"] == {"house": False, "living_room": False, "kitchen": False}
    assert msg["result"]["profile"]["groups"] == {}

    await entry.runtime_data.patterns.async_set_profile(_profile(dt_util.utcnow().timestamp()))
    await client.send_json_auto_id({"type": f"{DOMAIN}/profile/get"})
    msg = await client.receive_json()

    assert msg["result"]["trained"] is True
    assert msg["result"]["ready"] == {"house": False, "living_room": False, "kitchen": True}
    assert msg["result"]["profile"]["producer"]["name"] == "acme"


async def test_profile_save_accepts_and_rejects_documents(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    doc = _profile(dt_util.utcnow().timestamp())
    await client.send_json_auto_id({"type": f"{DOMAIN}/profile/save", "profile": doc})
    msg = await client.receive_json()

    assert msg["success"] and msg["result"] == {"ok": True}
    assert entry.runtime_data.patterns.profile["producer"]["name"] == "acme"

    bad = _profile(dt_util.utcnow().timestamp())
    bad["groups"]["kitchen"]["expected"]["weekday"] = [[0.0, 1.0, 2.0]]  # not 96 slots
    await client.send_json_auto_id({"type": f"{DOMAIN}/profile/save", "profile": bad})
    msg = await client.receive_json()

    assert msg["success"] and msg["result"]["ok"] is False
    assert msg["result"]["errors"][0]["path"] == "groups/kitchen/expected/weekday"
    # the rejected document did not replace the accepted one
    assert entry.runtime_data.patterns.profile["groups"]["kitchen"]["ready"] is True


async def test_profile_rebuild_reports_whether_it_ran(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    # no recorder: the built-in learner declines
    await client.send_json_auto_id({"type": f"{DOMAIN}/profile/rebuild"})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"] == {"rebuilt": False}


async def test_profile_rebuild_runs_the_builtin_learner(
    trained: MockConfigEntry, hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    client = await hass_ws_client(hass)
    # the stored document belongs to another producer, so an unforced rebuild stands aside
    await client.send_json_auto_id({"type": f"{DOMAIN}/profile/rebuild"})
    msg = await client.receive_json()
    assert msg["result"] == {"rebuilt": False}

    await client.send_json_auto_id({"type": f"{DOMAIN}/profile/rebuild", "force": True})
    msg = await client.receive_json()
    assert msg["result"] == {"rebuilt": True}
    assert trained.runtime_data.patterns.profile["producer"]["name"] == "builtin"


# -- timeseries ---------------------------------------------------------------


async def test_timeseries_hourly_week_with_forecast(
    trained: MockConfigEntry, hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    client = await hass_ws_client(hass)
    end = _top_of_hour().timestamp()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/timeseries",
            "group_id": "kitchen",
            "start": end - 7 * DAY,
            "end": end,
            "resolution": "1h",
            "forecast_until": end + 2 * DAY,
        }
    )
    msg = await client.receive_json()

    assert msg["success"]
    result = msg["result"]
    assert set(result) == {"series", "forecast", "day_types", "lights", "plan"}
    assert len(result["series"]["kitchen"]) > 100  # ~168 hourly rows

    forecast = result["forecast"]
    assert forecast["step"] == 900 and forecast["t0"] == end
    assert len(forecast["p25"]) == len(forecast["p50"]) == len(forecast["p75"]) == 2 * SLOTS

    # the spans cover the forecast too, not just the history window
    spans = result["day_types"]
    assert all(len(span) == 3 for span in spans)
    assert spans[0][0] == end - 7 * DAY and spans[-1][1] == end + 2 * DAY
    assert len(spans) >= 9
    assert result["plan"] == []


async def test_timeseries_five_minute_day(
    trained: MockConfigEntry, hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    await async_wait_recording_done(hass)
    client = await hass_ws_client(hass)
    end = dt_util.utcnow().timestamp()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/timeseries",
            "group_id": "house",
            "start": end - DAY,
            "end": end,
            "resolution": "5m",
            "include_children": True,
        }
    )
    msg = await client.receive_json()

    assert msg["success"]
    assert set(msg["result"]["series"]) == {"house", "living_room", "kitchen"}
    assert msg["result"]["forecast"] is None
    for points in msg["result"]["series"].values():
        assert points
        assert all(len(point) == 2 for point in points)


async def test_timeseries_rejects_five_minutes_over_a_long_window(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    end = dt_util.utcnow().timestamp()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/timeseries",
            "group_id": "kitchen",
            "start": end - 7 * DAY,
            "end": end,
            "resolution": "5m",
        }
    )
    msg = await client.receive_json()

    assert not msg["success"]
    assert msg["error"]["code"] == "invalid_range"


async def test_timeseries_unknown_group(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    end = dt_util.utcnow().timestamp()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/timeseries",
            "group_id": "cellar",
            "start": end - DAY,
            "end": end,
            "resolution": "1h",
        }
    )
    msg = await client.receive_json()

    assert not msg["success"]
    assert msg["error"]["code"] == "not_found"


# -- simulation log -----------------------------------------------------------


async def test_simulation_log_reports_entries_and_preconditions(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    entry: MockConfigEntry,
    freezer: FrozenDateTimeFactory,
) -> None:
    # past the runtime's startup grace, so the switches are the first thing in the way
    freezer.tick(timedelta(seconds=STARTUP_GRACE + 1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/simulation/log"})
    msg = await client.receive_json()

    assert msg["success"]
    result = msg["result"]
    assert set(result) == {"entries", "active", "blocked"}
    assert [row["t"] for row in result["entries"]] == [3.0, 2.0, 1.0]  # newest first
    assert result["active"] == {"house": False, "living_room": False, "kitchen": False}
    # the switches are off, so every group names that as the first failing precondition
    assert result["blocked"]["kitchen"] == "the presence simulation switches are off"


async def test_simulation_log_narrows_to_one_group(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/simulation/log", "group_id": "kitchen", "limit": 1}
    )
    msg = await client.receive_json()

    assert msg["success"]
    assert [row["t"] for row in msg["result"]["entries"]] == [3.0]
    assert set(msg["result"]["active"]) == {"kitchen"}
    assert set(msg["result"]["blocked"]) == {"kitchen"}


async def test_simulation_log_unknown_group(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/simulation/log", "group_id": "cellar"})
    msg = await client.receive_json()

    assert not msg["success"] and msg["error"]["code"] == "not_found"


# -- authorization ------------------------------------------------------------


async def test_profile_get_requires_admin(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    hass_read_only_access_token: str,
    entry: MockConfigEntry,
) -> None:
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json_auto_id({"type": f"{DOMAIN}/profile/get"})
    msg = await client.receive_json()

    assert not msg["success"] and msg["error"]["code"] == "unauthorized"
