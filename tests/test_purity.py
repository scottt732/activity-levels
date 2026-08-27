"""The purity boundary AGENTS.md promises, enforced rather than asserted in prose.

``engine/``, ``patterns/``, ``presence/`` and ``topology.py`` must import cleanly with no
``homeassistant`` anywhere -- that is what lets them be tested without a Home Assistant
fixture, and what keeps the integration layer the only place that touches the clock, the
state machine or the service bus. A single re-export in a shared module is enough to lose
it silently, because the test suite always has Home Assistant installed and would never
notice.

So each module is imported in a *subprocess* with ``homeassistant`` made unimportable two
ways: ``sys.modules["homeassistant"] = None``, and a ``builtins.__import__`` guard that
names the offender instead of leaving an opaque ``ImportError`` behind. The subprocess
stubs ``custom_components.activity_levels`` as a bare package object pointing at the
source directory, so the package's own ``__init__.py`` -- which is integration code and
imports Home Assistant on purpose -- never runs.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = ROOT / "custom_components" / "activity_levels"
PURE_PACKAGES = ("engine", "patterns", "presence")
PURE_MODULES = ("topology",)

# The guarded importer, run as `python -c` so the parent process's already-imported
# Home Assistant cannot make it pass by accident.
SCRIPT = """
import builtins, importlib, sys, types

_real = builtins.__import__


def _guard(name, globals=None, locals=None, fromlist=(), level=0):
    if level == 0 and name.partition(".")[0] == "homeassistant":
        raise AssertionError("imported homeassistant: " + name)
    return _real(name, globals, locals, fromlist, level)


builtins.__import__ = _guard
sys.modules["homeassistant"] = None

root, target = sys.argv[1], sys.argv[2]
namespace = types.ModuleType("custom_components")
namespace.__path__ = [root + "/custom_components"]
package = types.ModuleType("custom_components.activity_levels")
package.__path__ = [root + "/custom_components/activity_levels"]
namespace.activity_levels = package
sys.modules["custom_components"] = namespace
sys.modules["custom_components.activity_levels"] = package

importlib.import_module(target)
"""


def _pure_module_names() -> list[str]:
    """Every module the boundary covers, found on disk so a new file is covered too."""
    names = [f"custom_components.activity_levels.{name}" for name in PURE_MODULES]
    for package in PURE_PACKAGES:
        for path in sorted((PACKAGE / package).glob("*.py")):
            stem = path.stem
            names.append(
                f"custom_components.activity_levels.{package}"
                if stem == "__init__"
                else f"custom_components.activity_levels.{package}.{stem}"
            )
    return names


@pytest.mark.parametrize("module", _pure_module_names())
def test_pure_module_imports_without_homeassistant(module: str) -> None:
    result = subprocess.run(
        [sys.executable, "-c", SCRIPT, str(ROOT), module],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
        check=False,
    )
    assert result.returncode == 0, f"{module} could not be imported purely:\n{result.stderr}"


def test_the_guard_itself_catches_an_integration_module() -> None:
    """A control: the same subprocess must refuse a module that really does import HA."""
    result = subprocess.run(
        [sys.executable, "-c", SCRIPT, str(ROOT), "custom_components.activity_levels.entity"],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
        check=False,
    )
    assert result.returncode != 0
    assert "imported homeassistant" in result.stderr
