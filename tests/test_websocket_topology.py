import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import rooms_config

ROOM_SENSORS = (
    "binary_sensor.kitchen_motion",
    "binary_sensor.dining_motion",
    "binary_sensor.hall_motion",
    "binary_sensor.bedroom_motion",
    "binary_sensor.patio_motion",
)


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    for entity_id in ROOM_SENSORS:
        hass.states.async_set(entity_id, "off")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(rooms_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_topology_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/topology"})
    msg = await client.receive_json()
    assert msg["success"]
    assert msg["result"]["nodes"][0] == "kitchen"
    assert ["hall", "bedroom", True] in msg["result"]["edges"]
    assert msg["result"]["exits"] == ["back_patio"]


async def test_topology_paths_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "activity_levels/topology/paths", "from": "kitchen", "to": "bedroom"}
    )
    msg = await client.receive_json()
    assert msg["result"]["paths"] == [["kitchen", "dining_room", "hall", "bedroom"]]

    await client.send_json_auto_id(
        {"type": "activity_levels/topology/paths", "from": "kitchen", "to": "downstairs"}
    )
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "not_found"


async def test_diagnostics_carry_the_topology(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    from custom_components.activity_levels.diagnostics import (
        async_get_config_entry_diagnostics,
    )

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["topology"]["exits"] == ["back_patio"]
    assert diag["presence"] is None
