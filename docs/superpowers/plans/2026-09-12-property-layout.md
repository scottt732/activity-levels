# Property layout implementation

1. Add `site` geometry schema/types and dashboard projection. Test polygon kinds,
   invalid coordinates and config round trips; regenerate config.schema.json.
2. Add pure `property-layout.ts` projection and rigid building placement helpers.
   Test coordinate round trips and preservation of rotated descendant geometry.
3. Add `al-property-layout.ts`: HA location load, persistent-settings link, explicit
   map load, viewport navigation, configurable provider, pointer/coordinate polygon
   entry, feature removal, and structure move/rotate. Emit existing al-change events.
4. Add site surfaces to FloorplanRenderer, scene bounds and disposal, and pass site
   through panel/dashboard model. Verify room picking remains limited to room meshes.
5. Run changed tests and frontend build/typecheck, targeted Python checks, update
   README, self-review diff, commit generated artifacts and push PR for broad CI.
