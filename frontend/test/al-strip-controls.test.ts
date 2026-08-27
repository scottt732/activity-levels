import { beforeEach, describe, expect, it } from "vitest";
import "../src/al-strip-controls";
import { newGroup, newStimulus } from "../src/model";
import { presenceConfig, roomsConfig } from "./fixtures";
import type { AlStripControls } from "../src/al-strip-controls";
import type { AlChangeEvent } from "../src/events";
import type {
  Config,
  GroupLive,
  HomeAssistant,
  LiveState,
  Path,
  ProfileState,
  SimulationLog,
  SimulationLogEntry,
} from "../src/types";

const defaults: Config["defaults"] = {
  envelope: "default",
  max_value: 5,
  precision: 1,
  unavailable: "hold",
  retrigger: "only_in_release",
  debounce: 0,
  safety_refresh: 60,
  min_wake_interval: 1,
};

const envelopes: Config["envelopes"] = [
  { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
  { id: "slow", attack: 30, decay: 0, sustain: 1, release: 3600, impulse: false, retrigger: null, unavailable: null, debounce: null },
];

const baseConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes,
  groups: [
    {
      ...newGroup("house"),
      name: "House",
      stimuli: [newStimulus("binary_sensor.front_door")],
      children: [{ ...newGroup("den"), name: "Den" }],
    },
  ],
});

const hassStub = (states: Record<string, { state: string; attributes?: Record<string, unknown> }>): HomeAssistant =>
  ({
    states: Object.fromEntries(
      Object.entries(states).map(([entity_id, s]) => [
        entity_id,
        { entity_id, state: s.state, attributes: s.attributes ?? {}, last_changed: "" },
      ]),
    ),
  }) as unknown as HomeAssistant;

const groupLive = (over: Partial<GroupLive> = {}): GroupLive => ({
  value: 0,
  real_value: 0,
  raw_value: 0,
  active: false,
  gated: false,
  active_voices: 0,
  last_activity: null,
  cooldown_at: null,
  contributors: {},
  name: "House",
  parent_id: null,
  precision: 1,
  max_value: 5,
  mix: "sum",
  next_wake: null,
  lights: 2,
  muted: false,
  ...over,
});

const liveWith = (lights: number): LiveState => ({
  now: 1000,
  groups: { house: groupLive({ lights }) },
  voices: {},
});

const entry = (t: number, over: Partial<SimulationLogEntry> = {}): SimulationLogEntry => ({
  t,
  group_id: "house",
  entity_id: `light.lamp_${t}`,
  on: true,
  brightness: null,
  ...over,
});

const simLogStub = (over: Partial<SimulationLog> = {}): SimulationLog => ({
  entries: [1, 2, 3, 4, 5, 6, 7].map((t) => entry(t)),
  active: { house: true },
  blocked: { house: null },
  ...over,
});

const profileStub = (over: { ready?: boolean; days?: number } = {}): ProfileState => ({
  profile: {
    version: 1,
    producer: { name: "activity_levels", version: "1" },
    generated_at: 0,
    training_window: [0, 0],
    day_types: ["weekday"],
    slot_minutes: 15,
    groups: { house: { ready: over.ready ?? false, days: over.days ?? 3, expected: {}, lights: {} } },
  },
  ready: { house: over.ready ?? false },
  trained: true,
});

let el: AlStripControls;
let changes: AlChangeEvent[];
let rebuilds: number;
let sims: { gid: string; on: boolean }[];

const form = (): HTMLElement & { data?: Record<string, unknown>; schema?: { name: string; selector?: unknown }[] } => {
  const node = el.shadowRoot?.querySelector("ha-form") as
    | (HTMLElement & { data?: Record<string, unknown>; schema?: { name: string; selector?: unknown }[] })
    | null;
  expect(node, "missing ha-form").toBeTruthy();
  return node!;
};

const edit = async (patch: Record<string, unknown>): Promise<void> => {
  form().dispatchEvent(
    new CustomEvent("value-changed", {
      detail: { value: { ...form().data, ...patch } },
      bubbles: true,
      composed: true,
    }),
  );
  await el.updateComplete;
};

const show = async (path: Path | null): Promise<void> => {
  el.path = path;
  await el.updateComplete;
};

const text = (sel: string): string => el.shadowRoot?.querySelector(sel)?.textContent?.trim() ?? "";

