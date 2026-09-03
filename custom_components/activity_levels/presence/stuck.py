"""The stuck detector: when the evidence has been implausible for too long, say so.

Shared by the device filter and the person filter, which judge different likelihoods
but need exactly the same rule about them. Pure.
"""

from __future__ import annotations

from collections import deque

import numpy as np

HISTORY = 120
"""Likelihoods kept. At one observation a second, two minutes."""
MIN_HISTORY = 20
"""Before this many, there is no percentile worth comparing against."""
QUANTILE = 0.05


class StuckDetector:
    """Trips when ``logp`` has stayed below its own 5th percentile for ``stuck_after``.

    "Implausible" is measured against the device's own history, not an absolute
    number: how surprising a reading is depends entirely on how many scanners hear it
    and how far away they are. Below the history's 5th percentile for long enough
    means the filter is following somebody who is not there, and the fastest way out
    is to stop predicting and believe what the scanners say.

    Every reading enters the history, including the bad ones. Keeping them out looks
    like it protects the definition of normal, but the retained window is then the
    distribution conditioned on clearing the running 5th percentile -- and *its* 5th
    percentile is higher again. That ratchets, one censored tail at a time, until
    normal means the best reading ever seen and a motionless person trips the
    detector. Measured: on a stationary stream the threshold climbed -0.55 to -0.18
    over five thousand frames and then reset on nothing.

    What must hold still instead is the bar for a run already in progress. The
    threshold is frozen when the run opens and the whole run is judged against that
    one value, so a long stretch of nonsense cannot lower the bar out from under
    itself mid-run. Recovery or a reset throws the frozen value away and the live
    percentile -- computed over every reading -- takes over again.
    """

    def __init__(self, stuck_after: float) -> None:
        self.stuck_after = stuck_after
        self._history: deque[float] = deque(maxlen=HISTORY)
        self._low_since: float | None = None
        self._frozen: float | None = None

    def check(self, t: float, logp: float) -> bool:
        """Record one likelihood. True means: reset now; the history has been cleared."""
        if len(self._history) >= MIN_HISTORY:
            threshold = self._frozen
            if threshold is None:
                threshold = float(
                    np.quantile(np.asarray(self._history, dtype=np.float64), QUANTILE)
                )
            if logp < threshold:
                if self._low_since is None:
                    self._low_since, self._frozen = t, threshold
                elif t - self._low_since >= self.stuck_after:
                    self.clear()
                    return True
            else:
                self._low_since = self._frozen = None
        self._history.append(logp)
        return False

    def clear(self) -> None:
        """Forget everything: what a reset, or a restored belief, wants."""
        self._history.clear()
        self._low_since = self._frozen = None
