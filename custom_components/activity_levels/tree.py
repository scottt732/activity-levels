"""Build the engine tree from a normalized configuration."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from math import inf
from typing import Any

from .const import CONF_AREA_ID, CONF_FLOOR_ID, CONF_KIND, CONF_PRESENCE, PRESENCE_KEY, TRIGGER_KEY
from .engine import Channel, Envelope, Group, Mix, NullHandling, RetriggerWhen, Unavailable, Voice
from .topology import room_ids

_ENVELOPE_KEYS = (
    "attack",
    "decay",
    "sustain",
    "release",
    "impulse",
    "retrigger",
    "stack",
    "unavailable",
    "debounce",
)


@dataclass(frozen=True)
class GroupInfo:
    id: str
    name: str
    kind: str
    area_id: str | None
    floor_id: str | None
    name_set: bool
    parent_id: str | None
    root_id: str
    precision: int
    max_value: float
    mix: str
    group: Group
    trigger: Voice
    presence: Voice | None


@dataclass(frozen=True)
class VoiceRef:
    entity_id: str
    to: frozenset[str]
    voice: Voice
    group_id: str
    label: str


@dataclass
class Tree:
    roots: list[Group] = field(default_factory=list)
    groups: dict[str, GroupInfo] = field(default_factory=dict)
    voices_by_entity: dict[str, list[VoiceRef]] = field(default_factory=dict)
    entity_ids: list[str] = field(default_factory=list)
    defaults: dict[str, Any] = field(default_factory=dict)
    order: list[str] = field(default_factory=list)

    def group_order(self) -> list[GroupInfo]:
        return [self.groups[gid] for gid in self.order]

    def root_of(self, group_id: str) -> Group:
        return self.groups[self.groups[group_id].root_id].group

    @staticmethod
    def voice_key(group_id: str, label: str) -> str:
        return f"{group_id}|{label}"

    def all_voice_refs(self) -> list[VoiceRef]:
        return [ref for refs in self.voices_by_entity.values() for ref in refs]


def resolve_envelope(
    defaults: Mapping[str, Any],
    presets: Mapping[str, Mapping[str, Any]],
    stimulus: Mapping[str, Any],
) -> Envelope:
    preset = presets[stimulus.get("envelope") or defaults["envelope"]]
    resolved: dict[str, Any] = {}
    for key in _ENVELOPE_KEYS:
        value = stimulus.get(key)
        if value is None:
            value = preset.get(key)
        if value is None:
            value = defaults.get(key)
        if value is not None:
            resolved[key] = value
    if "retrigger" in resolved:
        resolved["retrigger"] = RetriggerWhen(resolved["retrigger"])
    if "unavailable" in resolved:
        resolved["unavailable"] = Unavailable(resolved["unavailable"])
    return Envelope(**resolved)


def _trigger_voice(
    defaults: Mapping[str, Any], presets: Mapping[str, Mapping[str, Any]], max_value: float
) -> Voice:
    """The synthetic voice a level override and the ``trigger`` service play.

    Unlike a stimulus it is not capped at the group's limiter: what an override has to
    size it to is whatever the *mix* needs, and a MEAN of N channels needs one of them at
    N times the limiter to read the limiter. The coordinator clamps it to what the mix
    can use; here only the release stays referenced to ``max_value``, so an override
    cools down over one release however the mix arrived at it.
    """
    base = resolve_envelope(defaults, presets, {})
    return Voice(
        id=TRIGGER_KEY,
        gain=1.0,
        envelope=Envelope(release=base.release, impulse=True),
        ceiling=inf,
        release_scale=max_value,
    )


def _presence_voice(
    defaults: Mapping[str, Any],
    presets: Mapping[str, Mapping[str, Any]],
    presence: Mapping[str, Any],
    overrides: Mapping[str, Any],
    max_value: float,
) -> Voice:
    """The visible synthetic channel that says somebody is in this room.

    Built like a stimulus rather than like the trigger: it is real activity, it is
    capped at the group's limiter, and its envelope resolves through the ordinary
    chain -- the group's own overrides, then ``presence.envelope``, then
    ``defaults.envelope``. A note-on lasts until the room empties, so the default
    (a held note with a long release) is exactly right.
    """
    stimulus = {
        **overrides,
        "envelope": overrides.get("envelope") or presence.get("envelope"),
    }
    return Voice(
        id=PRESENCE_KEY,
        gain=float(overrides.get("gain", 1.0)),
        envelope=resolve_envelope(defaults, presets, stimulus),
        ceiling=max_value,
    )


def build_tree(config: dict[str, Any]) -> Tree:
    defaults = config["defaults"]
    presets = {e["id"]: e for e in config["envelopes"]}
    presence_cfg = config.get(CONF_PRESENCE) or {}
    # Only rooms can be occupied; a branch (House, Downstairs) mixes rooms and is not a
    # place. With presence off there are no presence channels at all.
    rooms = room_ids(config) if presence_cfg.get("enabled") else frozenset()
    tree = Tree(defaults=dict(defaults))

    def build(node: dict[str, Any], parent_id: str | None, root_id: str | None) -> Group:
        gid = node["id"]
        rid = root_id or gid
        tree.order.append(gid)  # pre-order: record this group before its children
        # Every voice in this group is bounded by the group's limiter: stacking must
        # never pile up height the limiter would only throw away.
        max_value = node["max_value"] if node["max_value"] is not None else defaults["max_value"]
        channels: list[Channel] = []
        for stim in node["stimuli"]:
            voice = Voice(
                id=stim["entity"],
                gain=stim["gain"],
                envelope=resolve_envelope(defaults, presets, stim),
                ceiling=max_value,
            )
            channel = Channel(voice, key=stim["key"])
            channels.append(channel)
            ref = VoiceRef(stim["entity"], frozenset(stim["to"]), voice, gid, channel.label)
            tree.voices_by_entity.setdefault(stim["entity"], []).append(ref)
        for child in node["children"]:
            channels.append(Channel(build(child, gid, rid), gain=child["gain"]))
        presence: Voice | None = None
        if gid in rooms:
            presence = _presence_voice(
                defaults, presets, presence_cfg, node[CONF_PRESENCE], max_value
            )
            channels.append(Channel(presence, key=PRESENCE_KEY))
        trigger = _trigger_voice(defaults, presets, max_value)
        channels.append(Channel(trigger, key=TRIGGER_KEY))
        group = Group(
            id=gid,
            channels=channels,
            mix=Mix(node["mix"]),
            null_handling=NullHandling(node["null_handling"]),
            max_value=max_value,
            precision=node["precision"] if node["precision"] is not None else defaults["precision"],
        )
        # The schema no longer titles an unnamed group: a null name is what lets the editor
        # pre-fill it from a Home Assistant area and the device fall back to that area's
        # name. Everything downstream still wants a string, so the fallback lives here.
        name_set = node["name"] is not None
        tree.groups[gid] = GroupInfo(
            id=gid,
            name=node["name"] if name_set else gid.replace("_", " ").title(),
            kind=node[CONF_KIND],
            area_id=node[CONF_AREA_ID],
            floor_id=node[CONF_FLOOR_ID],
            name_set=name_set,
            parent_id=parent_id,
            root_id=rid,
            precision=group.precision,
            max_value=group.max_value,
            mix=node["mix"],
            group=group,
            trigger=trigger,
            presence=presence,
        )
        return group

    for node in config["groups"]:
        tree.roots.append(build(node, None, None))
    tree.entity_ids = sorted(tree.voices_by_entity)
    return tree
