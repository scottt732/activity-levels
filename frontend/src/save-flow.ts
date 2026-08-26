import type { ValidateResult } from "./api";
import type { Config, ValidationError } from "./types";

export interface Banner {
  kind: "error" | "warning" | "info";
  text: string;
}

export interface SaveDeps {
  validate: (config: Config) => Promise<ValidateResult>;
  save: (config: Config) => Promise<ValidateResult>;
}

export interface SaveOutcome {
  /** New validation errors to show, or `null` to leave the current ones alone. */
  errors: ValidationError[] | null;
  banner: Banner;
  /** True when the save landed and the integration is reloading. */
  reload: boolean;
}

/**
 * Validate-then-save, reduced to a plain value so it can be unit tested without a DOM.
 * Never rejects: a websocket failure anywhere in the flow becomes an error banner,
 * because a Save button that silently does nothing is the worst outcome.
 */
export async function runSave(config: Config, deps: SaveDeps): Promise<SaveOutcome> {
  try {
    const validated = await deps.validate(config);
    if (!validated.ok) {
      return {
        errors: validated.errors,
        banner: { kind: "error", text: `${validated.errors.length} problem(s) to fix before saving.` },
        reload: false,
      };
    }
    const saved = await deps.save(config);
    if (!saved.ok) {
      return {
        errors: saved.errors,
        banner: { kind: "error", text: saved.errors[0]?.message ?? "Save failed" },
        reload: false,
      };
    }
    return { errors: [], banner: { kind: "info", text: "Saved. Activity Levels is reloading." }, reload: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { errors: null, banner: { kind: "error", text: `Save failed: ${message}` }, reload: false };
  }
}
