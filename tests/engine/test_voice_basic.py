import pytest

from custom_components.activity_levels.engine import Envelope, Phase, Voice


def make(release: float = 100.0, gain: float = 2.0) -> Voice:
    return Voice(id="binary_sensor.x", gain=gain, envelope=Envelope(release=release))


def test_idle_voice_is_zero_everywhere() -> None:
    v = make()
    assert v.value_at(0.0) == 0.0
    assert v.value_at(1e9) == 0.0
    assert v.phase is Phase.IDLE
    assert v.next_boundary(0.0) is None
    assert v.slope_at(0.0) == 0.0
    assert v.is_active(0.0) is False


def test_note_on_zero_attack_jumps_to_gain_and_holds_while_gated() -> None:
    v = make()
    assert v.note_on(10.0) is True
    assert v.gate is True
    assert v.last_note_on == 10.0
    assert v.value_at(10.0) == pytest.approx(2.0)
    assert v.value_at(10_000.0) == pytest.approx(2.0)
    assert v.phase is Phase.SUSTAIN
    assert v.next_boundary(10.0) is None


def test_release_is_linear_with_constant_slope() -> None:
    v = make(release=100.0, gain=2.0)
    v.note_on(0.0)
    v.note_off(0.0)
    assert v.phase is Phase.RELEASE
    assert v.gate is False
    assert v.value_at(0.0) == pytest.approx(2.0)
    assert v.value_at(50.0) == pytest.approx(1.0)
    assert v.slope_at(25.0) == pytest.approx(-0.02)
    assert v.next_boundary(0.0) == pytest.approx(100.0)
    assert v.value_at(100.0) == 0.0
    assert v.phase is Phase.IDLE
    assert v.value_at(101.0) == 0.0
    assert v.next_boundary(101.0) is None


def test_release_from_partial_value_keeps_slope() -> None:
    # Release from 1.0 with gain 2 and release 100 -> reaches zero in 50s.
    v = make(release=100.0, gain=2.0)
    v.note_on(0.0)
    v.note_off(0.0)
    v.value_at(50.0)  # now at 1.0, still releasing
    assert v.value_at(75.0) == pytest.approx(0.5)
    assert v.next_boundary(50.0) == pytest.approx(100.0)


def test_note_off_when_not_gated_is_noop() -> None:
    v = make()
    v.note_off(5.0)
    assert v.phase is Phase.IDLE
    v.note_on(10.0)
    v.note_off(20.0)
    v.value_at(10_000.0)
    assert v.phase is Phase.IDLE
    v.note_off(10_001.0)
    assert v.phase is Phase.IDLE


def test_clock_going_backwards_returns_segment_start_value() -> None:
    v = make(release=100.0, gain=2.0)
    v.note_on(100.0)
    v.note_off(100.0)
    assert v.value_at(50.0) == pytest.approx(2.0)
    assert v.phase is Phase.RELEASE


def test_reset_returns_to_idle() -> None:
    v = make()
    v.note_on(1.0)
    v.reset()
    assert v.phase is Phase.IDLE
    assert v.gate is False
    assert v.value_at(2.0) == 0.0


def test_reset_clears_debounce_history() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(release=10.0, debounce=5.0))
    assert v.note_on(0.0) is True
    v.reset()
    assert v.note_on(1.0) is True
    assert v.last_note_on == 1.0


def test_note_off_with_zero_release_is_idle_immediately() -> None:
    # Phase must be accurate the moment the event lands, without a query to settle it.
    v = Voice(id="v", gain=1.0, envelope=Envelope(release=0.0))
    v.note_on(0.0)
    v.note_off(1.0)
    assert v.phase is Phase.IDLE


def test_envelope_rejects_non_finite_durations() -> None:
    for name in ("attack", "decay", "release", "debounce"):
        with pytest.raises(ValueError):
            Envelope(**{name: float("nan")})
        with pytest.raises(ValueError):
            Envelope(**{name: float("inf")})
    with pytest.raises(ValueError):
        Envelope(sustain=float("nan"))


def test_voice_gain_must_be_finite() -> None:
    with pytest.raises(ValueError):
        Voice(id="v", gain=float("inf"), envelope=Envelope())
    with pytest.raises(ValueError):
        Voice(id="v", gain=float("nan"), envelope=Envelope())
