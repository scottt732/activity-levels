import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config


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


@pytest.mark.xfail(reason="entities land in Task 7", strict=True)
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


@pytest.mark.xfail(reason="entities land in Task 7", strict=True)
async def test_services(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await hass.services.async_call(
        DOMAIN, "trigger", {"group_id": "kitchen", "peak": 2.5}, blocking=True
    )
    assert hass.states.get("sensor.kitchen_activity_level").state == "2.5"
    await hass.services.async_call(DOMAIN, "reset", {}, blocking=True)
    assert hass.states.get("sensor.kitchen_activity_level").state == "0.0"


@pytest.mark.xfail(reason="entities land in Task 7", strict=True)
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
