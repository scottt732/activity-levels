# Activity Levels — Mixer Landing Page (Plan 5) — Design Spec

Date: 2026-08-26 · Status: approved in discussion, pending written review
Builds on: `2026-08-26-activity-levels-design.md` §6 (panel), `2026-08-26-patterns-and-simulation-design.md` (endpoints)
Decisions from the visual session: layout **D** (drill-down buses, three rows) and timeline **F** (overlay).

## 1. Purpose

A DAW-style landing page for *tuning* the configured tree: a timeline of history and
forecast on top, a mixer of the current bus's channels in the middle, and a controls row
for the selected strip at the bottom. Structure (adding/removing groups and stimuli)
stays in the existing Groups editor; the mixer edits parameters only.

## 2. Model → DAW mapping

| Config | Mixer |
|---|---|
| group | **bus**; shown as a strip among its parent's channels, and as the **MASTER** strip when it is the current bus |
| stimulus | **channel** strip (⚡) |
| stimulus `gain` / child group `gain` | the strip's **fader** (gain into the parent bus) |
| stimulus envelope (preset + overrides) | strip's envelope sketch + A/D/S/R in the controls row |
| group `mix` | master strip's mix selector (sum / max / mean) |
| group `max_value` | master strip's **limiter** ceiling |
| group level | strip **meter** (live) |
| `switch.<gid>_presence_simulation` | master strip's ⏻ (state from HA, toggled via the switch entity) |

Top level: root groups are buses. The initial view is the first root group as the current
bus, so its children (e.g. House / Garage / Outside) are the channels and the root itself
is the MASTER strip. With multiple roots, the breadcrumb starts with a root selector.

## 3. Layout (three rows; `narrow` stacks rows and shows ≤ 3 strips with horizontal scroll)

**Row 1 — Timeline** (`al-timeline`): the selected strip's series. Toolbar: range chips
24h / 7d / 30d; forecast chips off / 24h / 7d; toggles `channels` (faint child lines),
`lights` (bottom strip of light-on intervals; simulation plan faded); day-type shading
(weekend/holiday/calendar types) with a legend. Hover shows a tooltip with the value(s)
at that instant and the day type; a vertical cursor follows. "now" line. Forecast band
p25–p75 with p50 dashed. Data via `activity_levels/timeseries`; 5m resolution for 24h,
1h otherwise; refetch on range change and every 60 s when live.

**Row 2 — Mixer** (`al-mixer`): breadcrumb `Property › House › Downstairs` (each crumb
clickable; "⌃ up"). Strips for the current bus's channels in config order: sub-bus strips
(double border, "bus · n" tag, "open ▸" affordance) and stimulus strips (⚡, entity
friendly name, current entity state chip). Each strip: name, envelope sketch (resolved
envelope), fader (gain 0.1–10, log scale, drag or scroll; double-click resets to 1.0),
meter (live value / bus max), gated dot, error badge from validation. The **MASTER**
strip at the right: name in caps, mix selector, limiter (max_value, box input),
simulation ⏻ (hidden if the group has no lights), meter. Clicking a strip selects it
(timeline + controls follow); "open ▸" drills in; keyboard: ←/→ move selection, Enter
opens a bus, Backspace goes up.

**Row 3 — Controls** (`al-strip-controls`): for a selected **channel**: envelope preset
select, A/D/S/R sliders (duration sliders with log scale + numeric field), sustain,
impulse toggle, gain, `to` states, debounce, retrigger/unavailable; each override shows
"inherited from <preset>" and a reset. For a selected **bus** (sub-bus strip or MASTER):
name, mix, null handling (mean), limiter, precision, gain into parent (not for root),
lights summary (n lights, "manage in Groups"), simulation switch state + last 5 sim
actions, expected/anomaly now (from the sensors), "rebuild profile" button.

All edits go through the existing draft store (`al-change` with coalesce keys) and the
same Save/Discard toolbar; the mixer is a different view of the same config. Live state
(meters, entity chips) polls `activity_levels/state` while the mixer is visible
(existing Live toggle becomes always-on for this tab, 2 s).

## 4. Navigation and tabs

Tabs become: **Mixer** (default landing) · Groups · Envelopes · Defaults · Patterns (v1:
profile status, readiness per group, rebuild button, simulation log; the heatmap comes
later). The selection is shared between Mixer and Groups (selecting a strip selects the
same node in the tree and vice versa).

## 5. Components and data

- `al-mixer.ts`, `al-strip.ts`, `al-master-strip.ts`, `al-fader.ts` (pointer + keyboard,
  ARIA slider), `al-meter.ts`, `al-timeline.ts` (SVG, no chart library; ≤ 2,000 points),
  `al-strip-controls.ts`, `al-patterns.ts`, `timeseries.ts` (fetch/cache per group+range).
- The timeline draws with plain SVG paths; scales computed in `timeseries.ts` (pure,
  unit-tested: domain/range mapping, band polygon, day-type spans, decimation).
- State additions needed from the backend: `real_value` per group (excludes the trigger
  voice), `lights` count per group, expected/anomaly values — provided by Plan 4.

## 6. Accessibility and performance

Faders and sliders are `role="slider"` with arrow-key steps; strips are focusable with
roving tabindex; timeline tooltip is also readable via keyboard cursor (←/→ move the
cursor by one sample). Re-render cost: the timeline memoises paths on `(series, range,
size)`; live meters update via a single `state` poll per 2 s.

## 7. Testing

vitest: timeline scale/decimation math; fader value↔position mapping incl. log scale;
mixer breadcrumb/drill navigation reducer; strip→config change mapping (gain, mix,
limiter) produce new Config via store ops; keyboard navigation; timeline tooltip index
lookup. Manual: Chrome against the real instance for look/feel (the visual companion
mockups are the reference).

## 8. Out of scope (later)

Drag-and-drop reorder; solo/mute (a "mute" would map to disabling a stimulus — needs a
config flag first); pattern heatmap; per-strip automation lanes.
