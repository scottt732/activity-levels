# Contributing

Thanks for taking the time. Issues, discussions and pull requests are all welcome.

Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting set up

The repository is two halves: the Home Assistant integration in
`custom_components/activity_levels/` (Python 3.14, managed with
[uv](https://docs.astral.sh/uv/)) and the sidebar panel in `frontend/` (Lit +
TypeScript, built by Vite, managed with [pnpm](https://pnpm.io) on Node 24).

```bash
uv sync                      # Python dependencies, into .venv
cd frontend && pnpm install  # panel dependencies
```

## Checks

Run the side you touched; run both if you touched both. CI runs all of it.

```bash
# Python
uv run ruff check .
uv run ruff format --check .
uv run mypy
uv run pytest

# panel — from frontend/
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`uv run pytest` is quiet and fast by design. To see coverage the way CI measures it:

```bash
uv run pytest --cov=custom_components/activity_levels --cov-report=term-missing
cd frontend && pnpm coverage
```

Coverage reports (`coverage.xml`, `frontend/coverage/`) are ignored — don't commit them.

## The panel bundle is committed

`pnpm build` writes `custom_components/activity_levels/frontend/activity-levels-panel.js`,
and that file is checked in: HACS installs the integration straight from the repository,
with no build step. **Rebuild it and commit it with any change under `frontend/src/`.**
The frontend workflow runs `pnpm build` and then `git diff --exit-code` on that
directory, so a stale bundle fails CI. The build is deterministic — the same sources
produce the same bytes.

`frontend/README.md` covers running `pnpm dev` against a live Home Assistant.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/),
because [release-please](https://github.com/googleapis/release-please) reads them to
decide the next version and to write `CHANGELOG.md`. The subject line is what ends up
in the changelog, so write it for someone reading the release notes.

```
<type>(<optional scope>): <subject>
```

| Type | Bumps | Changelog section |
| --- | --- | --- |
| `feat` | patch while < 1.0.0, otherwise minor | Added |
| `fix` | patch | Fixed |
| `perf` | patch | Performance |
| `refactor` | patch | Changed |
| `docs` | patch | Documentation |
| `deps` | patch | Dependencies |
| `chore`, `ci`, `test`, `build`, `style`, `revert` | patch | hidden |

A breaking change is a `!` after the type/scope (`feat(api)!: …`) or a
`BREAKING CHANGE: …` footer. While the version is below 1.0.0 that bumps the **minor**,
not the major — 0.x is allowed to move.

Scopes in use: `engine`, `config`, `coordinator`, `api`, `panel`, `mixer`, `timeline`,
`patterns`, `simulation`, `switch`, `translations`, `frontend`, `readme`, `changelog`.

## Pull requests

- [ ] The subject line is a Conventional Commit.
- [ ] `uv run ruff check . && uv run ruff format --check . && uv run mypy && uv run pytest` passes.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` passes, if the panel changed.
- [ ] The rebuilt bundle is committed, if anything under `frontend/src/` changed.
- [ ] New behaviour has a test.
- [ ] User-visible changes are described in the commit subject and in `README.md` where
      the README already covers that ground.

Don't edit `CHANGELOG.md` or any `version` field by hand — release-please owns both.

## How a release happens

1. Anything merged to `main` updates a standing **release PR** titled `chore(main):
   release X.Y.Z`, which holds the changelog entry and the version bumps.
2. Merging that PR tags `vX.Y.Z` and publishes a GitHub release.
3. Publishing the release triggers `release.yml`, which checks the manifest version
   against the tag and attaches `activity_levels.zip` — the asset HACS downloads.

To force a particular version for one release, put `Release-As: 1.2.3` in a commit
footer.
