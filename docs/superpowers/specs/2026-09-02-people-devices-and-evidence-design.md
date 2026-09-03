# People, devices and evidence: one belief per person, fed by everything

Status: direction approved in conversation 2026-09-02; the sectioned design was completed
autonomously with the user signed off. Decisions the user did not make in person are
marked **(chosen)** so they can be reviewed. Builds on the topology and presence spec
(2026-08-27), whose phases 2 and 3 this replaces and enlarges.

## Goal

Say, reliably, "Scott is on the first floor, in the den" — and know when we can only say
"first floor". Today one belief follows one Bermuda tracker, from distances alone, and it
walks the house at night because a phone on the theater couch looks the same as a phone
in a pocket. This spec adds three things the estimate was missing and one thing the user
can do about it:

1. **The room's own activity level is evidence.** A room at `0.0` is empty. That holds
   however many people are home, and the envelopes already encode the decay we would
   otherwise have to invent.
2. **A person owns devices, and a device may not be on them.** Phone, watch, later a
   wallet tag or a laptop. Whether each device is *carried* is a hidden state the filter
   infers, so "phone parked in the theater, person in the kitchen with the watch" is a
   hypothesis the evidence can pick — not a heuristic that has to notice first.
3. **Floor is an answer of its own**, with its own confidence: the belief mass summed over
   a floor's rooms.
4. **A correction is an input.** "No, I'm in the studio" snaps the belief and is stored as
   a label. A learner turns labels into per-room scanner signatures that replace the fixed
   distance formula. That is where "close to perfect" comes from; the filter structure is
   second, and compute is not a factor at all — `rooms × 2^devices` states is microseconds.

### Slices

Each is a spec-sized change that ships on its own and is useful on its own.

| | delivers | needs |
| --- | --- | --- |
| **P1 Evidence** | room-activity evidence in the emission; `sensor.<name>_floor` | nothing new |
| **P2 People** | `presence.people`, the joint carried model, companion signals, device entities | P1 |
| **P3 Corrections** | the label store, `presence/correct`, the `locate` service, the tap-to-correct UI | P2 |
| **P4 Signatures** | the learner and the versioned signatures document | P3 |

## Constraints that hold across every slice

- **Purity.** `presence/` and `topology.py` still import no `homeassistant`. Every new
  pure module takes plain values and `t` in epoch seconds. The coordinator does the
  registry, the clock and the unit conversion.
- **No self-confirmation.** The presence channel raises the very level the estimator
  reads. The evidence level is the group's mix with **both** the trigger voice and the
  presence voice left out: `Group.value_at_excluding` grows to take a set of labels. The
  panel's "level without simulated stimuli" already does the first half.
- **Units.** Distances reach the filter in metres (fixed 2026-09-02); every new numeric
  signal states its unit at the seam.
- **Producer-agnostic learning.** The signatures document carries `producer: {name,
  version}` like the patterns profile, and any producer may replace it. Nothing here needs
  a server, and nothing here prevents one.
- **Configuration edits happen in the panel** with YAML as the escape hatch, as everywhere
  else in this integration.

## P1 — Room-activity evidence and the floor entity

### Observation

