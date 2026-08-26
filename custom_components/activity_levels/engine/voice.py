"""Per-stimulus ADSR envelope state machine."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from math import inf
from typing import Any

from .envelope import Envelope, Phase, Retrigger, Unavailable

_TIMED = frozenset({Phase.ATTACK, Phase.DECAY, Phase.RELEASE})


@dataclass
class Voice:
    """One envelope. All methods take an explicit time ``t`` in epoch seconds."""

    id: str
    gain: float
    envelope: Envelope
    phase: Phase = Phase.IDLE
    phase_start_t: float = 0.0
    phase_start_value: float = 0.0
    gate: bool = False
    last_note_on: float | None = None

    def __post_init__(self) -> None:
        if self.gain <= 0:
            raise ValueError("gain must be > 0")

    # -- segment geometry -------------------------------------------------

    def _segment(self) -> tuple[float, float]:
        """Return (target_value, duration_seconds) for the current phase."""
        e = self.envelope
        if self.phase is Phase.ATTACK:
            return self.gain, e.attack
        if self.phase is Phase.DECAY:
            if e.sustain >= 1.0:
                return self.gain, 0.0
            return self.gain * e.sustain, e.decay
        if self.phase is Phase.RELEASE:
            if self.phase_start_value <= 0.0:
                return 0.0, 0.0
            return 0.0, e.release * (self.phase_start_value / self.gain)
        return self.phase_start_value, inf  # SUSTAIN and IDLE hold forever

    def _phase_end_t(self) -> float:
        return self.phase_start_t + self._segment()[1]

    def _enter(self, phase: Phase, t: float, value: float) -> None:
        self.phase = phase
        self.phase_start_t = t
        self.phase_start_value = value

    def _advance(self, t: float) -> None:
        """Roll through any timed phases that have completed by ``t``."""
        while self.phase in _TIMED and t >= self._phase_end_t():
            target, _ = self._segment()
            end = self._phase_end_t()
            if self.phase is Phase.ATTACK:
                self._enter(Phase.DECAY, end, target)
            elif self.phase is Phase.DECAY:
                self._enter(Phase.SUSTAIN, end, target)
            else:
                self._enter(Phase.IDLE, end, 0.0)

    # -- queries ------------------------------------------------------------

    def value_at(self, t: float) -> float:
        self._advance(t)
        target, duration = self._segment()
        if duration == inf or duration <= 0.0:
            return self.phase_start_value
        frac = max(0.0, (t - self.phase_start_t) / duration)
        return self.phase_start_value + (target - self.phase_start_value) * frac

    def slope_at(self, t: float) -> float:
        self._advance(t)
        target, duration = self._segment()
        if duration == inf or duration <= 0.0:
            return 0.0
        return (target - self.phase_start_value) / duration

    def next_boundary(self, t: float) -> float | None:
        self._advance(t)
        if self.phase in _TIMED:
            return self._phase_end_t()
        return None

    def is_active(self, t: float) -> bool:
        self._advance(t)
        return self.phase is not Phase.IDLE

    # -- events -------------------------------------------------------------

    def note_on(self, t: float) -> bool:
        self._advance(t)
        e = self.envelope
        if self.last_note_on is not None and t - self.last_note_on < e.debounce:
            return False
        if self.gate and e.retrigger is Retrigger.ONLY_IN_RELEASE:
            return False
        current = self.value_at(t)
        self.last_note_on = t
        if e.impulse:
            self.gate = False
            self._enter(Phase.RELEASE, t, self.gain)
            return True
        self.gate = True
        self._enter(Phase.ATTACK, t, current)
        return True

    def note_off(self, t: float) -> None:
        self._advance(t)
        if not self.gate:
            return
        current = self.value_at(t)
        self.gate = False
        if current > 0.0:
            self._enter(Phase.RELEASE, t, current)
        else:
            self._enter(Phase.IDLE, t, 0.0)

    def unavailable(self, t: float) -> None:
        if self.envelope.unavailable is Unavailable.NOTE_OFF:
            self.note_off(t)

    def reset(self) -> None:
        self.gate = False
        self._enter(Phase.IDLE, 0.0, 0.0)

    # -- persistence --------------------------------------------------------

    def snapshot(self) -> dict[str, Any]:
        return {
            "phase": self.phase.value,
            "phase_start_t": self.phase_start_t,
            "phase_start_value": self.phase_start_value,
            "gate": self.gate,
            "last_note_on": self.last_note_on,
        }

    def restore(self, data: Mapping[str, Any]) -> None:
        try:
            phase = Phase(data["phase"])
            start_t = float(data["phase_start_t"])
            start_value = float(data["phase_start_value"])
            gate = bool(data.get("gate", False))
            raw_last = data.get("last_note_on")
            last = None if raw_last is None else float(raw_last)
        except (KeyError, ValueError, TypeError):
            self.reset()
            return
        self._enter(phase, start_t, min(max(start_value, 0.0), self.gain))
        self.gate = gate
        self.last_note_on = last
