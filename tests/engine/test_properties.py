from hypothesis import given, settings
from hypothesis import strategies as st

from custom_components.activity_levels.engine import (
    Channel,
    Envelope,
    Group,
    Mix,
    RetriggerWhen,
    Voice,
)
from custom_components.activity_levels.engine.group import _MIN_DT as MIN_DT

durations = st.floats(min_value=0.0, max_value=3600.0, allow_nan=False, allow_infinity=False)
positive_durations = st.floats(
    min_value=1.0, max_value=3600.0, allow_nan=False, allow_infinity=False
)
gains = st.floats(min_value=0.1, max_value=10.0, allow_nan=False, allow_infinity=False)
# A ceiling is always >= gain; 1.0 exercises the "no headroom at all" edge.
headrooms = st.floats(min_value=1.0, max_value=8.0, allow_nan=False, allow_infinity=False)
fractions = st.floats(min_value=0.0, max_value=1.0, allow_nan=False, allow_infinity=False)
# Sustain is a multiplier on the peak, not a fraction of it: above 1 the decay
# segment climbs, and the invariants below have to hold over that half too.
sustains = st.floats(min_value=0.0, max_value=4.0, allow_nan=False, allow_infinity=False)
# Real deployments run at epoch scale, where a float has ~2.4e-7 s of resolution.
# Exercise both that and the tidy 0.0 base so precision bugs cannot hide.
time_bases = st.sampled_from([0.0, 1.7e9])
offsets = st.floats(min_value=0.0, max_value=100_000.0, allow_nan=False, allow_infinity=False)
times = st.builds(lambda base, off: base + off, time_bases, offsets)


@st.composite
def envelopes(draw: st.DrawFn) -> Envelope:
    return Envelope(
        attack=draw(durations),
        decay=draw(durations),
        sustain=draw(sustains),
        release=draw(durations),
        impulse=draw(st.booleans()),
        retrigger=draw(st.sampled_from(list(RetriggerWhen))),
        stack=draw(st.booleans()),
        debounce=draw(st.floats(min_value=0.0, max_value=60.0)),
    )


@st.composite
def smooth_envelopes(draw: st.DrawFn) -> Envelope:
    return Envelope(
        attack=draw(positive_durations),
        decay=draw(positive_durations),
        sustain=draw(sustains),
        release=draw(positive_durations),
        impulse=draw(st.booleans()),
        retrigger=draw(st.sampled_from(list(RetriggerWhen))),
        stack=draw(st.booleans()),
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


# The ceiling is the voice's hard upper bound: both of the ways a voice can climb past
# `gain` -- stacking, and a sustain above 1 -- are capped at the group's limiter.
@settings(max_examples=300)
@given(envelopes(), gains, headrooms, scripts())
def test_value_never_exceeds_the_ceiling(
    env: Envelope, gain: float, headroom: float, script: list[tuple[str, float]]
) -> None:
    ceiling = gain * headroom
    v = Voice(id="v", gain=gain, envelope=env, ceiling=ceiling)
    for value in run(v, script):
        assert -1e-9 <= value <= ceiling + 1e-9
    # Uncapped and not stacking, the peak is whichever of the attack's target and the
    # decay's target is higher -- `gain` and `sustain * gain`.
    if not env.stack:
        peak = max(gain, env.sustain * gain)
        w = Voice(id="w", gain=gain, envelope=env)
        for value in run(w, script):
            assert -1e-9 <= value <= peak + 1e-9


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


# The scheduler's whole job: between one wake and the next, the displayed value must
# not move. Anything else is a stale sensor until the following wake.
@settings(max_examples=150, deadline=None)
@given(
    st.lists(st.tuples(st.one_of(smooth_envelopes(), envelopes()), gains), min_size=1, max_size=4),
    st.sampled_from(list(Mix)),
    st.integers(min_value=0, max_value=2),
    st.floats(min_value=0.2, max_value=4.0, allow_nan=False, allow_infinity=False),
    time_bases,
    st.floats(min_value=0.0, max_value=600.0, allow_nan=False, allow_infinity=False),
)
def test_display_value_is_stable_until_the_next_display_change(
    specs: list[tuple[Envelope, float]],
    mix: Mix,
    precision: int,
    max_value: float,
    t0: float,
    off: float,
) -> None:
    voices = [Voice(id=f"v{i}", gain=g, envelope=e) for i, (e, g) in enumerate(specs)]
    g = Group(
        id="g",
        channels=[Channel(v) for v in voices],
        mix=mix,
        max_value=max_value,
        precision=precision,
    )
    for v in voices:
        v.note_on(t0)
    # Queries mutate, so t must never go backwards: fire, then release, then walk.
    for v in voices:
        if v.gate:
            v.note_off(t0 + off)

    t = t0 + off
    horizon = t + 7200.0
    for wake in range(501):
        assert wake < 500, "next_display_change is not making progress"
        if t >= horizon:
            break
        nxt = g.next_display_change(t)
        if nxt is None:
            nxt = horizon
        assert nxt >= t
        if nxt != horizon:
            assert nxt > t
        # A wake is aimed 1 ms *past* the threshold it targets, so the window that
        # must be stable ends a millisecond short of it. Over that window the
        # displayed value has to be exactly constant -- one changed sample is a
        # sensor reading stale until the following wake.
        probe = max(nxt - t - MIN_DT, 0.0)
        threshold = t + probe
        base = g.display_value_at(t)
        for i in range(1, 40):
            sample_t = t + probe * i / 40
            if sample_t >= threshold:
                continue  # window thinner than a float ulp: the grid collapsed onto it
            assert g.display_value_at(sample_t) == base
        t = nxt
