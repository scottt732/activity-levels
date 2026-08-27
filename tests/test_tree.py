from math import inf

import pytest

from custom_components.activity_levels.engine import Mix, Phase, Retrigger
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.tree import build_tree, resolve_envelope
from tests.fixtures import house_config


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
    assert env.release == 300.0 and env.attack == 0.0 and env.retrigger is Retrigger.STACK
    stim2 = dict(stim, retrigger="always", envelope="momentary")
    env2 = resolve_envelope(cfg["defaults"], presets, stim2)
    assert env2.impulse is True and env2.retrigger is Retrigger.ALWAYS and env2.release == 300.0


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
