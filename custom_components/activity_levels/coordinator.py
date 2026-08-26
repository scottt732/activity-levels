"""Coordinator: drives the engine tree from HA state events and timers."""

from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import asdict, dataclass
from datetime import datetime
from functools import partial
from math import isfinite
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import STORAGE_VERSION, storage_key
from .engine import Group, Phase
from .tree import Tree, VoiceRef

_LOGGER = logging.getLogger(__name__)
_SAVE_DELAY = 10.0


@dataclass(frozen=True)
class GroupState:
    """What one group looks like right now, as published to listeners."""

    value: float
    active: bool
    gated: bool
    active_voices: int
    last_activity: float | None
    cooldown_at: float | None
    contributors: dict[str, float]


class ActivityLevelsCoordinator:
    """Owns the engine tree for one config entry."""

    def __init__(self, hass: HomeAssistant, entry_id: str, tree: Tree) -> None:
        self.hass = hass
        self.entry_id = entry_id
        self.tree = tree
        self.data: dict[str, GroupState] = {}
        self._listeners: dict[str, list[Callable[[], None]]] = {}
        self._timers: dict[str, CALLBACK_TYPE] = {}
        self._wakes: dict[str, float] = {}
        self._unsub_state: CALLBACK_TYPE | None = None
        self._stopped = False
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, storage_key(entry_id))
        self._min_wake = float(tree.defaults["min_wake_interval"])
        self._safety = float(tree.defaults["safety_refresh"])

    # -- time ----------------------------------------------------------------

    def now(self) -> float:
        return dt_util.utcnow().timestamp()

    def next_wake(self, root_id: str) -> float | None:
        return self._wakes.get(root_id)

    # -- lifecycle -----------------------------------------------------------

    async def async_start(self) -> None:
        stored = await self._store.async_load()
        t = self.now()
        if stored:
            self._restore(stored.get("voices", {}))
        self._reconcile(t)
        if self.tree.entity_ids:
            self._unsub_state = async_track_state_change_event(
                self.hass, self.tree.entity_ids, self._handle_state_event
            )
        for root in self.tree.roots:
            self._publish(root, t)
            self._schedule(root, t)

    async def async_stop(self) -> None:
        self._stopped = True
        if self._unsub_state:
            self._unsub_state()
            self._unsub_state = None
        for cancel in self._timers.values():
            cancel()
        self._timers.clear()
        self._wakes.clear()
        await self._store.async_save(self.snapshot())

    # -- listeners -----------------------------------------------------------

    @callback
    def async_add_listener(self, group_id: str, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.setdefault(group_id, []).append(cb)

        def remove() -> None:
            listeners = self._listeners.get(group_id)
            if listeners is not None and cb in listeners:  # tolerate a second call
                listeners.remove(cb)

        return remove

    # -- events --------------------------------------------------------------

    @callback
    def _handle_state_event(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        new = event.data["new_state"]
        old = event.data["old_state"]
        t = self.now()
        touched: set[str] = set()
        for ref in self.tree.voices_by_entity.get(entity_id, []):
            old_state = old.state if old else None
            new_state = new.state if new else None
            if self._apply_transition(ref, old_state, new_state, t):
                touched.add(self.tree.groups[ref.group_id].root_id)
        self._after_change(touched, t)

    @staticmethod
    def _apply_transition(
        ref: VoiceRef, old_state: str | None, new_state: str | None, t: float
    ) -> bool:
        """Map one HA state change onto the voice. Return True if anything moved."""
        voice = ref.voice
        if new_state is None or new_state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            voice.unavailable(t)
            return True
        new_in = new_state in ref.to
        old_in = old_state is not None and old_state in ref.to
        if new_in and not old_in:
            return voice.note_on(t)
        if not new_in and (old_in or voice.gate):
            voice.note_off(t)
            return True
        return False  # attribute-only update: never retrigger

    def _after_change(self, root_ids: set[str], t: float) -> None:
        if self._stopped:  # unloaded: never arm a timer or a save behind HA's back
            return
        for rid in root_ids:
            root = self.tree.groups[rid].group
            self._publish(root, t)
            self._schedule(root, t)
        if root_ids:
            self._store.async_delay_save(self.snapshot, _SAVE_DELAY)

    # -- commands ------------------------------------------------------------

    def trigger(self, group_id: str, peak: float = 1.0) -> None:
        if not (isfinite(peak) and peak > 0):
            raise ValueError("peak must be a positive finite number")
        info = self.tree.groups[group_id]
        t = self.now()
        info.trigger.gain = peak
        info.trigger.note_on(t)
        self._after_change({info.root_id}, t)

    def reset(self, group_id: str | None = None) -> None:
        t = self.now()
        if group_id is None:
            for root in self.tree.roots:
                root.reset()
            roots = {g.id for g in self.tree.roots}
        else:
            info = self.tree.groups[group_id]
            info.group.reset()
            roots = {info.root_id}
        self._after_change(roots, t)

    # -- publish / schedule --------------------------------------------------

    def _state_of(self, group: Group, t: float) -> GroupState:
        info = self.tree.groups[group.id]
        return GroupState(
            value=group.display_value_at(t),
            active=group.active_at(t),
            gated=group.gated_at(t),
            active_voices=group.active_voices(t),
            last_activity=group.last_activity(),
            cooldown_at=group.cooldown_at(t),
            contributors={
                label: rounded
                for label, v in group.contributions_at(t).items()
                if (rounded := round(v, info.precision)) > 0.0  # round first: no 0.0 entries
            },
        )

    def _publish(self, root: Group, t: float) -> None:
        for group in root.groups():
            state = self._state_of(group, t)
            if self.data.get(group.id) != state:
                self.data[group.id] = state
                for cb in list(self._listeners.get(group.id, [])):
                    cb()

    def _schedule(self, root: Group, t: float) -> None:
        if cancel := self._timers.pop(root.id, None):
            cancel()
        # Every group in the subtree gets a vote: a child stepping through its own
        # rounding edges must wake the root even while the root itself holds steady.
        candidates = [c for g in root.groups() if (c := g.next_display_change(t)) is not None]
        wake = min([t + self._safety, *candidates])
        delay = max(wake - t, self._min_wake)
        self._wakes[root.id] = t + delay
        self._timers[root.id] = async_call_later(self.hass, delay, partial(self._on_timer, root.id))

    @callback
    def _on_timer(self, root_id: str, _now: datetime) -> None:
        self._timers.pop(root_id, None)
        t = self.now()
        # A deleted entity sends no state event; this wake is where we notice it went.
        if touched := self._reconcile(t, absent_only=True):
            self._after_change(touched | {root_id}, t)  # publishes, reschedules, persists
            return
        root = self.tree.groups[root_id].group
        self._publish(root, t)
        self._schedule(root, t)

    # -- persistence ---------------------------------------------------------

    def snapshot(self) -> dict[str, Any]:
        voices = {
            self.tree.voice_key(r.group_id, r.label): r.voice.snapshot()
            for r in self.tree.all_voice_refs()
        }
        for info in self.tree.groups.values():
            voices[self.tree.voice_key(info.id, info.trigger.id)] = info.trigger.snapshot()
        return {"voices": voices}

    def _restore(self, voices: dict[str, Any]) -> None:
        for ref in self.tree.all_voice_refs():
            if data := voices.get(self.tree.voice_key(ref.group_id, ref.label)):
                ref.voice.restore(data)
        for info in self.tree.groups.values():
            if data := voices.get(self.tree.voice_key(info.id, info.trigger.id)):
                info.trigger.restore(data)

    def _reconcile(self, t: float, *, absent_only: bool = False) -> set[str]:
        """Line the voices up with the states HA holds now; return the roots that moved.

        With absent_only nothing but a vanished entity is considered: live entities are
        driven by state events, and "unavailable" stays the envelope policy's business
        so an unavailable: hold voice keeps holding.
        """
        touched: set[str] = set()
        for ref in self.tree.all_voice_refs():
            state = self.hass.states.get(ref.entity_id)
            current = state.state if state else None
            if current is None:
                # At startup the entity may simply not be back yet, so we hold; on a
                # safety wake it is gone, and a voice still gated on it should not be.
                if not (absent_only and ref.voice.gate):
                    continue
                ref.voice.note_off(t)
            elif absent_only or current in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                continue
            else:
                in_to = current in ref.to
                if in_to and not ref.voice.gate and not ref.voice.envelope.impulse:
                    ref.voice.note_on(t)
                elif not in_to and ref.voice.gate:
                    ref.voice.note_off(t)
                else:
                    continue
            touched.add(self.tree.groups[ref.group_id].root_id)
            _LOGGER.debug(
                "reconciled %s (%s) in group %s to state %r",
                ref.entity_id,
                ref.label,
                ref.group_id,
                current,
            )
        return touched

    # -- introspection for the websocket API --------------------------------

    def voice_states(self) -> dict[str, list[dict[str, Any]]]:
        t = self.now()
        out: dict[str, list[dict[str, Any]]] = {gid: [] for gid in self.tree.groups}
        for ref in self.tree.all_voice_refs():
            v = ref.voice
            v.is_active(t)  # advance the state machine before reading .phase
            out[ref.group_id].append(
                {
                    "label": ref.label,
                    "entity": ref.entity_id,
                    "phase": v.phase.value,
                    "value": v.value_at(t),
                    "gain": v.gain,
                    "gate": v.gate,
                    "phase_started": v.phase_start_t if v.phase is not Phase.IDLE else None,
                    "phase_ends": v.next_boundary(t),
                }
            )
        return out


type ActivityLevelsConfigEntry = ConfigEntry[ActivityLevelsCoordinator]


def group_state_dict(state: GroupState) -> dict[str, Any]:
    return asdict(state)
