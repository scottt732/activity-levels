from http import HTTPStatus

import pytest
from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.activity_levels.const import DOMAIN, PANEL_URL_PATH
from custom_components.activity_levels.schema import default_options, validate_config


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(default_options()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_panel_registered(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    panels = hass.data[frontend.DATA_PANELS]
    assert PANEL_URL_PATH in panels
    panel = panels[PANEL_URL_PATH]
    assert panel.sidebar_title == "Activity Levels"
    assert panel.require_admin is True
    custom = panel.config["_panel_custom"]
    assert custom["name"] == "activity-levels-panel"
    assert custom["module_url"].startswith("/activity_levels_panel/activity-levels-panel.js?v=")
    assert custom["embed_iframe"] is False


async def test_bundle_is_served(
    hass: HomeAssistant, hass_client: ClientSessionGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_client()
    resp = await client.get("/activity_levels_panel/activity-levels-panel.js")
    assert resp.status == HTTPStatus.OK
    body = await resp.text()
    assert "activity-levels-panel" in body


async def test_unload_removes_panel_and_reload_reregisters(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_URL_PATH not in hass.data[frontend.DATA_PANELS]
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_URL_PATH in hass.data[frontend.DATA_PANELS]


async def test_dev_server_override(hass: HomeAssistant, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ACTIVITY_LEVELS_DEV_SERVER", "http://localhost:5173")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(default_options()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    custom = hass.data[frontend.DATA_PANELS][PANEL_URL_PATH].config["_panel_custom"]
    assert custom["module_url"] == "http://localhost:5173/src/main.ts"
    assert custom["trust_external"] is True
