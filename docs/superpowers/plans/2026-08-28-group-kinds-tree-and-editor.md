# Group Kinds, Tree and Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every group a **kind** — property, structure, floor, area, outside — so the configuration says what each node *is* on the property, and bind floors and areas to Home Assistant's own registries so nobody types a room name twice. Then rebuild the three places that read the tree: adjacency becomes a **table** with a connection type and a "both ways" checkbox, the Groups tree becomes flat rows with right-aligned actions and native drag-and-drop, and both editors become `ha-expansion-panel` sections with a one-line definition each. Presence becomes reachable from the UI whether or not it is on. Every existing configuration — which has no kinds at all — must still load, keep its entity ids, and be told, once, that its kinds were guessed.

**Architecture:** The kind is a schema field with a deterministic loader-side inference, so the *document* is the source of truth and the panel is the thing that writes it. `schema.py` gains `kind`, `floor_id`, an `area` → `area_id` rewrite, the nesting rules, the `exit` rules, the long-form `adjacent` entry with a `connection` enum, and `infer_kinds`, which resolves a kind-less document and reports which paths it guessed; `validate` returns that report and `validate_config` stays the thin wrapper every existing caller already uses. `topology.py` then stops inferring what a room is from the edges and simply asks the kind (`area | outside`); `tree.py`, `__init__.py` and `websocket_api.py` follow. On the panel, the kind rules live in a new pure `kinds.ts` that both `model.ts` and `store.ts` can import without a cycle; `store.ts` grows `legalDrop`/`moveNode` as pure reducer ops so the tree's drag-and-drop and its Alt+arrow keyboard parity are the same two functions with different argument arithmetic; `tree-rows.ts` flattens the tree into rows and `panel-state.ts` remembers which expansion panels are open. Only then do the components change.

**Tech Stack:** Python 3.14 / uv / pytest / ruff / mypy strict under `custom_components/activity_levels`; Lit 3 / TypeScript strict / Vite lib build / vitest (jsdom) / pnpm under `frontend/`. `ha-selector` with the `area` and `floor` selector types (confirmed present in the Home Assistant 2026.8 frontend bundle: `ha-selector-area`, `ha-selector-floor`, `ha-area-picker` and `ha-floor-picker` all register from `hass_frontend/frontend_latest/`), and `ha-expansion-panel`, which the panel already templates against.

**Spec:** `docs/superpowers/specs/2026-08-28-group-kinds-tree-and-editor-design.md` (binding). Prior context: `2026-08-27-topology-and-presence-design.md` (adjacency, exits, the room graph, the Presence tab), `2026-08-27-mixer-v2-design.md` (the controls row and its shared group form), `2026-08-25-activity-levels-design.md` (engine, envelopes, the original tree).

## Global Constraints

- Repo `/Users/sholodak/elevenrose/activity-levels`, branch `main`. **Always set cwd explicitly** on every command (`cd /Users/sholodak/elevenrose/activity-levels && …`): an unrelated repo lives at `…/ActivityLevels` and the shell resets between calls.
- Home Assistant **2026.8.3**; Python **>=3.14.2,<3.15**. No new Python dependency: `manifest.json`'s `requirements` stays `numpy==2.3.2` and nothing else.
- **No new frontend runtime libraries.** Drag-and-drop is **native HTML5 DnD** (`draggable`, `dragstart`/`dragover`/`drop`/`dragend`), drawn with the panel's own CSS. `pnpm add` of a runtime dependency is out of scope; `lit` stays the only one.
- The built bundle at `custom_components/activity_levels/frontend/activity-levels-panel.js` is **committed**: after any `frontend/src` change run `pnpm build` and stage the bundle **in the same commit**. CI runs `git diff --exit-code -- ../custom_components/activity_levels/frontend`.
- `uv run ruff check .`, `uv run ruff format --check .` and `uv run mypy` (strict, `files = ["custom_components/activity_levels"]`) must stay green. Frontend: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- **`tests/test_purity.py` must stay green.** `topology.py` and everything in `engine/`, `patterns/`, `presence/` may not import `homeassistant`. The kind constants therefore live in `const.py` (which is already pure) and **not** in `schema.py`, which imports `homeassistant.helpers.config_validation`.
- **Conventional Commits**, using the types `release-please-config.json` knows: `feat`, `fix`, `perf`, `refactor`, `docs`, `deps`, `chore`, `ci`, `test`, `build`, `style`, `revert`. Every task ends in exactly one commit with the subject given. Scopes in use here: `config`, `panel`, `readme`.
- **Never stage `brands/`** — it is a separate upstream PR. Always use explicit `git add <paths>`; never `git add -A` or `git add .`.
- **`CHANGELOG.md` is release-please-owned. Do not edit it.** Nor `manifest.json`'s `version`, nor `pyproject.toml`'s.
- **Existing documents without kinds must still load.** `validate_config` resolves them; setup must not fail; every entity id is derived from the group `id` and is therefore byte-identical before and after. A document whose kinds cannot be resolved without breaking the nesting rules is the one exception, and it fails loudly with a pathed error.
- `strings.json` and `translations/en.json` stay identical to each other.
- The estimator and the topology maths are **untouched** except for the one rule that says which groups are nodes. `connection` is stored, validated and round-tripped; nothing reads it.

---

## File structure

```
custom_components/activity_levels/
  const.py                MOD  KIND_*, KINDS, NODE_KINDS, ALLOWED_CHILDREN, DEFAULT_CHILD_KIND,
                               CONNECTIONS, DEFAULT_CONNECTION, MODEL_BY_KIND, CONF_KIND/AREA_ID/FLOOR_ID
  schema.py               MOD  kind/floor_id/area_id, area rewrite, connection enum, nesting +
                               exit + adjacency-endpoint cross-checks, infer_kinds, Validated, validate
  topology.py             MOD  nodes = kind in {area, outside}; order carries area_id
  tree.py                 MOD  GroupInfo.kind/area_id/floor_id/name_set; name no longer schema-filled
  __init__.py             MOD  model per kind, suggested_area from area_id, HA area name fallback
  websocket_api.py        MOD  config/get -> {config, inferred}
  entity.py               —    unchanged (device identity is the group id, which does not move)
tests/
  fixtures.py             MOD  kinds_config(); house_config/rooms_config stay kind-less (migration)
  test_schema.py          MOD  kinds, nesting, exit, area rewrite, connection, migration
  test_topology.py        MOD  nodes come from kinds
  test_tree.py            MOD  GroupInfo.kind/area_id, name fallback
  test_init.py            MOD  device model per kind, suggested_area, area-name fallback
  test_websocket.py       MOD  config/get returns the resolved document and `inferred`
frontend/src/
  kinds.ts                NEW  pure: Kind, Connection, KIND_DEFS, ALLOWED_CHILDREN,
                               allowedChildKinds, NODE_KINDS, isDescendantPath
  tree-rows.ts            NEW  pure: Row, flattenRows, loadExpanded/saveExpanded
  panel-state.ts          NEW  pure: loadPanelOpen/savePanelOpen (per-browser panel collapse)
  al-adjacency-table.ts   NEW  the Adjacent groups table (own rows + declared-on rows)
  types.ts                MOD  Kind, Connection, Adjacency{id,connection,one_way}, Group.kind/
                               floor_id/area_id, ConfigGet
  model.ts                MOD  newGroup with kind, adjacencyConnection, declaredOn, hasOutside,
                               nodeIds; roomIds now reads kinds
  store.ts                MOD  DropVerdict, legalDrop, moveNode
  al-tree.ts              MOD  flat rows, hover/focus/selected actions, add menu, DnD, Alt+arrows
  al-group-editor.ts      MOD  Identity / Mix / Adjacent groups / Presence panels + Delete
  al-stimulus-editor.ts   MOD  Source / Envelope / Override preset panels
  group-form.ts           MOD  kind/floor_id/area_id fields, prefill rules; adjacent/exit leave
  stimulus-form.ts        MOD  SOURCE_FIELDS/ENVELOPE_FIELDS split, overriddenCount
  al-strip-controls.ts    MOD  BUS_FIELDS drops adjacent/exit
  al-presence.ts          MOD  setup card when disabled
  activity-levels-panel.ts MOD Presence tab always listed; "inferred kinds" banner
  api.ts                  MOD  getConfig returns {config, inferred}
  styles.ts               MOD  tree row, drop indicator and panel styles
frontend/test/
  kinds.test.ts           NEW  allowedChildKinds, isDescendantPath
  tree-rows.test.ts       NEW  flatten order, expansion, placeholder rule
  panel-state.test.ts     NEW  persistence, unreadable storage
  al-adjacency-table.test.ts NEW own vs declared-on rows, both-ways, connection, remove
  store.test.ts           MOD  legalDrop for every rule, moveNode index math
  model.test.ts           MOD  kinds, declaredOn, hasOutside, roomIds
  fixtures.ts             MOD  kinds; kindsConfig()
  al-tree.test.ts         MOD  rows, actions, caret vs label, add menu, DnD, Alt+arrows
  al-group-editor.test.ts MOD  panels, prefill, adjacency table wiring
  al-stimulus-editor.test.ts MOD panels, override badge
  group-form.test.ts      MOD  kind/floor/area schema, data, merge, prefill
  al-presence.test.ts     MOD  setup card
  activity-levels-panel.test.ts MOD tab always listed, inferred banner
docs / examples
  README.md               MOD  kinds, definitions, adjacency table, migration note, config reference
  examples/house.yaml     MOD  explicit kinds, floor_id/area_id, garage remodelled
```

---

### Task 1: Schema — `kind`, `floor_id`, the `area` rewrite, nesting, `exit`, `connection`, and migration

**Files:** modify `custom_components/activity_levels/const.py`, `custom_components/activity_levels/schema.py`; tests `tests/fixtures.py`, `tests/test_schema.py`.

**Interfaces:**
```python
# const.py  (pure: no homeassistant import may appear here)
KIND_PROPERTY = "property"
KIND_STRUCTURE = "structure"
KIND_FLOOR = "floor"
KIND_AREA = "area"
KIND_OUTSIDE = "outside"
KINDS: tuple[str, ...]                              # in the order the picker lists them
NODE_KINDS: frozenset[str]                          # {area, outside} -- the topology's states
ALLOWED_CHILDREN: dict[str | None, frozenset[str]]  # None keys the root rule
DEFAULT_CHILD_KIND: dict[str, str]                  # what a child of each kind is, absent evidence
CONNECTIONS: tuple[str, ...]                        # open | door | stairs | exterior_door
DEFAULT_CONNECTION = "door"
MODEL_BY_KIND: dict[str, str]                       # device model shown in Home Assistant
CONF_KIND = "kind"; CONF_AREA_ID = "area_id"; CONF_FLOOR_ID = "floor_id"

# schema.py
ADJACENT_SCHEMA: vol.Schema        # {id, connection: DEFAULT_CONNECTION, one_way: False}
def infer_kinds(config: dict[str, Any]) -> tuple[dict[str, Any], list[str]]
    """(document with every kind resolved, paths whose kind was guessed)."""

@dataclass(frozen=True)
class Validated:
    config: dict[str, Any]
    inferred: tuple[str, ...]
    @property
    def migrated(self) -> bool: ...

def validate(config: Mapping[str, Any]) -> Validated
def validate_config(config: Mapping[str, Any]) -> dict[str, Any]   # unchanged signature
```

The nesting table, exactly:

| parent | may contain |
| --- | --- |
| (root) | `property` |
| `property` | `property`, `structure`, `outside` |
| `structure` | `floor`, `area` |
| `floor` | `area` |
| `area` | `area` |
| `outside` | `outside` |

**Two migration decisions, both deliberate, both stated here because the spec leaves the collision unresolved.**

- **M1 — inference prefers a kind that fits what the group already declares.** The spec's order is root → `property`, `area_id` → `area`, then positional (`property`→`structure`, `structure`→`floor`, `floor`/`area`→`area`, `outside`→`outside`). A group that declares `adjacent` or `exit` is, by construction, a place people walk through, so `area` (or `outside`, where nesting demands it) is tried before the positional default. Without this, `examples/house.yaml`'s `garage` — a direct child of the property that declares `adjacent: [driveway]` and `exit: true` — would infer as a `structure` and instantly break the "a structure may not declare `adjacent`/`exit`" rule on a document that loads perfectly today.
- **M2 — the kind-conditioned `adjacent`/`exit` rules are errors only for a kind the document actually declares.** For a group whose kind was *inferred*, a violating `adjacent` or `exit` is kept, honoured by the topology and reported through `inferred` so the panel's banner points at it. The alternative is a config that has worked for months refusing to load because a field the user never wrote disagrees with a field they did. The next Save writes kinds explicitly, at which point the same rule is a hard error they have to resolve — which is the whole point of the banner.

- [ ] **Step 1: Tests first (RED).** Add to `tests/fixtures.py`, after `rooms_config`:

```python
def kinds_config() -> dict[str, Any]:
    """The layering the spec describes, written out: property -> structure -> floor -> area,
    with an outside branch beside the house.

    `house_config` and `rooms_config` deliberately carry no kinds at all: they are what
    every document written before this release looks like, and they are what the migration
    tests load. This one is what the panel writes back.
    """
    return {
        "version": 1,
        "defaults": {"envelope": "default", "min_wake_interval": 1},
        "envelopes": [{"id": "default", "release": "30m"}],
        "groups": [
            {
                "id": "property",
                "kind": "property",
                "name": "Property",
                "mix": "max",
                "children": [
                    {
                        "id": "house",
                        "kind": "structure",
                        "name": "House",
                        "mix": "max",
                        "children": [
                            {
                                "id": "downstairs",
                                "kind": "floor",
                                "name": "Downstairs",
                                "floor_id": "downstairs",
                                "mix": "max",
                                "children": [
                                    {
                                        "id": "kitchen",
                                        "kind": "area",
                                        "name": "Kitchen",
                                        "area_id": "kitchen",
                                        "adjacent": [
                                            {"id": "hall", "connection": "open"},
                                            {"id": "back_patio", "connection": "exterior_door"},
                                        ],
                                        "stimuli": [{"entity": "binary_sensor.kitchen_motion"}],
                                    },
                                    {
                                        "id": "hall",
                                        "kind": "area",
                                        "name": "Hall",
                                        "area_id": "hall",
                                        "stimuli": [{"entity": "binary_sensor.hall_motion"}],
                                    },
                                ],
                            }
                        ],
                    },
                    {
                        "id": "back_patio",
                        "kind": "outside",
                        "name": "Back Patio",
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.patio_motion"}],
                    },
                ],
            }
        ],
    }
```

Then in `tests/test_schema.py`, importing `kinds_config` alongside the others:

```python
def test_kinds_round_trip_and_default_to_none_before_inference() -> None:
    cfg = validate_config(kinds_config())
    prop = cfg["groups"][0]
    house = prop["children"][0]
    downstairs = house["children"][0]
    kitchen = downstairs["children"][0]
    assert [g["kind"] for g in (prop, house, downstairs, kitchen)] == [
        "property",
        "structure",
        "floor",
        "area",
    ]
    assert prop["children"][1]["kind"] == "outside"
    assert downstairs["floor_id"] == "downstairs"
    assert kitchen["area_id"] == "kitchen"
    assert "area" not in kitchen  # rewritten away, never round-tripped


def test_area_is_rewritten_to_area_id() -> None:
    cfg = validate_config(house_config())
    living = cfg["groups"][0]["children"][0]
    assert living["area_id"] == "living_room"
    assert "area" not in living
    # both spellings, agreeing, is not an error -- it is what a half-migrated file looks like
    both = house_config()
    both["groups"][0]["children"][0]["area_id"] = "living_room"
    assert validate_config(both)["groups"][0]["children"][0]["area_id"] == "living_room"


def test_area_and_area_id_disagreeing_is_an_error() -> None:
    cfg = house_config()
    cfg["groups"][0]["children"][0]["area_id"] = "lounge"
    assert "groups/0/children/0/area" in errors_of(cfg)


@pytest.mark.parametrize(
    ("parent", "child"),
    [
        ("property", "floor"),
        ("property", "area"),
        ("structure", "property"),
        ("structure", "structure"),
        ("structure", "outside"),
        ("floor", "floor"),
        ("floor", "structure"),
        ("floor", "outside"),
        ("area", "floor"),
        ("area", "structure"),
        ("area", "outside"),
        ("outside", "area"),
        ("outside", "floor"),
        ("outside", "structure"),
        ("outside", "property"),
    ],
)
def test_every_illegal_parent_child_pair_is_reported_at_the_child_kind(parent, child) -> None:
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "root",
                "kind": "property",
                "children": [
                    {
                        "id": "parent",
                        "kind": parent,
                        "children": [
                            {
                                "id": "child",
                                "kind": child,
                                "stimuli": [{"entity": "binary_sensor.x"}],
                            }
                        ],
                    }
                ],
            }
        ],
    }
    if parent not in ("structure", "outside"):  # keep the parent itself legal under property
        config["groups"][0]["children"][0]["kind"] = "structure"
        config["groups"][0]["children"][0]["children"][0] = {
            "id": "mid",
            "kind": parent,
            "children": [{"id": "child", "kind": child, "stimuli": [{"entity": "binary_sensor.x"}]}],
        }
        assert "groups/0/children/0/children/0/children/0/kind" in errors_of(config)
    else:
        assert "groups/0/children/0/children/0/kind" in errors_of(config)


def test_every_root_is_a_property() -> None:
    cfg = kinds_config()
    cfg["groups"][0]["kind"] = "structure"
    assert "groups/0/kind" in errors_of(cfg)


@pytest.mark.parametrize("kind", ["property", "structure", "floor"])
def test_only_areas_and_outside_areas_declare_edges_and_exits(kind) -> None:
    cfg = kinds_config()
    house = cfg["groups"][0]["children"][0]
    house["kind"] = kind if kind != "floor" else "structure"
    downstairs = house["children"][0]
    downstairs["kind"] = "floor"
    downstairs["adjacent"] = ["kitchen"]
    downstairs["exit"] = True
    errs = errors_of(cfg)
    assert "groups/0/children/0/children/0/adjacent" in errs
    assert "groups/0/children/0/children/0/exit" in errs


def test_an_area_may_only_lead_off_the_property_when_nothing_is_outside() -> None:
    cfg = kinds_config()
    cfg["groups"][0]["children"][0]["children"][0]["children"][0]["exit"] = True
    # back_patio is an `outside` group, so the kitchen is not where you leave from
    assert "groups/0/children/0/children/0/children/0/exit" in errors_of(cfg)
    del cfg["groups"][0]["children"][1]  # drop the outside group entirely
    cfg["groups"][0]["children"][0]["children"][0]["children"][0]["adjacent"] = ["hall"]
    validate_config(cfg)  # now the kitchen is the only way out, and that is allowed


def test_adjacency_may_only_name_areas_and_outside_areas() -> None:
    cfg = kinds_config()
    cfg["groups"][0]["children"][0]["children"][0]["children"][0]["adjacent"] = ["house"]
    assert "groups/0/children/0/children/0/children/0/adjacent/0" in errors_of(cfg)


def test_adjacency_long_form_and_connection_enum() -> None:
    cfg = validate_config(kinds_config())
    kitchen = cfg["groups"][0]["children"][0]["children"][0]["children"][0]
    assert kitchen["adjacent"] == [
        {"id": "hall", "connection": "open", "one_way": False},
        {"id": "back_patio", "connection": "exterior_door", "one_way": False},
    ]
    plain = kinds_config()
    plain["groups"][0]["children"][0]["children"][0]["children"][0]["adjacent"] = ["hall"]
    out = validate_config(plain)["groups"][0]["children"][0]["children"][0]["children"][0]
    assert out["adjacent"] == [{"id": "hall", "connection": "door", "one_way": False}]
    bad = kinds_config()
    bad["groups"][0]["children"][0]["children"][0]["children"][0]["adjacent"] = [
        {"id": "hall", "connection": "portal"}
    ]
    assert "groups/0/children/0/children/0/children/0/adjacent/0/connection" in errors_of(bad)


def test_a_document_with_no_kinds_still_loads_and_gets_them_inferred() -> None:
    result = validate(rooms_config())
    rooms = result.config["groups"][0]["children"][0]["children"]
    assert result.config["groups"][0]["kind"] == "property"          # root
    assert result.config["groups"][0]["children"][0]["kind"] == "structure"
    assert [g["kind"] for g in rooms] == ["area"] * 5                # all have an area
    assert result.migrated is True
    assert "groups/0" in result.inferred and "groups/0/children/0/children/4" in result.inferred


def test_inference_covers_every_branch() -> None:
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "estate",  # root -> property
                "children": [
                    {
                        "id": "annexe",  # parent property, nothing else -> structure
                        "children": [
                            {
                                "id": "loft",  # parent structure -> floor
                                "children": [
                                    {
                                        "id": "study",  # parent floor -> area
                                        "stimuli": [{"entity": "binary_sensor.a"}],
                                        "children": [
                                            {
                                                "id": "nook",  # parent area -> area
                                                "stimuli": [{"entity": "binary_sensor.b"}],
                                            }
                                        ],
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        "id": "yard",  # parent property + declares an exit -> outside (M1)
                        "exit": True,
                        "children": [
                            {
                                "id": "shed_path",  # parent outside -> outside
                                "stimuli": [{"entity": "binary_sensor.c"}],
                            }
                        ],
                    },
                    {
                        "id": "cellar",  # parent property + has an area -> still a structure
                        "area": "cellar_area",
                        "stimuli": [{"entity": "binary_sensor.d"}],
                    },
                ],
            }
        ],
    }
    resolved, inferred = infer_kinds(CONFIG_SCHEMA(config))
    kinds = {}

    def walk(group):
        kinds[group["id"]] = group["kind"]
        for child in group["children"]:
            walk(child)

    walk(resolved["groups"][0])
    assert kinds == {
        "estate": "property",
        "annexe": "structure",
        "loft": "floor",
        "study": "area",
        "nook": "area",
        "yard": "outside",
        "shed_path": "outside",
        "cellar": "structure",
    }
    assert len(inferred) == len(kinds)


def test_an_unresolvable_kind_is_left_null_and_reported() -> None:
    """A declared kind that leaves no legal kind for its child is the one hard failure."""
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "root",
                "kind": "property",
                "children": [
                    {
                        "id": "outdoors",
                        "kind": "outside",
                        "children": [
                            {
                                "id": "study",
                                "area": "study_area",  # wants `area`, and outside takes only outside
                                "kind": "area",
                                "stimuli": [{"entity": "binary_sensor.a"}],
                            }
                        ],
                    }
                ],
            }
        ],
    }
    assert "groups/0/children/0/children/0/kind" in errors_of(config)


def test_migrated_groups_keep_edges_and_exits_the_rules_would_now_refuse() -> None:
    """M2: a config that works today must not stop loading because we guessed a kind."""
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "property",
                "children": [
                    {
                        "id": "garage",  # infers `outside` by M1, because it declares both
                        "adjacent": ["driveway"],
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.garage_door"}],
                    },
                    {
                        "id": "driveway",
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.driveway_motion"}],
                    },
                ],
            }
        ],
    }
    result = validate(config)
    garage = result.config["groups"][0]["children"][0]
    assert garage["kind"] == "outside"
    assert garage["exit"] is True
    assert "groups/0/children/0" in result.inferred


def test_declared_kinds_do_not_get_the_migration_amnesty() -> None:
    config = {
        "version": 1,
        "envelopes": [{"id": "default"}],
        "groups": [
            {
                "id": "property",
                "kind": "property",
                "children": [
                    {
                        "id": "house",
                        "kind": "structure",
                        "exit": True,
                        "stimuli": [{"entity": "binary_sensor.front_door"}],
                    }
                ],
            }
        ],
    }
    assert "groups/0/children/0/exit" in errors_of(config)
```

