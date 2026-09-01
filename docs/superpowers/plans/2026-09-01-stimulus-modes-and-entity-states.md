# Stimulus modes and entity states — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give a stimulus a `sustained`/`momentary` mode with per-edge firing, replace the free-text "Active states" box with a real state picker, and show the entity's own icon and formatted state on stimulus rows.

**Architecture:** `to` keeps its meaning and gains two neighbours, `mode` and `edges`. The engine is untouched: `tree.py` forces `impulse=True` on a momentary voice at build time, and `coordinator.py` maps edges onto `note_on`. The panel grows one pure module (`entity-states.ts`) that answers "what states can this entity be in, and what are they called", which serves both the picker and the row chips.

**Tech Stack:** Python 3.14 + voluptuous + pytest (uv); Lit + TypeScript + Vite + vitest (pnpm).

**Spec:** `docs/superpowers/specs/2026-09-01-stimulus-modes-and-entity-states-design.md`

## Global Constraints

- The panel bundle `custom_components/activity_levels/frontend/activity-levels-panel.js` is committed. Any change under `frontend/src/` must be followed by `pnpm -C frontend build` and the bundle committed in the same commit. CI runs `git diff --exit-code` on it.
- Never hand-edit `manifest.json` `version`, `pyproject.toml` `version`, or `CHANGELOG.md`. release-please owns all three.
- `engine/`, `patterns/`, `presence/` and `topology.py` must not import `homeassistant`. Nothing in this plan touches them.
- `ruff` line-length 100, rules `E,F,I,UP,B,SIM,RUF,ANN`; annotations required outside `tests/`. `mypy --strict` covers `custom_components/activity_levels` only.
- Conventional Commits. Types in use include `feat`, `fix`, `refactor`, `docs`, `test`. Scopes in use here: `config`, `coordinator`, `panel`, `readme`.
- Prose in docstrings and comments explains *why*, in complete sentences. Match the surrounding density.
- `to` semantics are unchanged and `mode` defaults to today's behaviour, so nothing in this plan is a breaking change.

---

### Task 1: Schema — `mode` and `edges`

**Files:**
- Modify: `custom_components/activity_levels/const.py` (after `DEFAULT_CONNECTION`)
- Modify: `custom_components/activity_levels/schema.py` (`STIMULUS_SCHEMA`)
- Modify: `custom_components/activity_levels/config.schema.json` (regenerated, not hand-edited)
- Test: `tests/test_schema.py`

**Interfaces:**
- Consumes: nothing.
- Produces: `MODE_SUSTAINED = "sustained"`, `MODE_MOMENTARY = "momentary"`, `MODES = (MODE_SUSTAINED, MODE_MOMENTARY)`, `EDGE_ENTER = "enter"`, `EDGE_LEAVE = "leave"`, `EDGES = (EDGE_ENTER, EDGE_LEAVE)`, all from `const.py`. A validated stimulus dict gains `mode: str` and `edges: list[str]`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/test_schema.py`:

```python
def test_stimulus_mode_defaults_to_sustained_with_both_edges():
    cfg = validate_config(
        {
            "version": 1,
            "envelopes": [{"id": "default"}],
            "groups": [
                {
                    "id": "house",
                    "kind": "property",
                    "children": [
                        {
                            "id": "hall",
                            "kind": "area",
                            "stimuli": [{"entity": "binary_sensor.door"}],
                        }
                    ],
                }
            ],
        }
    )
    stim = cfg["groups"][0]["children"][0]["stimuli"][0]
    assert stim["mode"] == "sustained"
    assert stim["edges"] == ["enter", "leave"]


def test_stimulus_accepts_momentary_with_one_edge():
    cfg = validate_config(_one_stimulus({"mode": "momentary", "edges": ["enter"]}))
    stim = cfg["groups"][0]["children"][0]["stimuli"][0]
    assert stim["mode"] == "momentary"
    assert stim["edges"] == ["enter"]


def test_stimulus_rejects_an_unknown_mode():
    with pytest.raises(ConfigError) as exc:
        validate_config(_one_stimulus({"mode": "latching"}))
    assert any("mode" in e["path"] for e in exc.value.errors)


def test_stimulus_rejects_an_empty_edge_list():
    with pytest.raises(ConfigError) as exc:
        validate_config(_one_stimulus({"mode": "momentary", "edges": []}))
    assert any("edges" in e["path"] for e in exc.value.errors)


def test_edges_are_inert_under_sustained():
    """Kept rather than rejected: the panel's mode radio flips back and forth, and a
    document that will not save because of a field the form is not showing is a bad
    trade for a rule nothing depends on."""
    cfg = validate_config(_one_stimulus({"mode": "sustained", "edges": ["leave"]}))
    assert cfg["groups"][0]["children"][0]["stimuli"][0]["edges"] == ["leave"]
```

Add the helper near the top of the file's helpers:

```python
def _one_stimulus(extra: dict[str, Any]) -> dict[str, Any]:
    """A minimal valid document whose single stimulus carries `extra`."""
    return {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "house",
                "kind": "property",
                "children": [
                    {
                        "id": "hall",
                        "kind": "area",
                        "stimuli": [{"entity": "binary_sensor.door", **extra}],
                    }
                ],
            }
        ],
    }
```

- [ ] **Step 2: Run the tests and watch them fail**

Run: `uv run pytest tests/test_schema.py -k "mode or edge" -v`
Expected: FAIL — `mode` and `edges` are extra keys voluptuous refuses.

- [ ] **Step 3: Add the constants**

In `const.py`, after `DEFAULT_CONNECTION = "door"`:

```python
MODE_SUSTAINED = "sustained"
MODE_MOMENTARY = "momentary"

