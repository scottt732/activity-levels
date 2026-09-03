"""Constants for Activity Levels.

Free of `homeassistant`, and it has to stay that way: `topology.py` and
`presence/estimator.py` read their constants from here, and those are on the pure side of
the boundary AGENTS.md draws. Anything that needs a Home Assistant type to be spelled --
`PLATFORMS` was the one -- belongs in `__init__.py`, which is integration code already.
`tests/test_purity.py` fails if this drifts back.
"""

from __future__ import annotations

# re-exported so the integration side has one place to import constants from, while
# the learner keeps its own definition and stays free of `homeassistant`
from .patterns.daytype import BUILTIN_DAY_TYPES as BUILTIN_DAY_TYPES

DOMAIN = "activity_levels"

MANUFACTURER = "Activity Levels"
MODEL = "Group"
MODEL_HUB = "Hub"
MODEL_PRESENCE = "Presence"
MODEL_BY_KIND = {
    "property": "Property",
    "structure": "Structure",
    "floor": "Floor",
    "area": "Area",
    "outside": "Outside",
}
HUB_NAME = "Activity Levels"
TRIGGER_KEY = "trigger"
PRESENCE_KEY = "presence"  # the synthetic channel's label, like TRIGGER_KEY
AWAY = "away"  # the state that is not a room

STORAGE_VERSION = 1
PRESENCE_STORAGE_VERSION = 1


def storage_key(entry_id: str) -> str:
    return f"{DOMAIN}.{entry_id}"


def presence_storage_key(entry_id: str) -> str:
    return f"{DOMAIN}.{entry_id}.presence"


CONF_VERSION = "version"
CONF_DEFAULTS = "defaults"
CONF_ENVELOPES = "envelopes"
CONF_GROUPS = "groups"
CONF_PATTERNS = "patterns"
CONF_SIMULATION = "simulation"
CONF_PRESENCE = "presence"

CONF_KIND = "kind"
CONF_AREA_ID = "area_id"
CONF_FLOOR_ID = "floor_id"

KIND_PROPERTY = "property"
KIND_STRUCTURE = "structure"
KIND_FLOOR = "floor"
KIND_AREA = "area"
KIND_OUTSIDE = "outside"

KINDS = (KIND_PROPERTY, KIND_STRUCTURE, KIND_FLOOR, KIND_AREA, KIND_OUTSIDE)
"""What a group can be, in the order the editor's picker lists them: outermost first."""

NODE_KINDS = frozenset({KIND_AREA, KIND_OUTSIDE})
"""The kinds a person can be in. Everything else mixes places; it is not one."""

ALLOWED_CHILDREN: dict[str | None, frozenset[str]] = {
    None: frozenset({KIND_PROPERTY}),  # every root is a property
    KIND_PROPERTY: frozenset({KIND_PROPERTY, KIND_STRUCTURE, KIND_OUTSIDE}),
    KIND_STRUCTURE: frozenset({KIND_FLOOR, KIND_AREA}),
    KIND_FLOOR: frozenset({KIND_AREA}),
    KIND_AREA: frozenset({KIND_AREA}),
    KIND_OUTSIDE: frozenset({KIND_OUTSIDE}),
}
"""The layering, as a table. A property stacks structures and outdoor areas; a structure
stacks floors (or, in a one-storey building, rooms straight away); a floor holds rooms; a
room may hold a sub-room (an ensuite, an alcove); outside holds outside."""

DEFAULT_CHILD_KIND = {
    KIND_PROPERTY: KIND_STRUCTURE,
    KIND_STRUCTURE: KIND_FLOOR,
    KIND_FLOOR: KIND_AREA,
    KIND_AREA: KIND_AREA,
    KIND_OUTSIDE: KIND_OUTSIDE,
}
"""What a child of each kind is when the document gives no other evidence. Only the
migration reads this; a saved document says what it means."""

CONNECTIONS = ("open", "door", "stairs", "exterior_door")
"""How two adjacent groups join. Informational in this release: validated and round-tripped,
and nothing in the estimator weights it yet."""

DEFAULT_CONNECTION = "door"

MODE_SUSTAINED = "sustained"
MODE_MOMENTARY = "momentary"

MODES = (MODE_SUSTAINED, MODE_MOMENTARY)
"""How a stimulus reads its entity. `sustained` holds a note for as long as the entity sits
in its active states, which is what a light or a media player wants. `momentary` treats each
crossing as an event and lets go again -- an interior door, read as "somebody walked through
here" rather than "a door is open"."""

EDGE_ENTER = "enter"
EDGE_LEAVE = "leave"

EDGES = (EDGE_ENTER, EDGE_LEAVE)
"""Which crossings of the active states a momentary stimulus fires on. `enter` is a
transition into them, `leave` a transition out. An exterior door that only matters when it
opens is `[enter]`; a door read as a footstep is both."""

SLOT_MINUTES = 15
SLOTS_PER_DAY = 96

DEFAULT_ENVELOPE_ID = "default"
DEFAULT_MAX_VALUE = 5.0
DEFAULT_PRECISION = 1
DEFAULT_SAFETY_REFRESH = 60.0
DEFAULT_MIN_WAKE_INTERVAL = 1.0

ATTR_MIX = "mix"
ATTR_MAX_VALUE = "max_value"
ATTR_GATED = "gated"
ATTR_ACTIVE_VOICES = "active_voices"
ATTR_COOLDOWN_AT = "cooldown_at"
ATTR_CONTRIBUTORS = "contributors"

SERVICE_TRIGGER = "trigger"
SERVICE_SET_LEVEL = "set_level"
SERVICE_RESET = "reset"
SERVICE_REBUILD_PROFILE = "rebuild_profile"
SERVICE_SIMULATE_NOW = "simulate_now"
ATTR_GROUP_ID = "group_id"
ATTR_PEAK = "peak"
ATTR_VALUE = "value"
ATTR_FORCE = "force"

ATTR_P25 = "p25"
ATTR_P75 = "p75"
ATTR_DAY_TYPE = "day_type"
ATTR_READY = "ready"
ATTR_PRODUCER = "producer"
ATTR_PRODUCER_VERSION = "producer_version"
ATTR_GROUPS_READY = "groups_ready"
ATTR_GROUPS_TOTAL = "groups_total"
ATTR_TRAINED = "trained"

ATTR_CONFIDENCE = "confidence"
ATTR_MOVING = "moving"
ATTR_CANDIDATES = "candidates"
ATTR_PATH = "path"
ATTR_UPDATED = "updated"
ATTR_WHO = "who"
ATTR_ROOMS = "rooms"
ATTR_PROBABILITY = "probability"

ISSUE_BERMUDA_MISSING = "bermuda_missing"
ISSUE_NOT_BERMUDA = "not_a_bermuda_device"
ISSUE_DISABLED_SENSORS = "disabled_distance_sensors"
ISSUE_UNMAPPED_SCANNERS = "unmapped_scanners"
ISSUE_TRANSITION = "transition_infeasible"

PANEL_URL_PATH = "activity-levels"
PANEL_ELEMENT = "activity-levels-panel"
PANEL_TITLE = "Activity Levels"
PANEL_ICON = "mdi:pulse"
STATIC_URL = "/activity_levels_panel"
BUNDLE_NAME = "activity-levels-panel.js"
SCHEMA_NAME = "config.schema.json"
SCHEMA_URL = f"{STATIC_URL}/{SCHEMA_NAME}"
"""Where the exported JSON Schema is served, for an editor's `$schema` comment."""
DEV_SERVER_ENV = "ACTIVITY_LEVELS_DEV_SERVER"
