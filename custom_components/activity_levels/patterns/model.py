"""The built-in producer: ridge/Fourier activity model and light profile.

Pure numpy; no ``homeassistant`` imports. The output of :func:`fit_group_expected`
and :func:`fit_light_profile` is exactly the per-group shape of the profile
document validated by :mod:`.profile`.
"""

from __future__ import annotations

import statistics
from bisect import bisect_right
from collections import defaultdict
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, tzinfo
from typing import Any

import numpy as np
import numpy.typing as npt

from .features import design_matrix
from .profile import SLOT_MINUTES, SLOTS, slot_minute

SLOT_SECONDS = SLOT_MINUTES * 60

MIN_BUCKET_SAMPLES = 20
"""Residual bucket size below which the group-wide quantiles are used instead."""

MAX_TRANSITIONS = 200
"""Cap on the stored on/off time distributions, per light and day type."""

BASE_DAY_TYPE = "weekday"


@dataclass(frozen=True)
class Sample:
    """One hourly-mean activity row."""

    t: float
    value: float
    day_type: str


@dataclass(frozen=True)
class LightTransition:
    """One observed light state change."""

    t: float
    entity_id: str
    on: bool
    brightness: int | None


def _ordered_day_types(day_types: Sequence[str], samples: Sequence[Sample]) -> list[str]:
    """Day types with the base (``weekday``) first; unknown ones appended."""
    ordered = [BASE_DAY_TYPE]
    for day_type in day_types:
        if day_type not in ordered:
            ordered.append(day_type)
    for day_type in sorted({s.day_type for s in samples}):
        if day_type not in ordered:
            ordered.append(day_type)
    return ordered


def _ridge_solve(
    x: npt.NDArray[np.float64], y: npt.NDArray[np.float64], ridge: float
) -> npt.NDArray[np.float64]:
    """Solve ``(X'X + lambda*D) b = X'y`` with intercept and trend left unpenalized.

    The trend column spans only ``window_days/365``, so a fixed ridge shrinks its
    coefficient by a quarter over a 60-day window and drags the expected-now value
    back toward the window mean. Like the intercept it is a location term, not a
    wiggle, so it is exempt.
    """
    penalty = np.eye(x.shape[1], dtype=np.float64)
    penalty[0, 0] = 0.0
    penalty[1, 1] = 0.0
    lhs = x.T @ x + ridge * penalty
    rhs = x.T @ y
    try:
        return np.linalg.solve(lhs, rhs).astype(np.float64)
    except np.linalg.LinAlgError:  # pragma: no cover - ridge keeps this reachable only in theory
        return np.linalg.lstsq(lhs, rhs, rcond=None)[0].astype(np.float64)


def _slot_grid(dates: Sequence[date], tz: tzinfo) -> npt.NDArray[np.float64]:
    """Timestamps for every ``(slot, training date)`` pair, slot-major."""
    grid = np.empty(SLOTS * len(dates), dtype=np.float64)
    for slot in range(SLOTS):
        hour, minute = divmod(slot_minute(slot), 60)
        for j, day in enumerate(dates):
            grid[slot * len(dates) + j] = datetime.combine(
                day, time(hour, minute), tzinfo=tz
            ).timestamp()
    return grid


