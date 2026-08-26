"""Profile document schema and helper tests."""

from __future__ import annotations

import math

import pytest

from custom_components.activity_levels.patterns.profile import (
    SLOTS,
    VERSION,
    ProfileError,
    anomaly_score,
    empty_profile,
    expected_at,
    group_ready,
    slot_minute,
    slot_of,
    validate_profile,
)


def _bands(p25: float, p50: float, p75: float) -> list[list[float]]:
    return [[p25, p50, p75] for _ in range(SLOTS)]


def _doc(**over: object) -> dict[str, object]:
    doc: dict[str, object] = {
        "version": 1,
        "producer": {"name": "builtin", "version": VERSION},
        "generated_at": 1787800000.0,
        "training_window": [1772000000.0, 1787800000.0],
        "day_types": ["weekday", "weekend"],
        "slot_minutes": 15,
        "groups": {
            "living_room": {
                "ready": True,
                "days": 91,
                "expected": {
                    "weekday": _bands(0.5, 1.0, 1.5),
                    "weekend": _bands(1.0, 2.0, 3.0),
                },
                "lights": {
                    "light.lamp": {
                        "p_on": {"weekday": [0.25] * SLOTS},
                        "on_starts": {"weekday": [1080, 1085]},
                        "off_starts": {"weekday": [1380]},
                        "brightness": 180,
                    }
                },
            }
        },
    }
    doc.update(over)
    return doc


def test_slot_helpers():
    assert slot_of(0) == 0
    assert slot_of(1439) == 95
    assert slot_of(14) == 0
    assert slot_of(15) == 1
    assert slot_minute(4) == 60
    assert slot_minute(0) == 0
    assert slot_minute(95) == 1425


def test_empty_profile_validates():
    doc = empty_profile()
    assert doc["producer"] == {"name": "builtin", "version": VERSION}
    assert doc["groups"] == {}
    assert doc["slot_minutes"] == 15
    assert validate_profile(doc) == doc


def test_empty_profile_accepts_producer_and_day_types():
    doc = empty_profile(producer_name="external", producer_version="9.9", day_types=("weekday",))
    assert doc["producer"] == {"name": "external", "version": "9.9"}
    assert doc["day_types"] == ["weekday"]
    validate_profile(doc)


def test_minimal_document_round_trips():
    doc = _doc()
    assert validate_profile(doc) == doc


def _paths(exc: ProfileError) -> list[str]:
    return [e["path"] for e in exc.errors]


def test_rejects_wrong_slot_count():
    doc = _doc()
    doc["groups"]["living_room"]["expected"]["weekday"] = _bands(0.5, 1.0, 1.5)[:95]
    with pytest.raises(ProfileError) as exc:
        validate_profile(doc)
    assert "groups/living_room/expected/weekday" in _paths(exc.value)


def test_rejects_unordered_band():
    doc = _doc()
    doc["groups"]["living_room"]["expected"]["weekday"][7] = [2.0, 1.0, 3.0]
    with pytest.raises(ProfileError) as exc:
        validate_profile(doc)
    assert "groups/living_room/expected/weekday/7" in _paths(exc.value)


def test_rejects_negative_band():
    doc = _doc()
    doc["groups"]["living_room"]["expected"]["weekday"][3] = [-1.0, 1.0, 3.0]
    with pytest.raises(ProfileError) as exc:
        validate_profile(doc)
    assert "groups/living_room/expected/weekday/3" in _paths(exc.value)[0]


def test_rejects_wrong_slot_minutes():
    with pytest.raises(ProfileError) as exc:
        validate_profile(_doc(slot_minutes=10))
    assert "slot_minutes" in _paths(exc.value)


def test_rejects_unknown_top_level_key():
    with pytest.raises(ProfileError) as exc:
        validate_profile(_doc(nope=1))
    assert "nope" in _paths(exc.value)


def test_rejects_wrong_version():
    with pytest.raises(ProfileError) as exc:
        validate_profile(_doc(version=2))
    assert "version" in _paths(exc.value)