Add to the imports at the top of `tests/test_schema.py`:

```python
from custom_components.activity_levels.schema import (
    CONFIG_SCHEMA,
    ConfigError,
    default_options,
    infer_kinds,
    validate,
    validate_config,
)
from tests.fixtures import house_config, kinds_config, rooms_config
```

Run it and watch it fail for the right reason:

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_schema.py -q
```

Expected: collection succeeds only after `infer_kinds`/`validate`/`CONFIG_SCHEMA` exist, so the first run is an `ImportError` on `infer_kinds` — that is the RED state. Do not proceed until every new test *runs* and fails on an assertion rather than an import.

- [ ] **Step 2: `const.py` — the kind vocabulary.** Insert after the `MODEL_PRESENCE` line:

```python
MODEL_BY_KIND = {
    "property": "Property",
    "structure": "Structure",
    "floor": "Floor",
    "area": "Area",
    "outside": "Outside",
}
```

and, after the `CONF_PRESENCE` line, the whole vocabulary. It lives here rather than in `schema.py` because `topology.py` reads it and `topology.py` may not import `homeassistant`:

```python
CONF_KIND = "kind"
CONF_AREA_ID = "area_id"
CONF_FLOOR_ID = "floor_id"

KIND_PROPERTY = "property"
KIND_STRUCTURE = "structure"
KIND_FLOOR = "floor"
KIND_AREA = "area"
KIND_OUTSIDE = "outside"

KINDS = (KIND_PROPERTY, KIND_STRUCTURE, KIND_FLOOR, KIND_AREA, KIND_OUTSIDE)
"""What a group can be, in the order the editor's picker lists them: outermost first."""

NODE_KINDS = frozenset({KIND_AREA, KIND_OUTSIDE})
"""The kinds a person can be in. Everything else mixes places; it is not one."""

ALLOWED_CHILDREN: dict[str | None, frozenset[str]] = {
    None: frozenset({KIND_PROPERTY}),  # every root is a property
    KIND_PROPERTY: frozenset({KIND_PROPERTY, KIND_STRUCTURE, KIND_OUTSIDE}),
    KIND_STRUCTURE: frozenset({KIND_FLOOR, KIND_AREA}),
    KIND_FLOOR: frozenset({KIND_AREA}),
    KIND_AREA: frozenset({KIND_AREA}),
    KIND_OUTSIDE: frozenset({KIND_OUTSIDE}),
}
"""The layering, as a table. A property stacks structures and outdoor areas; a structure
stacks floors (or, in a one-storey building, rooms straight away); a floor holds rooms; a
room may hold a sub-room (an ensuite, an alcove); outside holds outside."""

DEFAULT_CHILD_KIND = {
    KIND_PROPERTY: KIND_STRUCTURE,
    KIND_STRUCTURE: KIND_FLOOR,
    KIND_FLOOR: KIND_AREA,
    KIND_AREA: KIND_AREA,
    KIND_OUTSIDE: KIND_OUTSIDE,
}
"""What a child of each kind is when the document gives no other evidence. Only the
migration reads this; a saved document says what it means."""

CONNECTIONS = ("open", "door", "stairs", "exterior_door")
"""How two adjacent groups join. Informational in this release: validated and round-tripped,
and nothing in the estimator weights it yet."""

DEFAULT_CONNECTION = "door"
```

- [ ] **Step 3: `schema.py` — the fields, the rewrite, and the connection enum.** Extend the import from `.const` with `ALLOWED_CHILDREN`, `CONF_AREA_ID`, `CONF_FLOOR_ID`, `CONF_KIND`, `CONNECTIONS`, `DEFAULT_CHILD_KIND`, `DEFAULT_CONNECTION`, `KIND_AREA`, `KIND_OUTSIDE`, `KIND_PROPERTY`, `KINDS`, `NODE_KINDS`, and add `from dataclasses import dataclass` to the top-level imports.

Replace `ADJACENT_SCHEMA` and `_adjacent`:

```python
ADJACENT_SCHEMA = vol.Schema(
    {
        vol.Required("id"): _group_id,
        vol.Optional("connection", default=DEFAULT_CONNECTION): vol.In(CONNECTIONS),
        vol.Optional("one_way", default=False): cv.boolean,
    }
)


def _adjacent(value: Any) -> dict[str, Any]:
    """`kitchen` and `{id: kitchen, connection: stairs, one_way: true}` both name one edge.

    The short form is what a door is: symmetric, and a door. The long form says otherwise --
    an opening with no door in it, a staircase, a way outside, or the rare connection that
    only goes one way. `connection` is carried for the UI and for a later release that may
    weight transitions by it; nothing reads it today.
    """
    if isinstance(value, str):
        value = {"id": value}
    if not isinstance(value, dict):
        raise vol.Invalid("must be a group id or {id, connection, one_way}")
    result: dict[str, Any] = ADJACENT_SCHEMA(value)
    return result
```

In `_group_schema`, replace the `area` line with the three new fields and drop the name default:

```python
            vol.Optional(CONF_KIND, default=None): vol.Any(None, vol.In(KINDS)),
            vol.Optional("area", default=None): vol.Any(None, str),
            vol.Optional(CONF_AREA_ID, default=None): vol.Any(None, str),
            vol.Optional(CONF_FLOOR_ID, default=None): vol.Any(None, str),
```

and replace the tail of `_group_schema`:

```python
    result: dict[str, Any] = schema(value)
    # `area` was the old spelling. Both are accepted so a half-edited file loads, and the
    # normalized document only ever carries `area_id` -- the panel and the device registry
    # then have one field to read, and a round trip cannot resurrect the old one.
    if result["area"] is not None:
        if result[CONF_AREA_ID] is not None and result[CONF_AREA_ID] != result["area"]:
            raise vol.Invalid("area and area_id name different areas; keep area_id", path=["area"])
        result[CONF_AREA_ID] = result["area"]
    del result["area"]
    return result
```

The `name` default (`result["name"] = result["id"].replace("_", " ").title()`) **goes away**: a name that is still null is what lets the editor pre-fill it from a Home Assistant area, and what lets the device fall back to that area's name. `tree.py` takes over the fallback in Task 2. Nothing else reads `config[...]["name"]` — `rg '\["name"\]' custom_components/activity_levels` finds only `schema.py` and `tree.py`.

- [ ] **Step 4: `schema.py` — `infer_kinds`.** Add above `_cross_checks`:

```python
def _wanted_kinds(node: Mapping[str, Any], parent_kind: str | None) -> tuple[str, ...]:
    """The kinds this group looks like, best first.

    Evidence beats position. A group bound to a Home Assistant area is a room; one bound to
    a floor is a floor; one that declares a doorway or a way off the property is somewhere a
    person walks through, which is an area indoors and an outside area beside the house.
    Only when the document says none of that does the layering decide, which is what turns a
    bare `property > house > downstairs > kitchen` into exactly those four kinds.
    """
    if parent_kind is None:
        return (KIND_PROPERTY,)
    wants: list[str] = []
    if node.get(CONF_AREA_ID) is not None:
        wants.append(KIND_AREA)
    if node.get(CONF_FLOOR_ID) is not None:
        wants.append(KIND_FLOOR)
    if node.get("adjacent") or node.get("exit"):
        wants += [KIND_AREA, KIND_OUTSIDE]
    wants.append(DEFAULT_CHILD_KIND[parent_kind])
    return tuple(dict.fromkeys(wants))  # first occurrence wins, order kept


