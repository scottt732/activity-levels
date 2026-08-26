"""The profile document: schema, validation and read helpers.

The profile is the contract between *any* producer (the built-in learner or an
external one posting through the websocket API) and the entities that read it.
Pure code: no ``homeassistant`` imports.
"""

from __future__ import annotations

import math
import time
from collections.abc import Iterable, Mapping, Sequence
from typing import Any

import voluptuous as vol

SLOT_MINUTES = 15
SLOTS = 96
MINUTES_PER_DAY = SLOTS * SLOT_MINUTES
VERSION = "0.1.0"
"""Version of the built-in producer, stamped into documents it writes."""

DOC_VERSION = 1
"""Schema version of the document itself."""

EPS = 1e-9


class ProfileError(Exception):
    """Validation failure with path-addressed errors."""

    def __init__(self, errors: list[dict[str, str]]) -> None:
        super().__init__("; ".join(f"{e['path']}: {e['message']}" for e in errors))
        self.errors = errors


def slot_of(minute_of_day: int) -> int:
    """Return the 15-minute slot (0..95) containing ``minute_of_day``."""
    return int(minute_of_day) // SLOT_MINUTES % SLOTS


def slot_minute(slot: int) -> int:
    """Return the minute-of-day at which ``slot`` starts."""
    return int(slot) * SLOT_MINUTES


def _number(value: Any) -> float:
    if isinstance(value, bool) or not isinstance(value, int | float):
        raise vol.Invalid("must be a number")
    number = float(value)
    if not math.isfinite(number):
        raise vol.Invalid("must be finite")
    return number


def _unit(value: Any) -> float:
    number = _number(value)
    if not 0.0 <= number <= 1.0:
        raise vol.Invalid("must be between 0 and 1")
    return number


def _int(value: Any, lo: int, hi: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise vol.Invalid("must be an integer")
    if not lo <= value <= hi:
        raise vol.Invalid(f"must be between {lo} and {hi}")
    return value


def _minute(value: Any) -> int:
    return _int(value, 0, MINUTES_PER_DAY - 1)


def _brightness(value: Any) -> int:
    return _int(value, 0, 255)


def _days(value: Any) -> int:
    return _int(value, 0, 100_000)


def _band(value: Any) -> list[float]:
    """Validate one ``[p25, p50, p75]`` triple."""
    if not isinstance(value, list | tuple) or len(value) != 3:
        raise vol.Invalid("must be [p25, p50, p75]")
    numbers = []
    for i, item in enumerate(value):
        try:
            numbers.append(_number(item))
        except vol.Invalid as exc:
            exc.prepend([i])
            raise
    p25, p50, p75 = numbers
    if p25 < 0.0:
        raise vol.Invalid("must be >= 0", path=[0])
    if not p25 <= p50 <= p75:
        raise vol.Invalid("must satisfy p25 <= p50 <= p75")
    return numbers


def _exactly(count: int) -> Any:
    def check(value: Any) -> list[Any]:
        if not isinstance(value, list | tuple) or len(value) != count:
            raise vol.Invalid(f"must be a list of {count} values")
        return list(value)

    return check


def _window(value: Any) -> list[float]:
    if not isinstance(value, list | tuple) or len(value) != 2:
        raise vol.Invalid("must be [start, end] epoch seconds")
    numbers = []
    for i, item in enumerate(value):
        try:
            numbers.append(_number(item))
        except vol.Invalid as exc:
            exc.prepend([i])
            raise
    if numbers[0] > numbers[1]:
        raise vol.Invalid("start must be <= end")
    return numbers


_SLOT_CURVE = vol.All(_exactly(SLOTS), [_band])
_P_ON_CURVE = vol.All(_exactly(SLOTS), [_unit])

_LIGHT_SCHEMA = vol.Schema(
    {
        vol.Required("p_on"): {str: _P_ON_CURVE},
        vol.Optional("on_starts", default=dict): {str: [_minute]},
        vol.Optional("off_starts", default=dict): {str: [_minute]},
        vol.Optional("brightness", default=None): vol.Any(None, _brightness),
    }
)

_GROUP_SCHEMA = vol.Schema(
    {
        vol.Required("ready"): bool,
        vol.Required("days"): _days,
        vol.Required("expected"): {str: _SLOT_CURVE},
        vol.Optional("lights", default=dict): {str: _LIGHT_SCHEMA},
    }
)

PROFILE_SCHEMA = vol.Schema(
    {
        vol.Required("version"): DOC_VERSION,
        vol.Required("producer"): vol.Schema(
            {vol.Required("name"): str, vol.Required("version"): str}
        ),
        vol.Required("generated_at"): _number,
        vol.Required("training_window"): _window,
        vol.Required("day_types"): [str],
        vol.Required("slot_minutes"): SLOT_MINUTES,
        vol.Required("groups"): {str: _GROUP_SCHEMA},
    }
)


def _path(parts: Iterable[Any]) -> str:
    return "/".join(str(p) for p in parts)


def empty_profile(
    producer_name: str = "builtin",
    producer_version: str = VERSION,
    day_types: Sequence[str] = (),
) -> dict[str, Any]:
    """Return a valid, empty profile document."""
    now = time.time()
    return {
        "version": DOC_VERSION,
        "producer": {"name": producer_name, "version": producer_version},
        "generated_at": now,
        "training_window": [now, now],
        "day_types": list(day_types),
        "slot_minutes": SLOT_MINUTES,
        "groups": {},
    }


def validate_profile(doc: Mapping[str, Any]) -> dict[str, Any]:
    """Validate and normalize a profile document.

    Raises :class:`ProfileError` carrying every error found, each with the
    ``/``-joined path of the offending value.
    """
    try:
        validated: dict[str, Any] = PROFILE_SCHEMA(dict(doc))
    except vol.MultipleInvalid as exc:
        raise ProfileError([{"path": _path(e.path), "message": e.msg} for e in exc.errors]) from exc
    except vol.Invalid as exc:
        raise ProfileError([{"path": _path(exc.path), "message": exc.msg}]) from exc
    return validated


def group_ready(profile: Mapping[str, Any], gid: str) -> bool:
    """Return whether ``gid`` has a trained, usable curve."""
    group = profile.get("groups", {}).get(gid)
    return bool(group and group.get("ready"))


def expected_at(
    profile: Mapping[str, Any], gid: str, day_type: str, slot: int
) -> tuple[float, float, float] | None:
    """Return ``(p25, p50, p75)`` for a bucket, or ``None`` when unavailable.

    Falls back to the ``weekday`` curve, then to any day type present.
    """
    if not 0 <= slot < SLOTS:
        return None
    group = profile.get("groups", {}).get(gid)
    if not group:
        return None
    expected: Mapping[str, Any] = group.get("expected") or {}
    curve = expected.get(day_type) or expected.get("weekday")
    if curve is None:
        curve = next(iter(expected.values()), None)
    if curve is None:
        return None
    band = curve[slot]
    return float(band[0]), float(band[1]), float(band[2])


def anomaly_score(actual: float, band: tuple[float, float, float]) -> float:
    """Signed, band-normalized deviation. Positive = more active than usual."""
    p25, p50, p75 = band
    if actual > p75:
        return (actual - p75) / (p75 - p50 + EPS)
    if actual < p25:
        return (actual - p25) / (p50 - p25 + EPS)
    return 0.0
