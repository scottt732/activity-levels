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
4. Open **Activity Levels** in the sidebar to configure it (see [The panel](#the-panel)).
   Everything the panel edits is also reachable over the websocket API — the
   `activity_levels/config/get`, `config/validate` and `config/save` commands take and
   return the [configuration reference](#configuration-reference) shape.

## The panel

The sidebar entry opens an admin-only editor for the whole configuration, landing on a
DAW-style **Mixer**.

### Mixer

Three rows, stacked, for tuning the tree that's already there — adding, removing or
moving groups and stimuli is done in **Groups** (below), not here:

1. **Timeline** — the selected strip's history and forecast, overlaid on one chart.
   Range chips (`24h` / `7d` / `30d`) and forecast chips (`off` / `24h` / `7d`) pick the
   window; toggles turn the faint child-group lines and the light-history strip on and
   off. Day types (weekday, weekend, holiday, any configured calendar) are shaded, with a
   legend; a light-yellow band under the chart is history solid and the presence-
   simulation plan faded. Hovering shows the value(s) at that instant and the day type; a
   "now" line marks the present. The forecast chips are disabled, with a
   "learning… *n*/14 days" hint in their place, until the pattern profile has actually
   seen the selected group — the history half of the chart is unaffected either way.
2. **Mixer** — a breadcrumb (`Property › House › Downstairs`, each crumb clickable, plus
   "⌃ up") over the current bus's channels, drawn as console strips. The current bus
   itself is the **MASTER** strip, at the right of the row:

   | Config | Mixer |
   | --- | --- |
   | a stimulus | a channel strip (⚡), showing the entity's current state |
   | a child group | a bus strip (▤, double border), with an "open ▸" to drill in |
   | stimulus/child-group `gain` | the strip's **fader** — gain into the parent bus |
   | envelope (preset + overrides) | the strip's envelope sketch and A/D/S/R hint |
   | group `mix` | the MASTER strip's mix selector (`sum` / `max` / `mean`) |
   | group `max_value` | the MASTER strip's **limiter** ceiling |
   | group level | every strip's **meter**, live |
   | `switch.<gid>_presence_simulation` | the MASTER strip's ⏻ — hidden if the group has no lights |

   Clicking a strip selects it (the timeline and the controls row below follow);
   clicking "open ▸" drills into a bus instead. A root group is a top-level bus; with
   more than one, the breadcrumb starts with a root selector.
3. **Controls** — everything about the selected strip that doesn't fit on it. For a
   channel: the envelope preset, A/D/S/R, sustain, impulse, gain, trigger (`to`) states
   and debounce, each override showing what preset it falls back to and a reset. For a
   bus, including the MASTER: name, mix, null handling, limiter, precision, gain into its
   parent (buses only, not the root), how many lights it owns, its presence-simulation
   switch and the last few things it has done, the expected/anomaly readings, and a
   "rebuild profile" button.

Keyboard, in the mixer row: **←/→** moves the selection across the channel strips and the
MASTER (wrapping), **Enter** opens the selected bus, **Backspace** goes up one bus,
**Home**/**End** jump to the first channel or the MASTER. In the timeline: **←/→** move a
cursor one sample at a time — the tooltip without a mouse — and **Esc** clears it.

Groups, Envelopes and Defaults edit the same draft as the Mixer and share its selection —
picking a strip here also opens it in Groups, and back:

- **Groups** — the structure editor: the tree of groups on the left, the editor for
  whatever you select on the right. Each group row can add a stimulus, add a child group,
  move itself among its siblings, or delete itself and everything under it. A red badge
  on a row counts the validation problems inside it.
- **Envelopes** — the preset library, with a sketch of the selected preset's ADSR shape.
  Renaming a preset rewrites every stimulus and default that names it; a preset something
  still points at cannot be deleted until those references move.
- **Defaults** — the site-wide fallbacks every group, preset and stimulus inherits from.
- **Patterns** — the pattern profile's status (trained or still learning, when it was
  generated, the window it learned from), a readiness table per group (ready or not, days
  learned, the expected-activity sensor's current reading), which groups presence
  simulation is currently blocked on and why, the simulation log, and a "rebuild profile"
  button with a "force" switch for overwriting a profile an external producer owns.

Edits are held as a draft: **Undo**/**Redo** walk it, **Discard** throws it away, and
**Save** validates first — problems come back attached to the fields that caused them —
then writes the configuration and reloads the integration, which re-creates entities and
restores their state. Meters and entity chips poll the engine every two seconds while the
Mixer tab is open; the **Live** switch on the other tabs does the same for the tree and
the stimulus editor, and pauses while a save is in flight and while the browser tab is in
the background.

### Known limitations

- Reordering is done with the up/down buttons on each row; there is no drag and drop.
- A group's `area` is applied when its device is first created, so changing it later does
  not move an existing device.
- Renaming a group's `id` re-creates that group's entities under the new id; history from
  the old entities is not carried over.
- On a cold page load the panel can report that some Home Assistant UI components did not
  load. Home Assistant registers them lazily; visiting **Settings → Devices & services**
  once and reloading the page is enough to bring them in.
- The timeline charts a group's own series; a channel strip has no series of its own, so
  selecting one charts the bus it belongs to.
- A forecast's day types for days beyond today are provisional: they fall back to a plain
  weekday/weekend guess rather than checking configured calendars, which are only
  resolved as those days actually arrive.
- A group's forecast is unavailable — its chips disabled, with a "learning… *n*/14 days"
  hint in their place — until its pattern profile has at least `patterns.min_days` (14 by
  default) of history behind it.

## Entities

Each configured group produces:

| Entity | Description |
| --- | --- |
| `sensor.<id>_activity_level` | The group's mixed, limited activity level. Attributes: `mix`, `max_value`, `gated`, `active_voices`, `cooldown_at`, `contributors`. |
| `binary_sensor.<id>_active` | On while the group's activity level is above zero. |
| `sensor.<id>_last_activity` | Diagnostic: timestamp of the group's most recent note-on. |
| `sensor.<id>_cooldown_at` | Diagnostic: when the group's release/cooldown is expected to finish. |
| `button.<id>_trigger` | Diagnostic: manually fires the group's synthetic trigger voice. |
| `sensor.<id>_expected_activity` | The level the profile expects right now. Attributes: `p25`, `p75`, `day_type`, `ready`, `producer`. `unknown` until the group is ready. |
| `sensor.<id>_activity_anomaly` | How far today's real level sits outside that band, signed. `unknown` until the group is ready. |
| `switch.<id>_presence_simulation` | Arms presence simulation for the group. Only created when the group has lights and its `simulation.enabled` is true. |

And once, on the **Activity Levels** hub device:

| Entity | Description |
| --- | --- |
| `switch.activity_levels_presence_simulation` | The master arm for presence simulation. |
| `sensor.activity_levels_profile` | Diagnostic: when the profile was generated. Attributes: `producer`, `producer_version`, `groups_ready`, `groups_total`, `trained`, `ready`. |

## Services

- `activity_levels.trigger` — manually fire a synthetic note-on. Fields: `group_id`
  (required), `peak` (optional, defaults to 1.0).
- `activity_levels.reset` — clear all active voices back to idle. Fields: `group_id`
  (optional; omit to reset every group).
- `activity_levels.rebuild_profile` — refit the learned profile now instead of waiting for
  `rebuild_time`. Fields: `force` (optional; required to overwrite a profile that belongs
  to an external producer).
- `activity_levels.simulate_now` — sample and start a presence-simulation plan for one
  group immediately, ignoring the switches. Fields: `group_id` (required). If a hard
  precondition still fails it raises with the reason rather than doing nothing quietly.

## Patterns & presence simulation

Activity Levels learns what a normal day looks like for each group, and can replay that
shape through the group's lights while nobody is home.

**What it learns, and from where.** Once a day at `rebuild_time` (03:00 by default) the
integration reads `history_days` of hourly long-term statistics for each
`sensor.<id>_activity_level` — so the learner needs the **recorder** — plus the group's own
light on/off history. It fits, per group and per day type, a 96-slot curve of the expected
level (`p25`/`p50`/`p75` for each 15 minutes) and, per light, the probability of it being
on in each slot together with the times it usually goes on and off. A group needs at least
`min_days` (14) distinct days of history before it is marked **ready**; until then its
expected and anomaly sensors stay `unknown` and it is never simulated.

**Day types.** Every day is labelled by the first rule in `day_type_precedence` that
matches: any configured calendar whose events cover the day (school holidays, a vacation,
whatever you point it at), then `holiday`, `weekend` or `weekday`. A `workday_entity` (the
Workday integration's binary sensor) overrides the weekday/weekend guess when present.
Each calendar you list under `patterns.calendars` becomes a day type of its own, so a
vacation week is learned separately from an ordinary one.

**Presence simulation.** A group is simulated only while **every** one of these holds:

| Precondition | Where it comes from |
| --- | --- |
| the master switch is on | `switch.activity_levels_presence_simulation` |
| the group's own switch is on | `switch.<id>_presence_simulation` |
| the group is not opted out | `simulation.enabled` in its config |
| the group owns at least one light | its `area`, plus `simulation.lights.include`/`exclude` |
| an `away_entity` is configured, and is `on` | `defaults.simulation.away_entity` |
| the group's *real* level is exactly zero | its stimuli, ignoring `activity_levels.trigger` |
| the group's profile is ready | `min_days` of history behind it |

Home Assistant also has to be running, plus a minute to settle: at startup the switches
restore before the rest of the house has published a state, and an occupied house that
has not finished loading looks exactly like an empty one.

When any precondition drops, the plan is cancelled and the lights are left exactly where
they are: somebody just came home, and fighting them for the switch is not a feature.
`quiet_hours` suppresses switch-**on** actions only — an off is always planned, so a light
is never left stranded on by a window that opened around it. Every executed action is
written to a rolling log of the last 500, readable from the panel.

Three things worth knowing:

- **A child's trigger button counts as real activity for its parents.** `real_value` drops
  the group's *own* synthetic trigger voice, not its children's, so pressing the kitchen's
  test button cancels any simulation running on the house above it.
- **Do not use a group's own lights as its stimuli.** The simulation switching a light on
  would raise the group's real level, which cancels the simulation — a loop that stops
  itself a second after it starts.
- **Renaming `sensor.<id>_activity_level` is supported.** The learner asks the entity
  registry where the sensor lives now, so its long-term statistics are followed rather
  than lost. Excluding it from the recorder is what breaks learning; a rebuild warns,
  naming the statistic id it found nothing for.

**Plugging in your own producer.** The profile is a plain document, and any producer may
replace it over the websocket API with `activity_levels/profile/save {profile}` — it is
validated (shape, 96 slots per curve, value ranges) and rejected with a path per problem,
exactly like a config save. The built-in learner will not overwrite a document whose
`producer.name` is not `builtin` unless `rebuild_profile` is called with `force: true`.
The shape:

```jsonc
{
  "version": 1,
  "producer": {"name": "my-forecaster", "version": "1.0.0"},
  "generated_at": 1787800000.0,          // epoch seconds
  "training_window": [1772000000.0, 1787800000.0],
  "day_types": ["vacation", "holiday", "weekend", "weekday"],
  "slot_minutes": 15,                     // fixed: 96 slots a day
  "groups": {
    "living_room": {
      "ready": true,
      "days": 91,                         // distinct days behind the fit
      "expected": {"weekday": [[0.2, 1.1, 2.4], "...96 [p25, p50, p75] triples"]},
      "lights": {
        "light.living_room": {
          "p_on": {"weekday": ["...96 probabilities in [0, 1]"]},
          "on_starts": {"weekday": [1080, 1095]},   // minutes past local midnight
          "off_starts": {"weekday": [1380]},
          "brightness": 180                          // or null
        }
      }
    }
  }
}
```

`activity_levels/profile/get` returns the stored document alongside `ready` (per group)
and `trained`, and `activity_levels/timeseries` serves history, forecast, day-type spans
and light/plan intervals for one group. Both are admin-only, like the rest of the API.

## Configuration reference

Durations accept `30s`, `5m`, `2h`, `1d`, `HH:MM:SS`, or a plain number of seconds.

Renaming a group's `id` creates new entities (history is not carried over); `area` is
applied only when a group's device is first created.

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
  patterns:
    rebuild_time: "03:00"    # local time the nightly refit runs
    history_days: 180        # how much long-term history each refit reads (30–730)
    min_days: 14             # distinct days a group needs before it is ready (3–90)
    calendars: []            # - {id: vacation, entity: calendar.school_holidays}
    day_type_precedence: null # defaults to [<calendar ids…>, holiday, weekend, weekday]
    workday_entity: null     # binary_sensor from the Workday integration, if you have one
  simulation:
    away_entity: null        # binary_sensor that is `on` when the house is empty
    quiet_hours: ["01:00", "05:30"]  # no lights switched *on* in this window; null to disable
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
    simulation:
      enabled: true          # false = no presence-simulation switch for this group
      lights:
        include: []          # extra lights beyond the ones in the group's area
        exclude: []          # lights in the area to leave out
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

The panel lives in [`frontend/`](frontend/README.md), which covers `pnpm dev` against a
running Home Assistant and why the built bundle is committed.

## License

MIT
