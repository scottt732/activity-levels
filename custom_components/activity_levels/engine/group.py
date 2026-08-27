"""Recursive mixer: groups combine voices and child groups."""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass, field
from math import isfinite

from .envelope import Mix, NullHandling, Phase
from .voice import Voice

_MIN_DT = 1e-3  # 1 ms: wakes are scheduled just *past* a threshold, never on it


@dataclass
class Channel:
    """A mixer input: a voice or a child group, with a gain.

    ``key`` disambiguates two channels fed by the same source; it defaults to the
    source id, which is unique in the common case of one channel per entity.

    ``muted`` silences this input without touching the source: a muted child group goes
    on computing and publishing its own value, the parent simply stops listening.
    """

    source: Voice | Group
    gain: float = 1.0
    key: str | None = None
    muted: bool = False

    def __post_init__(self) -> None:
        if not isfinite(self.gain) or self.gain <= 0:
            raise ValueError("channel gain must be a finite number > 0")

    @property
    def label(self) -> str:
        return self.key or self.source.id

    def value_at(self, t: float) -> float:
        """This channel's contribution to its group: nothing at all while muted."""
        return 0.0 if self.muted else self.source.value_at(t) * self.gain

    def slope_at(self, t: float) -> float:
        """The rate that contribution is changing at: flat while muted."""
        return 0.0 if self.muted else self.source.slope_at(t) * self.gain


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
        if not isfinite(self.max_value) or self.max_value <= 0:
            raise ValueError("max_value must be a finite number > 0")
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

    def live_voices(self) -> Iterator[Voice]:
        """The voices that can still move *this* group's value.

        ``voices`` walks everything the group owns -- which is what ``reset`` wants. This
        one stops at a muted channel, so a muted child's phase boundaries no longer show
        up as moments the parent has to wake for.
        """
        for ch in self._live():
            if isinstance(ch.source, Voice):
                yield ch.source
            else:
                yield from ch.source.live_voices()

    # -- mixing -------------------------------------------------------------

    def _live(self) -> list[Channel]:
        """The channels still feeding this group.

        A muted channel is *dropped* rather than zeroed, so MEAN loses it from the
        denominator too -- exactly the way ``null_handling: ignore`` drops a null.
        """
        return [ch for ch in self.channels if not ch.muted]

    def contributions_at(self, t: float) -> dict[str, float]:
        return {ch.label: ch.value_at(t) for ch in self.channels}

    def _counted(self, values: list[float]) -> list[float]:
        """The values a MEAN actually divides by: all of them, or -- under
        ``null_handling: ignore`` -- only the ones above zero."""
        if self.null_handling is NullHandling.IGNORE:
            return [v for v in values if v > 0.0]
        return values

    def _mix(self, values: list[float]) -> float:
        if not values:
            return 0.0
        if self.mix is Mix.SUM:
            return sum(values)
        if self.mix is Mix.MAX:
            return max(values)
        counted = self._counted(values)
        return sum(counted) / len(counted) if counted else 0.0

    def _limit(self, raw: float) -> float:
        return min(max(raw, 0.0), self.max_value)

    def _raw_value_at(self, t: float) -> float:
        """Pre-limiter mix. Iterates channels, not ``contributions_at``, so that two
        channels sharing a source both count."""
        return self._mix([ch.value_at(t) for ch in self._live()])

    def value_at(self, t: float) -> float:
        return self._limit(self._raw_value_at(t))

    def value_at_excluding(self, t: float, label: str) -> float:
        """The limited mix with the channel called ``label`` left out.

        Mirrors :meth:`value_at` rather than subtracting a contribution, so MAX and
        MEAN re-mix over the remaining channels instead of guessing. Used for a
        group's "real" value: the level without the synthetic trigger voice.
        """
        remaining = [ch for ch in self._live() if ch.label != label]
        return self._limit(self._mix([ch.value_at(t) for ch in remaining]))

    def contribution_for(self, t: float, label: str, target: float) -> float:
        """What the live channel called ``label`` must contribute for the raw mix to
        read ``target``.

        The inverse of :meth:`_mix` for one channel, so a level override can size the
        group's trigger voice against the mix the group really uses -- including the
        MEAN denominator, which counts the same channels ``_mix`` counts. The answer is
        deliberately unclamped, and two of them are not reachable: MAX cannot be pulled
        *down* by one channel (it answers ``target`` and the louder channel goes on
        winning), and a negative answer means the rest of the group is already past the
        target. What to do about either is the caller's policy, not the mixer's.
        """
        others = [ch.value_at(t) for ch in self._live() if ch.label != label]
        if self.mix is Mix.SUM:
            return target - sum(others)
        if self.mix is Mix.MAX:
            return target
        if self.null_handling is NullHandling.IGNORE:
            # only channels above zero divide, and a channel sized to a positive
            # contribution is one of them
            active = [v for v in others if v > 0.0]
            return target * (len(active) + 1) - sum(active)
        return target * (len(others) + 1) - sum(others)

    def max_contribution(self, t: float) -> float:
        """The most one channel can be worth sizing to: the peak that puts this group at
        its limiter and no higher.

        SUM and MAX read a channel at face value, so the limiter is the whole story. MEAN
        divides, and a channel asked to carry the whole average has to reach the limiter
        *times the divisor* to get there -- clamping it at ``max_value`` is why a MEAN
        group could never be pushed to full scale. The divisor is the one :meth:`_mix`
        uses: the live channels, minus (under ``ignore``) the ones sitting at zero, plus
        the channel being sized, which is about to be one of the counted ones.
        """
        if self.mix is not Mix.MEAN:
            return self.max_value
        live = [ch.value_at(t) for ch in self._live()]
        divisor = max(1, min(len(self._counted(live)) + 1, len(live)))
        return self.max_value * divisor

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
        bounds = [b for v in self.live_voices() if (b := v.next_boundary(t)) is not None]
        return min(bounds) if bounds else None

    # -- scheduling helpers -------------------------------------------------

    def _channel_slopes(self, t: float) -> list[tuple[float, float]]:
        """Return (contribution, slope_of_contribution) per channel still in the mix."""
        return [(ch.value_at(t), ch.slope_at(t)) for ch in self._live()]

    def _next_max_crossover(self, t: float) -> float | None:
        """Earliest future instant another channel overtakes the current MAX leader."""
        pairs = self._channel_slopes(t)
        if len(pairs) < 2:
            return None
        lead_c, lead_s = max(pairs, key=lambda p: (p[0], p[1]))
        best: float | None = None
        for c, s in pairs:
            if s <= lead_s or c >= lead_c:
                continue
            dt = (lead_c - c) / (s - lead_s)
            if dt > 0.0 and (best is None or dt < best):
                best = dt
        return None if best is None else t + best + _MIN_DT

    def _raw_slope_at(self, t: float) -> float:
        """Slope of the pre-limiter mix. No clamping, no pinning.

        Two approximations live here, both accepted:

        * MAX: the slope is that of the currently loudest channel. A crossover with
          another channel changes which channel leads, and that moment is not
          scheduled here: a steeper riser overtaking the leader is handled by
          ``_next_max_crossover``; falling crossovers only cause an early, redundant
          wake.
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
        if self.mix is Mix.MAX and (x := self._next_max_crossover(t)) is not None:
            candidates.append(x)
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
