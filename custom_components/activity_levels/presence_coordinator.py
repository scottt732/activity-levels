"""The presence coordinator: Bermuda discovery, observations, occupancy.

The integration-side half of :mod:`.presence`, mirroring :class:`.PatternsCoordinator`.
It finds Bermuda's scanners and per-scanner distance sensors through the registries,
coalesces their updates into one :class:`.Observation` per device per tick, runs each
device's :class:`.Estimator`, and turns the answers into occupancy -- which is the only
thing the engine ever hears about presence.

Nothing here does arithmetic on a belief: the filter owns numpy, this owns Home
Assistant. Constructed only when ``presence.enabled`` is set; with Bermuda missing it
raises a repair issue and stays inert rather than failing setup.
"""

from __future__ import annotations

import logging
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_NOT_HOME, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    AWAY,
    CONF_PRESENCE,
    DOMAIN,
    ISSUE_BERMUDA_MISSING,
    ISSUE_DISABLED_SENSORS,
    ISSUE_NOT_BERMUDA,
    ISSUE_TRANSITION,
    ISSUE_UNMAPPED_SCANNERS,
    PRESENCE_STORAGE_VERSION,
    presence_storage_key,
)
from .coordinator import ActivityLevelsCoordinator
from .presence.estimator import Estimator, Outputs
from .presence.observation import BERMUDA_DOMAIN, Observation, parse_distance, scanner_key
from .topology import Topology

_LOGGER = logging.getLogger(__name__)

OBSERVATION_DEBOUNCE = 0.5
"""Bermuda rewrites a device's whole row of distance sensors at once, so waiting half a
second turns a burst of N state events into one observation instead of N."""
REGISTRY_DEBOUNCE = 5.0
"""Adopting one device rewrites the device registry and then every entity on it."""
SAVE_DELAY = 10.0
AWAY_LABEL = "Away"

PRESENCE_ISSUES = (
    ISSUE_BERMUDA_MISSING,
    ISSUE_NOT_BERMUDA,
    ISSUE_DISABLED_SENSORS,
    ISSUE_UNMAPPED_SCANNERS,
    ISSUE_TRANSITION,
)
"""Every repair issue the presence side can raise, so they can all be swept away."""


@callback
def clear_presence_issues(hass: HomeAssistant, entry_id: str) -> None:
    """Delete every presence repair issue for one entry.

    Called at the top of :meth:`PresenceCoordinator.async_start`, which then re-raises
    whichever still apply, and by setup when presence is switched off -- because in that
    case no coordinator is built, and without this the issues from the last time it was
    on would sit in the repairs panel forever with nothing left to clear them.
    """
    for key in PRESENCE_ISSUES:
        ir.async_delete_issue(hass, DOMAIN, f"{key}_{entry_id}")


@dataclass
class TrackedDevice:
    """One person's phone: where its readings come from, and what we make of them."""

    name: str
    tracker: str
    device_id: str | None = None
    sensors: dict[str, str] = field(default_factory=dict)
    estimator: Estimator | None = None
    outputs: Outputs | None = None


@dataclass(frozen=True)
class Scanner:
    """One Bermuda proxy, as the registries describe it."""

    key: str
    device_id: str
    name: str
    area_id: str | None


