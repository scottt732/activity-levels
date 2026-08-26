# Activity Levels — Design Spec

Date: 2026-08-25
Status: approved in discussion, pending written review
Supersedes: the C# `ActivityLevels` project in this repository (to be archived)

## 1. Purpose

Activity Levels is a Home Assistant custom integration (distributed via HACS) that turns
raw entity state changes into per-area "activity level" sensors on a continuous scale
(default 0.0–5.0). Each input entity (a *stimulus*) drives a synthesizer-style ADSR
envelope; groups mix their children's envelopes (a *mixer*) and roll up recursively into
parent groups. Automations use the resulting levels, `active` binary sensors, and
timestamps to make better decisions than raw motion/contact sensors allow.

A sidebar panel, built from HA's own frontend components, edits the hierarchical
configuration and shows live envelope state.

## 2. Goals and non-goals

Goals

- Native HA entities (no MQTT), owned by devices that mirror the group hierarchy.
- Continuous float values; envelope semantics with note-on/note-off.
- Event-driven engine: zero work while idle; state changes at exactly the instants the
  displayed value changes.
- Restart-safe: envelope positions restored and reconciled with current entity states.
- A native-looking, theme-following config UI.
- Pure, fully unit-tested core engine.

Non-goals (v1)

- Exponential/curved envelope segments (architecture permits a later `curve` option).
- Group-level envelopes ("bus compressor"), multiple outputs per group.
- YAML configuration mode, legacy C# config import.
- Non-admin panel access.
- HA core submission.

## 3. Configuration model

Stored verbatim in the single config entry's `options`. Validated by one shared
`voluptuous` schema (`schema.py`) used by setup, the websocket `validate`/`save`
commands, and tests.

```yaml
version: 1
defaults:                     # bottom of the resolution chain; all optional
  envelope: default           # preset used when a stimulus names none
  max_value: 5.0
  precision: 1                # display decimals
  unavailable: hold           # hold | note_off
  retrigger: only_in_release  # only_in_release | always
  debounce: 0s
  safety_refresh: 60s         # periodic recompute as a self-heal

envelopes:                    # named presets; ids unique
  - id: default
    attack: 0s
    decay: 0s
    sustain: 1.0              # fraction of peak, 0..1
    release: 30m
    impulse: false            # true = note-off immediately after note-on
    # optional: retrigger, unavailable, debounce
  - id: momentary
    release: 30m
    impulse: true
  - id: media
    attack: 10s
    decay: 5m
    sustain: 0.6
    release: 15m

groups:                       # recursive tree
  - id: house                 # ^[a-z][a-z0-9_]*$ ; unique across the whole tree
    name: House
    area: null                # HA area id, optional -> device suggested_area
    mix: sum                  # sum | max | mean
    null_handling: zero       # zero | ignore   (mean only)
    max_value: 5.0            # limiter; overrides defaults
    precision: 1
    stimuli:
      - entity: binary_sensor.front_door
        to: "on"              # trigger state(s); string or list; default "on"
        gain: 1.0             # velocity -> peak level of this voice
        envelope: momentary   # preset reference
        release: 10m          # inline override of any envelope field
    children:
      - id: living_room
        gain: 1.0             # this subgroup's channel gain into the parent bus
        # ...same shape as a group
```

Resolution order for every envelope field: `stimulus override → preset → defaults →
built-in default`.

Validation rules (all return path-addressed errors):

- `version == 1`.
- Group ids match the regex and are unique across the tree; envelope ids unique.
- Every `envelope` reference resolves.
- Every group has at least one stimulus or child.
- `to` is non-empty; `sustain` in `[0, 1]`; durations `>= 0`; `gain > 0`; `max_value > 0`;
  `precision` in `0..3`.
- Durations accept `Ns`, `Nm`, `Nh`, and `HH:MM:SS` strings, normalized to seconds on save.

Saving new options triggers an entry reload; the engine is rebuilt from scratch and
entity state is restored via `RestoreEntity` (see §5.4).

## 4. Engine (`custom_components/activity_levels/engine/`)

