from pathlib import Path
from typing import Any

import pytest
import yaml

from custom_components.activity_levels.const import (
    ALLOWED_CHILDREN,
    DEFAULT_CHILD_KIND,
    KIND_PROPERTY,
    KINDS,
)
from custom_components.activity_levels.schema import (
    CONFIG_SCHEMA,
    ConfigError,
    default_options,
    infer_kinds,
    validate,
    validate_config,
)
from tests.fixtures import house_config, kinds_config, presence_config, rooms_config

LEGACY_HOUSE = Path(__file__).parent / "fixtures" / "legacy_house.yaml"
EXAMPLE_HOUSE = Path(__file__).parents[1] / "examples" / "house.yaml"


def legacy_house_config() -> dict[str, Any]:
    """The example house as it was written before kinds existed: the real migration."""
    return yaml.safe_load(LEGACY_HOUSE.read_text())


def test_default_options_validate() -> None:
    cfg = validate_config(default_options())
    assert cfg["groups"] == []
    assert cfg["envelopes"][0]["id"] == "default"
    assert cfg["defaults"]["min_wake_interval"] == 1.0
    assert cfg["defaults"]["safety_refresh"] == 60.0


def test_retrigger_defaults_to_stacking_always_and_accepts_every_mode() -> None:
    cfg = validate_config(house_config())
    assert cfg["defaults"]["retrigger"] == "always"
    assert cfg["defaults"]["stack"] is True
    for mode in ("always", "after_attack", "after_decay", "release", "idle"):
        picked = house_config()
        picked["defaults"]["retrigger"] = mode
        picked["defaults"]["stack"] = False
        picked["envelopes"][0]["retrigger"] = mode
        picked["envelopes"][0]["stack"] = True
        out = validate_config(picked)
        assert out["defaults"]["retrigger"] == mode and out["defaults"]["stack"] is False
        assert out["envelopes"][0]["retrigger"] == mode
        assert out["envelopes"][0]["stack"] is True


@pytest.mark.parametrize(
    ("legacy", "when", "stack"),
    [
        ("only_in_release", "release", False),
        ("always", "always", False),
        ("stack", "always", True),
    ],
)
def test_legacy_retrigger_is_rewritten_into_the_split_pair(
    legacy: str, when: str, stack: bool
) -> None:
    """Everywhere the setting can appear: defaults, a preset, a stimulus, a presence block."""
    cfg = house_config()
    cfg["defaults"]["retrigger"] = legacy
    cfg["envelopes"][0]["retrigger"] = legacy
    kitchen = cfg["groups"][0]["children"][1]
    kitchen["stimuli"][0]["retrigger"] = legacy
    kitchen["presence"] = {"retrigger": legacy}
    out = validate_config(cfg)
    assert (out["defaults"]["retrigger"], out["defaults"]["stack"]) == (when, stack)
    assert (out["envelopes"][0]["retrigger"], out["envelopes"][0]["stack"]) == (when, stack)
    stim = out["groups"][0]["children"][1]["stimuli"][0]
    assert (stim["retrigger"], stim["stack"]) == (when, stack)
    presence = out["groups"][0]["children"][1]["presence"]
    assert (presence["retrigger"], presence["stack"]) == (when, stack)
    # Idempotent: the rewritten document reads back as itself, which is what a panel
    # round trip through validate() depends on.
    assert validate_config(out) == out


def test_an_explicit_stack_beside_always_is_left_alone() -> None:
    """`always` is the one legacy spelling that is also a new one; `stack` disambiguates."""
    cfg = house_config()
    cfg["defaults"]["retrigger"] = "always"
    cfg["defaults"]["stack"] = True
    out = validate_config(cfg)
    assert out["defaults"]["retrigger"] == "always" and out["defaults"]["stack"] is True


def test_sustain_may_exceed_one() -> None:
    cfg = house_config()
    cfg["envelopes"][0]["sustain"] = 2.5
    cfg["groups"][0]["stimuli"][0]["sustain"] = 3.0
    out = validate_config(cfg)
    assert out["envelopes"][0]["sustain"] == 2.5
    assert out["groups"][0]["stimuli"][0]["sustain"] == 3.0


def test_envelope_presets_carry_an_optional_label_and_keep_their_order() -> None:
    cfg = house_config()
    cfg["envelopes"][0]["label"] = "Thirty Minutes"
    out = validate_config(cfg)
    assert out["envelopes"][0]["label"] == "Thirty Minutes"
    assert out["envelopes"][1]["label"] is None
    assert [e["id"] for e in out["envelopes"]] == [e["id"] for e in cfg["envelopes"]]


def test_house_config_normalizes() -> None:
    cfg = validate_config(house_config())
    env = {e["id"]: e for e in cfg["envelopes"]}
    assert env["default"]["release"] == 1800.0
    assert env["media"]["attack"] == 10.0 and env["media"]["sustain"] == 0.6
    house = cfg["groups"][0]
    assert house["mix"] == "max" and house["gain"] == 1.0
    assert house["max_value"] is None
    assert house["precision"] is None
    lr = house["children"][0]
    assert lr["stimuli"][0]["to"] == ["on"]
    assert lr["stimuli"][1]["to"] == ["playing"]
    assert house["children"][1]["stimuli"][0]["release"] == 300.0
    assert house["children"][1]["gain"] == 0.5


