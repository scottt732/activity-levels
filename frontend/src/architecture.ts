import type { ArchitecturalObject, Group } from "./types";
export function objectFootprint(o: ArchitecturalObject): [number, number][] {
  const a = (o.yaw * Math.PI) / 180,
    c = Math.cos(a),
    s = Math.sin(a);
  return [
    [0, 0],
    [o.width, 0],
    [o.width, o.run],
    [0, o.run],
  ].map(([x, y]) => [
    o.position[0] + x! * c - y! * s,
    o.position[1] + x! * s + y! * c,
  ]);
}
export function readArchitecture(value: unknown): ArchitecturalObject | null {
  if (!value || typeof value !== "object") return null;
  const o = {
    name: "",
    yaw: 0,
    width: 1,
    run: 3,
    height: 2.5,
    steps: 14,
    landing_bottom: 0,
    landing_top: 0,
    ...value,
  } as ArchitecturalObject;
  if (
    typeof o.id !== "string" ||
    !o.id ||
    o.id.length > 100 ||
    typeof o.name !== "string" ||
    o.name.length > 100 ||
    !["stairs", "chimney", "column", "shaft", "solid"].includes(o.kind) ||
    !Array.isArray(o.position) ||
    o.position.length !== 3 ||
    ![
      ...o.position,
      o.yaw,
      o.width,
      o.run,
      o.height,
      o.steps,
      o.landing_bottom,
      o.landing_top,
    ].every(Number.isFinite) ||
    o.width < 0.01 ||
    o.run < 0.01 ||
    o.height < 0.01 ||
    o.width > 100 ||
    o.run > 100 ||
    o.height > 100 ||
    !Number.isInteger(o.steps) ||
    o.steps < 1 ||
    o.steps > 100 ||
    o.landing_bottom < 0 ||
    o.landing_top < 0 ||
    o.landing_bottom + o.landing_top >= o.run ||
    (o.to_floor !== undefined && (typeof o.to_floor !== "string" || !o.to_floor || o.to_floor.length>100)) ||
    (o.under_room !== undefined &&
      (typeof o.under_room !== "string" ||
        !o.under_room ||
        o.under_room.length > 100))
  )
    return null;
  return o;
}
export function stairHeight(
  o: ArchitecturalObject,
  x: number,
  y: number,
): number {
  const a = (o.yaw * Math.PI) / 180,
    t = -(x - o.position[0]) * Math.sin(a) + (y - o.position[1]) * Math.cos(a);
  return (
    o.position[2] +
    o.height *
      Math.max(
        0,
        Math.min(
          1,
          (t - o.landing_bottom) / (o.run - o.landing_bottom - o.landing_top),
        ),
      )
  );
}
export function outlineBounds(
  points: [number, number][],
  low: number,
  high: number,
): Group["bounds"] {
  if (
    points.length < 3 ||
    !points.flat().every(Number.isFinite) ||
    !Number.isFinite(low) ||
    !Number.isFinite(high) ||
    low >= high
  )
    throw new Error(
      "Draw at least three corners and set a ceiling above the floor.",
    );
  // Reject crossing walls before triangulation; adjacent edges may share a corner.
  const cross = (a: number[], b: number[], c: number[]) =>
    (b[0]! - a[0]!) * (c[1]! - a[1]!) - (b[1]! - a[1]!) * (c[0]! - a[0]!);
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!,
      b = points[(i + 1) % points.length]!;
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.001)
      throw new Error("Corners must be distinct.");
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
      const c = points[j]!,
        d = points[(j + 1) % points.length]!;
      const overlap =
        Math.max(Math.min(a[0], b[0]), Math.min(c[0], d[0])) <=
          Math.min(Math.max(a[0], b[0]), Math.max(c[0], d[0])) &&
        Math.max(Math.min(a[1], b[1]), Math.min(c[1], d[1])) <=
          Math.min(Math.max(a[1], b[1]), Math.max(c[1], d[1]));
      if (
        overlap &&
        cross(a, b, c) * cross(a, b, d) <= 0 &&
        cross(c, d, a) * cross(c, d, b) <= 0
      )
        throw new Error("Room walls cannot cross.");
    }
  }
  const area = points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length]!;
    return sum + p[0] * q[1] - p[1] * q[0];
  }, 0);
  if (Math.abs(area) < 1e-6) throw new Error("The room must enclose an area.");
  return [
    [
      Math.min(...points.map((p) => p[0])),
      Math.min(...points.map((p) => p[1])),
      low,
    ],
    [
      Math.max(...points.map((p) => p[0])),
      Math.max(...points.map((p) => p[1])),
      high,
    ],
  ];
}
