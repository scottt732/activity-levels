"""One tracked device's belief about which room it is in.

A hidden Markov filter over :class:`..topology.Topology`: the graph is the transition
model, the distance readings are the emission model, and the whole point is that the
transition model makes a jump between two rooms with no door between them cost
something. Pure numpy; no ``homeassistant`` imports.

Cost, for the record: 20 rooms and 10 scanners is a 21x21 matrix-vector product and a
21-long sum per update -- microseconds. It runs inline on the event loop.
"""

from __future__ import annotations

import math
from collections import deque
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

import numpy as np
import numpy.typing as npt

from ..const import AWAY
from ..topology import Topology
from .observation import Observation

HISTORY = 120
"""Likelihoods the stuck detector keeps. At one observation a second, two minutes."""
BUFFER = 30
"""Observations the bounded Viterbi runs over."""
MIN_HISTORY = 20
"""Before this many, there is no percentile worth comparing against."""
CANDIDATE_FLOOR = 0.1
MOVING_SECOND = 0.25
PATH_STEPS = 5
_TINY = 1e-300
"""Stands in for zero inside a logarithm: a forbidden step costs ~-691, not -inf."""


@dataclass(frozen=True)
class Outputs:
    """What one update concluded. ``room`` may be ``away``; that is a real answer."""

    t: float
    room: str
    confidence: float
    moving: bool
    candidates: dict[str, float]
    path: list[str]

    def as_dict(self) -> dict[str, Any]:
        return {
            "t": self.t,
            "room": self.room,
            "confidence": self.confidence,
            "moving": self.moving,
            "candidates": dict(self.candidates),
            "path": list(self.path),
        }


