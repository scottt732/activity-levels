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
