import pytest

from custom_components.activity_levels.schema import ConfigError, default_options, validate_config
from tests.fixtures import house_config


def test_default_options_validate() -> None:
    cfg = validate_config(default_options())
    assert cfg["groups"] == []
    assert cfg["envelopes"][0]["id"] == "default"
    assert cfg["defaults"]["min_wake_interval"] == 1.0
    assert cfg["defaults"]["safety_refresh"] == 60.0


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
