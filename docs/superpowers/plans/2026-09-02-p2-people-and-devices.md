# P2 — People, devices and the joint carried model — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One belief per *person*, fed by every device they carry, with "is this device on
me" a hidden state the filter infers from companion-app signals, the device's own room's
activity and its reading jitter.

**Architecture:** Config gains `presence.people[]` (seeded from `person.*`) and
`presence.carried`. Pure side: `presence/carried.py` (signals → log-odds),
`presence/stuck.py` (the stuck detector, extracted so both filters share it) and
`presence/person.py` (`PersonEstimator`: belief over `(room, carried flags)`; a device's
frame is explained by the person's room when carried and by the device's own `Estimator`
when not). The coordinator keeps one `Estimator` per device ("where is the object") and
runs the person filter over the devices' frames. Entities per person stay; per device a
carried binary sensor and an object-room sensor are added. The panel gets people rows
with device chips and a People editor.

**Tech Stack:** Python 3.14 / numpy / PHACC; Lit + TypeScript + Vite.

**Spec:** `docs/superpowers/specs/2026-09-02-people-devices-and-evidence-design.md` § P2

## Global Constraints

- `presence/` imports no `homeassistant`; `tests/test_purity.py` guards it.
- `presence.carried` defaults: `prior 0.7`, `flip 300s`, weights `charging -3.0`,
  `moving 2.0`, `still_room_empty -2.0`, `jitter 1.0`, `recent 120s`.
- Old `presence.devices[]` keeps validating and normalises to one-device people; the panel
  writes `people`. `presence/state` keeps a top-level `devices` map for one release.
- Entity ids: `sensor.<person>_room|_floor`, `binary_sensor.<person>_moving` (unchanged);
  `binary_sensor.<person>_<device>_carried`, `sensor.<person>_<device>_room`.
- Conventional Commits; bundle and `config.schema.json` committed with their sources.

---

### Task 1: Config — `people`, `carried`, and the legacy `devices` list

**Files:** `schema.py`, `config.schema.json` (regen), `README.md`, `tests/test_schema.py`

**Produces (normalised):**
```python
presence["people"] = [{
  "name": str, "person": str | None,
  "devices": [{"tracker": str, "name": str | None,
               "kind": "phone"|"watch"|"tag"|"laptop"|"other",
               "companion": str | None,
               "signals": {"activity": str|None, "steps": str|None, "battery_state": str|None}}],
}]
presence["carried"] = {"prior": 0.7, "flip": 300.0, "recent": 120.0,
  "weights": {"charging": -3.0, "moving": 2.0, "still_room_empty": -2.0, "jitter": 1.0}}
presence["devices"] == []   # always, after normalisation
```
`_apply_presence_defaults(cfg)`: every legacy `devices[i]` becomes
`{"name": name or tracker, "person": None, "devices": [{"tracker": device, ...defaults}]}`
appended to `people` (skipped when a person already lists that tracker), then `devices` is
emptied. Cross-checks: duplicate person names; a tracker listed twice across people;
`person` must be `person.*`; `companion` a `device_tracker.*`; signals `sensor.*`.

- [ ] Tests: defaults block; legacy migration; each error path pathed; `carried` bounds
  (`prior` in `(0,1)`, `flip` ≥ 1s, `recent` ≥ 1s, weights finite in `[-10, 10]`).
- [ ] Implement; `uv run python scripts/export_schema.py`; README config block.
- [ ] Commit `feat(config): presence.people and presence.carried`

### Task 2: `presence/carried.py` and `presence/stuck.py`

**Produces:**
```python
# carried.py
@dataclass(frozen=True) class Signals: charging: bool|None=None; moving: bool|None=None; still_room_empty: bool|None=None; jitter: bool|None=None
@dataclass(frozen=True) class Weights: charging: float=-3.0; moving: float=2.0; still_room_empty: float=-2.0; jitter: float=1.0
def log_odds(signals: Signals, weights: Weights) -> float   # sum of weights whose signal is True
def logit(p: float) -> float
# stuck.py
class StuckDetector:
    def __init__(self, stuck_after: float) -> None
    def check(self, t: float, logp: float) -> bool   # True = reset now (history cleared)
    def clear(self) -> None
```
`Estimator._check_stuck` moves its body into `StuckDetector` (same frozen-threshold
semantics, same constants `HISTORY`, `MIN_HISTORY`); `Estimator` keeps `resets`.

