# Stimulus modes, real state pickers, and entity icons

Status: approved in conversation 2026-09-01. Builds on the group kinds / tree / paneled
editor spec (2026-08-28).

## Goals

1. A stimulus gets a **mode**. `sustained` is what every stimulus does today: hold a note
   while the entity sits in its active states. `momentary` treats each crossing as an
   event instead — a knock, not a hold — which is what an interior door is. An exterior
   door held open still wants `sustained`; the same door used as a "somebody walked
   through here" signal wants `momentary`.
2. A momentary stimulus says **which crossings count**: entering the active states,
   leaving them, or both. An exterior door that only matters when it opens is one
   checkbox.
3. **Active states** stops being an open-ended text field. It becomes a multi-select of
   the states that entity can really be in, labelled the way Home Assistant labels them —
   `Open` and `Closed`, not `on` and `off`.
4. A stimulus row shows **the entity's own icon and its formatted state**, instead of a
   generic lightning bolt beside the raw string `on`.

## 1. Model

`to` keeps its exact meaning: the states in which this entity is active. Two new keys sit
beside it.

```yaml
stimuli:
  - entity: binary_sensor.basement_hallway_door
    to: [on]                  # unchanged: which states are "active"
    mode: momentary           # sustained (default) | momentary
    edges: [enter, leave]     # which crossings fire; at least one
```

- `mode` ∈ `sustained | momentary`, default `sustained`.
- `edges` ⊆ `enter | leave`, default `[enter, leave]`, minimum length 1. `enter` is a
  transition into the active states, `leave` is a transition out of them.

Both live in `const.py` as plain tuples validated by `vol.In`, the way `CONNECTIONS` and
`KINDS` already are — `MODES = (MODE_SUSTAINED, MODE_MOMENTARY)` and
`EDGES = (EDGE_ENTER, EDGE_LEAVE)`, with the members named individually so the
coordinator compares against a constant rather than a bare string.

That shape is deliberate: `schema_json.py` already translates `vol.In` into a JSON Schema
`enum`, so the published `config.schema.json` picks both keys up with no new translation
rule, and neither key is an engine concept that would earn a `StrEnum` in
`engine/envelope.py`.

`edges` is **inert under `sustained` rather than rejected**. The panel's mode radio would
otherwise have to delete and restore the key as the user flips back and forth, and a
document that will not save because of a field the form is not showing is a bad trade for
a rule nothing depends on.

### Migration

There is none, and that is the point. A document written before this change has no `mode`,
so it validates to `sustained` and behaves exactly as it did. `to` is untouched. Nothing
in the panel shows a migration banner and nothing needs a confirming save.

### Why `to` survives

Dropping `to` for an invert checkbox was considered and rejected. `to` is not always `on`:
a `media_player` stimulus is `to: [playing]`, a `device_tracker` is `to: [home]`, and a
template sensor can be anything. An invert checkbox covers binary sensors and silently
breaks the rest. `to` also turns out to be what gives a momentary edge its *direction* —
"enter" and "leave" are only meaningful relative to a set — so one field now serves both
modes instead of each mode inventing its own.

## 2. Backend

### Tree

`VoiceRef` gains `mode: str` and `edges: frozenset[str]`, read straight off the validated
stimulus in `build()`.

A momentary stimulus is built with `dataclasses.replace(envelope, impulse=True)`, whatever
its preset says. The force happens once, at tree-build time. The engine is untouched, its
time contract is unaffected, and there is no reachable configuration in which a momentary
trigger latches with nothing to release it — because a momentary source only ever calls
`note_on`, and `Voice.note_on` on a non-impulse envelope sets `gate = True` and holds at
sustain forever (`engine/voice.py:164`).

### Coordinator

`_apply_transition` grows one branch ahead of the existing sustained logic:

```python
if ref.mode == MODE_MOMENTARY:
    if new_in and not old_in and EDGE_ENTER in ref.edges:
        return voice.note_on(t)
    if old_in and not new_in and EDGE_LEAVE in ref.edges:
        return voice.note_on(t)
    return False
```

The sustained path is unchanged. Two details follow from it:

- **Unavailability is inert.** An impulse voice has `gate = False` always, so
  `voice.unavailable(t)` → `note_off(t)` returns immediately. The existing branch would
  still report `True` and force a republish for a stimulus that cannot have moved, so
  momentary returns `False` there.
- **Restart is already safe.** `_reconcile` guards its `note_on` with
  `and not ref.voice.envelope.impulse`, and both of its `note_off` branches require
  `ref.voice.gate`, which an impulse voice never sets. Forcing impulse therefore skips
  momentary stimuli at startup for free — no code change, but a test pins it, because
  without that property every momentary door in the house would fire once on every Home
  Assistant restart.

## 3. The stimulus form

### Active states

