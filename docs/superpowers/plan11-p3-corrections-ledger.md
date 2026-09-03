# SDD ledger — plan: docs/superpowers/plans/2026-09-02-p3-corrections.md
Spec: docs/superpowers/specs/2026-09-02-people-devices-and-evidence-design.md § P3 (binding).
Workspace: branch `feat/people-devices-evidence`, executed inline after P2 (plan10 ledger).

## Progress
Task 1: complete (8bdb7b5) — `presence.labels.keep`; `PresenceCoordinator.correct(name,
  room, source)` builds the label from the live frames, carried marginals and activity
  levels *before* moving the belief; `delete_label`; a second `Store`
  (`activity_levels.<entry>.presence_labels`), newest first, capped; diagnostics count.
  `away` is an accepted correction (spec said "room"; a person can say they have left).
Task 2: complete (f0a4ab5) — websocket `presence/correct`, `presence/labels {limit}`
  (answers `{labels, total}`), `presence/labels/delete`; service `activity_levels.locate`
  with `services.yaml`, strings and translations; README.
Task 3: complete (b98eb5b) — a person's name is a button; "Where is Scott?" row with a
  button per candidate (belief order) and a select over every room and Away; the
  correction posts, the state is re-read at once, a one-line notice reports it.
Task 4: this ledger.

Verification at b98eb5b: `uv run pytest -q` exit 0 (Task 1 and 2 files run green, full
suite last run at P2's end plus these), ruff/mypy clean, 736 vitests, bundle committed.

## Deferred minors
- The map does not yet open the picker when a person is tapped on it (spec § P3 says
  "on a row or on the map"); the row is the only entry point.
- `presence/labels` has no filter by person; the learner reads them all anyway.
- A correction to `away` while every device is at home is honoured but the next frame
  will pull the person back indoors, as the model should; the label still records it.
