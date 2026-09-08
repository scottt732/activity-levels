import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/al-floorplan-import";
import type { AlFloorplanImport } from "../src/al-floorplan-import";
import type { Config, HomeAssistant } from "../src/types";
import { roomsConfig } from "./fixtures";
import { source } from "./floorplan-fixture";

afterEach(() => { document.body.innerHTML = ""; });
const settle = async (el: AlFloorplanImport) => { for (let i = 0; i < 8; i++) await el.updateComplete; };
const mount = async (answer?: (msg: Record<string, unknown>) => unknown) => {
  const callWS = vi.fn(async (msg: Record<string, unknown>) => answer ? answer(msg) :
    msg.type === "activity_levels/floorplan/parse" ? source() : { ok: true, errors: [] });
  const el = document.createElement("al-floorplan-import");
  el.hass = { callWS } as unknown as HomeAssistant;
  el.config = roomsConfig();
  document.body.append(el); await settle(el);
  return { el, callWS };
};
const input = async (el: AlFloorplanImport, selector: string, value: string) => {
  const field = el.shadowRoot!.querySelector<HTMLInputElement>(selector)!;
  field.value = value; field.dispatchEvent(new Event(field.tagName === "SELECT" ? "change" : "input"));
  await settle(el);
};
const click = async (el: AlFloorplanImport, selector: string) => {
  el.shadowRoot!.querySelector<HTMLButtonElement>(selector)!.click(); await settle(el);
};
const parse = async (el: AlFloorplanImport) => {
  await input(el, "textarea", "floors: []"); await click(el, "#parse");
};

describe("floorplan import form", () => {
  it("previews matches and summary, then applies one validated draft edit without saving", async () => {
    const { el, callWS } = await mount();
    const change = vi.fn(); el.addEventListener("al-change", change);
    await parse(el);
    expect(el.shadowRoot!.querySelectorAll(".mapping")).toHaveLength(2);
    expect(el.shadowRoot!.querySelector<HTMLSelectElement>('[data-key="floors/0"] .destination')!.value).toBe("skip");
    expect(el.shadowRoot!.querySelector<HTMLSelectElement>('[data-key="floors/0/rooms/0"] .destination')!.value).toBe("existing:kitchen");
    expect(el.shadowRoot!.querySelector<HTMLInputElement>("#gps")!.checked).toBe(false);
    expect(el.shadowRoot!.querySelector(".summary")!.textContent).toContain("Kitchen");
    expect(change).not.toHaveBeenCalled();
    await click(el, "#apply");
    expect(change).toHaveBeenCalledTimes(1);
    const config = (change.mock.calls[0]![0] as CustomEvent<Config>).detail;
    expect(config.groups[0]!.children[0]!.children[0]!.bounds![0][2]).toBe(11.8);
    expect(callWS.mock.calls.map(([msg]) => msg.type)).toEqual([
      "activity_levels/floorplan/parse", "activity_levels/config/validate",
    ]);
    expect(el.shadowRoot!.textContent).toContain("Use Save");
  });

  it("requires explicit creation and a chosen parent", async () => {
    const { el } = await mount(); await parse(el);
    await input(el, '[data-key="floors/0"] .destination', "create");
    expect(el.shadowRoot!.querySelector<HTMLButtonElement>("#apply")!.disabled).toBe(true);
    await input(el, '[data-key="floors/0"] .parent', "existing:downstairs");
    expect(el.shadowRoot!.querySelector(".summary")!.textContent).toContain("Create floor");
    expect(el.shadowRoot!.querySelector<HTMLButtonElement>("#apply")!.disabled).toBe(false);
  });

  it("supports file import without trusting the extension", async () => {
    const { el, callWS } = await mount();
    const file = el.shadowRoot!.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(file, "files", { value: [{ size: 20, text: async () => "gps: {}" }] });
    file.dispatchEvent(new Event("change")); await settle(el);
    expect(el.shadowRoot!.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe("gps: {}");
    await click(el, "#parse");
    expect(callWS).toHaveBeenCalledWith({ type: "activity_levels/floorplan/parse", text: "gps: {}" });
  });

  it("invalidates a preview when its source or draft changes", async () => {
    const { el } = await mount(); await parse(el);
    await input(el, "textarea", "gps: {}");
    expect(el.shadowRoot!.querySelector("#apply")).toBeNull();
    await click(el, "#parse");
    el.config = structuredClone(el.config); await settle(el);
    expect(el.shadowRoot!.querySelector("#apply")).toBeNull();
    expect(el.shadowRoot!.textContent).toContain("draft changed");
  });

  it("discards a delayed parse after the source is edited", async () => {
    let resolve!: (value: unknown) => void;
    const { el } = await mount(() => new Promise((done) => { resolve = done; }));
    await parse(el); await input(el, "textarea", "changed: true");
    resolve(source()); await settle(el);
    expect(el.shadowRoot!.querySelector("#apply")).toBeNull();
  });

  it("shows parser and validation errors without emitting a change", async () => {
    const { el } = await mount((msg) => {
      if (msg.type === "activity_levels/floorplan/parse") throw { message: "Invalid YAML at line 4" };
      return {};
    });
    await parse(el); expect(el.shadowRoot!.textContent).toContain("Invalid YAML at line 4");
    const valid = await mount((msg) => msg.type === "activity_levels/floorplan/parse" ? source() :
      { ok: false, errors: [{ path: "groups/0", message: "Invalid parent" }] });
    const change = vi.fn(); valid.el.addEventListener("al-change", change);
    await parse(valid.el); await click(valid.el, "#apply");
    expect(change).not.toHaveBeenCalled();
    expect(valid.el.shadowRoot!.textContent).toContain("Invalid parent");
  });

  it("does not apply a delayed validation against a newer draft", async () => {
    let resolve!: (value: unknown) => void;
    const { el } = await mount((msg) => msg.type === "activity_levels/floorplan/parse" ? source() :
      new Promise((done) => { resolve = done; }));
    const change = vi.fn(); el.addEventListener("al-change", change);
    await parse(el); await click(el, "#apply");
    el.config = structuredClone(el.config); await settle(el);
    resolve({ ok: true, errors: [] }); await settle(el);
    expect(change).not.toHaveBeenCalled();
  });
});
