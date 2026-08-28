import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { Config } from "../src/types";

/**
 * A stand-in for Home Assistant's `ha-yaml-editor`, with the parts the tab actually uses:
 * `setValue` seeds it, `value-changed` reports a parse, and `yaml`/`codemirror` are what
 * the jump-to-line does its work through. The real one is CodeMirror 6 and does not run
 * under jsdom, and this is not the place to test Home Assistant's editor anyway.
 */
class FakeYamlEditor extends HTMLElement {
  seeded: unknown[] = [];
  yaml = "";
  dispatched: unknown[] = [];
  focused = 0;

  setValue(value: unknown): void {
    this.seeded.push(value);
  }

  get codemirror() {
    const lines = this.yaml.split("\n");
    return {
      state: {
        doc: {
          lines: lines.length,
          line: (n: number) => ({ from: lines.slice(0, n - 1).join("\n").length }),
        },
      },
      dispatch: (spec: unknown) => this.dispatched.push(spec),
      focus: () => {
        this.focused += 1;
      },
    };
  }

  /** What the real editor fires: the parsed document, or a complaint about the text. */
  emit(detail: { value: unknown; isValid: boolean; errorMsg?: string }): void {
    this.dispatchEvent(new CustomEvent("value-changed", { detail, bubbles: true, composed: true }));
  }
}

for (const tag of ["ha-card", "ha-alert"]) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}
customElements.define("ha-yaml-editor", FakeYamlEditor);

const { DEBOUNCE_MS } = await import("../src/al-code");
await import("../src/al-code");

type Code = HTMLElement & {
  hass: unknown;
  config?: Config;
  errors: { path: string; message: string }[];
  available: boolean;
  updateComplete: Promise<boolean>;
};

const config = (): Config => ({
  version: 1,
  defaults: {
    envelope: "default",
    max_value: 5,
    precision: 1,
    unavailable: "hold",
    retrigger: "release",
    stack: false,
    debounce: 0,
    safety_refresh: 60,
    min_wake_interval: 1,
  },
  envelopes: [],
  groups: [],
});

/** What `config/validate` answers next; reset per test. */
let validateResult: { ok: boolean; errors: { path: string; message: string }[] } = {
  ok: true,
  errors: [],
};
let validateError: Error | null = null;

const hass = () => ({
  states: {},
  areas: {},
  entities: {},
  language: "en",
  localize: (k: string) => k,
  callWS: vi.fn(async () => {
    if (validateError) throw validateError;
    return validateResult;
  }),
  callService: vi.fn(async () => undefined),
});

let el: Code;
let changes: Config[];
let statuses: { valid: boolean; errors: { path: string; message: string }[] }[];

const editor = (): FakeYamlEditor => el.shadowRoot!.querySelector<FakeYamlEditor>("ha-yaml-editor")!;

/** Lets the debounce fire and the validation round trip settle. */
async function settle(): Promise<void> {
  await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 1);
  await el.updateComplete;
}

beforeEach(async () => {
  vi.useFakeTimers();
  validateResult = { ok: true, errors: [] };
  validateError = null;
  changes = [];
  statuses = [];
  document.body.innerHTML = "";
  el = document.createElement("al-code") as Code;
  el.hass = hass();
  el.config = config();
  el.addEventListener("al-change", (e) => changes.push((e as CustomEvent<Config>).detail));
  el.addEventListener("al-code-status", (e) =>
    statuses.push((e as CustomEvent<{ valid: boolean; errors: { path: string; message: string }[] }>).detail),
  );
  document.body.appendChild(el);
  await el.updateComplete;
  await vi.advanceTimersByTimeAsync(0);
  await el.updateComplete;
});

