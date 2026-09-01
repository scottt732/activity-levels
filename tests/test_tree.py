from math import inf

import pytest

from custom_components.activity_levels.const import PRESENCE_KEY, TRIGGER_KEY
from custom_components.activity_levels.engine import Mix, Phase, RetriggerWhen
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.tree import build_tree, resolve_envelope
from tests.fixtures import house_config, kinds_config, presence_config, rooms_config


def test_build_tree_shapes() -> None:
    tree = build_tree(validate_config(house_config()))
    assert [g.id for g in tree.roots] == ["house"]
    assert [g.id for g in tree.group_order()] == ["house", "living_room", "kitchen"]
    assert tree.groups["living_room"].parent_id == "house"
    assert tree.groups["living_room"].root_id == "house"
    assert tree.groups["house"].group.mix is Mix.MAX
    assert sorted(tree.entity_ids) == [
        "binary_sensor.front_door",
        "binary_sensor.kitchen_motion",
        "binary_sensor.living_motion",
        "media_player.tv",
    ]
    tv = tree.voices_by_entity["media_player.tv"][0]
    assert tv.to == frozenset({"playing"}) and tv.group_id == "living_room"
    assert tv.voice.envelope.attack == 10.0 and tv.voice.envelope.sustain == 0.6


def test_envelope_resolution_order() -> None:
    cfg = validate_config(house_config())
    presets = {e["id"]: e for e in cfg["envelopes"]}
    stim = cfg["groups"][0]["children"][1]["stimuli"][0]  # kitchen: release override 5m
    env = resolve_envelope(cfg["defaults"], presets, stim)
    assert env.release == 300.0 and env.attack == 0.0
    assert env.retrigger is RetriggerWhen.ALWAYS and env.stack is True
    stim2 = dict(stim, retrigger="release", stack=False, envelope="momentary")
    env2 = resolve_envelope(cfg["defaults"], presets, stim2)
    assert env2.impulse is True and env2.release == 300.0
    assert env2.retrigger is RetriggerWhen.RELEASE and env2.stack is False


def test_gains_and_trigger_voice() -> None:
    tree = build_tree(validate_config(house_config()))
    house = tree.groups["house"].group
    kitchen_channel = next(ch for ch in house.channels if ch.label == "kitchen")
    assert kitchen_channel.gain == 0.5
    trig = tree.groups["kitchen"].trigger
    assert trig.envelope.impulse is True
    trig.gain = 2.0
    trig.note_on(0.0)
    assert tree.groups["kitchen"].group.value_at(0.0) == pytest.approx(2.0)
    assert trig.phase is Phase.RELEASE


def test_voice_keys_unique() -> None:
    tree = build_tree(validate_config(house_config()))
    keys = [tree.voice_key(r.group_id, r.label) for r in tree.all_voice_refs()]
    assert len(keys) == len(set(keys))


def test_voices_inherit_the_owning_group_max_value_as_their_ceiling() -> None:
    cfg = house_config()
    cfg["defaults"]["max_value"] = 4.0
    cfg["groups"][0]["children"][1]["max_value"] = 7.0  # kitchen overrides
    tree = build_tree(validate_config(cfg))
    living = tree.voices_by_entity["binary_sensor.living_motion"][0].voice
    kitchen = tree.voices_by_entity["binary_sensor.kitchen_motion"][0].voice
    assert living.ceiling == 4.0  # inherited from defaults
    assert kitchen.ceiling == 7.0  # node override
    # The trigger voice is not one more stimulus: an override has to be able to size it
    # to whatever the mix needs, which for MEAN is a multiple of the limiter. Only its
    # release stays referenced to max_value.
    assert tree.groups["living_room"].trigger.ceiling == inf
    assert tree.groups["living_room"].trigger.scale == 4.0
    assert tree.groups["kitchen"].trigger.scale == 7.0


def test_voice_ceilings_default_to_the_default_max_value() -> None:
    tree = build_tree(validate_config(house_config()))
    default_max = tree.defaults["max_value"]
    assert default_max == 5.0
    for ref in tree.all_voice_refs():
        assert ref.voice.ceiling == default_max
    for info in tree.group_order():
        assert info.trigger.ceiling == inf
        assert info.trigger.scale == default_max


def test_the_trigger_voice_still_releases_from_the_limiter_in_one_release() -> None:
    cfg = house_config()
    cfg["envelopes"][0]["release"] = "2h"
    tree = build_tree(validate_config(cfg))
    trig = tree.groups["kitchen"].trigger
    trig.gain = 5.0  # the limiter, the highest an override can leave the group at
    trig.note_on(0.0)
    assert trig.value_at(3600.0) == pytest.approx(2.5)
    assert trig.value_at(7200.0) == 0.0
    assert trig.is_active(7200.0) is False


