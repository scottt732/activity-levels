import pytest

from custom_components.activity_levels.engine import (
    Envelope,
    Mix,
    NullHandling,
    Phase,
    RetriggerWhen,
    Unavailable,
)


def test_defaults_match_spec() -> None:
    e = Envelope()
    assert e.attack == 0.0
    assert e.decay == 0.0
    assert e.sustain == 1.0
    assert e.release == 1800.0
    assert e.impulse is False
    assert e.retrigger is RetriggerWhen.ALWAYS
    assert e.stack is True
    assert e.unavailable is Unavailable.HOLD
    assert e.debounce == 0.0


def test_enum_values_are_config_strings() -> None:
    assert RetriggerWhen.ALWAYS == "always"
    assert RetriggerWhen.AFTER_ATTACK == "after_attack"
    assert RetriggerWhen.AFTER_DECAY == "after_decay"
    assert RetriggerWhen.RELEASE == "release"
    assert RetriggerWhen.IDLE == "idle"
    assert Unavailable.NOTE_OFF == "note_off"
    assert Mix.SUM == "sum"
    assert NullHandling.IGNORE == "ignore"
    assert Phase.RELEASE == "release"


@pytest.mark.parametrize(
    "kwargs",
    [
        {"attack": -1.0},
        {"decay": -0.1},
        {"release": -5.0},
        {"debounce": -1.0},
        {"sustain": -0.01},
    ],
)
def test_invalid_ranges_raise(kwargs: dict[str, float]) -> None:
    with pytest.raises(ValueError):
        Envelope(**kwargs)


def test_envelope_is_frozen_and_hashable() -> None:
    e = Envelope(release=10.0)
    assert hash(e) == hash(Envelope(release=10.0))
    with pytest.raises(AttributeError):
        e.release = 5.0  # type: ignore[misc]


def test_sustain_has_no_upper_bound() -> None:
    # It is a multiplier on the peak, not a fraction of it: above 1 the decay segment
    # climbs to a level the attack never reached.
    assert Envelope(sustain=2.5).sustain == 2.5
    with pytest.raises(ValueError):
        Envelope(sustain=float("inf"))
