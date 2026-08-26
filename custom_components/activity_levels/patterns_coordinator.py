"""The patterns coordinator: profile store, nightly rebuild, expected/anomaly reads.

This is the integration-side half of :mod:`.patterns`: it gathers the data the pure
learner needs (long-term statistics, recorder history, calendars, the workday sensor),
runs the fit in the executor, keeps the resulting profile document in a
``Store``, and answers the questions the entities and the websocket API ask of it.
"""

from __future__ import annotations

import logging
import math
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta, tzinfo
from functools import partial
from typing import Any

from homeassistant.components.recorder.core import Recorder
from homeassistant.components.recorder.history import get_significant_states
from homeassistant.components.recorder.statistics import StatisticsRow, statistics_during_period
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import (
    CALLBACK_TYPE,
    CoreState,
    Event,
    EventStateChangedData,
    HomeAssistant,
    State,
    callback,
)
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.helpers.recorder import get_instance
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import CONF_DEFAULTS, CONF_PATTERNS, CONF_SIMULATION, DOMAIN
from .coordinator import ActivityLevelsCoordinator
from .lightlog import LightLog, resolve_group_lights
from .patterns.daytype import DayTypeInputs, resolve_day_type
from .patterns.model import (
    LightTransition,
    Sample,
    fit_group_expected,
    fit_light_profile,
)
from .patterns.profile import (
    DOC_VERSION,
    SLOT_MINUTES,
    VERSION,
    anomaly_score,
    empty_profile,
    expected_at,
    group_ready,
    slot_of,
    validate_profile,
)

_LOGGER = logging.getLogger(__name__)

PROFILE_STORAGE_VERSION = 1
BUILTIN_PRODUCER = "builtin"
SLOT_SECONDS = SLOT_MINUTES * 60
FIVE_MINUTES = 300.0
STALE_AFTER = 26 * 3600
"""A profile older than this at startup earns an immediate rebuild."""
START_DELAY = 60.0
"""How long after Home Assistant is up the catch-up rebuild waits."""
MAX_EVENT_DAYS = 800


def profile_storage_key(entry_id: str) -> str:
    return f"{DOMAIN}.profile.{entry_id}"


def statistic_id(group_id: str) -> str:
    """The long-term-statistics id of a group's activity level sensor."""
    return f"sensor.{group_id}_activity_level"


@dataclass(frozen=True)
class GroupInputs:
    """Everything the executor job needs for one group. No Home Assistant objects."""

    gid: str
    max_value: float
    samples: list[Sample] = field(default_factory=list)
    transitions: list[LightTransition] = field(default_factory=list)


def fit_groups(
    inputs: Sequence[GroupInputs],
    *,
    day_types: Sequence[str],
    day_type_of: Callable[[date], str],
    tz: tzinfo,
    min_days: int,
    window: tuple[float, float],
) -> dict[str, Any]:
    """Fit every group. Pure: this is the body of the one executor job per rebuild."""
    groups: dict[str, Any] = {}
    for item in inputs:
        block = fit_group_expected(
            item.samples,
            day_types=day_types,
            max_value=item.max_value,
            tz=tz,
            min_days=min_days,
        )
        if block is None:
            continue
        block["lights"] = fit_light_profile(
            item.transitions,
            window=window,
            day_type_of=day_type_of,
            day_types=day_types,
            tz=tz,
        )
        groups[item.gid] = block
    return groups


def _row_value(row: State | Mapping[str, Any]) -> tuple[str | None, float | None]:
    """Normalize one recorder history row to ``(state, epoch seconds)``.

    ``minimal_response`` hands back dicts for every row but the first, and the shape
    of the timestamp has changed between HA releases, so all three forms are accepted.
    """
    if isinstance(row, State):
        return row.state, row.last_changed.timestamp()
    value = row.get("state")
    when = row.get("last_changed", row.get("last_updated"))
    if isinstance(when, int | float):
        return value, float(when)
    if isinstance(when, str) and (parsed := dt_util.parse_datetime(when)) is not None:
        return value, parsed.timestamp()
    if isinstance(when, datetime):
        return value, when.timestamp()
    return value, None


