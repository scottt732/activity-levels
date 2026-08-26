# Activity Levels — Patterns & Presence Simulation (Plan 4) — Design Spec

Date: 2026-08-26 · Status: approved in discussion, pending written review
Builds on: `2026-08-25-activity-levels-design.md` (engine, integration, panel)
Companion: `2026-08-26-mixer-ui-design.md` (Plan 5 consumes the endpoints defined here)

## 1. Purpose

Learn what "normal" activity looks like for every group — by time of day, day of week,
holidays and user-defined calendars (school year, vacation) — and expose it as:

1. per-group **expected activity** and **anomaly** sensors,
2. a **presence simulation** that drives the group's lights with a freshly sampled,
   plausible plan while the house is away,
3. time-series endpoints (history + forecast) for the mixer UI.

The learned artifact is a model-agnostic **profile document**. The built-in learner is a
numpy ridge regression with Fourier seasonality (Prophet's model without Stan); a future
external producer (an add-on running Prophet/Pyro on a full toolchain) writes the same
document through a websocket command and is otherwise indistinguishable.

## 2. Goals and non-goals

Goals: numpy-only dependencies (HA core pins `numpy==2.3.2`); nightly retraining in the
executor; ≥14 days of data before a group is "ready"; lights-only simulation in v1;
everything gated so simulation can never act while someone is home or a group has real
activity; profile producer/version visible to the user.

Non-goals (v1): controlling non-light entities; weather/sunset features (v2); per-person
models; cloud anything; scipy/statsmodels/torch.

## 3. Configuration additions

```yaml
defaults:
  patterns:
    rebuild_time: "03:00"          # local time, daily
    history_days: 180              # how much light history to keep and train on
    min_days: 14                   # group readiness threshold
    calendars:                     # named day types driven by calendar entities
      - id: school_year            # ^[a-z][a-z0-9_]*$
        entity: calendar.school_year
      - id: vacation
        entity: calendar.family_vacation
    day_type_precedence: [vacation, holiday, school_year, weekend, weekday]
    workday_entity: binary_sensor.workday_sensor   # optional; defines 'holiday' when off on a weekday
  simulation:
    away_entity: binary_sensor.nobody_home  # required to enable simulation; on == away
    quiet_hours: ["01:00", "05:30"]         # never switch lights on inside this window
groups:
  - id: living_room
    simulation:
      lights:
        include: [light.floor_lamp]         # added to the area's lights
        exclude: [light.closet]             # removed from the area's lights
      enabled: true                          # default true; false hides the switch
```

Validation: calendar ids unique and referenced entities are `calendar.*`; `away_entity`
must exist at setup (warn, not fail, if missing — simulation just stays disabled);
`quiet_hours` are `HH:MM`.

Light membership for a group = (light entities whose device/entity area equals the
group's `area`) ∪ `include` − `exclude`, resolved from the entity/device registries at
setup and whenever registries change. Groups without an area and without `include` have
no lights and no simulation switch.

## 4. Data

### 4.1 Activity history
Source: HA long-term statistics for `sensor.<gid>_activity_level` (hourly `mean`, `max`),
fetched with `recorder.statistics_during_period` (`hass.async_add_executor_job` around
the recorder's `statistics_during_period`). Not stored by us. For the last 24 h the
timeline endpoint also serves 5-minute samples from the recorder's raw history so the
"now" edge is sharp.

### 4.2 Light history (own store)
The coordinator subscribes to `state_changed` for the union of all groups' lights and
appends `(t, entity_id, on: bool, brightness: int|None)` transitions to
`Store("activity_levels.lights.<entry_id>")`, batched via `async_delay_save`. Retention
`history_days`; older rows are dropped nightly. On first setup it back-fills from the
recorder's available history (≤ purge_keep_days).

### 4.3 Day-type labelling
`day_type(date) -> str` (pure): evaluate `calendars` (a calendar has an event covering the
date → its id applies), `holiday` (workday entity off on Mon–Fri; if no workday entity,
never), `weekend` (Sat/Sun), else `weekday`; pick the first present in
`day_type_precedence`. Calendar history is read via `calendar.get_events` for the training
window (executor); results cached per date in the profile store.

## 5. Model (built-in producer)

Per group, target `y_h` = hourly mean activity level for the training window (≤
`history_days`). Design matrix columns:

- intercept, linear trend (days since start, scaled),
- daily Fourier terms `sin/cos(2πk·hour/24)`, k = 1..4,
- weekly Fourier terms `sin/cos(2πk·dow_hour/168)`, k = 1..3,
- day-type one-hots (excluding the base) and their interactions with the daily terms,
- calendar dummies already covered by day types; nothing else.

Fit: ridge regression (`λ` = 1.0 on all non-intercept columns) via
`numpy.linalg.solve` on the normal equations. Prediction is evaluated for every
`(day_type, 15-min slot)` bucket by averaging predictions over the training window's
timestamps that fall in that bucket (so weekly terms are integrated out) → `p50`; clamp to
`[0, max_value]`. Bands: residuals grouped by `(day_type, hour)` → empirical p25/p75
offsets added to p50 (fallback to the group-wide residual quantiles when a bucket has
< 20 samples). Readiness: ≥ `min_days` distinct days with data.

Lights: per light and `(day_type, slot)`: `P(on)` = (on-minutes + 1) / (minutes observed +
2) (Laplace); `on_starts`/`off_starts` = empirical distributions (as sorted minute-of-day
lists, capped at 200) of switch-on / switch-off times per day type; `brightness` = median
brightness when on (None if unknown).

Anomaly score now: `a = actual − p50`, normalised: if actual > p75, `(actual−p75)/(p75−p50+ε)`;
if actual < p25, `(actual−p25)/(p50−p25+ε)`; else 0. Positive = more active than usual.

## 6. Profile document (the contract)

```json
{
  "version": 1,
  "producer": {"name": "builtin", "version": "0.1.0"},
  "generated_at": 1787800000.0,
  "training_window": [1772000000.0, 1787800000.0],
  "day_types": ["weekday", "weekend", "holiday", "school_year", "vacation"],
  "slot_minutes": 15,
  "groups": {
    "living_room": {
      "ready": true,
      "days": 91,
      "expected": {"weekday": [[p25, p50, p75], ...96], "weekend": [...]},
      "lights": {
        "light.living_room": {
          "p_on": {"weekday": [...96], ...},
          "on_starts": {"weekday": [minutes...]}, "off_starts": {...},
          "brightness": 180
        }
      }
    }
  }
}
```

Stored in `Store("activity_levels.profile.<entry_id>")`. Any producer may replace it via
`activity_levels/profile/save`; the document is validated against a voluptuous schema
(shape, slot count, value ranges) before acceptance. The built-in learner runs at
`rebuild_time` and after `activity_levels.rebuild_profile`; it never overwrites a profile
whose `producer.name != "builtin"` unless the service is called with `force: true`.

## 7. Entities and services

Per group (device = the group's device):
- `sensor.<gid>_expected_activity` — `p50` for the current bucket; attributes `p25`, `p75`,
  `day_type`, `ready`, `producer`.
- `sensor.<gid>_activity_anomaly` — signed score (§5); `unknown` until ready.
- `switch.<gid>_presence_simulation` — only if the group has lights and `enabled`.
- Global `switch.activity_levels_presence_simulation` on the integration's hub device
  (new: a hub device "Activity Levels" is created; group devices get `via_device` to it).
- Diagnostic `sensor.activity_levels_profile` — state = `generated_at` (timestamp),
  attributes `producer`, `groups_ready`, `groups_total`.

Expected/anomaly sensors update on the coordinator's existing per-group publishes plus a
15-minute timer (bucket change).

Services: `activity_levels.rebuild_profile` (optional `force`), `activity_levels.simulate_now`
(`group_id`; samples and starts a plan immediately, for testing).

## 8. Simulation engine

Runs per group. Preconditions, all required: global switch on, group switch on,
`away_entity` is `on`, and the group's real level (stimuli only; the coordinator exposes
`real_value` = value excluding the trigger voice) is 0. When any precondition drops, the
plan is cancelled (lights are left as they are — no "restore", to avoid fighting the
returning occupant).

Planning: at activation and at each local midnight, sample a plan for the next 24 h from
the group's light profile: for each light, walk 15-min slots; when `P(on)` for the current
day type exceeds a uniform draw and the light is off, schedule ON at a time drawn from
`on_starts` near that slot (± 20 min jitter, respecting `quiet_hours`); when on and `P(on)`
falls below the draw, schedule OFF from `off_starts` similarly. Plans are executed with
`light.turn_on` (brightness from profile) / `light.turn_off`. Each action is logged to
`Store("activity_levels.simlog.<entry_id>")` (last 500) and surfaced via websocket for the
UI.

## 9. Websocket API additions (admin)

- `activity_levels/profile/get` → the document (+ `ready` summary).
- `activity_levels/profile/save` `{profile}` → validates, stores, republishes sensors.
- `activity_levels/profile/rebuild` → runs the built-in learner now (async response).
- `activity_levels/timeseries` `{group_id, start, end, resolution: "5m"|"1h", include_children: bool, forecast_until}` →
  `{series: {gid: [[t, value], ...]}, forecast: {t0, step, p25: [...], p50: [...], p75: [...]}, day_types: [[start, end, type], ...], lights: {entity: [[on_t, off_t], ...]}, plan: [[on_t, off_t, entity], ...]}`.
  History comes from LTS (1h) or recorder (5m ≤ 24 h); forecast from the profile.
- `activity_levels/simulation/log` `{group_id?}` → recent actions.

## 10. Testing

Pure: day-type labelling; model recovers synthetic daily+weekly seasonality and a holiday
shift (RMSE bound); bands cover ~50% of synthetic residuals; readiness guard; light `P(on)`
and transition sampling with a seeded RNG (deterministic plans); profile schema
round-trip and rejection of malformed documents; anomaly score cases.
Integration: entities appear/hide per config; nightly rebuild scheduled and runs in the
executor; simulation preconditions (each one toggled) with a frozen clock and `light.*`
service calls asserted; `profile/save` from a fake external producer is honoured and not
overwritten by the nightly job; timeseries endpoint shapes.

## 11. Implementation order

1. Config schema + day-type labelling + light membership resolution.
2. Light-history store + back-fill.
3. Model + profile document + schema + store + rebuild scheduling.
4. Expected/anomaly sensors + hub device + profile diagnostic.
5. Simulation engine + switches + services + log.
6. Websocket: profile/*, timeseries, simulation/log.