def infer_kinds(config: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Resolve every `kind: null` in a validated document, in place.

    Returns the document and the paths of the groups whose kind was guessed -- the panel
    shows those as "inferred kinds -- check and save", and the cross-checks give them an
    amnesty from the rules that only make sense once somebody has confirmed the kind.

    A group whose evidence leaves no kind its parent may contain is left null; the
    cross-checks turn that into a pathed error, because there is nothing honest to write.
    """
    inferred: list[str] = []

    def walk(node: dict[str, Any], parent_kind: str | None, path: list[Any]) -> None:
        kind = node.get(CONF_KIND)
        if kind is None:
            allowed = ALLOWED_CHILDREN.get(parent_kind, frozenset())
            kind = next((k for k in _wanted_kinds(node, parent_kind) if k in allowed), None)
            node[CONF_KIND] = kind
            if kind is not None:
                inferred.append(_path(path))
        for i, child in enumerate(node["children"]):
            walk(child, kind, [*path, "children", i])

    for i, group in enumerate(config[CONF_GROUPS]):
        walk(group, None, [CONF_GROUPS, i])
    return config, inferred
```

- [ ] **Step 5: `schema.py` — the cross-checks.** Change `_cross_checks(cfg)` to `_cross_checks(cfg: dict[str, Any], inferred: frozenset[str]) -> list[dict[str, str]]`, and add these three blocks.

First, inside `walk`, immediately after the duplicate-id check, the nesting rule (`walk` gains a `parent_kind: str | None` parameter, passed as `None` from the top-level loop and as `group[CONF_KIND]` in the recursive call):

```python
        kind = group[CONF_KIND]
        allowed = ALLOWED_CHILDREN.get(parent_kind, frozenset())
        if kind is None:
            errors.append(
                {
                    "path": _path([*path, CONF_KIND]),
                    "message": (
                        "could not work out what this group is; set its kind "
                        f"({', '.join(sorted(allowed))})"
                    ),
                }
            )
        elif kind not in allowed:
            errors.append(
                {
                    "path": _path([*path, CONF_KIND]),
                    "message": (
                        f"a {parent_kind} cannot contain a {kind}"
                        if parent_kind is not None
                        else "every root group is a property"
                    ),
                }
            )
```

Second, still inside `walk` and still per group, the `exit` and `adjacent` kind rules — skipped for a group whose kind we guessed (decision M2):

```python
        if _path(path) not in inferred and kind is not None:
            if group["adjacent"] and kind not in NODE_KINDS:
                errors.append(
                    {
                        "path": _path([*path, "adjacent"]),
                        "message": f"a {kind} is not somewhere you can walk between; "
                        "only areas and outside areas have adjacent groups",
                    }
                )
            if group["exit"]:
                if kind not in NODE_KINDS:
                    errors.append(
                        {
                            "path": _path([*path, "exit"]),
                            "message": f"a {kind} cannot lead off the property; "
                            "only areas and outside areas can",
                        }
                    )
                elif kind == KIND_AREA and has_outside:
                    errors.append(
                        {
                            "path": _path([*path, "exit"]),
                            "message": "this property has outside areas, so leaving it "
                            "happens from one of those, not from a room",
                        }
                    )
```

`has_outside` is computed once before the group walk, because the rule is about the whole document:

```python
    def _any_outside(nodes: list[dict[str, Any]]) -> bool:
        return any(
            n[CONF_KIND] == KIND_OUTSIDE or _any_outside(n["children"]) for n in nodes
        )

    has_outside = _any_outside(cfg[CONF_GROUPS])
```

Third, in the adjacency loop that already runs after the walk, the endpoint rule. `walked` already carries `(path, group)`, so build the kind index from it:

```python
    kind_of = {group["id"]: group[CONF_KIND] for _, group in walked}
    for path, group in walked:
        seen_edges: set[str] = set()
        for j, edge in enumerate(group["adjacent"]):
            epath = _path([*path, "adjacent", j])
            if edge["id"] == group["id"]:
                errors.append({"path": epath, "message": "a group cannot be adjacent to itself"})
            elif edge["id"] not in seen_groups:
                errors.append({"path": epath, "message": f"unknown group '{edge['id']}'"})
            elif kind_of.get(edge["id"]) not in NODE_KINDS and _path(path) not in inferred:
                errors.append(
                    {
                        "path": epath,
                        "message": f"'{edge['id']}' is a {kind_of[edge['id']]}, "
                        "and only areas and outside areas can be adjacent to anything",
                    }
                )
            if edge["id"] in seen_edges:
                errors.append({"path": epath, "message": "duplicate adjacent group"})
            seen_edges.add(edge["id"])
```

- [ ] **Step 6: `schema.py` — `Validated` and `validate`.** Replace `validate_config` with:

```python
@dataclass(frozen=True)
class Validated:
    """A validated document, and what had to be guessed to get there."""

    config: dict[str, Any]
    inferred: tuple[str, ...]

    @property
    def migrated(self) -> bool:
        """Whether this document arrived without kinds and had them filled in.

        The panel shows a banner while this is true and the next save writes the kinds out,
        which is the whole migration: one pass, visible, and confirmed by a human.
        """
        return bool(self.inferred)


def validate(config: Mapping[str, Any]) -> Validated:
    """Validate and normalize; raise ConfigError with every error found."""
    try:
        cfg: dict[str, Any] = CONFIG_SCHEMA(dict(config))
    except vol.MultipleInvalid as exc:
        raise ConfigError([{"path": _path(e.path), "message": e.msg} for e in exc.errors]) from exc
    except vol.Invalid as exc:
        raise ConfigError([{"path": _path(exc.path), "message": exc.msg}]) from exc
    _apply_pattern_defaults(cfg)
    cfg, inferred = infer_kinds(cfg)
    errors = _cross_checks(cfg, frozenset(inferred))
    if errors:
        raise ConfigError(errors)
    return Validated(config=_stringify_enums(cfg), inferred=tuple(inferred))


def validate_config(config: Mapping[str, Any]) -> dict[str, Any]:
    """The document alone. Every caller that does not care how it got there uses this."""
    return validate(config).config
```

- [ ] **Step 7: GREEN.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_schema.py -q
cd /Users/sholodak/elevenrose/activity-levels && uv run ruff check . && uv run ruff format --check . && uv run mypy
```

Expected: `tests/test_schema.py` fully green; ruff and mypy clean. `uv run pytest -q` as a whole will still fail — `tests/test_topology.py`, `tests/test_tree.py` and `tests/test_init.py` read `node["area"]` and the old node rule, and Task 2 is what fixes them. That is expected at this point and is the only acceptable red.

- [ ] **Step 8: Commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/const.py custom_components/activity_levels/schema.py tests/test_schema.py tests/fixtures.py && git commit -m "feat(config): group kinds, floor and area binding, and connection types"
```

---

### Task 2: Backend consumers — topology nodes, device model, `suggested_area`, `config/get`

**Files:** modify `custom_components/activity_levels/topology.py`, `custom_components/activity_levels/tree.py`, `custom_components/activity_levels/__init__.py`, `custom_components/activity_levels/websocket_api.py`; tests `tests/test_topology.py`, `tests/test_tree.py`, `tests/test_init.py`, `tests/test_websocket.py`.

**Interfaces:**
```python
# topology.py -- the only change to the graph is which groups are in it
def build_topology(config: Mapping[str, Any]) -> Topology   # nodes = kind in NODE_KINDS
def room_ids(config: Mapping[str, Any]) -> frozenset[str]   # unchanged signature
# Topology.order is now tuple[tuple[str, str | None], ...] of (group id, area_id)
# Topology.payload() is unchanged: {"nodes", "edges": [[a, b, one_way]], "exits"}

# tree.py
@dataclass(frozen=True)
class GroupInfo:
    id: str; name: str; kind: str; area_id: str | None; floor_id: str | None
    name_set: bool                      # False when the document left `name` null
    parent_id: str | None; root_id: str; precision: int; max_value: float
    mix: str; group: Group; trigger: Voice; presence: Voice | None

# websocket_api.py
# activity_levels/config/get -> {"config": <resolved document>, "inferred": [path, ...]}
```

- [ ] **Step 1: Tests first (RED).** In `tests/test_topology.py`, replace `test_only_rooms_are_nodes_in_pre_order` and add two:

```python
def test_only_areas_and_outside_areas_are_nodes_in_pre_order(topo) -> None:
    # house infers `property` and downstairs `structure`: neither is a place, whatever
    # they declare. The five rooms all bind an area, so all five are nodes -- including
    # the bedroom, which declares no edge of its own.
    assert topo.nodes == ("kitchen", "dining_room", "hall", "bedroom", "back_patio")
    assert topo.exits == frozenset({"back_patio"})
    assert topo.states == ("kitchen", "dining_room", "hall", "bedroom", "back_patio", AWAY)


def test_a_structure_is_never_a_node_even_when_it_declares_an_edge() -> None:
    """M2 keeps a migrated document loading; the graph still refuses the branch."""
    config = validate_config(rooms_config())
    downstairs = config["groups"][0]["children"][0]
    assert downstairs["kind"] == "structure"
    downstairs["adjacent"] = [{"id": "kitchen", "connection": "door", "one_way": False}]
    topo = build_topology(config)
    assert "downstairs" not in topo.nodes
    assert "downstairs" not in topo.neighbours("kitchen")


def test_an_area_with_no_edges_is_still_a_node() -> None:
    topo = build_topology(validate_config(kinds_config()))
    assert topo.nodes == ("kitchen", "hall", "back_patio")
    assert topo.neighbours("hall") == ("kitchen",)  # symmetric, declared on the kitchen
    assert topo.exits == frozenset({"back_patio"})
```

and update the import line to `from tests.fixtures import house_config, kinds_config, rooms_config`.

In `tests/test_tree.py`, add:

```python
def test_group_info_carries_the_kind_and_the_registry_bindings() -> None:
    tree = build_tree(validate_config(kinds_config()))
    assert tree.groups["property"].kind == "property"
    assert tree.groups["downstairs"].kind == "floor"
    assert tree.groups["downstairs"].floor_id == "downstairs"
    assert tree.groups["downstairs"].area_id is None
    assert tree.groups["kitchen"].kind == "area"
    assert tree.groups["kitchen"].area_id == "kitchen"
    assert tree.groups["back_patio"].kind == "outside"


def test_a_group_with_no_name_falls_back_to_its_id() -> None:
    config = kinds_config()
    del config["groups"][0]["children"][0]["children"][0]["children"][1]["name"]  # the hall
    tree = build_tree(validate_config(config))
    assert tree.groups["hall"].name == "Hall"
    assert tree.groups["hall"].name_set is False
    assert tree.groups["kitchen"].name_set is True
```

In `tests/test_init.py`, add:

```python
async def test_devices_carry_the_kind_as_their_model(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(kinds_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    dev = dr.async_get(hass)
    models = {
        gid: dev.async_get_device(identifiers={(DOMAIN, gid)}).model
        for gid in ("property", "house", "downstairs", "kitchen", "back_patio")
    }
    assert models == {
        "property": "Property",
        "house": "Structure",
        "downstairs": "Floor",
        "kitchen": "Area",
        "back_patio": "Outside",
    }
    # a floor binds a Home Assistant floor, and Home Assistant devices live in areas,
    # so a floor suggests nothing at all
    assert dev.async_get_device(identifiers={(DOMAIN, "downstairs")}).suggested_area is None
    assert dev.async_get_device(identifiers={(DOMAIN, "kitchen")}).suggested_area == "kitchen"


async def test_an_unnamed_group_takes_the_name_of_the_area_it_binds(hass: HomeAssistant) -> None:
    area = ar.async_get(hass).async_get_or_create("Kitchen")
    config = kinds_config()
    kitchen = config["groups"][0]["children"][0]["children"][0]["children"][0]
    kitchen["area_id"] = area.id
    del kitchen["name"]
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(config))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert dr.async_get(hass).async_get_device(identifiers={(DOMAIN, "kitchen")}).name == "Kitchen"


async def test_an_old_document_still_loads_with_the_same_entity_ids(hass: HomeAssistant) -> None:
    """The migration promise, asserted: no kinds in, no entity id moves."""
    for e in ("binary_sensor.front_door", "binary_sensor.living_motion", "binary_sensor.kitchen_motion"):
        hass.states.async_set(e, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    ent = er.async_get(hass)
    assert ent.async_get("sensor.living_room_activity_level") is not None
    assert ent.async_get("sensor.kitchen_activity_level") is not None
    assert ent.async_get("sensor.house_activity_level") is not None
```

with `from homeassistant.helpers import area_registry as ar` and `from tests.fixtures import house_config, kinds_config` at the top.

In `tests/test_websocket.py`, add:

```python
async def test_config_get_returns_the_resolved_document_and_what_was_inferred(
    hass: HomeAssistant, ws_client, entry
) -> None:
    await ws_client.send_json({"id": 1, "type": "activity_levels/config/get"})
    msg = await ws_client.receive_json()
    assert msg["success"]
    house = msg["result"]["config"]["groups"][0]
    assert house["kind"] == "property"
    assert house["children"][0]["kind"] == "structure"
    # the fixture entry stores an already-validated document, so nothing was guessed here
    assert msg["result"]["inferred"] == []


async def test_config_get_reports_the_paths_it_had_to_guess(hass: HomeAssistant, ws_client) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=house_config())  # raw, no kinds
    entry.add_to_hass(hass)
    await ws_client.send_json({"id": 1, "type": "activity_levels/config/get"})
    msg = await ws_client.receive_json()
    assert msg["result"]["inferred"] == ["groups/0", "groups/0/children/0", "groups/0/children/1"]
    assert msg["result"]["config"]["groups"][0]["kind"] == "property"
```

(match the existing file's client fixture names when you write these two — read the top of `tests/test_websocket.py` first and reuse whatever it already calls the connected client and the entry.)

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_topology.py tests/test_tree.py tests/test_init.py tests/test_websocket.py -q
```

Expected: red, on `KeyError: 'area'` in `topology.build_topology` / `tree.build_tree` and on the missing `kind` attribute.

- [ ] **Step 2: `topology.py` — the node rule.** Change the module docstring's second paragraph and `build_topology`. Import `CONF_KIND` and `NODE_KINDS` from `.const` alongside `AWAY` and `CONF_GROUPS`, and replace the docstring paragraph beginning "A *room* is a group that takes part in the graph" with:

```
A *room* is a group whose kind is ``area`` or ``outside`` -- somewhere a person can be.
Everything else in the tree (the property, a structure, a floor) stacks rooms and is not a
place, so giving the filter a state for it would only invent somewhere to hide. The kind is
in the document, so this no longer has to guess from the edges: a room with no doorway
declared yet is still a room, and a floor that somehow declares one is still not.
```

and `build_topology`'s walk and node selection:

```python
    def walk(node: Mapping[str, Any]) -> None:
        gid = node["id"]
        order.append((gid, node.get(CONF_AREA_ID)))
        if node.get(CONF_KIND) in NODE_KINDS:
            rooms.append(gid)
            if node.get("exit"):
                exits.add(gid)
            for edge in node.get("adjacent") or []:
                declared.append((gid, edge["id"], bool(edge.get("one_way"))))
        for child in node.get("children") or []:
            walk(child)

    for group in config.get(CONF_GROUPS) or []:
        walk(group)

    nodes = tuple(rooms)
    known = set(nodes)
    out: dict[str, set[str]] = {}
    for a, b, one_way in declared:
        if a == b or b not in known:
            continue  # the schema rejects these; a stale or non-room id loses its edge
        out.setdefault(a, set()).add(b)
        if not one_way:
            out.setdefault(b, set()).add(a)
```

with `rooms: list[str] = []` declared beside `order`/`declared`/`exits`, and the trailing `touched`/`nodes`/`rooms` block deleted — `nodes` is now the pre-order list of node-kind groups, `linked` is built from it exactly as before:

```python
    linked = {gid: frozenset(out.get(gid, set()) & known) for gid in nodes}
    return Topology(
        nodes=nodes,
        edges=_edges(nodes, linked),
        exits=frozenset(exits),
        out=linked,
        order=tuple(order),
    )
```

Nothing else in the module moves: `transition_matrix`, `paths`, `reachable`, `feasible` and `map_scanners` all read `nodes`/`out`/`exits` and are untouched, which is the constraint this task is under.

- [ ] **Step 3: `tree.py` — carry the kind and the bindings.** Extend the `.const` import with `CONF_AREA_ID`, `CONF_FLOOR_ID`, `CONF_KIND`, replace `GroupInfo`'s `area` field and add the rest:

```python
@dataclass(frozen=True)
class GroupInfo:
    id: str
    name: str
    kind: str
    area_id: str | None
    floor_id: str | None
    name_set: bool
    parent_id: str | None
    root_id: str
    precision: int
    max_value: float
    mix: str
    group: Group
    trigger: Voice
    presence: Voice | None
```

and in `build`, replace the `GroupInfo(...)` construction's identity fields:

```python
        # The schema no longer titles an unnamed group: a null name is what lets the editor
        # pre-fill it from a Home Assistant area and the device fall back to that area's
        # name. Everything downstream still wants a string, so the fallback lives here.
        name_set = node["name"] is not None
        tree.groups[gid] = GroupInfo(
            id=gid,
            name=node["name"] if name_set else gid.replace("_", " ").title(),
            kind=node[CONF_KIND],
            area_id=node[CONF_AREA_ID],
            floor_id=node[CONF_FLOOR_ID],
            name_set=name_set,
            parent_id=parent_id,
            root_id=rid,
            ...
        )
```

- [ ] **Step 4: `__init__.py` — model, `suggested_area`, and the area-name fallback.** Replace `MODEL` in the `.const` import with `MODEL_BY_KIND` (keep `MODEL` too: it is the fallback for the impossible case of a kind this build does not know), add `from homeassistant.helpers import area_registry as ar`, and rewrite the group loop of `_create_devices`:

```python
    areas = ar.async_get(hass)
    for info in tree.group_order():
        # A floor binds a Home Assistant *floor*, and Home Assistant devices belong to
        # areas, not floors -- so only an area-bound group suggests anything.
        area = areas.async_get_area(info.area_id) if info.area_id else None
        registry.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={(DOMAIN, info.id)},
            # a group that was never named takes the name of the area it binds, which is
            # the whole point of binding one: nobody should type "Kitchen" twice
            name=info.name if info.name_set or area is None else area.name,
            manufacturer=MANUFACTURER,
            model=MODEL_BY_KIND.get(info.kind, MODEL),
            suggested_area=info.area_id,
            via_device=(DOMAIN, info.parent_id or entry.entry_id),
        )
```

- [ ] **Step 5: `websocket_api.py` — `config/get` answers with the resolved document.** Replace `ws_config_get`'s body, and change its `.schema` import to `from .schema import ConfigError, validate, validate_config`:

```python
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "not_found", "Activity Levels is not configured")
        return
    options = dict(entries[0].options)
    try:
        result = validate(options)
    except ConfigError:
        # A document the panel has to be able to open in order to fix. Hand back exactly
        # what is stored; `config/validate` is where the errors come from.
        connection.send_result(msg["id"], {"config": options, "inferred": []})
        return
    connection.send_result(
        msg["id"], {"config": result.config, "inferred": list(result.inferred)}
    )
```

- [ ] **Step 6: GREEN.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest -q
cd /Users/sholodak/elevenrose/activity-levels && uv run ruff check . && uv run ruff format --check . && uv run mypy
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_purity.py -q
```

Expected: the whole Python suite green, ruff/format/mypy clean, and the purity test still passing — `topology.py` imports only `numpy` and `.const`, and `const.py` gained nothing but strings and dicts.

- [ ] **Step 7: Commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/topology.py custom_components/activity_levels/tree.py custom_components/activity_levels/__init__.py custom_components/activity_levels/websocket_api.py tests/test_topology.py tests/test_tree.py tests/test_init.py tests/test_websocket.py && git commit -m "feat(config): kinds decide the topology, the device model and config/get"
```

---

### Task 3: Frontend — kinds, the model, and the pure move/drop reducers

**Files:** create `frontend/src/kinds.ts`, `frontend/test/kinds.test.ts`; modify `frontend/src/types.ts`, `frontend/src/model.ts`, `frontend/src/store.ts`, `frontend/src/group-form.ts`, `frontend/src/api.ts`, `frontend/test/fixtures.ts`, `frontend/test/store.test.ts`, `frontend/test/model.test.ts`, `frontend/test/group-form.test.ts`.

**Interfaces:**
```ts
// kinds.ts -- pure, imported by both model.ts and store.ts, imports neither (no cycle)
export type Kind = "property" | "structure" | "floor" | "area" | "outside";
export type Connection = "open" | "door" | "stairs" | "exterior_door";
export const KINDS: readonly Kind[];
export const CONNECTIONS: readonly Connection[];
export const DEFAULT_CONNECTION: Connection;
export interface KindDef { label: string; icon: string; definition: string }
export const KIND_DEFS: Record<Kind, KindDef>;
export const CONNECTION_LABELS: Record<Connection, string>;
export const ALLOWED_CHILDREN: Record<Kind, readonly Kind[]>;
export const ROOT_KINDS: readonly Kind[];
export const NODE_KINDS: ReadonlySet<Kind>;
export function allowedChildKinds(parent: Kind | null): readonly Kind[];
export function isDescendantPath(ancestor: Path, candidate: Path): boolean;

// store.ts
export type DropVerdict = { ok: true } | { ok: false; reason: string };
export function legalDrop(config: Config, from: Path, toParent: Path, index: number): DropVerdict;
export function moveNode(config: Config, from: Path, toParent: Path, index: number): Config;

// model.ts
export function newGroup(id: string, kind: Kind): Group;
export function adjacencyConnection(a: string | Adjacency): Connection;
export function declaredOn(config: Config, id: string): { group: Group; edge: Adjacency }[];
export function hasOutside(config: Config): boolean;
export function walkGroups(config: Config): { group: Group; path: Path; parent: Group | null }[];

// api.ts
export interface ConfigGet { config: Config; inferred: string[] }
export const getConfig: (hass: HomeAssistant) => Promise<ConfigGet>;
```

`toParent` is the destination **list** path — `["groups"]`, `[...,"children"]` or `[...,"stimuli"]` — and `index` is a slot in that list **as it reads before the move**. `moveNode` does the off-by-one itself when a node moves down within its own list, and that arithmetic is what the tests pin.

- [ ] **Step 1: Tests first (RED).** Create `frontend/test/kinds.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ALLOWED_CHILDREN, KINDS, KIND_DEFS, NODE_KINDS, allowedChildKinds, isDescendantPath } from "../src/kinds";

describe("kinds", () => {
  it("lists the layering outermost first, and defines every one of them", () => {
    expect(KINDS).toEqual(["property", "structure", "floor", "area", "outside"]);
    for (const kind of KINDS) {
      expect(KIND_DEFS[kind].label.length).toBeGreaterThan(0);
      expect(KIND_DEFS[kind].icon.startsWith("mdi:")).toBe(true);
      expect(KIND_DEFS[kind].definition.endsWith(".")).toBe(true);
    }
  });

  it("mirrors the backend's nesting table exactly", () => {
    expect(allowedChildKinds(null)).toEqual(["property"]);
    expect(ALLOWED_CHILDREN.property).toEqual(["property", "structure", "outside"]);
    expect(ALLOWED_CHILDREN.structure).toEqual(["floor", "area"]);
    expect(ALLOWED_CHILDREN.floor).toEqual(["area"]);
    expect(ALLOWED_CHILDREN.area).toEqual(["area"]);
    expect(ALLOWED_CHILDREN.outside).toEqual(["outside"]);
  });

  it("knows which kinds are places a person can be", () => {
    expect([...NODE_KINDS].sort()).toEqual(["area", "outside"]);
  });

  it("recognises a descendant path, and does not call a node its own descendant", () => {
    expect(isDescendantPath(["groups", 0], ["groups", 0, "children", 1])).toBe(true);
    expect(isDescendantPath(["groups", 0], ["groups", 0])).toBe(false);
    expect(isDescendantPath(["groups", 0], ["groups", 1, "children", 0])).toBe(false);
    // index 1 is not a prefix of index 10, whatever string concatenation would say
    expect(isDescendantPath(["groups", 1], ["groups", 10, "children", 0])).toBe(false);
  });
});
```

Append to `frontend/test/store.test.ts`:

```ts
describe("legalDrop", () => {
  const cfg = kindsConfig();
  const PROPERTY: Path = ["groups", 0];
  const HOUSE: Path = ["groups", 0, "children", 0];
  const DOWNSTAIRS: Path = ["groups", 0, "children", 0, "children", 0];
  const KITCHEN: Path = ["groups", 0, "children", 0, "children", 0, "children", 0];
  const PATIO: Path = ["groups", 0, "children", 1];
  const KITCHEN_STIMULUS: Path = [...KITCHEN, "stimuli", 0];

  it("allows a move the nesting rules permit", () => {
    expect(legalDrop(cfg, KITCHEN, [...HOUSE, "children"], 1)).toEqual({ ok: true });
  });

  it("refuses a kind the destination cannot contain", () => {
    const verdict = legalDrop(cfg, KITCHEN, ["groups", 0, "children"], 0);
    expect(verdict.ok).toBe(false);
    expect(verdict).toMatchObject({ reason: expect.stringContaining("property cannot contain") });
  });

  it("refuses a group into itself or into its own descendant", () => {
    expect(legalDrop(cfg, HOUSE, [...HOUSE, "children"], 0).ok).toBe(false);
    expect(legalDrop(cfg, HOUSE, [...DOWNSTAIRS, "children"], 0)).toMatchObject({
      reason: expect.stringContaining("into itself"),
    });
  });

  it("only lets a root list take a property, and only a property", () => {
    expect(legalDrop(cfg, PATIO, ["groups"], 1)).toMatchObject({
      reason: expect.stringContaining("every root group is a property"),
    });
    expect(legalDrop(cfg, PROPERTY, ["groups"], 0)).toEqual({ ok: true });
  });

  it("keeps a stimulus inside a stimuli list and a group out of one", () => {
    expect(legalDrop(cfg, KITCHEN_STIMULUS, [...HOUSE, "children"], 0)).toMatchObject({
      reason: expect.stringContaining("belongs to a group"),
    });
    expect(legalDrop(cfg, KITCHEN, [...KITCHEN, "stimuli"], 0)).toMatchObject({
      reason: expect.stringContaining("not a stimulus"),
    });
  });

  it("refuses an index outside the destination list", () => {
    expect(legalDrop(cfg, KITCHEN, [...HOUSE, "children"], 9).ok).toBe(false);
    expect(legalDrop(cfg, KITCHEN, [...HOUSE, "children"], -1).ok).toBe(false);
  });

  it("refuses a path that names nothing", () => {
    expect(legalDrop(cfg, ["groups", 7], ["groups"], 0).ok).toBe(false);
    expect(legalDrop(cfg, KITCHEN, ["groups", 7, "children"], 0).ok).toBe(false);
  });
});

describe("moveNode", () => {
  const ids = (c: Config, path: Path): string[] =>
    (getAt<{ id: string }[]>(c, path) ?? []).map((g) => g.id);

  it("reparents a group and leaves the rest of the document shared", () => {
    const cfg = kindsConfig();
    const next = moveNode(cfg, ["groups", 0, "children", 0, "children", 0, "children", 0], ["groups", 0, "children", 0, "children"], 1);
    expect(ids(next, ["groups", 0, "children", 0, "children"])).toEqual(["downstairs", "kitchen"]);
    expect(ids(next, ["groups", 0, "children", 0, "children", 0, "children"])).toEqual(["hall"]);
    expect(next.envelopes).toBe(cfg.envelopes);
    expect(cfg.groups[0]!.children[0]!.children[0]!.children).toHaveLength(2);
  });

  it("compensates for its own removal when moving down inside one list", () => {
    const cfg = kindsConfig();
    const list: Path = ["groups", 0, "children", 0, "children", 0, "children"];
    expect(ids(cfg, list)).toEqual(["kitchen", "hall"]);
    // "put the kitchen at slot 2 of the list as it reads now" = after the hall
    expect(ids(moveNode(cfg, [...list, 0], list, 2), list)).toEqual(["hall", "kitchen"]);
    // and moving up needs no compensation at all
    expect(ids(moveNode(cfg, [...list, 1], list, 0), list)).toEqual(["hall", "kitchen"]);
  });

  it("is a no-op move, not a duplication, when the slot is where it already is", () => {
    const cfg = kindsConfig();
    const list: Path = ["groups", 0, "children", 0, "children", 0, "children"];
    expect(ids(moveNode(cfg, [...list, 0], list, 0), list)).toEqual(["kitchen", "hall"]);
  });

  it("moves a stimulus between groups", () => {
    const cfg = kindsConfig();
    const kitchen: Path = ["groups", 0, "children", 0, "children", 0, "children", 0];
    const hall: Path = ["groups", 0, "children", 0, "children", 0, "children", 1];
    const next = moveNode(cfg, [...kitchen, "stimuli", 0], [...hall, "stimuli"], 0);
    expect(getAt<unknown[]>(next, [...kitchen, "stimuli"])).toHaveLength(0);
    expect(getAt<{ entity: string }[]>(next, [...hall, "stimuli"])!.map((s) => s.entity)).toEqual([
      "binary_sensor.kitchen_motion",
      "binary_sensor.hall_motion",
    ]);
  });
});
```

with `import { Draft, getAt, insertAt, legalDrop, moveAt, moveNode, removeAt, setAt } from "../src/store";`, `import { kindsConfig } from "./fixtures";` and `import type { Config, Path } from "../src/types";` at the top of the file.

Append to `frontend/test/model.test.ts`:

```ts
describe("kinds on the model", () => {
  it("makes a new group of the kind it was asked for", () => {
    expect(newGroup("den", "area")).toMatchObject({ id: "den", kind: "area", area_id: null, floor_id: null });
  });

  it("reads a plain adjacency id as a two-way door", () => {
    expect(adjacencyConnection("hall")).toBe("door");
    expect(adjacencyConnection({ id: "hall", connection: "stairs", one_way: true })).toBe("stairs");
  });

  it("finds the edges other groups declare against one", () => {
    const declared = declaredOn(kindsConfig(), "hall");
    expect(declared).toHaveLength(1);
    expect(declared[0]!.group.id).toBe("kitchen");
    expect(declared[0]!.edge).toMatchObject({ id: "hall", connection: "open" });
    expect(declaredOn(kindsConfig(), "kitchen")).toEqual([]);
  });

  it("says whether the property models anything outside", () => {
    expect(hasOutside(kindsConfig())).toBe(true);
    expect(hasOutside(houseConfig())).toBe(false);
  });

  it("counts areas and outside areas as rooms, whatever they declare", () => {
    expect([...roomIds(kindsConfig())].sort()).toEqual(["back_patio", "hall", "kitchen"]);
  });
});
```

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/kinds.test.ts test/store.test.ts test/model.test.ts
```

Expected: red — `kinds.ts` does not exist and `legalDrop`/`moveNode`/`kindsConfig` are not exported.

- [ ] **Step 2: `frontend/src/kinds.ts`.** The whole file:

```ts
import type { Path } from "./types";

/**
 * What a group is on the property, and the rules that follow from it. Pure, and imported
 * by both `model.ts` and `store.ts` — which is why it lives on its own: `model.ts` already
 * imports `store.ts`, so putting these there and reading them from the reducers would
 * close a cycle the bundler would have to guess its way out of.
 */

export type Kind = "property" | "structure" | "floor" | "area" | "outside";
export type Connection = "open" | "door" | "stairs" | "exterior_door";

/** Outermost first, which is the order the picker offers them in. */
export const KINDS: readonly Kind[] = ["property", "structure", "floor", "area", "outside"];

export const CONNECTIONS: readonly Connection[] = ["open", "door", "stairs", "exterior_door"];

/** A bare id in `adjacent` is a doorway: the commonest thing, so it is the default. */
export const DEFAULT_CONNECTION: Connection = "door";

export interface KindDef {
  label: string;
  icon: string;
  /** One line, rendered as the Identity panel's subtitle and under the kind picker. */
  definition: string;
}

export const KIND_DEFS: Record<Kind, KindDef> = {
  property: {
    label: "Property",
    icon: "mdi:home-city",
    definition: "The whole lot: everything you own, inside and out. Every configuration starts with one.",
  },
  structure: {
    label: "Structure",
    icon: "mdi:home",
    definition: "A building on the property — the house, a garage, a shed.",
  },
  floor: {
    label: "Floor",
    icon: "mdi:layers",
    definition: "One level of a structure. Bind it to a Home Assistant floor to reuse its name.",
  },
  area: {
    label: "Area",
    icon: "mdi:door",
    definition:
      "A room or zone people occupy. Bind it to a Home Assistant area to reuse its name and put its entities in the right place.",
  },
  outside: {
    label: "Outside",
    icon: "mdi:tree",
    definition: "An outdoor area — a yard, a patio, the driveway. Outside areas can lead off the property.",
  },
};

export const CONNECTION_LABELS: Record<Connection, string> = {
  open: "Open (no door)",
  door: "Door",
  stairs: "Stairs",
  exterior_door: "Exterior door",
};

/** The nesting table, mirroring `ALLOWED_CHILDREN` in `const.py`. */
export const ALLOWED_CHILDREN: Record<Kind, readonly Kind[]> = {
  property: ["property", "structure", "outside"],
  structure: ["floor", "area"],
  floor: ["area"],
  area: ["area"],
  outside: ["outside"],
};

/** Every root is a property. */
export const ROOT_KINDS: readonly Kind[] = ["property"];

/** The kinds a person can be in, and therefore the ones the room graph has states for. */
export const NODE_KINDS: ReadonlySet<Kind> = new Set<Kind>(["area", "outside"]);

/** What may go inside a group of this kind; `null` asks what may be a root. */
export const allowedChildKinds = (parent: Kind | null): readonly Kind[] =>
  parent === null ? ROOT_KINDS : ALLOWED_CHILDREN[parent];

/**
 * Whether `candidate` is inside `ancestor`. Compared step by step rather than by joining
 * to a string, because `groups/1` is a string prefix of `groups/10` and is not its parent.
 */
export function isDescendantPath(ancestor: Path, candidate: Path): boolean {
  if (candidate.length <= ancestor.length) return false;
  return ancestor.every((step, i) => candidate[i] === step);
}
```

- [ ] **Step 3: `frontend/src/types.ts`.** Re-export the kind vocabulary from its new home and widen `Group`:

```ts
export type { Connection, Kind } from "./kinds";
import type { Connection, Kind } from "./kinds";
```

Replace the `Adjacency` interface and the `Group` identity fields:

```ts
/** One edge out of a group. A plain id in the document means `{ connection: "door", one_way: false }`. */
export interface Adjacency { id: string; connection: Connection; one_way: boolean }

export interface Group {
  id: string;
  name: string | null;
  /** What this group is on the property. Null only in a document the backend refused. */
  kind: Kind;
  /** The Home Assistant floor this group binds, for a `floor`. Optional: a floor need not exist. */
  floor_id: string | null;
  /** The Home Assistant area this group binds. Was `area`; the backend rewrites the old spelling. */
  area_id: string | null;
  mix: Mix;
  null_handling: NullHandling;
  max_value: number | null;
  precision: number | null;
  gain: number;
  /** Groups you can walk between from here. See {@link Adjacency}. */
  adjacent: (string | Adjacency)[];
  /** Whether presence can leave the property from here, to Away. */
  exit: boolean;
  presence: PresenceOverrides;
  stimuli: Stimulus[];
  children: Group[];
}
```

- [ ] **Step 4: `frontend/src/model.ts`.** Import the vocabulary, take a kind in `newGroup`, and add the four helpers. Replace `newGroup` and `roomIds`, and add the rest beside `adjacencyId`:

```ts
import { DEFAULT_CONNECTION, NODE_KINDS } from "./kinds";
import type { Connection, Kind } from "./kinds";

export const newGroup = (id: string, kind: Kind): Group => ({
  id,
  name: null,
  kind,
  floor_id: null,
  area_id: null,
  mix: "sum",
  null_handling: "zero",
  max_value: null,
  precision: null,
  gain: 1,
  adjacent: [],
  exit: false,
  presence: newPresenceOverrides(),
  stimuli: [],
  children: [],
});

/** How an adjacency entry joins the two groups. A plain id is a doorway. */
export const adjacencyConnection = (a: string | Adjacency): Connection =>
  typeof a === "string" ? DEFAULT_CONNECTION : a.connection;

/** Every group in the document, in tree order, with its path and its parent. */
export function walkGroups(config: Config): { group: Group; path: Path; parent: Group | null }[] {
  const out: { group: Group; path: Path; parent: Group | null }[] = [];
  const walk = (group: Group, path: Path, parent: Group | null): void => {
    out.push({ group, path, parent });
    group.children.forEach((child, i) => walk(child, [...path, "children", i], group));
  };
  config.groups.forEach((group, i) => walk(group, ["groups", i], null));
  return out;
}

/**
 * The edges *other* groups declare against this one. An edge is written once, from
 * whichever side read more naturally, so the table has to show both halves — the rows it
 * owns and can edit, and the rows somebody else owns and it can only read.
 */
export function declaredOn(config: Config, id: string): { group: Group; edge: Adjacency }[] {
  const out: { group: Group; edge: Adjacency }[] = [];
  for (const { group } of walkGroups(config)) {
    if (group.id === id) continue;
    for (const entry of group.adjacent ?? []) {
      if (adjacencyId(entry) !== id) continue;
      out.push({
        group,
        edge: {
          id,
          connection: adjacencyConnection(entry),
          one_way: isOneWay(entry),
        },
      });
    }
  }
  return out;
}

/**
 * Whether anything outdoors is modelled. It decides one rule: a room may only be the way
 * off the property when there is no outside area to leave from instead.
 */
export const hasOutside = (config: Config): boolean =>
  walkGroups(config).some(({ group }) => group.kind === "outside");

/**
 * Which groups are rooms — the states the room graph has. The document says so now, so
 * this is the kind and nothing else: a room with no doorway declared yet is still a room.
 */
export function roomIds(config: Config): Set<string> {
  return new Set(
    walkGroups(config)
      .filter(({ group }) => NODE_KINDS.has(group.kind))
      .map(({ group }) => group.id),
  );
}
```

- [ ] **Step 5: `frontend/src/store.ts` — the reducers.** Append, with `import { allowedChildKinds, isDescendantPath } from "./kinds";` and `import type { Group, Stimulus } from "./types";` added to the imports:

```ts
/** Why a drop is refused, or that it is not. The reason is what the row shows as a hint. */
export type DropVerdict = { ok: true } | { ok: false; reason: string };

const NO = (reason: string): DropVerdict => ({ ok: false, reason });

/** The list a path's node lives in, and its slot in it. */
const listOf = (path: Path): { list: Path; index: number } => ({
  list: path.slice(0, -1),
  index: path[path.length - 1] as number,
});

const isStimulusList = (list: Path): boolean => list[list.length - 1] === "stimuli";

/**
 * Whether `from` may be dropped into `toParent` at `index`.
 *
 * `toParent` is the destination *list* — `["groups"]`, `[…,"children"]` or `[…,"stimuli"]` —
 * and `index` is a slot in that list as it reads now, before anything moves. Every rule the
 * backend would reject on Save is checked here instead, so an illegal drag is refused with
 * a sentence rather than accepted and then failed by the server.
 */
export function legalDrop(config: Config, from: Path, toParent: Path, index: number): DropVerdict {
  const node = getAt<Group | Stimulus>(config, from);
  if (node === undefined) return NO("that node is gone");
  const target = getAt<unknown[]>(config, toParent);
  if (!Array.isArray(target)) return NO("there is nothing to drop into there");
  if (index < 0 || index > target.length) return NO("that is not a slot in this list");

  const movingStimulus = isStimulusList(listOf(from).list);
  if (movingStimulus !== isStimulusList(toParent))
    return movingStimulus
      ? NO("a stimulus belongs to a group, not beside one")
      : NO("that is not a stimulus");
  if (movingStimulus) return { ok: true };

  const group = node as Group;
  if (isDescendantPath(from, toParent) || pathsEqual(from, toParent.slice(0, -1)))
    return NO("a group cannot go into itself");
  const parentPath = toParent.slice(0, -1);
  const parent = toParent.length === 1 ? null : getAt<Group>(config, parentPath);
  if (toParent.length > 1 && parent === undefined) return NO("that group is gone");
  const allowed = allowedChildKinds(parent === null ? null : parent.kind);
  if (!allowed.includes(group.kind))
    return NO(
      parent === null
        ? "every root group is a property"
        : `a ${parent.kind} cannot contain a ${group.kind}`,
    );
  return { ok: true };
}

const pathsEqual = (a: Path, b: Path): boolean =>
  a.length === b.length && a.every((step, i) => b[i] === step);

/**
 * Moves a node to `index` of `toParent`. The caller passes the slot as the list reads
 * *now*; when the node is already in that list and above the slot, its own removal shifts
 * everything below it up by one, and this is where that is paid for — so a drag and an
 * Alt+arrow can both say "put it there" and mean the same thing.
 */
export function moveNode<T extends Config>(config: T, from: Path, toParent: Path, index: number): T {
  const { list, index: at } = listOf(from);
  const same = pathsEqual(list, toParent);
  if (same && (index === at || index === at + 1)) return config;
  const node = getAt(config, from);
  const removed = removeAt(config, from);
  return insertAt(removed, toParent, same && index > at ? index - 1 : index, node);
}
```

- [ ] **Step 6: The call sites the new types break.** `pnpm typecheck` names them; they are exactly three, and all three are mechanical:

1. `frontend/src/group-form.ts`: rename the `area` field to `area_id` throughout — `GroupField`, `GROUP_LABELS` (`area_id: "Area"`), `GROUP_HELPERS`, `GROUP_FORM_FIELDS`, the `selectors` record (`area_id: { area: {} }`), the `applies` filter's `name === "area"` guard (`name === "area_id" && group.area_id === null`), `groupData`'s `area: group.area` → `area_id: group.area_id`, and `mergeGroup`'s `if ("area" in v)` → `if ("area_id" in v) merged.area_id = emptyToNull(v.area_id as string | null | undefined);`. `al-group-editor.ts` and `al-strip-controls.ts` pass field lists, so their `"area"` entries become `"area_id"`.
2. `frontend/src/al-tree.ts`: `newGroup(uniqueGroupId(config, "new_group"))` → `newGroup(uniqueGroupId(config, "new_group"), "area")` as a placeholder; Task 4 replaces the whole call with the add-group menu's chosen kind.
3. `frontend/test/fixtures.ts`: give every `newGroup` call its kind, rename `area:` to `area_id:`, spell the adjacency entries out, and add `kindsConfig`. `houseConfig` becomes `house` `property` / `living_room` `structure` / `kitchen` `structure` — the same kinds the backend infers for `house_config()`, which is what makes the two fixtures mirrors. `roomsConfig` becomes `house` `property` / `downstairs` `structure` / the five rooms `area`. Then add, mirroring `kinds_config()`:

```ts
const kindsEnvelopes: Config["envelopes"] = [
  { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
];

/** Mirrors `kinds_config`: property > structure > floor > area, with an outside area beside it. */
export const kindsConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes: kindsEnvelopes,
  groups: [
    {
      ...newGroup("property", "property"),
      name: "Property",
      mix: "max",
      children: [
        {
          ...newGroup("house", "structure"),
          name: "House",
          mix: "max",
          children: [
            {
              ...newGroup("downstairs", "floor"),
              name: "Downstairs",
              floor_id: "downstairs",
              mix: "max",
              children: [
                {
                  ...newGroup("kitchen", "area"),
                  name: "Kitchen",
                  area_id: "kitchen",
                  adjacent: [
                    { id: "hall", connection: "open", one_way: false },
                    { id: "back_patio", connection: "exterior_door", one_way: false },
                  ],
                  stimuli: [newStimulus("binary_sensor.kitchen_motion")],
                },
                {
                  ...newGroup("hall", "area"),
                  name: "Hall",
                  area_id: "hall",
                  stimuli: [newStimulus("binary_sensor.hall_motion")],
                },
              ],
            },
          ],
        },
        {
          ...newGroup("back_patio", "outside"),
          name: "Back Patio",
          exit: true,
          stimuli: [newStimulus("binary_sensor.patio_motion")],
        },
      ],
    },
  ],
});
```

Every other test file that builds a `Config` inline (`al-tree.test.ts`, `store.test.ts`, `al-mixer.test.ts`, `al-strip.test.ts`, …) uses `newGroup`; `pnpm typecheck` lists each one, and the fix is the second argument.

- [ ] **Step 7: `frontend/src/api.ts` — `config/get` grew a second field.**

```ts
/** `activity_levels/config/get`. `inferred` names the groups whose kind the loader guessed. */
export interface ConfigGet {
  config: Config;
  inferred: string[];
}

export const getConfig = (hass: HomeAssistant): Promise<ConfigGet> =>
  hass
    .callWS<{ config: Config; inferred?: string[] }>({ type: "activity_levels/config/get" })
    .then((r) => ({ config: r.config, inferred: r.inferred ?? [] }));
```

`activity-levels-panel.ts`'s `load()` becomes `const { config, inferred } = await getConfig(this.hass); this.draft = new Draft(config); this.inferred = inferred;` with `@state() private inferred: string[] = [];` beside the other state — Task 5 renders the banner off it. Update `frontend/test/api.test.ts`'s `getConfig` case to assert the pair.

- [ ] **Step 8: GREEN, then rebuild the bundle.**

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm test
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm build
```

Expected: eslint clean, `tsc --noEmit` clean, the whole vitest suite green (the components still render, because nothing they read changed name except `area` → `area_id`, which Step 6 renamed), and `pnpm build` rewriting the committed bundle.

- [ ] **Step 9: Commit, bundle included.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add frontend/src/kinds.ts frontend/src/types.ts frontend/src/model.ts frontend/src/store.ts frontend/src/group-form.ts frontend/src/api.ts frontend/src/al-tree.ts frontend/src/al-group-editor.ts frontend/src/al-strip-controls.ts frontend/src/activity-levels-panel.ts frontend/test custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "feat(panel): kind vocabulary and pure move/drop reducers"
```

---

### Task 4: The Groups tree — flat rows, hover actions, drag-and-drop, keyboard parity

**Files:** create `frontend/src/tree-rows.ts`, `frontend/test/tree-rows.test.ts`; modify `frontend/src/al-tree.ts`, `frontend/src/styles.ts`, `frontend/test/al-tree.test.ts`.

**Interfaces:**
```ts
// tree-rows.ts
export interface Row {
  path: Path;
  depth: number;
  kind: "group" | "stimulus" | "placeholder";
  group?: Group;          // set for "group" and for the "placeholder" that belongs to one
  stimulus?: Stimulus;
  expandable: boolean;
  expanded: boolean;
}
export function flattenRows(config: Config, expanded: ReadonlySet<string>): Row[];
export function loadExpanded(): Set<string>;
export function saveExpanded(expanded: ReadonlySet<string>): void;
export const EXPANDED_KEY = "activity_levels.groups_expanded";
```

The tree's contract, item by item, because the tests pin each one:

- One `.row` per node, no `ha-expansion-panel`, no borders, no card padding. Indent is `--al-indent: <depth>` on the row and a `.guides` span per depth.
- A caret (`ha-icon-button.caret`) only on a group with children or stimuli; it toggles and nothing else. Clicking the label, the icon or blank row space selects and does **not** toggle.
- A fixed-width `.actions` column, right-aligned, `visibility: hidden` until `:hover`, `:focus-within` or `.selected`. On a group: *Add stimulus*, *Add group* (a menu of the kinds `allowedChildKinds(group.kind)` permits), *Delete*. On a stimulus: *Delete*. No up/down arrows anywhere.
- `draggable="true"` on every row. `dragstart` writes the path as JSON into `text/plain` and sets `.dragging`; `dragover` computes a target from the pointer's position in the row — top third = before, bottom third = after, middle = into (last child), and *into* is only offered for a group; `drop` calls `moveNode`; an illegal target sets `dropEffect = "none"`, adds `.illegal` and renders the verdict's reason in the row.
- Alt+↑/↓ reorder within the list; Alt+→ makes the node the last child of the sibling above it; Alt+← makes it the next sibling of its parent. Each is `legalDrop` then `moveNode`, with no drag involved.
- "No stimuli yet" shows only for an expanded group with **no children at all** — no stimuli and no child groups — as one muted line.

- [ ] **Step 1: Tests first (RED).** Create `frontend/test/tree-rows.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EXPANDED_KEY, flattenRows, loadExpanded, saveExpanded } from "../src/tree-rows";
import { kindsConfig } from "./fixtures";
import { newGroup } from "../src/model";

const keys = (config = kindsConfig(), expanded = new Set<string>()): string[] =>
  flattenRows(config, expanded).map((r) => `${r.path.join("/")}:${r.kind}`);

describe("flattenRows", () => {
  beforeEach(() => localStorage.clear());

  it("shows only the roots when nothing is expanded", () => {
    expect(keys()).toEqual(["groups/0:group"]);
  });

  it("walks children then stimuli, in document order, at increasing depth", () => {
    const expanded = new Set(["groups/0", "groups/0/children/0", "groups/0/children/0/children/0"]);
    const rows = flattenRows(kindsConfig(), expanded);
    expect(rows.map((r) => r.path.join("/"))).toEqual([
      "groups/0",
      "groups/0/children/0",
      "groups/0/children/0/children/0",
      "groups/0/children/0/children/0/children/0",
      "groups/0/children/0/children/0/children/1",
      "groups/0/children/1",
    ]);
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 2, 3, 3, 1]);
  });

  it("puts a group's stimuli after its child groups", () => {
    const config = kindsConfig();
    const rows = flattenRows(config, new Set(["groups/0", "groups/0/children/1"]));
    expect(rows.map((r) => r.path.join("/"))).toEqual([
      "groups/0",
      "groups/0/children/0",
      "groups/0/children/1",
      "groups/0/children/1/stimuli/0",
    ]);
    expect(rows[3]!.kind).toBe("stimulus");
  });

  it("marks a childless group unexpandable and gives it the placeholder when open", () => {
    const config = kindsConfig();
    config.groups[0]!.children[1]!.stimuli = [];
    const rows = flattenRows(config, new Set(["groups/0", "groups/0/children/1"]));
    const patio = rows.find((r) => r.path.join("/") === "groups/0/children/1")!;
    expect(patio.expandable).toBe(false);
    expect(rows.at(-1)!.kind).toBe("placeholder");
    expect(rows.at(-1)!.depth).toBe(2);
  });

  it("shows no placeholder for a group that has something in it", () => {
    expect(keys(kindsConfig(), new Set(["groups/0"])).some((k) => k.endsWith(":placeholder"))).toBe(false);
  });
});

describe("expansion persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips through localStorage", () => {
    saveExpanded(new Set(["groups/0", "groups/0/children/1"]));
    expect(localStorage.getItem(EXPANDED_KEY)).toContain("groups/0");
    expect([...loadExpanded()].sort()).toEqual(["groups/0", "groups/0/children/1"]);
  });

  it("survives unreadable or nonsense storage", () => {
    localStorage.setItem(EXPANDED_KEY, "{not json");
    expect(loadExpanded().size).toBe(0);
    localStorage.setItem(EXPANDED_KEY, '{"groups/0": true}');
    expect(loadExpanded().size).toBe(0);
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    expect(() => saveExpanded(new Set(["groups/0"]))).not.toThrow();
    spy.mockRestore();
  });

  it("keeps a root expanded by default so an empty panel is not a blank page", () => {
    expect(flattenRows({ ...kindsConfig(), groups: [newGroup("only", "property")] }, new Set()).length).toBe(1);
  });
});
```

Then rewrite `frontend/test/al-tree.test.ts` around the new DOM. Keep the existing `beforeEach`/`click` helpers and the "adds a root group", "adds a stimulus" and "does not mutate" cases, adapting their selectors, and add:

```ts
const rows = (): HTMLElement[] => [...(el.shadowRoot?.querySelectorAll<HTMLElement>(".row") ?? [])];
const rowFor = (path: string): HTMLElement =>
  rows().find((r) => r.dataset.path === path) ?? (expect.fail(`no row ${path}`) as never);

const dragEvent = (type: string, data: Record<string, string>, clientY = 0): DragEvent => {
  const store = new Map(Object.entries(data));
  const dataTransfer = {
    effectAllowed: "move",
    dropEffect: "move",
    setData: (k: string, v: string) => void store.set(k, v),
    getData: (k: string) => store.get(k) ?? "",
    setDragImage: () => undefined,
  } as unknown as DataTransfer;
  const ev = new MouseEvent(type, { bubbles: true, composed: true, cancelable: true, clientY }) as DragEvent;
  Object.defineProperty(ev, "dataTransfer", { value: dataTransfer });
  return ev;
};

describe("al-tree rows", () => {
  it("draws one flat row per node, with no expansion panels", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("ha-expansion-panel")).toBeNull();
    expect(rows()).toHaveLength(1); // only the root until something is expanded
    rowFor("groups/0").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    expect(rows().map((r) => r.dataset.path)).toEqual(["groups/0", "groups/0/children/0", "groups/0/children/1"]);
  });

  it("selects from the label and toggles only from the caret", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>(".label")!.click();
    await el.updateComplete;
    expect(selects).toEqual([["groups", 0]]);
    expect(rows()).toHaveLength(1); // selecting did not expand
    rowFor("groups/0").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    expect(selects).toHaveLength(1); // toggling did not select
    expect(rows().length).toBeGreaterThan(1);
  });

  it("offers only the kinds the nesting rules allow here", async () => {
    el.config = kindsConfig();
    el.selection = ["groups", 0, "children", 0];
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    rowFor("groups/0/children/0").querySelector<HTMLElement>('[data-action="add-group"]')!.click();
    await el.updateComplete;
    const items = [...el.shadowRoot!.querySelectorAll<HTMLElement>(".add-menu button")].map((b) => b.dataset.kind);
    expect(items).toEqual(["floor", "area"]); // a structure takes floors and areas
  });

  it("adds a group of the kind that was picked", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>('[data-action="add-group"]')!.click();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.add-menu button[data-kind="outside"]')!.click();
    await el.updateComplete;
    expect(changes[0]!.groups[0]!.children.at(-1)).toMatchObject({ kind: "outside" });
    expect(changeEvents[0]!.structural).toBe(true);
  });

  it("moves a node on a legal drop, computing before/after from the pointer", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    const source = rowFor("groups/0/children/1");
    const target = rowFor("groups/0/children/0");
    source.dispatchEvent(dragEvent("dragstart", {}));
    const path = JSON.stringify(["groups", 0, "children", 1]);
    target.dispatchEvent(dragEvent("dragover", { "text/plain": path }, 1)); // top third: before
    target.dispatchEvent(dragEvent("drop", { "text/plain": path }, 1));
    await el.updateComplete;
    expect(changes.at(-1)!.groups[0]!.children.map((g) => g.id)).toEqual(["back_patio", "house"]);
  });

  it("refuses an illegal drop and says why in the row", async () => {
    el.config = kindsConfig();
    el.selection = null;
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    const target = rowFor("groups/0/children/0");
    const path = JSON.stringify(["groups", 0]); // the property, into the house
    target.dispatchEvent(dragEvent("dragstart", {}));
    target.dispatchEvent(dragEvent("dragover", { "text/plain": path }, 12)); // middle: into
    await el.updateComplete;
    expect(target.classList.contains("illegal")).toBe(true);
    expect(target.querySelector(".hint")?.textContent).toContain("cannot contain");
    target.dispatchEvent(dragEvent("drop", { "text/plain": path }, 12));
    await el.updateComplete;
    expect(changes).toHaveLength(0);
  });

  it("reorders and reparents with Alt+arrows", async () => {
    el.config = kindsConfig();
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    const patio = rowFor("groups/0/children/1");
    patio.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", altKey: true, bubbles: true }));
    await el.updateComplete;
    expect(changes.at(-1)!.groups[0]!.children.map((g) => g.id)).toEqual(["back_patio", "house"]);
    // outdenting the patio would make it a root, and a root has to be a property
    el.config = changes.at(-1)!;
    await el.updateComplete;
    rowFor("groups/0/children/0").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true }),
    );
    await el.updateComplete;
    expect(changes).toHaveLength(1); // refused, and nothing was emitted
  });

  it("shows the placeholder only for an expanded, wholly empty group", async () => {
    const config = kindsConfig();
    config.groups[0]!.children[1]!.stimuli = [];
    el.config = config;
    await el.updateComplete;
    rowFor("groups/0").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".placeholder")).toBeNull(); // not expanded yet
    rowFor("groups/0/children/1").querySelector<HTMLElement>(".caret")!.click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".placeholder")?.textContent).toContain("Nothing in here yet");
  });
});
```

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/tree-rows.test.ts test/al-tree.test.ts
```

Expected: red on the missing module and on every selector the old `ha-expansion-panel` tree does not have.

- [ ] **Step 2: `frontend/src/tree-rows.ts`.**

```ts
import { pathKey } from "./errors";
import type { Config, Group, Path, Stimulus } from "./types";

/**
 * The tree as a list. Rendering rows rather than nested panels is what lets the whole tree
 * share one drag-and-drop surface, one keyboard order and one action column — and it is
 * why this is a pure function with its own tests rather than a template with recursion in it.
 */
export interface Row {
  path: Path;
  depth: number;
  kind: "group" | "stimulus" | "placeholder";
  group?: Group;
  stimulus?: Stimulus;
  /** Whether there is anything under it to open. A leaf gets no caret, not a disabled one. */
  expandable: boolean;
  expanded: boolean;
}

export function flattenRows(config: Config, expanded: ReadonlySet<string>): Row[] {
  const rows: Row[] = [];
  const walk = (group: Group, path: Path, depth: number): void => {
    const key = pathKey(path);
    const expandable = group.children.length > 0 || group.stimuli.length > 0;
    const open = expandable && expanded.has(key);
    rows.push({ path, depth, kind: "group", group, expandable, expanded: open });
    if (!expanded.has(key)) return;
    group.children.forEach((child, i) => walk(child, [...path, "children", i], depth + 1));
    group.stimuli.forEach((stimulus, i) =>
      rows.push({
        path: [...path, "stimuli", i],
        depth: depth + 1,
        kind: "stimulus",
        stimulus,
        expandable: false,
        expanded: false,
      }),
    );
    // The placeholder is for a group that is open and holds nothing at all — not for one
    // whose stimuli list happens to be empty while it has children.
    if (!expandable)
      rows.push({ path, depth: depth + 1, kind: "placeholder", group, expandable: false, expanded: false });
  };
  config.groups.forEach((group, i) => walk(group, ["groups", i], 0));
  return rows;
}

export const EXPANDED_KEY = "activity_levels.groups_expanded";

/** Which rows were open last time. Per browser, like the mixer's own expansion. */
export function loadExpanded(): Set<string> {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    const parsed: unknown = raw === null ? null : JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((p): p is string => typeof p === "string"));
  } catch {
    /* unreadable or unparsable storage: everything starts closed, which is not a failure */
    return new Set();
  }
}

export function saveExpanded(expanded: ReadonlySet<string>): void {
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify([...expanded]));
  } catch {
    /* storage disabled or full: the expansion still applies to this session */
  }
}
```

- [ ] **Step 3: `frontend/src/styles.ts` — the row, the actions column and the drop indicator.** Append to `sharedStyles`:

```ts
  /* The groups tree: flat rows, no borders, indent drawn as guides rather than padding. */
  .tree-row {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 36px;
    padding: 0 4px;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
  }
  .tree-row:hover {
    background: var(--secondary-background-color);
  }
  .tree-row.selected {
    background: color-mix(in srgb, var(--primary-color) 16%, transparent);
    color: var(--primary-color);
  }
  .tree-row.dragging {
    opacity: 0.4;
  }
  .tree-row .guides {
    flex: 0 0 auto;
    width: calc(var(--al-indent, 0) * 16px);
    align-self: stretch;
    background-image: repeating-linear-gradient(
      to right,
      var(--divider-color) 0 1px,
      transparent 1px 16px
    );
  }
  .tree-row .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
    text-align: left;
    padding: 0;
    cursor: pointer;
  }
  .tree-row .actions {
    display: flex;
    flex: 0 0 auto;
    width: 108px;
    justify-content: flex-end;
    visibility: hidden;
  }
  .tree-row:hover .actions,
  .tree-row:focus-within .actions,
  .tree-row.selected .actions {
    visibility: visible;
  }
  .tree-row .caret {
    flex: 0 0 auto;
    width: 32px;
  }
  /* Where the node would land: a line above or below, a ring for "inside this group". */
  .tree-row.drop-before::before,
  .tree-row.drop-after::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary-color);
  }
  .tree-row.drop-before::before {
    top: -1px;
  }
  .tree-row.drop-after::after {
    bottom: -1px;
  }
  .tree-row.drop-into {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .tree-row.illegal {
    cursor: not-allowed;
    outline: 2px dashed var(--error-color, #db4437);
    outline-offset: -2px;
  }
  .tree-row .hint {
    color: var(--error-color, #db4437);
    font-size: 0.85em;
    white-space: nowrap;
  }
  .tree-row.placeholder {
    cursor: default;
    color: var(--secondary-text-color);
    font-size: 0.9em;
    min-height: 28px;
  }
  .add-menu {
    position: absolute;
    z-index: 2;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    min-width: 180px;
  }
  .add-menu button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
    text-align: left;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  .add-menu button:hover,
  .add-menu button:focus-visible {
    background: var(--secondary-background-color);
  }
```

- [ ] **Step 4: `frontend/src/al-tree.ts` — the rewrite.** The component keeps `emitChange`/`emitSelect`/`isSelected`/`removeNode`/`countdown`/`voiceTitle`/`meterTitle` exactly as they are, drops `move`/`selectionAfterSwap`/`renderGroup`/`renderStimulus` entirely, and gains:

```ts
import { KIND_DEFS, allowedChildKinds } from "./kinds";
import { flattenRows, loadExpanded, saveExpanded } from "./tree-rows";
import { legalDrop, moveNode } from "./store";
import type { Kind } from "./kinds";
import type { DropVerdict } from "./store";
import type { Row } from "./tree-rows";

/** Where a dragged node would land relative to the row under the pointer. */
type Where = "before" | "after" | "into";

interface DropTarget {
  key: string;      // the row's path key, so one row at a time wears the indicator
  where: Where;
  verdict: DropVerdict;
}

const STIMULUS_ICON = "mdi:flash";
const DRAG_TYPE = "text/plain";
```

and this state and behaviour:

```ts
  @state() private expanded: Set<string> = loadExpanded();
  @state() private dragging: string | null = null;
  @state() private target: DropTarget | null = null;
  /** The row whose add-group menu is open, if any. One at a time. */
  @state() private menu: string | null = null;

  private toggle(path: Path): void {
    const key = pathKey(path);
    const next = new Set(this.expanded);
    if (!next.delete(key)) next.add(key);
    this.expanded = next;
    saveExpanded(next);
  }

  /** The list a node lives in, and the slot after it: the two arguments a move needs. */
  private listOf(path: Path): { list: Path; index: number } {
    return { list: path.slice(0, -1), index: path[path.length - 1] as number };
  }

  /**
   * Applies a move if the rules allow it. Every way of moving a node — a drop, an
   * Alt+arrow — funnels through here, so a rule can only be enforced in one place.
   */
  private tryMove(from: Path, toParent: Path, index: number): boolean {
    const config = this.config;
    if (!config) return false;
    if (!legalDrop(config, from, toParent, index).ok) return false;
    const next = moveNode(config, from, toParent, index);
    if (next === config) return false;
    this.emitChange(next);
    // The node has moved, so the selection's old path names something else now.
    const same = pathKey(toParent) === pathKey(this.listOf(from).list);
    const landed = same && index > this.listOf(from).index ? index - 1 : index;
    this.emitSelect([...toParent, landed]);
    return true;
  }

  private onDragStart(ev: DragEvent, path: Path): void {
    ev.dataTransfer?.setData(DRAG_TYPE, JSON.stringify(path));
    if (ev.dataTransfer) ev.dataTransfer.effectAllowed = "move";
    this.dragging = pathKey(path);
  }

  private onDragEnd(): void {
    this.dragging = null;
    this.target = null;
  }

  /**
   * Turns a pointer position into "before this row", "after it" or "inside it". The middle
   * third is *into*, and only for a group: a stimulus has nothing to be inside of.
   */
  private whereIn(ev: DragEvent, row: Row): Where {
    const box = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const third = box.height / 3;
    const y = ev.clientY - box.top;
    if (y < third) return "before";
    if (y > box.height - third) return "after";
    return row.kind === "group" ? "into" : "after";
  }

  /** The destination list and slot a (row, where) pair names. */
  private destination(row: Row, where: Where): { toParent: Path; index: number } {
    if (where === "into")
      return { toParent: [...row.path, "children"], index: row.group?.children.length ?? 0 };
    const { list, index } = this.listOf(row.path);
    return { toParent: list, index: where === "before" ? index : index + 1 };
  }

  private readPath(ev: DragEvent): Path | null {
    try {
      const raw = ev.dataTransfer?.getData(DRAG_TYPE) ?? "";
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Path) : null;
    } catch {
      /* something else was dragged onto the panel; it is not ours to move */
      return null;
    }
  }

  private onDragOver(ev: DragEvent, row: Row): void {
    const config = this.config;
    const from = this.readPath(ev);
    if (!config || from === null) return;
    ev.preventDefault();
    const where = this.whereIn(ev, row);
    const { toParent, index } = this.destination(row, where);
    const verdict = legalDrop(config, from, toParent, index);
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = verdict.ok ? "move" : "none";
    this.target = { key: pathKey(row.path), where, verdict };
  }

  private onDrop(ev: DragEvent, row: Row): void {
    const from = this.readPath(ev);
    if (from === null) return;
    ev.preventDefault();
    const where = this.whereIn(ev, row);
    const { toParent, index } = this.destination(row, where);
    this.tryMove(from, toParent, index);
    this.onDragEnd();
  }

  /**
   * Alt+arrows do exactly what a drag does, with the arithmetic written out: up and down
   * reorder inside the list, right makes the node the last child of the sibling above it,
   * left makes it the next sibling of its parent. Anything the rules refuse simply does
   * not happen — the same verdict the drop would have given, without the cursor to show it.
   */
  private onRowKeydown(ev: KeyboardEvent, row: Row): void {
    if (!ev.altKey) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        this.emitSelect(row.path);
      }
      return;
    }
    const config = this.config;
    if (!config) return;
    const { list, index } = this.listOf(row.path);
    let moved = false;
    switch (ev.key) {
      case "ArrowUp":
        moved = this.tryMove(row.path, list, index - 1);
        break;
      case "ArrowDown":
        moved = this.tryMove(row.path, list, index + 2);
        break;
      case "ArrowRight": {
        const above = getAt<Group>(config, [...list, index - 1]);
        if (above !== undefined)
          moved = this.tryMove(row.path, [...list, index - 1, "children"], above.children.length);
        break;
      }
      case "ArrowLeft": {
        const parentList = list.slice(0, -2);
        const parentIndex = list[list.length - 2];
        if (typeof parentIndex === "number")
          moved = this.tryMove(row.path, parentList, parentIndex + 1);
        break;
      }
      default:
        return;
    }
    ev.preventDefault();
    if (moved) ev.stopPropagation();
  }
```

with `getAt` added to the `./store` import and `Group` kept in the type import. Then the render:

```ts
  override render() {
    const config = this.config;
    if (!config) return html`<ha-card><span class="muted">Loading…</span></ha-card>`;
    if (config.groups.length === 0) return this.renderEmpty();
    return html`
      <ha-card>
        ${flattenRows(config, this.expanded).map((row) => this.renderRow(row))}
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], config.groups.length, "property")}>
            Add property
          </ha-button>
        </div>
      </ha-card>
    `;
  }

  private renderRow(row: Row) {
    if (row.kind === "placeholder")
      return html`<div class="tree-row placeholder" style="--al-indent: ${row.depth}">
        <span class="guides"></span>
        Nothing in here yet — add a stimulus or a group with the buttons on the row above.
      </div>`;
    const key = pathKey(row.path);
    const target = this.target?.key === key ? this.target : null;
    const classes = [
      "tree-row",
      this.isSelected(row.path) ? "selected" : "",
      this.dragging === key ? "dragging" : "",
      target === null ? "" : target.verdict.ok ? `drop-${target.where}` : "illegal",
    ]
      .filter(Boolean)
      .join(" ");
    return html`<div
      class=${classes}
      style="--al-indent: ${row.depth}"
      data-path=${key}
      role="treeitem"
      tabindex="0"
      draggable="true"
      aria-selected=${this.isSelected(row.path) ? "true" : "false"}
      @click=${(ev: Event) => this.select(ev, row.path)}
      @keydown=${(ev: KeyboardEvent) => this.onRowKeydown(ev, row)}
      @dragstart=${(ev: DragEvent) => this.onDragStart(ev, row.path)}
      @dragend=${this.onDragEnd}
      @dragover=${(ev: DragEvent) => this.onDragOver(ev, row)}
      @drop=${(ev: DragEvent) => this.onDrop(ev, row)}
    >
      <span class="guides"></span>
      ${row.expandable
        ? html`<ha-icon-button
            class="caret"
            label=${row.expanded ? "Collapse" : "Expand"}
            @click=${(ev: Event) => {
              ev.stopPropagation();
              this.toggle(row.path);
            }}
          >
            <ha-icon icon=${row.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </ha-icon-button>`
        : html`<span class="caret"></span>`}
      <ha-icon icon=${row.kind === "group" ? KIND_DEFS[row.group!.kind].icon : STIMULUS_ICON}></ha-icon>
      <button type="button" class="label" @click=${(ev: Event) => this.select(ev, row.path)}>
        ${this.labelFor(row)}
      </button>
      ${target !== null && !target.verdict.ok
        ? html`<span class="hint">${target.verdict.reason}</span>`
        : this.renderRowStatus(row)}
      ${this.renderActions(row)}
      ${this.menu === key ? this.renderAddMenu(row) : nothing}
    </div>`;
  }
```

`labelFor` returns `row.group!.name || row.group!.id || "(unnamed group)"` for a group and the entity's friendly name for a stimulus; `renderRowStatus` is the error badge, the meter and the gate dot for a group and the state/phase chips for a stimulus — lift both bodies straight out of the two `render*` methods being deleted. `renderActions` is:

```ts
  private renderActions(row: Row) {
    const path = row.path;
    if (row.kind === "stimulus")
      return html`<div class="actions" @click=${stop}>
        <ha-icon-button
          label="Delete stimulus"
          data-action="delete"
          @click=${() => this.removeNode(path, `stimulus "${this.labelFor(row)}"`)}
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </ha-icon-button>
      </div>`;
    const group = row.group!;
    return html`<div class="actions" @click=${stop}>
      <ha-icon-button
        label="Add stimulus"
        data-action="add-stimulus"
        @click=${() => this.addStimulus(path, group.stimuli.length)}
      >
        <ha-icon icon="mdi:flash-outline"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        label="Add group"
        data-action="add-group"
        .disabled=${allowedChildKinds(group.kind).length === 0}
        @click=${() => {
          this.menu = this.menu === pathKey(path) ? null : pathKey(path);
        }}
      >
        <ha-icon icon="mdi:folder-plus"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        label="Delete group"
        data-action="delete"
        @click=${() => this.removeNode(path, `group "${group.name || group.id}" and everything in it`)}
      >
        <ha-icon icon="mdi:delete"></ha-icon>
      </ha-icon-button>
    </div>`;
  }

  /** The kinds this parent may contain, each with its own definition under the label. */
  private renderAddMenu(row: Row) {
    return html`<div class="add-menu" @click=${stop}>
      ${allowedChildKinds(row.group!.kind).map(
        (kind) => html`<button
          type="button"
          data-kind=${kind}
          @click=${() => this.addGroup([...row.path, "children"], row.group!.children.length, kind)}
        >
          <ha-icon icon=${KIND_DEFS[kind].icon}></ha-icon>
          <span>
            <strong>${KIND_DEFS[kind].label}</strong>
            <div class="muted">${KIND_DEFS[kind].definition}</div>
          </span>
        </button>`,
      )}
    </div>`;
  }
```

and `addGroup` takes the kind, opens the parent so the new row is visible, and closes the menu:

```ts
  private addGroup(listPath: Path, index: number, kind: Kind): void {
    const config = this.config;
    if (!config) return;
    this.menu = null;
    const parent = listPath.slice(0, -1);
    if (parent.length > 0) {
      const next = new Set(this.expanded).add(pathKey(parent));
      this.expanded = next;
      saveExpanded(next);
    }
    this.emitChange(insertAt(config, listPath, index, newGroup(uniqueGroupId(config, kind), kind)));
    this.emitSelect([...listPath, index]);
  }
```

`addStimulus` gets the same two lines that open the owning group. `renderEmpty`'s button becomes `Add your first property` and calls `this.addGroup(["groups"], 0, "property")`, and its blurb becomes: *"Nothing is configured yet. Everything starts with a property — the whole lot, inside and out — and inside it go the structures, floors, rooms and outdoor areas that make up your home."*

- [ ] **Step 5: GREEN, rebuild, commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm test
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm build
cd /Users/sholodak/elevenrose/activity-levels && git add frontend/src/tree-rows.ts frontend/src/al-tree.ts frontend/src/styles.ts frontend/test/tree-rows.test.ts frontend/test/al-tree.test.ts custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "feat(panel): flat groups tree with drag-and-drop and Alt+arrow moves"
```

Expected: every frontend test green — including `activity-levels-panel.test.ts`, which drives the Groups tab through `al-tree` and therefore exercises the new DOM end to end.

---

### Task 5: The group editor — Identity, Mix, the Adjacent groups table, Presence, and the banner

**Files:** create `frontend/src/panel-state.ts`, `frontend/src/al-adjacency-table.ts`, `frontend/test/panel-state.test.ts`, `frontend/test/al-adjacency-table.test.ts`; modify `frontend/src/al-group-editor.ts`, `frontend/src/group-form.ts`, `frontend/src/types.ts`, `frontend/src/al-strip-controls.ts`, `frontend/src/activity-levels-panel.ts`, `frontend/src/styles.ts`, `frontend/test/al-group-editor.test.ts`, `frontend/test/group-form.test.ts`, `frontend/test/activity-levels-panel.test.ts`.

**Interfaces:**
```ts
// panel-state.ts -- shared by this task and Task 6
export const PANELS_KEY = "activity_levels.panels";
export function loadPanelOpen(id: string, fallback: boolean): boolean;
export function savePanelOpen(id: string, open: boolean): void;

// group-form.ts
export type GroupField = "id" | "name" | "kind" | "floor_id" | "area_id" | "mix" | "null_handling" | "gain";
export function isDefaultId(group: Group): boolean;
export function bindArea(group: Group, areaId: string | null, areaName: string | null): Group;
export function bindFloor(group: Group, floorId: string | null, floorName: string | null): Group;
export const IDENTITY_FIELDS: GroupField[];   // id, name, kind, floor_id, area_id -- filtered by kind
export const MIX_FIELDS: GroupField[];        // mix, null_handling, gain

// al-adjacency-table.ts
@customElement("al-adjacency-table")
class AlAdjacencyTable {
  hass?: HomeAssistant; config?: Config; path: Path | null; errors: ValidationError[];
}   // emits al-change

// types.ts
interface HomeAssistant { floors?: Record<string, { floor_id: string; name: string }>; ... }
```

The panels, in order, each an `ha-expansion-panel` with a header, a one-line definition as its subtitle, and its open/closed state remembered per browser under `group:<panel>`:

| Panel | Open by default | Shown | Definition |
| --- | --- | --- | --- |
| Identity | yes | always | the selected kind's own definition from `KIND_DEFS` |
| Mix | yes | always | "How this group's stimuli and children combine into one level." |
| Adjacent groups | yes | `area`/`outside` only | "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room." |
| Presence | no | `presence.enabled` only | "How loudly 'somebody is here' plays in this group's mix." |

- [ ] **Step 1: Tests first (RED).** `frontend/test/panel-state.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PANELS_KEY, loadPanelOpen, savePanelOpen } from "../src/panel-state";

describe("panel collapse persistence", () => {
  beforeEach(() => localStorage.clear());

  it("falls back until something has been stored for that panel", () => {
    expect(loadPanelOpen("group:identity", true)).toBe(true);
    expect(loadPanelOpen("stimulus:overrides", false)).toBe(false);
  });

  it("remembers each panel separately, including a closed one", () => {
    savePanelOpen("group:identity", false);
    savePanelOpen("stimulus:overrides", true);
    expect(loadPanelOpen("group:identity", true)).toBe(false);
    expect(loadPanelOpen("stimulus:overrides", false)).toBe(true);
    expect(loadPanelOpen("group:mix", true)).toBe(true);
    expect(JSON.parse(localStorage.getItem(PANELS_KEY)!)).toEqual({
      "group:identity": false,
      "stimulus:overrides": true,
    });
  });

  it("shrugs off unreadable, non-object or unwritable storage", () => {
    localStorage.setItem(PANELS_KEY, "[]");
    expect(loadPanelOpen("group:mix", true)).toBe(true);
    localStorage.setItem(PANELS_KEY, "{oops");
    expect(loadPanelOpen("group:mix", false)).toBe(false);
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    expect(() => savePanelOpen("group:mix", false)).not.toThrow();
    spy.mockRestore();
  });
});
```

`frontend/test/al-adjacency-table.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-adjacency-table";
import { kindsConfig } from "./fixtures";
import type { AlAdjacencyTable } from "../src/al-adjacency-table";
import type { Config, Path } from "../src/types";

const KITCHEN: Path = ["groups", 0, "children", 0, "children", 0, "children", 0];
const HALL: Path = ["groups", 0, "children", 0, "children", 0, "children", 1];

let el: AlAdjacencyTable;
let changes: Config[];

const mount = async (path: Path, config = kindsConfig()): Promise<void> => {
  document.body.innerHTML = "";
  changes = [];
  el = document.createElement("al-adjacency-table");
  el.config = config;
  el.path = path;
  el.errors = [];
  el.addEventListener("al-change", (e) => changes.push((e as CustomEvent<Config>).detail));
  document.body.appendChild(el);
  await el.updateComplete;
};

const rows = (cls: string): HTMLElement[] => [...el.shadowRoot!.querySelectorAll<HTMLElement>(cls)];

describe("al-adjacency-table", () => {
  beforeEach(async () => await mount(KITCHEN));

  it("lists the edges this group owns, with their connection and direction", () => {
    const own = rows("tr.own");
    expect(own.map((r) => r.dataset.id)).toEqual(["hall", "back_patio"]);
    expect(own[0]!.querySelector<HTMLSelectElement>(".connection")!.value).toBe("open");
    expect(own[0]!.querySelector<HTMLInputElement>(".both-ways")!.checked).toBe(true);
  });

  it("shows an edge declared on another group as a read-only row", async () => {
    await mount(HALL);
    expect(rows("tr.own")).toHaveLength(0);
    const declared = rows("tr.declared");
    expect(declared).toHaveLength(1);
    expect(declared[0]!.textContent).toContain("declared on Kitchen");
    expect(declared[0]!.querySelector("select")).toBeNull();
    expect(declared[0]!.querySelector("input")).toBeNull();
  });

  it("carries the definition the spec words, once, under the header", () => {
    expect(el.shadowRoot!.querySelector(".definition")!.textContent).toContain(
      "without passing through another group",
    );
    expect(el.shadowRoot!.querySelector(".definition")!.textContent).toContain(
      "an unobserved hallway is still a room",
    );
  });

  it("offers only areas and outside areas that are not already listed", async () => {
    await mount(HALL);
    const options = [...el.shadowRoot!.querySelectorAll<HTMLOptionElement>(".add-edge option")].map(
      (o) => o.value,
    );
    expect(options).toEqual(["", "back_patio"]); // not itself, not the kitchen it is already joined to
  });

  it("adds an edge as a two-way door", async () => {
    await mount(HALL);
    const picker = el.shadowRoot!.querySelector<HTMLSelectElement>(".add-edge")!;
    picker.value = "back_patio";
    picker.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    expect(changes[0]!.groups[0]!.children[0]!.children[0]!.children[1]!.adjacent).toEqual([
      { id: "back_patio", connection: "door", one_way: false },
    ]);
  });

  it("changes a connection type without touching the direction", async () => {
    const select = rows("tr.own")[0]!.querySelector<HTMLSelectElement>(".connection")!;
    select.value = "stairs";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    expect(changes[0]!.groups[0]!.children[0]!.children[0]!.children[0]!.adjacent[0]).toEqual({
      id: "hall",
      connection: "stairs",
      one_way: false,
    });
  });

  it("unchecking both ways makes the edge one-way", async () => {
    const box = rows("tr.own")[0]!.querySelector<HTMLInputElement>(".both-ways")!;
    box.checked = false;
    box.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    expect(changes[0]!.groups[0]!.children[0]!.children[0]!.children[0]!.adjacent[0]!).toMatchObject({
      one_way: true,
    });
  });

  it("removes an edge", async () => {
    rows("tr.own")[1]!.querySelector<HTMLElement>('[data-action="remove"]')!.click();
    await el.updateComplete;
    expect(
      changes[0]!.groups[0]!.children[0]!.children[0]!.children[0]!.adjacent.map((a) =>
        typeof a === "string" ? a : a.id,
      ),
    ).toEqual(["hall"]);
  });

  it("shows the backend's error against the row it belongs to", async () => {
    el.errors = [{ path: [...KITCHEN, "adjacent", 1].join("/"), message: "unknown group 'back_patio'" }];
    await el.updateComplete;
    expect(rows("tr.own")[1]!.querySelector(".error")!.textContent).toContain("unknown group");
  });
});
```

Add to `frontend/test/group-form.test.ts`:

```ts
describe("binding to Home Assistant", () => {
  it("treats the id the tree generated as still-default, and a typed one as the user's", () => {
    expect(isDefaultId({ ...newGroup("area", "area") })).toBe(true);
    expect(isDefaultId({ ...newGroup("area_3", "area") })).toBe(true);
    expect(isDefaultId({ ...newGroup("", "area") })).toBe(true);
    expect(isDefaultId({ ...newGroup("kitchen", "area") })).toBe(false);
  });

  it("prefills id and name from the area, but only while both are still defaults", () => {
    const fresh = bindArea(newGroup("area", "area"), "kitchen_area", "Kitchen");
    expect(fresh).toMatchObject({ area_id: "kitchen_area", id: "kitchen", name: "Kitchen" });
    const named = bindArea({ ...newGroup("larder", "area"), name: "Larder" }, "kitchen_area", "Kitchen");
    expect(named).toMatchObject({ area_id: "kitchen_area", id: "larder", name: "Larder" });
    const halfway = bindArea({ ...newGroup("area", "area"), name: "Larder" }, "kitchen_area", "Kitchen");
    expect(halfway).toMatchObject({ id: "kitchen", name: "Larder" });
  });

  it("clearing the binding leaves the id and the name alone", () => {
    const bound = bindArea(newGroup("area", "area"), "kitchen_area", "Kitchen");
    expect(bindArea(bound, null, null)).toMatchObject({ area_id: null, id: "kitchen", name: "Kitchen" });
  });

  it("binds a floor the same way", () => {
    expect(bindFloor(newGroup("floor", "floor"), "upstairs", "Upstairs")).toMatchObject({
      floor_id: "upstairs",
      id: "upstairs",
      name: "Upstairs",
    });
  });

  it("offers the registry picker that fits the kind, and only that one", () => {
    const names = (kind: Kind): string[] =>
      groupSchema({ ...newGroup("x", kind) }, false, IDENTITY_FIELDS).map((i) => i.name);
    expect(names("floor")).toEqual(["kind", "floor_id", "id", "name"]);
    expect(names("area")).toEqual(["kind", "area_id", "id", "name"]);
    expect(names("outside")).toEqual(["kind", "area_id", "id", "name"]);
    expect(names("property")).toEqual(["kind", "id", "name"]);
    expect(names("structure")).toEqual(["kind", "id", "name"]);
  });

  it("offers only the kinds this group's parent may contain", () => {
    const config = kindsConfig();
    const item = groupSchema(config.groups[0]!.children[0]!, false, ["kind"], config, "property")[0]!;
    const options = (item.selector.select as { options: { value: string }[] }).options;
    expect(options.map((o) => o.value)).toEqual(["floor", "area", "structure"]);
  });
});
```

(the kind picker lists what the parent allows *plus the group's current kind*, so a document that is already wrong can still be looked at without the picker silently rewriting it — the last entry above is `house`'s own `structure`.)

Rewrite `frontend/test/al-group-editor.test.ts`'s structure assertions around panels:

```ts
const panel = (name: string): HTMLElement =>
  el.shadowRoot!.querySelector<HTMLElement>(`ha-expansion-panel[data-panel="${name}"]`)!;

describe("al-group-editor panels", () => {
  it("shows Identity and Mix open, and the kind's own definition as the Identity subtitle", async () => {
    expect(panel("identity").hasAttribute("expanded")).toBe(true);
    expect(panel("mix").hasAttribute("expanded")).toBe(true);
    expect(panel("identity").textContent).toContain("A room or zone people occupy");
    expect(panel("mix").textContent).toContain("combine into one level");
  });

  it("shows the adjacency table only for an area or an outside area", async () => {
    expect(el.shadowRoot!.querySelector("al-adjacency-table")).toBeTruthy();
    el.path = ["groups", 0, "children", 0]; // the house: a structure
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("al-adjacency-table")).toBeNull();
  });

  it("renders Leads off the property as a switch with its own helper, off the table", async () => {
    const exit = el.shadowRoot!.querySelector<HTMLElement>(".exit")!;
    expect(exit.textContent).toContain("Leads off the property");
    expect(exit.textContent).toContain("presence can move from here to Away");
  });

  it("shows Presence collapsed, and only when presence is enabled", async () => {
    expect(el.shadowRoot!.querySelector('[data-panel="presence"]')).toBeNull();
    el.config = presenceConfig();
    el.path = ["groups", 0, "children", 0, "children", 0];
    await el.updateComplete;
    expect(panel("presence").hasAttribute("expanded")).toBe(false);
  });

  it("remembers a panel the user closed", async () => {
    panel("mix").dispatchEvent(new CustomEvent("expanded-changed", { detail: { expanded: false } }));
    await el.updateComplete;
    expect(loadPanelOpen("group:mix", true)).toBe(false);
  });
});
```

and add to `frontend/test/activity-levels-panel.test.ts`:

```ts
it("says so, once, when the loader had to guess the kinds", async () => {
  hass.callWS = vi.fn(async (msg: { type: string }) =>
    msg.type === "activity_levels/config/get"
      ? { config: houseConfig(), inferred: ["groups/0", "groups/0/children/0"] }
      : {},
  ) as HomeAssistant["callWS"];
  const el = await mountPanel(hass);
  const banner = el.shadowRoot!.querySelector('ha-alert[alert-type="warning"]')!;
  expect(banner.textContent).toContain("inferred");
  expect(banner.textContent).toContain("2 groups");
  expect(el.shadowRoot!.querySelector(".inferred-fix")).toBeTruthy();
});
```

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/panel-state.test.ts test/al-adjacency-table.test.ts test/group-form.test.ts test/al-group-editor.test.ts test/activity-levels-panel.test.ts
```

Expected: red on the two missing modules and every new selector.

- [ ] **Step 2: `frontend/src/panel-state.ts`.**

```ts
/**
 * Which editor panels the reader left open. One object under one key, because the panels
 * are a set the user tunes once — spreading them over a key each would fill the browser's
 * storage with a row per field group and make them impossible to clear together.
 */
export const PANELS_KEY = "activity_levels.panels";

function read(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PANELS_KEY);
    const parsed: unknown = raw === null ? null : JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, boolean>;
  } catch {
    /* unreadable or unparsable storage: every panel opens at its own default */
    return {};
  }
}

/** Whether this panel is open. `fallback` is what the design says before anyone has touched it. */
export function loadPanelOpen(id: string, fallback: boolean): boolean {
  const stored = read()[id];
  return typeof stored === "boolean" ? stored : fallback;
}

export function savePanelOpen(id: string, open: boolean): void {
  try {
    localStorage.setItem(PANELS_KEY, JSON.stringify({ ...read(), [id]: open }));
  } catch {
    /* storage disabled or full: the panel still stays where it was put this session */
  }
}
```

- [ ] **Step 3: `frontend/src/group-form.ts` — kind, the registry pickers and the prefill rules.** Replace `GroupField`, the labels, the helpers and the selector table, and add the binding helpers:

```ts
export type GroupField = "id" | "name" | "kind" | "floor_id" | "area_id" | "mix" | "null_handling" | "gain";

/** Identity, in the order the panel reads: what it is, what it binds, then what it is called. */
export const IDENTITY_FIELDS: GroupField[] = ["kind", "floor_id", "area_id", "id", "name"];
export const MIX_FIELDS: GroupField[] = ["mix", "null_handling", "gain"];

export const GROUP_LABELS: Record<string, string> = {
  id: "ID",
  name: "Name",
  kind: "Kind",
  floor_id: "Home Assistant floor",
  area_id: "Home Assistant area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain",
};

export const GROUP_HELPERS: Record<string, string> = {
  id: "Identifies the group and its entities. Changing it re-creates them.",
  name: "Friendly name; falls back to the area's name, then to the id.",
  kind: "What this is on the property. It decides what can go inside it.",
  floor_id: "Bind this to a Home Assistant floor to reuse its name.",
  area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent.",
};

/** Only a floor binds a floor, and only a place people are in binds an area. */
const applies = (name: GroupField, group: Group, isRoot: boolean): boolean => {
  switch (name) {
    case "null_handling":
      return group.mix === "mean";
    case "gain":
      return !isRoot;
    case "floor_id":
      return group.kind === "floor";
    case "area_id":
      return NODE_KINDS.has(group.kind);
    default:
      return true;
  }
};

/**
 * The kinds this picker offers: what the parent may contain, plus whatever this group
 * already is. A document that is already wrong has to stay readable — a picker that
 * cannot show the current value reads as though the value were something else.
 */
const kindSelector = (group: Group, parentKind: Kind | null): Selector => {
  const options = [...allowedChildKinds(parentKind)];
  if (!options.includes(group.kind)) options.push(group.kind);
  return {
    select: {
      mode: "dropdown",
      options: options.map((kind) => ({ value: kind, label: KIND_DEFS[kind].label })),
    },
  };
};

export function groupSchema(
  group: Group,
  isRoot: boolean,
  fields: readonly GroupField[],
  config?: Config,
  parentKind: Kind | null = null,
): FormItem[] {
  const selectors: Record<GroupField, Selector> = {
    id: { text: {} },
    name: { text: {} },
    kind: kindSelector(group, parentKind),
    floor_id: { floor: {} },
    area_id: { area: {} },
    mix: { select: { mode: "dropdown", options: MIX_OPTIONS } },
    null_handling: { select: { mode: "dropdown", options: NULL_HANDLING_OPTIONS } },
    gain: GROUP_GAIN_SELECTOR,
  };
  return fields
    .filter((name) => applies(name, group, isRoot))
    .map((name) => ({ name, selector: selectors[name] }));
}
```

`groupData` loses `adjacent`/`exit` and gains the three new fields (an unset `floor_id`/`area_id` is left out of the payload for the same reason `area` was: `ha-selector`'s pickers read `""` as a chosen registry entry that no longer exists):

```ts
  const all: Record<GroupField, unknown> = {
    id: group.id,
    name: group.name ?? "",
    kind: group.kind,
    floor_id: group.floor_id,
    area_id: group.area_id,
    mix: group.mix,
    null_handling: group.null_handling,
    gain: group.gain,
  };
  return Object.fromEntries(
    fields
      .filter(
        (name) =>
          applies(name, group, isRoot) &&
          !(name === "area_id" && group.area_id === null) &&
          !(name === "floor_id" && group.floor_id === null),
      )
      .map((name) => [name, all[name]]),
  );
```

`mergeGroup` drops its `adjacent`/`exit` branches (the table owns those now) and gains:

```ts
  if ("kind" in v && typeof v.kind === "string") merged.kind = v.kind as Kind;
  if ("floor_id" in v) merged.floor_id = emptyToNull(v.floor_id as string | null | undefined);
  if ("area_id" in v) merged.area_id = emptyToNull(v.area_id as string | null | undefined);
```

`GROUP_FORM_FIELDS` becomes `["id", "name", "kind", "floor_id", "area_id", "mix", "null_handling", "gain"]` and `changedGroupField` loses its adjacency special case, becoming `GROUP_FORM_FIELDS.find((k) => merged[k] !== group[k])`. `adjacentSelector` and `EXIT_SELECTOR` are deleted; `al-strip-controls.ts`'s `BUS_FIELDS` becomes `["name", "mix", "null_handling", "gain"]`, because adjacency is not something to edit from a mixer strip. Finally the prefill:

```ts
/**
 * Whether the id is still the one the tree made up. "Add group" has to produce something
 * that validates, so a new group gets its kind as its id (`area`, `area_2`); that is the
 * marker for "nobody has named this yet", and picking an area is then allowed to replace
 * it. The moment the user types anything else, the id is theirs and nothing rewrites it.
 */
export const isDefaultId = (group: Group): boolean =>
  group.id === "" || new RegExp(`^${group.kind}(_\\d+)?$`).test(group.id);

function bind(group: Group, field: "area_id" | "floor_id", id: string | null, name: string | null): Group {
  const bound: Group = { ...group, [field]: id };
  // Clearing a binding is not an edit to the identity: the names it prefilled are the
  // user's now, and taking them away would delete work nobody asked to delete.
  if (id === null || name === null) return bound;
  if (isDefaultId(group)) bound.id = slugify(name);
  if (group.name === null) bound.name = name;
  return bound;
}

/** Bind a Home Assistant area, prefilling the id and the name while both are untouched. */
export const bindArea = (group: Group, areaId: string | null, areaName: string | null): Group =>
  bind(group, "area_id", areaId, areaName);

export const bindFloor = (group: Group, floorId: string | null, floorName: string | null): Group =>
  bind(group, "floor_id", floorId, floorName);
```

with `import { KIND_DEFS, NODE_KINDS, allowedChildKinds } from "./kinds";`, `import { adjacencyId, isOneWay, slugify } from "./model";` and `import type { Kind } from "./kinds";` at the top. Add `floors?: Record<string, { floor_id: string; name: string }>;` to `HomeAssistant` in `types.ts`, beside `areas`.

- [ ] **Step 4: `frontend/src/al-adjacency-table.ts`.** Plain `<select>`/`<input type=checkbox>` rather than `ha-selector`: this is a dense table of three controls per row, and a stack of full-width selectors would be four times the height for the same information. The definitions and the labels are the spec's words.

```ts
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CONNECTIONS, CONNECTION_LABELS, DEFAULT_CONNECTION, NODE_KINDS } from "./kinds";
import { alChange } from "./events";
import { adjacencyConnection, adjacencyId, declaredOn, groupAt, isOneWay, walkGroups } from "./model";
import { setAt } from "./store";
import { sharedStyles } from "./styles";
import type { Connection } from "./kinds";
import type { TemplateResult } from "lit";
import type { Adjacency, Config, Group, HomeAssistant, Path, ValidationError } from "./types";

export const ADJACENCY_DEFINITION =
  "Adjacent groups are ones you can walk between without passing through another group in " +
  "this configuration. Sensors don't matter here — an unobserved hallway is still a room.";

/**
 * The Adjacent groups table. An edge is written once, on whichever side read more
 * naturally, so this shows two kinds of row: the ones this group declares, which it can
 * edit, and the ones another group declares against it, which it can only read. Editing
 * the second kind from here would move the edge to the other end of itself.
 */
@customElement("al-adjacency-table")
export class AlAdjacencyTable extends LitElement {
  static styles = [
    sharedStyles,
    css`
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        font-weight: 600;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      th,
      td {
        padding: 4px 8px 4px 0;
        vertical-align: middle;
      }
      tr.declared td {
        color: var(--secondary-text-color);
      }
      select,
      .add-edge {
        font: inherit;
        color: inherit;
        background: var(--card-background-color, transparent);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 4px;
        max-width: 100%;
      }
      .definition {
        margin: 0 0 12px;
      }
      .error {
        font-size: 0.85em;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) path: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];

  private get group(): Group | undefined {
    return this.config && this.path ? groupAt(this.config, this.path) : undefined;
  }

  /** Normalized, so the table never has to care which spelling the document used. */
  private get edges(): Adjacency[] {
    return (this.group?.adjacent ?? []).map((entry) => ({
      id: adjacencyId(entry),
      connection: adjacencyConnection(entry),
      one_way: isOneWay(entry),
    }));
  }

  private emit(edges: Adjacency[]): void {
    const { config, path } = this;
    if (!config || !path) return;
    // Structural: the errors are keyed by `…/adjacent/j`, and removing a row renumbers them.
    this.dispatchEvent(alChange(setAt(config, [...path, "adjacent"], edges), undefined, true));
  }

  private update(index: number, patch: Partial<Adjacency>): void {
    this.emit(this.edges.map((edge, i) => (i === index ? { ...edge, ...patch } : edge)));
  }

  private nameOf(id: string): string {
    const found = walkGroups(this.config!).find(({ group }) => group.id === id);
    return found?.group.name ?? id;
  }

  /** Areas and outside areas, minus this one and minus every group already on the table. */
  private candidates(): Group[] {
    const group = this.group;
    if (!this.config || !group) return [];
    const listed = new Set([
      group.id,
      ...this.edges.map((e) => e.id),
      ...declaredOn(this.config, group.id).map((d) => d.group.id),
    ]);
    return walkGroups(this.config)
      .map(({ group: g }) => g)
      .filter((g) => NODE_KINDS.has(g.kind) && !listed.has(g.id));
  }

  private errorFor(index: number): string | undefined {
    const prefix = `${(this.path ?? []).join("/")}/adjacent/${index}`;
    return this.errors.find((e) => e.path === prefix || e.path.startsWith(`${prefix}/`))?.message;
  }

  override render() {
    const group = this.group;
    if (!this.config || !group) return nothing;
    const declared = declaredOn(this.config, group.id);
    const candidates = this.candidates();
    return html`
      <p class="muted definition">${ADJACENCY_DEFINITION}</p>
      <table>
        <thead>
          <tr>
            <th>Group</th>
            <th>Connection</th>
            <th>Both ways</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${this.edges.map((edge, i) => this.renderOwn(edge, i))}
          ${declared.map(({ group: other, edge }) => this.renderDeclared(other, edge))}
          ${this.edges.length === 0 && declared.length === 0
            ? html`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>`
            : nothing}
        </tbody>
      </table>
      ${candidates.length === 0
        ? nothing
        : html`<select
            class="add-edge"
            .value=${""}
            @change=${(ev: Event) => {
              const target = ev.target as HTMLSelectElement;
              if (target.value === "") return;
              this.emit([
                ...this.edges,
                { id: target.value, connection: DEFAULT_CONNECTION, one_way: false },
              ]);
              target.value = "";
            }}
          >
            <option value="">Add an adjacent group…</option>
            ${candidates.map((g) => html`<option value=${g.id}>${g.name ?? g.id}</option>`)}
          </select>`}
    `;
  }

  private renderOwn(edge: Adjacency, index: number): TemplateResult {
    const error = this.errorFor(index);
    return html`<tr class="own" data-id=${edge.id}>
      <td>
        ${this.nameOf(edge.id)}
        ${error ? html`<div class="muted error">${error}</div>` : nothing}
      </td>
      <td>
        <select
          class="connection"
          .value=${edge.connection}
          @change=${(ev: Event) =>
            this.update(index, { connection: (ev.target as HTMLSelectElement).value as Connection })}
        >
          ${CONNECTIONS.map(
            (c) => html`<option value=${c} ?selected=${c === edge.connection}>${CONNECTION_LABELS[c]}</option>`,
          )}
        </select>
      </td>
      <td>
        <input
          class="both-ways"
          type="checkbox"
          .checked=${!edge.one_way}
          title="Unchecked means you can only go this way"
          @change=${(ev: Event) =>
            this.update(index, { one_way: !(ev.target as HTMLInputElement).checked })}
        />
      </td>
      <td>
        <ha-icon-button
          label="Remove"
          data-action="remove"
          @click=${() => this.emit(this.edges.filter((_, i) => i !== index))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
      </td>
    </tr>`;
  }

  private renderDeclared(other: Group, edge: Adjacency): TemplateResult {
    return html`<tr class="declared" data-id=${other.id}>
      <td>${other.name ?? other.id} <span class="muted">declared on ${other.name ?? other.id}</span></td>
      <td>${CONNECTION_LABELS[edge.connection]}</td>
      <td>${edge.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-adjacency-table": AlAdjacencyTable;
  }
}
```

- [ ] **Step 5: `frontend/src/al-group-editor.ts` — the panels.** Add `import "./al-adjacency-table";`, `import { KIND_DEFS, NODE_KINDS } from "./kinds";`, `import { loadPanelOpen, savePanelOpen } from "./panel-state";`, `import { bindArea, bindFloor, IDENTITY_FIELDS, MIX_FIELDS } from "./group-form";`, `import { presenceSettings } from "./model";`, and `import { OVERRIDES } from "./stimulus-form";`. Add a small helper and use it for all four sections:

```ts
  /** One panel: a header, the definition that says what it is for, and its stored state. */
  private renderPanel(id: string, header: string, definition: string, fallback: boolean, body: unknown) {
    return html`<ha-expansion-panel
      outlined
      left-chevron
      data-panel=${id}
      ?expanded=${loadPanelOpen(`group:${id}`, fallback)}
      @expanded-changed=${(ev: CustomEvent<{ expanded: boolean }>) => {
        savePanelOpen(`group:${id}`, ev.detail.expanded);
      }}
    >
      <div slot="header" class="panel-header">
        <span>${header}</span>
        <div class="muted">${definition}</div>
      </div>
      <div class="panel-body">${body}</div>
    </ha-expansion-panel>`;
  }
```

The Identity panel's `ha-form` uses `IDENTITY_FIELDS` and passes the parent's kind so the picker is filtered:

```ts
    const parent = path.length > 2 ? groupAt(config, parentGroupPath(path)) : undefined;
    const identity = html`
      <ha-form
        .hass=${this.hass}
        .data=${groupData(group, isRoot, IDENTITY_FIELDS, config)}
        .schema=${groupSchema(group, isRoot, IDENTITY_FIELDS, config, parent?.kind ?? null)}
        .error=${fields}
        .computeLabel=${groupLabel}
        .computeHelper=${groupHelper}
        @value-changed=${this.onIdentityChanged}
      ></ha-form>
      <div class="muted note">Changing the id re-creates this group's entities.</div>
    `;
```

and `onIdentityChanged` routes the two registry fields through the binding helpers so the prefill happens where the name is known:

```ts
  private onIdentityChanged(ev: CustomEvent<{ value?: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const { config, path } = this;
    if (!config || !path) return;
    const group = groupAt(config, path);
    if (!group) return;
    const v = ev.detail?.value ?? {};
    let merged = mergeGroup(group, v);
    if ("area_id" in v && merged.area_id !== group.area_id)
      merged = bindArea(group, merged.area_id, merged.area_id ? this.areaName(merged.area_id) : null);
    if ("floor_id" in v && merged.floor_id !== group.floor_id)
      merged = bindFloor(group, merged.floor_id, merged.floor_id ? this.floorName(merged.floor_id) : null);
    const field = changedGroupField(merged, group);
    if (field === undefined) return;
    this.emitChange(setAt(config, path, merged), `${pathKey(path)}:${field}`);
  }

  private areaName(id: string): string | null {
    return this.hass?.areas[id]?.name ?? null;
  }

  private floorName(id: string): string | null {
    return this.hass?.floors?.[id]?.name ?? null;
  }
```

The Mix panel holds `MIX_FIELDS` plus the two `al-override-field`s that are already there (Max value, Precision) — the spec's "mix, gain, limiter, precision", in one place. The Adjacent groups panel is rendered only when `NODE_KINDS.has(group.kind)`, holds the table, and carries **Leads off the property** underneath it rather than inside it, because an exit is a property of the group, not of an edge:

```ts
    const adjacency = NODE_KINDS.has(group.kind)
      ? this.renderPanel(
          "adjacent",
          "Adjacent groups",
          ADJACENCY_DEFINITION,
          true,
          html`
            <al-adjacency-table
              .hass=${this.hass}
              .config=${config}
              .path=${path}
              .errors=${this.errors}
            ></al-adjacency-table>
            <div class="exit row">
              <ha-switch
                .checked=${group.exit === true}
                @change=${(e: Event) => this.setField("exit", (e.target as HTMLInputElement).checked)}
              ></ha-switch>
              <div>
                <div>Leads off the property</div>
                <div class="muted">
                  People can leave the property from here, so presence can move from here to Away.
                </div>
              </div>
            </div>
          `,
        )
      : nothing;
```

The Presence panel is rendered only when `presenceSettings(config).enabled`, starts closed, and holds a gain `ha-selector` plus the same `OVERRIDES` list the stimulus editor uses, each bound to `group.presence[name]` and written with `this.setField` under `["presence", name]`. Delete stays where it is, outside every panel, under the `.danger` rule.

Add to `styles.ts`: `.panel-header { display: flex; flex-direction: column; gap: 2px; padding: 4px 0; } .panel-body { padding: 0 8px 8px; } ha-expansion-panel { margin-bottom: 8px; }`.

- [ ] **Step 6: `frontend/src/activity-levels-panel.ts` — the "inferred kinds" banner.** Above the tabs, beside the existing save banner, keyed off the `inferred` state Task 3 added:

```ts
  /**
   * The one-time migration notice. A document written before kinds existed loads with them
   * guessed; nothing is written back until a human agrees, so this stays up until the next
   * Save — which is the moment the guesses become the document.
   */
  private renderInferred() {
    const count = this.inferred.length;
    if (count === 0) return nothing;
    return html`<ha-alert alert-type="warning">
      ${count} ${count === 1 ? "group has" : "groups have"} an inferred kind — check them and save.
      Until you do, the kinds above are a guess and nothing has been written.
      <ha-button
        class="inferred-fix"
        slot="action"
        @click=${() => {
          this.selectTab(this.tabs.indexOf("groups"));
          this.select(this.inferred[0]!.split("/").map((s) => (/^\d+$/.test(s) ? Number(s) : s)));
        }}
        >Show me</ha-button
      >
    </ha-alert>`;
  }
```

called from `render()` immediately after `${this.renderBanner()}`, and cleared in `save()` when the outcome reloads (`load()` re-reads `inferred`, which is empty once the kinds are in the stored document).

- [ ] **Step 7: GREEN, rebuild, commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm test
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm build
cd /Users/sholodak/elevenrose/activity-levels && git add frontend/src/panel-state.ts frontend/src/al-adjacency-table.ts frontend/src/al-group-editor.ts frontend/src/group-form.ts frontend/src/types.ts frontend/src/al-strip-controls.ts frontend/src/activity-levels-panel.ts frontend/src/styles.ts frontend/test custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "feat(panel): paneled group editor with an adjacency table"
```

---

### Task 6: The stimulus editor — Source, Envelope, and a collapsed Override preset

**Files:** modify `frontend/src/al-stimulus-editor.ts`, `frontend/src/stimulus-form.ts`, `frontend/test/al-stimulus-editor.test.ts`, `frontend/test/stimulus-form.test.ts`.

**Interfaces:**
```ts
// stimulus-form.ts
export const SOURCE_FIELDS: StimulusField[];    // entity, to, key
export const ENVELOPE_FIELDS: StimulusField[];  // envelope, gain
export function overriddenCount(stimulus: Stimulus): number;
export const ENVELOPE_DEFINITION: string;       // "How a single trigger rises and falls over time."
```

| Panel | Open by default | Contents | Definition |
| --- | --- | --- | --- |
| Source | yes | entity, active states, label | "What makes this stimulus fire, and what it is called in the mix." |
| Envelope | yes | preset picker, gain, the live chips, the sketch | "How a single trigger rises and falls over time." |
| Override preset | no | the eight `OVERRIDES` fields | "Change part of the preset for this stimulus only." Badge: "N overridden" |

- [ ] **Step 1: Tests first (RED).** Create `frontend/test/stimulus-form.test.ts` (the existing file is a stub; replace it):

```ts
import { describe, expect, it } from "vitest";
import { newStimulus } from "../src/model";
import { ENVELOPE_FIELDS, SOURCE_FIELDS, overriddenCount } from "../src/stimulus-form";

describe("stimulus panels", () => {
  it("splits the fields between Source and Envelope with nothing left over", () => {
    expect(SOURCE_FIELDS).toEqual(["entity", "to", "key"]);
    expect(ENVELOPE_FIELDS).toEqual(["envelope", "gain"]);
    expect([...SOURCE_FIELDS, ...ENVELOPE_FIELDS].sort()).toEqual(
      ["entity", "envelope", "gain", "key", "to"],
    );
  });

  it("counts only the envelope fields a stimulus actually overrides", () => {
    const stimulus = newStimulus("binary_sensor.x");
    expect(overriddenCount(stimulus)).toBe(0);
    expect(overriddenCount({ ...stimulus, release: 600 })).toBe(1);
    expect(overriddenCount({ ...stimulus, release: 600, impulse: false, sustain: 0 })).toBe(3);
    // gain and the preset are not overrides of the preset's shape: they are the panel above
    expect(overriddenCount({ ...stimulus, gain: 4, envelope: "hour" })).toBe(0);
  });
});
```

Rewrite `frontend/test/al-stimulus-editor.test.ts`'s structure cases:

```ts
const panel = (name: string): HTMLElement =>
  el.shadowRoot!.querySelector<HTMLElement>(`ha-expansion-panel[data-panel="${name}"]`)!;

it("opens Source and Envelope, and leaves the overrides collapsed", async () => {
  expect(panel("source").hasAttribute("expanded")).toBe(true);
  expect(panel("envelope").hasAttribute("expanded")).toBe(true);
  expect(panel("overrides").hasAttribute("expanded")).toBe(false);
  expect(panel("envelope").textContent).toContain("rises and falls over time");
});

it("badges the overrides panel with how many are set, and drops the badge at zero", async () => {
  expect(panel("overrides").querySelector(".badge")).toBeNull();
  el.config = withStimulus({ release: 600, attack: 5 });
  await el.updateComplete;
  expect(panel("overrides").querySelector(".badge")!.textContent).toContain("2 overridden");
});

it("remembers the overrides panel once it has been opened", async () => {
  panel("overrides").dispatchEvent(new CustomEvent("expanded-changed", { detail: { expanded: true } }));
  await el.updateComplete;
  expect(loadPanelOpen("stimulus:overrides", false)).toBe(true);
});
```

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/stimulus-form.test.ts test/al-stimulus-editor.test.ts
```

- [ ] **Step 2: `frontend/src/stimulus-form.ts`.** Add beside `OVERRIDES`:

```ts
/** What fires this stimulus. `gain` is not here: how loudly it plays is part of its shape. */
export const SOURCE_FIELDS: StimulusField[] = ["entity", "to", "key"];

/** The shape of one trigger: which preset it starts from, and how loud it is. */
export const ENVELOPE_FIELDS: StimulusField[] = ["envelope", "gain"];

export const ENVELOPE_DEFINITION = "How a single trigger rises and falls over time.";
export const SOURCE_DEFINITION = "What makes this stimulus fire, and what it is called in the mix.";
export const OVERRIDES_DEFINITION = "Change part of the preset for this stimulus only.";

/**
 * How many envelope fields this stimulus overrides. Only the eight in {@link OVERRIDES}
 * count: `gain` and the preset itself live in the Envelope panel above, and counting them
 * would badge a stimulus that has overridden nothing.
 */
export const overriddenCount = (stimulus: Stimulus): number =>
  OVERRIDES.filter((item) => stimulus[item.name] !== null && stimulus[item.name] !== undefined).length;
```

- [ ] **Step 3: `frontend/src/al-stimulus-editor.ts`.** Replace the single `FIELDS` constant with the two lists, wrap the three sections in the same `renderPanel` helper as the group editor (keyed `stimulus:<id>`, so the two editors do not share a panel's state by accident), and give the overrides panel its badge:

```ts
  private renderPanel(id: string, header: string, definition: string, fallback: boolean, badge: unknown, body: unknown) {
    return html`<ha-expansion-panel
      outlined
      left-chevron
      data-panel=${id}
      ?expanded=${loadPanelOpen(`stimulus:${id}`, fallback)}
      @expanded-changed=${(ev: CustomEvent<{ expanded: boolean }>) => {
        savePanelOpen(`stimulus:${id}`, ev.detail.expanded);
      }}
    >
      <div slot="header" class="panel-header">
        <span>${header} ${badge}</span>
        <div class="muted">${definition}</div>
      </div>
      <div class="panel-body">${body}</div>
    </ha-expansion-panel>`;
  }
```

with the three calls:

```ts
      ${this.renderPanel("source", "Source", SOURCE_DEFINITION, true, nothing, html`
        <ha-form
          .hass=${this.hass}
          .data=${stimulusData(stimulus, this.toText, SOURCE_FIELDS)}
          .schema=${stimulusSchema(config, SOURCE_FIELDS)}
          .error=${fields}
          .computeLabel=${stimulusLabel}
          .computeHelper=${stimulusHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
      `)}
      ${this.renderPanel("envelope", "Envelope", ENVELOPE_DEFINITION, true, nothing, html`
        <ha-form
          .hass=${this.hass}
          .data=${stimulusData(stimulus, this.toText, ENVELOPE_FIELDS)}
          .schema=${stimulusSchema(config, ENVELOPE_FIELDS)}
          .error=${fields}
          .computeLabel=${stimulusLabel}
          .computeHelper=${stimulusHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${this.renderLive(voice, phaseEnds)}
        <al-envelope-sketch .envelope=${resolved}></al-envelope-sketch>
      `)}
      ${this.renderPanel(
        "overrides",
        "Override preset",
        OVERRIDES_DEFINITION,
        false,
        overridden === 0 ? nothing : html`<span class="badge">${overridden} overridden</span>`,
        OVERRIDES.map((item) => this.renderOverride(item, stimulus, resolved, fields)),
      )}
```

where `overridden = overriddenCount(stimulus)`, `renderLive` is the existing live-chips block lifted into a method, and `renderOverride` is the existing `al-override-field` template lifted into one. The badge reuses the tree's `.badge` rule but in the neutral colour — add `.panel-header .badge { background: var(--secondary-background-color); color: var(--secondary-text-color); margin-left: 8px; }` to `styles.ts`.

- [ ] **Step 4: GREEN, rebuild, commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm test
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm build
cd /Users/sholodak/elevenrose/activity-levels && git add frontend/src/al-stimulus-editor.ts frontend/src/stimulus-form.ts frontend/src/styles.ts frontend/test/al-stimulus-editor.test.ts frontend/test/stimulus-form.test.ts custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "feat(panel): paneled stimulus editor with a collapsed override preset"
```

---

### Task 7: Presence — a setup card behind an always-reachable tab

**Files:** modify `custom_components/activity_levels/websocket_api.py`, `frontend/src/types.ts`, `frontend/src/al-presence.ts`, `frontend/src/activity-levels-panel.ts`; tests `tests/test_websocket_topology.py`, `frontend/test/al-presence.test.ts`, `frontend/test/activity-levels-panel.test.ts`.

**Interfaces:**
```python
# websocket_api.py -- activity_levels/presence/state gains one field, in both branches
# {..., "bermuda": bool}   # whether the Bermuda integration is loaded at all
```
```ts
// types.ts
interface PresenceState { bermuda: boolean; enabled: boolean; /* … */ }
```

The tab is listed whether or not presence is on. With it off, `al-presence` renders **only** a setup card: two sentences on what presence does, whether Bermuda was found, the enable switch, the device picker, and the note about the per-scanner distance sensors. With it on, the tab is exactly what it is today.

- [ ] **Step 1: Tests first (RED).** Add to `tests/test_websocket_topology.py`:

```python
async def test_presence_state_says_whether_bermuda_is_installed(hass, ws_client, entry) -> None:
    """The panel's setup card asks this before presence has ever been switched on."""
    await ws_client.send_json({"id": 1, "type": "activity_levels/presence/state"})
    msg = await ws_client.receive_json()
    assert msg["result"]["enabled"] is False
    assert msg["result"]["bermuda"] is False
    hass.config.components.add("bermuda")
    await ws_client.send_json({"id": 2, "type": "activity_levels/presence/state"})
    assert (await ws_client.receive_json())["result"]["bermuda"] is True
```

(reuse whatever the file already calls its client and entry fixtures.)

Add to `frontend/test/al-presence.test.ts`:

```ts
describe("the setup card", () => {
  it("is the whole tab while presence is off", async () => {
    const el = await mount(roomsConfig(), { bermuda: true, enabled: false });
    expect(el.shadowRoot!.querySelector(".setup")).toBeTruthy();
    expect(el.shadowRoot!.querySelector("al-graph-map")).toBeNull();
    expect(el.shadowRoot!.querySelector('ha-card[header="People"]')).toBeNull();
    expect(el.shadowRoot!.querySelector(".setup")!.textContent).toContain(
      "which room each tracked device is in",
    );
    expect(el.shadowRoot!.querySelector(".setup")!.textContent).toContain(
      "per-scanner distance sensors",
    );
  });

  it("reports whether Bermuda was found", async () => {
    let el = await mount(roomsConfig(), { bermuda: true, enabled: false });
    expect(el.shadowRoot!.querySelector(".bermuda")!.textContent).toContain("Bermuda is installed");
    el = await mount(roomsConfig(), { bermuda: false, enabled: false });
    expect(el.shadowRoot!.querySelector(".bermuda")!.textContent).toContain("Bermuda was not found");
    // discouraged, not forbidden: somebody may be installing it in another tab
    expect(el.shadowRoot!.querySelector(".enable ha-switch")!.hasAttribute("disabled")).toBe(false);
  });

  it("switches presence on through the ordinary config change", async () => {
    const el = await mount(roomsConfig(), { bermuda: true, enabled: false });
    el.shadowRoot!
      .querySelector(".enable ha-switch")!
      .dispatchEvent(new CustomEvent("change", { detail: {} }));
    await el.updateComplete;
    expect(changes[0]!.presence!.enabled).toBe(true);
  });

  it("gives way to the real tab once presence is on", async () => {
    const el = await mount(presenceConfig(), { bermuda: true, enabled: true });
    expect(el.shadowRoot!.querySelector(".setup")).toBeNull();
    expect(el.shadowRoot!.querySelector("al-graph-map")).toBeTruthy();
  });
});
```

(the file's existing `mount` helper stubs `getPresenceState`; give it a second argument that is folded into the stubbed payload, so a test can say what `presence/state` answered.)

and change the panel-shell test that asserted the tab was hidden:

```ts
it("always lists the Presence tab, whether presence is on or off", async () => {
  const el = await mountPanel(hass); // houseConfig: no presence block at all
  const tabs = [...el.shadowRoot!.querySelectorAll('[role="tab"]')].map((t) => t.textContent?.trim());
  expect(tabs).toEqual(["Mixer", "Groups", "Envelopes", "Defaults", "Patterns", "Presence"]);
});
```

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest tests/test_websocket_topology.py -q
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm test -- test/al-presence.test.ts test/activity-levels-panel.test.ts
```

Expected: red — `bermuda` is not in either payload and `.setup` does not exist.

- [ ] **Step 2: `websocket_api.py`.** In `ws_presence_state`, both branches gain the flag. The opt-out branch:

```python
        connection.send_result(
            msg["id"],
            {
                # opted out is an answer, not an error: the panel shows the setup card and
                # needs to know whether Bermuda is there before offering to switch it on
                "bermuda": "bermuda" in hass.config.components,
                "enabled": False,
                "devices": {},
                "occupants": {},
                "scanners": [],
                "unmapped": [],
                "disabled": [],
            },
        )
```

and the enabled branch:

```python
    connection.send_result(
        msg["id"], {"bermuda": "bermuda" in hass.config.components, **presence.payload()}
    )
```

Nothing in `presence_coordinator.py` moves.

- [ ] **Step 3: `frontend/src/types.ts`.** `PresenceState` gains `bermuda: boolean;` as its first field, documented: *"Whether the Bermuda integration is loaded. The setup card asks before offering to turn presence on."*

- [ ] **Step 4: `frontend/src/al-presence.ts` — the setup card.** `render()` branches before anything else, and the two poll loops stay as they are (they cost one websocket call every two seconds and are what tells the card that Bermuda has appeared):

```ts
  override render() {
    const config = this.config;
    if (!config) return html`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    if (!presenceSettings(config).enabled)
      return html`<div class="page">${this.renderSetup(config)}</div>`;
    return html`<div class="page">
      ${this.renderMap(config)} ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(config)}
    </div>`;
  }

  /**
   * What the tab is before presence exists. The tab is always listed, because a feature you
   * cannot find is a feature nobody turns on — and everything here is the Settings form
   * afterwards, reduced to the two fields that start it.
   */
  private renderSetup(config: Config): TemplateResult {
    const found = this.presence?.bermuda === true;
    const s = presenceSettings(config);
    return html`<ha-card class="setup" header="Room presence">
      <p>
        Activity Levels can work out which room each tracked device is in, from the Bluetooth
        distances <a href="https://github.com/agittins/bermuda">Bermuda</a> reports to every
        scanner in the house.
      </p>
      <p class="muted">
        Turning it on gives each area a <em>presence</em> channel in its mix, a
        <code>sensor.&lt;area&gt;_occupants</code>, and one <code>sensor.&lt;name&gt;_room</code>
        per person — and it uses the adjacency you have already drawn, because the estimate
        walks that graph rather than jumping across it.
      </p>
      <div class="bermuda row">
        <ha-icon icon=${found ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}></ha-icon>
        <span>
          ${found
            ? "Bermuda is installed."
            : "Bermuda was not found. Install it first, or this will have nothing to read."}
        </span>
      </div>
      <div class="enable row">
        <ha-switch .checked=${false} @change=${() => this.setSetting("enabled", true)}></ha-switch>
        <span>Estimate room presence</span>
      </div>
      <ha-selector
        class="setup-devices"
        .hass=${this.hass}
        .selector=${DEVICES_SELECTOR}
        .label=${LABELS.devices}
        .helper=${HELPERS.devices}
        .required=${false}
        .value=${s.devices.map((d) => d.device)}
        @value-changed=${this.onDevicesChanged}
      ></ha-selector>
      <p class="muted">
        Bermuda ships its per-scanner distance sensors disabled. Enable them under
        <em>Settings → Devices &amp; services → Bermuda</em> before expecting a room out of
        this, and give each scanner device the area of the room it sits in.
      </p>
    </ha-card>`;
  }
