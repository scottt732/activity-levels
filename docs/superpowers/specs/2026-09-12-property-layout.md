# Property layout

Approved direction: reuse Home Assistant location, arrange existing structures at their
configured dimensions, and trace ground features on a map. Property-specific information
is editable configuration, never code. Existing imported GPS and local geometry survive.

## First usable flow

Add Property layout under Floorplans. Read HA location through get_config on request and
link to HA home settings for persistent correction. Preserve an existing GPS origin unless
the user explicitly applies replacement coordinates. Never update HA location silently.

Offer an explicit Load map action with OSM attribution. Render only viewport tiles, with
normal browser caching. Keep provider URL and attribution configurable. Do not prefetch,
download offline maps, or send address searches to a public geocoder. Users can type
coordinates, use HA location, and move the map centre. Aerial-image calibration remains a
follow-up; this version does not claim satellite imagery or automatic parcel detection.

Store site ground elevation and named polygons (property, lawn, driveway, path, pool) in
local metres. Trace vertices with pointer input or edit coordinates with keyboard controls.
Preview polygons on the map and in 3D. Drawing finishes as one draft edit; deletion and
building placement also use the shared immutable al-change/Undo/Redo/Save pipeline.

Move/rotate a structure and all descendant geometry as one rigid transformation. Preserve
height and dimensions. Rotating box-only rooms materializes their true footprint before
recomputing their axis-aligned bounding box. No hierarchy changes or inferred imports.

## Coordinates and rendering

GPS identifies local XY zero and rotation. Use a local tangent approximation for property
scale distances; Web Mercator is only the tile display projection. Elevation above sea
level is metadata, not a replacement for existing local Z. Ground elevation is independently
editable and defaults to zero when not configured.

Site polygons render as muted flat surfaces below activity volumes. Include their extent
when framing the scene; do not let site layers intercept room selection. Keep scene GPU
resources disposable and map libraries out of the lazy Three.js bundle.

## Verification

Focused tests cover coordinate round trips, rotations preserving footprints and height,
polygon validation, serialization/dashboard delivery, drawing and draft events, and GPU
cleanup. Rebuild JSON schema and committed frontend artifacts. Full suites and canonical
review belong to PR CI. Browser-check map controls and 3D ground feature presentation.
