"""The presence coordinator: Bermuda discovery, observations, occupancy.

The integration-side half of :mod:`.presence`, mirroring :class:`.PatternsCoordinator`.
It finds Bermuda's scanners and per-scanner distance sensors through the registries,
finds each person's devices -- seeded from their ``person`` entity, refined by the
configuration -- and the companion-app sensors that say whether a device is being
carried, coalesces every update into one :class:`.PersonObservation` per person per
tick, runs each person's :class:`.PersonEstimator` (and each device's own
:class:`.Estimator`, for where the *object* is), and turns the answers into occupancy
-- which is the only thing the engine ever hears about presence.

Nothing here does arithmetic on a belief: the filters own numpy, this owns Home
Assistant. Constructed only when ``presence.enabled`` is set; with Bermuda missing it
raises a repair issue and stays inert rather than failing setup.
"""

from __future__ import annotations

import logging
from collections import deque
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from datetime import datetime
from functools import partial
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_UNIT_OF_MEASUREMENT,
    STATE_NOT_HOME,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
    UnitOfLength,
)
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HomeAssistant,
    State,
    callback,
)
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util
from homeassistant.util import slugify
from homeassistant.util.unit_conversion import DistanceConverter
from homeassistant.util.unit_system import LENGTH_UNITS

from .const import (
    AWAY,
    CONF_PRESENCE,
    DOMAIN,
    ISSUE_BERMUDA_MISSING,
    ISSUE_DISABLED_SENSORS,
    ISSUE_NOT_BERMUDA,
    ISSUE_TRANSITION,
    ISSUE_UNMAPPED_SCANNERS,
    KIND_FLOOR,
    KIND_PROPERTY,
    KIND_STRUCTURE,
    PRESENCE_KEY,
    PRESENCE_STORAGE_VERSION,
    TRIGGER_KEY,
    presence_storage_key,
)
from .coordinator import ActivityLevelsCoordinator
from .presence.carried import Signals, Weights
from .presence.estimator import CANDIDATE_FLOOR, Estimator, Outputs
from .presence.observation import (
    BERMUDA_DOMAIN,
    DeviceFrame,
    Observation,
    PersonObservation,
    RoomActivity,
    parse_distance,
    scanner_key,
)
from .presence.person import PersonEstimator, PersonOutputs
from .schema import SIGNAL_KEYS
from .topology import Topology

_LOGGER = logging.getLogger(__name__)

OBSERVATION_DEBOUNCE = 0.5
"""Bermuda rewrites a device's whole row of distance sensors at once, so waiting half a
second turns a burst of N state events into one observation instead of N."""
REGISTRY_DEBOUNCE = 5.0
"""Adopting one device rewrites the device registry and then every entity on it."""
SAVE_DELAY = 10.0
AWAY_LABEL = "Away"
COMPANION_DOMAIN = "mobile_app"
MOVING_ACTIVITIES = frozenset({"walking", "running", "automotive", "cycling"})
"""What the companion app's activity sensor says while the phone is going somewhere."""
CHARGING_STATES = frozenset({"charging", "full"})
"""What its battery-state sensor says while the phone is on a cable."""
JITTER_SAMPLES = 64
"""Closest-distance readings kept per device for the jitter signal; more than
``carried.recent`` seconds of Bermuda's cadence, which is all the window ever reads."""
_FLOOR_LIKE = frozenset({KIND_FLOOR, KIND_STRUCTURE, KIND_PROPERTY})
"""The kinds a floor answer may name, nearest first: the floor itself, else whatever
stacks the rooms directly in a house that declares none."""
_NOT_EVIDENCE = frozenset({TRIGGER_KEY, PRESENCE_KEY})
"""The channels a room's evidence level leaves out: the simulation's impulses, and the
presence voice that would otherwise let the estimator confirm itself."""
_ABSENT = (STATE_NOT_HOME, STATE_UNAVAILABLE, STATE_UNKNOWN)

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
    """One of a person's devices: where its readings come from, and what we make of them.

    ``estimator`` and ``outputs`` are about the *object* -- which room the phone is in,
    carried or not. Whether it is on anybody is the person filter's question.
    """

    id: str
    name: str
    kind: str
    tracker: str
    device_id: str | None = None
    sensors: dict[str, str] = field(default_factory=dict)
    companion: str | None = None
    signals: dict[str, str | None] = field(default_factory=dict)
    found: dict[str, bool] = field(default_factory=dict)
    estimator: Estimator | None = None
    outputs: Outputs | None = None
    closest: deque[tuple[float, float]] = field(
        default_factory=lambda: deque(maxlen=JITTER_SAMPLES)
    )
    steps: float | None = None
    steps_rose_at: float | None = None


