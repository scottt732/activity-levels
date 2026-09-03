"""The signature learner: per-room, per-scanner distance distributions from labels."""

from __future__ import annotations

import math

import numpy as np
import pytest

from custom_components.activity_levels.presence.estimator import Estimator
from custom_components.activity_levels.presence.observation import Observation
from custom_components.activity_levels.presence.signatures import (
    Signature,
    fit,
    from_document,
    to_document,
)
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import build_topology
from tests.fixtures import rooms_config

ROOMS = ("kitchen", "dining_room", "hall", "bedroom", "back_patio")
SCANNERS = {f"s_{room}": room for room in ROOMS}


def label(
    room: str, distances: dict[str, float | None], *, carried: float = 1.0, t: float = 0.0
) -> dict:
    return {
        "t": t,
        "person": "Scott",
        "room": room,
        "source": "panel",
        "frames": {"phone": {"distances": distances, "home": True, "signals": {}}},
        "carried": {"phone": carried},
        "activity": {},
    }


def couch_labels(n: int, seed: int = 0) -> list[dict]:
    """The theater couch: its own scanner reads ~3 m, the den's ~12 m, the rest silent."""
    rng = np.random.default_rng(seed)
    return [
        label(
            "kitchen",
            {
                "s_kitchen": float(math.exp(rng.normal(math.log(3.0), 0.2))),
                "s_dining_room": float(math.exp(rng.normal(math.log(12.0), 0.2))),
                "s_hall": None,
                "s_bedroom": None,
                "s_back_patio": None,
            },
            t=float(i),
        )
        for i in range(n)
    ]


def test_fit_learns_where_the_couch_is() -> None:
    signatures = fit(
        couch_labels(40), scanner_map=SCANNERS, scale=3.0, min_labels=8, prior_weight=4.0
    )
    kitchen = signatures["kitchen"]
    assert math.exp(kitchen["s_kitchen"].mu) == pytest.approx(3.0, rel=0.15)
    assert math.exp(kitchen["s_dining_room"].mu) == pytest.approx(12.0, rel=0.15)
    assert kitchen["s_kitchen"].heard > 0.9
    # a scanner that never heard the phone in this room says so
    assert kitchen["s_hall"].heard < 0.15
    assert kitchen["s_kitchen"].n == 40
    assert "dining_room" not in signatures  # no labels there


def test_below_min_labels_nothing_is_learned_and_the_prior_dominates_after() -> None:
    assert (
        fit(couch_labels(5), scanner_map=SCANNERS, scale=3.0, min_labels=8, prior_weight=4.0) == {}
    )
    few = fit(couch_labels(8), scanner_map=SCANNERS, scale=3.0, min_labels=8, prior_weight=40.0)
    # with a prior forty labels strong, eight readings at 3 m barely move it off the
    # formula's implied half-scale for a scanner in its own room
    assert math.exp(few["kitchen"]["s_kitchen"].mu) < 2.5


def test_a_parked_device_s_labels_do_not_count() -> None:
    labels = [
        label("kitchen", {"s_kitchen": 0.5, "s_dining_room": 9.0}, carried=0.2, t=float(i))
        for i in range(20)
    ]
    assert fit(labels, scanner_map=SCANNERS, scale=3.0, min_labels=8, prior_weight=4.0) == {}


def test_a_scanner_the_map_does_not_know_is_ignored() -> None:
    labels = [label("kitchen", {"s_kitchen": 3.0, "s_mystery": 1.0}, t=float(i)) for i in range(10)]
    signatures = fit(labels, scanner_map=SCANNERS, scale=3.0, min_labels=8, prior_weight=4.0)
    assert set(signatures["kitchen"]) == {"s_kitchen"}


def test_documents_round_trip_and_refuse_nonsense() -> None:
    signatures = fit(
        couch_labels(20), scanner_map=SCANNERS, scale=3.0, min_labels=8, prior_weight=4.0
    )
    doc = to_document(
        signatures, producer={"name": "builtin", "version": "1.0"}, built_at=5.0, labels_used=20
    )
    assert doc["version"] == 1 and doc["labels_used"] == 20
    assert from_document(doc) == signatures
    assert (
        from_document({"version": 1, "signatures": {"kitchen": {"s_kitchen": {"mu": "no"}}}}) == {}
    )
    assert from_document({"version": 2, "signatures": {}}) == {}
    assert from_document("garbage") == {}


def test_the_estimator_reads_a_signature_where_it_has_one() -> None:
    topo = build_topology(validate_config(rooms_config()))
    est = Estimator(topo, SCANNERS, stay=0.9, escape=0.001, scale=3.0, floor=0.05, stuck_after=60.0)
    # the couch reads 3 m from its own scanner: to the fixed formula that is a weak
    # kitchen; to a signature that has seen it forty times it is exactly the kitchen
    obs = Observation(t=0.0, distances={"s_kitchen": 3.0, "s_dining_room": 12.0}, home=True)
    plain = est.log_emission(obs)
    est.signatures = fit(
        couch_labels(40), scanner_map=SCANNERS, scale=3.0, min_labels=8, prior_weight=4.0
    )
    learned = est.log_emission(obs)
    kitchen, dining = topo.index("kitchen"), topo.index("dining_room")
    assert learned[kitchen] - learned[dining] > plain[kitchen] - plain[dining]
    # rooms without a signature keep the fixed formula
    assert learned[topo.index("hall")] == pytest.approx(plain[topo.index("hall")])
    # silence from a scanner that always hears you in this room counts against it
    est.signatures = {
        "kitchen": {"s_kitchen": Signature(mu=math.log(3.0), sigma=0.2, heard=0.98, n=40)}
    }
    silent = est.log_emission(
        Observation(t=0.0, distances={"s_kitchen": None, "s_dining_room": 12.0}, home=True)
    )
    assert silent[kitchen] < plain[kitchen]
