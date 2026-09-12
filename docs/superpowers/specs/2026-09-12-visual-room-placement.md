# Visual placement and reusable sensor profiles

The room editor starts with a top-down SVG of the actual polygon beside a room-specific
entity picker. Selecting an entity enables click-to-place; a separate Aim tool sets yaw
from a second point. Existing markers can be selected visually. Numeric coordinates,
height and coverage remain available under adjustments, with optional 3D preview.

Room membership uses the group's HA area (nearest ancestor when absent), explicit
activity inputs in its subtree, and existing placements. Never fall back to the entire
home when an area is missing. Configured inputs sort first, then live contribution and
recent state changes; timestamps are labelled as state changes, not invented detections.
Registry metadata is read by an admin-only endpoint and errors remain visible.

Personal profiles persist in the integration config and copy model characteristics into
placements without copying location/aim. Literal manufacturer/model/platform/entity
class/name matching suggests profiles; application is explicit. Profiles can be imported
and exported as JSON without house/entity/location identifiers. A bundled, sourced
community catalog uses the same shape and accepts contributions through repository PRs.
No upload service or automatic publication is introduced. Unknown specifications stay
unspecified (range zero); community identification hints do not assert unsupported specs.

Validate profile normalization, area overrides, configured-input ordering, literal
matching, profile import/export, polygon placement and aim, keyboard alternatives, and
shared draft events. Rebuild the schema/bundle and use CI for broad checks.
