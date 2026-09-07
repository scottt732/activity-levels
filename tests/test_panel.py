import json
import logging
from http import HTTPStatus
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
from homeassistant.components import frontend
from homeassistant.components.lovelace import LOVELACE_DATA
from homeassistant.components.lovelace.resources import (
    ResourceStorageCollection,
    ResourceYAMLCollection,
)
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
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


async def test_cards_resource_updates_existing_registration(
    hass: HomeAssistant, entry: MockConfigEntry, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Reloads update the cache key in place and never duplicate the resource."""
    resources = hass.data[LOVELACE_DATA].resources
    await resources.async_get_info()
    for item in list(resources.async_items()):
        await resources.async_delete_item(item["id"])
    existing = await resources.async_create_item(
        {"url": "/activity_levels_panel/activity-levels-cards.js?v=old", "res_type": "js"}
    )
    await resources.store.async_save({"items": [existing]})
    resources = ResourceStorageCollection(hass, resources.ll_config)
    hass.data[LOVELACE_DATA].resources = resources
    assert not resources.loaded
    monkeypatch.setattr(panel_module, "_bundle_hash", lambda name: "newdigest")
    await panel_module.async_register_panel(hass)
    await panel_module.async_register_panel(hass)
    assert resources.async_items() == [
        {
            "id": existing["id"],
            "url": "/activity_levels_panel/activity-levels-cards.js?v=newdigest",
            "type": "module",
        }
    ]


async def test_cards_resource_created_once(
    hass: HomeAssistant, entry: MockConfigEntry, monkeypatch: pytest.MonkeyPatch
) -> None:
    resources = hass.data[LOVELACE_DATA].resources
    await resources.async_get_info()
    for item in list(resources.async_items()):
        await resources.async_delete_item(item["id"])
    monkeypatch.setattr(panel_module, "_bundle_hash", lambda name: "cardsdigest")
    await panel_module._async_register_cards(hass)
    await panel_module._async_register_cards(hass)
    assert len(resources.async_items()) == 1
    assert resources.async_items()[0]["url"].endswith("activity-levels-cards.js?v=cardsdigest")
    assert resources.async_items()[0]["type"] == "module"


async def test_yaml_resources_are_not_modified(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    resources = ResourceYAMLCollection([{"url": "/local/my-card.js", "type": "module"}])
    hass.data[LOVELACE_DATA].resources = resources
    await panel_module._async_register_cards(hass)
    assert resources.async_items() == [{"url": "/local/my-card.js", "type": "module"}]


async def test_missing_cards_bundle_does_not_add_resource(
    hass: HomeAssistant, entry: MockConfigEntry, monkeypatch: pytest.MonkeyPatch
) -> None:
    resources = hass.data[LOVELACE_DATA].resources
    await resources.async_get_info()
    before = list(resources.async_items())
    monkeypatch.setattr(panel_module, "_bundle_hash", lambda name: None)
    await panel_module._async_register_cards(hass)
    assert resources.async_items() == before


async def test_cards_resource_failure_keeps_sidebar(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    monkeypatch.setattr(panel_module, "_bundle_hash", lambda name: "cardsdigest")
    monkeypatch.setattr(
        hass.data[LOVELACE_DATA].resources,
        "async_get_info",
        AsyncMock(side_effect=HomeAssistantError("storage unavailable")),
    )
    await panel_module.async_register_panel(hass)
    assert PANEL_URL_PATH in hass.data[frontend.DATA_PANELS]
    assert "Could not register" in caplog.text
