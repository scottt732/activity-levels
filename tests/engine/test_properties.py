from hypothesis import given, settings
from hypothesis import strategies as st

from custom_components.activity_levels.engine import (
    Channel,
    Envelope,
    Group,
    Mix,
    Retrigger,
    Voice,
)

durations = st.floats(min_value=0.0, max_value=3600.0, allow_nan=False, allow_infinity=False)
positive_durations = st.floats(
    min_value=1.0, max_value=3600.0, allow_nan=False, allow_infinity=False
)
gains = st.floats(min_value=0.1, max_value=10.0, allow_nan=False, allow_infinity=False)
fractions = st.floats(min_value=0.0, max_value=1.0, allow_nan=False, allow_infinity=False)
times = st.floats(min_value=0.0, max_value=100_000.0, allow_nan=False, allow_infinity=False)


@st.composite
def envelopes(draw: st.DrawFn) -> Envelope:
    return Envelope(
        attack=draw(durations),
        decay=draw(durations),
        sustain=draw(fractions),
        release=draw(durations),
        impulse=draw(st.booleans()),
        retrigger=draw(st.sampled_from(list(Retrigger))),
        debounce=draw(st.floats(min_value=0.0, max_value=60.0)),
    )


@st.composite
def smooth_envelopes(draw: st.DrawFn) -> Envelope:
    return Envelope(
        attack=draw(positive_durations),
        decay=draw(positive_durations),
        sustain=draw(fractions),
        release=draw(positive_durations),
        impulse=draw(st.booleans()),
        retrigger=draw(st.sampled_from(list(Retrigger))),
        debounce=draw(st.floats(min_value=0.0, max_value=60.0)),
    )


@st.composite
def scripts(draw: st.DrawFn) -> list[tuple[str, float]]:
    """A sorted sequence of (event, t) with events in {on, off, query}."""
    n = draw(st.integers(min_value=1, max_value=12))
    ts = sorted(draw(st.lists(times, min_size=n, max_size=n)))
    events = draw(st.lists(st.sampled_from(["on", "off", "query"]), min_size=n, max_size=n))
    return list(zip(events, ts, strict=True))


def run(v: Voice, script: list[tuple[str, float]]) -> list[float]:
    values: list[float] = []
    for event, t in script:
        if event == "on":
            v.note_on(t)
        elif event == "off":
            v.note_off(t)
        values.append(v.value_at(t))
    return values


@settings(max_examples=300)
@given(envelopes(), gains, scripts())
def test_value_always_within_zero_and_gain(
    env: Envelope, gain: float, script: list[tuple[str, float]]
) -> None:
    v = Voice(id="v", gain=gain, envelope=env)
    for value in run(v, script):
        assert -1e-9 <= value <= gain + 1e-9


@settings(max_examples=300)
@given(envelopes(), gains, scripts(), times)
def test_next_boundary_is_never_in_the_past(
    env: Envelope, gain: float, script: list[tuple[str, float]], extra: float
) -> None:
    v = Voice(id="v", gain=gain, envelope=env)
    run(v, script)
    t = script[-1][1] + extra
    b = v.next_boundary(t)
    assert b is None or b >= t


# Continuity holds across positive-duration segments; zero-length segments jump by design.
@settings(max_examples=200)
@given(smooth_envelopes(), gains, times)
def test_value_is_continuous_across_boundaries(env: Envelope, gain: float, t0: float) -> None:
    v = Voice(id="v", gain=gain, envelope=env)
    v.note_on(t0)
    t = t0
    for _ in range(4):
        b = v.next_boundary(t)
        if b is None:
            break
        before = v.value_at(max(t, b - 1e-6))
        after = v.value_at(b + 1e-6)
        assert abs(before - after) < 1e-3
        t = b + 1e-6
    v.note_off(t)
    b = v.next_boundary(t)
    if b is not None:
        assert abs(v.value_at(b - 1e-6) - v.value_at(b + 1e-6)) < 1e-3


@settings(max_examples=200)
@given(
    st.lists(st.tuples(envelopes(), gains), min_size=1, max_size=5),
    st.sampled_from(list(Mix)),
    gains,
    times,
)
def test_group_value_within_limits(
    specs: list[tuple[Envelope, float]], mix: Mix, max_value: float, t: float
) -> None:
    voices = [Voice(id=f"v{i}", gain=g, envelope=e) for i, (e, g) in enumerate(specs)]
    g = Group(id="g", channels=[Channel(v) for v in voices], mix=mix, max_value=max_value)
    for v in voices:
        v.note_on(0.0)
    assert 0.0 <= g.value_at(t) <= max_value + 1e-9
    nb = g.next_display_change(t)
    assert nb is None or nb >= t - 1e-9
