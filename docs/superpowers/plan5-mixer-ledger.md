# SDD ledger — plan: docs/superpowers/plans/2026-08-26-mixer-ui.md
Spec: docs/superpowers/specs/2026-08-26-mixer-ui-design.md. Code repo = this repo, main. Frontend-only plan.

## Pre-flight scan
| pair | produces / consumes | finding |
|---|---|---|
| T1→T2..T6 | api additions, timeseries/navigation/fader pure modules | consumers listed in plan; consistent |
| T2→T3,T5 | al-strip/al-master-strip events; al-fader value-changed {value, live} | T3 re-emits as al-change with coalesce; ok |
| T3→T6 | al-nav/al-change/al-sim-toggle | shell wiring in T6 |
| T4→T6 | al-timeline props/events; cache in timeseries.ts | ok |
| T5→T6 | al-strip-controls events | ok |
| T6 | Live forced on for Mixer; selection shared with tree; nav.sync on config change | plan states rules |
| all | HomeAssistant.callService added to types (T1) | used by T6 |

Rulings:
- Ruling: timeline data exists only for groups (LTS of level sensors); a selected stimulus shows its parent bus's timeline — cost: no per-stimulus history (engine voices aren't recorded).
- Ruling: Live polling forced on while the Mixer tab is visible — cost: 1 request / 2 s while viewing.
- Ruling: forecast horizon capped at 7 d client-side; server caps at 2000 points anyway.

## Progress
Task 1: Ruling: forecastLine(f, key) returns raw points (x applied later via pathFor) — accepted; initialNav selection null on empty config — accepted.
Task 1: minor (deferred): decimate exceeds maxPoints for maxPoints<=3 (degenerate); arrow with dangling selection untested
Task 1: complete (commits 3ff9c14..b5cd168, review clean)
Task 2: fix round 1/5 (2 addressed, 0 open — limiter floor + icon test; commits 4a6d970..0d8af75)
Task 2: minor (deferred): NaN guard on the number input unreachable via .value (browsers sanitize)
Task 2: complete (commits b5cd168..0d8af75, review clean)
Task 3: fix round 1/5 (1 addressed, 0 open — keydown guard for native controls; commits a7ac44a..49e8e11)
Task 3: minor (deferred): bus strips draw a neutral envelope sketch; narrow "≤3 strips" sizing deferred to the shell; Home/End semantics interpreted (first channel / master)
Task 3: complete (commits 0d8af75..49e8e11, review clean)
Task 4: fix round 1/5 (2 addressed, 0 open — quantized cache keys + eviction, band decimation; commits 855768a..91d4de6)
Task 4: minor (deferred): cache eviction is write-recency not access-recency; y-tick layer order; narrow only changes height; timelineCache exported as a test hook
Task 4: complete (commits 49e8e11..91d4de6, review clean)
Task 5: minor (deferred): DEFAULT_MIN_DAYS=14 hardcoded fallback (backend config includes patterns.min_days; fine once config/get carries it)
Task 5: complete (commits 91d4de6..90c029f, review clean)
Task 6: Ruling: an explicitly null selection stays null after config sync (Groups tab placeholder preserved); reducer's deletion recovery untouched.
Task 6: fix round 1/5 (6 addressed, 0 open; commits 8efdd9e..5a67787)
Task 6: minor (deferred): profileState refresh is TTL-at-activation (no background timer); renderBlocked rebuilds group rows per row
Task 6: complete (commits 90c029f..5a67787, review clean)
Task 7: minor (deferred): pre-existing pytest 9 vs PHACC caplog fixture flake (order-dependent) — pin pytest<9 in a hygiene pass
Task 7: complete (commits 5a67787..b3005ec, review clean)
Final review (opus): Important #1 multi-root selector missing (README claims it); #2 roving tabindex doesn't gate inner controls (~3 stops/strip); #3 failed timeline load shows the previous group's chart; #4 timeline refetch ignores visibility/busy.
Final: Ruling: ONE fix wave — #1 root selector crumb; #2 name→span, fader/open/master controls focusable only when selected; #3 clear loaded on groupId change; #4 visibility + paused prop; fix-now minors: ArrowLeft-from-null → master, empty busPath guards, DEFAULT_MIN_DAYS single definition, simStates memo, groupRows hoist, title→heading, card padding, panel tests import the components. Deferred: narrow ≤3 strips sizing; y-tick layer order; timelineCache export; Forecast.truncated unused; profileState TTL-at-activation.
Final: fix wave (A–H addressed; commits b3005ec..6e846de), re-review clean.
Final: parked — ha-switch may not forward host tabindex to its inner checkbox (browser check); simStates memo keyed too broadly (drop hass.states from the key); no catch-up timeline load on resume from hidden/paused; root selector lacks a visual affordance (caret). Deferred: narrow ≤3 strips sizing; y-tick layer order; timelineCache test hook; Forecast.truncated unused; profileState TTL-at-activation; pytest<9 pin.
Plan 5 complete at 6e846de (393 vitests, 313 pytests).
