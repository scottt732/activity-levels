# Presence correction feedback implementation plan

> Execute autonomously in this session. Follow the approved design and the repository's
> focused-check and single-review policies. Panel implementation can run independently;
> do not run competing builds or delegate duplicate reviews.

**Goal:** Keep corrections until fresh evidence justifies reconsidering them.

**Architecture:** A pure correction policy constrains filter beliefs after each update,
including reset paths. The coordinator supplies fresh source timestamps and persists
corrections through existing estimator snapshots. The panel uses the existing correction
endpoint with optional device and carrying fields.

**Tech stack:** Python 3.14, numpy, Home Assistant, Lit, TypeScript, pytest, Vitest.

## 1. Pure policy and filter integration

- [x] Add focused tests in `tests/test_corrections.py` for stationary, stale, directed
  route, timed support, fade, expiry, restore, and person/watch regressions. Run
  `uv run pytest tests/test_corrections.py` and verify the missing policy fails.
- [x] Add `presence/corrections.py`: bounded fresh-evidence support, room protection,
  carrying strength, serialization and reason text. Extend `DeviceFrame` with source
  timestamps, and integrate policy application into `person.py` and `estimator.py`.
- [x] Verify with the new tests and the existing `tests/test_person.py` regression.

## 2. API, labels and source evidence

- [x] Extend `PresenceCoordinator.correct(name, room=None, *, source, device=None,
  carried=None, clear=False, carrying=None)`; `carrying` is an optional device-to-bool
  mapping for atomic person-room submissions. Validate all targets before mutation.
- [x] Add timestamps from actual HA states, correction persistence, typed labels and
  device registry IDs in the presence payload. Add coordinator regression tests.
- [x] Extend `presence/correct` and the `locate` service with the same optional fields.
  Keep legacy person-room calls working. Test invalid and combined requests.
- [x] Teach `signatures.fit` to accept device-room labels and ignore carrying labels.
  Add focused training tests and update service descriptions.

## 3. Panel and navigation

- [x] Add optional `correction` and `carrying_correction` payload status with fields
  `t`, `strength`, `reason`, and `value` (room string or carrying boolean).
- [x] Add device correction controls, combined person/carrying input, clear controls,
  reasons and errors. Link Bermuda devices, scanners, areas, and stimulus entities.
- [x] Distinguish optional missing companion sensors from unavailable configured ones.
  Add focused Vitest tests for correction requests and navigation.

## 4. Verify and deliver

- [x] Update the user documentation and self-review the diff once.
- [x] Run affected tests, focused lint/type checks, and rebuild the committed bundle.
- [ ] Commit and push a PR; watch CI on that exact SHA. Resolve concrete failures and
  review findings. Report local checks separately from the broad CI suites.

Notifications remain the optional follow-up described in the approved spec.