def errors_of(config: dict) -> dict[str, str]:
    with pytest.raises(ConfigError) as exc:
        validate_config(config)
    return {e["path"]: e["message"] for e in exc.value.errors}


def test_duplicate_group_ids_reported_with_path() -> None:
    cfg = house_config()
    cfg["groups"][0]["children"][1]["id"] = "living_room"
    errs = errors_of(cfg)
    assert "groups/0/children/1/id" in errs


def test_unknown_envelope_reference() -> None:
    cfg = house_config()
    cfg["groups"][0]["stimuli"][0]["envelope"] = "nope"
    assert "groups/0/stimuli/0/envelope" in errors_of(cfg)


def test_group_needs_stimulus_or_child() -> None:
    cfg = house_config()
    cfg["groups"][0]["children"][1]["stimuli"] = []
    assert "groups/0/children/1" in errors_of(cfg)


def test_bad_group_id_and_bad_entity_and_ranges() -> None:
    cfg = house_config()
    cfg["groups"][0]["id"] = "House 1"
    cfg["groups"][0]["stimuli"][0]["entity"] = "front_door"
    cfg["groups"][0]["stimuli"][0]["gain"] = 0
    cfg["envelopes"][2]["sustain"] = -1.5
    errs = errors_of(cfg)
    assert {
        "groups/0/id",
        "groups/0/stimuli/0/entity",
        "groups/0/stimuli/0/gain",
        "envelopes/2/sustain",
    } <= set(errs)


def test_duplicate_stimulus_entity_needs_key() -> None:
    cfg = house_config()
    lr = cfg["groups"][0]["children"][0]
    lr["stimuli"].append({"entity": "binary_sensor.living_motion", "envelope": "momentary"})
    assert "groups/0/children/0/stimuli/2" in errors_of(cfg)
    lr["stimuli"][2]["key"] = "motion_impulse"
    validate_config(cfg)


def test_default_envelope_must_exist() -> None:
    cfg = house_config()
    cfg["defaults"]["envelope"] = "missing"
    assert "defaults/envelope" in errors_of(cfg)


def test_version_must_be_one() -> None:
    cfg = house_config()
    cfg["version"] = 2
    assert "version" in errors_of(cfg)


def test_patterns_and_simulation_defaults() -> None:
    cfg = validate_config(default_options())
    p = cfg["defaults"]["patterns"]
    assert p["rebuild_time"] == "03:00" and p["history_days"] == 180 and p["min_days"] == 14
    assert p["calendars"] == [] and p["day_type_precedence"] == ["holiday", "weekend", "weekday"]
    assert cfg["defaults"]["simulation"] == {"away_entity": None, "quiet_hours": ["01:00", "05:30"]}


def test_group_simulation_and_calendar_validation() -> None:
    cfg = house_config()
    cfg["defaults"]["patterns"] = {
        "calendars": [{"id": "school_year", "entity": "calendar.school"}]
    }
    cfg["groups"][0]["simulation"] = {"lights": {"include": ["light.hall"]}}
    out = validate_config(cfg)
    assert out["defaults"]["patterns"]["day_type_precedence"] == [
        "school_year",
        "holiday",
        "weekend",
        "weekday",
    ]
    assert out["groups"][0]["simulation"] == {
        "enabled": True,
        "lights": {"include": ["light.hall"], "exclude": []},
    }
    cfg["defaults"]["patterns"]["calendars"].append({"id": "school_year", "entity": "calendar.x"})
    assert "defaults/patterns/calendars/1/id" in errors_of(cfg)
    cfg["defaults"]["patterns"]["calendars"] = [{"id": "bad", "entity": "sensor.not_a_calendar"}]
    assert "defaults/patterns/calendars/0/entity" in errors_of(cfg)
    cfg["defaults"]["patterns"] = {}
    cfg["defaults"]["simulation"] = {"quiet_hours": ["25:00", "05:00"]}
    assert "defaults/simulation/quiet_hours" in errors_of(cfg)


def test_empty_day_type_precedence_is_rejected() -> None:
    """An empty list is not "use the defaults"; it is a config with no day types."""
    cfg = house_config()
    cfg["defaults"]["patterns"] = {"day_type_precedence": []}
    assert "defaults/patterns/day_type_precedence" in errors_of(cfg)


def test_adjacency_and_exits_normalize() -> None:
    cfg = validate_config(rooms_config())
    rooms = {g["id"]: g for g in cfg["groups"][0]["children"][0]["children"]}
    assert rooms["kitchen"]["adjacent"] == [
        {"id": "dining_room", "connection": "door", "one_way": False},
        {"id": "back_patio", "connection": "door", "one_way": False},
    ]
    assert rooms["hall"]["adjacent"] == [{"id": "bedroom", "connection": "door", "one_way": True}]
    assert rooms["back_patio"]["exit"] is True
    assert rooms["kitchen"]["exit"] is False
    assert rooms["kitchen"]["presence"]["gain"] == 1.0
    assert rooms["kitchen"]["presence"]["envelope"] is None
    assert rooms["kitchen"]["presence"]["activity_floor"] is None


