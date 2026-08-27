# SDD ledger — plan: docs/superpowers/plans/2026-08-27-topology-and-presence.md
Spec: docs/superpowers/specs/2026-08-27-topology-and-presence-design.md (read; binding).
Workspace: in place on main (session config; Plans 1–6 precedent).

## Pre-flight scan
| Pair / task | Produces vs consumes | Finding |
| T1→T2,T4,T5,T7 | CONF_PRESENCE, PRESENCE_KEY="presence", ISSUE_* ids, schema shape | consistent (grep) |
| T2→T3,T4,T5,T8 | Topology.transition_matrix(stay, escape), map_scanners, payload() ≙ TopologyPayload | consistent |
| T3→T5,T6,T7 | Observation(t, distances, home), Estimator.update(obs)->Outputs, Outputs.as_dict() ≙ PresenceOutputs | consistent |
| T4→T5 | coordinator.set_occupied(group_id, occupied); GroupInfo.presence | consistent |
| T5→T6,T7,T8 | PresenceCoordinator.payload() ≙ PresenceState; occupants dict | consistent |
| T7→T8 | types + api calls | consistent |
| each task | tests vs code, files created vs later touched | self-consistent; T8 render steps described element-by-element with tests pinning selectors (accepted, same as Plan 5) |
| Global | CHANGELOG untouched, brands never staged, presence opt-in | no task contradicts |
Scan clean.