`Observation` gains one field: `activity: Mapping[room_id, RoomActivity]` where
`RoomActivity(level: float, slope: float)`; `level` is already normalised to `[0, 1]` by
the caller (the evidence level divided by the group's `max_value`). Rooms absent from the
mapping are "unknown", and contribute nothing. Existing callers pass an empty mapping and
behave as before.

### Emission term

For each room `r` with an activity reading, add to the log-emission:

```
a_r = max(level_r, 1.0 if slope_r > 0 else 0.0)
log_e[r] += log(ε + (1 − ε) · a_r)
```

with `ε = presence.activity.floor` (default `0.05`). A room at `0.0` therefore costs as
much as a room with no scanner — `ln 0.05 ≈ −3` — and a room in full swing costs nothing.
A rising level counts as fully active whatever its magnitude, because a rise is a
stimulus firing *now*. `away` takes no activity term.

**Why this asymmetry.** With other people home, activity in a room is weak evidence that
*this* person is there; its absence is strong evidence they are not. The term is capped at
zero for exactly that reason: it never rewards a room, only penalises an empty one.

### Coordinator

`PresenceCoordinator._observation` reads, per room node in the topology,
`group.value_at_excluding(t, {TRIGGER_KEY, PRESENCE_KEY}) / max_value` and
`group.slope_at(t)`. It reads from the level coordinator's tree at the observation's `t`;
the engine's time contract holds because the level coordinator has already advanced the
tree to `now` on its own tick and the observation's `t` is taken from the same clock,
never earlier. The level coordinator's `_after_change` also marks the presence side dirty
when a room's level crosses to or from `0.0`, so an emptied room can move a belief before
Bermuda's next frame.

### Floor entity

`sensor.<name>_floor` on the person's presence device: state = the floor's name
(`floor_id` on the room's `GroupInfo` resolved through the HA floor registry, else the
nearest ancestor group of kind `floor`, else "Unknown"); attributes `floor_id`,
`confidence` (belief mass over that floor's rooms), `rooms` (`{room_id: p}` on that
floor above `CANDIDATE_FLOOR`). Rooms under no floor — a single-storey house, an outside
area — pool under the structure or property they sit in, and the entity says so.

### Config

```yaml
presence:
  activity:
    floor: 0.05          # likelihood of a room whose level is 0.0 — as a scannerless room
```

## P2 — People, devices and the joint carried model

### Config

```yaml
presence:
  people:
    - name: Scott
      person: person.scott                # optional: seeds devices from its device_trackers
      devices:
        - tracker: device_tracker.scotts_iphone_bermuda   # a Bermuda tracker
          name: Phone                     # default: the Bermuda device's name
          kind: phone                     # phone | watch | tag | laptop | other
          companion: device_tracker.scotts_iphone          # the mobile_app tracker, if any
          signals:                        # explicit; discovery seeds these from the companion device
            activity: sensor.scotts_iphone_activity
            steps: sensor.scotts_iphone_steps
            battery_state: sensor.scotts_iphone_battery_state
        - tracker: device_tracker.scotts_watch_bermuda
          kind: watch
  carried:
    prior: 0.7            # P(a device is on its person) before any signal
    flip: 300s            # mean time between carried ↔ parked changes, for the transition
    weights:              # log-odds each signal contributes; 0 disables one
      charging: -3.0      # battery_state charging / full → parked
      moving: 2.0         # activity walking/running, or steps within `recent`
      still_room_empty: -2.0   # the device's own room at level 0.0 → parked
      jitter: 1.0         # its distances wandered within `recent` → carried
    recent: 120s
  devices: []             # kept for one release: each entry becomes a one-device person
```

**Seeding (chosen).** With `person:` set, every `device_tracker` on the person entity whose
platform is `bermuda` becomes a device; one whose platform is `mobile_app` becomes a
`companion` — paired to the Bermuda device when there is exactly one of each, otherwise
left for the config to pair. Entries under `devices:` merge by `tracker` and win. Signals
are discovered by suffix on the companion's registry device (`_activity`, `_steps`,
`_battery_state`) and shown in the panel; explicit `signals:` win. `kind` defaults to
`phone` when a companion is paired, else `other`.

The old `presence.devices` list keeps validating for one release and normalises to
one-device people, so an existing document loads unchanged; the panel writes `people`.

### Pure modules

- `presence/estimator.py` — **unchanged in role**: one per *device*, "where is the
  object". Its `log_emission` is reused by the person filter.
- `presence/carried.py` — `Signals(charging, moving, still_room_empty, jitter)` as
  `bool | None` per device, and `log_odds(signals, weights) -> float`: the sum of the
  weights whose signal is `True`, `None` contributing nothing. Pure, tiny, tested by
  table.
- `presence/person.py` — `PersonEstimator`: the joint filter.

### The joint filter

State: `(room, c)` for every room state including `away`, and `c ∈ {0,1}^D` over the
person's `D` devices. Belief is an `(R, 2^D)` array.

