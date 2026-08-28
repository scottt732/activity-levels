#!/usr/bin/env python3
"""Write `custom_components/activity_levels/config.schema.json` from the voluptuous schema.

Usage:
    uv run python scripts/export_schema.py            # write the file
    uv run python scripts/export_schema.py --check    # fail if it is out of date

The committed file is what the integration serves to editors, so it has to be rebuilt
whenever `schema.py` changes shape. `tests/test_schema_json.py` fails on a stale one the
same way the frontend workflow fails on a stale panel bundle.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from custom_components.activity_levels.schema_json import SCHEMA_FILE, render


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check", action="store_true", help="exit non-zero if the committed file is stale"
    )
    args = parser.parse_args()

    fresh = render()
    committed = SCHEMA_FILE.read_text(encoding="utf-8") if SCHEMA_FILE.is_file() else None
    if args.check:
        if committed == fresh:
            print(f"{SCHEMA_FILE.name} is up to date")
            return 0
        print(
            f"{SCHEMA_FILE} is out of date; run 'uv run python scripts/export_schema.py'",
            file=sys.stderr,
        )
        return 1
    if committed == fresh:
        print(f"{SCHEMA_FILE.name} is already up to date")
        return 0
    SCHEMA_FILE.write_text(fresh, encoding="utf-8")
    print(f"wrote {SCHEMA_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
