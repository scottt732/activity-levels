import pytest

from custom_components.activity_levels.engine import (
    Envelope,
    Mix,
    NullHandling,
    Phase,
    Retrigger,
    Unavailable,
)


def test_defaults_match_spec() -> None:
    e = Envelope()
    assert e.attack == 0.0
    assert e.decay == 0.0
    assert e.sustain == 1.0
    assert e.release == 1800.0
    assert e.impulse is False
    assert e.retrigger is Retrigger.ONLY_IN_RELEASE
    assert e.unavailable is Unavailable.HOLD
    assert e.debounce == 0.0


def test_enum_values_are_config_strings() -> None:
    assert Retrigger.ONLY_IN_RELEASE == "only_in_release"
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
        {"sustain": 1.01},
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
