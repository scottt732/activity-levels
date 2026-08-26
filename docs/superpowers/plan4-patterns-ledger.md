# SDD ledger — plan: docs/superpowers/plans/2026-08-26-patterns-and-simulation.md
Spec: docs/superpowers/specs/2026-08-26-patterns-and-simulation-design.md. Code repo = this repo, main.

## Pre-flight scan
| pair | produces / consumes | finding |
|---|---|---|
| T1→T6 | normalized defaults.patterns/simulation + group.simulation; resolve_day_type | consumed by coordinator + lightlog membership; ok |
| T2→T3,T6,T8 | profile schema/shape (96 slots, [p25,p50,p75]); expected_at/anomaly_score | T3 output must validate against T2 schema — implementer of T3 must run validate_profile on its output in a test |
| T3→T6 | Sample/LightTransition, fit_* | T5 LightLog.transitions returns LightTransition (import from patterns.model) |
| T4→T7,T8 | PlannedAction, sample_plan | ok |
| T5→T6,T7,T8 | LightLog, resolve_group_lights | ok |
| T6→T7,T8 | PatternsCoordinator API, GroupState.real_value, hub device | switch.py registered in PLATFORMS in T7 — T6 must not break platform forwarding |
| T6 tests | LTS seeding method unspecified (two options) | implementer documents choice |
| T7 | switch platform added to PLATFORMS → existing tests count entities? | existing tests do not count entities; ok |

Rulings:
- Ruling: numpy allowed only inside patterns/; manifest requirements pin numpy==2.3.2 (HA core pin) — cost: none.
- Ruling: real_value computed as raw minus trigger contribution (clamped) — cost: slight inaccuracy under MAX/MEAN mixes when the trigger is the leader; acceptable for a test aid.
- Ruling: no light restoration on simulation deactivation (spec) — cost: a light may stay on when the occupant returns.

## Progress
Task 1: minor (deferred): day_type_precedence not validated for duplicates/empty; BUILTIN_DAY_TYPES duplicated in const.py and patterns/daytype.py (isolation) — add a cross-reference comment
Task 1: complete (commits 73fa2e2..c1fe799, review clean)
Tasks 2-4: Ruling: synthetic test signal uses cos (brief's sin contradicted its own targets) — accepted, no cost.
Tasks 2-4: Ruling: p50 grid pins the trend column to the last training day (spec §5 says "average over the window", which lags expected-now by ~half the window under any trend) — deviation documented in the spec file. Cost if wrong: level shift under trend; shape unchanged.
Tasks 2-4: Ruling: quiet hours gate ON only (spec-consistent); planner and _slot_bounds computed from local wall time via tz (DST-correct); anomaly denominator floored at 0.05*scale; unobserved (day_type, slot) buckets emit p_on 0.0; dedupe re-derives ON/OFF alternation.
Tasks 2-4: minor (deferred): repeated-ON brightness changes excluded from the median (docstring note added); _minute_of assumes validated input
Tasks 2-4: Ruling: trend column also exempt from ridge penalty (location term); slot bounds truncated at next local midnight — accepted, spec §5 updated.
Tasks 2-4: fix round 1/5 (8 addressed, 0 open; commits 6540d5c..646cb9c), re-review clean
Tasks 2-4: minor (deferred): spring-forward gap-hour minutes fold onto the next hour in sample_plan (no test); trend column index hardcoded; anomaly_score scale default 1.0 (Task 6 must pass scale=max_value); alternation filter drops rather than reorders
Task 2: complete (commits c1fe799..4848e54) · Task 3: complete (..69618ac) · Task 4: complete (..6540d5c) + fix 646cb9c, review clean
Task 5: Ruling: recorder_mock test workarounds (fixture ordering; Recorder/Session annotation patch) are centralized into tests/conftest.py as Task 6's first step. Ruling: a group with area None resolves lights from include only (no registry scan) — documented behavior.
Task 5: minor (deferred): record(None) logs off; backfill dedupe keyed on (t, entity) only
Task 5: complete (commits 646cb9c..c800488, review clean)
Task 6: Ruling: day_type_now() must consult calendar entities' live state (on/off) and refresh the cache on date roll — fix now. real_value excludes only the group's own trigger (child triggers propagate) — accepted; Task 7 uses real_value as spec'd.
Task 6: minor (deferred): ProfileSensor hardcodes entity_id and shows setup-time generated_at before first rebuild (Task 8 adds a trained flag); statistics request includes unused "max"; top-level recorder imports
Task 6: fix round 1/5 (6 addressed, 0 open; commits 0e5878e..b0b3716), re-review clean
Task 6: minor (deferred): no regression test for the reload/already-backfilled path; rebuild_profile service discards the coalesced-rebuild return value
Task 6: complete (commits c800488..b0b3716, review clean)
Task 7: Ruling: plans start at the current slot with live initial_state (sample_plan gains start_slot); empty plans are not "active"; midnight/profile re-plan tests required; stale-action membership check; simulate_now reports refusal. Cost if wrong: none.
Task 7: minor (deferred): real_value rounded to group precision (sub-LSB activity won't cancel); global switch hardcodes entity_id
Task 7: fix round 1/5 (6 addressed, 0 open; commits 2937213..1724ce3), re-review clean
Task 7: minor (deferred): empty-plan early return does not record forced; plan_for may include a sub-slot pre-now action; patterns.lights membership computed once per entry (registry changes need a reload)
Task 7: complete (commits b0b3716..1724ce3, review clean)
Task 8: Important (carried into final fix wave): README says quiet hours block all light actions — code gates ON only; fix wording in the section and the config reference.
Task 8: minor (deferred): only profile/get has a non-admin test; _plan_spans untested with a non-empty plan
Task 8: complete pending final wave (commits 1724ce3..a497788)
Final review (opus): safety holds; perf 0.83 s/fit at 20 groups×180 d. Important: #1 unavailable logged as OFF poisons training; #2 light-log write amplification (3.8 MB rewrite per change); #3 lights membership never re-resolved on registry changes; #4 no startup grace before simulation can act; #5 statistic id derived from group id (rename breaks learning silently); #6 README quiet-hours/preconditions wording; #7 no lights count in state for the mixer.
Final: Ruling: ONE fix wave — #1 (ignore non on/off states; intervals treat gaps as terminators), #2 (debounce 300 s + cap rows; append-friendly later), #3 (registry update listeners → recompute lights, evaluate), #4 (runtime refuses activation until CoreState.running + 60 s settle, then evaluate_all), #5 (resolve statistic id via entity registry by unique_id; warn when zero rows), #6 README, #7 lights count in group_details; fix-now minors: dedupe BUILTIN_DAY_TYPES, reject empty precedence, TREND_COLUMN constant, reload/backfilled test, coalesced rebuild returns True, plan_for excludes pre-now, _plan_spans non-empty test, _forced expires at midnight/cancel, forecast cap 2000 points, README notes on trigger-vs-parent and lights-as-stimuli. Deferred: spring-forward fold; backfill dedupe key; lazy recorder imports; diagnostics profile size; fired timers growth; forecast-day day types (Plan 5 handoff).
Final: fix wave (A–H addressed; commits a497788..04bc281); pushed; CI green; scoped re-review re-dispatched after session restart.
Plan 4 complete at 04bc281 (313 pytests, 125 vitests).
