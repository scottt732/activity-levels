import { describe, expect, it } from "vitest";
import { runSave } from "../src/save-flow";
import type { ValidateResult } from "../src/api";
import type { Config } from "../src/types";

const config = { version: 1, defaults: {}, envelopes: [], groups: [] } as unknown as Config;
const ok: ValidateResult = { ok: true, errors: [] };

describe("runSave", () => {
  it("reports validation problems without saving", async () => {
    let saved = false;
    const outcome = await runSave(config, {
      validate: () => Promise.resolve({ ok: false, errors: [{ path: "groups/0/id", message: "bad id" }] }),
      save: () => {
        saved = true;
        return Promise.resolve(ok);
      },
    });
    expect(saved).toBe(false);
    expect(outcome.reload).toBe(false);
    expect(outcome.errors).toEqual([{ path: "groups/0/id", message: "bad id" }]);
    expect(outcome.banner).toEqual({ kind: "error", text: "1 problem(s) to fix before saving." });
  });

  it("surfaces server-side rejection from save", async () => {
    const outcome = await runSave(config, {
      validate: () => Promise.resolve(ok),
      save: () => Promise.resolve({ ok: false, errors: [{ path: "", message: "invalid_config" }] }),
    });
    expect(outcome.reload).toBe(false);
    expect(outcome.banner).toEqual({ kind: "error", text: "invalid_config" });
  });

  it("clears errors and asks for a reload on success", async () => {
    const outcome = await runSave(config, { validate: () => Promise.resolve(ok), save: () => Promise.resolve(ok) });
    expect(outcome).toEqual({
      errors: [],
      banner: { kind: "info", text: "Saved. Activity Levels is reloading." },
      reload: true,
    });
  });

  it("turns a rejected validate into an error banner and keeps existing errors", async () => {
    const outcome = await runSave(config, {
      validate: () => Promise.reject(new Error("Connection lost")),
      save: () => Promise.resolve(ok),
    });
    expect(outcome.reload).toBe(false);
    expect(outcome.errors).toBeNull();
    expect(outcome.banner).toEqual({ kind: "error", text: "Save failed: Connection lost" });
  });

  it("turns a rejected save into an error banner", async () => {
    const outcome = await runSave(config, {
      validate: () => Promise.resolve(ok),
      save: () => Promise.reject("boom"),
    });
    expect(outcome.banner).toEqual({ kind: "error", text: "Save failed: boom" });
  });
});
