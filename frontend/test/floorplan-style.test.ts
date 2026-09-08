import { describe, expect, it } from "vitest";
import { viewerOptions, thresholdColor, roomLight, activeRule } from "../src/floorplan-style";
import type { HassEntity } from "../src/types";
const light = (attributes = {}, state = "on"): HassEntity => ({entity_id:"light.a",state,attributes,last_changed:""});
describe("floorplan presentation", () => {
  it("defaults to a three-minute orbit and validates periods in seconds", () => {
    expect(viewerOptions().rotation_period).toBe(180);
    expect(viewerOptions({rotation_period:360}).rotation_period).toBe(360);
    for(const rotation_period of [0,-1,0.5,NaN,Infinity]) expect(()=>viewerOptions({rotation_period})).toThrow("rotation_period");
  });
  it("sorts absolute thresholds and rejects ambiguous settings", () => {
    const o = viewerOptions({color_thresholds:[{value:5,color:"#d31400"},{value:0,color:"#2189EF"},{value:3,color:"#f39c12"}]});
    expect([0,2.9,3,4.99,5,100].map(v=>thresholdColor(v,o))).toEqual(["#2189EF","#2189EF","#f39c12","#f39c12","#d31400","#d31400"]);
    expect(()=>viewerOptions({color_thresholds:[{value:0,color:"red"}]})).toThrow();
    expect(()=>viewerOptions({ground_z:Infinity})).toThrow();
    expect(viewerOptions({ground_z:12.886}).ground_z).toBe(12.886);
  });
  it("uses security defaults unless thresholds override them", () => {
    expect(thresholdColor(0,viewerOptions({scheme:"security"}))).toBe("#697780");
    expect(thresholdColor(5,viewerOptions({scheme:"security"}))).toBe("#d31400");
  });
  it("mixes linear RGB using brightness, distinguishes off and unknown", () => {
    const fill=roomLight(["light.a","light.b"],{"light.a":light({rgb_color:[255,0,0],brightness:255}),"light.b":light({rgb_color:[0,0,255],brightness:255})});
    expect(fill.rgb[0]).toBeCloseTo(0.5); expect(fill.rgb[2]).toBeCloseTo(0.5); expect(fill.brightness).toBe(1);
    expect(roomLight(["light.a"],{"light.a":light({},"off")}).brightness).toBe(0);
    expect(roomLight(["light.a"],{}).unknown).toBe(true);
    expect(roomLight(["light.a"],{"light.a":light({hs_color:[120,100]})}).rgb[1]).toBeCloseTo(1);
    expect(roomLight(["light.a"],{"light.a":light({color_temp_kelvin:2700})}).rgb[0]).toBeGreaterThan(roomLight(["light.a"],{"light.a":light({color_temp_kelvin:2700})}).rgb[2]);
  });
  it("prioritizes exact sensor matches and never treats unavailable as off", () => {
    const rules=viewerOptions({rules:[{entity:"binary_sensor.door",state:"on",label:"Door",priority:1},{entity:"binary_sensor.alarm",state:"on",label:"Alarm",priority:10}]}).rules;
    expect(activeRule(rules,{"binary_sensor.door":light({},"on"),"binary_sensor.alarm":light({},"on")})?.label).toBe("Alarm");
    expect(activeRule(rules,{})).toBeUndefined();
  });
});
