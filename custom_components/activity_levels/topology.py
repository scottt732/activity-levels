"""The room adjacency graph, and everything pure that reads it.

No ``homeassistant`` imports: this is built from the validated configuration and, with
:mod:`.presence.estimator`, is the only place numpy is used on the presence side.

A *room* is a group whose kind is ``area`` or ``outside`` -- somewhere a person can be.
Everything else in the tree (the property, a structure, a floor) stacks rooms and is not a
place, so giving the filter a state for it would only invent somewhere to hide. The kind is
in the document, so this no longer has to guess from the edges: a room with no doorway
declared yet is still a room, and a floor that somehow declares one is still not.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

import numpy as np
import numpy.typing as npt

from .const import AWAY, CONF_AREA_ID, CONF_GROUPS, CONF_KIND, NODE_KINDS

MAX_HOPS = 8
"""How long a path this answers over. A house has few; an unbounded search of a dense
graph does not, and nobody reads a nine-hop route anyway."""

_TOLERANCE = 1e-9


class TopologyError(ValueError):
    """A transition matrix this configuration cannot produce."""


@dataclass(frozen=True)
class Edge:
    """One connection, canonical. ``one_way`` means b does not reach back to a."""

    a: str
    b: str
    one_way: bool


@dataclass(frozen=True)
class Topology:
    """The graph, plus the pre-order the tree gave it. Immutable and cheap to hold."""

    nodes: tuple[str, ...]
    edges: tuple[Edge, ...]
    exits: frozenset[str]
    out: Mapping[str, frozenset[str]]
    order: tuple[tuple[str, str | None], ...]

    @property
    def states(self) -> tuple[str, ...]:
        """The filter's state space: every room, and being out."""
        return (*self.nodes, AWAY)

    def index(self, state: str) -> int:
        return self.states.index(state)

    def neighbours(self, node: str) -> tuple[str, ...]:
        return tuple(sorted(self.out.get(node, frozenset())))

    def is_adjacent(self, a: str, b: str) -> bool:
        """Whether you can get from a to b in one step. Directed."""
        return b in self.out.get(a, frozenset())

    def connected(self, a: str, b: str) -> bool:
        """Whether the two are neighbours at all, in either direction.

        ``away`` counts as a neighbour of every exit room: somebody halfway out of the
        back door is between the patio and gone, and that is a move like any other.
        """
        if AWAY in (a, b):
            other = b if a == AWAY else a
            return other in self.exits
        return self.is_adjacent(a, b) or self.is_adjacent(b, a)

    def reachable(self, a: str, hops: int) -> frozenset[str]:
        """Every room within ``hops`` steps of a, a itself included."""
        seen = {a}
        frontier = {a}
        for _ in range(max(hops, 0)):
            frontier = {nxt for node in frontier for nxt in self.out.get(node, frozenset())} - seen
            if not frontier:
                break
            seen |= frontier
        return frozenset(seen)

    def paths(self, a: str, b: str, max_hops: int = MAX_HOPS) -> list[list[str]]:
        """Every simple route from a to b of at most ``max_hops`` edges, shortest first."""
        if a not in self.out or b not in self.out:
            return []
        if a == b:
            return [[a]]
        found: list[list[str]] = []
        stack: list[tuple[str, list[str]]] = [(a, [a])]
        while stack:
            node, walked = stack.pop()
            if len(walked) > max_hops:
                continue
            for nxt in sorted(self.out[node]):
                if nxt == b:
                    found.append([*walked, nxt])
                elif nxt not in walked:
                    stack.append((nxt, [*walked, nxt]))
        found.sort(key=lambda path: (len(path), path))
        return found

    def feasible(self, stay: float, escape: float) -> str | None:
        """Why these numbers cannot make a transition row, or None when they can."""
        if not 0.0 < stay < 1.0:
            return f"presence.stay ({stay}) has to be between 0 and 1"
        rooms = len(self.nodes)
        budget = stay + escape * max(rooms - 1, 0)
        if budget > 1.0 + _TOLERANCE:
            return (
                f"presence.escape ({escape}) across the {max(rooms - 1, 0)} rooms a room "
                f"does not touch, plus presence.stay ({stay}), comes to {budget:.4f}; a "
                "transition row has to add up to 1. Lower escape or lower stay."
            )
        return None

    def transition_matrix(self, stay: float, escape: float) -> npt.NDArray[np.float64]:
        """P(next state | current state), over ``states``.

        The diagonal is ``stay``. Every room a room does not touch gets ``escape`` -- the
        teleport that lets the filter recover from a wrong room at all -- and whatever is
        left is shared equally among the neighbours, with ``away`` counting as one for a
        room you can leave by. A room with nowhere to go keeps the remainder itself, so
        the row still sums to 1.
        """
        if (problem := self.feasible(stay, escape)) is not None:
            raise TopologyError(problem)
        states = self.states
        size = len(states)
        index = {state: i for i, state in enumerate(states)}
        matrix = np.zeros((size, size), dtype=np.float64)
        for gid in self.nodes:
            row = index[gid]
            near = [index[other] for other in sorted(self.out.get(gid, frozenset()))]
            if gid in self.exits:
                near.append(index[AWAY])
            far = [
                index[other]
                for other in self.nodes
                if other != gid and other not in self.out.get(gid, frozenset())
            ]
            matrix[row, row] = stay
            for column in far:
                matrix[row, column] = escape
            share = 1.0 - stay - escape * len(far)
            if near and share > 0.0:
                for column in near:
                    matrix[row, column] += share / len(near)
            else:
                matrix[row, row] += share
        away = index[AWAY]
        doors = [index[gid] for gid in self.nodes if gid in self.exits]
        if doors:
            matrix[away, away] = stay
            for column in doors:
                matrix[away, column] += (1.0 - stay) / len(doors)
        else:
            matrix[away, away] = 1.0  # a house with no way out: away is where you stay
        assert np.allclose(matrix.sum(axis=1), 1.0, atol=1e-9)
        return matrix

    def map_scanners(
        self,
        scanners: Mapping[str, str | None],
        overrides: Mapping[str, str] | None = None,
    ) -> tuple[dict[str, str], list[str]]:
        """``(scanner key -> room, unmapped keys)``.

        A scanner's area names the first group in pre-order that claims it, which is what
        lets a room win over the branch above it when both are given the same area.
        ``presence.scanner_areas`` wins outright. A mapping that lands on a branch is no
        mapping at all -- the filter has no state for it -- so it is reported instead of
        silently dropped.
        """
        first_for_area: dict[str, str] = {}
        for gid, area in self.order:
            if area is not None and area not in first_for_area:
                first_for_area[area] = gid
        rooms = set(self.nodes)
        mapped: dict[str, str] = {}
        unmapped: list[str] = []
        for key, area in scanners.items():
            room_id = (overrides or {}).get(key)
            if room_id is None and area is not None:
                room_id = first_for_area.get(area)
            if room_id is not None and room_id in rooms:
                mapped[key] = room_id
            else:
                unmapped.append(key)
        return mapped, sorted(unmapped)

    def payload(self) -> dict[str, Any]:
        """What the panel is handed. Names come from the config it already holds."""
        return {
            "nodes": list(self.nodes),
            "edges": [[edge.a, edge.b, edge.one_way] for edge in self.edges],
            "exits": sorted(self.exits),
        }


