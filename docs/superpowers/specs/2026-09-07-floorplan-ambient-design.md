# Floorplan colors and ambient dashboard — approved design

## Delivery

First extend the existing viewer with configurable activity outlines and real light fills.
Then reuse the viewer in a dashboard card with an opt-in ambient presentation. Finally
add explicit binary-sensor rules for alerts. This keeps each increment independently usable.
A panel-only fullscreen option is smaller, but a dashboard card better supports per-device
presentation and a dedicated kiosk dashboard. A separate standalone app would duplicate
authentication and data subscriptions and is not proposed.

## Color settings

Use snake_case in YAML, matching existing configuration and card fields; camelCase may be
used internally. Defaults are color_thresholds with value/color entries: 0/#2189EF,
3/#f39c12, 5/#d31400. Sort thresholds numerically; apply the greatest threshold at or below
the group's current absolute activity value. Below the minimum use the first color.
Threshold transitions are discrete. Reject duplicate/nonfinite values and invalid colors.
Missing or stale activity stays visually distinct and never becomes a known quiet state.
Selection must retain the activity hue, using emphasis or an additional outline.

A reusable viewer-options model serves panel preferences and per-card settings. Panel
preferences persist per browser/config entry; card settings live in dashboard YAML.
Presentation settings do not alter the activity model or import mappings.

## Light fills

Outline hue represents activity; room interior hue represents actual lights. Reuse the
backend's light ownership resolution, including entity/device area inheritance, instead
of inferring ownership from names. Expose resolved entity IDs to the viewer; consume live
Home Assistant states for color and brightness. Support RGB/HS/XY and color temperature
through tested conversion helpers. On/off-only lights use neutral white at full brightness.
Off lights contribute nothing; unavailable lights are reported as unknown.

For multiple lights, mix color in linear RGB weighted by brightness; use the brightest
light to set the room's fill strength. This is an illustrative room tint, not a physical
lighting simulation. No light entities or all known off means no illuminated fill;
unknown data remains distinguishable in details. Containers remain outlines.

## Ambient dashboard

Add a reusable floorplan dashboard card with an opt-in ambient mode that fills its host
and hides routine editor controls. The dashboard/kiosk host owns the surrounding browser
chrome; no Fully Kiosk service calls are required for this increment.

Provide Standard (requested blue/amber/red), Night (black background and subdued light
fills), and Security (black background, quiet gray, active red) schemes. Custom thresholds
win over preset thresholds. Fill brightness can be capped for nighttime use.

Auto rotation and activity focus are independent opt-ins. Orbit slowly while idle, ease
toward rooms with fresh stimulus/activity changes, hold briefly, then return to overview.
Rank explicit alerts ahead of fresh room activity. Use dwell/cooldown so polling updates
and sustained activity do not repeatedly jump the camera; prefer rooms over aggregate
parents. Manual interaction pauses automation. Respect reduced motion by default, stop
animation when hidden/disconnected, and use time-based motion with a bounded frame rate.
Moving pixels is a visual goal, not a guarantee against display burn-in.

## Explicit sensor rules

The sensor-rule increment adds ordered rules matching exact entity states, optionally targeting
a group and overriding scheme/outline color or showing a concise alert label. Example:
an alarm sensor on selects Security and highlights the house; a mapped door sensor on
highlights that room and requests focus. Highest-priority matching rule wins; ties use
configuration order. Unknown/unavailable states do not silently equal off. No arbitrary
JavaScript/templates or sensor discovery by entity name. Rules affect presentation only.

## Verification

Focused tests cover threshold boundaries/order, light mixing/conversion/ownership,
unknown states, alert precedence, camera scheduling and cleanup. Browser fixtures expose
light colors, brightness, activity, and alert toggles for real WebGL comparison, mobile
layout and ambient motion. Rebuild all committed assets; delegate broad regression and
coverage to exact-head CI. Live device behavior remains a separate deployment check.

## Ground level and basements

The existing grid sits just below the lowest visible geometry; it is a presentation
reference and must not imply surveyed ground level. Add optional ground_z in viewer
settings, expressed in the same absolute Z coordinates as group bounds. When supplied,
draw a subtle transparent ground reference at that height, retain visible below-ground
rooms, and include the ground reference when fitting the view. Never shift floor geometry
or derive ground from a floor name, group order, GPS elevation, or negative Z alone.
Without ground_z, label the existing grid as a reference grid, not outdoor ground.
A basement boolean is unnecessary for placement: a floor may be partially below grade,
which an explicit ground height represents directly. Ground_z is initially one horizontal
plane per view; different buildings can use separate card settings. Sloped terrain is
outside this increment. Test below-grade and partially below-grade geometry, and verify
scope changes preserve the configured physical ground height.
