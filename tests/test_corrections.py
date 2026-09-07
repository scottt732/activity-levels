"""Corrections survive stale evidence but yield to a sustained, fresh contradiction."""

import pytest

from custom_components.activity_levels.presence.corrections import Correction
from custom_components.activity_levels.presence.observation import DeviceFrame, PersonObservation
from custom_components.activity_levels.schema import validate_config
from custom_components.activity_levels.topology import build_topology
from tests.fixtures import rooms_config
from tests.test_person import device, frame, near, person


@pytest.fixture
def topo():
    return build_topology(validate_config(rooms_config()))


def test_time_and_repeated_samples_do_not_release_carrying():
    correction = Correction(False, 0.0, anchor="kitchen")
    for t in range(10, 601, 10):
        correction.observe(float(t), 1.0, True)
    assert correction.strength == 1.0


def test_sustained_fresh_evidence_fades_then_releases():
    correction = Correction(False, 0.0, anchor="kitchen")
    for t in (10.0, 20.0, 40.0):
        correction.observe(t, t, True)
    assert correction.strength == 1.0
    correction.observe(70.0, 70.0, True)
    assert correction.strength == pytest.approx(0.5)
    correction.observe(100.0, 100.0, True)
    assert correction.strength == 0.0


def test_interrupted_or_missing_evidence_does_not_accumulate():
    correction = Correction(False, 0.0)
    correction.observe(10.0, 10.0, True)
    correction.observe(20.0, 20.0, False)
    correction.observe(40.0, 40.0, True)
    correction.observe(500.0, 500.0, True)
    assert correction.strength == 1.0


def test_room_hold_expires_but_carrying_does_not():
    room = Correction("kitchen", 0.0)
    carrying = Correction(False, 0.0)
    assert room.weight(900.0) == 1.0
    assert room.weight(960.0) == 0.5
    assert room.weight(1020.0) == 0.0
    assert carrying.weight(100000.0) == 1.0


def test_restore_preserves_strength_but_discards_partial_support():
    correction = Correction(False, 0.0, anchor="kitchen")
    for t in (10.0, 20.0, 40.0, 70.0):
        correction.observe(t, t, True)
    restored = Correction.restore(correction.snapshot(), {"kitchen"})
    assert restored is not None
    assert restored.strength == correction.strength
    restored.observe(80.0, 80.0, True)
    assert restored.strength == 0.5


def test_not_carried_correction_survives_conflicting_room_evidence(topo):
    watch = device(topo)
    est = person(topo, {"watch": watch})
    est.correct_carried("watch", False, 0.0)
    est.locate("dining_room", t=0.0)
    for t in range(1, 301):
        out = est.update(PersonObservation(t=float(t), devices={"watch": frame("kitchen")}))
    assert out.room == "dining_room"
    assert out.carried["watch"] == 0.0
    assert est.belief.sum() == pytest.approx(1.0)


def test_device_correction_holds_without_new_source_samples(topo):
    est = device(topo)
    est.locate("dining_room", 0.0)
    from custom_components.activity_levels.presence.observation import Observation

    for t in range(1, 100):
        out = est.update(Observation(t=float(t), distances=near("kitchen")))
    assert out.room == "dining_room"


def test_fresh_route_movement_releases_parked_watch(topo):
    watch = device(topo)
    est = person(topo, {"watch": watch})
    watch.locate("kitchen", 0.0)
    est.correct_carried("watch", False, 0.0)
    for t in (10.0, 20.0, 40.0, 70.0, 100.0):
        est.update(
            PersonObservation(
                t=t,
                devices={
                    "watch": DeviceFrame(
                        distances=near("dining_room"),
                        distance_t=t,
                    )
                },
            )
        )
    assert est.carrying_corrections["watch"].strength == 0.0


def test_reverse_one_way_or_distant_jump_does_not_release(topo):
    watch = device(topo)
    est = person(topo, {"watch": watch})
    watch.locate("bedroom", 0.0)
    est.correct_carried("watch", False, 0.0)
    for t in range(10, 301, 10):
        est.update(
            PersonObservation(
                t=float(t),
                devices={
                    "watch": DeviceFrame(
                        distances=near("hall"),
                        distance_t=float(t),
                    )
                },
            )
        )
    assert est.carrying_corrections["watch"].strength == 1.0