```

`setSetting(key, value)` and `onDevicesChanged` are the existing `onFormChanged` split into two named helpers — both build the presence block from `presenceSettings(config)`, write it with `setAt(config, ["presence"], …)` and dispatch `alChange`, exactly as the Settings form does today. So switching presence on is an ordinary unsaved edit that the Save button commits, and Discard undoes.

Add to the component's styles: `.setup p { margin: 0 0 12px; } .setup .row { margin-bottom: 12px; } .setup ha-selector { display: block; margin-bottom: 12px; }`.

- [ ] **Step 5: `frontend/src/activity-levels-panel.ts` — the tab list.** Replace `BASE_TABS` and the `tabs` getter:

```ts
/**
 * Every tab, always. Presence used to appear only while it was enabled, which meant the
 * only way to switch it on was to write `presence.enabled` into the options by hand — and
 * the tab is where you turn it on, so it has to be reachable before it is on.
 */
const TABS: Tab[] = ["mixer", "groups", "envelopes", "defaults", "patterns", "presence"];

  private get tabs(): Tab[] {
    return TABS;
  }
```

`syncTabs` stays — it is still what keeps `tab` and `tabFocus` inside the list after a reload — and `presenceSettings` is no longer needed by the shell; `pnpm lint` names the now-unused import.

- [ ] **Step 6: GREEN, rebuild, commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest -q && uv run ruff check . && uv run mypy
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd /Users/sholodak/elevenrose/activity-levels && git add custom_components/activity_levels/websocket_api.py tests/test_websocket_topology.py frontend/src/types.ts frontend/src/al-presence.ts frontend/src/activity-levels-panel.ts frontend/test/al-presence.test.ts frontend/test/activity-levels-panel.test.ts custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "feat(panel): presence setup card on an always-reachable tab"
```

