# Plan 6 — Mixer v2 (2026-08-27)

Spec: `specs/2026-08-27-mixer-v2-design.md`. Range `e2e08c0..` on main.

## Tasks
1. Backend: `Channel.muted`, coordinator mute store + `switch.<group>_mute`, `set_level` (via `Group.contribution_for`, the inverse of `_mix`), ws `mute` / `level/set` / `reset`, service `set_level`.
2. Timeline live tail (`timeseries.liveTail`), refetch 10 s after a real move (force-bypasses the cache), `formatLevel`/`effectivePrecision` for Expected/Anomaly.
3. Flat track row: `navigation.ts` rewritten around `expanded: Set<id>` (persisted in localStorage), value-fader strips with M/R, master strip follows the selection, stimuli editors in the controls row, drill-down/breadcrumb/root selector removed.

## Review rulings
- C1 fader stuck on an unchanged live frame → clear `pending` per frame (`liveNow`), feed back the returned level, release on failure.
- I1 MEAN groups could not reach full scale → `Group.max_contribution`, trigger voice `ceiling=inf` with `release_scale=max_value`; `trigger` service bounded by headroom (f395e10).
- I2 overlapping live polls → sequence number. I3 master strip claimed selection/tab stop → property-only `selected`, host tabindex -1.
- M1 parent aggregates walk `live_voices()`; M2 selection-driven expansion persisted; M4 `set_level` selector uncapped.

## Parked
- ws "not loaded" returns `not_found` (pre-existing; `ws_state` uses `not_loaded`).
- Catch-up refetch dropped while hidden is not re-armed (bounded by the 60 s tick; same as Plan 5 residual).
- MEAN/ignore `max_contribution` divisor is an upper bound when the sized channel is non-zero (exact for `set_level`, which resets first).
