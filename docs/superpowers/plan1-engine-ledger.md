# Plan 1 (engine) — execution ledger

Plan: `docs/superpowers/plans/2026-08-25-activity-levels-engine.md` (in the archived C# repo).
Spec: `docs/superpowers/specs/2026-08-25-activity-levels-design.md`.
Completed at `dc22510`; 80 tests, ruff/format/mypy clean.

## Rulings made during execution

- Work happens directly on `main` (fresh repo, nothing to protect).
- `engine/clock.py` from the spec dropped: every method takes an explicit `t`.
- Impulse envelopes jump straight to `gain` and release immediately, ignoring attack/decay/sustain; they never set `gate`.
- Task 3: `reset()` also clears `last_note_on` (stale debounce must not survive a reset).
- Tasks 4–6: `note_on` (and later `note_off`) call `_advance(t)` so zero-length segments collapse immediately and `phase` is observable right after an event.
- Task 8 round 1 (superseded — **this ruling was wrong**): "advance a full step when `dt < 1e-6`" skipped real crossings. Replaced by the final fix wave's display-space formulation with `_MIN_DT = 1e-3`.
- Task 9: the continuity property applies only to positive-duration segments; zero-length segments jump by design.
- Final fix wave: `Group.value_at` mixes the channel list (not the id-keyed dict); `Channel.key`/label uniqueness enforced at construction; un-pin crossing scheduled when the limiter releases; `restore()` reconciles phase/gate and requires a real bool gate; `math.isfinite` validation; monotonic-`t` and no-minimum-wake contracts documented in `engine/__init__.py`; CI hardened (`--locked`, permissions, concurrency).

## Parked (real, deferred to Plan 2)

- `Mix.MAX` rising crossover: when a steeper voice overtakes during overlapping attacks the wake lands late (measured 35 s stale in one case). Add a pairwise-intersection candidate to `next_display_change` for MAX and correct the docstring's "never late" claim.
- `restore()` of a gated IDLE snapshot with value 0 coerces to SUSTAIN at 0 (reports active until `note_off`). Reset when value == 0.
- `next_display_change` recomputes raw value/slope twice; the staleness property's livelock cap is asserted before the horizon check (20% headroom).
- `Group.channels` is a mutable list; label uniqueness is checked only at construction.

## Deferred to Plan 2 (integration layer)

- Extend mypy `files` beyond `engine/` when HA-importing modules land.
- Schema rule: `impulse: true` makes attack/decay/sustain meaningless — reject or grey out.
- Coordinator must floor timer delays (engine imposes no minimum wake interval).
- Add `hassfest` and `hacs/action` to CI once `manifest.json` exists.
- Stimulus-level duplicate entities in one group must get distinct `Channel.key`s from the schema.