/** Mounts a fresh `al-strip-controls` against `cfg`, navigated straight to `path`. */
const fixture = async (cfg: Config, path: Path): Promise<AlStripControls> => {
  document.body.innerHTML = "";
  const node = document.createElement("al-strip-controls");
  node.hass = hassStub({});
  node.config = cfg;
  node.errors = [];
  node.path = path;
  document.body.appendChild(node);
  await node.updateComplete;
  return node;
};

/** Resolves with the next event of `type` the element dispatches. */
const listenFor = <T extends Event>(node: AlStripControls, type: string): Promise<T> =>
  new Promise((resolve) => node.addEventListener(type, (e) => resolve(e as T), { once: true }));

beforeEach(async () => {
  document.body.innerHTML = "";
  changes = [];
  rebuilds = 0;
  sims = [];
  el = document.createElement("al-strip-controls");
  el.hass = hassStub({});
  el.config = baseConfig();
  el.errors = [];
  el.path = null;
  el.addEventListener("al-change", (e) => {
    const ev = e as AlChangeEvent;
    changes.push(ev);
    el.config = ev.detail;
  });
  el.addEventListener("al-rebuild", () => rebuilds++);
  el.addEventListener("al-sim-toggle", (e) => sims.push((e as CustomEvent<{ gid: string; on: boolean }>).detail));
  document.body.appendChild(el);
  await el.updateComplete;
});

describe("al-strip-controls with nothing selected", () => {
  it("invites a selection rather than showing an empty form", () => {
    expect(el.shadowRoot?.querySelector("ha-form")).toBeNull();
    expect(el.shadowRoot?.textContent).toContain("Select a strip to tune it");
  });
});

describe("al-strip-controls: a channel", () => {
  beforeEach(async () => {
    await show(["groups", 0, "stimuli", 0]);
  });

  it("offers the envelope presets plus the inherited default", () => {
    const envelope = form().schema?.find((f) => f.name === "envelope");
    const options = (envelope?.selector as { select?: { options?: { value: string }[] } } | undefined)?.select?.options;
    expect(options?.map((o) => o.value)).toEqual(["", "default", "slow"]);
  });

  it("edits the tuning fields, leaving the entity to the Groups editor", () => {
    expect(form().schema?.map((f) => f.name)).toEqual(["envelope", "gain", "to", "key"]);
  });

  it("shows one override row per envelope parameter", () => {
    expect(el.shadowRoot?.querySelectorAll("al-override-field")).toHaveLength(8);
    expect(el.shadowRoot?.querySelector("al-envelope-sketch")).toBeTruthy();
  });

  it("writes a fader move back with a per-field coalesce key", async () => {
    await edit({ gain: 2.5 });
    expect(changes.at(-1)?.detail.groups[0]?.stimuli[0]?.gain).toBe(2.5);
    expect(changes.at(-1)?.coalesceKey).toBe("groups/0/stimuli/0:gain");
  });

  it("keeps a trailing separator on screen so a second state can be typed", async () => {
    await edit({ to: "on," });
    expect(changes).toHaveLength(0);
    expect(form().data?.to).toBe("on,");
    await edit({ to: "on, playing" });
    expect(form().data?.to).toBe("on, playing");
    expect(changes.at(-1)?.detail.groups[0]?.stimuli[0]?.to).toEqual(["on", "playing"]);
  });

  it("drops the raw text when the selection moves", async () => {
    await edit({ to: "on," });
    await show(["groups", 0]);
    await show(["groups", 0, "stimuli", 0]);
    expect(form().data?.to).toBe("on");
  });

  it("reports the voice's phase and how long is left of it", async () => {
    el.live = {
      now: 1000,
      groups: {},
      voices: {
        house: [
          {
            label: "binary_sensor.front_door",
            entity: "binary_sensor.front_door",
            phase: "release",
            value: 0.4,
            gain: 1,
            gate: false,
            phase_started: 900,
            phase_ends: 1060,
          },
        ],
      },
    };
    await el.updateComplete;
    expect(text(".live")).toContain("release");
    expect(text(".live")).toContain("ends in 1m");
  });
});