Pure Python, no HA imports, `mypy --strict`, clock injected as a callable returning a
`float` epoch. All time math is in seconds as floats.

### 4.1 Voice (per stimulus)

State: `phase ∈ {idle, attack, decay, sustain, release}`, `phase_start: (t, value)`,
`gate: bool`, `last_note_on: float | None`.

Every phase is a linear segment with a known start value, target value, and duration:

| phase | from | to | duration |
|---|---|---|---|
| attack | current value | `gain` | `attack` |
| decay | `gain` | `gain × sustain` | `decay` |
| sustain | held | held | ∞ (while gated) |
| release | current value | 0 | `release` scaled by `current / gain` so the slope is constant regardless of where release starts |
| idle | 0 | 0 | ∞ |

Zero-duration segments collapse instantly (attack `0s` jumps to `gain`; `sustain = 1.0`
makes decay a no-op).

Operations (all pure functions of `(state, t)` returning new state):

- `value_at(t)`: interpolate along the current segment; if `t` is past the segment end,
  roll into the next phase (attack→decay→sustain; release→idle) and recurse. Idempotent.
- `note_on(t)`: ignored if `t - last_note_on < debounce`. If `gate` and
  `retrigger == only_in_release` → no-op. Otherwise enter `attack` from `value_at(t)`
  toward `gain`, set `gate`, record `last_note_on`. If `impulse`, then apply `note_off(t)`.
- `note_off(t)`: clear `gate`; enter `release` from `value_at(t)` toward 0.
- `unavailable(t)`: `hold` → no-op; `note_off` → `note_off(t)`.
- `next_boundary(t) -> float | None`: time of the next phase transition; `None` in
  `idle` and `sustain`.
- `snapshot() / restore(data)`: the state fields, JSON-serializable.

Retrigger during release starts the attack from the *current* value. There is no separate
stored peak, which removes the class of bug the C# version had (a stale peak reasserting
itself after a retrigger).

### 4.2 Group (mixer)

`channels: list[(source, gain)]`, where a source is a `Voice` or a child `Group`. No cached
value; always computed from children.

- `value_at(t) = limit(mix(source.value_at(t) × gain))`, with `mix` = `sum` | `max` |
  `mean` (`mean` applies `null_handling`: `zero` counts idle channels as 0, `ignore`
  averages only channels with value > 0; empty → 0). `limit` clamps to `[0, max_value]`.
- `active_at(t) = value_at(t) > 0`.
- `gated_at(t)`: any voice in the subtree has `gate`.
- `active_voices(t)`: count of subtree voices not idle.
- `last_activity(t)`: max `last_note_on` over the subtree, or `None`.
- `cooldown_at(t)`: `None` if `gated_at(t)` or idle; otherwise the max over subtree voices
  of their release end time (valid because all segments are linear and monotone
  non-increasing once ungated).
- `next_boundary(t)`: min over subtree voices' `next_boundary`.

### 4.3 Output rounding

Displayed value = `round(value_at(t), precision)` (Python half-even). The C# `Ceiling`
option is dropped.

### 4.4 Scheduling contract (implemented by the coordinator, specified here)

After any event or wake-up, for each root group compute
`wake = min(next_boundary(t), next_rounding_crossing(t), t + safety_refresh)`, where
`next_rounding_crossing` is computed from the current aggregate slope (sum of the slopes
of all non-idle voice segments × gains, per the mix function) and the distance to the
next rounding step of the displayed value. If a phase boundary occurs first, it wins and
the slope is recomputed then. One timer per root group.

## 5. Integration layer (`custom_components/activity_levels/`)

### 5.1 Config entry and setup

- Domain `activity_levels`. Config flow has a single step with no fields; aborts with
  `single_instance_allowed` if an entry exists. Initial options: empty `groups`, one
  `default` envelope.
- `async_setup_entry`: validate options → build engine → create `Coordinator` → forward
  `sensor`, `binary_sensor`, `button` → register websocket commands and panel (guarded
  so reload does not re-register) → `entry.add_update_listener(reload)`.
