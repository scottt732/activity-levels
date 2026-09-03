"""The person filter: one belief over (room, which devices are carried).

Same graph as `test_estimator.py`: kitchen -- dining_room -- hall -> bedroom,
kitchen -- back_patio -- (away). One scanner per room.
"""

from __future__ import annotations

import numpy as np
import pytest

from custom_components.activity_levels.const import AWAY
from custom_components.activity_levels.presence.carried import Signals, Weights
from custom_components.activity_levels.presence.estimator import Estimator
from custom_components.activity_levels.presence.observation import (
    DeviceFrame,
    Observation,
    PersonObservation,
    RoomActivity,
)
from custom_components.activity_levels.presence.person import PersonEstimator
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import build_topology
from tests.fixtures import rooms_config

ROOMS = ("kitchen", "dining_room", "hall", "bedroom", "back_patio")
SCANNERS = {f"s_{room}": room for room in ROOMS}
SETTINGS = {"stay": 0.9, "escape": 0.001, "scale": 3.0, "floor": 0.05, "stuck_after": 60.0}


@pytest.fixture
def topo():
    return build_topology(validate_config(rooms_config()))


def device(topo) -> Estimator:
    return Estimator(topo, SCANNERS, **SETTINGS)


def person(topo, devices: dict[str, Estimator], **kwargs) -> PersonEstimator:
    settings = {
        "stay": 0.9,
        "escape": 0.001,
        "prior": 0.7,
        "flip": 300.0,
        "recent": 120.0,
        "weights": Weights(),
        "stuck_after": 60.0,
    }
    return PersonEstimator(topo, devices, **{**settings, **kwargs})


def near(room: str, *, far: float = 8.0, close: float = 0.5) -> dict[str, float]:
    return {key: (close if mapped == room else far) for key, mapped in SCANNERS.items()}


def frame(room: str, **signals: bool) -> DeviceFrame:
    return DeviceFrame(distances=near(room), home=True, signals=Signals(**signals))


def test_belief_is_a_distribution_over_rooms_and_carried_flags(topo) -> None:
    phone, watch = device(topo), device(topo)
    est = person(topo, {"phone": phone, "watch": watch})
    assert est.belief.shape == (len(topo.states), 4)
    assert est.belief.sum() == pytest.approx(1.0)
    out = est.update(
        PersonObservation(t=0.0, devices={"phone": frame("kitchen"), "watch": frame("kitchen")})
    )
    assert est.belief.sum() == pytest.approx(1.0)
    assert out.room == "kitchen"
    assert set(out.carried) == {"phone", "watch"}
    assert all(0.0 <= p <= 1.0 for p in out.carried.values())
    assert est.room_belief.sum() == pytest.approx(1.0)


def test_one_certainly_carried_device_reproduces_the_device_filter(topo) -> None:
    """With the carried flag pinned, the person filter *is* the device filter."""
    alone = device(topo)
    phone = device(topo)
    est = person(topo, {"phone": phone}, prior=0.999999, flip=1e12)
    rng = np.random.default_rng(3)
    t = 0.0
    # a walk along the edges, a few frames in each room: what a person actually does.
    # Teleporting between non-adjacent rooms would be a different test -- readings that
    # jump impossibly are fair evidence that the device is not on anybody, and the
    # person filter is entitled to say so
    walk = ["kitchen"] * 4 + ["dining_room"] * 3 + ["hall"] * 4 + ["dining_room"] * 3
    walk += ["kitchen"] * 3 + ["back_patio"] * 4 + ["kitchen"] * 3
    for room in walk:
        distances = {key: float(d + rng.normal(0.0, 0.1)) for key, d in near(room).items()}
        alone.update(Observation(t=t, distances=distances, home=True))
        est.update(PersonObservation(t=t, devices={"phone": DeviceFrame(distances=distances)}))
        phone.update(Observation(t=t, distances=distances, home=True))
        # the parked column carries a millionth of the mass and explains the frame a
        # little differently; that is the whole difference
        assert np.allclose(est.room_belief, alone.belief, atol=1e-4)
        t += 1.0


