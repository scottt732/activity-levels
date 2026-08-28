# Group kinds, adjacency table, tree UX and paneled editor

Status: approved in conversation 2026-08-28. Builds on the topology/presence spec
(2026-08-27) and mixer v2 (2026-08-27).

## Goals

1. Groups get a **kind** that says what they are on the property — property, structure,
   floor, area, outside — with floors and areas bound to Home Assistant's own registries
   so users stop typing redundant ids and names. Every configuration is a property at the
   root, layered like a stack: property → structures and outside areas → floors → rooms.
2. Adjacency is edited in a **table** with a connection type, and the terms are defined
   in the UI. "Exit" becomes "leads off the property".
3. The Groups **tree** loses its borders and arrows: right-aligned hover actions, caret
   toggles / label selects, drag-and-drop to reorder and reparent.
4. The group and stimulus **editors** are paneled, with rarely-used fields collapsed and
   every panel carrying a one-line definition.
5. The Presence tab is always reachable, so presence can be switched on from the UI.

## 1. Model

### Kinds

```yaml
groups:
  - id: property            # kind: property (roots are always properties)
    kind: property
    children:
      - id: house
        kind: structure
        children:
          - id: downstairs
            kind: floor
            floor_id: downstairs        # HA floor registry id; optional
            children:
              - id: kitchen
                kind: area
                area_id: kitchen        # HA area registry id; optional (was `area`)
      - id: front_yard
        kind: outside
        exit: true                      # "leads off the property"
```

- `kind` ∈ `property | structure | floor | area | outside`. Required in a saved
  document (see Migration); the schema default is `null`, which the loader resolves.
- `area_id` replaces the existing `area` field (the schema accepts both; `area` is
  rewritten to `area_id` on load). `floor_id` is new. Both optional: an unbound `area` or
  `floor` is fine (a house whose HA areas do not match its rooms).
- Nesting rules (pathed errors at `groups/i/…/kind`):
  `property → {property, structure, outside}`; `structure → {floor, area}`;
  `floor → {area}`; `area → {area}`; `outside → {outside}`. Every root is a `property`.
- Topology nodes = groups of kind `area` or `outside` (they may also declare edges or an
  exit as before; a `structure`/`floor`/`property` may not declare `adjacent`/`exit`).
- `exit: true` ("leads off the property") is allowed on `outside` groups, and on `area`
  groups only when the property has no `outside` group at all (a config that does not
  model the yard still needs a way to Away).
- Devices/entities are unchanged: ids are still the user's; `kind` is exposed as a device
  attribute (`model` becomes `Property` / `Structure` / `Floor` / `Area` / `Outside`) and
  `suggested_area` uses `area_id`; a `floor` group with `floor_id` suggests nothing
  (HA devices belong to areas, not floors).

### Binding to HA

Picking an HA area (or floor) in the editor pre-fills `id` (from the registry id, slugged)
and `name` (from the registry name) **only while those fields are still at their
defaults** (id empty, name null); after that, both are the user's and never change. The
backend never rewrites ids. If a group has `area_id` and no `name`, the entity's name
falls back to the HA area name rather than the id.

### Migration (loader, once)

`validate_config` resolves `kind: null` deterministically and returns the resolved
document; the panel shows an "inferred kinds — check and save" banner while any group in
the loaded document had no kind, and the next save writes them explicitly. Inference,
in order: root → `property`; has `area_id`/`area` → `area`; parent `property` →
`structure`; parent `structure` → `floor`; parent `floor` or `area` → `area`; parent
`outside` → `outside`. A group inferred to a kind that violates the nesting rules is
left `null` and reported as an error the banner links to. The `examples/house.yaml` is
updated with explicit kinds (Property → House{Basement, Downstairs, Upstairs as floors;
rooms as areas}, Garage as structure, Outside{Front Yard, Back Yard, Driveway,
Back Patio} as outside).

## 2. Adjacency

`adjacent` entries: `{id, connection: open | door | stairs | exterior_door, one_way: false}`;
a plain string is still accepted and means `{connection: door}`. `connection` is
informational in this release (the HMM ignores it; a later release may weight
transitions); it is validated and round-tripped.

Editor: **Adjacent groups** table, present only for `area`/`outside` groups:
group picker (filtered to `area`/`outside` groups other than this one and not already
listed) · connection type select · "both ways" checkbox (unchecked = one-way, replacing
"YAML only") · remove. Edges declared on the *other* group appear as read-only rows
labelled "declared on <name>". Inline definition under the table header:
*"Adjacent groups are ones you can walk between without passing through another group
in this configuration. Sensors don't matter here — an unobserved hallway is still a
room."* `exit` is rendered as **Leads off the property** with the helper *"People can
leave the property from here, so presence can move from here to Away."*

