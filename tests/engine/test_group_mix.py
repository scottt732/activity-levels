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


def test_duplicate_channel_labels_are_rejected() -> None:
    a = voice("a")
    with pytest.raises(ValueError, match="unique"):
        Group(id="room", channels=[Channel(a), Channel(a)])


def test_distinct_keys_let_the_same_entity_feed_two_channels() -> None:
    a = voice("a", 1.0)
    g = Group(
        id="room",
        channels=[Channel(a, key="a/left"), Channel(a, key="a/right")],
        max_value=10.0,
    )
    a.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(2.0)
    assert g.contributions_at(0.0) == {"a/left": 1.0, "a/right": 1.0}
    # slope must agree with value: both channels contribute, not just one
    assert g.slope_at(0.0) == pytest.approx(-0.02)


def test_group_and_channel_numbers_must_be_finite() -> None:
    with pytest.raises(ValueError):
        Group(id="g", max_value=float("nan"))
    with pytest.raises(ValueError):
        Group(id="g", max_value=float("inf"))
    with pytest.raises(ValueError):
        Channel(voice("a"), gain=float("nan"))


def test_value_at_excluding_drops_one_channel_from_the_mix() -> None:
    a, b = voice("a", 2.0), voice("trigger", 3.0)
    g = Group(id="room", channels=[Channel(a), Channel(b, key="trigger")], max_value=5.0)
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.value_at(0.0) == pytest.approx(5.0)
    assert g.value_at_excluding(0.0, "trigger") == pytest.approx(2.0)
    assert g.value_at_excluding(0.0, "a") == pytest.approx(3.0)
    assert g.value_at_excluding(0.0, "absent") == g.value_at(0.0)


def test_value_at_excluding_remixes_max_and_mean() -> None:
    a, b = voice("a", 1.0), voice("trigger", 4.0)
    channels = [Channel(a), Channel(b, key="trigger")]
    biggest = Group(id="max", channels=channels, mix=Mix.MAX)
    average = Group(id="mean", channels=channels, mix=Mix.MEAN)
    a.note_on(0.0)
    b.note_on(0.0)
    # not "raw - contribution": MAX falls back to the next channel, MEAN re-divides
    assert biggest.value_at_excluding(0.0, "trigger") == pytest.approx(1.0)
    assert average.value_at(0.0) == pytest.approx(2.5)
    assert average.value_at_excluding(0.0, "trigger") == pytest.approx(1.0)


def test_value_at_excluding_everything_is_zero() -> None:
    a = voice("trigger", 2.0)
    g = Group(id="room", channels=[Channel(a, key="trigger")])
    a.note_on(0.0)
    assert g.value_at_excluding(0.0, "trigger") == 0.0


def sized(g: Group, trigger: Voice, t: float, target: float) -> float:
    """Fire the trigger at the contribution the group asks for, then read the group.

    Deliberately checks the round trip rather than the arithmetic: the contract is that
    the mix ends up at the target, whatever ``_mix`` happens to do to get there.
    """
    peak = g.contribution_for(t, "trigger", target)
    trigger.reset()
    if peak > 0.0:
        trigger.gain = peak
        trigger.note_on(t)
    return g.value_at(t)


def test_contribution_for_hits_the_target_in_every_mix() -> None:
    a, trigger = voice("a", 2.0), voice("trigger", 1.0)
    channels = [Channel(a), Channel(trigger, key="trigger")]
    a.note_on(0.0)
    total = Group(id="sum", channels=channels, max_value=10.0)
    assert sized(total, trigger, 0.0, 3.5) == pytest.approx(3.5)
    biggest = Group(id="max", channels=channels, mix=Mix.MAX, max_value=10.0)
    assert sized(biggest, trigger, 0.0, 3.5) == pytest.approx(3.5)
    average = Group(id="mean", channels=channels, mix=Mix.MEAN, max_value=10.0)
    assert sized(average, trigger, 0.0, 3.5) == pytest.approx(3.5)


def test_contribution_for_counts_the_mean_denominator_the_way_the_mix_does() -> None:
    a, b, trigger = voice("a", 2.0), voice("b", 1.0), voice("trigger", 1.0)
    channels = [Channel(a), Channel(b), Channel(trigger, key="trigger")]
    a.note_on(0.0)  # b stays idle: a null, counted under ZERO and dropped under IGNORE
    zero = Group(id="zero", channels=channels, mix=Mix.MEAN, max_value=10.0)
    assert sized(zero, trigger, 0.0, 1.5) == pytest.approx(1.5)
    ignore = Group(
        id="ignore",
        channels=channels,
        mix=Mix.MEAN,
        null_handling=NullHandling.IGNORE,
        max_value=10.0,
    )
    assert sized(ignore, trigger, 0.0, 1.5) == pytest.approx(1.5)
    # the two disagree about the peak, which is the whole point of asking the mix
    assert zero.contribution_for(0.0, "trigger", 1.5) != pytest.approx(
        ignore.contribution_for(0.0, "trigger", 1.5)
    )


def test_contribution_for_ignores_muted_channels() -> None:
    a, b, trigger = voice("a", 2.0), voice("b", 4.0), voice("trigger", 1.0)
    channels = [Channel(a), Channel(b, muted=True), Channel(trigger, key="trigger")]
    a.note_on(0.0)
    b.note_on(0.0)
    total = Group(id="sum", channels=channels, max_value=10.0)
    assert sized(total, trigger, 0.0, 3.5) == pytest.approx(3.5)
    average = Group(id="mean", channels=channels, mix=Mix.MEAN, max_value=10.0)
    assert sized(average, trigger, 0.0, 3.5) == pytest.approx(3.5)


def test_contribution_for_reports_unreachable_targets_honestly() -> None:
    a, trigger = voice("a", 3.0), voice("trigger", 1.0)
    channels = [Channel(a), Channel(trigger, key="trigger")]
    a.note_on(0.0)
    # MAX cannot be pulled below the loudest channel; SUM answers with a negative peak
    biggest = Group(id="max", channels=channels, mix=Mix.MAX, max_value=10.0)
    assert biggest.contribution_for(0.0, "trigger", 1.0) == pytest.approx(1.0)
    assert sized(biggest, trigger, 0.0, 1.0) == pytest.approx(3.0)
    total = Group(id="sum", channels=channels, max_value=10.0)
    assert total.contribution_for(0.0, "trigger", 1.0) == pytest.approx(-2.0)
