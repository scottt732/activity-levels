Task 1: minor (deferred): ruff format rewrote engine/voice.py except-clause to PEP 758 syntax (py314 target) — verified safe
Task 1: Ruling: ruff 0.16 formats markdown code fences, so `ruff format --check .` is red on docs/ — add `extend-exclude = ["docs"]` to [tool.ruff] as part of Task 2's dispatch. Cost if wrong: none.
Task 1: complete (commits b34a9f2..52b2a20, review clean)
Task 2: complete (commits 52b2a20..0ebc321, review clean)
Task 3: Ruling: plan defect — test_house_config_normalizes asserted house.max_value == 5.0 while the documented normalized shape keeps group max_value/precision as None (inherit). Keep None in normalized config (so the panel can show "inherited from defaults" and later default changes propagate); tree.py resolves. Test assertion changed to `is None`; implementer's _resolve_group_defaults removed. Cost if wrong: none (tree.py already handles None).
Task 3: minor (deferred): _group_schema rebuilds vol.Schema per call and its try/except reraise is a no-op; bare int validators accept bool
Task 3: complete (commits 0ebc321..fa273ee, review clean after ruling)
Task 4: complete (commits fa273ee..1cd0211, review clean)
Task 5: minor (deferred): trigger() peak gain not persisted — a restored mid-decay trigger clamps to gain 1.0 (accepted: trigger is a test aid)
Task 5: minor (deferred): unavailable under HOLD still counts as touched (one redundant publish/reschedule)
Task 5: Ruling: reset(group_id) resets the whole subtree — intended semantics for the service.
Task 5: Ruling: plan defect — _schedule used root.next_display_change only, so child groups' rounding steps were never scheduled (published only at safety-refresh cadence). Fix: wake = min over g.next_display_change(t) for g in root.groups(), capped by safety refresh. Cost if wrong: extra wakes only.
Task 5: minor (deferred): _reconcile leaves a restored gated voice stuck if its entity is permanently gone; GroupState frozen with dict field (unhashable); contributors filter uses raw value; _state_of does six subtree traversals per group
Task 5: fix round 1/5 (4 addressed, 0 open — subtree scheduling, peak validation, stopped latch, idempotent remove; commits 3e6ba3b..757691d)
Task 5: complete (commits 1cd0211..757691d, review clean)
Task 6: minor (deferred): no regression test for bad options on reload (SETUP_ERROR path reasoned only); _LOGGER unused in __init__.py
Task 6: complete (commits 757691d..abeafce, review clean; 3 strict xfails pending Task 7)
Task 7: minor (deferred): contributors attribute written in full on every level-sensor write (recorder bloat on large trees) — consider excluding from recorder
Task 7: minor (deferred): group re-id (changing gid) creates new unique ids/entities — orphaned registry entries cleaned by device removal only; not tested
Task 7: complete (commits abeafce..4543b14, review clean)
Task 8: Ruling: save→reload race (save reports ok before reload can fail) — mitigate by calling build_tree(config) inside ws_config_save and mapping any exception to invalid_config; done in Task 9's dispatch. Residual: setup can still fail for HA-level reasons; acceptable.
Task 8: minor (deferred): websocket decorators imported from HA submodules (mypy no_implicit_reexport workaround) — diverges from core's import style; low upgrade risk
Task 8: complete (commits 4543b14..8d6164f, review clean)
Task 9: minor (deferred): README YAML block lacks a comment on a few self-evident keys
Task 9: complete (commits 8d6164f..48f522e, review clean)
Final review (opus): Important #1 config_flow stores un-normalized default options (config/get shape unstable); #2 config/save loses pathed errors; #3 gated voice pinned forever when its entity disappears under HOLD.
Final: Ruling: ONE fix wave — #1 normalize default options; #2 save returns {ok:false, errors} on ConfigError (send_error only for build failures); #3 safety-refresh wake re-runs a reconcile pass that note_offs gated voices whose entity is absent from hass.states; plus fix-now minors: contributors round-then-filter, _unrecorded_attributes for contributors, entry.async_on_unload(coordinator.async_stop) + guard unload on ok, drop dead reraise + _LOGGER, package-level websocket decorators, include trigger voice in state.voices, tests for reload-failure path and group deletion purging entities, LICENSE + CHANGELOG. Deferred to Plan 3: bool-accepting int validators, per-call schema rebuild, GroupState dict field, _state_of traversals, wall-clock clamp note, suggested_area once-only doc, state payload additions (raw value, next_wake, precision, max_value; timestamp format). Dropped: trigger peak persistence; README comments.
Final: fix wave (12 addressed, 0 open; commits 48f522e..e5d0a80), re-review clean
Final: parked — failed async_unload_platforms leaves the coordinator running (practically unreachable) — Ruling: defer; add `if not ok: await async_stop()` in Plan 3's hygiene task
Final: parked — absence-only reconcile can release a gated voice during HA startup before its entity loads (self-heals on note_on) — Ruling: defer; gate the absence pass on hass.is_running in Plan 3
Final: parked — build_tree failures lose their traceback (no _LOGGER.exception) — Ruling: defer; add a logger line in Plan 3
Final: deferred to Plan 3: bool-accepting int validators; per-call schema rebuild; GroupState dict field; _state_of traversals; wall-clock t clamp note; state payload additions (raw value, next_wake, precision, max_value; timestamp format); admin-rejection test for websocket; _create_devices before coordinator start leaves devices on failed setup; tautological _unrecorded_attributes test
Plan 2 complete at e5d0a80 (148 tests).

