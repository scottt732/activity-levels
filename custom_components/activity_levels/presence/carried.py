"""Whether a device is on its person: the evidence, and what each piece is worth.

A phone on a nightstand still reports distances, and they still fit a room -- the
wrong room, once its owner walks off. The person filter treats "carried" as a hidden
state and lets the readings argue it out; what this module adds is the side evidence
that readings alone cannot give, folded into one log-odds number per device per frame.
Pure: no ``homeassistant``, no clock, nothing but arithmetic.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, fields


@dataclass(frozen=True)
class Signals:
    """What one frame knows about a device being carried. ``None`` is "no idea".

    ``charging``: the battery is charging or full -- a phone on a cable is on a table.
    ``moving``: the companion app reports walking (or driving, cycling), or the step
    count rose lately -- a device that moves is being carried.
    ``still_room_empty``: the device's own room reads an activity level of zero and the
    device has not moved -- nobody is where the device is, so nobody has it.
    ``jitter``: its closest distance wandered lately -- a device in a pocket does; one on
    a shelf does not.
    """

    charging: bool | None = None
    moving: bool | None = None
    still_room_empty: bool | None = None
    jitter: bool | None = None


@dataclass(frozen=True)
class Weights:
    """The log-odds each signal adds while it is true. Zero switches one off."""

    charging: float = -3.0
    moving: float = 2.0
    still_room_empty: float = -2.0
    jitter: float = 1.0


def log_odds(signals: Signals, weights: Weights) -> float:
    """The evidence for "carried" this frame, as log-odds.

    Naive Bayes over the four: each true signal contributes its weight, a false or
    unknown one contributes nothing. Treating "known off" like "unknown" is deliberate
    -- the weights are one-sided ("charging says parked"; "not charging" says very
    little) and a symmetric penalty would double-count the prior.
    """
    total = 0.0
    for field in fields(Signals):
        if getattr(signals, field.name) is True:
            total += float(getattr(weights, field.name))
    return total


def logit(p: float) -> float:
    """``log(p / (1 - p))``: a probability as log-odds, for folding the prior in."""
    return math.log(p / (1.0 - p))
