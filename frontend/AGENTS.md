# The panel — agent guide

A [Lit](https://lit.dev) sidebar panel for Home Assistant, bundled by Vite into a single
ES module. `README.md` here covers `pnpm dev` against a live Home Assistant; the root
`AGENTS.md` covers the repository as a whole.

## Commands

Run these from `frontend/`, or with `pnpm -C frontend <script>` from the root.

```bash
pnpm install
pnpm lint        # eslint over src and test
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest, jsdom
pnpm build       # tsc --noEmit && vite build  ← writes the committed bundle
pnpm dev         # Vite on :5173
```

## The build output is committed

`vite.config.ts` builds `src/main.ts` as a library into
`../custom_components/activity_levels/frontend/activity-levels-panel.js`, with
`emptyOutDir` on and dynamic imports inlined — one minified ES2022 file, which the
integration serves through `panel_custom`. **That file is checked into git**, because
HACS installs the integration from the repository with no build step.

So: change anything under `src/` and rebuild, then commit the bundle alongside the
sources. The build is deterministic — the same sources produce the same bytes — and CI
runs `pnpm build` followed by `git diff --exit-code` on that directory, so a stale bundle
is a red build. The `panel-bundle` pre-commit hook catches it before you push.

## Conventions

- **Components** are `al-*.ts` custom elements; `main.ts` is the entry point and
  `activity-levels-panel.ts` the root element. Non-component modules (`api.ts`,
  `store.ts`, `model.ts`, `convert.ts`, `duration.ts`, `timeseries.ts`) hold logic worth
  testing without a DOM — prefer moving logic there over testing it through a component.
- **`ha-elements.ts`** wraps Home Assistant's own frontend elements. Reach for HA's
  elements before inventing one, so the panel keeps looking like the rest of HA.
- **Tests** live in `test/`, one `*.test.ts` per module, and run under jsdom. Coverage is
  measured over `src/**` and reported to Codecov under the `frontend` flag.
- **eslint** runs `@eslint/js` + `typescript-eslint` recommended, plus the `lit` and `wc`
  plugin recommended sets on `src/**/*.ts`.
- **Dependencies ship to users.** The bundle is a single file downloaded by every
  installation, so a new runtime dependency is a real decision — `lit` is currently the
  only one. Dev dependencies are free; runtime ones are not.
