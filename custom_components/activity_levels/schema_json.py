"""A JSON Schema for the configuration document, generated from the voluptuous one.

Editors want a schema; `schema.py` has one, in the wrong language. Rather than keep a
second hand-written copy in step -- which is a promise nobody keeps past the third
release -- this walks `CONFIG_SCHEMA` and translates it. `vol.Optional`/`vol.Required`
become properties and a `required` list, `vol.In` and `vol.Coerce(<Enum>)` become
enums, `vol.Any` becomes `anyOf`, `vol.All` merges its parts, and `_Finite`'s recorded
bounds become `minimum`/`maximum`. A validator this does not model is emitted as an
empty schema carrying a description that names it, because a schema that quietly
rejects a legal document is worse than one that quietly accepts an illegal one: the
editor's job here is to help, and the backend is still the thing that decides.

The result is written to `config.schema.json` beside this file by
`scripts/export_schema.py`, committed, and served from the panel's static path so the
URL can be pasted into an editor. `tests/test_schema_json.py` fails if the committed
file drifts from a fresh export.
"""

from __future__ import annotations

import json
from collections.abc import Iterable
from copy import deepcopy
from enum import Enum
from pathlib import Path
from typing import Any, cast

import voluptuous as vol
from homeassistant.helpers import config_validation as cv

from .const import SCHEMA_NAME
from .duration import parse_duration
from .schema import (
    ADJACENT_SCHEMA,
    CONFIG_SCHEMA,
    GROUP_ID_RE,
    GROUP_SCHEMA,
    HHMM_RE,
    _adjacent,
    _calendar_entity,
    _device_tracker,
    _Finite,
    _group_id,
    _group_schema,
    _hhmm,
    _quiet_hours,
    _split_retrigger,
    _to_states,
)

JsonSchema = dict[str, Any]

DRAFT = "https://json-schema.org/draft/2020-12/schema"

SCHEMA_FILE = Path(__file__).parent / SCHEMA_NAME
"""Where the exported document lives, next to the code that generates it."""

#: Home Assistant entity ids, loosely: `domain.object_id`. `cv.entity_id` is stricter
#: (no leading, trailing or doubled underscores); the extra rules would only turn an
#: editor's squiggle into a puzzle, and the backend still enforces them.
_ENTITY = r"^[a-z0-9_]+\.[a-z0-9_]+$"

_DURATION_PATTERN = r"^\s*(\d+(\.\d+)?\s*[smhdSMHD]|\d+:\d{2}(:\d{2}(\.\d+)?)?)\s*$"

_DURATION: JsonSchema = {
    "anyOf": [
        {"type": "number", "minimum": 0},
        {"type": "string", "pattern": _DURATION_PATTERN},
    ],
    "description": ("A duration: a number of seconds, '30s'/'5m'/'2h'/'1d', or 'HH:MM[:SS[.f]]'."),
}

_GROUP_ID: JsonSchema = {
    "type": "string",
    "pattern": GROUP_ID_RE.pattern,
    "description": "A group id: lowercase letters, digits and underscores, starting with a letter.",
}

_STRING: JsonSchema = {"type": "string"}

#: Validators translated by identity rather than by structure. Every one of these is
#: either a plain function (which carries no machine-readable shape at all) or a
#: composite whose meaning is clearer stated than derived.
_LEAVES: dict[Any, JsonSchema] = {
    _group_id: _GROUP_ID,
    _hhmm: {
        "type": "string",
        "pattern": HHMM_RE.pattern,
        "description": "A time of day, 'HH:MM' on a 24-hour clock.",
    },
    _to_states: {
        "anyOf": [_STRING, {"type": "array", "items": _STRING, "minItems": 1}],
        "description": "One state, or a list of states, that counts as a trigger.",
    },
    _quiet_hours: {
        "anyOf": [
            {"type": "null"},
            {
                "type": "array",
                "items": {"type": "string", "pattern": HHMM_RE.pattern},
                "minItems": 2,
                "maxItems": 2,
            },
        ],
        "description": "A [start, end] pair of 'HH:MM' times, or null to disable.",
    },
    _group_schema: {"$ref": "#/$defs/group"},
    # A pre-processor that rewrites the legacy `retrigger` spelling in place. It
    # constrains nothing, so it contributes nothing to the shape.
    _split_retrigger: {},
    parse_duration: _DURATION,
    cv.string: _STRING,
    cv.boolean: {"type": "boolean"},
    cv.entity_id: {"type": "string", "pattern": _ENTITY},
    _calendar_entity: {"type": "string", "pattern": r"^calendar\.[a-z0-9_]+$"},
    _device_tracker: {"type": "string", "pattern": r"^device_tracker\.[a-z0-9_]+$"},
}

