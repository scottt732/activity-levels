"""Ceiling validation and the full-scale release slope."""

from math import inf

import pytest

from custom_components.activity_levels.engine import Envelope, Phase, Voice


def test_ceiling_defaults_to_infinity() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope())
    assert v.ceiling == inf


@pytest.mark.parametrize("bad", [0.5, 1.9, -inf, float("nan")])
def test_ceiling_below_gain_or_non_finite_is_rejected(bad: float) -> None:
    with pytest.raises(ValueError, match="ceiling"):
        Voice(id="x", gain=2.0, envelope=Envelope(), ceiling=bad)


def test_ceiling_equal_to_gain_is_accepted() -> None:
    assert Voice(id="x", gain=2.0, envelope=Envelope(), ceiling=2.0).ceiling == 2.0


def test_release_from_full_scale_takes_the_whole_release_time() -> None:
    # max_value 5, release 2h: a voice sitting at 5.0 reaches zero in exactly 2h.
    v = Voice(id="x", gain=5.0, envelope=Envelope(release=7200.0), ceiling=5.0)
    v.note_on(0.0)
    v.note_off(0.0)
    assert v.value_at(3600.0) == pytest.approx(2.5)
    assert v.next_boundary(0.0) == pytest.approx(7200.0)
    assert v.value_at(7200.0) == pytest.approx(0.0)
    assert v.phase is Phase.IDLE


def test_release_from_a_fifth_of_full_scale_takes_a_fifth_of_the_time() -> None:
    # Same slope, not the same duration: 1.0 out of a ceiling of 5 falls in release/5.
    v = Voice(id="x", gain=1.0, envelope=Envelope(release=7200.0), ceiling=5.0)
    v.note_on(0.0)
    v.note_off(0.0)
    assert v.next_boundary(0.0) == pytest.approx(1440.0)
    assert v.value_at(720.0) == pytest.approx(0.5)
    assert v.slope_at(0.0) == pytest.approx(-5.0 / 7200.0)


def test_release_with_an_infinite_ceiling_still_references_gain() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(release=100.0))
    v.note_on(0.0)
    v.note_off(0.0)
    assert v.next_boundary(0.0) == pytest.approx(100.0)
    assert v.slope_at(0.0) == pytest.approx(-0.02)


def test_release_ends_at_zero_not_below() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(release=100.0), ceiling=4.0)
    v.note_on(0.0)
    v.note_off(0.0)
    assert v.value_at(25.0) == pytest.approx(0.0)
    assert v.value_at(1000.0) == pytest.approx(0.0)
    assert v.phase is Phase.IDLE


def test_restore_clamps_the_stored_value_to_the_ceiling() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(release=100.0), ceiling=3.0)
    v.restore({"phase": "release", "phase_start_t": 0.0, "phase_start_value": 9.0, "gate": False})
    assert v.value_at(0.0) == pytest.approx(3.0)
