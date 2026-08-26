import pytest

from custom_components.activity_levels.engine import (
    Channel,
    Envelope,
    Group,
    Mix,
    NullHandling,
    Phase,
    Voice,
)


def impulse(id: str, gain: float = 1.0, release: float = 100.0) -> Voice:
    return Voice(id=id, gain=gain, envelope=Envelope(release=release, impulse=True))


def held(id: str, gain: float = 1.0, release: float = 100.0) -> Voice:
    return Voice(id=id, gain=gain, envelope=Envelope(release=release))


def test_active_gated_and_counts() -> None:
    a, b = impulse("a"), held("b")
    g = Group(id="g", channels=[Channel(a), Channel(b)])
    assert g.active_at(0.0) is False
    assert g.gated_at(0.0) is False
    assert g.active_voices(0.0) == 0
    a.note_on(0.0)
    assert g.active_at(0.0) is True
    assert g.gated_at(0.0) is False
    assert g.active_voices(0.0) == 1
    b.note_on(1.0)
    assert g.gated_at(1.0) is True
    assert g.active_voices(1.0) == 2
    assert g.active_voices(1000.0) == 1  # a has released; b still sustaining


def test_last_activity_is_max_over_subtree() -> None:
    a, b = impulse("a"), impulse("b")
    child = Group(id="c", channels=[Channel(b)])
    g = Group(id="g", channels=[Channel(a), Channel(child)])
    assert g.last_activity() is None
    a.note_on(5.0)
    b.note_on(9.0)
    assert g.last_activity() == 9.0
    assert child.last_activity() == 9.0


def test_cooldown_at_is_none_when_gated_or_idle_else_latest_release_end() -> None:
    a, b = impulse("a", release=100.0), held("b", release=50.0)
    g = Group(id="g", channels=[Channel(a), Channel(b)])
    assert g.cooldown_at(0.0) is None
    a.note_on(0.0)
    assert g.cooldown_at(0.0) == pytest.approx(100.0)
    b.note_on(10.0)
    assert g.cooldown_at(10.0) is None  # gated
    b.note_off(20.0)  # b releases 20 -> 70; a releases 0 -> 100
    assert g.cooldown_at(20.0) == pytest.approx(100.0)
    assert g.cooldown_at(101.0) is None


def test_next_boundary_is_min_over_subtree() -> None:
    a, b = impulse("a", release=100.0), impulse("b", release=30.0)
    g = Group(id="g", channels=[Channel(a), Channel(Group(id="c", channels=[Channel(b)]))])
    assert g.next_boundary(0.0) is None
    a.note_on(0.0)
    b.note_on(5.0)
    assert g.next_boundary(5.0) == pytest.approx(35.0)
    assert g.next_boundary(36.0) == pytest.approx(100.0)


def test_slope_sum_and_mean() -> None:
    a, b = impulse("a", gain=2.0, release=100.0), impulse("b", gain=1.0, release=100.0)
    g = Group(id="g", channels=[Channel(a), Channel(b, gain=2.0)], max_value=10.0)
    a.note_on(0.0)
    b.note_on(0.0)
    # a slope -0.02, b slope -0.01 * gain 2 = -0.02 -> sum -0.04
    assert g.slope_at(0.0) == pytest.approx(-0.04)
    g.mix = Mix.MEAN
    assert g.slope_at(0.0) == pytest.approx(-0.02)
    g.null_handling = NullHandling.IGNORE
    b.reset()
    assert g.slope_at(0.0) == pytest.approx(-0.02)


def test_slope_max_follows_loudest_channel() -> None:
    a, b = impulse("a", gain=3.0, release=300.0), impulse("b", gain=1.0, release=10.0)
    g = Group(id="g", channels=[Channel(a), Channel(b)], mix=Mix.MAX)
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.slope_at(0.0) == pytest.approx(-0.01)


