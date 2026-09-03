# SDD ledger — plan: docs/superpowers/plans/2026-09-02-p1-room-activity-evidence.md
Spec: docs/superpowers/specs/2026-09-02-people-devices-and-evidence-design.md § P1 (binding).
Workspace: branch `feat/people-devices-evidence`, executed inline (no subagents; the user
signed off and asked for autonomous execution). The user's uncommitted `AGENTS.md` edit
was never staged.

## Pre-flight
Plan reviewed against the spec: every P1 requirement has a task. One fix landed first,
outside the plan: `2851232` reads distance sensors in the unit they carry (feet on a
US-customary install were being read as metres — the root cause of the 2026-09-01 night).

## Progress
Task 1: complete (fb40da4) — `Group.value_at_excluding` takes a set of labels.
Task 2: complete (6ba73e4) — `RoomActivity`, `Observation.activity`, the emission term,
  example + hypothesis tests.
Task 3: complete (9d57920) — `presence.activity.floor`, JSON schema regenerated, README.
Task 4: complete (a7d3032) — coordinator reads the evidence level with trigger and
  presence voices excluded; re-observes on empty <-> busy crossings, judged against the
  evidence level (not `real_value`, which still carries the presence voice).
  **Ruling (spec amended in the same commit):** the activity term is shifted so the
  busiest room scores zero. Found by the integration tests: a house with every room at
  0.0 penalised every room equally and, `away` carrying no term, tipped the belief out of
  the house while the tracker said home. The term is about which room is more plausible
  than another; the shift makes that literal. Cost if wrong: none observed — with one
  busy room the shift is zero and the spec's numbers hold exactly.
Task 5: complete (e30031d) — `sensor.<name>_floor`; `floor_of` walks to the nearest
  floor, else structure, else property; registry name wins when the group has a
  `floor_id`; confidence is belief mass summed over the floor's rooms.
Task 6: complete (9477c0b) — settings card field `activity_floor`, bundle rebuilt.
Task 8 (added): complete (80d9eac) — `groups[].presence.activity_floor`, threaded
  through `GroupInfo.activity_floor` -> `RoomActivity.floor` -> the emission; panel
  override field with inherited value; README.
  **Ruling:** added outside the plan. A sleeper trips no motion, so their room reads 0.0;
  with somebody else up in a busy room the term would move the sleeper there within a
  handful of frames — the exact scenario this slice exists to fix. A per-room exemption
  (`1.0`) is the smallest change that makes P1 safe for bedrooms and the theater, and
  the user knows which rooms those are. Spec § P1 should gain one line; done below.
Task 7: this ledger.

Verification at 80d9eac: `uv run pytest -q` exit 0 (full suite), ruff + format clean,
mypy strict clean, `pnpm lint && pnpm typecheck && pnpm test` (726) && `pnpm build`
clean, bundle committed.

## Deferred minors
- `_room_level_changed` evaluates `_activity()` (every room) on every publish of any
  room; cheap today (N rooms × one `value_at_excluding`), worth a per-room read if N grows.
- A crossing-triggered observation re-applies the *same* Bermuda frame once; harmless
  but it is one more independent-evidence step than the readings justify. P2's person
  filter could stamp frames and skip the distance half on a repeat.
- `FloorSensor` reads "Unknown" for a room the tree cannot place; only reachable with a
  stale topology, and `restore()` already refuses those.
- The activity term reads `min(level, 1.0)`; a group whose evidence level exceeds
  `max_value` (MEAN-mixed trigger sizing) is clamped — fine, and undocumented.