---

### Task 8: Docs, the example house, the bundle, and the CI-equivalent gate

**Files:** modify `README.md`, `examples/house.yaml`; rebuild `custom_components/activity_levels/frontend/activity-levels-panel.js`. **`CHANGELOG.md` is release-please-owned — do not touch it.**

- [ ] **Step 1: `examples/house.yaml` — explicit kinds.** Read the file first. Four edits, then a verification.

1. **Every group gets a `kind`,** in the layering the spec names: `property` → `house` (structure) → `basement`/`downstairs`/`upstairs` (floors) → the rooms (areas); `garage` a structure; `outside` and everything under it `outside`. Each floor gains a `floor_id` and each area an `area_id` matching its id, introduced by a comment that says what those are for:

```yaml
# Kinds say what each group is on the property, and they decide what can go inside it: a
# property holds structures and outdoor areas, a structure holds floors, a floor holds
# areas, and an outdoor area holds outdoor areas. `floor_id` and `area_id` bind a group to
# Home Assistant's own floor and area registries -- the ids below are what a fresh Home
# Assistant would call them, so change them to match yours or delete them: an unbound floor
# or area is perfectly fine, and only means you type the name here instead of once there.
groups:
  - id: property
    kind: property
    name: Property
    mix: max
    children:
      - id: house
        kind: structure
        name: House
        mix: max
        children:
          - id: basement
            kind: floor
            floor_id: basement
            name: Basement
            mix: max
            children:
              - id: play_room
                kind: area
                area_id: play_room
                name: Play Room
                adjacent:
                  - laundry_room
                  - {id: downstairs_hallway, connection: stairs}   # the basement stairs
```