MODES = (MODE_SUSTAINED, MODE_MOMENTARY)
"""How a stimulus reads its entity. `sustained` holds a note while the entity sits in its
active states, which is what a light or a media player wants. `momentary` treats each
crossing as an event and lets go again -- an interior door, read as "somebody walked
through here" rather than "a door is open"."""

EDGE_ENTER = "enter"
EDGE_LEAVE = "leave"

EDGES = (EDGE_ENTER, EDGE_LEAVE)
"""Which crossings of the active states a momentary stimulus fires on. `enter` is a
transition into them, `leave` is a transition out. An exterior door that only matters when
it opens is `[enter]`; a door read as a footstep is both."""
```

- [ ] **Step 4: Add the schema entries**

In `schema.py`, import `EDGE_ENTER`, `EDGE_LEAVE`, `EDGES`, `MODE_SUSTAINED`, `MODES` from `.const`, and add to `STIMULUS_SCHEMA`'s dict, after the `to` line:

```python
            vol.Optional("mode", default=MODE_SUSTAINED): vol.In(MODES),
            vol.Optional("edges", default=lambda: [EDGE_ENTER, EDGE_LEAVE]): vol.All(
                [vol.In(EDGES)], vol.Length(min=1)
            ),
```

A callable default is used because voluptuous shares a literal default between every
stimulus it validates, and a shared mutable list is a bug waiting for the first caller
that sorts it in place.

- [ ] **Step 5: Run the tests**

Run: `uv run pytest tests/test_schema.py -v`
Expected: PASS, including the existing `test_a_validated_document_validates_again_unchanged`.

- [ ] **Step 6: Regenerate the JSON Schema**

Run: `uv run python scripts/export_schema.py && uv run pytest tests/test_schema_json.py -v`
Expected: `config.schema.json` gains `mode` and `edges` enums; the drift test passes.

- [ ] **Step 7: Commit**

```bash
git add custom_components/activity_levels/const.py custom_components/activity_levels/schema.py custom_components/activity_levels/config.schema.json tests/test_schema.py
git commit -m "feat(config): a stimulus has a mode and, for momentary, which edges fire"
```

---

### Task 2: Tree — carry the mode, force the impulse

**Files:**
- Modify: `custom_components/activity_levels/tree.py` (`VoiceRef`, `build`)
- Test: `tests/test_tree.py`

**Interfaces:**
- Consumes: `MODE_MOMENTARY`, `EDGES` from Task 1.
- Produces: `VoiceRef(entity_id, to, voice, group_id, label, mode, edges)` — `mode: str`, `edges: frozenset[str]`, both positional after `label`.

- [ ] **Step 1: Write the failing test**

Append to `tests/test_tree.py`:

```python
def test_a_momentary_stimulus_is_built_as_an_impulse_whatever_the_preset_says():
    """A momentary source only ever plays note_on, and note_on on a sustaining envelope
    opens a gate nothing will ever close. Forcing impulse at build time is what makes
    that configuration unreachable rather than merely discouraged."""
    tree = build_tree(
        validate_config(
            {
                "version": 1,
                "envelopes": [{"id": "default", "release": "30m", "impulse": False}],
                "groups": [
                    {
                        "id": "house",
                        "kind": "property",
                        "children": [
                            {
                                "id": "hall",
                                "kind": "area",
                                "stimuli": [
                                    {"entity": "binary_sensor.door", "mode": "momentary"},
                                    {"entity": "binary_sensor.lamp", "key": "lamp"},
                                ],
                            }
                        ],
                    }
                ],
            }
        )
    )
    door = tree.voices_by_entity["binary_sensor.door"][0]
    lamp = tree.voices_by_entity["binary_sensor.lamp"][0]
    assert door.voice.envelope.impulse is True
    assert door.mode == "momentary"
    assert door.edges == frozenset({"enter", "leave"})
    assert lamp.voice.envelope.impulse is False
    assert lamp.mode == "sustained"
```

- [ ] **Step 2: Run it and watch it fail**

Run: `uv run pytest tests/test_tree.py -k momentary -v`
Expected: FAIL — `VoiceRef` has no attribute `mode`.

- [ ] **Step 3: Implement**

In `tree.py`, add to `VoiceRef`:

```python
    mode: str
    edges: frozenset[str]
```

Import `dataclasses.replace` and `MODE_MOMENTARY` from `.const`, then in `build()` replace the stimulus loop body:

```python
        for stim in node["stimuli"]:
            envelope = resolve_envelope(defaults, presets, stim)
            if stim["mode"] == MODE_MOMENTARY:
                # A momentary source only plays note_on, and note_on on a sustaining
                # envelope opens a gate nothing will ever close. Forcing it here, once,
                # is what keeps that configuration unreachable -- and it also means the
                # startup reconcile skips these voices for free, because it already
                # refuses to note_on an impulse and only ever notes off a gated voice.
                envelope = replace(envelope, impulse=True)
            voice = Voice(
                id=stim["entity"],
                gain=stim["gain"],
                envelope=envelope,
                ceiling=max_value,
            )
            channel = Channel(voice, key=stim["key"])
            channels.append(channel)
            ref = VoiceRef(
                stim["entity"],
                frozenset(stim["to"]),
                voice,
                gid,
                channel.label,
                stim["mode"],
                frozenset(stim["edges"]),
            )
            tree.voices_by_entity.setdefault(stim["entity"], []).append(ref)
