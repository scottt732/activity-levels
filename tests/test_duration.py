import pytest
import voluptuous as vol

from custom_components.activity_levels.duration import parse_duration


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (0, 0.0),
        (30, 30.0),
        (2.5, 2.5),
        ("30s", 30.0),
        ("5m", 300.0),
        ("2h", 7200.0),
        ("1d", 86400.0),
        ("1.5m", 90.0),
        ("00:30:00", 1800.0),
        ("01:02:03", 3723.0),
        ("00:00:01.5", 1.5),
        ("10:00", 36000.0),
        (" 45S ", 45.0),
    ],
)
def test_parse_duration(value: object, expected: float) -> None:
    assert parse_duration(value) == pytest.approx(expected)


@pytest.mark.parametrize("value", [-1, "-5s", "abc", "5x", "", None, True, float("nan"), "1:2:3:4"])
def test_parse_duration_rejects(value: object) -> None:
    with pytest.raises(vol.Invalid):
        parse_duration(value)
