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


SITE_SCHEMA = vol.Schema(
    {
        vol.Optional("ground_z", default=0): coordinate,
        vol.Optional("features", default=list): vol.All(
            [
                vol.Schema(
                    {
                        vol.Required("name"): vol.All(str, vol.Length(min=1, max=100)),
                        vol.Required("kind"): vol.In(
                            ["property", "lawn", "driveway", "path", "pool"]
                        ),
                        vol.Required("points"): points,
                    }
                )
            ],
            vol.Length(max=128),
        ),
    }
)


def position(value: Any) -> list[float]:
    """An XYZ point in the same absolute metre frame as room geometry."""
    return _point(value, 3)


FIXTURE_SCHEMA = vol.Schema(
    {
        vol.Optional("look_down"): bool,
        vol.Optional("profile_id"): vol.All(str, vol.Length(min=1, max=100)),
        vol.Required("entity"): vol.Match(r"^(binary_sensor|light)\.[a-z0-9_]+$"),
        vol.Required("kind"): vol.In(["motion", "occupancy", "light", "window"]),
        vol.Optional("name", default=""): vol.All(str, vol.Length(max=100)),
        vol.Required("position"): position,
        vol.Optional("width"): vol.All(coordinate, vol.Range(min=0.1, max=20)),
        vol.Optional("height"): vol.All(coordinate, vol.Range(min=0.1, max=20)),
        vol.Optional("yaw", default=0): vol.All(coordinate, vol.Range(min=-360, max=360)),
        vol.Optional("pitch", default=0): vol.All(coordinate, vol.Range(min=-90, max=90)),
        vol.Optional("fov", default=60): vol.All(coordinate, vol.Range(min=1, max=170)),
        vol.Optional("vertical_fov", default=45): vol.All(coordinate, vol.Range(min=1, max=170)),
        vol.Optional("range", default=0): vol.All(coordinate, vol.Range(min=0, max=100)),
        vol.Optional("mount", default=""): vol.All(str, vol.Length(max=60)),
        vol.Optional("technology", default=""): vol.All(str, vol.Length(max=60)),
    }
)


def fixtures(value: Any) -> list[dict[str, Any]]:
    """Enforce entity/type agreement and one placement per entity in a room."""
    result: list[dict[str, Any]] = vol.All([FIXTURE_SCHEMA], vol.Length(max=128))(value)
    entities: set[str] = set()
    for item in result:
        light = item["entity"].startswith("light.")
        if light != (item["kind"] == "light"):
            raise vol.Invalid(
                "light entities need light type; binary sensors need motion/occupancy/window"
            )
        if item["entity"] in entities:
            raise vol.Invalid("an entity can only be placed once per room")
        entities.add(item["entity"])
    return result


SENSOR_PROFILE_SCHEMA = vol.Schema(
    {
        vol.Required("id"): vol.All(str, vol.Length(min=1, max=100)),
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=100)),
        vol.Required("kind"): vol.In(["motion", "occupancy", "light", "window"]),
        vol.Optional("look_down"): bool,
        vol.Required("fov"): vol.All(coordinate, vol.Range(min=1, max=170)),
        vol.Required("vertical_fov"): vol.All(coordinate, vol.Range(min=1, max=170)),
        vol.Required("range"): vol.All(coordinate, vol.Range(min=0, max=100)),
        vol.Optional("technology", default=""): vol.All(str, vol.Length(max=60)),
        vol.Optional("mount", default=""): vol.All(str, vol.Length(max=60)),
        vol.Optional("notes", default=""): vol.All(str, vol.Length(max=2000)),
        vol.Optional("source", default=""): vol.All(str, vol.Length(max=500)),
        vol.Optional("match", default=dict): {
            vol.Optional(key): vol.All(str, vol.Length(min=1, max=200))
            for key in ("manufacturer", "model", "platform", "device_class", "entity_name")
        },
    }
)


OPENING_SCHEMA = vol.Schema(
    {
        vol.Required("id"): vol.All(str, vol.Length(min=1, max=100)),
        vol.Optional("name", default=""): vol.All(str, vol.Length(max=100)),
        vol.Required("kind"): vol.In(["interior_door", "exterior_door", "open_wall", "window"]),
        vol.Required("position"): position,
        vol.Optional("yaw", default=0): vol.All(coordinate, vol.Range(min=-360, max=360)),
        vol.Optional("width", default=0.9): vol.All(coordinate, vol.Range(min=0.1, max=20)),
        vol.Optional("height", default=2): vol.All(coordinate, vol.Range(min=0.1, max=20)),
        vol.Optional("hinge", default="left"): vol.In(["left", "right"]),
        vol.Optional("swing", default="in"): vol.In(["in", "out"]),
        vol.Optional("open", default=False): bool,
        vol.Optional("entity"): vol.Match(r"^binary_sensor\.[a-z0-9_]+$"),
        vol.Optional("entities"): vol.All(
            [vol.Match(r"^binary_sensor\.[a-z0-9_]+$")], vol.Length(max=128), vol.Unique()
        ),
    }
)


def openings(value: Any) -> list[dict[str, Any]]:
    """Keep editable architectural openings independent of optional contact sensors."""
    result: list[dict[str, Any]] = vol.All([OPENING_SCHEMA], vol.Length(max=128))(value)
    ids: set[str] = set()
    for item in result:
        if item["id"] in ids:
            raise vol.Invalid("an opening id can only occur once per room")
        ids.add(item["id"])
    return result