```

- [ ] **Step 4: Run the tests**

Run: `uv run pytest tests/test_tree.py -v && uv run mypy`
Expected: PASS, clean.

- [ ] **Step 5: Commit**

```bash
git add custom_components/activity_levels/tree.py tests/test_tree.py
git commit -m "feat(config): a momentary stimulus builds as an impulse voice"
```

---

### Task 3: Coordinator — fire on the chosen edges

**Files:**
- Modify: `custom_components/activity_levels/coordinator.py` (`_apply_transition`, ~line 132)
- Test: `tests/test_coordinator.py`

**Interfaces:**
- Consumes: `VoiceRef.mode`, `VoiceRef.edges` from Task 2.
- Produces: no new names. `_apply_transition` keeps its signature and return type.

- [ ] **Step 1: Write the failing tests**

Append to `tests/test_coordinator.py`, following that file's existing fixture style:

```python
def _momentary_ref(edges: list[str], envelope_impulse: bool = True) -> VoiceRef:
    voice = Voice(
        id="binary_sensor.door",
        gain=1.0,
        envelope=Envelope(release=60.0, impulse=envelope_impulse),
        ceiling=5.0,
    )
    return VoiceRef(
        "binary_sensor.door", frozenset({"on"}), voice, "hall", "door", "momentary", frozenset(edges)
    )


def test_momentary_fires_on_both_edges():
    ref = _momentary_ref(["enter", "leave"])
    assert Coordinator._apply_transition(ref, "off", "on", 0.0) is True
    assert ref.voice.value_at(0.0) > 0.0
    assert Coordinator._apply_transition(ref, "on", "off", 1.0) is True


def test_momentary_enter_only_ignores_the_closing_edge():
    ref = _momentary_ref(["enter"])
    assert Coordinator._apply_transition(ref, "off", "on", 0.0) is True
    assert Coordinator._apply_transition(ref, "on", "off", 1.0) is False


def test_momentary_leave_only_ignores_the_opening_edge():
    ref = _momentary_ref(["leave"])
    assert Coordinator._apply_transition(ref, "off", "on", 0.0) is False
    assert Coordinator._apply_transition(ref, "on", "off", 1.0) is True


def test_momentary_never_gates():
    """The whole point: there is no note_off to play, so a momentary voice that could
    gate would stay up until something else reset it."""
    ref = _momentary_ref(["enter", "leave"])
    Coordinator._apply_transition(ref, "off", "on", 0.0)
    assert ref.voice.gate is False


def test_momentary_reports_no_change_when_the_entity_goes_unavailable():
    """An impulse voice has no gate to release, so the note_off behind `unavailable`
    is a no-op -- reporting True there would republish a group that cannot have moved."""
    ref = _momentary_ref(["enter", "leave"])
    assert Coordinator._apply_transition(ref, "on", STATE_UNAVAILABLE, 1.0) is False
```

- [ ] **Step 2: Run them and watch them fail**

Run: `uv run pytest tests/test_coordinator.py -k momentary -v`
Expected: FAIL — the enter-only and leave-only cases fire on both, and the unavailable case returns True.

- [ ] **Step 3: Implement**

In `coordinator.py`, import `EDGE_ENTER`, `EDGE_LEAVE`, `MODE_MOMENTARY` from `.const` and rewrite `_apply_transition`:

```python
    @staticmethod
    def _apply_transition(
        ref: VoiceRef, old_state: str | None, new_state: str | None, t: float
    ) -> bool:
        """Map one HA state change onto the voice. Return True if anything moved."""
        voice = ref.voice
        momentary = ref.mode == MODE_MOMENTARY
        if new_state is None or new_state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            if momentary:
                # A momentary voice is an impulse, so it has no gate to release and
                # `unavailable` is a no-op. Saying so is what keeps a vanished door from
                # republishing a group that cannot have moved.
                return False
            voice.unavailable(t)
            return True
        new_in = new_state in ref.to
        old_in = old_state is not None and old_state in ref.to
        if momentary:
            if new_in and not old_in and EDGE_ENTER in ref.edges:
                return voice.note_on(t)
            if old_in and not new_in and EDGE_LEAVE in ref.edges:
                return voice.note_on(t)
            return False
        if new_in and not old_in:
            return voice.note_on(t)
        if not new_in and (old_in or voice.gate):
            voice.note_off(t)
            return True
        return False  # attribute-only update: never retrigger
```

- [ ] **Step 4: Run the whole suite**

Run: `uv run pytest && uv run mypy && uv run ruff check . && uv run ruff format --check .`
Expected: PASS, clean.

- [ ] **Step 5: Commit**

```bash
git add custom_components/activity_levels/coordinator.py tests/test_coordinator.py
git commit -m "feat(coordinator): a momentary stimulus fires on the edges it chose"
```

---

### Task 4: README

**Files:**
- Modify: `README.md` (trigger paragraph ~19-22; configuration reference's stimulus table)

- [ ] **Step 1: Rewrite the trigger paragraph**

Extend the paragraph beginning "Each configured stimulus is a **trigger**" with the mode
distinction, in the README's existing voice — a sustained stimulus holds while the entity
is in its `to` states; a momentary one treats each crossing as an event, fires on `enter`,
`leave` or both, and is always an impulse because there is nothing holding it open.

- [ ] **Step 2: Add `mode` and `edges` to the configuration reference**

Find the stimulus key table and add both rows beside `to`, with defaults `sustained` and
`[enter, leave]`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): document stimulus modes and edges"
```

---

### Task 5: Panel types and `newStimulus`

**Files:**
- Modify: `frontend/src/types.ts` (`Stimulus`, `HomeAssistant`)
- Modify: `frontend/src/model.ts` (`newStimulus`, ~line 127)
- Test: `frontend/test/model.test.ts`

**Interfaces:**
- Produces: `StimulusMode = "sustained" | "momentary"`, `StimulusEdge = "enter" | "leave"`, `Stimulus.mode: StimulusMode`, `Stimulus.edges: StimulusEdge[]`, `HomeAssistant.formatEntityState?: (stateObj: HassEntity) => string`.

