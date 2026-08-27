# Topology and Presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Model which rooms connect to which, and use that graph to turn Bermuda's noisy BLE distance readings into a room-per-person estimate that never jumps between rooms with no path between them, says when someone is *on the move* and along which path, and feeds "someone is here" into each room's activity level as a visible synthetic channel. The adjacency graph is useful on its own; the whole presence side is opt-in and exists only when Bermuda is installed.

**Architecture:** Two pure modules first — `topology.py` (nodes, edges, one-way, bounded simple paths, reachability, the transition matrix, the scanner→room mapping rule) and `presence/estimator.py` (a hidden-Markov filter per tracked device: emission in log space, forward step, stuck detector, bounded Viterbi, snapshot/restore), with `presence/observation.py` holding the plain `Observation` dataclass and the two Bermuda-shaped parsers. Then the engine seam: every room group gains a visible `presence` channel built like the hidden trigger voice, driven by `coordinator.set_occupied`. Then `PresenceCoordinator`, a second coordinator modelled on `PatternsCoordinator`: registry discovery, repair issues, a 500 ms observation debounce, occupancy → note-on/off, a `Store`, a websocket payload and diagnostics. Then entities, then the panel: `topology.ts` (pure layout/paths), `al-graph-map` (hand-drawn SVG in Lit like `al-envelope-sketch`), `al-presence` (a data-driven tab like `al-patterns`), and adjacency/exit fields in the shared `group-form.ts`.

**Tech Stack:** Python 3.14 / uv / pytest (+ hypothesis) / ruff / mypy strict under `custom_components/activity_levels`; numpy 2.3.2 (already a manifest requirement) confined to `topology.py` and `presence/estimator.py`; Lit 3 / TypeScript strict / Vite lib build / vitest (jsdom) / pnpm under `frontend/`.

**Spec:** `docs/superpowers/specs/2026-08-27-topology-and-presence-design.md` (binding). Prior context: `2026-08-25-activity-levels-design.md` (engine, envelopes, tree), `2026-08-26-patterns-and-simulation-design.md` (the secondary-coordinator pattern), `2026-08-27-mixer-v2-design.md` (the controls row and its stimuli list).

## Global Constraints

- Repo `/Users/sholodak/elevenrose/activity-levels`, branch `main`. **Always set cwd explicitly** on every command (`cd /Users/sholodak/elevenrose/activity-levels && …`): an unrelated repo lives at `…/ActivityLevels` and the shell resets between calls.
- Home Assistant **2026.8.3**; Python **>=3.14.2,<3.15**; `numpy==2.3.2` is already in `manifest.json` — do not add, bump or introduce any other Python dependency.
- **No new frontend libraries.** The graph map is hand-drawn SVG in Lit, exactly as `al-envelope-sketch` and `al-timeline` are. `pnpm add` is out of scope.
- The built bundle at `custom_components/activity_levels/frontend/activity-levels-panel.js` is **committed**: after any `frontend/src` change run `pnpm build` and stage the bundle in the same commit. CI runs `git diff --exit-code -- ../custom_components/activity_levels/frontend`.
- `uv run ruff check .`, `uv run ruff format --check .` and `uv run mypy` (strict, `files = ["custom_components/activity_levels"]`) must stay green. `frontend`: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- **Conventional Commits**, using the types `release-please-config.json` knows: `feat`, `fix`, `perf`, `refactor`, `docs`, `deps`, `chore`, `ci`, `test`, `build`, `style`, `revert`. Every task ends in exactly one commit with the subject given.
- **Never stage `brands/`** — it is a separate upstream PR. Always use explicit `git add <paths>`; never `git add -A` or `git add .`.
- **`CHANGELOG.md` is release-please-owned. Do not edit it.**
- **Presence is entirely opt-in.** With `presence` absent or `enabled: false`: no `PresenceCoordinator`, no presence channel on any group, no presence entities, no repair issues, and the Presence tab is not offered. Adjacency still validates, `topology.py` still builds, and `activity_levels/topology` still answers. An existing configuration must validate unchanged and produce byte-identical entity ids.
- numpy stays in `topology.py` and `presence/estimator.py`. `presence_coordinator.py` is plain-Python glue: no `import numpy` in it, ever.
- The engine package (`engine/`) still may not import `homeassistant`. `topology.py` and `presence/` may not import `homeassistant` either (`presence_coordinator.py`, which is *not* in `presence/`, may).

---

## File structure

```
custom_components/activity_levels/
  topology.py                  NEW  pure: Edge/Topology, build_topology, room_ids, paths,
                                    reachable, transition_matrix, map_scanners, payload
  presence/__init__.py         NEW  package docstring; numpy allowed here, homeassistant not
  presence/observation.py      NEW  Observation dataclass + Bermuda parsers (scanner_key,
                                    parse_distance, BERMUDA_DOMAIN, UNREACHABLE)
  presence/estimator.py        NEW  Estimator (emission/update/outputs/path/snapshot/restore)
                                    and Outputs
  presence_coordinator.py      NEW  discovery, repair issues, debounce, occupancy, Store,
                                    websocket payload, diagnostics
  const.py                     MOD  CONF_PRESENCE, PRESENCE_KEY, AWAY, MODEL_PRESENCE,
                                    presence attrs, issue ids, presence storage key
  schema.py                    MOD  adjacent/exit/group presence overrides + `presence:` block
                                    and their cross-checks
  tree.py                      MOD  _presence_voice, presence channel on room groups,
                                    GroupInfo.presence
  coordinator.py               MOD  set_occupied, presence in voice_states/snapshot/restore
  runtime.py                   MOD  RuntimeData.topology, RuntimeData.presence
  __init__.py                  MOD  build the topology, construct the presence coordinator when
                                    enabled, presence devices, device pruning moved out
  entity.py                    MOD  PresenceEntity base (device "Presence: <name>")
  sensor.py                    MOD  RoomSensor, OccupantsSensor
  binary_sensor.py             MOD  MovingBinarySensor
  websocket_api.py             MOD  topology, topology/paths, presence/state
  diagnostics.py               MOD  topology + presence blocks
  strings.json                 MOD  entity names for room/moving/occupants + `issues`
  translations/en.json         MOD  same, mirrored
tests/
  test_topology.py             NEW  graph, one-way, paths, reachable, transition rows, scanners
  test_estimator.py            NEW  emission, walk recovery, impossible jump, stuck, away, Viterbi
  test_estimator_properties.py NEW  hypothesis invariants
  test_presence_coordinator.py NEW  discovery, repair issues, debounce, occupancy, persistence
  test_presence_entities.py    NEW  entity states/attributes, opt-out builds nothing
  test_websocket_topology.py   NEW  topology, topology/paths, presence/state
  fixtures.py                  MOD  rooms_config(), presence_config(), fake_bermuda()
  test_schema.py               MOD  adjacency/exit/presence validation
  test_tree.py                 MOD  presence channel, label collisions
  test_coordinator.py          MOD  set_occupied, persistence of the presence voice
frontend/src/
  topology.ts                  NEW  pure: branches, layout, edgePoint, edgeBetween, pathEdges
  al-graph-map.ts              NEW  SVG map: nodes, edges, one-way arrows, door glyphs, people
  al-presence.ts               NEW  Presence tab: map, device rows, scanner table, settings card
  types.ts                     MOD  Adjacency, PresenceOverrides, PresenceSettings, Topology*,
                                    PresenceState; Group/Config additions
  model.ts                     MOD  newPresenceOverrides, adjacencyId, isOneWay, roomIds,
                                    presenceSettings
  group-form.ts                MOD  adjacent + exit fields, merge, adjacency error folding
  errors.ts                    MOD  listFieldError
  api.ts                       MOD  getTopology, getTopologyPaths, getPresenceState
  al-strip-controls.ts         MOD  presence stimulus row in the stimuli list
  activity-levels-panel.ts     MOD  conditional Presence tab + wiring
frontend/test/
  topology.test.ts             NEW  layout determinism, rows/cols, path edges
  al-graph-map.test.ts         NEW  rendering, selection, moving person placement
  al-presence.test.ts          NEW  tables, settings edits, path listing
  group-form.test.ts           NEW  adjacency/exit schema, data, merge
  al-strip-controls.test.ts    MOD  presence stimulus row
  activity-levels-panel.test.ts MOD tab gating
docs / examples
  README.md                    MOD  Rooms & presence section, entities, config reference
  examples/house.yaml          MOD  adjacency + exits for the real rooms, example presence block
```

---

### Task 1: Schema — adjacency, exits, group presence overrides, the `presence` block

**Files:** modify `custom_components/activity_levels/const.py`, `custom_components/activity_levels/schema.py`; tests `tests/test_schema.py`, `tests/fixtures.py`.

**Interfaces:**
```python
# const.py
CONF_PRESENCE = "presence"
PRESENCE_KEY = "presence"           # the synthetic channel's label, like TRIGGER_KEY
AWAY = "away"                       # the state that is not a room
MODEL_PRESENCE = "Presence"
PRESENCE_STORAGE_VERSION = 1
def presence_storage_key(entry_id: str) -> str: ...
ATTR_CONFIDENCE = "confidence"; ATTR_MOVING = "moving"; ATTR_CANDIDATES = "candidates"
ATTR_PATH = "path"; ATTR_UPDATED = "updated"; ATTR_WHO = "who"
ISSUE_BERMUDA_MISSING = "bermuda_missing"; ISSUE_NOT_BERMUDA = "not_a_bermuda_device"
ISSUE_DISABLED_SENSORS = "disabled_distance_sensors"
ISSUE_UNMAPPED_SCANNERS = "unmapped_scanners"; ISSUE_TRANSITION = "transition_infeasible"

# schema.py
ADJACENT_SCHEMA: vol.Schema      # {id: <group id>, one_way: bool = False}
GROUP_PRESENCE_SCHEMA: vol.Schema  # {gain: float = 1.0, envelope: str | None} + EnvelopeOverrides
PRESENCE_DEVICE_SCHEMA: vol.Schema # {device: device_tracker.*, name: str | None}
PRESENCE_SCHEMA: vol.Schema        # enabled/devices/envelope/threshold/stay/escape/scale/
                                   # floor/stuck_after/scanner_areas
# group schema gains: adjacent: list[{id, one_way}] = [], exit: bool = False,
#                     presence: GROUP_PRESENCE_SCHEMA = {}
# CONFIG_SCHEMA gains: presence: PRESENCE_SCHEMA = {}
```

Validated defaults, exactly: `enabled=False`, `devices=[]`, `envelope=None`, `threshold=0.6`, `stay=0.9`, `escape=0.001`, `scale=3.0`, `floor=0.05`, `stuck_after=60.0`, `scanner_areas={}`.

- [ ] **Step 1: Tests first (RED).** Add to `tests/fixtures.py`:

```python
def rooms_config() -> dict[str, Any]:
    """A house with a real adjacency graph: two rooms, a hall, a patio you can leave by.

    `house` and `downstairs` declare no edges, so they are branches, not rooms -- which
    is what every topology test needs to have something to drop.
    """
    return {
        "version": 1,
        "defaults": {"envelope": "default", "min_wake_interval": 1},
        "envelopes": [{"id": "default", "release": "30m"}, {"id": "hour", "release": "1h"}],
        "groups": [
            {
                "id": "house",
                "name": "House",
                "mix": "max",
                "children": [
                    {
                        "id": "downstairs",
                        "name": "Downstairs",
                        "mix": "max",
                        "children": [
                            {
                                "id": "kitchen",
                                "name": "Kitchen",
                                "area": "kitchen_area",
                                "adjacent": ["dining_room", "back_patio"],
                                "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
                            },
                            {
                                "id": "dining_room",
                                "name": "Dining Room",
                                "area": "dining_area",
                                "adjacent": ["hall"],
                                "stimuli": [{"entity": "binary_sensor.dining_motion"}],
                            },
                            {
                                "id": "hall",
                                "name": "Hall",
                                "area": "hall_area",
                                "adjacent": [{"id": "bedroom", "one_way": True}],
                                "stimuli": [{"entity": "binary_sensor.hall_motion"}],
                            },
                            {
                                "id": "bedroom",
                                "name": "Bedroom",
                                "area": "bedroom_area",
                                "stimuli": [{"entity": "binary_sensor.bedroom_motion"}],
                            },
                            {
                                "id": "back_patio",
                                "name": "Back Patio",
                                "area": "patio_area",
                                "exit": True,
                                "stimuli": [{"entity": "binary_sensor.patio_motion"}],
                            },
                        ],
                    }
                ],
            }
        ],
    }


def presence_config() -> dict[str, Any]:
    """`rooms_config` with presence switched on and one tracked phone."""
    config = rooms_config()
    config["presence"] = {
        "enabled": True,
        "devices": [{"device": "device_tracker.scotts_phone", "name": "Scott"}],
        "envelope": "hour",
        "threshold": 0.6,
        "stuck_after": 60,
    }
    config["groups"][0]["children"][0]["children"][0]["presence"] = {"gain": 2.0}
    return config
```

Then in `tests/test_schema.py`:

```python
def test_adjacency_and_exits_normalize() -> None:
    cfg = validate_config(rooms_config())
    rooms = {g["id"]: g for g in cfg["groups"][0]["children"][0]["children"]}
    assert rooms["kitchen"]["adjacent"] == [
        {"id": "dining_room", "one_way": False},
        {"id": "back_patio", "one_way": False},
    ]
    assert rooms["hall"]["adjacent"] == [{"id": "bedroom", "one_way": True}]
    assert rooms["back_patio"]["exit"] is True
    assert rooms["kitchen"]["exit"] is False
    assert rooms["kitchen"]["presence"]["gain"] == 1.0
    assert rooms["kitchen"]["presence"]["envelope"] is None


def test_presence_defaults_and_absence() -> None:
    assert validate_config(house_config())["presence"] == {
        "enabled": False,
        "devices": [],
        "envelope": None,
        "threshold": 0.6,
        "stay": 0.9,
        "escape": 0.001,
        "scale": 3.0,
        "floor": 0.05,
        "stuck_after": 60.0,
        "scanner_areas": {},
    }


@pytest.mark.parametrize(
    ("mutate", "path", "fragment"),
    [
        (lambda c: c["groups"][0]["children"][0]["children"][0].update(adjacent=["nope"]),
         "groups/0/children/0/children/0/adjacent/0", "unknown group"),
        (lambda c: c["groups"][0]["children"][0]["children"][0].update(adjacent=["kitchen"]),
         "groups/0/children/0/children/0/adjacent/0", "itself"),
        (lambda c: c["groups"][0]["children"][0]["children"][0].update(
            adjacent=["hall", "hall"]),
         "groups/0/children/0/children/0/adjacent/1", "duplicate"),
        (lambda c: c["groups"][0]["children"][0]["children"][0].update(
            presence={"envelope": "nope"}),
         "groups/0/children/0/children/0/presence/envelope", "unknown envelope"),
    ],
)
def test_adjacency_errors_are_pathed(mutate, path, fragment) -> None:
    config = rooms_config()
    mutate(config)
    with pytest.raises(ConfigError) as err:
        validate_config(config)
    assert any(e["path"] == path and fragment in e["message"] for e in err.value.errors)


@pytest.mark.parametrize(
    ("presence", "path"),
    [
        ({"devices": [{"device": "sensor.not_a_tracker"}]}, "presence/devices/0/device"),
        ({"threshold": 0}, "presence/threshold"),
        ({"threshold": 1.5}, "presence/threshold"),
        ({"stay": 1.0}, "presence/stay"),
        ({"escape": 0.2}, "presence/escape"),
        ({"scale": 0}, "presence/scale"),
        ({"floor": 0}, "presence/floor"),
        ({"stuck_after": 0}, "presence/stuck_after"),
        ({"envelope": "nope"}, "presence/envelope"),
        ({"scanner_areas": {"abc": "nope"}}, "presence/scanner_areas/abc"),
    ],
)
def test_presence_field_errors(presence, path) -> None:
    config = rooms_config()
    config["presence"] = {"enabled": True, **presence}
    with pytest.raises(ConfigError) as err:
        validate_config(config)
    assert any(e["path"] == path for e in err.value.errors)


def test_presence_threshold_one_and_escape_zero_are_allowed() -> None:
    config = rooms_config()
    config["presence"] = {"enabled": True, "threshold": 1.0, "escape": 0.0}
    assert validate_config(config)["presence"]["threshold"] == 1.0


def test_duplicate_tracked_device_and_name() -> None:
    config = rooms_config()
    config["presence"] = {
        "enabled": True,
        "devices": [
            {"device": "device_tracker.phone", "name": "Scott"},
            {"device": "device_tracker.phone", "name": "Scott"},
        ],
    }
    with pytest.raises(ConfigError) as err:
        validate_config(config)
    paths = {e["path"] for e in err.value.errors}
    assert {"presence/devices/1/device", "presence/devices/1/name"} <= paths


def test_a_stimulus_cannot_be_called_presence() -> None:
    config = rooms_config()
    config["groups"][0]["children"][0]["children"][0]["stimuli"].append(
        {"entity": "binary_sensor.other", "key": "presence"}
    )
    with pytest.raises(ConfigError) as err:
        validate_config(config)
    assert any("duplicate stimulus 'presence'" in e["message"] for e in err.value.errors)
```

Run `cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_schema.py -q` — expect failures naming `extra keys not allowed @ data['adjacent']` and `KeyError: 'presence'`.

- [ ] **Step 2: Implement.** In `const.py` add the constants above (`AWAY`, `PRESENCE_KEY` and `CONF_PRESENCE` next to `TRIGGER_KEY`/`CONF_SIMULATION`; `presence_storage_key` next to `storage_key`).

In `schema.py`, give `_finite` an exclusive upper bound and factor the envelope overrides out of `STIMULUS_SCHEMA` so one definition serves both it and the group's presence block:

```python
def _finite(
    lo: float | None = None,
    lo_exclusive: bool = False,
    hi: float | None = None,
    hi_exclusive: bool = False,
) -> Any:
    def check(value: Any) -> float:
        if isinstance(value, bool) or not isinstance(value, int | float):
            raise vol.Invalid("must be a number")
        f = float(value)
        if not math.isfinite(f):
            raise vol.Invalid("must be finite")
        if lo is not None and (f <= lo if lo_exclusive else f < lo):
            raise vol.Invalid(f"must be {'>' if lo_exclusive else '>='} {lo}")
        if hi is not None and (f >= hi if hi_exclusive else f > hi):
            raise vol.Invalid(f"must be {'<' if hi_exclusive else '<='} {hi}")
        return f

    return check


_device_tracker = vol.All(cv.entity_id, cv.entity_domain("device_tracker"))

# Every field a stimulus may override on its preset. Named once, because a group's
# presence voice takes exactly the same set.
_ENVELOPE_OVERRIDES: dict[Any, Any] = {
    vol.Optional("attack", default=None): vol.Any(None, parse_duration),
    vol.Optional("decay", default=None): vol.Any(None, parse_duration),
    vol.Optional("sustain", default=None): vol.Any(None, _finite(0.0, hi=1.0)),
    vol.Optional("release", default=None): vol.Any(None, parse_duration),
    vol.Optional("impulse", default=None): vol.Any(None, cv.boolean),
    vol.Optional("retrigger", default=None): vol.Any(None, _ENUM["retrigger"]),
    vol.Optional("unavailable", default=None): vol.Any(None, _ENUM["unavailable"]),
    vol.Optional("debounce", default=None): vol.Any(None, parse_duration),
}

STIMULUS_SCHEMA = vol.Schema(
    {
        vol.Required("entity"): cv.entity_id,
        vol.Optional("to", default=["on"]): _to_states,
        vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
        vol.Optional("key", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
        vol.Optional("envelope", default=None): vol.Any(None, _group_id),
        **_ENVELOPE_OVERRIDES,
    }
)

ADJACENT_SCHEMA = vol.Schema(
    {
        vol.Required("id"): _group_id,
        vol.Optional("one_way", default=False): cv.boolean,
    }
)


def _adjacent(value: Any) -> dict[str, Any]:
    """`kitchen` and `{id: kitchen, one_way: true}` both name one edge.

    The short form is what a door is: symmetric. The long form exists for the rare
    thing that is not -- a laundry chute -- and stays YAML-only in v1.
    """
    if isinstance(value, str):
        value = {"id": value}
    if not isinstance(value, dict):
        raise vol.Invalid("must be a group id or {id, one_way}")
    result: dict[str, Any] = ADJACENT_SCHEMA(value)
    return result


GROUP_PRESENCE_SCHEMA = vol.Schema(
    {
        vol.Optional("gain", default=1.0): _finite(0.0, lo_exclusive=True),
        vol.Optional("envelope", default=None): vol.Any(None, _group_id),
        **_ENVELOPE_OVERRIDES,
    }
)

PRESENCE_DEVICE_SCHEMA = vol.Schema(
    {
        vol.Required("device"): _device_tracker,
        vol.Optional("name", default=None): vol.Any(None, vol.All(str, vol.Length(min=1))),
    }
)

PRESENCE_SCHEMA = vol.Schema(
    {
        vol.Optional("enabled", default=False): cv.boolean,
        vol.Optional("devices", default=list): [PRESENCE_DEVICE_SCHEMA],
        vol.Optional("envelope", default=None): vol.Any(None, _group_id),
        vol.Optional("threshold", default=0.6): _finite(0.0, lo_exclusive=True, hi=1.0),
        vol.Optional("stay", default=0.9): _finite(
            0.0, lo_exclusive=True, hi=1.0, hi_exclusive=True
        ),
        vol.Optional("escape", default=0.001): _finite(0.0, hi=0.1),
        vol.Optional("scale", default=3.0): _finite(0.0, lo_exclusive=True),
        vol.Optional("floor", default=0.05): _finite(0.0, lo_exclusive=True, hi=1.0),
        vol.Optional("stuck_after", default=60.0): vol.All(parse_duration, vol.Range(min=1.0)),
        # keyed by the scanner's device-registry id (or its Bermuda address); the value
        # is the room it is in, overriding whatever its area says
        vol.Optional("scanner_areas", default=dict): {cv.string: _group_id},
    }
)
```

In `_group_schema`'s inner `vol.Schema`, after `stimuli`:

```python
            vol.Optional("adjacent", default=list): [_adjacent],
            vol.Optional("exit", default=False): cv.boolean,
            vol.Optional(CONF_PRESENCE, default=dict): GROUP_PRESENCE_SCHEMA,
```

and in `CONFIG_SCHEMA`, after `CONF_GROUPS`: `vol.Optional(CONF_PRESENCE, default=dict): PRESENCE_SCHEMA`. Add `CONF_PRESENCE: {}` to `default_options()` so a freshly created entry round-trips the key.

In `_cross_checks`, reserve the label, remember the groups for a second pass, and check the presence block once the whole id set is known:

```python
    seen_groups: set[str] = set()
    walked: list[tuple[list[Any], dict[str, Any]]] = []

    def walk(group: dict[str, Any], path: list[Any]) -> None:
        ...
        walked.append((list(path), group))
        labels: set[str] = {TRIGGER_KEY, PRESENCE_KEY}   # both synthetic channels
        ...
        presence = group[CONF_PRESENCE]
        if presence["envelope"] is not None and presence["envelope"] not in envelope_ids:
            errors.append(
                {
                    "path": _path([*path, CONF_PRESENCE, "envelope"]),
                    "message": "unknown envelope",
                }
            )
        ...

    for i, group in enumerate(cfg[CONF_GROUPS]):
        walk(group, [CONF_GROUPS, i])

    # Adjacency can only be checked once every id is known: an edge is allowed to point
    # forwards, at a room the walk has not reached yet.
    for path, group in walked:
        seen_edges: set[str] = set()
        for j, edge in enumerate(group["adjacent"]):
            epath = _path([*path, "adjacent", j])
            if edge["id"] == group["id"]:
                errors.append({"path": epath, "message": "a group cannot be adjacent to itself"})
            elif edge["id"] not in seen_groups:
                errors.append({"path": epath, "message": f"unknown group '{edge['id']}'"})
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
    for scanner, gid in presence["scanner_areas"].items():
        if gid not in seen_groups:
            errors.append(
                {
                    "path": _path([CONF_PRESENCE, "scanner_areas", scanner]),
                    "message": f"unknown group '{gid}'",
                }
            )
```

