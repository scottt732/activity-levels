"""Recursive mixer: groups combine voices and child groups."""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass, field

from .envelope import Mix, NullHandling
from .voice import Voice


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