def _as_local_date(value: Any) -> tuple[date | None, bool]:
    """Return ``(local date, end_is_exclusive)`` for one calendar event boundary."""
    if isinstance(value, datetime):
        local = dt_util.as_local(value)
        return local.date(), local.timetz().replace(tzinfo=None) == time(0, 0)
    if isinstance(value, date):
        return value, True  # an all-day event's end date is exclusive
    if not isinstance(value, str):
        return None, False
    if (parsed := dt_util.parse_datetime(value)) is not None:
        local = dt_util.as_local(parsed)
        return local.date(), local.time() == time(0, 0)
    return dt_util.parse_date(value), True


def _event_days(event: Mapping[str, Any]) -> list[str]:
    """The local dates an event covers, as ISO strings."""
    begin, _ = _as_local_date(event.get("start"))
    if begin is None:
        return []
    finish, exclusive = _as_local_date(event.get("end"))
    if finish is None:
        finish = begin
    elif exclusive:
        finish -= timedelta(days=1)
    days: list[str] = []
    day = begin
    while day <= finish and len(days) < MAX_EVENT_DAYS:
        days.append(day.isoformat())
        day += timedelta(days=1)
    return days


def _group_lights(hass: HomeAssistant, config: Mapping[str, Any]) -> dict[str, list[str]]:
    """Resolve every group's light membership from the registries and the config."""
    lights: dict[str, list[str]] = {}

    def walk(node: Mapping[str, Any]) -> None:
        simulation = node.get(CONF_SIMULATION) or {}
        configured = simulation.get("lights") or {}
        lights[node["id"]] = resolve_group_lights(
            hass,
            node.get("area"),
            list(configured.get("include") or []),
            list(configured.get("exclude") or []),
        )
        for child in node.get("children") or []:
            walk(child)

    for group in config.get("groups") or []:
        walk(group)
    return lights