and so on: `laundry_room` (`area_id: laundry_room`), `downstairs` and `upstairs` (`kind: floor` with `floor_id: downstairs` / `floor_id: upstairs`), and each of their rooms (`kind: area`, `area_id: <id>`).

2. **The garage becomes a structure with a room in it.** A structure is a building, and a building is not somewhere a person stands — so the adjacency and the stimuli move down one level, into the bay:

```yaml
      # A garage is a building, so it is a structure; the space inside it is the area you
      # actually walk into, and that is what is next to the driveway.
      - id: garage
        kind: structure
        name: Garage
        mix: max
        children:
          - id: garage_bay
            kind: area
            area_id: garage
            name: Garage Bay
            adjacent: [driveway]
            stimuli:
              - entity: binary_sensor.garage_door
              - entity: binary_sensor.garage_motion
              - entity: binary_sensor.garage_side_door
```

Its `exit: true` is **deleted**: you leave this property by the driveway, which already says so, and an `area` may only be the way off a property that models nothing outdoors.

3. **The outdoor branch keeps its shape and gains its kinds.** `outside`, `front_yard`, `back_yard`, `back_patio` and `driveway` all become `kind: outside`; their existing `adjacent` and `exit: true` lines are unchanged. Add a comment where `outside` is declared, because the nesting has a consequence worth knowing:

