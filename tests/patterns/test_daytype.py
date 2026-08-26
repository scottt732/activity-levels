from custom_components.activity_levels import const
from custom_components.activity_levels.patterns.daytype import (
    BUILTIN_DAY_TYPES,
    DayTypeInputs,
    resolve_day_type,
)

PREC = ["vacation", "holiday", "school_year", "weekend", "weekday"]


def test_plain_weekday_and_weekend():
    assert resolve_day_type(DayTypeInputs(1, True, frozenset()), PREC) == "weekday"
    assert resolve_day_type(DayTypeInputs(6, None, frozenset()), PREC) == "weekend"


def test_holiday_only_on_non_workday_weekdays():
    assert resolve_day_type(DayTypeInputs(2, False, frozenset()), PREC) == "holiday"
    assert resolve_day_type(DayTypeInputs(6, False, frozenset()), PREC) == "weekend"
    assert resolve_day_type(DayTypeInputs(2, None, frozenset()), PREC) == "weekday"


def test_calendar_precedence():
    both = frozenset({"school_year", "vacation"})
    school = frozenset({"school_year"})
    assert resolve_day_type(DayTypeInputs(2, True, both), PREC) == "vacation"
    assert resolve_day_type(DayTypeInputs(2, True, school), PREC) == "school_year"
    assert resolve_day_type(DayTypeInputs(6, True, school), PREC) == "school_year"


def test_unknown_calendar_ids_are_ignored():
    assert resolve_day_type(DayTypeInputs(0, True, frozenset({"nope"})), PREC) == "weekday"


def test_const_re_exports_the_one_definition() -> None:
    """`const` is where the rest of the integration looks; there is still one list."""
    assert const.BUILTIN_DAY_TYPES is BUILTIN_DAY_TYPES