Import `CONF_PRESENCE` and `PRESENCE_KEY` from `.const` at the top of `schema.py`.

- [ ] **Step 3: Gate and commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_schema.py -q
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest -q
cd /Users/sholodak/elevenrose/activity-levels && uv run ruff check . && uv run ruff format --check . && uv run mypy
```

Expected: every test passes, including the untouched `test_websocket.py`/`test_init.py` (an existing config validates unchanged; only the new keys appear, with their defaults).

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/const.py custom_components/activity_levels/schema.py tests/test_schema.py tests/fixtures.py && git commit -m "feat(schema): room adjacency, exits and the opt-in presence block"
```

---


### Task 2: `topology.py` — the pure graph, plus the `topology` websocket commands

**Files:** create `custom_components/activity_levels/topology.py`, `tests/test_topology.py`, `tests/test_websocket_topology.py`; modify `custom_components/activity_levels/runtime.py`, `custom_components/activity_levels/__init__.py`, `custom_components/activity_levels/websocket_api.py`, `custom_components/activity_levels/diagnostics.py`.

**Interfaces:**
```python
MAX_HOPS = 8

class TopologyError(ValueError): ...

@dataclass(frozen=True)
class Edge:
    a: str
    b: str
    one_way: bool          # True only when b does not reach back to a

@dataclass(frozen=True)
class Topology:
    nodes: tuple[str, ...]                       # rooms, in tree pre-order
    edges: tuple[Edge, ...]                      # one entry per unordered pair
    exits: frozenset[str]
    out: Mapping[str, frozenset[str]]            # directed room adjacency, rooms only
    order: tuple[tuple[str, str | None], ...]    # every group + its area, pre-order

    @property
    def states(self) -> tuple[str, ...]                       # nodes + ("away",)
    def index(self, state: str) -> int
    def neighbours(self, node: str) -> tuple[str, ...]
    def is_adjacent(self, a: str, b: str) -> bool              # directed, respects one_way
    def connected(self, a: str, b: str) -> bool                # undirected, away <-> exits
    def paths(self, a: str, b: str, max_hops: int = MAX_HOPS) -> list[list[str]]
    def reachable(self, a: str, hops: int) -> frozenset[str]   # includes a
    def feasible(self, stay: float, escape: float) -> str | None   # None = usable
    def transition_matrix(self, stay: float, escape: float) -> npt.NDArray[np.float64]
    def map_scanners(
        self,
        scanners: Mapping[str, str | None],        # scanner key -> area id
        overrides: Mapping[str, str] | None = None,
    ) -> tuple[dict[str, str], list[str]]          # (key -> room), sorted unmapped keys
    def payload(self) -> dict[str, Any]            # {nodes, edges: [[a,b,one_way]], exits}

def build_topology(config: Mapping[str, Any]) -> Topology
def room_ids(config: Mapping[str, Any]) -> frozenset[str]

# runtime.py
@dataclass
class RuntimeData:
    coordinator: ActivityLevelsCoordinator
    patterns: PatternsCoordinator
    topology: Topology
    presence: PresenceCoordinator | None = None    # filled in by Task 5

# websocket payloads
# activity_levels/topology            -> {"nodes": [id], "edges": [[a, b, one_way]], "exits": [id]}
# activity_levels/topology/paths      -> {"paths": [[id, ...], ...]}
#   msg: {from: str, to: str, max_hops: int = 8}; errors "not_found" for a non-room
```

- [ ] **Step 1: Tests first (RED).** `tests/test_topology.py`:

```python
import numpy as np
import pytest

from custom_components.activity_levels.const import AWAY
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import (
    TopologyError,
    build_topology,
    room_ids,
)
from tests.fixtures import house_config, rooms_config


@pytest.fixture
def topo():
    return build_topology(validate_config(rooms_config()))


def test_only_rooms_are_nodes_in_pre_order(topo) -> None:
    # house and downstairs declare no edge and no exit: they are branches, not rooms
    assert topo.nodes == ("kitchen", "dining_room", "hall", "bedroom", "back_patio")
    assert topo.exits == frozenset({"back_patio"})
    assert topo.states == ("kitchen", "dining_room", "hall", "bedroom", "back_patio", AWAY)


def test_edges_are_symmetric_unless_declared_one_way(topo) -> None:
    assert topo.is_adjacent("kitchen", "dining_room")
    assert topo.is_adjacent("dining_room", "kitchen")   # declared once, works both ways
    assert topo.is_adjacent("hall", "bedroom")
    assert not topo.is_adjacent("bedroom", "hall")      # the one-way chute
    assert topo.neighbours("kitchen") == ("back_patio", "dining_room")
    assert [(e.a, e.b, e.one_way) for e in topo.edges] == [
        ("kitchen", "dining_room", False),
        ("kitchen", "back_patio", False),
        ("dining_room", "hall", False),
        ("hall", "bedroom", True),
    ]


def test_a_room_only_reached_one_way_is_still_a_node() -> None:
    config = rooms_config()
    # bedroom declares nothing; it exists only because hall points at it
    assert "bedroom" in build_topology(validate_config(config)).nodes


def test_stale_ids_are_dropped_rather_than_crashing() -> None:
    """The schema rejects these; a document that got in another way loses the edge."""
    config = validate_config(rooms_config())
    rooms = config["groups"][0]["children"][0]["children"]
    rooms[0]["adjacent"].append({"id": "atlantis", "one_way": False})
    topo = build_topology(config)
    assert "atlantis" not in topo.nodes
    assert topo.neighbours("kitchen") == ("back_patio", "dining_room")


def test_paths_are_simple_and_bounded(topo) -> None:
    assert topo.paths("kitchen", "hall") == [["kitchen", "dining_room", "hall"]]
    assert topo.paths("kitchen", "bedroom") == [
        ["kitchen", "dining_room", "hall", "bedroom"]
    ]
    assert topo.paths("bedroom", "kitchen") == []          # one-way: no way back
    assert topo.paths("kitchen", "kitchen") == [["kitchen"]]
    assert topo.paths("kitchen", "bedroom", max_hops=2) == []
    assert topo.paths("kitchen", "atlantis") == []


def test_reachable_grows_with_hops(topo) -> None:
    assert topo.reachable("kitchen", 0) == frozenset({"kitchen"})
    assert topo.reachable("kitchen", 1) == frozenset({"kitchen", "dining_room", "back_patio"})
    assert "hall" in topo.reachable("kitchen", 2)
    assert "bedroom" in topo.reachable("kitchen", 3)


def test_transition_rows_sum_to_one_and_respect_the_graph(topo) -> None:
    t = topo.transition_matrix(stay=0.9, escape=0.001)
    assert t.shape == (6, 6)
    assert np.allclose(t.sum(axis=1), 1.0)
    k, d, h, b, p, away = (topo.index(s) for s in topo.states)
    assert t[k, k] == pytest.approx(0.9)
    # kitchen's non-stay mass is shared by its two neighbours, less the escape it pays
    # to the two rooms it does not touch
    assert t[k, d] == pytest.approx(t[k, p])
    assert t[k, h] == pytest.approx(0.001)
    assert t[k, away] == 0.0                    # kitchen is not a way out of the house
    assert t[p, away] > 0.0 and t[away, p] > 0.0
    assert t[away, k] == 0.0
    assert t[h, b] > t[b, h]                    # the chute only runs one way (escape back)


def test_transition_matrix_refuses_an_impossible_row(topo) -> None:
    assert topo.feasible(0.9, 0.001) is None
    assert "escape" in (topo.feasible(0.99, 0.1) or "")
    with pytest.raises(TopologyError):
        topo.transition_matrix(stay=0.99, escape=0.1)


def test_a_house_with_no_exits_keeps_away_absorbing() -> None:
    config = validate_config(rooms_config())
    config["groups"][0]["children"][0]["children"][4]["exit"] = False
    topo = build_topology(config)
    t = topo.transition_matrix(stay=0.9, escape=0.001)
    assert np.allclose(t.sum(axis=1), 1.0)
    assert t[topo.index(AWAY), topo.index(AWAY)] == pytest.approx(1.0)


def test_map_scanners_uses_areas_then_overrides(topo) -> None:
    scanners = {
        "aa:aa": "kitchen_area",
        "bb:bb": "hall_area",
        "cc:cc": "garage_area",     # no group claims it
        "dd:dd": None,              # a scanner with no area at all
    }
    mapped, unmapped = topo.map_scanners(scanners)
    assert mapped == {"aa:aa": "kitchen", "bb:bb": "hall"}
    assert unmapped == ["cc:cc", "dd:dd"]

    mapped, unmapped = topo.map_scanners(scanners, {"cc:cc": "bedroom", "aa:aa": "dining_room"})
    assert mapped["cc:cc"] == "bedroom" and mapped["aa:aa"] == "dining_room"
    assert unmapped == ["dd:dd"]


def test_a_scanner_mapped_to_a_branch_is_unmapped(topo) -> None:
    """`downstairs` is a group, but it is not a state the filter has."""
    mapped, unmapped = topo.map_scanners({"aa:aa": None}, {"aa:aa": "downstairs"})
    assert mapped == {} and unmapped == ["aa:aa"]


def test_a_config_with_no_adjacency_is_an_empty_graph() -> None:
    topo = build_topology(validate_config(house_config()))
    assert topo.nodes == () and topo.payload() == {"nodes": [], "edges": [], "exits": []}
    assert room_ids(validate_config(house_config())) == frozenset()


def test_payload_shape(topo) -> None:
    assert topo.payload() == {
        "nodes": ["kitchen", "dining_room", "hall", "bedroom", "back_patio"],
        "edges": [
            ["kitchen", "dining_room", False],
            ["kitchen", "back_patio", False],
            ["dining_room", "hall", False],
            ["hall", "bedroom", True],
        ],
        "exits": ["back_patio"],
    }
```