def test_slope_is_zero_when_pinned_by_limiter() -> None:
    a, b = held("a", gain=4.0), impulse("b", gain=4.0, release=100.0)
    g = Group(id="g", channels=[Channel(a), Channel(b)], max_value=5.0)
    a.note_on(0.0)
    b.note_on(0.0)
    # raw 8.0 falling at -0.04/s; still above 5.0 -> displayed value not moving
    assert g.slope_at(0.0) == 0.0
    assert g.slope_at(80.0) == pytest.approx(-0.04)  # raw 4.8, below the limit


def test_next_display_change_uses_rounding_steps_and_boundaries() -> None:
    a = impulse("a", gain=1.0, release=100.0)
    g = Group(id="g", channels=[Channel(a)], precision=1)
    assert g.next_display_change(0.0) is None
    a.note_on(0.0)
    # value 1.0 falling 0.01/s; display flips to 0.9 when value < 0.95 -> t=5
    assert g.next_display_change(0.0) == pytest.approx(5.0, abs=2e-3)
    assert g.next_display_change(5.0) == pytest.approx(15.0, abs=2e-3)
    # near the end the phase boundary (t=100) wins over the next rounding step
    assert g.next_display_change(96.0) == pytest.approx(100.0, abs=2e-3)


def test_next_display_change_when_slope_zero_returns_boundary() -> None:
    a = Voice(id="a", gain=1.0, envelope=Envelope(attack=0.0, decay=10.0, sustain=0.5))
    g = Group(id="g", channels=[Channel(a)])
    a.note_on(0.0)
    a.value_at(10.0)  # sustaining, slope 0
    assert g.next_display_change(10.0) is None


def test_find_group_and_reset() -> None:
    a = held("a")
    inner = Group(id="inner", channels=[Channel(a)])
    outer = Group(id="outer", channels=[Channel(inner)])
    assert outer.find_group("inner") is inner
    assert outer.find_group("outer") is outer
    assert outer.find_group("nope") is None
    a.note_on(0.0)
    outer.reset()
    assert a.phase is Phase.IDLE
    assert outer.value_at(1.0) == 0.0


def test_next_display_change_rising_edge_crosses_immediately() -> None:
    # A wake scheduled *at* a display threshold lands an ulp before it: dt is ~0 and
    # the crossing is imminent, not already spent. Scheduling a full step ahead there
    # would leave the display stale for a whole step.
    a = Voice(id="a", gain=1.0, envelope=Envelope(attack=100.0))
    g = Group(id="g", channels=[Channel(a)], precision=1)
    a.note_on(0.0)
    assert g.next_display_change(15.0) == pytest.approx(15.0, abs=2e-3)
    assert g.next_display_change(35.0) == pytest.approx(35.0, abs=2e-3)
    # rising from 0.0 at 0.01/s at precision 1: 0.05 is reached at t=5
    assert g.next_display_change(0.0) == pytest.approx(5.0, abs=2e-3)


def test_next_display_change_schedules_the_limiter_unpin() -> None:
    # raw 8.0 falling at -0.02/s crosses max_value 5.0 at t=150; the display is
    # pinned (slope 0) until then, so that crossing is the next display change.
    a, b = impulse("a", gain=4.0, release=400.0), impulse("b", gain=4.0, release=400.0)
    g = Group(id="g", channels=[Channel(a), Channel(b)], max_value=5.0, precision=1)
    a.note_on(0.0)
    b.note_on(0.0)
    assert g.slope_at(0.0) == 0.0
    assert g.next_display_change(0.0) == pytest.approx(150.0, abs=2e-3)


def test_next_display_change_schedules_max_crossover() -> None:
    # a rises slowly from 0.5, b rises fast from 0 starting at t=500; b overtakes a at t≈555.6
    a = Voice(id="a", gain=1.0, envelope=Envelope(attack=1000.0))
    b = Voice(id="b", gain=1.0, envelope=Envelope(attack=100.0))
    g = Group(id="g", channels=[Channel(a), Channel(b)], mix=Mix.MAX, precision=1)
    a.note_on(0.0)
    b.note_on(500.0)
    # at t=550 a=0.55, b=0.5; a's display flips to 0.7 at 650 but b passes 0.65 at 565
    nxt = g.next_display_change(550.0)
    assert nxt is not None
    assert nxt <= 565.01
