# Mixer v2: flat track row, value faders, mute/reset, live timeline

Status: approved 2026-08-27 (user feedback on the first mixer landing page).
Supersedes the bus/drill-down navigation in `2026-08-26-mixer-ui-design.md`; everything
else in that spec stands.

## Feedback being addressed

1. The timeline does not refresh when a value changes.
2. The "bus · N" line under a group strip leans on DAW jargon; drop it.
3. The strip fader shows *gain*; it should show the group's **current value** vertically,
   let the user drag it to **override** the level (simulate stimuli; it cools down from
   there), show the current value below it (e.g. `4.3`), and add **Mute** and **Reset**
   buttons under the fader.
4. Drill-down navigation is rough. Make it one row with every group in it, Ableton
   track-group style: groups with children expand/collapse in place, the root is expanded
   by default, the left-most track is the root (Property), the row scrolls horizontally.
5. "Expected" in the status panel ignores the group's precision.

## Design

### Row model (frontend, pure)

`navigation.ts` is rewritten around `expanded: Set<string>` (group ids) instead of a bus
path. The visible track list is the pre-order walk of `config.groups`, descending into a
group's `children` only when its id is in `expanded`. Initial state: every root expanded,
selection = first root. Actions: `toggle(id)`, `select(path | null)`, `arrow(±1)` over the
visible list (wraps), `home`/`end`, `sync(config)` (drop ids that no longer exist; keep
the selection if it still resolves, else fall back to the first root). Enter/Space on a
strip toggles expansion; Left/Right move; Home/End jump. Expansion state is remembered per
browser (`localStorage`, best effort, wrapped in try/catch) so the row reopens the way it
was left.

Only **groups** are tracks. A group's stimuli are edited in its controls row (the same
group editor the Groups tab uses, stimuli section included), not as strips.

### Strip (al-strip)

Top to bottom: depth marker (a left border whose inset/colour steps with depth, so
children read as nested under their parent) + name; a chevron button (`▸`/`▾` with the
child count) only when the group has children; **value fader** (vertical; scale
0…`max_value` of the group; the fill is the live value; a thin tick marks `real_value` when
it differs from `value` — i.e. while simulated); readout below the fader formatted with the
group's precision; then two small toggle-style buttons: **Mute** (`M`, highlighted while
muted) and **Reset** (`R`). No envelope sketch, no A/D/S/R hint, no "bus · N" sublabel, no
gain fader (gain lives in the controls row). Error badge stays. Selection/roving-tabindex
rules from the previous spec stay: inner controls are focusable only when the strip is
selected.

Dragging the value fader dispatches `al-level-override {value}` on pointer-up (and on
keyboard arrow steps, debounced 250 ms); it never edits the config draft. The fader shows
the dragged value while dragging and snaps back to the live value on the next live frame.

### Master strip

Unchanged in content (mix, limiter, presence simulation switch, precision/lights line) but
it follows the **selected** group rather than the "current bus". With nothing selected it
renders empty.

### Backend

- **Mute**: `Channel.muted: bool` (engine). A muted channel contributes 0 (and no slope) to
  its parent's mix, in every mix mode (`mean` also drops it from the denominator, the same
  way `null_handling: ignore` drops nulls); its own group still computes and publishes its
  own value, so the room's sensor keeps working while the house ignores it. Muting a root
  is allowed and a no-op. State is runtime, per group id, kept by the coordinator and
  persisted in its Store alongside voice snapshots; survives restarts and config reloads.
  Exposed as `switch.<group>_mute` (per-group device, entity category config) and as
  websocket `activity_levels/mute {group_id, muted}`. `LiveState.groups[id].muted` reports it.
- **Level override**: `coordinator.set_level(group_id, value)` sizes the group's built-in
  trigger voice (impulse, `release` from defaults) so the group's raw mix equals `value`
  given the current contributions of everything else (`Group.value_at_excluding`): `sum` →
  peak = value − others; `max` → peak = value (a target below the others cannot be reached:
  return the resulting value and let the UI show it); `mean` → peak = value·N − Σothers
  where N is the number of contributing channels including the trigger channel. Peak is
  clamped to `[0, max_value]`; a non-positive peak resets the trigger voice instead.
  Websocket `activity_levels/level/set {group_id, value}` → `{value}` (the level actually
  reached). A `set_level` service with the same fields is registered for automations.
- **Reset**: websocket `activity_levels/reset {group_id}` → existing `coordinator.reset`.
- All three commands require admin, like `config/save`.

### Timeline

`al-timeline` draws a **live tail**: a segment from the last recorded sample of the selected
group to (`live.now`, `live.groups[id].value`), updated on every live frame with no
refetch. When the live value of the selected group changes by more than the display
precision, a refetch is scheduled 10 s later (coalesced), so the recorded history catches
up with what the tail already showed.

### Precision

The status panel formats **Expected** (and any other level it prints) with the group's
`precision`, using the same helper the strips use.

## Out of scope

Stimulus strips, per-stimulus overrides, reordering tracks by drag, solo.
