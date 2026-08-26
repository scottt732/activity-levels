"""Config flow: one click, everything else lives in options."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN
from .schema import default_options, validate_config


class ActivityLevelsConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the single-instance setup flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Confirm creation; groups and envelopes are configured in the panel afterwards."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is None:
            return self.async_show_form(step_id="user", data_schema=vol.Schema({}))
        return self.async_create_entry(
            title="Activity Levels", data={}, options=validate_config(default_options())
        )
