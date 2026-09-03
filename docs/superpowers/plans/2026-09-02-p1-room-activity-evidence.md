# P1 — Room-activity evidence and the floor entity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The room estimator reads each room's activity level as evidence — an empty room is
penalised, a rising one is not — and every tracked person gets a `sensor.<name>_floor`.

**Architecture:** `Observation` gains an `activity` mapping; `Estimator.log_emission` adds
`log(ε + (1−ε)·a_r)` per room. The presence coordinator fills the mapping from the engine
tree with the trigger *and* presence voices excluded (`Group.value_at_excluding` learns to
take several labels), and re-observes when a room's level crosses zero. The floor sensor
sums belief mass over a floor's rooms and names the floor through the registry or the tree.

**Tech Stack:** Python 3.14 / numpy / pytest-homeassistant-custom-component; Lit +
TypeScript + Vite for one settings field.

**Spec:** `docs/superpowers/specs/2026-09-02-people-devices-and-evidence-design.md` § P1

## Global Constraints

- `presence/` and `topology.py` import no `homeassistant`; `tests/test_purity.py` guards it.
- Evidence level = `group.value_at_excluding(t, {TRIGGER_KEY, PRESENCE_KEY}) / max_value`.
- `presence.activity.floor` default `0.05`, in `(0, 1]`.
- Conventional Commits; scopes `engine`, `presence`, `config`, `coordinator`, `panel`,
  `readme`, `translations`.
- `pnpm build` output `custom_components/activity_levels/frontend/activity-levels-panel.js`
  is committed with any `frontend/src` change.
- `config.schema.json` is regenerated (`uv run python scripts/export_schema.py`) with any
  schema change and committed.
- `strings.json` and `translations/en.json` stay in step.

---

### Task 1: `Group.value_at_excluding` takes several labels

**Files:**
- Modify: `custom_components/activity_levels/engine/group.py:137-145`
- Test: `tests/engine/test_group_aggregates.py`

**Interfaces:**
- Produces: `Group.value_at_excluding(self, t: float, labels: str | Iterable[str]) -> float`
  — a single string still works; a set leaves every named channel out.

- [ ] **Step 1: Write the failing test**

```python
def test_value_at_excluding_takes_several_labels() -> None:
    a, b, c = held("a"), held("b"), held("c")
    g = Group(id="g", channels=[Channel(a, label="a"), Channel(b, label="b"), Channel(c, label="c")])
    for v in (a, b, c):
        v.note_on(0.0)
    assert g.value_at_excluding(1.0, "a") == pytest.approx(2.0)
    assert g.value_at_excluding(1.0, {"a", "b"}) == pytest.approx(1.0)
    assert g.value_at_excluding(1.0, {"a", "b", "c"}) == pytest.approx(0.0)
```

Check `Channel`'s constructor for the label argument name first (`grep -n "class Channel" -A 12 custom_components/activity_levels/engine/group.py`); use whatever it is.

- [ ] **Step 2: Run it** — `uv run pytest tests/engine/test_group_aggregates.py -k several -q` → FAIL (a set is not a label).

- [ ] **Step 3: Implement**

```python
def value_at_excluding(self, t: float, labels: str | Iterable[str]) -> float:
    """The limited mix with the channels called ``labels`` left out.

    Mirrors :meth:`value_at` rather than subtracting a contribution, so MAX and
    MEAN re-mix over the remaining channels instead of guessing. Used for a
    group's "real" value -- the level without the synthetic trigger voice -- and
    for the presence side's evidence level, which also leaves out the presence
    voice so the estimator never reads a level it raised itself.
    """
    excluded = {labels} if isinstance(labels, str) else set(labels)
    remaining = [ch for ch in self._live() if ch.label not in excluded]
    return self._limit(self._mix([ch.value_at(t) for ch in remaining]))
```

Add `from collections.abc import Iterable` if not imported.

- [ ] **Step 4: Run** `uv run pytest tests/engine -q` → PASS; `uv run mypy` clean.
- [ ] **Step 5: Commit** — `git commit -m "feat(engine): value_at_excluding leaves out several channels at once"`

