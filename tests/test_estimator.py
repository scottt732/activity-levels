"""The room filter, on the `rooms_config` graph.

kitchen -- dining_room -- hall -> bedroom, kitchen -- back_patio -- (away)

Scanners: one per room, keyed by the room name so the tests read as English.
"""

from __future__ import annotations

import numpy as np
import pytest

from custom_components.activity_levels.const import AWAY
from custom_components.activity_levels.presence.estimator import Estimator
from custom_components.activity_levels.presence.observation import (
    Observation,
    parse_distance,
    scanner_key,
)
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import build_topology
from tests.fixtures import rooms_config

ROOMS = ("kitchen", "dining_room", "hall", "bedroom", "back_patio")
SCANNERS = {f"s_{room}": room for room in ROOMS}


@pytest.fixture
def topo():
    return build_topology(validate_config(rooms_config()))


def make(topo, **kwargs) -> Estimator:
    settings = {
        "stay": 0.9,
        "escape": 0.001,
        "scale": 3.0,
        "floor": 0.05,
        "stuck_after": 60.0,
    }
    return Estimator(topo, SCANNERS, **{**settings, **kwargs})


def at(room: str, t: float, *, far: float = 8.0, near: float = 0.5, home: bool = True):
    """One observation: every scanner reports, the named room's one is close."""
    return Observation(
        t=t,
        distances={key: (near if mapped == room else far) for key, mapped in SCANNERS.items()},
        home=home,
    )


def test_scanner_key_and_parse_distance() -> None:
    phone = "aa:bb:cc"
    assert scanner_key("aa:bb:cc_11:22:33_range", phone) == "11:22:33"
    assert scanner_key("aa:bb:cc_area", phone) is None
    assert scanner_key("aa:bb:cc_floor", phone) is None
    # the device's own closest-range sensor: the suffix matches, the scanner is missing
    assert scanner_key("aa:bb:cc_range", phone) is None
    # the unfiltered twin, which would otherwise count every distance twice
    assert scanner_key("aa:bb:cc_11:22:33_range_raw", phone) is None
    # somebody else's phone, seen through the same scanner
    assert scanner_key("dd:ee:ff_11:22:33_range", phone) is None
    assert scanner_key("range", phone) is None
    assert parse_distance("2.5") == 2.5
    assert parse_distance("999") is None  # Bermuda's "no idea"
    assert parse_distance("1000") is None
    assert parse_distance("unknown") is None
    assert parse_distance(None) is None
    assert parse_distance("-1") is None
    assert parse_distance("0") == 0.0


def test_belief_starts_uniform_and_stays_a_distribution(topo) -> None:
    est = make(topo)
    assert est.belief.shape == (len(topo.states),)
    assert est.belief.sum() == pytest.approx(1.0)
    out = est.update(at("kitchen", 0.0))
    assert est.belief.sum() == pytest.approx(1.0)
    assert out.room == "kitchen" and out.confidence > 0.5
    assert out.t == 0.0


def test_a_room_with_no_scanner_sits_at_the_floor(topo) -> None:
    est = Estimator(
        topo,
        {"s_kitchen": "kitchen"},
        stay=0.9,
        escape=0.001,
        scale=3.0,
        floor=0.05,
        stuck_after=60.0,
    )
    log_e = est.log_emission(Observation(t=0.0, distances={"s_kitchen": 0.5}, home=True))
    assert log_e[topo.index("hall")] == pytest.approx(np.log(0.05))
    assert log_e[topo.index("kitchen")] > log_e[topo.index("hall")]


def test_a_close_reading_is_evidence_against_every_other_room(topo) -> None:
    est = make(topo)
    log_e = est.log_emission(at("kitchen", 0.0))
    assert log_e[topo.index("kitchen")] > log_e[topo.index("dining_room")]
    # a reading beyond tau says nothing either way, so the far rooms are not punished twice
    log_far = est.log_emission(
        Observation(t=0.0, distances=dict.fromkeys(SCANNERS, 9.0), home=True)
    )
    assert log_far[topo.index("kitchen")] == pytest.approx(log_far[topo.index("hall")])


def test_a_walk_is_recovered(topo) -> None:
    est = make(topo)
    t = 0.0
    walked: list[str] = []
    for room in ("kitchen", "kitchen", "dining_room", "dining_room", "hall", "hall"):
        out = est.update(at(room, t))
        walked.append(out.room)
        t += 1.0
    assert walked[-1] == "hall"
    assert walked == [
        "kitchen",
        "kitchen",
        "dining_room",
        "dining_room",
        "hall",
        "hall",
    ]
    assert est.outputs().path[-3:] == ["kitchen", "dining_room", "hall"]
    assert est.resets == 0  # walking through your own house is not being stuck


def test_an_impossible_jump_is_rejected_then_recovered(topo) -> None:
    """kitchen and bedroom share no edge: one frame cannot move you between them."""
    est = make(topo)
    for t in range(5):
        est.update(at("kitchen", float(t)))
    out = est.update(at("bedroom", 5.0))
    assert out.room != "bedroom"  # the graph does not allow the jump in one step

    for t in range(6, 60):
        out = est.update(at("bedroom", float(t)))
        if out.room == "bedroom":
            break
    assert out.room == "bedroom"  # escape gets there eventually, within seconds
    assert t < 40
    assert est.resets == 0  # briefly surprising is not the same as unexplainable


