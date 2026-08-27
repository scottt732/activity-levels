#!/usr/bin/env bash
# Rebuild the committed panel bundle and fail if the staged copy is stale.
#
# `pnpm build` runs `tsc --noEmit && vite build`, so this typechecks the panel too. The
# build is deterministic: unchanged sources reproduce the same bytes and this is a no-op.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

bundle=custom_components/activity_levels/frontend

pnpm -C frontend build

if ! git diff --quiet -- "$bundle"; then
  echo
  echo "The panel bundle was out of date and has been rebuilt."
  echo "Stage it and commit again:"
  echo
  echo "    git add $bundle"
  echo
  exit 1
fi
