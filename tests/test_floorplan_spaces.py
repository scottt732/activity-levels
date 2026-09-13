"""Geometry-only rooms persist without joining the activity or entity trees."""

from copy import deepcopy

import pytest

from custom_components.activity_levels.schema import ConfigError, validate_config
from custom_components.activity_levels.schema_json import json_schema
from custom_components.activity_levels.tree import build_tree
from tests.fixtures import house_config

SPACE = {
    "id": "coat_closet",
    "name": "Coat closet",
    "parent_id": "living_room",
    "bounds": [[0, 0, 0], [1, 2, 2.4]],
    "points": [[0, 0], [1, 0], [1, 2], [0, 2]],
    "openings": [{"id": "door", "kind": "interior_door", "position": [0.5, 0, 0]}],
}


def config_with_spaces(*spaces):
    return {**house_config(), "spaces": deepcopy(list(spaces))}


def test_spaces_roundtrip_without_activity_groups():
    original = validate_config(house_config())
    config = validate_config(config_with_spaces(SPACE))
    assert validate_config(config) == config
    assert config["groups"] == original["groups"]
    assert set(build_tree(config).groups) == set(build_tree(original).groups)
    assert config["spaces"][0]["openings"][0]["width"] == 0.9


@pytest.mark.parametrize(
    "patch",
    [
        {"id": "living_room"},
        {"parent_id": "missing"},
        {"parent_id": "house"},
        {"parent_id": "coat_closet"},
        {"bounds": [[0, 0, 0], [0, 2, 3]]},
        {"bounds": [[0, 0, 0], [1, 2, float("nan")]]},
        {"stimuli": []},
        {"area_id": "closet"},
        {"children": []},
    ],
)
def test_spaces_reject_invalid_or_activity_fields(patch):
    with pytest.raises(ConfigError):
        validate_config(config_with_spaces({**SPACE, **patch}))


def test_spaces_require_geometry_and_global_unique_ids():
    with pytest.raises(ConfigError):
        validate_config(config_with_spaces(SPACE, SPACE))
    space = {key: value for key, value in SPACE.items() if key != "bounds"}
    with pytest.raises(ConfigError):
        validate_config(config_with_spaces(space))
    with pytest.raises(ConfigError):
        validate_config(config_with_spaces(*[{**SPACE, "id": f"closet_{i}"} for i in range(513)]))


def test_space_schema_export():
    spaces = json_schema()["properties"]["spaces"]
    assert spaces["maxItems"] == 512
    assert set(spaces["items"]["required"]) == {"id", "name", "parent_id", "bounds"}
    assert spaces["items"]["additionalProperties"] is False
