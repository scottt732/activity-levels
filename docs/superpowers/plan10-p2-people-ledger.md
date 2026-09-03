# SDD ledger — plan: docs/superpowers/plans/2026-09-02-p2-people-and-devices.md
Spec: docs/superpowers/specs/2026-09-02-people-devices-and-evidence-design.md § P2 (binding).
Workspace: branch `feat/people-devices-evidence`, executed inline after P1 (plan9 ledger).

## Progress
Task 1: complete (40b1ab8) — `presence.people`, `presence.carried`; the legacy `devices`
  list folds into one-device people *after* the cross-checks so a duplicate is still
  reported where it was written.
  **Ruling:** a person's `name` may be null; discovery names them after the first
  device's registry entry, as the legacy list did. Cost if wrong: none — the spec's
  "name: str" was the stricter reading, and a legacy entry without a name would have had
  to be named after its tracker id.
Task 2: complete (a7e3bfb) — `presence/carried.py`; the stuck detector extracted to
  `presence/stuck.py`, the estimator's behaviour unchanged (its tests ran untouched).
Task 3: complete (82cc362) — `PersonEstimator`. Three rulings, all amending spec § P2:
  - **The prior is the flip clock's stationary distribution, not a per-frame term.**
    Reconsider with `1 − exp(−dt/flip)`, then redraw carried from `prior`; the initial
    belief is the prior. The per-frame term carries the signals only. Found by test: the
    spec's `logit(prior)` every frame double-counted it against the flags' own dynamics.
  - **Side evidence is a rate.** A signal's log-odds is scaled by `min(dt, recent) /
    recent`, so a signal held for `recent` seconds is worth its whole weight and the
    conclusion does not depend on Bermuda's frame rate.
  - **A parked device is `nearby` its person with probability `carried.nearby`
    (default 0.3).** The not-carried explanation is `logaddexp(log(1−nearby) + M_d,
    log(nearby) + L_d[r])`. Found by test: with only a charging phone the spec's
    room-independent `M_d` left the person's room unconstrained and the belief diffused
    to the transition matrix's dead end (the one-way bedroom). A phone on the kitchen
    counter still says something about the kitchen.
  Also: the equivalence-with-the-device-filter test walks the graph rather than
  teleporting; impossible jumps are fair evidence the device is not on anybody, and the
  joint model is entitled to say so.
Task 4: complete (c4c48ef) — `TrackedPerson` / `TrackedDevice`; seeding from `person.*`
  with the one-of-each pairing rule; signals by companion device (`unique_id` suffix),
  explicit wins, `found` per role; frames with the four signals; person filter first,
  device filters after; store `{people, devices}` with the old `beliefs` key restoring
  into a one-device person's device filter. `PresenceCoordinator.devices` is an alias of
  `people` for one release. Fixtures: `fake_watch`, `fake_companion`, `fake_person`.
Task 5: complete (c79f409) — `DeviceEntity`, `binary_sensor.<person>_<device>_carried`
  (attribute `probability`), `sensor.<person>_<device>_room`; translations with a
  `{device}` placeholder; README.
Task 6: complete (cf8def6) — `al-people-editor`, people rows with device chips (kind
  icon, carried %, the parked room), the `carried` fields on the settings form, the
  setup picker writing `people`; bundle rebuilt (733 vitests).
Task 7: this ledger; spec § P2 amended below.

Verification at cf8def6: `uv run pytest -q` exit 0, ruff + format clean, mypy strict
clean, `export_schema.py --check` up to date, `pnpm lint && pnpm typecheck && pnpm test
&& pnpm build` clean, bundle committed.

## Deferred minors
- `_signals` recomputes `moving` from steps with a mutable `TrackedDevice`; a test that
  calls `_frame` twice at the same `t` sees the second call's `steps` already recorded.
  Harmless in the coordinator (one frame per tick), worth a pure `StepCounter` later.
- Device ids are HA slugs of the device name (`scott_s_phone`); a renamed device
  orphans its entities and its stored belief, as a renamed person already does.
- `DeviceRoomSensor` and `CarriedBinarySensor` share the person's `async_add_listener`;
  every device entity rewrites on every person tick. Fine at a handful of devices.
- The panel's setup-card picker still speaks Bermuda tracker ids only; a person seeded
  from `person.*` has to be added through the People editor.
- The graph map still places people from `presence.devices` (the compat map), so a
  parked device's faint marker (spec § P2 Panel) is not drawn yet.