@dataclass
class TrackedPerson:
    """One person: their devices, their filter, and its last answer."""

    name: str
    person: str | None
    devices: dict[str, TrackedDevice] = field(default_factory=dict)
    estimator: PersonEstimator | None = None
    outputs: PersonOutputs | None = None


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
        self.people: dict[str, TrackedPerson] = {}
        self.scanners: dict[str, Scanner] = {}
        self.scanner_map: dict[str, str] = {}
        self.unmapped: list[str] = []
        self.disabled: list[str] = []
        self.occupants: dict[str, list[str]] = {gid: [] for gid in topology.nodes}
        self._store: Store[dict[str, Any]] = Store(
            hass, PRESENCE_STORAGE_VERSION, presence_storage_key(entry.entry_id)
        )
        self._stored: dict[str, Any] = {}
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._state_unsub: CALLBACK_TYPE | None = None
        self._registry_timer: CALLBACK_TYPE | None = None
        self._observe_timer: CALLBACK_TYPE | None = None
        self._dirty: set[str] = set()
        self._empty: dict[str, bool] = {}
        self._usable = False
        self._stopped = False

    @property
    def devices(self) -> dict[str, TrackedPerson]:
        """The people, under the name this had when a person was one device. Kept for
        one release so the entities and the panel can move over at their own pace."""
        return self.people

    # -- lifecycle -----------------------------------------------------------

    @property
    def ready(self) -> bool:
        """Whether anything is actually being estimated right now."""
        return self._usable and bool(self.people)

    async def async_start(self) -> None:
        """Load the stored beliefs, discover Bermuda, and start listening.

        A missing Bermuda, or settings the graph cannot make a transition matrix from,
        leave the coordinator inert: the issue explains it, the entry still loads, and
        every other part of the integration goes on working.
        """
        clear_presence_issues(self.hass, self.entry.entry_id)
        stored = await self._store.async_load()
        # a store we can no longer read is a uniform prior, not a failed setup
        self._stored = dict(stored) if isinstance(stored, Mapping) else {}

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
        now = dt_util.utcnow().timestamp()
        for gid, activity in self._activity(now).items():
            self._empty[gid] = activity.level <= 0.0
            self._unsubs.append(
                self.coordinator.async_add_listener(gid, partial(self._room_level_changed, gid))
            )
        self._observe(now)

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
        """Subscribe to "somebody's estimate moved"; the returned callable unsubscribes."""
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
        has to be able to move its readings with it -- but every belief is carried over
        by person and device name, because the state space has not changed.
        """
        entities = er.async_get(self.hass)
        devices = dr.async_get(self.hass)
        self.scanners = {}
        disabled: list[str] = []
        wrong: list[str] = []
        people: dict[str, TrackedPerson] = {}

        for spec in self.settings["people"]:
            tracked: list[TrackedDevice] = []
            for device_spec in self._device_specs(spec, entities):
                entry = entities.async_get(device_spec["tracker"])
                if entry is None or entry.platform != BERMUDA_DOMAIN:
                    # two different mistakes with the same consequence, and the fix
                    # differs: a typo or a removed entity, versus somebody else's tracker
                    reason = "no such entity" if entry is None else "not a Bermuda entity"
                    wrong.append(f"{device_spec['tracker']} ({reason})")
                    _LOGGER.warning(
                        "Ignoring tracked device %s: %s", device_spec["tracker"], reason
                    )
                    continue
                name = device_spec["name"] or self._tracked_name(devices, entry)
                track = TrackedDevice(
                    id=slugify(name),
                    name=name,
                    kind=device_spec["kind"],
                    tracker=entry.entity_id,
                    device_id=entry.device_id,
                    companion=device_spec["companion"],
                )
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
                self._find_signals(track, device_spec["signals"], entities)
                tracked.append(track)
            if not tracked:
                continue
            name = spec["name"] or tracked[0].name
            person = TrackedPerson(name=name, person=spec["person"])
            for track in tracked:
                # ids are entity-id fragments, so two "Phone"s must not collide
                base, suffix = track.id, 2
                while track.id in person.devices:
                    track.id = f"{base}_{suffix}"
                    suffix += 1
                person.devices[track.id] = track
            people[name] = person

        self._map_scanners()
        for name, person in people.items():
            self._build_estimators(person, self.people.get(name))
        self.people = people
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

    def _device_specs(
        self, spec: Mapping[str, Any], entities: er.EntityRegistry
    ) -> list[dict[str, Any]]:
        """The devices one person is followed by: the config's, seeded from their
        ``person`` entity.

        The person entity lists every tracker Home Assistant already knows is theirs.
        A Bermuda one is a device to follow; a mobile_app one is a companion, the thing
        the carried signals hang off. They are paired only when there is exactly one of
        each -- two phones and one companion app is a question for the configuration,
        not a guess. A configured device wins over a seeded one with the same tracker.
        """
        configured = {device["tracker"]: dict(device) for device in spec["devices"]}
        seeded: list[str] = []
        companions: list[str] = []
        if spec["person"] is not None and (state := self.hass.states.get(spec["person"])):
            for tracker in state.attributes.get("device_trackers") or []:
                entry = entities.async_get(tracker)
                if entry is None:
                    continue
                if entry.platform == BERMUDA_DOMAIN and tracker not in configured:
                    seeded.append(tracker)
                elif entry.platform == COMPANION_DOMAIN:
                    companions.append(tracker)
        claimed = {device["companion"] for device in configured.values()}
        free = [tracker for tracker in companions if tracker not in claimed]
        pair = free[0] if len(seeded) == 1 and len(free) == 1 else None
        for tracker in seeded:
            configured[tracker] = {
                "tracker": tracker,
                "name": None,
                "kind": "phone" if pair is not None else "other",
                "companion": pair,
                "signals": dict.fromkeys(SIGNAL_KEYS),
            }
        return list(configured.values())

    def _find_signals(
        self, track: TrackedDevice, explicit: Mapping[str, str | None], entities: er.EntityRegistry
    ) -> None:
        """Which entity carries each carried signal, and whether it is really there.

        An explicit entity wins. Otherwise the companion's registry device is searched
        for the sensor mobile_app registers under that key -- its unique id ends in the
        key, whatever the entity has been renamed to. ``found`` says whether the entity
        exists at all, which is what the panel shows next to each picker.
        """
        discovered: dict[str, str] = {}
        entry = None if track.companion is None else entities.async_get(track.companion)
        if entry is not None and entry.device_id is not None:
            for member in er.async_entries_for_device(entities, entry.device_id):
                if member.domain != "sensor":
                    continue
                for role in SIGNAL_KEYS:
                    if member.unique_id.endswith(f"_{role}"):
                        discovered.setdefault(role, member.entity_id)
        for role in SIGNAL_KEYS:
            entity_id = explicit.get(role) or discovered.get(role)
            track.signals[role] = entity_id
            track.found[role] = entity_id is not None and entities.async_get(entity_id) is not None

    def _build_estimators(self, person: TrackedPerson, previous: TrackedPerson | None) -> None:
        """One filter per device, one per person; beliefs carried over where they fit."""
        settings = self.settings
        stored_devices = self._stored.get("devices", {})
        stored_people = self._stored.get("people", {})
        legacy = self._stored.get("beliefs", {})
        for device_id, track in person.devices.items():
            track.estimator = Estimator(
                self.topology,
                self.scanner_map,
                stay=settings["stay"],
                escape=settings["escape"],
                scale=settings["scale"],
                floor=settings["floor"],
                stuck_after=settings["stuck_after"],
                activity_floor=settings["activity"]["floor"],
            )
            before = previous.devices.get(device_id) if previous is not None else None
            carried: Any = None
            if before is not None and before.estimator is not None:
                carried = before.estimator.snapshot()
                track.closest = before.closest
                track.steps, track.steps_rose_at = before.steps, before.steps_rose_at
            else:
                carried = stored_devices.get(person.name, {}).get(device_id)
                if carried is None and len(person.devices) == 1:
                    # the store from before people had devices: one belief per name
                    carried = legacy.get(person.name)
            if isinstance(carried, Mapping) and track.estimator.restore(carried):
                track.outputs = track.estimator.outputs()
            elif before is not None:
                track.outputs = before.outputs
        weights = Weights(**settings["carried"]["weights"])
        filters = {
            device_id: track.estimator
            for device_id, track in person.devices.items()
            if track.estimator is not None
        }
        person.estimator = PersonEstimator(
            self.topology,
            filters,
            stay=settings["stay"],
            escape=settings["escape"],
            prior=settings["carried"]["prior"],
            flip=settings["carried"]["flip"],
            recent=settings["carried"]["recent"],
            weights=weights,
            stuck_after=settings["stuck_after"],
            nearby=settings["carried"]["nearby"],
            activity_floor=settings["activity"]["floor"],
        )
        carried = (
            previous.estimator.snapshot()
            if previous is not None and previous.estimator is not None
            else stored_people.get(person.name)
        )
        if isinstance(carried, Mapping) and person.estimator.restore(carried):
            person.outputs = person.estimator.outputs()
        elif previous is not None:
            person.outputs = previous.outputs

    def _tracked_name(self, devices: dr.DeviceRegistry, entry: er.RegistryEntry) -> str:
        """What to call the device behind one Bermuda tracker.

        Bermuda names every one of its ``device_tracker`` entities "Bermuda Tracker" and
        leans on ``has_entity_name`` to put the device in front of it, so the entity's
        own name identifies nothing -- it is the device, "Scott's iPhone", that says
        whose phone this is. A name the user typed into Home Assistant still wins,
        because that is a deliberate answer to this very question.
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

        def fingerprint() -> tuple[dict[str, str], dict[str, dict[str, Any]]]:
            return (
                dict(self.scanner_map),
                {
                    name: {
                        device_id: (dict(track.sensors), dict(track.signals), track.companion)
                        for device_id, track in person.devices.items()
                    }
                    for name, person in self.people.items()
                },
            )

        before = fingerprint()
        self._discover()
        if before == fingerprint():
            return
        self._subscribe()
        self._observe(dt_util.utcnow().timestamp())

    # -- observations --------------------------------------------------------

    def _watched(self) -> set[str]:
        watched: set[str] = set()
        for person in self.people.values():
            for track in person.devices.values():
                watched.add(track.tracker)
                watched.update(track.sensors)
                watched.update(entity_id for entity_id in track.signals.values() if entity_id)
        return watched

    def _subscribe(self) -> None:
        """Point the state subscription at the entities discovery just found."""
        if self._state_unsub is not None:
            self._state_unsub()
            self._state_unsub = None
        watched = sorted(self._watched())
        if not watched:
            return
        self._state_unsub = async_track_state_change_event(
            self.hass, watched, self._handle_state_event
        )

    @callback
    def _handle_state_event(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        for name, person in self.people.items():
            for track in person.devices.values():
                if (
                    entity_id == track.tracker
                    or entity_id in track.sensors
                    or entity_id in track.signals.values()
                ):
                    self._dirty.add(name)
        if not self._dirty or self._observe_timer is not None:
            return
        self._observe_timer = async_call_later(self.hass, OBSERVATION_DEBOUNCE, self._observe_due)

    @callback
    def _room_level_changed(self, gid: str) -> None:
        """A room's level moved. Only the empty <-> busy crossing is worth a frame.

        Every other change is already in the level the next Bermuda frame will read;
        re-running the filter on an unchanged frame for each of them would count the
        same readings twice. The crossing is different: the moment a room's evidence
        level reaches zero it stops being somewhere this person can be, and waiting for
        a phone to move first would leave a wrong belief standing for no reason.

        Read against the *evidence* level, not the published one -- a room whose only
        contributor is the presence voice of the very person we are placing is empty by
        this measure, and that is exactly the case that has to fire.
        """
        if self._stopped or not self._usable or not self.people:
            return
        activity = self._activity(self.coordinator.now()).get(gid)
        if activity is None:
            return
        empty = activity.level <= 0.0
        if self._empty.get(gid) is empty:
            return
        self._empty[gid] = empty
        self._dirty.update(self.people)
        if self._observe_timer is None:
            self._observe_timer = async_call_later(
                self.hass, OBSERVATION_DEBOUNCE, self._observe_due
            )

    @callback
    def _observe_due(self, _now: datetime) -> None:
        self._observe_timer = None
        if self._stopped:
            return
        self._observe(dt_util.utcnow().timestamp())

    def _observe(self, t: float) -> None:
        """Run the filters for every person whose readings moved since the last tick.

        The person filter goes first, because it reads each device filter's *prediction*
        for this frame -- the "explained by wherever the object is" half of its emission
        -- and that has to be read before the device filter sees the frame itself.

        Occupancy is reapplied whether or not a filter ran, because "nothing moved" is
        not the same as "nothing changed": discovery can have just taken the last tracked
        person away, and then the only thing that releases the gates is an evaluation
        over an empty set. Only the persist and the notify are skipped when there was
        nothing to filter, since neither has anything new to say.
        """
        names = sorted(self._dirty) or sorted(self.people)
        self._dirty.clear()
        moved = False
        activity = self._activity(t)
        for name in names:
            person = self.people.get(name)
            if person is None or person.estimator is None:
                continue
            frames = {
                device_id: self._frame(track, t, activity)
                for device_id, track in person.devices.items()
            }
            person.outputs = person.estimator.update(
                PersonObservation(t=t, devices=frames, activity=activity)
            )
            for device_id, track in person.devices.items():
                if track.estimator is None:
                    continue
                frame = frames[device_id]
                track.outputs = track.estimator.update(
                    Observation(t=t, distances=frame.distances, home=frame.home, activity=activity)
                )
            moved = True
        self._apply_occupancy()
        if not moved:
            return
        self._store.async_delay_save(self._snapshot, SAVE_DELAY)
        self._notify()

    def _frame(
        self,
        track: TrackedDevice,
        t: float,
        activity: Mapping[str, RoomActivity] | None = None,
    ) -> DeviceFrame:
        """One device's full frame: every scanner we know of, ``None`` where there is no
        reading, plus everything the carried signals can say right now.

        Never a delta of what changed -- the filter reads a missing scanner as silence
        and floors its room, so leaving an unchanged reading out would quietly promote
        every room nobody can hear.
        """
        distances: dict[str, float | None] = {}
        for entity_id, key in track.sensors.items():
            state = self.hass.states.get(entity_id)
            distances[key] = None if state is None else self._metres(state)
        # `unavailable` and `unknown` read as not-home on purpose: an absent answer is
        # not evidence that somebody is in the house, and the filter's away state is the
        # honest place for "we cannot see them". The cost is that a Bermuda reload, which
        # takes every tracker through `unavailable` and back, flips everybody to Away and
        # then home again -- a burst of note-offs and note-ons rather than a wrong belief.
        tracker = self.hass.states.get(track.tracker)
        home = tracker is not None and tracker.state not in _ABSENT
        if activity is None:
            activity = self._activity(t)
        return DeviceFrame(
            distances=distances,
            home=home,
            signals=self._signals(track, t, distances, activity),
        )

    def _signals(
        self,
        track: TrackedDevice,
        t: float,
        distances: Mapping[str, float | None],
        activity: Mapping[str, RoomActivity],
    ) -> Signals:
        """The side evidence about one device being carried, from whatever exists.

        Each signal is ``None`` when nothing can say: no companion sensor, no history
        yet. The estimator reads ``None`` as silence, so a watch with no companion app
        is judged on its readings alone rather than on absent sensors.
        """
        recent: float = self.settings["carried"]["recent"]
        charging = self._read(track, "battery_state")
        motion = self._read(track, "activity")
        steps = self._read(track, "steps")

        moving: bool | None = None
        if motion is not None:
            moving = motion in MOVING_ACTIVITIES
        if steps is not None:
            try:
                count = float(steps)
            except ValueError:
                count = None
            if count is not None:
                if track.steps is not None and count > track.steps:
                    track.steps_rose_at = t
                track.steps = count
                rose = track.steps_rose_at is not None and t - track.steps_rose_at <= recent
                moving = True if rose else (moving if moving is not None else False)

        heard = [d for d in distances.values() if d is not None]
        if heard:
            track.closest.append((t, min(heard)))
        window = [d for when, d in track.closest if t - when <= recent]
        jitter: bool | None = None
        if len(window) >= 2:
            jitter = (max(window) - min(window)) > self.settings["scale"] / 3.0

        still_room_empty: bool | None = None
        if moving is not True and track.outputs is not None and track.outputs.room != AWAY:
            level = activity.get(track.outputs.room)
            if level is not None:
                still_room_empty = level.level <= 0.0

        return Signals(
            charging=None if charging is None else charging in CHARGING_STATES,
            moving=moving,
            still_room_empty=still_room_empty,
            jitter=jitter,
        )

    def _read(self, track: TrackedDevice, role: str) -> str | None:
        """One companion sensor's state, or None when there is no usable reading."""
        entity_id = track.signals.get(role)
        if entity_id is None:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        return state.state

    def _activity(self, t: float) -> dict[str, RoomActivity]:
        """Every room's evidence level: the mix with the trigger and presence voices out.

        The presence voice is left out so the estimator never reads a level it raised
        itself; the trigger voice, so the simulation's test impulses are not mistaken for
        a person. ``t`` is this side's own clock reading, taken from the same clock the
        level coordinator uses and never earlier than its last, so the engine's
        never-backwards contract holds across the two.
        """
        activity: dict[str, RoomActivity] = {}
        for gid in self.topology.nodes:
            info = self.coordinator.tree.groups.get(gid)
            if info is None:
                continue
            level = info.group.value_at_excluding(t, _NOT_EVIDENCE) / info.max_value
            activity[gid] = RoomActivity(
                level=min(level, 1.0), slope=info.group.slope_at(t), floor=info.activity_floor
            )
        return activity

    @staticmethod
    def _metres(state: State) -> float | None:
        """One distance sensor's reading, in the unit the filter is tuned for.

        Bermuda measures in metres, but that is not what the state machine holds. A
        distance sensor is converted to the unit system's preferred length -- feet, on a
        US-customary install -- before its state is written, and the user can pick any
        length unit for it besides. ``scale`` and ``floor`` are metres, so feet read as
        metres put every scanner three times further away than it is: a phone sitting
        beside its own room's scanner looks far enough that every room *without* a
        scanner outranks it, and the belief wanders the house all night. The unit is on
        the state, so the reading is converted here, on the Home Assistant side of the
        line, and the filter never learns there was another unit.
        """
        value = parse_distance(state.state)
        if value is None:
            return None
        unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
        if unit is None or unit == UnitOfLength.METERS or unit not in LENGTH_UNITS:
            return value
        return DistanceConverter.convert(value, unit, UnitOfLength.METERS)

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
        for name, person in sorted(self.people.items()):
            out = person.outputs
            if out is None or out.room == AWAY or out.confidence < self.threshold:
                continue
            occupants[out.room].append(name)
        self.occupants = occupants
        for gid, who in occupants.items():
            self.coordinator.set_occupied(gid, bool(who))

    # -- persistence ---------------------------------------------------------

    def _snapshot(self) -> dict[str, Any]:
        return {
            "people": {
                name: person.estimator.snapshot()
                for name, person in self.people.items()
                if person.estimator is not None
            },
            "devices": {
                name: {
                    device_id: track.estimator.snapshot()
                    for device_id, track in person.devices.items()
                    if track.estimator is not None
                }
                for name, person in self.people.items()
            },
        }

    # -- reads ---------------------------------------------------------------

    def room_name(self, room: str) -> str:
        """A room id as a person reads it. ``away`` is a room too, as far as this goes."""
        if room == AWAY:
            return AWAY_LABEL
        info = self.coordinator.tree.groups.get(room)
        return info.name if info is not None else room

    def floor_of(self, room: str) -> str | None:
        """The group a room's floor answer names.

        The nearest floor above the room, else the building or the property it sits in:
        a bungalow's rooms and an outside area still get an answer, and the entity says
        what kind of thing it named. ``None`` only for a room the tree does not know.
        """
        groups = self.coordinator.tree.groups
        info = groups.get(room)
        while info is not None and info.parent_id is not None:
            info = groups.get(info.parent_id)
            if info is not None and info.kind in _FLOOR_LIKE:
                return info.id
        return None

    def floor_name(self, group_id: str) -> str:
        """A floor group as a person reads it: the registry's floor name when the group
        is bound to one, else the group's own name."""
        info = self.coordinator.tree.groups.get(group_id)
        if info is not None and info.floor_id is not None:
            entry = fr.async_get(self.hass).async_get_floor(info.floor_id)
            if entry is not None:
                return entry.name
        return info.name if info is not None else group_id

    def floor_estimate(self, name: str) -> tuple[str | None, float, dict[str, float]]:
        """``(floor group id, its belief mass, the rooms on it)`` for one person.

        Mass is summed from the whole belief, not from ``candidates``: a floor of five
        rooms at 0.08 each is a confident floor and no confident room, and that is the
        whole point of answering at the floor. ``away`` is its own answer with no floor.
        """
        person = self.people.get(name)
        out = None if person is None else person.outputs
        if out is None or person is None or person.estimator is None:
            return None, 0.0, {}
        if out.room == AWAY:
            return None, out.confidence, {}
        floor = self.floor_of(out.room)
        if floor is None:
            return None, out.confidence, dict(out.candidates)
        belief = person.estimator.room_belief
        mass = 0.0
        rooms: dict[str, float] = {}
        for i, state in enumerate(person.estimator.states):
            if state == AWAY or self.floor_of(state) != floor:
                continue
            p = float(belief[i])
            mass += p
            if p > CANDIDATE_FLOOR:
                rooms[state] = round(p, 4)
        return floor, round(mass, 4), rooms

    def _device_payload(self, track: TrackedDevice, out: PersonOutputs | None) -> dict[str, Any]:
        return {
            "name": track.name,
            "kind": track.kind,
            "tracker": track.tracker,
            "companion": track.companion,
            "room": None if track.outputs is None else track.outputs.room,
            "confidence": None if track.outputs is None else track.outputs.confidence,
            "carried": None if out is None else out.carried.get(track.id),
            "signals": dict(track.signals),
            "found": dict(track.found),
        }

    def payload(self) -> dict[str, Any]:
        """What ``activity_levels/presence/state`` answers."""
        people = {
            name: {
                **(person.outputs.as_dict() if person.outputs is not None else {}),
                "person": person.person,
                "devices": {
                    device_id: self._device_payload(track, person.outputs)
                    for device_id, track in person.devices.items()
                },
            }
            for name, person in self.people.items()
        }
        return {
            "enabled": True,
            "people": people,
            # the map this answered with when a person was one device; one release
            "devices": {
                name: person.outputs.as_dict()
                for name, person in self.people.items()
                if person.outputs is not None
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
        """The mapping and every raw belief: the things a bug report needs."""
        return {
            "ready": self.ready,
            "settings": dict(self.settings),
            "scanner_map": dict(self.scanner_map),
            "unmapped": list(self.unmapped),
            "disabled": list(self.disabled),
            "occupants": {gid: list(who) for gid, who in self.occupants.items()},
            "devices": {
                name: {
                    "person": person.person,
                    "outputs": None if person.outputs is None else person.outputs.as_dict(),
                    "belief": None if person.estimator is None else person.estimator.snapshot(),
                    "resets": 0 if person.estimator is None else person.estimator.resets,
                    "devices": {
                        device_id: {
                            "tracker": track.tracker,
                            "kind": track.kind,
                            "companion": track.companion,
                            "sensors": dict(track.sensors),
                            "signals": dict(track.signals),
                            "found": dict(track.found),
                            "outputs": None if track.outputs is None else track.outputs.as_dict(),
                            "belief": None
                            if track.estimator is None
                            else track.estimator.snapshot(),
                            "resets": 0 if track.estimator is None else track.estimator.resets,
                        }
                        for device_id, track in person.devices.items()
                    },
                }
                for name, person in self.people.items()
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