The free-text box becomes a multi-select. A new pure module `frontend/src/entity-states.ts`
answers "what states can this entity be in, and what are they called":

- Candidates come from a small domain and device-class table — `binary_sensor` by device
  class, plus `media_player`, `device_tracker`, `cover`, `lock`, `person` and the other
  handful worth naming.
- Labels come from `hass.localize`, falling back to the raw state, so the panel spells a
  door the way the more-info dialog does.
- The candidate list is always unioned with the entity's **current** state and whatever
  `to` already holds, so an entity the table does not know still offers something usable
  and a configured value is never silently dropped from the list that contains it.
- The selector keeps `custom_value: true`. An exotic entity can still be typed at; the
  field just stops *asking* to be typed at.

`toText`, `toTextMatches` and the `formatToList`/`parseToList` round trip come out of
`stimulus-form.ts` and `al-stimulus-editor.ts`. An array selector hands back an array, so
the raw-text shadow state that existed to survive a lossy mid-word format has nothing left
to protect.

### Mode and edges

```
Mode   ( ) Sustained   (•) Momentary
       Each crossing fires one trigger, like a motion event.

Active states  ┌ ✓ Open  ▾ ┐        Fire on   ☑ When it becomes Open
                                              ☑ When it stops being Open

▾ Override preset
    Attack     0s      ⋯ disabled
    Decay      0s      ⋯ disabled
    Impulse    [●on]   ⋯ disabled
    ⓘ A momentary trigger is always an impulse: the state change is the
      whole event, so there is nothing to hold the envelope open — it
      jumps to its peak and releases. Attack and decay never run.
    Sustain    1.0×
    Release    30m     …
```

- `StimulusField` gains `mode` and `edges`; `SOURCE_FIELDS` becomes
  `["entity", "mode", "to", "edges", "key"]`. `edges` is rendered only under `momentary` —
  the key stays in the document either way (see Model), but a sustained stimulus has no
  crossings to choose between, so showing the checkboxes would be asking a question with
  no consequence.
- Edge labels are entity-specific where `entity-states.ts` can name the state ("When it
  becomes Open" / "When it stops being Open"), falling back to "When it enters the active
  states" / "When it leaves them".
- The last checked edge cannot be unchecked in the form, and `vol.Length(min=1)` refuses
  an empty list in the document.
- Under `momentary`, `attack`, `decay` and `impulse` render **disabled with the reason
  shown**, not hidden. Hiding them would leave a user wondering where the attack went; a
  pinned control that explains itself teaches the coupling instead.

## 4. Icon and state label

`al-tree.ts:545` and `al-strip-controls.ts:297` both render `mdi:flash` and a chip holding
the raw `entity.state`. Both swap to `<ha-state-icon>` and a formatted label.

- `ha-state-icon` joins `HA_OPTIONAL_ELEMENTS`, **not** `HA_ELEMENTS`. The required list
  gates the whole panel; an icon is not worth a blank page, so a frontend that never
  registers it falls back to `mdi:flash`.
- `HomeAssistant` gains an optional `formatEntityState`. The chain is
  `formatEntityState` → `hass.localize` → the raw state, so an older frontend degrades to
  what it shows today rather than to nothing.

## 5. Testing

| Where | What |
| --- | --- |
| `tests/test_schema.py` | `mode`/`edges` defaults; unknown mode refused; `edges: []` refused; `edges` inert under `sustained`; a validated document validates again unchanged |
| `tests/test_tree.py` | momentary forces `impulse` on the built envelope whatever the preset says; `VoiceRef` carries mode and edges |
| `tests/test_coordinator.py` | both edges fire; `enter`-only and `leave`-only fire on exactly one; a momentary voice never gates; unavailable is a no-op that reports no change; `_reconcile` leaves momentary voices alone at startup |
| `tests/test_schema_json.py` | the regenerated `config.schema.json` carries both enums |
| `frontend/test/entity-states.test.ts` | new: candidates per domain and device class, the current-state and configured-`to` union, label fallback |
| `frontend/test/stimulus-form.test.ts` | schema/data/merge for `mode` and `edges`; the removal of the `toText` round trip |
| `frontend/test/al-stimulus-editor.test.ts` | disabled overrides under momentary; the last-edge rule |
| `frontend/test/al-tree.test.ts`, `al-strip-controls.test.ts` | `ha-state-icon` with the `mdi:flash` fallback; formatted state chip |

## 6. Documentation and release

- `README.md`: the trigger paragraph (lines 19–22) gains the mode distinction, and the
  configuration reference gains `mode` and `edges`.
- `config.schema.json` regenerated by `scripts/export_schema.py` and committed.
- The panel bundle rebuilt and committed in the same commit as its sources.
- Conventional commits: `feat(config)` for the schema and coordinator half, `feat(panel)`
  for the form and rows. Not a breaking change — `to` is untouched and `mode` defaults to
  today's behaviour.
