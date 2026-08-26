# SDD ledger — plan: docs/superpowers/plans/2026-08-26-activity-levels-panel.md
Spec: docs/superpowers/specs/2026-08-25-activity-levels-design.md §6. Ledgers: plan1-engine-ledger.md, plan2-integration-ledger.md.
Code repo = this repo, branch main. Frontend toolchain: node 24.16, pnpm 10.33 (mise).

## Pre-flight scan
| pair | produces / consumes | finding |
|---|---|---|
| T1→T4,T5,T6 | types.ts model (nullable overrides, GroupLive incl raw_value/precision/max_value/mix/next_wake; LiveState.now) | T3 payload matches; ok |
| T1→T5,T6 | duration.ts helpers | used by override fields, sketch labels, live countdowns |
| T4→T5,T6 | Draft, path ops, fieldErrors/subtreeErrorCount, events al-select/al-change; placeholder elements replaced later | consistent |
| T4 shell | ha-button may be mwc-button on 2026.8 | plan notes fallback |
| T5→T6 | model.ts helpers | consistent |
| T6 sketch test | impulse pts[1]=={x:0,y:1} | consistent with implementation |
| T1 CI | working-directory frontend; git diff path ../custom_components/... | valid |

Rulings:
- Ruling: non-iframe panel with HA components + resilient loader (loadCardHelpers→entities-card getConfigElement, whenDefined+timeout, visible fallback). Cost if wrong: occasional "components did not load" notice on cold loads.
- Ruling: reorder via up/down buttons, not drag-and-drop.
- Ruling: seconds on the wire; panel converts to HA duration objects.
- Ruling: Tasks 5–7 specified by props/schemas/events, not full templates.

## Progress
Task 1: minor (deferred): .npmrc engine-strict without an engines field is inert; eslint 9.39 flagged deprecated by pnpm
Task 1: complete (commits 16c9139..1c80332, review clean)
Task 2-3: Ruling: StaticPathConfig imported from homeassistant.components.http.server (mypy re-export) — consistency nit; fix in Task 7 via the existing mypy override pattern. Cost if wrong: none.
Task 2-3: minor (deferred): _bundle_hash "missing" is silent; two full-tree walks per state request
Task 2: complete (commits 1c80332..10c1cc7, review clean)
Task 3: complete (commits 10c1cc7..ed080e3, review clean)
Task 4: minor (deferred): losing sleep() timers in the loader race; stopLive leaves liveOn true; fieldErrors cannot address root paths; ha-switch target cast; tab a11y (role without tablist) → Task 7; spec §6.4 wording drifted (tags allowed in templates, loading centralized)
Task 4: fix round 1/5 (3 addressed, 0 open — save-flow extraction with tests, plain ha-menu-button, bounded nudge; commits 5aaef74..4468723)
Task 4: minor (deferred): worst-case loader wait ~16 s (nudge + whenDefined share timeoutMs)
Task 4: complete (commits ed080e3..4468723, review clean)
Task 5: minor (deferred): index-based tree keys (expansion follows slot on reorder); to-field re-normalizes mid-edit; override-field value-changed bubbles/composed; inheritedFrom cosmetics (raw enum values; unresolved preset labelled "defaults"); duplicated emit helpers; meter/dot lack flex-shrink
Task 5: fix round 1/5 (4 addressed, 0 open — safe getAt + selection sync, keyboard nesting, undo coalescing, to-field raw text; commits 526b706..9aa1792)
Task 5: complete (commits 4468723..9aa1792, review clean)
Task 6: minor (deferred): blank preset id mid-typing rewrites refs to "" (recoverable; errors land in Groups tab); sketch captions overlap for short-A/long-R presets; helper wording differs from README for two fields
Task 6: fix round 1/5 (3 addressed, 0 open — rename by index, ms durations on all duration selectors (widening accepted), envelopes polish; commits 6e87ebb..6b52e01)
Task 6: complete (commits 9aa1792..6b52e01, review clean)
Task 7: minor (deferred): unknown-preset label loose for retrigger/unavailable/debounce; countdown() duplicated in tree and stimulus editor
Task 7: complete (commits 6b52e01..ed51b0d, review clean)
Final review (opus): Important #1 frontend.yml pnpm/action-setup lacks package_json_file (job never starts → bundle guard inert); #2 al-override-field must pass .required=false (ha-selector defaults required=true → inherited durations render 00:00:00, no clear affordance).
Final: Ruling: ONE fix wave — #1, #2, plus minors: --ha-icon-button-size rename, ha-top-app-bar-fixed .narrow, clear errors on structural tree changes, move() should not steal selection, remove unreachable read-only banner + its test, add al-group-editor tests + api rejection test, single t in ws_state, skip panel registration when bundle missing (log error), delete .npmrc. Deferred: loader worst case, fieldErrors root paths, tree keys, cosmetics, two tree walks, clearable selects visual blank.
Final: fix wave (10 addressed, 0 open; commits ed51b0d..bb426c7), re-review clean
Final: parked — al-group-editor's own Delete button emits a non-structural al-change (stale errors not cleared) — Ruling: one-line follow-up (pass structural=true); deferred to the next hygiene pass. Cost: stale error badges after deleting via the editor until next validate.
Final: deferred: loader worst case ~10.5 s; fieldErrors root paths; index-based tree keys; two tree walks per state; clearable selects show blank until re-render; unknown-preset label; countdown() duplication; caption overlap.
Plan 3 complete at bb426c7 (125 vitests, 154 pytests).

Post-release: Area selector in the group editor reported intermittently blank (3–5 attempts); not reproduced yet. Suspects: ha-selector lazy import only on selector-change; ha-area-picker context (floors) timing. Needs console evidence at failure time.
