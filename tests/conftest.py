"""Shared test configuration."""

from __future__ import annotations

import pytest
from homeassistant.components.recorder import migration as _recorder_migration
from homeassistant.components.recorder.core import Recorder as _Recorder
from homeassistant.helpers import recorder as _recorder_helper
from sqlalchemy.orm.session import Session as _Session

pytest_plugins = "pytest_homeassistant_custom_component"


def _patch_recorder_annotations() -> None:
    """Make the recorder modules' deferred annotations evaluable.

    Python 3.14 evaluates deferred annotations eagerly when ``unittest.mock.create_autospec``
    inspects a function's signature. ``recorder.migration`` and ``helpers.recorder`` only
    import ``Recorder``/``Session`` under ``TYPE_CHECKING``, so the
    pytest-homeassistant-custom-component recorder fixtures -- which autospec-patch several
    of their functions -- hit a ``NameError`` before any of our code runs. Backfilling the
    names on the modules is enough for annotation evaluation to succeed; it changes no
    behaviour, and re-applying it is a no-op.
    """
    _recorder_migration.Recorder = _Recorder
    _recorder_helper.Recorder = _Recorder
    _recorder_helper.Session = _Session


_patch_recorder_annotations()


@pytest.fixture(autouse=True)
def _auto_enable_custom_integrations(request: pytest.FixtureRequest) -> None:
    """Enable custom integrations for every test that does not need the recorder first.

    ``recorder_mock`` has to prepare the recorder's database *before* the ``hass`` fixture
    body runs, and ``enable_custom_integrations`` pulls ``hass`` in. So for a recorder test
    this fixture stands aside: ``recorder_ready`` enables custom integrations afterwards,
    and a test using ``recorder_mock`` directly (because it never loads our integration
    through HA's loader) gets no custom-integration support at all, as before.
    """
    if "recorder_mock" in request.fixturenames:
        return
    request.getfixturevalue("enable_custom_integrations")


@pytest.fixture
async def recorder_ready(request: pytest.FixtureRequest, recorder_mock: None) -> None:
    """A running in-memory recorder *and* custom integrations, in that order.

    Ask for this (before ``hass``) in any test that both records/reads history and sets up
    the ``activity_levels`` config entry through Home Assistant's own loader.
    """
    request.getfixturevalue("enable_custom_integrations")
