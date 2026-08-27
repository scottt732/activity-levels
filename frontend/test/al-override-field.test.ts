import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-override-field";
import type { AlOverrideField } from "../src/al-override-field";

let el: AlOverrideField;
let onField: { value: unknown }[];
let onDocument: Event[];

const RETRIGGER_SELECTOR = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" },
    ],
  },
};

/** The inner `ha-selector` reporting an edit, the way Home Assistant's do. */
const edit = async (value: unknown): Promise<void> => {
  el.shadowRoot?.querySelector("ha-selector")?.dispatchEvent(
    new CustomEvent("value-changed", { detail: { value }, bubbles: true, composed: true }),
  );
  await el.updateComplete;
};

const helper = (): string => {
  const selector = el.shadowRoot?.querySelector("ha-selector") as (HTMLElement & { helper?: string }) | null;
  return selector?.helper ?? "";
};

beforeEach(async () => {
  document.body.innerHTML = "";
  onField = [];
  onDocument = [];
  el = document.createElement("al-override-field");
  el.kind = "select";
  el.selector = RETRIGGER_SELECTOR;
  el.value = null;
  el.inherited = "only_in_release";
  el.addEventListener("value-changed", (e) => onField.push((e as CustomEvent<{ value: unknown }>).detail));
  document.addEventListener("value-changed", (e) => onDocument.push(e));
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-override-field", () => {
  it("re-emits on itself only, so no ha-form above it reads the value as its own", async () => {
    await edit("always");
    expect(onField).toEqual([{ value: "always" }]);
    expect(onDocument).toHaveLength(0);
  });

  it("spells an inherited select value the way its dropdown does", () => {
    expect(helper()).toBe("Inherited from defaults: Only while releasing");
  });

  it("falls back to the raw value when the options do not cover it", async () => {
    el.inherited = "surprise";
    await el.updateComplete;
    expect(helper()).toBe("Inherited from defaults: surprise");
  });

  it("leaves the selector optional, so an inherited value stays blank and clearable", () => {
    const selector = el.shadowRoot?.querySelector("ha-selector") as (HTMLElement & { required?: boolean }) | null;
    expect(selector?.required).toBe(false);
  });

  it("says so once the field is overridden", async () => {
    el.value = "always";
    await el.updateComplete;
    expect(helper()).toBe("Overridden");
  });
});
