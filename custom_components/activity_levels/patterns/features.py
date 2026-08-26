"""Design matrix for the built-in activity model.

Pure numpy; no ``homeassistant`` imports. Columns, in order:

1. intercept,
2. linear trend (days since the first timestamp, scaled by 365),
3. daily Fourier terms ``sin/cos(2*pi*k*hour/24)`` for k = 1..4 (8 columns),
4. weekly Fourier terms ``sin/cos(2*pi*k*week_hour/168)`` for k = 1..3 (6 columns),
5. day-type one-hots for indices 1..n-1 (index 0 is the base, ``weekday``),
6. interactions of each one-hot with each daily Fourier term.
"""

from __future__ import annotations

from datetime import datetime, tzinfo

import numpy as np
import numpy.typing as npt

DAILY_HARMONICS = 4
WEEKLY_HARMONICS = 3
BASE_COLUMNS = 2 + 2 * DAILY_HARMONICS + 2 * WEEKLY_HARMONICS


def n_columns(n_day_types: int) -> int:
    """Number of design-matrix columns for ``n_day_types`` day types."""
    extra = max(n_day_types - 1, 0)
    return BASE_COLUMNS + extra * (1 + 2 * DAILY_HARMONICS)


def _local_parts(
    ts: npt.NDArray[np.float64], tz: tzinfo
) -> tuple[npt.NDArray[np.float64], npt.NDArray[np.float64]]:
    """Return the local fractional hour-of-day and weekday for each timestamp."""
    hours = np.empty(ts.shape[0], dtype=np.float64)
    weekdays = np.empty(ts.shape[0], dtype=np.float64)
    for i, t in enumerate(ts):
        local = datetime.fromtimestamp(float(t), tz)
        hours[i] = local.hour + local.minute / 60.0 + local.second / 3600.0
        weekdays[i] = float(local.weekday())
    return hours, weekdays


def design_matrix(
    ts: npt.NDArray[np.float64],
    day_type_idx: npt.NDArray[np.int64],
    n_day_types: int,
    tz: tzinfo,
    *,
    t0: float | None = None,
) -> npt.NDArray[np.float64]:
    """Build the regression design matrix for ``ts``.

    ``t0`` pins the trend origin; it defaults to the first timestamp. Pass the
    training origin when evaluating the model on a synthetic grid so the trend
    column stays on the same scale as during the fit.
    """
    times = np.asarray(ts, dtype=np.float64)
    idx = np.asarray(day_type_idx, dtype=np.int64)
    rows = times.shape[0]
    if rows == 0:
        return np.zeros((0, n_columns(n_day_types)), dtype=np.float64)

    origin = float(times[0]) if t0 is None else float(t0)
    hours, weekdays = _local_parts(times, tz)

    columns: list[npt.NDArray[np.float64]] = [
        np.ones(rows, dtype=np.float64),
        (times - origin) / 86400.0 / 365.0,
    ]
    daily: list[npt.NDArray[np.float64]] = []
    for k in range(1, DAILY_HARMONICS + 1):
        angle = 2.0 * np.pi * k * hours / 24.0
        daily.append(np.sin(angle))
        daily.append(np.cos(angle))
    columns.extend(daily)

    week_hour = weekdays * 24.0 + hours
    for k in range(1, WEEKLY_HARMONICS + 1):
        angle = 2.0 * np.pi * k * week_hour / 168.0
        columns.append(np.sin(angle))
        columns.append(np.cos(angle))

    onehots = [(idx == j).astype(np.float64) for j in range(1, n_day_types)]
    columns.extend(onehots)
    for onehot in onehots:
        columns.extend(onehot * term for term in daily)

    return np.column_stack(columns)
