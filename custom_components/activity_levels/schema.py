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
    EDGE_ENTER,
    EDGE_LEAVE,
    EDGES,
    KIND_AREA,
    KIND_FLOOR,
    KIND_OUTSIDE,
    KIND_PROPERTY,
    KINDS,
    MODE_SUSTAINED,
    MODES,
    NODE_KINDS,
    PRESENCE_KEY,
    TRIGGER_KEY,
)
from .duration import parse_duration
from .engine import Mix, NullHandling, RetriggerWhen, Unavailable

GROUP_ID_RE = re.compile(r"^[a-z][a-z0-9_]*$")
HHMM_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


class ConfigError(Exception):
    """Validation failure with path-addressed errors."""

    def __init__(self, errors: list[dict[str, str]]) -> None:
        super().__init__("; ".join(f"{e['path']}: {e['message']}" for e in errors))
        self.errors = errors


@dataclass(frozen=True)
class _Finite:
    """A finite number in an optionally half-open range -- and a record of that range.

    It was a closure until `schema_json` needed the bounds back. A closure keeps them
    where nothing but the check itself can read them, so the exported JSON Schema had
    to either repeat every limit by hand or publish none of them. Holding them as
    fields costs nothing at validation time and makes the schema walk exact.
    """

    lo: float | None = None
    lo_exclusive: bool = False
    hi: float | None = None
    hi_exclusive: bool = False

    def __call__(self, value: Any) -> float:
        if isinstance(value, bool) or not isinstance(value, int | float):
            raise vol.Invalid("must be a number")
        f = float(value)
        if not math.isfinite(f):
            raise vol.Invalid("must be finite")
        if self.lo is not None and (f <= self.lo if self.lo_exclusive else f < self.lo):
            raise vol.Invalid(f"must be {'>' if self.lo_exclusive else '>='} {self.lo}")
        if self.hi is not None and (f >= self.hi if self.hi_exclusive else f > self.hi):
            raise vol.Invalid(f"must be {'<' if self.hi_exclusive else '<='} {self.hi}")
        return f


def _finite(
    lo: float | None = None,
    lo_exclusive: bool = False,
    hi: float | None = None,
    hi_exclusive: bool = False,
) -> _Finite:
    return _Finite(lo, lo_exclusive, hi, hi_exclusive)


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
    "retrigger": vol.Coerce(RetriggerWhen),
    "unavailable": vol.Coerce(Unavailable),
}

#: What each retired ``retrigger`` spelling means once the setting is split in two.
#: The old value said two things at once -- when a trigger counts, and what an
#: honoured one does -- so a document written before the split is rewritten on load.
_LEGACY_RETRIGGER: dict[str, tuple[str, bool]] = {
    "only_in_release": (RetriggerWhen.RELEASE.value, False),
    "always": (RetriggerWhen.ALWAYS.value, False),
    "stack": (RetriggerWhen.ALWAYS.value, True),
}


def _split_retrigger(value: Any) -> Any:
    """Rewrite a legacy ``retrigger`` into the ``retrigger``/``stack`` pair.

    ``always`` is the one spelling that survived the split with a different meaning:
    on its own it was the non-stacking "restart even a held note", and it is now just
    the *when*. An explicit ``stack`` beside it is what tells the two apart -- the key
    did not exist before the split, so a document that carries it is already written
    in the new shape and is passed through untouched. That also makes the rewrite
    idempotent, which is what a normalized document being fed back in depends on.
    """
    if not isinstance(value, dict):
        return value
    raw = value.get("retrigger")
    if not isinstance(raw, str) or raw not in _LEGACY_RETRIGGER or value.get("stack") is not None:
        return value
    when, stack = _LEGACY_RETRIGGER[raw]
    return {**value, "retrigger": when, "stack": stack}


ENVELOPE_SCHEMA = vol.All(
    _split_retrigger,
    vol.Schema(
        {
            vol.Required("id"): _group_id,
            vol.Optional("label", default=None): vol.Any(None, str),
            vol.Optional("attack", default=0.0): parse_duration,
            vol.Optional("decay", default=0.0): parse_duration,
            vol.Optional("sustain", default=1.0): _finite(0.0),
            vol.Optional("release", default=1800.0): parse_duration,
            vol.Optional("impulse", default=False): cv.boolean,
            vol.Optional("retrigger", default=None): vol.Any(None, _ENUM["retrigger"]),
            vol.Optional("stack", default=None): vol.Any(None, cv.boolean),
            vol.Optional("unavailable", default=None): vol.Any(None, _ENUM["unavailable"]),
            vol.Optional("debounce", default=None): vol.Any(None, parse_duration),
        }
    ),
)

