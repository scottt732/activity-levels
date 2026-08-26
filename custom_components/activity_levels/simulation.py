"""Presence simulation: drive a group's lights with a plausible plan while away.

The Home-Assistant-side half of :mod:`.patterns.planner`. The planner is pure and
seeded; everything that touches the clock, the state machine or the service bus lives
here: the preconditions that decide whether a group may be simulated at all, the timers
that fire each planned action, and the rolling log of what was actually done.

Nothing is ever "restored" when a plan is cancelled. A cancelled plan means either the
house stopped being empty or the group saw real activity, and in both cases the lights
belong to whoever just came home -- switching them back would be a fight, not a feature.
"""

from __future__ import annotations

import logging
from collections.abc import Callable, Coroutine, Mapping
from datetime import datetime, time
from typing import TYPE_CHECKING, Any

import numpy as np
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ENTITY_ID, STATE_ON
from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import CONF_DEFAULTS, CONF_SIMULATION, DOMAIN
from .coordinator import ActivityLevelsCoordinator
from .patterns.planner import PlannedAction, sample_plan
from .patterns.profile import group_ready, slot_of

if TYPE_CHECKING:
    from .patterns_coordinator import PatternsCoordinator

_LOGGER = logging.getLogger(__name__)

SIMLOG_STORAGE_VERSION = 1
MAX_LOG_ROWS = 500
"""How many executed actions the log keeps; older rows are dropped on write."""
SAVE_DELAY = 10.0
DEFAULT_LOG_LIMIT = 50

LIGHT_DOMAIN = "light"
ATTR_BRIGHTNESS = "brightness"


def simlog_storage_key(entry_id: str) -> str:
    return f"{DOMAIN}.simlog.{entry_id}"


def group_simulation_enabled(config: Mapping[str, Any]) -> dict[str, bool]:
    """Read every group's ``simulation.enabled`` flag out of a validated config."""
    enabled: dict[str, bool] = {}

    def walk(node: Mapping[str, Any]) -> None:
        simulation = node.get(CONF_SIMULATION) or {}
        enabled[node["id"]] = bool(simulation.get("enabled", True))
        for child in node.get("children") or []:
            walk(child)

    for group in config.get("groups") or []:
        walk(group)
    return enabled


