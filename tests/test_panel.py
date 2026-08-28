import json
import logging
from http import HTTPStatus
from pathlib import Path

import pytest
from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.activity_levels import panel as panel_module
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


async def test_config_schema_is_served(
    hass: HomeAssistant, hass_client: ClientSessionGenerator, entry: MockConfigEntry
) -> None:
    """The URL an editor's `$schema` comment points at.

    It shares a prefix with the bundle directory, which is served by a prefix resource
    that would answer 404 for it, so this also pins the registration order.
    """
    client = await hass_client()
    resp = await client.get("/activity_levels_panel/config.schema.json")
    assert resp.status == HTTPStatus.OK
    document = json.loads(await resp.text())
    assert document["$schema"] == "https://json-schema.org/draft/2020-12/schema"
    assert "groups" in document["properties"]


async def test_reload_keeps_panel_without_panels_updated(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    """A reload (every Save does one) must not remove and re-add the panel.

    Removing it fires EVENT_PANELS_UPDATED, which makes the frontend tear down and
    recreate the custom panel element — the whole UI visibly refreshes on Save.
    """
    before = hass.data[frontend.DATA_PANELS][PANEL_URL_PATH]
    events: list[object] = []
    hass.bus.async_listen(frontend.EVENT_PANELS_UPDATED, lambda ev: events.append(ev))
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.data[frontend.DATA_PANELS][PANEL_URL_PATH] is before
    assert events == []


async def test_removing_the_entry_removes_the_panel(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_URL_PATH not in hass.data[frontend.DATA_PANELS]


async def test_dev_server_override(hass: HomeAssistant, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ACTIVITY_LEVELS_DEV_SERVER", "http://localhost:5173")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(default_options()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    custom = hass.data[frontend.DATA_PANELS][PANEL_URL_PATH].config["_panel_custom"]
    assert custom["module_url"] == "http://localhost:5173/src/main.ts"
    assert custom["trust_external"] is True


async def test_missing_bundle_logs_and_skips_the_panel(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """No bundle means no panel: a sidebar entry that only ever blanks is worse than none."""
    monkeypatch.setattr(panel_module, "_FRONTEND_DIR", tmp_path)
    caplog.set_level(logging.ERROR, logger=panel_module.__name__)
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(default_options()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert PANEL_URL_PATH not in hass.data.get(frontend.DATA_PANELS, {})
    errors = [r for r in caplog.records if r.levelno == logging.ERROR]
    assert any("panel" in r.getMessage() for r in errors)