def nonsense(t: float) -> Observation:
    """Every scanner middling, one of them close: no single room explains this.

    A clean walk to the bedroom is *not* stuck evidence -- the filter simply walks there
    too, and within a few frames it is unsurprised again. Being stuck means the readings
    stay worse than anything this device has seen, however the belief moves.
    """
    return Observation(
        t=t,
        distances={key: (0.1 if mapped == "bedroom" else 2.5) for key, mapped in SCANNERS.items()},
        home=True,
    )


def test_the_stuck_detector_resets_the_belief(topo) -> None:
    est = make(topo, stuck_after=5.0)
    t = 0.0
    for _ in range(40):  # a settled, unsurprising history
        est.update(at("kitchen", t))
        t += 1.0
    assert est.resets == 0
    while est.resets == 0 and t < 200.0:  # now evidence the filter cannot explain
        est.update(nonsense(t))
        t += 1.0
    assert t == 46.0  # five seconds under the 5th percentile, and the frame that started it
    assert est.resets == 1
    assert est.outputs().room == "bedroom"
    assert est.belief.sum() == pytest.approx(1.0)


def test_a_stationary_noisy_stream_never_resets(topo) -> None:
    """Standing still under ordinary sensor noise must never look like being stuck.

    The threshold is a percentile of this device's own history, so what enters that
    history decides whether it holds still. Judging a run against the percentile *in
    force when the run began* is what keeps it honest: the reading that starts a run
    still joins the history, but it cannot move the bar it is being measured against
    while the run is open, and it cannot be quietly excluded from normal either.

    ``stuck_after`` is short here because that is what makes the failure quick to
    provoke: the shorter the run needed, the sooner a drifting threshold finds one.
    """
    est = make(topo, stuck_after=10.0)
    rng = np.random.default_rng(20260827)
    for i in range(3000):
        distances = {
            key: max(0.0, (0.5 if mapped == "kitchen" else 8.0) + float(rng.normal(0.0, 0.3)))
            for key, mapped in SCANNERS.items()
        }
        est.update(Observation(t=float(i), distances=distances, home=True))
    assert est.resets == 0
    assert est.outputs().room == "kitchen"


def test_away_wins_when_the_tracker_says_not_home(topo) -> None:
    est = make(topo)
    est.update(at("kitchen", 0.0))
    out = est.update(Observation(t=1.0, distances=dict.fromkeys(SCANNERS, None), home=False))
    for t in range(2, 8):
        out = est.update(Observation(t=float(t), distances={}, home=False))
    assert out.room == AWAY
    assert out.candidates[AWAY] > 0.5


def test_candidates_and_moving(topo) -> None:
    """Standing between two adjacent rooms splits the belief, and that is "moving".

    It takes six frames, not one: ``stay`` is 0.9, so a settled belief only leaks about
    5% of itself into a neighbour per step however even-handed the evidence is. That
    lag is the filter working -- one ambiguous reading is not somebody in a doorway --
    and six frames is the number worth pinning.
    """
    est = make(topo)
    est.update(at("kitchen", 0.0))
    between = {
        "s_kitchen": 1.0,
        "s_dining_room": 1.0,
        "s_hall": 8.0,
        "s_bedroom": 8.0,
        "s_back_patio": 8.0,
    }
    for t in range(1, 6):
        assert est.update(Observation(t=float(t), distances=between, home=True)).moving is False
    out = est.update(Observation(t=6.0, distances=between, home=True))
    assert set(out.candidates) >= {"kitchen", "dining_room"}
    assert all(value > 0.1 for value in out.candidates.values())
    assert out.moving is True

    settled = est.update(at("kitchen", 7.0))
    assert settled.moving is False


def test_moving_is_false_between_rooms_with_no_edge(topo) -> None:
    est = make(topo)
    obs = Observation(
        t=0.0,
        distances={
            "s_kitchen": 1.0,
            "s_bedroom": 1.0,
            "s_dining_room": 8.0,
            "s_hall": 8.0,
            "s_back_patio": 8.0,
        },
        home=True,
    )
    out = est.update(obs)
    assert out.moving is False  # they are both plausible, but not a step apart


def test_snapshot_round_trip_and_refusal(topo) -> None:
    est = make(topo)
    for t in range(4):
        est.update(at("dining_room", float(t)))
    snapshot = est.snapshot()

    restored = make(topo)
    assert restored.restore(snapshot) is True
    assert np.allclose(restored.belief, est.belief)
    assert restored.outputs().room == "dining_room"

    assert restored.restore({"states": ["kitchen"], "belief": [1.0]}) is False
    assert (
        restored.restore({"belief": [0.0] * len(topo.states), "states": list(topo.states)}) is False
    )
    assert restored.restore({"nonsense": True}) is False
    assert restored.outputs().room == "dining_room"  # a refusal changes nothing


def test_restore_refuses_a_malformed_store_rather_than_raising(topo) -> None:
    """A store written by something else, or corrupted, is somebody else's bad data.

    ``restore`` is called while a config entry is being set up, so anything it raises
    takes the whole integration down; every shape that is not the shape it wrote has to
    come back as a refusal and a uniform prior.
    """
    est = make(topo)
    before = est.belief.copy()
    for data in (
        {"states": 1, "belief": []},
        {"states": None, "belief": []},
        {"states": "kitchen", "belief": []},
        {"states": list(topo.states), "belief": 3},
        {"states": list(topo.states), "belief": [None] * len(topo.states)},
    ):
        assert est.restore(data) is False
    assert np.allclose(est.belief, before)
