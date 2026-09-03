"""The carried log-odds: a sum of the weights whose signal is true, nothing cleverer."""

from __future__ import annotations

import math

import pytest

from custom_components.activity_levels.presence.carried import (
    Signals,
    Weights,
    log_odds,
    logit,
)


def test_no_signal_says_nothing() -> None:
    assert log_odds(Signals(), Weights()) == 0.0


@pytest.mark.parametrize(
    ("signals", "expected"),
    [
        (Signals(charging=True), -3.0),
        (Signals(moving=True), 2.0),
        (Signals(still_room_empty=True), -2.0),
        (Signals(jitter=True), 1.0),
        (Signals(charging=True, moving=True, still_room_empty=True, jitter=True), -2.0),
        # False is not None: a signal known to be off contributes nothing either
        (Signals(charging=False, moving=False), 0.0),
    ],
)
def test_each_true_signal_adds_its_weight(signals: Signals, expected: float) -> None:
    assert log_odds(signals, Weights()) == pytest.approx(expected)


def test_weights_are_configurable_and_zero_disables_one() -> None:
    weights = Weights(charging=-5.0, moving=0.0)
    assert log_odds(Signals(charging=True, moving=True), weights) == pytest.approx(-5.0)


def test_logit_is_the_log_odds_of_a_probability() -> None:
    assert logit(0.5) == 0.0
    assert logit(0.7) == pytest.approx(math.log(0.7 / 0.3))
    assert logit(0.999999) > 10.0
