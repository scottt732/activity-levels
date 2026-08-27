"""Sample configurations."""

from __future__ import annotations

from typing import Any


def house_config() -> dict[str, Any]:
    return {
        "version": 1,
        "defaults": {"envelope": "default", "min_wake_interval": 1},
        "envelopes": [
            {"id": "default", "release": "30m"},
            {"id": "momentary", "release": "10m", "impulse": True},
            {"id": "media", "attack": "10s", "decay": "5m", "sustain": 0.6, "release": "15m"},
        ],
        "groups": [
            {
                "id": "house",
                "name": "House",
                "mix": "max",
                "stimuli": [{"entity": "binary_sensor.front_door", "envelope": "momentary"}],
                "children": [
                    {
                        "id": "living_room",
                        "name": "Living Room",
                        "area": "living_room",
                        "stimuli": [
                            {"entity": "binary_sensor.living_motion", "gain": 2.0},
                            {"entity": "media_player.tv", "to": ["playing"], "envelope": "media"},
                        ],
                    },
                    {
                        "id": "kitchen",
                        "name": "Kitchen",
                        "gain": 0.5,
                        "stimuli": [{"entity": "binary_sensor.kitchen_motion", "release": "5m"}],
                    },
                ],
            }
        ],
    }


def rooms_config() -> dict[str, Any]:
    """A house with a real adjacency graph: two rooms, a hall, a patio you can leave by.

    `house` and `downstairs` declare no edges, so they are branches, not rooms -- which
    is what every topology test needs to have something to drop.
    """
    return {
        "version": 1,
        "defaults": {"envelope": "default", "min_wake_interval": 1},
        "envelopes": [{"id": "default", "release": "30m"}, {"id": "hour", "release": "1h"}],
        "groups": [
            {
                "id": "house",
                "name": "House",
                "mix": "max",
                "children": [
                    {
                        "id": "downstairs",
                        "name": "Downstairs",
                        "mix": "max",
                        "children": [
                            {
                                "id": "kitchen",
                                "name": "Kitchen",
                                "area": "kitchen_area",
                                "adjacent": ["dining_room", "back_patio"],
                                "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
                            },
                            {
                                "id": "dining_room",
                                "name": "Dining Room",
                                "area": "dining_area",
                                "adjacent": ["hall"],
                                "stimuli": [{"entity": "binary_sensor.dining_motion"}],
                            },
                            {
                                "id": "hall",
                                "name": "Hall",
                                "area": "hall_area",
                                "adjacent": [{"id": "bedroom", "one_way": True}],
                                "stimuli": [{"entity": "binary_sensor.hall_motion"}],
                            },
                            {
                                "id": "bedroom",
                                "name": "Bedroom",
                                "area": "bedroom_area",
                                "stimuli": [{"entity": "binary_sensor.bedroom_motion"}],
                            },
                            {
                                "id": "back_patio",
                                "name": "Back Patio",
                                "area": "patio_area",
                                "exit": True,
                                "stimuli": [{"entity": "binary_sensor.patio_motion"}],
                            },
                        ],
                    }
                ],
            }
        ],
    }


def presence_config() -> dict[str, Any]:
    """`rooms_config` with presence switched on and one tracked phone."""
    config = rooms_config()
    config["presence"] = {
        "enabled": True,
        "devices": [{"device": "device_tracker.scotts_phone", "name": "Scott"}],
        "envelope": "hour",
        "threshold": 0.6,
        "stuck_after": 60,
    }
    config["groups"][0]["children"][0]["children"][0]["presence"] = {"gain": 2.0}
    return config
