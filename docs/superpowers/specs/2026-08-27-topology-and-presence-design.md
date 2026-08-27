# Topology and presence: adjacency graph + Bermuda-constrained room tracking

Status: approved in conversation 2026-08-27. Builds on the engine (2026-08-25), the
patterns/simulation spec (2026-08-26) and mixer v2 (2026-08-27).

## Goal

Model which rooms connect to which, and use that graph to turn
[Bermuda](https://github.com/agittins/bermuda)'s noisy BLE readings into a room-per-person
estimate that never jumps between rooms with no path between them (dining room → the
bedroom above it), says when someone is *on the move* and along which path, and feeds
"someone is here" into each room's activity level. The whole presence side is opt-in and
exists only when Bermuda is installed; the adjacency graph is useful on its own.

Bermuda has no input surface for hints, so nothing here steers Bermuda itself. We consume
its per-scanner distance sensors and publish our own estimate. Once proven, a
transition-constraint hook can be offered upstream as a PR; that is out of scope.

## Config

Both additions are optional; an existing document validates unchanged.

```yaml
groups:
  - id: kitchen
    adjacent: [dining_room, back_patio]       # ids of other groups; symmetric
    # adjacent: [{id: laundry_chute, one_way: true}]  also accepted (YAML only in v1)
    exit: true                                 # people can leave the house from here
    presence:                                  # optional overrides for this room's voice
      gain: 1.0
      envelope: hour
      # any EnvelopeOverrides field (attack, decay, ..., debounce)

presence:                                      # absent or enabled: false = feature off
  enabled: true
  devices:
    - device: device_tracker.scotts_phone      # a Bermuda device_tracker entity
      name: Scott                              # entity name; default: the device's name
  envelope: default                            # preset for presence voices (default: defaults.envelope)
  threshold: 0.6                               # confidence needed before a voice notes on
  stay: 0.9                                    # P(stay in the same room per update)
  escape: 0.001                                # P(jump to any non-adjacent room per update)
  scale: 3.0                                   # emission distance scale τ, metres
  floor: 0.05                                  # likelihood of a room with no scanner
  stuck_after: 60                              # seconds of implausible evidence before a reset
  scanner_areas:                               # scanner device id → group id, overriding
    "abc123def": kitchen                       #   the area-based mapping
```

Validation (`schema.py`, pathed errors):

- `adjacent[j]` must name an existing group other than the group itself; duplicates are
  rejected; the same edge declared from both sides is fine. `one_way` defaults to false.
- `exit` defaults to false. `presence` overrides on a group use the stimulus override
  schema (`gain`, `envelope`, `EnvelopeOverrides`).
- `presence.devices[i].device` must be a `device_tracker.*` entity id; `threshold` in
  `(0, 1]`; `stay` in `(0, 1)`; `escape` in `[0, 0.1]`; `escape·(N−1) + stay ≤ 1` is
  checked at tree build (N known then) and reported as a setup repair issue, not a schema
  error. `scale`, `floor`, `stuck_after` positive.
- Runtime (not schema): `presence.enabled` with Bermuda not loaded raises a **repair
  issue** and the presence side stays off; the entry still loads. Devices that are not
  Bermuda's, scanners that map to no group, and distance sensors that are disabled each
  raise their own repair issue naming the fix.

## Topology (`topology.py`, pure)

Built from the validated config:

- Nodes = groups that declare or receive at least one edge, or declare `exit: true`.
  Purely hierarchical groups
  (House, Downstairs) with no edges are not rooms and are absent from the state space.
- `neighbours(id)`, `is_adjacent(a, b)` (respecting one-way), `paths(a, b, max_hops=8)`
  (simple paths, bounded; a house has few), `reachable(a, hops)`.
- `transition_matrix(stay, escape)` over `nodes + ["away"]`: diagonal `stay`; the
  remainder shared equally among neighbours; `escape` to each non-adjacent room; `away` is
  a neighbour of every `exit: true` room and of nothing else; from `away`, the exit rooms
  share the non-stay mass. Rows sum to 1 (asserted).
- Scanner mapping: each Bermuda scanner is an HA device with an area; area → the first
  pre-order group whose `area` equals it; `presence.scanner_areas` wins over that.
  Unmapped scanners are ignored and listed in diagnostics and a repair issue.
- Websocket `activity_levels/topology` → `{nodes, edges: [[a, b, one_way]], exits}`, plus
  `activity_levels/topology/paths {from, to}` → `{paths: [[ids]]}`.

## Estimator (`presence/estimator.py`, pure numpy, one per tracked device)

**Observation** is a plain dataclass so more channels can be added later without touching
the filter: `Observation(t, distances: dict[scanner_id, float | None], home: bool)`.
Bermuda's `999`/unknown is `None`.

**Emission** `emission(obs) -> vector over states`, computed in log space:

- room `r`, scanner `s` mapped to room `m(s)`, distance `d`:
  `exp(−d/τ)` when `m(s) == r`; `exp(−max(0, τ − d)/τ)` otherwise (a scanner reading
  *close* is evidence against every other room); `None` contributes nothing.
- a room with no scanner contributes the constant `floor` (passable, never wins unaided).
- `away` = 1.0 when `home` is false, `floor²` otherwise.

This method is the single seam phase 2 replaces with learned per-room tables.

**Filter.** On every observation: `belief ← normalize((Tᵀ · belief) ⊙ emission)`.
**Stuck detector**: keep a running history of `log P(obs | belief)`; if it stays below the
history's 5th percentile for `stuck_after` seconds, reset `belief ← normalize(emission)`.
A ring buffer of the last 30 `(belief, emission)` pairs supports a bounded Viterbi.

**Outputs** per update: `room` (argmax), `confidence` (its mass), `moving` (top two are
adjacent and the second holds > 0.25), `candidates` (rooms with mass > 0.1, as `{id: p}`),
`path` (Viterbi over the buffer, consecutive duplicates collapsed, last 5). `away` is a
valid `room`.

Beliefs persist in the coordinator Store (with the state-space id list, so a changed
topology discards them) and are restored on start.

Cost: N ≈ 20 rooms × S ≈ 10 scanners is microseconds per update; runs inline on the
event loop.

## Coordinator, entities, voice

`PresenceCoordinator` (mirrors `PatternsCoordinator`), constructed only when
`presence.enabled` and Bermuda is loaded:

- Discovers Bermuda's scanner devices and each tracked device's per-scanner distance
  sensors and its device_tracker through the entity/device registries; re-discovers on
  registry changes. Disabled distance sensors → repair issue (Bermuda ships them off).
- Subscribes to those entities; the distance sensors update as a batch, so observations
  are coalesced with a 500 ms debounce and one `Observation` per device is fed per tick.
- Publishes results to entities, to the engine (below), and over websocket
  `activity_levels/presence/state` → `{devices: {name: outputs}, occupants: {group: [names]}}`.
- Diagnostics include the scanner mapping and each device's belief vector.

Entities — a device "Presence: <name>" per tracked device under the hub:

- `sensor.<name>_room`: state = the room's friendly name (or "Away"); attributes
  `group_id`, `confidence`, `moving`, `candidates`, `path`, `updated`.
- `binary_sensor.<name>_moving`.

Per room group: `sensor.<group>_occupants` (count; attribute `who`), on the group device.

**Presence voice.** Every room group gets a visible synthetic channel keyed `presence`,
built like the hidden trigger voice: note-on when the group's occupant count goes 0 → >0,
note-off on >0 → 0. A person counts as an occupant only when `confidence ≥ threshold`, so
someone between two rooms notes on neither (`moving` covers that for automations).
Envelope = `presence.envelope` preset with the group's `presence` overrides applied via the
existing resolver; gain default 1.0. It mutes like any channel and appears in the live
view and the controls row's stimuli list as a stimulus with no entity.

Opt-out: with `presence` absent or disabled, none of the above is constructed; adjacency
still validates and `activity_levels/topology` still answers.

## Panel

- **Group editor** (Groups tab and the mixer controls row — one form): *Adjacent rooms*
  multi-select over the other groups; *Exit* toggle. One-way edges are shown with a `→`
  badge but edited in YAML only. Errors land on `groups/i/adjacent/j`.
- **Presence tab**, shown only when `presence.enabled`:
  - top: an SVG **graph map** with a deterministic layout (a row per top-level branch in
    tree order, nodes in pre-order, edges as lines, exit rooms marked with a door glyph).
    Nodes show occupant count and the people believed there; a `moving` person is drawn on
    the edge between their top two candidates. Selecting two nodes lists the paths between
    them from `topology/paths`.
  - bottom: one row per tracked device (name, room, confidence bar, path breadcrumb, last
    update); the scanner mapping table with unmapped / disabled-sensor rows flagged and the
    fix stated; a Settings card editing `presence.*` (device picker filtered to Bermuda
    device_trackers) in the Defaults tab's helper-text style.
- The presence voice appears in the stimuli list as "Presence (anyone here)" with gain and
  envelope editable and no entity field.
- No new libraries; SVG in Lit like the timeline and sketch.

## Testing

- Pure: topology (edge symmetry, one-way, bounded paths, transition rows sum to 1, exits ↔
  away, stale ids dropped); estimator (hypothesis: belief stays a distribution; a walk
  kitchen → dining → living is recovered; an impossible jump is rejected and then recovered
  through ε within a bounded number of updates; stuck detector resets; `away` when not
  home; Viterbi path).
- Integration (PHACC): scanner and sensor discovery from a fake Bermuda registry; repair
  issues for missing Bermuda / unmapped scanner / disabled sensor; entity states and
  attributes; presence voice note-on/off with the threshold; opt-out constructs nothing;
  config round-trip through `config/save`; belief persistence across a reload.
- Frontend: adjacency picker and error paths, deterministic map layout, path listing,
  Presence tab hidden when disabled, presence stimulus row.

## Phase 2 (scoped out): learned emissions from labelled observations

A **labels store** `(t, device, room)` and a learner that fits per-room, per-scanner
distance distributions (room *signatures*) and publishes them as a versioned document —
the same producer-agnostic pattern as the patterns profile — which replaces the fixed
`emission()`. Label sources:

- **Interactive prompts**, opt-in per device: an HA companion notification with quick-reply
  actions (top-3 candidates + Other), sent only when confidence has been low for a while
  or on a sparse schedule, capped per day; replies arrive on
  `mobile_app_notification_action`.
- Manual labels from the Presence tab ("I'm in the kitchen now").

## Phase 3 (scoped out): more observation channels

Additional `Observation` fields from the companion app: **barometric pressure** for floor
disambiguation (relative to a running per-floor baseline) and **activity state**
(walking/still) to scale the transition matrix's off-diagonal mass. Indoor GPS is not
useful and is not planned.
