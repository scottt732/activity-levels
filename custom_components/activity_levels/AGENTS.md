# The integration — agent guide

The Home Assistant side. A `hub` integration with `single_config_entry`, a config flow,
and `iot_class: calculated` — it derives everything from other entities' states and talks
to nothing over the network. The root `AGENTS.md` covers the repository as a whole.

## The pure/impure line

Four places must not import `homeassistant`:

| | |
| --- | --- |
| `engine/` | the activity-level state machine — `voice.py`, `group.py`, `envelope.py` |
| `patterns/` | learning and plan generation — `model`, `features`, `profile`, `planner`, `daytype` |
| `presence/` | room estimation from noisy proximity readings |
| `topology.py` | the room adjacency graph everything presence-related reads |

They take plain values and a `t` in epoch seconds, and hand plain values back. Everything
that touches the clock, the state machine, the entity registry or the service bus lives
in the modules beside them — `coordinator.py`, `patterns_coordinator.py`, `simulation.py`,
`lightlog.py`. That split is why the pure packages can be tested with no `hass` fixture at
all, and it is the first thing to preserve when adding behaviour: work out which side each
piece belongs on before writing it.

`numpy` belongs on the pure side (`patterns/`, `presence/`, `topology.py`). `simulation.py`
imports it too and is the one HA-side exception.

## The engine's time contract

Engine queries mutate. `value_at`, `slope_at`, `next_boundary`, `is_active` and every
group method built on them call `Voice._advance`, retiring timed phases that finished by
`t` — which is what keeps reads O(1) instead of replaying history. The consequence:

> `t` must never go backwards on a given tree.

Query an earlier `t` than one already seen and you get the *current* segment's geometry,
not the value the voice really had then. Feed a whole tree from one clock reading per
update and the contract holds by construction. The engine also imposes no minimum wake
interval — that policy belongs to the coordinator. `engine/__init__.py` has the full
statement; read it before changing `voice.py` or `group.py`.

## Home Assistant details

- **`manifest.json` is the version of record** for the whole project. release-please
  owns it; never edit `version` by hand. `requirements` pins `numpy==2.3.2`, and
  `dependencies` (`http`, `frontend`, `panel_custom`, `websocket_api`) plus
  `after_dependencies` (`calendar`, `recorder`) are load-order contracts — changing them
  changes when setup runs.
- **`hassfest` and the HACS action validate this directory on every PR.** They check the
  manifest, the strings, the services file and the brands entry. A change to any of those
  four is worth running through your head against hassfest's rules before pushing.
- **`strings.json` and `translations/en.json` must stay in step.** `strings.json` is the
  source; `translations/en.json` is the English copy HA actually loads. Add a config-flow
  step, an error, a service or an entity name and both need the key.
- **`services.yaml` must match what `__init__.py` registers** — currently `trigger`,
  `set_level`, `reset`, `rebuild_profile` and `simulate_now`. The file is the UI for those
  services, so a new field needs a selector here too.
- **`websocket_api.py` is the panel's API.** Its command names and payload shapes are a
  contract with `frontend/src/api.ts`; change one and change the other, in the same commit
  as the rebuilt bundle.
- **`schema.py` validates and normalizes the options dict.** Config keys live in
  `const.py`. New configuration means: a constant, a voluptuous schema entry, a
  normalization default, a test in `tests/test_schema.py`, and a section in the README's
  configuration reference.

## Testing

Tests for this directory live in `../tests/`, mirroring the layout — `tests/engine/`,
`tests/patterns/`, and one module per file otherwise. `pytest-homeassistant-custom-component`
supplies the `hass` fixture and `asyncio_mode = auto` means async tests need no marker.
The pure packages carry `hypothesis` property tests; prefer strengthening an invariant
there over adding a fourth example test.

`mypy --strict` covers exactly this directory. Two overrides in `pyproject.toml` relax
`no_implicit_reexport` for `homeassistant.components.websocket_api` and
`homeassistant.components.http`, because core re-exports those names without an `__all__`.