- [ ] Tests: `log_odds` by table (None contributes 0; all four True = sum); `StuckDetector`
  reproduces `tests/test_estimator.py`'s stuck cases (run that file unchanged).
- [ ] Commit `refactor(presence): share the stuck detector; add the carried log-odds`

### Task 3: `PersonObservation` and `PersonEstimator`

**Files:** `presence/observation.py` (+`DeviceFrame`, `PersonObservation`),
`presence/person.py`, `presence/estimator.py` (+`log_marginal`, `room_belief`),
`tests/test_person.py`, `tests/test_estimator_properties.py`

**Produces:**
```python
@dataclass(frozen=True) class DeviceFrame: distances: Mapping[str, float|None]; home: bool = True; signals: Signals = Signals()
@dataclass(frozen=True) class PersonObservation: t: float; devices: Mapping[str, DeviceFrame]; activity: Mapping[str, RoomActivity] = {}

class Estimator:
    def log_marginal(self, obs: Observation) -> float   # logsumexp(log(Tᵀ·belief) + log_emission(obs)); no mutation
    @property def room_belief(self) -> NDArray          # == belief

@dataclass(frozen=True) class PersonOutputs(Outputs): carried: dict[str, float]; device_rooms: dict[str, str]

class PersonEstimator:
    def __init__(self, topology, devices: Mapping[str, Estimator], *, stay, escape, prior, flip, weights: Weights, stuck_after)
    states; device_ids: tuple[str, ...]; belief: NDArray (R, 2**D); room_belief -> NDArray (R,)
    def update(self, obs: PersonObservation) -> PersonOutputs
    def locate(self, room: str) -> None                  # P3 uses it: room mass to one room, carried marginals kept
    def outputs(self, t=None) -> PersonOutputs; path(); snapshot(); restore()
```
Update: `dt = t − last_t` (0 on first); `p = 1 − exp(−dt/flip)`; `C = ⊗ [[1−p,p],[p,1−p]]`;
`predicted = Tᵀ·B·C`; per device `L_d = est.log_emission(Observation(t, frame.distances, frame.home))`,
`M_d = est.log_marginal(same)`, `S_d = logit(prior) + log_odds(frame.signals, weights)`;
`E[r,c] = A[r] + Σ_d (c_d·(L_d[r] + S_d) + (1−c_d)·M_d)` where `A` is
`Estimator._log_activity` computed once via any device estimator with the person's
`activity_floor` (share the code: move `_log_activity` to a module function
`log_activity(obs_activity, states, position, activity_floor)`); `B ← normalise(predicted·exp(E − max E))`;
the Viterbi buffer stores `logsumexp_c E[r,c]`; the stuck detector runs on
`log Σ predicted·exp(E)`. A device absent from `obs.devices` contributes nothing this frame.

- [ ] Tests: belief stays a distribution over `(R, 2^D)` (hypothesis); one device with
  `prior=1` (and `flip` huge) reproduces `Estimator`'s room marginal to 1e-9 over a random
  walk; the last-night scenario — phone reads theater and does not jitter, watch reads
  kitchen and jitters, theater level 0.0 → within 30 frames `room == kitchen` and
  `carried[phone] < 0.5`; `locate` moves room mass and keeps carried marginals;
  snapshot/restore round trip and refusal on a changed device list.
- [ ] Commit `feat(presence): a person estimator over rooms and carried devices`

### Task 4: Coordinator — people, devices, signals, frames

**Files:** `presence_coordinator.py`, `entity.py`, `tests/fixtures.py` (+`fake_person`,
`fake_companion`), `tests/test_presence_coordinator.py`

