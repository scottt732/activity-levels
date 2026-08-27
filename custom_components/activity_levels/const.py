"""Constants for Activity Levels."""

from __future__ import annotations

from homeassistant.const import Platform

# re-exported so the integration side has one place to import constants from, while
# the learner keeps its own definition and stays free of `homeassistant`
from .patterns.daytype import BUILTIN_DAY_TYPES as BUILTIN_DAY_TYPES

DOMAIN = "activity_levels"
PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.SWITCH,
]

MANUFACTURER = "Activity Levels"
MODEL = "Group"
MODEL_HUB = "Hub"
MODEL_PRESENCE = "Presence"
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
DEV_SERVER_ENV = "ACTIVITY_LEVELS_DEV_SERVER"