def test_a_room_may_override_the_activity_floor() -> None:
    config = rooms_config()
    kitchen = config["groups"][0]["children"][0]["children"][0]
    kitchen["presence"] = {"activity_floor": 1.0}
    cfg = validate_config(config)
    assert cfg["groups"][0]["children"][0]["children"][0]["presence"]["activity_floor"] == 1.0
    kitchen["presence"] = {"activity_floor": 0}
    assert "groups/0/children/0/children/0/presence/activity_floor" in errors_of(config)


CARRIED_DEFAULTS = {
    "prior": 0.7,
    "flip": 300.0,
    "recent": 120.0,
    "weights": {"charging": -3.0, "moving": 2.0, "still_room_empty": -2.0, "jitter": 1.0},
}


def test_presence_defaults_and_absence() -> None:
    assert validate_config(house_config())["presence"] == {
        "enabled": False,
        "devices": [],
        "people": [],
        "envelope": None,
        "threshold": 0.6,
        "stay": 0.9,
        "escape": 0.001,
        "scale": 3.0,
        "floor": 0.05,
        "stuck_after": 60.0,
        "activity": {"floor": 0.05},
        "carried": CARRIED_DEFAULTS,
        "scanner_areas": {},
    }


def test_a_legacy_devices_list_becomes_one_device_people() -> None:
    """The list this shipped with keeps loading; the normalised document says `people`."""
    cfg = validate_config(presence_config())
    assert cfg["presence"]["devices"] == []
    assert cfg["presence"]["people"] == [
        {
            "name": "Scott",
            "person": None,
            "devices": [
                {
                    "tracker": "device_tracker.scotts_phone",
                    "name": None,
                    "kind": "other",
                    "companion": None,
                    "signals": {"activity": None, "steps": None, "battery_state": None},
                }
            ],
        }
    ]
    # idempotent: the normalised document reads back as itself
    assert validate_config(cfg) == cfg


def test_a_legacy_device_a_person_already_lists_is_not_doubled() -> None:
    config = presence_config()
    config["presence"]["people"] = [
        {"name": "Scott", "devices": [{"tracker": "device_tracker.scotts_phone", "kind": "phone"}]}
    ]
    people = validate_config(config)["presence"]["people"]
    assert len(people) == 1 and len(people[0]["devices"]) == 1
    assert people[0]["devices"][0]["kind"] == "phone"


def test_a_legacy_device_with_no_name_stays_nameless_for_discovery_to_name() -> None:
    config = rooms_config()
    config["presence"] = {"enabled": True, "devices": [{"device": "device_tracker.phone"}]}
    assert validate_config(config)["presence"]["people"][0]["name"] is None


def test_people_normalise_with_a_person_a_companion_and_signals() -> None:
    config = rooms_config()
    config["presence"] = {
        "enabled": True,
        "people": [
            {
                "name": "Scott",
                "person": "person.scott",
                "devices": [
                    {
                        "tracker": "device_tracker.scotts_phone_ble",
                        "kind": "phone",
                        "companion": "device_tracker.scotts_iphone",
                        "signals": {"activity": "sensor.scotts_iphone_activity"},
                    },
                    {
                        "tracker": "device_tracker.scotts_watch_ble",
                        "name": "Watch",
                        "kind": "watch",
                    },
                ],
            }
        ],
        "carried": {"prior": 0.5, "weights": {"charging": -5}},
    }
    presence = validate_config(config)["presence"]
    person = presence["people"][0]
    assert person["person"] == "person.scott"
    phone, watch = person["devices"]
    assert phone["signals"] == {
        "activity": "sensor.scotts_iphone_activity",
        "steps": None,
        "battery_state": None,
    }
    assert watch["name"] == "Watch" and watch["companion"] is None
    assert presence["carried"]["prior"] == 0.5
    assert presence["carried"]["weights"]["charging"] == -5.0
    assert presence["carried"]["weights"]["moving"] == 2.0


@pytest.mark.parametrize(
    ("presence", "path"),
    [
        ({"people": [{"name": "", "devices": []}]}, "presence/people/0/name"),
        (
            {"people": [{"name": "A", "person": "sensor.x", "devices": []}]},
            "presence/people/0/person",
        ),
        (
            {"people": [{"name": "A", "devices": [{"tracker": "sensor.x"}]}]},
            "presence/people/0/devices/0/tracker",
        ),
        (
            {
                "people": [
                    {"name": "A", "devices": [{"tracker": "device_tracker.x", "kind": "car"}]}
                ]
            },
            "presence/people/0/devices/0/kind",
        ),
        (
            {
                "people": [
                    {
                        "name": "A",
                        "devices": [{"tracker": "device_tracker.x", "companion": "sensor.x"}],
                    }
                ]
            },
            "presence/people/0/devices/0/companion",
        ),
        (
            {
                "people": [
                    {
                        "name": "A",
                        "devices": [
                            {"tracker": "device_tracker.x", "signals": {"steps": "binary_sensor.x"}}
                        ],
                    }
                ]
            },
            "presence/people/0/devices/0/signals/steps",
        ),
        (
            {"people": [{"name": "A", "devices": []}, {"name": "A", "devices": []}]},
            "presence/people/1/name",
        ),
        (
            {
                "people": [
                    {"name": "A", "devices": [{"tracker": "device_tracker.x"}]},
                    {"name": "B", "devices": [{"tracker": "device_tracker.x"}]},
                ]
            },
            "presence/people/1/devices/0/tracker",
        ),
        ({"carried": {"prior": 1.0}}, "presence/carried/prior"),
        ({"carried": {"flip": 0}}, "presence/carried/flip"),
        ({"carried": {"recent": 0}}, "presence/carried/recent"),
        ({"carried": {"weights": {"jitter": 11}}}, "presence/carried/weights/jitter"),
    ],
)
def test_people_and_carried_errors_are_pathed(presence, path) -> None:
    config = rooms_config()
    config["presence"] = {"enabled": True, **presence}
    assert path in errors_of(config)


