"""Configuration schema: validation and normalization of the options dict."""

from __future__ import annotations

import math
import re
from collections.abc import Mapping
from typing import Any

import voluptuous as vol
from homeassistant.helpers import config_validation as cv

from .const import (
    BUILTIN_DAY_TYPES,
    CONF_DEFAULTS,
    CONF_ENVELOPES,
    CONF_GROUPS,
    CONF_PATTERNS,
    CONF_SIMULATION,
    CONF_VERSION,
    DEFAULT_ENVELOPE_ID,
    DEFAULT_MAX_VALUE,
    DEFAULT_MIN_WAKE_INTERVAL,
    DEFAULT_PRECISION,
    DEFAULT_SAFETY_REFRESH,
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


def _finite(lo: float | None = None, lo_exclusive: bool = False, hi: float | None = None) -> Any:
    def check(value: Any) -> float:
        if isinstance(value, bool) or not isinstance(value, int | float):
            raise vol.Invalid("must be a number")
        f = float(value)
        if not math.isfinite(f):
            raise vol.Invalid("must be finite")
        if lo is not None and (f <= lo if lo_exclusive else f < lo):
            raise vol.Invalid(f"must be {'>' if lo_exclusive else '>='} {lo}")
        if hi is not None and f > hi:
            raise vol.Invalid(f"must be <= {hi}")
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

STIMULUS_SCHEMA = vol.Schema(
    {
        vol.Required("entity"): cv.entity_id,
        vol.Optional("to", default=["on"]): _to_states,
        vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
        vol.Optional("key", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
        vol.Optional("envelope", default=None): vol.Any(None, _group_id),
        vol.Optional("attack", default=None): vol.Any(None, parse_duration),
        vol.Optional("decay", default=None): vol.Any(None, parse_duration),
        vol.Optional("sustain", default=None): vol.Any(None, _finite(0.0, hi=1.0)),
        vol.Optional("release", default=None): vol.Any(None, parse_duration),
        vol.Optional("impulse", default=None): vol.Any(None, cv.boolean),
        vol.Optional("retrigger", default=None): vol.Any(None, _ENUM["retrigger"]),
        vol.Optional("unavailable", default=None): vol.Any(None, _ENUM["unavailable"]),
        vol.Optional("debounce", default=None): vol.Any(None, parse_duration),
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
        vol.Optional("retrigger", default=Retrigger.ONLY_IN_RELEASE): _ENUM["retrigger"],
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
            vol.Optional("area", default=None): vol.Any(None, str),
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
        }
    )
    result: dict[str, Any] = schema(value)
    if result["name"] is None:
        result["name"] = result["id"].replace("_", " ").title()
    return result


CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_VERSION): vol.All(int, vol.In([1])),
        vol.Optional(CONF_DEFAULTS, default=dict): DEFAULTS_SCHEMA,
        vol.Optional(CONF_ENVELOPES, default=list): [ENVELOPE_SCHEMA],
        vol.Optional(CONF_GROUPS, default=list): [_group_schema],
    }
)


def default_options() -> dict[str, Any]:
    return {
        CONF_VERSION: 1,
        CONF_DEFAULTS: {},
        CONF_ENVELOPES: [{"id": DEFAULT_ENVELOPE_ID}],
        CONF_GROUPS: [],
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


def _cross_checks(cfg: dict[str, Any]) -> list[dict[str, str]]:
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

    def walk(group: dict[str, Any], path: list[Any]) -> None:
        if group["id"] in seen_groups:
            errors.append({"path": _path([*path, "id"]), "message": "duplicate group id"})
        seen_groups.add(group["id"])
        if not group["stimuli"] and not group["children"]:
            errors.append(
                {"path": _path(path), "message": "group needs at least one stimulus or child"}
            )
        labels: set[str] = {TRIGGER_KEY}
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
            walk(child, [*path, "children", i])
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

    for i, group in enumerate(cfg[CONF_GROUPS]):
        walk(group, [CONF_GROUPS, i])
    return errors


def validate_config(config: Mapping[str, Any]) -> dict[str, Any]:
    """Validate and normalize; raise ConfigError with every error found."""
    try:
        cfg: dict[str, Any] = CONFIG_SCHEMA(dict(config))
    except vol.MultipleInvalid as exc:
        raise ConfigError([{"path": _path(e.path), "message": e.msg} for e in exc.errors]) from exc
    except vol.Invalid as exc:
        raise ConfigError([{"path": _path(exc.path), "message": exc.msg}]) from exc
    _apply_pattern_defaults(cfg)
    errors = _cross_checks(cfg)
    if errors:
        raise ConfigError(errors)
    return _stringify_enums(cfg)  # type: ignore[no-any-return]
