# Activity Levels — Plan 3: Sidebar Panel

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A native-looking Home Assistant sidebar panel (Lit + TypeScript, built with Vite, pnpm) that edits the Activity Levels configuration tree — groups, stimuli, envelope presets, defaults — with validation, undo, save/reload, and a live view of levels and voice phases.

**Architecture:** `panel.py` serves the built bundle from `custom_components/activity_levels/frontend/` and registers a `panel_custom` sidebar entry. The panel element (`<activity-levels-panel>`) loads config over the existing websocket API, keeps an immutable draft with undo/redo (`store.ts`, pure and unit-tested), renders a two-pane layout (tree + editor), and uses HA's own web components (`ha-form`, `ha-selector`, `ha-expansion-panel`, `ha-card`, `ha-top-app-bar-fixed`…) after a resilient loader ensures they are defined. Seconds are the wire format for durations; the panel converts to/from HA's `{hours, minutes, seconds}` duration selector. `null` on a group/stimulus field means "inherit".

**Tech Stack:** Node 24, pnpm 10, Vite (lib mode, single ES module), Lit 3, TypeScript (experimentalDecorators), vitest, ESLint flat config; Python side: HA 2026.8.3 `panel_custom` + `http.async_register_static_paths`.

**Spec:** `docs/superpowers/specs/2026-08-25-activity-levels-design.md` §6 (+ §5.5). Prior ledgers: `docs/superpowers/plan1-engine-ledger.md`, `docs/superpowers/plan2-integration-ledger.md` (read the "Plan-3 handoff notes" and "deferred to Plan 3" lines).

## Global Constraints

- Repo `/Users/sholodak/elevenrose/activity-levels`, branch `main`. Python side unchanged except Tasks 2–3 and the small carry-overs listed there.
- Frontend lives in `frontend/` (pnpm project). `pnpm build` writes exactly one file: `custom_components/activity_levels/frontend/activity-levels-panel.js` (committed). CI fails if the committed bundle is stale (`git diff --exit-code`).
- Custom element tag: `activity-levels-panel`; panel URL path: `activity-levels`; sidebar title "Activity Levels", icon `mdi:pulse`, `require_admin=True`, `embed_iframe=False`.
- Static path `/activity_levels_panel/` → the `frontend/` directory, registered once per HA run (guard in `hass.data`); `module_url` carries `?v=<sha256[:12] of the bundle>` for cache busting. `ACTIVITY_LEVELS_DEV_SERVER` env var (e.g. `http://localhost:5173`) switches `module_url` to `<dev>/src/main.ts` with `trust_external=True`.
- Manifest `dependencies`: `["http", "frontend", "panel_custom", "websocket_api"]`.
- Config types in TS mirror the normalized schema exactly (`null` = inherit for group `max_value`/`precision` and for every stimulus envelope override; preset `retrigger`/`unavailable`/`debounce` may be `null`).
- Durations: seconds on the wire; `{hours, minutes, seconds}` for `ha-selector` duration; human text (`30m`, `1h 5m`) only for display.
- `ha-*` element names are referenced only in `frontend/src/ha-elements.ts`; the loader must degrade to a visible notice, never a blank page.
- Reorder uses up/down buttons (ruling: drag-and-drop deferred).
- ESLint + `tsc --noEmit` + vitest must pass; ruff/mypy/pytest for Python must stay green.
- Commit after every task with the message given.

---

## File structure

```
frontend/
  package.json  pnpm-lock.yaml  tsconfig.json  vite.config.ts  eslint.config.js  .npmrc
  src/
    main.ts                 registers the custom element
    types.ts                HomeAssistant (minimal), config model, ws payloads
    api.ts                  callWS wrappers: getConfig, validate, save, getState
    duration.ts             seconds <-> {hours,minutes,seconds}; formatDuration
    store.ts                immutable path ops + Draft with undo/redo
    errors.ts               pathed errors -> per-field maps
    ha-elements.ts          ensureHaElements() loader
    styles.ts               shared CSS (theme variables)
    activity-levels-panel.ts   root element: toolbar, tabs, load/save, layout
    al-tree.ts              tree pane
    al-group-editor.ts      group form
    al-stimulus-editor.ts   stimulus form with override fields
    al-override-field.ts    one nullable field: inherited hint + selector + clear
    al-envelopes.ts         presets list + editor
    al-envelope-sketch.ts   SVG ADSR sketch
    al-defaults.ts          defaults form
  test/
    duration.test.ts  store.test.ts  errors.test.ts  sketch.test.ts
custom_components/activity_levels/
  panel.py                registration
  frontend/activity-levels-panel.js   built bundle (committed)
tests/test_panel.py
.github/workflows/frontend.yml
```

---

### Task 1: Frontend scaffold, build pipeline, CI

**Files:**
- Create: `frontend/package.json`, `frontend/.npmrc`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/eslint.config.js`, `frontend/src/main.ts`, `frontend/src/types.ts`, `frontend/src/duration.ts`, `frontend/test/duration.test.ts`, `.github/workflows/frontend.yml`
- Modify: `.gitignore` (already ignores `node_modules/`, `frontend/dist/`)

**Interfaces:**
- Produces: `pnpm lint | test | build | dev` scripts; `duration.ts` exports `secondsToDuration(s: number): HaDuration`, `durationToSeconds(d: HaDuration | null | undefined): number | null`, `formatDuration(s: number): string`; `types.ts` exports the config model below.

- [ ] **Step 1: `frontend/package.json`, `.npmrc`**

```json
{
  "name": "activity-levels-panel",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "packageManager": "pnpm@10.33.3",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "lint": "eslint src test",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "lit": "^3.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-lit": "^2.0.0",
    "eslint-plugin-wc": "^3.0.0",
    "typescript": "^5.6.0",
    "typescript-eslint": "^8.0.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0",
    "jsdom": "^26.0.0"
  }
}
```
`.npmrc`: `engine-strict=true`.

(If `vite@7`/`vitest@3` pairings fail to resolve, use `vite@^6` and `vitest@^3`; record the versions actually locked in the report.)

- [ ] **Step 2: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "test", "vite.config.ts"]
}
```

- [ ] **Step 3: `vite.config.ts`**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
      fileName: () => "activity-levels-panel.js",
    },
    outDir: "../custom_components/activity_levels/frontend",
    emptyOutDir: true,
    target: "es2022",
    minify: true,
    sourcemap: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
  server: { port: 5173, cors: true, strictPort: true },
  test: { environment: "jsdom", include: ["test/**/*.test.ts"] },
});
```
(`test` needs `/// <reference types="vitest/config" />` at the top of the file or `import { defineConfig } from "vitest/config"`; use the latter.)

- [ ] **Step 4: `eslint.config.js`**

```js
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
```

- [ ] **Step 5: `src/types.ts`**

