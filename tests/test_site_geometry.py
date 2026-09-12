"""Property decoration stays validated plain geometry, independent of HA state."""

import pytest
import voluptuous as vol

from custom_components.activity_levels.geometry import SITE_SCHEMA
from custom_components.activity_levels.schema import CONFIG_SCHEMA


def test_site_roundtrip():
    site = {
        "ground_z": 12.886,
        "features": [
            {"name": "Driveway", "kind": "driveway", "points": [[0, 0], [10, 0], [10, 3]]}
        ],
    }
    assert CONFIG_SCHEMA({"version": 1, "site": site})["site"] == site


@pytest.mark.parametrize(
    "patch",
    [
        {"kind": "room"},
        {"points": [[0, 0], [1, 1], [2, 2]]},
        {"points": [[0, 0], [1, 0], [float("nan"), 2]]},
        {"name": ""},
    ],
)
def test_invalid_feature(patch):
    feature = {"name": "Lawn", "kind": "lawn", "points": [[0, 0], [1, 0], [1, 2]], **patch}
    with pytest.raises(vol.Invalid):
        SITE_SCHEMA({"features": [feature]})
