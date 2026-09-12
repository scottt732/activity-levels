# Room devices and HUD implementation

1. Extend group schema/types with fixture geometry; expose it in floorplan dashboard.
2. Add pure copied-tree idle forecast and narrow forecast tests; include forecast and
   minimal presence room/device estimates in the dashboard response.
3. Add Three.js fixture markers/coverage with owned disposal and rising-edge camera focus.
4. Add viewer hover/pinned HUD plus optional room placement plane and event callbacks.
5. Add room-device editor and pure helpers, preserving shared draft semantics and rigid
   property transforms. Supply a standalone fixture for browser testing.
6. Run focused backend/frontend checks, build schema/bundle, browser smoke, self-review,
   then commit/push PR and monitor exact-head CI.
