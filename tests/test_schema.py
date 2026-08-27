import pytest

from custom_components.activity_levels.schema import ConfigError, default_options, validate_config
from tests.fixtures import house_config, rooms_config


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
        {"id": "dining_room", "one_way": False},
        {"id": "back_patio", "one_way": False},
    ]
    assert rooms["hall"]["adjacent"] == [{"id": "bedroom", "one_way": True}]
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
