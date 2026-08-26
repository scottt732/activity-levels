# Activity Levels — Plan 2: Home Assistant Integration Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the pure engine into a working HACS custom integration: config entry, validated config schema, coordinator (state listener + one timer per root group), one device per group with its entities, services, websocket API for the future panel, diagnostics, and CI validation (hassfest, HACS).

**Architecture:** `schema.py` validates/normalizes the options dict (durations → float seconds, pathed errors). `tree.py` builds the engine `Group`/`Voice` tree from normalized config plus lookup tables. `coordinator.py` owns the tree: it classifies `state_changed` events into note-on/off/unavailable, publishes per-group `GroupState` snapshots to entity listeners, schedules a single `async_call_later` per root group from `next_display_change` (floored by `min_wake_interval`, capped by `safety_refresh`), and persists voice snapshots in a `Store`. Entities are thin views over coordinator data. Devices are created top-down in `__init__.py` so `via_device` links work.

**Tech Stack:** Python 3.14.2, Home Assistant 2026.8.3, voluptuous, pytest-homeassistant-custom-component 0.13.357, uv, ruff, mypy.

**Spec:** `docs/superpowers/specs/2026-08-25-activity-levels-design.md` §3, §5, §7. Prior ledger: `docs/superpowers/plan1-engine-ledger.md`.

## Global Constraints

- Repo: `/Users/sholodak/elevenrose/activity-levels`, branch `main`. Engine API is fixed (see `custom_components/activity_levels/engine/__init__.py`); do not change engine semantics except in Task 2.
- `requires-python = ">=3.14.2"`; dev deps pinned: `homeassistant==2026.8.3`, `pytest-homeassistant-custom-component==0.13.357`. CI installs Python 3.14.
- Domain `activity_levels`. `manifest.json`: `single_config_entry: true`, `integration_type: "hub"`, `iot_class: "calculated"`, `version: "0.0.0"`, `codeowners: ["@scottt732"]`, `config_flow: true`, `dependencies: ["websocket_api"]`, `requirements: []`.
- Config stored verbatim (normalized) in `entry.options`; changes reload the entry.
- Entity ids: `sensor.<gid>_activity_level`, `binary_sensor.<gid>_active`, `sensor.<gid>_last_activity`, `sensor.<gid>_cooldown_at`, `button.<gid>_trigger`. Unique ids: `f"{entry_id}-{gid}-{suffix}"`. `_attr_has_entity_name = True` with `translation_key`; the object id is forced by assigning `self.entity_id` in `__init__`.
- One HA device per group: `identifiers={(DOMAIN, gid)}`, `name`, `suggested_area`, `manufacturer="Activity Levels"`, `model="Group"`, `via_device=(DOMAIN, parent_gid)` for children. Devices are created via the device registry in `async_setup_entry` before platforms load.
- Timestamps exposed to HA are tz-aware `datetime` from `dt_util.utc_from_timestamp`.
- Engine time is `dt_util.utcnow().timestamp()` everywhere (works with the `freezer` fixture).
- Decisions beyond the spec (rulings): `defaults.min_wake_interval` (default `1.0` s, range 0.1–60) floors timer delays; `contributors` attribute = `{channel_label: value rounded to precision}`; voice snapshots persist in `homeassistant.helpers.storage.Store` (key `activity_levels.<entry_id>`) instead of `RestoreEntity` — it is ordering-independent and one place; a hidden per-group `trigger` voice (impulse, `key="trigger"`) implements `trigger(group_id, peak)` by setting its `gain` and calling `note_on`; no options flow (the panel edits options via websocket).
- Deprecation note: HA dev (2026.9) replaces `DeviceInfo.via_device` with `via_device_id`; on 2026.8.3 use the device registry's `async_get_or_create(..., via_device=...)`. If the pinned version warns, switch to `via_device_id` using `dr.async_get_device_id_by_identifier`.
- Tests use `pytest_plugins = "pytest_homeassistant_custom_component"` and an autouse `enable_custom_integrations` fixture.
- `ruff` line length 100; `mypy --strict` over the whole `custom_components/activity_levels` package (tests excluded). Add targeted `# type: ignore[...]` only where HA's typing forces it, with a comment.
- Commit after every task with the message given.

---

## File structure

```
custom_components/activity_levels/
  __init__.py        setup/unload, device creation, services, runtime_data
  const.py           DOMAIN, PLATFORMS, keys, defaults, storage key
  manifest.json  strings.json  translations/en.json  services.yaml
  duration.py        parse_duration()
  schema.py          validate_config() -> normalized dict; ConfigError with pathed errors
  tree.py            build_tree(config) -> Tree (engine groups/voices + lookups)
  coordinator.py     ActivityLevelsCoordinator, GroupState
  config_flow.py     one-click config flow
  entity.py          ActivityLevelsEntity base
  sensor.py  binary_sensor.py  button.py
  websocket_api.py   config/get|validate|save, state
  diagnostics.py
  engine/            (Plan 1, plus Task 2 carry-overs)
tests/
  conftest.py
  fixtures.py        sample configs
  test_duration.py  test_schema.py  test_tree.py
  test_init.py  test_coordinator.py  test_entities.py  test_websocket.py
  engine/            (Plan 1)
hacs.json
.github/workflows/python.yml (+ hassfest, hacs jobs)
```

---

### Task 1: Toolchain, manifest, package skeleton

**Files:**
- Modify: `pyproject.toml`, `.github/workflows/python.yml`, `uv.lock`
- Create: `custom_components/activity_levels/__init__.py` (minimal), `const.py`, `manifest.json`, `hacs.json`, `tests/conftest.py`, `tests/test_init.py` (smoke)

**Interfaces:**
- Produces: `const.DOMAIN = "activity_levels"`, `const.PLATFORMS`, `const.STORAGE_VERSION = 1`, `const.storage_key(entry_id)`; importable `custom_components.activity_levels` under HA.

- [ ] **Step 1: pyproject changes**

Replace the `[project]` `requires-python`, dev deps, and mypy `files`:
```toml
requires-python = ">=3.14.2"
```
```toml
[dependency-groups]
dev = [
  "pytest>=8.3",
  "hypothesis>=6.112",
  "ruff>=0.6",
  "mypy>=1.11",
  "homeassistant==2026.8.3",
  "pytest-homeassistant-custom-component==0.13.357",
]
```
```toml
[tool.ruff]
line-length = 100
target-version = "py314"
```
```toml
[tool.mypy]
strict = true
python_version = "3.14"
namespace_packages = true
explicit_package_bases = true
files = ["custom_components/activity_levels"]
```
Add under `[tool.pytest.ini_options]`: `asyncio_mode = "auto"`.

- [ ] **Step 2: `const.py`**

```python
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
```

- [ ] **Step 3: minimal `__init__.py`** (expanded in Task 5)

```python
"""Activity Levels integration."""

from __future__ import annotations

from .const import DOMAIN

__all__ = ["DOMAIN"]
```

- [ ] **Step 4: `manifest.json` and `hacs.json`**

`custom_components/activity_levels/manifest.json`:
```json
{
  "domain": "activity_levels",
  "name": "Activity Levels",
  "codeowners": ["@scottt732"],
  "config_flow": true,
  "dependencies": ["websocket_api"],
  "documentation": "https://github.com/scottt732/activity-levels",
  "integration_type": "hub",
  "iot_class": "calculated",
  "issue_tracker": "https://github.com/scottt732/activity-levels/issues",
  "requirements": [],
  "single_config_entry": true,
  "version": "0.0.0"
}
```
`hacs.json`:
```json
{
  "name": "Activity Levels",
  "homeassistant": "2026.8.0",
  "zip_release": true,
  "filename": "activity_levels.zip"
}
```

- [ ] **Step 5: `tests/conftest.py` and smoke test**

```python
"""Shared test configuration."""

from __future__ import annotations

from collections.abc import Generator

import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def _auto_enable_custom_integrations(enable_custom_integrations: None) -> Generator[None]:
    yield
```

`tests/test_init.py`:
```python
from homeassistant.core import HomeAssistant

from custom_components.activity_levels.const import DOMAIN


async def test_domain_constant(hass: HomeAssistant) -> None:
    assert DOMAIN == "activity_levels"
    assert hass.is_running or hass.state is not None
```

- [ ] **Step 6: CI on 3.14**

In `.github/workflows/python.yml` change `uv python install 3.13` → `uv python install 3.14`.

- [ ] **Step 7: Install and verify**

