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
class Observation:
    """Everything the filter is told at one instant. ``None`` is "no reading".

    ``distances`` must be a **full frame**: every scanner the integration knows about,
    every update, with ``None`` where there is no current reading. Never a delta of what
    changed. A scanner missing from the mapping is read as silence, and silence demotes
    its room to the emission floor -- which can leave that room outranking one the
    evidence actively argues against. Omitting an unchanged reading would therefore
    quietly promote the rooms nobody can hear.
    """

    t: float
    distances: Mapping[str, float | None] = field(default_factory=dict)
    home: bool = True


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
