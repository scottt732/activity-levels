import pytest

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
from tests.fixtures import house_config, kinds_config, rooms_config


def test_default_options_validate() -> None:
    cfg = validate_config(default_options())
    assert cfg["groups"] == []
    assert cfg["envelopes"][0]["id"] == "default"
    assert cfg["defaults"]["min_wake_interval"] == 1.0
    assert cfg["defaults"]["safety_refresh"] == 60.0


def test_retrigger_defaults_to_stack_and_accepts_every_mode() -> None:
    cfg = validate_config(house_config())
    assert cfg["defaults"]["retrigger"] == "stack"
    for mode in ("stack", "only_in_release", "always"):
        picked = house_config()
        picked["defaults"]["retrigger"] = mode
        picked["envelopes"][0]["retrigger"] = mode
        out = validate_config(picked)
        assert out["defaults"]["retrigger"] == mode
        assert out["envelopes"][0]["retrigger"] == mode


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
    cfg["envelopes"][2]["sustain"] = 1.5
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


def test_presence_defaults_and_absence() -> None:
    assert validate_config(house_config())["presence"] == {
        "enabled": False,
        "devices": [],
        "envelope": None,
        "threshold": 0.6,
        "stay": 0.9,
        "escape": 0.001,
        "scale": 3.0,
        "floor": 0.05,
        "stuck_after": 60.0,
        "scanner_areas": {},
    }


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


def test_an_area_may_only_lead_off_the_property_when_nothing_is_outside() -> None:
    cfg = kinds_config()
    cfg["groups"][0]["children"][0]["children"][0]["children"][0]["exit"] = True
    # back_patio is an `outside` group, so the kitchen is not where you leave from
    assert "groups/0/children/0/children/0/children/0/exit" in errors_of(cfg)
    del cfg["groups"][0]["children"][1]  # drop the outside group entirely
    cfg["groups"][0]["children"][0]["children"][0]["children"][0]["adjacent"] = ["hall"]
    validate_config(cfg)  # now the kitchen is the only way out, and that is allowed


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
                        "id": "yard",  # parent property + declares an exit -> outside (M1)
                        "exit": True,
                        "children": [
                            {
                                "id": "shed_path",  # parent outside -> outside
                                "stimuli": [{"entity": "binary_sensor.c"}],
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
        "shed_path": "outside",
        "cellar": "structure",
    }
    assert len(inferred) == len(kinds)


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
    """M2, at the two rules the garage case never reaches.

    `kitchen` is guessed `area` because its parent is a floor, and it declares both an exit
    (which a room may not have once the property has an outside) and an edge to `house`
    (which is guessed a structure, and a structure is not somewhere you walk to). Both are
    kept, because the user wrote neither kind; both become errors on the next save.
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
    assert result.config["groups"][0]["children"][1]["kind"] == "outside"  # so has_outside
    assert result.config["groups"][0]["children"][0]["kind"] == "structure"  # a bad endpoint
    assert kitchen["exit"] is True
    assert kitchen["adjacent"] == [{"id": "house", "connection": "door", "one_way": False}]
    assert kitchen_path in result.inferred

    # spell the same document with the kinds written out, and both rules bite
    declared = validate(config).config
    errs = errors_of(declared)
    assert f"{kitchen_path}/exit" in errs
    assert f"{kitchen_path}/adjacent/0" in errs


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


def test_a_half_migrated_document_is_not_failed_by_a_guessed_outside_area() -> None:
    """M2 again: the exit rule only makes sense once somebody has said something is outside.
    `back_patio` is only outside because we guessed it, so `kitchen` keeps its exit."""
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
                        "children": [
                            {
                                "id": "kitchen",
                                "kind": "area",
                                "exit": True,
                                "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
                            }
                        ],
                    },
                    {
                        "id": "back_patio",  # undeclared; M1 reads the exit and guesses outside
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.patio_motion"}],
                    },
                ],
            }
        ],
    }
    result = validate(config)
    assert result.config["groups"][0]["children"][1]["kind"] == "outside"
    assert result.inferred == ("groups/0/children/1",)
    assert result.config["groups"][0]["children"][0]["children"][0]["exit"] is True

    # confirm the guess and the room is no longer where you leave from
    assert "groups/0/children/0/children/0/exit" in errors_of(result.config)


def test_inference_is_total() -> None:
    """The invariant that makes a null kind impossible: whatever a parent is, the kind
    `_wanted_kinds` falls back to is one the parent may contain."""
    for kind in KINDS:
        assert DEFAULT_CHILD_KIND[kind] in ALLOWED_CHILDREN[kind]
    assert KIND_PROPERTY in ALLOWED_CHILDREN[None]
