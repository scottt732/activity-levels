# Activity Levels panel

The Home Assistant sidebar panel: a [Lit](https://lit.dev) element bundled by Vite into
`custom_components/activity_levels/frontend/activity-levels-panel.js`, which the
integration serves and registers with `panel_custom`.

## Setup

```bash
pnpm install
```

## Working on it

```bash
pnpm dev        # Vite dev server on :5173, with hot reload
pnpm test       # vitest
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm build      # tsc --noEmit && vite build
```

To point a running Home Assistant at the dev server instead of the built bundle, set this
in the environment Home Assistant itself runs in and restart it:

```bash
ACTIVITY_LEVELS_DEV_SERVER=http://<dev-host>:5173
```

`<dev-host>` is the machine running `pnpm dev`, addressed from Home Assistant's point of
view — `localhost` only works when both run on the same host. The panel is then loaded as
`${ACTIVITY_LEVELS_DEV_SERVER}/src/main.ts`, registered as an external module, and served
by Vite with hot module replacement. Unset the variable and restart to go back to the
bundle.

## The bundle is committed

`pnpm build` writes into `custom_components/activity_levels/frontend/`, and that output is
checked in: HACS installs the integration straight from the repository, with no build step.
CI runs `pnpm build` and then `git diff --exit-code` on that directory, so **commit the
rebuilt bundle with any source change**. The build is deterministic — the same sources
produce the same bytes — and the integration serves it under a `?v=<sha256 prefix>` query
so browsers pick up a new one immediately.

## Layout

| File | What it holds |
| --- | --- |
| `activity-levels-panel.ts` | The shell: top bar, tabs, draft/save/live state. |
| `al-mixer.ts`, `al-strip.ts`, `al-master-strip.ts` | The Mixer row: one track strip per group, and the MASTER strip. |
| `al-fader.ts`, `al-meter.ts`, `fader.ts` | The fader (gain on a log scale, or a level on the group’s own) and the live meter. |
| `al-timeline.ts`, `timeseries.ts` | The history/forecast chart (plain SVG) and its pure scale/decimation math. |
| `al-strip-controls.ts` | The controls row for whatever is selected in the Mixer. |
| `al-patterns.ts` | The Patterns tab: profile status, per-group readiness, simulation log. |
| `al-tree.ts` | The group and stimulus tree, with the live overlay. |
| `al-group-editor.ts`, `al-stimulus-editor.ts` | Editors for one selected node. |
| `al-envelopes.ts`, `al-envelope-sketch.ts`, `sketch.ts` | Preset library and ADSR sketch. |
| `al-defaults.ts` | The site-wide defaults form. |
| `al-override-field.ts` | One nullable "inherit or override" field. |
| `navigation.ts` | The Mixer row: which groups are open, which track is selected, and where that is remembered. |
| `store.ts`, `model.ts`, `convert.ts`, `errors.ts`, `duration.ts` | Draft history, config helpers, selector conversions, error lookup. |
| `constants.ts` | Values more than one component needs to agree on. |
| `api.ts`, `save-flow.ts` | Websocket commands and the validate-then-save sequence. |
| `ha-elements.ts` | The one place that names Home Assistant's `ha-*` elements and waits for them to register. |
