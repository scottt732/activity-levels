import { describe, expect, it } from "vitest";
import { durationToSeconds, formatDuration, secondsToDuration } from "../src/duration";

describe("duration", () => {
  it("splits whole seconds into h/m/s, with no milliseconds field", () => {
    expect(secondsToDuration(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(secondsToDuration(1800)).toEqual({ hours: 0, minutes: 30, seconds: 0 });
    expect(secondsToDuration(3723)).toEqual({ hours: 1, minutes: 2, seconds: 3 });
  });
  it("splits a fractional value into integer seconds plus milliseconds", () => {
    expect(secondsToDuration(3723.5)).toEqual({ hours: 1, minutes: 2, seconds: 3, milliseconds: 500 });
    expect(secondsToDuration(0.1)).toEqual({ hours: 0, minutes: 0, seconds: 0, milliseconds: 100 });
    expect(secondsToDuration(1.5)).toEqual({ hours: 0, minutes: 0, seconds: 1, milliseconds: 500 });
  });
  it("round-trips sub-second values through the widget shape", () => {
    for (const s of [0, 0.1, 0.25, 1.5, 60.5, 3723.5, 1800]) {
      expect(durationToSeconds(secondsToDuration(s))).toBe(s);
    }
  });
  it("joins back including days and milliseconds", () => {
    expect(durationToSeconds({ hours: 1, minutes: 2, seconds: 3 })).toBe(3723);
    expect(durationToSeconds({ days: 1, hours: 0, minutes: 0, seconds: 0 })).toBe(86400);
    expect(durationToSeconds({ hours: 0, minutes: 0, seconds: 1, milliseconds: 500 })).toBe(1.5);
    expect(durationToSeconds(null)).toBeNull();
    expect(durationToSeconds(undefined)).toBeNull();
  });
  it("formats for humans", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(300)).toBe("5m");
    expect(formatDuration(3900)).toBe("1h 5m");
    expect(formatDuration(90.5)).toBe("1m 30.5s");
    expect(formatDuration(172800)).toBe("2d");
  });
});
