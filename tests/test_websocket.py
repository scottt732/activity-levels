import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.activity_levels.const import DOMAIN
from custom_components.activity_levels.diagnostics import async_get_config_entry_diagnostics
from custom_components.activity_levels.schema import validate_config
from tests.fixtures import house_config


@pytest.fixture
async def entry(hass: HomeAssistant) -> MockConfigEntry:
    for e in (
        "binary_sensor.front_door",
        "binary_sensor.living_motion",
        "binary_sensor.kitchen_motion",
    ):
        hass.states.async_set(e, "off")
    hass.states.async_set("media_player.tv", "idle")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=validate_config(house_config()))
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_config_get_validate_save(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/config/get"})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["config"]["groups"][0]["id"] == "house"

    bad = dict(msg["result"]["config"])
    bad["groups"][0]["id"] = "Bad Id"
    await client.send_json_auto_id({"type": "activity_levels/config/validate", "config": bad})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["ok"] is False
    assert msg["result"]["errors"][0]["path"] == "groups/0/id"

    good = validate_config(house_config())
    good["groups"][0]["children"][1]["name"] = "Pantry"
    await client.send_json_auto_id({"type": "activity_levels/config/save", "config": good})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["ok"] is True
    await hass.async_block_till_done()
    assert entry.options["groups"][0]["children"][1]["name"] == "Pantry"

    await client.send_json_auto_id({"type": "activity_levels/config/save", "config": bad})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["ok"] is False
    assert msg["result"]["errors"][0]["path"] == "groups/0/id"


async def test_config_save_rejects_engine_build_failure(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    entry: MockConfigEntry,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def boom(config: dict[str, object]) -> None:
        raise ValueError("boom")

    monkeypatch.setattr("custom_components.activity_levels.websocket_api.build_tree", boom)
    original_options = dict(entry.options)

    client = await hass_ws_client(hass)
    good = validate_config(house_config())
    good["groups"][0]["children"][1]["name"] = "Pantry"
    await client.send_json_auto_id({"type": "activity_levels/config/save", "config": good})
    msg = await client.receive_json()

    assert not msg["success"]
    assert msg["error"]["code"] == "invalid_config"
    assert entry.options == original_options


async def test_state_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/state"})
    msg = await client.receive_json()
    groups = msg["result"]["groups"]
    assert groups["living_room"]["value"] == 2.0 and groups["living_room"]["parent_id"] == "house"
    voices = msg["result"]["voices"]["living_room"]
    motion = next(v for v in voices if v["entity"] == "binary_sensor.living_motion")
    assert motion["phase"] == "sustain" and motion["gate"] is True

    assert "now" in msg["result"]
    lr = groups["living_room"]
    assert lr["precision"] == 1 and lr["max_value"] == 5.0 and lr["mix"] == "sum"
    assert lr["raw_value"] == pytest.approx(2.0)
    assert lr["next_wake"] is None
    assert groups["house"]["next_wake"] is not None

    # the hidden trigger voice is a real contributor, so it has to be listed too
    await hass.services.async_call(
        DOMAIN, "trigger", {"group_id": "kitchen", "peak": 3.0}, blocking=True
    )
    await client.send_json_auto_id({"type": "activity_levels/state"})
    msg = await client.receive_json()
    trigger = next(v for v in msg["result"]["voices"]["kitchen"] if v["label"] == "trigger")
    assert trigger["entity"] is None
    # real time passes between the service call and the read, and the release slope is
    # max_value / release, so allow the few milliseconds of fall that CI can see
    assert trigger["value"] == pytest.approx(3.0, abs=0.01)
    assert msg["result"]["groups"]["kitchen"]["value"] == pytest.approx(3.0, abs=0.01)


async def test_state_reads_the_clock_once(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    entry: MockConfigEntry,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """One frame, one timestamp: the countdowns are measured against the reported now."""
    coordinator = entry.runtime_data.coordinator
    base = coordinator.now()
    calls: list[None] = []

    def counting_now() -> float:
        calls.append(None)  # every read jumps, so a second one would show up in the frame
        return base + 100.0 * len(calls)

    monkeypatch.setattr(coordinator, "now", counting_now)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "activity_levels/state"})
    msg = await client.receive_json()

    assert len(calls) == 1
    assert msg["result"]["now"] == pytest.approx(base + 100.0)


async def test_diagnostics(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["config"]["groups"][0]["id"] == "house"
    assert "voices" in diag["snapshot"]
    assert "house" in diag["groups"]


async def test_mute_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    hass.states.async_set("binary_sensor.living_motion", "on")
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "activity_levels/mute", "group_id": "living_room", "muted": True}
    )
    msg = await client.receive_json()
    assert msg["success"] and msg["result"] == {"muted": True}

    await client.send_json_auto_id({"type": "activity_levels/state"})
    msg = await client.receive_json()
    groups = msg["result"]["groups"]
    assert groups["living_room"]["muted"] is True
    assert groups["house"]["muted"] is False
    assert groups["house"]["value"] == 0.0
    assert groups["living_room"]["value"] == pytest.approx(2.0)

    await client.send_json_auto_id(
        {"type": "activity_levels/mute", "group_id": "nope", "muted": True}
    )
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "not_found"


async def test_level_set_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "activity_levels/level/set", "group_id": "kitchen", "value": 3.5}
    )
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["value"] == pytest.approx(3.5)
    assert hass.states.get("sensor.kitchen_activity_level").state == "3.5"

    # the limiter has the last word, and the answer says where the level really landed
    await client.send_json_auto_id(
        {"type": "activity_levels/level/set", "group_id": "kitchen", "value": 99.0}
    )
    msg = await client.receive_json()
    assert msg["result"]["value"] == pytest.approx(5.0)

    await client.send_json_auto_id(
        {"type": "activity_levels/level/set", "group_id": "kitchen", "value": -1.0}
    )
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "invalid_format"

    await client.send_json_auto_id(
        {"type": "activity_levels/level/set", "group_id": "nope", "value": 1.0}
    )
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "not_found"


async def test_reset_command(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, entry: MockConfigEntry
) -> None:
    client = await hass_ws_client(hass)
    await hass.services.async_call(
        DOMAIN, "trigger", {"group_id": "kitchen", "peak": 3.0}, blocking=True
    )
    assert hass.states.get("sensor.kitchen_activity_level").state == "3.0"
    await client.send_json_auto_id({"type": "activity_levels/reset", "group_id": "kitchen"})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"] == {}
    assert hass.states.get("sensor.kitchen_activity_level").state == "0.0"

    await client.send_json_auto_id({"type": "activity_levels/reset", "group_id": "nope"})
    msg = await client.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "not_found"