def test_rejects_out_of_range_p_on():
    doc = _doc()
    doc["groups"]["living_room"]["lights"]["light.lamp"]["p_on"]["weekday"][0] = 1.5
    with pytest.raises(ProfileError) as exc:
        validate_profile(doc)
    assert "groups/living_room/lights/light.lamp/p_on/weekday/0" in _paths(exc.value)


def test_rejects_out_of_range_transition_minute():
    doc = _doc()
    doc["groups"]["living_room"]["lights"]["light.lamp"]["on_starts"]["weekday"] = [1440]
    with pytest.raises(ProfileError) as exc:
        validate_profile(doc)
    assert "groups/living_room/lights/light.lamp/on_starts/weekday/0" in _paths(exc.value)


def test_rejects_backwards_training_window():
    with pytest.raises(ProfileError) as exc:
        validate_profile(_doc(training_window=[2.0, 1.0]))
    assert "training_window" in _paths(exc.value)


def test_group_ready():
    doc = _doc()
    assert group_ready(doc, "living_room") is True
    assert group_ready(doc, "missing") is False
    doc["groups"]["living_room"]["ready"] = False
    assert group_ready(doc, "living_room") is False


def test_expected_at_returns_the_requested_day_type():
    assert expected_at(_doc(), "living_room", "weekend", 5) == (1.0, 2.0, 3.0)


def test_expected_at_falls_back_to_weekday_then_first():
    doc = _doc()
    assert expected_at(doc, "living_room", "holiday", 5) == (0.5, 1.0, 1.5)
    del doc["groups"]["living_room"]["expected"]["weekday"]
    assert expected_at(doc, "living_room", "holiday", 5) == (1.0, 2.0, 3.0)


def test_expected_at_returns_none_when_unavailable():
    doc = _doc()
    assert expected_at(doc, "missing", "weekday", 5) is None
    assert expected_at(doc, "living_room", "weekday", 96) is None
    doc["groups"]["living_room"]["expected"] = {}
    assert expected_at(doc, "living_room", "weekday", 5) is None


def test_anomaly_score_inside_band_is_zero():
    assert anomaly_score(2.0, (1.0, 2.0, 3.0)) == 0.0
    assert anomaly_score(1.0, (1.0, 2.0, 3.0)) == 0.0
    assert anomaly_score(3.0, (1.0, 2.0, 3.0)) == 0.0


def test_anomaly_score_above_and_below():
    assert anomaly_score(4.0, (1.0, 2.0, 3.0)) == pytest.approx(1.0)
    assert anomaly_score(0.0, (1.0, 2.0, 3.0)) == pytest.approx(-1.0)


def test_anomaly_score_degenerate_band_stays_finite():
    high = anomaly_score(5.0, (2.0, 2.0, 2.0))
    low = anomaly_score(-5.0, (2.0, 2.0, 2.0))
    assert math.isfinite(high) and high > 0
    assert math.isfinite(low) and low < 0
    assert anomaly_score(2.0, (2.0, 2.0, 2.0)) == 0.0


def test_anomaly_score_floors_the_denominator_at_five_percent_of_scale():
    collapsed = (2.0, 2.0, 2.0)
    assert anomaly_score(5.0, collapsed) == pytest.approx(60.0)  # 3.0 / 0.05
    assert anomaly_score(5.0, collapsed, scale=10.0) == pytest.approx(6.0)  # 3.0 / 0.5
    assert anomaly_score(-1.0, collapsed, scale=10.0) == pytest.approx(-6.0)
    assert abs(anomaly_score(5.0, collapsed)) < 100.0


def test_anomaly_score_floor_ignores_wide_enough_bands():
    assert anomaly_score(4.0, (1.0, 2.0, 3.0), scale=10.0) == pytest.approx(1.0)
    narrow = (1.99, 2.0, 2.01)
    assert anomaly_score(2.06, narrow) == pytest.approx((2.06 - 2.01) / 0.05)
