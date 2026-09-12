import { describe, expect, it } from "vitest";
import { geoToLocal, localToGeo, mapPixel, parsePolygon, pixelGeo, placeStructure } from "../src/property-layout";
import { roomsConfig } from "./fixtures";
import { newGroup } from "../src/model";

describe("property coordinates", () => {
  it("round trips rotated local metres and map pixels", () => {
    const gps = {latitude:40.7, longitude:-74.1, rotation:35};
    const geo = localToGeo([23,-12], gps);
    const local = geoToLocal(geo, gps);
    expect(local[0]).toBeCloseTo(23,6); expect(local[1]).toBeCloseTo(-12,6);
    const back = pixelGeo(mapPixel(geo,19),19);
    expect(back[0]).toBeCloseTo(geo[0],8); expect(back[1]).toBeCloseTo(geo[1],8);
  });
  it("rigidly places a building and all descendants without mutating input", () => {
    const config = roomsConfig();
    const room = {...newGroup("room","area"), bounds:[[0,0,2],[4,2,5]] as [[number,number,number],[number,number,number]]};
    config.groups = [{...newGroup("house","structure"), bounds:[[0,0,0],[4,2,5]], children:[room]}];
    const next = placeStructure(config,"house",10,20,90);
    expect(config.groups[0]!.children[0]!.points).toBeUndefined();
    const child = next.groups[0]!.children[0]!;
    expect(child.bounds![0][2]).toBe(2); expect(child.bounds![1][2]).toBe(5);
    expect(child.points![0]![0]).toBeCloseTo(13);
    expect(child.points![0]![1]).toBeCloseTo(19);
    expect(Math.hypot(child.points![1]![0]-child.points![0]![0],child.points![1]![1]-child.points![0]![1])).toBeCloseTo(4);
    expect(() => placeStructure(config,"house",NaN,0,0)).toThrow();
  });
  it("rejects incomplete and degenerate polygons", () => {
    expect(parsePolygon("0,0\n10,0\n10,10\n0,10")).toHaveLength(4);
    for (const text of ["", "0,0\n1,1\n2,2", "0,0\n2,0\nNaN,2"]) expect(() => parsePolygon(text)).toThrow();
  });
});
