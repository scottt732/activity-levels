"""Architectural objects persist independently of activity and device configuration."""

import pytest
import voluptuous as vol

from custom_components.activity_levels.geometry import architecture
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config

OBJECT = {
    "id": "stair",
    "kind": "stairs",
    "position": [0, 0, 0],
    "width": 1,
    "run": 4,
    "height": 2.5,
    "landing_top": 0.8,
    "under_room": "server_closet",
}


def test_architecture_roundtrip():
    config = house_config()
    config["groups"][0]["children"][0]["architecture"] = [OBJECT]
    saved = validate_config(config)
    objects = saved["groups"][0]["children"][0]["architecture"]
    assert objects[0]["under_room"] == "server_closet"
    assert objects[0]["steps"] == 14
    assert validate_config(saved) == saved


@pytest.mark.parametrize(
    "patch",
    [
        {"width": 0},
        {"steps": 1.5},
        {"height": float("nan")},
        {"landing_bottom": 4},
        {"kind": "device"},
    ],
)
def test_architecture_invalid(patch):
    with pytest.raises(vol.Invalid):
        architecture([{**OBJECT, **patch}])


def test_architecture_duplicate_ids():
    with pytest.raises(vol.Invalid):
        architecture([OBJECT, OBJECT])


@pytest.mark.parametrize(
    "kind", ["ceiling_fan", "recessed_light", "pendant_light", "recessed_speaker"]
)
def test_ceiling_fixture_roundtrip(kind):
    fixture = {**OBJECT, "kind": kind, "drop": 0.5, "shape": "globe", "entity": "light.ceiling"}
    assert architecture(architecture([fixture])) == architecture([fixture])


def test_chimney_floor_list():
    chimney = {**OBJECT, "kind": "chimney", "floors": ["basement", "first", "second"]}
    assert architecture([chimney])[0]["floors"] == chimney["floors"]
    for patch in ({"floors": ["first", "first"]}, {"drop": -1}, {"shape": "unknown"}):
        with pytest.raises(vol.Invalid):
            architecture([{**chimney, **patch}])
