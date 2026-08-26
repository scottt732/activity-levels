import json

import pytest

from custom_components.activity_levels.engine import Envelope, Phase, Voice


def test_snapshot_round_trip_preserves_position() -> None:
    v = Voice(id="x", gain=2.0, envelope=Envelope(attack=10.0, release=100.0))
    v.note_on(0.0)
    v.note_off(10.0)
    v.value_at(30.0)
    data = json.loads(json.dumps(v.snapshot()))
    w = Voice(id="x", gain=2.0, envelope=Envelope(attack=10.0, release=100.0))
    w.restore(data)
    assert w.phase is Phase.RELEASE
    assert w.gate is False
    assert w.last_note_on == 0.0
    assert w.value_at(60.0) == pytest.approx(v.value_at(60.0))
    assert w.next_boundary(60.0) == pytest.approx(v.next_boundary(60.0))


def test_snapshot_of_gated_voice_restores_gate() -> None:
    v = Voice(id="x", gain=1.0, envelope=Envelope())
    v.note_on(5.0)
    w = Voice(id="x", gain=1.0, envelope=Envelope())
    w.restore(v.snapshot())
    assert w.gate is True
    assert w.phase is Phase.SUSTAIN
    assert w.value_at(1000.0) == pytest.approx(1.0)


def test_restore_clamps_value_to_new_gain() -> None:
    v = Voice(id="x", gain=5.0, envelope=Envelope(release=100.0))
    v.note_on(0.0)
    v.note_off(0.0)
    w = Voice(id="x", gain=1.0, envelope=Envelope(release=100.0))
    w.restore(v.snapshot())
    assert w.value_at(0.0) == pytest.approx(1.0)


@pytest.mark.parametrize(
    "bad",
    [{}, {"phase": "bogus"}, {"phase": "release", "phase_start_t": "nope"}],
)
def test_restore_with_garbage_resets_to_idle(bad: dict[str, object]) -> None:
    w = Voice(id="x", gain=1.0, envelope=Envelope())
    w.note_on(0.0)
    w.restore(bad)
    assert w.phase is Phase.IDLE
    assert w.gate is False


def test_restore_ungated_sustain_becomes_release() -> None:
    # A snapshot claiming "sustaining but not gated" is impossible: nothing would
    # ever end the note. Fall back to releasing from where the value was.
    w = Voice(id="x", gain=2.0, envelope=Envelope(release=100.0))
    w.restore({"phase": "sustain", "phase_start_t": 10.0, "phase_start_value": 2.0, "gate": False})
    assert w.phase is Phase.RELEASE
    assert w.gate is False
    assert w.value_at(10.0) == pytest.approx(2.0)
    assert w.next_boundary(10.0) == pytest.approx(110.0)
    # a zero-valued ungated attack has nothing to release: it is simply idle
    w.restore({"phase": "attack", "phase_start_t": 10.0, "phase_start_value": 0.0, "gate": False})
    assert w.phase is Phase.IDLE


def test_restore_gated_release_is_held_at_sustain() -> None:
    # A gated voice must be held; a gated RELEASE would decay under a live gate.
    w = Voice(id="x", gain=2.0, envelope=Envelope(release=100.0))
    w.restore({"phase": "release", "phase_start_t": 10.0, "phase_start_value": 1.5, "gate": True})
    assert w.phase is Phase.SUSTAIN
    assert w.gate is True
    assert w.value_at(10_000.0) == pytest.approx(1.5)


@pytest.mark.parametrize("bad_gate", [1, "true", 0, None, 1.0])
def test_restore_with_non_bool_gate_resets(bad_gate: object) -> None:
    w = Voice(id="x", gain=1.0, envelope=Envelope())
    w.note_on(0.0)
    w.restore(
        {
            "phase": "sustain",
            "phase_start_t": 1.0,
            "phase_start_value": 1.0,
            "gate": bad_gate,
        }
    )
    assert w.phase is Phase.IDLE
    assert w.gate is False


def test_restore_gated_idle_with_zero_value_resets() -> None:
    w = Voice(id="x", gain=1.0, envelope=Envelope())
    w.restore({"phase": "idle", "phase_start_t": 10.0, "phase_start_value": 0.0, "gate": True})
    assert w.phase is Phase.IDLE
    assert w.gate is False
    assert w.is_active(11.0) is False