# Every field a stimulus may override on its preset. Named once, because a group's
# presence voice takes exactly the same set.
_ENVELOPE_OVERRIDES: dict[Any, Any] = {
    vol.Optional("attack", default=None): vol.Any(None, parse_duration),
    vol.Optional("decay", default=None): vol.Any(None, parse_duration),
    vol.Optional("sustain", default=None): vol.Any(None, _finite(0.0)),
    vol.Optional("release", default=None): vol.Any(None, parse_duration),
    vol.Optional("impulse", default=None): vol.Any(None, cv.boolean),
    vol.Optional("retrigger", default=None): vol.Any(None, _ENUM["retrigger"]),
    vol.Optional("stack", default=None): vol.Any(None, cv.boolean),
    vol.Optional("unavailable", default=None): vol.Any(None, _ENUM["unavailable"]),
    vol.Optional("debounce", default=None): vol.Any(None, parse_duration),
}

STIMULUS_SCHEMA = vol.All(
    _split_retrigger,
    vol.Schema(
        {
            vol.Required("entity"): cv.entity_id,
            vol.Optional("to", default=["on"]): _to_states,
            vol.Optional("mode", default=MODE_SUSTAINED): vol.In(MODES),
            # A callable default, because voluptuous hands every stimulus the *same*
            # default object: a shared mutable list is a bug waiting for the first caller
            # that sorts or appends in place.
            vol.Optional("edges", default=lambda: [EDGE_ENTER, EDGE_LEAVE]): vol.All(
                [vol.In(EDGES)], vol.Length(min=1)
            ),
            vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
            vol.Optional("key", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
            vol.Optional("envelope", default=None): vol.Any(None, _group_id),
            **_ENVELOPE_OVERRIDES,
        }
    ),
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


GROUP_PRESENCE_SCHEMA = vol.All(
    _split_retrigger,
    vol.Schema(
        {
            vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
            vol.Optional("envelope", default=None): vol.Any(None, _group_id),
            # this room's own `presence.activity.floor`: 1.0 exempts a room people sleep
            # in, where a level of 0.0 says nothing about whether somebody is there
            vol.Optional("activity_floor", default=None): vol.Any(
                None, _finite(0.0, lo_exclusive=True, hi=1.0)
            ),
            **_ENVELOPE_OVERRIDES,
        }
    ),
)

PRESENCE_DEVICE_SCHEMA = vol.Schema(
    {
        vol.Required("device"): _device_tracker,
        vol.Optional("name", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
    }
)
"""The list presence shipped with: one Bermuda tracker per person. Kept so an existing
document loads; `_apply_presence_defaults` folds it into `people`."""

DEVICE_KINDS = ("phone", "watch", "tag", "laptop", "other")
SIGNAL_KEYS = ("activity", "steps", "battery_state")
"""The companion-app sensors a device's carried estimate reads, by their role."""

_person_entity = vol.All(cv.entity_id, cv.entity_domain("person"))
_sensor_entity = vol.All(cv.entity_id, cv.entity_domain("sensor"))

PERSON_DEVICE_SCHEMA = vol.Schema(
    {
        vol.Required("tracker"): _device_tracker,
        vol.Optional("name", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
        vol.Optional("kind", default="other"): vol.In(DEVICE_KINDS),
        # the mobile_app device_tracker of the same physical device, which is where the
        # companion sensors hang; None for a device with no companion app (a watch, a tag)
        vol.Optional("companion", default=None): vol.Any(None, _device_tracker),
        vol.Optional("signals", default=dict): vol.Schema(
            {vol.Optional(key, default=None): vol.Any(None, _sensor_entity) for key in SIGNAL_KEYS}
        ),
    }
)

PERSON_SCHEMA = vol.Schema(
    {
        # None is named at discovery, after the first device's registry entry -- Bermuda
        # calls every tracker "Bermuda Tracker", so only the device knows whose it is
        vol.Optional("name", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
        # seeds `devices` from the person entity's trackers at discovery time
        vol.Optional("person", default=None): vol.Any(None, _person_entity),
        vol.Optional("devices", default=list): [PERSON_DEVICE_SCHEMA],
    }
)

CARRIED_WEIGHT_DEFAULTS = {
    "charging": -3.0,
    "moving": 2.0,
    "still_room_empty": -2.0,
    "jitter": 1.0,
}
"""Log-odds each carried signal adds when it is true. Charging says the phone is on a
nightstand; walking says it is in a pocket; a still device in a room reading 0.0 is not
on anybody; distances that wander are being carried around."""

CARRIED_SCHEMA = vol.Schema(
    {
        vol.Optional("prior", default=0.7): _finite(
            0.0, lo_exclusive=True, hi=1.0, hi_exclusive=True
        ),
        vol.Optional("flip", default=300.0): vol.All(parse_duration, vol.Range(min=1.0)),
        vol.Optional("recent", default=120.0): vol.All(parse_duration, vol.Range(min=1.0)),
        # P(a parked device is in the same room as its person): a phone on the kitchen
        # counter still says something about the kitchen
        vol.Optional("nearby", default=0.3): _finite(
            0.0, lo_exclusive=True, hi=1.0, hi_exclusive=True
        ),
        vol.Optional("weights", default=dict): vol.Schema(
            {
                vol.Optional(key, default=weight): _finite(-10.0, hi=10.0)
                for key, weight in CARRIED_WEIGHT_DEFAULTS.items()
            }
        ),
    }
)

PRESENCE_ACTIVITY_SCHEMA = vol.Schema(
    {
        # the likelihood of a room whose evidence level is 0.0: the same footing as a
        # room with no scanner, and never a reward for a busy one
        vol.Optional("floor", default=0.05): _finite(0.0, lo_exclusive=True, hi=1.0),
    }
)

PRESENCE_SCHEMA = vol.Schema(
    {
        vol.Optional("enabled", default=False): cv.boolean,
        vol.Optional("devices", default=list): [PRESENCE_DEVICE_SCHEMA],
        vol.Optional("people", default=list): [PERSON_SCHEMA],
        vol.Optional("envelope", default=None): vol.Any(None, _group_id),
        vol.Optional("threshold", default=0.6): _finite(0.0, lo_exclusive=True, hi=1.0),
        vol.Optional("stay", default=0.9): _finite(
            0.0, lo_exclusive=True, hi=1.0, hi_exclusive=True
        ),
        vol.Optional("escape", default=0.001): _finite(0.0, hi=0.1),
        vol.Optional("scale", default=3.0): _finite(0.0, lo_exclusive=True),
        vol.Optional("floor", default=0.05): _finite(0.0, lo_exclusive=True, hi=1.0),
        vol.Optional("stuck_after", default=60.0): vol.All(parse_duration, vol.Range(min=1.0)),
        vol.Optional("activity", default=dict): PRESENCE_ACTIVITY_SCHEMA,
        vol.Optional("carried", default=dict): CARRIED_SCHEMA,
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

DEFAULTS_SCHEMA = vol.All(
    _split_retrigger,
    vol.Schema(
        {
            vol.Optional("envelope", default=DEFAULT_ENVELOPE_ID): _group_id,
            vol.Optional("max_value", default=DEFAULT_MAX_VALUE): _finite(0.0, lo_exclusive=True),
            vol.Optional("precision", default=DEFAULT_PRECISION): vol.All(
                int, vol.Range(min=0, max=3)
            ),
            vol.Optional("unavailable", default=Unavailable.HOLD): _ENUM["unavailable"],
            vol.Optional("retrigger", default=RetriggerWhen.ALWAYS): _ENUM["retrigger"],
            vol.Optional("stack", default=True): cv.boolean,
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
    ),
)


def _group_schema(value: Any) -> dict[str, Any]:
    """Recursive group schema (voluptuous cannot reference itself directly).

    The keys live in `GROUP_SCHEMA` below rather than in here, because this function is
    the only thing `groups` and `children` can name and so it is also the only handle
    anything walking the schema -- `schema_json` -- would otherwise have on a group. It
    is defined after this one so that `children` can name this function; Python looks the
    name up when the group is validated, by which time both exist.
    """
    result: dict[str, Any] = GROUP_SCHEMA(value)
    # `area` was the old spelling. Both are accepted so a half-edited file loads, and the
    # normalized document only ever carries `area_id` -- the panel and the device registry
    # then have one field to read, and a round trip cannot resurrect the old one.
    if result["area"] is not None:
        if result[CONF_AREA_ID] is not None and result[CONF_AREA_ID] != result["area"]:
            raise vol.Invalid("area and area_id name different areas; keep area_id", path=["area"])
        result[CONF_AREA_ID] = result["area"]
    del result["area"]
    return result


GROUP_SCHEMA = vol.Schema(
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


def _an(kind: str) -> str:
    """`a floor`, `an area`. The kinds are a closed set, so the vowel test cannot be wrong."""
    return f"{'an' if kind[0] in 'aeiou' else 'a'} {kind}"


def _stringify_enums(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: _stringify_enums(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_stringify_enums(v) for v in obj]
    if isinstance(obj, Mix | NullHandling | RetriggerWhen | Unavailable):
        return obj.value
    return obj


def _apply_pattern_defaults(cfg: dict[str, Any]) -> None:
    """Fill in derived defaults that depend on other already-validated fields."""
    patterns = cfg[CONF_DEFAULTS][CONF_PATTERNS]
    if patterns["day_type_precedence"] is None:
        calendar_ids = [cal["id"] for cal in patterns["calendars"]]
        patterns["day_type_precedence"] = [*calendar_ids, "holiday", "weekend", "weekday"]


def _apply_presence_defaults(cfg: dict[str, Any]) -> None:
    """Fold the legacy ``presence.devices`` list into ``presence.people``.

    Presence shipped with one Bermuda tracker per person and nothing else to say about
    them. A person now owns several devices, so each legacy entry becomes a one-device
    person -- unless some person already lists that tracker, in which case the newer
    entry is the one that carries the detail and the old one is dropped. The list is
    emptied afterwards so the normalised document has one spelling, which is what the
    panel writes back and what makes a second validation the identity.
    """
    presence = cfg[CONF_PRESENCE]
    listed = {device["tracker"] for person in presence["people"] for device in person["devices"]}
    for legacy in presence["devices"]:
        if legacy["device"] in listed:
            continue
        presence["people"].append(
            PERSON_SCHEMA({"name": legacy["name"], "devices": [{"tracker": legacy["device"]}]})
        )
        listed.add(legacy["device"])
    presence["devices"] = []


def _wanted_kinds(node: Mapping[str, Any], parent_kind: str | None) -> tuple[str, ...]:
    """The kinds this group looks like, best first.

    Evidence beats position. A group bound to a Home Assistant area is a room; one bound to
    a floor is a floor; one that declares a doorway or a way off the property is somewhere a
    person walks through, which is an area indoors and an outside area beside the house.
    Only when the document says none of that does the layering decide, which is what turns a
    bare `property > house > downstairs > kitchen` into exactly those four kinds.

    The doorway evidence is read only on a group with nothing inside it. A branch that
    declares an edge -- `downstairs`, with a staircase to `upstairs` -- is still a branch,
    and reading that edge as "somewhere a person walks" used to guess `outside` for it (a
    property cannot contain an area) and then cascade that guess over every room below,
    because an outside area contains nothing but outside areas. A group with children is a
    container whatever else it says about itself, so position decides.
    """
    if parent_kind is None:
        return (KIND_PROPERTY,)
    wants: list[str] = []
    if node.get(CONF_AREA_ID) is not None:
        wants.append(KIND_AREA)
    if node.get(CONF_FLOOR_ID) is not None:
        # Inert today, and deliberately kept: `floor` is only ever legal under a structure,
        # which is also what a structure's children default to, so this never changes the
        # answer. It is here so the evidence list reads as the rule, and so it keeps working
        # if the nesting table ever lets a floor sit somewhere else.
        wants.append(KIND_FLOOR)
    if not node.get("children") and (node.get("adjacent") or node.get("exit")):
        wants += [KIND_AREA, KIND_OUTSIDE]
    wants.append(DEFAULT_CHILD_KIND[parent_kind])
    return tuple(dict.fromkeys(wants))  # first occurrence wins, order kept


def infer_kinds(config: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Resolve every `kind: null` in a validated document, in place.

    Returns the document and the paths of the groups whose kind was guessed -- the panel
    shows those as "inferred kinds -- check and save", and the cross-checks give them an
    amnesty from the rules that only make sense once somebody has confirmed the kind.

    Inference is total: `_wanted_kinds` always ends in `DEFAULT_CHILD_KIND[parent_kind]`,
    and `ALLOWED_CHILDREN` always permits that, so there is always a kind to write and a
    resolved document never carries a null one. `test_inference_is_total` pins the invariant.

    It is also stable: whatever this writes has to validate again on the way back out,
    because the panel saves exactly the document it was handed and a migration nobody can
    save is no migration at all. Two rules together buy that. Doorway evidence is read only
    on a group with nothing inside it (see `_wanted_kinds`), so a branch keeps the
    positional kind its children expect instead of being pulled outdoors and dragging the
    rooms below it with it. And an exit is legal on any room, indoors or out, so the
    guessed kinds never contradict the doors the document already declared.
    `test_a_validated_document_validates_again_unchanged` pins that over the real
    pre-kinds example house, where it lands on `property > structure > floor > area` for
    the building and reads a garage that declares a doorway and no rooms as an outdoor area.
    """
    inferred: list[str] = []

    def walk(node: dict[str, Any], parent_kind: str | None, path: list[Any]) -> None:
        kind = node.get(CONF_KIND)
        if kind is None:
            allowed = ALLOWED_CHILDREN[parent_kind]
            kind = next(k for k in _wanted_kinds(node, parent_kind) if k in allowed)
            node[CONF_KIND] = kind
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
    walked: list[tuple[str, dict[str, Any]]] = []

    def walk(group: dict[str, Any], path: list[Any], parent_kind: str | None) -> None:
        here = _path(path)
        if group["id"] in seen_groups:
            errors.append({"path": f"{here}/id", "message": "duplicate group id"})
        seen_groups.add(group["id"])
        walked.append((here, group))
        kind = group[CONF_KIND]
        if kind not in ALLOWED_CHILDREN[parent_kind]:
            errors.append(
                {
                    "path": f"{here}/{CONF_KIND}",
                    "message": (
                        f"{_an(parent_kind)} cannot contain {_an(kind)}"
                        if parent_kind is not None
                        else "every root group is a property"
                    ),
                }
            )
        if here not in inferred:
            if group["adjacent"] and kind not in NODE_KINDS:
                errors.append(
                    {
                        "path": f"{here}/adjacent",
                        "message": f"{_an(kind)} is not somewhere you can walk between; "
                        "only areas and outside areas have adjacent groups",
                    }
                )
            # An area with an exit is a valid topology -- a kitchen with a door to the
            # street is a kitchen with a door to the street -- so the only thing an exit
            # is checked against is whether anybody can stand there. Handing the exit to
            # the nearest yard, as this used to, made a document that loaded unsaveable.
            if group["exit"] and kind not in NODE_KINDS:
                errors.append(
                    {
                        "path": f"{here}/exit",
                        "message": f"{_an(kind)} cannot lead off the property; "
                        "only areas and outside areas can",
                    }
                )
        if not group["stimuli"] and not group["children"]:
            errors.append({"path": here, "message": "group needs at least one stimulus or child"})
        labels: set[str] = {TRIGGER_KEY, PRESENCE_KEY}  # both synthetic channels
        for i, stim in enumerate(group["stimuli"]):
            spath = f"{here}/stimuli/{i}"
            if stim["envelope"] is not None and stim["envelope"] not in envelope_ids:
                errors.append({"path": f"{spath}/envelope", "message": "unknown envelope"})
            label = stim["key"] or stim["entity"]
            if label in labels:
                errors.append(
                    {
                        "path": spath,
                        "message": f"duplicate stimulus '{label}'; set a unique key",
                    }
                )
            labels.add(label)
        for i, child in enumerate(group["children"]):
            if child["id"] in labels:
                errors.append(
                    {
                        "path": f"{here}/children/{i}/id",
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
                            "path": f"{here}/{CONF_SIMULATION}/lights/{key}/{i}",
                            "message": "must be a light entity",
                        }
                    )
        presence = group[CONF_PRESENCE]
        if presence["envelope"] is not None and presence["envelope"] not in envelope_ids:
            errors.append(
                {
                    "path": f"{here}/{CONF_PRESENCE}/envelope",
                    "message": "unknown envelope",
                }
            )

    for i, group in enumerate(cfg[CONF_GROUPS]):
        walk(group, [CONF_GROUPS, i], None)

    # Adjacency can only be checked once every id is known: an edge is allowed to point
    # forwards, at a room the walk has not reached yet.
    kind_of = {group["id"]: group[CONF_KIND] for _, group in walked}
    path_of = {group["id"]: at for at, group in walked}
    for at, group in walked:
        seen_edges: set[str] = set()
        for j, edge in enumerate(group["adjacent"]):
            epath = f"{at}/adjacent/{j}"
            if edge["id"] == group["id"]:
                errors.append({"path": epath, "message": "a group cannot be adjacent to itself"})
            elif edge["id"] not in seen_groups:
                errors.append({"path": epath, "message": f"unknown group '{edge['id']}'"})
            elif kind_of[edge["id"]] not in NODE_KINDS and inferred.isdisjoint(
                # This rule is about the far end's kind as much as this one's, so a guess at
                # either end earns the amnesty (M2). Half a migrated document is still a
                # migrated document.
                (at, path_of[edge["id"]])
            ):
                errors.append(
                    {
                        "path": epath,
                        "message": f"'{edge['id']}' is {_an(kind_of[edge['id']])}, "
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
    seen_trackers: set[str] = set()
    seen_people: set[str] = set()
    for i, person in enumerate(presence["people"]):
        ppath = [CONF_PRESENCE, "people", i]
        if person["name"] is not None:
            if person["name"] in seen_people:
                errors.append({"path": _path([*ppath, "name"]), "message": "duplicate name"})
            seen_people.add(person["name"])
        for j, device in enumerate(person["devices"]):
            if device["tracker"] in seen_trackers:
                errors.append(
                    {
                        "path": _path([*ppath, "devices", j, "tracker"]),
                        "message": "a tracker belongs to one person",
                    }
                )
            seen_trackers.add(device["tracker"])
    for scanner, gid in presence["scanner_areas"].items():
        if gid not in seen_groups:
            errors.append(
                {
                    "path": _path([CONF_PRESENCE, "scanner_areas", scanner]),
                    "message": f"unknown group '{gid}'",
                }
            )
    return errors


def _root_warnings(cfg: dict[str, Any]) -> list[str]:
    """Things a document says that this schema cannot honour, and would otherwise drop.

    Every root group is a property, and only areas and outside areas are rooms -- so a
    document whose rooms sit at the root (which is how a house written to the older,
    kind-less schema often reads) loads with its whole presence graph flattened away. It
    still loads, because refusing it would strand somebody whose configuration worked
    yesterday, and the doorways stay in the file so nothing is lost on disk. But nothing
    else in the panel would say that the map is empty, so this does.
    """
    warnings: list[str] = []
    for i, group in enumerate(cfg[CONF_GROUPS]):
        if group["adjacent"] or group["exit"]:
            warnings.append(
                f"{_path([CONF_GROUPS, i])}: '{group['id']}' declares doors but is a root "
                "group; every root is a property, so it is not a room. Wrap your rooms in "
                "a property."
            )
    return warnings


@dataclass(frozen=True)
class Validated:
    """A validated document, what had to be guessed to get there, and what it lost."""

    config: dict[str, Any]
    inferred: tuple[str, ...]
    warnings: tuple[str, ...] = ()

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
    # after the checks, so a duplicate in the legacy list is still reported where it was
    # written rather than silently folded away
    _apply_presence_defaults(cfg)
    return Validated(
        config=_stringify_enums(cfg),
        inferred=tuple(inferred),
        warnings=tuple(_root_warnings(cfg)),
    )


def validate_config(config: Mapping[str, Any]) -> dict[str, Any]:
    """The document alone. Every caller that does not care how it got there uses this."""
    return validate(config).config