describe("al-strip-controls: a bus", () => {
  beforeEach(async () => {
    el.hass = hassStub({
      "switch.house_presence_simulation": { state: "on" },
      "sensor.house_expected_activity": { state: "1.8", attributes: { day_type: "weekday" } },
      "sensor.house_activity_anomaly": { state: "-0.4", attributes: { day_type: "weekday" } },
    });
    el.live = liveWith(2);
    el.simLog = simLogStub();
    el.profileState = profileStub();
    await show(["groups", 0]);
  });

  it("edits the bus fields, and offers no gain on a root bus", () => {
    expect(form().schema?.map((f) => f.name)).toEqual(["name", "mix"]);
  });

  it("offers gain into the parent on a sub-bus", async () => {
    await show(["groups", 0, "children", 0]);
    expect(form().schema?.map((f) => f.name)).toEqual(["name", "mix", "gain"]);
  });

  it("asks how idle contributors count only when the mix is a mean", async () => {
    await edit({ mix: "mean" });
    expect(changes.at(-1)?.detail.groups[0]?.mix).toBe("mean");
    expect(changes.at(-1)?.coalesceKey).toBe("groups/0:mix");
    expect(form().schema?.map((f) => f.name)).toContain("null_handling");
  });

  it("shows the expected level and the anomaly from their sensors", () => {
    expect(text(".expected")).toContain("1.8");
    expect(text(".expected")).toContain("weekday");
    expect(text(".anomaly")).toContain("-0.4");
  });

  it("rounds both levels to the group's precision rather than printing the raw state", async () => {
    el.hass = hassStub({
      "sensor.house_expected_activity": { state: "1.8342", attributes: { day_type: "weekday" } },
      "sensor.house_activity_anomaly": { state: "-0.4271" },
    });
    await el.updateComplete;
    expect(text(".expected")).toContain("1.8");
    expect(text(".expected")).not.toContain("1.83");
    expect(text(".anomaly")).toContain("-0.4");
    expect(text(".anomaly")).not.toContain("-0.42");
  });

  it("follows the live precision when the group asks for more decimals", async () => {
    el.hass = hassStub({ "sensor.house_expected_activity": { state: "1.8342" } });
    el.live = { now: 1000, groups: { house: groupLive({ precision: 2 }) }, voices: {} };
    await el.updateComplete;
    expect(text(".expected")).toContain("1.83");
  });

  it("falls back to the config's effective precision with no live state", async () => {
    const cfg = baseConfig();
    cfg.groups[0]!.precision = 3;
    el.config = cfg;
    el.live = null;
    el.hass = hassStub({ "sensor.house_expected_activity": { state: "1.8342" } });
    await el.updateComplete;
    expect(text(".expected")).toContain("1.834");
  });

  it("leaves a state that is not a number alone", async () => {
    el.hass = hassStub({ "sensor.house_expected_activity": { state: "unknown" } });
    await el.updateComplete;
    expect(text(".expected")).toContain("unknown");
    expect(text(".anomaly")).toContain("\u2014");
  });

  it("shows the simulation switch's own state, and asks the shell to flip it", () => {
    const sw = el.shadowRoot?.querySelector<HTMLElement & { checked?: boolean }>(".sim-switch");
    expect(sw?.checked).toBe(true);
    // `ha-switch` flips itself and then reports, the way a checkbox does.
    sw!.checked = false;
    sw?.dispatchEvent(new CustomEvent("change", { detail: {} }));
    expect(sims).toEqual([{ gid: "house", on: false }]);
  });

  it("hides the simulation switch for a bus with no lights to move", async () => {
    el.live = liveWith(0);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".sim-switch")).toBeNull();
    expect(text(".lights")).toContain("0 lights");
    expect(text(".lights")).toContain("manage in Groups");
  });

  it("explains why the simulation is being held back", async () => {
    el.simLog = simLogStub({ blocked: { house: "the group is not ready" } });
    await el.updateComplete;
    expect(text(".blocked")).toContain("the group is not ready");
  });

  it("lists the last five simulation actions, newest first", () => {
    const rows = [...(el.shadowRoot?.querySelectorAll(".log li .entity") ?? [])];
    expect(rows.map((r) => r.textContent)).toEqual([
      "light.lamp_7",
      "light.lamp_6",
      "light.lamp_5",
      "light.lamp_4",
      "light.lamp_3",
    ]);
  });

  it("leaves out another bus's simulation actions", async () => {
    el.simLog = simLogStub({ entries: [entry(1), entry(2, { group_id: "den", entity_id: "light.den" })] });
    await el.updateComplete;
    expect([...(el.shadowRoot?.querySelectorAll(".log li .entity") ?? [])].map((r) => r.textContent)).toEqual([
      "light.lamp_1",
    ]);
  });

  it("counts the days it still needs before the profile is usable", () => {
    expect(text(".readiness")).toContain("3/14");
  });

  it("honours a configured minimum training window", async () => {
    const config = baseConfig();
    config.defaults.patterns = { min_days: 7 };
    el.config = config;
    await el.updateComplete;
    expect(text(".readiness")).toContain("3/7");
  });

  it("asks the shell to rebuild the profile", () => {
    el.shadowRoot?.querySelector(".rebuild")?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    expect(rebuilds).toBe(1);
  });

  it("writes the limiter back as an override of the defaults", async () => {
    const limiter = el.shadowRoot?.querySelectorAll("al-override-field")[0];
    limiter?.dispatchEvent(new CustomEvent("value-changed", { detail: { value: 8 } }));
    await el.updateComplete;
    expect(changes.at(-1)?.detail.groups[0]?.max_value).toBe(8);
    expect(changes.at(-1)?.coalesceKey).toBe("groups/0:max_value");
  });
});