```bash
uv sync
uv run pytest
uv run ruff check . && uv run ruff format --check . && uv run mypy
```
Expected: engine tests + smoke pass; ruff/mypy clean. If mypy reports errors from HA-typed code in `const.py`, fix them (there should be none).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: HA 2026.8 toolchain, manifest, hacs.json, test harness"
```

---

### Task 2: Engine carry-overs from the Plan 1 ledger

**Files:**
- Modify: `custom_components/activity_levels/engine/group.py`, `engine/voice.py`
- Test: `tests/engine/test_group_aggregates.py`, `tests/engine/test_voice_snapshot.py`

**Interfaces:** unchanged public API.

- [ ] **Step 1: Failing tests**

Append to `tests/engine/test_group_aggregates.py`:
```python
def test_next_display_change_schedules_max_crossover() -> None:
    # a rises slowly from 0.5, b rises fast from 0 starting at t=500; b overtakes a at t≈555.6
    a = Voice(id="a", gain=1.0, envelope=Envelope(attack=1000.0))
    b = Voice(id="b", gain=1.0, envelope=Envelope(attack=100.0))
    g = Group(id="g", channels=[Channel(a), Channel(b)], mix=Mix.MAX, precision=1)
    a.note_on(0.0)
    b.note_on(500.0)
    # at t=550 a=0.55, b=0.5; a's display flips to 0.7 at 650 but b passes 0.65 at 565
    nxt = g.next_display_change(550.0)
    assert nxt is not None
    assert nxt <= 565.01
```
Append to `tests/engine/test_voice_snapshot.py`:
```python
def test_restore_gated_idle_with_zero_value_resets() -> None:
    w = Voice(id="x", gain=1.0, envelope=Envelope())
    w.restore({"phase": "idle", "phase_start_t": 10.0, "phase_start_value": 0.0, "gate": True})
    assert w.phase is Phase.IDLE
    assert w.gate is False
    assert w.is_active(11.0) is False
```

- [ ] **Step 2: Run to verify failure**

`uv run pytest tests/engine/test_group_aggregates.py tests/engine/test_voice_snapshot.py` — both new tests FAIL.

- [ ] **Step 3: Implement**

In `group.py`, add a private helper and use it in `next_display_change` when `self.mix is Mix.MAX`:
```python
    def _next_max_crossover(self, t: float) -> float | None:
        """Earliest future instant another channel overtakes the current MAX leader."""
        pairs = self._channel_slopes(t)
        if len(pairs) < 2:
            return None
        lead_c, lead_s = max(pairs, key=lambda p: (p[0], p[1]))
        best: float | None = None
        for c, s in pairs:
            if s <= lead_s or c >= lead_c:
                continue
            dt = (lead_c - c) / (s - lead_s)
            if dt > 0.0 and (best is None or dt < best):
                best = dt
        return None if best is None else t + best + _MIN_DT
```
In `next_display_change`, after computing `candidates` (boundary / un-pin), add:
```python
        if self.mix is Mix.MAX and (x := self._next_max_crossover(t)) is not None:
            candidates.append(x)
```
(Adapt to the existing structure: whatever list the un-pin candidate is appended to.) Also fix the docstring at `_raw_slope_at`: replace the "never late" clause with "MAX: a steeper riser overtaking the leader is handled by `_next_max_crossover`; falling crossovers only cause an early, redundant wake."

In `voice.py` `restore`, in the coercion block for `gate and phase in {RELEASE, IDLE}`: if the restored value `<= 0.0`, call `self.reset()` and return instead of entering SUSTAIN.

- [ ] **Step 4: Verify and commit**

```bash
uv run pytest && uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "fix(engine): MAX crossover wake and zero-value gated restore"
```

---

### Task 3: Duration parsing and config schema

**Files:**
- Create: `custom_components/activity_levels/duration.py`, `schema.py`
- Test: `tests/test_duration.py`, `tests/test_schema.py`, `tests/fixtures.py`

**Interfaces:**
- Produces: `parse_duration(value: object) -> float` (raises `vol.Invalid`); `class ConfigError(Exception)` with `.errors: list[dict[str, str]]` (`{"path": "groups/0/stimuli/1/gain", "message": "..."}`); `validate_config(config: Mapping[str, Any]) -> dict[str, Any]` returning the normalized config; `default_options() -> dict[str, Any]`.
- Normalized shape:
  ```python
  {"version": 1,
   "defaults": {"envelope": str, "max_value": float, "precision": int, "unavailable": str,
                "retrigger": str, "debounce": float, "safety_refresh": float, "min_wake_interval": float},
   "envelopes": [{"id": str, "attack": float, "decay": float, "sustain": float, "release": float,
                  "impulse": bool, "retrigger": str|None, "unavailable": str|None, "debounce": float|None}],
   "groups": [{"id": str, "name": str, "area": str|None, "mix": str, "null_handling": str,
               "max_value": float, "precision": int, "gain": float,
               "stimuli": [{"entity": str, "to": list[str], "gain": float, "key": str|None,
                            "envelope": str|None, "attack": float|None, "decay": float|None,
                            "sustain": float|None, "release": float|None, "impulse": bool|None,
                            "retrigger": str|None, "unavailable": str|None, "debounce": float|None}],
               "children": [ ...group... ]}]}
  ```

- [ ] **Step 1: Failing tests**

`tests/test_duration.py`:
```python
import pytest
import voluptuous as vol

from custom_components.activity_levels.duration import parse_duration


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (0, 0.0), (30, 30.0), (2.5, 2.5),
        ("30s", 30.0), ("5m", 300.0), ("2h", 7200.0), ("1d", 86400.0), ("1.5m", 90.0),
        ("00:30:00", 1800.0), ("01:02:03", 3723.0), ("00:00:01.5", 1.5), ("10:00", 36000.0),
        (" 45S ", 45.0),
    ],
)
def test_parse_duration(value: object, expected: float) -> None:
    assert parse_duration(value) == pytest.approx(expected)


@pytest.mark.parametrize("value", [-1, "-5s", "abc", "5x", "", None, True, float("nan"), "1:2:3:4"])
def test_parse_duration_rejects(value: object) -> None:
    with pytest.raises(vol.Invalid):
        parse_duration(value)
```

`tests/fixtures.py`:
```python
"""Sample configurations."""

from __future__ import annotations

from typing import Any


def house_config() -> dict[str, Any]:
    return {
        "version": 1,
        "defaults": {"envelope": "default", "min_wake_interval": 1},
        "envelopes": [
            {"id": "default", "release": "30m"},
            {"id": "momentary", "release": "10m", "impulse": True},
            {"id": "media", "attack": "10s", "decay": "5m", "sustain": 0.6, "release": "15m"},
        ],
        "groups": [
            {
                "id": "house",
                "name": "House",
                "mix": "max",
                "stimuli": [{"entity": "binary_sensor.front_door", "envelope": "momentary"}],
                "children": [
                    {
                        "id": "living_room",
                        "name": "Living Room",
                        "area": "living_room",
                        "stimuli": [
                            {"entity": "binary_sensor.living_motion", "gain": 2.0},
                            {"entity": "media_player.tv", "to": ["playing"], "envelope": "media"},
                        ],
                    },
                    {
                        "id": "kitchen",
                        "name": "Kitchen",
                        "gain": 0.5,
                        "stimuli": [{"entity": "binary_sensor.kitchen_motion", "release": "5m"}],
                    },
                ],
            }
        ],
    }
```

`tests/test_schema.py`:
```python
import pytest

from custom_components.activity_levels.schema import ConfigError, default_options, validate_config
from tests.fixtures import house_config


def test_default_options_validate() -> None:
    cfg = validate_config(default_options())
    assert cfg["groups"] == []
    assert cfg["envelopes"][0]["id"] == "default"
    assert cfg["defaults"]["min_wake_interval"] == 1.0
    assert cfg["defaults"]["safety_refresh"] == 60.0


def test_house_config_normalizes() -> None:
    cfg = validate_config(house_config())
    env = {e["id"]: e for e in cfg["envelopes"]}
    assert env["default"]["release"] == 1800.0
    assert env["media"]["attack"] == 10.0 and env["media"]["sustain"] == 0.6
    house = cfg["groups"][0]
    assert house["mix"] == "max" and house["gain"] == 1.0 and house["max_value"] == 5.0
    lr = house["children"][0]
    assert lr["stimuli"][0]["to"] == ["on"]
    assert lr["stimuli"][1]["to"] == ["playing"]
    assert house["children"][1]["stimuli"][0]["release"] == 300.0
    assert house["children"][1]["gain"] == 0.5


def errors_of(config: dict) -> dict[str, str]:
    with pytest.raises(ConfigError) as exc:
        validate_config(config)
    return {e["path"]: e["message"] for e in exc.value.errors}


def test_duplicate_group_ids_reported_with_path() -> None:
    cfg = house_config()
    cfg["groups"][0]["children"][1]["id"] = "living_room"
    errs = errors_of(cfg)
    assert "groups/0/children/1/id" in errs


def test_unknown_envelope_reference() -> None:
    cfg = house_config()
    cfg["groups"][0]["stimuli"][0]["envelope"] = "nope"
    assert "groups/0/stimuli/0/envelope" in errors_of(cfg)


def test_group_needs_stimulus_or_child() -> None:
    cfg = house_config()
    cfg["groups"][0]["children"][1]["stimuli"] = []
    assert "groups/0/children/1" in errors_of(cfg)


def test_bad_group_id_and_bad_entity_and_ranges() -> None:
    cfg = house_config()
    cfg["groups"][0]["id"] = "House 1"
    cfg["groups"][0]["stimuli"][0]["entity"] = "front_door"
    cfg["groups"][0]["stimuli"][0]["gain"] = 0
    cfg["envelopes"][2]["sustain"] = 1.5
    errs = errors_of(cfg)
    assert {"groups/0/id", "groups/0/stimuli/0/entity", "groups/0/stimuli/0/gain",
            "envelopes/2/sustain"} <= set(errs)