@pytest.mark.parametrize(
    ("mutate", "path", "fragment"),
    [
        (
            lambda c: c["groups"][0]["children"][0]["children"][0].update(adjacent=["nope"]),
            "groups/0/children/0/children/0/adjacent/0",
            "unknown group",
        ),
        (
            lambda c: c["groups"][0]["children"][0]["children"][0].update(adjacent=["kitchen"]),
            "groups/0/children/0/children/0/adjacent/0",
            "itself",
        ),
        (
            lambda c: c["groups"][0]["children"][0]["children"][0].update(
                adjacent=["hall", "hall"]
            ),
            "groups/0/children/0/children/0/adjacent/1",
            "duplicate",
        ),
        (
            lambda c: c["groups"][0]["children"][0]["children"][0].update(
                presence={"envelope": "nope"}
            ),
            "groups/0/children/0/children/0/presence/envelope",
            "unknown envelope",
        ),
    ],
)
def test_adjacency_errors_are_pathed(mutate, path, fragment) -> None:
    config = rooms_config()
    mutate(config)
    with pytest.raises(ConfigError) as err:
        validate_config(config)
    assert any(e["path"] == path and fragment in e["message"] for e in err.value.errors)


@pytest.mark.parametrize(
    ("presence", "path"),
    [
        ({"devices": [{"device": "sensor.not_a_tracker"}]}, "presence/devices/0/device"),
        ({"threshold": 0}, "presence/threshold"),
        ({"threshold": 1.5}, "presence/threshold"),
        ({"stay": 1.0}, "presence/stay"),
        ({"escape": 0.2}, "presence/escape"),
        ({"scale": 0}, "presence/scale"),
        ({"floor": 0}, "presence/floor"),
        ({"stuck_after": 0}, "presence/stuck_after"),
        ({"activity": {"floor": 0}}, "presence/activity/floor"),
        ({"activity": {"floor": 1.5}}, "presence/activity/floor"),
        ({"envelope": "nope"}, "presence/envelope"),
        ({"scanner_areas": {"abc": "nope"}}, "presence/scanner_areas/abc"),
    ],
)
def test_presence_field_errors(presence, path) -> None:
    config = rooms_config()
    config["presence"] = {"enabled": True, **presence}
    with pytest.raises(ConfigError) as err:
        validate_config(config)
    assert any(e["path"] == path for e in err.value.errors)


def test_presence_threshold_one_and_escape_zero_are_allowed() -> None:
    config = rooms_config()
    config["presence"] = {"enabled": True, "threshold": 1.0, "escape": 0.0}
    assert validate_config(config)["presence"]["threshold"] == 1.0


def test_duplicate_tracked_device_and_name() -> None:
    config = rooms_config()
    config["presence"] = {
        "enabled": True,
        "devices": [
            {"device": "device_tracker.phone", "name": "Scott"},
            {"device": "device_tracker.phone", "name": "Scott"},
        ],
    }
    with pytest.raises(ConfigError) as err:
        validate_config(config)
    paths = {e["path"] for e in err.value.errors}
    assert {"presence/devices/1/device", "presence/devices/1/name"} <= paths


def test_a_stimulus_cannot_be_called_presence() -> None:
    config = rooms_config()
    config["groups"][0]["children"][0]["children"][0]["stimuli"].append(
        {"entity": "binary_sensor.other", "key": "presence"}
    )
    with pytest.raises(ConfigError) as err:
        validate_config(config)
    assert any("duplicate stimulus 'presence'" in e["message"] for e in err.value.errors)


def test_kinds_round_trip_and_default_to_none_before_inference() -> None:
    cfg = validate_config(kinds_config())
    prop = cfg["groups"][0]
    house = prop["children"][0]
    downstairs = house["children"][0]
    kitchen = downstairs["children"][0]
    assert [g["kind"] for g in (prop, house, downstairs, kitchen)] == [
        "property",
        "structure",
        "floor",
        "area",
    ]
    assert prop["children"][1]["kind"] == "outside"
    assert downstairs["floor_id"] == "downstairs"
    assert kitchen["area_id"] == "kitchen"
    assert "area" not in kitchen  # rewritten away, never round-tripped


