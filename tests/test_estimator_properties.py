"""Invariants the filter must hold for any graph, any settings, any readings."""

from __future__ import annotations

from itertools import pairwise

import numpy as np
from hypothesis import given, settings
from hypothesis import strategies as st

from custom_components.activity_levels.presence.estimator import Estimator
from custom_components.activity_levels.presence.observation import Observation, RoomActivity
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import build_topology
from tests.fixtures import rooms_config

TOPO = build_topology(validate_config(rooms_config()))
SCANNERS = {f"s_{room}": room for room in TOPO.nodes}

readings = st.one_of(st.none(), st.floats(min_value=0.0, max_value=30.0))
observations = st.lists(
    st.tuples(st.fixed_dictionaries(dict.fromkeys(SCANNERS, readings)), st.booleans()),
    min_size=1,
    max_size=40,
)


@st.composite
def dynamics(draw):
    """A ``(stay, escape)`` pair that can make a transition row at all.

    ``escape`` goes to every room a room does not touch, so past
    ``(1 - stay) / (rooms - 1)`` the row would sum past 1 and the topology refuses to
    build one. That refusal is tested in `test_topology.py`; these properties are about
    the filter above it.
    """
    stay = draw(st.floats(min_value=0.5, max_value=0.99))
    elsewhere = max(len(TOPO.nodes) - 1, 1)
    return stay, draw(st.floats(min_value=0.0, max_value=(1.0 - stay) / elsewhere))


@given(
    observations,
    dynamics(),
    st.floats(min_value=0.5, max_value=10.0),
    st.floats(min_value=0.001, max_value=0.5),
)
@settings(max_examples=50, deadline=None)
def test_belief_is_always_a_distribution(rows, pair, scale, floor) -> None:
    stay, escape = pair
    est = Estimator(
        TOPO, SCANNERS, stay=stay, escape=escape, scale=scale, floor=floor, stuck_after=60.0
    )
    for i, (distances, home) in enumerate(rows):
        out = est.update(Observation(t=float(i), distances=distances, home=home))
        assert np.all(np.isfinite(est.belief))
        assert np.all(est.belief >= 0.0)
        assert est.belief.sum() == np.float64(1.0) or abs(est.belief.sum() - 1.0) < 1e-9
        assert out.room in TOPO.states
        assert 0.0 <= out.confidence <= 1.0
        assert all(state in TOPO.states for state in out.path)
        assert len(out.path) <= 5


@given(dynamics())
@settings(max_examples=50, deadline=None)
def test_transition_rows_always_sum_to_one(pair) -> None:
    stay, escape = pair
    matrix = TOPO.transition_matrix(stay, escape)
    assert np.allclose(matrix.sum(axis=1), 1.0)
    assert np.all(matrix >= 0.0)


@given(
    st.fixed_dictionaries(dict.fromkeys(SCANNERS, readings)),
    st.floats(min_value=0.0, max_value=1.0),
    st.floats(min_value=-1.0, max_value=1.0),
)
@settings(max_examples=50, deadline=None)
def test_the_activity_term_never_rewards_a_room(distances, level, slope) -> None:
    """Capped at zero: an empty room is penalised, a busy one is merely not."""
    est = Estimator(TOPO, SCANNERS, stay=0.9, escape=0.001, scale=3.0, floor=0.05, stuck_after=60.0)
    plain = est.log_emission(Observation(t=0.0, distances=distances, home=True))
    busy = est.log_emission(
        Observation(
            t=0.0,
            distances=distances,
            home=True,
            activity={
                "kitchen": RoomActivity(level=level, slope=slope),
                "hall": RoomActivity(level=1.0, slope=0.0),
            },
        )
    )
    delta = busy - plain
    kitchen, hall = TOPO.index("kitchen"), TOPO.index("hall")
    assert delta[kitchen] <= 1e-12
    assert delta[kitchen] >= np.log(0.05) - 1e-12
    assert abs(delta[hall]) < 1e-12
    assert np.all(np.abs(np.delete(delta, [kitchen, hall])) < 1e-12)


@given(observations)
@settings(max_examples=25, deadline=None)
def test_the_viterbi_path_only_walks_the_graph(rows) -> None:
    """Consecutive, collapsed path steps are always a step the topology allows."""
    est = Estimator(TOPO, SCANNERS, stay=0.9, escape=0.0, scale=3.0, floor=0.05, stuck_after=1e9)
    for i, (distances, home) in enumerate(rows):
        est.update(Observation(t=float(i), distances=distances, home=home))
    path = est.outputs().path
    for a, b in pairwise(path):
        assert TOPO.connected(a, b)