```ts
export type Mix = "sum" | "max" | "mean";
export type NullHandling = "zero" | "ignore";
export type Retrigger = "only_in_release" | "always";
export type Unavailable = "hold" | "note_off";

export interface EnvelopeOverrides {
  attack: number | null;
  decay: number | null;
  sustain: number | null;
  release: number | null;
  impulse: boolean | null;
  retrigger: Retrigger | null;
  unavailable: Unavailable | null;
  debounce: number | null;
}

export interface EnvelopePreset {
  id: string;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  impulse: boolean;
  retrigger: Retrigger | null;
  unavailable: Unavailable | null;
  debounce: number | null;
}

export interface Stimulus extends EnvelopeOverrides {
  entity: string;
  to: string[];
  gain: number;
  key: string | null;
  envelope: string | null;
}

export interface Group {
  id: string;
  name: string | null;
  area: string | null;
  mix: Mix;
  null_handling: NullHandling;
  max_value: number | null;
  precision: number | null;
  gain: number;
  stimuli: Stimulus[];
  children: Group[];
}

export interface Defaults {
  envelope: string;
  max_value: number;
  precision: number;
  unavailable: Unavailable;
  retrigger: Retrigger;
  debounce: number;
  safety_refresh: number;
  min_wake_interval: number;
}

export interface Config {
  version: 1;
  defaults: Defaults;
  envelopes: EnvelopePreset[];
  groups: Group[];
}

export interface ValidationError { path: string; message: string }

export interface GroupLive {
  value: number; raw_value: number; active: boolean; gated: boolean; active_voices: number;
  last_activity: number | null; cooldown_at: number | null; contributors: Record<string, number>;
  name: string; parent_id: string | null; precision: number; max_value: number; mix: Mix; next_wake: number | null;
}
export interface VoiceLive {
  label: string; entity: string | null; phase: "idle" | "attack" | "decay" | "sustain" | "release";
  value: number; gain: number; gate: boolean; phase_started: number | null; phase_ends: number | null;
}
export interface LiveState { now: number; groups: Record<string, GroupLive>; voices: Record<string, VoiceLive[]> }

export interface HaDuration { days?: number; hours: number; minutes: number; seconds: number; milliseconds?: number }

export interface HassEntity { entity_id: string; state: string; attributes: Record<string, unknown>; last_changed: string }
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  areas: Record<string, { area_id: string; name: string }>;
  entities: Record<string, { entity_id: string; name?: string; area_id?: string | null }>;
  user?: { is_admin: boolean; name: string };
  language: string;
  localize: (key: string, ...args: unknown[]) => string;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
}

export type Path = (string | number)[];
```

- [ ] **Step 6: `src/duration.ts` and its test (TDD)**

`test/duration.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { durationToSeconds, formatDuration, secondsToDuration } from "../src/duration";

describe("duration", () => {
  it("splits seconds into h/m/s", () => {
    expect(secondsToDuration(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(secondsToDuration(1800)).toEqual({ hours: 0, minutes: 30, seconds: 0 });
    expect(secondsToDuration(3723.5)).toEqual({ hours: 1, minutes: 2, seconds: 3.5 });
  });
  it("joins back including days and milliseconds", () => {
    expect(durationToSeconds({ hours: 1, minutes: 2, seconds: 3 })).toBe(3723);
    expect(durationToSeconds({ days: 1, hours: 0, minutes: 0, seconds: 0 })).toBe(86400);
    expect(durationToSeconds({ hours: 0, minutes: 0, seconds: 1, milliseconds: 500 })).toBe(1.5);
    expect(durationToSeconds(null)).toBeNull();
    expect(durationToSeconds(undefined)).toBeNull();
  });
  it("formats for humans", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(300)).toBe("5m");
    expect(formatDuration(3900)).toBe("1h 5m");
    expect(formatDuration(90.5)).toBe("1m 30.5s");
    expect(formatDuration(172800)).toBe("2d");
  });
});
```
`src/duration.ts`:
```ts
import type { HaDuration } from "./types";

export function secondsToDuration(total: number): HaDuration {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total - hours * 3600) / 60);
  const seconds = Math.round((total - hours * 3600 - minutes * 60) * 1000) / 1000;
  return { hours, minutes, seconds };
}

export function durationToSeconds(d: HaDuration | null | undefined): number | null {
  if (!d) return null;
  const s = (d.days ?? 0) * 86400 + d.hours * 3600 + d.minutes * 60 + d.seconds + (d.milliseconds ?? 0) / 1000;
  return Math.round(s * 1000) / 1000;
}

export function formatDuration(total: number): string {
  if (total === 0) return "0s";
  const parts: string[] = [];
  let rest = total;
  const units: [string, number][] = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [label, size] of units) {
    const n = Math.floor(rest / size);
    if (n > 0) { parts.push(`${n}${label}`); rest -= n * size; }
  }
  rest = Math.round(rest * 1000) / 1000;
  if (rest > 0) parts.push(`${rest}s`);
  return parts.join(" ");
}
```

- [ ] **Step 7: `src/main.ts` placeholder element** (replaced in Task 4)

```ts
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("activity-levels-panel")
export class ActivityLevelsPanel extends LitElement {
  render() { return html`<p style="padding:16px">Activity Levels panel is loading…</p>`; }
}
declare global { interface HTMLElementTagNameMap { "activity-levels-panel": ActivityLevelsPanel } }
```

- [ ] **Step 8: Install, test, build, commit the bundle**

```bash
cd frontend && pnpm install && pnpm lint && pnpm test && pnpm build
ls -la ../custom_components/activity_levels/frontend/
```
Expected: one file `activity-levels-panel.js`. Verify `git status` shows it as new; it is committed on purpose.

- [ ] **Step 9: `.github/workflows/frontend.yml`**

```yaml
name: frontend

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

concurrency:
  group: frontend-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
      - run: git diff --exit-code -- ../custom_components/activity_levels/frontend
```

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat(frontend): scaffold Lit/Vite/pnpm panel build with CI"
```

---

### Task 2: Panel registration (`panel.py`)

**Files:**
- Create: `custom_components/activity_levels/panel.py`, `tests/test_panel.py`
- Modify: `custom_components/activity_levels/__init__.py`, `manifest.json`, `const.py`

**Interfaces:**
- Produces: `async def async_register_panel(hass: HomeAssistant) -> None` (idempotent per HA run), `@callback def async_unregister_panel(hass) -> None`; constants `PANEL_URL_PATH = "activity-levels"`, `PANEL_ELEMENT = "activity-levels-panel"`, `STATIC_URL = "/activity_levels_panel"`, `DEV_SERVER_ENV = "ACTIVITY_LEVELS_DEV_SERVER"`.

- [ ] **Step 1: Failing tests**

`tests/test_panel.py`:
```python
from http import HTTPStatus