**Produces:**
```python
@dataclass class TrackedDevice: id: str; name: str; kind: str; tracker: str; device_id: str|None; sensors: dict[str,str]; companion: str|None; signals: dict[str, str|None]; found: dict[str,bool]; estimator: Estimator|None; outputs: Outputs|None; closest: deque[tuple[float,float]]; steps: tuple[float,float]|None
@dataclass class TrackedPerson: name: str; person: str|None; devices: dict[str, TrackedDevice]; estimator: PersonEstimator|None; outputs: PersonOutputs|None
PresenceCoordinator.people: dict[str, TrackedPerson]
PresenceCoordinator.devices -> dict[str, TrackedPerson]   # property alias, one release
```
`_discover`: seed from `person.*` state attribute `device_trackers` (registry platform
`bermuda` → device; `mobile_app` → companion, paired when exactly one of each); merge
config devices by tracker; Bermuda sensors per device as today; signals by companion
registry device, `unique_id.endswith(("_activity","_steps","_battery_state"))`, explicit
wins; `found[name]` says whether the entity exists. Device id = slug of its name, unique
within the person.
`_frame(device, t)`: distances (metres), home, `Signals(charging=battery_state in {charging, full},
moving=activity in {walking, running, automotive, cycling} or steps rose within recent,
still_room_empty=device room's evidence level == 0 and not moving, jitter=range of closest
distance over recent > scale/3)`.
`_observe`: person filter first (it reads the device filters' *predicted* beliefs), then
each device filter; occupancy from person outputs. Subscriptions widen to signal entities.
Persistence: `{"people": {name: snapshot}, "devices": {name/id: snapshot}}`; the old
`beliefs` key restores into the person filter when it has one device.
`PresenceEntity.outputs` reads `people`.

- [ ] Tests: seeding + pairing; explicit config wins; signals discovered and marked
  found/not found; a charging phone's carried marginal falls below the prior after a few
  frames; the legacy `devices` config still yields `sensor.scott_room`; persistence round
  trip; the parked-phone/watch scenario end to end with the kitchen motion on.
- [ ] Commit `feat(coordinator): one belief per person, over the devices they carry`

### Task 5: Entities, websocket payload, diagnostics

**Files:** `sensor.py`, `binary_sensor.py`, `entity.py`, `const.py`, `strings.json`,
`translations/en.json`, `presence_coordinator.py` (`payload`, `diagnostics`), `README.md`,
`tests/test_presence_entities.py`, `tests/test_websocket.py`

- `DeviceEntity(PresenceEntity)`: unique id `…-presence-<person>-<device>-<suffix>`, entity
  id `<platform>.<person>_<device>_<suffix>`, on the person's device.
- `CarriedBinarySensor` (`_carried`, device class `presence`, attribute `probability`);
  `DeviceRoomSensor` (`_room`, attributes `group_id`, `confidence`, `updated`).
- `payload()["people"] = {name: {**outputs.as_dict(), "devices": {id: {name, kind, room,
  confidence, carried, signals: {…, found}}}}}`; `payload()["devices"]` kept.
- [ ] Commit `feat(presence): carried and object-room entities per device`

### Task 6: Panel — people rows, device chips, People editor

**Files:** `frontend/src/types.ts`, `model.ts`, `al-presence.ts`, new `al-people-editor.ts`,
tests, bundle.

- Types: `PresencePerson`, `PresenceDeviceConfig`, `CarriedSettings`, `PersonOutputs`,
  `PresenceState.people`.
- People card: a row per person (room, floor, confidence, breadcrumb) and a chip per device
  (kind icon `mdi:cellphone|watch|tag|laptop|bluetooth`, carried %, parked room).
- `al-people-editor`: list of people; per person name, `person.*` picker, devices; per
  device tracker picker (Bermuda `device_tracker`), kind select, companion picker
  (`mobile_app` `device_tracker`), three sensor pickers with a "found/not found" mark
  from `presence/state`. Writes `presence.people`. The Settings card's `devices` picker is
  replaced by it; `carried` fields join the settings form (`carried_prior`, `carried_flip`,
  `carried_recent`, and the four weights).
- [ ] Commit `feat(panel): people, their devices, and what is carried`

### Task 7: Ledger + spec alignment

- [ ] `docs/superpowers/plan10-p2-people-ledger.md`; spec § P2 amended for any ruling.
