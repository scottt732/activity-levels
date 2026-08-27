"""Room estimation from noisy proximity readings.

No ``homeassistant`` imports are allowed in this package -- like ``patterns``, it is
pure, testable analysis fed by data the integration layer gathers. ``numpy`` is allowed
here and in :mod:`..topology`, and nowhere else on the presence side.
"""

from __future__ import annotations