class Estimator:
    """The filter for one device. Not thread-safe; it lives on the event loop."""

    def __init__(
        self,
        topology: Topology,
        scanners: Mapping[str, str],
        *,
        stay: float,
        escape: float,
        scale: float,
        floor: float,
        stuck_after: float,
        activity_floor: float = 0.05,
    ) -> None:
        self.topology = topology
        self.states = topology.states
        self.scanners = dict(scanners)
        self.scale = scale
        self.floor = floor
        self.activity_floor = activity_floor
        self.stuck_after = stuck_after
        self._transition = topology.transition_matrix(stay, escape)
        self._log_transition = np.log(np.where(self._transition > 0.0, self._transition, _TINY))
        size = len(self.states)
        self._position = {state: i for i, state in enumerate(self.states)}
        self.belief: npt.NDArray[np.float64] = np.full(size, 1.0 / size, dtype=np.float64)
        self._history: deque[float] = deque(maxlen=HISTORY)
        self._buffer: deque[npt.NDArray[np.float64]] = deque(maxlen=BUFFER)
        self._low_since: float | None = None
        self._frozen: float | None = None
        self.last_t: float | None = None
        self.resets = 0

    # -- emission -----------------------------------------------------------

    def log_emission(self, obs: Observation) -> npt.NDArray[np.float64]:
        """log P(obs | state), per state.

        A scanner reading *close* is evidence for its own room and against every other:
        ``-d/tau`` where the scanner is, ``-max(0, tau - d)/tau`` everywhere else, so a
        reading past tau says nothing about anywhere. A room nothing reported for this
        time -- no scanner of its own, or a silent one -- can collect neither kind of
        evidence and sits at the constant ``floor``: passable, never a winner unaided.
        ``away`` is certain when the tracker says we are out, and ``floor**2`` when it
        does not -- worse than any room, so only the transition model can put us there
        while we are home.

        A room's own activity level is the other kind of evidence, and it only ever
        counts against: ``log(ε + (1 - ε)·a)`` with ``a`` the level in ``[0, 1]``, or 1
        while the level is rising, shifted so the busiest room scores zero. With other
        people home, a busy room is weak evidence that *this* person is there, so a busy
        room scores nothing; a room at ``0.0`` beside a busy one is strong evidence they
        are not, and scores ``log ε`` -- the same footing as a room with no scanner.
        ``away`` has no level and takes no term, which is why the shift matters: see
        :meth:`_log_activity`.

        **This method is the seam.** Learned per-room, per-scanner distance tables
        replace the distance half of it and change nothing else.
        """
        tau = self.scale
        log_floor = math.log(self.floor)
        out = np.zeros(len(self.states), dtype=np.float64)
        heard = np.zeros(len(self.states), dtype=bool)
        for scanner, distance in obs.distances.items():
            room = self.scanners.get(scanner)
            if distance is None or room is None:
                continue
            position = self._position[room]
            near = -distance / tau
            against = -max(0.0, tau - distance) / tau
            out += against
            out[position] += near - against
            heard[position] = True
        out[~heard] = log_floor
        out[self._position[AWAY]] = 2.0 * log_floor if obs.home else 0.0
        out += self._log_activity(obs)
        return out

    def _log_activity(self, obs: Observation) -> npt.NDArray[np.float64]:
        """The activity term, per state: zero for the busiest room, ``log ε`` for an empty one.

        Shifted so the best-scoring room sits at zero, because the term is about which
        room is *more* plausible than another and nothing else. Without the shift a
        house with every room at 0.0 -- everybody asleep -- would penalise every room
        by the same amount and, ``away`` carrying no term, tip the belief out of the
        house while the tracker says we are in it.
        """
        term = np.zeros(len(self.states), dtype=np.float64)
        if not obs.activity:
            return term
        seen: list[int] = []
        for room, activity in obs.activity.items():
            index = self._position.get(room)
            if index is None or room == AWAY:
                continue
            epsilon = self.activity_floor if activity.floor is None else activity.floor
            a = max(min(activity.level, 1.0), 1.0 if activity.slope > 0.0 else 0.0)
            term[index] = math.log(epsilon + (1.0 - epsilon) * a)
            seen.append(index)
        if seen:
            term[seen] -= term[seen].max()
        return term

    def emission(self, obs: Observation) -> tuple[npt.NDArray[np.float64], float]:
        """The likelihood, scaled so its largest entry is 1, and the log scale removed.

        Scaling first is what keeps a house full of scanners from underflowing: ten
        readings multiply into e**-30 territory, and the filter only ever needs ratios.
        """
        log_e = self.log_emission(obs)
        shift = float(log_e.max())
        return np.exp(log_e - shift), shift

    # -- filter -------------------------------------------------------------

    def update(self, obs: Observation) -> Outputs:
        """One forward step: predict through the graph, then weigh by the evidence."""
        likelihood, shift = self.emission(obs)
        predicted = self._transition.T @ self.belief
        joint = predicted * likelihood
        total = float(joint.sum())
        if total <= 0.0:
            # nothing the filter predicted is possible any more; believe the evidence
            joint = likelihood
            total = float(joint.sum())
        self.belief = joint / total
        self._buffer.append(np.log(np.where(likelihood > 0.0, likelihood, _TINY)))
        self._check_stuck(obs.t, math.log(max(total, _TINY)) + shift, likelihood)
        self.last_t = obs.t
        return self.outputs(obs.t)

    def _check_stuck(self, t: float, logp: float, likelihood: npt.NDArray[np.float64]) -> None:
        """Reset when the evidence has been implausible for ``stuck_after`` seconds.

        "Implausible" is measured against this device's own history, not an absolute
        number: how surprising a reading is depends entirely on how many scanners hear
        it and how far away they are. Below the history's 5th percentile for long
        enough means the filter is following somebody who is not there, and the fastest
        way out is to stop predicting and believe what the scanners say.

        Every reading enters the history, including the bad ones. Keeping them out looks
        like it protects the definition of normal, but the retained window is then the
        distribution conditioned on clearing the running 5th percentile -- and *its* 5th
        percentile is higher again. That ratchets, one censored tail at a time, until
        normal means the best reading ever seen and a motionless person trips the
        detector. Measured: on a stationary stream the threshold climbed -0.55 to -0.18
        over five thousand frames and then reset on nothing.

        What must hold still instead is the bar for a run already in progress. The
        threshold is frozen when the run opens and the whole run is judged against that
        one value, so a long stretch of nonsense cannot lower the bar out from under
        itself mid-run. Recovery or a reset throws the frozen value away and the live
        percentile -- computed over every reading -- takes over again.
        """
        if len(self._history) >= MIN_HISTORY:
            threshold = self._frozen
            if threshold is None:
                threshold = float(np.quantile(np.asarray(self._history, dtype=np.float64), 0.05))
            if logp < threshold:
                if self._low_since is None:
                    self._low_since, self._frozen = t, threshold
                elif t - self._low_since >= self.stuck_after:
                    total = float(likelihood.sum())
                    if total > 0.0:
                        self.belief = likelihood / total
                    self._buffer.clear()
                    self._history.clear()
                    self._low_since = self._frozen = None
                    self.resets += 1
                    return
            else:
                self._low_since = self._frozen = None
        self._history.append(logp)

    # -- reads --------------------------------------------------------------

    def outputs(self, t: float | None = None) -> Outputs:
        order = np.argsort(self.belief)[::-1]
        top = int(order[0])
        second = int(order[1]) if order.size > 1 else top
        moving = (
            second != top
            and float(self.belief[second]) > MOVING_SECOND
            and self.topology.connected(self.states[top], self.states[second])
        )
        return Outputs(
            t=t if t is not None else (self.last_t or 0.0),
            room=self.states[top],
            confidence=round(float(self.belief[top]), 4),
            moving=moving,
            candidates={
                self.states[int(i)]: round(float(self.belief[int(i)]), 4)
                for i in order
                if float(self.belief[int(i)]) > CANDIDATE_FLOOR
            },
            path=self.path(),
        )

    def path(self) -> list[str]:
        """The most likely route through the buffered observations.

        Viterbi over the ring buffer only, from a uniform prior: a bounded answer to a
        bounded question ("how did you get here, roughly"), not a reconstruction of the
        whole evening. Consecutive repeats collapse -- standing still is not a step --
        and only the last few survive, because that is all a breadcrumb needs.
        """
        if not self._buffer:
            return []
        size = len(self.states)
        scores = np.full(size, -math.log(size), dtype=np.float64) + self._buffer[0]
        back: list[npt.NDArray[np.int64]] = []
        for log_likelihood in list(self._buffer)[1:]:
            step = scores[:, None] + self._log_transition
            choice = np.argmax(step, axis=0)
            scores = step[choice, np.arange(size)] + log_likelihood
            back.append(choice)
        route = [int(np.argmax(scores))]
        for choice in reversed(back):
            route.append(int(choice[route[-1]]))
        route.reverse()
        walked = [self.states[i] for i in route]
        collapsed = [state for i, state in enumerate(walked) if i == 0 or state != walked[i - 1]]
        return collapsed[-PATH_STEPS:]

    # -- persistence --------------------------------------------------------

    def snapshot(self) -> dict[str, Any]:
        """The belief, with the state space it was written against."""
        return {
            "states": list(self.states),
            "belief": [float(value) for value in self.belief],
            "t": self.last_t,
        }

    def restore(self, data: Mapping[str, Any]) -> bool:
        """Take a stored belief back, or refuse and keep the current one.

        A changed state space is a refusal, not a migration: the vector no longer means
        what it meant when it was written, and a uniform prior is a better start than a
        confident wrong room.

        Anything that is not the shape ``snapshot`` writes is a refusal too, rather than
        an exception: this runs while the config entry is being set up, and a store some
        other version -- or some other hand -- left behind must not take the integration
        down with it.
        """
        states = data.get("states")
        if not isinstance(states, list) or states != list(self.states):
            return False
        try:
            belief = np.array([float(value) for value in data["belief"]], dtype=np.float64)
        except KeyError, TypeError, ValueError:
            return False
        if (
            belief.shape != self.belief.shape
            or not bool(np.all(np.isfinite(belief)))
            or bool(np.any(belief < 0.0))
        ):
            return False
        total = float(belief.sum())
        if total <= 0.0:
            return False
        self.belief = belief / total
        stamp = data.get("t")
        self.last_t = float(stamp) if isinstance(stamp, int | float) else None
        return True
