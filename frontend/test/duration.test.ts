import { describe, expect, it } from "vitest";
import { durationToSeconds, formatDuration, secondsToDuration } from "../src/duration";

describe("duration", () => {
  it("splits seconds into h/m/s", () => {
    expect(secondsToDuration(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(secondsToDuration(1800)).toEqual({ hours: 0, minutes: 30, seconds: 0 });
    expect(secondsToDuration(3723.5)).toEqual({ hours: 1, minutes: 2, seconds: 3.5 });
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
