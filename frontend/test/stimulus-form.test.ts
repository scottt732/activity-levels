import { describe, expect, it } from "vitest";
import { RETRIGGER_SELECTOR } from "../src/stimulus-form";

describe("stimulus form selectors", () => {
  it("offers stack first among the retrigger modes", () => {
    expect((RETRIGGER_SELECTOR.select as { options: unknown }).options).toEqual([
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" },
    ]);
  });
});