import pytest
from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.activity_levels.const import DOMAIN, PANEL_URL_PATH
from custom_components.activity_levels.schema import default_options, validate_config


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(default_options()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_panel_registered(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    panels = hass.data[frontend.DATA_PANELS]
    assert PANEL_URL_PATH in panels
    panel = panels[PANEL_URL_PATH]
    assert panel.sidebar_title == "Activity Levels"
    assert panel.require_admin is True
    custom = panel.config["_panel_custom"]
    assert custom["name"] == "activity-levels-panel"
    assert custom["module_url"].startswith("/activity_levels_panel/activity-levels-panel.js?v=")
    assert custom["embed_iframe"] is False


async def test_bundle_is_served(
    hass: HomeAssistant, hass_client: ClientSessionGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_client()
    resp = await client.get("/activity_levels_panel/activity-levels-panel.js")
    assert resp.status == HTTPStatus.OK
    body = await resp.text()
    assert "activity-levels-panel" in body


async def test_unload_removes_panel_and_reload_reregisters(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_URL_PATH not in hass.data[frontend.DATA_PANELS]
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_URL_PATH in hass.data[frontend.DATA_PANELS]


async def test_dev_server_override(
    hass: HomeAssistant, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("ACTIVITY_LEVELS_DEV_SERVER", "http://localhost:5173")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(default_options()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    custom = hass.data[frontend.DATA_PANELS][PANEL_URL_PATH].config["_panel_custom"]
    assert custom["module_url"] == "http://localhost:5173/src/main.ts"
    assert custom["trust_external"] is True
```

- [ ] **Step 2: Run to verify failure** — `uv run pytest tests/test_panel.py` fails (no constants / no panel).

- [ ] **Step 3: Implement**

`const.py` additions:
```python
PANEL_URL_PATH = "activity-levels"
PANEL_ELEMENT = "activity-levels-panel"
PANEL_TITLE = "Activity Levels"
PANEL_ICON = "mdi:pulse"
STATIC_URL = "/activity_levels_panel"
BUNDLE_NAME = "activity-levels-panel.js"
DEV_SERVER_ENV = "ACTIVITY_LEVELS_DEV_SERVER"
```

`panel.py`:
```python
"""Sidebar panel registration."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback

from .const import (
    BUNDLE_NAME,
    DEV_SERVER_ENV,
    DOMAIN,
    PANEL_ELEMENT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    STATIC_URL,
)

_STATIC_REGISTERED = f"{DOMAIN}_static_registered"
_FRONTEND_DIR = Path(__file__).parent / "frontend"


def _bundle_hash() -> str:
    bundle = _FRONTEND_DIR / BUNDLE_NAME
    if not bundle.is_file():
        return "missing"
    return hashlib.sha256(bundle.read_bytes()).hexdigest()[:12]


async def async_register_panel(hass: HomeAssistant) -> None:
    if not hass.data.get(_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(_FRONTEND_DIR), cache_headers=True)]
        )
        hass.data[_STATIC_REGISTERED] = True
    if PANEL_URL_PATH in hass.data.get(frontend.DATA_PANELS, {}):
        return
    dev_server = os.environ.get(DEV_SERVER_ENV)
    if dev_server:
        module_url = f"{dev_server.rstrip('/')}/src/main.ts"
        trust_external = True
    else:
        digest = await hass.async_add_executor_job(_bundle_hash)
        module_url = f"{STATIC_URL}/{BUNDLE_NAME}?v={digest}"
        trust_external = False
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_ELEMENT,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=module_url,
        embed_iframe=False,
        trust_external=trust_external,
        require_admin=True,
        config={},
    )


@callback
def async_unregister_panel(hass: HomeAssistant) -> None:
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
```

`__init__.py`: in `async_setup_entry`, after websocket registration: `await async_register_panel(hass)` and `entry.async_on_unload(lambda: async_unregister_panel(hass))`. `manifest.json` `dependencies`: `["http", "frontend", "panel_custom", "websocket_api"]`.

- [ ] **Step 4: Verify and commit**

```bash
uv run pytest && uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "feat: register the sidebar panel and serve the bundle"
```
If `frontend.async_remove_panel`'s signature differs on 2026.8.3, adapt (it is `async_remove_panel(hass, frontend_url_path, *, warn_if_unknown=True)` per source).

---

### Task 3: `state` payload additions for the panel

**Files:**
- Modify: `custom_components/activity_levels/websocket_api.py`, `coordinator.py`
- Test: `tests/test_websocket.py`

**Interfaces:**
- `activity_levels/state` → `{"now": float, "groups": {gid: {...GroupState, name, parent_id, precision, max_value, mix, raw_value, next_wake}}, "voices": {...}}`. `raw_value` = `group.value_at(now)` unrounded; `next_wake` = `coordinator.next_wake(root_id)` for root groups else `None`.

- [ ] **Step 1: Failing test** — extend `test_state_command`:
```python
    assert "now" in msg["result"]
    lr = groups["living_room"]
    assert lr["precision"] == 1 and lr["max_value"] == 5.0 and lr["mix"] == "sum"
    assert lr["raw_value"] == pytest.approx(2.0)
    assert lr["next_wake"] is None
    assert groups["house"]["next_wake"] is not None
```
- [ ] **Step 2: Implement** — add to `ActivityLevelsCoordinator` a method `group_details(self) -> dict[str, dict[str, Any]]` returning per group `{"precision", "max_value", "mix", "raw_value", "next_wake"}` (using one `t = self.now()`), and in `ws_state` merge it plus `"now": coordinator.now()`.
- [ ] **Step 3: Verify and commit**
```bash
uv run pytest && uv run ruff check . && uv run ruff format . && uv run mypy
git add -A && git commit -m "feat(ws): richer state payload for the panel"
```

---

### Task 4: Panel shell — store, api, loader, toolbar, tabs, load/save

**Files:**
- Create: `frontend/src/store.ts`, `frontend/src/errors.ts`, `frontend/src/api.ts`, `frontend/src/ha-elements.ts`, `frontend/src/styles.ts`, `frontend/src/activity-levels-panel.ts`
- Modify: `frontend/src/main.ts` (import the real element)
- Test: `frontend/test/store.test.ts`, `frontend/test/errors.test.ts`

**Interfaces:**
- `store.ts`: `getAt(obj, path)`, `setAt(obj, path, value)`, `removeAt(obj, path)`, `insertAt(obj, listPath, index, value)`, `moveAt(obj, listPath, from, to)` — all return new objects with structural sharing; `class Draft { readonly original: Config; config: Config; canUndo; canRedo; set(next: Config): void; undo(): void; redo(): void; reset(original: Config): void; get dirty(): boolean }`.
- `errors.ts`: `fieldErrors(errors: ValidationError[], prefix: Path): Record<string, string>` (errors whose path is `prefix/<field>` exactly) and `subtreeErrorCount(errors, prefix)`.
- `api.ts`: `getConfig(hass)`, `validateConfig(hass, cfg) → {ok, errors}`, `saveConfig(hass, cfg) → {ok, errors}` (normalizes both the `{ok:false, errors}` result and the `invalid_config` error into the same shape), `getState(hass) → LiveState`.
- `ha-elements.ts`: `ensureHaElements(timeoutMs = 8000): Promise<{ ok: boolean; missing: string[] }>` and the exported `HA_ELEMENTS` list.

- [ ] **Step 1: Tests first**

`test/store.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { Draft, getAt, insertAt, moveAt, removeAt, setAt } from "../src/store";
import type { Config } from "../src/types";

const base: Config = {
  version: 1,
  defaults: { envelope: "default", max_value: 5, precision: 1, unavailable: "hold", retrigger: "only_in_release", debounce: 0, safety_refresh: 60, min_wake_interval: 1 },
  envelopes: [{ id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null }],
  groups: [{ id: "house", name: "House", area: null, mix: "sum", null_handling: "zero", max_value: null, precision: null, gain: 1, stimuli: [], children: [
    { id: "kitchen", name: null, area: null, mix: "sum", null_handling: "zero", max_value: null, precision: null, gain: 1, stimuli: [], children: [] },
  ] }],
};

describe("path ops", () => {
  it("get/set with structural sharing", () => {
    const next = setAt(base, ["groups", 0, "children", 0, "name"], "Kitchen");
    expect(getAt(next, ["groups", 0, "children", 0, "name"])).toBe("Kitchen");
    expect(next.envelopes).toBe(base.envelopes);
    expect(next.groups).not.toBe(base.groups);
    expect(base.groups[0]!.children[0]!.name).toBeNull();
  });
  it("insert/remove/move in lists", () => {
    const g = { ...base.groups[0]!.children[0]!, id: "bath" };
    let next = insertAt(base, ["groups", 0, "children"], 1, g);
    expect(next.groups[0]!.children.map((c) => c.id)).toEqual(["kitchen", "bath"]);
    next = moveAt(next, ["groups", 0, "children"], 1, 0);
    expect(next.groups[0]!.children.map((c) => c.id)).toEqual(["bath", "kitchen"]);
    next = removeAt(next, ["groups", 0, "children", 0]);
    expect(next.groups[0]!.children.map((c) => c.id)).toEqual(["kitchen"]);
  });
});

describe("Draft", () => {
  it("tracks dirty, undo, redo", () => {
    const d = new Draft(base);
    expect(d.dirty).toBe(false);
    d.set(setAt(d.config, ["groups", 0, "name"], "Home"));
    expect(d.dirty).toBe(true);
    expect(d.canUndo).toBe(true);
    d.undo();
    expect(d.dirty).toBe(false);
    expect(d.canRedo).toBe(true);
    d.redo();
    expect(d.config.groups[0]!.name).toBe("Home");
    d.reset(d.config);
    expect(d.dirty).toBe(false);
    expect(d.canUndo).toBe(false);
  });
});
```
`test/errors.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { fieldErrors, subtreeErrorCount } from "../src/errors";

const errors = [
  { path: "groups/0/id", message: "bad id" },
  { path: "groups/0/children/1/stimuli/0/gain", message: "must be > 0" },
  { path: "groups/0/children/1", message: "needs a stimulus" },
];

describe("errors", () => {
  it("maps direct children of a prefix to fields", () => {
    expect(fieldErrors(errors, ["groups", 0])).toEqual({ id: "bad id" });
    expect(fieldErrors(errors, ["groups", 0, "children", 1, "stimuli", 0])).toEqual({ gain: "must be > 0" });
  });
  it("counts errors in a subtree including the node itself", () => {
    expect(subtreeErrorCount(errors, ["groups", 0])).toBe(3);
    expect(subtreeErrorCount(errors, ["groups", 0, "children", 1])).toBe(2);
    expect(subtreeErrorCount(errors, ["envelopes"])).toBe(0);
  });
});
```

- [ ] **Step 2: Implement `store.ts`**

```ts
import type { Config, Path } from "./types";

type Any = Record<string | number, unknown>;

export function getAt<T = unknown>(obj: unknown, path: Path): T {
  let cur: unknown = obj;
  for (const key of path) cur = (cur as Any)[key];
  return cur as T;
}

function clone(node: unknown): Any {
  return Array.isArray(node) ? [...node] as unknown as Any : { ...(node as Any) };
}

function update<T>(obj: T, path: Path, fn: (parent: Any, key: string | number) => void): T {
  if (path.length === 0) throw new Error("empty path");
  const root = clone(obj);
  let cur = root;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    const next = clone(cur[key]);
    cur[key] = next;
    cur = next;
  }
  fn(cur, path[path.length - 1]!);
  return root as unknown as T;
}

export function setAt<T>(obj: T, path: Path, value: unknown): T {
  return update(obj, path, (parent, key) => { parent[key] = value; });
}

export function removeAt<T>(obj: T, path: Path): T {
  return update(obj, path, (parent, key) => {
    if (Array.isArray(parent)) parent.splice(key as number, 1); else delete parent[key];
  });
}

export function insertAt<T>(obj: T, listPath: Path, index: number, value: unknown): T {
  return update(obj, [...listPath, index], (parent) => { (parent as unknown as unknown[]).splice(index, 0, value); });
}

export function moveAt<T>(obj: T, listPath: Path, from: number, to: number): T {
  return update(obj, [...listPath, from], (parent) => {
    const list = parent as unknown as unknown[];
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
  });
}

export class Draft {
  original: Config;
  config: Config;
  private past: Config[] = [];
  private future: Config[] = [];

  constructor(original: Config) { this.original = original; this.config = original; }
  get dirty(): boolean { return this.config !== this.original && JSON.stringify(this.config) !== JSON.stringify(this.original); }
  get canUndo(): boolean { return this.past.length > 0; }
  get canRedo(): boolean { return this.future.length > 0; }
  set(next: Config): void { this.past.push(this.config); this.future = []; this.config = next; }
  undo(): void { const prev = this.past.pop(); if (prev) { this.future.push(this.config); this.config = prev; } }
  redo(): void { const next = this.future.pop(); if (next) { this.past.push(this.config); this.config = next; } }
  reset(original: Config): void { this.original = original; this.config = original; this.past = []; this.future = []; }
}
```

- [ ] **Step 3: Implement `errors.ts`, `api.ts`, `ha-elements.ts`, `styles.ts`**

`errors.ts`:
```ts
import type { Path, ValidationError } from "./types";

export const pathKey = (p: Path): string => p.join("/");

export function fieldErrors(errors: ValidationError[], prefix: Path): Record<string, string> {
  const pre = pathKey(prefix);
  const out: Record<string, string> = {};
  for (const e of errors) {
    if (!e.path.startsWith(pre + "/")) continue;
    const rest = e.path.slice(pre.length + 1);
    if (!rest.includes("/")) out[rest] = e.message;
  }
  return out;
}

export function subtreeErrorCount(errors: ValidationError[], prefix: Path): number {
  const pre = pathKey(prefix);
  return errors.filter((e) => e.path === pre || e.path.startsWith(pre + "/")).length;
}
```
`api.ts`:
```ts
import type { Config, HomeAssistant, LiveState, ValidationError } from "./types";

interface ValidateResult { ok: boolean; errors: ValidationError[] }

export const getConfig = (hass: HomeAssistant) =>
  hass.callWS<{ config: Config }>({ type: "activity_levels/config/get" }).then((r) => r.config);

export const validateConfig = (hass: HomeAssistant, config: Config) =>
  hass.callWS<ValidateResult>({ type: "activity_levels/config/validate", config });

export async function saveConfig(hass: HomeAssistant, config: Config): Promise<ValidateResult> {
  try {
    return await hass.callWS<ValidateResult>({ type: "activity_levels/config/save", config });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    return { ok: false, errors: [{ path: "", message: e.message ?? String(err) }] };
  }
}

export const getState = (hass: HomeAssistant) => hass.callWS<LiveState>({ type: "activity_levels/state" });
```
`ha-elements.ts`:
```ts
export const HA_ELEMENTS = [
  "ha-card", "ha-icon", "ha-icon-button", "ha-alert", "ha-button", "ha-switch",
  "ha-expansion-panel", "ha-top-app-bar-fixed", "ha-menu-button", "ha-form", "ha-selector",
] as const;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function nudgeLoader(): Promise<void> {
  try {
    const w = window as unknown as { loadCardHelpers?: () => Promise<{ createCardElement: (c: unknown) => { constructor: { getConfigElement?: () => Promise<unknown> } } }> };
    const helpers = await w.loadCardHelpers?.();
    const card = helpers?.createCardElement({ type: "entities", entities: [] });
    await card?.constructor?.getConfigElement?.();
  } catch { /* best effort */ }
}

export async function ensureHaElements(timeoutMs = 8000): Promise<{ ok: boolean; missing: string[] }> {
  if (HA_ELEMENTS.every((t) => customElements.get(t))) return { ok: true, missing: [] };
  await nudgeLoader();
  const results = await Promise.all(
    HA_ELEMENTS.map((t) => Promise.race([customElements.whenDefined(t).then(() => true), sleep(timeoutMs).then(() => false)])),
  );
  const missing = HA_ELEMENTS.filter((_, i) => !results[i]);
  return { ok: missing.length === 0, missing: [...missing] };
}
```
`styles.ts`:
```ts
import { css } from "lit";

export const sharedStyles = css`
  :host { display: block; color: var(--primary-text-color); background: var(--primary-background-color); }
  .layout { display: grid; grid-template-columns: minmax(280px, 1fr) 2fr; gap: 16px; padding: 16px; }
  .layout.narrow { grid-template-columns: 1fr; }
  ha-card { padding: 16px; }
  .muted { color: var(--secondary-text-color); font-size: 0.9em; }
  .row { display: flex; align-items: center; gap: 8px; }
  .grow { flex: 1; }
  .tabs { display: flex; gap: 4px; padding: 0 16px; border-bottom: 1px solid var(--divider-color); }
  .tab { padding: 12px 16px; cursor: pointer; border-bottom: 2px solid transparent; color: var(--secondary-text-color); }
  .tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
  .error { color: var(--error-color, #db4437); }
  .meter { height: 6px; border-radius: 3px; background: var(--divider-color); overflow: hidden; width: 80px; }
  .meter > div { height: 100%; background: var(--primary-color); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--secondary-text-color); }
  .dot.gated { background: var(--primary-color); }
`;
```

- [ ] **Step 4: Implement `activity-levels-panel.ts` (shell)**

```ts
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getConfig, getState, saveConfig, validateConfig } from "./api";
import { ensureHaElements } from "./ha-elements";
import { Draft } from "./store";
import { sharedStyles } from "./styles";
import type { Config, HomeAssistant, LiveState, Path, ValidationError } from "./types";

type Tab = "groups" | "envelopes" | "defaults";

@customElement("activity-levels-panel")
export class ActivityLevelsPanel extends LitElement {
  static styles = [sharedStyles];

  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) narrow = false;

  @state() private draft?: Draft;
  @state() private tab: Tab = "groups";
  @state() private selection: Path | null = null;
  @state() private errors: ValidationError[] = [];
  @state() private banner: { kind: "error" | "warning" | "info"; text: string } | null = null;
  @state() private live: LiveState | null = null;
  @state() private liveOn = false;
  @state() private busy = false;
  @state() private missing: string[] = [];

  private liveTimer?: number;

  async connectedCallback() {
    super.connectedCallback();
    const { ok, missing } = await ensureHaElements();
    this.missing = ok ? [] : missing;
    await this.load();
  }

  disconnectedCallback() { super.disconnectedCallback(); this.stopLive(); }

  private async load() {
    try {
      const cfg = await getConfig(this.hass);
      this.draft = new Draft(cfg);
      this.errors = [];
      this.banner = null;
    } catch (err) {
      this.banner = { kind: "error", text: `Could not load configuration: ${(err as Error).message}` };
    }
  }

  private setConfig(next: Config) { this.draft?.set(next); this.requestUpdate(); }

  private async validate(): Promise<boolean> {
    if (!this.draft) return false;
    const r = await validateConfig(this.hass, this.draft.config);
    this.errors = r.errors;
    return r.ok;
  }

  private async save() {
    if (!this.draft) return;
    this.busy = true;
    try {
      if (!(await this.validate())) { this.banner = { kind: "error", text: `${this.errors.length} problem(s) to fix before saving.` }; return; }
      const r = await saveConfig(this.hass, this.draft.config);
      if (!r.ok) { this.errors = r.errors; this.banner = { kind: "error", text: r.errors[0]?.message ?? "Save failed" }; return; }
      this.banner = { kind: "info", text: "Saved. Activity Levels is reloading." };
      await new Promise((r) => setTimeout(r, 1500));
      await this.load();
    } finally { this.busy = false; }
  }

  private discard() { this.draft?.reset(this.draft.original); this.errors = []; this.banner = null; this.requestUpdate(); }

  private toggleLive(on: boolean) { this.liveOn = on; if (on) this.startLive(); else this.stopLive(); }
  private startLive() { this.stopLive(); const tick = async () => { try { this.live = await getState(this.hass); } catch { /* ignore */ } }; void tick(); this.liveTimer = window.setInterval(tick, 2000); }
  private stopLive() { if (this.liveTimer) { clearInterval(this.liveTimer); this.liveTimer = undefined; } this.live = null; }

  render() {
    if (this.missing.length) {
      return html`<div style="padding:16px"><p><strong>Activity Levels</strong>: some Home Assistant UI components did not load (${this.missing.join(", ")}). Open <em>Settings → Devices &amp; services</em> once, then return here and reload the page.</p></div>`;
    }
    const d = this.draft;
    return html`
      <ha-top-app-bar-fixed>
        <ha-menu-button slot="navigationIcon"></ha-menu-button>
        <div slot="title">Activity Levels</div>
        <div slot="actionItems" class="row">
          <span class="muted">Live</span>
          <ha-switch .checked=${this.liveOn} @change=${(e: Event) => this.toggleLive((e.target as HTMLInputElement).checked)}></ha-switch>
          <ha-icon-button .disabled=${!d?.canUndo} @click=${() => { d?.undo(); this.requestUpdate(); }} title="Undo"><ha-icon icon="mdi:undo"></ha-icon></ha-icon-button>
          <ha-icon-button .disabled=${!d?.canRedo} @click=${() => { d?.redo(); this.requestUpdate(); }} title="Redo"><ha-icon icon="mdi:redo"></ha-icon></ha-icon-button>
          <ha-button appearance="plain" .disabled=${!d?.dirty || this.busy} @click=${this.discard}>Discard</ha-button>
          <ha-button .disabled=${!d?.dirty || this.busy} @click=${this.save}>${d?.dirty ? "Save" : "Saved"}</ha-button>
        </div>
        ${this.banner ? html`<ha-alert alert-type=${this.banner.kind} dismissable @alert-dismissed-clicked=${() => (this.banner = null)}>${this.banner.text}</ha-alert>` : nothing}
        <div class="tabs">
          ${(["groups", "envelopes", "defaults"] as Tab[]).map((t) => html`<div class="tab ${this.tab === t ? "active" : ""}" @click=${() => (this.tab = t)}>${t[0]!.toUpperCase() + t.slice(1)}</div>`)}
        </div>
        ${d ? this.renderTab(d) : html`<p style="padding:16px">Loading…</p>`}
      </ha-top-app-bar-fixed>`;
  }

  private renderTab(d: Draft) {
    switch (this.tab) {
      case "groups":
        return html`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree .hass=${this.hass} .config=${d.config} .selection=${this.selection} .errors=${this.errors} .live=${this.live}
            @al-select=${(e: CustomEvent<Path>) => (this.selection = e.detail)}
            @al-change=${(e: CustomEvent<Config>) => this.setConfig(e.detail)}></al-tree>
          <div>${this.renderEditor(d)}</div>
        </div>`;
      case "envelopes":
        return html`<al-envelopes .hass=${this.hass} .config=${d.config} .errors=${this.errors} @al-change=${(e: CustomEvent<Config>) => this.setConfig(e.detail)}></al-envelopes>`;
      case "defaults":
        return html`<al-defaults .hass=${this.hass} .config=${d.config} .errors=${this.errors} @al-change=${(e: CustomEvent<Config>) => this.setConfig(e.detail)}></al-defaults>`;
    }
  }

  private renderEditor(d: Draft) {
    if (!this.selection) return html`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
    const isStimulus = this.selection[this.selection.length - 2] === "stimuli";
    return isStimulus
      ? html`<al-stimulus-editor .hass=${this.hass} .config=${d.config} .path=${this.selection} .errors=${this.errors} .live=${this.live} @al-change=${(e: CustomEvent<Config>) => this.setConfig(e.detail)}></al-stimulus-editor>`
      : html`<al-group-editor .hass=${this.hass} .config=${d.config} .path=${this.selection} .errors=${this.errors} @al-change=${(e: CustomEvent<Config>) => this.setConfig(e.detail)}></al-group-editor>`;
  }
}

declare global { interface HTMLElementTagNameMap { "activity-levels-panel": ActivityLevelsPanel } }
```
`main.ts` becomes `import "./activity-levels-panel"; import "./al-tree"; ...` (add each component import as it is created; for this task create placeholder elements `al-tree`, `al-group-editor`, `al-stimulus-editor`, `al-envelopes`, `al-defaults` that render `html\`<ha-card>TODO</ha-card>\`` so the shell builds; they are implemented in Tasks 5–7).

Note on `ha-button`: if `ha-button` is not defined on 2026.8 (it replaced `mwc-button` in 2025), fall back to `mwc-button`; keep the tag in `HA_ELEMENTS` accordingly.

- [ ] **Step 5: Verify, build, commit**

```bash
cd frontend && pnpm lint && pnpm test && pnpm build
cd .. && uv run pytest tests/test_panel.py
git add -A && git commit -m "feat(frontend): panel shell with draft store, loader, toolbar and tabs"
```

---

### Task 5: Tree pane + group and stimulus editors

**Files:**
- Create: `frontend/src/al-tree.ts`, `frontend/src/al-group-editor.ts`, `frontend/src/al-stimulus-editor.ts`, `frontend/src/al-override-field.ts`, `frontend/src/model.ts`
- Test: `frontend/test/model.test.ts`

**Interfaces:**
- `model.ts`: `newGroup(id: string): Group`, `newStimulus(entity: string): Stimulus`, `uniqueGroupId(config, base): string`, `groupAt(config, path): Group`, `parentListPath(path): Path`, `resolvedEnvelope(config, stimulus): Required<EnvelopeOverrides>` (stimulus → preset → defaults → built-ins: attack 0, decay 0, sustain 1, release 1800, impulse false, retrigger `defaults.retrigger`, unavailable `defaults.unavailable`, debounce `defaults.debounce`), `presetById(config, id)`.
- Events: `al-select` (detail `Path`), `al-change` (detail `Config`) bubble + composed.

- [ ] **Step 1: `model.ts` + tests**

`test/model.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { newGroup, newStimulus, resolvedEnvelope, uniqueGroupId } from "../src/model";
import type { Config } from "../src/types";

const cfg: Config = {
  version: 1,
  defaults: { envelope: "default", max_value: 5, precision: 1, unavailable: "hold", retrigger: "only_in_release", debounce: 0, safety_refresh: 60, min_wake_interval: 1 },
  envelopes: [
    { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
    { id: "media", attack: 10, decay: 300, sustain: 0.6, release: 900, impulse: false, retrigger: "always", unavailable: null, debounce: 5 },
  ],
  groups: [newGroup("house"), { ...newGroup("house_2"), children: [newGroup("kitchen")] }],
};

describe("model", () => {
  it("resolves envelope through stimulus, preset, defaults", () => {
    const s = { ...newStimulus("media_player.tv"), envelope: "media", release: 120 };
    const e = resolvedEnvelope(cfg, s);
    expect(e).toEqual({ attack: 10, decay: 300, sustain: 0.6, release: 120, impulse: false, retrigger: "always", unavailable: "hold", debounce: 5 });
    expect(resolvedEnvelope(cfg, newStimulus("binary_sensor.x")).release).toBe(1800);
  });
  it("generates unique ids across the tree", () => {
    expect(uniqueGroupId(cfg, "house")).toBe("house_3");
    expect(uniqueGroupId(cfg, "kitchen")).toBe("kitchen_2");
    expect(uniqueGroupId(cfg, "Living Room!")).toBe("living_room");
  });
});
```
`model.ts`:
```ts
import { getAt } from "./store";
import type { Config, EnvelopeOverrides, EnvelopePreset, Group, Path, Stimulus } from "./types";

export const newGroup = (id: string): Group => ({ id, name: null, area: null, mix: "sum", null_handling: "zero", max_value: null, precision: null, gain: 1, stimuli: [], children: [] });
export const newStimulus = (entity: string): Stimulus => ({ entity, to: ["on"], gain: 1, key: null, envelope: null, attack: null, decay: null, sustain: null, release: null, impulse: null, retrigger: null, unavailable: null, debounce: null });

export function allGroupIds(config: Config): Set<string> {
  const ids = new Set<string>();
  const walk = (g: Group) => { ids.add(g.id); g.children.forEach(walk); };
  config.groups.forEach(walk);
  return ids;
}

export function slugify(text: string): string {
  const s = text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "");
  return s || "group";
}

export function uniqueGroupId(config: Config, base: string): string {
  const ids = allGroupIds(config);
  const slug = slugify(base);
  if (!ids.has(slug)) return slug;
  let n = 2;
  while (ids.has(`${slug}_${n}`)) n++;
  return `${slug}_${n}`;
}

export const groupAt = (config: Config, path: Path): Group => getAt<Group>(config, path);
export const parentListPath = (path: Path): Path => path.slice(0, -1);
export const presetById = (config: Config, id: string | null | undefined): EnvelopePreset | undefined => config.envelopes.find((e) => e.id === (id ?? config.defaults.envelope));

export function resolvedEnvelope(config: Config, s: Partial<EnvelopeOverrides> & { envelope?: string | null }): Required<EnvelopeOverrides> {
  const p = presetById(config, s.envelope);
  const d = config.defaults;
  const pick = <T>(a: T | null | undefined, b: T | null | undefined, c: T): T => (a ?? b ?? c);
  return {
    attack: pick(s.attack, p?.attack, 0),
    decay: pick(s.decay, p?.decay, 0),
    sustain: pick(s.sustain, p?.sustain, 1),
    release: pick(s.release, p?.release, 1800),
    impulse: pick(s.impulse, p?.impulse, false),
    retrigger: pick(s.retrigger, p?.retrigger, d.retrigger),
    unavailable: pick(s.unavailable, p?.unavailable, d.unavailable),
    debounce: pick(s.debounce, p?.debounce, d.debounce),
  };
}
```

- [ ] **Step 2: `al-tree.ts`**

Renders `config.groups` recursively. For each group: an `ha-expansion-panel` (`outlined`, `expanded` by default for depth < 2) whose header row contains: name (or id), `subtreeErrorCount` badge, live meter (`live.groups[id].value / max_value`) and gated dot when `live` is set, and icon buttons: add stimulus (`mdi:plus`), add child group (`mdi:folder-plus`), move up/down (`mdi:arrow-up`/`mdi:arrow-down`, disabled at ends), delete (`mdi:delete`, `confirm()` before dispatching). Body: stimulus rows (entity friendly name from `hass.states[entity]?.attributes.friendly_name ?? entity`, current state chip, live phase chip when live), then child groups. Clicking a header selects the group path; clicking a stimulus row selects `[...groupPath, "stimuli", i]`. Top-level "Add root group" `ha-button`. Adds use `uniqueGroupId(config, "new_group")`; the entity for a new stimulus is `""` (the editor's entity picker fills it). All mutations dispatch `al-change` with the new config from `insertAt/removeAt/moveAt`, and `al-select` to the new item. Selected row gets `background: var(--secondary-background-color)`.

- [ ] **Step 3: `al-group-editor.ts`**

`ha-form` with `data = group` and schema:
```ts
[
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: [{ value: "sum", label: "Sum (mixer)" }, { value: "max", label: "Max (loudest)" }, { value: "mean", label: "Mean" }] } } },
  ...(group.mix === "mean" ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: [{ value: "zero", label: "Idle counts as 0" }, { value: "ignore", label: "Ignore idle" }] } } }] : []),
  ...(isRoot ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]),
]
```
plus two `al-override-field`s for `max_value` (number selector, box, min 0.1) and `precision` (select 0/1/2/3) with inherited hints from `config.defaults`. `computeLabel` maps names to labels; `computeHelper` gives one-line help; `error` from `fieldErrors(errors, path)`. On `value-changed`: `setAt(config, path, {...group, ...ev.detail.value})`; renaming `id` is allowed (a `muted` note says entities will be re-created). A "Delete group" plain button at the bottom (confirm).

- [ ] **Step 4: `al-override-field.ts`**

Props: `hass`, `label`, `selector` (HA selector object), `value` (nullable), `inherited` (the resolved value), `inheritedFrom` (text, e.g. "preset media" / "defaults"), `format` (fn to show the inherited value: duration → `formatDuration`, boolean → Yes/No, else String). Renders `ha-selector` (`.hass .selector .label .value=${value ?? undefined} .helper=${value == null ? \`Inherited from ${inheritedFrom}: ${format(inherited)}\` : "Overridden"}`) and, when `value != null`, an `ha-icon-button` (`mdi:backup-restore`, title "Reset to inherited") that dispatches `value-changed` with `null`. For duration selectors the value passed in/out is converted with `secondsToDuration`/`durationToSeconds` inside this element when `selector.duration` is present. For boolean overrides, use a `select` selector with options `[{value:"true",label:"Yes"},{value:"false",label:"No"}]` and convert.

- [ ] **Step 5: `al-stimulus-editor.ts`**

Top `ha-form` (data = stimulus, schema): `entity` (`{ entity: {} }`), `to` (text; the editor converts `string[]` ↔ comma-separated string), `gain` (number slider 0.1–10 step 0.1), `key` (text), `envelope` (select from `config.envelopes` ids plus `{value: "", label: "(default preset)"}` ↔ `null`). Then a "Envelope overrides" section of `al-override-field`s: attack/decay/release/debounce (duration), sustain (number 0–1 step 0.05 slider), impulse (boolean-as-select), retrigger/unavailable (select) — each with `inherited = resolvedEnvelope(config, stimulus)[name]` and `inheritedFrom = stimulus.envelope ?? config.defaults.envelope` (or "defaults" for the last three when the preset has null). An `al-envelope-sketch` (Task 6) shows the resolved envelope. When live is on, show the voice's phase and value from `live.voices[groupId]` matching `label = key ?? entity`. Errors via `fieldErrors(errors, path)` (also the group-level duplicate-label error whose path is the stimulus path itself → show as an `ha-alert`).

- [ ] **Step 6: Verify, build, commit**

```bash
cd frontend && pnpm lint && pnpm test && pnpm build && cd .. && git add -A && git commit -m "feat(frontend): tree pane, group and stimulus editors"
```
Manual check (optional but recommended): run `ACTIVITY_LEVELS_DEV_SERVER=http://localhost:5173` on the HA host (or use the built bundle), open the panel, add a group and a stimulus, save, confirm entities appear.

---

### Task 6: Envelopes tab, defaults tab, envelope sketch

**Files:**
- Create: `frontend/src/al-envelopes.ts`, `frontend/src/al-defaults.ts`, `frontend/src/al-envelope-sketch.ts`, `frontend/src/sketch.ts`
- Test: `frontend/test/sketch.test.ts`

**Interfaces:**
- `sketch.ts`: `envelopePoints(e: {attack, decay, sustain, release, impulse}, hold = 0.25): {x: number; y: number}[]` in a unit box (x 0..1 = time, y 0 = zero level, 1 = peak) — segments: attack rise, decay to sustain, sustain hold for `hold` fraction, release to 0; impulse = vertical rise then release; zero total duration → a flat line at 0.

- [ ] **Step 1: `sketch.ts` + test**

```ts
import { describe, expect, it } from "vitest";
import { envelopePoints } from "../src/sketch";

describe("envelopePoints", () => {
  it("draws A D S R in order and scales time to 1", () => {
    const pts = envelopePoints({ attack: 10, decay: 10, sustain: 0.5, release: 20, impulse: false });
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[pts.length - 1]!.y).toBe(0);
    expect(pts[pts.length - 1]!.x).toBeCloseTo(1);
    expect(Math.max(...pts.map((p) => p.y))).toBe(1);
  });
  it("impulse jumps straight to peak", () => {
    const pts = envelopePoints({ attack: 30, decay: 0, sustain: 1, release: 60, impulse: true });
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[1]).toEqual({ x: 0, y: 1 });
  });
  it("handles all-zero durations", () => {
    const pts = envelopePoints({ attack: 0, decay: 0, sustain: 1, release: 0, impulse: false });
    expect(pts.every((p) => p.y === 0 || p.y === 1)).toBe(true);
  });
});
```
`sketch.ts`:
```ts
export interface SketchEnvelope { attack: number; decay: number; sustain: number; release: number; impulse: boolean }

export function envelopePoints(e: SketchEnvelope, hold = 0.25): { x: number; y: number }[] {
  if (e.impulse) {
    const total = e.release || 1;
    return [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }].map((p, i) => (i === 2 ? { x: e.release / total, y: 0 } : p));
  }
  const timed = e.attack + e.decay + e.release;
  const holdLen = timed > 0 ? timed * hold / (1 - hold) : 1;
  const total = timed + holdLen;
  let t = 0;
  const pts = [{ x: 0, y: 0 }];
  t += e.attack; pts.push({ x: t / total, y: 1 });
  t += e.decay; pts.push({ x: t / total, y: e.sustain });
  t += holdLen; pts.push({ x: t / total, y: e.sustain });
  t += e.release; pts.push({ x: t / total, y: 0 });
  return pts;
}
```

- [ ] **Step 2: `al-envelope-sketch.ts`** — Lit element with `envelope` prop; renders an inline `<svg viewBox="0 0 200 80">` polyline from `envelopePoints`, stroke `var(--primary-color)`, fill with 15% opacity, light gridline at sustain level, and labels A/D/S/R under the segments using `formatDuration`. Purely presentational.

- [ ] **Step 3: `al-envelopes.ts`** — left list (`ha-card`) of presets with add (`uniqueGroupId`-style unique id `preset_n`) and delete (refuse to delete the preset referenced by `defaults.envelope` or by any stimulus — show `ha-alert` explaining where it is used); right editor: `ha-form` for `id`, `attack`/`decay`/`release` (duration), `sustain` (slider 0–1), `impulse` (boolean); `al-override-field`s for `retrigger`/`unavailable`/`debounce` inheriting from `config.defaults`; `al-envelope-sketch`; errors via `fieldErrors(errors, ["envelopes", i])`. Renaming a preset id rewrites references in `defaults.envelope` and every stimulus (`setAt` walk) in the same change.

- [ ] **Step 4: `al-defaults.ts`** — one `ha-form`: `envelope` (select of preset ids), `max_value` (number box), `precision` (select 0–3), `unavailable`/`retrigger` (select), `debounce`/`safety_refresh`/`min_wake_interval` (duration; convert). Helpers explain each (use the README's one-liners). Errors via `fieldErrors(errors, ["defaults"])`.

- [ ] **Step 5: Verify, build, commit**

```bash
cd frontend && pnpm lint && pnpm test && pnpm build && cd .. && git add -A && git commit -m "feat(frontend): envelope presets, defaults and ADSR sketch"
```

---

### Task 7: Live view polish, empty states, README, changelog

**Files:**
- Modify: `frontend/src/al-tree.ts`, `frontend/src/al-stimulus-editor.ts`, `README.md`, `CHANGELOG.md`
- Create: `frontend/README.md` (dev instructions)

- [ ] **Step 1: Live view** — in `al-tree`, when `live` is set: meter width = `value / max_value`, tooltip with `raw_value` (3 decimals) and `next_wake` countdown for roots (`formatDuration(next_wake - now)` using the payload's `now` to avoid clock skew); stimulus rows show the phase chip colored by phase (`attack`/`decay` primary, `sustain` success, `release` warning, `idle` muted) and value. In the stimulus editor show the voice's `phase_ends` countdown. Pause polling while `busy` (saving) and resume after reload.
- [ ] **Step 2: Empty states** — no groups: a card with "Add your first group" button; no stimuli in a selected group: hint text; `hass.user?.is_admin === false`: the panel shows a read-only notice (the backend already rejects non-admin).
- [ ] **Step 3: Docs** — `README.md`: replace the "coming in the next release" sentence with panel instructions (sidebar → Activity Levels; tabs; Save reloads the integration; Live toggle). `frontend/README.md`: `pnpm install`, `pnpm dev` + `ACTIVITY_LEVELS_DEV_SERVER=http://<dev-host>:5173` on the HA host, `pnpm build` (commit the bundle). `CHANGELOG.md` Unreleased: "Sidebar panel for editing groups, stimuli, envelopes and defaults; live view."
- [ ] **Step 4: Verify, build, commit**

```bash
cd frontend && pnpm lint && pnpm test && pnpm build && cd .. && uv run pytest && git add -A && git commit -m "feat(frontend): live view, empty states, docs"
```

---

## Self-review

**Spec coverage (§6):** 6.1 registration (`panel_custom`, static path, hashed `?v=`, dev server env) → Task 2. 6.2 layout — tree pane with expansion panels/rows/actions/reorder (up/down; drag deferred by ruling), editor pane with `ha-form` + selectors, override fields with inheritance hints, validation errors by path, Envelopes tab with sketch, Defaults tab, top bar with unsaved/Save/Discard/Live → Tasks 4–7. 6.3 data flow (get → draft → validate → save) with undo → Task 4. 6.4 maintenance guard (`ha-elements.ts` is the only file naming `ha-*`… note: editors reference `ha-form`/`ha-selector` tags in templates; the *loading* concern is centralized, and the tag names are stable — acceptable). §5.5 websocket additions → Task 3. §7 frontend CI (`pnpm build` + `git diff --exit-code`, vitest, tsc, eslint) → Task 1. Deferred-to-Plan-3 items from the Plan 2 ledger that are not UI: bool-accepting validators, schema rebuild, `GroupState` dict field, `_state_of` traversals, wall-clock note, admin-rejection test, `_create_devices` ordering, tautological unrecorded-attributes test — these remain deferred (hygiene plan after Plan 3).

**Placeholder scan:** Tasks 5–7 describe component behavior in prose plus schemas rather than full Lit templates — deliberate, since the templates are large and mechanical; every event name, prop, schema, and conversion rule is specified. Task 4 ships placeholder elements that Tasks 5–6 replace (stated).

**Type consistency:** `Path`, `Config`, `LiveState`, `ValidationError` (Task 1) used throughout; `Draft.set/undo/redo/reset/dirty/canUndo/canRedo` (Task 4) used by the shell; `fieldErrors/subtreeErrorCount` (Task 4) used by Tasks 5–6; `resolvedEnvelope/newGroup/newStimulus/uniqueGroupId` (Task 5) used by Tasks 5–6; `envelopePoints` (Task 6) used by the sketch; `GroupLive` fields match Task 3's payload (`raw_value`, `precision`, `max_value`, `mix`, `next_wake`, plus `now` at the top level).
