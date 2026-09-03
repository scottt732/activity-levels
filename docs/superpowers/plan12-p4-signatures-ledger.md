# SDD ledger — P4 learned signatures
Spec: docs/superpowers/specs/2026-09-02-people-devices-and-evidence-design.md § P4 (binding).
Executed straight from the spec, without a separate plan file: two tasks, one pure and
one HA-side, on branch `feat/people-devices-evidence` after P3 (plan11 ledger).

## Progress
Pure (afb2d5e) — `presence/signatures.py`: `Signature(mu, sigma, heard, n)` with a proper
  log-normal log-likelihood for a reading and `log(1 − heard)` for silence; `fit()` over
  labels with a carried cut (`≥ 0.5`), a `prior_weight` pseudo-count at the formula's
  implied values (half the scale for a scanner's own room, twice it elsewhere), a sigma
  floor; `to_document` / `from_document` (refusals, never exceptions). `Estimator.log_emission`
  answers each `(room, scanner)` pair from its signature when it has one -- silence
  included -- and from the fixed formula otherwise.
  **Ruling:** the spec's "same log-likelihood scale" is approximate. The signature is a
  normalised density; the formula is not. They mix only within a room that has some pairs
  learned and some not, and the prior keeps a freshly learned pair near the formula, so the
  seam is soft. Written down here rather than papered over.
HA side (6dbba8f) — `presence.signatures {min_labels, prior_weight, rebuild_after}`; a third
  `Store`; every device filter shares the coordinator's `signatures` object so a rebuild
  reaches them all; automatic rebuild after `rebuild_after` corrections; `rebuild_signatures`
  and `save_signatures` with the foreign-producer rule (a foreign document is kept unless
  forced, the builtin one is always replaceable); service `activity_levels.rebuild_signatures`;
  websocket `presence/signatures/get` and `/save`; `sensor.activity_levels_signatures`
  (timestamp, diagnostic, on the hub) with `producer`, `producer_version`, `rooms_learned`,
  `labels_used`; README.

Verification at 6dbba8f: `uv run pytest -q` exit 0, ruff/format/mypy clean, JSON schema up
to date. Frontend untouched in this slice (733+3 vitests still green from P3).

## Deferred minors
- The panel does not yet show the signatures sensor's numbers or the learned pairs; the
  websocket `presence/signatures/get` already answers with everything a card needs.
- `fit()` pools every person's labels: a second person with a different phone shares the
  same signatures. Per-device signatures are a natural refinement once labels accumulate.
- A rebuild runs inline on the event loop; at 5000 labels and 20×10 pairs it is a few
  milliseconds of numpy, so no executor yet.