- [ ] **Step 1: Write the failing test**

Append to `frontend/test/model.test.ts`:

```ts
it("starts a new stimulus sustained, firing on both edges", () => {
  const stimulus = newStimulus("binary_sensor.door");
  expect(stimulus.mode).toBe("sustained");
  expect(stimulus.edges).toEqual(["enter", "leave"]);
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm -C frontend test -- model` — Expected: FAIL, `mode` is undefined.

- [ ] **Step 3: Implement**

In `types.ts`, above `Stimulus`:

```ts
/** How a stimulus reads its entity: hold while active, or fire on each crossing. */
export type StimulusMode = "sustained" | "momentary";

/** Which crossings of the active states a momentary stimulus fires on. */
export type StimulusEdge = "enter" | "leave";
```

Add to `Stimulus`: `mode: StimulusMode;` and `edges: StimulusEdge[];`.

Add to `HomeAssistant`, beside `localize`:

```ts
  /** Optional: an older frontend has no state formatter, so callers fall back to `localize`. */
  formatEntityState?: (stateObj: HassEntity) => string;
```

In `model.ts`, add `mode: "sustained",` and `edges: ["enter", "leave"],` to `newStimulus`
after `to`.

- [ ] **Step 4: Run**

Run: `pnpm -C frontend test -- model && pnpm -C frontend typecheck`
Expected: PASS. (Other tests may fail to typecheck until Task 7; that is fine — run
`typecheck` again at the end of Task 7.)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types.ts frontend/src/model.ts frontend/test/model.test.ts
git commit -m "feat(panel): a stimulus carries a mode and its edges"
```

---

### Task 6: `entity-states.ts` — what states, and what they are called

**Files:**
- Create: `frontend/src/entity-states.ts`
- Test: `frontend/test/entity-states.test.ts`

**Interfaces:**
- Produces:
  - `stateLabel(hass: HomeAssistant | undefined, entityId: string, state: string): string`
  - `stateOptions(hass: HomeAssistant | undefined, entityId: string, selected: readonly string[]): { value: string; label: string }[]`
  - `entityStateText(hass: HomeAssistant | undefined, entityId: string): string | null`
  - `edgeLabels(hass: HomeAssistant | undefined, entityId: string, to: readonly string[]): { enter: string; leave: string }`

- [ ] **Step 1: Write the failing tests**

Create `frontend/test/entity-states.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { edgeLabels, entityStateText, stateLabel, stateOptions } from "../src/entity-states";
import type { HomeAssistant } from "../src/types";

const hass = (over: Partial<HomeAssistant> = {}): HomeAssistant =>
  ({
    states: {
      "binary_sensor.door": {
        entity_id: "binary_sensor.door",
        state: "on",
        attributes: { device_class: "door" },
        last_changed: "",
      },
      "media_player.tv": {
        entity_id: "media_player.tv",
        state: "playing",
        attributes: {},
        last_changed: "",
      },
    },
    localize: (key: string) =>
      key === "component.binary_sensor.entity_component.door.state.on" ? "Open" : "",
    ...over,
  }) as unknown as HomeAssistant;

describe("stateLabel", () => {
  it("uses the device-class translation when there is one", () => {
    expect(stateLabel(hass(), "binary_sensor.door", "on")).toBe("Open");
  });

  it("falls back to a capitalised state when nothing is translated", () => {
    expect(stateLabel(hass(), "media_player.tv", "playing")).toBe("Playing");
    expect(stateLabel(hass(), "media_player.tv", "not_home")).toBe("Not home");
  });

  it("survives a missing hass", () => {
    expect(stateLabel(undefined, "binary_sensor.door", "on")).toBe("On");
  });
});

describe("stateOptions", () => {
  it("offers the states of the domain, labelled", () => {
    expect(stateOptions(hass(), "binary_sensor.door", ["on"])).toEqual([
      { value: "on", label: "Open" },
      { value: "off", label: "Off" },
    ]);
  });

  it("keeps a configured state the table does not know", () => {
    const options = stateOptions(hass(), "media_player.tv", ["announcing"]);
    expect(options.map((o) => o.value)).toContain("announcing");
  });

  it("keeps the current state of an entity from an unknown domain", () => {
    const h = hass({
      states: {
        "foo.bar": { entity_id: "foo.bar", state: "wibbling", attributes: {}, last_changed: "" },
      },
    } as Partial<HomeAssistant>);
    expect(stateOptions(h, "foo.bar", [])).toEqual([{ value: "wibbling", label: "Wibbling" }]);
  });

  it("never repeats a state", () => {
    const values = stateOptions(hass(), "binary_sensor.door", ["on", "on"]).map((o) => o.value);
    expect(values).toEqual([...new Set(values)]);
  });
});

describe("entityStateText", () => {
  it("prefers the frontend's own formatter", () => {
    const h = hass({ formatEntityState: () => "Ouvert" });
    expect(entityStateText(h, "binary_sensor.door")).toBe("Ouvert");
  });

  it("falls back to the localized state", () => {
    expect(entityStateText(hass(), "binary_sensor.door")).toBe("Open");
  });

  it("is null for an entity that is not there", () => {
    expect(entityStateText(hass(), "binary_sensor.nope")).toBeNull();
  });
});

describe("edgeLabels", () => {
  it("names the state when exactly one is active", () => {
    expect(edgeLabels(hass(), "binary_sensor.door", ["on"])).toEqual({
      enter: "When it becomes Open",
      leave: "When it stops being Open",
    });
  });

  it("stays generic when several states are active", () => {
    expect(edgeLabels(hass(), "media_player.tv", ["playing", "buffering"])).toEqual({
      enter: "When it enters the active states",
      leave: "When it leaves them",
    });
  });
});
```

- [ ] **Step 2: Run and watch them fail**

Run: `pnpm -C frontend test -- entity-states` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

Create `frontend/src/entity-states.ts`:

```ts
import type { HomeAssistant } from "./types";

