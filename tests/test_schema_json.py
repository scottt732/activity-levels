"""The exported JSON Schema: valid, in step with the code, and true about real documents."""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml
from jsonschema import Draft202012Validator

from custom_components.activity_levels.const import SCHEMA_NAME, SCHEMA_URL, STATIC_URL
from custom_components.activity_levels.schema import default_options, validate_config
from custom_components.activity_levels.schema_json import SCHEMA_FILE, json_schema, render

EXAMPLE = Path(__file__).resolve().parents[1] / "examples" / "house.yaml"


@pytest.fixture(scope="module")
def schema() -> dict:
    return json_schema()


@pytest.fixture(scope="module")
def validator(schema: dict) -> Draft202012Validator:
    return Draft202012Validator(schema)


def errors(validator: Draft202012Validator, document: object) -> list[str]:
    """Every complaint, as `path: message`, so a failing test says where it went wrong."""
    return [
        f"{'/'.join(str(p) for p in e.absolute_path)}: {e.message}"
        for e in validator.iter_errors(document)
    ]


def test_it_is_a_valid_json_schema(schema: dict) -> None:
    Draft202012Validator.check_schema(schema)
    assert schema["$schema"] == "https://json-schema.org/draft/2020-12/schema"


def test_the_committed_file_matches_a_fresh_export() -> None:
    """The same check the frontend workflow runs on the panel bundle, for the schema.

    Run `uv run python scripts/export_schema.py` when this fails.
    """
    assert SCHEMA_FILE.is_file(), f"{SCHEMA_FILE} has never been exported"
    assert SCHEMA_FILE.read_text(encoding="utf-8") == render()


def test_the_file_is_named_and_addressed_the_way_the_panel_serves_it() -> None:
    assert SCHEMA_FILE.name == SCHEMA_NAME
    assert SCHEMA_URL.startswith(f"{STATIC_URL}/")
    assert SCHEMA_URL.endswith(f"/{SCHEMA_NAME}")


def test_the_example_house_validates(validator: Draft202012Validator) -> None:
    """The real, hand-written document, in the shape a human types it."""
    document = yaml.safe_load(EXAMPLE.read_text(encoding="utf-8"))
    assert errors(validator, document) == []


def test_a_normalized_document_validates_too(validator: Draft202012Validator) -> None:
    """What the backend hands the panel has to be re-editable in the Code tab.

    Normalization fills in every default, rewrites short-form doorways into their long
    form and turns durations into seconds -- a different-looking document from the one
    on disk, and one the schema has to accept just as readily, or the editor would
    underline the panel's own output.
    """
    document = validate_config(yaml.safe_load(EXAMPLE.read_text(encoding="utf-8")))
    assert errors(validator, document) == []


def test_the_empty_starting_document_validates(validator: Draft202012Validator) -> None:
    assert errors(validator, validate_config(default_options())) == []


def test_a_misspelled_key_is_rejected(validator: Draft202012Validator) -> None:
    """The mistake this schema is most useful for: a key that is nearly right."""
    document = {"version": 1, "defaults": {"max_valu": 5.0}}
    assert any("max_valu" in message for message in errors(validator, document))


def test_a_bad_group_id_is_rejected(validator: Draft202012Validator) -> None:
    document = {"version": 1, "groups": [{"id": "Living Room"}]}
    assert any(path.startswith("groups/0/id") for path in errors(validator, document))


def test_version_is_required_and_pinned(validator: Draft202012Validator) -> None:
    assert errors(validator, {}) != []
    assert errors(validator, {"version": 2}) != []


def test_bounds_recorded_by_finite_reach_the_schema(schema: dict) -> None:
    """`_Finite` holds its range so the export can publish it; prove it arrives."""
    threshold = schema["properties"]["presence"]["properties"]["threshold"]
    assert threshold == {"type": "number", "exclusiveMinimum": 0.0, "maximum": 1.0, "default": 0.6}


def test_groups_recurse_through_a_single_definition(schema: dict) -> None:
    """One `$defs/group`, named by both `groups` and `children`, is what makes it finite."""
    assert schema["properties"]["groups"]["items"] == {"$ref": "#/$defs/group"}
    group = schema["$defs"]["group"]
    assert group["properties"]["children"]["items"] == {"$ref": "#/$defs/group"}
    assert group["properties"]["stimuli"]["items"]["properties"]["entity"]["type"] == "string"


def test_a_duration_accepts_both_spellings(validator: Draft202012Validator) -> None:
    for value in ("30s", "1d", "00:05:00", 90, 0):
        assert errors(validator, {"version": 1, "defaults": {"debounce": value}}) == []
    assert errors(validator, {"version": 1, "defaults": {"debounce": "soon"}}) != []


def test_a_doorway_is_a_name_or_a_description(validator: Draft202012Validator) -> None:
    """Both spellings of `adjacent` the schema documents have to actually validate."""

    def group(adjacent: object) -> dict:
        return {"version": 1, "groups": [{"id": "kitchen", "adjacent": [adjacent]}]}

    assert errors(validator, group("hall")) == []
    assert errors(validator, group({"id": "hall", "connection": "stairs"})) == []
    assert errors(validator, group({"id": "hall", "connection": "hatch"})) != []
