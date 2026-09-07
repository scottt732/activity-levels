"""Sidebar panel registration."""

from __future__ import annotations

import hashlib
import logging
import os
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError

from .const import (
    BUNDLE_NAME,
    DEV_SERVER_ENV,
    DOMAIN,
    PANEL_ELEMENT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    SCHEMA_NAME,
    SCHEMA_URL,
    STATIC_URL,
)

_LOGGER = logging.getLogger(__name__)

_STATIC_REGISTERED = f"{DOMAIN}_static_registered"
_FRONTEND_DIR = Path(__file__).parent / "frontend"
_SCHEMA_FILE = Path(__file__).parent / SCHEMA_NAME
_CARDS_BUNDLE_NAME = "activity-levels-cards.js"


def _bundle_hash(name: str = BUNDLE_NAME) -> str | None:
    """Cache-busting digest of the built bundle, or None when it is not there."""
    bundle = _FRONTEND_DIR / name
    if not bundle.is_file():
        return None
    return hashlib.sha256(bundle.read_bytes()).hexdigest()[:12]


async def _async_register_cards(hass: HomeAssistant) -> None:
    """Keep the dashboard resource current without changing YAML-owned resources."""
    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace is None or not isinstance(lovelace.resources, ResourceStorageCollection):
        return
    digest = await hass.async_add_executor_job(_bundle_hash, _CARDS_BUNDLE_NAME)
    if digest is None:
        _LOGGER.warning("Dashboard cards bundle is missing; build the frontend or reinstall")
        return
    resource_path = f"{STATIC_URL}/{_CARDS_BUNDLE_NAME}"
    url = f"{resource_path}?v={digest}"
    resources = lovelace.resources
    try:
        # Resources load lazily. Listing before loading could create a duplicate on
        # every restart; use the collection's public loading API first.
        await resources.async_get_info()
        matches = [
            item
            for item in resources.async_items()
            if item["url"].split("?", 1)[0] == resource_path
        ]
        if not matches:
            await resources.async_create_item({"url": url, "res_type": "module"})
        else:
            for item in matches:
                if item["url"] != url or item["type"] != "module":
                    await resources.async_update_item(
                        item["id"], {"url": url, "res_type": "module"}
                    )
    except HomeAssistantError:
        # A dashboard resource failure must not stop the room estimator or sidebar.
        _LOGGER.exception("Could not register the Activity Levels dashboard cards resource")


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the static path and sidebar panel, once per HA run."""
    if not hass.data.get(_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [
                # The schema first, and deliberately: the directory below it is served by
                # a prefix resource that would match this URL and answer 404, because the
                # file lives beside the integration rather than inside the bundle folder.
                # Routes resolve in registration order, so the exact match has to be added
                # before the prefix. It is also uncached -- a schema an editor pinned for a
                # year would outlive the integration that describes it.
                StaticPathConfig(SCHEMA_URL, str(_SCHEMA_FILE), cache_headers=False),
                StaticPathConfig(STATIC_URL, str(_FRONTEND_DIR), cache_headers=True),
            ]
        )
        hass.data[_STATIC_REGISTERED] = True
    await _async_register_cards(hass)
    if PANEL_URL_PATH in hass.data.get(frontend.DATA_PANELS, {}):
        return
    dev_server = os.environ.get(DEV_SERVER_ENV)
    if dev_server:
        module_url = f"{dev_server.rstrip('/')}/src/main.ts"
        trust_external = True
    else:
        digest = await hass.async_add_executor_job(_bundle_hash)
        if digest is None:
            # A registered panel with no module behind it is a sidebar entry that only
            # ever renders blank, so the panel is left out until the bundle is built.
            _LOGGER.error(
                "Frontend bundle %s is missing, so the Activity Levels panel is not "
                "registered. Build it with 'pnpm build' in frontend/, or reinstall the "
                "integration",
                _FRONTEND_DIR / BUNDLE_NAME,
            )
            return
        module_url = f"{STATIC_URL}/{BUNDLE_NAME}?v={digest}"
        trust_external = False
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_ELEMENT,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=module_url,
        embed_iframe=False,
        trust_external=trust_external,
        require_admin=True,
        config={},
    )


@callback
def async_unregister_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar panel on entry unload."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
