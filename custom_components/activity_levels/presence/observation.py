"""What one update of a tracked device looks like, and how Bermuda spells it.

``Observation`` is deliberately a plain dataclass with room in it: phase 3 adds
barometric pressure for floor disambiguation and a walking/still activity state, and
neither should have to touch the filter's shape to get there.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field

BERMUDA_DOMAIN = "bermuda"
RANGE_SUFFIX = "_range"
UNREACHABLE = 999.0
"""Bermuda's "no idea": a reading at or past this is not a reading at all."""


@dataclass(frozen=True)
class RoomActivity:
    """One room's activity level, as evidence.

    ``level`` is already scaled to ``[0, 1]`` by the caller -- the room's evidence level
    over its ``max_value`` -- and ``slope`` is in the same units per second. Only the
    sign of the slope is read: a rising level is a stimulus firing right now, whatever
    the level has reached. ``floor`` is this room's own likelihood at a level of 0.0
    when it has one -- a bedroom reads 0.0 with somebody asleep in it -- and ``None``
    takes the estimator's.
    """

    level: float
    slope: float
    floor: float | None = None


@dataclass(frozen=True)
class Observation:
    """Everything the filter is told at one instant. ``None`` is "no reading".

    ``distances`` must be a **full frame**: every scanner the integration knows about,
    every update, with ``None`` where there is no current reading. Never a delta of what
    changed. A scanner missing from the mapping is read as silence, and silence demotes
    its room to the emission floor -- which can leave that room outranking one the
    evidence actively argues against. Omitting an unchanged reading would therefore
    quietly promote the rooms nobody can hear.

    ``activity`` is each room's own activity level. A room absent from the mapping
    contributes nothing, so a caller with no levels to offer leaves it empty and the
    filter behaves as it did before there was such a thing.
    """

    t: float
    distances: Mapping[str, float | None] = field(default_factory=dict)
    home: bool = True
    activity: Mapping[str, RoomActivity] = field(default_factory=dict)


def scanner_key(unique_id: str, device_unique_id: str) -> str | None:
    """The scanner a Bermuda per-scanner distance sensor measures against.

    Bermuda keys those ``<device unique id>_<scanner address>_range``, and hangs a whole
    shelf of other entities off the same device whose ids begin the same way: the
    device's own closest-range ``_range``, an unfiltered ``_range_raw`` twin of every
    per-scanner reading, an area, a floor, a nearest scanner. The device's own unique id
    is what tells them apart -- strip it off the front, strip the suffix off the back,
    and what is left is the scanner, or nothing at all. Everything else gets ``None``,
    which is how the coordinator filters them out.

    Note the scanner address here is Bermuda's ``address_wifi_mac or address``: for a
    Wi-Fi proxy that is the network MAC, not the Bluetooth one, which is why placing a
    scanner has to try both kinds of registry connection.
    """
    prefix = f"{device_unique_id}_"
    if not unique_id.startswith(prefix) or not unique_id.endswith(RANGE_SUFFIX):
        return None
    scanner = unique_id[len(prefix) : -len(RANGE_SUFFIX)]
    return scanner or None


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
