import type { FloorplanSource } from "../src/floorplan-import";

export const source = (): FloorplanSource => ({
  gps: { latitude: 38.8, longitude: -77, elevation: 13 },
  items: [
    { key: "floors/0", name: "Old basement", source_id: "basement", kind: "floor", context: "",
      bounds: [[0, 0, 11.8], [10, 10, 13.8]] },
    { key: "floors/0/rooms/0", name: "Kitchen", source_id: null, kind: "area", context: "Old basement",
      points: [[0, 0], [3, 0], [0, 4]], bounds: [[0, 0, 11.8], [3, 4, 13.8]] },
  ],
});
