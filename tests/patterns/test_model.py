"""Learner tests: Fourier/ridge activity model and light profile."""

from __future__ import annotations

import math
import statistics
from datetime import UTC, date, datetime, time, timedelta

import numpy as np
import pytest

from custom_components.activity_levels.patterns.features import design_matrix, n_columns
from custom_components.activity_levels.patterns.model import (
    LightTransition,
    Sample,
    fit_group_expected,
    fit_light_profile,
)
from custom_components.activity_levels.patterns.profile import (
    SLOTS,
    empty_profile,
    slot_of,
    validate_profile,
)

START = date(2026, 1, 1)  # a Thursday
MAX_VALUE = 10.0


def _at(day: date, hour: int = 0, minute: int = 0) -> float:
    return datetime.combine(day, time(hour, minute), tzinfo=UTC).timestamp()


def _truth(hour: int, day_type: str, holiday_shift: float = 2.0) -> float:
    value = 2.0 + 1.5 * math.cos(2 * math.pi * (hour - 18) / 24)
    if day_type == "weekend":
        value += 1.0
    elif day_type == "holiday":
        value += holiday_shift
    return value


def _day_type(day: date, holidays: frozenset[date]) -> str:
    if day in holidays:
        return "holiday"
    return "weekend" if day.weekday() >= 5 else "weekday"


def _samples(
    days: int = 60,
    holidays: frozenset[date] = frozenset(),
    sigma: float = 0.2,
    seed: int = 7,
    force_day_type: str | None = None,
) -> list[Sample]:
    rng = np.random.default_rng(seed)
    out: list[Sample] = []
    for d in range(days):
        day = START + timedelta(days=d)
        day_type = force_day_type or _day_type(day, holidays)
        for hour in range(24):
            value = _truth(hour, day_type) + float(rng.normal(0.0, sigma))
            out.append(Sample(t=_at(day, hour), value=value, day_type=day_type))
    return out


def test_design_matrix_shape_and_base_day_type():
    ts = np.array([_at(START, h) for h in range(4)], dtype=np.float64)
    idx = np.array([0, 1, 0, 1], dtype=np.int64)
    x = design_matrix(ts, idx, 2, UTC)
    assert x.shape == (4, n_columns(2))
    assert x.dtype == np.float64
    assert np.all(x[:, 0] == 1.0)  # intercept
    assert x[0, 1] == 0.0  # trend starts at zero
    onehot = x[:, 16]
    assert list(onehot) == [0.0, 1.0, 0.0, 1.0]


def test_design_matrix_single_day_type_has_no_onehots():
    ts = np.array([_at(START, h) for h in range(4)], dtype=np.float64)
    idx = np.zeros(4, dtype=np.int64)
    assert design_matrix(ts, idx, 1, UTC).shape == (4, 16)


def test_recovers_daily_shape_and_weekend_shift():
    result = fit_group_expected(
        _samples(), day_types=("weekday", "weekend"), max_value=MAX_VALUE, tz=UTC
    )
    assert result is not None
    assert result["days"] == 60
    assert result["ready"] is True
    weekday = result["expected"]["weekday"]
    weekend = result["expected"]["weekend"]
    assert len(weekday) == SLOTS
    assert weekday[slot_of(18 * 60)][1] == pytest.approx(3.5, abs=0.3)
    assert weekday[slot_of(6 * 60)][1] == pytest.approx(0.5, abs=0.3)
    assert weekend[slot_of(18 * 60)][1] == pytest.approx(4.5, abs=0.4)


def test_bands_cover_about_half_the_training_points():
    samples = _samples()
    result = fit_group_expected(
        samples, day_types=("weekday", "weekend"), max_value=MAX_VALUE, tz=UTC
    )
    assert result is not None
    inside = 0
    for sample in samples:
        local = datetime.fromtimestamp(sample.t, UTC)
        p25, _p50, p75 = result["expected"][sample.day_type][
            slot_of(local.hour * 60 + local.minute)
        ]
        inside += int(p25 <= sample.value <= p75)
    coverage = inside / len(samples)
    assert 0.40 <= coverage <= 0.60, coverage


def test_holiday_day_type_shift():
    holidays = frozenset(START + timedelta(days=d) for d in (4, 12, 20, 28, 36))
    assert all(d.weekday() < 5 for d in holidays)
    result = fit_group_expected(
        _samples(holidays=holidays),
        day_types=("weekday", "weekend", "holiday"),
        max_value=MAX_VALUE,
        tz=UTC,
    )
    assert result is not None
    weekday = result["expected"]["weekday"]
    holiday = result["expected"]["holiday"]
    diff = statistics.fmean(holiday[s][1] - weekday[s][1] for s in range(SLOTS))
    assert 1.5 <= diff <= 2.5, diff


def test_min_days_guard_keeps_curves():
    result = fit_group_expected(
        _samples(days=7), day_types=("weekday", "weekend"), max_value=MAX_VALUE, tz=UTC
    )
    assert result is not None
    assert result["ready"] is False
    assert result["days"] == 7
    assert len(result["expected"]["weekday"]) == SLOTS


