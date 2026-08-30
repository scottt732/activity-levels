"""Sample configurations, and a fake Bermuda install to discover."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

PHONE_ADDRESS = "aa:bb:cc:dd:ee:ff"


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
                                "area": "dining_room_area",
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
                                "area": "back_patio_area",
                                "exit": True,
                                "stimuli": [{"entity": "binary_sensor.patio_motion"}],
                            },
                        ],
                    }
                ],
            }
        ],
    }


def kinds_config() -> dict[str, Any]:
    """The layering the spec describes, written out: property -> structure -> floor -> area,
    with an outside branch beside the house.

    `house_config` and `rooms_config` deliberately carry no kinds at all: they are what
    every document written before this release looks like, and they are what the migration
    tests load. This one is what the panel writes back.
    """
    return {
        "version": 1,
        "defaults": {"envelope": "default", "min_wake_interval": 1},
        "envelopes": [{"id": "default", "release": "30m"}],
        "groups": [
            {
                "id": "property",
                "kind": "property",
                "name": "Property",
                "mix": "max",
                "children": [
                    {
                        "id": "house",
                        "kind": "structure",
                        "name": "House",
                        "mix": "max",
                        "children": [
                            {
                                "id": "downstairs",
                                "kind": "floor",
                                "name": "Downstairs",
                                "floor_id": "downstairs",
                                "mix": "max",
                                "children": [
                                    {
                                        "id": "kitchen",
                                        "kind": "area",
                                        "name": "Kitchen",
                                        "area_id": "kitchen",
                                        "adjacent": [
                                            {"id": "hall", "connection": "open"},
                                            {"id": "back_patio", "connection": "exterior_door"},
                                        ],
                                        "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
                                    },
                                    {
                                        "id": "hall",
                                        "kind": "area",
                                        "name": "Hall",
                                        "area_id": "hall",
                                        "stimuli": [{"entity": "binary_sensor.hall_motion"}],
                                    },
                                ],
                            }
                        ],
                    },
                    {
                        "id": "back_patio",
                        "kind": "outside",
                        "name": "Back Patio",
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.patio_motion"}],
                    },
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


@dataclass
class FakeBermuda:
    """What a fake Bermuda install looks like from the registries.

    Bermuda gives each tracked device one ``device_tracker`` -- named "Bermuda Tracker",
    the same on every device, with ``has_entity_name`` putting the device in front of it
    -- plus a ``sensor`` per scanner keyed ``<device unique id>_<scanner address>_range``.
    Around those sit near misses that discovery has to reject: an unfiltered
    ``_range_raw`` twin of every reading, the device's own closest-range ``_range``, and
    its area. Each scanner is a device of its own carrying its address as an identifier.
    That is the whole contract we consume, so it is the whole thing this fake reproduces.
    """

    entry: MockConfigEntry
    tracker: str  # device_tracker entity id
    sensors: dict[str, str]  # room id -> distance sensor entity id
    scanner_devices: dict[str, str]  # room id -> device registry id
    areas: dict[str, str]  # room id -> area id


def fake_bermuda(
    hass: HomeAssistant,
    rooms: tuple[str, ...] = ("kitchen", "dining_room", "hall", "bedroom", "back_patio"),
    *,
    disabled: tuple[str, ...] = (),
    unmapped: tuple[str, ...] = (),
) -> FakeBermuda:
    """Register a Bermuda entry with one scanner per room and one tracked phone.

    ``disabled`` names rooms whose distance sensor is registered but switched off (which
    is how Bermuda ships them). ``unmapped`` names rooms whose scanner device is given no
    area at all, so nothing can place it.
    """
    # The presence side keys off the loaded component, not off any Bermuda import.
    hass.config.components.add("bermuda")
    entry = MockConfigEntry(domain="bermuda", data={}, title="Bermuda BLE Trilateration")
    entry.add_to_hass(hass)

    areas = ar.async_get(hass)
    devices = dr.async_get(hass)
    entities = er.async_get(hass)

    phone = devices.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={("bermuda", PHONE_ADDRESS)},
        name="Scott's Phone",
    )
    tracker = entities.async_get_or_create(
        "device_tracker",
        "bermuda",
        PHONE_ADDRESS,
        config_entry=entry,
        device_id=phone.id,
        original_name="Bermuda Tracker",
        has_entity_name=True,
        suggested_object_id="scotts_phone",
    )
    # device-level entities that are not per-scanner readings; discovery must ignore
    # both, and the second only differs from a reading by having no scanner in the middle
    for suffix in ("_area", "_range"):
        entities.async_get_or_create(
            "sensor",
            "bermuda",
            f"{PHONE_ADDRESS}{suffix}",
            config_entry=entry,
            device_id=phone.id,
            suggested_object_id=f"scotts_phone{suffix}",
        )

    sensors: dict[str, str] = {}
    scanner_devices: dict[str, str] = {}
    room_areas: dict[str, str] = {}
    for index, room in enumerate(rooms):
        address = f"11:22:33:44:55:{index:02d}"
        area = areas.async_get_or_create(f"{room}_area")
        room_areas[room] = area.id
        scanner = devices.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={("bermuda", address)},
            name=f"{room} scanner",
        )
        if room not in unmapped:
            devices.async_update_device(scanner.id, area_id=area.id)
        scanner_devices[room] = scanner.id
        sensor = entities.async_get_or_create(
            "sensor",
            "bermuda",
            f"{PHONE_ADDRESS}_{address}_range",
            config_entry=entry,
            device_id=phone.id,
            original_device_class="distance",
            suggested_object_id=f"scotts_phone_distance_to_{room}",
            disabled_by=er.RegistryEntryDisabler.INTEGRATION if room in disabled else None,
        )
        # the unfiltered twin Bermuda ships beside every reading: same scanner, same
        # units, and taking it too would count every distance a second time
        entities.async_get_or_create(
            "sensor",
            "bermuda",
            f"{PHONE_ADDRESS}_{address}_range_raw",
            config_entry=entry,
            device_id=phone.id,
            original_device_class="distance",
            suggested_object_id=f"scotts_phone_unfiltered_distance_to_{room}",
        )
        sensors[room] = sensor.entity_id

    return FakeBermuda(
        entry=entry,
        tracker=tracker.entity_id,
        sensors=sensors,
        scanner_devices=scanner_devices,
        areas=room_areas,
    )
