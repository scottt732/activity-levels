"""Immutable envelope configuration and shared enums."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import isfinite


class Phase(StrEnum):
    IDLE = "idle"
    ATTACK = "attack"
    DECAY = "decay"
    SUSTAIN = "sustain"
    RELEASE = "release"


class Retrigger(StrEnum):
    ONLY_IN_RELEASE = "only_in_release"
    ALWAYS = "always"


class Unavailable(StrEnum):
    HOLD = "hold"
    NOTE_OFF = "note_off"


class Mix(StrEnum):
    SUM = "sum"
    MAX = "max"
    MEAN = "mean"


class NullHandling(StrEnum):
    ZERO = "zero"
    IGNORE = "ignore"


@dataclass(frozen=True)
class Envelope:
    """ADSR envelope parameters. Durations are seconds; sustain is a fraction of peak."""

    attack: float = 0.0
    decay: float = 0.0
    sustain: float = 1.0
    release: float = 1800.0
    impulse: bool = False
    retrigger: Retrigger = Retrigger.ONLY_IN_RELEASE
    unavailable: Unavailable = Unavailable.HOLD
    debounce: float = 0.0

    def __post_init__(self) -> None:
        for name in ("attack", "decay", "release", "debounce"):
            value = getattr(self, name)
            # NaN compares False against everything, so test finiteness explicitly.
            if not isfinite(value) or value < 0:
                raise ValueError(f"{name} must be a finite number >= 0")
        if not isfinite(self.sustain) or not 0.0 <= self.sustain <= 1.0:
            raise ValueError("sustain must be in [0, 1]")
