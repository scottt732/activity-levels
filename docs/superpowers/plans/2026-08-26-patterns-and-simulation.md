# Activity Levels — Plan 4: Patterns & Presence Simulation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Learn per-group activity profiles from Home Assistant's long-term statistics and our own light log (numpy only), expose expected/anomaly sensors and presence-simulation switches, drive lights from sampled plans while away, and serve the profile + time-series endpoints the mixer UI needs — with the profile document as a producer-agnostic contract.

**Architecture:** New `patterns/` package (pure Python + numpy, no HA imports): `daytype.py` (labelling), `model.py` (Fourier/ridge learner → profile), `profile.py` (document schema, helpers), `planner.py` (seeded light-plan sampler). HA glue: `lightlog.py` (Store-backed light transition log), `patterns_coordinator.py` (nightly rebuild in the executor, profile Store, expected/anomaly publishing, simulation runtime), new sensor/switch entities, websocket endpoints, services. Existing `ActivityLevelsCoordinator` gains `real_value` per group (excluding the trigger voice).

**Tech Stack:** Python 3.14, HA 2026.8.3, numpy 2.3 (pinned by HA core), voluptuous, pytest-homeassistant-custom-component (`recorder_mock` fixture for LTS/history).

**Spec:** `docs/superpowers/specs/2026-08-26-patterns-and-simulation-design.md` (binding). Prior ledgers: `docs/superpowers/plan{1,2,3}-*-ledger.md`.

## Global Constraints

