"""Day-type resolution: which learned pattern applies to a given day."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

BUILTIN_DAY_TYPES = ("weekday", "weekend", "holiday")


@dataclass(frozen=True)
class DayTypeInputs:
    """Signals used to classify a day."""

    weekday: int  # 0=Mon .. 6=Sun
    is_workday: bool | None  # None = unknown (no workday entity configured)
    calendars_active: frozenset[str]


def resolve_day_type(inputs: DayTypeInputs, precedence: Sequence[str]) -> str:
    """Return the highest-precedence day type that applies to ``inputs``.

    Candidates are the active calendar ids, plus ``holiday`` when the workday
    entity says today is off on what would otherwise be a weekday, plus
    ``weekend``/``weekday`` for the calendar day of week. ``weekday`` is always a
    candidate, so a result always exists.
    """
    candidates = set(inputs.calendars_active)
    if inputs.is_workday is False and inputs.weekday < 5:
        candidates.add("holiday")
    if inputs.weekday >= 5:
        candidates.add("weekend")
    candidates.add("weekday")
    for day_type in precedence:
        if day_type in candidates:
            return day_type
    return "weekday"
