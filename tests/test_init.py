import subprocess
import sys
from pathlib import Path

import pytest
import yaml
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.selector import selector
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.coordinator import ActivityLevelsCoordinator
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config, kinds_config


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    for e in (
        "binary_sensor.front_door",
        "binary_sensor.living_motion",
        "binary_sensor.kitchen_motion",
    ):
        hass.states.async_set(e, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(
        domain=DOMAIN, data={}, options=validate_config(house_config()), title="Activity Levels"
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_setup_creates_devices_and_entities(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    assert entry.state is ConfigEntryState.LOADED
    dev = dr.async_get(hass)
    house = dev.async_get_device(identifiers={(DOMAIN, "house")})
    lr = dev.async_get_device(identifiers={(DOMAIN, "living_room")})
    assert house and lr
    assert lr.via_device_id == house.id
    assert lr.suggested_area == "living_room" or lr.area_id is not None
    ent = er.async_get(hass)
    assert ent.async_get("sensor.living_room_activity_level") is not None
    assert ent.async_get("binary_sensor.living_room_active") is not None
    assert ent.async_get("button.living_room_trigger") is not None
    assert hass.states.get("sensor.house_activity_level").state == "0.0"


async def test_config_flow_creates_single_entry(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] == "form"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] == "create_entry"
    assert result["options"]["envelopes"][0]["id"] == "default"
    # options are stored normalized, so config/get has one stable shape from the first call
    assert result["options"]["defaults"]["min_wake_interval"] == 1.0
    assert result["options"]["envelopes"][0]["release"] == 1800.0
    result2 = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result2["type"] == "abort"


async def test_options_update_reloads(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    cfg = validate_config(house_config())
    cfg["groups"][0]["children"][1]["name"] = "Pantry"
    hass.config_entries.async_update_entry(entry, options=cfg)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED
    dev = dr.async_get(hass)
    assert dev.async_get_device(identifiers={(DOMAIN, "kitchen")}).name == "Pantry"


async def test_services(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await hass.services.async_call(
        DOMAIN, "trigger", {"group_id": "kitchen", "peak": 2.5}, blocking=True
    )
    assert hass.states.get("sensor.kitchen_activity_level").state == "2.5"
    await hass.services.async_call(DOMAIN, "reset", {}, blocking=True)
    assert hass.states.get("sensor.kitchen_activity_level").state == "0.0"


def test_set_level_does_not_cap_the_level_the_service_will_take() -> None:
    path = Path(__file__).parent.parent / "custom_components/activity_levels/services.yaml"
    services = yaml.safe_load(path.read_text())
    value = services["set_level"]["fields"]["value"]["selector"]["number"]
    assert value["min"] == 0
    # A limiter is per group and can be set well above ten; a ceiling hardcoded here puts
    # levels the engine accepts out of reach of anyone calling the service.
    assert "max" not in value
    selector({"number": value})  # still something Home Assistant will render
    # `peak` is a stimulus-sized impulse, not a level: its own range still applies
    assert services["trigger"]["fields"]["peak"]["selector"]["number"]["max"] == 10


async def test_unload(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED
    assert hass.states.get("sensor.house_activity_level").state == "unavailable"


async def test_invalid_options_fail_setup(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"version": 1, "groups": [{"id": "x"}]})
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.SETUP_ERROR


async def test_setup_failure_stops_the_coordinator(
    hass: HomeAssistant, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A platform blowing up must not leave the coordinator's timers armed."""
    hass.states.async_set("binary_sensor.front_door", "off")
    hass.states.async_set("binary_sensor.living_motion", "off")
    hass.states.async_set("binary_sensor.kitchen_motion", "off")
    hass.states.async_set("media_player.tv", "idle")
    stops: list[ActivityLevelsCoordinator] = []
    original = ActivityLevelsCoordinator.async_stop

    async def spy(self: ActivityLevelsCoordinator) -> None:
        stops.append(self)
        await original(self)

    async def boom(entry: MockConfigEntry, platforms: list[str]) -> None:
        raise RuntimeError("platform boom")

    monkeypatch.setattr(ActivityLevelsCoordinator, "async_stop", spy)
    monkeypatch.setattr(hass.config_entries, "async_forward_entry_setups", boom)

    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()))
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_ERROR
    assert len(stops) == 1
    assert stops[0]._timers == {}


async def test_reload_with_a_tree_that_will_not_build_fails_the_entry(
    hass: HomeAssistant, entry: MockConfigEntry, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A config that validates but cannot be built must fail setup, not raise blind."""

    def boom(config: dict[str, object]) -> None:
        raise ValueError("boom")

    monkeypatch.setattr("custom_components.activity_levels.build_tree", boom)
    cfg = validate_config(house_config())
    cfg["groups"][0]["children"][1]["name"] = "Pantry"  # something to reload for
    hass.config_entries.async_update_entry(entry, options=cfg)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_ERROR


async def test_removing_a_group_removes_its_device_and_entities(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    cfg = validate_config(house_config())
    del cfg["groups"][0]["children"][1]  # drop the kitchen
    hass.config_entries.async_update_entry(entry, options=cfg)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED
    assert dr.async_get(hass).async_get_device(identifiers={(DOMAIN, "kitchen")}) is None
    assert er.async_get(hass).async_get("sensor.kitchen_activity_level") is None


async def test_set_level_service(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await hass.services.async_call(
        DOMAIN, "set_level", {"group_id": "kitchen", "value": 2.5}, blocking=True
    )
    assert hass.states.get("sensor.kitchen_activity_level").state == "2.5"
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "set_level", {"group_id": "nope", "value": 1.0}, blocking=True
        )
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "set_level", {"group_id": "kitchen", "value": -1.0}, blocking=True
        )


async def test_devices_carry_the_kind_as_their_model(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(kinds_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    dev = dr.async_get(hass)
    models = {
        gid: dev.async_get_device(identifiers={(DOMAIN, gid)}).model
        for gid in ("property", "house", "downstairs", "kitchen", "back_patio")
    }
    assert models == {
        "property": "Property",
        "house": "Structure",
        "downstairs": "Floor",
        "kitchen": "Area",
        "back_patio": "Outside",
    }
    # a floor binds a Home Assistant floor, and Home Assistant devices live in areas,
    # so a floor suggests nothing at all
    assert dev.async_get_device(identifiers={(DOMAIN, "downstairs")}).suggested_area is None
    assert dev.async_get_device(identifiers={(DOMAIN, "kitchen")}).suggested_area == "kitchen"


async def test_an_unnamed_group_takes_the_name_of_the_area_it_binds(hass: HomeAssistant) -> None:
    area = ar.async_get(hass).async_get_or_create("Kitchen")
    config = kinds_config()
    kitchen = config["groups"][0]["children"][0]["children"][0]["children"][0]
    kitchen["area_id"] = area.id
    del kitchen["name"]
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(config))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert dr.async_get(hass).async_get_device(identifiers={(DOMAIN, "kitchen")}).name == "Kitchen"


async def test_an_old_document_still_loads_with_the_same_entity_ids(hass: HomeAssistant) -> None:
    """The migration promise, asserted: no kinds in, no entity id moves."""
    for e in (
        "binary_sensor.front_door",
        "binary_sensor.living_motion",
        "binary_sensor.kitchen_motion",
    ):
        hass.states.async_set(e, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    ent = er.async_get(hass)
    assert ent.async_get("sensor.living_room_activity_level") is not None
    assert ent.async_get("sensor.kitchen_activity_level") is not None
    assert ent.async_get("sensor.house_activity_level") is not None


def test_every_file_carrying_the_version_agrees() -> None:
    """The three files release-please bumps together must not drift apart."""
    root = Path(__file__).resolve().parent.parent
    result = subprocess.run(
        [sys.executable, str(root / "scripts" / "check_version.py")],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr
