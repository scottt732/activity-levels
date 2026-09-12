# Room devices and HUD

User requests autonomous implementation of hardware-agnostic sensor/light placement,
coverage and aiming, room hover information, presence portraits/devices and idle forecast.

Store `fixtures` on groups: entity, name, kind (motion/occupancy/light), XYZ position in
existing local metre frame, yaw/pitch degrees, horizontal/vertical FOV, range, mount,
and technology labels. Geometry is presentation only: placing a sensor never adds an
activity stimulus or changes presence inference. Existing structure transforms must move
fixture positions/aim together with rooms. No invented manufacturer FOV defaults: default
coverage is hidden (range zero), with explicit user-supplied dimensions to enable it.

The editor selects a room and entity, then clicks a plane at a chosen height in a focused
3D room view, or enters XYZ with keyboard controls. Preview coverage before adding or
updating an immutable draft; reuse Undo/Redo/Save and backend validation.

Markers render in the lazy Three.js scene. Binary state controls sensor color, actual
light RGB/brightness controls light markers. Unknown states have their own muted style.
Coverage is an illustrative cone/frustum, not measured detection nor obstacle-aware
ray tracing. Hover/select room shows a compact cyan/amber HUD with activity, last event,
conditional idle-by time, estimated people with portraits/confidence and device estimates.
Touch/keyboard selection pins the same HUD. Stale/error states suppress stale estimates.

Forecast only a copied engine tree using forward boundary queries, never the live engine.
If sustained voices leave nonzero output, show held instead of an invented countdown.
Otherwise report the time after which output remains zero with no further input.

Optional camera focus uses a rising sensor edge to target inside its configured coverage.
No focus on initial load or unknown-to-on transitions; respect reduced motion, background
visibility, existing interaction pause and cooldown. It is a camera path, not a person path.

Focused tests: schema rejection/roundtrip, projection/placement transforms, marker resource
cleanup, forecast purity/held/release, HUD stale/people/device handling, and editor draft
behavior. Rebuild schema and JS bundle. Broad suites/review belong to PR CI.
