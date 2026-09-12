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
