import pytest

from custom_components.activity_levels.engine import (
    Envelope,
    Phase,
    RetriggerWhen,
    Unavailable,
    Voice,
)


def test_retrigger_during_release_restarts_attack_from_current_value() -> None:
    # This is the C# "peak snap-back" bug: value must continue from 1.0, not jump to 2.0
    # and must not reset to an old peak.
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(attack=10.0, release=100.0, retrigger=RetriggerWhen.RELEASE, stack=False),
    )
    v.note_on(0.0)
    v.note_off(10.0)  # at 2.0, releasing
    assert v.value_at(60.0) == pytest.approx(1.0)
    assert v.note_on(60.0) is True
    assert v.phase is Phase.ATTACK
    assert v.value_at(60.0) == pytest.approx(1.0)
    assert v.value_at(65.0) == pytest.approx(1.5)
    assert v.value_at(70.0) == pytest.approx(2.0)


def test_retrigger_release_ignores_note_on_while_gated() -> None:
    v = Voice(
        id="x",
        gain=1.0,
        envelope=Envelope(attack=10.0, retrigger=RetriggerWhen.RELEASE, stack=False),
    )
    v.note_on(0.0)
    assert v.note_on(5.0) is False
    assert v.value_at(5.0) == pytest.approx(0.5)
    assert v.last_note_on == 0.0


def test_retrigger_always_restarts_attack_while_gated() -> None:
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(
            attack=10.0, decay=10.0, sustain=0.5, retrigger=RetriggerWhen.ALWAYS, stack=False
        ),
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
        envelope=Envelope(
            release=100.0, impulse=True, retrigger=RetriggerWhen.RELEASE, stack=False
        ),
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


def test_stacking_always_is_the_default() -> None:
    assert Envelope().retrigger is RetriggerWhen.ALWAYS
    assert Envelope().stack is True


def test_stack_from_idle_attacks_toward_gain_like_the_other_modes() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(attack=10.0, stack=True))
    v.note_on(0.0)
    assert v.value_at(5.0) == pytest.approx(1.0)
    assert v.value_at(10.0) == pytest.approx(2.0)


def test_stack_from_release_adds_gain_to_the_current_value() -> None:
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(attack=10.0, release=100.0, stack=True),
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
    # Unlike the `release` mode, a gated voice still stacks -- that is the legacy
    # "each trigger adds 1.0" behaviour.
    v = Voice(id="x", gain=1.0, envelope=Envelope(stack=True))
    v.note_on(0.0)
    assert v.value_at(10.0) == pytest.approx(1.0)
    assert v.gate is True
    assert v.note_on(10.0) is True
    assert v.value_at(10.0) == pytest.approx(2.0)
    assert v.note_on(20.0) is True
    assert v.value_at(20.0) == pytest.approx(3.0)


def test_stack_clamps_at_the_ceiling() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(stack=True), ceiling=5.0)
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
        envelope=Envelope(decay=10.0, sustain=0.5, release=100.0, stack=True),
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
        envelope=Envelope(release=100.0, impulse=True, stack=True),
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
        envelope=Envelope(release=100.0, impulse=True, stack=True),
        ceiling=5.0,
    )
    v.note_on(0.0)
    v.note_on(0.0)
    assert v.value_at(0.0) == pytest.approx(5.0)


def test_impulse_without_stack_still_jumps_to_gain() -> None:
    for mode in (RetriggerWhen.RELEASE, RetriggerWhen.ALWAYS):
        v = Voice(
            id="x",
            gain=2.0,
            envelope=Envelope(release=100.0, impulse=True, retrigger=mode, stack=False),
            ceiling=5.0,
        )
        v.note_on(0.0)
        v.note_on(20.0)
        assert v.value_at(20.0) == pytest.approx(2.0)


def test_stack_respects_debounce() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope(stack=True, debounce=30.0), ceiling=5.0)
    assert v.note_on(0.0) is True
    assert v.note_on(29.9) is False
    assert v.value_at(29.9) == pytest.approx(1.0)
    assert v.note_on(30.0) is True
    assert v.value_at(30.0) == pytest.approx(2.0)


# -- when a trigger is honoured -------------------------------------------


