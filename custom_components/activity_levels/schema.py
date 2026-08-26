"""Configuration schema: validation and normalization of the options dict."""

from __future__ import annotations

import math
import re
from collections.abc import Mapping
from typing import Any

import voluptuous as vol
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_DEFAULTS,
    CONF_ENVELOPES,
    CONF_GROUPS,
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
        }
    )
    try:
        result: dict[str, Any] = schema(value)
    except vol.MultipleInvalid as exc:
        raise vol.MultipleInvalid(exc.errors) from exc
    except vol.Invalid as exc:
        raise vol.Invalid(exc.msg, exc.path, exc.error_message, exc.error_type) from exc
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
    errors = _cross_checks(cfg)
    if errors:
        raise ConfigError(errors)
    return _stringify_enums(cfg)  # type: ignore[no-any-return]
