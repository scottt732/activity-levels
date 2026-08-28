"""Configuration schema: validation and normalization of the options dict."""

from __future__ import annotations

import math
import re
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

import voluptuous as vol
from homeassistant.helpers import config_validation as cv

from .const import (
    ALLOWED_CHILDREN,
    BUILTIN_DAY_TYPES,
    CONF_AREA_ID,
    CONF_DEFAULTS,
    CONF_ENVELOPES,
    CONF_FLOOR_ID,
    CONF_GROUPS,
    CONF_KIND,
    CONF_PATTERNS,
    CONF_PRESENCE,
    CONF_SIMULATION,
    CONF_VERSION,
    CONNECTIONS,
    DEFAULT_CHILD_KIND,
    DEFAULT_CONNECTION,
    DEFAULT_ENVELOPE_ID,
    DEFAULT_MAX_VALUE,
    DEFAULT_MIN_WAKE_INTERVAL,
    DEFAULT_PRECISION,
    DEFAULT_SAFETY_REFRESH,
    KIND_AREA,
    KIND_FLOOR,
    KIND_OUTSIDE,
    KIND_PROPERTY,
    KINDS,
    NODE_KINDS,
    PRESENCE_KEY,
    TRIGGER_KEY,
)
from .duration import parse_duration
from .engine import Mix, NullHandling, Retrigger, Unavailable

GROUP_ID_RE = re.compile(r"^[a-z][a-z0-9_]*$")
HHMM_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


class ConfigError(Exception):
    """Validation failure with path-addressed errors."""

    def __init__(self, errors: list[dict[str, str]]) -> None:
        super().__init__("; ".join(f"{e['path']}: {e['message']}" for e in errors))
        self.errors = errors


def _finite(
    lo: float | None = None,
    lo_exclusive: bool = False,
    hi: float | None = None,
    hi_exclusive: bool = False,
) -> Any:
    def check(value: Any) -> float:
        if isinstance(value, bool) or not isinstance(value, int | float):
            raise vol.Invalid("must be a number")
        f = float(value)
        if not math.isfinite(f):
            raise vol.Invalid("must be finite")
        if lo is not None and (f <= lo if lo_exclusive else f < lo):
            raise vol.Invalid(f"must be {'>' if lo_exclusive else '>='} {lo}")
        if hi is not None and (f >= hi if hi_exclusive else f > hi):
            raise vol.Invalid(f"must be {'<' if hi_exclusive else '<='} {hi}")
        return f

    return check


def _group_id(value: Any) -> str:
    if not isinstance(value, str) or not GROUP_ID_RE.match(value):
        raise vol.Invalid("must match ^[a-z][a-z0-9_]*$")
    return value


def _to_states(value: Any) -> list[str]:
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list) or not value or not all(isinstance(s, str) and s for s in value):
        raise vol.Invalid("must be a non-empty state string or list of state strings")
    return [str(s) for s in value]


def _hhmm(value: Any) -> str:
    if not isinstance(value, str) or not HHMM_RE.match(value):
        raise vol.Invalid("must be HH:MM (24h)")
    return value


_calendar_entity = vol.All(cv.entity_id, cv.entity_domain("calendar"))
_device_tracker = vol.All(cv.entity_id, cv.entity_domain("device_tracker"))


def _quiet_hours(value: Any) -> list[str] | None:
    if value is None:
        return None
    if not isinstance(value, list) or len(value) != 2:
        raise vol.Invalid("must be a [start, end] pair of HH:MM times")
    return [_hhmm(v) for v in value]


_ENUM = {
    "mix": vol.Coerce(Mix),
    "null_handling": vol.Coerce(NullHandling),
    "retrigger": vol.Coerce(Retrigger),
    "unavailable": vol.Coerce(Unavailable),
}

ENVELOPE_SCHEMA = vol.Schema(
    {
        vol.Required("id"): _group_id,
        vol.Optional("attack", default=0.0): parse_duration,
        vol.Optional("decay", default=0.0): parse_duration,
        vol.Optional("sustain", default=1.0): _finite(0.0, hi=1.0),
        vol.Optional("release", default=1800.0): parse_duration,
        vol.Optional("impulse", default=False): cv.boolean,
        vol.Optional("retrigger", default=None): vol.Any(None, _ENUM["retrigger"]),
        vol.Optional("unavailable", default=None): vol.Any(None, _ENUM["unavailable"]),
        vol.Optional("debounce", default=None): vol.Any(None, parse_duration),
    }
)

