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