/**
 * What states an entity can be in, and what Home Assistant calls them. The panel needs
 * both — the "Active states" picker needs a list to offer, and a stimulus row needs one
 * state spelled the way the more-info dialog spells it. Neither is answerable from the
 * `hass` object alone: a state machine reports the state an entity is in, never the set
 * it could be in, so the set comes from a table here and the names come from HA's own
 * translations.
 *
 * The table is deliberately partial. Anything it does not know still works, because every
 * list is unioned with the entity's current state and with whatever the configuration
 * already chose — the picker degrades to "what you have and what it is doing", which is
 * strictly more than the free-text box it replaces offered.
 */

const ON_OFF = ["on", "off"];

/** The states worth offering, per domain, in the order a dropdown should list them. */
const DOMAIN_STATES: Record<string, readonly string[]> = {
  automation: ON_OFF,
  binary_sensor: ON_OFF,
  fan: ON_OFF,
  humidifier: ON_OFF,
  input_boolean: ON_OFF,
  light: ON_OFF,
  remote: ON_OFF,
  siren: ON_OFF,
  switch: ON_OFF,
  update: ON_OFF,
  alarm_control_panel: [
    "disarmed",
    "armed_home",
    "armed_away",
    "armed_night",
    "armed_vacation",
    "arming",
    "pending",
    "triggered",
  ],
  climate: ["heat", "cool", "heat_cool", "auto", "dry", "fan_only", "off"],
  cover: ["open", "opening", "closing", "closed"],
  device_tracker: ["home", "not_home"],
  lock: ["locked", "unlocked", "locking", "unlocking", "open", "opening", "jammed"],
  media_player: ["playing", "paused", "buffering", "idle", "standby", "on", "off"],
  person: ["home", "not_home"],
  timer: ["active", "paused", "idle"],
  vacuum: ["cleaning", "returning", "docked", "idle", "paused", "error"],
  water_heater: ["eco", "electric", "performance", "high_demand", "heat_pump", "gas", "off"],
};

const domainOf = (entityId: string): string => entityId.split(".")[0] ?? "";