class PresenceCoordinator:
    """Owns the room estimate for one config entry."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry[Any],
        coordinator: ActivityLevelsCoordinator,
        topology: Topology,
        config: Mapping[str, Any],
    ) -> None:
        self.hass = hass
        self.entry = entry
        self.coordinator = coordinator
        self.topology = topology
        self.settings: dict[str, Any] = dict(config[CONF_PRESENCE])
        self.threshold: float = self.settings["threshold"]
        self.devices: dict[str, TrackedDevice] = {}
        self.scanners: dict[str, Scanner] = {}
        self.scanner_map: dict[str, str] = {}
        self.unmapped: list[str] = []
        self.disabled: list[str] = []
        self.occupants: dict[str, list[str]] = {gid: [] for gid in topology.nodes}
        self._store: Store[dict[str, Any]] = Store(
            hass, PRESENCE_STORAGE_VERSION, presence_storage_key(entry.entry_id)
        )
        self._beliefs: dict[str, Any] = {}
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._state_unsub: CALLBACK_TYPE | None = None
        self._registry_timer: CALLBACK_TYPE | None = None
        self._observe_timer: CALLBACK_TYPE | None = None
        self._dirty: set[str] = set()
        self._usable = False
        self._stopped = False

    # -- lifecycle -----------------------------------------------------------

    @property
    def ready(self) -> bool:
        """Whether anything is actually being estimated right now."""
        return self._usable and bool(self.devices)

    async def async_start(self) -> None:
        """Load the stored beliefs, discover Bermuda, and start listening.

        A missing Bermuda, or settings the graph cannot make a transition matrix from,
        leave the coordinator inert: the issue explains it, the entry still loads, and
        every other part of the integration goes on working.
        """
        clear_presence_issues(self.hass, self.entry.entry_id)
        stored = await self._store.async_load()
        beliefs = stored.get("beliefs") if isinstance(stored, Mapping) else None
        # a store we can no longer read is a uniform prior, not a failed setup
        self._beliefs = dict(beliefs) if isinstance(beliefs, Mapping) else {}

        if not self._bermuda_loaded():
            self._issue(ISSUE_BERMUDA_MISSING, present=True)
            _LOGGER.warning(
                "presence.enabled is set but Bermuda is not installed; the presence side "
                "stays off until it is"
            )
            return

        problem = self.topology.feasible(self.settings["stay"], self.settings["escape"])
        if problem is not None:
            self._issue(ISSUE_TRANSITION, present=True, detail=problem)
            _LOGGER.warning("Presence is off: %s", problem)
            return

        self._usable = True
        self._discover()
        self._subscribe()
        for event in (er.EVENT_ENTITY_REGISTRY_UPDATED, dr.EVENT_DEVICE_REGISTRY_UPDATED):
            self._unsubs.append(self.hass.bus.async_listen(event, self._registry_changed))
        # a first observation from the states that are already there, so a restart does
        # not sit blank until somebody's phone next moves
        self._observe(dt_util.utcnow().timestamp())

    def _bermuda_loaded(self) -> bool:
        """Whether Bermuda is installed, whether or not it has finished starting.

        Nothing orders the two integrations, so on a cold boot ours can set up while
        Bermuda's component is still loading. Taking ``hass.config.components`` as the
        only answer would raise "Bermuda is not installed" against a perfectly good
        install and then leave the presence side inert until somebody reloaded the entry
        by hand -- a configured config entry is the durable fact, so it counts too.
        ``after_dependencies`` in the manifest makes this the rare case rather than the
        usual one.
        """
        return BERMUDA_DOMAIN in self.hass.config.components or bool(
            self.hass.config_entries.async_entries(BERMUDA_DOMAIN)
        )

    async def async_stop(self) -> None:
        """Cancel every timer and flush the beliefs. Idempotent."""
        if self._stopped:
            return
        self._stopped = True
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        for timer in (self._state_unsub, self._registry_timer, self._observe_timer):
            if timer is not None:
                timer()
        self._state_unsub = self._registry_timer = self._observe_timer = None
        self._listeners.clear()
        if self._usable:
            await self._store.async_save(self._snapshot())

    # -- listeners -----------------------------------------------------------

    @callback
    def async_add_listener(self, cb: Callable[[], None]) -> Callable[[], None]:
        """Subscribe to "a device's estimate moved"; the returned callable unsubscribes."""
        self._listeners.append(cb)

        def remove() -> None:
            if cb in self._listeners:  # tolerate a second call
                self._listeners.remove(cb)

        return remove

    @callback
    def _notify(self) -> None:
        for cb in list(self._listeners):
            cb()

    # -- discovery -----------------------------------------------------------

    def _discover(self) -> None:
        """Re-read the registries: who is tracked, by which scanners, in which rooms.

        Everything is rebuilt from scratch each time -- a scanner moving to another area
        has to be able to move its readings with it -- but each device's belief is
        carried over, because the state space has not changed.
        """
        entities = er.async_get(self.hass)
        devices = dr.async_get(self.hass)
        self.scanners = {}
        disabled: list[str] = []
        wrong: list[str] = []
        tracked: dict[str, TrackedDevice] = {}

        for spec in self.settings["devices"]:
            entry = entities.async_get(spec["device"])
            if entry is None or entry.platform != BERMUDA_DOMAIN:
                # two different mistakes with the same consequence, and the fix differs:
                # a typo or a removed entity, versus somebody else's device_tracker
                reason = "no such entity" if entry is None else "not a Bermuda entity"
                wrong.append(f"{spec['device']} ({reason})")
                _LOGGER.warning("Ignoring tracked device %s: %s", spec["device"], reason)
                continue
            name = spec["name"] or self._tracked_name(devices, entry)
            track = TrackedDevice(name=name, tracker=entry.entity_id, device_id=entry.device_id)
            if entry.device_id is not None:
                for member in er.async_entries_for_device(
                    entities, entry.device_id, include_disabled_entities=True
                ):
                    key = scanner_key(member.unique_id, entry.unique_id)
                    if key is None or member.domain != "sensor":
                        continue  # the device's area sensor and friends are not readings
                    if member.disabled:
                        # Bermuda ships these off; without them there is nothing to filter
                        disabled.append(member.entity_id)
                        continue
                    track.sensors[member.entity_id] = key
                    self._register_scanner(devices, key)
            tracked[name] = track

        self._map_scanners()
        for name, track in tracked.items():
            previous = self.devices.get(name)
            track.estimator = Estimator(
                self.topology,
                self.scanner_map,
                stay=self.settings["stay"],
                escape=self.settings["escape"],
                scale=self.settings["scale"],
                floor=self.settings["floor"],
                stuck_after=self.settings["stuck_after"],
            )
            carried = (
                previous.estimator.snapshot()
                if previous is not None and previous.estimator is not None
                else self._beliefs.get(name)
            )
            if isinstance(carried, Mapping) and track.estimator.restore(carried):
                track.outputs = track.estimator.outputs()
            elif previous is not None:
                track.outputs = previous.outputs
        self.devices = tracked
        self.disabled = sorted(disabled)

        self._issue(ISSUE_NOT_BERMUDA, present=bool(wrong), entities=", ".join(sorted(wrong)))
        self._issue(
            ISSUE_DISABLED_SENSORS,
            present=bool(self.disabled),
            entities=", ".join(self.disabled),
        )
        self._issue(
            ISSUE_UNMAPPED_SCANNERS,
            present=bool(self.unmapped),
            scanners=", ".join(self.scanners[key].name for key in self.unmapped),
        )

    def _tracked_name(self, devices: dr.DeviceRegistry, entry: er.RegistryEntry) -> str:
        """What to call the person behind one Bermuda tracker.

        Bermuda names every one of its ``device_tracker`` entities "Bermuda Tracker" and
        leans on ``has_entity_name`` to put the device in front of it, so the entity's
        own name identifies nobody -- it is the device, "Scott's iPhone", that says whose
        phone this is. Reading the entity name would therefore hand every tracked device
        the same name, and ``self.devices`` is keyed by name, so the second phone would
        silently displace the first. A name the user typed into Home Assistant still
        wins, because that is a deliberate answer to this very question.
        """
        if entry.name:
            return entry.name
        device = devices.async_get(entry.device_id) if entry.device_id is not None else None
        if device is not None and (name := device.name_by_user or device.name):
            return name
        return entry.original_name or entry.entity_id

    def _register_scanner(self, devices: dr.DeviceRegistry, key: str) -> None:
        """Find the HA device behind a scanner address, or record it unplaceable."""
        if key in self.scanners:
            return
        device = devices.async_get_device(identifiers={(BERMUDA_DOMAIN, key)})
        if device is None:
            # a proxy some other integration registered -- an ESPHome node, say -- is
            # still the scanner Bermuda is naming, and its area is the one that counts.
            # Which MAC the key holds depends on the proxy, and the two connection kinds
            # are spelled differently: Home Assistant normalizes a network MAC for us,
            # while a Bluetooth one has to match the upper case Bermuda stores it in.
            for connection in (
                (dr.CONNECTION_NETWORK_MAC, key),
                (dr.CONNECTION_BLUETOOTH, key.upper()),
            ):
                device = devices.async_get_device(connections={connection})
                if device is not None:
                    break
        if device is None:
            self.scanners[key] = Scanner(key=key, device_id="", name=key, area_id=None)
            return
        self.scanners[key] = Scanner(
            key=key,
            device_id=device.id,
            name=device.name_by_user or device.name or key,
            area_id=device.area_id,
        )

    def _map_scanners(self) -> None:
        """Areas, then the explicit overrides, then whatever is left over."""
        configured: dict[str, str] = self.settings["scanner_areas"]
        overrides: dict[str, str] = {}
        for key, scanner in self.scanners.items():
            # a user types whichever id they can see: the device registry's, or the
            # Bluetooth address the sensor names
            gid = configured.get(key) or configured.get(scanner.device_id)
            if gid is not None:
                overrides[key] = gid
        self.scanner_map, self.unmapped = self.topology.map_scanners(
            {key: scanner.area_id for key, scanner in self.scanners.items()}, overrides
        )

    @callback
    def _registry_changed(self, _event: Event[Any]) -> None:
        """A registry moved. Debounced: adopting one device fires a burst of these."""
        if self._stopped or not self._usable:
            return
        if self._registry_timer is not None:
            self._registry_timer()
        self._registry_timer = async_call_later(self.hass, REGISTRY_DEBOUNCE, self._rediscover)

    @callback
    def _rediscover(self, _now: datetime) -> None:
        """Re-read the registries after they settled, and re-aim at what changed."""
        self._registry_timer = None
        if self._stopped:
            return

        def fingerprint() -> tuple[dict[str, str], dict[str, dict[str, str]]]:
            return (
                dict(self.scanner_map),
                {name: dict(track.sensors) for name, track in self.devices.items()},
            )

        before = fingerprint()
        self._discover()
        if before == fingerprint():
            return
        self._subscribe()
        self._observe(dt_util.utcnow().timestamp())

    # -- observations --------------------------------------------------------

    def _subscribe(self) -> None:
        """Point the state subscription at the entities discovery just found."""
        if self._state_unsub is not None:
            self._state_unsub()
            self._state_unsub = None
        watched = sorted(
            {track.tracker for track in self.devices.values()}
            | {entity_id for track in self.devices.values() for entity_id in track.sensors}
        )
        if not watched:
            return
        self._state_unsub = async_track_state_change_event(
            self.hass, watched, self._handle_state_event
        )

    @callback
    def _handle_state_event(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        for name, track in self.devices.items():
            if entity_id == track.tracker or entity_id in track.sensors:
                self._dirty.add(name)
        if not self._dirty or self._observe_timer is not None:
            return
        self._observe_timer = async_call_later(self.hass, OBSERVATION_DEBOUNCE, self._observe_due)

    @callback
    def _observe_due(self, _now: datetime) -> None:
        self._observe_timer = None
        if self._stopped:
            return
        self._observe(dt_util.utcnow().timestamp())

    def _observe(self, t: float) -> None:
        """Run the filter for every device whose readings moved since the last tick.

        Occupancy is reapplied whether or not a filter ran, because "no device moved" is
        not the same as "nothing changed": discovery can have just taken the last tracked
        device away, and then the only thing that releases the gates is an evaluation
        over an empty set. Only the persist and the notify are skipped when there was
        nothing to filter, since neither has anything new to say.
        """
        names = sorted(self._dirty) or sorted(self.devices)
        self._dirty.clear()
        moved = False
        for name in names:
            track = self.devices.get(name)
            if track is None or track.estimator is None:
                continue
            track.outputs = track.estimator.update(self._observation(track, t))
            moved = True
        self._apply_occupancy()
        if not moved:
            return
        self._store.async_delay_save(self._snapshot, SAVE_DELAY)
        self._notify()

    def _observation(self, track: TrackedDevice, t: float) -> Observation:
        """A full frame: every scanner we know of, ``None`` where there is no reading.

        Never a delta of what changed -- the filter reads a missing scanner as silence
        and floors its room, so leaving an unchanged reading out would quietly promote
        every room nobody can hear.
        """
        distances: dict[str, float | None] = {}
        for entity_id, key in track.sensors.items():
            state = self.hass.states.get(entity_id)
            distances[key] = parse_distance(None if state is None else state.state)
        # `unavailable` and `unknown` read as not-home on purpose: an absent answer is
        # not evidence that somebody is in the house, and the filter's away state is the
        # honest place for "we cannot see them". The cost is that a Bermuda reload, which
        # takes every tracker through `unavailable` and back, flips everybody to Away and
        # then home again -- a burst of note-offs and note-ons rather than a wrong belief.
        tracker = self.hass.states.get(track.tracker)
        home = tracker is not None and tracker.state not in (
            STATE_NOT_HOME,
            STATE_UNAVAILABLE,
            STATE_UNKNOWN,
        )
        return Observation(t=t, distances=distances, home=home)

    def _apply_occupancy(self) -> None:
        """Who is where, and the note-ons that follow.

        Somebody only counts where the filter is actually confident, so a person between
        two rooms is an occupant of neither -- ``moving`` is what an automation watches
        for that. Every room is told on every evaluation rather than only on the
        empty <-> occupied crossings: ``set_occupied`` is idempotent, and a gate closed
        underneath us by ``reset`` then heals itself on the next tick instead of staying
        shut until somebody leaves the room and comes back.
        """
        occupants: dict[str, list[str]] = {gid: [] for gid in self.topology.nodes}
        for name, track in sorted(self.devices.items()):
            out = track.outputs
            if out is None or out.room == AWAY or out.confidence < self.threshold:
                continue
            occupants[out.room].append(name)
        self.occupants = occupants
        for gid, who in occupants.items():
            self.coordinator.set_occupied(gid, bool(who))

    # -- persistence ---------------------------------------------------------

    def _snapshot(self) -> dict[str, Any]:
        return {
            "beliefs": {
                name: track.estimator.snapshot()
                for name, track in self.devices.items()
                if track.estimator is not None
            }
        }

    # -- reads ---------------------------------------------------------------

    def room_name(self, room: str) -> str:
        """A room id as a person reads it. ``away`` is a room too, as far as this goes."""
        if room == AWAY:
            return AWAY_LABEL
        info = self.coordinator.tree.groups.get(room)
        return info.name if info is not None else room

    def payload(self) -> dict[str, Any]:
        """What ``activity_levels/presence/state`` answers."""
        return {
            "enabled": True,
            "devices": {
                name: track.outputs.as_dict()
                for name, track in self.devices.items()
                if track.outputs is not None
            },
            "occupants": {gid: list(who) for gid, who in self.occupants.items()},
            "scanners": [
                {
                    "key": scanner.key,
                    "device_id": scanner.device_id,
                    "name": scanner.name,
                    "area_id": scanner.area_id,
                    "group_id": self.scanner_map.get(scanner.key),
                }
                for scanner in sorted(self.scanners.values(), key=lambda s: s.name)
            ],
            "unmapped": list(self.unmapped),
            "disabled": list(self.disabled),
        }

    def diagnostics(self) -> dict[str, Any]:
        """The mapping and each device's raw belief: the two things a bug report needs."""
        return {
            "ready": self.ready,
            "settings": dict(self.settings),
            "scanner_map": dict(self.scanner_map),
            "unmapped": list(self.unmapped),
            "disabled": list(self.disabled),
            "occupants": {gid: list(who) for gid, who in self.occupants.items()},
            "devices": {
                name: {
                    "tracker": track.tracker,
                    "sensors": dict(track.sensors),
                    "outputs": None if track.outputs is None else track.outputs.as_dict(),
                    "belief": None if track.estimator is None else track.estimator.snapshot(),
                    "resets": 0 if track.estimator is None else track.estimator.resets,
                }
                for name, track in self.devices.items()
            },
        }

    # -- repair issues -------------------------------------------------------

    def _issue(self, key: str, *, present: bool, **placeholders: str) -> None:
        """Raise or clear one repair issue, scoped to this entry."""
        issue_id = f"{key}_{self.entry.entry_id}"
        if not present:
            ir.async_delete_issue(self.hass, DOMAIN, issue_id)
            return
        ir.async_create_issue(
            self.hass,
            DOMAIN,
            issue_id,
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key=key,
            translation_placeholders=placeholders or None,
        )
