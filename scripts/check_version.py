"""Assert that every file carrying the version agrees on it.

release-please bumps `custom_components/activity_levels/manifest.json`,
`pyproject.toml` and `frontend/package.json` in one commit. This catches a bump that
only reached some of them — a manifest that disagrees with the tag would ship a
release HACS reports the wrong version for.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

MANIFEST = Path("custom_components/activity_levels/manifest.json")
PYPROJECT = Path("pyproject.toml")
PACKAGE_JSON = Path("frontend/package.json")

_MARKED_VERSION = re.compile(
    r'^\s*version\s*=\s*"([^"]+)"\s*#\s*x-release-please-version\s*$', re.MULTILINE
)


def _json_version(path: Path) -> str:
    return str(json.loads((ROOT / path).read_text(encoding="utf-8"))["version"])


def _marked_version(path: Path) -> str:
    match = _MARKED_VERSION.search((ROOT / path).read_text(encoding="utf-8"))
    if match is None:
        raise SystemExit(f"{path}: no version line marked `# x-release-please-version`")
    return match.group(1)


def versions() -> dict[Path, str]:
    """The version each file carries, keyed by its path relative to the repository root."""
    return {
        MANIFEST: _json_version(MANIFEST),
        PYPROJECT: _marked_version(PYPROJECT),
        PACKAGE_JSON: _json_version(PACKAGE_JSON),
    }


def main() -> int:
    found = versions()
    if len(set(found.values())) == 1:
        print(f"version {next(iter(found.values()))} agrees across {len(found)} files")
        return 0
    print("version mismatch:", file=sys.stderr)
    for path, version in found.items():
        print(f"  {path}: {version}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
