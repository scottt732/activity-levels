# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Saving from the panel no longer refreshes the whole UI: the sidebar panel stays registered across integration reloads and is removed only when the integration is deleted.
- A light going `unavailable`, or Home Assistant restarting, is recorded as *unknown*
  rather than as the light being switched off. The gap closes any open interval, is left
  out of that light's observed minutes, and produces no learned switch-on or switch-off
  times, so restarts no longer teach the profile a nightly habit.
- Long-term statistics are located through the entity registry, so renaming a group's
  `sensor.<id>_activity_level` no longer hides its history from the learner. A rebuild
  that finds no rows for a group warns, naming the statistic id it looked for.
- Presence simulation waits for Home Assistant to be running, plus a minute to settle,
  before driving anything: restored switches used to arm while the away entity and every
  stimulus were still unavailable, which reads as an empty, quiet house.
- Light membership follows the entity and device registries, so a light added, moved or
  removed after setup joins or leaves its group without a reload. The group's switch is
  created by the switch platform at setup and still needs one; that is logged.
- `plan_for` no longer reports actions the clock had already passed when the plan was
  sampled, and a plan forced by `simulate_now` expires at midnight instead of overriding
  the switches for a second day.
- Forecasts are capped at 2000 points: a request past the cap comes back truncated and
  says so, and the day-type ribbon stops where the forecast does.
- The light log batches its writes over five minutes instead of ten seconds, and prunes
  to `history_days` when it is loaded as well as nightly.
- A rebuild that waited out a concurrent one reports success rather than "declined".
- An empty `day_type_precedence` is rejected instead of validating into a configuration
  that can never label a day.

### Added

- **Engine** — an ADSR voice/group mixer with per-voice attack, decay, sustain and
  release, retrigger and unavailable policies, debounce, impulse voices, and groups
  that mix their channels with `sum`, `max` or `mean` under a per-group limiter.
  Groups expose their display value, the next instant that value can change, active
  voice counts, cooldown projections and per-channel contributions.
- **Integration layer** — config entry with the whole configuration held in options,
  a validating and normalizing schema with path-addressed errors, a device per group
  wired up via `via_device`, per-group `sensor`, `binary_sensor` and `button`
  entities, the `activity_levels.trigger` and `activity_levels.reset` services,
  state restored across restarts, and diagnostics.
- **Websocket API** — `activity_levels/config/get`, `config/validate`,
  `config/save` and `state` for the sidebar panel, all admin-only.
- **Panel** — sidebar panel for editing groups, stimuli, envelopes and defaults; live
  view. Edits are a draft with undo, redo and discard; saving validates first and shows
  problems on the fields that caused them, then reloads the integration. The live view
  overlays each group's level and gate, and each voice's envelope phase and countdown,
  onto the tree and the stimulus editor.
- **Patterns** — learned expected-activity/anomaly sensors, presence simulation switches,
  profile/timeseries websocket API. The live state reports how many lights each group
  owns, so the panel can tell "cannot be simulated" from "not armed".
- **Mixer landing page** (timeline, drill-down mixer, controls), Patterns tab — the panel
  now opens on a DAW-style Mixer: a timeline of history and forecast for the selected
  strip, a drill-down mixer of channel and bus strips with faders, meters and a MASTER
  strip (mix, limiter, presence-simulation switch), and a controls row for whatever is
  selected. Groups remains the structure editor and shares its selection with the Mixer.
  A new Patterns tab shows profile status, per-group readiness and the simulation log.
