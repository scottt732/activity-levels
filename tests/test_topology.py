import numpy as np
import pytest

from custom_components.activity_levels.const import AWAY
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import (
    TopologyError,
    build_topology,
    room_ids,
)
from tests.fixtures import house_config, kinds_config, rooms_config


@pytest.fixture
def topo():
    return build_topology(validate_config(rooms_config()))


def test_only_areas_and_outside_areas_are_nodes_in_pre_order(topo) -> None:
    # house infers `property` and downstairs `structure`: neither is a place, whatever
    # they declare. The five rooms all bind an area, so all five are nodes -- including
    # the bedroom, which declares no edge of its own.
    assert topo.nodes == ("kitchen", "dining_room", "hall", "bedroom", "back_patio")
    assert topo.exits == frozenset({"back_patio"})
    assert topo.states == ("kitchen", "dining_room", "hall", "bedroom", "back_patio", AWAY)


def test_a_structure_is_never_a_node_even_when_it_declares_an_edge() -> None:
    """M2 keeps a migrated document loading; the graph still refuses the branch."""
    config = validate_config(rooms_config())
    downstairs = config["groups"][0]["children"][0]
    assert downstairs["kind"] == "structure"
    downstairs["adjacent"] = [{"id": "kitchen", "connection": "door", "one_way": False}]
    topo = build_topology(config)
    assert "downstairs" not in topo.nodes
    assert "downstairs" not in topo.neighbours("kitchen")


def test_an_area_with_no_edges_is_still_a_node() -> None:
    topo = build_topology(validate_config(kinds_config()))
    assert topo.nodes == ("kitchen", "hall", "back_patio")
    assert topo.neighbours("hall") == ("kitchen",)  # symmetric, declared on the kitchen
    assert topo.exits == frozenset({"back_patio"})


def test_edges_are_symmetric_unless_declared_one_way(topo) -> None:
    assert topo.is_adjacent("kitchen", "dining_room")
    assert topo.is_adjacent("dining_room", "kitchen")  # declared once, works both ways
    assert topo.is_adjacent("hall", "bedroom")
    assert not topo.is_adjacent("bedroom", "hall")  # the one-way chute
    assert topo.neighbours("kitchen") == ("back_patio", "dining_room")
    assert [(e.a, e.b, e.one_way) for e in topo.edges] == [
        ("kitchen", "dining_room", False),
        ("kitchen", "back_patio", False),
        ("dining_room", "hall", False),
        ("hall", "bedroom", True),
    ]


def test_a_room_only_reached_one_way_is_still_a_node() -> None:
    config = rooms_config()
    # bedroom declares nothing; it exists only because hall points at it
    assert "bedroom" in build_topology(validate_config(config)).nodes


def test_stale_ids_are_dropped_rather_than_crashing() -> None:
    """The schema rejects these; a document that got in another way loses the edge."""
    config = validate_config(rooms_config())
    rooms = config["groups"][0]["children"][0]["children"]
    rooms[0]["adjacent"].append({"id": "atlantis", "one_way": False})
    topo = build_topology(config)
    assert "atlantis" not in topo.nodes
    assert topo.neighbours("kitchen") == ("back_patio", "dining_room")


def test_paths_are_simple_and_bounded(topo) -> None:
    assert topo.paths("kitchen", "hall") == [["kitchen", "dining_room", "hall"]]
    assert topo.paths("kitchen", "bedroom") == [["kitchen", "dining_room", "hall", "bedroom"]]
    assert topo.paths("bedroom", "kitchen") == []  # one-way: no way back
    assert topo.paths("kitchen", "kitchen") == [["kitchen"]]
    assert topo.paths("kitchen", "bedroom", max_hops=2) == []
    assert topo.paths("kitchen", "atlantis") == []


def test_reachable_grows_with_hops(topo) -> None:
    assert topo.reachable("kitchen", 0) == frozenset({"kitchen"})
    assert topo.reachable("kitchen", 1) == frozenset({"kitchen", "dining_room", "back_patio"})
    assert "hall" in topo.reachable("kitchen", 2)
    assert "bedroom" in topo.reachable("kitchen", 3)


def test_transition_rows_sum_to_one_and_respect_the_graph(topo) -> None:
    t = topo.transition_matrix(stay=0.9, escape=0.001)
    assert t.shape == (6, 6)
    assert np.allclose(t.sum(axis=1), 1.0)
    k, d, h, b, p, away = (topo.index(s) for s in topo.states)
    assert t[k, k] == pytest.approx(0.9)
    # kitchen's non-stay mass is shared by its two neighbours, less the escape it pays
    # to the two rooms it does not touch
    assert t[k, d] == pytest.approx(t[k, p])
    assert t[k, h] == pytest.approx(0.001)
    assert t[k, away] == 0.0  # kitchen is not a way out of the house
    assert t[p, away] > 0.0 and t[away, p] > 0.0
    assert t[away, k] == 0.0
    assert t[h, b] > t[b, h]  # the chute only runs one way (escape back)


def test_transition_matrix_refuses_an_impossible_row(topo) -> None:
    assert topo.feasible(0.9, 0.001) is None
    assert "escape" in (topo.feasible(0.99, 0.1) or "")
    with pytest.raises(TopologyError):
        topo.transition_matrix(stay=0.99, escape=0.1)


def test_a_house_with_no_exits_keeps_away_absorbing() -> None:
    config = validate_config(rooms_config())
    config["groups"][0]["children"][0]["children"][4]["exit"] = False
    topo = build_topology(config)
    t = topo.transition_matrix(stay=0.9, escape=0.001)
    assert np.allclose(t.sum(axis=1), 1.0)
    assert t[topo.index(AWAY), topo.index(AWAY)] == pytest.approx(1.0)


def test_map_scanners_uses_areas_then_overrides(topo) -> None:
    scanners = {
        "aa:aa": "kitchen_area",
        "bb:bb": "hall_area",
        "cc:cc": "garage_area",  # no group claims it
        "dd:dd": None,  # a scanner with no area at all
    }
    mapped, unmapped = topo.map_scanners(scanners)
    assert mapped == {"aa:aa": "kitchen", "bb:bb": "hall"}
    assert unmapped == ["cc:cc", "dd:dd"]

    mapped, unmapped = topo.map_scanners(scanners, {"cc:cc": "bedroom", "aa:aa": "dining_room"})
    assert mapped["cc:cc"] == "bedroom" and mapped["aa:aa"] == "dining_room"
    assert unmapped == ["dd:dd"]


def test_a_scanner_mapped_to_a_branch_is_unmapped(topo) -> None:
    """`downstairs` is a group, but it is not a state the filter has."""
    mapped, unmapped = topo.map_scanners({"aa:aa": None}, {"aa:aa": "downstairs"})
    assert mapped == {} and unmapped == ["aa:aa"]


def test_a_config_with_no_adjacency_is_an_empty_graph() -> None:
    topo = build_topology(validate_config(house_config()))
    assert topo.nodes == () and topo.payload() == {"nodes": [], "edges": [], "exits": []}
    assert room_ids(validate_config(house_config())) == frozenset()


def test_payload_shape(topo) -> None:
    assert topo.payload() == {
        "nodes": ["kitchen", "dining_room", "hall", "bedroom", "back_patio"],
        "edges": [
            ["kitchen", "dining_room", False],
            ["kitchen", "back_patio", False],
            ["dining_room", "hall", False],
            ["hall", "bedroom", True],
        ],
        "exits": ["back_patio"],
    }