```yaml
      # Every outdoor area is a place, including the ones that only contain other outdoor
      # areas -- so `outside` and `back_yard` are rooms on the map too, with no doorways of
      # their own. Put the yards directly under the property instead if you would rather not
      # see them there.
```

4. **Connection types where they say something.** The exterior doors and the stairs are worth spelling out, because they are what a later release would weight differently:

```yaml
              - id: living_room
                adjacent:
                  - dining_room
                  - downstairs_hallway
                  - {id: front_yard, connection: exterior_door}    # the front door
              - id: kitchen
                adjacent:
                  - {id: back_patio, connection: exterior_door}    # the back door
              - id: laundry_room
                adjacent:
                  - {id: driveway, connection: exterior_door}      # basement exterior door
              - id: downstairs_hallway
                adjacent:
                  - {id: upstairs_hallway, connection: stairs}
```

Verify it loads and says what it should:

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv run python -c "
import yaml
from custom_components.activity_levels.schema import validate
from custom_components.activity_levels.topology import build_topology
r = validate(yaml.safe_load(open('examples/house.yaml')))
t = build_topology(r.config)
print(len(t.nodes), 'rooms', len(t.edges), 'doorways', sorted(t.exits))
print('inferred:', r.inferred)
print(t.paths('main_bedroom', 'kitchen')[0])
"
```

Expected: `16 rooms 16 doorways ['back_patio', 'driveway', 'front_yard']`; `inferred: ()`, because every kind is now written down and nothing is guessed; and a route from the main bedroom to the kitchen through both hallways and the dining room. The sixteen rooms are the eleven areas (`play_room`, `laundry_room`, `living_room`, `office`, `dining_room`, `kitchen`, `downstairs_hallway`, `guest_room`, `main_bedroom`, `upstairs_hallway`, `garage_bay`) and the five outdoor areas (`outside`, `front_yard`, `back_yard`, `back_patio`, `driveway`). If the counts differ, the file was edited differently from this plan — reconcile the file, not the expectation.

- [ ] **Step 2: `README.md`.** Five edits.

1. **A new subsection at the top of `## Rooms & presence`**, before the adjacency prose, titled `### What each group is`:

   - The five kinds as a table — kind, what it is, what can go inside it — with the definitions verbatim from the spec, because those are also the words the panel shows.
   - That every root is a property, and that the layering is exactly what the tree's *Add group* menu offers.
   - That `floor_id` and `area_id` bind a group to Home Assistant's registries; that both are optional, because a house whose Home Assistant areas do not match its rooms is a normal house; that picking one in the editor fills in the id and the name **only while they are untouched**, and never afterwards; and that a group with an `area_id` and no name of its own takes the area's name.
   - That only `area` and `outside` groups are *rooms* — the states the presence estimator has — so an `outside` group that only holds other outdoor areas is a room too.
   - **The migration note**, in its own paragraph:

     > A configuration written before kinds existed has none. Activity Levels works them out
     > when it loads — the root is the property, a group bound to an area is an area, and
     > everything else follows the layering — and the panel says so with a banner until you
     > look at them and save. Nothing is written to your configuration until you do, and no
     > entity id changes either way: they come from the group's `id`, which nothing here
     > touches. Two things are worth checking when the banner appears. A building that
     > declared a doorway will have been guessed as an *outdoor* area, because a structure
     > cannot have one — move the doorway to a room inside it and set the kind back. And a
     > room that leads off a property with outdoor areas on it will have to hand that
     > `exit` to the yard it opens onto.