def test_duplicate_stimulus_entity_needs_key() -> None:
    cfg = house_config()
    lr = cfg["groups"][0]["children"][0]
    lr["stimuli"].append({"entity": "binary_sensor.living_motion", "envelope": "momentary"})
    assert "groups/0/children/0/stimuli/2" in errors_of(cfg)
    lr["stimuli"][2]["key"] = "motion_impulse"
    validate_config(cfg)


def test_default_envelope_must_exist() -> None:
    cfg = house_config()
    cfg["defaults"]["envelope"] = "missing"
    assert "defaults/envelope" in errors_of(cfg)


def test_version_must_be_one() -> None:
    cfg = house_config()
    cfg["version"] = 2
    assert "version" in errors_of(cfg)
```

- [ ] **Step 2: Run to verify failure** — `uv run pytest tests/test_duration.py tests/test_schema.py` → ImportError.

- [ ] **Step 3: Implement `duration.py`**

```python
"""Duration parsing: numbers (seconds), '30s'/'5m'/'2h'/'1d', or 'HH:MM[:SS[.f]]'."""

from __future__ import annotations

import math
import re

import voluptuous as vol

_UNITS = {"s": 1.0, "m": 60.0, "h": 3600.0, "d": 86400.0}
_UNIT_RE = re.compile(r"^(\d+(?:\.\d+)?)\s*([smhd])$")
_CLOCK_RE = re.compile(r"^(\d+):(\d{2})(?::(\d{2}(?:\.\d+)?))?$")


def parse_duration(value: object) -> float:
    if isinstance(value, bool):
        raise vol.Invalid("duration must be a number or string")
    if isinstance(value, int | float):
        seconds = float(value)
    elif isinstance(value, str):
        text = value.strip().lower()
        if m := _UNIT_RE.match(text):
            seconds = float(m.group(1)) * _UNITS[m.group(2)]
        elif m := _CLOCK_RE.match(text):
            seconds = int(m.group(1)) * 3600.0 + int(m.group(2)) * 60.0
            if m.group(3):
                seconds += float(m.group(3))
        else:
            raise vol.Invalid(f"invalid duration '{value}'")
    else:
        raise vol.Invalid("duration must be a number or string")
    if not math.isfinite(seconds) or seconds < 0:
        raise vol.Invalid("duration must be a finite, non-negative number of seconds")
    return seconds
```

- [ ] **Step 4: Implement `schema.py`**

```python
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

