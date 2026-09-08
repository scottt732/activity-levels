# Live 3D floorplan viewer

The interaction was approved during the import discussion: a rotatable schematic
house, inactive rooms as faint outlines, activity shading, top/reset views, floor
isolation, and selection that opens existing group controls. This milestone implements
that viewer using the geometry imported by PR #34.

## Presentation

Floorplans opens the viewer above a collapsible import section. The default scene
shows all supplied geometry. Drag rotates, right-drag pans, wheel/pinch zooms; visible
camera buttons provide keyboard/touch alternatives. Top view and Reset view reframe
the visible model. A scope picker isolates a floor/building using current group
membership. A selectable group list exposes labels, own activity readings and settings
even without WebGL. Selecting a container highlights its descendants while its displayed
reading is its own engine value, not a sum computed by the viewer.

XY polygons extrude through their own Z bounds; bounds-only groups produce rectangular
volumes. Containers are wire outlines so they do not obscure rooms inside them. Imported
physical placement never follows tree depth, GPS elevation or source floor names.
Footprints without vertical bounds remain listed as unplaced, rather than silently
acquiring an invented floor height. Invalid draft geometry is reported and omitted.

Live shading uses each group's value divided by its max_value, clamped to [0, 1]. Missing
or stale readings stay visibly unknown, not zero. Floorplans polls live state through
the existing shell while visible, as Mixer does. Readings older than ten seconds show
an explicit stale status; a lightweight UI timer updates freshness even if polling fails.

## Implementation

Use Three.js with OrbitControls in a dynamically imported renderer module. Its geometry,
raycasting, and camera control cover the approved interaction without maintaining a new
3D engine. The renderer loads only for a nonempty scene; other panel tabs and dashboard
cards do not load it. The existing static directory route serves generated lazy chunks.

Separate pure geometry/activity projection (`floorplan-model.ts`), Three.js scene and
resource lifecycle (`floorplan-renderer.ts`), and Lit controls (`al-floorplan-viewer.ts`).
The renderer draws on changes, without a perpetual animation loop. ResizeObserver updates
the viewport, device pixel ratio is capped, and listeners/GPU resources are disposed on
disconnect and scene replacement. Context loss shows a recoverable fallback. Renderer
loading races cannot attach a canvas to a removed element.

The visible group list is an accessible alternative to canvas picking. Empty, invalid,
unplaced, loading, stale, and unavailable-WebGL states each have explicit text. Geometry
and filter changes reframe the scene; activity changes preserve the user's camera.

## Verification

Focused tests cover independent room coordinates, nonrectangular footprints, container
scope, missing geometry, normalized/stale activity, selection, polling and lifecycle.
A local browser fixture uses the real WebGL renderer with representative multilevel
geometry and controllable live readings to verify rotation, picking, isolation, activity
updates, viewport sizing and a rendered screenshot. It does not claim a live Home Assistant
deployment. Commit rebuilt bundles and use CI for broad regression/coverage checks.
