import { beforeEach, describe, expect, it, vi } from "vitest";
import { PANELS_KEY, loadPanelOpen, savePanelOpen } from "../src/panel-state";

describe("panel collapse persistence", () => {
  beforeEach(() => localStorage.clear());

  it("falls back until something has been stored for that panel", () => {
    expect(loadPanelOpen("group:identity", true)).toBe(true);
    expect(loadPanelOpen("stimulus:overrides", false)).toBe(false);
  });

  it("remembers each panel separately, including a closed one", () => {
    savePanelOpen("group:identity", false);
    savePanelOpen("stimulus:overrides", true);
    expect(loadPanelOpen("group:identity", true)).toBe(false);
    expect(loadPanelOpen("stimulus:overrides", false)).toBe(true);
    expect(loadPanelOpen("group:mix", true)).toBe(true);
    expect(JSON.parse(localStorage.getItem(PANELS_KEY)!)).toEqual({
      "group:identity": false,
      "stimulus:overrides": true,
    });
  });

  it("shrugs off unreadable, non-object or unwritable storage", () => {
    localStorage.setItem(PANELS_KEY, "[]");
    expect(loadPanelOpen("group:mix", true)).toBe(true);
    localStorage.setItem(PANELS_KEY, "{oops");
    expect(loadPanelOpen("group:mix", false)).toBe(false);
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    expect(() => savePanelOpen("group:mix", false)).not.toThrow();
    spy.mockRestore();
  });
});
