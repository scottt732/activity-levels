"""Forecasts never retire phases on the coordinator's live tree."""

from copy import deepcopy

import pytest

from custom_components.activity_levels.engine import Channel, Envelope, Group, Voice
from custom_components.activity_levels.engine.forecast import idle_by


def test_release_deadline_without_mutating_live_tree():
    voice = Voice(gain=1, id="motion", envelope=Envelope(impulse=True, release=120))
    voice.note_on(100)
    group = Group(id="room", channels=[Channel(voice)])
    before = deepcopy(group)
    assert idle_by(group, 110) == pytest.approx(220)
    assert group == before
    assert voice.value_at(111) > 0


def test_held_input_has_no_finite_forecast_even_during_zero_attack():
    voice = Voice(gain=1, id="occupancy", envelope=Envelope(attack=10, decay=20, sustain=0.5))
    voice.note_on(100)
    assert idle_by(Group(id="room", channels=[Channel(voice)]), 100) is None


def test_muted_held_input_does_not_prevent_idle():
    held = Voice(gain=1, id="occupancy", envelope=Envelope())
    held.note_on(100)
    child = Group(id="child", channels=[Channel(held)])
    assert idle_by(Group(id="room", channels=[Channel(child, muted=True)]), 110) == 110


def test_nested_releases_use_last_deadline():
    first = Voice(gain=1, id="first", envelope=Envelope(impulse=True, release=20))
    second = Voice(gain=1, id="second", envelope=Envelope(impulse=True, release=60))
    first.note_on(100)
    second.note_on(110)
    group = Group(
        id="room", channels=[Channel(first), Channel(Group(id="child", channels=[Channel(second)]))]
    )
    assert idle_by(group, 115) == pytest.approx(170)
    assert idle_by(group, 180) == 180
