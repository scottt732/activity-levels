"""Room signatures: what each scanner reads when a person is in each room, learned.

The fixed emission formula knows one thing -- close is good -- and cannot know that
the theater scanner reads three metres from the couch and one from the door, or that
the hall scanner never hears anybody in the bedroom. A *signature* is that knowledge
for one ``(room, scanner)`` pair: a log-normal over the distance, and how often the
scanner heard the device there at all. They are fitted from the corrections people
make, and the estimator uses one wherever it has one and the formula everywhere else.

The document this writes is producer-agnostic on purpose: anything that can fit these
numbers -- this module, an add-on, a service somewhere -- may replace it, and the
integration only ever reads the shape. Pure numpy; no ``homeassistant``.
"""

from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

import numpy as np

DOC_VERSION = 1
MIN_SIGMA = 0.15
"""The narrowest a signature may get, in log-distance: below this a reading a few
centimetres off would rule a room out, and a radio is never that repeatable."""
PRIOR_SIGMA = 0.7
"""How wide the prior is: a factor of two either way, roughly."""


@dataclass(frozen=True)
class Signature:
    """One ``(room, scanner)`` pair: ``log d ~ N(mu, sigma)`` when heard, heard ``heard``
    of the time, from ``n`` labels."""

    mu: float
    sigma: float
    heard: float
    n: int

    def log_likelihood(self, distance: float | None) -> float:
        """log P(reading | the person is in this room), for a reading or for silence."""
        if distance is None:
            return math.log(max(1.0 - self.heard, 1e-6))
        z = (math.log(max(distance, 1e-3)) - self.mu) / self.sigma
        return (
            math.log(max(self.heard, 1e-6))
            - math.log(self.sigma * math.sqrt(2.0 * math.pi))
            - 0.5 * z * z
        )


Signatures = dict[str, dict[str, Signature]]
"""``room -> scanner -> Signature``."""


def _prior(scanner_room: str, room: str, scale: float) -> tuple[float, float]:
    """``(mu0, heard0)``: what the fixed formula implies before any label.

    A scanner in its own room reads about half the scale away and nearly always hears
    you; one in another room reads a couple of scales away and hears you half the time.
    The numbers are deliberately soft -- their job is to stop eight labels from fitting
    a signature that is all noise, not to be right.
    """
    if scanner_room == room:
        return math.log(scale / 2.0), 0.9
    return math.log(2.0 * scale), 0.5


def fit(
    labels: Sequence[Mapping[str, Any]],
    *,
    scanner_map: Mapping[str, str],
    scale: float,
    min_labels: int,
    prior_weight: float,
    min_carried: float = 0.5,
) -> Signatures:
    """Fit a signature for every ``(room, scanner)`` pair with enough labels.

    A label counts for a device only when the device was probably on the person at
    the time (``carried >= min_carried``): a phone left on the couch says where the
    couch is, not where the person was. Scanners the map does not know are skipped.
    The prior enters as ``prior_weight`` pseudo-labels at the formula's implied
    values, so a pair with few labels sits near the formula and a pair with many is
    all data.
    """
    readings: dict[tuple[str, str], list[float | None]] = {}
    for item in labels:
        room = item.get("room")
        frames = item.get("frames")
        carried = item.get("carried") or {}
        if not isinstance(room, str) or not isinstance(frames, Mapping):
            continue
        for device, frame in frames.items():
            if float(carried.get(device, 0.0)) < min_carried or not isinstance(frame, Mapping):
                continue
            for scanner, distance in (frame.get("distances") or {}).items():
                if scanner not in scanner_map:
                    continue
                value = float(distance) if isinstance(distance, int | float) else None
                readings.setdefault((room, scanner), []).append(value)

    out: Signatures = {}
    for (room, scanner), values in readings.items():
        n = len(values)
        if n < min_labels:
            continue
        mu0, heard0 = _prior(scanner_map[scanner], room, scale)
        heard_count = sum(1 for v in values if v is not None)
        heard = (heard_count + prior_weight * heard0) / (n + prior_weight)
        logs = np.log(
            np.maximum(np.array([v for v in values if v is not None], dtype=np.float64), 1e-3)
        )
        if logs.size:
            mean = float(logs.mean())
            mu = (logs.size * mean + prior_weight * mu0) / (logs.size + prior_weight)
            spread = float(((logs - mu) ** 2).sum())
            sigma = math.sqrt((spread + prior_weight * PRIOR_SIGMA**2) / (logs.size + prior_weight))
        else:
            mu, sigma = mu0, PRIOR_SIGMA
        out.setdefault(room, {})[scanner] = Signature(
            mu=mu, sigma=max(sigma, MIN_SIGMA), heard=heard, n=n
        )
    return out


def to_document(
    signatures: Signatures,
    *,
    producer: Mapping[str, str],
    built_at: float,
    labels_used: int,
) -> dict[str, Any]:
    """The versioned document the store holds and any producer may write."""
    return {
        "version": DOC_VERSION,
        "producer": dict(producer),
        "built_at": built_at,
        "labels_used": labels_used,
        "signatures": {
            room: {
                scanner: {"mu": s.mu, "sigma": s.sigma, "heard": s.heard, "n": s.n}
                for scanner, s in scanners.items()
            }
            for room, scanners in signatures.items()
        },
    }


def from_document(doc: Any) -> Signatures:
    """Read a document back, or ``{}`` for anything that is not one.

    A refusal rather than an exception: the store may hold a version this code does
    not know, or something another producer wrote badly, and a bad document must not
    take the presence side down -- it just means no signatures until it is fixed.
    """
    if not isinstance(doc, Mapping) or doc.get("version") != DOC_VERSION:
        return {}
    raw = doc.get("signatures")
    if not isinstance(raw, Mapping):
        return {}
    out: Signatures = {}
    for room, scanners in raw.items():
        if not isinstance(room, str) or not isinstance(scanners, Mapping):
            return {}
        for scanner, values in scanners.items():
            if not isinstance(scanner, str) or not isinstance(values, Mapping):
                return {}
            try:
                signature = Signature(
                    mu=float(values["mu"]),
                    sigma=max(float(values["sigma"]), MIN_SIGMA),
                    heard=min(max(float(values["heard"]), 0.0), 1.0),
                    n=int(values["n"]),
                )
            except KeyError, TypeError, ValueError:
                return {}
            if not all(math.isfinite(x) for x in (signature.mu, signature.sigma, signature.heard)):
                return {}
            out.setdefault(room, {})[scanner] = signature
    return out
