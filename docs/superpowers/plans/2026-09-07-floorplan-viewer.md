# Floorplan Viewer Implementation Plan

**Goal:** Display supplied floorplan geometry as an interactive live activity wireframe.

**Architecture:** A pure model projects the current configuration into scene parts and
group readings. A lazy Three.js renderer owns WebGL resources and camera interactions;
a Lit viewer owns selection, controls and text. The panel retains polling and navigation.

**Tech Stack:** Lit, TypeScript, Three.js, OrbitControls, Vite, Vitest.

Execute inline in the existing worktree, on `feat/floorplan-viewer` based on current main.
The user's desktop policy owns local test scope and avoids duplicate agent reviews.

- [x] Add model tests, then `frontend/src/floorplan-model.ts`: independent XYZ geometry,
  scope membership, missing/invalid bounds, group ancestry and stale activity readings.
- [x] Add Three.js plus its type declarations, then geometry/lifecycle tests and
  `frontend/src/floorplan-renderer.ts`. Fit the camera to visible geometry, use raycasting
  for selection, update materials without rebuilding meshes, and dispose all resources.
- [x] Add component tests, then `frontend/src/al-floorplan-viewer.ts`: camera buttons,
  floor/building scope, accessible group list, selected group details, stale/empty/failure
  states and race-safe lazy renderer loading.
- [x] Add `al-floorplans.ts` to compose viewer and importer; connect selection and live
  polling in `activity-levels-panel.ts`. Extend focused shell tests and register components.
- [x] Build a local browser fixture and inspect real WebGL interactions using Playwright.
  Document behavior and the new optional download; rebuild and commit all generated chunks.
- [ ] Run changed Vitest tests, focused ESLint and the compiling Vite build. Self-review,
  commit/push and open a PR, then watch exact-head CI for full regression and coverage.