class SimulationRuntime:
    """Owns every group's simulation state for one config entry."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry[Any],
        coordinator: ActivityLevelsCoordinator,
        patterns: PatternsCoordinator,
        config: Mapping[str, Any],
    ) -> None:
        self.hass = hass
        self.entry = entry
        self.coordinator = coordinator
        self.patterns = patterns
        simulation = config[CONF_DEFAULTS][CONF_SIMULATION]
        self.away_entity: str | None = simulation["away_entity"]
        quiet = simulation["quiet_hours"]
        self.quiet_hours: tuple[str, str] | None = None if quiet is None else (quiet[0], quiet[1])
        self._enabled = group_simulation_enabled(config)
        self._global_on = False
        self._group_on: dict[str, bool] = {}
        self._plans: dict[str, list[PlannedAction]] = {}
        self._pending: dict[str, list[PlannedAction]] = {}
        self._timers: dict[str, list[CALLBACK_TYPE]] = {}
        self._forced: set[str] = set()
        self._log: list[dict[str, Any]] = []
        self._store: Store[dict[str, Any]] = Store(
            hass, SIMLOG_STORAGE_VERSION, simlog_storage_key(entry.entry_id)
        )
        self._unsubs: list[CALLBACK_TYPE] = []
        self._doc: Mapping[str, Any] = patterns.profile
        self._stopped = False

    # -- lifecycle -----------------------------------------------------------

    async def async_start(self) -> None:
        """Load the log and subscribe to everything a precondition can change with."""
        await self._load()
        self._doc = self.patterns.profile
        if self.away_entity is not None:
            if self.hass.states.get(self.away_entity) is None:
                _LOGGER.warning(
                    "Presence simulation away entity %s does not exist; simulation will "
                    "stay idle until it does",
                    self.away_entity,
                )
            self._unsubs.append(
                async_track_state_change_event(self.hass, [self.away_entity], self._away_changed)
            )
        for gid in self.coordinator.tree.groups:
            self._unsubs.append(self.coordinator.async_add_listener(gid, self._published(gid)))
        self._unsubs.append(self.patterns.async_add_listener(self._profile_changed))
        self._unsubs.append(
            async_track_time_change(self.hass, self._midnight, hour=0, minute=0, second=0)
        )

    async def async_stop(self) -> None:
        """Cancel every timer and flush the log. Idempotent."""
        if self._stopped:
            return
        self._stopped = True
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        for gid in list(self._plans):
            self._cancel(gid)
        if self._log:
            await self._store.async_save({"actions": self._log})

    async def _load(self) -> None:
        stored = await self._store.async_load()
        rows = (stored or {}).get("actions")
        if isinstance(rows, list):
            self._log = [row for row in rows if isinstance(row, dict)][-MAX_LOG_ROWS:]

    # -- switches ------------------------------------------------------------

    def has_switch(self, gid: str) -> bool:
        """Whether this group gets a presence-simulation switch at all."""
        return self._enabled.get(gid, True) and bool(self.patterns.lights.get(gid))

    @property
    def global_on(self) -> bool:
        return self._global_on

    def group_on(self, gid: str) -> bool:
        return self._group_on.get(gid, False)

    @callback
    def set_global(self, on: bool) -> None:
        """The global switch moved: re-evaluate every group."""
        self._global_on = on
        self._evaluate_all()

    @callback
    def set_group(self, gid: str, on: bool) -> None:
        """One group's switch moved."""
        self._group_on[gid] = on
        self._evaluate(gid)

    # -- reads ---------------------------------------------------------------

    def is_active(self, gid: str) -> bool:
        """Whether this group has a plan with actions still ahead of it.

        A group can be armed with nothing left to do -- every action fired, or the day
        held none to begin with -- and that is not "active".
        """
        return bool(self._pending.get(gid))

    def plan_for(self, gid: str) -> list[PlannedAction]:
        """The actions this group's running plan was built from, executed ones included."""
        return list(self._plans.get(gid, ()))

    def log(self, limit: int = DEFAULT_LOG_LIMIT) -> list[dict[str, Any]]:
        """The most recently executed actions, newest first."""
        if limit <= 0:
            return []
        return [dict(row) for row in reversed(self._log[-limit:])]

    # -- preconditions -------------------------------------------------------

    def _away(self) -> bool:
        if self.away_entity is None:
            return False
        state = self.hass.states.get(self.away_entity)
        return state is not None and state.state == STATE_ON

    def _idle(self, gid: str) -> bool:
        state = self.coordinator.data.get(gid)
        return state is not None and state.real_value <= 0.0

    def blocked_reason(self, gid: str, *, forced: bool = False) -> str | None:
        """The first precondition this group fails, or None when it may be simulated.

        Phrased for a person: the simulate_now service puts it straight in front of
        whoever asked for a simulation that could not start.
        """
        if not forced and not (self._global_on and self._group_on.get(gid, False)):
            return "the presence simulation switches are off"
        if not self._enabled.get(gid, True):
            return "presence simulation is disabled for this group"
        if not self.patterns.lights.get(gid):
            return "the group has no lights"
        if self.away_entity is None:
            return "no away entity is configured"
        if not self._away():
            return "the house is not empty"
        if not self._idle(gid):
            return "the group is active"
        if not group_ready(self.patterns.profile, gid):
            return "the group has no trained profile yet"
        return None

    def _allowed(self, gid: str, *, forced: bool) -> bool:
        return self.blocked_reason(gid, forced=forced) is None

    @callback
    def _evaluate(self, gid: str) -> None:
        """Start or cancel this group's plan so it matches the preconditions."""
        if self._stopped:
            return
        forced = gid in self._forced
        if self._allowed(gid, forced=forced):
            if gid not in self._plans:
                self._activate(gid, forced=forced)
        elif gid in self._plans:
            self._cancel(gid)

    @callback
    def _evaluate_all(self) -> None:
        for gid in self.coordinator.tree.groups:
            self._evaluate(gid)

    # -- triggers ------------------------------------------------------------

    def _published(self, gid: str) -> Callable[[], None]:
        """A per-group callback for the level coordinator's publishes."""

        @callback
        def changed() -> None:
            self._evaluate(gid)

        return changed

    @callback
    def _away_changed(self, _event: Event[EventStateChangedData]) -> None:
        self._evaluate_all()

    @callback
    def _profile_changed(self) -> None:
        """The patterns coordinator notified. Re-plan only when the document moved.

        Identity, not content: the coordinator notifies on every 15-minute bucket tick
        too, and a rebuild that lands in the same second as the previous one would look
        unchanged by any stamp we could take of it.
        """
        if self.patterns.profile is self._doc:
            return
        self._doc = self.patterns.profile
        self._replan()
        self._evaluate_all()

    @callback
    def _midnight(self, _now: datetime) -> None:
        """A new local day: today's day type, and so its curves, are different."""
        self._replan()
        self._evaluate_all()

    @callback
    def _replan(self) -> None:
        for gid in list(self._plans):
            forced = gid in self._forced
            self._cancel(gid)
            if self._allowed(gid, forced=forced):
                self._activate(gid, forced=forced)

    # -- planning ------------------------------------------------------------

    async def async_simulate_now(self, gid: str) -> bool:
        """Sample and start a plan right now, ignoring the switches. For testing.

        Every other precondition still holds: the house must be empty, the group quiet,
        its profile ready and its light membership non-empty. Returns whether anything
        is now scheduled; :meth:`blocked_reason` says why not.
        """
        if (reason := self.blocked_reason(gid, forced=True)) is not None:
            _LOGGER.debug("Not simulating %s now: %s", gid, reason)
            return False
        self._cancel(gid)
        self._activate(gid, forced=True)
        return self.is_active(gid)

    @callback
    def _activate(self, gid: str, *, forced: bool) -> None:
        """Sample the rest of today for this group and schedule what is still ahead."""
        lights = self.patterns.lights.get(gid, [])
        members = set(lights)
        group: Mapping[str, Any] = self.patterns.profile.get("groups", {}).get(gid, {})
        # a light can be learned and then dropped from the group; plan only for the ones
        # the registries still say belong to it
        light_profile = {
            entity_id: spec
            for entity_id, spec in (group.get("lights") or {}).items()
            if entity_id in members
        }
        if not light_profile:
            # armed, but with nothing to drive; recorded so we do not re-sample on
            # every publish
            self._plans[gid] = []
            self._pending[gid] = []
            return

        tz = self.patterns.timezone
        now = dt_util.now()
        day_start = datetime.combine(now.date(), time(0, 0), tzinfo=tz).timestamp()
        initial_state = {
            entity_id: (state := self.hass.states.get(entity_id)) is not None
            and state.state == STATE_ON
            for entity_id in lights
        }
        plan = sample_plan(
            np.random.default_rng(),
            light_profile=light_profile,
            day_type=self.patterns.day_type_now(),
            day_start=day_start,
            tz=tz,
            quiet_hours=self.quiet_hours,
            initial_state=initial_state,
            start_slot=slot_of(now.hour * 60 + now.minute),
        )
        # the plan starts from the slot we are in, so only rounding and jitter can put
        # an action marginally behind the clock; drop those rather than fire them late
        pending = [action for action in plan if action.t >= now.timestamp()]
        self._plans[gid] = plan
        self._pending[gid] = pending
        if forced:
            self._forced.add(gid)
        timers = self._timers.setdefault(gid, [])
        for action in pending:
            timers.append(
                async_track_point_in_time(
                    self.hass, self._firing(gid, action), dt_util.utc_from_timestamp(action.t)
                )
            )
        _LOGGER.debug("Simulating %s with %d action(s), forced=%s", gid, len(pending), forced)

    @callback
    def _cancel(self, gid: str) -> None:
        """Drop the plan and its timers. The lights are left exactly as they are."""
        for unsub in self._timers.pop(gid, []):
            unsub()
        self._plans.pop(gid, None)
        self._pending.pop(gid, None)
        self._forced.discard(gid)

    # -- execution -----------------------------------------------------------

    def _firing(
        self, gid: str, action: PlannedAction
    ) -> Callable[[datetime], Coroutine[Any, Any, None]]:
        """Bind one action to the timer callback that will run it."""

        async def fire(_now: datetime) -> None:
            await self._execute(gid, action)

        return fire

    async def _execute(self, gid: str, action: PlannedAction) -> None:
        """Run one action, but only if it and every precondition still hold."""
        pending = self._pending.get(gid)
        # a re-plan between the timer being set and it firing supersedes the action
        if self._stopped or pending is None or action not in pending:
            return
        if not self._allowed(gid, forced=gid in self._forced):
            self._cancel(gid)
            return
        pending.remove(action)
        data: dict[str, Any] = {ATTR_ENTITY_ID: action.entity_id}
        if action.on and action.brightness is not None:
            data[ATTR_BRIGHTNESS] = action.brightness
        await self.hass.services.async_call(
            LIGHT_DOMAIN, "turn_on" if action.on else "turn_off", data, blocking=False
        )
        self._append(gid, action)

    def _append(self, gid: str, action: PlannedAction) -> None:
        self._log.append(
            {
                "t": action.t,
                "group_id": gid,
                "entity_id": action.entity_id,
                "on": action.on,
                "brightness": action.brightness,
            }
        )
        del self._log[:-MAX_LOG_ROWS]
        self._store.async_delay_save(lambda: {"actions": self._log}, SAVE_DELAY)
