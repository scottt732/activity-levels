import pytest

from custom_components.activity_levels.engine import (
    Channel,
    Envelope,
    Group,
    Mix,
    NullHandling,
    Voice,
)


def voice(id: str, gain: float = 1.0) -> Voice:
    return Voice(id=id, gain=gain, envelope=Envelope(release=100.0, impulse=True))


def test_sum_adds_contributions_and_limiter_clamps() -> None:
    a, b, c = voice("a", 2.0), voice("b", 2.0), voice("c", 2.0)
    g = Group(id="room", channels=[Channel(a), Channel(b), Channel(c)], max_value=5.0)
    assert g.value_at(0.0) == 0.0
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(4.0)
    c.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(5.0)  # 6.0 limited to 5.0
    assert g.contributions_at(0.0) == {"a": 2.0, "b": 2.0, "c": 2.0}


def test_channel_gain_scales_contribution() -> None:
    a = voice("a", 2.0)
    g = Group(id="room", channels=[Channel(a, gain=0.5)])
    a.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(1.0)
    assert g.contributions_at(0.0) == {"a": 1.0}


def test_max_takes_loudest_channel() -> None:
    a, b = voice("a", 1.0), voice("b", 3.0)
    g = Group(id="room", channels=[Channel(a), Channel(b)], mix=Mix.MAX)
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(3.0)
    assert g.value_at(50.0) == pytest.approx(1.5)


def test_mean_zero_counts_idle_channels() -> None:
    a, b = voice("a", 2.0), voice("b", 2.0)
    g = Group(id="room", channels=[Channel(a), Channel(b)], mix=Mix.MEAN)
    a.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(1.0)


def test_mean_ignore_averages_only_active_channels() -> None:
    a, b = voice("a", 2.0), voice("b", 2.0)
    g = Group(
        id="room",
        channels=[Channel(a), Channel(b)],
        mix=Mix.MEAN,
        null_handling=NullHandling.IGNORE,
    )
    assert g.value_at(0.0) == 0.0
    a.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(2.0)


def test_empty_group_is_zero() -> None:
    for mix in Mix:
        assert Group(id="empty", mix=mix).value_at(0.0) == 0.0


def test_nested_groups_roll_up_recursively_with_gains() -> None:
    lr_motion, kitchen_motion = voice("lr", 2.0), voice("k", 2.0)
    living = Group(id="living", channels=[Channel(lr_motion)])
    kitchen = Group(id="kitchen", channels=[Channel(kitchen_motion)])
    floor = Group(id="floor1", channels=[Channel(living), Channel(kitchen, gain=0.5)])
    house = Group(id="house", channels=[Channel(floor)], mix=Mix.MAX)
    lr_motion.note_on(0.0)
    kitchen_motion.note_on(0.0)
    assert living.value_at(0.0) == pytest.approx(2.0)
    assert kitchen.value_at(0.0) == pytest.approx(2.0)
    assert floor.value_at(0.0) == pytest.approx(3.0)
    assert floor.contributions_at(0.0) == {"living": 2.0, "kitchen": 1.0}
    assert house.value_at(0.0) == pytest.approx(3.0)
    assert [g.id for g in house.groups()] == ["house", "floor1", "living", "kitchen"]
    assert [v.id for v in house.voices()] == ["lr", "k"]


def test_child_group_limiter_applies_before_parent_mix() -> None:
    a, b = voice("a", 4.0), voice("b", 4.0)
    child = Group(id="child", channels=[Channel(a), Channel(b)], max_value=5.0)
    parent = Group(id="parent", channels=[Channel(child)], max_value=10.0)
    a.note_on(0.0)
    b.note_on(0.0)
    assert parent.value_at(0.0) == pytest.approx(5.0)


def test_display_value_rounds_to_precision() -> None:
    a = voice("a", 1.0)
    g = Group(id="g", channels=[Channel(a)], precision=1)
    a.note_on(0.0)
    assert g.display_value_at(33.0) == pytest.approx(0.7)
    g2 = Group(id="g2", channels=[Channel(a)], precision=0)
    assert g2.display_value_at(33.0) == pytest.approx(1.0)


def test_channel_gain_must_be_positive() -> None:
    with pytest.raises(ValueError):
        Channel(voice("a"), gain=0.0)