_TYPES: dict[type, JsonSchema] = {
    str: {"type": "string"},
    bool: {"type": "boolean"},
    int: {"type": "integer"},
    float: {"type": "number"},
    dict: {"type": "object"},
    list: {"type": "array"},
}

#: What the README says each top-level key is for, in one sentence.
_DESCRIPTIONS: dict[str, str] = {
    "version": "Document version. Only 1 exists.",
    "defaults": (
        "Settings every group inherits unless it says otherwise, plus the pattern-learning "
        "and presence-simulation options, which are configured only here."
    ),
    "envelopes": (
        "Named ADSR presets. A stimulus names one by id and may override any of its fields "
        "inline; `defaults.envelope` names the one used when a stimulus names none."
    ),
    "groups": (
        "The tree of places. Every root group is a property; a property holds structures and "
        "outdoor areas, a structure holds floors, a floor holds areas, and an outdoor area "
        "holds outdoor areas."
    ),
    "presence": (
        "Room-level presence from Bermuda device trackers. Absent, or `enabled: false`, "
        "turns the whole feature off."
    ),
}

_GROUP_DESCRIPTION = (
    "One place, or one container of places. `id` names its entities and never changes "
    "meaning; `kind` says what it is on the property and decides what may go inside it."
)


def _name(validator: Any) -> str:
    """What to call a validator in a description: its own name, or its class's."""
    name = getattr(validator, "__name__", None)
    return str(name) if isinstance(name, str) else type(validator).__name__


def _describe(schema: JsonSchema, text: str) -> None:
    """Append a sentence to a schema's description, keeping what is already there."""
    existing = schema.get("description")
    schema["description"] = f"{existing} {text}" if existing else text


def _merge(acc: JsonSchema, fragment: JsonSchema) -> JsonSchema:
    """Fold one `vol.All` member into the accumulated schema; the first one wins a key."""
    out = dict(acc)
    for key, value in fragment.items():
        if key == "description":
            _describe(out, str(value))
        elif key not in out:
            out[key] = value
    return out


def _apply_range(schema: JsonSchema, rule: vol.Range) -> None:
    """A `vol.Range` as numeric bounds -- or, on anything not plainly numeric, as prose.

    `vol.All(parse_duration, vol.Range(min=5))` bounds the *parsed* value, and the raw
    document may spell that value `5m`. There is no JSON Schema for "this string, once
    read as seconds, is at least five", so the limit is written out in words instead.
    """
    numeric = schema.get("type") in ("number", "integer")
    if not numeric:
        lo, hi = rule.min, rule.max
        if lo is not None and hi is not None:
            _describe(schema, f"Between {lo} and {hi} seconds.")
        elif lo is not None:
            _describe(schema, f"At least {lo} seconds.")
        elif hi is not None:
            _describe(schema, f"At most {hi} seconds.")
        return
    if rule.min is not None:
        schema["minimum" if rule.min_included else "exclusiveMinimum"] = rule.min
    if rule.max is not None:
        schema["maximum" if rule.max_included else "exclusiveMaximum"] = rule.max


def _apply_length(schema: JsonSchema, rule: vol.Length) -> None:
    """A `vol.Length` as item or character counts, depending on what it is measuring."""
    kind = schema.get("type")
    keys = {"array": ("minItems", "maxItems"), "string": ("minLength", "maxLength")}.get(str(kind))
    if keys is None:
        _describe(schema, f"Length between {rule.min} and {rule.max}.")
        return
    if rule.min is not None:
        schema[keys[0]] = rule.min
    if rule.max is not None:
        schema[keys[1]] = rule.max


def _all(validators: tuple[Any, ...]) -> JsonSchema:
    """`vol.All` as one merged schema. Ranges and lengths are applied last, because what
    they mean depends on the type the other members settled on."""
    out: JsonSchema = {}
    ranges: list[vol.Range] = []
    lengths: list[vol.Length] = []
    for validator in validators:
        if isinstance(validator, vol.Range):
            ranges.append(validator)
        elif isinstance(validator, vol.Length):
            lengths.append(validator)
        else:
            out = _merge(out, _translate(validator))
    for rule in ranges:
        _apply_range(out, rule)
    for length in lengths:
        _apply_length(out, length)
    return out