## Progress
Task 1: complete (commits ddce588..13967d2, review clean)
Task 1: minor (deferred): presence_config fixture unused until later tasks; RED evidence collapsed (x4)/(x10)
Task 2: complete (commits 13967d2..54e1972, review clean)
Task 2: minor (deferred): topology.py docstring claims no HA import but pulls .const (plan-mandated); tree-build error message wraps build_topology; diagnostics hardcodes presence None (Task 5 must read runtime.presence); feasible() ignores escape sign; Topology frozen but unhashable; connected()/presence_enabled() untested; reachable() accepts unknown ids; runtime.py presence annotated None (Task 5 fixes to PresenceCoordinator | None); index() rebuilds tuple per call
Task 3: Ruling: implementer refined two brief behaviours — rooms with no reading this frame take `floor` (else away can never win), and abnormal readings are not appended to the stuck history (else the detector never fires) — accepted as spec refinements pending reviewer verification — cost if wrong: estimator bias, contained in presence/estimator.py.
Task 3: Ruling: `moving` stays belief-based per spec; likelihood-based variant deferred to final review.
Task 3: review — deviation (a) JUSTIFIED, (b) diagnosis justified but mechanism ratchets; Important: stuck threshold ratchet, no negative stuck test. Fix round 1 dispatched (resume implementer).
Task 3: minor (deferred): presence/ transitively imports homeassistant via .const (plan-mandated; settle in hygiene pass with topology.py); tautological candidates assertion; path() runs Viterbi every update (consider lazy); brittle t==46.0 / frame-6 pins; restore() accepts bool t.
Task 3: note — implementer disclosed that measurements in its first report were reconstructed, not observed (shell output not visible to it); reviewer verified the code independently by execution; second report's numbers are observed. Treat implementer reports' numeric claims as unverified (already the rule).
Task 3: minor (deferred): a slow environmental drift re-baselines as normal under the frozen-threshold rule — only step changes trip the detector; a reset can lower confidence post-convergence.
Task 3: fix round 1/5 (4 addressed, 0 open — stuck ratchet, negative test, Observation note, docstring; commits ba7f629..fb32c50)
Task 3: complete (commits 54e1972..fb32c50, review clean)
Task 3: minor (deferred): restore() does not clear _frozen/_low_since/_history (harmless on a fresh estimator).
Note: working tree carries an untracked-by-plan local edit (frontend/src/constants.ts DEFAULT_MIN_DAYS 14→15 + rebuilt bundle) not made by any task — presumed the user's; never stage it; surface at finish. Frontend tasks (7–9) must rebuild the bundle from their own source state and must NOT include this edit unless the user says so.
Task 4: complete (commits fb32c50..f1ea556, review clean; range also contains the user's own 88507dd ci: pre-commit hooks — not task work)
Task 4: Ruling: reset() keeps closing the presence gate; Task 5 must call set_occupied for every room on every evaluation (idempotent guard makes it cheap) so the gate self-heals on the next tick, and must fix the coordinator docstring that says callers only act on crossings — cost if wrong: a reset room shows no presence until the next Bermuda tick (~10 s).
Task 4: minor (deferred): tree.py re-derives enabled instead of topology.presence_enabled(); bare async_stop() in tests without try/finally; inconsistent config.get vs index; rooms with no adjacency/exit silently get no presence channel (document).
Note: the user is committing on main concurrently (88507dd pre-commit hooks). Implementers must `git pull --rebase` before committing if push/commit conflicts appear, and must not stage the user's uncommitted edits.
Task 5: dispatched (BASE 0bf3219; the user's 0bf3219 AGENTS.md guides landed on main — implementers now told to read them).
Hygiene (final review): AGENTS.md formalises that presence/ and topology.py must not import homeassistant; both currently import .const which imports homeassistant.const — move AWAY/CONF_* used there into a leaf module or make const.py HA-free.
Task 5: review — Important: Bermuda detection narrowed to hass.config.components (startup race). Fix round 1 dispatched (resume implementer) with minors: clear stale issues, malformed store guard, distinguish missing vs non-Bermuda tracker.
Task 5: minor (deferred): listener/registry boilerplate duplicated from PatternsCoordinator (mixin candidate); duplicate display names collide silently; AWAY_LABEL hardcoded English (translate before entity names, Task 6); set_occupied reads the clock per room (two _after_change passes per tick); CONNECTION_BLUETOOTH fallback untested; jitter helper uses module-level counter.
Task 5: fix round 1/5 (4 addressed, 0 open — Bermuda detection + after_dependencies, clear stale issues, store guard, missing-vs-non-Bermuda; commits f7a3cc6..5dccdf9)
Task 5: complete (commits 0bf3219..5dccdf9, review clean)
Task 6: complete (commits 5dccdf9..a1be4c1, review clean)
Task 6: Ruling: AWAY_LABEL stays a literal — room state is an open-ended set of user names; HA state translations only cover closed enums — cost if wrong: an untranslated 'Away' for non-English users.
Task 6: minor (deferred): presence device identity keyed by slugified display name (rename orphans entities; document); listener-subscribe pattern repeated across entity classes.
Task 7: review — Important: groupData stale-id filter erases adjacency before validation; ⚠️ confirmed as real gaps (spec binding): controls row lacks adjacent/exit, no → badge. Fix round 1 dispatched (resume implementer).
Task 7: minor (deferred): changedGroupField adjacency comparison is order-sensitive (brief-mandated).
Task 7: fix round 1/5 (3 addressed, 0 open — unfiltered groupData, controls-row fields, → badge; commits f9d4c16..7694455)
Task 7: complete (commits a1be4c1..7694455, review clean)
Task 7: minor (deferred): one-way badge test's 'symmetric' case uses an unconnected room. Note: the user's uncommitted DEFAULT_MIN_DAYS=15 edit makes 4 vitests fail in the working tree (committed value is 14) — theirs to resolve.
Task 8: review — Important: tab fallback bypassed by discard/undo/redo/load; one-way arrowhead hidden under node box (edges centre-to-centre); role=img hides nodes from AT. Fix round 1 dispatched (resume implementer) + minors: no-route flash, dead .page rule.
Task 8: minor (deferred): loading/empty/failure states indistinguishable and PresenceState.enabled never read; two movers on one edge coincide; nodeById unused; topology refetch on every draft edit (brief-mandated); narrow unused; FormItem duplicated with al-defaults.
Task 8: fix round 1/5 (5 addressed, 0 open — syncTabs, border-inset arrows, role=group, pathsPending, dead .page; commits 91e6a6a..c8a762c)
Task 8: complete (commits 7694455..c8a762c, review clean)
Task 9: complete (commits c8a762c..28d6c2f, review clean)
Task 9: minor (deferred): laundry_room has an exterior door but no exit: true in the example (user to confirm).
Final whole-branch review dispatched over ddce588..28d6c2f.
Final review (ddce588..28d6c2f): gate green; Important: purity boundary via const.py (fix before merge); minors 2–10. Fix wave dispatched: purity + guard test, restore() malformed states, apply_occupancy when nothing moved, README reserved labels, home-derivation comment, issue texts, UI selector bounds, delete presence_enabled/nodeById.
Final review: parked — first startup observation can pull a restored belief toward Away (no tracker state yet); presence entities only materialise at (re)load (issue texts now say reload); duplicate derived display names collide silently (follow-up repair issue); groupData dead config param (brief-mandated); restore() accepts bool t.
Final: fix wave (28d6c2f..581697b) re-review clean — all 8 findings addressed, purity guard test real.
Plan 7 complete at 581697b (483 pytests, 559 vitests).
