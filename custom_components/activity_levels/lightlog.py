"""Light transition log: an HA-side Store-backed history of on/off changes.

Bridges the ``homeassistant.core.State`` objects a coordinator observes into the
pure :class:`~.patterns.model.LightTransition` records the learner consumes, and
backs the log with the recorder's own significant-states history on first setup.
Also resolves which light entities belong to a group, from the entity/device
registries plus the group's ``include``/``exclude`` lists.
"""

from __future__ import annotations

from bisect import insort
from collections.abc import Iterable
from datetime import datetime
from functools import partial
from typing import Any

from homeassistant.components.recorder.history import get_significant_states
from homeassistant.core import HomeAssistant, State, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.recorder import get_instance
from homeassistant.helpers.storage import Store

from .patterns.model import LightTransition

STORAGE_VERSION = 1
_SAVE_DELAY = 10.0
_SECONDS_PER_DAY = 86400

_Row = tuple[float, str, bool, int | None]


def _storage_key(entry_id: str) -> str:
    return f"activity_levels.lights.{entry_id}"


def _brightness_of(state: State | None) -> int | None:
    if state is None:
        return None
    value = state.attributes.get("brightness")
    if isinstance(value, int) and not isinstance(value, bool):
        return value
    return None


def resolve_group_lights(
    hass: HomeAssistant,
    area_id: str | None,
    include: list[str],
    exclude: list[str],
) -> list[str]:
    """Resolve one group's light entities from the registries plus include/exclude.

    A light belongs to ``area_id`` when its own entity-registry area matches, or
    when it has no entity-level area and its device's area matches. Disabled
    entities are skipped. The final membership is ``area lights`` union
    ``include`` minus ``exclude``, sorted and unique.
    """
    lights: set[str] = set()
    if area_id is not None:
        entities = er.async_get(hass)
        devices = dr.async_get(hass)
        for entry in entities.entities.values():
            if entry.domain != "light" or entry.disabled:
                continue
            entity_area = entry.area_id
            if entity_area is None and entry.device_id is not None:
                device = devices.async_get(entry.device_id)
                entity_area = device.area_id if device else None
            if entity_area == area_id:
                lights.add(entry.entity_id)
    lights |= set(include)
    lights -= set(exclude)
    return sorted(lights)


class LightLog:
    """Store-backed on/off transition log for one config entry's lights."""

    def __init__(self, hass: HomeAssistant, entry_id: str, history_days: int) -> None:
        self.hass = hass
        self.entry_id = entry_id
        self.history_days = history_days
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, _storage_key(entry_id))
        self._rows: list[_Row] = []
        self._last_on: dict[str, bool] = {}

    async def async_load(self) -> None:
        """Load the store, if any, and reconstruct the per-entity last-state index."""
        stored = await self._store.async_load()
        rows: list[_Row] = []
        if stored:
            for t, entity_id, on, brightness in stored.get("rows", []):
                rows.append((float(t), str(entity_id), bool(on), brightness))
        rows.sort(key=lambda row: row[0])
        self._rows = rows
        self._reindex()

    def _reindex(self) -> None:
        self._last_on = {}
        for _t, entity_id, on, _brightness in self._rows:
            self._last_on[entity_id] = on

    @callback
    def record(self, entity_id: str, state: State | None, t: float) -> None:
        """Append a transition when ``entity_id``'s on/off state changed.

        The first observation of an entity is always recorded, whatever its value,
        so an entity that starts off still has a starting point in the log.
        """
        on = state is not None and state.state == "on"
        if entity_id in self._last_on and self._last_on[entity_id] == on:
            return
        insort(self._rows, (t, entity_id, on, _brightness_of(state)), key=lambda row: row[0])
        self._last_on[entity_id] = on
        self._store.async_delay_save(self._data, _SAVE_DELAY)

    def transitions(
        self, entity_ids: Iterable[str], start: float, end: float
    ) -> list[LightTransition]:
        """Transitions for ``entity_ids`` within ``[start, end)``, sorted by time."""
        wanted = set(entity_ids)
        return [
            LightTransition(t=t, entity_id=entity_id, on=on, brightness=brightness)
            for t, entity_id, on, brightness in self._rows
            if entity_id in wanted and start <= t < end
        ]

    def prune(self, now: float) -> None:
        """Drop rows older than ``history_days`` before ``now``."""
        cutoff = now - self.history_days * _SECONDS_PER_DAY
        kept = [row for row in self._rows if row[0] >= cutoff]
        if len(kept) != len(self._rows):
            self._rows = kept
            self._reindex()
            self._store.async_delay_save(self._data, _SAVE_DELAY)

    async def async_backfill(self, entity_ids: list[str], since: datetime) -> int:
        """Back-fill transitions for ``entity_ids`` from the recorder's history.

        Returns the number of rows added; existing rows are never duplicated.
        """
        if not entity_ids:
            return 0
        instance = get_instance(self.hass)
        job = partial(
            get_significant_states, self.hass, since, None, entity_ids, minimal_response=False
        )
        history = await instance.async_add_executor_job(job)

        existing = {(t, entity_id) for t, entity_id, _on, _brightness in self._rows}
        added = 0
        for states in history.values():
            last_on: bool | None = None
            for state in states:
                if not isinstance(state, State):
                    continue
                on = state.state == "on"
                if last_on is None or last_on != on:
                    t = state.last_changed.timestamp()
                    key = (t, state.entity_id)
                    if key not in existing:
                        insort(
                            self._rows,
                            (t, state.entity_id, on, _brightness_of(state)),
                            key=lambda row: row[0],
                        )
                        existing.add(key)
                        added += 1
                last_on = on

        if added:
            self._reindex()
            self._store.async_delay_save(self._data, _SAVE_DELAY)
        return added

    def _data(self) -> dict[str, Any]:
        return {"version": STORAGE_VERSION, "rows": [list(row) for row in self._rows]}

    async def async_save(self) -> None:
        """Flush the log to storage immediately."""
        await self._store.async_save(self._data())