def _coerce(validator: vol.Coerce) -> JsonSchema:
    """`vol.Coerce(SomeEnum)` is an enum of its values; anything else is its target type."""
    target = validator.type
    if isinstance(target, type) and issubclass(target, Enum):
        return {"enum": [member.value for member in target]}
    if isinstance(target, type) and target in _TYPES:
        return dict(_TYPES[target])
    return {"description": f"Coerced to {_name(target)}."}


def _default_of(marker: vol.Optional) -> Any:
    """The value voluptuous would fill in, as JSON, or `vol.UNDEFINED` for no default."""
    factory = marker.default
    if not callable(factory):  # vol.UNDEFINED, the sentinel for "no default"
        return vol.UNDEFINED
    value = factory()
    return value.value if isinstance(value, Enum) else value


def _object(mapping: dict[Any, Any]) -> JsonSchema:
    """A voluptuous mapping as an object schema.

    `additionalProperties` is false because voluptuous rejects extra keys by default,
    which is the behaviour worth surfacing: a typo in a key name is the mistake this
    schema most usefully catches. A mapping keyed by a *validator* rather than a name --
    `presence.scanner_areas` -- is the one open-ended case, and becomes a value schema.
    """
    properties: dict[str, JsonSchema] = {}
    required: list[str] = []
    additional: JsonSchema | bool = False
    for key, value in mapping.items():
        name = key.schema if isinstance(key, vol.Marker) else key
        if not isinstance(name, str):
            additional = _translate(value)
            continue
        sub = _translate(value)
        if isinstance(key, vol.Required):
            required.append(name)
        elif isinstance(key, vol.Optional):
            default = _default_of(key)
            if default is not vol.UNDEFINED:
                sub["default"] = default
        properties[name] = sub
    out: JsonSchema = {"type": "object", "properties": properties}
    if required:
        out["required"] = required
    out["additionalProperties"] = additional
    return out


def _translate(validator: Any) -> JsonSchema:
    """One voluptuous validator as one JSON Schema."""
    if validator is None:
        return {"type": "null"}
    if isinstance(validator, vol.Schema):
        return _translate(validator.schema)
    if validator is _adjacent:
        # A doorway is either the group it leads to or the long form that says how.
        return {
            "anyOf": [deepcopy(_GROUP_ID), _translate(ADJACENT_SCHEMA)],
            "description": "A group id, or {id, connection, one_way}.",
        }
    try:
        leaf = _LEAVES.get(validator)
    except TypeError:  # unhashable: a dict or a list, handled below
        leaf = None
    if leaf is not None:
        return deepcopy(leaf)
    if isinstance(validator, _Finite):
        out: JsonSchema = {"type": "number"}
        if validator.lo is not None:
            out["exclusiveMinimum" if validator.lo_exclusive else "minimum"] = validator.lo
        if validator.hi is not None:
            out["exclusiveMaximum" if validator.hi_exclusive else "maximum"] = validator.hi
        return out
    if isinstance(validator, vol.All):
        return _all(tuple(validator.validators))
    if isinstance(validator, vol.Any):
        return {"anyOf": [_translate(v) for v in validator.validators]}
    if isinstance(validator, vol.In):
        return {"enum": list(cast("Iterable[Any]", validator.container))}
    if isinstance(validator, vol.Coerce):
        return _coerce(validator)
    if isinstance(validator, dict):
        return _object(validator)
    if isinstance(validator, list):
        if not validator:
            return {"type": "array"}
        return {"type": "array", "items": _translate(validator[0])}
    if isinstance(validator, type) and validator in _TYPES:
        return dict(_TYPES[validator])
    return {"description": f"Validated by {_name(validator)}; not modelled here."}


def json_schema() -> JsonSchema:
    """The whole configuration document as a JSON Schema (draft 2020-12)."""
    root = _translate(CONFIG_SCHEMA)
    for key, text in _DESCRIPTIONS.items():
        _describe(root["properties"][key], text)
    group = _translate(GROUP_SCHEMA)
    _describe(group, _GROUP_DESCRIPTION)
    return {
        "$schema": DRAFT,
        "title": "Activity Levels configuration",
        "description": (
            "The options document for the Activity Levels Home Assistant integration. "
            "Paste this schema's URL into your editor with "
            "'# yaml-language-server: $schema=/activity_levels_panel/config.schema.json'."
        ),
        **root,
        "$defs": {"group": group},
    }


def render() -> str:
    """The committed file's exact bytes, so an export and a check compare as text."""
    return json.dumps(json_schema(), indent=2) + "\n"
