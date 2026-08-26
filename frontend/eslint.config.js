import js from "@eslint/js";
import tseslint from "typescript-eslint";
import lit from "eslint-plugin-lit";
import wc from "eslint-plugin-wc";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["src/**/*.ts"], plugins: { lit, wc }, rules: { ...lit.configs["flat/recommended"].rules, ...wc.configs["flat/recommended"].rules } },
  { ignores: ["../custom_components/**", "node_modules/**"] },
);
