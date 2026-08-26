"""Recursive mixer: groups combine voices and child groups."""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass, field

from .envelope import Mix, NullHandling, Phase
from .voice import Voice

_MIN_DT = 1e-3  # 1 ms: wakes are scheduled just *past* a threshold, never on it


@dataclass
class Channel:
    """A mixer input: a voice or a child group, with a gain.

    ``key`` disambiguates two channels fed by the same source; it defaults to the
    source id, which is unique in the common case of one channel per entity.
    """

    source: Voice | Group
    gain: float = 1.0
    key: str | None = None

    def __post_init__(self) -> None:
        if self.gain <= 0:
            raise ValueError("channel gain must be > 0")

    @property
    def label(self) -> str:
        return self.key or self.source.id


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
        labels = [ch.label for ch in self.channels]
        if len(set(labels)) != len(labels):
            raise ValueError("channel labels must be unique; set Channel.key to disambiguate")

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
        return {ch.label: ch.source.value_at(t) * ch.gain for ch in self.channels}

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

    def _raw_value_at(self, t: float) -> float:
        """Pre-limiter mix. Iterates channels, not ``contributions_at``, so that two
        channels sharing a source both count."""
        return self._mix([ch.source.value_at(t) * ch.gain for ch in self.channels])

    def value_at(self, t: float) -> float:
        return self._limit(self._raw_value_at(t))

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

    def _raw_slope_at(self, t: float) -> float:
        """Slope of the pre-limiter mix. No clamping, no pinning.

        Two approximations live here, both accepted:

        * MAX: the slope is that of the currently loudest channel. A crossover with
          another channel changes which channel leads, and that moment is not
          scheduled. The mixed *value* is continuous across a crossover, so this can
          only make a predicted display change land early (a redundant wake), never
          late, whenever the incoming leader is the shallower of the two.
        * MEAN: a channel reaching zero changes the divisor under IGNORE (and the
          numerator under ZERO), a step this slope does not see. Voice phase
          boundaries are separately scheduled by ``next_boundary``, which is where
          those dropouts occur, so the wake is not missed.
        """
        pairs = self._channel_slopes(t)
        if not pairs:
            return 0.0
        if self.mix is Mix.SUM:
            return sum(s for _, s in pairs)
        if self.mix is Mix.MAX:
            top = max(c for c, _ in pairs)
            return max(s for c, s in pairs if c == top)
        if self.null_handling is NullHandling.IGNORE:
            active = [s for c, s in pairs if c > 0.0]
            return sum(active) / len(active) if active else 0.0
        return sum(s for _, s in pairs) / len(pairs)

    # slope_at is the signed rate of change of the *displayed* value: the raw slope
    # with the limiter's flat regions zeroed out. While the raw mix sits above
    # max_value the display is pinned there and does not move, however fast raw is
    # falling; next_display_change schedules the un-pin crossing separately.
    def slope_at(self, t: float) -> float:
        slope = self._raw_slope_at(t)
        raw = self._raw_value_at(t)
        if (raw >= self.max_value and slope > 0.0) or (raw <= 0.0 and slope < 0.0):
            return 0.0
        if raw > self.max_value and slope < 0.0:
            return 0.0  # still above the limiter; display is pinned until raw drops below
        return slope

    def next_display_change(self, t: float) -> float | None:
        """Earliest time at which ``display_value_at`` can differ from its value now.

        Worked in *display* space: from the currently shown value, find the rounding
        edge the value is heading for and aim ``_MIN_DT`` past it. Aiming past the
        edge (rather than at it) means the next wake sees the crossing as done, so a
        wake landing an ulp short of a threshold no longer skips a whole step.
        """
        candidates: list[float] = []
        boundary = self.next_boundary(t)
        if boundary is not None:
            candidates.append(boundary)
        # While pinned by the limiter the display slope is 0, so the moment raw falls
        # back through max_value is the next change and nothing else would schedule it.
        raw = self._raw_value_at(t)
        raw_slope = self._raw_slope_at(t)
        if raw > self.max_value and raw_slope < 0.0:
            candidates.append(t + (self.max_value - raw) / raw_slope + _MIN_DT)
        slope = self.slope_at(t)
        if slope == 0.0:
            return min(candidates) if candidates else None
        step = 10.0**-self.precision
        value = self.value_at(t)
        shown = round(value, self.precision)
        edge = (shown / step + (0.5 if slope > 0.0 else -0.5)) * step
        dt = max((edge - value) / slope, 0.0)
        for _ in range(3):
            if round(value + slope * (dt + _MIN_DT), self.precision) != shown:
                break
            dt += step / abs(slope)  # half-even parity or an ulp blocked this threshold
        candidates.append(t + dt + _MIN_DT)
        return min(candidates)

    def find_group(self, group_id: str) -> Group | None:
        for g in self.groups():
            if g.id == group_id:
                return g
        return None

    def reset(self) -> None:
        for v in self.voices():
            v.reset()