- `async_unload_entry`: cancel timers and listeners, unload platforms.

### 5.2 Coordinator

A plain object (not `DataUpdateCoordinator`).

- Subscribes via `async_track_state_change_event` to the exact set of stimulus entity ids.
- Event classification: `new_state.state in to` and old not → `note_on`; old in `to` and
  new not (and new not unavailable/unknown) → `note_off`; new in
  `{unavailable, unknown}` → `unavailable`; otherwise ignore.
- After each event: recompute the affected root, push values to entities, reschedule that
  root's timer.
- Startup: after entities restore snapshots, reconcile each voice's `gate` against
  `hass.states.get(entity)`: in `to` now → ensure gated (note_on at restore time if it
  was not gated); not in `to` but restored as gated → `note_off(now)`.
- `trigger(group_id, peak=1.0)`: synthetic impulse voice on the group for testing (a
  transient channel with `gain=peak`, `envelope=defaults.envelope`, `impulse=true`).
- `reset(group_id | None)`: all voices in scope → idle.
- `snapshot()`: per-voice snapshots keyed by group id + entity id.

### 5.3 Devices and entities

One HA **device per group**: `identifiers={(DOMAIN, group_id)}`, `name`,
`suggested_area=area`, `via_device` = parent group's device (roots have none),
`manufacturer="Activity Levels"`, `model="Group"`.

| Entity | Class / unit | Notes |
|---|---|---|
| `sensor.<id>_activity_level` | `state_class=measurement`, no unit, `suggested_display_precision` from config | attributes: `mix`, `max_value`, `gated`, `active_voices`, `cooldown_at`, `contributors` (`{channel_id: contribution}`) |
| `binary_sensor.<id>_active` | `occupancy` | `value > 0` |
| `sensor.<id>_last_activity` | `timestamp`, diagnostic | |
| `sensor.<id>_cooldown_at` | `timestamp`, diagnostic | `None` while gated or idle |
| `button.<id>_trigger` | diagnostic | calls `coordinator.trigger(id)` |

The level sensor is a `RestoreEntity` and stores the subtree's voice snapshots in
`extra_restore_state_data`. Entities write state only when the rounded value or an
attribute changes.

Entity ids derive from the group id; `name` is the friendly name. Unique ids:
`{entry_id}-{group_id}-{kind}`.

### 5.4 Services (`services.yaml`)

- `activity_levels.trigger` — `group_id`, optional `peak`.
- `activity_levels.reset` — optional `group_id` (omit → all).

### 5.5 Websocket API (`websocket_api.py`, admin only)

- `activity_levels/config/get` → `{config}`.
- `activity_levels/config/validate` `{config}` → `{ok: bool, errors: [{path, message}]}`.
- `activity_levels/config/save` `{config}` → validates, `update_entry(options=config)`
  (triggers reload) → `{ok}` or errors.
- `activity_levels/state` → per group `{value, active, gated, cooldown_at}` and per voice
  `{phase, value, gain, phase_started, phase_ends}`.

### 5.6 Diagnostics and logging

`diagnostics.py` returns config plus `coordinator.snapshot()`. Debug logging per
envelope transition and per scheduled wake-up.

## 6. Panel (`frontend/`)

Stack: pnpm, Vite, Lit, TypeScript. Output committed to
`custom_components/activity_levels/frontend/activity-levels-panel.<hash>.js`.

### 6.1 Registration

`panel.py` serves the bundle via `async_register_static_paths` and registers a
`panel_custom` sidebar entry: title "Activity Levels", icon `mdi:pulse`,
`require_admin=True`, `embed_iframe=False`. If the environment variable
`ACTIVITY_LEVELS_DEV_SERVER` is set (e.g. `http://localhost:5173`), the panel module URL
points at the Vite dev server for HMR instead of the committed bundle. This is not part
of the config schema.

### 6.2 Layout

Two panes; stacked when `narrow`.

- **Tree (left)**: nested `ha-expansion-panel`s for groups; leaf rows for stimuli showing
  the entity icon and current state from `hass.states`. Each group row shows current
  level as a small meter and a gated indicator. Row actions: add child group, add
  stimulus, reorder within parent (drag), delete (confirm dialog). Selection drives the
  editor.