def test_person_hold_cannot_be_released_by_adjacent_radio_readings_alone(topo):
    phone = device(topo)
    est = person(topo, {"phone": phone}, prior=0.99)
    est.locate("dining_room", t=0.0)
    for t in range(10, 301, 10):
        out = est.update(
            PersonObservation(
                t=float(t),
                devices={
                    "phone": DeviceFrame(
                        distances=near("kitchen"),
                        distance_t=float(t),
                    )
                },
            )
        )
    assert out.room == "dining_room"
    assert est.correction.strength == 1.0


def test_correction_requires_a_change_from_its_radio_baseline(topo):
    correction = Correction(False, 0.0, anchor="kitchen", baseline=near("dining_room"))
    for t in range(10, 301, 10):
        support = correction.route(
            topo, "dining_room", 0.9, {}, float(t), float(t), near("dining_room")
        )
        correction.observe(float(t), float(t), support)
    assert correction.strength == 1.0


def test_sensor_pickup_works_without_a_room_change_and_stale_sensor_does_not(topo):
    from custom_components.activity_levels.presence.carried import Signals

    for fresh in (True, False):
        est = person(topo, {"watch": device(topo)})
        est.correct_carried("watch", False, 0.0)
        for t in (10.0, 20.0, 40.0, 70.0, 100.0):
            est.update(
                PersonObservation(
                    t=t,
                    devices={
                        "watch": DeviceFrame(
                            distances=near("kitchen"),
                            signals=Signals(moving=True),
                            moving_t=t if fresh else 1.0,
                        )
                    },
                )
            )
        assert est.carrying_corrections["watch"].strength == (0.0 if fresh else 1.0)


def test_filter_restore_keeps_assertions_and_rejects_removed_rooms(topo):
    est = person(topo, {"watch": device(topo)})
    est.locate("hall", t=0.0)
    est.correct_carried("watch", False, 0.0)
    restored = person(topo, {"watch": device(topo)})
    assert restored.restore(est.snapshot())
    out = restored.update(PersonObservation(t=300.0, devices={"watch": frame("kitchen")}))
    assert out.room == "hall" and out.carried["watch"] == 0.0
    assert (
        Correction.restore({"value": "missing", "t": 0.0, "strength": 1.0}, set(topo.states))
        is None
    )


def test_person_hold_yields_to_fresh_motion_and_carried_device(topo):
    from custom_components.activity_levels.presence.carried import Signals

    est = person(topo, {"phone": device(topo)}, prior=0.99)
    est.locate("dining_room", t=0.0)
    est.correct_carried("phone", True, 0.0)
    for t in (10.0, 20.0, 40.0, 70.0, 100.0):
        est.update(
            PersonObservation(
                t=t,
                devices={
                    "phone": DeviceFrame(
                        distances=near("kitchen"),
                        distance_t=t,
                        moving_t=t,
                        signals=Signals(moving=True),
                    )
                },
            )
        )
    assert est.correction.strength == 0.0


def test_route_motion_must_follow_path_order(topo):
    from custom_components.activity_levels.presence.corrections import route_support
    from custom_components.activity_levels.presence.observation import RoomActivity

    activity = {
        "dining_room": RoomActivity(1.0, 0.0, observed_at=60.0),
        "hall": RoomActivity(1.0, 0.0, observed_at=30.0),
    }
    assert not route_support(topo, "kitchen", "bedroom", 0.9, activity, 100.0, 0.0)
    activity["hall"] = RoomActivity(1.0, 0.0, observed_at=90.0)
    assert route_support(topo, "kitchen", "bedroom", 0.9, activity, 100.0, 0.0)


def test_a_parked_device_can_recover_after_being_unavailable_at_correction(topo):
    correction = Correction(False, 0.0, anchor="away", baseline={"s_kitchen": None})
    assert not correction.route(topo, "kitchen", 0.9, {}, 10.0, 10.0, near("kitchen"))
    assert correction.anchor == "kitchen"
    for t in (20.0, 30.0, 50.0, 80.0, 110.0):
        support = correction.route(topo, "dining_room", 0.9, {}, t, t, near("dining_room"))
        correction.observe(t, t, support)
    assert correction.strength == 0.0