**Transition.** Rooms move through the topology's matrix `T` exactly as today. Each
device's carried flag flips with probability `p = 1 − exp(−Δt / flip)` per update,
independently: `C = ⊗_d [[1−p, p], [p, 1−p]]`. Predict is `Tᵀ · B · C` — two small
matrix products, no Kronecker ever materialised.

**Emission.** For state `(r, c)`:

```
log E[r, c] = Σ_d ( c_d · L_d[r] + (1 − c_d) · M_d + S_d(c_d) ) + A[r]
```

- `L_d[r]` — the device's readings explained by the *person's* room: today's
  `Estimator.log_emission` for device `d`'s frame, at room `r`.
- `M_d` — the device's readings explained by *wherever the device is*: the log marginal
  likelihood of the same frame under the device's own filter,
  `logsumexp(log(Tᵀ·b_d) + L_d)`. This is what lets a parked phone's steady readings
  explain themselves. When the device and the person agree, `L_d[r] ≈ M_d` and the
  readings say nothing about carried — as they should; the signals decide.
- `S_d(c_d)` — `+log_odds_d · c_d` from `carried.py`, with the prior folded in as
  `logit(prior)`.
- `A[r]` — the P1 activity term.

`away` is handled as today (certain when the tracker says out; `floor²` when home), on
the room axis only, using the person's *carried* devices' trackers: a person is out when
every device that is probably carried (`P(c_d) > 0.5`) is not home; a person all of whose
devices are parked at home is at home somewhere (chosen).

**Outputs.** `PersonOutputs(t, room, confidence, floor, floor_confidence, moving,
candidates, path, carried: {device: p}, device_rooms: {device: room})`. `room` is the
argmax of the room marginal; `carried` is each device's marginal `P(c_d = 1)`;
`device_rooms` come from the per-device filters. The stuck detector and the bounded
Viterbi run on the room marginal as before.

**Co-movement (chosen).** Two devices that read the same room both fit `c = (1, 1)`, and a
device whose readings disagree with the others fits `c_d = 0`; co-movement is therefore a
property of the joint state, not an extra signal. An explicit correlated-jitter term is
deferred until the joint model has been watched for a while.

**Cost.** `R = 21, D = 3`: `21 × 8` states, two products per update. Nothing to tune.

### Coordinator

- `TrackedDevice` gains `kind`, `companion`, `signals` (entity ids), and a rolling
  distance history for jitter. `TrackedPerson` owns `[TrackedDevice]`, a
  `PersonEstimator`, and its outputs.
- `_observation` builds one `PersonObservation(t, devices: {id: DeviceFrame}, activity)`
  per person, where `DeviceFrame(distances, home, signals)`. `charging` reads the
  battery-state sensor (`charging` / `full` → True); `moving` reads the activity sensor
  (`walking`, `running`, `automotive`, `cycling`) or a steps increase within `recent`;
  `still_room_empty` reads the device filter's room and that room's activity level;
  `jitter` is whether the device's closest distance moved more than `scale / 3` within
  `recent`.
- The state subscription widens to the signal entities.
- Beliefs persist per person and per device (state space listed, as today).

### Entities