def test_no_samples_returns_none():
    assert fit_group_expected([], day_types=("weekday",), max_value=MAX_VALUE, tz=UTC) is None


def test_single_day_type_is_not_singular():
    result = fit_group_expected(
        _samples(days=20, force_day_type="weekday"),
        day_types=("weekday",),
        max_value=MAX_VALUE,
        tz=UTC,
    )
    assert result is not None
    curve = result["expected"]["weekday"]
    assert all(math.isfinite(v) for band in curve for v in band)
    assert curve[slot_of(18 * 60)][1] == pytest.approx(3.5, abs=0.3)


def test_absent_day_type_falls_back_to_weekday():
    result = fit_group_expected(
        _samples(days=20, force_day_type="weekday"),
        day_types=("weekday", "holiday"),
        max_value=MAX_VALUE,
        tz=UTC,
    )
    assert result is not None
    assert result["expected"]["holiday"] == result["expected"]["weekday"]


def test_values_are_clamped_to_max_value():
    result = fit_group_expected(
        _samples(days=20), day_types=("weekday", "weekend"), max_value=1.0, tz=UTC
    )
    assert result is not None
    assert all(0.0 <= v <= 1.0 for band in result["expected"]["weekday"] for v in band)


# --- light profile ---------------------------------------------------------

WINDOW_DAYS = 20
WINDOW = (_at(START), _at(START + timedelta(days=WINDOW_DAYS)))


def _lamp_transitions() -> tuple[list[LightTransition], list[int]]:
    transitions: list[LightTransition] = []
    brightness_values: list[int] = []
    for d in range(WINDOW_DAYS):
        day = START + timedelta(days=d)
        if day.weekday() >= 5:
            continue
        brightness = 170 + (d % 3) * 10
        brightness_values.append(brightness)
        transitions.append(LightTransition(_at(day, 18), "light.lamp", True, brightness))
        transitions.append(LightTransition(_at(day, 23), "light.lamp", False, None))
    return transitions, brightness_values


def _plain_day_type(day: date) -> str:
    return "weekend" if day.weekday() >= 5 else "weekday"


def _lamp_profile() -> dict[str, dict[str, object]]:
    transitions, _ = _lamp_transitions()
    return fit_light_profile(
        transitions,
        window=WINDOW,
        day_type_of=_plain_day_type,
        day_types=("weekday", "weekend"),
        tz=UTC,
    )


def test_light_p_on_tracks_the_observed_schedule():
    lamp = _lamp_profile()["light.lamp"]
    p_on = lamp["p_on"]
    assert len(p_on["weekday"]) == SLOTS
    assert p_on["weekday"][slot_of(20 * 60)] > 0.9
    assert p_on["weekday"][slot_of(12 * 60)] < 0.1
    assert all(p < 0.1 for p in p_on["weekend"])
    assert all(0.0 <= p <= 1.0 for p in p_on["weekday"])


def test_light_transition_times_and_brightness():
    _transitions, brightness_values = _lamp_transitions()
    lamp = _lamp_profile()["light.lamp"]
    assert lamp["on_starts"]["weekday"]
    assert all(abs(m - 18 * 60) <= 1 for m in lamp["on_starts"]["weekday"])
    assert all(abs(m - 23 * 60) <= 1 for m in lamp["off_starts"]["weekday"])
    assert "weekend" not in lamp["on_starts"]
    assert lamp["brightness"] == round(statistics.median(brightness_values))


def test_light_transition_lists_are_capped_and_sorted():
    transitions: list[LightTransition] = []
    for d in range(WINDOW_DAYS):
        day = START + timedelta(days=d)
        for i in range(20):
            transitions.append(LightTransition(_at(day, 6, i * 2), "light.lamp", True, 100))
            transitions.append(LightTransition(_at(day, 6, i * 2 + 1), "light.lamp", False, None))
    lamp = fit_light_profile(
        transitions,
        window=WINDOW,
        day_type_of=lambda _d: "weekday",
        day_types=("weekday",),
        tz=UTC,
    )["light.lamp"]
    starts = lamp["on_starts"]["weekday"]
    assert len(starts) == 200
    assert starts == sorted(starts)
    assert all(isinstance(m, int) for m in starts)


def test_light_profile_without_transitions_is_empty():
    assert (
        fit_light_profile(
            [], window=WINDOW, day_type_of=_plain_day_type, day_types=("weekday",), tz=UTC
        )
        == {}
    )


def test_learner_output_validates_against_the_profile_schema():
    """The learner's output, wrapped in a minimal document, is a valid profile."""
    group = fit_group_expected(
        _samples(), day_types=("weekday", "weekend"), max_value=MAX_VALUE, tz=UTC
    )
    assert group is not None
    doc = empty_profile(day_types=("weekday", "weekend"))
    doc["training_window"] = list(WINDOW)
    doc["groups"]["living_room"] = {**group, "lights": _lamp_profile()}
    assert validate_profile(doc) == doc
