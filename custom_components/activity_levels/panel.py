"""Sidebar panel registration."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http.server import StaticPathConfig
from homeassistant.core import HomeAssistant, callback

from .const import (
    BUNDLE_NAME,
    DEV_SERVER_ENV,
    DOMAIN,
    PANEL_ELEMENT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    STATIC_URL,
)

_STATIC_REGISTERED = f"{DOMAIN}_static_registered"
_FRONTEND_DIR = Path(__file__).parent / "frontend"


def _bundle_hash() -> str:
    bundle = _FRONTEND_DIR / BUNDLE_NAME
    if not bundle.is_file():
        return "missing"
    return hashlib.sha256(bundle.read_bytes()).hexdigest()[:12]


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the static path and sidebar panel, once per HA run."""
    if not hass.data.get(_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(_FRONTEND_DIR), cache_headers=True)]
        )
        hass.data[_STATIC_REGISTERED] = True
    if PANEL_URL_PATH in hass.data.get(frontend.DATA_PANELS, {}):
        return
    dev_server = os.environ.get(DEV_SERVER_ENV)
    if dev_server:
        module_url = f"{dev_server.rstrip('/')}/src/main.ts"
        trust_external = True
    else:
        digest = await hass.async_add_executor_job(_bundle_hash)
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
