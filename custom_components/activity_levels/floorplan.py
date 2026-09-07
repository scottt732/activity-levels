"""Read ESPresense measurements without importing its configuration or hierarchy."""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import unquote

import voluptuous as vol
import yaml
from yaml.nodes import MappingNode, ScalarNode

from .geometry import GPS_SCHEMA, bounds, points

MAX_IMPORT_LENGTH = 1_000_000
MAX_FLOORS = 128
MAX_ROOMS = 2048


class FloorplanError(ValueError):
    """A source path and a user-readable reason an import cannot be previewed."""


class _ImportLoader(yaml.SafeLoader):
    """Construct only selected root values, so unrelated !secret tags stay unread."""

    def construct_mapping(self, node: MappingNode, deep: bool = False) -> dict[Any, Any]:
        keys: set[Any] = set()
        for key_node, _ in node.value:
            # YAML merge keys deliberately allow an explicit value to override an
            # anchor. Check duplicates before SafeLoader expands those inherited keys.
            if key_node.tag == "tag:yaml.org,2002:merge":
                continue
            key = self.construct_object(key_node, deep=deep)
            if not isinstance(key, str):
                raise FloorplanError("Configuration keys must be strings")
            if key in keys:
                raise FloorplanError(f"Duplicate key: {key}")
            keys.add(key)
        return super().construct_mapping(node, deep=deep)


def _document(text: str) -> dict[str, Any]:
    if len(text) > MAX_IMPORT_LENGTH:
        raise FloorplanError("Import is too large (maximum 1 MB of text)")
    # A normal YAML document must not be decoded: percent escapes may be intentional
    # room names. The editor artifact has encoded line breaks and no literal ones.
    plain_root = re.search(r"(?:^|[\s{,])(?:gps|floors):(?:[ \t]+|[\[{])", text)
    if "\n" not in text.strip() and "%0a" in text.lower() and not plain_root:
        text = unquote(text, errors="strict")
    loader = _ImportLoader(text)
    try:
        root = loader.get_single_node()
        if not isinstance(root, MappingNode):
            raise FloorplanError("Expected a YAML mapping with gps or floors")
        result: dict[str, Any] = {}
        for key_node, value_node in root.value:
            if not isinstance(key_node, ScalarNode) or key_node.value not in ("gps", "floors"):
                continue
            key = key_node.value
            if key in result:
                raise FloorplanError(f"Duplicate root key: {key}")
            result[key] = loader.construct_object(value_node, deep=True)
        if not result:
            raise FloorplanError("No gps or floors found in the configuration")
        return result
    finally:
        loader.dispose()


def _mapping(value: Any, path: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise FloorplanError(f"{path}: expected a mapping")
    return value


def _list(value: Any, path: str, maximum: int) -> list[Any]:
    if not isinstance(value, list) or len(value) > maximum:
        raise FloorplanError(f"{path}: expected a list of at most {maximum} entries")
    return value


def _identity(value: dict[str, Any], path: str) -> tuple[str | None, str]:
    source_id, name = value.get("id"), value.get("name")
    if source_id is not None and (not isinstance(source_id, str) or not source_id.strip()):
        raise FloorplanError(f"{path}/id: expected a non-empty string")
    if name is None:
        name = source_id
    if not isinstance(name, str) or not name.strip():
        raise FloorplanError(f"{path}/name: provide a name or id")
    return source_id, name


def _geometry(validator: Any, value: Any, path: str) -> Any:
    try:
        return validator(value)
    except vol.Invalid as err:
        suffix = "/".join(str(part) for part in err.path)
        raise FloorplanError(f"{path}{'/' + suffix if suffix else ''}: {err.msg}") from err


def parse_floorplan(text: str) -> dict[str, Any]:
    """Produce independent mapping rows; this function never reads or writes a draft."""
    try:
        document = _document(text)
    except (yaml.YAMLError, RecursionError, UnicodeError, ValueError) as err:
        if isinstance(err, FloorplanError):
            raise
        # YAML exceptions can include a source excerpt containing unrelated credentials.
        # Return the location without reflecting the pasted configuration.
        mark = getattr(err, "problem_mark", None)
        location = f" at line {mark.line + 1}, column {mark.column + 1}" if mark else ""
        raise FloorplanError(
            f"Invalid YAML{location}; check indentation and incomplete lines"
        ) from err
    result: dict[str, Any] = {"items": []}
    if "gps" in document:
        gps = _mapping(document["gps"], "gps")
        result["gps"] = _geometry(
            GPS_SCHEMA,
            {
                key: gps[key]
                for key in ("latitude", "longitude", "elevation", "rotation")
                if key in gps
            },
            "gps",
        )
    room_count = 0
    for i, raw in enumerate(_list(document.get("floors", []), "floors", MAX_FLOORS)):
        path = f"floors/{i}"
        floor = _mapping(raw, path)
        source_id, name = _identity(floor, path)
        item: dict[str, Any] = {
            "key": path,
            "source_id": source_id,
            "name": name,
            "kind": "floor",
            "context": "",
        }
        if "bounds" in floor:
            item["bounds"] = _geometry(bounds, floor["bounds"], f"{path}/bounds")
        result["items"].append(item)
        for j, raw_room in enumerate(_list(floor.get("rooms", []), f"{path}/rooms", MAX_ROOMS)):
            room_count += 1
            if room_count > MAX_ROOMS:
                raise FloorplanError(f"floors: at most {MAX_ROOMS} rooms can be imported at once")
            room_path = f"{path}/rooms/{j}"
            room = _mapping(raw_room, room_path)
            room_id, room_name = _identity(room, room_path)
            polygon = _geometry(points, room.get("points"), f"{room_path}/points")
            row: dict[str, Any] = {
                "key": room_path,
                "source_id": room_id,
                "name": room_name,
                "kind": "area",
                "context": name,
                "points": polygon,
            }
            if "bounds" in item:
                row["bounds"] = [
                    [min(p[0] for p in polygon), min(p[1] for p in polygon), item["bounds"][0][2]],
                    [max(p[0] for p in polygon), max(p[1] for p in polygon), item["bounds"][1][2]],
                ]
            result["items"].append(row)
    return result
