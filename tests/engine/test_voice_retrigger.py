import pytest

from custom_components.activity_levels.engine import (
    Envelope,
    Phase,
    Retrigger,
    Unavailable,
    Voice,
)


def test_retrigger_during_release_restarts_attack_from_current_value() -> None:
    # This is the C# "peak snap-back" bug: value must continue from 1.0, not jump to 2.0
    # and must not reset to an old peak.
    v = Voice(id="x", gain=2.0, envelope=Envelope(attack=10.0, release=100.0))
    v.note_on(0.0)
    v.note_off(10.0)  # at 2.0, releasing
    assert v.value_at(60.0) == pytest.approx(1.0)
    assert v.note_on(60.0) is True
    assert v.phase is Phase.ATTACK
    assert v.value_at(60.0) == pytest.approx(1.0)
    assert v.value_at(65.0) == pytest.approx(1.5)
    assert v.value_at(70.0) == pytest.approx(2.0)


def test_retrigger_only_in_release_ignores_note_on_while_gated() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(attack=10.0))
    v.note_on(0.0)
    assert v.note_on(5.0) is False
    assert v.value_at(5.0) == pytest.approx(0.5)
    assert v.last_note_on == 0.0


def test_retrigger_always_restarts_attack_while_gated() -> None:
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(attack=10.0, decay=10.0, sustain=0.5, retrigger=Retrigger.ALWAYS),
    )
    v.note_on(0.0)
    v.value_at(100.0)  # sustaining at 1.0
    assert v.note_on(100.0) is True
    assert v.phase is Phase.ATTACK
    assert v.value_at(105.0) == pytest.approx(1.5)
    assert v.last_note_on == 100.0


def test_impulse_jumps_to_peak_and_releases_without_gate() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(attack=30.0, release=100.0, impulse=True))
    assert v.note_on(0.0) is True
    assert v.gate is False
    assert v.phase is Phase.RELEASE
    assert v.value_at(0.0) == pytest.approx(2.0)
    assert v.value_at(50.0) == pytest.approx(1.0)
    v.note_off(60.0)  # no gate -> noop
    assert v.phase is Phase.RELEASE


def test_impulse_retriggers_freely_from_release() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(release=100.0, impulse=True))
    v.note_on(0.0)
    v.value_at(90.0)
    assert v.note_on(90.0) is True
    assert v.value_at(90.0) == pytest.approx(2.0)
    assert v.next_boundary(90.0) == pytest.approx(190.0)


def test_debounce_rejects_note_on_within_window() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(release=100.0, impulse=True, debounce=30.0))
    assert v.note_on(0.0) is True
    assert v.note_on(29.9) is False
    assert v.last_note_on == 0.0
    assert v.note_on(30.0) is True
    assert v.last_note_on == 30.0


def test_unavailable_hold_is_noop() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope())
    v.note_on(0.0)
    v.unavailable(10.0)
    assert v.gate is True
    assert v.phase is Phase.SUSTAIN


def test_unavailable_note_off_releases() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(unavailable=Unavailable.NOTE_OFF))
    v.note_on(0.0)
    v.unavailable(10.0)
    assert v.gate is False
    assert v.phase is Phase.RELEASE


def test_gain_must_be_positive() -> None:
    with pytest.raises(ValueError):
        Voice(id="x", gain=0.0, envelope=Envelope())
