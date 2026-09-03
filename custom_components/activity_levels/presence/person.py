"""One person's belief about which room they are in, and which of their devices they have.

A phone left on the couch keeps reading the couch. A filter that follows the phone
follows the couch. The fix is not to guess harder about whether the phone is carried;
it is to make "carried" part of the state and let the evidence decide: the belief here
ranges over ``(room, c)`` with ``c`` a bit per device, and a device's readings are
explained by the *person's* room when its bit is set and by the device's own filter
-- wherever it thinks the object is -- when it is not. "Phone parked in the theater,
person in the kitchen with the watch" is then a hypothesis the filter holds, and the
phone's flat readings and the theater's empty activity level argue for it without any
heuristic having to notice first.

Cost: ``R`` rooms times ``2**D`` devices. Twenty rooms and three devices is a 21x8
belief and two small matrix products per update. Pure numpy; no ``homeassistant``.
"""

from __future__ import annotations

import math
from collections import deque
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

import numpy as np
import numpy.typing as npt

from ..topology import Topology
from .carried import Weights, log_odds
from .estimator import (
    _TINY,
    BUFFER,
    Estimator,
    Outputs,
    log_activity,
    summarise,
    viterbi,
)
from .observation import Observation, PersonObservation
from .stuck import StuckDetector


@dataclass(frozen=True)
class PersonOutputs(Outputs):
    """A device filter's answer, plus what the person filter knows about the devices."""

    carried: dict[str, float]
    device_rooms: dict[str, str]

    def as_dict(self) -> dict[str, Any]:
        return {
            **super().as_dict(),
            "carried": dict(self.carried),
            "device_rooms": dict(self.device_rooms),
        }