2. **The adjacency prose** gains the connection types (`open`, `door`, `stairs`, `exterior_door`), that a bare id means a two-way door, that the type is recorded and shown but nothing weights it yet, and that clearing "both ways" is the one-way edge which used to be YAML-only. `exit` is renamed throughout to **leads off the property**, carrying the spec's sentence: *"People can leave the property from here, so presence can move from here to Away."*

3. **The panel section** gains two paragraphs. The Groups tree: flat rows, the caret opens and the label selects, the action column appears on hover, on keyboard focus and on the selected row, drag to reorder or reparent with Alt+↑↓←→ doing the same from the keyboard, and an illegal drop saying why rather than silently refusing. The editors: Identity / Mix / Adjacent groups / Presence for a group, Source / Envelope / Override preset for a stimulus, each panel carrying a one-line definition and remembering whether you left it open.

4. **The configuration reference** gains the group keys, in the same commented style as the rest:

```yaml
groups:
  - id: kitchen
    kind: area              # property | structure | floor | area | outside
    area_id: kitchen        # binds a Home Assistant area (was `area`, still accepted)
    # floor_id: downstairs  # on a `floor` group, binds a Home Assistant floor instead
    adjacent:
      - hall                                          # a two-way door
      - {id: back_patio, connection: exterior_door}   # open | door | stairs | exterior_door
      - {id: laundry_chute, one_way: true}            # the rare thing that is not two-way
    exit: false             # true = people can leave the property from here
```

5. **The entities table** gains a line under it: the device model in Home Assistant is now the group's kind — *Property*, *Structure*, *Floor*, *Area* or *Outside* — and an area-bound group suggests that area for its devices, while a floor-bound one suggests nothing, because Home Assistant devices belong to areas and not to floors.

- [ ] **Step 3: Rebuild the bundle and prove it is reproducible.**

```bash
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm build && shasum ../custom_components/activity_levels/frontend/activity-levels-panel.js
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm build && shasum ../custom_components/activity_levels/frontend/activity-levels-panel.js
```

Expected: the two sums are identical. If they are not, something in the bundle is time- or path-dependent and must be fixed before committing — a bundle that differs per build makes CI's `git diff --exit-code` fail for everyone.

- [ ] **Step 4: The full CI-equivalent gate.** Run exactly what the two workflows run:

```bash
cd /Users/sholodak/elevenrose/activity-levels && uv sync --locked
cd /Users/sholodak/elevenrose/activity-levels && uv run ruff check .
cd /Users/sholodak/elevenrose/activity-levels && uv run ruff format --check .
cd /Users/sholodak/elevenrose/activity-levels && uv run mypy
cd /Users/sholodak/elevenrose/activity-levels && uv run pytest --cov=custom_components/activity_levels --cov-report=term-missing
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm install --frozen-lockfile
cd /Users/sholodak/elevenrose/activity-levels/frontend && pnpm lint && pnpm typecheck && pnpm coverage && pnpm build
cd /Users/sholodak/elevenrose/activity-levels/frontend && git diff --exit-code -- ../custom_components/activity_levels/frontend
cd /Users/sholodak/elevenrose/activity-levels && python3 -c "import json; a=json.load(open('custom_components/activity_levels/strings.json')); b=json.load(open('custom_components/activity_levels/translations/en.json')); assert a == b, 'strings.json and translations/en.json have drifted'"
cd /Users/sholodak/elevenrose/activity-levels && git status --porcelain
```

Expected: every command exits 0; `git status --porcelain` shows only the files this task touched, and **never** anything under `brands/`. `strings.json` and `translations/en.json` are untouched by every task here — no config-flow step, error, service or entity name changed, and a kind is a device *model*, which Home Assistant does not translate — so that check passes without either file having been opened.

Hassfest and the HACS action cannot be run locally. The two things they check that this work could break are `manifest.json` (unchanged: no new requirement, no new dependency, no version edit) and `strings.json` (unchanged, and still equal to its English copy).

- [ ] **Step 5: Commit.**

```bash
cd /Users/sholodak/elevenrose/activity-levels && git add README.md examples/house.yaml custom_components/activity_levels/frontend/activity-levels-panel.js && git commit -m "docs: group kinds, the adjacency table and the example house"
```

---

## Self-review

**Spec coverage — requirement → task.**

| Spec section | Requirement | Task |
| --- | --- | --- |
| 1 Kinds | `kind` ∈ property/structure/floor/area/outside, default null, resolved by the loader | 1 |
| 1 Kinds | `area` → `area_id` rewrite; both spellings accepted, only `area_id` round-tripped | 1 |
| 1 Kinds | `floor_id` is new; both bindings optional | 1 |
| 1 Kinds | nesting rules, pathed at `groups/i/…/kind`, every illegal parent/child pair | 1 (parametrized over all fifteen pairs) |
| 1 Kinds | every root is a property | 1 |
| 1 Kinds | topology nodes = `area`/`outside`; a structure/floor/property may not declare `adjacent`/`exit` | 1 (the rule) + 2 (the graph) |
| 1 Kinds | `exit` on `outside`, and on `area` only when nothing is outside | 1 |
| 1 Kinds | entity ids unchanged; `model` per kind; `suggested_area` from `area_id`; a floor suggests nothing | 2 |
| 1 Binding | picking an area/floor prefills `id` and `name` only while both are still defaults; the backend never rewrites ids | 5 (`bindArea`/`bindFloor`/`isDefaultId`) |
| 1 Binding | a group with `area_id` and no name takes the area's name | 1 (the name default is removed) + 2 (`_create_devices`) |
| 1 Migration | deterministic inference, every branch, in order | 1 (`infer_kinds`, `test_inference_covers_every_branch`) |
| 1 Migration | the unresolvable case is left null and reported | 1 (`test_an_unresolvable_kind_is_left_null_and_reported`) |
| 1 Migration | a `migrated`/`inferred_paths` signal the loader and the websocket can surface | 1 (`Validated`) + 2 (`config/get`) + 5 (the banner) |
| 1 Migration | `examples/house.yaml` updated with explicit kinds | 8 |
| 2 Adjacency | `{id, connection, one_way}`; a plain string means `{connection: door}`; enum validated and round-tripped; nothing reads it | 1 |
| 2 Adjacency | a table, for `area`/`outside` only: filtered picker, connection select, "both ways", remove | 5 |
| 2 Adjacency | edges declared on the other group appear read-only, labelled "declared on \<name\>" | 5 (`declaredOn`) |
| 2 Adjacency | the inline definition, verbatim | 5 (`ADJACENCY_DEFINITION`, asserted in the test) |
| 2 Adjacency | `exit` rendered as "Leads off the property", with its helper | 5 |
| 3 Tree | flat rows, no borders or card padding, indent guides, a kind icon per kind, `mdi:flash` for a stimulus | 4 |
| 3 Tree | right-aligned fixed-width actions on hover, focus and selection; the up/down arrows are gone | 4 |
| 3 Tree | add stimulus, add group (menu filtered by the nesting rules), remove | 4 |
| 3 Tree | the caret toggles and is persisted per browser; the label and blank space select and do not toggle | 4 (`tree-rows.ts`) |
| 3 Tree | native HTML5 DnD; before/after/into targets; illegal drops show a not-allowed cursor and a one-line hint | 4 |
| 3 Tree | `moveNode(config, fromPath, toParentPath, index)` is a pure reducer with its own tests; DnD only computes the arguments | 3 |
| 3 Tree | Alt+↑↓ reorder, Alt+←→ outdent/indent where the rules allow | 4 |
| 3 Tree | the placeholder shows only for an expanded group with nothing in it at all | 4 |
| 4 Editors | `ha-expansion-panel` sections with a header, a one-line definition and an optional badge | 5, 6 |
| 4 Editors | collapse state remembered per browser per panel | 5 (`panel-state.ts`, shared with 6) |
| 4 Editors | Group: Identity (kind + registry picker + id + name) open, Mix open, Adjacent groups open for area/outside, Presence collapsed and only when presence is on, Delete | 5 |
| 4 Editors | Stimulus: Source open, Envelope open, Override preset collapsed with an "N overridden" badge | 6 |
| 4 Editors | every definition, verbatim | 3 (`KIND_DEFS`), 5 (Mix, adjacency), 6 (Envelope) |
| 5 Presence | the tab is always listed | 7 |
| 5 Presence | setup card: two sentences, Bermuda detected or not from `presence/state`, the enable toggle, the device picker, the distance-sensor note | 7 |
| 5 Presence | the existing tab renders unchanged when enabled | 7 (the branch turns on `enabled` alone) |
| Testing | schema: kinds, every illegal pair, the `area` rewrite, inference including the unresolved case, `exit` rules, long form and enum, old documents still load | 1 |
| Testing | backend: device `model` per kind, `suggested_area`, nodes restricted to area/outside | 2 |
| Testing | frontend pure: `moveNode`/`legalDrop` for every rule, the descendant guard, the index math | 3 |
| Testing | frontend pure: kind display, the adjacency table model (own vs declared-on rows), the override badge count | 3 (`declaredOn`, `KIND_DEFS`), 5, 6 |
| Testing | components: tree hover/selection/caret, DnD with synthetic drag events, keyboard parity, panel persistence, the presence setup card, the inferred banner | 4, 5, 6, 7 |
| Testing | `examples/house.yaml` validates with explicit kinds | 8 |
| Later | geometry, dwell anomalies, where-is-activity sensors, connection-weighted transitions | out of scope; `connection` is stored and validated so the last of those needs no migration when it lands |

**Two decisions this plan makes that the spec left open**, both argued in Task 1 and both covered by a test. **M1**: inference prefers a kind that fits what the group already declares, so a garage that declares a doorway does not migrate into a structure that is instantly illegal. **M2**: the kind-conditioned `adjacent`/`exit` rules are errors only for a kind the document actually declares, so no configuration that loads today stops loading because of a field its owner never wrote. Both are visible rather than silent: every group they touch is listed in `inferred`, and the banner points straight at it.

**Placeholder scan.** Every step carries the code or the test content it needs. The five places that describe rather than transcribe are all "lift this existing block into a method": `al-tree`'s `labelFor` and `renderRowStatus` (Task 4 Step 4), `al-stimulus-editor`'s `renderLive` and `renderOverride` (Task 6 Step 3), `al-presence`'s `setSetting` and `onDevicesChanged` (Task 7 Step 4), the group editor's Presence panel body (Task 5 Step 5) and the README's prose edits (Task 8 Step 2), which are specified paragraph by paragraph with the sentences that must appear. No "TBD", no "similar to".

**Type and payload consistency across tasks.** `ALLOWED_CHILDREN` / `NODE_KINDS` / `KINDS` / `CONNECTIONS` are declared twice on purpose — once in `const.py` (T1) and once in `kinds.ts` (T3) — and `kinds.test.ts` asserts the table entry by entry against the same words `test_schema.py` parametrizes, so a drift is a red test on both sides rather than a save that fails on the server. `Validated.inferred` (T1) is `config/get`'s `inferred` (T2), is `ConfigGet.inferred` (T3), is the banner's count (T5). `GroupInfo.kind`/`area_id`/`floor_id` (T2) is what `_create_devices` reads (T2) and what `Group.kind`/`area_id`/`floor_id` mirrors (T3). `legalDrop` and `moveNode` (T3) are called from exactly one place each in the component, `tryMove` (T4). `loadPanelOpen`/`savePanelOpen` (T5) are reused verbatim by T6, under distinct `group:` and `stimulus:` key prefixes. `PresenceState.bermuda` (T7) is added to both branches of the single handler that produces it.

**Ordering.** 1 → 2 (every consumer reads the resolved document) → 3 (the panel's types have to match what `config/get` now returns) → 4 (the tree calls the reducers 3 added) → 5 (the editor needs `panel-state` and the kind-aware form) → 6 (reuses 5's `panel-state` and its panel-header styles) → 7 (independent of 4–6; it could run any time after 3) → 8. Only 7 is movable.

**Risks worth naming.** Three. First, `ha-selector`'s `floor` type: `ha-selector-floor` is registered in the 2026.8 frontend bundle, but it is not in `HA_ELEMENTS`, so a frontend that failed to lazy-load it would render an empty field rather than the honest "components did not load" page — if that turns up in manual testing the fix is one string in `ha-elements.ts`, not a redesign. Second, native HTML5 drag-and-drop has no real implementation in jsdom: the tests synthesise a `DataTransfer`, which pins the component's own logic but not the browser's behaviour, so the drag needs one pass of manual testing in a real Home Assistant before release. Third, M1 will infer `outside` for a detached building that declares a doorway, which is a wrong-looking answer to a right question; it is the price of the document still loading, it is exactly what the banner exists to have a human correct, and the README says so in as many words.