### Task 2: The activity term in the emission

**Files:**
- Modify: `custom_components/activity_levels/presence/observation.py`
- Modify: `custom_components/activity_levels/presence/estimator.py`
- Test: `tests/test_estimator.py`, `tests/test_estimator_properties.py`

**Interfaces:**
- Produces: `RoomActivity(level: float, slope: float)` frozen dataclass in `observation.py`;
  `Observation.activity: Mapping[str, RoomActivity] = {}`; `Estimator(..., activity_floor: float = 0.05)`.

- [ ] **Step 1: Failing tests**

```python
from custom_components.activity_levels.presence.observation import RoomActivity

def test_an_empty_room_is_penalised_and_a_busy_one_is_not(topo) -> None:
    est = make(topo)
    plain = est.log_emission(at("kitchen", 0.0))
    obs = Observation(
        t=0.0,
        distances=at("kitchen", 0.0).distances,
        home=True,
        activity={
            "kitchen": RoomActivity(level=0.0, slope=0.0),
            "hall": RoomActivity(level=1.0, slope=-0.1),
        },
    )
    log_e = est.log_emission(obs)
    assert log_e[topo.index("kitchen")] == pytest.approx(plain[topo.index("kitchen")] + np.log(0.05))
    assert log_e[topo.index("hall")] == pytest.approx(plain[topo.index("hall")])
    # rooms with no reading, and away, are untouched
    assert log_e[topo.index("bedroom")] == pytest.approx(plain[topo.index("bedroom")])
    assert log_e[topo.index(AWAY)] == pytest.approx(plain[topo.index(AWAY)])


def test_a_rising_room_counts_as_fully_active(topo) -> None:
    est = make(topo)
    plain = est.log_emission(at("kitchen", 0.0))
    obs = Observation(
        t=0.0,
        distances=at("kitchen", 0.0).distances,
        home=True,
        activity={"kitchen": RoomActivity(level=0.02, slope=0.5)},
    )
    assert est.log_emission(obs)[topo.index("kitchen")] == pytest.approx(plain[topo.index("kitchen")])


def test_activity_floor_is_configurable(topo) -> None:
    est = make(topo, activity_floor=0.5)
    plain = est.log_emission(at("kitchen", 0.0))
    obs = Observation(
        t=0.0,
        distances=at("kitchen", 0.0).distances,
        home=True,
        activity={"kitchen": RoomActivity(level=0.0, slope=0.0)},
    )
    assert est.log_emission(obs)[topo.index("kitchen")] == pytest.approx(plain[topo.index("kitchen")] + np.log(0.5))
```

Property test, in `tests/test_estimator_properties.py` (match its existing strategies/fixtures):

```python
@given(level=st.floats(0.0, 1.0), slope=st.floats(-1.0, 1.0))
def test_the_activity_term_never_rewards_a_room(level: float, slope: float) -> None:
    topo, est = _make()  # whatever the module's helper is called
    plain = est.log_emission(_obs(0.0))
    with_activity = est.log_emission(_obs(0.0, activity={"kitchen": RoomActivity(level, slope)}))
    delta = with_activity - plain
    assert delta[topo.index("kitchen")] <= 1e-12
    assert np.all(np.abs(np.delete(delta, topo.index("kitchen"))) < 1e-12)
```

- [ ] **Step 2: Run** `uv run pytest tests/test_estimator.py tests/test_estimator_properties.py -q` → FAIL (`RoomActivity` missing).

- [ ] **Step 3: Implement**

`observation.py`:

```python
@dataclass(frozen=True)
class RoomActivity:
    """One room's activity level as evidence: ``level`` already scaled to ``[0, 1]`` by
    the caller (the evidence level over the group's ``max_value``), ``slope`` in the
    same units per second. Only the sign of the slope is read."""

    level: float
    slope: float
```

Add to `Observation`: `activity: Mapping[str, RoomActivity] = field(default_factory=dict)` with a
docstring paragraph: rooms absent from the mapping contribute nothing.

