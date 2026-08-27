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
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(attack=10.0, release=100.0, retrigger=Retrigger.ONLY_IN_RELEASE),
    )
    v.note_on(0.0)
    v.note_off(10.0)  # at 2.0, releasing
    assert v.value_at(60.0) == pytest.approx(1.0)
    assert v.note_on(60.0) is True
    assert v.phase is Phase.ATTACK
    assert v.value_at(60.0) == pytest.approx(1.0)
    assert v.value_at(65.0) == pytest.approx(1.5)
    assert v.value_at(70.0) == pytest.approx(2.0)


def test_retrigger_only_in_release_ignores_note_on_while_gated() -> None:
    v = Voice(
        id="x",
        gain=1.0,
        envelope=Envelope(attack=10.0, retrigger=Retrigger.ONLY_IN_RELEASE),
    )
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
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(release=100.0, impulse=True, retrigger=Retrigger.ONLY_IN_RELEASE),
    )
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


# -- stack -----------------------------------------------------------------


def test_stack_is_the_default_retrigger_mode() -> None:
    assert Envelope().retrigger is Retrigger.STACK


def test_stack_from_idle_attacks_toward_gain_like_the_other_modes() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(attack=10.0, retrigger=Retrigger.STACK))
    v.note_on(0.0)
    assert v.value_at(5.0) == pytest.approx(1.0)
    assert v.value_at(10.0) == pytest.approx(2.0)


def test_stack_from_release_adds_gain_to_the_current_value() -> None:
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(attack=10.0, release=100.0, retrigger=Retrigger.STACK),
    )
    v.note_on(0.0)
    v.note_off(10.0)  # at 2.0, releasing
    assert v.value_at(60.0) == pytest.approx(1.0)
    assert v.note_on(60.0) is True
    assert v.phase is Phase.ATTACK
    assert v.value_at(60.0) == pytest.approx(1.0)
    assert v.value_at(65.0) == pytest.approx(2.0)  # halfway from 1.0 to 3.0
    assert v.value_at(70.0) == pytest.approx(3.0)


def test_stack_while_gated_adds_gain_on_top_of_the_held_level() -> None:
    # Unlike only_in_release, a gated voice still stacks -- that is the legacy
    # "each trigger adds 1.0" behaviour.
    v = Voice(id="x", gain=1.0, envelope=Envelope(retrigger=Retrigger.STACK))
    v.note_on(0.0)
    assert v.value_at(10.0) == pytest.approx(1.0)
    assert v.gate is True
    assert v.note_on(10.0) is True
    assert v.value_at(10.0) == pytest.approx(2.0)
    assert v.note_on(20.0) is True
    assert v.value_at(20.0) == pytest.approx(3.0)


def test_stack_clamps_at_the_ceiling() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(retrigger=Retrigger.STACK), ceiling=5.0)
    for t in range(6):
        v.note_on(float(t))
    assert v.value_at(5.0) == pytest.approx(5.0)
    # No hidden height above the ceiling: releasing from 5.0 takes the whole release.
    v.note_off(5.0)
    assert v.next_boundary(5.0) == pytest.approx(5.0 + 1800.0)


def test_stack_decays_toward_sustain_times_the_reached_peak() -> None:
    # Peak is what the attack actually reached, not `gain`: stacking to 3.0 with
    # sustain 0.5 decays to 1.5, not to 0.5.
    v = Voice(
        id="x",
        gain=1.0,
        envelope=Envelope(decay=10.0, sustain=0.5, release=100.0, retrigger=Retrigger.STACK),
    )
    v.note_on(0.0)
    assert v.value_at(10.0) == pytest.approx(0.5)
    v.note_on(10.0)  # stacks to 1.5, then decays
    assert v.value_at(10.0) == pytest.approx(1.5)
    assert v.value_at(15.0) == pytest.approx(1.125)
    assert v.value_at(20.0) == pytest.approx(0.75)
    assert v.phase is Phase.SUSTAIN


def test_non_stacked_decay_target_is_unchanged() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(decay=10.0, sustain=0.5))
    v.note_on(0.0)
    assert v.value_at(0.0) == pytest.approx(2.0)
    assert v.value_at(10.0) == pytest.approx(1.0)


def test_impulse_with_stack_releases_from_the_stacked_value() -> None:
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(release=100.0, impulse=True, retrigger=Retrigger.STACK),
        ceiling=5.0,
    )
    v.note_on(0.0)
    assert v.value_at(0.0) == pytest.approx(2.0)
    assert v.value_at(20.0) == pytest.approx(1.0)  # slope is ceiling/release = 0.05/s
    assert v.note_on(20.0) is True
    assert v.value_at(20.0) == pytest.approx(3.0)
    assert v.note_on(21.0) is True
    assert v.value_at(21.0) == pytest.approx(4.95)  # 3.0 fell to 2.95, plus another 2.0
    assert v.gate is False
    assert v.phase is Phase.RELEASE


def test_impulse_with_stack_clamps_at_the_ceiling() -> None:
    v = Voice(
        id="x",
        gain=4.0,
        envelope=Envelope(release=100.0, impulse=True, retrigger=Retrigger.STACK),
        ceiling=5.0,
    )
    v.note_on(0.0)
    v.note_on(0.0)
    assert v.value_at(0.0) == pytest.approx(5.0)


def test_impulse_without_stack_still_jumps_to_gain() -> None:
    for mode in (Retrigger.ONLY_IN_RELEASE, Retrigger.ALWAYS):
        v = Voice(
            id="x",
            gain=2.0,
            envelope=Envelope(release=100.0, impulse=True, retrigger=mode),
            ceiling=5.0,
        )
        v.note_on(0.0)
        v.note_on(20.0)
        assert v.value_at(20.0) == pytest.approx(2.0)


def test_stack_respects_debounce() -> None:
    v = Voice(
        id="x", gain=1.0, envelope=Envelope(retrigger=Retrigger.STACK, debounce=30.0), ceiling=5.0
    )
    assert v.note_on(0.0) is True
    assert v.note_on(29.9) is False
    assert v.value_at(29.9) == pytest.approx(1.0)
    assert v.note_on(30.0) is True
    assert v.value_at(30.0) == pytest.approx(2.0)