- **Editor (right)**: `ha-form` with HA selector schemas.
  - Group: id, name, area (`area` selector), mix, null_handling (shown for `mean`),
    max_value, precision, and gain into parent (hidden for roots).
  - Stimulus: entity (`entity` selector), `to` states (multi-text), gain (slider),
    envelope preset (select), and an Overrides section where each envelope field shows
    "inherited from <preset>" until overridden.
  - Validation errors from `config/validate` are mapped to fields by path.
- **Envelopes tab**: list + editor for presets (A/D/S/R, impulse, retrigger, unavailable,
  debounce) with an inline SVG envelope sketch that updates as fields change. The same
  sketch appears in the stimulus editor with overrides applied.
- **Defaults tab**: the `defaults` block.
- **Top bar**: unsaved-changes indicator, Save, Discard, Live toggle (polls
  `activity_levels/state` every 2s to animate meters and show voice phases).

### 6.3 Data flow

`config/get` on load → immutable draft with an undo stack. Nothing written until Save
(`validate` → `save`). `hass` updates only refresh live indicators.

### 6.4 Maintenance guard

`src/ha-elements.ts` is the only file that names `ha-*` tags; it awaits
`customElements.whenDefined` after nudging HA's lazy loader. HA frontend breakages are
fixed there.

## 7. Repository, tooling, testing, release

New public repo `scottt732/activity-levels`. This C# repo is archived after the leaked
token in `Source/ActivityLevels/Properties/launchSettings.json` is revoked.

```
activity-levels/
  custom_components/activity_levels/
    __init__.py  manifest.json  const.py  config_flow.py  coordinator.py
    schema.py  websocket_api.py  panel.py  diagnostics.py
    sensor.py  binary_sensor.py  button.py  services.yaml  strings.json  translations/en.json
    engine/   (voice.py, group.py, envelope.py, clock.py)
    frontend/ (built bundle, committed)
  frontend/   (pnpm: src/, vite.config.ts, tsconfig.json, eslint)
  tests/      (pytest + pytest-homeassistant-custom-component)
  hacs.json  README.md  CHANGELOG.md  LICENSE  pyproject.toml  .github/workflows/
```

Python: `uv`, `ruff` (lint + format), `mypy --strict` on `engine/`. Minimum HA version
pinned in `hacs.json` and `manifest.json` to the current stable release at implementation
time.

Tests

1. Engine (pytest + `FakeClock`): every phase transition; retrigger in each phase under
   both `retrigger` modes; impulse; unavailable under both modes; debounce; mixer
   functions incl. nested gains and limiter; `next_boundary`; snapshot/restore
   round-trip. `hypothesis` properties: value continuous across boundaries; value in
   `[0, gain]`; `next_boundary` never in the past.
2. Integration (`pytest-homeassistant-custom-component`): entry setup from fixture;
   `state_changed` → entity states/attributes; timers fire at boundaries via
   `async_fire_time_changed` and idle rooms produce no writes; restart restores and
   reconciles gates; options update reloads; websocket `validate` returns pathed errors;
   `save` persists and reloads; services.
3. Frontend (`vitest`): draft reducer/undo; error path → field mapping. No browser E2E.

CI (GitHub Actions): `hassfest`, `hacs/action`; ruff, mypy, pytest; `pnpm build` then
`git diff --exit-code custom_components/activity_levels/frontend`; `tsc --noEmit`,
eslint, vitest.

Release: `release-drafter` → tag `vX.Y.Z` → workflow sets `manifest.json` version from the
tag and attaches a zip of `custom_components/activity_levels` (`zip_release: true`).

## 8. Implementation order

1. Engine + tests.
2. Schema + config flow + coordinator + entities + services + restore; integration tests.
3. Websocket API + panel registration; panel MVP (tree + group/stimulus editors + save).
4. Envelope/defaults tabs, live view, sketch.
5. CI, release workflow, README, hand-built real config.
