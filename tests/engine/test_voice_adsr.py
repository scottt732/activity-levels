import pytest

from custom_components.activity_levels.engine import Envelope, Phase, Voice


def media() -> Voice:
    # attack 10s, decay 100s to 60%, release 200s; gain 2 -> peak 2.0, sustain 1.2
    return Voice(
        id="media_player.tv",
        gain=2.0,
        envelope=Envelope(attack=10.0, decay=100.0, sustain=0.6, release=200.0),
    )


def test_attack_ramps_linearly_from_zero() -> None:
    v = media()
    v.note_on(0.0)
    assert v.phase is Phase.ATTACK
    assert v.value_at(0.0) == pytest.approx(0.0)
    assert v.value_at(5.0) == pytest.approx(1.0)
    assert v.slope_at(5.0) == pytest.approx(0.2)
    assert v.next_boundary(0.0) == pytest.approx(10.0)


def test_attack_rolls_into_decay_then_sustain() -> None:
    v = media()
    v.note_on(0.0)
    assert v.value_at(10.0) == pytest.approx(2.0)
    assert v.phase is Phase.DECAY
    assert v.next_boundary(10.0) == pytest.approx(110.0)
    assert v.value_at(60.0) == pytest.approx(1.6)  # halfway from 2.0 to 1.2
    assert v.value_at(110.0) == pytest.approx(1.2)
    assert v.phase is Phase.SUSTAIN
    assert v.value_at(5000.0) == pytest.approx(1.2)
    assert v.next_boundary(5000.0) is None
    assert v.slope_at(5000.0) == 0.0


def test_skipping_far_ahead_rolls_through_all_phases_in_one_call() -> None:
    v = media()
    v.note_on(0.0)
    assert v.value_at(1000.0) == pytest.approx(1.2)
    assert v.phase is Phase.SUSTAIN


def test_note_off_from_sustain_releases_with_constant_slope() -> None:
    v = media()
    v.note_on(0.0)
    v.note_off(1000.0)  # at 1.2; slope = -gain/release = -0.01/s -> zero at +120s
    assert v.phase is Phase.RELEASE
    assert v.value_at(1060.0) == pytest.approx(0.6)
    assert v.next_boundary(1000.0) == pytest.approx(1120.0)


def test_note_off_during_attack_releases_from_current_value() -> None:
    v = media()
    v.note_on(0.0)
    v.note_off(5.0)  # at 1.0
    assert v.value_at(5.0) == pytest.approx(1.0)
    assert v.next_boundary(5.0) == pytest.approx(105.0)


def test_sustain_one_collapses_decay() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(attack=0.0, decay=50.0, sustain=1.0))
    v.note_on(0.0)
    assert v.phase is Phase.SUSTAIN
    assert v.value_at(0.0) == pytest.approx(1.0)
    assert v.next_boundary(0.0) is None


def test_sustain_zero_decays_to_zero_but_stays_gated() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(decay=10.0, sustain=0.0, release=10.0))
    v.note_on(0.0)
    assert v.value_at(10.0) == pytest.approx(0.0)
    assert v.phase is Phase.SUSTAIN
    assert v.gate is True
    v.note_off(20.0)
    assert v.phase is Phase.IDLE


def test_zero_release_drops_to_idle_immediately() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(release=0.0))
    v.note_on(0.0)
    v.note_off(5.0)
    assert v.value_at(5.0) == 0.0
    assert v.phase is Phase.IDLE
