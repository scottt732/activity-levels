import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.diagnostics import async_get_config_entry_diagnostics
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
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_config_get_validate_save(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/config/get"})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["config"]["groups"][0]["id"] == "house"

    bad = dict(msg["result"]["config"])
    bad["groups"][0]["id"] = "Bad Id"
    await client.send_json_auto_id({"type": "activity_levels/config/validate", "config": bad})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["ok"] is False
    assert msg["result"]["errors"][0]["path"] == "groups/0/id"

    good = validate_config(house_config())
    good["groups"][0]["children"][1]["name"] = "Pantry"
    await client.send_json_auto_id({"type": "activity_levels/config/save", "config": good})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["ok"] is True
    await hass.async_block_till_done()
    assert entry.options["groups"][0]["children"][1]["name"] == "Pantry"

    await client.send_json_auto_id({"type": "activity_levels/config/save", "config": bad})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["ok"] is False
    assert msg["result"]["errors"][0]["path"] == "groups/0/id"


async def test_config_save_rejects_engine_build_failure(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    entry: MockConfigEntry,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def boom(config: dict[str, object]) -> None:
        raise ValueError("boom")

    monkeypatch.setattr("custom_components.activity_levels.websocket_api.build_tree", boom)
    original_options = dict(entry.options)

    client = await hass_ws_client(hass)
    good = validate_config(house_config())
    good["groups"][0]["children"][1]["name"] = "Pantry"
    await client.send_json_auto_id({"type": "activity_levels/config/save", "config": good})
    msg = await client.receive_json()

    assert not msg["success"]
    assert msg["error"]["code"] == "invalid_config"
    assert entry.options == original_options


async def test_state_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/state"})
    msg = await client.receive_json()
    groups = msg["result"]["groups"]
    assert groups["living_room"]["value"] == 2.0 and groups["living_room"]["parent_id"] == "house"
    voices = msg["result"]["voices"]["living_room"]
    motion = next(v for v in voices if v["entity"] == "binary_sensor.living_motion")
    assert motion["phase"] == "sustain" and motion["gate"] is True


async def test_diagnostics(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["config"]["groups"][0]["id"] == "house"
    assert "voices" in diag["snapshot"]
    assert "house" in diag["groups"]