describe("al-strip-controls: a group's stimuli", () => {
  beforeEach(async () => {
    el.hass = hassStub({
      "binary_sensor.front_door": { state: "on", attributes: { friendly_name: "Front Door" } },
    });
    await show(["groups", 0]);
  });

  const panels = (): Element[] => [...(el.shadowRoot?.querySelectorAll("ha-expansion-panel") ?? [])];

  it("lists the group's stimuli, each in the Groups tab's own stimulus editor", () => {
    expect(text(".stimuli h3")).toBe("Stimuli");
    expect(panels()).toHaveLength(1);
    const editor = panels()[0]?.querySelector("al-stimulus-editor") as unknown as {
      path: Path;
      config: Config;
    };
    expect(editor.path).toEqual(["groups", 0, "stimuli", 0]);
    expect(editor.config).toBe(el.config);
  });

  it("heads each one with the entity's friendly name and its current state", () => {
    expect(text(".stimulus-head .name")).toBe("Front Door");
    expect(text(".stimulus-head .chip")).toBe("on");
  });

  it("prefers the stimulus key when it has one", async () => {
    const config = baseConfig();
    el.config = {
      ...config,
      groups: [{ ...config.groups[0]!, stimuli: [{ ...newStimulus("binary_sensor.front_door"), key: "door" }] }],
    };
    await el.updateComplete;
    expect(text(".stimulus-head .name")).toBe("door");
  });

  it("badges the problems inside one stimulus", async () => {
    el.errors = [{ path: "groups/0/stimuli/0/entity", message: "unknown entity" }];
    await el.updateComplete;
    expect(text(".stimulus-head .badge")).toBe("1");
  });

  it("says where to add one when the group has none", async () => {
    await show(["groups", 0, "children", 0]);
    expect(panels()).toHaveLength(0);
    expect(text(".stimuli .muted")).toContain("in Groups");
  });

  it("has no stimuli section on a channel: a channel is one", async () => {
    await show(["groups", 0, "stimuli", 0]);
    expect(el.shadowRoot?.querySelector(".stimuli")).toBeNull();
  });
});

describe("al-strip-controls: presence stimulus", () => {
  const config = presenceConfig();

  it("lists presence as the first stimulus of a room", async () => {
    const el = await fixture(config, ["groups", 0, "children", 0, "children", 0]);
    const heads = [...el.shadowRoot!.querySelectorAll(".stimulus-head .name")].map((n) => n.textContent!.trim());
    expect(heads[0]).toBe("Presence (anyone here)");
  });

  it("edits the presence gain against the group's presence block", async () => {
    const el = await fixture(config, ["groups", 0, "children", 0, "children", 0]);
    const changed = listenFor<AlChangeEvent>(el, "al-change");
    el.shadowRoot!.querySelector<HTMLElement>(".presence-gain")!
      .dispatchEvent(new CustomEvent("value-changed", { detail: { value: 3 } }));
    const next = (await changed).detail;
    expect(next.groups[0]?.children[0]?.children[0]?.presence.gain).toBe(3);
  });

  it("does not list presence for a branch, or when presence is off", async () => {
    const branch = await fixture(config, ["groups", 0, "children", 0]);
    expect(branch.shadowRoot!.textContent).not.toContain("Presence (anyone here)");
    const off = await fixture(roomsConfig(), ["groups", 0, "children", 0, "children", 0]);
    expect(off.shadowRoot!.textContent).not.toContain("Presence (anyone here)");
  });
});
