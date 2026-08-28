import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFINE_TIMEOUT_MS,
  HA_ELEMENTS,
  HA_OPTIONAL_ELEMENTS,
  NUDGE_TIMEOUT_MS,
  ensureHaElements,
} from "../src/ha-elements";

/** One required element is deliberately left unregistered, so the deadlines actually run. */
const NEVER_DEFINED = "ha-selector";

beforeEach(() => {
  vi.useFakeTimers();
  for (const tag of HA_ELEMENTS) {
    if (tag === NEVER_DEFINED || customElements.get(tag)) continue;
    customElements.define(tag, class extends HTMLElement {});
  }
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ensureHaElements", () => {
  it("reports what never registered and leaves no timer behind", async () => {
    const pending = ensureHaElements();
    await vi.advanceTimersByTimeAsync(NUDGE_TIMEOUT_MS + DEFINE_TIMEOUT_MS + 100);
    const result = await pending;
    expect(result).toEqual({
      ok: false,
      missing: [NEVER_DEFINED],
      // `ha-selector` is what the YAML editor's nudge waits on, so it cannot arrive either.
      optionalMissing: [...HA_OPTIONAL_ELEMENTS],
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps a missing optional element out of `missing`, where it would blank the panel", () => {
    expect(HA_ELEMENTS as readonly string[]).not.toContain("ha-yaml-editor");
    expect(HA_OPTIONAL_ELEMENTS).toContain("ha-yaml-editor");
  });

  it("clears the deadline of every element that did register", async () => {
    const pending = ensureHaElements(60_000, 30_000);
    await vi.advanceTimersByTimeAsync(1);
    // The YAML editor's nudge waits on `ha-selector`, which never arrives here, so the
    // nudges hold their shared deadline for the whole budget — one timer, not two.
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(30_000);
    // Now the nine registered elements settle at once and their deadlines go with them:
    // only the two that never register are still waiting on their own.
    expect(vi.getTimerCount()).toBe(2);
    await vi.advanceTimersByTimeAsync(60_000);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });
});
