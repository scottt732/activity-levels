## What this changes

<!-- One or two sentences. The PR title is a Conventional Commit — `fix(engine): …` —
     because it becomes the changelog entry. See CONTRIBUTING.md. -->

## Why

<!-- The problem, or the issue it closes: `Closes #123`. -->

## Checklist

- [ ] The title is a Conventional Commit (`feat`, `fix`, `perf`, `refactor`, `docs`,
      `deps`, `chore`, `ci`, `test`, `build`) with `!` or a `BREAKING CHANGE:` footer if
      it breaks an existing configuration.
- [ ] `uv run ruff check . && uv run ruff format --check . && uv run mypy && uv run pytest` passes.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` passes, if the panel changed.
- [ ] The rebuilt panel bundle is committed, if anything under `frontend/src/` changed.
- [ ] New behaviour has a test.
- [ ] `README.md` is updated where it already covers this ground.
- [ ] No hand edits to `CHANGELOG.md` or to any `version` field — release-please owns them.