Per person, on "Presence: <name>": `sensor.<name>_room`, `sensor.<name>_floor`,
`binary_sensor.<name>_moving` (as today), plus per device
`binary_sensor.<name>_<device>_carried` (attribute `probability`) and
`sensor.<name>_<device>_room` (the object's room; attribute `confidence`).

### Websocket

`presence/state` grows: `people: {name: PersonOutputs}` with `devices: {id: {name, kind,
room, confidence, carried, signals: {activity, steps, battery_state, found: bool}}}`;
`occupants` unchanged; `devices` (the old top-level map) is kept for one release.

### Panel

- Presence tab: one **row per person** — room, floor, confidence bar, path breadcrumb —
  with a **chip per device** showing its kind icon, carried % and, when parked, the room
  it is in. Graph map places people as today and draws a faint marker for a parked device.
- Settings card: a **People** editor — name, person picker, devices with tracker (Bermuda
  device_trackers only), kind, companion picker (mobile_app device_trackers), signal
  entity pickers pre-filled from discovery and marked "found" or "not found"; the
  `carried` weights in the Defaults tab's helper-text style.

## P3 — Corrections and the label store

- Websocket `presence/correct {person, room}` and service `activity_levels.locate
  {person, room}` (for a companion notification action or an automation): the person's
  belief becomes `(room, current carried marginals)`, the device filters are untouched,
  and a label is stored.
- **Label**: `{t, person, room, frames: {device: {distances, home, signals}}, carried:
  {device: p}, activity: {room: level}, source: panel | service}` — everything the
  estimator saw at that instant, so the learner never has to reconstruct it.
- **Store**: `Store("activity_levels.presence_labels.<entry_id>")`, newest-first, capped
  at `presence.labels.keep` (default 5000, chosen); `presence/labels` lists them and
  `presence/labels/delete {t, person}` removes one. Diagnostics include the count.
- Panel: tapping a person on a row or on the map opens "Where are you?" — the top
  candidates first, then every room — and posts the correction. A toast confirms and the
  row updates on the next state push.

## P4 — Learned signatures

- **Learner** (`presence/signatures.py`, pure numpy): for each `(room, scanner)` with at
  least `min_labels` (default 8) labels whose device was probably carried
  (`carried ≥ 0.5`), fit a log-normal to the observed distances with the fixed formula as
  a weak prior (a pseudo-count of `prior_weight`, default 4, at the formula's implied
  mean); record the fraction of those labels in which the scanner heard the device at
  all, so "scanner X never hears you in room Y" is itself a signature.
- **Document**: `{version: 1, producer: {name: "builtin", version}, built_at,
  signatures: {room: {scanner: {mu, sigma, heard, n}}}}` in
  `Store("activity_levels.presence_signatures.<entry_id>")`; `presence/signatures/save`
  accepts one from any producer, refusing to overwrite a foreign one without `force`.
- **Emission with signatures**: for a `(room, scanner)` pair with a signature, `L_d[r]`
  uses `log N(log d; mu, sigma) + log heard` for a reading and `log(1 − heard)` for
  silence; pairs without one fall back to the fixed formula. The two are on the same
  log-likelihood scale, so a partly learned house is consistent.
- **Rebuild**: automatically after every `rebuild_after` (default 10) new labels, and on
  `activity_levels.rebuild_signatures`. `sensor.activity_levels_signatures` reports
  `built_at`, `producer`, `rooms_learned`, `labels_used`.

## Testing

- **Pure.** P1: hypothesis — the activity term never raises a room's log-emission above
  its scanner-only value; a room at `0.0` scores `log ε` exactly; a rising room scores 0.
  P2: `carried.py` by table; `PersonEstimator` — belief stays a distribution over
  `(R, 2^D)`; the last-night scenario (phone parked in the theater, watch carried to the
  kitchen, theater level `0.0`) lands in the kitchen with `carried[phone] < 0.5` within a
  bounded number of updates; a person with one device reproduces `Estimator`'s room
  marginal exactly when the carried prior is 1; the away rule. P3: a correction moves
  the room marginal and leaves the carried marginals. P4: signatures fit known
  distributions; the prior dominates below `min_labels`; a partly learned house mixes
  scales consistently.
- **Integration (PHACC).** P1: the evidence level excludes the presence channel (a room
  whose only contributor is presence reads `0.0`); floor entity naming and confidence.
  P2: seeding from a `person.*` entity, pairing rules, signal discovery, the old
  `devices` list normalising; entities per person and device; state subscription widens.
  P3: `presence/correct`, the service, the store cap, diagnostics. P4: rebuild triggers,
  foreign producer refusal, the sensor.
- **Frontend.** People rows and device chips; the People editor's pickers and the
  found/not-found marks; the correction dialog posts and toasts; settings round-trip.

## Out of scope

- Barometric floor disambiguation (the floor entity makes it easy to add later as one
  more emission term on the floor axis).
- Steering Bermuda itself.
- Any hosted producer: the document format is the whole contract.