`estimator.py`: constructor keyword `activity_floor: float = 0.05` stored as
`self.activity_floor`; in `log_emission`, after the `away` line:

```python
# The room's own activity level. Capped at zero: with other people home, a busy
# room is only weak evidence that *this* person is there, but a room at 0.0 is
# strong evidence they are not, and a rising level is a stimulus firing right now.
for room, activity in obs.activity.items():
    position = self._position.get(room)
    if position is None or room == AWAY:
        continue
    a = max(min(activity.level, 1.0), 1.0 if activity.slope > 0.0 else 0.0)
    out[position] += math.log(self.activity_floor + (1.0 - self.activity_floor) * a)
```

Update the class docstring's emission paragraph to describe the term.

- [ ] **Step 4: Run** the two test files → PASS. `uv run ruff check . && uv run mypy`.
- [ ] **Step 5: Commit** — `feat(presence): a room's activity level is emission evidence`

### Task 3: `presence.activity.floor` in the schema, the JSON schema and the README

**Files:**
- Modify: `custom_components/activity_levels/schema.py` (`PRESENCE_SCHEMA`)
- Modify: `custom_components/activity_levels/config.schema.json` (regenerated)
- Modify: `custom_components/activity_levels/schema_json.py` (description text, if the presence block's descriptions live there)
- Modify: `README.md` configuration reference
- Test: `tests/test_schema.py`, `tests/test_schema_json.py`

**Interfaces:**
- Produces: normalised `config["presence"]["activity"] == {"floor": 0.05}` by default.

- [ ] **Step 1: Failing test** in `tests/test_schema.py` (match its helpers):

```python
def test_presence_activity_defaults_and_bounds() -> None:
    cfg = validate_config(presence_config())
    assert cfg["presence"]["activity"] == {"floor": 0.05}
    config = presence_config()
    config["presence"]["activity"] = {"floor": 0.0}
    with pytest.raises(ConfigError):
        validate_config(config)
```

- [ ] **Step 2: Run** → FAIL (`KeyError: 'activity'`).
- [ ] **Step 3: Implement**

```python
PRESENCE_ACTIVITY_SCHEMA = vol.Schema(
    {
        # likelihood of a room whose evidence level is 0.0 -- the same footing as a
        # room with no scanner, and never a reward for a busy one
        vol.Optional("floor", default=0.05): _finite(0.0, lo_exclusive=True, hi=1.0),
    }
)
```
and in `PRESENCE_SCHEMA`: `vol.Optional("activity", default=dict): PRESENCE_ACTIVITY_SCHEMA,`.
Regenerate: `uv run python scripts/export_schema.py`. README `presence:` block gains:

```yaml
  activity:
    floor: 0.05              # likelihood of a room whose activity level is 0.0
```
and one sentence under **Rooms & presence** saying the estimator reads each room's level
(with the presence channel left out) as evidence, so an empty room is somewhere you are not.

- [ ] **Step 4: Run** `uv run pytest tests/test_schema.py tests/test_schema_json.py -q` → PASS.
- [ ] **Step 5: Commit** — `feat(config): presence.activity.floor`

### Task 4: The coordinator fills in activity and re-observes on empty/busy crossings

**Files:**
- Modify: `custom_components/activity_levels/presence_coordinator.py`
- Test: `tests/test_presence_coordinator.py`

**Interfaces:**
- Consumes: Task 1's `value_at_excluding(t, {TRIGGER_KEY, PRESENCE_KEY})`; Task 2's `RoomActivity`; Task 3's `settings["activity"]["floor"]`.
- Produces: `PresenceCoordinator._activity(t) -> dict[str, RoomActivity]`.

- [ ] **Step 1: Failing tests**

```python
async def test_the_evidence_level_leaves_the_presence_channel_out(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    # the kitchen's only contributor is now the presence voice ...
    coordinator = entry.runtime_data.coordinator
    assert coordinator.data["kitchen"].contributors[PRESENCE_KEY] > 0.0
    # ... and the evidence level must not see it
    activity = presence._activity(coordinator.now())
    assert activity["kitchen"].level == 0.0


async def test_an_active_room_reads_as_active_evidence(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    hass.states.async_set("binary_sensor.hall_motion", "on")
    await hass.async_block_till_done()
    activity = presence._activity(entry.runtime_data.coordinator.now())
    assert activity["hall"].level > 0.0
    assert set(activity) == ROOMS


async def test_a_room_emptying_out_moves_the_belief_without_a_bermuda_frame(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Kitchen and dining room tie on distance; the dining room's motion decides."""
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert presence is not None
    hass.states.async_set("binary_sensor.dining_motion", "on")
    hass.states.async_set(bermuda.tracker, "home")
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, "1.0" if room in ("kitchen", "dining_room") else "8.0")
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    out = presence.devices["Scott"].outputs
    assert out is not None and out.room == "dining_room"
```

Also a test that the level coordinator's kitchen going to `0.0` after activity fires an
observation: set kitchen motion on, then off, tick the release past its end, and assert
`presence.devices["Scott"].outputs.t` advanced with no distance change.

- [ ] **Step 2: Run** → FAIL (`_activity` missing).
- [ ] **Step 3: Implement**

In `__init__`: `self._levels: dict[str, bool] = {}` (room → was-empty) and after the
existing fields nothing else. In `async_start` after `_subscribe()`:

```python
for gid in self.topology.nodes:
    self._unsubs.append(
        self.coordinator.async_add_listener(gid, partial(self._room_level_changed, gid))
    )
```

```python
@callback
def _room_level_changed(self, gid: str) -> None:
    """A room's level moved. Only the empty <-> busy crossing is worth a frame.

    Every other change is already encoded in the level the next Bermuda frame
    will read; re-running the filter on an unchanged frame for each of them would
    count the same readings twice.
    """
    state = self.coordinator.data.get(gid)
    if state is None or self._stopped or not self._usable:
        return
    empty = state.real_value <= 0.0
    if self._levels.get(gid) is empty:
        return
    self._levels[gid] = empty
    self._dirty.update(self.devices)
    if self._observe_timer is None:
        self._observe_timer = async_call_later(self.hass, OBSERVATION_DEBOUNCE, self._observe_due)

def _activity(self, t: float) -> dict[str, RoomActivity]:
    """Every room's evidence level: the mix with the trigger and presence voices out.

    The presence voice is left out so the estimator never reads a level it raised
    itself; the trigger voice, so the simulation's test impulses are not mistaken
    for a person. ``t`` is the observation's own clock reading, taken after the
    level coordinator's, so the engine's time contract holds.
    """
    activity: dict[str, RoomActivity] = {}
    for gid in self.topology.nodes:
        info = self.coordinator.tree.groups.get(gid)
        if info is None:
            continue
        level = info.group.value_at_excluding(t, {TRIGGER_KEY, PRESENCE_KEY}) / info.max_value
        activity[gid] = RoomActivity(level=min(level, 1.0), slope=info.group.slope_at(t))
    return activity
```

`_observation` passes `activity=self._activity(t)`. `_discover` passes
`activity_floor=self.settings["activity"]["floor"]` to `Estimator`. Import `partial`,
`TRIGGER_KEY`, `PRESENCE_KEY`, `RoomActivity`.

Note: `real_value` in `GroupState` excludes only the trigger voice, so a room whose sole
contributor is the presence channel is "busy" by this test — the crossing fires one extra
frame, which is harmless, and the frame itself reads the true evidence level.

- [ ] **Step 4: Run** `uv run pytest tests/test_presence_coordinator.py tests/test_presence_entities.py -q` → PASS. ruff, mypy.
- [ ] **Step 5: Commit** — `feat(coordinator): feed each room's activity level to the room estimator`

### Task 5: `sensor.<name>_floor`

**Files:**
- Modify: `custom_components/activity_levels/presence_coordinator.py` (`floor_of`, `floor_name`)
- Modify: `custom_components/activity_levels/sensor.py` (`FloorSensor`, registration)
- Modify: `custom_components/activity_levels/const.py` (`ATTR_FLOOR_ID`, `ATTR_ROOMS`)
- Modify: `custom_components/activity_levels/strings.json`, `translations/en.json` (`"floor": {"name": "Floor"}`)
- Modify: `README.md` entity table and the "What you get" paragraph
- Test: `tests/test_presence_entities.py`

**Interfaces:**
- Produces: `PresenceCoordinator.floor_of(room: str) -> str | None` (a *group id* — the
  nearest ancestor of kind `floor`, else the nearest ancestor of kind `structure` or
  `property`); `floor_name(group_id) -> str` (the HA floor registry's name when the group
  has a `floor_id` the registry knows, else the group's name); `floor_estimate(name) ->
  tuple[str | None, float, dict[str, float]]` = `(floor group id, confidence, rooms on it above CANDIDATE_FLOOR)`.

- [ ] **Step 1: Failing test**

```python
async def test_floor_sensor_names_the_floor_and_sums_its_rooms(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    floor = hass.states.get("sensor.scott_floor")
    assert floor is not None
    # rooms_config has no floor groups: the rooms pool under the branch above them
    assert floor.state == "Downstairs"
    assert floor.attributes["group_id"] == "downstairs"
    assert floor.attributes["confidence"] >= hass.states.get("sensor.scott_room").attributes["confidence"]
    assert "Kitchen" in floor.attributes["rooms"]


async def test_floor_sensor_is_unknown_when_away(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    for _ in range(6):
        await observe(hass, freezer, bermuda, "none", home=False)
    floor = hass.states.get("sensor.scott_floor")
    assert floor.state == "Away"
    assert floor.attributes["group_id"] is None
```

Check `rooms_config` in `tests/fixtures.py` for the branch above the rooms and its name;
use whatever they are.

- [ ] **Step 2: Run** → FAIL (no entity).
- [ ] **Step 3: Implement**

Coordinator:

```python
def floor_of(self, room: str) -> str | None:
    """The group a room's floor answer names: the nearest floor above it, else the
    building or property it sits in. Rooms under no floor -- a bungalow, an outside
    area -- still get an answer, and the entity says which kind."""
    groups = self.coordinator.tree.groups
    info = groups.get(room)
    while info is not None and info.parent_id is not None:
        info = groups.get(info.parent_id)
        if info is not None and info.kind in (KIND_FLOOR, KIND_STRUCTURE, KIND_PROPERTY):
            return info.id
    return None

def floor_name(self, group_id: str) -> str:
    info = self.coordinator.tree.groups.get(group_id)
    if info is not None and info.floor_id is not None:
        entry = fr.async_get(self.hass).async_get_floor(info.floor_id)
        if entry is not None:
            return entry.name
    return info.name if info is not None else group_id

def floor_estimate(self, name: str) -> tuple[str | None, float, dict[str, float]]:
    """``(floor group id, its belief mass, the rooms on it)`` for one person's estimate.

    Mass is summed from the full belief, not from ``candidates``: a floor of five rooms
    at 0.08 each is a confident floor and no confident room."""
    track = self.devices.get(name)
    out = None if track is None else track.outputs
    if out is None or out.room == AWAY:
        return None, 0.0 if out is None else out.confidence, {}
    floor = self.floor_of(out.room)
    if floor is None or track is None or track.estimator is None:
        return floor, out.confidence, dict(out.candidates)
    est = track.estimator
    mass = 0.0
    rooms: dict[str, float] = {}
    for i, state in enumerate(est.states):
        if state != AWAY and self.floor_of(state) == floor:
            p = float(est.belief[i])
            mass += p
            if p > CANDIDATE_FLOOR:
                rooms[state] = round(p, 4)
    return floor, round(mass, 4), rooms
```

Import `floor_registry as fr`, `KIND_FLOOR`, `KIND_STRUCTURE`, `KIND_PROPERTY`,
`CANDIDATE_FLOOR`. Verify the kind constant names in `const.py`.

`sensor.py`:

```python
class FloorSensor(PresenceEntity, SensorEntity):
    """Which floor this person is believed to be on: the belief summed over its rooms."""

    _unrecorded_attributes = frozenset({ATTR_ROOMS})

    def __init__(self, presence: PresenceCoordinator, name: str) -> None:
        super().__init__(presence, name, "floor", Platform.SENSOR)

    @property
    def native_value(self) -> str | None:
        out = self.outputs
        if out is None:
            return None
        if out.room == AWAY:
            return AWAY_LABEL
        floor, _, _ = self.presence.floor_estimate(self.person)
        return "Unknown" if floor is None else self.presence.floor_name(floor)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        out = self.outputs
        if out is None:
            return {}
        floor, confidence, rooms = self.presence.floor_estimate(self.person)
        return {
            ATTR_GROUP_ID: floor,
            ATTR_CONFIDENCE: confidence,
            ATTR_ROOMS: {self.presence.room_name(room): p for room, p in rooms.items()},
            ATTR_UPDATED: dt_util.utc_from_timestamp(out.t).isoformat(),
        }
```

Register beside `RoomSensor`: `entities.extend(FloorSensor(presence, name) for name in sorted(presence.devices))`.
`const.py`: `ATTR_ROOMS = "rooms"`. `strings.json` + `translations/en.json`: `"floor": { "name": "Floor" }` under `entity.sensor`.
README entity table row:
`| sensor.<name>_floor | Which floor (or building) a tracked person is on, or Away. Attributes: group_id, confidence (belief summed over the floor's rooms), rooms, updated. |`

- [ ] **Step 4: Run** `uv run pytest tests/test_presence_entities.py tests/test_presence_coordinator.py -q` → PASS. ruff, mypy. `uv run pytest -q` whole suite.
- [ ] **Step 5: Commit** — `feat(presence): a floor sensor per tracked person`

### Task 6: The panel's settings card edits `activity.floor`

**Files:**
- Modify: `frontend/src/types.ts` (`PresenceSettings.activity: { floor: number }`)
- Modify: `frontend/src/al-presence.ts` (label, help, form field, read-back)
- Modify: `frontend/src/model.ts` (`presenceSettings` default for a document without `activity`)
- Test: the existing presence settings vitest file (`grep -rl "stuck_after" frontend/src/*.test.ts frontend/test 2>/dev/null`)
- Rebuild: `custom_components/activity_levels/frontend/activity-levels-panel.js`

**Interfaces:**
- Consumes: Task 3's normalised `presence.activity.floor`.

- [ ] **Step 1: Failing test** — in the presence settings test, assert the form's schema
  includes a field named `activity_floor` and that editing it writes
  `presence.activity.floor` on the draft config (copy the shape of the existing
  `floor`/`stuck_after` test).
- [ ] **Step 2: Run** `cd frontend && pnpm test -- al-presence` → FAIL.
- [ ] **Step 3: Implement** — `LABELS.activity_floor = "Empty-room floor"`,
  `HELP.activity_floor = "Likelihood given to a room whose activity level is 0.0. Lower makes an empty room a stronger 'not here'."`,
  add `"activity_floor"` to the form-field tuple after `floor`, `{ name: "activity_floor", selector: FLOOR_SELECTOR }`
  in the schema, `activity_floor: s.activity.floor` in the data, and
  `activity: { floor: number(v.activity_floor) ?? s.activity.floor }` in the read-back.
  `presenceSettings()` fills `activity: { floor: 0.05 }` when the document has none.
- [ ] **Step 4: Run** `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- [ ] **Step 5: Commit** source and bundle together — `feat(panel): edit the presence empty-room floor`

### Task 7: Release notes and ledger

- [ ] `docs/superpowers/plan9-p1-evidence-ledger.md` records each task's commit range, deviations and deferred minors (same shape as `plan7-topology-presence-ledger.md`).
- [ ] `uv run pytest -q`, `cd frontend && pnpm test && pnpm build`, `git status` clean but for the user's `AGENTS.md`.
- [ ] Commit — `docs(specs): P1 ledger`
