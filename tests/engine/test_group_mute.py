import pytest

from custom_components.activity_levels.engine import (
    Channel,
    Envelope,
    Group,
    Mix,
    NullHandling,
    Voice,
)


def impulse(id: str, gain: float = 1.0, release: float = 100.0) -> Voice:
    return Voice(id=id, gain=gain, envelope=Envelope(release=release, impulse=True))


def test_muted_channel_contributes_nothing_to_sum() -> None:
    a, b = impulse("a", 2.0), impulse("b", 3.0)
    silenced = Channel(b, muted=True)
    g = Group(id="room", channels=[Channel(a), silenced], max_value=10.0)
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(2.0)
    silenced.muted = False
    assert g.value_at(0.0) == pytest.approx(5.0)


def test_muted_channel_never_wins_the_max() -> None:
    a, b = impulse("a", 1.0), impulse("b", 4.0)
    g = Group(id="room", channels=[Channel(a), Channel(b, muted=True)], mix=Mix.MAX)
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(1.0)


def test_mute_drops_the_channel_from_the_mean_denominator() -> None:
    a, b = impulse("a", 2.0), impulse("b", 2.0)
    g = Group(id="room", channels=[Channel(a), Channel(b, muted=True)], mix=Mix.MEAN)
    a.note_on(0.0)
    b.note_on(0.0)
    # not 1.0: a muted channel leaves the average altogether, as an ignored null does
    assert g.value_at(0.0) == pytest.approx(2.0)


def test_mute_leaves_the_mean_denominator_under_ignore_too() -> None:
    a, b = impulse("a", 2.0), impulse("b", 4.0)
    g = Group(
        id="room",
        channels=[Channel(a), Channel(b, muted=True)],
        mix=Mix.MEAN,
        null_handling=NullHandling.IGNORE,
        max_value=10.0,
    )
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(2.0)


def test_every_channel_muted_reads_zero() -> None:
    a = impulse("a", 2.0)
    a.note_on(0.0)
    for mix in Mix:
        g = Group(id="room", channels=[Channel(a, muted=True)], mix=mix)
        assert g.value_at(0.0) == 0.0


def test_muted_channel_adds_no_slope() -> None:
    a, b = impulse("a", 2.0), impulse("b", 4.0)
    silenced = Channel(b, muted=True)
    g = Group(id="g", channels=[Channel(a), silenced], max_value=10.0)
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.slope_at(0.0) == pytest.approx(-0.02)
    silenced.muted = False
    assert g.slope_at(0.0) == pytest.approx(-0.06)
    silenced.muted = True
    g.mix = Mix.MEAN
    assert g.slope_at(0.0) == pytest.approx(-0.02)  # divided by one channel, not two
    silenced.muted = False
    assert g.slope_at(0.0) == pytest.approx(-0.03)


def test_contributions_report_a_muted_channel_as_zero() -> None:
    a, b = impulse("a", 2.0), impulse("b", 3.0)
    g = Group(id="room", channels=[Channel(a), Channel(b, muted=True)], max_value=10.0)
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.contributions_at(0.0) == {"a": 2.0, "b": 0.0}


def test_value_at_excluding_also_ignores_muted_channels() -> None:
    a, b, trig = impulse("a", 2.0), impulse("b", 3.0), impulse("trigger", 1.0)
    g = Group(
        id="room",
        channels=[Channel(a), Channel(b, muted=True), Channel(trig, key="trigger")],
        max_value=10.0,
    )
    for v in (a, b, trig):
        v.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(3.0)
    assert g.value_at_excluding(0.0, "trigger") == pytest.approx(2.0)


def test_a_muted_child_neither_moves_nor_wakes_its_parent() -> None:
    a, b = impulse("a", 1.0, release=100.0), impulse("b", 1.0, release=10.0)
    child = Group(id="child", channels=[Channel(b)])
    fed = Channel(child)
    parent = Group(id="parent", channels=[Channel(a), fed], max_value=10.0, precision=1)
    a.note_on(0.0)
    b.note_on(0.0)
    assert parent.next_boundary(0.0) == pytest.approx(10.0)  # the child's release end
    nxt = parent.next_display_change(0.0)
    assert nxt is not None and nxt < 1.0  # 2.0 falling at -0.11 steps almost at once
    fed.muted = True
    assert parent.value_at(0.0) == pytest.approx(1.0)
    assert parent.next_boundary(0.0) == pytest.approx(100.0)
    assert parent.next_display_change(0.0) == pytest.approx(5.0, abs=2e-3)
    # the child itself keeps running: its own sensor has to go on working
    assert child.value_at(5.0) == pytest.approx(0.5)
    assert child.next_boundary(0.0) == pytest.approx(10.0)


def test_a_muted_child_is_left_out_of_its_parents_aggregates() -> None:
    living_v, kitchen_v = impulse("living", release=10.0), impulse("kitchen", release=300.0)
    living = Group(id="living", channels=[Channel(living_v)])
    kitchen = Group(id="kitchen", channels=[Channel(kitchen_v)])
    house = Group(
        id="house", channels=[Channel(living), Channel(kitchen, muted=True)], max_value=10.0
    )
    living_v.note_on(0.0)
    kitchen_v.note_on(5.0)
    # the house is cooling down from the living room alone, and is done in ten seconds
    assert house.cooldown_at(0.0) == pytest.approx(10.0)
    assert house.active_voices(0.0) == 1
    assert house.last_activity() == 0.0
    # the kitchen goes on running its own envelope, for its own sensor
    assert kitchen.cooldown_at(5.0) == pytest.approx(305.0)
    assert kitchen.active_voices(5.0) == 1
    assert kitchen.last_activity() == 5.0


def test_a_muted_child_does_not_hold_its_parent_gated() -> None:
    a = impulse("a", release=10.0)
    held = Voice(id="k", gain=1.0, envelope=Envelope(release=100.0))
    kitchen = Group(id="kitchen", channels=[Channel(held)])
    house = Group(id="house", channels=[Channel(a), Channel(kitchen, muted=True)], max_value=10.0)
    a.note_on(0.0)
    held.note_on(0.0)
    assert kitchen.gated_at(0.0) is True
    assert house.gated_at(0.0) is False
    # and a gate nobody in the mix is holding no longer suppresses the cooldown
    assert house.cooldown_at(0.0) == pytest.approx(10.0)


def test_reset_still_reaches_a_muted_channel() -> None:
    a = impulse("a", 2.0)
    child = Group(id="child", channels=[Channel(a)])
    parent = Group(id="parent", channels=[Channel(child, muted=True)])
    a.note_on(0.0)
    assert child.value_at(0.0) == pytest.approx(2.0)
    parent.reset()
    assert child.value_at(0.0) == 0.0