def test_area_is_rewritten_to_area_id() -> None:
    cfg = validate_config(house_config())
    living = cfg["groups"][0]["children"][0]
    assert living["area_id"] == "living_room"
    assert "area" not in living
    # both spellings, agreeing, is not an error -- it is what a half-migrated file looks like
    both = house_config()
    both["groups"][0]["children"][0]["area_id"] = "living_room"
    assert validate_config(both)["groups"][0]["children"][0]["area_id"] == "living_room"


def test_area_and_area_id_disagreeing_is_an_error() -> None:
    cfg = house_config()
    cfg["groups"][0]["children"][0]["area_id"] = "lounge"
    assert "groups/0/children/0/area" in errors_of(cfg)


@pytest.mark.parametrize(
    ("parent", "child"),
    [
        ("property", "floor"),
        ("property", "area"),
        ("structure", "property"),
        ("structure", "structure"),
        ("structure", "outside"),
        ("floor", "floor"),
        ("floor", "structure"),
        ("floor", "outside"),
        ("area", "floor"),
        ("area", "structure"),
        ("area", "outside"),
        ("outside", "area"),
        ("outside", "floor"),
        ("outside", "structure"),
        ("outside", "property"),
    ],
)
def test_every_illegal_parent_child_pair_is_reported_at_the_child_kind(parent, child) -> None:
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "root",
                "kind": "property",
                "children": [
                    {
                        "id": "parent",
                        "kind": parent,
                        "children": [
                            {
                                "id": "child",
                                "kind": child,
                                "stimuli": [{"entity": "binary_sensor.x"}],
                            }
                        ],
                    }
                ],
            }
        ],
    }
    if parent not in ("structure", "outside"):  # keep the parent itself legal under property
        config["groups"][0]["children"][0]["kind"] = "structure"
        config["groups"][0]["children"][0]["children"][0] = {
            "id": "mid",
            "kind": parent,
            "children": [
                {"id": "child", "kind": child, "stimuli": [{"entity": "binary_sensor.x"}]}
            ],
        }
        assert "groups/0/children/0/children/0/children/0/kind" in errors_of(config)
    else:
        assert "groups/0/children/0/children/0/kind" in errors_of(config)


def test_every_root_is_a_property() -> None:
    cfg = kinds_config()
    cfg["groups"][0]["kind"] = "structure"
    assert "groups/0/kind" in errors_of(cfg)


@pytest.mark.parametrize("kind", ["property", "structure", "floor"])
def test_only_areas_and_outside_areas_declare_edges_and_exits(kind) -> None:
    cfg = kinds_config()
    house = cfg["groups"][0]["children"][0]
    house["kind"] = kind if kind != "floor" else "structure"
    downstairs = house["children"][0]
    downstairs["kind"] = "floor"
    downstairs["adjacent"] = ["kitchen"]
    downstairs["exit"] = True
    errs = errors_of(cfg)
    assert "groups/0/children/0/children/0/adjacent" in errs
    assert "groups/0/children/0/children/0/exit" in errs


def test_an_area_may_lead_off_the_property_even_beside_an_outside_area() -> None:
    """An area with an exit is a valid topology, whatever else the property models.

    A door from the kitchen to the street is a door from the kitchen to the street; the
    rule that used to hand that exit to the nearest yard made a migrated document
    unsaveable, so it is gone. Only the kinds nobody stands in still refuse an exit.
    """
    cfg = kinds_config()
    kitchen = cfg["groups"][0]["children"][0]["children"][0]["children"][0]
    kitchen["exit"] = True
    # back_patio, an `outside` group with an exit of its own, sits right beside it
    assert validate_config(cfg)["groups"][0]["children"][1]["exit"] is True


def test_adjacency_may_only_name_areas_and_outside_areas() -> None:
    cfg = kinds_config()
    cfg["groups"][0]["children"][0]["children"][0]["children"][0]["adjacent"] = ["house"]
    assert "groups/0/children/0/children/0/children/0/adjacent/0" in errors_of(cfg)


def test_adjacency_long_form_and_connection_enum() -> None:
    cfg = validate_config(kinds_config())
    kitchen = cfg["groups"][0]["children"][0]["children"][0]["children"][0]
    assert kitchen["adjacent"] == [
        {"id": "hall", "connection": "open", "one_way": False},
        {"id": "back_patio", "connection": "exterior_door", "one_way": False},
    ]
    plain = kinds_config()
    plain["groups"][0]["children"][0]["children"][0]["children"][0]["adjacent"] = ["hall"]
    out = validate_config(plain)["groups"][0]["children"][0]["children"][0]["children"][0]
    assert out["adjacent"] == [{"id": "hall", "connection": "door", "one_way": False}]
    bad = kinds_config()
    bad["groups"][0]["children"][0]["children"][0]["children"][0]["adjacent"] = [
        {"id": "hall", "connection": "portal"}
    ]
    assert "groups/0/children/0/children/0/children/0/adjacent/0/connection" in errors_of(bad)


def test_a_document_with_no_kinds_still_loads_and_gets_them_inferred() -> None:
    result = validate(rooms_config())
    rooms = result.config["groups"][0]["children"][0]["children"]
    assert result.config["groups"][0]["kind"] == "property"  # root
    assert result.config["groups"][0]["children"][0]["kind"] == "structure"
    assert [g["kind"] for g in rooms] == ["area"] * 5  # all have an area
    assert result.migrated is True
    assert "groups/0" in result.inferred and "groups/0/children/0/children/4" in result.inferred