def _phased(mode: RetriggerWhen) -> Voice:
    """A voice with a phase you can stop in: 10s attack, 10s decay, then sustain."""
    return Voice(
        id="x",
        gain=1.0,
        envelope=Envelope(
            attack=10.0, decay=10.0, sustain=0.5, release=100.0, retrigger=mode, stack=False
        ),
    )


def test_after_attack_ignores_a_trigger_that_lands_in_the_attack() -> None:
    v = _phased(RetriggerWhen.AFTER_ATTACK)
    v.note_on(0.0)
    assert v.phase is Phase.ATTACK
    assert v.note_on(5.0) is False
    assert v.last_note_on == 0.0
    assert v.value_at(15.0) == pytest.approx(0.75)  # still decaying from the first note
    assert v.phase is Phase.DECAY
    assert v.note_on(15.0) is True  # the decay is fair game


def test_after_decay_waits_for_the_sustain() -> None:
    v = _phased(RetriggerWhen.AFTER_DECAY)
    v.note_on(0.0)
    assert v.note_on(5.0) is False  # attack
    v.value_at(15.0)
    assert v.phase is Phase.DECAY
    assert v.note_on(15.0) is False  # decay
    v.value_at(25.0)
    assert v.phase is Phase.SUSTAIN
    assert v.note_on(25.0) is True


def test_release_mode_honours_only_a_fading_note() -> None:
    v = _phased(RetriggerWhen.RELEASE)
    v.note_on(0.0)
    assert v.note_on(5.0) is False
    v.value_at(25.0)
    assert v.phase is Phase.SUSTAIN
    assert v.note_on(25.0) is False
    v.note_off(25.0)
    assert v.phase is Phase.RELEASE
    assert v.note_on(30.0) is True


def test_idle_mode_waits_for_the_voice_to_finish_releasing() -> None:
    v = _phased(RetriggerWhen.IDLE)
    v.note_on(0.0)
    v.value_at(25.0)
    v.note_off(25.0)  # releasing from 0.5, at the full-scale slope: 50s to zero
    assert v.phase is Phase.RELEASE
    assert v.note_on(50.0) is False  # still fading
    assert v.last_note_on == 0.0
    assert v.value_at(75.0) == pytest.approx(0.0)
    assert v.phase is Phase.IDLE
    assert v.note_on(75.0) is True
    assert v.phase is Phase.ATTACK


def test_idle_mode_ignores_stacking_because_there_is_nothing_to_stack_on() -> None:
    # `stack` decides what an honoured trigger does; in this mode the only honoured
    # trigger starts from silence, so both settings give the same envelope.
    for stack in (True, False):
        v = Voice(
            id="x",
            gain=2.0,
            envelope=Envelope(attack=10.0, retrigger=RetriggerWhen.IDLE, stack=stack),
        )
        v.note_on(0.0)
        assert v.note_on(5.0) is False
        assert v.value_at(10.0) == pytest.approx(2.0)


def test_every_mode_honours_a_trigger_from_idle() -> None:
    for mode in RetriggerWhen:
        v = Voice(id="x", gain=1.0, envelope=Envelope(retrigger=mode, stack=False))
        assert v.note_on(0.0) is True


# -- sustain above 1 -------------------------------------------------------


def test_sustain_above_one_makes_the_decay_climb() -> None:
    v = Voice(
        id="x",
        gain=1.0,
        envelope=Envelope(decay=10.0, sustain=1.5, release=100.0, stack=False),
        ceiling=5.0,
    )
    v.note_on(0.0)
    assert v.value_at(0.0) == pytest.approx(1.0)
    assert v.value_at(5.0) == pytest.approx(1.25)
    assert v.value_at(10.0) == pytest.approx(1.5)
    assert v.phase is Phase.SUSTAIN


def test_sustain_above_one_still_stops_at_the_ceiling() -> None:
    v = Voice(
        id="x",
        gain=2.0,
        envelope=Envelope(decay=10.0, sustain=4.0, release=100.0, stack=False),
        ceiling=5.0,
    )
    v.note_on(0.0)
    assert v.value_at(10.0) == pytest.approx(5.0)


def test_sustain_of_exactly_one_is_still_a_plateau() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(decay=10.0, sustain=1.0, stack=False))
    v.note_on(0.0)
    assert v.phase is Phase.SUSTAIN  # the zero-length decay is retired at once
    assert v.value_at(10.0) == pytest.approx(2.0)