class PersonEstimator:
    """The joint filter for one person. Not thread-safe; it lives on the event loop.

    ``devices`` are the per-device filters, which the caller keeps updating on their
    own -- this filter only *reads* them, for the "explained by wherever the object is"
    half of the emission. Read them before updating them: the marginal it wants is the
    device's prediction for this frame, not its verdict after seeing it.
    """

    def __init__(
        self,
        topology: Topology,
        devices: Mapping[str, Estimator],
        *,
        stay: float,
        escape: float,
        prior: float,
        flip: float,
        recent: float,
        weights: Weights,
        stuck_after: float,
        nearby: float = 0.3,
        activity_floor: float = 0.05,
    ) -> None:
        self.topology = topology
        self.states = topology.states
        self.devices = dict(devices)
        self.device_ids = tuple(self.devices)
        self.prior = prior
        self.flip = flip
        self.recent = recent
        self.weights = weights
        self.nearby = nearby
        self.activity_floor = activity_floor
        self._transition = topology.transition_matrix(stay, escape)
        self._log_transition = np.log(np.where(self._transition > 0.0, self._transition, _TINY))
        self._position = {state: i for i, state in enumerate(self.states)}
        rooms = len(self.states)
        combos = 2 ** len(self.device_ids)
        # bits[c, d] is device d's carried flag in joint column c
        self._bits = np.array(
            [[(c >> d) & 1 for d in range(len(self.device_ids))] for c in range(combos)],
            dtype=np.float64,
        ).reshape(combos, len(self.device_ids))
        # rooms uniform; the flags drawn from the prior, which is also what the flip
        # clock keeps pulling them back to
        column = np.prod(np.where(self._bits > 0.5, prior, 1.0 - prior), axis=1, dtype=np.float64)
        self.belief: npt.NDArray[np.float64] = np.repeat(column[None, :] / rooms, rooms, axis=0)
        self._buffer: deque[npt.NDArray[np.float64]] = deque(maxlen=BUFFER)
        self._stuck = StuckDetector(stuck_after)
        self.last_t: float | None = None
        self.resets = 0

    # -- reads --------------------------------------------------------------

    @property
    def room_belief(self) -> npt.NDArray[np.float64]:
        """The belief over rooms, the carried flags summed out."""
        return np.asarray(self.belief.sum(axis=1), dtype=np.float64)

    def carried(self) -> dict[str, float]:
        """P(carried) per device: the belief mass in the columns where its bit is set."""
        mass = self.belief.sum(axis=0)  # over joint columns
        return {
            device: round(float((mass * self._bits[:, d]).sum()), 4)
            for d, device in enumerate(self.device_ids)
        }

    def outputs(self, t: float | None = None) -> PersonOutputs:
        rooms = summarise(
            self.topology,
            self.states,
            self.room_belief,
            t=t if t is not None else (self.last_t or 0.0),
            path=viterbi(self._buffer, self._log_transition, self.states),
        )
        return PersonOutputs(
            t=rooms.t,
            room=rooms.room,
            confidence=rooms.confidence,
            moving=rooms.moving,
            candidates=rooms.candidates,
            path=rooms.path,
            carried=self.carried(),
            device_rooms={
                device: est.states[int(np.argmax(est.belief))]
                for device, est in self.devices.items()
            },
        )

    # -- filter -------------------------------------------------------------

    def _carried_transition(self, dt: float) -> npt.NDArray[np.float64]:
        """Every ``flip`` seconds or so, each flag is redrawn from the prior.

        Reconsidering with probability ``1 - exp(-dt / flip)`` and then drawing carried
        with probability ``prior`` makes the prior the flags' stationary distribution:
        with nothing said about a device for long enough, P(carried) drifts back to it.
        The Kronecker product over devices is the joint matrix; at three devices it is
        8x8, and building it per update is cheaper than caching it against ``dt``.
        """
        p = 1.0 - math.exp(-max(dt, 0.0) / self.flip)
        one = np.array(
            [
                [1.0 - p * self.prior, p * self.prior],
                [p * (1.0 - self.prior), 1.0 - p * (1.0 - self.prior)],
            ],
            dtype=np.float64,
        )
        if not self.device_ids:
            return np.ones((1, 1), dtype=np.float64)
        # every factor is the same matrix, so which bit np.kron puts where does not
        # matter; it would if devices ever had flip clocks of their own
        joint: npt.NDArray[np.float64] = one
        for _ in self.device_ids[1:]:
            joint = np.asarray(np.kron(joint, one), dtype=np.float64)
        return joint

    def log_emission(self, obs: PersonObservation, dt: float) -> npt.NDArray[np.float64]:
        """log P(obs | room, c), as an ``(rooms, combos)`` array.

        For each device: carried, and its frame is the person's room's to explain --
        the device filter's own emission, plus the side evidence about being carried.
        Not carried, and the frame is explained by where the device actually is: with
        probability ``nearby`` that is the person's own room (you put it down beside
        you), otherwise wherever the device's own filter predicts, which is one number
        for every room. That mixture is what keeps a single phone on a kitchen charger
        from saying nothing at all about the kitchen.

        The side evidence is a *rate*: a signal held for ``recent`` seconds is worth its
        whole weight, a one-second frame a hundred-and-twentieth of it, so the answer
        does not depend on how often Bermuda happens to report.

        The house's activity term is added on the room axis.
        """
        rooms = len(self.states)
        activity = log_activity(obs.activity, self._position, rooms, self.activity_floor)
        out = np.repeat(activity[:, None], self._bits.shape[0], axis=1)
        rate = min(max(dt, 0.0), self.recent) / self.recent
        for d, device in enumerate(self.device_ids):
            frame = obs.devices.get(device)
            if frame is None:
                continue
            est = self.devices[device]
            single = Observation(t=obs.t, distances=frame.distances, home=frame.home)
            here = est.log_emission(single)
            there = est.log_marginal(single)
            side = rate * log_odds(frame.signals, self.weights)
            parked = np.logaddexp(math.log(1.0 - self.nearby) + there, math.log(self.nearby) + here)
            bit = self._bits[:, d]
            out += bit[None, :] * (here[:, None] + side)
            out += (1.0 - bit)[None, :] * parked[:, None]
        return out

    def update(self, obs: PersonObservation) -> PersonOutputs:
        """One forward step: rooms through the graph, flags through the flip clock, then
        weigh every joint state by the evidence."""
        dt = 0.0 if self.last_t is None else obs.t - self.last_t
        predicted = self._transition.T @ self.belief @ self._carried_transition(dt)
        log_e = self.log_emission(obs, dt)
        shift = float(log_e.max())
        likelihood = np.exp(log_e - shift)
        joint = predicted * likelihood
        total = float(joint.sum())
        if total <= 0.0:
            joint = likelihood
            total = float(joint.sum())
        self.belief = joint / total
        by_room = likelihood.sum(axis=1)
        self._buffer.append(np.log(np.where(by_room > 0.0, by_room, _TINY)))
        if self._stuck.check(obs.t, math.log(max(total, _TINY)) + shift):
            self.belief = likelihood / float(likelihood.sum())
            self._buffer.clear()
            self.resets += 1
        self.last_t = obs.t
        return self.outputs(obs.t)

    def locate(self, room: str) -> None:
        """A correction: the person *is* in ``room``. The carried marginals are kept --
        being told where you are says nothing about which pockets are full."""
        column = self.belief.sum(axis=0)
        self.belief = np.zeros_like(self.belief)
        self.belief[self._position[room], :] = column / float(column.sum())
        self._stuck.clear()

    # -- persistence --------------------------------------------------------

    def snapshot(self) -> dict[str, Any]:
        return {
            "states": list(self.states),
            "devices": list(self.device_ids),
            "belief": [float(value) for value in self.belief.ravel()],
            "t": self.last_t,
        }

    def restore(self, data: Mapping[str, Any]) -> bool:
        """Take a stored belief back, or refuse: a changed state space, a changed device
        list, or a shape that is not what ``snapshot`` writes."""
        if data.get("states") != list(self.states) or data.get("devices") != list(self.device_ids):
            return False
        try:
            belief = np.array([float(value) for value in data["belief"]], dtype=np.float64)
        except KeyError, TypeError, ValueError:
            return False
        if (
            belief.shape != (self.belief.size,)
            or not bool(np.all(np.isfinite(belief)))
            or bool(np.any(belief < 0.0))
        ):
            return False
        total = float(belief.sum())
        if total <= 0.0:
            return False
        self.belief = (belief / total).reshape(self.belief.shape)
        stamp = data.get("t")
        self.last_t = float(stamp) if isinstance(stamp, int | float) else None
        return True
