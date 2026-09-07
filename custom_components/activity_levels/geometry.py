"""Plain geometry in meters, independent of the activity tree and Home Assistant."""

from __future__ import annotations

import math
from typing import Any

import voluptuous as vol

MAX_POINTS = 4096


def coordinate(value: Any) -> float:
    """Keep booleans and non-finite YAML numbers out of geometry and JSON responses."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise vol.Invalid("expected a finite number")
    try:
        result = float(value)
    except (ValueError, OverflowError) as err:
        raise vol.Invalid("expected a finite number") from err
    if not math.isfinite(result):
        raise vol.Invalid("expected a finite number")
    return result


def _point(value: Any, dimensions: int) -> list[float]:
    if not isinstance(value, list) or len(value) != dimensions:
        raise vol.Invalid(f"expected {dimensions} coordinates")
    return [coordinate(item) for item in value]


def bounds(value: Any) -> list[list[float]]:
    """Two ordered XYZ corners, with a positive extent along every axis."""
    if not isinstance(value, list) or len(value) != 2:
        raise vol.Invalid("bounds need two XYZ corners")
    low, high = (_point(item, 3) for item in value)
    if any(a >= b for a, b in zip(low, high, strict=True)):
        raise vol.Invalid("bounds must increase along X, Y and Z")
    return [low, high]


def points(value: Any) -> list[list[float]]:
    """Normalize redundant vertices without guessing at a damaged room outline."""
    if not isinstance(value, list) or not 3 <= len(value) <= MAX_POINTS:
        raise vol.Invalid(f"points need between 3 and {MAX_POINTS} vertices")
    result: list[list[float]] = []
    for item in value:
        point = _point(item, 2)
        if not result or point != result[-1]:
            result.append(point)
    if len(result) > 1 and result[0] == result[-1]:
        result.pop()
    if len({tuple(point) for point in result}) < 3:
        raise vol.Invalid("points need at least three distinct vertices")
    # Translate before measuring area so a small room far from the origin does not
    # lose precision by subtracting two large absolute-coordinate products.
    x0, y0 = result[0]
    area = sum(
        (a[0] - x0) * (b[1] - y0) - (b[0] - x0) * (a[1] - y0)
        for a, b in zip(result, [*result[1:], result[0]], strict=True)
    )
    if not math.isfinite(area) or area == 0:
        raise vol.Invalid("points must enclose a non-zero finite area")
    return result


GPS_SCHEMA = vol.Schema(
    {
        vol.Required("latitude"): vol.All(coordinate, vol.Range(min=-90, max=90)),
        vol.Required("longitude"): vol.All(coordinate, vol.Range(min=-180, max=180)),
        vol.Optional("elevation"): coordinate,
        vol.Optional("rotation"): coordinate,
    }
)
