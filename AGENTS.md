# Activity Levels — agent guide

A Home Assistant custom integration that gives each area of a home an ADSR-envelope
"activity level", plus a Lit sidebar panel that visualises and edits it. Two halves,
two toolchains:

| | Path | Toolchain |
| --- | --- | --- |
| Integration | `custom_components/activity_levels/` | Python 3.14, [uv](https://docs.astral.sh/uv/) |
| Panel | `frontend/` | Lit + TypeScript, Vite, pnpm on Node 24 |

`README.md` explains what it does for users; `CONTRIBUTING.md` covers workflow and
releases. This file is what an agent needs that neither of those says out loud.

## Commands

```bash
uv sync                       # Python dependencies
uv run ruff check . && uv run ruff format --check .
uv run mypy                   # strict, custom_components/activity_levels only
uv run pytest                 # quiet by design

cd frontend && pnpm install
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

`uvx pre-commit install --install-hooks` wires all of the above into git: the fast
checks on commit, `mypy`/`pytest`/`vitest` on push. Assume they are installed — if a
commit fails, read what the hook said rather than reaching for `--no-verify`.

## Rules that are easy to break

**The panel bundle is committed.** `pnpm build` writes
`custom_components/activity_levels/frontend/activity-levels-panel.js`, and that file is
checked in because HACS installs straight from the repository with no build step. Change
anything under `frontend/src/` and you must rebuild and commit the bundle in the same
commit. CI runs `git diff --exit-code` on it; the pre-commit hook catches it earlier.

**`manifest.json` is the version of record.** `custom_components/activity_levels/manifest.json`
holds the real version. `pyproject.toml` pins `version = "0.0.0"` as a deliberate
placeholder — bumping it would be copied into `uv.lock` and break `uv sync --locked` on
every release PR. Never hand-edit either version field, and never hand-edit
`CHANGELOG.md`: release-please owns all three.

**Commits are Conventional Commits**, because release-please parses them into the
changelog and the next version. Types: `feat` `fix` `perf` `refactor` `docs` `deps`
`chore` `ci` `test` `build` `style` `revert`. Scopes in use: `engine`, `config`,
`coordinator`, `api`, `panel`, `mixer`, `timeline`, `patterns`, `simulation`, `switch`,
`translations`, `frontend`, `readme`, `changelog`. Below 1.0.0, a breaking change bumps
the minor, not the major.

**Purity boundaries.** These packages must not import `homeassistant`:

- `engine/` — the pure activity-level state machine
- `patterns/` — pattern learning and plan generation
- `presence/` and `topology.py` — the room graph and the room estimator

They are pure so they can be tested without a Home Assistant fixture, and so the
integration layer stays the only place that touches the clock, the state machine or the
service bus. Data goes in as plain values; nothing reaches back out. `numpy` belongs on
that pure side — `patterns/`, `presence/`, `topology.py` — with `simulation.py` the one
HA-side module that also imports it.

**The engine's time contract.** Every engine query takes `t` in epoch seconds and
*mutates*: `value_at`, `slope_at`, `next_boundary` and `is_active` retire phases that
have finished by `t`, which is what keeps it O(1) instead of replaying history. So `t`
must never go backwards on a given tree — feed a whole tree from one clock reading per
update and the contract holds by construction. `engine/__init__.py` states this in full;
read it before touching `voice.py` or `group.py`.

## Layout

```
custom_components/activity_levels/
  __init__.py           setup, services, device registry
  coordinator.py        drives the engine tree from HA state events and timers
  engine/               pure: voice.py, group.py, envelope.py
  patterns/             pure: model, features, profile, planner, daytype
  presence/             pure: estimator, observation
  topology.py           pure: room adjacency graph
  schema.py             validation and normalization of the options dict
  simulation.py         HA-side half of patterns/planner
  lightlog.py           Store-backed light on/off history feeding the learner
  websocket_api.py      the panel's API
  patterns_coordinator.py
  sensor.py binary_sensor.py switch.py button.py entity.py panel.py
  manifest.json strings.json translations/ services.yaml
frontend/src/           the Lit panel (see frontend/AGENTS.md)
tests/                  pytest; tests/engine/ and tests/patterns/ mirror the packages
docs/superpowers/       specs/ (design), plans/ (implementation), *-ledger.md (progress)
```

## Testing

`pytest-homeassistant-custom-component` provides the `hass` fixture; `asyncio_mode` is
`auto`, so async tests need no marker. The pure packages have property tests under
`hypothesis` (`tests/engine/test_properties.py`, `tests/test_estimator_properties.py`) —
when you change pure logic, check whether an invariant belongs there rather than another
example test. New behaviour gets a test; that is a PR checklist item.

## Style

`ruff` with `line-length = 100` and `E,F,I,UP,B,SIM,RUF,ANN` — annotations are required
everywhere except `tests/`. `mypy --strict` covers `custom_components/activity_levels`
only. Prose in docstrings and comments explains *why*, at some length, in complete
sentences; match that when you add to it.

Don't commit `.DS_Store`, `coverage.xml` or `frontend/coverage/` — all three are ignored
and one has a hook to say so.