## 3. Tree

- Rows are flat: no borders, no card padding, indent guides per depth, kind icon
  (`mdi:home-city` property, `mdi:home` structure, `mdi:layers` floor,
  `mdi:door` area, `mdi:tree` outside, `mdi:flash` stimulus).
- Right-aligned action column, fixed width, visible on row hover, keyboard focus, and on
  the selected row: add stimulus, add group (menu of the kinds the nesting rules allow
  here), remove. Up/down arrows removed. Whole row highlights on hover; the selected row
  uses the primary colour.
- Caret toggles expand/collapse (persisted per browser); clicking the label or blank
  row space selects (updates the editor) and does not toggle.
- Drag-and-drop with native HTML5 DnD (no library): groups and stimuli drag; drop targets
  are "before/after sibling" and "into group" (last child); illegal drops — nesting rule
  violations, a group into its own descendant, a stimulus outside a group — show a
  not-allowed cursor and a one-line hint in the row. The move is a pure reducer op
  (`moveNode(config, fromPath, toParentPath, index)`) with its own tests; DnD only
  computes the arguments. Keyboard parity: Alt+↑/↓ reorder, Alt+←/→ outdent/indent
  where the rules allow.
- The "No stimuli yet" placeholder shows only for an expanded group with no children at
  all, as a muted single line.

## 4. Editor panels

`ha-expansion-panel` sections, each with a header, a one-line definition and optional
badge; collapse state remembered per browser per panel.

Group: **Identity** (kind select with definitions; HA floor/area picker per kind; id;
name) open · **Mix** (mix, gain, limiter, precision) open · **Adjacent groups** open,
area/outside only · **Presence** (per-group presence overrides) collapsed, only when
presence is enabled · Delete.

Stimulus: **Source** (entity, trigger states, key) open · **Envelope** (preset picker +
gain) open · **Override preset** collapsed, badge "N overridden" when any override is
set, containing attack/decay/sustain/release/impulse/retrigger/unavailable/debounce.

Definitions (rendered as the panel subtitle):
- Property: "The whole lot: everything you own, inside and out. Every configuration
  starts with one."
- Structure: "A building on the property — the house, a garage, a shed."
- Floor: "One level of a structure. Bind it to a Home Assistant floor to reuse its name."
- Area: "A room or zone people occupy. Bind it to a Home Assistant area to reuse its
  name and put its entities in the right place."
- Outside: "An outdoor area — a yard, a patio, the driveway. Outside areas can lead off
  the property."
- Mix: "How this group's stimuli and children combine into one level."
- Envelope: "How a single trigger rises and falls over time."

## 5. Presence tab always reachable

The tab is always listed. When `presence.enabled` is false it renders a **setup card**:
what presence does (two sentences), Bermuda detected / not detected (from
`presence/state`), the enable toggle and the device picker (the same Settings form,
reduced), and a note that the per-scanner distance sensors must be enabled in Bermuda.
When enabled, the existing tab renders.

## Testing

- Schema: kinds and nesting rules (each illegal parent/child pair), `area` → `area_id`
  rewrite, migration inference for every branch incl. the unresolved case, `exit` rules,
  adjacency long form and connection enum, existing documents (no kinds) still load.
- Backend: device `model` per kind, `suggested_area` from `area_id`, topology nodes
  restricted to area/outside.
- Frontend pure: `moveNode` reducer (legal-drop predicate for every rule, descendant
  guard, index math), kind inference display, adjacency table model (own vs declared-on
  rows), override badge count.
- Frontend components: tree hover/selection/caret behaviour, DnD drop handling with
  synthetic drag events, keyboard parity, panel collapse persistence, presence setup
  card enable flow, "inferred kinds" banner.
- `examples/house.yaml` validates with explicit kinds.

## Later (noted, not designed)

- **Geometry**: an optional per-`area` geometry (polygon, floor height) and per-scanner
  coordinates; an ESPresense config importer would populate both and feed a learned
  per-room emission model (presence phase 3) and a floor-plan map.
- **Dwell / absence anomalies** over the topology and the learned profile ("no visit to
  the bathroom in N hours when one is expected"), for check-in notifications; presence
  must then also accept motion-only observations.
- **Where-is-activity sensors** (most active room, room per person) for tablets/cameras.
- Connection-type-weighted transitions in the HMM.
