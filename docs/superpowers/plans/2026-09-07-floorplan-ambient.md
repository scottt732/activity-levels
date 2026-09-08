# Floorplan ambient implementation plan

Goal: configurable activity outlines, real light fills, below-grade geometry, and a reusable ambient dashboard.
Architecture: pure presentation options and light mixing; shared Lit viewer; optional renderer animation; read-only dashboard payload using existing light ownership.
Tech stack: Lit, TypeScript, Three.js, Home Assistant Python websocket API.

Execute inline under the desktop policy; approval is already given.

- [x] Add floorplan-style.ts and focused tests for thresholds, presets, light conversion, alerts and ground settings. Thresholds use absolute values; unknown stays gray.
- [x] Add a read-only floorplan/dashboard websocket command returning geometry-only groups, live readings and resolved light IDs. Test the response and unavailable integration.
- [x] Extend renderer with independent outline/fill appearance, ground_z, timed orbit and eased focus. Test geometry elevation, colors and resource cleanup.
- [x] Extend shared viewer with settings, local persistence, light state input, alert status and ambient controls. Add dashboard card with polling lifecycle and per-card options.
- [x] Extend the simulated browser fixture, test WebGL and mobile presentation, and document YAML configuration and ground_z 12.886.
- [ ] Run changed tests and compiling build, commit generated chunks, self-review and push. Let exact-head CI own broad regression and coverage.
