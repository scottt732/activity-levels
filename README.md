# Activity Levels

[![python](https://github.com/scottt732/activity-levels/actions/workflows/python.yml/badge.svg)](https://github.com/scottt732/activity-levels/actions/workflows/python.yml)
[![frontend](https://github.com/scottt732/activity-levels/actions/workflows/frontend.yml/badge.svg)](https://github.com/scottt732/activity-levels/actions/workflows/frontend.yml)
[![codecov](https://codecov.io/gh/scottt732/activity-levels/branch/main/graph/badge.svg)](https://codecov.io/gh/scottt732/activity-levels)
[![release](https://img.shields.io/github/v/release/scottt732/activity-levels?sort=semver)](https://github.com/scottt732/activity-levels/releases/latest)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/)
[![license MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fe5196.svg)](https://www.conventionalcommits.org/en/v1.0.0/)

Home Assistant custom integration (HACS) that turns entity state changes into per-area
activity-level sensors. Every stimulus you configure — a door opening, a motion sensor
firing, a media player starting — drives a synthesizer-style ADSR envelope, and a
recursive mixer combines those envelopes across a tree of groups (rooms, floors, the
whole house) into a single "how much is going on here" number per area.

## How it works

Each configured stimulus is a **trigger**: an envelope with attack, decay, sustain, and
release stages. When the source entity enters its configured `to` state, the trigger
starts — the envelope attacks up to its peak (`gain`), decays to its sustain level, and
holds there. By default a second trigger **stacks**: it adds another `gain` on top of
what is already sounding, up to the group's limiter, so a busy room climbs. When the
entity leaves that state, the trigger ends — the envelope releases back toward zero at a
fixed slope, `release` being the time to fall the whole way from the group's limiter, so
a level a fifth of the way up empties in a fifth of that time. A group **mixes** the
current values of its
child triggers and child groups using `sum`, `max`, or `mean`, then applies a limiter
(`max_value`) so the group's own activity level stays in a bounded range. Groups can
nest, so a `living_room` group rolls up into a `house` group, and the same mixed value
is recomputed recursively at every level whenever a leaf trigger changes.

A stimulus reads its entity in one of two **modes**. The default, `sustained`, is the one
described above: the trigger holds for as long as the entity stays in its `to` states,
which is what a light, a media player or a door you care about standing open wants. A
`momentary` stimulus instead treats each *crossing* of those states as one event, the way
a motion sensor reports a footstep — an interior door, read as "somebody walked through
here" rather than "a door is open". Its `edges` say which crossings count: `enter`,
`leave`, or both. A momentary trigger is always an impulse — the state change is the whole
event, so there is nothing to hold the envelope open and it jumps to its peak and releases
from there, which also means its attack and decay never run.

Two settings say what a *second* trigger does to an envelope that is still sounding.
**Allow retrigger** decides whether it counts at all: `always`, `after_attack`,
`after_decay`, `release` (only a note that is already fading) or `idle` (only once the
envelope has finished). **Stacks** decides what an honoured one does — add its gain on
top of the current level, or restart the rise toward plain `gain`.

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
2. **Mixer** — every group in one horizontally scrolling console of identical track
   strips, with the tree drawn *above* them the way a DAW brackets track groups: a group
   with children gets a **band** spanning its own strip and its whole subtree, one row
   higher per level of nesting. The band's caret closes it — the subtree leaves the row
   and the band folds into a narrow vertical tab beside the group's own strip, which opens
   it again. Roots start open, and the row reopens the way it was left.

   The row is **read-only** until you say otherwise: it shows levels, and nothing on it
   can be leant on by accident. The **Edit** switch above the strips turns the meters back
   into faders and puts the **M** and **R** buttons back; like the open groups, it is
   remembered per browser rather than in the configuration.

   | Config or state | Mixer |
   | --- | --- |
   | a group | a track strip; a group with children, a band over its subtree |
   | group level | the strip's meter — its **value fader** in Edit mode, with the level read out below it |
   | the level without simulated stimuli | a tick on the fader, while the two differ |
   | muted / reset | the strip's **M** and **R** buttons, in Edit mode |

   Clicking a strip selects it (the timeline and the controls row below follow); a band's
   caret only opens and closes. In Edit mode, dragging the value fader **overrides** the
   group's level — a simulated stimulus, which then cools down from where it was left —
   and **M** mutes the group out of its parent's mix while it keeps publishing its own
   value. Neither touches the configuration: they go straight to the engine, and the next
   live frame says where it ended up. Everything a strip cannot hold — mix, limiter, the
   presence-simulation switch — is in the controls row below.
3. **Controls** — everything about the selected group that doesn't fit on a strip: name,
   mix, null handling, limiter, precision, gain into its parent (not for a root), how many
   lights it owns, its presence-simulation switch and the last few things it has done, the
   expected/anomaly readings, a "rebuild profile" button — and its **stimuli**, each one
   the same editor the Groups tab uses: envelope preset, A/D/S/R, sustain, impulse, gain,
   trigger (`to`) states and debounce, every override showing what it falls back to.

Keyboard, in the mixer row: **←/→** moves the selection along the visible tracks
(wrapping), **Enter** or **Space** opens and closes the selected group's band,
**Home**/**End** jump to the first and last track. In the timeline: **←/→** move a cursor one sample at a
time — the tooltip without a mouse — and **Esc** clears it.

Groups, Envelopes and Defaults edit the same draft as the Mixer and share its selection —
picking a strip here also opens it in Groups, and back:

- **Groups** — the structure editor: a flat tree of every group and stimulus on the left
  (no card padding or borders between rows, just indent guides and a kind icon per row —
  `mdi:flash` for a stimulus), the editor for whatever you select on the right. The caret
  opens and closes a row; the label — and the rest of the row's blank space — selects it.
  Each row's action column (add stimulus, add group, delete) appears on hover, on
  keyboard focus, and on the selected row, and is otherwise hidden. Reordering and
  reparenting is native drag and drop — before, after or into another row — or, from the
  keyboard, Alt+↑/↓ to reorder among siblings and Alt+←/→ to outdent or indent; a drop the
  nesting rules refuse shows a not-allowed cursor and says why in a one-line hint, rather
  than silently refusing it.

  The editor on the right is built from the same kind of panel either way — an
  `ha-expansion-panel` with a header, a one-line definition and, sometimes, a badge:
  *Identity*, *Mix*, *Adjacent groups* and *Presence* for a group; *Source*, *Envelope*
  and *Override preset* for a stimulus. Each panel remembers, per browser, whether you
  left it open or closed.
- **Envelopes** — the preset library, with a sketch of the selected preset's ADSR shape.
  Renaming a preset rewrites every stimulus and default that names it; a preset something
  still points at cannot be deleted until those references move.
- **Defaults** — the site-wide fallbacks every group, preset and stimulus inherits from.
- **Patterns** — the pattern profile's status (trained or still learning, when it was
  generated, the window it learned from), a readiness table per group (ready or not, days
  learned, the expected-activity sensor's current reading), which groups presence
  simulation is currently blocked on and why, the simulation log, and a "rebuild profile"
  button with a "force" switch for overwriting a profile an external producer owns.
- **Presence** — shown only while `presence.enabled` is on. A room map (a row per
  top-level branch, doorways drawn between rooms, a door glyph on each exit, occupant
  counts and names on the rooms, the two most likely rooms joined by a line while someone
  is `moving`) that also answers "how would I get from A to B", one row per tracked
  device with its room, confidence and moving state, a table of Bermuda's scanners with
  the room each maps to (or a fix, when it does not), and a settings card — in the same
  style as Defaults — for the top-level `presence` block, whose device picker only offers
  Bermuda's `device_tracker`s.

Edits are held as a draft: **Undo**/**Redo** walk it, **Discard** throws it away, and
**Save** validates first — problems come back attached to the fields that caused them —
then writes the configuration and reloads the integration, which re-creates entities and
restores their state. Meters and entity chips poll the engine every two seconds while the
Mixer tab is open; the **Live** switch on the other tabs does the same for the tree and
the stimulus editor, and pauses while a save is in flight and while the browser tab is in
the background.

### Editing as YAML

The **Code** tab is the whole configuration as one YAML document, in Home Assistant's own
code editor. It is not a separate copy: it opens on the draft the other tabs are editing,
and every parseable edit flows straight back into that draft, so **Undo**, **Redo**,
**Discard** and **Save** work exactly as they do everywhere else, and switching to
**Groups** or **Envelopes** shows what you just typed. Save applies it the same way as
any other edit — validate, write, reload.

Every change is validated against the running integration as you type. Problems are
listed under the editor as `path — message`; clicking one jumps the cursor to that line
where the path can be found in the text. While anything is listed — or while the YAML
does not parse at all, in which case the parser's own complaint is what you get — **Save**
is disabled, because the document would be refused anyway.

To edit the same document in an editor outside Home Assistant, the integration publishes
a [JSON Schema](https://json-schema.org) for it at `/activity_levels_panel/config.schema.json`.
Point the YAML language server at it with a comment on the first line of your file:

```yaml
# yaml-language-server: $schema=http://homeassistant.local:8123/activity_levels_panel/config.schema.json
version: 1
```

That gives completion, hover documentation and inline errors in VS Code (with the
[YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml))
and in anything else that speaks the same protocol. The schema is generated from the same
voluptuous definition the integration validates with, so it is never a second opinion —
though it is deliberately the more permissive of the two, because the rules that need to
see the whole document (a doorway pointing at a group that exists, an envelope somebody
actually defined) are checked on Save rather than in your editor.

### Known limitations

- A group's `area_id` is applied when its device is first created, so changing it later
  does not move an existing device.
- Renaming a group's `id` re-creates that group's entities under the new id; history from
  the old entities is not carried over.
- On a cold page load the panel can report that some Home Assistant UI components did not
  load. Home Assistant registers them lazily; visiting **Settings → Devices & services**
  once and reloading the page is enough to bring them in.
- The timeline charts a group's own series; a channel strip has no series of its own, so
  selecting one charts the group it belongs to.
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
| `sensor.<id>_activity_level` | The group's mixed, limited activity level. Attributes: `mix`, `max_value`, `gated`, `active_voices` (active triggers), `cooldown_at`, `contributors`. |
| `binary_sensor.<id>_active` | On while the group's activity level is above zero. |
| `sensor.<id>_last_activity` | Diagnostic: timestamp of the group's most recent trigger. |
| `sensor.<id>_cooldown_at` | Diagnostic: when the group's release/cooldown is expected to finish. |
| `button.<id>_trigger` | Diagnostic: manually fires the group's built-in trigger channel. |
| `sensor.<id>_expected_activity` | The level the profile expects right now. Attributes: `p25`, `p75`, `day_type`, `ready`, `producer`. `unknown` until the group is ready. |
| `sensor.<id>_activity_anomaly` | How far today's real level sits outside that band, signed. `unknown` until the group is ready. |
| `switch.<id>_presence_simulation` | Arms presence simulation for the group. Only created when the group has lights and its `simulation.enabled` is true. |
| `sensor.<id>_occupants` | How many people are believed to be in this room. Attribute: `who`. Only for rooms, and only while presence is on. |

A group's device model in Home Assistant is now its kind — *Property*, *Structure*,
*Floor*, *Area* or *Outside* — and an area-bound group suggests that area for its
devices, while a floor-bound one suggests nothing, because Home Assistant devices belong
to areas, not floors.

And once, on the **Activity Levels** hub device:

| Entity | Description |
| --- | --- |
| `switch.activity_levels_presence_simulation` | The house-wide arm for presence simulation. |
| `sensor.activity_levels_profile` | Diagnostic: when the profile was generated. Attributes: `producer`, `producer_version`, `groups_ready`, `groups_total`, `trained`, `ready`. |

And, while presence is on, one pair per tracked person, each on its own **Presence:
`<name>`** device under the hub:

| Entity | Description |
| --- | --- |
| `sensor.<name>_room` | Which room a tracked person is in, or `Away`. Attributes: `group_id`, `confidence`, `moving`, `candidates`, `path`, `updated`. |
| `sensor.<name>_floor` | Which floor (or, in a house that declares none, which building) a tracked person is on, or `Away`. Attributes: `group_id`, `confidence` — the belief summed over the floor's rooms, so it can be sure of the floor while the room is a toss-up — `rooms`, `updated`. |
| `binary_sensor.<name>_moving` | On while the person's two most likely rooms are adjacent and both plausible. |

## Services

- `activity_levels.trigger` — manually fire a synthetic trigger. Fields: `group_id`
  (required), `peak` (optional, defaults to 1.0).
- `activity_levels.reset` — return every trigger in a group to idle. Fields: `group_id`
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
| the house-wide switch is on | `switch.activity_levels_presence_simulation` |
| the group's own switch is on | `switch.<id>_presence_simulation` |
| the group is not opted out | `simulation.enabled` in its config |
| the group owns at least one light | its `area_id`, plus `simulation.lights.include`/`exclude` |
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
  the group's *own* built-in trigger channel, not its children's, so pressing the kitchen's
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

## Rooms & presence

### What each group is

Every group has a `kind`, and the kind decides what may go inside it:

| Kind | What it is | What can go inside it |
| --- | --- | --- |
| **Property** | The whole lot: everything you own, inside and out. Every configuration starts with one. | Structures, outdoor areas, and other properties (for more than one lot in one document). |
| **Structure** | A building on the property — the house, a garage, a shed. | Floors, or areas directly (a one-storey building). |
| **Floor** | One level of a structure. Bind it to a Home Assistant floor to reuse its name. | Areas. |
| **Area** | A room or zone people occupy. Bind it to a Home Assistant area to reuse its name and put its entities in the right place. | Other areas (an ensuite, an alcove). |
| **Outside** | An outdoor area — a yard, a patio, the driveway. | Other outdoor areas. |

Every root group is a property, and this table is exactly what the tree's *Add group*
menu offers at each level — it will not let you nest something the layering forbids.

`floor_id` and `area_id` bind a floor or an area to Home Assistant's own floor and area
registries; both are entirely optional, because a house whose Home Assistant areas do not
match its rooms is a normal house. Picking a floor or an area in the editor fills in the
group's `id` and `name` from the registry entry — but only while both are still untouched
defaults, and never afterwards, so binding a registry entry never overwrites a name or an
id you already gave something. A group with an `area_id` and no name of its own takes the
area's name.

Only `area` and `outside` groups are *rooms* — the states the presence estimator has. An
`outside` group that only holds other outdoor areas (a "back yard" wrapping a patio and a
driveway) is a room too, with no doorways of its own, sitting on the map right alongside
the areas it contains.

A configuration written before kinds existed has none. Activity Levels works them out
when it loads — the root is the property, a group bound to an area is an area, and
everything else follows the layering — and the panel says so with a banner until you
look at them and save. Nothing is written to your configuration until you do, and no
entity id changes either way: they come from the group's `id`, which nothing here
touches. One thing is worth checking when the banner appears: a group that declares a
doorway or a way off the property and holds no rooms of its own is read as somewhere a
person stands, and beside a property — which cannot contain a room — that comes out as an
*outdoor* area. A detached garage lands there correctly; a building with rooms in it does
not, so move the doorway to a room inside it and set the kind back.

**Adjacency, on its own.** `adjacent` describes the house's floor plan, and it means
something even before presence is turned on: it is only meaningful between groups that
are rooms — `area` and `outside` kinds, from the table above — because those are the only
kinds a person can be in. A bare id in the list (`adjacent: [dining_room]`) is a doorway:
symmetric, and the commonest kind of connection, so it is also the default. `{id:
dining_room, connection: stairs}` says the same thing about a different kind of opening —
`open` (no door at all), `door`, `stairs`, or `exterior_door`. The connection type is
recorded and shown in the panel; nothing weights a transition by it yet. Clearing "both
ways" on an edge is the one-way case, which used to be YAML-only: `{id: some_room,
one_way: true}` in place of the plain id. Separately, a room may lead off the property —
*"People can leave the property from here, so presence can move from here to Away."* —
which any `area` or `outside` group may declare, and no other kind may: a front door in
the hall and a gate on the driveway are both exits, and a property, a structure or a
floor is not somewhere anybody stands to leave from.

**Turning presence on.** Nothing above needs [Bermuda](https://github.com/agittins/bermuda).
Presence itself does: it is off unless `presence.enabled` is set, and if it is set but
Bermuda is not installed, the integration raises a repair issue and otherwise carries on —
adjacency still validates, `topology` still answers, nothing presence-shaped is built.

**How the estimate works, roughly.** Bermuda already turns raw BLE signal strength into a
distance from each tracked device to each of its scanners; those per-scanner distances
become one observation per device roughly twice a second. A filter that runs over the room
graph turns a stream of those observations into a belief about which room the device is
in, weighing each candidate room against how well its scanners' distances fit and how
plausible it is to have gotten there from the last belief. Because the graph is the
transition model, a jump between two rooms with no door between them is not something a
single noisy reading can do — the filter has to be dragged there step by step, or not at
all. `escape` is the small leftover probability of appearing somewhere with no path from
here, and it exists purely so a wrong guess is not permanent: without it, an estimate that
starts (or is nudged) wrong could never recover.

The rooms' own activity levels are the other kind of evidence. A room at `0.0` while another
is busy is somewhere nobody is, however many people are home, so it costs a candidate as
much as having no scanner at all (`activity.floor`); a room whose level is rising has a stimulus firing right
now and costs nothing; anything in between decays at the envelope's own rate. A busy room is
never a *reward* — with more than one person home it could be anyone — so this only ever
rules rooms out. The level the estimator reads leaves out the room's own `presence` channel,
so it can never confirm itself. The one place the rule fails is a room somebody is asleep
in: a still sleeper trips no motion, and `0.0` there means nothing. Give such a room its own
`presence.activity_floor: 1.0` and the estimator leaves it alone.

**What you get.** Per tracked person: `sensor.<name>_room` (which room, or `Away`),
`sensor.<name>_floor` (which floor, with the belief summed over its rooms — sure of the
floor when two rooms on it tie) and `binary_sensor.<name>_moving` (on while their two most
likely rooms are adjacent and both still plausible). Per room: `sensor.<room>_occupants`, plus a `presence` channel folded
into that room's mix — silent, starting when the room fills and ending when it empties,
tuned in the mixer's controls row exactly like any other channel (gain, envelope, and it
mutes the same way).

**Setting it up.**

1. Install and configure Bermuda so it is tracking your phones (or other BLE trackers) and
   your rooms have scanners.
2. Enable Bermuda's per-scanner distance sensors — they ship **disabled**, and the
   integration raises a repair issue naming the ones it still finds off.
3. Give each scanner device an area matching a room's `area_id`, or map it directly with
   `presence.scanner_areas` when that is not convenient.
4. List your phones' `device_tracker` entities under `presence.devices`.
5. Set `adjacent` (and `exit`, where it applies) on every room — an unreachable room is
   invisible to the filter, not just poorly connected to it.

**Where the line is.** Someone standing in a doorway is not confidently in either room, so
they are an occupant of nowhere and show up as `moving` instead. `threshold` is what draws
that line: below it, no room is sure enough to claim the person; at or above it, they
count.

## Configuration reference

Durations accept `30s`, `5m`, `2h`, `1d`, `HH:MM:SS`, or a plain number of seconds.

Everything below is also published as a JSON Schema, which your editor can check this
document against as you type — see [Editing as YAML](#editing-as-yaml).

Renaming a group's `id` creates new entities (history is not carried over); `area_id` is
applied only when a group's device is first created. A tracked person's entities are
keyed off their (slugified) `presence.devices[].name`, so renaming one renames their
entities the same way.

`presence` and `trigger` are reserved channel labels — a stimulus `key` or a child group
`id` of either name is rejected as a duplicate, whether or not presence is switched on.

Every group's keys, including the ones [kinds](#what-each-group-is) added:

```yaml
groups:
  - id: kitchen
    kind: area              # property | structure | floor | area | outside
    area_id: kitchen        # binds a Home Assistant area (was `area`, still accepted)
    # floor_id: downstairs  # on a `floor` group, binds a Home Assistant floor instead
    adjacent:
      - hall                                          # a two-way door
      - {id: back_patio, connection: exterior_door}   # open | door | stairs | exterior_door
      - {id: laundry_chute, one_way: true}            # the rare thing that is not two-way
    exit: false             # true = people can leave the property from here
```

The rest of the configuration, in full:

```yaml
version: 1
defaults:
  envelope: default          # preset used when a stimulus names none
  max_value: 5.0             # limiter for groups that don't set their own
  precision: 1               # display decimals
  unavailable: hold          # hold | note_off — what an entity going unavailable does
                             # to its trigger (`note_off` ends it; the key keeps its name)
  retrigger: always          # when a fresh trigger counts while the envelope is still
                             # sounding: always | after_attack | after_decay | release
                             # (only while it is fading) | idle (only once it has finished)
  stack: true                # what an honoured trigger does: true adds another gain on
                             # top of the current level (up to the group limiter), false
                             # restarts the rise toward plain gain
  debounce: 0s               # minimum time between triggers per stimulus
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
    label: Thirty Minutes    # optional display name; stimuli still name the id
    sustain: 1.0             # multiplier on the peak, held while the trigger is on;
                             # above 1.0 the decay climbs instead of falling
    release: 30m             # time to fall from full scale (the group's max_value) to
                             # zero; lower levels fall faster, at that same slope
    impulse: false           # true = the trigger ends the moment it starts (momentary
                             # sensors), leaving only the release
groups:
  - id: house                # ^[a-z][a-z0-9_]*$, unique; entity ids derive from it
    kind: structure          # property | structure | floor | area | outside
    name: House
    area_id: null            # HA area id → device suggested area (was `area`, still accepted)
    mix: sum                 # sum | max | mean
    null_handling: zero      # zero | ignore (mean only)
    max_value: 5.0           # optional; inherits defaults
    precision: 1             # optional; inherits defaults
    stimuli:
      - entity: binary_sensor.front_door
        to: "on"             # active state(s); string or list
        mode: sustained      # sustained (hold while active) | momentary (fire on each crossing)
        edges: [enter, leave] # momentary only: which crossings fire; at least one
        gain: 1.0            # peak level one trigger of this stimulus reaches
        envelope: default    # preset; any envelope field may be overridden inline
        key: null            # required only when the same entity appears twice in a group
    simulation:
      enabled: true          # false = no presence-simulation switch for this group
      lights:
        include: []          # extra lights beyond the ones in the group's area
        exclude: []          # lights in the area to leave out
    adjacent: [dining_room, back_patio]   # rooms you can walk to; symmetric doors by default
    # adjacent: [{id: back_patio, connection: exterior_door}]  # open | door | stairs | exterior_door
    # adjacent: [{id: laundry_chute, one_way: true}]   # the rare thing that is not two-way
    exit: false              # true = people can leave the property from here
    presence:                # optional overrides for this room's presence channel
      gain: 1.0              # how loudly "somebody is here" contributes
      envelope: hour         # any envelope field may be overridden inline
      activity_floor: 1.0    # this room's own presence.activity.floor; 1.0 exempts a
                             # room people sleep in, where 0.0 does not mean empty
    children:
      - id: living_room
        gain: 1.0            # this subgroup's channel gain into the parent
        stimuli: [...]

presence:                    # absent or enabled: false = the whole feature is off
  enabled: true
  people:
    - name: Scott                            # entity name; defaults to the first device's name
      person: person.scott                   # optional; its device_trackers seed the devices
      devices:
        - tracker: device_tracker.scotts_phone_ble   # a Bermuda device_tracker
          name: Phone                        # defaults to the Bermuda device's name
          kind: phone                        # phone | watch | tag | laptop | other
          companion: device_tracker.scotts_iphone    # the mobile_app tracker of the same phone
          signals:                           # companion sensors; discovered from the
            activity: sensor.scotts_iphone_activity  #   companion's device when omitted
            steps: sensor.scotts_iphone_steps
            battery_state: sensor.scotts_iphone_battery_state
        - tracker: device_tracker.scotts_watch_ble
          kind: watch
  devices: []                # the older one-tracker-per-person list; still accepted and
                             # folded into people on load
  carried:                   # "is this device on its person" — see Rooms & presence
    prior: 0.7               # P(carried) before any signal
    flip: 5m                 # mean time between carried <-> parked changes
    recent: 2m               # how far back "moved lately" looks; a signal held this
                             #   long is worth its whole weight
    nearby: 0.3              # P(a parked device is in the same room as its person)
    weights:                 # log-odds each signal adds while it is true; 0 disables one
      charging: -3.0
      moving: 2.0
      still_room_empty: -2.0
      jitter: 1.0
  envelope: default          # preset the presence channels start from
  threshold: 0.6             # confidence needed before somebody counts as in the room
  stay: 0.9                  # P(staying put between updates)
  escape: 0.001              # P(appearing in a room with no path to this one)
  scale: 3.0                 # emission distance scale, metres
  floor: 0.05                # likelihood of a room with no scanner
  stuck_after: 60s           # implausible readings for this long reset the estimate
  activity:
    floor: 0.05              # likelihood of a room whose activity level is 0.0
  scanner_areas:             # scanner device id -> room, overriding its area
    "1a2b3c4d5e6f": kitchen
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

## Releases

Every release is tagged `vX.Y.Z` and carries an `activity_levels.zip` asset whose root
is the integration itself — that is the archive HACS downloads and unpacks into
`custom_components/activity_levels/`. To install without HACS, take the zip from the
[latest release](https://github.com/scottt732/activity-levels/releases/latest), unpack
it into `<config>/custom_components/activity_levels/`, and restart Home Assistant.

The version, the tag and the zip always agree: CI refuses to publish a release whose
manifest disagrees with its tag. [`CHANGELOG.md`](CHANGELOG.md) is generated from the
commit history.

## Contributing

Bug reports, ideas and pull requests are all welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md) for the toolchains, the checks CI runs, the fact that
the panel bundle is committed, and the commit-message convention releases depend on.
Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md); security
problems go through [SECURITY.md](SECURITY.md) rather than a public issue.

## License

MIT