- Repo `/Users/sholodak/elevenrose/activity-levels`, branch `main` (an unrelated repo sits at `…/ActivityLevels` — set cwd explicitly). Explicit `git add` paths; never stage `brands/`.
- `custom_components/activity_levels/patterns/` has **no `homeassistant` imports**; numpy is allowed there and only there. `manifest.json` gains `"requirements": ["numpy==2.3.2"]` (exactly HA core's pin).
- All heavy work (LTS queries, model fits, calendar history) runs via `hass.async_add_executor_job` / `get_instance(hass).async_add_executor_job`; never on the event loop.
- Profile document `version: 1`, `slot_minutes: 15` (96 slots/day); every `expected[day_type]` is a list of 96 `[p25, p50, p75]`; every light `p_on[day_type]` is a list of 96 floats in `[0,1]`.
- Day types: built-ins `weekday`, `weekend`, `holiday` plus configured calendar ids; precedence list resolves conflicts; `weekday` is the model's base level.
- Simulation preconditions (ALL required, re-checked before every action): global switch on ∧ group switch on ∧ `away_entity` state == `on` ∧ group `real_value == 0`. No light restoration on deactivation. `quiet_hours` forbid turn-ons.
- The built-in learner never overwrites a profile whose `producer.name != "builtin"` unless `force`.
- ruff line length 100; `mypy --strict` over the package (numpy is typed); all tests green; existing 154 tests keep passing.
- Commit after every task with the message given.

---

## File structure

```
custom_components/activity_levels/
  patterns/__init__.py
  patterns/daytype.py         DayTypeRule, resolve_day_type()
  patterns/features.py        design matrix builders (numpy)
  patterns/model.py           fit_group_profile(), fit_light_profile(), anomaly_score()
  patterns/profile.py         PROFILE_SCHEMA (voluptuous), empty_profile(), slot_of(), expected_now()
  patterns/planner.py         sample_plan(rng, ...)
  lightlog.py                 LightLog (Store), resolve_group_lights()
  patterns_coordinator.py     PatternsCoordinator (rebuild, profile store, sim runtime)
  const.py                    additions
  schema.py                   additions (defaults.patterns, defaults.simulation, group.simulation)
  coordinator.py              real_value
  sensor.py / switch.py       new entities
  websocket_api.py            profile/*, timeseries, simulation/log
  services.yaml / strings.json / translations/en.json
tests/
  patterns/test_daytype.py test_model.py test_profile.py test_planner.py
  test_lightlog.py test_patterns_coordinator.py test_simulation.py test_websocket_patterns.py
```

---

### Task 1: Config schema additions and day-type labelling

**Files:**
- Modify: `schema.py`, `const.py`, `manifest.json`, `pyproject.toml` (numpy dev dep is implicit via homeassistant; ensure `uv run python -c "import numpy"` works)
- Create: `patterns/__init__.py`, `patterns/daytype.py`
- Test: `tests/test_schema.py` (extend), `tests/patterns/__init__.py`, `tests/patterns/test_daytype.py`

**Interfaces:**
- Normalized config gains:
  ```python
  defaults["patterns"] = {"rebuild_time": "03:00", "history_days": 180, "min_days": 14,
      "calendars": [{"id": str, "entity": str}], "day_type_precedence": [str], "workday_entity": str | None}
  defaults["simulation"] = {"away_entity": str | None, "quiet_hours": ["01:00", "05:30"] | None}
  group["simulation"] = {"enabled": bool, "lights": {"include": [str], "exclude": [str]}}
  ```
  Defaults: precedence `[*calendar ids in order, "holiday", "weekend", "weekday"]`; `enabled: True`.
- `daytype.py`:
  ```python
  @dataclass(frozen=True) class DayTypeInputs: weekday: int  # 0=Mon
      is_workday: bool | None  # None = unknown (no workday entity)
      calendars_active: frozenset[str]
  def resolve_day_type(inputs: DayTypeInputs, precedence: Sequence[str]) -> str
  BUILTIN_DAY_TYPES = ("weekday", "weekend", "holiday")
  ```
  Rules: candidates = active calendar ids ∪ {`holiday` if `is_workday is False and weekday < 5`} ∪ {`weekend` if weekday ≥ 5} ∪ {`weekday`}; return the first entry of `precedence` that is in candidates (`weekday` is always a candidate, so a result always exists).

- [ ] **Step 1: Failing tests**

`tests/patterns/test_daytype.py`:
```python
from custom_components.activity_levels.patterns.daytype import DayTypeInputs, resolve_day_type

PREC = ["vacation", "holiday", "school_year", "weekend", "weekday"]


def test_plain_weekday_and_weekend():
    assert resolve_day_type(DayTypeInputs(1, True, frozenset()), PREC) == "weekday"
    assert resolve_day_type(DayTypeInputs(6, None, frozenset()), PREC) == "weekend"


def test_holiday_only_on_non_workday_weekdays():
    assert resolve_day_type(DayTypeInputs(2, False, frozenset()), PREC) == "holiday"
    assert resolve_day_type(DayTypeInputs(6, False, frozenset()), PREC) == "weekend"
    assert resolve_day_type(DayTypeInputs(2, None, frozenset()), PREC) == "weekday"


def test_calendar_precedence():
    both = frozenset({"school_year", "vacation"})
    assert resolve_day_type(DayTypeInputs(2, True, both), PREC) == "vacation"
    assert resolve_day_type(DayTypeInputs(2, True, frozenset({"school_year"})), PREC) == "school_year"
    assert resolve_day_type(DayTypeInputs(6, True, frozenset({"school_year"})), PREC) == "school_year"


def test_unknown_calendar_ids_are_ignored():
    assert resolve_day_type(DayTypeInputs(0, True, frozenset({"nope"})), PREC) == "weekday"
```
Extend `tests/test_schema.py`:
```python
def test_patterns_and_simulation_defaults():
    cfg = validate_config(default_options())
    p = cfg["defaults"]["patterns"]
    assert p["rebuild_time"] == "03:00" and p["history_days"] == 180 and p["min_days"] == 14
    assert p["calendars"] == [] and p["day_type_precedence"] == ["holiday", "weekend", "weekday"]
    assert cfg["defaults"]["simulation"] == {"away_entity": None, "quiet_hours": ["01:00", "05:30"]}


def test_group_simulation_and_calendar_validation():
    cfg = house_config()
    cfg["defaults"]["patterns"] = {"calendars": [{"id": "school_year", "entity": "calendar.school"}]}
    cfg["groups"][0]["simulation"] = {"lights": {"include": ["light.hall"]}}
    out = validate_config(cfg)
    assert out["defaults"]["patterns"]["day_type_precedence"] == ["school_year", "holiday", "weekend", "weekday"]
    assert out["groups"][0]["simulation"] == {"enabled": True, "lights": {"include": ["light.hall"], "exclude": []}}
    cfg["defaults"]["patterns"]["calendars"].append({"id": "school_year", "entity": "calendar.x"})
    assert "defaults/patterns/calendars/1/id" in errors_of(cfg)
    cfg["defaults"]["patterns"]["calendars"] = [{"id": "bad", "entity": "sensor.not_a_calendar"}]
    assert "defaults/patterns/calendars/0/entity" in errors_of(cfg)
    cfg["defaults"]["patterns"] = {}
    cfg["defaults"]["simulation"] = {"quiet_hours": ["25:00", "05:00"]}
    assert "defaults/simulation/quiet_hours" in errors_of(cfg)
```
(`errors_of` exists in that file.)

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement**

`schema.py`: add `_hhmm` validator (regex `^([01]\d|2[0-3]):[0-5]\d$`), `_calendar_entity` (`cv.entity_id` + domain `calendar`), `PATTERNS_SCHEMA` (`rebuild_time` default "03:00", `history_days` int 30–730 default 180, `min_days` int 3–90 default 14, `calendars` list of `{id: _group_id, entity: _calendar_entity}` default `[]`, `day_type_precedence` optional list of str, `workday_entity` optional `cv.entity_id`), `SIMULATION_DEFAULTS_SCHEMA` (`away_entity` optional entity id, `quiet_hours` optional `[hhmm, hhmm]` default `["01:00","05:30"]`), `GROUP_SIMULATION_SCHEMA` (`enabled` default True, `lights: {include: [cv.entity_id], exclude: [cv.entity_id]}` with defaults). Hook into `DEFAULTS_SCHEMA` (`vol.Optional("patterns", default=dict)`, `vol.Optional("simulation", default=dict)`) and `_group_schema` (`vol.Optional("simulation", default=dict)`). Post-pass: if `day_type_precedence` missing → `[*calendar ids, "holiday", "weekend", "weekday"]`; cross-checks: calendar ids unique (path `defaults/patterns/calendars/<i>/id`), precedence entries must be builtin or a calendar id (path `defaults/patterns/day_type_precedence`), light entity ids must be `light.*` (path to the item).

`patterns/daytype.py` per the interface. `const.py`: `CONF_PATTERNS = "patterns"`, `CONF_SIMULATION = "simulation"`, `BUILTIN_DAY_TYPES`, `SLOT_MINUTES = 15`, `SLOTS_PER_DAY = 96`. `manifest.json`: `"requirements": ["numpy==2.3.2"]`.

- [ ] **Step 4: Verify and commit**
```bash
uv run pytest && uv run ruff check . && uv run ruff format . && uv run mypy
git add custom_components/activity_levels tests && git commit -m "feat(patterns): config schema and day-type labelling"
```

---

### Task 2: Profile document and helpers

**Files:**
- Create: `patterns/profile.py`; Test: `tests/patterns/test_profile.py`

**Interfaces:**
```python
SLOTS = 96
def slot_of(minute_of_day: int) -> int            # 0..95
def slot_minute(slot: int) -> int                 # slot*15
def empty_profile(producer_name="builtin", producer_version=VERSION, day_types=()) -> dict
def validate_profile(doc: Mapping) -> dict         # raises ProfileError(errors=[{path,message}])
def group_ready(profile: dict, gid: str) -> bool
def expected_at(profile: dict, gid: str, day_type: str, slot: int) -> tuple[float,float,float] | None  # falls back to "weekday" then any available day type
def anomaly_score(actual: float, band: tuple[float,float,float]) -> float
```
`PROFILE_SCHEMA` (voluptuous): `version == 1`; `producer {name: str, version: str}`; `generated_at: float`; `training_window: [float, float]`; `day_types: [str]`; `slot_minutes == 15`; `groups: {gid: {ready: bool, days: int, expected: {day_type: [[p25,p50,p75] × 96]}, lights: {entity: {p_on: {day_type: [96 floats 0..1]}, on_starts: {day_type: [ints 0..1439]}, off_starts: {...}, brightness: int|None}}}}` with `p25 ≤ p50 ≤ p75 ≥ 0`.

- [ ] **Step 1: Failing tests** — `empty_profile()` validates; `slot_of(0)==0`, `slot_of(1439)==95`, `slot_minute(4)==60`; a hand-built minimal valid doc round-trips; malformed docs (95 slots, p25>p50, slot_minutes 10, unknown top-level key) raise `ProfileError` with the offending path; `expected_at` falls back weekday→first; `anomaly_score`: inside band → 0; `actual=4, band=(1,2,3)` → 1.0; `actual=0, band=(1,2,3)` → −1.0; degenerate band `(2,2,2)` uses ε and stays finite.
- [ ] **Step 2: RED. Step 3: implement. Step 4:**
```bash
uv run pytest tests/patterns && uv run ruff check . && uv run ruff format . && uv run mypy
git add custom_components/activity_levels/patterns tests/patterns && git commit -m "feat(patterns): profile document schema and helpers"
```

---

### Task 3: Learner (numpy) — activity model and light model

**Files:**
- Create: `patterns/features.py`, `patterns/model.py`; Test: `tests/patterns/test_model.py`

**Interfaces:**
```python
@dataclass(frozen=True) class Sample: t: float; value: float; day_type: str        # hourly mean rows
@dataclass(frozen=True) class LightTransition: t: float; entity_id: str; on: bool; brightness: int | None
def fit_group_expected(samples: Sequence[Sample], *, day_types: Sequence[str], max_value: float,
                       tz: tzinfo, ridge: float = 1.0, min_days: int = 14) -> dict | None
    # returns {"ready": bool, "days": int, "expected": {day_type: [[p25,p50,p75]]*96}} or None when no samples
def fit_light_profile(transitions: Sequence[LightTransition], *, window: tuple[float,float],
                      day_type_of: Callable[[date], str], day_types: Sequence[str], tz: tzinfo) -> dict
    # returns {entity: {"p_on": {dt: [96]}, "on_starts": {dt: [...]}, "off_starts": {dt: [...]}, "brightness": int|None}}
```
`features.py`: `design_matrix(ts: np.ndarray, day_type_idx: np.ndarray, n_day_types: int, tz) -> np.ndarray` with columns: 1, trend (days/365 from first sample), daily Fourier k=1..4 (8), weekly Fourier k=1..3 (6), day-type one-hots (n−1, base = index 0 = "weekday"), interactions day-type one-hot × daily Fourier (8·(n−1)). Local time via `datetime.fromtimestamp(t, tz)`.

`fit_group_expected`: build X, y; ridge with penalty on all columns except the intercept: `β = solve(XᵀX + λI', Xᵀy)`. For each day type present in training data and each slot: predict on synthetic timestamps — every training day at that slot's minute (so weekly terms average out) with that day type's one-hot — take the mean → p50, clamp to `[0, max_value]`. Residual bands: residuals `r = y − Xβ` grouped by `(day_type, hour)`; p25/p75 offsets = quantiles of `r` in the group when it has ≥ 20 samples, else group-wide quantiles; `p25 = clamp(p50 + q25)`, `p75 = clamp(p50 + q75)`, then enforce `p25 ≤ p50 ≤ p75`. Day types absent from training data get the `weekday` curve. `days` = number of distinct local dates; `ready = days ≥ min_days`. If `ready` is False still return curves (the UI shows them greyed).

`fit_light_profile`: reconstruct on/off intervals per entity from transitions inside `window` (assume off before the first transition); accumulate on-minutes and observed-minutes per `(day_type, slot)` over each day in the window; `p_on = (on+1)/(observed+2)`; collect `on_starts`/`off_starts` minute-of-day per day type (cap 200 most recent); `brightness` = median of brightness on ON transitions (None if none).

- [ ] **Step 1: Failing tests**
  - Synthetic 60 days at 1 h resolution: `y = 2 + 1.5·sin(2π(hour−18)/24)` on weekdays, `+1.0` on weekends, noise σ=0.2; fit; assert p50 at 18:00 weekday ≈ 3.5 (±0.3), at 06:00 weekday ≈ 0.5 (±0.3), weekend 18:00 ≈ 4.5 (±0.4); bands contain ≥ 40% and ≤ 60% of the synthetic points (recompute coverage over the training samples); `ready is True`, `days == 60`.
  - A `holiday` day type appearing 5 times with +2 shift: its curve exceeds weekday's by 1.5–2.5 on average.
  - `min_days` guard: 7 days → `ready False`, curves present.
  - No samples → `None`.
  - Light profile: one light ON 18:00–23:00 every weekday for 20 days, never on weekends: `p_on["weekday"][slot_of(20*60)] > 0.9`, `p_on["weekday"][slot_of(12*60)] < 0.1`, `p_on["weekend"]` all < 0.1, `on_starts["weekday"]` all within 18:00±1 min, `brightness` median correct.
  - Numerical: a single-day-type dataset (all weekday) fits without singular-matrix errors.
- [ ] **Step 2: RED. Step 3: implement. Step 4:**
```bash
uv run pytest tests/patterns && uv run ruff check . && uv run ruff format . && uv run mypy
git add custom_components/activity_levels/patterns tests/patterns && git commit -m "feat(patterns): numpy Fourier/ridge learner and light profile"
```

---

### Task 4: Plan sampler

**Files:**
- Create: `patterns/planner.py`; Test: `tests/patterns/test_planner.py`

**Interfaces:**
```python
@dataclass(frozen=True) class PlannedAction: t: float; entity_id: str; on: bool; brightness: int | None
def sample_plan(rng: np.random.Generator, *, light_profile: Mapping[str, dict], day_type: str,
                day_start: float, tz: tzinfo, quiet_hours: tuple[str, str] | None, jitter_minutes: int = 20,
                initial_state: Mapping[str, bool]) -> list[PlannedAction]
```
Walk 96 slots for each light: `state` starts from `initial_state`; draw `u ~ U(0,1)` per slot; if not on and `p_on[slot] > u` → ON at `pick(on_starts near slot) + jitter`, unless the time is inside quiet hours (then skip); if on and `p_on[slot] < u` → OFF similarly from `off_starts`. "near slot" = the transition-time list filtered to ±90 min of the slot, else the slot's own minute. Actions sorted by time; no two actions for the same light within 10 minutes (drop the later one).

- [ ] **Step 1: Failing tests** — seeded determinism (same seed → same plan; different seed → different); a light with `p_on` 1.0 from 18:00–23:00 and 0 elsewhere yields exactly one ON near 18:00 (±40 min) and one OFF near 23:00; quiet hours suppress ONs inside `["01:00","05:30"]` even with `p_on` 1.0; `initial_state` on → first action is OFF; no same-light actions within 10 min.
- [ ] **Step 2–4:** RED, implement, verify, commit `feat(patterns): seeded light plan sampler`.

---

### Task 5: Light log store and light membership

**Files:**
- Create: `lightlog.py`; Test: `tests/test_lightlog.py`

**Interfaces:**
```python
def resolve_group_lights(hass, area_id: str | None, include: list[str], exclude: list[str]) -> list[str]
class LightLog:
    def __init__(self, hass, entry_id, history_days: int)
    async def async_load(self) -> None
    async def async_backfill(self, entity_ids: list[str], since: datetime) -> int   # from recorder history
    @callback def record(self, entity_id: str, state: State | None, t: float) -> None  # append transition if on/off changed
    def transitions(self, entity_ids, start: float, end: float) -> list[LightTransition]
    def prune(self, now: float) -> None
    async def async_save(self) -> None
```
Storage key `activity_levels.lights.<entry_id>`, `{"version": 1, "rows": [[t, entity, on, brightness], ...]}`; `record` uses `async_delay_save(10 s)`; `on = state.state == "on"`; brightness from `attributes["brightness"]`.

`resolve_group_lights`: entity registry entries with domain `light` whose `area_id == area_id`, or whose device's area is `area_id` when the entity has no area; ∪ include − exclude; sorted, unique.

- [ ] **Step 1: Failing tests** — with `entity_registry`/`device_registry` fixtures: create two lights in area `kitchen` (one via device area), one elsewhere; include/exclude applied. `LightLog.record` ignores unchanged on/off; `transitions` filters by window; `prune` drops old rows; backfill from `recorder_mock` with `hass.states.async_set` history (use `pytest_homeassistant_custom_component.common.async_fire_time_changed` + `async_wait_recording_done`).
- [ ] **Step 2–4:** RED, implement, verify, commit `feat(patterns): light transition log and group light membership`.

---

### Task 6: PatternsCoordinator — data fetch, nightly rebuild, profile store, expected/anomaly

**Files:**
- Create: `patterns_coordinator.py`; Modify: `coordinator.py` (`real_value`), `__init__.py` (create/start/stop; hub device), `sensor.py` (new sensors), `const.py`, `strings.json`, `translations/en.json`, `services.yaml`
- Test: `tests/test_patterns_coordinator.py`

**Interfaces:**
```python
class PatternsCoordinator:
    def __init__(self, hass, entry, coordinator: ActivityLevelsCoordinator, config: dict)
    async def async_start(self)   # load profile + lightlog, subscribe to light state changes, schedule nightly rebuild + 15-min bucket timer
    async def async_stop(self)
    profile: dict; ready: bool
    def day_type_now(self) -> str
    def expected_now(self, gid) -> tuple[float,float,float] | None
    def anomaly_now(self, gid) -> float | None
    async def async_rebuild(self, *, force: bool = False) -> bool     # runs learner in executor; respects producer guard
    async def async_set_profile(self, doc: dict) -> None               # validated external producer
    def async_add_listener(self, cb) -> Callable[[], None]
    async def async_timeseries(self, gid, start, end, resolution, include_children, forecast_until) -> dict
```
Data fetch (executor): `statistics_during_period(hass, start, end, {statistic_ids}, "hour", None, {"mean","max"})` via `get_instance(hass).async_add_executor_job`; 5-minute history via `get_significant_states(hass, start, end, [entity_id], minimal_response=True)`; calendar activity via the `calendar.get_events` service (`return_response=True`) per configured calendar over the training window, cached per date; workday via `get_significant_states` of the workday entity. `day_type_of(date)` composes these with `resolve_day_type`.

`ActivityLevelsCoordinator._state_of` gains `real_value` = `group.value_at(t)` computed with the trigger voice's contribution removed (simplest: `max(0, raw − trigger_contribution)` from `contributions_at`, clamped to `max_value`); add to `GroupState` and the `state` payload.

Entities: `ExpectedActivitySensor` (`sensor.<gid>_expected_activity`, measurement, attrs `p25 p75 day_type ready producer`), `ActivityAnomalySensor` (`sensor.<gid>_activity_anomaly`, measurement, `unknown` until ready), `ProfileSensor` (`sensor.activity_levels_profile`, timestamp, diagnostic, on the hub device). Hub device: `identifiers={(DOMAIN, entry.entry_id)}`, name "Activity Levels"; root group devices get `via_device` to it. Sensors subscribe to `PatternsCoordinator.async_add_listener` and to the level coordinator (anomaly needs the actual value).

Service `activity_levels.rebuild_profile` (`force` bool). Nightly timer: `async_track_time_change` at `rebuild_time`; on start, if no profile or `generated_at` older than 26 h, schedule a rebuild 60 s after HA start (`EVENT_HOMEASSISTANT_STARTED`).

- [ ] **Step 1: Failing tests** (`recorder_mock`, `freezer`): seed LTS by importing statistics with `async_import_statistics`/`async_add_external_statistics` for `sensor.kitchen_activity_level` over 20 synthetic days (or insert via `hass.states.async_set` + `async_wait_recording_done` and run the short-term→LTS compile with `async_fire_time_changed` past the hour — choose whichever the harness supports reliably and document); call `async_rebuild()`; assert the profile has `kitchen` ready, `sensor.kitchen_expected_activity` has a numeric state and `day_type` attribute, anomaly sensor numeric; `async_set_profile` with `producer.name="prophet-addon"` → subsequent `async_rebuild()` returns False (guarded) and `force=True` overwrites; hub device exists and `house` device `via_device_id` points to it; `real_value` excludes a trigger: `coordinator.trigger("kitchen", 3.0)` → `value 3.0`, `real_value 0.0`.
- [ ] **Step 2–4:** RED, implement, verify (full suite), commit `feat(patterns): patterns coordinator, expected/anomaly sensors, hub device`.

---

### Task 7: Simulation runtime and switches

**Files:**
- Create: `switch.py`; Modify: `patterns_coordinator.py`, `const.py` (`PLATFORMS` += `Platform.SWITCH`), `services.yaml`, `strings.json`, `translations/en.json`
- Test: `tests/test_simulation.py`

**Interfaces:**
- `switch.activity_levels_presence_simulation` (hub device) and `switch.<gid>_presence_simulation` (group device, only when the group has ≥1 light and `simulation.enabled`); `RestoreEntity` so switch state survives restarts.
- `PatternsCoordinator.simulation`: `SimulationRuntime` with `set_global(on)`, `set_group(gid, on)`, `is_active(gid) -> bool`, `plan_for(gid) -> list[PlannedAction]`, `log(limit) -> list[dict]`, `async_simulate_now(gid)`. Preconditions per the Global Constraints, evaluated on: switch changes, `away_entity` state changes, level coordinator publishes (`real_value`), and each scheduled action. Plans sampled with `np.random.default_rng()` at activation and at local midnight; actions scheduled with `async_track_point_in_time`; each executed action calls `light.turn_on` (with `brightness` if known) / `light.turn_off` and appends to `Store("activity_levels.simlog.<entry_id>")` (last 500). Cancelling a plan cancels timers only.
- Service `activity_levels.simulate_now` (`group_id`).

- [ ] **Step 1: Failing tests** (`freezer`, service call capture via `async_mock_service(hass, "light", "turn_on")`): with a ready profile (inject via `async_set_profile` a doc where `light.kitchen` has `p_on = 1.0` 18:00–23:00), `away_entity` on, both switches on, kitchen `real_value` 0: advance to 18:30 → `light.turn_on` called for `light.kitchen`; then a real note-on in kitchen → plan cancelled, no further calls; turning the group switch off cancels; `away_entity` off cancels; quiet hours respected; switch state restored after reload; sim log has entries via `log()`.
- [ ] **Step 2–4:** RED, implement, verify, commit `feat(patterns): presence simulation runtime and switches`.

---

### Task 8: Websocket endpoints, docs, ledger carry-overs

**Files:**
- Modify: `websocket_api.py`, `README.md`, `CHANGELOG.md`, `frontend/src/types.ts` (add `real_value` to `GroupLive` only — UI work is Plan 5)
- Test: `tests/test_websocket_patterns.py`

**Interfaces:** `activity_levels/profile/get`, `activity_levels/profile/save {profile}`, `activity_levels/profile/rebuild {force?}` (async), `activity_levels/timeseries {group_id, start, end, resolution, include_children, forecast_until}`, `activity_levels/simulation/log {group_id?, limit?}` — shapes per spec §9. `timeseries`: history from LTS hourly means (or 5-minute recorder history when `resolution == "5m"` and the window ≤ 24 h), children series when requested, forecast from the profile evaluated per 15-min slot from `end` to `forecast_until` using `day_type_of(date)` for each future day (calendar lookups for future dates via `calendar.get_events`), `day_types` spans over `[start, forecast_until]`, `lights` intervals from the light log, `plan` from the simulation runtime.

- [ ] **Step 1: Failing tests** (`hass_ws_client`): each command's shape; `profile/save` with an invalid doc → `invalid_profile` error with pathed messages; `timeseries` returns 96×(days) forecast points and history points in the window; admin required.
- [ ] **Step 2–4:** implement, README section "Patterns & presence simulation" (what it learns, readiness, switches, safety preconditions, quiet hours, how to plug in an external producer), CHANGELOG, verify both toolchains (`pnpm typecheck` after the types change; rebuild bundle only if `types.ts` affects output — it doesn't, so no bundle change), commit `feat(patterns): websocket profile/timeseries/simulation endpoints; docs`.

---

## Self-review

**Spec coverage:** §3 config → T1; §4.1 LTS fetch → T6; §4.2 light log → T5; §4.3 day types → T1 + T6 (calendar/workday sourcing); §5 model → T3; §6 profile contract + producer guard → T2 + T6; §7 entities/services/hub device → T6 + T7; §8 simulation → T4 (sampler) + T7 (runtime); §9 websocket → T8; §10 tests distributed per task. `real_value` (needed by §8 and the mixer) → T6.

**Placeholder scan:** Tasks 5–8 specify behavior, interfaces, and tests in prose rather than full code — deliberate for HA-glue tasks; every name, shape, and rule is stated. The LTS-seeding approach in T6's tests is left to the implementer with two named options because harness support varies by HA version — the implementer must document which was used.

**Type consistency:** `Sample`/`LightTransition` (T3) used by T5/T6; `PlannedAction` (T4) used by T7/T8; `resolve_day_type` (T1) used by T6; `validate_profile`/`expected_at`/`anomaly_score` (T2) used by T6/T8; `GroupState.real_value` (T6) used by T7; profile shape identical in T2 schema, T3 output, T6 storage, T8 payloads.