class PatternsCoordinator:
    """Owns the learned profile for one config entry."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry[Any],
        coordinator: ActivityLevelsCoordinator,
        config: Mapping[str, Any],
    ) -> None:
        self.hass = hass
        self.entry = entry
        self.coordinator = coordinator
        patterns = config[CONF_DEFAULTS][CONF_PATTERNS]
        self.rebuild_time: str = patterns["rebuild_time"]
        self.history_days: int = patterns["history_days"]
        self.min_days: int = patterns["min_days"]
        self.day_types: list[str] = list(patterns["day_type_precedence"])
        self.profile: dict[str, Any] = empty_profile(day_types=self.day_types)
        self.lights = _group_lights(hass, config)
        self.lightlog = LightLog(hass, entry.entry_id, self.history_days)
        self._calendars: list[dict[str, str]] = list(patterns["calendars"])
        self._calendar_ids = {cal["id"] for cal in self._calendars}
        self._workday_entity: str | None = patterns["workday_entity"]
        self._store: Store[dict[str, Any]] = Store(
            hass, PROFILE_STORAGE_VERSION, profile_storage_key(entry.entry_id)
        )
        self._day_type_cache: dict[str, str] = {}
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._stopped = False

    # -- lifecycle -----------------------------------------------------------

    async def async_start(self) -> None:
        """Load what is stored, wire the timers up and catch up if the profile is old."""
        await self._load()
        await self.lightlog.async_load()

        entity_ids = sorted({e for lights in self.lights.values() for e in lights})
        if entity_ids:
            await self._backfill(entity_ids)
            self._record_current(entity_ids)
            self._unsubs.append(
                async_track_state_change_event(self.hass, entity_ids, self._handle_light_event)
            )

        hour, _, minute = self.rebuild_time.partition(":")
        self._unsubs.append(
            async_track_time_change(
                self.hass, self._nightly, hour=int(hour), minute=int(minute), second=0
            )
        )
        self._unsubs.append(
            async_track_time_change(
                self.hass, self._bucket_tick, minute=list(range(0, 60, SLOT_MINUTES)), second=0
            )
        )
        if self._is_stale():
            self._schedule_catch_up()

    async def async_stop(self) -> None:
        """Cancel every timer and flush the light log. Idempotent."""
        if self._stopped:
            return
        self._stopped = True
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._listeners.clear()
        await self.lightlog.async_save()

    async def _load(self) -> None:
        stored = await self._store.async_load()
        if not stored:
            return
        if doc := stored.get("profile"):
            try:
                self.profile = validate_profile(doc)
            except Exception as err:  # a stored document we can no longer read
                _LOGGER.warning("Discarding an unreadable stored profile: %s", err)
        cache = stored.get("day_type_cache")
        if isinstance(cache, dict):
            self._day_type_cache = {str(k): str(v) for k, v in cache.items()}

    async def _save(self) -> None:
        # the profile document is stored exactly as the schema defines it; the day-type
        # cache is our own bookkeeping and lives beside it, not inside it
        await self._store.async_save(
            {"profile": self.profile, "day_type_cache": self._day_type_cache}
        )

    def _is_stale(self) -> bool:
        if not self.profile.get("groups"):
            return True
        generated_at = float(self.profile.get("generated_at", 0.0))
        return dt_util.utcnow().timestamp() - generated_at > STALE_AFTER

    def _schedule_catch_up(self) -> None:
        if self.hass.state is CoreState.running:
            self._unsubs.append(async_call_later(self.hass, START_DELAY, self._catch_up))
            return

        @callback
        def on_started(_event: Event[Any]) -> None:
            if self._stopped:
                return
            self._unsubs.append(async_call_later(self.hass, START_DELAY, self._catch_up))

        self._unsubs.append(
            self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, on_started)
        )

    # -- timers --------------------------------------------------------------

    @callback
    def _catch_up(self, _now: datetime) -> None:
        self._queue_rebuild(force=False)

    @callback
    def _nightly(self, _now: datetime) -> None:
        self.lightlog.prune(dt_util.utcnow().timestamp())
        self._queue_rebuild(force=False)

    @callback
    def _bucket_tick(self, _now: datetime) -> None:
        self._notify()

    def _queue_rebuild(self, *, force: bool) -> None:
        if self._stopped:
            return
        self.entry.async_create_background_task(
            self.hass, self._rebuild_task(force=force), f"{DOMAIN}_rebuild_profile"
        )

    async def _rebuild_task(self, *, force: bool) -> None:
        try:
            await self.async_rebuild(force=force)
        except Exception:  # a background task must never take the entry down
            _LOGGER.exception("Rebuilding the activity profile failed")

    # -- listeners -----------------------------------------------------------

    @callback
    def async_add_listener(self, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(cb)

        def remove() -> None:
            if cb in self._listeners:  # tolerate a second call
                self._listeners.remove(cb)

        return remove

    @callback
    def _notify(self) -> None:
        for cb in list(self._listeners):
            cb()

    # -- light log -----------------------------------------------------------

    @callback
    def _handle_light_event(self, event: Event[EventStateChangedData]) -> None:
        self.lightlog.record(
            event.data["entity_id"], event.data["new_state"], dt_util.utcnow().timestamp()
        )

    def _record_current(self, entity_ids: Iterable[str]) -> None:
        now = dt_util.utcnow().timestamp()
        for entity_id in entity_ids:
            self.lightlog.record(entity_id, self.hass.states.get(entity_id), now)

    async def _backfill(self, entity_ids: list[str]) -> None:
        if self.lightlog.transitions(entity_ids, 0.0, math.inf):
            return  # already have history; the recorder's copy would only duplicate it
        if self._recorder() is None:
            return
        since = dt_util.utcnow() - timedelta(days=self.history_days)
        try:
            await self.lightlog.async_backfill(entity_ids, since)
        except Exception:  # the recorder may have purged, migrated or simply be busy
            _LOGGER.exception("Back-filling the light history failed")

    # -- day types -----------------------------------------------------------

    @property
    def timezone(self) -> tzinfo:
        return dt_util.get_default_time_zone()

    def _workday_now(self) -> bool | None:
        if not self._workday_entity:
            return None
        state = self.hass.states.get(self._workday_entity)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        return state.state == "on"

    def day_type_now(self) -> str:
        """Today's day type, with the workday sensor read live.

        Calendars are only known from the last rebuild, so a cached calendar day type
        is fed back in as an active calendar; everything else is decided from scratch.
        """
        day = dt_util.now().date()
        cached = self._day_type_cache.get(day.isoformat())
        active = frozenset({cached}) if cached in self._calendar_ids else frozenset[str]()
        inputs = DayTypeInputs(day.weekday(), self._workday_now(), active)
        return resolve_day_type(inputs, self.day_types)

    def day_type_of(self, day: date) -> str:
        """The day type of any date: the cached label, else calendar day of week."""
        if (cached := self._day_type_cache.get(day.isoformat())) is not None:
            return cached
        return resolve_day_type(DayTypeInputs(day.weekday(), None, frozenset()), self.day_types)

    async def _refresh_day_types(self, start: datetime, end: datetime) -> None:
        calendars = await self._calendar_days(start, end)
        workdays = await self._workday_days(start, end)
        if (live := self._workday_now()) is not None:
            workdays[dt_util.now().date().isoformat()] = live
        cache: dict[str, str] = {}
        day = dt_util.as_local(start).date()
        last = dt_util.as_local(end).date()
        while day <= last:
            key = day.isoformat()
            active = calendars.get(key, frozenset())
            inputs = DayTypeInputs(day.weekday(), workdays.get(key), active)
            cache[key] = resolve_day_type(inputs, self.day_types)
            day += timedelta(days=1)
        self._day_type_cache = cache

    async def _calendar_days(self, start: datetime, end: datetime) -> dict[str, frozenset[str]]:
        active: dict[str, set[str]] = {}
        for cal in self._calendars:
            try:
                response = await self.hass.services.async_call(
                    "calendar",
                    "get_events",
                    {
                        "entity_id": cal["entity"],
                        "start_date_time": dt_util.as_local(start).isoformat(),
                        "end_date_time": dt_util.as_local(end).isoformat(),
                    },
                    blocking=True,
                    return_response=True,
                )
            except Exception as err:  # an unavailable calendar must not fail the rebuild
                _LOGGER.debug("Calendar %s did not answer: %s", cal["entity"], err)
                continue
            for payload in (response or {}).values():
                if not isinstance(payload, Mapping):
                    continue
                events = payload.get("events")
                if not isinstance(events, list):
                    continue
                for event in events:
                    if not isinstance(event, Mapping):
                        continue
                    for day in _event_days(event):
                        active.setdefault(day, set()).add(cal["id"])
        return {day: frozenset(ids) for day, ids in active.items()}

    async def _workday_days(self, start: datetime, end: datetime) -> dict[str, bool]:
        instance = self._recorder()
        if not self._workday_entity or instance is None:
            return {}
        job = partial(
            get_significant_states,
            self.hass,
            start,
            end,
            [self._workday_entity],
            minimal_response=True,
        )
        history = await instance.async_add_executor_job(job)
        out: dict[str, bool] = {}
        for row in history.get(self._workday_entity, []):
            value, when = _row_value(row)
            if when is None or value not in ("on", "off"):
                continue
            local = datetime.fromtimestamp(when, self.timezone)
            out[local.date().isoformat()] = value == "on"
        return out

    # -- reads ---------------------------------------------------------------

    @property
    def ready(self) -> bool:
        """Whether any group has a trained, usable curve."""
        groups: Mapping[str, Any] = self.profile.get("groups", {})
        return any(group.get("ready") for group in groups.values())

    @property
    def producer(self) -> str:
        name: str = self.profile.get("producer", {}).get("name", BUILTIN_PRODUCER)
        return name

    def groups_ready(self) -> int:
        groups: Mapping[str, Any] = self.profile.get("groups", {})
        return sum(1 for group in groups.values() if group.get("ready"))

    def _slot_now(self) -> int:
        local = dt_util.now()
        return slot_of(local.hour * 60 + local.minute)

    def expected_now(self, gid: str) -> tuple[float, float, float] | None:
        """``(p25, p50, p75)`` for this group's current bucket, or None."""
        return expected_at(self.profile, gid, self.day_type_now(), self._slot_now())

    def anomaly_now(self, gid: str) -> float | None:
        """The signed, band-normalized deviation of the group's real value."""
        if not group_ready(self.profile, gid):
            return None
        band = self.expected_now(gid)
        state = self.coordinator.data.get(gid)
        if band is None or state is None:
            return None
        max_value = self.coordinator.tree.groups[gid].max_value
        return anomaly_score(state.real_value, band, scale=max_value)

    # -- rebuild -------------------------------------------------------------

    async def async_set_profile(self, doc: Mapping[str, Any]) -> None:
        """Accept a document from any producer, after validating it."""
        self.profile = validate_profile(doc)
        await self._save()
        self._notify()

    async def async_rebuild(self, *, force: bool = False) -> bool:
        """Run the built-in learner. Returns False when it declined to run."""
        if self.producer != BUILTIN_PRODUCER and not force:
            _LOGGER.debug("Profile belongs to producer %s; not rebuilding", self.producer)
            return False
        instance = self._recorder()
        if instance is None:
            _LOGGER.debug("No recorder available; not rebuilding the profile")
            return False

        end = dt_util.utcnow()
        start = end - timedelta(days=self.history_days)
        await self._refresh_day_types(start, end)
        stats = await self._fetch_statistics(instance, start, end)

        window = (start.timestamp(), end.timestamp())
        tz = self.timezone
        inputs = [
            GroupInputs(
                gid=gid,
                max_value=info.max_value,
                samples=self._samples(stats.get(statistic_id(gid), []), tz),
                transitions=self.lightlog.transitions(self.lights.get(gid, []), *window),
            )
            for gid, info in self.coordinator.tree.groups.items()
        ]
        # one frozen copy of the labelling, so the executor thread never touches hass
        labels = dict(self._day_type_cache)
        precedence = list(self.day_types)

        def day_type_of(day: date) -> str:
            if (cached := labels.get(day.isoformat())) is not None:
                return cached
            return resolve_day_type(DayTypeInputs(day.weekday(), None, frozenset()), precedence)

        groups = await self.hass.async_add_executor_job(
            partial(
                fit_groups,
                inputs,
                day_types=precedence,
                day_type_of=day_type_of,
                tz=tz,
                min_days=self.min_days,
                window=window,
            )
        )
        self.profile = validate_profile(
            {
                "version": DOC_VERSION,
                "producer": {"name": BUILTIN_PRODUCER, "version": VERSION},
                "generated_at": end.timestamp(),
                "training_window": list(window),
                "day_types": precedence,
                "slot_minutes": SLOT_MINUTES,
                "groups": groups,
            }
        )
        await self._save()
        self._notify()
        return True

    def _samples(self, rows: Sequence[StatisticsRow], tz: tzinfo) -> list[Sample]:
        samples: list[Sample] = []
        for row in rows:
            mean = row.get("mean")
            when = row.get("start")
            if mean is None or when is None:
                continue
            t = float(when)
            day = datetime.fromtimestamp(t, tz).date()
            samples.append(Sample(t=t, value=float(mean), day_type=self.day_type_of(day)))
        return samples

    def _recorder(self) -> Recorder | None:
        try:
            return get_instance(self.hass)
        except KeyError:  # the recorder is optional; without it nothing can be learned
            return None

    async def _fetch_statistics(
        self, instance: Recorder, start: datetime, end: datetime, gids: Iterable[str] | None = None
    ) -> dict[str, list[StatisticsRow]]:
        ids = {statistic_id(gid) for gid in (gids or self.coordinator.tree.groups)}
        job = partial(
            statistics_during_period, self.hass, start, end, ids, "hour", None, {"mean", "max"}
        )
        result: dict[str, list[StatisticsRow]] = await instance.async_add_executor_job(job)
        return result

    # -- timeseries ----------------------------------------------------------

    async def async_timeseries(
        self,
        gid: str,
        start: float,
        end: float,
        resolution: str = "1h",
        *,
        include_children: bool = False,
        forecast_until: float | None = None,
    ) -> dict[str, Any]:
        """History, forecast, day-type spans and light spans for one group."""
        gids = self._subtree(gid) if include_children else [gid]
        if resolution == "5m":
            series = await self._history_5m(gids, start, end)
        else:
            series = await self._history_1h(gids, start, end)
        return {
            "series": series,
            "forecast": self._forecast(gid, end, forecast_until),
            "day_types": self._day_type_spans(start, end),
            "lights": self._light_spans(gid, start, end),
            "plan": [],
        }

    def _subtree(self, gid: str) -> list[str]:
        info = self.coordinator.tree.groups.get(gid)
        if info is None:
            return []
        return [group.id for group in info.group.groups()]

    async def _history_1h(
        self, gids: Sequence[str], start: float, end: float
    ) -> dict[str, list[list[float]]]:
        instance = self._recorder()
        if instance is None:
            return {gid: [] for gid in gids}
        rows = await self._fetch_statistics(
            instance,
            dt_util.utc_from_timestamp(start),
            dt_util.utc_from_timestamp(end),
            gids,
        )
        return {
            gid: [
                [float(row["start"]), float(mean)]
                for row in rows.get(statistic_id(gid), [])
                if (mean := row.get("mean")) is not None
            ]
            for gid in gids
        }

    async def _history_5m(
        self, gids: Sequence[str], start: float, end: float
    ) -> dict[str, list[list[float]]]:
        instance = self._recorder()
        if instance is None:
            return {gid: [] for gid in gids}
        entity_ids = [statistic_id(gid) for gid in gids]
        job = partial(
            get_significant_states,
            self.hass,
            dt_util.utc_from_timestamp(start),
            dt_util.utc_from_timestamp(end),
            entity_ids,
            minimal_response=True,
        )
        history = await instance.async_add_executor_job(job)
        return {
            gid: _resample(history.get(statistic_id(gid), []), start, end, FIVE_MINUTES)
            for gid in gids
        }

    def _forecast(
        self, gid: str, end: float, forecast_until: float | None
    ) -> dict[str, Any] | None:
        if forecast_until is None or forecast_until <= end:
            return None
        # start on the first slot boundary at or after `end`, so a whole forecast day
        # is exactly 96 points however `end` happens to fall inside its bucket
        t0 = math.ceil(end / SLOT_SECONDS) * SLOT_SECONDS
        tz = self.timezone
        bands: list[tuple[float, float, float]] = []
        t = float(t0)
        while t < forecast_until:
            local = datetime.fromtimestamp(t, tz)
            slot = slot_of(local.hour * 60 + local.minute)
            band = expected_at(self.profile, gid, self.day_type_of(local.date()), slot)
            bands.append(band or (0.0, 0.0, 0.0))
            t += SLOT_SECONDS
        return {
            "t0": float(t0),
            "step": SLOT_SECONDS,
            "p25": [b[0] for b in bands],
            "p50": [b[1] for b in bands],
            "p75": [b[2] for b in bands],
        }

    def _day_type_spans(self, start: float, end: float) -> list[list[Any]]:
        tz = self.timezone
        day = datetime.fromtimestamp(start, tz).date()
        last = datetime.fromtimestamp(end, tz).date()
        spans: list[list[Any]] = []
        while day <= last:
            begin = datetime.combine(day, time(0, 0), tzinfo=tz).timestamp()
            finish = datetime.combine(day + timedelta(days=1), time(0, 0), tzinfo=tz).timestamp()
            spans.append([max(begin, start), min(finish, end), self.day_type_of(day)])
            day += timedelta(days=1)
        return spans

    def _light_spans(self, gid: str, start: float, end: float) -> dict[str, list[list[float]]]:
        out: dict[str, list[list[float]]] = {}
        for entity_id in self.lights.get(gid, []):
            spans: list[list[float]] = []
            opened: float | None = None
            for transition in self.lightlog.transitions([entity_id], start, end):
                if transition.on and opened is None:
                    opened = transition.t
                elif not transition.on and opened is not None:
                    spans.append([opened, transition.t])
                    opened = None
            if opened is not None:
                spans.append([opened, end])
            out[entity_id] = spans
        return out


def _resample(
    rows: Sequence[State | Mapping[str, Any]], start: float, end: float, step: float
) -> list[list[float]]:
    """Sample a state history onto a fixed grid, holding the last value seen.

    Activity levels are a step function between recorded points, so holding is exact
    rather than an approximation, and it gives every group the same grid.
    """
    points: list[tuple[float, float]] = []
    for row in rows:
        value, when = _row_value(row)
        try:
            points.append((when if when is not None else start, float(value)))  # type: ignore[arg-type]
        except TypeError, ValueError:
            continue  # unknown/unavailable
    points.sort()
    out: list[list[float]] = []
    index = 0
    current: float | None = None
    t = start
    while t <= end:
        while index < len(points) and points[index][0] <= t:
            current = points[index][1]
            index += 1
        if current is not None:
            out.append([t, current])
        t += step
    return out