describe("al-code", () => {
  it("seeds the editor from the draft and validates what it opened on", async () => {
    expect(editor().seeded).toEqual([el.config]);
    expect(statuses).toEqual([{ valid: true, errors: [] }]);
  });

  it("sends a parsed edit into the draft, once, after the debounce", async () => {
    const next = { ...config(), groups: [] };
    editor().emit({ value: next, isValid: true });
    editor().emit({ value: next, isValid: true });
    expect(changes).toEqual([]);
    await settle();
    expect(changes).toEqual([next]);
  });

  it("coalesces typing into one undo step", async () => {
    const keys: (string | undefined)[] = [];
    el.addEventListener("al-change", (e) =>
      keys.push((e as CustomEvent & { coalesceKey?: string }).coalesceKey),
    );
    editor().emit({ value: config(), isValid: true });
    await settle();
    editor().emit({ value: config(), isValid: true });
    await settle();
    // The same key on both, which is what the draft's coalescing window keys off.
    expect(keys).toEqual(["code", "code"]);
  });

  it("does not re-seed the editor when its own edit comes back as the draft", async () => {
    const next = config();
    editor().emit({ value: next, isValid: true });
    await settle();
    el.config = next;
    await el.updateComplete;
    expect(editor().seeded).toHaveLength(1);
  });

  it("re-seeds when the draft moves some other way, as Undo does", async () => {
    el.config = config();
    await el.updateComplete;
    expect(editor().seeded).toHaveLength(2);
  });

  it("leaves the draft alone and reports invalid YAML, with the parser's own message", async () => {
    editor().emit({ value: undefined, isValid: false, errorMsg: "bad indentation of a mapping entry (3:5)" });
    await settle();
    expect(changes).toEqual([]);
    expect(statuses.at(-1)).toEqual({ valid: false, errors: [] });
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".parse-error")?.textContent).toContain("bad indentation");
  });

  it("recovers once the text parses again", async () => {
    editor().emit({ value: undefined, isValid: false, errorMsg: "nope" });
    await settle();
    editor().emit({ value: config(), isValid: true });
    await settle();
    expect(statuses.at(-1)).toEqual({ valid: true, errors: [] });
    expect(el.shadowRoot?.querySelector(".parse-error")).toBeNull();
  });

  it("passes the backend's pathed errors on and lists them", async () => {
    validateResult = { ok: false, errors: [{ path: "groups/0/id", message: "duplicate group id" }] };
    editor().emit({ value: config(), isValid: true });
    await settle();
    expect(statuses.at(-1)).toEqual({ valid: true, errors: validateResult.errors });
    el.errors = validateResult.errors;
    await el.updateComplete;
    const rows = el.shadowRoot?.querySelectorAll("ul.errors li");
    expect(rows).toHaveLength(1);
    expect(rows?.[0]?.textContent).toContain("groups/0/id");
    expect(rows?.[0]?.textContent).toContain("duplicate group id");
  });

  it("keeps the last verdict when the websocket call fails", async () => {
    validateError = new Error("disconnected");
    editor().emit({ value: config(), isValid: true });
    await settle();
    expect(statuses).toHaveLength(1);
  });

  it("drops a stale validation answer that resolves after a newer one", async () => {
    const gate: ((value: unknown) => void)[] = [];
    (el.hass as { callWS: Mock }).callWS = vi.fn(
      () => new Promise((resolve) => gate.push(resolve)),
    ) as unknown as Mock;
    editor().emit({ value: config(), isValid: true });
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 1);
    editor().emit({ value: config(), isValid: true });
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 1);
    expect(gate).toHaveLength(2);
    gate[1]!({ ok: false, errors: [{ path: "a", message: "newer" }] });
    await el.updateComplete;
    gate[0]!({ ok: false, errors: [{ path: "b", message: "older" }] });
    await el.updateComplete;
    expect(statuses.at(-1)?.errors).toEqual([{ path: "a", message: "newer" }]);
  });

  it("moves the cursor to the line an error names", async () => {
    editor().yaml = "version: 1\ngroups:\n  - id: house\n    kind: structure\n";
    el.errors = [{ path: "groups/0/kind", message: "a property cannot contain a structure" }];
    await el.updateComplete;
    el.shadowRoot?.querySelector<HTMLButtonElement>("button.jump")?.click();
    expect(editor().dispatched).toHaveLength(1);
    expect(editor().focused).toBe(1);
  });

  it("does nothing when the path names no line it can find", async () => {
    editor().yaml = "version: 1\n";
    el.errors = [{ path: "groups/3/stimuli/9/entity", message: "unknown" }];
    await el.updateComplete;
    el.shadowRoot?.querySelector<HTMLButtonElement>("button.jump")?.click();
    expect(editor().dispatched).toEqual([]);
  });

  it("explains itself instead of rendering when the editor never registered", async () => {
    el.available = false;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("ha-yaml-editor")).toBeNull();
    expect(el.shadowRoot?.querySelector(".editor-missing")).toBeTruthy();
  });
});
