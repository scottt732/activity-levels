"""Import measurements without importing the source home's configuration."""

from urllib.parse import quote

import pytest

from custom_components.activity_levels.floorplan import FloorplanError, parse_floorplan
from custom_components.activity_levels.schema import ConfigError, validate_config
from tests.fixtures import house_config

SOURCE = """
mqtt:
  password: !secret mqtt_password
nodes: [{name: Old scanner, point: [1, 2, 3]}]
gps: {latitude: 38.8, longitude: -77, elevation: 13, rotation: 25}
floors:
  - id: basement
    name: Basement
    bounds: [[4.18, 0, 11.8], [11.58, 9.54, 13.8]]
    rooms:
      - name: Laundry Room
        points: [[4.18, 4.77], [4.18, 9.54], [4.18, 9.54], [11.58, 9.54],
                 [11.58, 4.77], [4.18, 4.77]]
"""


def test_complete_config_extracts_only_geometry_and_keeps_room_height():
    result = parse_floorplan(SOURCE)
    assert set(result) == {"gps", "items"}
    assert result["gps"]["rotation"] == 25
    floor, room = result["items"]
    assert floor["source_id"] == "basement"
    assert floor["bounds"] == [[4.18, 0, 11.8], [11.58, 9.54, 13.8]]
    assert room["name"] == "Laundry Room"
    assert room["context"] == "Basement"
    assert room["points"] == [[4.18, 4.77], [4.18, 9.54], [11.58, 9.54], [11.58, 4.77]]
    assert room["bounds"] == [[4.18, 4.77, 11.8], [11.58, 9.54, 13.8]]
    assert "mqtt" not in str(result)


def test_encoded_paste_and_json_are_supported():
    assert parse_floorplan(quote(SOURCE)) == parse_floorplan(SOURCE)
    assert parse_floorplan('{"gps":{"latitude":0,"longitude":0}}')["gps"] == {
        "latitude": 0,
        "longitude": 0,
    }


def test_yaml_merge_overrides_and_anchors_from_ignored_roots():
    result = parse_floorplan(
        "defaults: &origin {latitude: 1, longitude: 2}\ngps: {<<: *origin, latitude: 3}\n"
    )
    assert result["gps"] == {"latitude": 3, "longitude": 2}


def test_literal_percent_escapes_in_normal_yaml_are_not_decoded():
    result = parse_floorplan('floors: [{name: "Floor%0Aone", rooms: []}]')
    assert result["items"][0]["name"] == "Floor%0Aone"


def test_room_without_floor_bounds_does_not_invent_height():
    result = parse_floorplan(
        "floors: [{name: Old, rooms: [{name: Room, points: [[0,0],[2,0],[0,2]]}]}]"
    )
    assert "bounds" not in result["items"][1]


@pytest.mark.parametrize(
    "source, message",
    [
        ("mqtt: {host: localhost}", "gps or floors"),
        ("- floors", "mapping"),
        ("floors: text", "floors"),
        ("floors: [null]", "floors/0"),
        ("floors: [{name: Floor, bounds: [[0,0,2],[2,2,1]]}]", "bounds"),
        ("floors: [{name: Floor, rooms: [{name: Room, points: [[0,0],[1,1],[2,2]]}]}]", "points"),
        (
            "floors: [{name: Floor, rooms: [{name: Room, points: [[0,0],[1,0],[0,.inf]]}]}]",
            "points",
        ),
        (
            "floors: [{name: Floor, rooms: [{name: Room, points: [[0,0],[1,0],[true,2]]}]}]",
            "points",
        ),
        ("gps: {latitude: 91, longitude: 0}", "latitude"),
        ("gps: {latitude: 0, longitude: .nan}", "longitude"),
        ("gps: {latitude: 0}", "longitude"),
        ("gps: {latitude: 0, latitude: 1, longitude: 0}", "Duplicate"),
        ("gps: {}\ngps: {}", "Duplicate"),
        ("floors:\n  …- [7.80, 0.0]", "floors"),
        ("floors: [", "YAML"),
    ],
)
def test_invalid_imports_have_actionable_errors(source, message):
    with pytest.raises(FloorplanError, match=message):
        parse_floorplan(source)


def test_input_is_bounded():
    with pytest.raises(FloorplanError, match="large"):
        parse_floorplan(" " * 1_000_001)


def test_geometry_round_trips_without_changing_activity_settings():
    cfg = house_config()
    original = validate_config(cfg)
    imported = parse_floorplan(SOURCE)
    cfg["gps"] = imported["gps"]
    room = imported["items"][1]
    cfg["groups"][0]["children"][0].update(points=room["points"], bounds=room["bounds"])
    saved = validate_config(cfg)
    assert validate_config(saved) == saved
    assert saved["gps"] == imported["gps"]
    child = saved["groups"][0]["children"][0]
    assert child["bounds"][0][2] == 11.8
    assert {k: v for k, v in child.items() if k not in ("points", "bounds")} == original["groups"][
        0
    ]["children"][0]
    assert "gps" not in original
    assert "bounds" not in original["groups"][0]


@pytest.mark.parametrize("field,value", [("points", [[0, 0]]), ("bounds", [[0, 0, 0], [0, 2, 3]])])
def test_saved_config_rejects_invalid_geometry(field, value):
    cfg = house_config()
    cfg["groups"][0][field] = value
    with pytest.raises(ConfigError):
        validate_config(cfg)