def test_a_parked_phone_is_explained_away_and_the_watch_wins(topo) -> None:
    """Last night: the phone stays on the couch, the person walks off wearing the watch.

    Dining room stands in for the theater. Both devices sit there long enough for the
    filter to settle, then the watch reads the kitchen (and jitters, as a worn device
    does) while the phone keeps reading the dining room, flat -- and the dining room's
    activity level reads 0.0 because nobody is moving in it any more.
    """
    phone, watch = device(topo), device(topo)
    est = person(topo, {"phone": phone, "watch": watch})
    t = 0.0
    for _ in range(20):
        obs = PersonObservation(
            t=t,
            devices={"phone": frame("dining_room"), "watch": frame("dining_room", jitter=True)},
            activity={"dining_room": RoomActivity(level=0.8, slope=-0.01)},
        )
        est.update(obs)
        phone.update(Observation(t=t, distances=near("dining_room"), home=True))
        watch.update(Observation(t=t, distances=near("dining_room"), home=True))
        t += 1.0
    assert est.outputs().room == "dining_room"

    out = None
    for _ in range(30):
        obs = PersonObservation(
            t=t,
            devices={
                "phone": frame("dining_room", jitter=False, still_room_empty=True),
                "watch": frame("kitchen", jitter=True),
            },
            activity={
                "dining_room": RoomActivity(level=0.0, slope=0.0),
                "kitchen": RoomActivity(level=0.8, slope=0.0),
            },
        )
        out = est.update(obs)
        phone.update(Observation(t=t, distances=near("dining_room"), home=True))
        watch.update(Observation(t=t, distances=near("kitchen"), home=True))
        t += 1.0
        if out.room == "kitchen" and out.carried["phone"] < 0.5:
            break
    assert out is not None
    assert out.room == "kitchen"
    assert out.carried["phone"] < 0.5
    assert out.carried["watch"] > 0.5
    assert out.device_rooms == {"phone": "dining_room", "watch": "kitchen"}


def test_a_charging_phone_is_probably_parked(topo) -> None:
    phone = device(topo)
    est = person(topo, {"phone": phone})
    out = None
    for t in range(0, 300, 30):
        out = est.update(
            PersonObservation(t=float(t), devices={"phone": frame("kitchen", charging=True)})
        )
        phone.update(Observation(t=float(t), distances=near("kitchen"), home=True))
    assert out is not None and out.carried["phone"] < 0.5
    # ... but its readings still say where it is, and with nothing else to go on the
    # person is still most likely beside it
    assert out.room == "kitchen"


def test_a_device_missing_from_a_frame_is_no_evidence_either_way(topo) -> None:
    phone, watch = device(topo), device(topo)
    est = person(topo, {"phone": phone, "watch": watch})
    out = est.update(PersonObservation(t=0.0, devices={"watch": frame("hall")}))
    assert out.room == "hall"
    assert out.carried["phone"] == pytest.approx(0.7, abs=0.05)  # the prior, untouched


def test_away_when_a_carried_device_says_not_home(topo) -> None:
    phone = device(topo)
    est = person(topo, {"phone": phone}, prior=0.95)
    out = None
    for t in range(8):
        out = est.update(
            PersonObservation(
                t=float(t),
                devices={"phone": DeviceFrame(distances=dict.fromkeys(SCANNERS, None), home=False)},
            )
        )
        phone.update(Observation(t=float(t), distances=dict.fromkeys(SCANNERS, None), home=False))
    assert out is not None and out.room == AWAY


def test_locate_moves_the_room_and_keeps_the_carried_marginals(topo) -> None:
    phone, watch = device(topo), device(topo)
    est = person(topo, {"phone": phone, "watch": watch})
    for t in range(5):
        est.update(
            PersonObservation(
                t=float(t),
                devices={"phone": frame("kitchen", charging=True), "watch": frame("kitchen")},
            )
        )
    before = est.outputs()
    est.locate("hall")
    after = est.outputs()
    assert after.room == "hall" and after.confidence == pytest.approx(1.0)
    assert after.carried == pytest.approx(before.carried, abs=1e-9)
    assert est.belief.sum() == pytest.approx(1.0)


def test_snapshot_round_trips_and_refuses_a_changed_device_list(topo) -> None:
    phone, watch = device(topo), device(topo)
    est = person(topo, {"phone": phone, "watch": watch})
    est.update(
        PersonObservation(t=3.0, devices={"phone": frame("kitchen"), "watch": frame("kitchen")})
    )
    data = est.snapshot()
    again = person(topo, {"phone": device(topo), "watch": device(topo)})
    assert again.restore(data) is True
    assert np.allclose(again.belief, est.belief)
    assert again.last_t == 3.0
    other = person(topo, {"phone": device(topo)})
    assert other.restore(data) is False
    assert (
        other.restore({"states": list(topo.states), "devices": ["phone"], "belief": "no"}) is False
    )