# Every field a stimulus may override on its preset. Named once, because a group's
# presence voice takes exactly the same set.
_ENVELOPE_OVERRIDES: dict[Any, Any] = {
    vol.Optional("attack", default=None): vol.Any(None, parse_duration),
    vol.Optional("decay", default=None): vol.Any(None, parse_duration),
    vol.Optional("sustain", default=None): vol.Any(None, _finite(0.0, hi=1.0)),
    vol.Optional("release", default=None): vol.Any(None, parse_duration),
    vol.Optional("impulse", default=None): vol.Any(None, cv.boolean),
    vol.Optional("retrigger", default=None): vol.Any(None, _ENUM["retrigger"]),
    vol.Optional("unavailable", default=None): vol.Any(None, _ENUM["unavailable"]),
    vol.Optional("debounce", default=None): vol.Any(None, parse_duration),
}

STIMULUS_SCHEMA = vol.Schema(
    {
        vol.Required("entity"): cv.entity_id,
        vol.Optional("to", default=["on"]): _to_states,
        vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
        vol.Optional("key", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
        vol.Optional("envelope", default=None): vol.Any(None, _group_id),
        **_ENVELOPE_OVERRIDES,
    }
)

ADJACENT_SCHEMA = vol.Schema(
    {
        vol.Required("id"): _group_id,
        vol.Optional("connection", default=DEFAULT_CONNECTION): vol.In(CONNECTIONS),
        vol.Optional("one_way", default=False): cv.boolean,
    }
)


def _adjacent(value: Any) -> dict[str, Any]:
    """`kitchen` and `{id: kitchen, connection: stairs, one_way: true}` both name one edge.

    The short form is what a door is: symmetric, and a door. The long form says otherwise --
    an opening with no door in it, a staircase, a way outside, or the rare connection that
    only goes one way. `connection` is carried for the UI and for a later release that may
    weight transitions by it; nothing reads it today.
    """
    if isinstance(value, str):
        value = {"id": value}
    if not isinstance(value, dict):
        raise vol.Invalid("must be a group id or {id, connection, one_way}")
    result: dict[str, Any] = ADJACENT_SCHEMA(value)
    return result


GROUP_PRESENCE_SCHEMA = vol.Schema(
    {
        vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
        vol.Optional("envelope", default=None): vol.Any(None, _group_id),
        **_ENVELOPE_OVERRIDES,
    }
)

PRESENCE_DEVICE_SCHEMA = vol.Schema(
    {
        vol.Required("device"): _device_tracker,
        vol.Optional("name", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
    }
)

PRESENCE_SCHEMA = vol.Schema(
    {
        vol.Optional("enabled", default=False): cv.boolean,
        vol.Optional("devices", default=list): [PRESENCE_DEVICE_SCHEMA],
        vol.Optional("envelope", default=None): vol.Any(None, _group_id),
        vol.Optional("threshold", default=0.6): _finite(0.0, lo_exclusive=True, hi=1.0),
        vol.Optional("stay", default=0.9): _finite(
            0.0, lo_exclusive=True, hi=1.0, hi_exclusive=True
        ),
        vol.Optional("escape", default=0.001): _finite(0.0, hi=0.1),
        vol.Optional("scale", default=3.0): _finite(0.0, lo_exclusive=True),
        vol.Optional("floor", default=0.05): _finite(0.0, lo_exclusive=True, hi=1.0),
        vol.Optional("stuck_after", default=60.0): vol.All(parse_duration, vol.Range(min=1.0)),
        # keyed by the scanner's device-registry id (or its Bermuda address); the value
        # is the room it is in, overriding whatever its area says
        vol.Optional("scanner_areas", default=dict): {cv.string: _group_id},
    }
)

CALENDAR_SCHEMA = vol.Schema(
    {
        vol.Required("id"): _group_id,
        vol.Required("entity"): _calendar_entity,
    }
)

PATTERNS_SCHEMA = vol.Schema(
    {
        vol.Optional("rebuild_time", default="03:00"): _hhmm,
        vol.Optional("history_days", default=180): vol.All(int, vol.Range(min=30, max=730)),
        vol.Optional("min_days", default=14): vol.All(int, vol.Range(min=3, max=90)),
        vol.Optional("calendars", default=list): [CALENDAR_SCHEMA],
        # None means "derive it from the calendars"; an empty list is a config that
        # can never label a day, which is a mistake rather than a default
        vol.Optional("day_type_precedence", default=None): vol.Any(
            None, vol.All([str], vol.Length(min=1))
        ),
        vol.Optional("workday_entity", default=None): vol.Any(None, cv.entity_id),
    }
)

SIMULATION_DEFAULTS_SCHEMA = vol.Schema(
    {
        vol.Optional("away_entity", default=None): vol.Any(None, cv.entity_id),
        vol.Optional("quiet_hours", default=["01:00", "05:30"]): _quiet_hours,
    }
)

GROUP_SIMULATION_SCHEMA = vol.Schema(
    {
        vol.Optional("enabled", default=True): cv.boolean,
        vol.Optional("lights", default=dict): vol.Schema(
            {
                vol.Optional("include", default=list): [cv.entity_id],
                vol.Optional("exclude", default=list): [cv.entity_id],
            }
        ),
    }
)

DEFAULTS_SCHEMA = vol.Schema(
    {
        vol.Optional("envelope", default=DEFAULT_ENVELOPE_ID): _group_id,
        vol.Optional("max_value", default=DEFAULT_MAX_VALUE): _finite(0.0, lo_exclusive=True),
        vol.Optional("precision", default=DEFAULT_PRECISION): vol.All(int, vol.Range(min=0, max=3)),
        vol.Optional("unavailable", default=Unavailable.HOLD): _ENUM["unavailable"],
        vol.Optional("retrigger", default=Retrigger.STACK): _ENUM["retrigger"],
        vol.Optional("debounce", default=0.0): parse_duration,
        vol.Optional("safety_refresh", default=DEFAULT_SAFETY_REFRESH): vol.All(
            parse_duration, vol.Range(min=5.0, max=3600.0)
        ),
        vol.Optional("min_wake_interval", default=DEFAULT_MIN_WAKE_INTERVAL): vol.All(
            parse_duration, vol.Range(min=0.1, max=60.0)
        ),
        vol.Optional(CONF_PATTERNS, default=dict): PATTERNS_SCHEMA,
        vol.Optional(CONF_SIMULATION, default=dict): SIMULATION_DEFAULTS_SCHEMA,
    }
)


def _group_schema(value: Any) -> dict[str, Any]:
    """Recursive group schema (voluptuous cannot reference itself directly)."""
    schema = vol.Schema(
        {
            vol.Required("id"): _group_id,
            vol.Optional("name", default=None): vol.Any(None, str),
            vol.Optional(CONF_KIND, default=None): vol.Any(None, vol.In(KINDS)),
            vol.Optional("area", default=None): vol.Any(None, str),
            vol.Optional(CONF_AREA_ID, default=None): vol.Any(None, str),
            vol.Optional(CONF_FLOOR_ID, default=None): vol.Any(None, str),
            vol.Optional("mix", default=Mix.SUM): _ENUM["mix"],
            vol.Optional("null_handling", default=NullHandling.ZERO): _ENUM["null_handling"],
            vol.Optional("max_value", default=None): vol.Any(None, _finite(0.0, lo_exclusive=True)),
            vol.Optional("precision", default=None): vol.Any(
                None, vol.All(int, vol.Range(min=0, max=3))
            ),
            vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
            vol.Optional("stimuli", default=list): [STIMULUS_SCHEMA],
            vol.Optional("children", default=list): [_group_schema],
            vol.Optional(CONF_SIMULATION, default=dict): GROUP_SIMULATION_SCHEMA,
            vol.Optional("adjacent", default=list): [_adjacent],
            vol.Optional("exit", default=False): cv.boolean,
            vol.Optional(CONF_PRESENCE, default=dict): GROUP_PRESENCE_SCHEMA,
        }
    )
    result: dict[str, Any] = schema(value)
    # `area` was the old spelling. Both are accepted so a half-edited file loads, and the
    # normalized document only ever carries `area_id` -- the panel and the device registry
    # then have one field to read, and a round trip cannot resurrect the old one.
    if result["area"] is not None:
        if result[CONF_AREA_ID] is not None and result[CONF_AREA_ID] != result["area"]:
            raise vol.Invalid("area and area_id name different areas; keep area_id", path=["area"])
        result[CONF_AREA_ID] = result["area"]
    del result["area"]
    return result


CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_VERSION): vol.All(int, vol.In([1])),
        vol.Optional(CONF_DEFAULTS, default=dict): DEFAULTS_SCHEMA,
        vol.Optional(CONF_ENVELOPES, default=list): [ENVELOPE_SCHEMA],
        vol.Optional(CONF_GROUPS, default=list): [_group_schema],
        vol.Optional(CONF_PRESENCE, default=dict): PRESENCE_SCHEMA,
    }
)


