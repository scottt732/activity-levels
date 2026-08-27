"""What one update of a tracked device looks like, and how Bermuda spells it.

``Observation`` is deliberately a plain dataclass with room in it: phase 3 adds
barometric pressure for floor disambiguation and a walking/still activity state, and
neither should have to touch the filter's shape to get there.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field

BERMUDA_DOMAIN = "bermuda"
DISTANCE_SUFFIX = "_distance"
UNREACHABLE = 999.0
"""Bermuda's "no idea": a reading at or past this is not a reading at all."""


@dataclass(frozen=True)
class Observation:
    """Everything the filter is told at one instant. ``None`` is "no reading"."""

    t: float
    distances: Mapping[str, float | None] = field(default_factory=dict)
    home: bool = True


def scanner_key(unique_id: str) -> str | None:
    """The scanner a Bermuda per-scanner distance sensor measures against.

    Those sensors are keyed ``<device address>_<scanner address>_distance``. Anything
    else the device owns -- its area, its nearest-scanner summary -- is not a
    per-scanner reading and gets ``None``, which is how the coordinator filters them out.
    """
    if not unique_id.endswith(DISTANCE_SUFFIX):
        return None
    stem = unique_id[: -len(DISTANCE_SUFFIX)]
    _, separator, scanner = stem.rpartition("_")
    return scanner if separator and scanner else None


def parse_distance(state: str | None) -> float | None:
    """Metres, or None for unknown, unavailable, negative, infinite or 999."""
    if state is None:
        return None
    try:
        value = float(state)
    except ValueError:
        return None
    # NaN fails both comparisons, and inf fails the upper one: neither is a distance
    return value if 0.0 <= value < UNREACHABLE else None
