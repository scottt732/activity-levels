"""Seeded plan sampler tests."""

from __future__ import annotations

from datetime import UTC, date, datetime, time
from itertools import pairwise
from zoneinfo import ZoneInfo

import numpy as np

from custom_components.activity_levels.patterns.planner import (
    PlannedAction,
    in_quiet_hours,
    sample_plan,
)
from custom_components.activity_levels.patterns.profile import SLOTS, slot_of

DAY = datetime(2026, 1, 1, tzinfo=UTC).timestamp()  # local midnight
NY = ZoneInfo("America/New_York")


def _minute(action: PlannedAction) -> int:
    return round((action.t - DAY) / 60.0)


def _flat(value: float) -> list[float]:
    return [value] * SLOTS


def _window(start_minute: int, end_minute: int) -> list[float]:
    return [1.0 if slot_of(start_minute) <= s < slot_of(end_minute) else 0.0 for s in range(SLOTS)]


def _profile(
    p_on: list[float],
    *,
    on_starts: list[int] | None = None,
    off_starts: list[int] | None = None,
    brightness: int | None = 180,
    entity: str = "light.lamp",
) -> dict[str, dict[str, object]]:
    return {
        entity: {
            "p_on": {"weekday": p_on},
            "on_starts": {"weekday": list(on_starts or [])},
            "off_starts": {"weekday": list(off_starts or [])},
            "brightness": brightness,
        }
    }


def _plan(seed: int, profile, **over) -> list[PlannedAction]:
    kwargs = {
        "light_profile": profile,
        "day_type": "weekday",
        "day_start": DAY,
        "tz": UTC,
        "quiet_hours": None,
        "initial_state": {},
    }
    kwargs.update(over)
    return sample_plan(np.random.default_rng(seed), **kwargs)


def test_in_quiet_hours_plain_window():
    quiet = ("01:00", "05:30")
    assert in_quiet_hours(60, quiet) is True
    assert in_quiet_hours(5 * 60, quiet) is True
    assert in_quiet_hours(59, quiet) is False
    assert in_quiet_hours(5 * 60 + 30, quiet) is False
    assert in_quiet_hours(12 * 60, quiet) is False


def test_in_quiet_hours_wraps_midnight():
    quiet = ("23:00", "05:30")
    assert in_quiet_hours(23 * 60, quiet) is True
    assert in_quiet_hours(23 * 60 + 59, quiet) is True
    assert in_quiet_hours(0, quiet) is True
    assert in_quiet_hours(5 * 60 + 29, quiet) is True
    assert in_quiet_hours(5 * 60 + 30, quiet) is False
    assert in_quiet_hours(12 * 60, quiet) is False
    assert in_quiet_hours(22 * 60 + 59, quiet) is False


def test_in_quiet_hours_without_a_window():
    assert in_quiet_hours(0, None) is False
    assert in_quiet_hours(600, ("02:00", "02:00")) is False


def test_same_seed_same_plan_different_seed_differs():
    profile = _profile(_flat(0.5))
    profile.update(_profile(_flat(0.5), entity="light.other"))
    assert _plan(11, profile) == _plan(11, profile)
    assert _plan(11, profile) != _plan(12, profile)


def test_evening_light_gets_one_on_and_one_off():
    plan = _plan(3, _profile(_window(18 * 60, 23 * 60)))
    assert [a.on for a in plan] == [True, False]
    assert abs(_minute(plan[0]) - 18 * 60) <= 40
    assert abs(_minute(plan[1]) - 23 * 60) <= 40
    assert plan[0].brightness == 180
    assert plan[1].brightness is None
    assert plan[0].entity_id == "light.lamp"


def test_transition_times_are_drawn_near_the_slot():
    near = _plan(4, _profile(_window(18 * 60, 23 * 60), on_starts=[1085]))
    assert abs(_minute(near[0]) - 1085) <= 20
    far = _plan(4, _profile(_window(18 * 60, 23 * 60), on_starts=[600]))
    assert abs(_minute(far[0]) - 18 * 60) <= 20


