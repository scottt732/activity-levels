# Activity Levels

Home Assistant custom integration (HACS) that turns entity state changes into per-area
activity-level sensors. Every stimulus you configure — a door opening, a motion sensor
firing, a media player starting — drives a synthesizer-style ADSR envelope, and a
recursive mixer combines those envelopes across a tree of groups (rooms, floors, the
whole house) into a single "how much is going on here" number per area.

## How it works

Each configured stimulus is a **voice**: an envelope with attack, decay, sustain, and
release stages. When the source entity enters its configured `to` state, that's
note-on — the envelope attacks up to its peak (`gain`), decays to its sustain level, and
holds there. When the entity leaves that state, that's note-off — the envelope releases
back toward zero over its `release` time. A group **mixes** the current values of its
child voices and child groups using `sum`, `max`, or `mean`, then applies a limiter
(`max_value`) so the group's own activity level stays in a bounded range. Groups can
nest, so a `living_room` group rolls up into a `house` group, and the same mixed value
is recomputed recursively at every level whenever a leaf voice changes.

## Install

1. In HACS, add a custom repository: `scottt732/activity-levels` (category: Integration).
2. Install "Activity Levels" from HACS, then restart Home Assistant if prompted.
3. Go to **Settings → Integrations → Add Integration**, search for "Activity Levels",
   and add it.
4. Configuration is edited in a sidebar panel *coming in the next release*. Until then,
   edit the config via the `activity_levels/config/save` websocket command (see below)
   or by calling it from **Developer Tools → Actions/Template** with a JSON payload
   matching the [configuration reference](#configuration-reference).

## Entities

Each configured group produces:

| Entity | Description |
| --- | --- |
| `sensor.<id>_activity_level` | The group's mixed, limited activity level. Attributes: `mix`, `max_value`, `gated`, `active_voices`, `cooldown_at`, `contributors`. |
| `binary_sensor.<id>_active` | On while the group's activity level is above zero. |
| `sensor.<id>_last_activity` | Diagnostic: timestamp of the group's most recent note-on. |
| `sensor.<id>_cooldown_at` | Diagnostic: when the group's release/cooldown is expected to finish. |
| `button.<id>_trigger` | Diagnostic: manually fires the group's synthetic trigger voice. |

## Services

- `activity_levels.trigger` — manually fire a synthetic note-on. Fields: `group_id`
  (required), `peak` (optional, defaults to 1.0).
- `activity_levels.reset` — clear all active voices back to idle. Fields: `group_id`
  (optional; omit to reset every group).

## Configuration reference

Durations accept `30s`, `5m`, `2h`, `1d`, `HH:MM:SS`, or a plain number of seconds.

```yaml
version: 1
defaults:
  envelope: default          # preset used when a stimulus names none
  max_value: 5.0             # limiter for groups that don't set their own
  precision: 1               # display decimals
  unavailable: hold          # hold | note_off — what an entity going unavailable does
  retrigger: only_in_release # only_in_release | always
  debounce: 0s               # minimum time between note-ons per stimulus
  safety_refresh: 60s        # periodic recompute as a self-heal
  min_wake_interval: 1s      # floor for the scheduler's timer delay
envelopes:
  - id: default
    attack: 0s
    decay: 0s
    sustain: 1.0             # fraction of peak held while the note is on
    release: 30m             # time to fall from peak to zero
    impulse: false           # true = note-off immediately (momentary sensors)
groups:
  - id: house                # ^[a-z][a-z0-9_]*$, unique; entity ids derive from it
    name: House
    area: null               # HA area id → device suggested area
    mix: sum                 # sum | max | mean
    null_handling: zero      # zero | ignore (mean only)
    max_value: 5.0           # optional; inherits defaults
    precision: 1             # optional; inherits defaults
    stimuli:
      - entity: binary_sensor.front_door
        to: "on"             # trigger state(s); string or list
        gain: 1.0            # peak level (velocity)
        envelope: default    # preset; any envelope field may be overridden inline
        key: null            # required only when the same entity appears twice in a group
    children:
      - id: living_room
        gain: 1.0            # this subgroup's channel gain into the parent
        stimuli: [...]
```

## Development

```bash
uv sync
uv run pytest
uv run ruff check .
uv run mypy
```

## License

MIT
