#!/usr/bin/env python3
"""Load an Activity Levels configuration into Home Assistant over the websocket API.

Usage:
    uv run python scripts/load_config.py examples/house.yaml \
        --url http://homeassistant.local:8123 --token "$HA_TOKEN"
    uv run python scripts/load_config.py examples/house.yaml --url ... --token ... --dry-run

Steps: parse YAML -> validate locally with the integration's schema -> connect -> check that every
stimulus entity exists -> activity_levels/config/validate -> activity_levels/config/save.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Any

import aiohttp
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from custom_components.activity_levels.schema import ConfigError, validate_config


def stimulus_entities(config: dict[str, Any]) -> set[str]:
    out: set[str] = set()

    def walk(group: dict[str, Any]) -> None:
        for s in group.get("stimuli", []):
            out.add(s["entity"])
        for child in group.get("children", []):
            walk(child)

    for g in config.get("groups", []):
        walk(g)
    return out


class WsClient:
    def __init__(self, session: aiohttp.ClientSession, url: str, token: str) -> None:
        self._session = session
        self._url = url.rstrip("/").replace("http://", "ws://").replace("https://", "wss://")
        self._token = token
        self._id = 0

    async def __aenter__(self) -> WsClient:
        self._ws = await self._session.ws_connect(f"{self._url}/api/websocket")
        auth_required = await self._ws.receive_json()
        assert auth_required["type"] == "auth_required", auth_required
        await self._ws.send_json({"type": "auth", "access_token": self._token})
        result = await self._ws.receive_json()
        if result["type"] != "auth_ok":
            raise SystemExit(f"Authentication failed: {result}")
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self._ws.close()

    async def call(self, msg: dict[str, Any]) -> dict[str, Any]:
        self._id += 1
        await self._ws.send_json({"id": self._id, **msg})
        while True:
            reply = await self._ws.receive_json()
            if reply.get("id") == self._id:
                return reply


async def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("config", type=Path, help="YAML or JSON configuration file")
    parser.add_argument(
        "--url", required=True, help="Home Assistant base URL, e.g. http://homeassistant.local:8123"
    )
    parser.add_argument("--token", required=True, help="Long-lived access token (admin user)")
    parser.add_argument("--dry-run", action="store_true", help="Validate only; do not save")
    parser.add_argument(
        "--allow-missing", action="store_true", help="Save even if stimulus entities are missing"
    )
    args = parser.parse_args()

    raw = yaml.safe_load(args.config.read_text())
    try:
        config = validate_config(raw)
    except ConfigError as err:
        print("Local validation failed:")
        for e in err.errors:
            print(f"  {e['path']}: {e['message']}")
        return 2
    n_presets = len(config["envelopes"])
    n_entities = len(stimulus_entities(config))
    print(f"Local validation OK: {n_presets} presets, {n_entities} stimulus entities")

    async with aiohttp.ClientSession() as session, WsClient(session, args.url, args.token) as ws:
        states = await ws.call({"type": "get_states"})
        known = {s["entity_id"] for s in states.get("result", [])}
        missing = sorted(stimulus_entities(config) - known)
        if missing:
            print(f"{len(missing)} stimulus entities do not exist in Home Assistant:")
            for m in missing:
                print(f"  {m}")
            if not args.allow_missing:
                print("Fix the ids (or pass --allow-missing) and try again.")
                return 3

        reply = await ws.call({"type": "activity_levels/config/validate", "config": config})
        if not reply.get("success"):
            print(f"Server validate failed: {json.dumps(reply.get('error'))}")
            return 4
        if not reply["result"]["ok"]:
            print("Server validation errors:")
            for e in reply["result"]["errors"]:
                print(f"  {e['path']}: {e['message']}")
            return 4
        print("Server validation OK")

        if args.dry_run:
            print("Dry run: not saving.")
            return 0

        reply = await ws.call({"type": "activity_levels/config/save", "config": config})
        if not reply.get("success") or not reply["result"].get("ok"):
            print(f"Save failed: {json.dumps(reply)}")
            return 5
        print("Saved. Activity Levels is reloading; check the sidebar panel.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