def build_topology(config: Mapping[str, Any]) -> Topology:
    """Read the graph out of a validated configuration."""
    order: list[tuple[str, str | None]] = []
    declared: list[tuple[str, str, bool]] = []
    exits: set[str] = set()
    rooms: list[str] = []

    def walk(node: Mapping[str, Any]) -> None:
        gid = node["id"]
        order.append((gid, node.get(CONF_AREA_ID)))
        if node.get(CONF_KIND) in NODE_KINDS:
            rooms.append(gid)
            if node.get("exit"):
                exits.add(gid)
            for edge in node.get("adjacent") or []:
                declared.append((gid, edge["id"], bool(edge.get("one_way"))))
        for child in node.get("children") or []:
            walk(child)

    for group in config.get(CONF_GROUPS) or []:
        walk(group)

    nodes = tuple(rooms)
    known = set(nodes)
    out: dict[str, set[str]] = {}
    for a, b, one_way in declared:
        if a == b or b not in known:
            continue  # the schema rejects these; a stale or non-room id loses its edge
        out.setdefault(a, set()).add(b)
        if not one_way:
            out.setdefault(b, set()).add(a)

    linked = {gid: frozenset(out.get(gid, set()) & known) for gid in nodes}
    return Topology(
        nodes=nodes,
        edges=_edges(nodes, linked),
        exits=frozenset(exits),
        out=linked,
        order=tuple(order),
    )


def _edges(nodes: Sequence[str], out: Mapping[str, frozenset[str]]) -> tuple[Edge, ...]:
    """One entry per unordered pair, in node order. A one-way edge keeps its direction."""
    rank = {gid: i for i, gid in enumerate(nodes)}
    seen: set[tuple[str, str]] = set()
    edges: list[Edge] = []
    for a in nodes:
        for b in sorted(out.get(a, frozenset()), key=lambda gid: rank[gid]):
            pair = (a, b) if rank[a] < rank[b] else (b, a)
            if pair in seen:
                continue
            seen.add(pair)
            both_ways = a in out.get(b, frozenset())
            edges.append(
                Edge(a=pair[0], b=pair[1], one_way=False)
                if both_ways
                else Edge(a=a, b=b, one_way=True)
            )
    return tuple(edges)


def room_ids(config: Mapping[str, Any]) -> frozenset[str]:
    """Which groups are rooms. ``tree.py`` asks, so the rule lives in one place."""
    return frozenset(build_topology(config).nodes)
