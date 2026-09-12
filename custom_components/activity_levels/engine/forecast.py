"""Conditional idle forecasts without advancing the live engine into the future."""

from copy import deepcopy
from math import isfinite

from .group import Group


def idle_by(group: Group, now: float) -> float | None:
    """Return an idle-by bound with no further inputs, or None for held activity.

    Each voice has at most attack, decay and release boundaries. A copied tree keeps
    queries monotonic and makes this read-only to the coordinator. Taking the last
    boundary is conservative for mixers that reach zero before all inputs retire.
    """
    snapshot = deepcopy(group)
    voices = list(snapshot.live_voices())
    time = now
    for _ in range(3 * len(voices) + 1):
        value = snapshot.value_at(time)
        boundaries = [end for voice in voices if (end := voice.next_boundary(time)) is not None]
        if not boundaries:
            return time if value == 0 else None
        time = min(boundaries)
        if not isfinite(time):
            return None
    return None
