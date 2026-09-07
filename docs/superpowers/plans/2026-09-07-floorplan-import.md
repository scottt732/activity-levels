# Floorplan Import Implementation Plan

**Goal:** Import ESPresense geometry into an explicitly reviewed Activity Levels draft.

**Architecture:** Pure Python geometry validators and import parsing feed an admin
WebSocket preview command. Pure TypeScript matching/application logic feeds a Lit
import tab, which uses the existing draft event and save validation flow.

**Tech Stack:** Python, voluptuous, PyYAML supplied by Home Assistant, Lit, TypeScript.

Execute inline in the existing floorplan worktree. User desktop instructions take
precedence over generic delegation and broad local verification workflows.

## Tasks

- [x] Add `tests/test_floorplan.py` and focused schema tests, verify failure, then
  implement `geometry.py` and `floorplan.py`. Root selection occurs before domain
  validation; unrelated configuration never appears in the result.
- [x] Extend `const.py`, `schema.py`, and `schema_json.py` for optional GPS, bounds,
  and points. Export with `uv run python scripts/export_schema.py` and exercise
  `tests/test_schema_json.py` to check the committed schema.
- [x] Add WebSocket preview tests to `tests/test_websocket.py`, then register an
  admin-only `activity_levels/floorplan/parse` handler using executor parsing.
  It returns normalized source data and never saves config.
- [x] Add `frontend/test/floorplan-import.test.ts`, then implement matching and
  immutable application in `frontend/src/floorplan-import.ts`. Resolve explicit
  creations by source row key, check parent kinds, cycles and duplicate targets,
  and generate collision-free editable IDs. Test GPS opt-in and room Z retention.
- [x] Add `frontend/test/al-floorplan-import.test.ts`, then implement the accessible
  paste/file, mapping, creation, summary and Apply form. Validate before emitting
  `al-change`; reject stale async results. Register in `main.ts`, wire the Floorplans
  tab in `activity-levels-panel.ts`, and add a shell integration regression.
- [x] Document usage and geometry in `README.md`; run changed tests only, focused
  Ruff/ESLint and mypy, then `pnpm -C frontend build` for compilation and bundle.
- [ ] Inspect the diff once, commit the sources/generated artifacts together,
  push and open a PR; watch exact-head CI for broad regression and coverage.

Local verification: 74 frontend tests across the importer and panel shell; parser,
schema-export and WebSocket tests selected for floorplan/geometry behavior; focused
Ruff/ESLint and mypy; TypeScript compilation and Vite build. The committed schema and
panel/card/shared bundles are regenerated. Full regression and coverage belong to CI.