def test_inference_covers_every_branch() -> None:
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "estate",  # root -> property
                "children": [
                    {
                        "id": "annexe",  # parent property, nothing else -> structure
                        "children": [
                            {
                                "id": "loft",  # parent structure -> floor
                                "children": [
                                    {
                                        "id": "study",  # parent floor -> area
                                        "stimuli": [{"entity": "binary_sensor.a"}],
                                        "children": [
                                            {
                                                "id": "nook",  # parent area -> area
                                                "stimuli": [{"entity": "binary_sensor.b"}],
                                            }
                                        ],
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        # a leaf under a property that declares an exit -> outside (M1);
                        # `area` is what the evidence asks for first, and a property
                        # cannot contain one, so the second choice wins
                        "id": "yard",
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.c"}],
                    },
                    {
                        "id": "grounds",  # declared, so it is not one of the guesses
                        "kind": "outside",
                        "children": [
                            {
                                "id": "shed_path",  # parent outside -> outside
                                "stimuli": [{"entity": "binary_sensor.e"}],
                            }
                        ],
                    },
                    {
                        "id": "cellar",  # parent property + has an area -> still a structure
                        "area": "cellar_area",
                        "stimuli": [{"entity": "binary_sensor.d"}],
                    },
                ],
            }
        ],
    }
    resolved, inferred = infer_kinds(CONFIG_SCHEMA(config))
    kinds = {}

    def walk(group):
        kinds[group["id"]] = group["kind"]
        for child in group["children"]:
            walk(child)

    walk(resolved["groups"][0])
    assert kinds == {
        "estate": "property",
        "annexe": "structure",
        "loft": "floor",
        "study": "area",
        "nook": "area",
        "yard": "outside",
        "grounds": "outside",
        "shed_path": "outside",
        "cellar": "structure",
    }
    assert len(inferred) == len(kinds) - 1  # every kind but `grounds`, which was declared


def test_a_declared_kind_is_checked_against_the_nesting_even_when_the_evidence_agrees() -> None:
    """`study` has an area bound to it, which is exactly the evidence inference reads as
    `area` -- but the user declared the kind, and `outside` holds nothing but `outside`.
    Evidence never overrides the nesting table for a kind somebody wrote down."""
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "root",
                "kind": "property",
                "children": [
                    {
                        "id": "outdoors",
                        "kind": "outside",
                        "children": [
                            {
                                "id": "study",
                                # wants `area`, and outside takes only outside
                                "area": "study_area",
                                "kind": "area",
                                "stimuli": [{"entity": "binary_sensor.a"}],
                            }
                        ],
                    }
                ],
            }
        ],
    }
    assert "groups/0/children/0/children/0/kind" in errors_of(config)


def test_migrated_groups_keep_edges_and_exits_the_rules_would_now_refuse() -> None:
    """M2: a config that works today must not stop loading because we guessed a kind."""
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "property",
                "children": [
                    {
                        "id": "garage",  # infers `outside` by M1, because it declares both
                        "adjacent": ["driveway"],
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.garage_door"}],
                    },
                    {
                        "id": "driveway",
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.driveway_motion"}],
                    },
                ],
            }
        ],
    }
    result = validate(config)
    garage = result.config["groups"][0]["children"][0]
    assert garage["kind"] == "outside"
    assert garage["exit"] is True
    assert "groups/0/children/0" in result.inferred


def test_declared_kinds_do_not_get_the_migration_amnesty() -> None:
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "property",
                "kind": "property",
                "children": [
                    {
                        "id": "house",
                        "kind": "structure",
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.front_door"}],
                    }
                ],
            }
        ],
    }
    assert "groups/0/children/0/exit" in errors_of(config)


def test_the_amnesty_covers_the_rules_a_guessed_kind_would_otherwise_break() -> None:
    """M2, at the rule the garage case never reaches.

    `kitchen` is guessed `area` because its parent is a floor, and it declares an edge to
    `house`, which is guessed a structure -- and a structure is not somewhere you walk to.
    The edge is kept, because the user wrote neither kind, and becomes an error on the
    next save. Its exit is kept too, and stays legal: an area may lead off the property.
    """
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "property",
                "children": [
                    {
                        "id": "house",
                        "children": [
                            {
                                "id": "downstairs",
                                "children": [
                                    {
                                        "id": "kitchen",
                                        "exit": True,
                                        "adjacent": ["house"],
                                        "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        "id": "back_patio",
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.patio_motion"}],
                    },
                ],
            }
        ],
    }
    result = validate(config)
    kitchen_path = "groups/0/children/0/children/0/children/0"
    kitchen = result.config["groups"][0]["children"][0]["children"][0]["children"][0]
    assert kitchen["kind"] == "area"
    assert result.config["groups"][0]["children"][1]["kind"] == "outside"
    assert result.config["groups"][0]["children"][0]["kind"] == "structure"  # a bad endpoint
    assert kitchen["exit"] is True
    assert kitchen["adjacent"] == [{"id": "house", "connection": "door", "one_way": False}]
    assert kitchen_path in result.inferred

    # spell the same document with the kinds written out, and the edge rule bites
    declared = validate(config).config
    errs = errors_of(declared)
    assert f"{kitchen_path}/adjacent/0" in errs
    assert f"{kitchen_path}/exit" not in errs  # an area may lead off the property


def test_a_half_migrated_document_is_not_failed_by_a_guessed_group_at_the_far_end() -> None:
    """M2 across two groups: the user declared `kitchen`, so `kitchen` is not under amnesty,
    but the group its edge lands on was guessed. The rule is about `house`'s kind, and
    nobody has confirmed that, so the document still loads."""
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "property",
                "kind": "property",
                "children": [
                    {
                        "id": "house",  # left undeclared -> guessed `structure`
                        "children": [
                            {
                                "id": "kitchen",
                                "kind": "area",  # the user wrote this one out
                                "adjacent": ["house"],
                                "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
                            }
                        ],
                    }
                ],
            }
        ],
    }
    result = validate(config)
    assert result.config["groups"][0]["children"][0]["kind"] == "structure"
    assert "groups/0/children/0" in result.inferred
    assert "groups/0/children/0/children/0" not in result.inferred  # declared, no amnesty

    # write the guess out, as the next save does, and the rule bites
    settled = result.config
    assert "groups/0/children/0/children/0/adjacent/0" in errors_of(settled)