/** `not_home` -> `Not home`. The last resort, when nothing is translated. */
const humanize = (state: string): string => {
  const words = state.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * The state as Home Assistant names it. Device-class translations come first, because
 * a `door` binary sensor is Open and Closed rather than On and Off; the domain's own
 * table is the fallback, and a humanized state id the fallback to that.
 */
export function stateLabel(
  hass: HomeAssistant | undefined,
  entityId: string,
  state: string,
): string {
  const domain = domainOf(entityId);
  const deviceClass = hass?.states[entityId]?.attributes.device_class;
  const keys = [
    typeof deviceClass === "string"
      ? `component.${domain}.entity_component.${deviceClass}.state.${state}`
      : null,
    `component.${domain}.entity_component._.state.${state}`,
  ];
  for (const key of keys) {
    if (key === null) continue;
    const label = hass?.localize(key);
    if (typeof label === "string" && label !== "") return label;
  }
  return humanize(state);
}

/**
 * The options the "Active states" picker offers. Always a superset of what is already
 * chosen, so switching entities never silently drops a configured state from the list
 * that is meant to display it.
 */
export function stateOptions(
  hass: HomeAssistant | undefined,
  entityId: string,
  selected: readonly string[],
): { value: string; label: string }[] {
  const current = hass?.states[entityId]?.state;
  const known = DOMAIN_STATES[domainOf(entityId)] ?? [];
  const values = [...known];
  for (const state of [current, ...selected]) {
    if (typeof state === "string" && state !== "" && !values.includes(state)) values.push(state);
  }
  return values.map((value) => ({ value, label: stateLabel(hass, entityId, value) }));
}

/** How a stimulus row spells the entity's state right now; `null` when it is not there. */
export function entityStateText(
  hass: HomeAssistant | undefined,
  entityId: string,
): string | null {
  const stateObj = hass?.states[entityId];
  if (!stateObj) return null;
  const formatted = hass?.formatEntityState?.(stateObj);
  if (typeof formatted === "string" && formatted !== "") return formatted;
  return stateLabel(hass, entityId, stateObj.state);
}

/**
 * What the two momentary edge checkboxes are called. One active state can be named, which
 * is the case worth spelling out — "When it becomes Open" beats "When it enters the active
 * states" for every door in the house. More than one, and naming them all reads worse than
 * the generic phrasing.
 */
export function edgeLabels(
  hass: HomeAssistant | undefined,
  entityId: string,
  to: readonly string[],
): { enter: string; leave: string } {
  if (to.length === 1) {
    const label = stateLabel(hass, entityId, to[0]);
    return { enter: `When it becomes ${label}`, leave: `When it stops being ${label}` };
  }
  return { enter: "When it enters the active states", leave: "When it leaves them" };
}
```

- [ ] **Step 4: Run**

Run: `pnpm -C frontend test -- entity-states && pnpm -C frontend lint`
Expected: PASS, clean.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/entity-states.ts frontend/test/entity-states.test.ts
git commit -m "feat(panel): name the states an entity can be in"
```

---

### Task 7: The stimulus form

**Files:**
- Modify: `frontend/src/stimulus-form.ts`
- Modify: `frontend/src/convert.ts` (remove `parseToList`/`formatToList`)
- Test: `frontend/test/stimulus-form.test.ts`, `frontend/test/convert.test.ts`

**Interfaces:**
- Consumes: `stateOptions`, `edgeLabels` from Task 6; `StimulusMode`, `StimulusEdge` from Task 5.
- Produces: `stimulusSchema(config, stimulus, hass, fields)` — **note the changed signature**; `stimulusData(stimulus, fields)` — **`toText` parameter removed**; `MODE_SELECTOR`; `SOURCE_FIELDS = ["entity", "mode", "to", "edges", "key"]`; `visibleSourceFields(stimulus)`; `overrideDisabled(stimulus, name)`.

- [ ] **Step 1: Write the failing tests**

Replace the `stimulus panels` field-split assertion in `frontend/test/stimulus-form.test.ts`
and add:

```ts
describe("stimulus mode", () => {
  const cfg = { envelopes: [{ id: "default", label: null }], defaults: { envelope: "default" } } as never;

  it("splits the fields between Source and Envelope with nothing left over", () => {
    expect(SOURCE_FIELDS).toEqual(["entity", "mode", "to", "edges", "key"]);
    expect(ENVELOPE_FIELDS).toEqual(["envelope", "gain"]);
  });

  it("hides the edge checkboxes for a sustained stimulus", () => {
    const stimulus = newStimulus("binary_sensor.door");
    expect(visibleSourceFields(stimulus)).toEqual(["entity", "mode", "to", "key"]);
    expect(visibleSourceFields({ ...stimulus, mode: "momentary" })).toEqual([
      "entity",
      "mode",
      "to",
      "edges",
      "key",
    ]);
  });

  it("builds the active-states picker from the entity", () => {
    const stimulus = newStimulus("binary_sensor.door");
    const item = stimulusSchema(cfg, stimulus, undefined, ["to"])[0];
    const select = item.selector.select as { multiple: boolean; custom_value: boolean; options: unknown };
    expect(select.multiple).toBe(true);
    expect(select.custom_value).toBe(true);
    expect(select.options).toEqual([
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
    ]);
  });

  it("keeps the previous edges when the form hands back an empty list", () => {
    const stimulus = { ...newStimulus("binary_sensor.door"), mode: "momentary" as const };
    expect(mergeStimulus(stimulus, { edges: [] }).edges).toEqual(["enter", "leave"]);
    expect(mergeStimulus(stimulus, { edges: ["enter"] }).edges).toEqual(["enter"]);
  });

  it("disables the shape overrides a momentary trigger cannot use", () => {
    const stimulus = newStimulus("binary_sensor.door");
    expect(overrideDisabled(stimulus, "attack")).toBe(false);
    const momentary = { ...stimulus, mode: "momentary" as const };
    expect(overrideDisabled(momentary, "attack")).toBe(true);
    expect(overrideDisabled(momentary, "decay")).toBe(true);
    expect(overrideDisabled(momentary, "impulse")).toBe(true);
    expect(overrideDisabled(momentary, "release")).toBe(false);
    expect(overrideDisabled(momentary, "sustain")).toBe(false);
  });

  it("names the changed field so edits coalesce", () => {
    const stimulus = newStimulus("binary_sensor.door");
    expect(changedStimulusField({ ...stimulus, to: ["off"] }, stimulus)).toBe("to");
    expect(changedStimulusField({ ...stimulus, mode: "momentary" }, stimulus)).toBe("mode");
    expect(changedStimulusField({ ...stimulus, edges: ["enter"] }, stimulus)).toBe("edges");
    expect(changedStimulusField(stimulus, stimulus)).toBeUndefined();
  });
});
```

Delete the `parseToList`/`formatToList` cases from `frontend/test/convert.test.ts`.

- [ ] **Step 2: Run and watch them fail**

Run: `pnpm -C frontend test -- stimulus-form` — Expected: FAIL on every new name.

- [ ] **Step 3: Implement in `stimulus-form.ts`**

Add the imports (`stateOptions`, `edgeLabels` from `./entity-states`; `HomeAssistant`,
`StimulusEdge` types), then:

```ts
export type StimulusField = "entity" | "mode" | "to" | "edges" | "gain" | "key" | "envelope";

export const MODE_SELECTOR: Selector = {
  select: {
    mode: "list",
    options: [
      { value: "sustained", label: "Sustained — hold while it is active" },
      { value: "momentary", label: "Momentary — fire on each change" },
    ],
  },
};

/** The overrides a momentary trigger cannot use, because an impulse jumps to its release. */
export const MOMENTARY_PINNED: readonly (keyof EnvelopeOverrides)[] = ["attack", "decay", "impulse"];

export const MOMENTARY_PINNED_HINT =
  "A momentary trigger is always an impulse: the state change is the whole event, so " +
  "there is nothing to hold the envelope open — it jumps to its peak and releases. " +
  "Attack and decay never run.";

export const overrideDisabled = (stimulus: Stimulus, name: keyof EnvelopeOverrides): boolean =>
  stimulus.mode === "momentary" && MOMENTARY_PINNED.includes(name);
```

Set `STIMULUS_LABELS.mode = "Mode"`, `STIMULUS_LABELS.edges = "Fire on"`,
`STIMULUS_HELPERS.mode = "Sustained holds a note while the entity is in its active states. Momentary treats each change as one event."`,
`STIMULUS_HELPERS.to = "Which states of this entity count as active."`,
`STIMULUS_HELPERS.edges = "Which crossings fire a trigger. At least one."`.

`SOURCE_FIELDS` becomes `["entity", "mode", "to", "edges", "key"]`;
`STIMULUS_FORM_FIELDS` becomes `["entity", "mode", "gain", "key", "envelope"]`.

Add:

```ts
/** The Source fields this stimulus actually shows: a sustained trigger has no edges to pick. */
export const visibleSourceFields = (stimulus: Stimulus): StimulusField[] =>
  SOURCE_FIELDS.filter((name) => name !== "edges" || stimulus.mode === "momentary");
```

Rewrite the three data functions:

```ts
export function stimulusSchema(
  config: Config,
  stimulus: Stimulus,
  hass: HomeAssistant | undefined,
  fields: readonly StimulusField[],
): FormItem[] {
  const edges = edgeLabels(hass, stimulus.entity, stimulus.to);
  const selectors: Record<StimulusField, Selector> = {
    entity: { entity: {} },
    mode: MODE_SELECTOR,
    to: {
      select: {
        mode: "dropdown",
        multiple: true,
        custom_value: true,
        options: stateOptions(hass, stimulus.entity, stimulus.to),
      },
    },
    edges: {
      select: {
        mode: "list",
        multiple: true,
        options: [
          { value: "enter", label: edges.enter },
          { value: "leave", label: edges.leave },
        ],
      },
    },
    gain: GAIN_SELECTOR,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: envelopeOptions(config) } },
  };
  return fields.map((name) => ({ name, selector: selectors[name] }));
}

export function stimulusData(
  stimulus: Stimulus,
  fields: readonly StimulusField[],
): Record<string, unknown> {
  const all: Record<StimulusField, unknown> = {
    entity: stimulus.entity,
    mode: stimulus.mode,
    to: stimulus.to,
    edges: stimulus.edges,
    gain: stimulus.gain,
    key: stimulus.key ?? "",
    envelope: stimulus.envelope ?? "",
  };
  return Object.fromEntries(fields.map((name) => [name, all[name]]));
}

const asList = (raw: unknown): string[] =>
  Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string" && s !== "") : [];

export function mergeStimulus(stimulus: Stimulus, v: Record<string, unknown>): Stimulus {
  const merged: Stimulus = { ...stimulus };
  if ("entity" in v) merged.entity = String(v.entity ?? "");
  if ("mode" in v && (v.mode === "sustained" || v.mode === "momentary")) merged.mode = v.mode;
  if ("to" in v) merged.to = asList(v.to);
  if ("edges" in v) {
    // Unchecking the last edge is refused rather than stored: a momentary stimulus with
    // no edges can never fire, and the backend refuses it anyway, so the form declines to
    // build the document that would be rejected.
    const edges = asList(v.edges).filter((e): e is StimulusEdge => e === "enter" || e === "leave");
    if (edges.length > 0) merged.edges = edges;
  }
  if ("gain" in v) merged.gain = typeof v.gain === "number" ? v.gain : stimulus.gain;
  if ("key" in v) merged.key = emptyToNull(v.key as string | null | undefined);
  if ("envelope" in v) merged.envelope = emptyToNull(v.envelope as string | null | undefined);
  return merged;
}

const sameList = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export function changedStimulusField(merged: Stimulus, stimulus: Stimulus): string | undefined {
  if (!sameList(merged.to, stimulus.to)) return "to";
  if (!sameList(merged.edges, stimulus.edges)) return "edges";
  return STIMULUS_FORM_FIELDS.find((k) => merged[k] !== stimulus[k]);
}
```

Delete `toTextMatches` and the `formatToList`/`parseToList` import. Delete both functions
from `convert.ts` — nothing else uses them.

- [ ] **Step 4: Run**

Run: `pnpm -C frontend test -- "stimulus-form|convert" && pnpm -C frontend lint`
Expected: PASS. `typecheck` will still fail until Task 8 updates the call sites.

- [ ] **Step 5: Commit (with Task 8, once typecheck is green)**

---

### Task 8: The stimulus editor

**Files:**
- Modify: `frontend/src/al-stimulus-editor.ts`
- Modify: `frontend/src/al-override-field.ts` (add a `disabled` property)
- Test: `frontend/test/al-stimulus-editor.test.ts`

**Interfaces:**
- Consumes: `visibleSourceFields`, `overrideDisabled`, `MOMENTARY_PINNED_HINT`, the new `stimulusSchema`/`stimulusData` signatures from Task 7.

- [ ] **Step 1: Write the failing test**

Append to `frontend/test/al-stimulus-editor.test.ts`, matching that file's existing mount
helper:

```ts
it("pins and explains the overrides a momentary trigger cannot use", async () => {
  const config = configWith({ mode: "momentary" });
  const el = await mount(config, ["groups", 0, "stimuli", 0]);
  const fields = [...el.shadowRoot!.querySelectorAll("al-override-field")];
  const byLabel = new Map(fields.map((f) => [f.label, f]));
  expect(byLabel.get("Attack")!.disabled).toBe(true);
  expect(byLabel.get("Impulse")!.disabled).toBe(true);
  expect(byLabel.get("Release")!.disabled).toBe(false);
  expect(byLabel.get("Attack")!.hint).toContain("always an impulse");
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `pnpm -C frontend test -- al-stimulus-editor` — Expected: FAIL.

- [ ] **Step 3: Implement**

In `al-override-field.ts`, add `@property({ type: Boolean }) disabled = false;` and pass
`.disabled=${this.disabled}` to `ha-selector`, and `.disabled=${this.disabled || !this.overridden}`
to the reset button.

In `al-stimulus-editor.ts`: delete the `toText` state, the `willUpdate` override, the
`toTextMatches` import and the `if ("to" in v) this.toText = ...` line in `onFormChanged`.
Change the two `stimulusData(stimulus, this.toText, X)` calls to `stimulusData(stimulus, X)`,
the two `stimulusSchema(config, X)` calls to `stimulusSchema(config, stimulus, this.hass, X)`,
and `SOURCE_FIELDS` to `visibleSourceFields(stimulus)` in both the data and schema calls of
the Source panel. In `renderOverride`, add:

```ts
    const disabled = overrideDisabled(stimulus, item.name);
```

and pass `.disabled=${disabled}` plus
`.hint=${disabled ? MOMENTARY_PINNED_HINT : (item.hint ?? "")}`.

- [ ] **Step 4: Run**

Run: `pnpm -C frontend lint && pnpm -C frontend typecheck && pnpm -C frontend test`
Expected: PASS, clean.

- [ ] **Step 5: Commit**

```bash
git add frontend/src frontend/test
git commit -m "feat(panel): pick active states from the entity, and choose a stimulus mode"
```

(The bundle is rebuilt in Task 10; commit these two tasks together if the pre-commit
bundle hook objects, or run `pnpm -C frontend build` first and include the bundle.)

---

### Task 9: Icons and state labels on the rows

**Files:**
- Modify: `frontend/src/ha-elements.ts` (`HA_OPTIONAL_ELEMENTS`)
- Modify: `frontend/src/al-tree.ts` (line 42 `STIMULUS_ICON`, ~545 the state chip)
- Modify: `frontend/src/al-strip-controls.ts` (~297)
- Test: `frontend/test/ha-elements.test.ts`, `frontend/test/al-tree.test.ts`, `frontend/test/al-strip-controls.test.ts`

- [ ] **Step 1: Write the failing tests**

In `frontend/test/al-tree.test.ts`:

```ts
it("shows the entity's own icon and its formatted state", async () => {
  const el = await mountTree(/* a config with binary_sensor.door and hass states */);
  const row = el.shadowRoot!.querySelector('[data-path="groups.0.stimuli.0"]')!;
  expect(row.querySelector("ha-state-icon")).not.toBeNull();
  expect(row.textContent).toContain("Open");
  expect(row.textContent).not.toContain("on");
});

it("falls back to the bolt when the entity is unknown", async () => {
  const el = await mountTree(/* same config, empty hass.states */);
  const row = el.shadowRoot!.querySelector('[data-path="groups.0.stimuli.0"]')!;
  expect(row.querySelector('ha-icon[icon="mdi:flash"]')).not.toBeNull();
});
```

In `frontend/test/ha-elements.test.ts`, extend the existing optional-elements assertion to
include `ha-state-icon`.

- [ ] **Step 2: Run and watch them fail**

Run: `pnpm -C frontend test -- "al-tree|ha-elements"` — Expected: FAIL.

- [ ] **Step 3: Implement**

`ha-elements.ts`: `export const HA_OPTIONAL_ELEMENTS = ["ha-yaml-editor", "ha-state-icon"] as const;`
and extend that constant's docstring — `ha-state-icon` is optional for the same reason:
a missing icon must cost an icon, not the page.

`al-tree.ts`: import `entityStateText` from `./entity-states`, and replace the icon
expression with a helper on the class:

```ts
  /** The row's icon: HA's own state icon when it can be had, else the generic bolt. */
  private renderIcon(row: Row): TemplateResult {
    if (row.kind === "group" && row.group)
      return html`<ha-icon icon=${KIND_DEFS[row.group.kind].icon}></ha-icon>`;
    const stateObj = row.stimulus ? this.hass?.states[row.stimulus.entity] : undefined;
    if (!stateObj) return html`<ha-icon icon=${STIMULUS_ICON}></ha-icon>`;
    return html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
  }
```

and in `renderRowStatus`, replace `entity.state` with
`entityStateText(this.hass, stimulus.entity)`, keeping the `entity ? … : nothing` guard.

`al-strip-controls.ts`: the same two swaps in `renderStimulus`.

- [ ] **Step 4: Run**

Run: `pnpm -C frontend lint && pnpm -C frontend typecheck && pnpm -C frontend test`
Expected: PASS, clean.

- [ ] **Step 5: Commit**

```bash
git add frontend/src frontend/test
git commit -m "feat(panel): stimulus rows show the entity's icon and its real state"
```

---

### Task 10: Rebuild the bundle and verify everything

**Files:**
- Modify: `custom_components/activity_levels/frontend/activity-levels-panel.js` (generated)

- [ ] **Step 1: Build**

Run: `pnpm -C frontend build`

- [ ] **Step 2: Full verification**

Run, and read the output rather than assuming:

```bash
uv run ruff check . && uv run ruff format --check . && uv run mypy && uv run pytest
pnpm -C frontend lint && pnpm -C frontend typecheck && pnpm -C frontend test
git status --short
```

Expected: every command green; `git status` shows only the rebuilt bundle if the earlier
commits already landed.

- [ ] **Step 3: Commit**

```bash
git add custom_components/activity_levels/frontend/activity-levels-panel.js
git commit -m "build(panel): rebuild the bundle for stimulus modes and state labels"
```

---

## Self-review

**Spec coverage.** Spec §1 Model → Task 1. §2 Backend/Tree → Task 2; §2 Backend/Coordinator
→ Task 3; the "restart is already safe" claim is pinned by Task 2's assertion that a
momentary voice's envelope is an impulse, which is exactly the property `_reconcile` guards
on. §3 Active states → Tasks 6 and 7; §3 Mode and edges → Tasks 7 and 8. §4 Icon and state
label → Task 9. §5 Testing → distributed across the tasks; the `test_schema_json` row is
Task 1 Step 6. §6 Documentation → Task 4 and Task 10.

**Placeholder scan.** Task 9's test bodies name a `mountTree` helper with a comment rather
than a literal config, because the existing `al-tree.test.ts` already has its mount helper
and duplicating it here would drift. Every other step carries real code.

**Type consistency.** `stimulusSchema(config, stimulus, hass, fields)` and
`stimulusData(stimulus, fields)` are used with those exact signatures in Tasks 7 and 8.
`VoiceRef`'s two new positional fields are appended in the same order in Task 2's
construction and Task 3's test helper. `overrideDisabled(stimulus, name)` is defined in
Task 7 and consumed in Task 8.