`tests/test_websocket_topology.py` (the `entry` fixture is Task 5's; for now build it inline):

```python
import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import rooms_config

ROOM_SENSORS = (
    "binary_sensor.kitchen_motion",
    "binary_sensor.dining_motion",
    "binary_sensor.hall_motion",
    "binary_sensor.bedroom_motion",
    "binary_sensor.patio_motion",
)


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    for entity_id in ROOM_SENSORS:
        hass.states.async_set(entity_id, "off")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(rooms_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_topology_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/topology"})
    msg = await client.receive_json()
    assert msg["success"]
    assert msg["result"]["nodes"][0] == "kitchen"
    assert ["hall", "bedroom", True] in msg["result"]["edges"]
    assert msg["result"]["exits"] == ["back_patio"]


async def test_topology_paths_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "activity_levels/topology/paths", "from": "kitchen", "to": "bedroom"}
    )
    msg = await client.receive_json()
    assert msg["result"]["paths"] == [["kitchen", "dining_room", "hall", "bedroom"]]

    await client.send_json_auto_id(
        {"type": "activity_levels/topology/paths", "from": "kitchen", "to": "downstairs"}
    )
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "not_found"


async def test_diagnostics_carry_the_topology(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    from custom_components.activity_levels.diagnostics import (
        async_get_config_entry_diagnostics,
    )

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["topology"]["exits"] == ["back_patio"]
    assert diag["presence"] is None
```

Run `cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_topology.py tests/test_websocket_topology.py -q` — expect `ModuleNotFoundError: custom_components.activity_levels.topology`.

- [ ] **Step 2: Implement `topology.py`.**

```python
"""The room adjacency graph, and everything pure that reads it.

No ``homeassistant`` imports: this is built from the validated configuration and, with
:mod:`.presence.estimator`, is the only place numpy is used on the presence side.

A *room* is a group that takes part in the graph -- one that declares an edge, is named
by somebody else's edge, or is a way out of the house. Everything else in the tree
(House, Downstairs) is a branch: it mixes rooms, it is not a place a person can be, and
giving the filter a state for it would only invent somewhere to hide.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

import numpy as np
import numpy.typing as npt

from .const import AWAY, CONF_GROUPS, CONF_PRESENCE

MAX_HOPS = 8
"""How long a path this answers over. A house has few; an unbounded search of a dense
graph does not, and nobody reads a nine-hop route anyway."""

_TOLERANCE = 1e-9


class TopologyError(ValueError):
    """A transition matrix this configuration cannot produce."""


@dataclass(frozen=True)
class Edge:
    """One connection, canonical. ``one_way`` means b does not reach back to a."""

    a: str
    b: str
    one_way: bool


@dataclass(frozen=True)
class Topology:
    """The graph, plus the pre-order the tree gave it. Immutable and cheap to hold."""

    nodes: tuple[str, ...]
    edges: tuple[Edge, ...]
    exits: frozenset[str]
    out: Mapping[str, frozenset[str]]
    order: tuple[tuple[str, str | None], ...]

    @property
    def states(self) -> tuple[str, ...]:
        """The filter's state space: every room, and being out."""
        return (*self.nodes, AWAY)

    def index(self, state: str) -> int:
        return self.states.index(state)

    def neighbours(self, node: str) -> tuple[str, ...]:
        return tuple(sorted(self.out.get(node, frozenset())))

    def is_adjacent(self, a: str, b: str) -> bool:
        """Whether you can get from a to b in one step. Directed."""
        return b in self.out.get(a, frozenset())

    def connected(self, a: str, b: str) -> bool:
        """Whether the two are neighbours at all, in either direction.

        ``away`` counts as a neighbour of every exit room: somebody halfway out of the
        back door is between the patio and gone, and that is a move like any other.
        """
        if AWAY in (a, b):
            other = b if a == AWAY else a
            return other in self.exits
        return self.is_adjacent(a, b) or self.is_adjacent(b, a)

    def reachable(self, a: str, hops: int) -> frozenset[str]:
        """Every room within ``hops`` steps of a, a itself included."""
        seen = {a}
        frontier = {a}
        for _ in range(max(hops, 0)):
            frontier = {
                nxt for node in frontier for nxt in self.out.get(node, frozenset())
            } - seen
            if not frontier:
                break
            seen |= frontier
        return frozenset(seen)

    def paths(self, a: str, b: str, max_hops: int = MAX_HOPS) -> list[list[str]]:
        """Every simple route from a to b of at most ``max_hops`` edges, shortest first."""
        if a not in self.out or b not in self.out:
            return []
        if a == b:
            return [[a]]
        found: list[list[str]] = []
        stack: list[tuple[str, list[str]]] = [(a, [a])]
        while stack:
            node, walked = stack.pop()
            if len(walked) > max_hops:
                continue
            for nxt in sorted(self.out[node]):
                if nxt == b:
                    found.append([*walked, nxt])
                elif nxt not in walked:
                    stack.append((nxt, [*walked, nxt]))
        found.sort(key=lambda path: (len(path), path))
        return found

    def feasible(self, stay: float, escape: float) -> str | None:
        """Why these numbers cannot make a transition row, or None when they can."""
        if not 0.0 < stay < 1.0:
            return f"presence.stay ({stay}) has to be between 0 and 1"
        rooms = len(self.nodes)
        budget = stay + escape * max(rooms - 1, 0)
        if budget > 1.0 + _TOLERANCE:
            return (
                f"presence.escape ({escape}) across the {max(rooms - 1, 0)} rooms a room "
                f"does not touch, plus presence.stay ({stay}), comes to {budget:.4f}; a "
                "transition row has to add up to 1. Lower escape or lower stay."
            )
        return None

    def transition_matrix(self, stay: float, escape: float) -> npt.NDArray[np.float64]:
        """P(next state | current state), over ``states``.

        The diagonal is ``stay``. Every room a room does not touch gets ``escape`` -- the
        teleport that lets the filter recover from a wrong room at all -- and whatever is
        left is shared equally among the neighbours, with ``away`` counting as one for a
        room you can leave by. A room with nowhere to go keeps the remainder itself, so
        the row still sums to 1.
        """
        if (problem := self.feasible(stay, escape)) is not None:
            raise TopologyError(problem)
        states = self.states
        size = len(states)
        index = {state: i for i, state in enumerate(states)}
        matrix = np.zeros((size, size), dtype=np.float64)
        for gid in self.nodes:
            row = index[gid]
            near = [index[other] for other in sorted(self.out.get(gid, frozenset()))]
            if gid in self.exits:
                near.append(index[AWAY])
            far = [
                index[other]
                for other in self.nodes
                if other != gid and other not in self.out.get(gid, frozenset())
            ]
            matrix[row, row] = stay
            for column in far:
                matrix[row, column] = escape
            share = 1.0 - stay - escape * len(far)
            if near and share > 0.0:
                for column in near:
                    matrix[row, column] += share / len(near)
            else:
                matrix[row, row] += share
        away = index[AWAY]
        doors = [index[gid] for gid in self.nodes if gid in self.exits]
        if doors:
            matrix[away, away] = stay
            for column in doors:
                matrix[away, column] += (1.0 - stay) / len(doors)
        else:
            matrix[away, away] = 1.0  # a house with no way out: away is where you stay
        assert np.allclose(matrix.sum(axis=1), 1.0, atol=1e-9)
        return matrix

    def map_scanners(
        self,
        scanners: Mapping[str, str | None],
        overrides: Mapping[str, str] | None = None,
    ) -> tuple[dict[str, str], list[str]]:
        """``(scanner key -> room, unmapped keys)``.

        A scanner's area names the first group in pre-order that claims it, which is what
        lets a room win over the branch above it when both are given the same area.
        ``presence.scanner_areas`` wins outright. A mapping that lands on a branch is no
        mapping at all -- the filter has no state for it -- so it is reported instead of
        silently dropped.
        """
        first_for_area: dict[str, str] = {}
        for gid, area in self.order:
            if area is not None and area not in first_for_area:
                first_for_area[area] = gid
        rooms = set(self.nodes)
        mapped: dict[str, str] = {}
        unmapped: list[str] = []
        for key, area in scanners.items():
            gid = (overrides or {}).get(key)
            if gid is None and area is not None:
                gid = first_for_area.get(area)
            if gid is not None and gid in rooms:
                mapped[key] = gid
            else:
                unmapped.append(key)
        return mapped, sorted(unmapped)

    def payload(self) -> dict[str, Any]:
        """What the panel is handed. Names come from the config it already holds."""
        return {
            "nodes": list(self.nodes),
            "edges": [[edge.a, edge.b, edge.one_way] for edge in self.edges],
            "exits": sorted(self.exits),
        }


def build_topology(config: Mapping[str, Any]) -> Topology:
    """Read the graph out of a validated configuration."""
    order: list[tuple[str, str | None]] = []
    declared: list[tuple[str, str, bool]] = []
    exits: set[str] = set()

    def walk(node: Mapping[str, Any]) -> None:
        gid = node["id"]
        order.append((gid, node.get("area")))
        if node.get("exit"):
            exits.add(gid)
        for edge in node.get("adjacent") or []:
            declared.append((gid, edge["id"], bool(edge.get("one_way"))))
        for child in node.get("children") or []:
            walk(child)

    for group in config.get(CONF_GROUPS) or []:
        walk(group)

    known = {gid for gid, _ in order}
    out: dict[str, set[str]] = {}
    for a, b, one_way in declared:
        if a == b or a not in known or b not in known:
            continue  # the schema rejects these; a stale id loses its edge, not the graph
        out.setdefault(a, set()).add(b)
        if not one_way:
            out.setdefault(b, set()).add(a)

    touched = set(out) | {b for reachable in out.values() for b in reachable}
    nodes = tuple(gid for gid, _ in order if gid in touched or gid in exits)
    rooms = set(nodes)
    linked = {gid: frozenset(out.get(gid, set()) & rooms) for gid in nodes}
    return Topology(
        nodes=nodes,
        edges=_edges(nodes, linked),
        exits=frozenset(exits & rooms),
        out=linked,
        order=tuple(order),
    )


def _edges(nodes: Sequence[str], out: Mapping[str, frozenset[str]]) -> tuple[Edge, ...]:
    """One entry per unordered pair, in node order. A one-way edge keeps its direction."""
    rank = {gid: i for i, gid in enumerate(nodes)}
    seen: set[tuple[str, str]] = set()
    edges: list[Edge] = []
    for a in nodes:
        for b in sorted(out.get(a, frozenset()), key=lambda gid: rank[gid]):
            pair = (a, b) if rank[a] < rank[b] else (b, a)
            if pair in seen:
                continue
            seen.add(pair)
            both_ways = a in out.get(b, frozenset())
            edges.append(
                Edge(a=pair[0], b=pair[1], one_way=False)
                if both_ways
                else Edge(a=a, b=b, one_way=True)
            )
    return tuple(edges)


def room_ids(config: Mapping[str, Any]) -> frozenset[str]:
    """Which groups are rooms. ``tree.py`` asks, so the rule lives in one place."""
    return frozenset(build_topology(config).nodes)


def presence_enabled(config: Mapping[str, Any]) -> bool:
    """Whether the presence side exists at all for this configuration."""
    return bool((config.get(CONF_PRESENCE) or {}).get("enabled"))
```

- [ ] **Step 3: Wire it into the runtime and the websocket API.** In `runtime.py` add the two fields (`presence` typed `"PresenceCoordinator | None" = None` under `if TYPE_CHECKING` until Task 5 lands, then imported normally):

```python
@dataclass
class RuntimeData:
    """The coordinators an entry owns, plus the room graph they all read."""

    coordinator: ActivityLevelsCoordinator
    patterns: PatternsCoordinator
    topology: Topology
    presence: None = None  # Task 5 replaces the type with PresenceCoordinator | None
```

In `__init__.py`, build the topology beside the tree and pass it into `RuntimeData`:

```python
    try:
        tree = build_tree(config)
        topology = build_topology(config)
    except Exception as err:
        raise ConfigEntryError(f"Could not build the Activity Levels tree: {err}") from err
    ...
    entry.runtime_data = RuntimeData(coordinator=coordinator, patterns=patterns, topology=topology)
```

In `websocket_api.py`, register and add:

```python
    websocket_api.async_register_command(hass, ws_topology)
    websocket_api.async_register_command(hass, ws_topology_paths)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/topology"})
@callback
def ws_topology(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    connection.send_result(msg["id"], runtime.topology.payload())


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/topology/paths",
        vol.Required("from"): str,
        vol.Required("to"): str,
        vol.Optional("max_hops", default=MAX_HOPS): vol.All(int, vol.Range(min=1, max=MAX_HOPS)),
    }
)
@callback
def ws_topology_paths(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    topology = runtime.topology
    for key in ("from", "to"):
        if msg[key] not in topology.nodes:
            connection.send_error(msg["id"], "not_found", f"'{msg[key]}' is not a room")
            return
    connection.send_result(
        msg["id"], {"paths": topology.paths(msg["from"], msg["to"], msg["max_hops"])}
    )
```

In `diagnostics.py` add `"topology": entry.runtime_data.topology.payload()` and `"presence": None` (Task 5 fills the second one in).

- [ ] **Step 4: Gate and commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_topology.py tests/test_websocket_topology.py -q
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest -q && uv run ruff check . && uv run ruff format --check . && uv run mypy
```

Expected: all green; `mypy` accepts the numpy annotations (`npt.NDArray[np.float64]`, as `patterns/model.py` already does).

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/topology.py custom_components/activity_levels/runtime.py custom_components/activity_levels/__init__.py custom_components/activity_levels/websocket_api.py custom_components/activity_levels/diagnostics.py tests/test_topology.py tests/test_websocket_topology.py && git commit -m "feat(topology): room graph with one-way edges, bounded paths and a transition matrix"
```

---


### Task 3: `presence/estimator.py` — the filter, and `presence/observation.py`

**Files:** create `custom_components/activity_levels/presence/__init__.py`, `presence/observation.py`, `presence/estimator.py`; tests `tests/test_estimator.py`, `tests/test_estimator_properties.py`, `tests/presence/__init__.py` is *not* needed (the tests live flat, like `test_lightlog.py`).

**Interfaces:**
```python
# presence/observation.py
BERMUDA_DOMAIN = "bermuda"
DISTANCE_SUFFIX = "_distance"
UNREACHABLE = 999.0

@dataclass(frozen=True)
class Observation:
    t: float
    distances: Mapping[str, float | None] = field(default_factory=dict)  # scanner key -> metres
    home: bool = True

def scanner_key(unique_id: str) -> str | None      # "aa:bb_cc:dd_distance" -> "cc:dd"
def parse_distance(state: str | None) -> float | None

# presence/estimator.py
HISTORY = 120; BUFFER = 30; MIN_HISTORY = 20
CANDIDATE_FLOOR = 0.1; MOVING_SECOND = 0.25; PATH_STEPS = 5

@dataclass(frozen=True)
class Outputs:
    t: float
    room: str
    confidence: float
    moving: bool
    candidates: dict[str, float]
    path: list[str]
    def as_dict(self) -> dict[str, Any]

class Estimator:
    def __init__(self, topology: Topology, scanners: Mapping[str, str], *, stay: float,
                 escape: float, scale: float, floor: float, stuck_after: float) -> None
    belief: npt.NDArray[np.float64]      # public, always a distribution over topology.states
    resets: int
    last_t: float | None
    def log_emission(self, obs: Observation) -> npt.NDArray[np.float64]
    def emission(self, obs: Observation) -> tuple[npt.NDArray[np.float64], float]
    def update(self, obs: Observation) -> Outputs
    def outputs(self, t: float | None = None) -> Outputs
    def path(self) -> list[str]
    def snapshot(self) -> dict[str, Any]        # {"states": [...], "belief": [...], "t": float|None}
    def restore(self, data: Mapping[str, Any]) -> bool   # False = kept the current belief
```

- [ ] **Step 1: Tests first (RED).** `tests/test_estimator.py`:

```python
"""The room filter, on the `rooms_config` graph.

kitchen -- dining_room -- hall -> bedroom, kitchen -- back_patio -- (away)

Scanners: one per room, keyed by the room name so the tests read as English.
"""

from __future__ import annotations

import numpy as np
import pytest

from custom_components.activity_levels.const import AWAY
from custom_components.activity_levels.presence.estimator import Estimator
from custom_components.activity_levels.presence.observation import (
    Observation,
    parse_distance,
    scanner_key,
)
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import build_topology
from tests.fixtures import rooms_config

ROOMS = ("kitchen", "dining_room", "hall", "bedroom", "back_patio")
SCANNERS = {f"s_{room}": room for room in ROOMS}


@pytest.fixture
def topo():
    return build_topology(validate_config(rooms_config()))


def make(topo, **kwargs) -> Estimator:
    settings = {
        "stay": 0.9,
        "escape": 0.001,
        "scale": 3.0,
        "floor": 0.05,
        "stuck_after": 60.0,
    }
    return Estimator(topo, SCANNERS, **{**settings, **kwargs})


def at(room: str, t: float, *, far: float = 8.0, near: float = 0.5, home: bool = True):
    """One observation: every scanner reports, the named room's one is close."""
    return Observation(
        t=t,
        distances={key: (near if mapped == room else far) for key, mapped in SCANNERS.items()},
        home=home,
    )


def test_scanner_key_and_parse_distance() -> None:
    assert scanner_key("aa:bb:cc_11:22:33_distance") == "11:22:33"
    assert scanner_key("aa:bb:cc_area") is None
    assert scanner_key("distance") is None
    assert parse_distance("2.5") == 2.5
    assert parse_distance("999") is None      # Bermuda's "no idea"
    assert parse_distance("1000") is None
    assert parse_distance("unknown") is None
    assert parse_distance(None) is None
    assert parse_distance("-1") is None
    assert parse_distance("0") == 0.0


def test_belief_starts_uniform_and_stays_a_distribution(topo) -> None:
    est = make(topo)
    assert est.belief.shape == (len(topo.states),)
    assert est.belief.sum() == pytest.approx(1.0)
    out = est.update(at("kitchen", 0.0))
    assert est.belief.sum() == pytest.approx(1.0)
    assert out.room == "kitchen" and out.confidence > 0.5
    assert out.t == 0.0


def test_a_room_with_no_scanner_sits_at_the_floor(topo) -> None:
    est = Estimator(
        topo,
        {"s_kitchen": "kitchen"},
        stay=0.9, escape=0.001, scale=3.0, floor=0.05, stuck_after=60.0,
    )
    log_e = est.log_emission(Observation(t=0.0, distances={"s_kitchen": 0.5}, home=True))
    assert log_e[topo.index("hall")] == pytest.approx(np.log(0.05))
    assert log_e[topo.index("kitchen")] > log_e[topo.index("hall")]


def test_a_close_reading_is_evidence_against_every_other_room(topo) -> None:
    est = make(topo)
    log_e = est.log_emission(at("kitchen", 0.0))
    assert log_e[topo.index("kitchen")] > log_e[topo.index("dining_room")]
    # a reading beyond tau says nothing either way, so the far rooms are not punished twice
    log_far = est.log_emission(
        Observation(t=0.0, distances=dict.fromkeys(SCANNERS, 9.0), home=True)
    )
    assert log_far[topo.index("kitchen")] == pytest.approx(log_far[topo.index("hall")])


def test_a_walk_is_recovered(topo) -> None:
    est = make(topo)
    t = 0.0
    walked: list[str] = []
    for room in ("kitchen", "kitchen", "dining_room", "dining_room", "hall", "hall"):
        out = est.update(at(room, t))
        walked.append(out.room)
        t += 1.0
    assert walked[-1] == "hall"
    assert walked == [
        "kitchen", "kitchen", "dining_room", "dining_room", "hall", "hall",
    ]
    assert est.outputs().path[-3:] == ["kitchen", "dining_room", "hall"]


def test_an_impossible_jump_is_rejected_then_recovered(topo) -> None:
    """kitchen and bedroom share no edge: one frame cannot move you between them."""
    est = make(topo)
    for t in range(5):
        est.update(at("kitchen", float(t)))
    out = est.update(at("bedroom", 5.0))
    assert out.room != "bedroom"          # the graph does not allow the jump in one step

    for t in range(6, 60):
        out = est.update(at("bedroom", float(t)))
        if out.room == "bedroom":
            break
    assert out.room == "bedroom"          # escape gets there eventually, within seconds
    assert t < 40


def test_the_stuck_detector_resets_the_belief(topo) -> None:
    est = make(topo, stuck_after=5.0)
    t = 0.0
    for _ in range(40):                    # a settled, unsurprising history
        est.update(at("kitchen", t))
        t += 1.0
    assert est.resets == 0
    while est.resets == 0 and t < 200.0:   # now evidence the filter cannot explain
        est.update(at("bedroom", t))
        t += 1.0
    assert est.resets == 1
    assert est.outputs().room == "bedroom"
    assert est.belief.sum() == pytest.approx(1.0)


def test_away_wins_when_the_tracker_says_not_home(topo) -> None:
    est = make(topo)
    est.update(at("kitchen", 0.0))
    out = est.update(
        Observation(t=1.0, distances=dict.fromkeys(SCANNERS, None), home=False)
    )
    for t in range(2, 8):
        out = est.update(Observation(t=float(t), distances={}, home=False))
    assert out.room == AWAY
    assert out.candidates[AWAY] > 0.5


def test_candidates_and_moving(topo) -> None:
    est = make(topo)
    est.update(at("kitchen", 0.0))
    # exactly between two adjacent rooms: neither is confident, and that is "moving"
    between = Observation(
        t=1.0,
        distances={"s_kitchen": 1.0, "s_dining_room": 1.0, "s_hall": 8.0,
                   "s_bedroom": 8.0, "s_back_patio": 8.0},
        home=True,
    )
    out = est.update(between)
    assert set(out.candidates) >= {"kitchen", "dining_room"}
    assert all(value > 0.1 for value in out.candidates.values())
    assert out.moving is True

    settled = est.update(at("kitchen", 2.0))
    assert settled.moving is False


def test_moving_is_false_between_rooms_with_no_edge(topo) -> None:
    est = make(topo)
    obs = Observation(
        t=0.0,
        distances={"s_kitchen": 1.0, "s_bedroom": 1.0, "s_dining_room": 8.0,
                   "s_hall": 8.0, "s_back_patio": 8.0},
        home=True,
    )
    out = est.update(obs)
    assert out.moving is False       # they are both plausible, but not a step apart


def test_snapshot_round_trip_and_refusal(topo) -> None:
    est = make(topo)
    for t in range(4):
        est.update(at("dining_room", float(t)))
    snapshot = est.snapshot()

    restored = make(topo)
    assert restored.restore(snapshot) is True
    assert np.allclose(restored.belief, est.belief)
    assert restored.outputs().room == "dining_room"

    assert restored.restore({"states": ["kitchen"], "belief": [1.0]}) is False
    assert restored.restore({"belief": [0.0] * len(topo.states), "states": list(topo.states)}) is False
    assert restored.restore({"nonsense": True}) is False
    assert restored.outputs().room == "dining_room"    # a refusal changes nothing
```

`tests/test_estimator_properties.py`:

```python
"""Invariants the filter must hold for any graph, any settings, any readings."""

from __future__ import annotations

import numpy as np
from hypothesis import given, settings
from hypothesis import strategies as st

from custom_components.activity_levels.presence.estimator import Estimator
from custom_components.activity_levels.presence.observation import Observation
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import build_topology
from tests.fixtures import rooms_config

TOPO = build_topology(validate_config(rooms_config()))
SCANNERS = {f"s_{room}": room for room in TOPO.nodes}

readings = st.one_of(st.none(), st.floats(min_value=0.0, max_value=30.0))
observations = st.lists(
    st.tuples(st.fixed_dictionaries(dict.fromkeys(SCANNERS, readings)), st.booleans()),
    min_size=1,
    max_size=40,
)


@given(
    observations,
    st.floats(min_value=0.5, max_value=0.99),
    st.floats(min_value=0.0, max_value=0.05),
    st.floats(min_value=0.5, max_value=10.0),
    st.floats(min_value=0.001, max_value=0.5),
)
@settings(max_examples=50, deadline=None)
def test_belief_is_always_a_distribution(rows, stay, escape, scale, floor) -> None:
    est = Estimator(
        TOPO, SCANNERS, stay=stay, escape=escape, scale=scale, floor=floor, stuck_after=60.0
    )
    for i, (distances, home) in enumerate(rows):
        out = est.update(Observation(t=float(i), distances=distances, home=home))
        assert np.all(np.isfinite(est.belief))
        assert np.all(est.belief >= 0.0)
        assert est.belief.sum() == np.float64(1.0) or abs(est.belief.sum() - 1.0) < 1e-9
        assert out.room in TOPO.states
        assert 0.0 <= out.confidence <= 1.0
        assert all(state in TOPO.states for state in out.path)
        assert len(out.path) <= 5


@given(st.floats(min_value=0.5, max_value=0.99), st.floats(min_value=0.0, max_value=0.05))
@settings(max_examples=50, deadline=None)
def test_transition_rows_always_sum_to_one(stay, escape) -> None:
    matrix = TOPO.transition_matrix(stay, escape)
    assert np.allclose(matrix.sum(axis=1), 1.0)
    assert np.all(matrix >= 0.0)


@given(observations)
@settings(max_examples=25, deadline=None)
def test_the_viterbi_path_only_walks_the_graph(rows) -> None:
    """Consecutive, collapsed path steps are always a step the topology allows."""
    est = Estimator(
        TOPO, SCANNERS, stay=0.9, escape=0.0, scale=3.0, floor=0.05, stuck_after=1e9
    )
    for i, (distances, home) in enumerate(rows):
        est.update(Observation(t=float(i), distances=distances, home=home))
    path = est.outputs().path
    for a, b in zip(path, path[1:], strict=False):
        assert TOPO.connected(a, b)
```

> With `escape = 0` a step the graph forbids has log-probability `log(1e-300)`, so Viterbi will only choose one when nothing else is possible — which cannot happen, because `stay` is always available. That is why this property pins `escape=0`.

Run `cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_estimator.py tests/test_estimator_properties.py -q` — expect `ModuleNotFoundError`.

- [ ] **Step 2: `presence/__init__.py` and `presence/observation.py`.**

```python
# presence/__init__.py
"""Room estimation from noisy proximity readings.

No ``homeassistant`` imports are allowed in this package -- like ``patterns``, it is
pure, testable analysis fed by data the integration layer gathers. ``numpy`` is allowed
here and in :mod:`..topology`, and nowhere else on the presence side.
"""

from __future__ import annotations
```

```python
# presence/observation.py
"""What one update of a tracked device looks like, and how Bermuda spells it.

``Observation`` is deliberately a plain dataclass with room in it: phase 3 adds
barometric pressure for floor disambiguation and a walking/still activity state, and
neither should have to touch the filter's shape to get there.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field

BERMUDA_DOMAIN = "bermuda"
DISTANCE_SUFFIX = "_distance"
UNREACHABLE = 999.0
"""Bermuda's "no idea": a reading at or past this is not a reading at all."""


@dataclass(frozen=True)
class Observation:
    """Everything the filter is told at one instant. ``None`` is "no reading"."""

    t: float
    distances: Mapping[str, float | None] = field(default_factory=dict)
    home: bool = True


def scanner_key(unique_id: str) -> str | None:
    """The scanner a Bermuda per-scanner distance sensor measures against.

    Those sensors are keyed ``<device address>_<scanner address>_distance``. Anything
    else the device owns -- its area, its nearest-scanner summary -- is not a
    per-scanner reading and gets ``None``, which is how the coordinator filters them out.
    """
    if not unique_id.endswith(DISTANCE_SUFFIX):
        return None
    stem = unique_id[: -len(DISTANCE_SUFFIX)]
    _, separator, scanner = stem.rpartition("_")
    return scanner if separator and scanner else None


def parse_distance(state: str | None) -> float | None:
    """Metres, or None for unknown, unavailable, negative, infinite or 999."""
    if state is None:
        return None
    try:
        value = float(state)
    except ValueError:
        return None
    # NaN fails both comparisons, and inf fails the upper one: neither is a distance
    return value if 0.0 <= value < UNREACHABLE else None
```

- [ ] **Step 3: `presence/estimator.py`.**

```python
"""One tracked device's belief about which room it is in.

A hidden Markov filter over :class:`..topology.Topology`: the graph is the transition
model, the distance readings are the emission model, and the whole point is that the
transition model makes a jump between two rooms with no door between them cost
something. Pure numpy; no ``homeassistant`` imports.

Cost, for the record: 20 rooms and 10 scanners is a 21x21 matrix-vector product and a
21-long sum per update -- microseconds. It runs inline on the event loop.
"""

from __future__ import annotations

import math
from collections import deque
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

import numpy as np
import numpy.typing as npt

from ..const import AWAY
from ..topology import Topology
from .observation import Observation

HISTORY = 120
"""Likelihoods the stuck detector keeps. At one observation a second, two minutes."""
BUFFER = 30
"""Observations the bounded Viterbi runs over."""
MIN_HISTORY = 20
"""Before this many, there is no percentile worth comparing against."""
CANDIDATE_FLOOR = 0.1
MOVING_SECOND = 0.25
PATH_STEPS = 5
_TINY = 1e-300
"""Stands in for zero inside a logarithm: a forbidden step costs ~-691, not -inf."""


@dataclass(frozen=True)
class Outputs:
    """What one update concluded. ``room`` may be ``away``; that is a real answer."""

    t: float
    room: str
    confidence: float
    moving: bool
    candidates: dict[str, float]
    path: list[str]

    def as_dict(self) -> dict[str, Any]:
        return {
            "t": self.t,
            "room": self.room,
            "confidence": self.confidence,
            "moving": self.moving,
            "candidates": dict(self.candidates),
            "path": list(self.path),
        }


class Estimator:
    """The filter for one device. Not thread-safe; it lives on the event loop."""

    def __init__(
        self,
        topology: Topology,
        scanners: Mapping[str, str],
        *,
        stay: float,
        escape: float,
        scale: float,
        floor: float,
        stuck_after: float,
    ) -> None:
        self.topology = topology
        self.states = topology.states
        self.scanners = dict(scanners)
        self.scale = scale
        self.floor = floor
        self.stuck_after = stuck_after
        self._transition = topology.transition_matrix(stay, escape)
        self._log_transition = np.log(
            np.where(self._transition > 0.0, self._transition, _TINY)
        )
        size = len(self.states)
        self._position = {state: i for i, state in enumerate(self.states)}
        self.belief: npt.NDArray[np.float64] = np.full(size, 1.0 / size, dtype=np.float64)
        covered = set(self.scanners.values())
        self._covered = np.array([state in covered for state in self.states], dtype=bool)
        self._history: deque[float] = deque(maxlen=HISTORY)
        self._buffer: deque[npt.NDArray[np.float64]] = deque(maxlen=BUFFER)
        self._low_since: float | None = None
        self.last_t: float | None = None
        self.resets = 0

    # -- emission -----------------------------------------------------------

    def log_emission(self, obs: Observation) -> npt.NDArray[np.float64]:
        """log P(obs | state), per state.

        A scanner reading *close* is evidence for its own room and against every other:
        ``-d/tau`` where the scanner is, ``-max(0, tau - d)/tau`` everywhere else, so a
        reading past tau says nothing about anywhere. A room with no scanner of its own
        can collect neither kind of evidence and sits at the constant ``floor``: passable,
        never a winner unaided. ``away`` is certain when the tracker says we are out, and
        ``floor**2`` when it does not -- worse than any room, so only the transition model
        can put us there while we are home.

        **This method is the seam.** Phase 2 replaces it with learned per-room,
        per-scanner distance tables and changes nothing else.
        """
        tau = self.scale
        log_floor = math.log(self.floor)
        out = np.zeros(len(self.states), dtype=np.float64)
        for scanner, distance in obs.distances.items():
            room = self.scanners.get(scanner)
            if distance is None or room is None:
                continue
            near = -distance / tau
            against = -max(0.0, tau - distance) / tau
            out += against
            out[self._position[room]] += near - against
        out[~self._covered] = log_floor
        out[self._position[AWAY]] = 2.0 * log_floor if obs.home else 0.0
        return out

    def emission(self, obs: Observation) -> tuple[npt.NDArray[np.float64], float]:
        """The likelihood, scaled so its largest entry is 1, and the log scale removed.

        Scaling first is what keeps a house full of scanners from underflowing: ten
        readings multiply into e**-30 territory, and the filter only ever needs ratios.
        """
        log_e = self.log_emission(obs)
        shift = float(log_e.max())
        return np.exp(log_e - shift), shift

    # -- filter -------------------------------------------------------------

    def update(self, obs: Observation) -> Outputs:
        """One forward step: predict through the graph, then weigh by the evidence."""
        likelihood, shift = self.emission(obs)
        predicted = self._transition.T @ self.belief
        joint = predicted * likelihood
        total = float(joint.sum())
        if total <= 0.0:
            # nothing the filter predicted is possible any more; believe the evidence
            joint = likelihood
            total = float(joint.sum())
        self.belief = joint / total
        self._buffer.append(np.log(np.where(likelihood > 0.0, likelihood, _TINY)))
        self._check_stuck(obs.t, math.log(max(total, _TINY)) + shift, likelihood)
        self.last_t = obs.t
        return self.outputs(obs.t)

    def _check_stuck(
        self, t: float, logp: float, likelihood: npt.NDArray[np.float64]
    ) -> None:
        """Reset when the evidence has been implausible for ``stuck_after`` seconds.

        "Implausible" is measured against this device's own history, not an absolute
        number: how surprising a reading is depends entirely on how many scanners hear
        it and how far away they are. Below the history's 5th percentile for long
        enough means the filter is following somebody who is not there, and the fastest
        way out is to stop predicting and believe what the scanners say.
        """
        if len(self._history) >= MIN_HISTORY:
            threshold = float(
                np.quantile(np.asarray(self._history, dtype=np.float64), 0.05)
            )
            if logp < threshold:
                if self._low_since is None:
                    self._low_since = t
                elif t - self._low_since >= self.stuck_after:
                    total = float(likelihood.sum())
                    if total > 0.0:
                        self.belief = likelihood / total
                    self._buffer.clear()
                    self._history.clear()
                    self._low_since = None
                    self.resets += 1
                    return
            else:
                self._low_since = None
        # appended last, so this reading never moves the threshold it was judged against
        self._history.append(logp)

    # -- reads --------------------------------------------------------------

    def outputs(self, t: float | None = None) -> Outputs:
        order = np.argsort(self.belief)[::-1]
        top = int(order[0])
        second = int(order[1]) if order.size > 1 else top
        moving = (
            second != top
            and float(self.belief[second]) > MOVING_SECOND
            and self.topology.connected(self.states[top], self.states[second])
        )
        return Outputs(
            t=t if t is not None else (self.last_t or 0.0),
            room=self.states[top],
            confidence=round(float(self.belief[top]), 4),
            moving=moving,
            candidates={
                self.states[int(i)]: round(float(self.belief[int(i)]), 4)
                for i in order
                if float(self.belief[int(i)]) > CANDIDATE_FLOOR
            },
            path=self.path(),
        )

    def path(self) -> list[str]:
        """The most likely route through the buffered observations.

        Viterbi over the ring buffer only, from a uniform prior: a bounded answer to a
        bounded question ("how did you get here, roughly"), not a reconstruction of the
        whole evening. Consecutive repeats collapse -- standing still is not a step --
        and only the last few survive, because that is all a breadcrumb needs.
        """
        if not self._buffer:
            return []
        size = len(self.states)
        scores = np.full(size, -math.log(size), dtype=np.float64) + self._buffer[0]
        back: list[npt.NDArray[np.int64]] = []
        for log_likelihood in list(self._buffer)[1:]:
            step = scores[:, None] + self._log_transition
            choice = np.argmax(step, axis=0)
            scores = step[choice, np.arange(size)] + log_likelihood
            back.append(choice)
        route = [int(np.argmax(scores))]
        for choice in reversed(back):
            route.append(int(choice[route[-1]]))
        route.reverse()
        walked = [self.states[i] for i in route]
        collapsed = [
            state for i, state in enumerate(walked) if i == 0 or state != walked[i - 1]
        ]
        return collapsed[-PATH_STEPS:]

    # -- persistence --------------------------------------------------------

    def snapshot(self) -> dict[str, Any]:
        """The belief, with the state space it was written against."""
        return {
            "states": list(self.states),
            "belief": [float(value) for value in self.belief],
            "t": self.last_t,
        }

    def restore(self, data: Mapping[str, Any]) -> bool:
        """Take a stored belief back, or refuse and keep the current one.

        A changed state space is a refusal, not a migration: the vector no longer means
        what it meant when it was written, and a uniform prior is a better start than a
        confident wrong room.
        """
        if list(data.get("states") or []) != list(self.states):
            return False
        try:
            belief = np.array([float(value) for value in data["belief"]], dtype=np.float64)
        except (KeyError, TypeError, ValueError):
            return False
        if (
            belief.shape != self.belief.shape
            or not bool(np.all(np.isfinite(belief)))
            or bool(np.any(belief < 0.0))
        ):
            return False
        total = float(belief.sum())
        if total <= 0.0:
            return False
        self.belief = belief / total
        stamp = data.get("t")
        self.last_t = float(stamp) if isinstance(stamp, int | float) else None
        return True
```

- [ ] **Step 4: Gate and commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_estimator.py tests/test_estimator_properties.py -q
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest -q && uv run ruff check . && uv run ruff format --check . && uv run mypy
```

Expected: all green. If `test_an_impossible_jump_is_rejected_then_recovered` needs more than 40 updates, the escape probability is doing its job too slowly — do **not** raise `escape` in the fixture; widen the loop bound and record the real number in the assertion, because the number of frames it takes is the property worth pinning.

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/presence tests/test_estimator.py tests/test_estimator_properties.py && git commit -m "feat(presence): hidden Markov room estimator with a stuck detector and bounded Viterbi"
```

---


### Task 4: The presence channel — `tree.py` and `coordinator.set_occupied`

**Files:** modify `custom_components/activity_levels/tree.py`, `custom_components/activity_levels/coordinator.py`; tests `tests/test_tree.py`, `tests/test_coordinator.py`.

**Interfaces:**
```python
# tree.py
@dataclass(frozen=True)
class GroupInfo:
    ...                       # unchanged fields
    presence: Voice | None    # None for a branch, or when presence is disabled

def _presence_voice(
    defaults: Mapping[str, Any],
    presets: Mapping[str, Mapping[str, Any]],
    presence: Mapping[str, Any],        # config["presence"]
    overrides: Mapping[str, Any],       # group["presence"]
    max_value: float,
) -> Voice

# coordinator.py
def set_occupied(self, group_id: str, occupied: bool) -> None
```

The channel is **visible**: `Channel(voice, key=PRESENCE_KEY)` sits in the group's channel list before the hidden trigger channel, so it shows up in `contributors`, in `voice_states`, in the panel's live view and in the controls row's stimuli list. Unlike the trigger it is *real activity*: it stays inside `real_value` (which excludes `TRIGGER_KEY` only), it is capped at the group's limiter like a stimulus, and it obeys `Channel.muted` like any other channel.

- [ ] **Step 1: Tests first (RED).** `tests/test_tree.py`:

```python
def test_room_groups_get_a_visible_presence_channel() -> None:
    tree = build_tree(validate_config(presence_config()))
    kitchen = tree.groups["kitchen"]
    labels = [channel.label for channel in kitchen.group.channels]
    assert labels == ["binary_sensor.kitchen_motion", PRESENCE_KEY, TRIGGER_KEY]
    assert kitchen.presence is not None
    assert kitchen.presence.gain == 2.0                    # the group's own override
    assert kitchen.presence.ceiling == kitchen.max_value   # capped like a stimulus
    assert kitchen.presence.envelope.release == 3600.0     # presence.envelope: hour
    # a branch is not a room: nothing to be present in
    assert tree.groups["downstairs"].presence is None
    assert PRESENCE_KEY not in [c.label for c in tree.groups["downstairs"].group.channels]


def test_group_presence_overrides_beat_the_preset() -> None:
    config = presence_config()
    config["groups"][0]["children"][0]["children"][1]["presence"] = {"release": "5m"}
    tree = build_tree(validate_config(config))
    assert tree.groups["dining_room"].presence.envelope.release == 300.0
    assert tree.groups["kitchen"].presence.envelope.release == 3600.0


def test_no_presence_channel_when_presence_is_off() -> None:
    tree = build_tree(validate_config(rooms_config()))     # presence absent -> disabled
    for info in tree.groups.values():
        assert info.presence is None
        assert PRESENCE_KEY not in [c.label for c in info.group.channels]


def test_the_presence_voice_is_in_the_mix_and_in_live_voices() -> None:
    tree = build_tree(validate_config(presence_config()))
    kitchen = tree.groups["kitchen"]
    kitchen.presence.note_on(0.0)
    assert kitchen.group.value_at(0.0) == pytest.approx(2.0)
    assert kitchen.presence in list(kitchen.group.live_voices())
```

`tests/test_coordinator.py` (the existing file already builds coordinators from `house_config`; add a presence section):

```python
async def test_set_occupied_notes_on_and_off(hass: HomeAssistant) -> None:
    coordinator = await _started(hass, presence_config())
    assert coordinator.data["kitchen"].value == 0.0

    coordinator.set_occupied("kitchen", True)
    state = coordinator.data["kitchen"]
    assert state.value == pytest.approx(2.0)
    assert state.gated is True
    assert state.contributors[PRESENCE_KEY] == pytest.approx(2.0)
    # presence is real activity, unlike the synthetic trigger
    assert state.real_value == pytest.approx(2.0)

    coordinator.set_occupied("kitchen", False)
    assert coordinator.data["kitchen"].gated is False


async def test_set_occupied_is_idempotent(hass: HomeAssistant) -> None:
    coordinator = await _started(hass, presence_config())
    coordinator.set_occupied("kitchen", True)
    first = coordinator.tree.groups["kitchen"].presence.last_note_on
    coordinator.set_occupied("kitchen", True)
    assert coordinator.tree.groups["kitchen"].presence.last_note_on == first
    coordinator.set_occupied("kitchen", False)
    coordinator.set_occupied("kitchen", False)  # a second note-off must not throw


async def test_set_occupied_on_a_branch_is_a_no_op(hass: HomeAssistant) -> None:
    coordinator = await _started(hass, presence_config())
    coordinator.set_occupied("downstairs", True)   # no presence voice: nothing happens
    assert coordinator.data["downstairs"].value == 0.0


async def test_the_presence_voice_survives_a_restart(hass: HomeAssistant) -> None:
    coordinator = await _started(hass, presence_config())
    coordinator.set_occupied("kitchen", True)
    await coordinator.async_stop()

    revived = await _started(hass, presence_config())
    assert revived.data["kitchen"].gated is True
    assert revived.data["kitchen"].value == pytest.approx(2.0, abs=0.05)


async def test_a_muted_room_stops_holding_its_parent_up(hass: HomeAssistant) -> None:
    coordinator = await _started(hass, presence_config())
    coordinator.set_occupied("kitchen", True)
    assert coordinator.data["downstairs"].value > 0.0
    coordinator.set_muted("kitchen", True)
    assert coordinator.data["downstairs"].value == 0.0
    assert coordinator.data["kitchen"].value == pytest.approx(2.0)   # the room itself sounds on


async def test_presence_shows_up_in_voice_states(hass: HomeAssistant) -> None:
    coordinator = await _started(hass, presence_config())
    coordinator.set_occupied("kitchen", True)
    voices = coordinator.voice_states()["kitchen"]
    presence = next(v for v in voices if v["label"] == PRESENCE_KEY)
    assert presence["entity"] is None and presence["gate"] is True
    assert [v["label"] for v in coordinator.voice_states()["downstairs"]] == [TRIGGER_KEY]
```

`_started` is a small helper this file needs; add it next to the existing fixtures:

```python
async def _started(hass: HomeAssistant, config: dict[str, Any]) -> ActivityLevelsCoordinator:
    """A coordinator on a real ``hass``, started, with its store already loaded."""
    coordinator = ActivityLevelsCoordinator(hass, "entry", build_tree(validate_config(config)))
    await coordinator.async_start()
    return coordinator
```

Run `cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_tree.py tests/test_coordinator.py -q` — expect `AttributeError: 'GroupInfo' object has no attribute 'presence'`.

- [ ] **Step 2: `tree.py`.** Add `presence: Voice | None` to `GroupInfo`, the voice builder, and the channel:

```python
from .const import PRESENCE_KEY, TRIGGER_KEY
from .topology import room_ids


def _presence_voice(
    defaults: Mapping[str, Any],
    presets: Mapping[str, Mapping[str, Any]],
    presence: Mapping[str, Any],
    overrides: Mapping[str, Any],
    max_value: float,
) -> Voice:
    """The visible synthetic channel that says somebody is in this room.

    Built like a stimulus rather than like the trigger: it is real activity, it is
    capped at the group's limiter, and its envelope resolves through the ordinary
    chain -- the group's own overrides, then ``presence.envelope``, then
    ``defaults.envelope``. A note-on lasts until the room empties, so the default
    (a held note with a long release) is exactly right.
    """
    stimulus = {
        **overrides,
        "envelope": overrides.get("envelope") or presence.get("envelope"),
    }
    return Voice(
        id=PRESENCE_KEY,
        gain=float(overrides.get("gain", 1.0)),
        envelope=resolve_envelope(defaults, presets, stimulus),
        ceiling=max_value,
    )
```

In `build_tree`, before the loop:

```python
def build_tree(config: dict[str, Any]) -> Tree:
    defaults = config["defaults"]
    presets = {e["id"]: e for e in config["envelopes"]}
    presence_cfg = config.get(CONF_PRESENCE) or {}
    # Only rooms can be occupied; a branch (House, Downstairs) mixes rooms and is not a
    # place. With presence off there are no presence channels at all.
    rooms = room_ids(config) if presence_cfg.get("enabled") else frozenset()
    tree = Tree(defaults=dict(defaults))
```

and inside `build`, after the children loop and before the trigger channel:

```python
        presence: Voice | None = None
        if gid in rooms:
            presence = _presence_voice(
                defaults, presets, presence_cfg, node[CONF_PRESENCE], max_value
            )
            channels.append(Channel(presence, key=PRESENCE_KEY))
        trigger = _trigger_voice(defaults, presets, max_value)
        channels.append(Channel(trigger, key=TRIGGER_KEY))
```

and pass `presence=presence` into the `GroupInfo(...)` construction.

`resolve_envelope` already treats a missing key and an explicit `None` the same, so a group's presence block with only `gain` inherits the whole envelope.

- [ ] **Step 3: `coordinator.py`.** Add the command, and carry the voice through persistence and introspection:

```python
    def set_occupied(self, group_id: str, occupied: bool) -> None:
        """Open or close a room's presence gate.

        A note, not a level: the caller decides who counts as an occupant (a confidence
        threshold, and never two note-ons for two people), and this only moves on the
        0 <-> occupied crossings. A group with no presence voice -- a branch, or any
        group at all while presence is off -- is a no-op rather than an error, so the
        presence coordinator never has to know which groups are rooms.
        """
        info = self.tree.groups.get(group_id)
        if info is None or info.presence is None:
            return
        t = self.now()
        if occupied:
            if info.presence.gate:
                return                      # already sounding; a second note-on is noise
            info.presence.note_on(t)
        else:
            if not info.presence.gate:
                return
            info.presence.note_off(t)
        self._after_change({info.root_id}, t)
```

In `snapshot`, alongside the trigger:

```python
        for info in self.tree.groups.values():
            voices[self.tree.voice_key(info.id, info.trigger.id)] = info.trigger.snapshot()
            if info.presence is not None:
                voices[self.tree.voice_key(info.id, PRESENCE_KEY)] = info.presence.snapshot()
```

the mirror of that in `_restore`, and in `voice_states`:

```python
        for info in self.tree.groups.values():
            if info.presence is not None:
                out[info.id].append(
                    self._voice_state(PRESENCE_KEY, None, info.presence, t)
                )
            out[info.id].append(self._voice_state(TRIGGER_KEY, None, info.trigger, t))
```

(the presence entry goes first, matching the channel order, so the panel lists it above the trigger).

- [ ] **Step 4: Gate and commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_tree.py tests/test_coordinator.py tests/engine -q
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest -q && uv run ruff check . && uv run ruff format --check . && uv run mypy
```

Expected: green, and `tests/test_entities.py`/`tests/test_websocket.py` unchanged — `house_config` declares no adjacency, so no group is a room and no presence channel exists.

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/tree.py custom_components/activity_levels/coordinator.py tests/test_tree.py tests/test_coordinator.py && git commit -m "feat(engine): give every room a visible presence channel driven by set_occupied"
```

---


### Task 5: `PresenceCoordinator` — discovery, repair issues, observations, occupancy

**Files:** create `custom_components/activity_levels/presence_coordinator.py`, `tests/test_presence_coordinator.py`; modify `custom_components/activity_levels/__init__.py`, `runtime.py`, `websocket_api.py`, `diagnostics.py`, `strings.json`, `translations/en.json`, `tests/fixtures.py`.

**Interfaces:**
```python
OBSERVATION_DEBOUNCE = 0.5
"""Bermuda writes a device's distance sensors as a batch; one Observation per batch."""
REGISTRY_DEBOUNCE = 5.0
SAVE_DELAY = 10.0

@dataclass
class TrackedDevice:
    name: str
    tracker: str                       # the device_tracker entity id
    device_id: str | None = None
    sensors: dict[str, str] = field(default_factory=dict)   # entity id -> scanner key
    estimator: Estimator | None = None
    outputs: Outputs | None = None

@dataclass(frozen=True)
class Scanner:
    key: str                # the Bermuda address its distance sensors name
    device_id: str          # HA device-registry id ("" when the device is not registered)
    name: str
    area_id: str | None

class PresenceCoordinator:
    def __init__(self, hass, entry: ConfigEntry[Any], coordinator: ActivityLevelsCoordinator,
                 topology: Topology, config: Mapping[str, Any]) -> None
    devices: dict[str, TrackedDevice]           # keyed by display name
    scanners: dict[str, Scanner]                # keyed by scanner key
    scanner_map: dict[str, str]                 # scanner key -> room id
    unmapped: list[str]
    disabled: list[str]                         # disabled distance sensor entity ids
    occupants: dict[str, list[str]]             # room id -> names, confidence >= threshold
    @property
    def ready(self) -> bool
    async def async_start(self) -> None
    async def async_stop(self) -> None
    def async_add_listener(self, cb: Callable[[], None]) -> Callable[[], None]
    def room_name(self, room: str) -> str       # "Away" for AWAY, else the group's name
    def payload(self) -> dict[str, Any]
    def diagnostics(self) -> dict[str, Any]

# websocket
# activity_levels/presence/state -> {
#   "enabled": bool, "devices": {name: Outputs.as_dict()}, "occupants": {room: [name]},
#   "scanners": [{"key","device_id","name","area_id","group_id"}],
#   "unmapped": [key], "disabled": [entity_id]}
```

**The fake Bermuda fixture (shown once; every later test references it by name).** Add to `tests/fixtures.py`:

```python
from dataclasses import dataclass

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

PHONE_ADDRESS = "aa:bb:cc:dd:ee:ff"


@dataclass
class FakeBermuda:
    """What a fake Bermuda install looks like from the registries.

    Bermuda gives each tracked device one ``device_tracker`` plus a ``sensor`` per
    scanner, keyed ``<device address>_<scanner address>_distance``, and registers each
    scanner as a device of its own carrying its Bluetooth address as an identifier. That
    is the whole contract we consume, so it is the whole thing this fake reproduces.
    """

    entry: MockConfigEntry
    tracker: str                     # device_tracker entity id
    sensors: dict[str, str]          # room id -> distance sensor entity id
    scanner_devices: dict[str, str]  # room id -> device registry id
    areas: dict[str, str]            # room id -> area id


def fake_bermuda(
    hass: HomeAssistant,
    rooms: tuple[str, ...] = ("kitchen", "dining_room", "hall", "bedroom", "back_patio"),
    *,
    disabled: tuple[str, ...] = (),
    unmapped: tuple[str, ...] = (),
) -> FakeBermuda:
    """Register a Bermuda entry with one scanner per room and one tracked phone.

    ``disabled`` names rooms whose distance sensor is registered but switched off (which
    is how Bermuda ships them). ``unmapped`` names rooms whose scanner device is given no
    area at all, so nothing can place it.
    """
    # The presence side keys off the loaded component, not off any Bermuda import.
    hass.config.components.add("bermuda")
    entry = MockConfigEntry(domain="bermuda", data={}, title="Bermuda BLE Trilateration")
    entry.add_to_hass(hass)

    areas = ar.async_get(hass)
    devices = dr.async_get(hass)
    entities = er.async_get(hass)

    phone = devices.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={("bermuda", PHONE_ADDRESS)},
        name="Scott's Phone",
    )
    tracker = entities.async_get_or_create(
        "device_tracker",
        "bermuda",
        f"{PHONE_ADDRESS}_tracker",
        config_entry=entry,
        device_id=phone.id,
        original_name="Scott's Phone",
        suggested_object_id="scotts_phone",
    )
    # a device-level entity that is not a per-scanner reading; discovery must ignore it
    entities.async_get_or_create(
        "sensor",
        "bermuda",
        f"{PHONE_ADDRESS}_area",
        config_entry=entry,
        device_id=phone.id,
        suggested_object_id="scotts_phone_area",
    )

    sensors: dict[str, str] = {}
    scanner_devices: dict[str, str] = {}
    room_areas: dict[str, str] = {}
    for index, room in enumerate(rooms):
        address = f"11:22:33:44:55:{index:02d}"
        area = areas.async_get_or_create(f"{room}_area")
        room_areas[room] = area.id
        scanner = devices.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={("bermuda", address)},
            name=f"{room} scanner",
        )
        if room not in unmapped:
            devices.async_update_device(scanner.id, area_id=area.id)
        scanner_devices[room] = scanner.id
        sensor = entities.async_get_or_create(
            "sensor",
            "bermuda",
            f"{PHONE_ADDRESS}_{address}_distance",
            config_entry=entry,
            device_id=phone.id,
            original_device_class="distance",
            suggested_object_id=f"scotts_phone_distance_to_{room}",
            disabled_by=er.RegistryEntryDisabler.INTEGRATION if room in disabled else None,
        )
        sensors[room] = sensor.entity_id

    return FakeBermuda(
        entry=entry,
        tracker=tracker.entity_id,
        sensors=sensors,
        scanner_devices=scanner_devices,
        areas=room_areas,
    )
```

> The topology's area→room mapping keys off the *group's* `area`, and `rooms_config` gives each room the area id `"<room>_area"` — which is exactly what `fake_bermuda` creates, so the two line up with no extra wiring. `ar.async_get_or_create("kitchen_area")` returns an area whose `id` is the slug `kitchen_area`.

- [ ] **Step 1: Tests first (RED).** `tests/test_presence_coordinator.py`:

```python
"""PresenceCoordinator: discovery, repair issues, observations, occupancy, persistence."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.activity_levels.const import (
    DOMAIN,
    ISSUE_BERMUDA_MISSING,
    ISSUE_DISABLED_SENSORS,
    ISSUE_NOT_BERMUDA,
    ISSUE_UNMAPPED_SCANNERS,
    PRESENCE_KEY,
)
from custom_components.activity_levels.presence_coordinator import (
    OBSERVATION_DEBOUNCE,
    REGISTRY_DEBOUNCE,
)
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import fake_bermuda, presence_config, rooms_config

ROOM_SENSORS = (
    "binary_sensor.kitchen_motion",
    "binary_sensor.dining_motion",
    "binary_sensor.hall_motion",
    "binary_sensor.bedroom_motion",
    "binary_sensor.patio_motion",
)


async def add_entry(hass: HomeAssistant, config: dict[str, Any] | None = None) -> MockConfigEntry:
    for entity_id in ROOM_SENSORS:
        hass.states.async_set(entity_id, "off")
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={},
        options=validate_config(config or presence_config()),
        title="Activity Levels",
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def observe(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    bermuda,
    near: str,
    *,
    home: bool = True,
) -> None:
    """Write one batch of distances, then let the debounce fire."""
    hass.states.async_set(bermuda.tracker, "home" if home else "not_home")
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, "0.5" if room == near else "8.0")
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


# -- discovery ---------------------------------------------------------------


async def test_discovery_finds_the_scanners_and_the_distance_sensors(
    hass: HomeAssistant,
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence

    assert presence is not None and presence.ready
    assert set(presence.devices) == {"Scott"}
    track = presence.devices["Scott"]
    assert track.tracker == bermuda.tracker
    assert set(track.sensors.values()) == set(presence.scanner_map)
    assert presence.scanner_map == {
        key: room for key, room in zip(sorted(presence.scanner_map), [], strict=False)
    } or set(presence.scanner_map.values()) == {
        "kitchen", "dining_room", "hall", "bedroom", "back_patio"
    }
    assert presence.unmapped == []
    # the device-level "area" sensor is not a per-scanner reading
    assert all("_area" not in entity_id for entity_id in track.sensors)


async def test_scanner_areas_override_the_area_mapping(hass: HomeAssistant) -> None:
    bermuda = fake_bermuda(hass, unmapped=("hall",))
    config = presence_config()
    config["presence"]["scanner_areas"] = {bermuda.scanner_devices["hall"]: "hall"}
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence
    assert presence.unmapped == []
    assert set(presence.scanner_map.values()) >= {"hall"}


# -- repair issues -----------------------------------------------------------


async def test_no_bermuda_raises_an_issue_and_leaves_the_entry_loaded(
    hass: HomeAssistant,
) -> None:
    entry = await add_entry(hass)          # no fake_bermuda call at all
    assert entry.state.recoverable_error is False    # the entry is LOADED
    presence = entry.runtime_data.presence
    assert presence is not None and presence.ready is False
    assert presence.devices == {}
    issues = ir.async_get(hass)
    assert issues.async_get_issue(DOMAIN, f"{ISSUE_BERMUDA_MISSING}_{entry.entry_id}")


async def test_a_device_that_is_not_bermudas_raises_an_issue(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    config = presence_config()
    config["presence"]["devices"] = [
        {"device": "device_tracker.somebody_elses", "name": "Ghost"}
    ]
    entry = await add_entry(hass, config)
    issues = ir.async_get(hass)
    issue = issues.async_get_issue(DOMAIN, f"{ISSUE_NOT_BERMUDA}_{entry.entry_id}")
    assert issue is not None
    assert "device_tracker.somebody_elses" in issue.translation_placeholders["entities"]
    assert entry.runtime_data.presence.devices == {}


async def test_disabled_distance_sensors_raise_an_issue_naming_the_fix(
    hass: HomeAssistant,
) -> None:
    bermuda = fake_bermuda(hass, disabled=("bedroom",))
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert bermuda.sensors["bedroom"] in presence.disabled
    assert "bedroom" not in presence.scanner_map.values()
    issue = ir.async_get(hass).async_get_issue(
        DOMAIN, f"{ISSUE_DISABLED_SENSORS}_{entry.entry_id}"
    )
    assert issue is not None and issue.is_fixable is False


async def test_an_unmapped_scanner_raises_an_issue_and_is_ignored(
    hass: HomeAssistant,
) -> None:
    fake_bermuda(hass, unmapped=("hall",))
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    assert len(presence.unmapped) == 1
    assert "hall" not in presence.scanner_map.values()
    assert ir.async_get(hass).async_get_issue(
        DOMAIN, f"{ISSUE_UNMAPPED_SCANNERS}_{entry.entry_id}"
    )


async def test_issues_are_cleared_when_the_problem_goes_away(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass, unmapped=("hall",))
    entry = await add_entry(hass)
    issues = ir.async_get(hass)
    assert issues.async_get_issue(DOMAIN, f"{ISSUE_UNMAPPED_SCANNERS}_{entry.entry_id}")

    dr.async_get(hass).async_update_device(
        bermuda.scanner_devices["hall"], area_id=bermuda.areas["hall"]
    )
    freezer.tick(timedelta(seconds=REGISTRY_DEBOUNCE + 1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert entry.runtime_data.presence.unmapped == []
    assert issues.async_get_issue(DOMAIN, f"{ISSUE_UNMAPPED_SCANNERS}_{entry.entry_id}") is None


async def test_an_infeasible_transition_setting_raises_an_issue(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    config = presence_config()
    config["presence"].update(stay=0.99, escape=0.1)
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence
    assert presence.ready is False
    assert ir.async_get(hass).async_get_issue(
        DOMAIN, f"transition_infeasible_{entry.entry_id}"
    )


# -- observations and occupancy ---------------------------------------------


async def test_observations_are_coalesced_and_drive_the_room(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    updates: list[None] = []
    presence.async_add_listener(lambda: updates.append(None))

    await observe(hass, freezer, bermuda, "kitchen")
    assert presence.devices["Scott"].outputs.room == "kitchen"
    # five sensors moved; one observation, so one notification
    assert len(updates) == 1


async def test_occupancy_notes_the_presence_voice_on_and_off(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    coordinator = entry.runtime_data.coordinator

    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    assert presence.occupants["kitchen"] == ["Scott"]
    assert coordinator.data["kitchen"].contributors[PRESENCE_KEY] > 0.0
    assert hass.states.get("sensor.kitchen_activity_level").state != "0.0"

    for _ in range(6):
        await observe(hass, freezer, bermuda, "dining_room")
    assert presence.occupants["kitchen"] == []
    assert presence.occupants["dining_room"] == ["Scott"]
    assert coordinator.tree.groups["kitchen"].presence.gate is False
    assert coordinator.tree.groups["dining_room"].presence.gate is True


async def test_below_the_threshold_nobody_is_an_occupant(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    config = presence_config()
    config["presence"]["threshold"] = 0.99
    entry = await add_entry(hass, config)
    presence = entry.runtime_data.presence

    hass.states.async_set(bermuda.tracker, "home")
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, "1.0" if room in ("kitchen", "dining_room") else "8.0")
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=OBSERVATION_DEBOUNCE + 0.1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert all(who == [] for who in presence.occupants.values())
    assert presence.devices["Scott"].outputs.moving is True


async def test_going_away_empties_every_room(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    presence = entry.runtime_data.presence
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")
    assert presence.occupants["kitchen"] == ["Scott"]

    for _ in range(6):
        await observe(hass, freezer, bermuda, "none", home=False)
    assert all(who == [] for who in presence.occupants.values())
    assert presence.devices["Scott"].outputs.room == "away"


# -- persistence and lifecycle ----------------------------------------------


async def test_the_belief_survives_a_reload(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "hall")
    await entry.runtime_data.presence.async_stop()
    await hass.async_block_till_done()
    stored = hass_storage[f"{DOMAIN}.presence.{entry.entry_id}"]["data"]
    assert stored["beliefs"]["Scott"]["states"][0] == "kitchen"

    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.runtime_data.presence.devices["Scott"].outputs.room == "hall"


async def test_a_changed_topology_discards_the_stored_belief(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "hall")
    await entry.runtime_data.presence.async_stop()

    smaller = presence_config()
    smaller["groups"][0]["children"][0]["children"][3].pop("adjacent", None)
    smaller["groups"][0]["children"][0]["children"][2]["adjacent"] = []
    hass.config_entries.async_update_entry(entry, options=validate_config(smaller))
    await hass.async_block_till_done()
    presence = entry.runtime_data.presence
    # nothing restored, so the belief is the uniform prior it starts from
    assert presence.devices["Scott"].outputs.confidence < 0.5


async def test_presence_off_constructs_nothing(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    entry = await add_entry(hass, rooms_config())     # presence absent
    assert entry.runtime_data.presence is None
    assert entry.runtime_data.topology.nodes            # the graph still exists
    assert ir.async_get(hass).issues == {}
    coordinator = entry.runtime_data.coordinator
    assert coordinator.tree.groups["kitchen"].presence is None
```

Run `cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_presence_coordinator.py -q` — expect `ModuleNotFoundError: …presence_coordinator`.

- [ ] **Step 2: Implement `presence_coordinator.py`.** Plain-Python glue — no numpy import in this file.

```python
"""The presence coordinator: Bermuda discovery, observations, occupancy.

The integration-side half of :mod:`.presence`, mirroring :class:`.PatternsCoordinator`.
It finds Bermuda's scanners and per-scanner distance sensors through the registries,
coalesces their updates into one :class:`.Observation` per device per tick, runs each
device's :class:`.Estimator`, and turns the answers into occupancy -- which is the only
thing the engine ever hears about presence.

Nothing here does arithmetic on a belief: the filter owns numpy, this owns Home
Assistant. Constructed only when ``presence.enabled`` is set; with Bermuda missing it
raises a repair issue and stays inert rather than failing setup.
"""

from __future__ import annotations

import logging
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_NOT_HOME, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    AWAY,
    CONF_PRESENCE,
    DOMAIN,
    ISSUE_BERMUDA_MISSING,
    ISSUE_DISABLED_SENSORS,
    ISSUE_NOT_BERMUDA,
    ISSUE_TRANSITION,
    ISSUE_UNMAPPED_SCANNERS,
    PRESENCE_STORAGE_VERSION,
    presence_storage_key,
)
from .coordinator import ActivityLevelsCoordinator
from .presence.estimator import Estimator, Outputs
from .presence.observation import BERMUDA_DOMAIN, Observation, parse_distance, scanner_key
from .topology import Topology

_LOGGER = logging.getLogger(__name__)

OBSERVATION_DEBOUNCE = 0.5
"""Bermuda rewrites a device's whole row of distance sensors at once, so waiting half a
second turns a burst of N state events into one observation instead of N."""
REGISTRY_DEBOUNCE = 5.0
"""Adopting one device rewrites the device registry and then every entity on it."""
SAVE_DELAY = 10.0
AWAY_LABEL = "Away"


@dataclass
class TrackedDevice:
    """One person's phone: where its readings come from, and what we make of them."""

    name: str
    tracker: str
    device_id: str | None = None
    sensors: dict[str, str] = field(default_factory=dict)
    estimator: Estimator | None = None
    outputs: Outputs | None = None


@dataclass(frozen=True)
class Scanner:
    """One Bermuda proxy, as the registries describe it."""

    key: str
    device_id: str
    name: str
    area_id: str | None


class PresenceCoordinator:
    """Owns the room estimate for one config entry."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry[Any],
        coordinator: ActivityLevelsCoordinator,
        topology: Topology,
        config: Mapping[str, Any],
    ) -> None:
        self.hass = hass
        self.entry = entry
        self.coordinator = coordinator
        self.topology = topology
        self.settings: dict[str, Any] = dict(config[CONF_PRESENCE])
        self.threshold: float = self.settings["threshold"]
        self.devices: dict[str, TrackedDevice] = {}
        self.scanners: dict[str, Scanner] = {}
        self.scanner_map: dict[str, str] = {}
        self.unmapped: list[str] = []
        self.disabled: list[str] = []
        self.occupants: dict[str, list[str]] = {gid: [] for gid in topology.nodes}
        self._store: Store[dict[str, Any]] = Store(
            hass, PRESENCE_STORAGE_VERSION, presence_storage_key(entry.entry_id)
        )
        self._beliefs: dict[str, Any] = {}
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._state_unsub: CALLBACK_TYPE | None = None
        self._registry_timer: CALLBACK_TYPE | None = None
        self._observe_timer: CALLBACK_TYPE | None = None
        self._dirty: set[str] = set()
        self._usable = False
        self._stopped = False

    # -- lifecycle -----------------------------------------------------------

    @property
    def ready(self) -> bool:
        """Whether anything is actually being estimated right now."""
        return self._usable and bool(self.devices)

    async def async_start(self) -> None:
        """Load the stored beliefs, discover Bermuda, and start listening.

        A missing Bermuda, or settings the graph cannot make a transition matrix from,
        leave the coordinator inert: the issue explains it, the entry still loads, and
        every other part of the integration goes on working.
        """
        stored = await self._store.async_load()
        self._beliefs = dict((stored or {}).get("beliefs") or {})

        if not self._bermuda_loaded():
            self._issue(ISSUE_BERMUDA_MISSING, present=True)
            _LOGGER.warning(
                "presence.enabled is set but Bermuda is not installed; the presence side "
                "stays off until it is"
            )
            return
        self._issue(ISSUE_BERMUDA_MISSING, present=False)

        problem = self.topology.feasible(self.settings["stay"], self.settings["escape"])
        self._issue(ISSUE_TRANSITION, present=problem is not None, detail=problem or "")
        if problem is not None:
            _LOGGER.warning("Presence is off: %s", problem)
            return

        self._usable = True
        self._discover()
        self._subscribe()
        for event in (er.EVENT_ENTITY_REGISTRY_UPDATED, dr.EVENT_DEVICE_REGISTRY_UPDATED):
            self._unsubs.append(self.hass.bus.async_listen(event, self._registry_changed))
        # a first observation from the states that are already there, so a restart does
        # not sit blank until somebody's phone next moves
        self._observe(dt_util.utcnow().timestamp())

    async def async_stop(self) -> None:
        """Cancel every timer and flush the beliefs. Idempotent."""
        if self._stopped:
            return
        self._stopped = True
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        for timer in (self._state_unsub, self._registry_timer, self._observe_timer):
            if timer is not None:
                timer()
        self._state_unsub = self._registry_timer = self._observe_timer = None
        self._listeners.clear()
        if self._usable:
            await self._store.async_save(self._snapshot())

    def _bermuda_loaded(self) -> bool:
        return BERMUDA_DOMAIN in self.hass.config.components or bool(
            self.hass.config_entries.async_entries(BERMUDA_DOMAIN)
        )

    # -- listeners -----------------------------------------------------------

    @callback
    def async_add_listener(self, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(cb)

        def remove() -> None:
            if cb in self._listeners:  # tolerate a second call
                self._listeners.remove(cb)

        return remove

    @callback
    def _notify(self) -> None:
        for cb in list(self._listeners):
            cb()

    # -- discovery -----------------------------------------------------------

    def _discover(self) -> None:
        """Re-read the registries: who is tracked, by which scanners, in which rooms.

        Everything is rebuilt from scratch each time -- a scanner moving to another area
        has to be able to move its readings with it -- but each device's belief is
        carried over, because the state space has not changed.
        """
        entities = er.async_get(self.hass)
        devices = dr.async_get(self.hass)
        self.scanners = {}
        disabled: list[str] = []
        wrong: list[str] = []
        tracked: dict[str, TrackedDevice] = {}

        for spec in self.settings["devices"]:
            entry = entities.async_get(spec["device"])
            if entry is None or entry.platform != BERMUDA_DOMAIN:
                wrong.append(spec["device"])
                continue
            name = spec["name"] or entry.name or entry.original_name or entry.entity_id
            track = TrackedDevice(name=name, tracker=entry.entity_id, device_id=entry.device_id)
            if entry.device_id is not None:
                for member in er.async_entries_for_device(
                    entities, entry.device_id, include_disabled_entities=True
                ):
                    key = scanner_key(member.unique_id)
                    if key is None or member.domain != "sensor":
                        continue  # the device's area sensor and friends are not readings
                    if member.disabled:
                        # Bermuda ships these off; without them there is nothing to filter
                        disabled.append(member.entity_id)
                        continue
                    track.sensors[member.entity_id] = key
                    self._register_scanner(devices, key)
            tracked[name] = track

        self._map_scanners()
        for name, track in tracked.items():
            previous = self.devices.get(name)
            track.estimator = Estimator(
                self.topology,
                self.scanner_map,
                stay=self.settings["stay"],
                escape=self.settings["escape"],
                scale=self.settings["scale"],
                floor=self.settings["floor"],
                stuck_after=self.settings["stuck_after"],
            )
            carried = (
                previous.estimator.snapshot()
                if previous is not None and previous.estimator is not None
                else self._beliefs.get(name)
            )
            if isinstance(carried, Mapping) and track.estimator.restore(carried):
                track.outputs = track.estimator.outputs()
            elif previous is not None:
                track.outputs = previous.outputs
        self.devices = tracked
        self.disabled = sorted(disabled)

        self._issue(ISSUE_NOT_BERMUDA, present=bool(wrong), entities=", ".join(sorted(wrong)))
        self._issue(
            ISSUE_DISABLED_SENSORS,
            present=bool(self.disabled),
            entities=", ".join(self.disabled),
        )
        self._issue(
            ISSUE_UNMAPPED_SCANNERS,
            present=bool(self.unmapped),
            scanners=", ".join(self.scanners[key].name for key in self.unmapped),
        )

    def _register_scanner(self, devices: dr.DeviceRegistry, key: str) -> None:
        """Find the HA device behind a scanner address, or record it unplaceable."""
        if key in self.scanners:
            return
        device = devices.async_get_device(identifiers={(BERMUDA_DOMAIN, key)})
        if device is None:
            device = devices.async_get_device(connections={(dr.CONNECTION_BLUETOOTH, key)})
        if device is None:
            self.scanners[key] = Scanner(key=key, device_id="", name=key, area_id=None)
            return
        self.scanners[key] = Scanner(
            key=key,
            device_id=device.id,
            name=device.name_by_user or device.name or key,
            area_id=device.area_id,
        )

    def _map_scanners(self) -> None:
        """Areas, then the explicit overrides, then whatever is left over."""
        configured: dict[str, str] = self.settings["scanner_areas"]
        overrides: dict[str, str] = {}
        for key, scanner in self.scanners.items():
            # a user types whichever id they can see: the device registry's, or the
            # Bluetooth address the sensor names
            gid = configured.get(key) or configured.get(scanner.device_id)
            if gid is not None:
                overrides[key] = gid
        self.scanner_map, self.unmapped = self.topology.map_scanners(
            {key: scanner.area_id for key, scanner in self.scanners.items()}, overrides
        )

    @callback
    def _registry_changed(self, _event: Event[Any]) -> None:
        """A registry moved. Debounced: adopting one device fires a burst of these."""
        if self._stopped or not self._usable:
            return
        if self._registry_timer is not None:
            self._registry_timer()
        self._registry_timer = async_call_later(self.hass, REGISTRY_DEBOUNCE, self._rediscover)

    @callback
    def _rediscover(self, _now: datetime) -> None:
        self._registry_timer = None
        if self._stopped:
            return
        def fingerprint() -> tuple[dict[str, str], dict[str, dict[str, str]]]:
            return (
                dict(self.scanner_map),
                {name: dict(track.sensors) for name, track in self.devices.items()},
            )

        before = fingerprint()
        self._discover()
        if before == fingerprint():
            return
        self._subscribe()
        self._observe(dt_util.utcnow().timestamp())

    # -- observations --------------------------------------------------------

    def _subscribe(self) -> None:
        """Point the state subscription at the entities discovery just found."""
        if self._state_unsub is not None:
            self._state_unsub()
            self._state_unsub = None
        watched = sorted(
            {track.tracker for track in self.devices.values()}
            | {entity_id for track in self.devices.values() for entity_id in track.sensors}
        )
        if not watched:
            return
        self._state_unsub = async_track_state_change_event(
            self.hass, watched, self._handle_state_event
        )

    @callback
    def _handle_state_event(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        for name, track in self.devices.items():
            if entity_id == track.tracker or entity_id in track.sensors:
                self._dirty.add(name)
        if not self._dirty or self._observe_timer is not None:
            return
        self._observe_timer = async_call_later(self.hass, OBSERVATION_DEBOUNCE, self._observe_due)

    @callback
    def _observe_due(self, _now: datetime) -> None:
        self._observe_timer = None
        if self._stopped:
            return
        self._observe(dt_util.utcnow().timestamp())

    def _observe(self, t: float) -> None:
        """Run the filter for every device whose readings moved since the last tick."""
        names = sorted(self._dirty) or sorted(self.devices)
        self._dirty.clear()
        moved = False
        for name in names:
            track = self.devices.get(name)
            if track is None or track.estimator is None:
                continue
            track.outputs = track.estimator.update(self._observation(track, t))
            moved = True
        if not moved:
            return
        self._apply_occupancy()
        self._store.async_delay_save(self._snapshot, SAVE_DELAY)
        self._notify()

    def _observation(self, track: TrackedDevice, t: float) -> Observation:
        distances: dict[str, float | None] = {}
        for entity_id, key in track.sensors.items():
            state = self.hass.states.get(entity_id)
            distances[key] = parse_distance(None if state is None else state.state)
        tracker = self.hass.states.get(track.tracker)
        home = tracker is not None and tracker.state not in (
            STATE_NOT_HOME,
            STATE_UNAVAILABLE,
            STATE_UNKNOWN,
        )
        return Observation(t=t, distances=distances, home=home)

    def _apply_occupancy(self) -> None:
        """Who is where, and the note-ons that follow.

        Somebody only counts where the filter is actually confident, so a person between
        two rooms is an occupant of neither -- ``moving`` is what an automation watches
        for that. Only the empty <-> occupied crossings reach the engine: the presence
        voice is a note, not a level, and a second person in the kitchen is not a second
        note-on.
        """
        occupants: dict[str, list[str]] = {gid: [] for gid in self.topology.nodes}
        for name, track in sorted(self.devices.items()):
            out = track.outputs
            if out is None or out.room == AWAY or out.confidence < self.threshold:
                continue
            occupants.setdefault(out.room, []).append(name)
        for gid, who in occupants.items():
            if bool(who) is not bool(self.occupants.get(gid)):
                self.coordinator.set_occupied(gid, bool(who))
        self.occupants = occupants

    # -- persistence ---------------------------------------------------------

    def _snapshot(self) -> dict[str, Any]:
        return {
            "beliefs": {
                name: track.estimator.snapshot()
                for name, track in self.devices.items()
                if track.estimator is not None
            }
        }

    # -- reads ---------------------------------------------------------------

    def room_name(self, room: str) -> str:
        """A room id as a person reads it. ``away`` is a room too, as far as this goes."""
        if room == AWAY:
            return AWAY_LABEL
        info = self.coordinator.tree.groups.get(room)
        return info.name if info is not None else room

    def payload(self) -> dict[str, Any]:
        """What ``activity_levels/presence/state`` answers."""
        return {
            "enabled": True,
            "devices": {
                name: track.outputs.as_dict()
                for name, track in self.devices.items()
                if track.outputs is not None
            },
            "occupants": {gid: list(who) for gid, who in self.occupants.items()},
            "scanners": [
                {
                    "key": scanner.key,
                    "device_id": scanner.device_id,
                    "name": scanner.name,
                    "area_id": scanner.area_id,
                    "group_id": self.scanner_map.get(scanner.key),
                }
                for scanner in sorted(self.scanners.values(), key=lambda s: s.name)
            ],
            "unmapped": list(self.unmapped),
            "disabled": list(self.disabled),
        }

    def diagnostics(self) -> dict[str, Any]:
        """The mapping and each device's raw belief: the two things a bug report needs."""
        return {
            "ready": self.ready,
            "settings": dict(self.settings),
            "scanner_map": dict(self.scanner_map),
            "unmapped": list(self.unmapped),
            "disabled": list(self.disabled),
            "occupants": {gid: list(who) for gid, who in self.occupants.items()},
            "devices": {
                name: {
                    "tracker": track.tracker,
                    "sensors": dict(track.sensors),
                    "outputs": None if track.outputs is None else track.outputs.as_dict(),
                    "belief": None if track.estimator is None else track.estimator.snapshot(),
                    "resets": 0 if track.estimator is None else track.estimator.resets,
                }
                for name, track in self.devices.items()
            },
        }

    # -- repair issues -------------------------------------------------------

    def _issue(self, key: str, *, present: bool, **placeholders: str) -> None:
        """Raise or clear one repair issue, scoped to this entry."""
        issue_id = f"{key}_{self.entry.entry_id}"
        if not present:
            ir.async_delete_issue(self.hass, DOMAIN, issue_id)
            return
        ir.async_create_issue(
            self.hass,
            DOMAIN,
            issue_id,
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key=key,
            translation_placeholders=placeholders or None,
        )
```

- [ ] **Step 3: Setup wiring, runtime, websocket, diagnostics, translations.**

`runtime.py` — replace the placeholder type:

```python
@dataclass
class RuntimeData:
    """The coordinators an entry owns, plus the room graph they all read."""

    coordinator: ActivityLevelsCoordinator
    patterns: PatternsCoordinator
    topology: Topology
    presence: PresenceCoordinator | None = None
```

`__init__.py` — construct it only when it is asked for, after the patterns coordinator (so every precondition is wired) and before the platforms are forwarded (so the entities find it):

```python
    presence: PresenceCoordinator | None = None
    if config[CONF_PRESENCE]["enabled"]:
        presence = PresenceCoordinator(hass, entry, coordinator, topology, config)
        entry.async_on_unload(presence.async_stop)
        await presence.async_start()
    entry.runtime_data = RuntimeData(
        coordinator=coordinator, patterns=patterns, topology=topology, presence=presence
    )
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
```

`websocket_api.py` — register `ws_presence_state` and add:

```python
@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/presence/state"})
@callback
def ws_presence_state(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (runtime := _loaded(hass, connection, msg)) is None:
        return
    presence = runtime.presence
    if presence is None:
        # opted out is an answer, not an error: the panel hides the tab and moves on
        connection.send_result(
            msg["id"],
            {
                "enabled": False,
                "devices": {},
                "occupants": {},
                "scanners": [],
                "unmapped": [],
                "disabled": [],
            },
        )
        return
    connection.send_result(msg["id"], presence.payload())
```

`diagnostics.py` — replace the placeholder:

```python
        "topology": entry.runtime_data.topology.payload(),
        "presence": (
            None
            if entry.runtime_data.presence is None
            else entry.runtime_data.presence.diagnostics()
        ),
```

`strings.json` (and the same block mirrored into `translations/en.json`), at the top level next to `services`:

```json
  "issues": {
    "bermuda_missing": {
      "title": "Bermuda is not installed",
      "description": "Activity Levels has presence tracking switched on, but the Bermuda BLE Trilateration integration is not installed, so there is nothing to estimate rooms from. Install Bermuda, or turn presence off in the Presence tab of the Activity Levels panel."
    },
    "not_a_bermuda_device": {
      "title": "Tracked device is not a Bermuda device_tracker",
      "description": "These tracked devices are not provided by Bermuda and are being ignored: {entities}. Pick a device_tracker that Bermuda created, in the Presence tab of the Activity Levels panel."
    },
    "disabled_distance_sensors": {
      "title": "Bermuda distance sensors are disabled",
      "description": "Bermuda ships its per-scanner distance sensors disabled, and these are still off: {entities}. Enable them under Settings > Devices & services > Bermuda > the tracked device, then reload Activity Levels."
    },
    "unmapped_scanners": {
      "title": "Some Bermuda scanners are in no room",
      "description": "These scanners are not in an area that any room group claims, so their readings are ignored: {scanners}. Give the scanner device an area that matches a room's area, or map it directly with presence.scanner_areas."
    },
    "transition_infeasible": {
      "title": "Presence settings cannot make a transition matrix",
      "description": "{detail} Presence stays off until this is fixed in the Presence tab of the Activity Levels panel."
    }
  }
```

- [ ] **Step 4: Gate and commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_presence_coordinator.py -q
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest -q && uv run ruff check . && uv run ruff format --check . && uv run mypy
```

Expected: all green. Two things to watch for while iterating:

- `test_observations_are_coalesced_and_drive_the_room` asserts **one** notification for five state writes — if it sees five, `_handle_state_event` is arming a timer per event instead of checking `self._observe_timer is not None` first.
- `hassfest` validates `strings.json`: every `translation_key` passed to `async_create_issue` needs a key under `issues`, and `translations/en.json` must match. Check with `cd /Users/sholodak/elevenrose/activity-levels && python3 -c "import json; a=json.load(open('custom_components/activity_levels/strings.json')); b=json.load(open('custom_components/activity_levels/translations/en.json')); assert a == b, 'strings.json and translations/en.json have drifted'"`.

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/presence_coordinator.py custom_components/activity_levels/__init__.py custom_components/activity_levels/runtime.py custom_components/activity_levels/websocket_api.py custom_components/activity_levels/diagnostics.py custom_components/activity_levels/strings.json custom_components/activity_levels/translations/en.json tests/fixtures.py tests/test_presence_coordinator.py && git commit -m "feat(presence): Bermuda-backed presence coordinator with repair issues and occupancy"
```

---

### Task 6: Entities — room, moving, occupants

**Files:** modify `custom_components/activity_levels/entity.py`, `sensor.py`, `binary_sensor.py`, `__init__.py`, `const.py`, `strings.json`, `translations/en.json`; test `tests/test_presence_entities.py`.

**Interfaces:**
```python
# entity.py
class PresenceEntity(Entity):
    """One tracked person's entity, on its own "Presence: <name>" device."""
    def __init__(self, presence: PresenceCoordinator, name: str, suffix: str,
                 platform: Platform) -> None
    @property
    def outputs(self) -> Outputs | None
    @property
    def available(self) -> bool          # False until the filter has answered once

# sensor.py
class RoomSensor(PresenceEntity, SensorEntity)          # sensor.<slug>_room
class OccupantsSensor(ActivityLevelsEntity, SensorEntity)   # sensor.<group>_occupants
# binary_sensor.py
class MovingBinarySensor(PresenceEntity, BinarySensorEntity)  # binary_sensor.<slug>_moving

# __init__.py
def _create_devices(hass, entry, tree) -> set[tuple[str, str]]      # returns wanted ids
def _create_presence_devices(hass, entry, names: Iterable[str]) -> set[tuple[str, str]]
def _prune_devices(hass, entry, wanted: set[tuple[str, str]]) -> None
```

Entity ids follow the existing convention exactly: `sensor.<slugified name>_room`, `binary_sensor.<slugified name>_moving`, `sensor.<group id>_occupants`. Unique ids are `<entry_id>-presence-<slug>-<suffix>` and `<entry_id>-<gid>-occupants`.

- [ ] **Step 1: Tests first (RED).** `tests/test_presence_entities.py`:

```python
"""The entities the presence side creates, and the ones it must not."""

from __future__ import annotations

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from custom_components.activity_levels.const import DOMAIN
from tests.fixtures import fake_bermuda, rooms_config
from tests.test_presence_coordinator import add_entry, observe


async def test_presence_entities_and_their_device(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    entry = await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")

    room = hass.states.get("sensor.scott_room")
    assert room.state == "Kitchen"                       # the group's friendly name
    assert room.attributes["group_id"] == "kitchen"
    assert room.attributes["confidence"] > 0.6
    assert room.attributes["moving"] is False
    assert "Kitchen" in room.attributes["candidates"]
    assert room.attributes["path"][-1] == "Kitchen"
    assert room.attributes["updated"] is not None
    assert hass.states.get("binary_sensor.scott_moving").state == "off"

    devices = dr.async_get(hass)
    device = devices.async_get_device(identifiers={(DOMAIN, "presence_scott")})
    assert device is not None and device.name == "Presence: Scott"
    hub = devices.async_get_device(identifiers={(DOMAIN, entry.entry_id)})
    assert device.via_device_id == hub.id

    entities = er.async_get(hass)
    assert entities.async_get("sensor.scott_room").unique_id == (
        f"{entry.entry_id}-presence-scott-room"
    )


async def test_occupants_sensor_counts_and_names(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    for _ in range(4):
        await observe(hass, freezer, bermuda, "kitchen")

    occupants = hass.states.get("sensor.kitchen_occupants")
    assert occupants.state == "1"
    assert occupants.attributes["who"] == ["Scott"]
    assert hass.states.get("sensor.dining_room_occupants").state == "0"
    # branches are not rooms and get no occupants sensor
    assert hass.states.get("sensor.downstairs_occupants") is None


async def test_away_reads_as_away(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    for _ in range(6):
        await observe(hass, freezer, bermuda, "none", home=False)
    room = hass.states.get("sensor.scott_room")
    assert room.state == "Away"
    assert room.attributes["group_id"] is None


async def test_moving_turns_on_between_two_adjacent_rooms(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    bermuda = fake_bermuda(hass)
    await add_entry(hass)
    hass.states.async_set(bermuda.tracker, "home")
    for room, entity_id in bermuda.sensors.items():
        hass.states.async_set(entity_id, "1.0" if room in ("kitchen", "dining_room") else "8.0")
    await hass.async_block_till_done()
    await observe(hass, freezer, bermuda, "__none__")   # let the debounce fire
    assert hass.states.get("binary_sensor.scott_moving").state == "on"


async def test_presence_off_creates_no_presence_entities(hass: HomeAssistant) -> None:
    fake_bermuda(hass)
    await add_entry(hass, rooms_config())
    assert hass.states.get("sensor.scott_room") is None
    assert hass.states.get("binary_sensor.scott_moving") is None
    assert hass.states.get("sensor.kitchen_occupants") is None
    assert dr.async_get(hass).async_get_device(identifiers={(DOMAIN, "presence_scott")}) is None


async def test_no_bermuda_creates_no_presence_entities(hass: HomeAssistant) -> None:
    await add_entry(hass)          # presence on, Bermuda absent
    assert hass.states.get("sensor.scott_room") is None
    assert hass.states.get("sensor.kitchen_occupants") is None
    # and the ordinary entities are untouched
    assert hass.states.get("sensor.kitchen_activity_level") is not None


async def test_a_removed_tracked_device_takes_its_device_with_it(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    fake_bermuda(hass)
    entry = await add_entry(hass)
    devices = dr.async_get(hass)
    assert devices.async_get_device(identifiers={(DOMAIN, "presence_scott")}) is not None

    options = dict(entry.options)
    options["presence"] = {**options["presence"], "devices": []}
    hass.config_entries.async_update_entry(entry, options=options)
    await hass.async_block_till_done()

    stale = devices.async_get_device(identifiers={(DOMAIN, "presence_scott")})
    assert stale is None or entry.entry_id not in stale.config_entries
```

Run `cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_presence_entities.py -q` — expect every `hass.states.get(...)` to be `None`.

- [ ] **Step 2: `entity.py` — the base.**

```python
from homeassistant.util import slugify

from .const import DOMAIN, MANUFACTURER, MODEL_PRESENCE


class PresenceEntity(Entity):
    """One tracked person's entity, hung off its own device under the hub.

    A person is not a group, so this does not extend :class:`ActivityLevelsEntity`: it
    follows the presence coordinator instead of the level one, and it is unavailable
    until the filter has actually answered -- an estimate nobody has made yet is not
    "unknown room", it is no reading.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        presence: PresenceCoordinator,
        name: str,
        suffix: str,
        platform: Platform,
    ) -> None:
        self.presence = presence
        self.person = name
        slug = slugify(name)
        self._attr_unique_id = f"{presence.entry.entry_id}-presence-{slug}-{suffix}"
        self.entity_id = f"{platform}.{slug}_{suffix}"
        self._attr_translation_key = suffix
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, f"presence_{slug}")})

    @property
    def outputs(self) -> Outputs | None:
        """This person's last estimate, or None while there has not been one."""
        track = self.presence.devices.get(self.person)
        return None if track is None else track.outputs

    @property
    def available(self) -> bool:
        return self.outputs is not None

    async def async_added_to_hass(self) -> None:
        """Write state whenever the filter has something new to say."""
        await super().async_added_to_hass()
        self.async_on_remove(self.presence.async_add_listener(self.async_write_ha_state))
```

- [ ] **Step 3: `sensor.py` and `binary_sensor.py`.** In `sensor.py`'s `async_setup_entry`, after the group loop:

```python
    presence = entry.runtime_data.presence
    if presence is not None and presence.ready:
        entities.extend(RoomSensor(presence, name) for name in sorted(presence.devices))
        entities.extend(
            OccupantsSensor(coordinator, presence, coordinator.tree.groups[gid])
            for gid in entry.runtime_data.topology.nodes
        )
    async_add_entities(entities)
```

```python
class RoomSensor(PresenceEntity, SensorEntity):
    """Which room this person is believed to be in."""

    # candidates and path change on every update: worth having live, dead weight recorded
    _unrecorded_attributes = frozenset({ATTR_CANDIDATES, ATTR_PATH})

    def __init__(self, presence: PresenceCoordinator, name: str) -> None:
        """Set up the room sensor for one tracked person."""
        super().__init__(presence, name, "room", Platform.SENSOR)

    @property
    def native_value(self) -> str | None:
        """The room's friendly name, or "Away". Names, not ids: this is a display."""
        out = self.outputs
        return None if out is None else self.presence.room_name(out.room)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """The id an automation wants, and everything behind the answer."""
        out = self.outputs
        if out is None:
            return {}
        return {
            ATTR_GROUP_ID: None if out.room == AWAY else out.room,
            ATTR_CONFIDENCE: out.confidence,
            ATTR_MOVING: out.moving,
            ATTR_CANDIDATES: {
                self.presence.room_name(room): p for room, p in out.candidates.items()
            },
            ATTR_PATH: [self.presence.room_name(room) for room in out.path],
            ATTR_UPDATED: dt_util.utc_from_timestamp(out.t).isoformat(),
        }


class OccupantsSensor(ActivityLevelsEntity, SensorEntity):
    """How many people are believed to be in this room.

    On the *group's* device rather than a person's: it is a property of the room, it
    belongs next to the room's activity level, and an automation that reads one wants
    the other in reach.
    """

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self,
        coordinator: ActivityLevelsCoordinator,
        presence: PresenceCoordinator,
        info: GroupInfo,
    ) -> None:
        """Set up the occupants sensor for one room."""
        super().__init__(coordinator, info, "occupants", Platform.SENSOR)
        self.presence = presence

    @property
    def native_value(self) -> int:
        """People confidently placed here. Someone mid-doorway counts nowhere."""
        return len(self.presence.occupants.get(self.info.id, []))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {ATTR_WHO: list(self.presence.occupants.get(self.info.id, []))}

    async def async_added_to_hass(self) -> None:
        """Follow the presence coordinator as well as the level one."""
        await super().async_added_to_hass()
        self.async_on_remove(self.presence.async_add_listener(self.async_write_ha_state))
```

`binary_sensor.py`, same gating in `async_setup_entry`:

```python
class MovingBinarySensor(PresenceEntity, BinarySensorEntity):
    """On while this person's top two rooms are adjacent and both plausible.

    The counterpart to the confidence threshold: somebody in a doorway is an occupant
    of neither room, and this is how an automation notices them anyway.
    """

    _attr_device_class = BinarySensorDeviceClass.MOVING

    def __init__(self, presence: PresenceCoordinator, name: str) -> None:
        """Set up the moving sensor for one tracked person."""
        super().__init__(presence, name, "moving", Platform.BINARY_SENSOR)

    @property
    def is_on(self) -> bool:
        out = self.outputs
        return out is not None and out.moving
```

- [ ] **Step 4: Devices in `__init__.py`.** Split the creation from the pruning so a presence device is created before anything decides it is stale:

```python
def _create_devices(hass: HomeAssistant, entry: ConfigEntry, tree: Tree) -> set[tuple[str, str]]:
    """Mirror the group tree into the device registry; return the identifiers it owns."""
    registry = dr.async_get(hass)
    registry.async_get_or_create(...)          # the hub, unchanged
    for info in tree.group_order():
        registry.async_get_or_create(...)      # unchanged
    return {(DOMAIN, gid) for gid in tree.groups} | {(DOMAIN, entry.entry_id)}


def _create_presence_devices(
    hass: HomeAssistant, entry: ConfigEntry, names: Iterable[str]
) -> set[tuple[str, str]]:
    """One device per tracked person, under the hub. Empty when presence is off."""
    registry = dr.async_get(hass)
    wanted: set[tuple[str, str]] = set()
    for name in names:
        identifier = (DOMAIN, f"presence_{slugify(name)}")
        registry.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={identifier},
            name=f"Presence: {name}",
            manufacturer=MANUFACTURER,
            model=MODEL_PRESENCE,
            via_device=(DOMAIN, entry.entry_id),
        )
        wanted.add(identifier)
    return wanted


def _prune_devices(hass: HomeAssistant, entry: ConfigEntry, wanted: set[tuple[str, str]]) -> None:
    """Drop this entry from any device the current configuration no longer describes.

    Separate from creation, and run after *both* passes: a person's device is created
    later than the groups', and pruning in between would take it away every reload.
    """
    registry = dr.async_get(hass)
    for device in dr.async_entries_for_config_entry(registry, entry.entry_id):
        if not device.identifiers & wanted:
            registry.async_update_device(device.id, remove_config_entry_id=entry.entry_id)
```

and in `async_setup_entry`, replace the single `_create_devices(hass, entry, tree)` call with:

```python
    wanted = _create_devices(hass, entry, tree)
    coordinator = ActivityLevelsCoordinator(hass, entry.entry_id, tree)
    ...
    presence: PresenceCoordinator | None = None
    if config[CONF_PRESENCE]["enabled"]:
        ...
        await presence.async_start()
        wanted |= _create_presence_devices(hass, entry, sorted(presence.devices))
    _prune_devices(hass, entry, wanted)
    entry.runtime_data = RuntimeData(...)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
```

- [ ] **Step 5: Translations.** Add to `strings.json` and `translations/en.json` under `entity`:

```json
    "sensor": {
      "room": { "name": "Room" },
      "occupants": { "name": "Occupants" }
    },
    "binary_sensor": { "moving": { "name": "Moving" } }
```

(merged into the existing `sensor` and `binary_sensor` objects, not replacing them).

- [ ] **Step 6: Gate and commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_presence_entities.py tests/test_init.py -q
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest -q && uv run ruff check . && uv run ruff format --check . && uv run mypy
cd /Users/sholodak/elevenrose/activity-levels && python3 -c "import json; a=json.load(open('custom_components/activity_levels/strings.json')); b=json.load(open('custom_components/activity_levels/translations/en.json')); assert a == b"
```

Expected: green, and `test_init.py::test_setup_creates_devices_and_entities` still passes — the pruning moved but its behaviour did not.

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/entity.py custom_components/activity_levels/sensor.py custom_components/activity_levels/binary_sensor.py custom_components/activity_levels/__init__.py custom_components/activity_levels/const.py custom_components/activity_levels/strings.json custom_components/activity_levels/translations/en.json tests/test_presence_entities.py && git commit -m "feat(presence): room, moving and occupants entities"
```

---

### Task 7: Frontend — types, model, adjacency/exit in the group form, the presence stimulus row

**Files:** modify `frontend/src/types.ts`, `model.ts`, `group-form.ts`, `errors.ts`, `api.ts`, `al-strip-controls.ts`; tests `frontend/test/group-form.test.ts` (new), `model.test.ts`, `errors.test.ts`, `api.test.ts`, `al-strip-controls.test.ts`.

**Interfaces:**
```ts
// types.ts
export interface Adjacency { id: string; one_way: boolean }
export interface PresenceOverrides extends EnvelopeOverrides { gain: number; envelope: string | null }
export interface PresenceDevice { device: string; name: string | null }
export interface PresenceSettings {
  enabled: boolean; devices: PresenceDevice[]; envelope: string | null; threshold: number;
  stay: number; escape: number; scale: number; floor: number; stuck_after: number;
  scanner_areas: Record<string, string>;
}
// Group gains: adjacent: (string | Adjacency)[]; exit: boolean; presence: PresenceOverrides
// Config gains: presence?: PresenceSettings   (optional: a never-saved entry has none)
export interface TopologyPayload { nodes: string[]; edges: [string, string, boolean][]; exits: string[] }
export interface PresenceOutputs {
  t: number; room: string; confidence: number; moving: boolean;
  candidates: Record<string, number>; path: string[];
}
export interface ScannerRow {
  key: string; device_id: string; name: string; area_id: string | null; group_id: string | null;
}
export interface PresenceState {
  enabled: boolean; devices: Record<string, PresenceOutputs>;
  occupants: Record<string, string[]>; scanners: ScannerRow[];
  unmapped: string[]; disabled: string[];
}

// model.ts
export const newPresenceOverrides: () => PresenceOverrides
export const adjacencyId: (a: string | Adjacency) => string
export const isOneWay: (a: string | Adjacency) => boolean
export function roomIds(config: Config): Set<string>            // mirrors topology.room_ids
export function presenceSettings(config: Config): PresenceSettings   // defaults filled in
export const PRESENCE_KEY = "presence"

// errors.ts
export function listFieldError(errors: ValidationError[], prefix: Path, field: string): string | undefined

// group-form.ts
export type GroupField = "id" | "name" | "area" | "mix" | "null_handling" | "gain" | "adjacent" | "exit"
export function groupSchema(group, isRoot, fields, config?): FormItem[]
// `adjacent` needs the sibling ids, so groupSchema/groupData take the config when the
// field list includes it.

// api.ts
export const getTopology = (hass) => Promise<TopologyPayload>
export const getTopologyPaths = (hass, from: string, to: string) => Promise<string[][]>
export const getPresenceState = (hass) => Promise<PresenceState>
```

- [ ] **Step 1: Tests first (RED).** `frontend/test/group-form.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { changedGroupField, groupData, groupSchema, mergeGroup } from "../src/group-form";
import { houseConfig, roomsConfig } from "./fixtures";
import type { Group } from "../src/types";

const FIELDS = ["id", "name", "adjacent", "exit"] as const;
const kitchen = (): Group => roomsConfig().groups[0]!.children[0]!.children[0]!;

describe("adjacency fields", () => {
  it("offers every other group, never the group itself", () => {
    const config = roomsConfig();
    const item = groupSchema(kitchen(), false, FIELDS, config).find((i) => i.name === "adjacent")!;
    const options = (item.selector.select as { options: { value: string }[] }).options;
    expect(options.map((o) => o.value)).not.toContain("kitchen");
    expect(options.map((o) => o.value)).toContain("dining_room");
    expect((item.selector.select as { multiple?: boolean }).multiple).toBe(true);
  });

  it("spells the current value as plain ids", () => {
    expect(groupData(kitchen(), false, FIELDS, roomsConfig()).adjacent).toEqual([
      "dining_room",
      "back_patio",
    ]);
    expect(groupData(kitchen(), false, FIELDS, roomsConfig()).exit).toBe(false);
  });

  it("keeps a one-way edge one-way when the picker did not touch it", () => {
    const hall = roomsConfig().groups[0]!.children[0]!.children[2]!;
    const merged = mergeGroup(hall, { adjacent: ["bedroom", "dining_room"] });
    expect(merged.adjacent).toEqual([{ id: "bedroom", one_way: true }, "dining_room"]);
    expect(changedGroupField(merged, hall)).toBe("adjacent");
  });

  it("drops an edge the picker deselected", () => {
    const merged = mergeGroup(kitchen(), { adjacent: ["dining_room"] });
    expect(merged.adjacent).toEqual(["dining_room"]);
  });

  it("reports no change when the selection is the same set", () => {
    const group = kitchen();
    expect(changedGroupField(mergeGroup(group, { adjacent: ["dining_room", "back_patio"] }), group))
      .toBeUndefined();
  });

  it("merges the exit toggle", () => {
    expect(mergeGroup(kitchen(), { exit: true }).exit).toBe(true);
  });

  it("leaves a config with no adjacency alone", () => {
    const group = houseConfig().groups[0]!;
    expect(groupData(group, true, FIELDS, houseConfig()).adjacent).toEqual([]);
  });
});
```

`frontend/test/errors.test.ts` — add:

```ts
it("folds indexed list errors onto the field", () => {
  const errors = [
    { path: "groups/0/adjacent/1", message: "unknown group 'nope'" },
    { path: "groups/0/name", message: "bad" },
  ];
  expect(listFieldError(errors, ["groups", 0], "adjacent")).toBe("unknown group 'nope'");
  expect(listFieldError(errors, ["groups", 0], "exit")).toBeUndefined();
});
```

`frontend/test/model.test.ts` — add:

```ts
it("knows which groups are rooms", () => {
  expect(roomIds(roomsConfig())).toEqual(
    new Set(["kitchen", "dining_room", "hall", "bedroom", "back_patio"]),
  );
  expect(roomIds(houseConfig()).size).toBe(0);
});

it("fills in presence defaults for a config that has never been saved", () => {
  const config = { ...houseConfig() };
  delete (config as { presence?: unknown }).presence;
  expect(presenceSettings(config).enabled).toBe(false);
  expect(presenceSettings(config).threshold).toBe(0.6);
});
```

`frontend/test/api.test.ts` — add a case per new call, asserting the message shape:

```ts
it("asks for the topology and for paths", async () => {
  const calls: Record<string, unknown>[] = [];
  const hass = mockHass((msg) => {
    calls.push(msg);
    return msg.type === "activity_levels/topology"
      ? { nodes: ["kitchen"], edges: [], exits: [] }
      : { paths: [["kitchen", "hall"]] };
  });
  await getTopology(hass);
  expect(await getTopologyPaths(hass, "kitchen", "hall")).toEqual([["kitchen", "hall"]]);
  expect(calls[1]).toEqual({ type: "activity_levels/topology/paths", from: "kitchen", to: "hall" });
});
```

`frontend/test/al-strip-controls.test.ts` — add:

```ts
it("lists presence as the first stimulus of a room", async () => {
  const el = await fixture(config, ["groups", 0, "children", 0, "children", 0]);
  const heads = [...el.shadowRoot!.querySelectorAll(".stimulus-head .name")].map((n) => n.textContent!.trim());
  expect(heads[0]).toBe("Presence (anyone here)");
});

it("edits the presence gain against the group's presence block", async () => {
  const el = await fixture(config, ["groups", 0, "children", 0, "children", 0]);
  const changed = listenFor(el, "al-change");
  el.shadowRoot!.querySelector<HTMLElement>(".presence-gain")!
    .dispatchEvent(new CustomEvent("value-changed", { detail: { value: 3 } }));
  const next = (await changed).detail;
  expect(next.groups[0].children[0].children[0].presence.gain).toBe(3);
});

it("does not list presence for a branch, or when presence is off", async () => {
  const branch = await fixture(config, ["groups", 0, "children", 0]);
  expect(branch.shadowRoot!.textContent).not.toContain("Presence (anyone here)");
  const off = await fixture(roomsConfig(), ["groups", 0, "children", 0, "children", 0]);
  expect(off.shadowRoot!.textContent).not.toContain("Presence (anyone here)");
});
```

`frontend/test/fixtures.ts` gains `roomsConfig()` and `presenceConfig()` — the TypeScript mirrors of the Python fixtures, with every field the `Config` type requires. Keep the two in step by hand; there is no generator, and the panel's copy only needs the fields the panel reads.

Run `cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/group-form.test.ts` — expect `groupSchema` to reject the fourth argument and `adjacent` to be missing from `Group`.

- [ ] **Step 2: `types.ts` and `model.ts`.** Add the interfaces above; `Group` gains `adjacent`, `exit`, `presence`, and `Config` gains `presence?: PresenceSettings` (optional, because a config written before this release has none — every read goes through `presenceSettings`). Then:

```ts
export const PRESENCE_KEY = "presence";

export const newPresenceOverrides = (): PresenceOverrides => ({
  gain: 1,
  envelope: null,
  attack: null, decay: null, sustain: null, release: null,
  impulse: null, retrigger: null, unavailable: null, debounce: null,
});

export const adjacencyId = (a: string | Adjacency): string => (typeof a === "string" ? a : a.id);
export const isOneWay = (a: string | Adjacency): boolean => typeof a !== "string" && a.one_way;

const PRESENCE_DEFAULTS: PresenceSettings = {
  enabled: false, devices: [], envelope: null, threshold: 0.6, stay: 0.9, escape: 0.001,
  scale: 3, floor: 0.05, stuck_after: 60, scanner_areas: {},
};

/** The presence block with every default filled in; a config that predates it reads as off. */
export const presenceSettings = (config: Config): PresenceSettings => ({
  ...PRESENCE_DEFAULTS,
  ...(config.presence ?? {}),
});

/**
 * Which groups are rooms, by the same rule the backend uses: a group that declares an
 * edge, is named by somebody else's edge, or is a way out of the house. The panel needs
 * the answer before the websocket has one - the group form has to know whether to offer
 * a presence row while the config is still a draft.
 */
export function roomIds(config: Config): Set<string> {
  const declared = new Set<string>();
  const named = new Set<string>();
  const exits = new Set<string>();
  const known = allGroupIds(config);
  const walk = (g: Group): void => {
    for (const edge of g.adjacent ?? []) {
      const other = adjacencyId(edge);
      if (other === g.id || !known.has(other)) continue;
      declared.add(g.id);
      named.add(other);
    }
    if (g.exit) exits.add(g.id);
    g.children.forEach(walk);
  };
  config.groups.forEach(walk);
  return new Set([...declared, ...named, ...exits]);
}
```

`newGroup` gains `adjacent: []`, `exit: false`, `presence: newPresenceOverrides()`.

- [ ] **Step 3: `errors.ts` and `group-form.ts`.**

```ts
/**
 * The first error under `prefix/field/<index>`, for a field whose errors are indexed.
 * `fieldErrors` only keeps leaf paths, so `groups/0/adjacent/1` would otherwise land
 * nowhere - and an unknown room has to be shown against the picker that chose it.
 */
export function listFieldError(
  errors: ValidationError[],
  prefix: Path,
  field: string,
): string | undefined {
  const pre = `${pathKey(prefix)}/${field}/`;
  return errors.find((e) => e.path.startsWith(pre))?.message;
}
```

In `group-form.ts`: extend `GroupField`, the labels/helpers, `GROUP_FORM_FIELDS`, and thread the config through:

```ts
export const GROUP_LABELS: Record<string, string> = {
  ...,
  adjacent: "Adjacent rooms",
  exit: "Way out of the house",
};

export const GROUP_HELPERS: Record<string, string> = {
  ...,
  adjacent:
    "Rooms you can walk to from here. Symmetric: naming one from either side is enough. One-way connections are shown with an arrow and edited in YAML.",
  exit: "People can leave the house from this room, so presence can move from here to Away.",
};

export const GROUP_FORM_FIELDS: (keyof Group)[] = [
  "id", "name", "area", "mix", "null_handling", "gain", "adjacent", "exit",
];

const EXIT_SELECTOR: Selector = { boolean: {} };

/** Every other group, in tree order: what a room can be adjacent to. */
function adjacentSelector(config: Config, group: Group): Selector {
  const options: { value: string; label: string }[] = [];
  const walk = (g: Group): void => {
    if (g.id !== group.id) options.push({ value: g.id, label: g.name ?? g.id });
    g.children.forEach(walk);
  };
  config.groups.forEach(walk);
  return { select: { multiple: true, mode: "dropdown", sort: false, options } };
}

export function groupSchema(
  group: Group,
  isRoot: boolean,
  fields: readonly GroupField[],
  config?: Config,
): FormItem[] {
  const selectors: Record<GroupField, Selector> = {
    ...,
    adjacent: config ? adjacentSelector(config, group) : { select: { multiple: true, options: [] } },
    exit: EXIT_SELECTOR,
  };
  ...
}
```

`groupData` gains the same optional `config` argument and spells `adjacent` as `(group.adjacent ?? []).map(adjacencyId)` and `exit` as `group.exit === true`. The merge preserves one-way edges:

```ts
/**
 * Folds an `ha-form` payload back into the group. The adjacency picker only ever
 * produces ids, so a one-way edge that is still selected keeps the object it had -
 * dropping to a plain id would silently make a laundry chute a doorway.
 */
export function mergeGroup(group: Group, v: Record<string, unknown>): Group {
  const merged: Group = { ...group };
  ...
  if ("adjacent" in v) {
    const chosen = Array.isArray(v.adjacent) ? (v.adjacent as string[]).map(String) : [];
    const existing = new Map((group.adjacent ?? []).map((a) => [adjacencyId(a), a]));
    merged.adjacent = chosen.map((id) => existing.get(id) ?? id);
  }
  if ("exit" in v) merged.exit = v.exit === true;
  return merged;
}

/** The single field this edit touched. Adjacency is a list, so it is compared as one. */
export const changedGroupField = (merged: Group, group: Group): string | undefined => {
  const before = (group.adjacent ?? []).map(adjacencyId).join(",");
  const after = (merged.adjacent ?? []).map(adjacencyId).join(",");
  if (before !== after) return "adjacent";
  return GROUP_FORM_FIELDS.filter((k) => k !== "adjacent").find((k) => merged[k] !== group[k]);
};
```

`al-group-editor.ts` passes `config` into `groupSchema`/`groupData`, adds `"adjacent"` and `"exit"` to its `FIELDS`, and merges `listFieldError(this.errors, path, "adjacent")` into the `error` map it hands `ha-form` under the key `adjacent`.

- [ ] **Step 4: `api.ts`.**

```ts
export const getTopology = (hass: HomeAssistant): Promise<TopologyPayload> =>
  hass.callWS<TopologyPayload>({ type: "activity_levels/topology" });

/** Every simple route between two rooms, shortest first. Empty when there is none. */
export const getTopologyPaths = (hass: HomeAssistant, from: string, to: string): Promise<string[][]> =>
  hass.callWS<{ paths: string[][] }>({ type: "activity_levels/topology/paths", from, to })
    .then((r) => r.paths);

export const getPresenceState = (hass: HomeAssistant): Promise<PresenceState> =>
  hass.callWS<PresenceState>({ type: "activity_levels/presence/state" });
```

- [ ] **Step 5: The presence stimulus row in `al-strip-controls.ts`.** In `renderStimuli`, prepend the synthetic row for a room while presence is on:

```ts
  private renderStimuli(config: Config, group: Group, path: Path): TemplateResult {
    const presence = presenceSettings(config).enabled && roomIds(config).has(group.id);
    return html`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${presence ? this.renderPresence(config, group, path) : nothing}
        ${group.stimuli.length === 0 && !presence
          ? html`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>`
          : group.stimuli.map((s, i) => this.renderStimulus(config, [...path, "stimuli", i], s))}
      </div>
    `;
  }

  /**
   * The room's presence channel: a stimulus with no entity. It is fed by the room
   * estimate rather than by a sensor, so there is nothing to point at - but its gain
   * and its envelope are tuned here like any other channel's.
   */
  private renderPresence(config: Config, group: Group, path: Path): TemplateResult {
    const overrides = group.presence ?? newPresenceOverrides();
    const resolved = resolvedEnvelope(config, {
      ...overrides,
      envelope: overrides.envelope ?? presenceSettings(config).envelope,
    });
    const voice = this.live?.voices[group.id]?.find((v) => v.label === PRESENCE_KEY);
    const errors = fieldErrors(this.errors, [...path, "presence"]);
    return html`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${voice ? html`<span class="chip phase ${voice.phase}">${voice.phase}</span>` : nothing}
        </div>
        <ha-selector
          class="presence-envelope"
          .hass=${this.hass}
          .selector=${{ select: { mode: "dropdown", options: envelopeOptions(config) } }}
          .label=${"Envelope preset"}
          .required=${false}
          .value=${overrides.envelope ?? ""}
          @value-changed=${(ev: CustomEvent<{ value: string }>) =>
            this.setPresence(path, "envelope", ev.detail.value === "" ? null : ev.detail.value)}
        ></ha-selector>
        <al-override-field
          class="presence-gain"
          .hass=${this.hass}
          label="Gain"
          kind="number"
          .selector=${GAIN_SELECTOR}
          .value=${overrides.gain}
          .inherited=${1}
          .inheritedFrom=${"presence"}
          .error=${errors.gain}
          @value-changed=${(ev: CustomEvent<{ value: number | null }>) =>
            this.setPresence(path, "gain", ev.detail.value ?? 1)}
        ></al-override-field>
        ${OVERRIDES.map(
          (item) => html`<al-override-field
            class="presence-${item.name}"
            .hass=${this.hass}
            .label=${item.label}
            .kind=${item.kind}
            .selector=${item.selector}
            .value=${overrides[item.name] as OverrideValue}
            .inherited=${resolved[item.name] as OverrideValue}
            .inheritedFrom=${overrides.envelope ?? presenceSettings(config).envelope ?? "defaults"}
            .error=${errors[item.name]}
            @value-changed=${(ev: CustomEvent<{ value: OverrideValue }>) =>
              this.setPresence(path, item.name, ev.detail.value)}
          ></al-override-field>`,
        )}
        <al-envelope-sketch .envelope=${resolved}></al-envelope-sketch>
      </ha-expansion-panel>
    `;
  }

  private setPresence(path: Path, name: string, value: unknown): void {
    const config = this.config;
    if (!config) return;
    const group = groupAt(config, path);
    if (!group) return;
    const next = setAt(config, [...path, "presence"], {
      ...(group.presence ?? newPresenceOverrides()),
      [name]: value,
    });
    this.emitChange(next, `${pathKey(path)}:presence:${name}`);
  }
```

- [ ] **Step 6: Gate and commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/group-form.test.ts test/model.test.ts test/errors.test.ts test/api.test.ts test/al-strip-controls.test.ts
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd /Users/sholodak/elevenrose/activity-levels && git status --porcelain custom_components/activity_levels/frontend
```

Expected: all vitest suites green; the last command shows the bundle as modified (it always is after a rebuild).

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add frontend/src frontend/test custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "feat(frontend): adjacency and exit fields, presence types and the presence channel row"
```

---

### Task 8: Frontend — `topology.ts`, `al-graph-map`, the Presence tab, panel wiring

**Files:** create `frontend/src/topology.ts`, `al-graph-map.ts`, `al-presence.ts`; modify `frontend/src/activity-levels-panel.ts`, `styles.ts`; tests `frontend/test/topology.test.ts`, `al-graph-map.test.ts`, `al-presence.test.ts` (new), `activity-levels-panel.test.ts`.

**Interfaces:**
```ts
// topology.ts (pure)
export const COL_W = 160, ROW_H = 110, PAD = 60, NODE_W = 120, NODE_H = 54;
export interface MapNode { id: string; label: string; row: number; col: number; x: number; y: number; exit: boolean }
export interface MapEdge { a: string; b: string; oneWay: boolean; x1: number; y1: number; x2: number; y2: number }
export interface MapLayout { nodes: MapNode[]; edges: MapEdge[]; width: number; height: number }
export function branchRows(config: Config): { id: string; label: string; branch: string }[]
export function layout(config: Config, topology: TopologyPayload): MapLayout
export const edgePoint: (edge: MapEdge, f: number) => { x: number; y: number }
export const nodeById: (layout: MapLayout, id: string) => MapNode | undefined
export const edgeBetween: (layout: MapLayout, a: string, b: string) => MapEdge | undefined
export function pathEdges(layout: MapLayout, path: readonly string[]): MapEdge[]

// al-graph-map.ts
// props: hass, config, topology: TopologyPayload | null, presence: PresenceState | null,
//        selected: [string | null, string | null], paths: string[][]
// events: al-map-select {id}          (the host keeps the pair and fetches the paths)

// al-presence.ts
// props: hass, config, errors, narrow
// events: al-change                    (the settings card, through the draft store)
// owns its own fetching: getTopology on connect + on config change, getPresenceState
// every PRESENCE_POLL_MS while visible, getTopologyPaths when two nodes are selected.
```

- [ ] **Step 1: Tests first (RED).** `frontend/test/topology.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { COL_W, PAD, ROW_H, edgeBetween, edgePoint, layout, pathEdges } from "../src/topology";
import { roomsConfig } from "./fixtures";
import type { TopologyPayload } from "../src/types";

const TOPO: TopologyPayload = {
  nodes: ["kitchen", "dining_room", "hall", "bedroom", "back_patio"],
  edges: [
    ["kitchen", "dining_room", false],
    ["kitchen", "back_patio", false],
    ["dining_room", "hall", false],
    ["hall", "bedroom", true],
  ],
  exits: ["back_patio"],
};

describe("layout", () => {
  it("puts every room of one top-level branch on one row, in pre-order", () => {
    const map = layout(roomsConfig(), TOPO);
    expect(map.nodes.map((n) => n.id)).toEqual(TOPO.nodes);
    expect(new Set(map.nodes.map((n) => n.row))).toEqual(new Set([0]));
    expect(map.nodes.map((n) => n.col)).toEqual([0, 1, 2, 3, 4]);
    expect(map.nodes[0]).toMatchObject({ x: PAD, y: PAD, exit: false });
    expect(map.nodes[1]!.x).toBe(PAD + COL_W);
    expect(map.nodes[4]!.exit).toBe(true);
  });

  it("gives each depth-1 branch its own row", () => {
    const config = roomsConfig();
    config.groups[0]!.children.push({
      ...config.groups[0]!.children[0]!,
      id: "outside",
      name: "Outside",
      children: [
        { ...config.groups[0]!.children[0]!.children[4]!, id: "drive", name: "Drive", exit: true },
      ],
    });
    const map = layout(config, { ...TOPO, nodes: [...TOPO.nodes, "drive"], exits: ["back_patio", "drive"] });
    expect(map.nodes.find((n) => n.id === "drive")!.row).toBe(1);
    expect(map.height).toBe(PAD * 2 + ROW_H);
  });

  it("is deterministic", () => {
    expect(layout(roomsConfig(), TOPO)).toEqual(layout(roomsConfig(), TOPO));
  });

  it("uses the group's friendly name", () => {
    expect(layout(roomsConfig(), TOPO).nodes[1]!.label).toBe("Dining Room");
  });

  it("drops an edge whose endpoint is not on the map", () => {
    const map = layout(roomsConfig(), { ...TOPO, edges: [...TOPO.edges, ["kitchen", "atlantis", false]] });
    expect(map.edges).toHaveLength(4);
  });

  it("finds an edge in either orientation, and points along it", () => {
    const map = layout(roomsConfig(), TOPO);
    expect(edgeBetween(map, "dining_room", "kitchen")).toBeDefined();
    const edge = edgeBetween(map, "kitchen", "dining_room")!;
    expect(edgePoint(edge, 0.5)).toEqual({ x: PAD + COL_W / 2, y: PAD });
  });

  it("walks a path into its edges", () => {
    const map = layout(roomsConfig(), TOPO);
    expect(pathEdges(map, ["kitchen", "dining_room", "hall"])).toHaveLength(2);
    expect(pathEdges(map, ["kitchen", "bedroom"])).toHaveLength(0);
  });

  it("survives an empty graph", () => {
    const map = layout(roomsConfig(), { nodes: [], edges: [], exits: [] });
    expect(map.nodes).toEqual([]);
    expect(map.width).toBe(PAD * 2);
  });
});
```

`frontend/test/al-graph-map.test.ts`:

```ts
it("draws a node per room and a line per edge", async () => {
  const el = await map();
  expect(el.shadowRoot!.querySelectorAll("g.node")).toHaveLength(5);
  expect(el.shadowRoot!.querySelectorAll("line.edge")).toHaveLength(4);
  expect(el.shadowRoot!.querySelector('line.edge[data-one-way="true"]')).toBeTruthy();
  expect(el.shadowRoot!.querySelector('g.node[data-id="back_patio"] .door')).toBeTruthy();
});

it("shows who is in each room and how many", async () => {
  const el = await map({ occupants: { kitchen: ["Scott", "Erin"] } });
  const node = el.shadowRoot!.querySelector('g.node[data-id="kitchen"]')!;
  expect(node.querySelector(".count")!.textContent).toBe("2");
  expect(node.textContent).toContain("Scott");
});

it("draws a moving person on the edge between their top two candidates", async () => {
  const el = await map({
    devices: {
      Scott: { t: 1, room: "kitchen", confidence: 0.5, moving: true,
               candidates: { kitchen: 0.5, dining_room: 0.4 }, path: [] },
    },
    occupants: {},
  });
  const person = el.shadowRoot!.querySelector('circle.person[data-name="Scott"]')!;
  expect(Number(person.getAttribute("cx"))).toBeCloseTo(PAD + COL_W / 2);
});

it("emits al-map-select and highlights the given paths", async () => {
  const el = await map();
  const seen = listenFor(el, "al-map-select");
  el.shadowRoot!.querySelector<SVGElement>('g.node[data-id="hall"]')!.dispatchEvent(
    new MouseEvent("click", { bubbles: true }),
  );
  expect((await seen).detail.id).toBe("hall");

  el.paths = [["kitchen", "dining_room", "hall"]];
  await el.updateComplete;
  expect(el.shadowRoot!.querySelectorAll("line.edge.on-path")).toHaveLength(2);
});

it("says so when there is no graph yet", async () => {
  const el = await map({}, { nodes: [], edges: [], exits: [] });
  expect(el.shadowRoot!.textContent).toContain("No rooms are connected yet");
});
```

`frontend/test/al-presence.test.ts`:

```ts
it("fetches the topology and polls the state while connected", async () => {
  const { el, calls } = await tab();
  expect(calls.map((c) => c.type)).toContain("activity_levels/topology");
  expect(calls.map((c) => c.type)).toContain("activity_levels/presence/state");
  vi.advanceTimersByTime(PRESENCE_POLL_MS);
  await el.updateComplete;
  expect(calls.filter((c) => c.type === "activity_levels/presence/state")).toHaveLength(2);
  el.remove();
  vi.advanceTimersByTime(PRESENCE_POLL_MS * 3);
  expect(calls.filter((c) => c.type === "activity_levels/presence/state")).toHaveLength(2);
});

it("lists a row per tracked device with room, confidence and breadcrumb", async () => {
  const { el } = await tab();
  const row = el.shadowRoot!.querySelector("tr.device")!;
  expect(row.textContent).toContain("Scott");
  expect(row.textContent).toContain("Kitchen");
  expect(row.querySelector(".confidence")!.getAttribute("style")).toContain("82%");
  expect(row.querySelector(".breadcrumb")!.textContent).toContain("Dining Room → Kitchen");
});

it("flags an unmapped scanner and a disabled sensor with the fix", async () => {
  const { el } = await tab({
    scanners: [{ key: "aa", device_id: "d1", name: "hall scanner", area_id: null, group_id: null }],
    unmapped: ["aa"],
    disabled: ["sensor.scotts_phone_distance_to_bedroom"],
  });
  expect(el.shadowRoot!.querySelector("tr.scanner.unmapped")!.textContent).toContain(
    "Give it an area",
  );
  expect(el.shadowRoot!.querySelector(".disabled-sensors")!.textContent).toContain("Enable");
});

it("asks for the paths between two selected rooms and lists them", async () => {
  const { el, calls } = await tab();
  el.shadowRoot!.querySelector("al-graph-map")!.dispatchEvent(
    new CustomEvent("al-map-select", { detail: { id: "kitchen" }, bubbles: true, composed: true }),
  );
  el.shadowRoot!.querySelector("al-graph-map")!.dispatchEvent(
    new CustomEvent("al-map-select", { detail: { id: "bedroom" }, bubbles: true, composed: true }),
  );
  await el.updateComplete;
  expect(calls.at(-1)).toMatchObject({ type: "activity_levels/topology/paths", from: "kitchen", to: "bedroom" });
  expect(el.shadowRoot!.querySelector(".paths")!.textContent).toContain("Kitchen → Dining Room");
});

it("edits presence settings through the draft store", async () => {
  const { el } = await tab();
  const changed = listenFor(el, "al-change");
  el.shadowRoot!.querySelector("ha-form.presence-settings")!.dispatchEvent(
    new CustomEvent("value-changed", { detail: { value: { threshold: 0.8, enabled: true } } }),
  );
  expect((await changed).detail.presence.threshold).toBe(0.8);
});

it("filters the device picker to Bermuda device_trackers", async () => {
  const { el } = await tab();
  const form = el.shadowRoot!.querySelector<HTMLElement & { schema: FormItem[] }>("ha-form.presence-settings")!;
  const item = form.schema.find((i) => i.name === "devices")!;
  expect(item.selector).toEqual({
    entity: { multiple: true, filter: { domain: "device_tracker", integration: "bermuda" } },
  });
});
```

`frontend/test/activity-levels-panel.test.ts` — add:

```ts
it("offers the Presence tab only when presence is enabled", async () => {
  const el = await panel(roomsConfig());
  expect([...el.shadowRoot!.querySelectorAll('[role="tab"]')].map((t) => t.textContent!.trim()))
    .toEqual(["Mixer", "Groups", "Envelopes", "Defaults", "Patterns"]);

  const on = await panel(presenceConfig());
  const tabs = [...on.shadowRoot!.querySelectorAll('[role="tab"]')].map((t) => t.textContent!.trim());
  expect(tabs).toEqual(["Mixer", "Groups", "Envelopes", "Defaults", "Patterns", "Presence"]);
  on.shadowRoot!.querySelectorAll<HTMLElement>('[role="tab"]')[5]!.click();
  await on.updateComplete;
  expect(on.shadowRoot!.querySelector("al-presence")).toBeTruthy();
});

it("falls back off the Presence tab when presence is turned off mid-edit", async () => {
  const el = await panel(presenceConfig());
  el.shadowRoot!.querySelectorAll<HTMLElement>('[role="tab"]')[5]!.click();
  await el.updateComplete;
  const config = structuredClone(presenceConfig());
  config.presence.enabled = false;
  el.dispatchEvent(alChange(config));
  await el.updateComplete;
  expect(el.shadowRoot!.querySelector("al-presence")).toBeNull();
  expect(el.shadowRoot!.querySelector(".tab.active")!.textContent!.trim()).toBe("Mixer");
});
```

Run `cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/topology.test.ts` — expect the module not to resolve.

- [ ] **Step 2: `topology.ts` (pure).**

```ts
import { adjacencyId } from "./model";
import type { Config, Group, TopologyPayload } from "./types";

/**
 * Deterministic geometry for the room graph. A row per top-level branch, in tree order;
 * rooms in pre-order across it. No force layout, no randomness: the map has to look the
 * same every time it is drawn, because people navigate by where things were last time.
 */

export const COL_W = 160;
export const ROW_H = 110;
export const PAD = 60;
export const NODE_W = 120;
export const NODE_H = 54;

export interface MapNode {
  id: string; label: string; row: number; col: number; x: number; y: number; exit: boolean;
}
export interface MapEdge {
  a: string; b: string; oneWay: boolean; x1: number; y1: number; x2: number; y2: number;
}
export interface MapLayout { nodes: MapNode[]; edges: MapEdge[]; width: number; height: number }

/**
 * Every group in pre-order, tagged with the branch whose row it belongs on: itself for a
 * root or a root's child, and its ancestor's tag below that. "Downstairs" and "Upstairs"
 * therefore get a row each, which is how a house actually reads.
 */
export function branchRows(config: Config): { id: string; label: string; branch: string }[] {
  const out: { id: string; label: string; branch: string }[] = [];
  const walk = (group: Group, depth: number, branch: string): void => {
    const tag = depth <= 1 ? group.id : branch;
    out.push({ id: group.id, label: group.name ?? group.id, branch: tag });
    group.children.forEach((child) => walk(child, depth + 1, tag));
  };
  config.groups.forEach((group) => walk(group, 0, group.id));
  return out;
}

export function layout(config: Config, topology: TopologyPayload): MapLayout {
  const rooms = new Set(topology.nodes);
  const exits = new Set(topology.exits);
  const rows: string[][] = [];
  const rowOf = new Map<string, number>();
  const labels = new Map<string, string>();
  for (const entry of branchRows(config)) {
    labels.set(entry.id, entry.label);
    if (!rooms.has(entry.id)) continue;
    let index = rowOf.get(entry.branch);
    if (index === undefined) {
      index = rows.length;
      rowOf.set(entry.branch, index);
      rows.push([]);
    }
    rows[index]!.push(entry.id);
  }
  const nodes: MapNode[] = [];
  rows.forEach((ids, row) =>
    ids.forEach((id, col) =>
      nodes.push({
        id,
        label: labels.get(id) ?? id,
        row,
        col,
        x: PAD + col * COL_W,
        y: PAD + row * ROW_H,
        exit: exits.has(id),
      }),
    ),
  );
  const at = new Map(nodes.map((n) => [n.id, n]));
  const edges: MapEdge[] = [];
  for (const [a, b, oneWay] of topology.edges) {
    const from = at.get(a);
    const to = at.get(b);
    if (!from || !to) continue;   // an edge to something the map does not draw
    edges.push({ a, b, oneWay, x1: from.x, y1: from.y, x2: to.x, y2: to.y });
  }
  const cols = rows.reduce((most, row) => Math.max(most, row.length), 1);
  return {
    nodes,
    edges,
    width: PAD * 2 + (cols - 1) * COL_W,
    height: PAD * 2 + (Math.max(rows.length, 1) - 1) * ROW_H,
  };
}

/** A point a fraction of the way along an edge: where a person in transit is drawn. */
export const edgePoint = (edge: MapEdge, f: number): { x: number; y: number } => ({
  x: edge.x1 + (edge.x2 - edge.x1) * f,
  y: edge.y1 + (edge.y2 - edge.y1) * f,
});

export const nodeById = (map: MapLayout, id: string): MapNode | undefined =>
  map.nodes.find((n) => n.id === id);

/** The edge between two rooms, in whichever orientation the map holds it. */
export const edgeBetween = (map: MapLayout, a: string, b: string): MapEdge | undefined =>
  map.edges.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));

/** The edges a route walks along, for highlighting one. */
export function pathEdges(map: MapLayout, path: readonly string[]): MapEdge[] {
  const out: MapEdge[] = [];
  for (let i = 1; i < path.length; i++) {
    const edge = edgeBetween(map, path[i - 1]!, path[i]!);
    if (edge) out.push(edge);
  }
  return out;
}
```

- [ ] **Step 3: `al-graph-map.ts`.** Presentational, SVG in Lit exactly like `al-envelope-sketch`: `viewBox="0 0 ${width} ${height}"`, `preserveAspectRatio="xMidYMid meet"`, `role="img"` with an `aria-label` summarising the rooms and who is in them, and a `<title>`. Structure, in draw order:

1. `<defs>` with one inline `<marker id="al-arrow">` (a small triangle, `fill: currentColor`) — the only way to show direction without a library.
2. `line.edge` per edge, `data-one-way`, `marker-end` set only when `oneWay`; `class="edge on-path"` when the edge is in `pathEdges(map, p)` for any `p` of `paths`.
3. `g.node[data-id]` per node: a `rect` (`NODE_W` × `NODE_H`, `rx="8"`, centred on `x,y`), the label `text`, a `.count` badge circle+text when the room has occupants, up to two occupant names below the label (`+n` beyond that), and a `path.door` glyph in the corner for an exit room. `tabindex="0"`, `role="button"`, `aria-pressed` when selected, `@click` and `@keydown` (Enter/Space) both dispatching `al-map-select`.
4. `circle.person[data-name]` per *moving* device, at `edgePoint(edge, 0.5)` of `edgeBetween(map, top, second)` from its two highest candidates; skipped when there is no such edge (a person between two rooms with no door is a bug in the readings, not something to draw).

Colours come from the theme only: `var(--primary-color)` for a selected node and an on-path edge, `var(--divider-color)` for the rest, `var(--secondary-text-color)` for captions. The host scrolls: `:host { display:block; overflow-x:auto }` and `svg { min-width: 100%; height: auto }`. With `topology.nodes` empty, render a card-level message: "No rooms are connected yet — set *Adjacent rooms* on a group in the Groups tab."

- [ ] **Step 4: `al-presence.ts`.** Fetches its own data, the way `al-timeline` does:

```ts
export const PRESENCE_POLL_MS = 2000;
```

- `connectedCallback` → `void this.refreshTopology()` and start the poll; `disconnectedCallback` clears the timer. `willUpdate` refetches the topology when `config` changes (adjacency is part of the draft, and the map should follow a Save).
- State: `topology: TopologyPayload | null`, `presence: PresenceState | null`, `selected: [string | null, string | null]`, `paths: string[][]`. `al-map-select` shifts the pair (`[b, id]` when both are set), clears `paths`, and fetches when both are non-null and different.
- Layout, top to bottom, all inside `.page` (the `al-patterns` grid):
  - `<ha-card header="Rooms">` wrapping `al-graph-map`, plus the `.paths` list under it (`n route(s) from A to B`, each route rendered as friendly names joined by `→`; "no route" when the list is empty, which is the honest answer for a one-way pair).
  - `<ha-card header="People">`: a table, one `tr.device` per entry of `presence.devices` sorted by name — name, room (friendly), a `.confidence` bar (`style="width: ${Math.round(confidence * 100)}%"`), `moving` chip, `.breadcrumb` (`path` joined by `→`), and the last update as a locale time from `t`.
  - `<ha-card header="Scanners">`: a table of `presence.scanners` — name, area, room (`group_id` as a friendly name, or "—"), and for `tr.scanner.unmapped` the fix in place of the room: *"Give it an area that matches a room, or map it in Settings below."* Below the table, `.disabled-sensors` when `presence.disabled` is non-empty: *"Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:"* and the list.
  - `<ha-card header="Settings">`: one `ha-form.presence-settings` in the `al-defaults` style (`computeLabel`/`computeHelper` from a `LABELS`/`HELPERS` pair, one line each), over `enabled`, `devices`, `envelope`, `threshold`, `stay`, `escape`, `scale`, `floor`, `stuck_after`. Selectors: `enabled` → `{ boolean: {} }`; `devices` → `{ entity: { multiple: true, filter: { domain: "device_tracker", integration: "bermuda" } } }`; `envelope` → the preset dropdown from `envelopeOptions(config)`; `threshold`/`stay` → `{ number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }`; `escape` → `{ number: { min: 0, max: 0.1, step: 0.001, mode: "box" } }`; `scale`/`floor` → number boxes; `stuck_after` → `DURATION_SELECTOR`. The merge maps the entity-picker's `string[]` back onto `PresenceDevice[]`, keeping the `name` of a device that is still selected, and emits `alChange(setAt(config, ["presence"], merged), "presence:<field>")`.

Helper text, one line each, matching the README:

```ts
const HELPERS: Record<string, string> = {
  enabled: "Estimate which room each tracked device is in. Needs Bermuda.",
  devices: "Bermuda device_trackers to follow — one per person.",
  envelope: "Preset the presence channel of every room starts from.",
  threshold: "How sure the estimate has to be before somebody counts as in the room.",
  stay: "Chance of staying put between two updates. Higher is steadier and slower.",
  escape: "Chance of turning up in a room with no path to this one. The way back from a wrong guess.",
  scale: "Distance, in metres, at which a scanner stops telling you anything.",
  floor: "Likelihood given to a room with no scanner of its own.",
  stuck_after: "How long the readings have to stay implausible before the estimate is reset.",
};
```

- [ ] **Step 5: Panel wiring.** `Tab` gains `"presence"`; `TABS` becomes a getter so the tab list follows the draft:

```ts
type Tab = "mixer" | "groups" | "envelopes" | "defaults" | "patterns" | "presence";

const BASE_TABS: Tab[] = ["mixer", "groups", "envelopes", "defaults", "patterns"];

  /** Presence is opt-in, so its tab only exists while the draft asks for it. */
  private get tabs(): Tab[] {
    const config = this.draft?.config;
    return config && presenceSettings(config).enabled ? [...BASE_TABS, "presence"] : BASE_TABS;
  }
```

Every `TABS.` use becomes `this.tabs.`. In `setConfig`, after `syncNav()`, fall back when the current tab has just disappeared:

```ts
    // turning presence off while standing on its tab would leave the panel on a tab
    // that is no longer in the list, and the roving tabindex pointing past the end
    if (!this.tabs.includes(this.tab)) this.selectTab(0);
```

`renderTab` gains:

```ts
      case "presence":
        return html`<al-presence
          .hass=${this.hass}
          .config=${d.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-presence>`;
```

and `main.ts` imports `./al-presence` (which imports `./al-graph-map`).

- [ ] **Step 6: Gate and commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/topology.test.ts test/al-graph-map.test.ts test/al-presence.test.ts test/activity-levels-panel.test.ts
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Expected: all green. If `al-presence` leaks its poll into other suites, the timer is not being cleared in `disconnectedCallback` — the panel's own tests use fake timers and will surface it as an unexpected extra `callWS`.

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add frontend/src frontend/test custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "feat(frontend): Presence tab with a room map, device rows, scanner table and settings"
```

---

### Task 9: Docs, the example house, the bundle, and the CI-equivalent gate

**Files:** modify `README.md`, `examples/house.yaml`; rebuild `custom_components/activity_levels/frontend/activity-levels-panel.js`. **`CHANGELOG.md` is release-please-owned — do not touch it.**

- [ ] **Step 1: `examples/house.yaml` — adjacency for the real rooms.** Read the file first; the tree is `property → {house → {basement → {play_room, laundry_room}, downstairs → {living_room, office, dining_room, kitchen, downstairs_hallway}, upstairs → {guest_room, main_bedroom, upstairs_hallway}}, garage, outside → {front_yard, back_yard → {back_patio, driveway}}}`. The branches (`property`, `house`, `basement`, `downstairs`, `upstairs`, `outside`, `back_yard`) declare nothing and stay branches, which is what makes this example exercise the rule.

Add an `adjacent:` (and, where it applies, `exit: true`) to each room, inferred from the sensors already there — `binary_sensor.basement_hallway_door` appears in both `play_room` and `downstairs_hallway`, `binary_sensor.front_door` is in `living_room`, `binary_sensor.back_door` is in `kitchen`, `binary_sensor.basement_exterior_door` is in `laundry_room`. Introduce the block with a comment that says it is a guess:

```yaml
# Rooms and doorways. `adjacent` is symmetric, so each doorway is written once, from
# whichever side reads more naturally. This is inferred from the door and window sensors
# above -- check it against your actual floor plan before relying on it, because a wrong
# edge is worse than a missing one: it lets the room estimate walk through a wall.
```

The edits, room by room:

```yaml
              - id: play_room
                name: Play Room
                adjacent: [laundry_room, downstairs_hallway]   # the basement stairs door
              - id: laundry_room
                name: Laundry Room
                adjacent: [driveway]                            # basement exterior door
              - id: living_room
                name: Living Room
                adjacent: [dining_room, downstairs_hallway, front_yard]   # front door
              - id: office
                name: Office
                adjacent: [downstairs_hallway]
              - id: dining_room
                name: Dining Room
                adjacent: [kitchen, downstairs_hallway]
              - id: kitchen
                name: Kitchen
                adjacent: [back_patio]                          # back door
              - id: downstairs_hallway
                name: Downstairs Hallway
                adjacent: [upstairs_hallway]
              - id: guest_room
                name: Guest Room
                adjacent: [upstairs_hallway]
              - id: main_bedroom
                name: Main Bedroom
                adjacent: [upstairs_hallway]
              - id: upstairs_hallway
                name: Upstairs Hallway
      - id: garage
        name: Garage
        adjacent: [driveway]
        exit: true
          - id: front_yard
            name: Front Yard
            adjacent: [driveway]
            exit: true
              - id: back_patio
                name: Back Patio
                adjacent: [driveway]
                exit: true
              - id: driveway
                name: Driveway
                exit: true
```

(each `adjacent:`/`exit:` goes beside the existing `name:`, above `stimuli:`; the indentation above shows which node each belongs to, not a replacement block).

Then an example presence block at the end of the file, switched off so copying it is one deliberate flip:

```yaml
# Room-level presence, off until you have Bermuda installed and have listed your phones.
# Turning this on gives every room above a `presence` channel in its mix, a
# `sensor.<room>_occupants`, and one `sensor.<name>_room` per person.
presence:
  enabled: false
  devices:
    - device: device_tracker.scotts_phone
      name: Scott
  envelope: hour          # somebody being here should decay like a long occupancy, not a door
  threshold: 0.6          # how sure we have to be before the room counts as occupied
  # stay: 0.9             # chance of not moving between updates; higher is steadier
  # escape: 0.001         # chance of appearing somewhere unreachable; the way back from a wrong guess
  # scale: 3.0            # metres at which a scanner stops telling you anything
  # floor: 0.05           # likelihood of a room with no scanner of its own
  # stuck_after: 60s      # implausible readings for this long reset the estimate
  # scanner_areas:        # only when a scanner's area is not the room it is in
  #   "1a2b3c4d5e6f": kitchen
```

Verify it loads: `cd /Users/sholodak/elevenrose/activity-levels && uv run python -c "import yaml; from custom_components.activity_levels.schema import validate_config; from custom_components.activity_levels.topology import build_topology; c = validate_config(yaml.safe_load(open('examples/house.yaml'))); t = build_topology(c); print(len(t.nodes), 'rooms', len(t.edges), 'doorways', sorted(t.exits)); print(t.paths('main_bedroom', 'kitchen'))"`.

Expected: `14 rooms 15 doorways ['back_patio', 'driveway', 'front_yard', 'garage']`, and a route from the main bedroom to the kitchen that goes through both hallways and the dining room. `tests/test_init.py` already round-trips `examples/house.yaml` through `scripts/load_config.py`, so a mistake here fails that test rather than sitting quietly in an example.

- [ ] **Step 2: `README.md`.** Four edits:

1. **New section, after "Patterns & presence simulation"**, titled `## Rooms & presence`. Cover, in prose:
   - What adjacency is for on its own (`adjacent`, `exit`, symmetric by default, one-way edges are YAML-only), that only groups taking part in the graph are *rooms*, and that everything else stays a branch.
   - That presence needs [Bermuda](https://github.com/agittins/bermuda), is off unless `presence.enabled` is set, and that with Bermuda missing the integration raises a repair issue and carries on.
   - How the estimate works, in four sentences: Bermuda's per-scanner distances become one observation per device per half-second; a filter over the room graph turns those into a belief; a jump between two rooms with no door between them is not something one reading can do; `escape` is the small probability that keeps a wrong guess recoverable.
   - What you get: `sensor.<name>_room` / `binary_sensor.<name>_moving` per person, `sensor.<room>_occupants` per room, and a `presence` channel in each room's mix that notes on when the room fills and off when it empties — tuned in the mixer's controls row like any other channel.
   - The setup checklist: enable Bermuda's per-scanner distance sensors (they ship disabled), give each scanner device an area that matches a room's `area` or map it with `presence.scanner_areas`, list your phones' `device_tracker`s, and set `adjacent` on every room.
   - That someone mid-doorway is an occupant of nowhere and shows up as `moving` instead — the `threshold` is what draws that line.

2. **The entities table** gains three rows:

   | `sensor.<id>_occupants` | How many people are believed to be in this room. Attribute: `who`. Only for rooms, and only while presence is on. |
   | `sensor.<name>_room` | Which room a tracked person is in, or `Away`. Attributes: `group_id`, `confidence`, `moving`, `candidates`, `path`, `updated`. |
   | `binary_sensor.<name>_moving` | On while the person's two most likely rooms are adjacent and both plausible. |

   with a line saying the last two live on a `Presence: <name>` device under the hub.

3. **The configuration reference** gains the group keys and the top-level block, in the same commented style as the rest:

```yaml
groups:
  - id: kitchen
    adjacent: [dining_room, back_patio]   # rooms you can walk to; symmetric
    # adjacent: [{id: laundry_chute, one_way: true}]   # the rare thing that is not
    exit: false              # true = people can leave the house from here
    presence:                # optional overrides for this room's presence channel
      gain: 1.0              # how loudly "somebody is here" contributes
      envelope: hour         # any envelope field may be overridden inline

presence:                    # absent or enabled: false = the whole feature is off
  enabled: true
  devices:
    - device: device_tracker.scotts_phone   # a Bermuda device_tracker
      name: Scott                            # entity name; defaults to the device's
  envelope: default          # preset the presence channels start from
  threshold: 0.6             # confidence needed before somebody counts as in the room
  stay: 0.9                  # P(staying put between updates)
  escape: 0.001              # P(appearing in a room with no path to this one)
  scale: 3.0                 # emission distance scale, metres
  floor: 0.05                # likelihood of a room with no scanner
  stuck_after: 60s           # implausible readings for this long reset the estimate
  scanner_areas:             # scanner device id -> room, overriding its area
    "1a2b3c4d5e6f": kitchen
```

4. **The panel section** gains a paragraph under "The panel": the **Presence** tab (shown only while presence is on) with the room map, the per-person rows, the scanner table and the settings card; and a line in the Groups section about *Adjacent rooms* and *Exit*.

- [ ] **Step 3: Rebuild the bundle and prove it is reproducible.**

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm build && shasum ../custom_components/activity_levels/frontend/activity-levels-panel.js
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm build && shasum ../custom_components/activity_levels/frontend/activity-levels-panel.js
```

Expected: the two sums are identical. If they are not, something in the bundle is time- or path-dependent and must be fixed before committing — a bundle that differs per build makes CI's `git diff --exit-code` fail for everyone.

- [ ] **Step 4: The full CI-equivalent gate.** Run exactly what the two workflows run:

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv sync --locked
cd /Users/sholodak/elevenrose/activity-levels && uv run ruff check .
cd /Users/sholodak/elevenrose/activity-levels && uv run ruff format --check .
cd /Users/sholodak/elevenrose/activity-levels && uv run mypy
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest --cov=custom_components/activity_levels --cov-report=term-missing
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm install --frozen-lockfile
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm coverage && pnpm build
cd /Users/sholodak/elevenrose/activity-levels/frontend && git diff --exit-code -- ../custom_components/activity_levels/frontend
cd /Users/sholodak/elevenrose/activity-levels && python3 -c "import json; a=json.load(open('custom_components/activity_levels/strings.json')); b=json.load(open('custom_components/activity_levels/translations/en.json')); assert a == b, 'strings.json and translations/en.json have drifted'"
cd /Users/sholodak/elevenrose/activity-levels && git status --porcelain
```

Expected: every command exits 0; the `git diff --exit-code` passes because the bundle was rebuilt and committed in Task 8 and again here; `git status --porcelain` shows only the files this task touched, and **never** anything under `brands/`.

Hassfest and the HACS action cannot be run locally; the two things they check that this work could break are `strings.json` (every `translation_key` used by `async_create_issue` has an entry under `issues`, and `translations/en.json` matches) and `manifest.json` (unchanged — no new requirement).

- [ ] **Step 5: Commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add README.md examples/house.yaml custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "docs: room adjacency and presence, with adjacency for the example house"
```

---

## Self-review

**Spec coverage — requirement → task.**

| Spec section | Requirement | Task |
| --- | --- | --- |
| Config | `adjacent` (short and long form), `exit`, group `presence` overrides | 1 |
| Config | top-level `presence` block with every field and default | 1 |
| Validation | unknown/self/duplicate adjacency, pathed at `groups/i/adjacent/j` | 1 |
| Validation | `device_tracker.*`, `threshold` ∈ (0,1], `stay` ∈ (0,1), `escape` ∈ [0,0.1], positive `scale`/`floor`/`stuck_after` | 1 |
| Validation | `escape·(N−1) + stay ≤ 1` as a setup **repair issue**, not a schema error | 2 (`Topology.feasible`) + 5 (`ISSUE_TRANSITION`) |
| Validation | Bermuda missing, non-Bermuda device, unmapped scanner, disabled sensor → repair issues | 5 |
| Topology | nodes = groups with an edge or an exit; branches excluded | 2 |
| Topology | `neighbours`, `is_adjacent` (one-way), `paths(max_hops=8)`, `reachable` | 2 |
| Topology | transition matrix: diagonal `stay`, neighbours share the remainder, `escape` to non-adjacent, `away` ↔ exits, rows sum to 1 | 2 |
| Topology | scanner mapping: area → first pre-order group, `scanner_areas` wins, unmapped reported | 2 (rule) + 5 (registry read + issue) |
| Topology | websocket `topology` and `topology/paths` | 2 |
| Estimator | `Observation(t, distances, home)` as an extensible dataclass; `999`/unknown → `None` | 3 |
| Estimator | emission in log space, the exact `exp(−d/τ)` / `exp(−max(0,τ−d)/τ)` / `floor` / `away` rules | 3 |
| Estimator | forward step `normalize((Tᵀ·b) ⊙ e)` | 3 |
| Estimator | stuck detector: 5th percentile of the log-likelihood history, `stuck_after`, reset to the emission | 3 |
| Estimator | 30-deep ring buffer, bounded Viterbi | 3 |
| Estimator | outputs: `room`, `confidence`, `moving` (adjacent + second > 0.25), `candidates` (> 0.1), `path` (collapsed, last 5); `away` is a valid room | 3 |
| Estimator | belief persisted with the state-space id list; a changed topology discards it | 3 (`snapshot`/`restore`) + 5 (Store) |
| Estimator | hypothesis invariants | 3 |
| Coordinator | Bermuda scanner/sensor/tracker discovery via the registries, re-discovery on registry change | 5 |
| Coordinator | 500 ms coalescing, one `Observation` per device per tick | 5 |
| Coordinator | occupants with the confidence threshold; publish to entities, engine and websocket | 5 |
| Coordinator | diagnostics carry the scanner mapping and each belief vector | 5 |
| Coordinator | websocket `presence/state` | 5 |
| Voice | visible synthetic `presence` channel per room group, built like the trigger voice | 4 |
| Voice | note-on 0 → >0, note-off >0 → 0, via `coordinator.set_occupied` | 4 (mechanism) + 5 (policy) |
| Voice | envelope = `presence.envelope` + group overrides through the existing resolver; gain default 1.0 | 4 |
| Voice | mutes like any channel; appears in the live view and the stimuli list | 4 (engine) + 7 (panel) |
| Entities | `sensor.<name>_room` with `group_id`/`confidence`/`moving`/`candidates`/`path`/`updated` | 6 |
| Entities | `binary_sensor.<name>_moving`; `sensor.<group>_occupants` with `who`, on the group device | 6 |
| Entities | a "Presence: `<name>`" device per tracked person | 6 |
| Opt-out | nothing constructed; adjacency still validates; `topology` still answers | 1, 4, 5, 6, 8 (all gated; asserted in `test_presence_off_constructs_nothing` and the panel tab test) |
| Panel | *Adjacent rooms* multi-select + *Exit* toggle in the one shared group form; errors on `groups/i/adjacent/j`; one-way shown, not edited | 7 |
| Panel | Presence tab shown only when enabled | 8 |
| Panel | SVG graph map: row per top-level branch, pre-order, edges as lines, door glyph on exits, occupant counts and names, moving person on the edge, two-node path listing | 8 |
| Panel | device rows, scanner table with the fix stated, Settings card in the Defaults style with a Bermuda-filtered device picker | 8 |
| Panel | presence stimulus row "Presence (anyone here)", gain + envelope, no entity field | 7 |
| Panel | no new libraries | Global constraints; 8 draws its own SVG and its own arrow marker |
| Testing | pure topology tests (symmetry, one-way, bounded paths, rows sum to 1, exits ↔ away, stale ids) | 2 |
| Testing | pure estimator tests (walk, impossible jump, stuck, away, Viterbi) + hypothesis | 3 |
| Testing | PHACC integration: fake Bermuda registry, repair issues, entity states, voice note-on/off, opt-out, config round-trip, belief persistence across a reload | 5, 6 |
| Testing | frontend: adjacency picker and error paths, deterministic layout, path listing, tab hidden when disabled, presence stimulus row | 7, 8 |
| Phase 2/3 | scoped out — but the seam is named (`Estimator.log_emission`) and `Observation` is left extensible | 3 |

**Placeholder scan.** Every step carries the code or the test content it needs. The two places that describe rather than transcribe are `al-graph-map`'s render (Task 8 Step 3) and `al-presence`'s cards (Step 4) — both are specified element by element, with class names, selectors, data attributes and event names pinned by the tests written first in Step 1, which is the same treatment `al-timeline` and `al-mixer` got in the mixer plan. No "TBD", no "similar to".

**Type and payload consistency across tasks.** `Topology` (T2) is consumed by `tree.room_ids` (T4), `Estimator.__init__` (T3) and `PresenceCoordinator` (T5). `Observation`/`Outputs` (T3) are produced and consumed by T5 and rendered by T6. `Outputs.as_dict()` (T3) is exactly the `PresenceOutputs` interface (T7) and exactly what `al-presence` reads (T8). `Topology.payload()` (T2) is exactly `TopologyPayload` (T7) and the input to `layout()` (T8). `PresenceCoordinator.payload()` (T5) is exactly `PresenceState` (T7). `PRESENCE_KEY` (T1) is the channel label (T4), the `voice_states` label (T4) and the label the controls row matches on (T7). `RuntimeData.topology`/`.presence` (T2/T5) are what the websocket handlers, the diagnostics and all three platforms read.

**Ordering.** 1 → 2 (the graph reads validated config) → 3 (the filter needs the transition matrix) → 4 (the engine seam, independent of 3) → 5 (needs 2, 3, 4) → 6 (needs 5) → 7 (needs the payload shapes from 2 and 5) → 8 (needs 7) → 9. Tasks 4 and 3 are the only pair that could be swapped.

**Risks worth naming.** Bermuda's unique-id convention (`<device>_<scanner>_distance`) and its scanner-device identifiers are the one thing here taken from outside the repo; `presence/observation.py` isolates both behind two functions and `fake_bermuda` reproduces exactly that contract, so a mismatch with a real install is a two-line fix in one file rather than a redesign. The second is the presence device's entity ids, which are derived from the configured `name` — renaming a person renames their entities, and that is stated in the README next to the same warning group ids already carry.
