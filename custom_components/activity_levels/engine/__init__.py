"""Pure activity-level engine. No Home Assistant imports allowed in this package.

Time is always passed in explicitly, in epoch seconds. Two contracts come with that:

**Queries mutate, so ``t`` must never go backwards on a given tree.** ``value_at``,
``slope_at``, ``next_boundary``, ``is_active`` and every group method built on them
call ``Voice._advance``, which retires timed phases that have finished by ``t``. That
is what keeps the state machine O(1) instead of replaying history on each read. The
cost is that a voice cannot go back: querying a ``t`` earlier than one already seen
returns the *current* segment's geometry, which for a retired phase means the value
at that segment's start, not the value the voice really had at that instant. Feed a
whole tree from one clock reading per update and the contract holds by construction.

**The engine imposes no minimum wake interval.** ``Group.next_display_change`` returns
the earliest instant the rounded value can differ, and near a rounding edge that can be
a millisecond away -- or, when several voices are moving fast, repeatedly so. It is the
caller's job to floor the resulting timer delay to whatever its scheduler and recorder
can afford; the engine deliberately does not pick that floor for you, because it is a
policy question about sensor write rates rather than a property of the envelopes.
"""

from .envelope import Envelope, Mix, NullHandling, Phase, RetriggerWhen, Unavailable
from .group import Channel, Group
from .voice import Voice

__all__ = [
    "Channel",
    "Envelope",
    "Group",
    "Mix",
    "NullHandling",
    "Phase",
    "RetriggerWhen",
    "Unavailable",
    "Voice",
]