ENVELOPE_FIELDS = {
    vol.Optional("attack"): parse_duration,
    vol.Optional("decay"): parse_duration,
    vol.Optional("sustain"): _finite(0.0, hi=1.0),
    vol.Optional("release"): parse_duration,
    vol.Optional("impulse"): cv.boolean,
    vol.Optional("retrigger"): _ENUM["retrigger"],
    vol.Optional("unavailable"): _ENUM["unavailable"],
    vol.Optional("debounce"): parse_duration,
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
            vol.Optional("precision", default=None): vol.Any(None, vol.All(int, vol.Range(min=0, max=3))),
            vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
            vol.Optional("stimuli", default=list): [STIMULUS_SCHEMA],
            vol.Optional("children", default=list): [_group_schema],
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
    return {CONF_VERSION: 1, CONF_DEFAULTS: {}, CONF_ENVELOPES: [{"id": DEFAULT_ENVELOPE_ID}], CONF_GROUPS: []}


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
            errors.append({"path": _path([CONF_ENVELOPES, i, "id"]), "message": "duplicate envelope id"})
        envelope_ids.add(env["id"])
    if cfg[CONF_DEFAULTS]["envelope"] not in envelope_ids:
        errors.append({"path": _path([CONF_DEFAULTS, "envelope"]), "message": "unknown envelope"})

    seen_groups: set[str] = set()

    def walk(group: dict[str, Any], path: list[Any]) -> None:
        if group["id"] in seen_groups:
            errors.append({"path": _path([*path, "id"]), "message": "duplicate group id"})
        seen_groups.add(group["id"])
        if not group["stimuli"] and not group["children"]:
            errors.append({"path": _path(path), "message": "group needs at least one stimulus or child"})
        labels: set[str] = {TRIGGER_KEY}
        for i, stim in enumerate(group["stimuli"]):
            spath = [*path, "stimuli", i]
            if stim["envelope"] is not None and stim["envelope"] not in envelope_ids:
                errors.append({"path": _path([*spath, "envelope"]), "message": "unknown envelope"})
            label = stim["key"] or stim["entity"]
            if label in labels:
                errors.append(
                    {"path": _path(spath), "message": f"duplicate stimulus '{label}'; set a unique key"}
                )
            labels.add(label)
        for i, child in enumerate(group["children"]):
            if child["id"] in labels:
                errors.append({"path": _path([*path, "children", i, "id"]), "message": "clashes with a stimulus key"})
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
```

Notes for the implementer: voluptuous reports nested paths for list items as `[..., index, key]`; the tests expect `groups/0/children/1/id`. Recursive validation through `_group_schema` (a plain function) loses path prefixes for errors raised inside the nested `vol.Schema` — wrap: catch `vol.MultipleInvalid`/`vol.Invalid` inside `_group_schema` and re-raise a `vol.MultipleInvalid` whose errors have their `.path` untouched (voluptuous prepends the outer path when the function is called as a validator inside a list). Verify with `test_duplicate_group_ids_reported_with_path` and `test_bad_group_id_and_bad_entity_and_ranges`; if paths come out truncated, use `vol.Schema` with `vol.Self`-style recursion by replacing `[_group_schema]` with `[vol.Self]` inside a schema built as `GROUP_SCHEMA = vol.Schema({... vol.Optional("children", default=list): [vol.Self]})` and apply the name default in a post-pass.

- [ ] **Step 5: Verify and commit**

```bash
uv run pytest tests/test_duration.py tests/test_schema.py && uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "feat: config schema with pathed validation errors"
```

---

### Task 4: Tree builder

**Files:**
- Create: `custom_components/activity_levels/tree.py`
- Test: `tests/test_tree.py`

**Interfaces:**
- Produces:
  ```python
  @dataclass(frozen=True) class GroupInfo: id: str; name: str; area: str | None; parent_id: str | None; root_id: str; precision: int; max_value: float; mix: str; group: Group; trigger: Voice
  @dataclass(frozen=True) class VoiceRef: entity_id: str; to: frozenset[str]; voice: Voice; group_id: str; label: str
  @dataclass class Tree: roots: list[Group]; groups: dict[str, GroupInfo]; voices_by_entity: dict[str, list[VoiceRef]]; entity_ids: list[str]; defaults: dict[str, Any]
      def group_order(self) -> list[GroupInfo]   # parents before children
      def root_of(self, group_id) -> Group
      def voice_key(self, group_id, label) -> str   # f"{group_id}|{label}"
      def all_voice_refs(self) -> list[VoiceRef]
  def resolve_envelope(defaults, presets_by_id, stimulus) -> Envelope
  def build_tree(config: dict[str, Any]) -> Tree   # config is normalized
  ```

- [ ] **Step 1: Failing tests**

`tests/test_tree.py`:
```python
import pytest

from custom_components.activity_levels.engine import Mix, Phase, Retrigger
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.tree import build_tree, resolve_envelope
from tests.fixtures import house_config


def test_build_tree_shapes() -> None:
    tree = build_tree(validate_config(house_config()))
    assert [g.id for g in tree.roots] == ["house"]
    assert [g.id for g in tree.group_order()] == ["house", "living_room", "kitchen"]
    assert tree.groups["living_room"].parent_id == "house"
    assert tree.groups["living_room"].root_id == "house"
    assert tree.groups["house"].group.mix is Mix.MAX
    assert sorted(tree.entity_ids) == [
        "binary_sensor.front_door", "binary_sensor.kitchen_motion",
        "binary_sensor.living_motion", "media_player.tv",
    ]
    tv = tree.voices_by_entity["media_player.tv"][0]
    assert tv.to == frozenset({"playing"}) and tv.group_id == "living_room"
    assert tv.voice.envelope.attack == 10.0 and tv.voice.envelope.sustain == 0.6


def test_envelope_resolution_order() -> None:
    cfg = validate_config(house_config())
    presets = {e["id"]: e for e in cfg["envelopes"]}
    stim = cfg["groups"][0]["children"][1]["stimuli"][0]  # kitchen: release override 5m
    env = resolve_envelope(cfg["defaults"], presets, stim)
    assert env.release == 300.0 and env.attack == 0.0 and env.retrigger is Retrigger.ONLY_IN_RELEASE
    stim2 = dict(stim, retrigger="always", envelope="momentary")
    env2 = resolve_envelope(cfg["defaults"], presets, stim2)
    assert env2.impulse is True and env2.retrigger is Retrigger.ALWAYS and env2.release == 300.0


def test_gains_and_trigger_voice() -> None:
    tree = build_tree(validate_config(house_config()))
    house = tree.groups["house"].group
    kitchen_channel = next(ch for ch in house.channels if ch.label == "kitchen")
    assert kitchen_channel.gain == 0.5
    trig = tree.groups["kitchen"].trigger
    assert trig.envelope.impulse is True
    trig.gain = 2.0
    trig.note_on(0.0)
    assert tree.groups["kitchen"].group.value_at(0.0) == pytest.approx(2.0)
    assert trig.phase is Phase.RELEASE


def test_voice_keys_unique() -> None:
    tree = build_tree(validate_config(house_config()))
    keys = [tree.voice_key(r.group_id, r.label) for r in tree.all_voice_refs()]
    assert len(keys) == len(set(keys))
```

- [ ] **Step 2: Run to verify failure** — ImportError.

- [ ] **Step 3: Implement `tree.py`**

```python
"""Build the engine tree from a normalized configuration."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

from .const import TRIGGER_KEY
from .engine import Channel, Envelope, Group, Mix, NullHandling, Retrigger, Unavailable, Voice

_ENVELOPE_KEYS = ("attack", "decay", "sustain", "release", "impulse", "retrigger", "unavailable", "debounce")


@dataclass(frozen=True)
class GroupInfo:
    id: str
    name: str
    area: str | None
    parent_id: str | None
    root_id: str
    precision: int
    max_value: float
    mix: str
    group: Group
    trigger: Voice


@dataclass(frozen=True)
class VoiceRef:
    entity_id: str
    to: frozenset[str]
    voice: Voice
    group_id: str
    label: str


@dataclass
class Tree:
    roots: list[Group] = field(default_factory=list)
    groups: dict[str, GroupInfo] = field(default_factory=dict)
    voices_by_entity: dict[str, list[VoiceRef]] = field(default_factory=dict)
    entity_ids: list[str] = field(default_factory=list)
    defaults: dict[str, Any] = field(default_factory=dict)
    _order: list[str] = field(default_factory=list)

    def group_order(self) -> list[GroupInfo]:
        return [self.groups[gid] for gid in self._order]

    def root_of(self, group_id: str) -> Group:
        return self.groups[self.groups[group_id].root_id].group

    @staticmethod
    def voice_key(group_id: str, label: str) -> str:
        return f"{group_id}|{label}"

    def all_voice_refs(self) -> list[VoiceRef]:
        return [ref for refs in self.voices_by_entity.values() for ref in refs]


def resolve_envelope(
    defaults: Mapping[str, Any], presets: Mapping[str, Mapping[str, Any]], stimulus: Mapping[str, Any]
) -> Envelope:
    preset = presets[stimulus.get("envelope") or defaults["envelope"]]
    resolved: dict[str, Any] = {}
    for key in _ENVELOPE_KEYS:
        value = stimulus.get(key)
        if value is None:
            value = preset.get(key)
        if value is None:
            value = defaults.get(key)
        if value is not None:
            resolved[key] = value
    if "retrigger" in resolved:
        resolved["retrigger"] = Retrigger(resolved["retrigger"])
    if "unavailable" in resolved:
        resolved["unavailable"] = Unavailable(resolved["unavailable"])
    return Envelope(**resolved)


def _trigger_voice(defaults: Mapping[str, Any], presets: Mapping[str, Mapping[str, Any]]) -> Voice:
    base = resolve_envelope(defaults, presets, {})
    return Voice(id=TRIGGER_KEY, gain=1.0, envelope=Envelope(release=base.release, impulse=True))


def build_tree(config: dict[str, Any]) -> Tree:
    defaults = config["defaults"]
    presets = {e["id"]: e for e in config["envelopes"]}
    tree = Tree(defaults=dict(defaults))

    def build(node: dict[str, Any], parent_id: str | None, root_id: str | None) -> Group:
        gid = node["id"]
        rid = root_id or gid
        channels: list[Channel] = []
        for stim in node["stimuli"]:
            voice = Voice(id=stim["entity"], gain=stim["gain"], envelope=resolve_envelope(defaults, presets, stim))
            channel = Channel(voice, key=stim["key"])
            channels.append(channel)
            ref = VoiceRef(stim["entity"], frozenset(stim["to"]), voice, gid, channel.label)
            tree.voices_by_entity.setdefault(stim["entity"], []).append(ref)
        for child in node["children"]:
            channels.append(Channel(build(child, gid, rid), gain=child["gain"]))
        trigger = _trigger_voice(defaults, presets)
        channels.append(Channel(trigger, key=TRIGGER_KEY))
        group = Group(
            id=gid,
            channels=channels,
            mix=Mix(node["mix"]),
            null_handling=NullHandling(node["null_handling"]),
            max_value=node["max_value"] if node["max_value"] is not None else defaults["max_value"],
            precision=node["precision"] if node["precision"] is not None else defaults["precision"],
        )
        tree.groups[gid] = GroupInfo(
            id=gid, name=node["name"], area=node["area"], parent_id=parent_id, root_id=rid,
            precision=group.precision, max_value=group.max_value, mix=node["mix"], group=group, trigger=trigger,
        )
        tree._order.append(gid)  # noqa: SLF001 - builder owns the tree
        return group

    for node in config["groups"]:
        tree.roots.append(build(node, None, None))
    tree.entity_ids = sorted(tree.voices_by_entity)
    # group_order must be parents-first; build() appends after recursing, so reverse into pre-order
    ordered: list[str] = []

    def preorder(g: Group) -> None:
        ordered.append(g.id)
        for ch in g.channels:
            if isinstance(ch.source, Group):
                preorder(ch.source)

    for root in tree.roots:
        preorder(root)
    tree._order = ordered  # noqa: SLF001
    return tree
```

- [ ] **Step 4: Verify and commit**

```bash
uv run pytest tests/test_tree.py && uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "feat: build engine tree from config"
```

---

### Task 5: Coordinator

**Files:**
- Create: `custom_components/activity_levels/coordinator.py`
- Test: `tests/test_coordinator.py`

**Interfaces:**
- Produces:
  ```python
  @dataclass(frozen=True) class GroupState: value: float; active: bool; gated: bool; active_voices: int; last_activity: float | None; cooldown_at: float | None; contributors: dict[str, float]
  class ActivityLevelsCoordinator:
      def __init__(self, hass: HomeAssistant, entry_id: str, tree: Tree) -> None
      tree: Tree; entry_id: str; data: dict[str, GroupState]
      async def async_start(self) -> None      # load store, restore + reconcile, subscribe, publish, schedule
      async def async_stop(self) -> None       # cancel timers/listeners, save store
      def async_add_listener(self, group_id: str, cb: Callable[[], None]) -> Callable[[], None]
      def trigger(self, group_id: str, peak: float = 1.0) -> None
      def reset(self, group_id: str | None = None) -> None
      def snapshot(self) -> dict[str, Any]     # {"voices": {key: voice.snapshot()}}
      def voice_states(self) -> dict[str, list[dict[str, Any]]]   # per group: [{label, entity, phase, value, gain, phase_started, phase_ends}]
      def now(self) -> float
  ```

- [ ] **Step 1: Failing tests**

`tests/test_coordinator.py`:
```python
from datetime import timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.activity_levels.coordinator import ActivityLevelsCoordinator
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.tree import build_tree
from tests.fixtures import house_config


@pytest.fixture
async def coordinator(hass: HomeAssistant) -> ActivityLevelsCoordinator:
    hass.states.async_set("binary_sensor.front_door", "off")
    hass.states.async_set("binary_sensor.living_motion", "off")
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    hass.states.async_set("media_player.tv", "idle")
    coord = ActivityLevelsCoordinator(hass, "entry1", build_tree(validate_config(house_config())))
    await coord.async_start()
    return coord


async def advance(hass: HomeAssistant, freezer: FrozenDateTimeFactory, seconds: float) -> None:
    freezer.tick(timedelta(seconds=seconds))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def test_note_on_propagates_up_the_tree(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    assert coordinator.data["house"].value == 0.0
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    assert coordinator.data["living_room"].value == pytest.approx(2.0)
    assert coordinator.data["house"].value == pytest.approx(2.0)  # max mix
    assert coordinator.data["living_room"].gated is True
    assert coordinator.data["living_room"].contributors["binary_sensor.living_motion"] == 2.0


async def test_note_off_then_decay_with_timer(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    await hass.async_block_till_done()
    k = coordinator.data["kitchen"]
    assert k.gated is False and k.cooldown_at is not None
    assert k.cooldown_at == pytest.approx(coordinator.now() + 300.0, abs=1.0)
    await advance(hass, freezer, 150.0)
    assert coordinator.data["kitchen"].value == pytest.approx(0.5, abs=0.06)
    await advance(hass, freezer, 200.0)
    assert coordinator.data["kitchen"].value == 0.0
    assert coordinator.data["kitchen"].active is False


async def test_listener_called_only_on_change(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    calls: list[int] = []
    coordinator.async_add_listener("house", lambda: calls.append(1))
    await advance(hass, freezer, 600.0)
    assert calls == []
    hass.states.async_set("binary_sensor.front_door", "on")
    await hass.async_block_till_done()
    assert len(calls) == 1


async def test_unavailable_hold_and_recovery(
    hass: HomeAssistant, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("media_player.tv", "playing")
    await hass.async_block_till_done()
    assert coordinator.data["living_room"].gated is True
    hass.states.async_set("media_player.tv", "unavailable")
    await hass.async_block_till_done()
    assert coordinator.data["living_room"].gated is True
    hass.states.async_set("media_player.tv", "idle")
    await hass.async_block_till_done()
    assert coordinator.data["living_room"].gated is False


async def test_attribute_only_change_does_not_retrigger_impulse(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.front_door", "on")
    await hass.async_block_till_done()
    await advance(hass, freezer, 300.0)
    before = coordinator.data["house"].value
    hass.states.async_set("binary_sensor.front_door", "on", {"battery": 50})
    await hass.async_block_till_done()
    assert coordinator.data["house"].value == pytest.approx(before, abs=0.01)


async def test_trigger_and_reset(hass: HomeAssistant, coordinator: ActivityLevelsCoordinator) -> None:
    coordinator.trigger("kitchen", peak=3.0)
    assert coordinator.data["kitchen"].value == pytest.approx(3.0)
    assert coordinator.data["kitchen"].contributors["trigger"] == 3.0
    coordinator.reset("kitchen")
    assert coordinator.data["kitchen"].value == 0.0


async def test_snapshot_persists_and_restores(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    await hass.async_block_till_done()
    await coordinator.async_stop()
    assert "activity_levels.entry1" in hass_storage
    await advance(hass, freezer, 100.0)
    coord2 = ActivityLevelsCoordinator(hass, "entry1", build_tree(validate_config(house_config())))
    await coord2.async_start()
    assert coord2.data["kitchen"].value == pytest.approx(2.0 / 3.0, abs=0.05)
    await coord2.async_stop()


async def test_restore_reconciles_with_current_state(
    hass: HomeAssistant, hass_storage: dict, coordinator: ActivityLevelsCoordinator
) -> None:
    await coordinator.async_stop()
    hass.states.async_set("media_player.tv", "playing")  # held while we were down
    coord2 = ActivityLevelsCoordinator(hass, "entry1", build_tree(validate_config(house_config())))
    await coord2.async_start()
    assert coord2.data["living_room"].gated is True
    await coord2.async_stop()


async def test_timer_delay_is_floored(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, coordinator: ActivityLevelsCoordinator
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.living_motion", "off")
    await hass.async_block_till_done()
    assert coordinator.next_wake("house") is not None
    assert coordinator.next_wake("house") - coordinator.now() >= 1.0
```

- [ ] **Step 2: Run to verify failure** — ImportError.

- [ ] **Step 3: Implement `coordinator.py`**

```python
"""Coordinator: drives the engine tree from HA state events and timers."""

from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import asdict, dataclass
from datetime import datetime
from functools import partial
from math import inf
from typing import Any

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import STORAGE_VERSION, storage_key
from .engine import Group, Phase
from .tree import Tree, VoiceRef

_LOGGER = logging.getLogger(__name__)
_SAVE_DELAY = 10.0


@dataclass(frozen=True)
class GroupState:
    value: float
    active: bool
    gated: bool
    active_voices: int
    last_activity: float | None
    cooldown_at: float | None
    contributors: dict[str, float]


class ActivityLevelsCoordinator:
    """Owns the engine tree for one config entry."""

    def __init__(self, hass: HomeAssistant, entry_id: str, tree: Tree) -> None:
        self.hass = hass
        self.entry_id = entry_id
        self.tree = tree
        self.data: dict[str, GroupState] = {}
        self._listeners: dict[str, list[Callable[[], None]]] = {}
        self._timers: dict[str, CALLBACK_TYPE] = {}
        self._wakes: dict[str, float] = {}
        self._unsub_state: CALLBACK_TYPE | None = None
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, storage_key(entry_id))
        self._min_wake = float(tree.defaults["min_wake_interval"])
        self._safety = float(tree.defaults["safety_refresh"])

    # -- time ----------------------------------------------------------------

    def now(self) -> float:
        return dt_util.utcnow().timestamp()

    def next_wake(self, root_id: str) -> float | None:
        return self._wakes.get(root_id)

    # -- lifecycle -----------------------------------------------------------

    async def async_start(self) -> None:
        stored = await self._store.async_load()
        t = self.now()
        if stored:
            self._restore(stored.get("voices", {}))
        self._reconcile(t)
        if self.tree.entity_ids:
            self._unsub_state = async_track_state_change_event(
                self.hass, self.tree.entity_ids, self._handle_state_event
            )
        for root in self.tree.roots:
            self._publish(root, t)
            self._schedule(root, t)

    async def async_stop(self) -> None:
        if self._unsub_state:
            self._unsub_state()
            self._unsub_state = None
        for cancel in self._timers.values():
            cancel()
        self._timers.clear()
        self._wakes.clear()
        await self._store.async_save(self.snapshot())

    # -- listeners -----------------------------------------------------------

    @callback
    def async_add_listener(self, group_id: str, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.setdefault(group_id, []).append(cb)

        def remove() -> None:
            self._listeners[group_id].remove(cb)

        return remove

    # -- events --------------------------------------------------------------

    @callback
    def _handle_state_event(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        new = event.data["new_state"]
        old = event.data["old_state"]
        t = self.now()
        touched: set[str] = set()
        for ref in self.tree.voices_by_entity.get(entity_id, []):
            if self._apply_transition(ref, old.state if old else None, new.state if new else None, t):
                touched.add(self.tree.groups[ref.group_id].root_id)
        self._after_change(touched, t)

    @staticmethod
    def _apply_transition(ref: VoiceRef, old_state: str | None, new_state: str | None, t: float) -> bool:
        voice = ref.voice
        if new_state is None or new_state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            voice.unavailable(t)
            return True
        new_in = new_state in ref.to
        old_in = old_state is not None and old_state in ref.to
        if new_in and not old_in:
            return voice.note_on(t)
        if not new_in and (old_in or voice.gate):
            voice.note_off(t)
            return True
        return False

    def _after_change(self, root_ids: set[str], t: float) -> None:
        for rid in root_ids:
            root = self.tree.groups[rid].group
            self._publish(root, t)
            self._schedule(root, t)
        if root_ids:
            self._store.async_delay_save(self.snapshot, _SAVE_DELAY)

    # -- commands ------------------------------------------------------------

    def trigger(self, group_id: str, peak: float = 1.0) -> None:
        info = self.tree.groups[group_id]
        t = self.now()
        info.trigger.gain = max(peak, 1e-9)
        info.trigger.note_on(t)
        self._after_change({info.root_id}, t)

    def reset(self, group_id: str | None = None) -> None:
        t = self.now()
        if group_id is None:
            for root in self.tree.roots:
                root.reset()
            roots = {g.id for g in self.tree.roots}
        else:
            info = self.tree.groups[group_id]
            info.group.reset()
            roots = {info.root_id}
        self._after_change(roots, t)

    # -- publish / schedule --------------------------------------------------

    def _state_of(self, group: Group, t: float) -> GroupState:
        info = self.tree.groups[group.id]
        return GroupState(
            value=group.display_value_at(t),
            active=group.active_at(t),
            gated=group.gated_at(t),
            active_voices=group.active_voices(t),
            last_activity=group.last_activity(),
            cooldown_at=group.cooldown_at(t),
            contributors={
                label: round(v, info.precision) for label, v in group.contributions_at(t).items() if v > 0.0
            },
        )

    def _publish(self, root: Group, t: float) -> None:
        for group in root.groups():
            state = self._state_of(group, t)
            if self.data.get(group.id) != state:
                self.data[group.id] = state
                for cb in list(self._listeners.get(group.id, [])):
                    cb()

    def _schedule(self, root: Group, t: float) -> None:
        if cancel := self._timers.pop(root.id, None):
            cancel()
        nxt = root.next_display_change(t)
        wake = min(nxt if nxt is not None else inf, t + self._safety)
        delay = max(wake - t, self._min_wake)
        self._wakes[root.id] = t + delay
        self._timers[root.id] = async_call_later(self.hass, delay, partial(self._on_timer, root.id))

    @callback
    def _on_timer(self, root_id: str, _now: datetime) -> None:
        self._timers.pop(root_id, None)
        t = self.now()
        root = self.tree.groups[root_id].group
        self._publish(root, t)
        self._schedule(root, t)

    # -- persistence ---------------------------------------------------------

    def snapshot(self) -> dict[str, Any]:
        voices = {self.tree.voice_key(r.group_id, r.label): r.voice.snapshot() for r in self.tree.all_voice_refs()}
        for info in self.tree.groups.values():
            voices[self.tree.voice_key(info.id, info.trigger.id)] = info.trigger.snapshot()
        return {"voices": voices}

    def _restore(self, voices: dict[str, Any]) -> None:
        for ref in self.tree.all_voice_refs():
            if data := voices.get(self.tree.voice_key(ref.group_id, ref.label)):
                ref.voice.restore(data)
        for info in self.tree.groups.values():
            if data := voices.get(self.tree.voice_key(info.id, info.trigger.id)):
                info.trigger.restore(data)

    def _reconcile(self, t: float) -> None:
        for ref in self.tree.all_voice_refs():
            state = self.hass.states.get(ref.entity_id)
            current = state.state if state else None
            if current is None or current in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                continue
            in_to = current in ref.to
            if in_to and not ref.voice.gate and not ref.voice.envelope.impulse:
                ref.voice.note_on(t)
            elif not in_to and ref.voice.gate:
                ref.voice.note_off(t)

    # -- introspection for the websocket API --------------------------------

    def voice_states(self) -> dict[str, list[dict[str, Any]]]:
        t = self.now()
        out: dict[str, list[dict[str, Any]]] = {gid: [] for gid in self.tree.groups}
        for ref in self.tree.all_voice_refs():
            v = ref.voice
            out[ref.group_id].append(
                {
                    "label": ref.label,
                    "entity": ref.entity_id,
                    "phase": v.phase.value if v.is_active(t) or v.phase is Phase.IDLE else v.phase.value,
                    "value": v.value_at(t),
                    "gain": v.gain,
                    "gate": v.gate,
                    "phase_started": v.phase_start_t if v.phase is not Phase.IDLE else None,
                    "phase_ends": v.next_boundary(t),
                }
            )
        return out


def group_state_dict(state: GroupState) -> dict[str, Any]:
    return asdict(state)
```

Simplify the `"phase"` line to `v.phase.value` (evaluate `v.is_active(t)` first so the phase is advanced). Keep `_SAVE_DELAY` as a module constant.

- [ ] **Step 4: Verify and commit**

```bash
uv run pytest tests/test_coordinator.py && uv run pytest && uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "feat: coordinator with state listener, timers, persistence"
```

If `async_fire_time_changed` does not fire the `async_call_later` timer under the `freezer`, call `async_fire_time_changed(hass, dt_util.utcnow())` explicitly after `freezer.tick(...)`.

---

### Task 6: Integration setup, config flow, devices, services

**Files:**
- Modify: `custom_components/activity_levels/__init__.py`
- Create: `config_flow.py`, `services.yaml`, `strings.json`, `translations/en.json`
- Test: `tests/test_init.py` (replace smoke test)

**Interfaces:**
- Produces: `type ActivityLevelsConfigEntry = ConfigEntry[ActivityLevelsCoordinator]`; `async_setup_entry`, `async_unload_entry`; services `activity_levels.trigger` (`group_id`, optional `peak`) and `activity_levels.reset` (optional `group_id`); devices for every group.

- [ ] **Step 1: Failing tests**

Replace `tests/test_init.py`:
```python
import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    for e in ("binary_sensor.front_door", "binary_sensor.living_motion", "binary_sensor.kitchen_motion"):
        hass.states.async_set(e, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()), title="Activity Levels")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_setup_creates_devices_and_entities(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert entry.state is ConfigEntryState.LOADED
    dev = dr.async_get(hass)
    house = dev.async_get_device(identifiers={(DOMAIN, "house")})
    lr = dev.async_get_device(identifiers={(DOMAIN, "living_room")})
    assert house and lr
    assert lr.via_device_id == house.id
    assert lr.suggested_area == "living_room" or lr.area_id is not None
    ent = er.async_get(hass)
    assert ent.async_get("sensor.living_room_activity_level") is not None
    assert ent.async_get("binary_sensor.living_room_active") is not None
    assert ent.async_get("button.living_room_trigger") is not None
    assert hass.states.get("sensor.house_activity_level").state == "0.0"


async def test_config_flow_creates_single_entry(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] == "form"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] == "create_entry"
    assert result["options"]["envelopes"][0]["id"] == "default"
    result2 = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result2["type"] == "abort"


async def test_options_update_reloads(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    cfg = validate_config(house_config())
    cfg["groups"][0]["children"][1]["name"] = "Pantry"
    hass.config_entries.async_update_entry(entry, options=cfg)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED
    dev = dr.async_get(hass)
    assert dev.async_get_device(identifiers={(DOMAIN, "kitchen")}).name == "Pantry"


async def test_services(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await hass.services.async_call(DOMAIN, "trigger", {"group_id": "kitchen", "peak": 2.5}, blocking=True)
    assert hass.states.get("sensor.kitchen_activity_level").state == "2.5"
    await hass.services.async_call(DOMAIN, "reset", {}, blocking=True)
    assert hass.states.get("sensor.kitchen_activity_level").state == "0.0"


async def test_unload(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED
    assert hass.states.get("sensor.house_activity_level").state == "unavailable"


async def test_invalid_options_fail_setup(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"version": 1, "groups": [{"id": "x"}]})
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.SETUP_ERROR
```

- [ ] **Step 2: Run to verify failure** — setup fails (no `async_setup_entry`).

- [ ] **Step 3: Implement `__init__.py`**

```python
"""Activity Levels integration."""

from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr

from .const import (
    ATTR_GROUP_ID,
    ATTR_PEAK,
    DOMAIN,
    MANUFACTURER,
    MODEL,
    PLATFORMS,
    SERVICE_RESET,
    SERVICE_TRIGGER,
)
from .coordinator import ActivityLevelsCoordinator
from .schema import ConfigError, validate_config
from .tree import build_tree

_LOGGER = logging.getLogger(__name__)

type ActivityLevelsConfigEntry = ConfigEntry[ActivityLevelsCoordinator]

SERVICE_TRIGGER_SCHEMA = vol.Schema(
    {vol.Required(ATTR_GROUP_ID): cv.string, vol.Optional(ATTR_PEAK, default=1.0): vol.Coerce(float)}
)
SERVICE_RESET_SCHEMA = vol.Schema({vol.Optional(ATTR_GROUP_ID): cv.string})


async def async_setup_entry(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> bool:
    try:
        config = validate_config(entry.options)
    except ConfigError as err:
        raise ConfigEntryError(f"Invalid Activity Levels configuration: {err}") from err
    tree = build_tree(config)
    _create_devices(hass, entry, tree)
    coordinator = ActivityLevelsCoordinator(hass, entry.entry_id, tree)
    await coordinator.async_start()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    _register_services(hass)
    from .websocket_api import async_register_websocket  # noqa: PLC0415 - avoid import cycle at module load

    async_register_websocket(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> bool:
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    await entry.runtime_data.async_stop()
    return ok


async def _async_update_listener(hass: HomeAssistant, entry: ActivityLevelsConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


def _create_devices(hass: HomeAssistant, entry: ConfigEntry, tree: object) -> None:
    from .tree import Tree  # noqa: PLC0415

    assert isinstance(tree, Tree)
    registry = dr.async_get(hass)
    for info in tree.group_order():
        registry.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={(DOMAIN, info.id)},
            name=info.name,
            manufacturer=MANUFACTURER,
            model=MODEL,
            suggested_area=info.area,
            via_device=(DOMAIN, info.parent_id) if info.parent_id else None,
        )
    wanted = {(DOMAIN, gid) for gid in tree.groups}
    for device in dr.async_entries_for_config_entry(registry, entry.entry_id):
        if not device.identifiers & wanted:
            registry.async_update_device(device.id, remove_config_entry_id=entry.entry_id)


def _coordinator(hass: HomeAssistant) -> ActivityLevelsCoordinator:
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        return entry.runtime_data  # type: ignore[no-any-return]
    raise vol.Invalid("Activity Levels is not loaded")


def _register_services(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, SERVICE_TRIGGER):
        return

    @callback
    def handle_trigger(call: ServiceCall) -> None:
        _coordinator(hass).trigger(call.data[ATTR_GROUP_ID], call.data[ATTR_PEAK])

    @callback
    def handle_reset(call: ServiceCall) -> None:
        _coordinator(hass).reset(call.data.get(ATTR_GROUP_ID))

    hass.services.async_register(DOMAIN, SERVICE_TRIGGER, handle_trigger, schema=SERVICE_TRIGGER_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_RESET, handle_reset, schema=SERVICE_RESET_SCHEMA)
```

Type `_create_devices(hass, entry, tree: Tree)` directly (import `Tree` at top; there is no cycle) and drop the local import/assert. Unknown `group_id` in a service call should raise `ServiceValidationError(f"Unknown group '{gid}'")` — add a check in both handlers using `gid in coordinator.tree.groups`. `websocket_api.async_register_websocket` is created in Task 8; until then, guard with a try/except ImportError? No — create a stub `websocket_api.py` in this task with `def async_register_websocket(hass: HomeAssistant) -> None: return None`, replaced in Task 8.

- [ ] **Step 4: `config_flow.py`**

```python
"""Config flow: one click, everything else lives in options."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN
from .schema import default_options


class ActivityLevelsConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is None:
            return self.async_show_form(step_id="user", data_schema=vol.Schema({}))
        return self.async_create_entry(title="Activity Levels", data={}, options=default_options())
```

- [ ] **Step 5: `services.yaml`, `strings.json`, `translations/en.json`**

`services.yaml`:
```yaml
trigger:
  fields:
    group_id:
      required: true
      example: living_room
      selector:
        text:
    peak:
      required: false
      default: 1.0
      selector:
        number:
          min: 0.1
          max: 10
          step: 0.1
reset:
  fields:
    group_id:
      required: false
      example: living_room
      selector:
        text:
```
`strings.json` (copy verbatim to `translations/en.json`):
```json
{
  "config": {
    "step": {
      "user": {
        "title": "Activity Levels",
        "description": "Create the Activity Levels integration. Groups, envelopes and stimuli are configured afterwards in the Activity Levels sidebar panel."
      }
    },
    "abort": { "single_instance_allowed": "Activity Levels is already configured." }
  },
  "entity": {
    "sensor": {
      "activity_level": { "name": "Activity level" },
      "last_activity": { "name": "Last activity" },
      "cooldown_at": { "name": "Cooldown at" }
    },
    "binary_sensor": { "active": { "name": "Active" } },
    "button": { "trigger": { "name": "Trigger" } }
  },
  "services": {
    "trigger": {
      "name": "Trigger",
      "description": "Fire a synthetic impulse on a group, as if a stimulus had activated.",
      "fields": {
        "group_id": { "name": "Group", "description": "The group id to trigger." },
        "peak": { "name": "Peak", "description": "Peak level of the impulse." }
      }
    },
    "reset": {
      "name": "Reset",
      "description": "Return all voices in a group (or all groups) to idle.",
      "fields": { "group_id": { "name": "Group", "description": "Group id; omit to reset every group." } }
    }
  }
}
```

- [ ] **Step 6: Verify and commit**

The entity assertions in `test_setup_creates_devices_and_entities` need Task 7's platforms; until then, expect that one test to fail on entity checks. Run: `uv run pytest tests/test_init.py -k "not entities"` plus the full suite for regressions. Commit:
```bash
uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "feat: config entry setup, devices, config flow, services"
```

---

### Task 7: Entities

**Files:**
- Create: `custom_components/activity_levels/entity.py`, `sensor.py`, `binary_sensor.py`, `button.py`
- Test: `tests/test_entities.py`; make `tests/test_init.py::test_setup_creates_devices_and_entities` pass

- [ ] **Step 1: Failing tests**

`tests/test_entities.py`:
```python
from datetime import timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    for e in ("binary_sensor.front_door", "binary_sensor.living_motion", "binary_sensor.kitchen_motion"):
        hass.states.async_set(e, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def advance(hass: HomeAssistant, freezer: FrozenDateTimeFactory, seconds: float) -> None:
    freezer.tick(timedelta(seconds=seconds))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def test_level_sensor_and_attributes(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    s = hass.states.get("sensor.living_room_activity_level")
    assert s.state == "2.0"
    assert s.attributes["mix"] == "sum" and s.attributes["max_value"] == 5.0
    assert s.attributes["gated"] is True and s.attributes["active_voices"] == 1
    assert s.attributes["contributors"] == {"binary_sensor.living_motion": 2.0}
    assert s.attributes["cooldown_at"] is None
    assert hass.states.get("binary_sensor.living_room_active").state == "on"
    assert hass.states.get("sensor.living_room_last_activity").state != "unknown"
    assert hass.states.get("sensor.house_activity_level").state == "2.0"


async def test_decay_updates_and_timestamps(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    hass.states.async_set("binary_sensor.kitchen_motion", "on")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    await hass.async_block_till_done()
    cooldown = hass.states.get("sensor.kitchen_cooldown_at").state
    assert cooldown not in ("unknown", "unavailable")
    await advance(hass, freezer, 150.0)
    assert float(hass.states.get("sensor.kitchen_activity_level").state) == pytest.approx(0.5, abs=0.1)
    await advance(hass, freezer, 200.0)
    assert hass.states.get("sensor.kitchen_activity_level").state == "0.0"
    assert hass.states.get("binary_sensor.kitchen_active").state == "off"
    assert hass.states.get("sensor.kitchen_cooldown_at").state == "unknown"


async def test_idle_groups_do_not_write_state(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    events: list[Event] = []

    def track(event: Event) -> None:
        if str(event.data.get("entity_id", "")).endswith("_activity_level"):
            events.append(event)

    hass.bus.async_listen(EVENT_STATE_CHANGED, track)
    for _ in range(5):
        await advance(hass, freezer, 120.0)
    assert events == []


async def test_diagnostic_entities_and_button(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    ent = er.async_get(hass)
    assert ent.async_get("sensor.kitchen_last_activity").entity_category == "diagnostic"
    assert ent.async_get("button.kitchen_trigger").entity_category == "diagnostic"
    await hass.services.async_call("button", "press", {"entity_id": "button.kitchen_trigger"}, blocking=True)
    assert hass.states.get("sensor.kitchen_activity_level").state == "1.0"
```

- [ ] **Step 2: Run to verify failure** — platforms missing.

- [ ] **Step 3: Implement `entity.py`**

```python
"""Base entity: a view over one group's coordinator state."""

from __future__ import annotations

from homeassistant.const import Platform
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .coordinator import ActivityLevelsCoordinator, GroupState
from .tree import GroupInfo


class ActivityLevelsEntity(Entity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self, coordinator: ActivityLevelsCoordinator, info: GroupInfo, suffix: str, platform: Platform
    ) -> None:
        self.coordinator = coordinator
        self.info = info
        self._attr_unique_id = f"{coordinator.entry_id}-{info.id}-{suffix}"
        self.entity_id = f"{platform}.{info.id}_{suffix}"
        self._attr_translation_key = suffix
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, info.id)})

    @property
    def group_state(self) -> GroupState:
        return self.coordinator.data[self.info.id]

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.coordinator.async_add_listener(self.info.id, self.async_write_ha_state))
```

- [ ] **Step 4: `sensor.py`**

```python
"""Sensors: activity level, last activity, cooldown at."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import EntityCategory, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from . import ActivityLevelsConfigEntry
from .const import ATTR_ACTIVE_VOICES, ATTR_CONTRIBUTORS, ATTR_COOLDOWN_AT, ATTR_GATED, ATTR_MAX_VALUE, ATTR_MIX
from .entity import ActivityLevelsEntity


def _ts(value: float | None) -> datetime | None:
    return None if value is None else dt_util.utc_from_timestamp(value)


async def async_setup_entry(
    hass: HomeAssistant, entry: ActivityLevelsConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    entities: list[SensorEntity] = []
    for info in coordinator.tree.group_order():
        entities.append(ActivityLevelSensor(coordinator, info))
        entities.append(LastActivitySensor(coordinator, info))
        entities.append(CooldownAtSensor(coordinator, info))
    async_add_entities(entities)


class ActivityLevelSensor(ActivityLevelsEntity, SensorEntity):
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, coordinator: Any, info: Any) -> None:
        super().__init__(coordinator, info, "activity_level", Platform.SENSOR)
        self._attr_suggested_display_precision = info.precision

    @property
    def native_value(self) -> float:
        return self.group_state.value

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        s = self.group_state
        return {
            ATTR_MIX: self.info.mix,
            ATTR_MAX_VALUE: self.info.max_value,
            ATTR_GATED: s.gated,
            ATTR_ACTIVE_VOICES: s.active_voices,
            ATTR_COOLDOWN_AT: _ts(s.cooldown_at),
            ATTR_CONTRIBUTORS: s.contributors,
        }


class LastActivitySensor(ActivityLevelsEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: Any, info: Any) -> None:
        super().__init__(coordinator, info, "last_activity", Platform.SENSOR)

    @property
    def native_value(self) -> datetime | None:
        return _ts(self.group_state.last_activity)


class CooldownAtSensor(ActivityLevelsEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: Any, info: Any) -> None:
        super().__init__(coordinator, info, "cooldown_at", Platform.SENSOR)

    @property
    def native_value(self) -> datetime | None:
        return _ts(self.group_state.cooldown_at)
```
Type the constructors with `ActivityLevelsCoordinator` and `GroupInfo` instead of `Any` (import them). `ATTR_COOLDOWN_AT` must be a plain ISO string or `None` in attributes: use `_ts(...).isoformat()` when not `None`.

- [ ] **Step 5: `binary_sensor.py` and `button.py`**

```python
"""Binary sensor: group is active (level > 0)."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import ActivityLevelsConfigEntry
from .coordinator import ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity
from .tree import GroupInfo


async def async_setup_entry(
    hass: HomeAssistant, entry: ActivityLevelsConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(ActiveBinarySensor(coordinator, info) for info in coordinator.tree.group_order())


class ActiveBinarySensor(ActivityLevelsEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.OCCUPANCY

    def __init__(self, coordinator: ActivityLevelsCoordinator, info: GroupInfo) -> None:
        super().__init__(coordinator, info, "active", Platform.BINARY_SENSOR)

    @property
    def is_on(self) -> bool:
        return self.group_state.active
```

```python
"""Button: fire a synthetic impulse on a group."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.const import EntityCategory, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import ActivityLevelsConfigEntry
from .coordinator import ActivityLevelsCoordinator
from .entity import ActivityLevelsEntity
from .tree import GroupInfo


async def async_setup_entry(
    hass: HomeAssistant, entry: ActivityLevelsConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(TriggerButton(coordinator, info) for info in coordinator.tree.group_order())


class TriggerButton(ActivityLevelsEntity, ButtonEntity):
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: ActivityLevelsCoordinator, info: GroupInfo) -> None:
        super().__init__(coordinator, info, "trigger", Platform.BUTTON)

    async def async_press(self) -> None:
        self.coordinator.trigger(self.info.id, 1.0)
```

Importing `ActivityLevelsConfigEntry` from the package `__init__` creates a cycle at platform import time; instead define the alias in `coordinator.py` (`type ActivityLevelsConfigEntry = ConfigEntry[ActivityLevelsCoordinator]`) and import it from there in `__init__.py` and the platforms.

- [ ] **Step 6: Verify and commit**

```bash
uv run pytest && uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "feat: sensor, binary_sensor and button entities per group"
```
If `sensor.house_activity_level` reads `"2"` instead of `"2.0"`, HA does not format floats — assert with `float(state.state) == pytest.approx(2.0)` instead and adjust the tests in Tasks 6–7 accordingly (the display precision is a frontend hint).

---

### Task 8: Websocket API and diagnostics

**Files:**
- Modify: `custom_components/activity_levels/websocket_api.py` (replace stub)
- Create: `diagnostics.py`
- Test: `tests/test_websocket.py`

**Interfaces:**
- Produces websocket commands: `activity_levels/config/get` → `{"config": ...}`; `activity_levels/config/validate` `{config}` → `{"ok": bool, "errors": [...]}`; `activity_levels/config/save` `{config}` → `{"ok": true}` or error `invalid_config` with `errors`; `activity_levels/state` → `{"groups": {gid: GroupState dict + name/parent_id}, "voices": {gid: [...]}}`. All admin-only. `async_get_config_entry_diagnostics`.

- [ ] **Step 1: Failing tests**

`tests/test_websocket.py`:
```python
import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.diagnostics import async_get_config_entry_diagnostics
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    for e in ("binary_sensor.front_door", "binary_sensor.living_motion", "binary_sensor.kitchen_motion"):
        hass.states.async_set(e, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_config_get_validate_save(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/config/get"})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["config"]["groups"][0]["id"] == "house"

    bad = dict(msg["result"]["config"])
    bad["groups"][0]["id"] = "Bad Id"
    await client.send_json_auto_id({"type": "activity_levels/config/validate", "config": bad})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["ok"] is False
    assert msg["result"]["errors"][0]["path"] == "groups/0/id"

    good = validate_config(house_config())
    good["groups"][0]["children"][1]["name"] = "Pantry"
    await client.send_json_auto_id({"type": "activity_levels/config/save", "config": good})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["ok"] is True
    await hass.async_block_till_done()
    assert entry.options["groups"][0]["children"][1]["name"] == "Pantry"

    await client.send_json_auto_id({"type": "activity_levels/config/save", "config": bad})
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "invalid_config"


async def test_state_command(hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/state"})
    msg = await client.receive_json()
    groups = msg["result"]["groups"]
    assert groups["living_room"]["value"] == 2.0 and groups["living_room"]["parent_id"] == "house"
    voices = msg["result"]["voices"]["living_room"]
    motion = next(v for v in voices if v["entity"] == "binary_sensor.living_motion")
    assert motion["phase"] == "sustain" and motion["gate"] is True


async def test_diagnostics(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["config"]["groups"][0]["id"] == "house"
    assert "voices" in diag["snapshot"]
    assert "house" in diag["groups"]
```

- [ ] **Step 2: Run to verify failure** — commands unknown / ImportError.

- [ ] **Step 3: Implement `websocket_api.py`**

```python
"""Websocket commands used by the sidebar panel."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .coordinator import ActivityLevelsCoordinator
from .schema import ConfigError, validate_config

_REGISTERED = f"{DOMAIN}_websocket_registered"


def _coordinator(hass: HomeAssistant) -> ActivityLevelsCoordinator | None:
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        return entry.runtime_data  # type: ignore[no-any-return]
    return None


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    if hass.data.get(_REGISTERED):
        return
    hass.data[_REGISTERED] = True
    websocket_api.async_register_command(hass, ws_config_get)
    websocket_api.async_register_command(hass, ws_config_validate)
    websocket_api.async_register_command(hass, ws_config_save)
    websocket_api.async_register_command(hass, ws_state)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config/get"})
@websocket_api.require_admin
@callback
def ws_config_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "not_found", "Activity Levels is not configured")
        return
    connection.send_result(msg["id"], {"config": entries[0].options})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/config/validate", vol.Required("config"): dict}
)
@websocket_api.require_admin
@callback
def ws_config_validate(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    try:
        validate_config(msg["config"])
    except ConfigError as err:
        connection.send_result(msg["id"], {"ok": False, "errors": err.errors})
        return
    connection.send_result(msg["id"], {"ok": True, "errors": []})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config/save", vol.Required("config"): dict})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_config_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "not_found", "Activity Levels is not configured")
        return
    try:
        config = validate_config(msg["config"])
    except ConfigError as err:
        connection.send_error(msg["id"], "invalid_config", str(err))
        return
    hass.config_entries.async_update_entry(entries[0], options=config)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/state"})
@websocket_api.require_admin
@callback
def ws_state(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    coordinator = _coordinator(hass)
    if coordinator is None:
        connection.send_error(msg["id"], "not_loaded", "Activity Levels is not loaded")
        return
    groups = {
        gid: {**asdict(state), "name": coordinator.tree.groups[gid].name, "parent_id": coordinator.tree.groups[gid].parent_id}
        for gid, state in coordinator.data.items()
    }
    connection.send_result(msg["id"], {"groups": groups, "voices": coordinator.voice_states()})
```
For `invalid_config` the errors list should travel too: `connection.send_error(msg["id"], "invalid_config", str(err))` is the HA API (message only); additionally include the list by sending it via `send_message(websocket_api.error_message(msg["id"], "invalid_config", str(err), translation_placeholders=None))` is not richer — keep `send_error` and rely on `validate` for structured errors (the panel calls `validate` before `save`).

- [ ] **Step 4: `diagnostics.py`**

```python
"""Diagnostics: config plus engine snapshot."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

from homeassistant.core import HomeAssistant

from .coordinator import ActivityLevelsConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ActivityLevelsConfigEntry
) -> dict[str, Any]:
    coordinator = entry.runtime_data
    return {
        "config": entry.options,
        "groups": {gid: asdict(state) for gid, state in coordinator.data.items()},
        "voices": coordinator.voice_states(),
        "snapshot": coordinator.snapshot(),
    }
```

- [ ] **Step 5: Verify and commit**

```bash
uv run pytest && uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "feat: websocket API for the panel and diagnostics"
```

---

### Task 9: CI validation jobs and README

**Files:**
- Modify: `.github/workflows/python.yml`, `README.md`

- [ ] **Step 1: Add jobs**

Append to `python.yml`:
```yaml
  hassfest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: home-assistant/actions/hassfest@master

  hacs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hacs/action@main
        with:
          category: integration
```

- [ ] **Step 2: README**

Replace `README.md` body with: what it is (two paragraphs from spec §1), install (HACS custom repository → add integration "Activity Levels" → configure in the sidebar panel *coming in the next release*; until then edit options via the `activity_levels/config/save` websocket command or Developer Tools), the entity table from spec §5.3, services, and the config reference (the YAML block from spec §3 with a sentence per key). Keep it under 150 lines.

- [ ] **Step 3: Verify and commit**

```bash
uv run pytest && uv run ruff check . && uv run ruff format --check . && uv run mypy
git add -A && git commit -m "ci: hassfest and HACS validation; README"
```

---

## Self-review

**Spec coverage:** §3 config model → Task 3 (schema incl. every validation rule; durations normalized to seconds). §5.1 entry/setup/unload/update-listener → Task 6. §5.2 coordinator (listener, classification, timers, startup reconciliation, trigger/reset, snapshot) → Task 5; restart persistence via `Store` (ruling, replaces `RestoreEntity`). §5.3 devices/entities/attributes → Tasks 6–7. §5.4 services → Task 6. §5.5 websocket → Task 8. §5.6 diagnostics → Task 8. §7 CI (`hassfest`, `hacs/action`) → Task 9. Plan-1 ledger carry-overs → Task 2 (engine), Task 1 (mypy scope), Task 3 (impulse fields are still accepted with an impulse preset — the panel greys them out in Plan 3; no schema rejection, deliberately, since presets are reusable), Task 5 (`min_wake_interval` floor). Panel registration and `frontend` dependency are Plan 3.

**Placeholder scan:** none. Task 9's README step describes content rather than pasting it — acceptable for prose.

**Type consistency:** `GroupInfo.trigger`/`mix`/`max_value`/`precision` (Task 4) are used by Tasks 5–8. `Tree.group_order()`, `voice_key`, `all_voice_refs`, `voices_by_entity`, `entity_ids`, `defaults` (Task 4) are used by Task 5. `ActivityLevelsCoordinator.data/tree/entry_id/now/next_wake/trigger/reset/snapshot/voice_states/async_add_listener` (Task 5) are used by Tasks 6–8. `ActivityLevelsConfigEntry` lives in `coordinator.py` (Task 7 note) — Task 6's `__init__.py` must import it from there. `ConfigError.errors` (Task 3) is used by Task 8.
