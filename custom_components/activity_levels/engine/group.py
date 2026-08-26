"""Recursive mixer: groups combine voices and child groups."""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass, field

from .envelope import Mix, NullHandling, Phase
from .voice import Voice

_MIN_DT = 1e-6


@dataclass
class Channel:
    """A mixer input: a voice or a child group, with a gain."""

    source: Voice | Group
    gain: float = 1.0

    def __post_init__(self) -> None:
        if self.gain <= 0:
            raise ValueError("channel gain must be > 0")


@dataclass
class Group:
    """A mixer bus. Its value is always computed from its channels; it holds no state."""

    id: str
    channels: list[Channel] = field(default_factory=list)
    mix: Mix = Mix.SUM
    null_handling: NullHandling = NullHandling.ZERO
    max_value: float = 5.0
    precision: int = 1

    def __post_init__(self) -> None:
        if self.max_value <= 0:
            raise ValueError("max_value must be > 0")
        if not 0 <= self.precision <= 3:
            raise ValueError("precision must be in 0..3")

    # -- traversal ----------------------------------------------------------

    def groups(self) -> Iterator[Group]:
        yield self
        for ch in self.channels:
            if isinstance(ch.source, Group):
                yield from ch.source.groups()

    def voices(self) -> Iterator[Voice]:
        for ch in self.channels:
            if isinstance(ch.source, Voice):
                yield ch.source
            else:
                yield from ch.source.voices()

    # -- mixing -------------------------------------------------------------

    def contributions_at(self, t: float) -> dict[str, float]:
        return {ch.source.id: ch.source.value_at(t) * ch.gain for ch in self.channels}

    def _mix(self, values: list[float]) -> float:
        if not values:
            return 0.0
        if self.mix is Mix.SUM:
            return sum(values)
        if self.mix is Mix.MAX:
            return max(values)
        if self.null_handling is NullHandling.IGNORE:
            active = [v for v in values if v > 0.0]
            return sum(active) / len(active) if active else 0.0
        return sum(values) / len(values)

    def _limit(self, raw: float) -> float:
        return min(max(raw, 0.0), self.max_value)

    def value_at(self, t: float) -> float:
        return self._limit(self._mix(list(self.contributions_at(t).values())))

    def display_value_at(self, t: float) -> float:
        return round(self.value_at(t), self.precision)

    # -- aggregates ---------------------------------------------------------

    def active_at(self, t: float) -> bool:
        return self.value_at(t) > 0.0

    def gated_at(self, t: float) -> bool:
        return any(v.gate for v in self.voices())

    def active_voices(self, t: float) -> int:
        return sum(1 for v in self.voices() if v.is_active(t))

    def last_activity(self) -> float | None:
        stamps = [v.last_note_on for v in self.voices() if v.last_note_on is not None]
        return max(stamps) if stamps else None

    def cooldown_at(self, t: float) -> float | None:
        if self.gated_at(t) or not self.active_at(t):
            return None
        ends = [
            b
            for v in self.voices()
            if v.phase is Phase.RELEASE and (b := v.next_boundary(t)) is not None
        ]
        return max(ends) if ends else None

    def next_boundary(self, t: float) -> float | None:
        bounds = [b for v in self.voices() if (b := v.next_boundary(t)) is not None]
        return min(bounds) if bounds else None

    # -- scheduling helpers -------------------------------------------------

    def _channel_slopes(self, t: float) -> list[tuple[float, float]]:
        """Return (contribution, slope_of_contribution) per channel."""
        out: list[tuple[float, float]] = []
        for ch in self.channels:
            out.append((ch.source.value_at(t) * ch.gain, ch.source.slope_at(t) * ch.gain))
        return out

    # slope_at is the signed rate of change of the *displayed* value. When the
    # raw (pre-limit) mix is above max_value and still falling, the displayed
    # value stays pinned at max_value until raw drops back below it, so the
    # true instantaneous slope of the display is 0 in that region. We treat
    # that whole region as slope 0 rather than computing the exact time raw
    # crosses max_value; this is an accepted approximation (see note below).
    def slope_at(self, t: float) -> float:
        pairs = self._channel_slopes(t)
        if not pairs:
            return 0.0
        if self.mix is Mix.SUM:
            slope = sum(s for _, s in pairs)
        elif self.mix is Mix.MAX:
            top = max(c for c, _ in pairs)
            slope = max(s for c, s in pairs if c == top)
        elif self.null_handling is NullHandling.IGNORE:
            active = [s for c, s in pairs if c > 0.0]
            slope = sum(active) / len(active) if active else 0.0
        else:
            slope = sum(s for _, s in pairs) / len(pairs)
        raw = self._mix([c for c, _ in pairs])
        if (raw >= self.max_value and slope > 0.0) or (raw <= 0.0 and slope < 0.0):
            return 0.0
        if raw > self.max_value and slope < 0.0:
            return 0.0  # still above the limiter; display is pinned until raw drops below
        return slope

    def next_display_change(self, t: float) -> float | None:
        boundary = self.next_boundary(t)
        slope = self.slope_at(t)
        if slope == 0.0:
            return boundary
        step = 10.0**-self.precision
        value = self.value_at(t)
        k = round(value / step)
        edge = (k + 0.5) * step if slope > 0.0 else (k - 0.5) * step
        dt = (edge - value) / slope
        if dt < _MIN_DT:
            dt += step / abs(slope)
        candidate = t + dt
        if boundary is not None and boundary < candidate:
            return boundary
        return candidate

    def find_group(self, group_id: str) -> Group | None:
        for g in self.groups():
            if g.id == group_id:
                return g
        return None

    def reset(self) -> None:
        for v in self.voices():
            v.reset()