def test_inference_is_total() -> None:
    """The invariant that makes a null kind impossible: whatever a parent is, the kind
    `_wanted_kinds` falls back to is one the parent may contain."""
    for kind in KINDS:
        assert DEFAULT_CHILD_KIND[kind] in ALLOWED_CHILDREN[kind]
    assert KIND_PROPERTY in ALLOWED_CHILDREN[None]


def _group_ids(cfg: dict[str, Any]) -> list[str]:
    """Every group id, depth first. Entity ids are built from these, so this is the list
    that must not move when a document is migrated and saved back."""
    ids: list[str] = []

    def walk(groups: list[dict[str, Any]]) -> None:
        for group in groups:
            ids.append(group["id"])
            walk(group["children"])

    walk(cfg["groups"])
    return ids


@pytest.mark.parametrize(
    "document",
    [house_config, rooms_config, presence_config, kinds_config, legacy_house_config],
    ids=["house", "rooms", "presence", "kinds", "legacy_example"],
)
def test_a_validated_document_validates_again_unchanged(document) -> None:
    """The round trip that is the whole point of the migration: load, then save.

    The panel writes back exactly what `config/get` handed it, so whatever the first pass
    resolves has to survive a second pass with the kinds written out -- no guesses left,
    no new errors, and the same groups in the same order, because entity ids come from
    those ids and a migration that moved them would be a migration nobody could accept.
    """
    first = validate(document())
    second = validate(first.config)
    assert second.inferred == ()
    assert _group_ids(second.config) == _group_ids(first.config)
    assert second.config == first.config


def test_the_legacy_example_migrates_to_the_layering_it_describes() -> None:
    """The kinds the real pre-kinds document arrives at, spelled out.

    `garage` declared a doorway and a way off the property and holds nothing, so it is
    read as an outdoor area; `outside` and `back_yard` hold other groups, so position
    decides and they land on the indoor layering. Both are guesses the banner asks a
    human to confirm -- what matters here is that they are legal and stable.
    """
    resolved = validate(legacy_house_config()).config
    kinds: dict[str, str] = {}

    def walk(groups: list[dict[str, Any]]) -> None:
        for group in groups:
            kinds[group["id"]] = group["kind"]
            walk(group["children"])

    walk(resolved["groups"])
    assert kinds["property"] == "property"
    assert kinds["house"] == "structure"
    assert kinds["downstairs"] == "floor"
    assert kinds["kitchen"] == "area"
    assert kinds["garage"] == "outside"
    assert kinds["driveway"] == "area"


def test_evidence_only_names_a_room_kind_for_a_group_with_nothing_inside_it() -> None:
    """M1 stops at the leaves: a doorway on a branch does not turn the branch outdoors.

    `downstairs` declares an edge, which used to read as evidence that it is somewhere a
    person walks -- and because a property cannot contain an area, that guess came out
    `outside` and cascaded over every room below it. A group with children is a container
    whatever else it says, so position decides and the layering survives.
    """
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "property",
                "children": [
                    {
                        "id": "house",
                        "children": [
                            {
                                "id": "downstairs",
                                "adjacent": ["upstairs"],
                                "children": [
                                    {
                                        "id": "kitchen",
                                        "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
                                    },
                                    {
                                        "id": "hall",
                                        "adjacent": ["kitchen"],
                                        "stimuli": [{"entity": "binary_sensor.hall_motion"}],
                                    },
                                ],
                            },
                            {
                                "id": "upstairs",
                                "children": [
                                    {
                                        "id": "landing",
                                        "stimuli": [{"entity": "binary_sensor.landing_motion"}],
                                    }
                                ],
                            },
                        ],
                    }
                ],
            }
        ],
    }
    house = validate(config).config["groups"][0]["children"][0]
    assert house["kind"] == "structure"
    assert [floor["kind"] for floor in house["children"]] == ["floor", "floor"]
    assert [room["kind"] for room in house["children"][0]["children"]] == ["area", "area"]