def test_room_groups_get_a_visible_presence_channel() -> None:
    tree = build_tree(validate_config(presence_config()))
    kitchen = tree.groups["kitchen"]
    labels = [channel.label for channel in kitchen.group.channels]
    assert labels == ["binary_sensor.kitchen_motion", PRESENCE_KEY, TRIGGER_KEY]
    assert kitchen.presence is not None
    assert kitchen.presence.gain == 2.0  # the group's own override
    assert kitchen.presence.ceiling == kitchen.max_value  # capped like a stimulus
    assert kitchen.presence.envelope.release == 3600.0  # presence.envelope: hour
    # a branch is not a room: nothing to be present in
    assert tree.groups["downstairs"].presence is None
    assert PRESENCE_KEY not in [c.label for c in tree.groups["downstairs"].group.channels]


def test_group_presence_overrides_beat_the_preset() -> None:
    config = presence_config()
    config["groups"][0]["children"][0]["children"][1]["presence"] = {"release": "5m"}
    tree = build_tree(validate_config(config))
    assert tree.groups["dining_room"].presence.envelope.release == 300.0
    assert tree.groups["kitchen"].presence.envelope.release == 3600.0


def test_no_presence_channel_when_presence_is_off() -> None:
    tree = build_tree(validate_config(rooms_config()))  # presence absent -> disabled
    for info in tree.groups.values():
        assert info.presence is None
        assert PRESENCE_KEY not in [c.label for c in info.group.channels]


def test_the_presence_voice_is_in_the_mix_and_in_live_voices() -> None:
    tree = build_tree(validate_config(presence_config()))
    kitchen = tree.groups["kitchen"]
    kitchen.presence.note_on(0.0)
    assert kitchen.group.value_at(0.0) == pytest.approx(2.0)
    assert kitchen.presence in list(kitchen.group.live_voices())


def test_group_info_carries_the_kind_and_the_registry_bindings() -> None:
    tree = build_tree(validate_config(kinds_config()))
    assert tree.groups["property"].kind == "property"
    assert tree.groups["downstairs"].kind == "floor"
    assert tree.groups["downstairs"].floor_id == "downstairs"
    assert tree.groups["downstairs"].area_id is None
    assert tree.groups["kitchen"].kind == "area"
    assert tree.groups["kitchen"].area_id == "kitchen"
    assert tree.groups["back_patio"].kind == "outside"


def test_a_group_with_no_name_falls_back_to_its_id() -> None:
    config = kinds_config()
    del config["groups"][0]["children"][0]["children"][0]["children"][1]["name"]  # the hall
    tree = build_tree(validate_config(config))
    assert tree.groups["hall"].name == "Hall"
    assert tree.groups["hall"].name_set is False
    assert tree.groups["kitchen"].name_set is True


def test_a_momentary_stimulus_is_built_as_an_impulse_whatever_the_preset_says() -> None:
    """A momentary source only ever plays note_on, and note_on on a sustaining envelope
    opens a gate nothing will ever close. Forcing impulse at build time is what makes that
    configuration unreachable rather than merely discouraged -- and it is also what lets
    the startup reconcile skip these voices, since it already refuses to note_on an
    impulse and only ever notes off a voice that is gated."""
    tree = build_tree(
        validate_config(
            {
                "version": 1,
                "envelopes": [{"id": "default", "release": "30m", "impulse": False}],
                "groups": [
                    {
                        "id": "house",
                        "kind": "property",
                        "children": [
                            {
                                "id": "yard",
                                "kind": "outside",
                                "stimuli": [
                                    {
                                        "entity": "binary_sensor.door",
                                        "mode": "momentary",
                                        "edges": ["enter"],
                                    },
                                    {"entity": "binary_sensor.lamp", "key": "lamp"},
                                ],
                            }
                        ],
                    }
                ],
            }
        )
    )
    door = tree.voices_by_entity["binary_sensor.door"][0]
    lamp = tree.voices_by_entity["binary_sensor.lamp"][0]
    assert door.voice.envelope.impulse is True
    assert door.voice.envelope.release == 1800.0  # everything else still comes from the preset
    assert door.mode == "momentary"
    assert door.edges == frozenset({"enter"})
    assert lamp.voice.envelope.impulse is False
    assert lamp.mode == "sustained"
    assert lamp.edges == frozenset({"enter", "leave"})
