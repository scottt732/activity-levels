"""Seeded sampler that turns a light profile into a day's plan of actions.

Pure: no ``homeassistant`` imports and no wall clock. Given the same
:class:`numpy.random.Generator` seed and the same inputs it returns the same plan,
which is what makes the simulation engine testable.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime, time, tzinfo
from typing import Any

import numpy as np

from .profile import MINUTES_PER_DAY, SLOTS, slot_minute

NEAR_MINUTES = 90
"""How far from a slot a recorded switch time may be and still be drawn for it."""

MIN_GAP_SECONDS = 600.0
"""Two actions for the same light are never closer together than this."""


@dataclass(frozen=True)
class PlannedAction:
    """One scheduled light action."""

    t: float
    entity_id: str
    on: bool
    brightness: int | None


def _minute_of(hhmm: str) -> int:
    hour, _, minute = hhmm.partition(":")
    return int(hour) * 60 + int(minute)


def in_quiet_hours(minute_of_day: int, quiet: tuple[str, str] | None) -> bool:
    """Whether ``minute_of_day`` falls in ``quiet``, which may wrap midnight."""
    if quiet is None:
        return False
    start, end = _minute_of(quiet[0]), _minute_of(quiet[1])
    if start == end:
        return False
    if start < end:
        return start <= minute_of_day < end
    return minute_of_day >= start or minute_of_day < end


def _curve[T](by_day_type: Mapping[str, Sequence[T]], day_type: str) -> Sequence[T] | None:
    """The day type's curve, falling back to ``weekday`` then to any present."""
    curve = by_day_type.get(day_type)
    if curve is None:
        curve = by_day_type.get("weekday")
    if curve is None:
        curve = next(iter(by_day_type.values()), None)
    return curve


def _circular_distance(a: int, b: int) -> int:
    delta = abs(a - b) % MINUTES_PER_DAY
    return min(delta, MINUTES_PER_DAY - delta)


def _pick_minute(rng: np.random.Generator, candidates: Sequence[int], slot: int) -> int:
    """Draw a switch time near ``slot``; fall back to the slot's own minute."""
    minute = slot_minute(slot)
    near = [int(m) for m in candidates if _circular_distance(int(m), minute) <= NEAR_MINUTES]
    if not near:
        return minute
    return near[int(rng.integers(len(near)))]


def sample_plan(
    rng: np.random.Generator,
    *,
    light_profile: Mapping[str, Any],
    day_type: str,
    day_start: float,
    tz: tzinfo,
    quiet_hours: tuple[str, str] | None,
    jitter_minutes: int = 20,
    initial_state: Mapping[str, bool],
    start_slot: int = 0,
) -> list[PlannedAction]:
    """Sample one day of light actions from ``light_profile``.

    ``day_start`` is the epoch of local midnight and ``tz`` its zone; action times
    are built from the local wall clock (``datetime.combine(date, time, tzinfo=tz)``)
    rather than by adding seconds to ``day_start``, so a plan stays on wall time
    across a DST transition. Quiet hours suppress ON actions only -- an OFF is always
    planned, so a light is never stranded on. Actions come back sorted by time, with
    no two actions for the same light closer together than :data:`MIN_GAP_SECONDS`,
    and strictly alternating ON/OFF per light.

    The walk begins at ``start_slot`` and ``initial_state`` describes the lights as
    they are *there*, not at midnight: a plan sampled at 21:00 neither replays the
    evening it missed nor inherits the state machine that would have run over it, and
    it never places an action before its own start.
    """
    start = max(0, min(SLOTS - 1, int(start_slot)))
    start_minute = slot_minute(start)
    local_date = datetime.fromtimestamp(day_start, tz).date()
    actions: list[PlannedAction] = []
    for entity_id in sorted(light_profile):
        spec = light_profile[entity_id]
        p_on = _curve(spec.get("p_on") or {}, day_type)
        if p_on is None or len(p_on) < SLOTS:
            continue
        on_starts = _curve(spec.get("on_starts") or {}, day_type) or ()
        off_starts = _curve(spec.get("off_starts") or {}, day_type) or ()
        brightness = spec.get("brightness")
        state = bool(initial_state.get(entity_id, False))
        for slot in range(start, SLOTS):
            draw = float(rng.random())
            probability = float(p_on[slot])
            if not state and probability > draw:
                turn_on = True
            elif state and probability < draw:
                turn_on = False
            else:
                continue
            minute = _pick_minute(rng, on_starts if turn_on else off_starts, slot)
            minute += int(rng.integers(-jitter_minutes, jitter_minutes + 1))
            minute = max(start_minute, min(MINUTES_PER_DAY - 1, minute))
            if turn_on and in_quiet_hours(minute, quiet_hours):
                continue
            hour, in_hour = divmod(minute, 60)
            actions.append(
                PlannedAction(
                    t=datetime.combine(local_date, time(hour, in_hour), tzinfo=tz).timestamp(),
                    entity_id=entity_id,
                    on=turn_on,
                    brightness=int(brightness) if turn_on and brightness is not None else None,
                )
            )
            state = turn_on

    actions.sort(key=lambda a: (a.t, a.entity_id))
    kept: list[PlannedAction] = []
    last: dict[str, float] = {}
    emitted: dict[str, bool] = {e: bool(on) for e, on in initial_state.items()}
    for action in actions:
        previous = last.get(action.entity_id)
        if previous is not None and action.t - previous < MIN_GAP_SECONDS:
            continue
        # Jitter can reorder a pair, and the gap filter can drop one of them; re-derive
        # alternation from the kept actions so a light never gets two ONs or two OFFs
        # in a row.
        if emitted.get(action.entity_id, False) == action.on:
            continue
        kept.append(action)
        last[action.entity_id] = action.t
        emitted[action.entity_id] = action.on
    return kept
