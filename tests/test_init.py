from homeassistant.core import HomeAssistant

from custom_components.activity_levels.const import DOMAIN


async def test_domain_constant(hass: HomeAssistant) -> None:
    assert DOMAIN == "activity_levels"
    assert hass.is_running or hass.state is not None
