# ESPresense floorplan import

Approved in conversation: import measurements from an old ESPresense configuration
without making its hierarchy the Activity Levels hierarchy. A later rotatable house
wireframe will shade the geometry using existing live group activity readings.

## Import milestone

The Floorplans tab accepts pasted YAML or a YAML/JSON file. Whole ESPresense configs
are welcome: only root `gps` and `floors` contribute data. URL-encoded editor pastes
are recognized as a compatibility convenience. Parsing happens in a read-only,
admin-only backend command, using the YAML dependency already provided by HA.
Unrelated values are never copied into the configuration or returned to the panel.

The result is a list of source floors and rooms, with source names for context.
Each row offers Skip, an existing group, or explicit creation. Unique ID/name
matches are suggestions; ambiguous matches and unmatched rows default to Skip.
Mapping is independent of source hierarchy and allows any existing group kind.
Two rows cannot overwrite the same destination in one import.

Creation requires an explicit row action, a name, a unique Activity Levels ID,
a kind, and a parent compatible with that kind. The parent may be an existing group
or another explicitly created import row. Root creation is allowed only for a
property, consistent with the existing tree rules. No automatic floor, building,
area, registry binding, adjacency, or stimulus is created.

GPS import is a separate unchecked choice. A summary lists geometry updates and
creations before Apply. Apply validates the complete candidate configuration and
emits one draft change; normal Undo, Redo, Discard, and Save remain authoritative.
Changing the pasted source invalidates the previous parse. A changed draft requires
reviewing matches again before applying, avoiding stale overwrites.

## Geometry model

Root `gps` has latitude, longitude, optional elevation, and optional rotation, using
ESPresense names and units. Groups optionally carry `bounds` (two XYZ corners in
meters) and `points` (an XY polygon in the same coordinate frame). Missing geometry
is omitted, so existing configurations are unchanged.

Floor bounds are copied directly. Each room receives its polygon and, when floor
bounds exist, its own bounds computed from the polygon's XY extent and the floor's
Z interval. Room height and position therefore survive skipping the source floor,
mapping into a different hierarchy, and later reparenting. Without floor bounds,
keep the footprint without inventing a vertical location. Matching never renames,
moves, reparents, changes registry IDs, or changes activity settings of a group.
Applying a footprint without vertical data clears stale bounds on that destination.

All coordinates must be finite numbers; booleans are invalid. Bounds must be
ordered and non-degenerate. Polygons need at least three distinct non-collinear
vertices. Normalize consecutive duplicates and a repeated closing vertex, but do
not attempt to repair malformed or truncated YAML. Overlapping rooms and rooms
outside source bounds are not silently corrected. Structural and geometric errors
include a source path. Parsing has bounded input size and collection counts.

## Verification and later work

Focused tests cover parsing complete/partial configs, ignored keys, bad input,
geometry normalization and persistence, matching ambiguity, explicit creation,
collision/cycle prevention, preserving hierarchy and settings, and the draft UI.
Regenerate the JSON schema and committed panel bundle. CI owns full regression
and coverage suites. No new frontend runtime dependency is needed for importing.

The later viewer can extrude room polygons through their Z bounds, orbit/zoom,
isolate floors, and display each selected group's own live level. It is outside
this import milestone; importing does not yet render a house.