def fit_group_expected(
    samples: Sequence[Sample],
    *,
    day_types: Sequence[str],
    max_value: float,
    tz: tzinfo,
    ridge: float = 1.0,
    min_days: int = 14,
) -> dict[str, Any] | None:
    """Fit the activity model for one group.

    Returns the group's ``{"ready", "days", "expected"}`` block, or ``None`` when
    there are no samples. Curves are returned even when ``ready`` is ``False``.
    """
    if not samples:
        return None

    ordered = _ordered_day_types(day_types, samples)
    index = {day_type: i for i, day_type in enumerate(ordered)}
    n_day_types = len(ordered)

    rows = sorted(samples, key=lambda s: s.t)
    ts = np.array([s.t for s in rows], dtype=np.float64)
    y = np.array([s.value for s in rows], dtype=np.float64)
    idx = np.array([index[s.day_type] for s in rows], dtype=np.int64)

    x = design_matrix(ts, idx, n_day_types, tz)
    beta = _ridge_solve(x, y, ridge)
    residuals = y - x @ beta

    locals_ = [datetime.fromtimestamp(float(t), tz) for t in ts]
    hours = np.array([lt.hour for lt in locals_], dtype=np.int64)
    dates = sorted({lt.date() for lt in locals_})
    days = len(dates)

    global_q = (float(np.quantile(residuals, 0.25)), float(np.quantile(residuals, 0.75)))
    quantiles: dict[tuple[str, int], tuple[float, float]] = {}
    present = {ordered[i] for i in set(idx.tolist())}
    for day_type in present:
        day_mask = idx == index[day_type]
        for hour in range(24):
            mask = day_mask & (hours == hour)
            if int(mask.sum()) >= MIN_BUCKET_SAMPLES:
                bucket = residuals[mask]
                quantiles[(day_type, hour)] = (
                    float(np.quantile(bucket, 0.25)),
                    float(np.quantile(bucket, 0.75)),
                )
            else:
                quantiles[(day_type, hour)] = global_q

    grid = _slot_grid(dates, tz)
    origin = float(ts[0])
    medians: dict[str, npt.NDArray[np.float64]] = {}
    for day_type in sorted(present | {BASE_DAY_TYPE}):
        grid_idx = np.full(grid.shape[0], index[day_type], dtype=np.int64)
        grid_x = design_matrix(grid, grid_idx, n_day_types, tz, t0=origin)
        # Keep the date grid so the weekly terms average out, but evaluate the trend
        # at the last training day: expected-now must not lag behind a trend.
        grid_x[:, 1] = (float(ts[-1]) - origin) / 86400.0 / 365.0
        prediction = (grid_x @ beta).reshape(SLOTS, days).mean(axis=1)
        medians[day_type] = np.clip(prediction, 0.0, max_value)

    expected: dict[str, list[list[float]]] = {}
    for day_type in ordered:
        source = day_type if day_type in medians else BASE_DAY_TYPE
        p50s = medians[source]
        curve: list[list[float]] = []
        for slot in range(SLOTS):
            q25, q75 = quantiles.get((source, slot_minute(slot) // 60), global_q)
            p50 = float(p50s[slot])
            p25 = min(min(max(p50 + q25, 0.0), max_value), p50)
            p75 = max(min(max(p50 + q75, 0.0), max_value), p50)
            curve.append([p25, p50, p75])
        expected[day_type] = curve

    return {"ready": days >= min_days, "days": days, "expected": expected}


def _intervals(
    transitions: Sequence[LightTransition], end: float
) -> tuple[list[tuple[float, float]], list[tuple[float, bool, int | None]]]:
    """Reconstruct on-intervals and the state changes that produced them.

    The light is assumed off before the first transition in the window; an
    interval still open at ``end`` is closed there.
    """
    intervals: list[tuple[float, float]] = []
    changes: list[tuple[float, bool, int | None]] = []
    opened: float | None = None
    for transition in transitions:
        if transition.on and opened is None:
            opened = transition.t
            changes.append((transition.t, True, transition.brightness))
        elif not transition.on and opened is not None:
            intervals.append((opened, transition.t))
            opened = None
            changes.append((transition.t, False, transition.brightness))
    if opened is not None:
        intervals.append((opened, end))
    return intervals, changes


def _slot_bounds(
    start: float, end: float, day_type_of: Callable[[date], str], tz: tzinfo
) -> tuple[list[float], list[tuple[str, int]]]:
    """Slot boundary epochs and the ``(day_type, slot)`` bucket of each slot.

    Each day is laid out as ``local_midnight + i*900`` and truncated at the next local
    midnight, so the array is strictly increasing and no instant is credited to two
    slots. The cost lands on the two DST days a year, at the day's tail: a
    spring-forward day ends four slots early, and a fall-back day's last slot absorbs
    the extra hour (75 minutes wide). Slot labels after the transition are an hour off
    wall time on those days -- accepted in exchange for an array ``bisect`` can search.
    """
    first = datetime.fromtimestamp(start, tz).date()
    last = datetime.fromtimestamp(end, tz).date()
    bounds: list[float] = []
    buckets: list[tuple[str, int]] = []
    day = first
    while day <= last:
        day_type = day_type_of(day)
        midnight = datetime.combine(day, time(0, 0), tzinfo=tz).timestamp()
        next_midnight = datetime.combine(day + timedelta(days=1), time(0, 0), tzinfo=tz).timestamp()
        for slot in range(SLOTS):
            boundary = midnight + slot * SLOT_SECONDS
            if boundary >= next_midnight:
                break
            bounds.append(boundary)
            buckets.append((day_type, slot))
        day += timedelta(days=1)
    bounds.append(datetime.combine(last + timedelta(days=1), time(0, 0), tzinfo=tz).timestamp())
    return bounds, buckets


def _accumulate(
    bounds: list[float],
    buckets: list[tuple[str, int]],
    span: tuple[float, float],
    into: dict[tuple[str, int], float],
) -> None:
    """Add the minutes of ``span`` overlapping each slot into ``into``."""
    lo, hi = span
    if hi <= lo:
        return
    k = max(bisect_right(bounds, lo) - 1, 0)
    while k < len(buckets) and bounds[k] < hi:
        overlap = min(bounds[k + 1], hi) - max(bounds[k], lo)
        if overlap > 0.0:
            into[buckets[k]] += overlap / 60.0
        k += 1


def fit_light_profile(
    transitions: Sequence[LightTransition],
    *,
    window: tuple[float, float],
    day_type_of: Callable[[date], str],
    day_types: Sequence[str],
    tz: tzinfo,
) -> dict[str, dict[str, Any]]:
    """Learn per-light on-probabilities and switch-time distributions.

    ``brightness`` is the median over ON transitions only: a brightness change while
    the light is already on is not a state change and is ignored. A ``(day_type, slot)``
    bucket with no observed time at all gets ``p_on = 0.0`` rather than the Laplace
    prior 0.5, which would otherwise invent a coin flip out of no data.
    """
    start, end = float(window[0]), float(window[1])
    if end <= start:
        return {}

    inside = sorted((t for t in transitions if start <= t.t < end), key=lambda t: t.t)
    if not inside:
        return {}

    bounds, buckets = _slot_bounds(start, end, day_type_of, tz)
    observed: dict[tuple[str, int], float] = {}
    for k, bucket in enumerate(buckets):
        overlap = min(bounds[k + 1], end) - max(bounds[k], start)
        if overlap > 0.0:
            observed[bucket] = observed.get(bucket, 0.0) + overlap / 60.0

    seen = {day_type for day_type, _slot in observed}
    ordered = [d for d in day_types if d in seen] + sorted(seen - set(day_types))

    by_entity: dict[str, list[LightTransition]] = defaultdict(list)
    for transition in inside:
        by_entity[transition.entity_id].append(transition)

    profile: dict[str, dict[str, Any]] = {}
    for entity_id, entity_transitions in by_entity.items():
        intervals, changes = _intervals(entity_transitions, end)
        on_minutes: dict[tuple[str, int], float] = defaultdict(float)
        for span in intervals:
            _accumulate(bounds, buckets, (max(span[0], start), min(span[1], end)), on_minutes)

        p_on: dict[str, list[float]] = {}
        for day_type in ordered:
            p_on[day_type] = [
                _laplace(
                    on_minutes.get((day_type, slot), 0.0),
                    observed.get((day_type, slot), 0.0),
                )
                for slot in range(SLOTS)
            ]

        starts: dict[bool, dict[str, list[tuple[float, int]]]] = {
            True: defaultdict(list),
            False: defaultdict(list),
        }
        brightnesses: list[int] = []
        for t, on, brightness in changes:
            local = datetime.fromtimestamp(t, tz)
            starts[on][day_type_of(local.date())].append((t, local.hour * 60 + local.minute))
            if on and brightness is not None:
                brightnesses.append(int(brightness))

        profile[entity_id] = {
            "p_on": p_on,
            "on_starts": _capped(starts[True]),
            "off_starts": _capped(starts[False]),
            "brightness": round(statistics.median(brightnesses)) if brightnesses else None,
        }
    return profile


def _laplace(on_minutes: float, observed_minutes: float) -> float:
    """Laplace-smoothed on-probability; ``0.0`` when nothing was observed."""
    if observed_minutes <= 0.0:
        return 0.0
    return min(max((on_minutes + 1.0) / (observed_minutes + 2.0), 0.0), 1.0)


def _capped(raw: dict[str, list[tuple[float, int]]]) -> dict[str, list[int]]:
    """Keep the most recent :data:`MAX_TRANSITIONS` entries, sorted by minute."""
    out: dict[str, list[int]] = {}
    for day_type, entries in raw.items():
        recent = sorted(entries, key=lambda e: e[0])[-MAX_TRANSITIONS:]
        out[day_type] = sorted(minute for _t, minute in recent)
    return out