def test_rooms_at_the_root_load_with_a_warning_that_says_what_was_lost() -> None:
    """C3: every root is a property, so a root that declares doors is not a room.

    The document still loads -- refusing it would strand somebody whose config worked
    yesterday -- but its presence graph is empty, and nothing else in the panel would say
    so. The warning is how it says so.
    """
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "kitchen",
                "adjacent": ["hall"],
                "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
            },
            {
                "id": "hall",
                "exit": True,
                "stimuli": [{"entity": "binary_sensor.hall_motion"}],
            },
        ],
    }
    result = validate(config)
    assert [group["kind"] for group in result.config["groups"]] == ["property", "property"]
    assert result.warnings == (
        "groups/0: 'kitchen' declares doors but is a root group; every root is a property, "
        "so it is not a room. Wrap your rooms in a property.",
        "groups/1: 'hall' declares doors but is a root group; every root is a property, "
        "so it is not a room. Wrap your rooms in a property.",
    )


def test_a_root_property_that_declares_no_doors_is_not_warned_about() -> None:
    assert validate(kinds_config()).warnings == ()
    assert validate(rooms_config()).warnings == ()
    assert validate(legacy_house_config()).warnings == ()


def test_the_shipped_example_house_validates_and_round_trips() -> None:
    """`examples/house.yaml` is documentation people paste in; it has to actually load.

    It also has to survive a round trip, because the panel saves back exactly the
    document `validate` handed it -- an example that normalized into something the
    schema then refused would be a config nobody could edit.
    """
    raw: dict[str, Any] = yaml.safe_load(EXAMPLE_HOUSE.read_text())
    result = validate(raw)
    assert result.inferred == () and result.warnings == ()
    cfg = result.config
    assert validate_config(cfg) == cfg
    assert [(e["id"], e["label"]) for e in cfg["envelopes"]] == [
        ("fifteen_minutes", "Fifteen Minutes"),
        ("default", "Thirty Minutes"),
        ("hour", "One Hour"),
        ("two_hours", "Two Hours"),
        ("four_hours", "Four Hours"),
        ("eight_hours", "Eight Hours"),
    ]
    assert cfg["defaults"]["envelope"] == "default"
    assert cfg["defaults"]["retrigger"] == "always" and cfg["defaults"]["stack"] is True


def _one_stimulus(extra: dict[str, Any]) -> dict[str, Any]:
    """A minimal valid document whose single stimulus carries `extra`."""
    return {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "house",
                "kind": "property",
                "children": [
                    {
                        "id": "yard",
                        "kind": "outside",
                        "stimuli": [{"entity": "binary_sensor.door", **extra}],
                    }
                ],
            }
        ],
    }


def _only_stimulus(cfg: dict[str, Any]) -> dict[str, Any]:
    stim: dict[str, Any] = cfg["groups"][0]["children"][0]["stimuli"][0]
    return stim


def test_stimulus_mode_defaults_to_sustained_with_both_edges() -> None:
    stim = _only_stimulus(validate_config(_one_stimulus({})))
    assert stim["mode"] == "sustained"
    assert stim["edges"] == ["enter", "leave"]


def test_stimulus_accepts_momentary_with_one_edge() -> None:
    stim = _only_stimulus(validate_config(_one_stimulus({"mode": "momentary", "edges": ["enter"]})))
    assert stim["mode"] == "momentary"
    assert stim["edges"] == ["enter"]


def test_stimulus_rejects_an_unknown_mode() -> None:
    with pytest.raises(ConfigError) as exc:
        validate_config(_one_stimulus({"mode": "latching"}))
    assert any("mode" in e["path"] for e in exc.value.errors)


def test_stimulus_rejects_an_empty_edge_list() -> None:
    with pytest.raises(ConfigError) as exc:
        validate_config(_one_stimulus({"mode": "momentary", "edges": []}))
    assert any("edges" in e["path"] for e in exc.value.errors)


def test_stimulus_rejects_an_unknown_edge() -> None:
    with pytest.raises(ConfigError) as exc:
        validate_config(_one_stimulus({"mode": "momentary", "edges": ["sideways"]}))
    assert any("edges" in e["path"] for e in exc.value.errors)


def test_edges_are_inert_under_sustained() -> None:
    """Kept rather than rejected: the panel's mode radio flips back and forth, and a
    document that will not save because of a field the form is not showing is a bad trade
    for a rule nothing depends on."""
    stim = _only_stimulus(validate_config(_one_stimulus({"mode": "sustained", "edges": ["leave"]})))
    assert stim["edges"] == ["leave"]


def test_each_stimulus_gets_its_own_edge_list() -> None:
    """voluptuous hands every stimulus the same default object unless the default is a
    callable, and a shared mutable list is a bug waiting for the first caller that sorts
    or appends in place."""
    cfg = validate_config(house_config())
    lists = [s["edges"] for g in cfg["groups"] for s in g["stimuli"]]
    lists += [s["edges"] for g in cfg["groups"] for c in g["children"] for s in c["stimuli"]]
    assert len(lists) > 1
    assert all(x is not lists[0] for x in lists[1:])
