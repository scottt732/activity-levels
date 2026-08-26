"""Constants for Activity Levels."""

from __future__ import annotations

from homeassistant.const import Platform

DOMAIN = "activity_levels"
PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR, Platform.BUTTON]

MANUFACTURER = "Activity Levels"
MODEL = "Group"
TRIGGER_KEY = "trigger"

STORAGE_VERSION = 1


def storage_key(entry_id: str) -> str:
    return f"{DOMAIN}.{entry_id}"


CONF_VERSION = "version"
CONF_DEFAULTS = "defaults"
CONF_ENVELOPES = "envelopes"
CONF_GROUPS = "groups"
CONF_PATTERNS = "patterns"
CONF_SIMULATION = "simulation"

BUILTIN_DAY_TYPES = ("weekday", "weekend", "holiday")
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
SERVICE_RESET = "reset"
ATTR_GROUP_ID = "group_id"
ATTR_PEAK = "peak"

PANEL_URL_PATH = "activity-levels"
PANEL_ELEMENT = "activity-levels-panel"
PANEL_TITLE = "Activity Levels"
PANEL_ICON = "mdi:pulse"
STATIC_URL = "/activity_levels_panel"
BUNDLE_NAME = "activity-levels-panel.js"
DEV_SERVER_ENV = "ACTIVITY_LEVELS_DEV_SERVER"
