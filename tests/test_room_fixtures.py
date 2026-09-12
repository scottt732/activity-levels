import pytest
import voluptuous as vol

from custom_components.activity_levels.geometry import fixtures
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config


def fixture(**changes):
    return {"entity": "binary_sensor.motion", "kind": "motion", "position": [1, 2, 3], **changes}


def test_placements_normalize_and_round_trip():
    source = house_config()
    source["groups"][0]["fixtures"] = [fixture()]
    config = validate_config(source)
    placed = config["groups"][0]["fixtures"][0]
    assert placed["range"] == 0
    assert placed["yaw"] == 0
    assert validate_config(config) == config


@pytest.mark.parametrize(
    "changes",
    [
        {"entity": "switch.invalid"},
        {"entity": "light.ceiling"},
        {"position": [1, 2]},
        {"position": [1, 2, float("nan")]},
        {"fov": 180},
        {"vertical_fov": 0},
        {"range": -1},
        {"pitch": 91},
        {"kind": "window", "width": 0},
        {"kind": "window", "height": float("nan")},
    ],
)
def test_reject_invalid_placements(changes):
    with pytest.raises(vol.Invalid):
        fixtures([fixture(**changes)])


def test_entity_uniqueness_and_kind():
    with pytest.raises(vol.Invalid):
        fixtures([fixture(), fixture()])
    assert fixtures([fixture(entity="light.ceiling", kind="light")])[0]["kind"] == "light"


def test_personal_profiles_round_trip_and_reject_duplicate_ids():
    from custom_components.activity_levels.schema import ConfigError

    config = house_config()
    profile = {
        "id": "personal:motion",
        "name": "My PIR",
        "kind": "motion",
        "fov": 100,
        "vertical_fov": 40,
        "range": 5,
        "match": {"manufacturer": "Acme", "model": "PIR"},
    }
    config["sensor_profiles"] = [profile]
    normalized = validate_config(config)
    assert validate_config(normalized) == normalized
    assert normalized["sensor_profiles"][0]["match"]["model"] == "PIR"
    config["sensor_profiles"] = [profile, profile]
    with pytest.raises(ConfigError, match="duplicate profile id"):
        validate_config(config)
    config["sensor_profiles"] = [{**profile, "range": -1}]
    with pytest.raises(ConfigError):
        validate_config(config)


def test_window_contact_dimensions_round_trip():
    source = house_config()
    source["groups"][0]["fixtures"] = [
        fixture(entity="binary_sensor.window", kind="window", width=1.4, height=1.2, yaw=90)
    ]
    config = validate_config(source)
    window = config["groups"][0]["fixtures"][0]
    assert window["kind"] == "window"
    assert window["width"] == 1.4
    assert window["height"] == 1.2
    assert validate_config(config) == config


def test_openings_and_look_down_round_trip():
    source = house_config()
    source["groups"][0]["openings"] = [
        {"id": "front", "kind": "exterior_door", "position": [0, 1, 0]},
        {
            "id": "hall",
            "kind": "open_wall",
            "position": [2, 1, 0],
            "width": 2,
            "height": 2.4,
        },
    ]
    source["groups"][0]["fixtures"] = [fixture(look_down=True)]
    config = validate_config(source)
    door = config["groups"][0]["openings"][0]
    assert door["hinge"] == "left"
    assert door["swing"] == "in"
    assert door["open"] is False
    assert "entity" not in door
    assert config["groups"][0]["fixtures"][0]["look_down"] is True
    assert "look_down" not in fixtures([fixture()])[0]
    assert validate_config(config) == config


def test_opening_contacts_support_shared_zones_and_independent_contacts():
    source = house_config()
    source["groups"][0]["openings"] = [
        {
            "id": f"bay_{index}",
            "kind": "window",
            "position": [index, 0, 1],
            "entities": ["binary_sensor.bay_zone"],
        }
        for index in range(4)
    ] + [
        {
            "id": "patio",
            "kind": "exterior_door",
            "position": [0, 1, 0],
            "entities": ["binary_sensor.patio_left", "binary_sensor.patio_right"],
        },
        {"id": "unmonitored", "kind": "window", "position": [0, 2, 1], "entities": []},
        {
            "id": "legacy",
            "kind": "interior_door",
            "position": [0, 3, 0],
            "entity": "binary_sensor.legacy",
        },
        {
            "id": "mixed",
            "kind": "interior_door",
            "position": [0, 4, 0],
            "entity": "binary_sensor.legacy",
            "entities": ["binary_sensor.additional"],
        },
    ]
    config = validate_config(source)
    placed = config["groups"][0]["openings"]
    assert all(item["entities"] == ["binary_sensor.bay_zone"] for item in placed[:4])
    assert placed[4]["entities"] == ["binary_sensor.patio_left", "binary_sensor.patio_right"]
    assert placed[5]["entities"] == []
    assert placed[6]["entity"] == "binary_sensor.legacy"
    assert "entities" not in placed[6]
    assert placed[7]["entity"] == "binary_sensor.legacy"
    assert placed[7]["entities"] == ["binary_sensor.additional"]
    assert validate_config(config) == config


@pytest.mark.parametrize(
    "changes",
    [
        {"id": ""},
        {"entity": "light.invalid"},
        {"entities": ["light.invalid"]},
        {"entities": ["binary_sensor."]},
        {"entities": ["binary_sensor.Uppercase"]},
        {"entities": ["binary_sensor.zone", "binary_sensor.zone"]},
        {"entities": [f"binary_sensor.zone_{index}" for index in range(129)]},
        {"entities": "binary_sensor.zone"},
        {"entities": [None]},
        {"width": 0},
        {"height": float("inf")},
        {"yaw": 361},
        {"hinge": "top"},
        {"swing": "sideways"},
        {"open": "true"},
        {"position": [0, 0]},
    ],
)
def test_invalid_openings(changes):
    from custom_components.activity_levels.geometry import openings

    with pytest.raises(vol.Invalid):
        openings([{"id": "door", "kind": "interior_door", "position": [0, 0, 0], **changes}])


def test_opening_ids_are_unique_and_count_is_bounded():
    from custom_components.activity_levels.geometry import openings

    door = {"id": "door", "kind": "interior_door", "position": [0, 0, 0]}
    with pytest.raises(vol.Invalid):
        openings([door, door])
    with pytest.raises(vol.Invalid):
        openings([{**door, "id": str(index)} for index in range(129)])
    with pytest.raises(vol.Invalid):
        fixtures([fixture(look_down="true")])