def test_quiet_hours_suppress_on_actions():
    profile = _profile(_window(2 * 60, 5 * 60))
    assert _plan(5, profile, quiet_hours=("01:00", "05:30")) == []
    free = _plan(5, profile)
    assert [a.on for a in free] == [True, False]


def test_quiet_hours_never_suppress_off_actions():
    quiet = ("23:00", "05:30")
    plan = _plan(7, _profile(_flat(0.0)), quiet_hours=quiet, initial_state={"light.lamp": True})
    assert len(plan) == 1
    assert plan[0].on is False
    assert in_quiet_hours(_minute(plan[0]), quiet)


def test_evening_light_is_never_stranded_on_by_quiet_hours():
    """An OFF drawn into the quiet window must still be planned, for every seed."""
    profile = _profile(_window(18 * 60, 23 * 60))
    for seed in range(8):
        plan = _plan(seed, profile, quiet_hours=("23:00", "05:30"))
        assert [a.on for a in plan] == [True, False], (seed, plan)


def test_quiet_hours_suppress_across_midnight():
    curve = _flat(0.0)
    curve[slot_of(23 * 60 + 30)] = 1.0
    for slot in range(slot_of(2 * 60), slot_of(4 * 60)):
        curve[slot] = 1.0
    assert _plan(6, _profile(curve), quiet_hours=("23:00", "05:30")) == []


def test_initial_state_on_turns_off_first():
    plan = _plan(7, _profile(_flat(0.0)), initial_state={"light.lamp": True})
    assert len(plan) == 1
    assert plan[0].on is False
    assert plan[0].brightness is None


def test_actions_are_sorted_and_spaced_by_ten_minutes():
    curve = [1.0 if s % 2 == 0 else 0.0 for s in range(SLOTS)]
    plan = _plan(9, _profile(curve))
    times = [a.t for a in plan]
    assert times == sorted(times)
    assert all(b - a >= 600.0 for a, b in pairwise(times))
    assert 0 < len(plan) < SLOTS


def test_actions_strictly_alternate_per_light():
    """Dedupe must never leave two consecutive same-state actions for a light."""
    curve = [1.0 if s % 2 == 0 else 0.0 for s in range(SLOTS)]
    for seed in range(12):
        plan = _plan(seed, _profile(curve))
        states = [a.on for a in plan]
        assert states, seed
        assert states[0] is True, seed
        assert all(a != b for a, b in pairwise(states)), (seed, states)


def test_action_times_follow_local_wall_time_across_dst():
    """2026-03-08 in America/New_York loses an hour; minute 1073 is still 17:53 local."""
    day_start = datetime.combine(date(2026, 3, 8), time(0), tzinfo=NY).timestamp()
    curve = _flat(0.0)
    curve[slot_of(1073)] = 1.0
    profile = _profile(curve, on_starts=[1073])
    plan = sample_plan(
        np.random.default_rng(1),
        light_profile=profile,
        day_type="weekday",
        day_start=day_start,
        tz=NY,
        quiet_hours=None,
        jitter_minutes=0,
        initial_state={},
    )
    assert plan
    assert plan[0].on is True
    assert datetime.fromtimestamp(plan[0].t, NY).strftime("%H:%M") == "17:53"


def test_unknown_day_type_falls_back_and_missing_curve_is_skipped():
    plan = _plan(3, _profile(_window(18 * 60, 23 * 60)), day_type="holiday")
    assert [a.on for a in plan] == [True, False]
    assert (
        sample_plan(
            np.random.default_rng(1),
            light_profile={"light.lamp": {"p_on": {}}},
            day_type="weekday",
            day_start=DAY,
            tz=UTC,
            quiet_hours=None,
            initial_state={},
        )
        == []
    )
