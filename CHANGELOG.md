# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
