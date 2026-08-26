"""Duration parsing: numbers (seconds), '30s'/'5m'/'2h'/'1d', or 'HH:MM[:SS[.f]]'."""

from __future__ import annotations

import math
import re

import voluptuous as vol

_UNITS = {"s": 1.0, "m": 60.0, "h": 3600.0, "d": 86400.0}
_UNIT_RE = re.compile(r"^(\d+(?:\.\d+)?)\s*([smhd])$")
_CLOCK_RE = re.compile(r"^(\d+):(\d{2})(?::(\d{2}(?:\.\d+)?))?$")


def parse_duration(value: object) -> float:
    if isinstance(value, bool):
        raise vol.Invalid("duration must be a number or string")
    if isinstance(value, int | float):
        seconds = float(value)
    elif isinstance(value, str):
        text = value.strip().lower()
        if m := _UNIT_RE.match(text):
            seconds = float(m.group(1)) * _UNITS[m.group(2)]
        elif m := _CLOCK_RE.match(text):
            seconds = int(m.group(1)) * 3600.0 + int(m.group(2)) * 60.0
            if m.group(3):
                seconds += float(m.group(3))
        else:
            raise vol.Invalid(f"invalid duration '{value}'")
    else:
        raise vol.Invalid("duration must be a number or string")
    if not math.isfinite(seconds) or seconds < 0:
        raise vol.Invalid("duration must be a finite, non-negative number of seconds")
    return seconds
