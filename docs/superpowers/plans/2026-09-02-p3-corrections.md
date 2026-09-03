# P3 — Corrections and the label store — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "No, I'm in the studio" snaps the person's belief there and is kept as a label,
with everything the estimator saw at that instant, for the learner to fit later.

**Architecture:** `PersonEstimator.locate` already exists. The coordinator gains
`correct(name, room, source)`: it builds the label from the current frames, activity and
carried marginals, prepends it to a capped list in a second `Store`, relocates the belief,
re-applies occupancy and notifies. A websocket command and a service call it; the panel
turns a person row into a "Where are you?" picker.

**Spec:** `docs/superpowers/specs/2026-09-02-people-devices-and-evidence-design.md` § P3

## Global Constraints

- Label: `{t, person, room, source, frames: {device: {distances, home, signals}}, carried, activity: {room: level}}`.
- Store `activity_levels.<entry_id>.presence_labels`, newest first, capped at `presence.labels.keep` (default 5000).
- Websocket `presence/correct {person, room}`, `presence/labels {limit}`, `presence/labels/delete {t, person}`;
  service `activity_levels.locate {person, room}`.
- A correction is not an observation: no frame is fed to the device filters.

---

### Task 1: Config `presence.labels.keep` and the coordinator's `correct`
- `schema.py`: `PRESENCE_LABELS_SCHEMA = {keep: int 100..50000, default 5000}`; regen JSON; README.
- `const.py`: `presence_labels_key`, `PRESENCE_LABELS_VERSION`, `SERVICE_LOCATE`, `ATTR_PERSON`, `ATTR_ROOM`.
- `presence_coordinator.py`: `self.labels: list[dict]`, loaded in `async_start`; `correct()`
  raises `ValueError` for an unknown person or room; `delete_label(t, person) -> bool`;
  `diagnostics()["labels"] = len`.
- Tests: `correct` moves the room to confidence 1.0 and keeps carried marginals; the label
  carries the frames and activity; the cap drops the oldest; an unknown room raises.
- Commit `feat(presence): corrections and the label store`

### Task 2: Websocket and service
- `websocket_api.py`: the three commands; errors `not_found` for person/room.
- `__init__.py`, `services.yaml`, `strings.json`, `translations/en.json`: `locate`.
- Tests in `tests/test_presence_coordinator.py` (websocket) and `tests/test_init.py` (service).
- Commit `feat(api): presence/correct, presence/labels and the locate service`

### Task 3: Panel — tap to correct
- `api.ts`: `correctPresence(hass, person, room)`.
- `al-presence.ts`: a person row is a button; picking it opens a `.correct` block under
  the row with a button per candidate room and a `<select>` over every room; a choice
  posts the correction, refreshes the state and shows a one-line notice; the People card
  header explains it.
- Tests; bundle.
- Commit `feat(panel): tap a person to say where they really are`

### Task 4: Ledger
