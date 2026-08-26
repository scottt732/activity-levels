# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Saving from the panel no longer refreshes the whole UI: the sidebar panel stays registered across integration reloads and is removed only when the integration is deleted.

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
  profile/timeseries websocket API.
