"""Human evidence that yields only to a fresh, sustained contradiction.

These policies know no clock or Home Assistant state. Source timestamps come from
the caller so reading the same sample on another timer tick cannot count twice.
Room protection is bounded; a carrying assertion does not expire just because a
watch without companion sensors has been quiet for a long time.
"""

from __future__ import annotations

import math
from collections import deque
from collections.abc import Mapping, Set
from dataclasses import dataclass, field
from typing import Any

from ..const import AWAY
from ..topology import MAX_HOPS, Topology
from .observation import RoomActivity

WINDOW = 120.0
QUALIFY = 30.0
FADE = 60.0
ROOM_HOLD = 900.0
ROOM_FADE = 120.0


@dataclass
class Correction:
    """An assertion and its remaining weight, plus a bounded support interval."""

    value: str | bool
    t: float
    anchor: str | None = None
    strength: float = 1.0
    reason: str = "Confirmed by you"
    baseline: dict[str, float | None] = field(default_factory=dict)
    rooms: tuple[str, ...] = ()
    certainty: str = "definite"
    exclude: bool = False
    floor: str | None = None
    _sample: float | None = None
    _start: float | None = None
    _last: float | None = None
    _count: int = 0
    _qualified: bool = False
    _route_room: str | None = None
    _route_candidate: str | None = None
    _route_since: float | None = None
    _route_sample: float | None = None
    _route_count: int = 0

    def route(
        self,
        topology: Topology,
        room: str,
        confidence: float,
        activity: Mapping[str, RoomActivity],
        t: float,
        sample: float | None,
        distances: Mapping[str, float | None] | None = None,
    ) -> bool:
        """Keep confirmed intermediate rooms so an observed walk can span many doors."""
        if sample is None or sample <= self.t or sample > t or t - sample > WINDOW:
            return False
        if isinstance(self.value, bool) and self.anchor in (None, AWAY):
            if room != AWAY and confidence >= 0.6:
                # Coming back online locates a parked object; it is not a pickup.
                # Establish the starting room so later movement can be assessed.
                self.anchor = room
                self.baseline = dict(distances or {})
            return False
        if self.rooms:
            # A floor or negative assertion has no single confirmed starting room.
            # Fresh sustained movement into contradictory territory can release it.
            return confidence >= 0.6 and ((room in self.rooms) == self.exclude)
        if room == self.anchor:
            self._route_room = self._route_candidate = None
            self._route_count = 0
            return False
        if any(value is not None for value in self.baseline.values()) and distances is not None:
            changed = any(
                old is not None
                and (current := distances.get(key)) is not None
                and abs(old - current) >= 1.0
                for key, old in self.baseline.items()
            )
            if not changed:
                return False
        anchor = self._route_room or self.anchor
        supported = (
            room != self.anchor and room == self._route_room and confidence >= 0.6
        ) or route_support(topology, anchor, room, confidence, activity, t, self.t)
        if self._route_sample is not None and sample <= self._route_sample:
            return supported
        if self._route_sample is not None and sample - self._route_sample > WINDOW:
            self._route_room = None
            self._route_candidate = None
            supported = route_support(topology, self.anchor, room, confidence, activity, t, self.t)
        self._route_sample = sample
        if not supported or room != self._route_candidate:
            self._route_candidate = room if supported else None
            self._route_since = sample
            self._route_count = 0
        if supported:
            self._route_count += 1
            if (
                self._route_since is not None
                and self._route_count >= 3
                and sample - self._route_since >= QUALIFY
            ):
                self._route_room = room
        return supported

    def weight(self, t: float) -> float:
        if isinstance(self.value, str):
            return min(self.strength, max(0.0, 1.0 - max(0.0, t - self.t - ROOM_HOLD) / ROOM_FADE))
        return self.strength

    def observe(self, t: float, sample: float | None, supported: bool) -> None:
        """Reduce strength only for distinct samples in a continuous support interval.

        A contradiction stops qualification immediately. A gap starts a new interval,
        even when the next sensor value still says moving. Already removed weight
        stays removed; missing evidence does not manufacture either certainty.
        """
        if sample is None or not math.isfinite(sample) or sample <= self.t or sample > t:
            return
        if t - sample > WINDOW or (self._sample is not None and sample <= self._sample):
            return
        self._sample = sample
        if not supported:
            self._start = self._last = None
            self._count = 0
            self._qualified = False
            return
        if self._last is None or sample - self._last > WINDOW:
            self._start = sample
            self._count = 0
            self._qualified = False
        previous = self._last
        self._count += 1
        if self._qualified and previous is not None:
            self.strength = max(0.0, self.strength - (sample - previous) / FADE)
        elif self._start is not None and self._count >= 3 and sample - self._start >= QUALIFY:
            self._qualified = True
        self._last = sample
        if self._qualified:
            self.reason = (
                "Movement detected" if self.value is not True else "Device may be left behind"
            )
        if self.strength == 0.0:
            self.reason = "Automatic — correction released after new evidence"

    def payload(self, t: float) -> dict[str, Any]:
        strength = self.weight(t)
        reason = self.reason
        if isinstance(self.value, str) and t > self.t + ROOM_HOLD:
            reason = "Correction expiring" if strength else "Automatic — room correction expired"
        return {
            "value": self.value,
            "t": self.t,
            "strength": strength,
            "reason": reason,
            "rooms": list(self.rooms),
            "certainty": self.certainty,
            "exclude": self.exclude,
            "floor": self.floor,
        }

    def snapshot(self) -> dict[str, Any]:
        return {
            "value": self.value,
            "t": self.t,
            "anchor": self.anchor,
            "strength": self.strength,
            "reason": self.reason,
            "baseline": dict(self.baseline),
            "rooms": list(self.rooms),
            "certainty": self.certainty,
            "exclude": self.exclude,
            "floor": self.floor,
        }

    @classmethod
    def restore(cls, data: Any, rooms: Set[str]) -> Correction | None:
        """Restore assertions, never partial movement support from before a restart."""
        if not isinstance(data, Mapping):
            return None
        targets = data.get("rooms", [])
        certainty = data.get("certainty", "definite")
        exclude = data.get("exclude", False)
        floor = data.get("floor")
        if (
            not isinstance(targets, list)
            or len(targets) > len(rooms)
            or any(not isinstance(room, str) or room not in rooms for room in targets)
            or certainty not in ("definite", "probable")
            or not isinstance(exclude, bool)
            or (floor is not None and not isinstance(floor, str))
        ):
            return None
        value = data.get("value")
        if (targets and isinstance(value, bool)) or (floor is not None and not targets):
            return None
        if not isinstance(value, bool) and (
            not isinstance(value, str) or (value not in rooms and not targets)
        ):
            return None
        if exclude and set(targets or (value,)) == set(rooms):
            return None
        try:
            t, strength = float(data["t"]), float(data["strength"])
        except KeyError, TypeError, ValueError:
            return None
        if not math.isfinite(t) or not math.isfinite(strength) or not 0.0 <= strength <= 1.0:
            return None
        anchor = data.get("anchor")
        if anchor is not None and (not isinstance(anchor, str) or anchor not in rooms):
            return None
        reason = data.get("reason", "Confirmed by you")
        baseline = data.get("baseline", {})
        if not isinstance(baseline, Mapping) or len(baseline) > 1000:
            return None
        if any(
            not isinstance(key, str)
            or (
                reading is not None
                and (
                    not isinstance(reading, int | float)
                    or not math.isfinite(reading)
                    or reading < 0.0
                )
            )
            for key, reading in baseline.items()
        ):
            return None
        return cls(
            value,
            t,
            anchor,
            strength,
            str(reason)[:120],
            dict(baseline),
            tuple(targets),
            certainty,
            exclude,
            floor,
        )


def route_support(
    topology: Topology,
    anchor: str | None,
    room: str,
    confidence: float,
    activity: Mapping[str, RoomActivity],
    t: float,
    since: float,
) -> bool:
    """An adjacent step, or a route with fresh activity in its intermediate rooms.

    A directed graph can describe a route without supplying evidence anybody took
    it. Only intermediate activity reported since the correction can bridge missing
    device observations. Unknown tracker state must not create an exit event.
    """
    if anchor is None or room in (anchor, AWAY) or anchor == AWAY or confidence < 0.6:
        return False
    if topology.is_adjacent(anchor, room):
        return True
    # Follow time-ordered evidence without enumerating all paths in a dense graph.
    pending = deque([(anchor, since, 0)])
    visited = {anchor}
    while pending:
        node, previous, depth = pending.popleft()
        if depth >= MAX_HOPS:
            continue
        for nxt in topology.neighbours(node):
            if nxt == room:
                return True
            reading = activity.get(nxt)
            stamp = None if reading is None else reading.observed_at
            if (
                nxt not in visited
                and stamp is not None
                and previous < stamp <= t
                and t - stamp <= WINDOW
            ):
                visited.add(nxt)
                pending.append((nxt, stamp, depth + 1))
    return False