def default_options() -> dict[str, Any]:
    return {
        CONF_VERSION: 1,
        CONF_DEFAULTS: {},
        CONF_ENVELOPES: [{"id": DEFAULT_ENVELOPE_ID}],
        CONF_GROUPS: [],
        CONF_PRESENCE: {},
    }


def _path(parts: list[Any]) -> str:
    return "/".join(str(p) for p in parts)


def _stringify_enums(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: _stringify_enums(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_stringify_enums(v) for v in obj]
    if isinstance(obj, Mix | NullHandling | Retrigger | Unavailable):
        return obj.value
    return obj


def _apply_pattern_defaults(cfg: dict[str, Any]) -> None:
    """Fill in derived defaults that depend on other already-validated fields."""
    patterns = cfg[CONF_DEFAULTS][CONF_PATTERNS]
    if patterns["day_type_precedence"] is None:
        calendar_ids = [cal["id"] for cal in patterns["calendars"]]
        patterns["day_type_precedence"] = [*calendar_ids, "holiday", "weekend", "weekday"]


def _wanted_kinds(node: Mapping[str, Any], parent_kind: str | None) -> tuple[str, ...]:
    """The kinds this group looks like, best first.

    Evidence beats position. A group bound to a Home Assistant area is a room; one bound to
    a floor is a floor; one that declares a doorway or a way off the property is somewhere a
    person walks through, which is an area indoors and an outside area beside the house.
    Only when the document says none of that does the layering decide, which is what turns a
    bare `property > house > downstairs > kitchen` into exactly those four kinds.
    """
    if parent_kind is None:
        return (KIND_PROPERTY,)
    wants: list[str] = []
    if node.get(CONF_AREA_ID) is not None:
        wants.append(KIND_AREA)
    if node.get(CONF_FLOOR_ID) is not None:
        wants.append(KIND_FLOOR)
    if node.get("adjacent") or node.get("exit"):
        wants += [KIND_AREA, KIND_OUTSIDE]
    wants.append(DEFAULT_CHILD_KIND[parent_kind])
    return tuple(dict.fromkeys(wants))  # first occurrence wins, order kept


def infer_kinds(config: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Resolve every `kind: null` in a validated document, in place.

    Returns the document and the paths of the groups whose kind was guessed -- the panel
    shows those as "inferred kinds -- check and save", and the cross-checks give them an
    amnesty from the rules that only make sense once somebody has confirmed the kind.

    A group whose evidence leaves no kind its parent may contain is left null; the
    cross-checks turn that into a pathed error, because there is nothing honest to write.
    """
    inferred: list[str] = []

    def walk(node: dict[str, Any], parent_kind: str | None, path: list[Any]) -> None:
        kind = node.get(CONF_KIND)
        if kind is None:
            allowed = ALLOWED_CHILDREN.get(parent_kind, frozenset())
            kind = next((k for k in _wanted_kinds(node, parent_kind) if k in allowed), None)
            node[CONF_KIND] = kind
            if kind is not None:
                inferred.append(_path(path))
        for i, child in enumerate(node["children"]):
            walk(child, kind, [*path, "children", i])

    for i, group in enumerate(config[CONF_GROUPS]):
        walk(group, None, [CONF_GROUPS, i])
    return config, inferred


def _cross_checks(cfg: dict[str, Any], inferred: frozenset[str]) -> list[dict[str, str]]:
    errors: list[dict[str, str]] = []
    envelope_ids: set[str] = set()
    for i, env in enumerate(cfg[CONF_ENVELOPES]):
        if env["id"] in envelope_ids:
            errors.append(
                {"path": _path([CONF_ENVELOPES, i, "id"]), "message": "duplicate envelope id"}
            )
        envelope_ids.add(env["id"])
    if cfg[CONF_DEFAULTS]["envelope"] not in envelope_ids:
        errors.append({"path": _path([CONF_DEFAULTS, "envelope"]), "message": "unknown envelope"})

    patterns = cfg[CONF_DEFAULTS][CONF_PATTERNS]
    calendar_ids: set[str] = set()
    for i, cal in enumerate(patterns["calendars"]):
        if cal["id"] in calendar_ids:
            errors.append(
                {
                    "path": _path([CONF_DEFAULTS, CONF_PATTERNS, "calendars", i, "id"]),
                    "message": "duplicate calendar id",
                }
            )
        calendar_ids.add(cal["id"])
    valid_day_types = set(BUILTIN_DAY_TYPES) | calendar_ids
    if any(dt not in valid_day_types for dt in patterns["day_type_precedence"]):
        errors.append(
            {
                "path": _path([CONF_DEFAULTS, CONF_PATTERNS, "day_type_precedence"]),
                "message": "must be built-in day types or configured calendar ids",
            }
        )

    seen_groups: set[str] = set()
    walked: list[tuple[list[Any], dict[str, Any]]] = []

    def _any_outside(nodes: list[dict[str, Any]]) -> bool:
        return any(n[CONF_KIND] == KIND_OUTSIDE or _any_outside(n["children"]) for n in nodes)

    has_outside = _any_outside(cfg[CONF_GROUPS])

    def walk(group: dict[str, Any], path: list[Any], parent_kind: str | None) -> None:
        if group["id"] in seen_groups:
            errors.append({"path": _path([*path, "id"]), "message": "duplicate group id"})
        seen_groups.add(group["id"])
        walked.append((list(path), group))
        kind = group[CONF_KIND]
        allowed = ALLOWED_CHILDREN.get(parent_kind, frozenset())
        if kind is None:
            errors.append(
                {
                    "path": _path([*path, CONF_KIND]),
                    "message": (
                        "could not work out what this group is; set its kind "
                        f"({', '.join(sorted(allowed))})"
                    ),
                }
            )
        elif kind not in allowed:
            errors.append(
                {
                    "path": _path([*path, CONF_KIND]),
                    "message": (
                        f"a {parent_kind} cannot contain a {kind}"
                        if parent_kind is not None
                        else "every root group is a property"
                    ),
                }
            )
        if _path(path) not in inferred and kind is not None:
            if group["adjacent"] and kind not in NODE_KINDS:
                errors.append(
                    {
                        "path": _path([*path, "adjacent"]),
                        "message": f"a {kind} is not somewhere you can walk between; "
                        "only areas and outside areas have adjacent groups",
                    }
                )
            if group["exit"]:
                if kind not in NODE_KINDS:
                    errors.append(
                        {
                            "path": _path([*path, "exit"]),
                            "message": f"a {kind} cannot lead off the property; "
                            "only areas and outside areas can",
                        }
                    )
                elif kind == KIND_AREA and has_outside:
                    errors.append(
                        {
                            "path": _path([*path, "exit"]),
                            "message": "this property has outside areas, so leaving it "
                            "happens from one of those, not from a room",
                        }
                    )
        if not group["stimuli"] and not group["children"]:
            errors.append(
                {"path": _path(path), "message": "group needs at least one stimulus or child"}
            )
        labels: set[str] = {TRIGGER_KEY, PRESENCE_KEY}  # both synthetic channels
        for i, stim in enumerate(group["stimuli"]):
            spath = [*path, "stimuli", i]
            if stim["envelope"] is not None and stim["envelope"] not in envelope_ids:
                errors.append({"path": _path([*spath, "envelope"]), "message": "unknown envelope"})
            label = stim["key"] or stim["entity"]
            if label in labels:
                errors.append(
                    {
                        "path": _path(spath),
                        "message": f"duplicate stimulus '{label}'; set a unique key",
                    }
                )
            labels.add(label)
        for i, child in enumerate(group["children"]):
            if child["id"] in labels:
                errors.append(
                    {
                        "path": _path([*path, "children", i, "id"]),
                        "message": "clashes with a stimulus key",
                    }
                )
            labels.add(child["id"])
            walk(child, [*path, "children", i], kind)
        lights = group[CONF_SIMULATION]["lights"]
        for key in ("include", "exclude"):
            for i, entity in enumerate(lights[key]):
                if not entity.startswith("light."):
                    errors.append(
                        {
                            "path": _path([*path, CONF_SIMULATION, "lights", key, i]),
                            "message": "must be a light entity",
                        }
                    )
        presence = group[CONF_PRESENCE]
        if presence["envelope"] is not None and presence["envelope"] not in envelope_ids:
            errors.append(
                {
                    "path": _path([*path, CONF_PRESENCE, "envelope"]),
                    "message": "unknown envelope",
                }
            )

    for i, group in enumerate(cfg[CONF_GROUPS]):
        walk(group, [CONF_GROUPS, i], None)

    # Adjacency can only be checked once every id is known: an edge is allowed to point
    # forwards, at a room the walk has not reached yet.
    kind_of = {group["id"]: group[CONF_KIND] for _, group in walked}
    for path, group in walked:
        seen_edges: set[str] = set()
        for j, edge in enumerate(group["adjacent"]):
            epath = _path([*path, "adjacent", j])
            if edge["id"] == group["id"]:
                errors.append({"path": epath, "message": "a group cannot be adjacent to itself"})
            elif edge["id"] not in seen_groups:
                errors.append({"path": epath, "message": f"unknown group '{edge['id']}'"})
            elif kind_of.get(edge["id"]) not in NODE_KINDS and _path(path) not in inferred:
                errors.append(
                    {
                        "path": epath,
                        "message": f"'{edge['id']}' is a {kind_of[edge['id']]}, "
                        "and only areas and outside areas can be adjacent to anything",
                    }
                )
            if edge["id"] in seen_edges:
                errors.append({"path": epath, "message": "duplicate adjacent group"})
            seen_edges.add(edge["id"])

    presence = cfg[CONF_PRESENCE]
    if presence["envelope"] is not None and presence["envelope"] not in envelope_ids:
        errors.append({"path": _path([CONF_PRESENCE, "envelope"]), "message": "unknown envelope"})
    seen_devices: set[str] = set()
    seen_names: set[str] = set()
    for i, device in enumerate(presence["devices"]):
        dpath = [CONF_PRESENCE, "devices", i]
        if device["device"] in seen_devices:
            errors.append({"path": _path([*dpath, "device"]), "message": "duplicate device"})
        seen_devices.add(device["device"])
        if device["name"] is not None:
            if device["name"] in seen_names:
                errors.append({"path": _path([*dpath, "name"]), "message": "duplicate name"})
            seen_names.add(device["name"])
    for scanner, gid in presence["scanner_areas"].items():
        if gid not in seen_groups:
            errors.append(
                {
                    "path": _path([CONF_PRESENCE, "scanner_areas", scanner]),
                    "message": f"unknown group '{gid}'",
                }
            )
    return errors


@dataclass(frozen=True)
class Validated:
    """A validated document, and what had to be guessed to get there."""

    config: dict[str, Any]
    inferred: tuple[str, ...]

    @property
    def migrated(self) -> bool:
        """Whether this document arrived without kinds and had them filled in.

        The panel shows a banner while this is true and the next save writes the kinds out,
        which is the whole migration: one pass, visible, and confirmed by a human.
        """
        return bool(self.inferred)


def validate(config: Mapping[str, Any]) -> Validated:
    """Validate and normalize; raise ConfigError with every error found."""
    try:
        cfg: dict[str, Any] = CONFIG_SCHEMA(dict(config))
    except vol.MultipleInvalid as exc:
        raise ConfigError([{"path": _path(e.path), "message": e.msg} for e in exc.errors]) from exc
    except vol.Invalid as exc:
        raise ConfigError([{"path": _path(exc.path), "message": exc.msg}]) from exc
    _apply_pattern_defaults(cfg)
    cfg, inferred = infer_kinds(cfg)
    errors = _cross_checks(cfg, frozenset(inferred))
    if errors:
        raise ConfigError(errors)
    return Validated(config=_stringify_enums(cfg), inferred=tuple(inferred))


def validate_config(config: Mapping[str, Any]) -> dict[str, Any]:
    """The document alone. Every caller that does not care how it got there uses this."""
    return validate(config).config
