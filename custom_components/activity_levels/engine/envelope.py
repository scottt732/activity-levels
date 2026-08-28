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


class RetriggerWhen(StrEnum):
    """When a trigger arriving on an envelope that is already sounding is honoured.

    This is only half of what the old single ``retrigger`` setting said: it decides
    *whether* the trigger counts, and :attr:`Envelope.stack` decides what an honoured
    one does. The five values are the phases a voice can be caught in, read as a
    prefix of the envelope's own life -- ``ALWAYS`` honours a trigger in any phase,
    each of the next three waits for one more segment to finish, and ``IDLE`` waits
    for the whole envelope to end.
    """

    #: Any phase, including the attack that is still rising.
    ALWAYS = "always"
    #: Decay, sustain or release -- everything once the attack has finished.
    AFTER_ATTACK = "after_attack"
    #: Sustain or release -- everything once the decay has finished.
    AFTER_DECAY = "after_decay"
    #: Only a note that is already fading.
    RELEASE = "release"
    #: Only a voice that has finished releasing and is back at zero.
    IDLE = "idle"


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
    """ADSR envelope parameters. Durations are seconds; sustain is a multiplier on peak.

    ``sustain`` is deliberately unbounded above. The decay target is
    ``sustain x peak``, so a value below 1 is the usual fall to a held level, 1 is a
    plateau at the peak, and a value above 1 makes the "decay" a slow *rise* to a
    level higher than the attack reached -- which is how a stimulus that matters more
    the longer it stays on is spelled. The group's limiter still caps the result.

    ``retrigger`` and ``stack`` are the two halves of what a single ``retrigger``
    setting used to say: the first decides when a new trigger is honoured at all, the
    second decides whether an honoured one piles its gain onto the level already
    sounding or restarts the rise toward plain ``gain``.
    """

    attack: float = 0.0
    decay: float = 0.0
    sustain: float = 1.0
    release: float = 1800.0
    impulse: bool = False
    retrigger: RetriggerWhen = RetriggerWhen.ALWAYS
    stack: bool = True
    unavailable: Unavailable = Unavailable.HOLD
    debounce: float = 0.0

    def __post_init__(self) -> None:
        for name in ("attack", "decay", "release", "debounce"):
            value = getattr(self, name)
            # NaN compares False against everything, so test finiteness explicitly.
            if not isfinite(value) or value < 0:
                raise ValueError(f"{name} must be a finite number >= 0")
        if not isfinite(self.sustain) or self.sustain < 0.0:
            raise ValueError("sustain must be a finite number >= 0")
