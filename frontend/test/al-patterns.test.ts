import { describe, expect, it } from "vitest";
import "../src/al-patterns";
import { newGroup } from "../src/model";
import type { AlPatterns } from "../src/al-patterns";
import type { Config, HomeAssistant, ProfileState, SimulationLog, SimulationLogEntry } from "../src/types";

const defaults: Config["defaults"] = {
  envelope: "default",
  max_value: 5,
  precision: 1,
  unavailable: "hold",
  retrigger: "release",
  stack: false,
  debounce: 0,
  safety_refresh: 60,
  min_wake_interval: 1,
  patterns: { min_days: 14 },
};

const config = (): Config => ({
  version: 1,
  defaults,
  envelopes: [],
  groups: [{ ...newGroup("house", "structure"), name: "House", children: [{ ...newGroup("kitchen", "area"), name: "Kitchen" }] }],
});

const profileState = (over: Partial<ProfileState> = {}): ProfileState => ({
  trained: true,
  ready: { house: true, kitchen: false },
  profile: {
    version: 1,
    producer: { name: "activity_levels", version: "0.4.0" },
    generated_at: 1_700_000_000,
    training_window: [1_699_000_000, 1_700_000_000],
    day_types: ["weekday", "weekend"],
    slot_minutes: 15,
    groups: {
      house: { ready: true, days: 21, expected: {}, lights: {} },
      kitchen: { ready: false, days: 3, expected: {}, lights: {} },
    },
  },
  ...over,
});

const hassStub = (states: Record<string, string> = {}): HomeAssistant =>
  ({
    states: Object.fromEntries(
      Object.entries(states).map(([entity_id, state]) => [entity_id, { entity_id, state, attributes: {}, last_changed: "" }]),
    ),
  }) as unknown as HomeAssistant;

const entry = (t: number, group_id: string, entity_id: string, on: boolean): SimulationLogEntry => ({
  t,
  group_id,
  entity_id,
  on,
  brightness: null,
});

interface Props {
  hass?: HomeAssistant;
  config?: Config;
  profileState?: ProfileState | null;
  simLog?: SimulationLog | null;
}

const mount = async (props: Props = {}): Promise<AlPatterns> => {
  document.body.innerHTML = "";
  const el = document.createElement("al-patterns") as AlPatterns;
  el.hass = props.hass ?? hassStub();
  el.config = props.config ?? config();
  el.profileState = props.profileState ?? null;
  el.simLog = props.simLog ?? null;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

const rows = (el: AlPatterns): HTMLElement[] =>
  Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>("table.readiness tbody tr") ?? []);

const norm = (s: string): string => s.replace(/\s+/g, " ").trim();

const text = (el: AlPatterns, selector: string): string => norm(el.shadowRoot?.querySelector(selector)?.textContent ?? "");

describe("al-patterns readiness", () => {
  it("lists every group in the tree with its readiness, days and expected value", async () => {
    const el = await mount({
      profileState: profileState(),
      hass: hassStub({ "sensor.house_expected_activity": "1.4", "sensor.kitchen_expected_activity": "0.2" }),
    });
    const cells = rows(el).map((r) => Array.from(r.querySelectorAll("td")).map((c) => c.textContent?.trim()));
    expect(cells).toEqual([
      ["House", "✓", "21", "1.4"],
      ["Kitchen", "✗", "3", "0.2"],
    ]);
  });

  it("falls back to the group id and an em dash when there is no name or sensor", async () => {
    const cfg = config();
    cfg.groups[0]!.name = null;
    const el = await mount({ config: cfg, profileState: profileState() });
    expect(rows(el)[0]?.querySelector("td")?.textContent?.trim()).toBe("house");
    expect(rows(el)[0]?.querySelectorAll("td")[3]?.textContent?.trim()).toBe("—");
  });

  it("rounds the expected level to each group's precision", async () => {
    const cfg = config();
    cfg.groups[0]!.children[0]!.precision = 3;
    const el = await mount({
      config: cfg,
      profileState: profileState(),
      hass: hassStub({
        "sensor.house_expected_activity": "1.4372",
        "sensor.kitchen_expected_activity": "0.2418",
      }),
    });
    const expected = rows(el).map((r) => r.querySelectorAll("td")[3]?.textContent?.trim());
    expect(expected).toEqual(["1.4", "0.242"]);
  });

  it("leaves an expected state that is not a number alone", async () => {
    const el = await mount({
      profileState: profileState(),
      hass: hassStub({ "sensor.house_expected_activity": "unavailable" }),
    });
    expect(rows(el)[0]?.querySelectorAll("td")[3]?.textContent?.trim()).toBe("unavailable");
  });

  it("says so when the profile has not loaded yet", async () => {
    const el = await mount();
    expect(rows(el)).toHaveLength(0);
    expect(text(el, ".status")).toContain("not loaded");
  });
});

describe("al-patterns profile status", () => {
  it("names the producer, when it was generated and the window it learned from", async () => {
    const el = await mount({ profileState: profileState() });
    const status = text(el, ".status");
    expect(status).toContain("activity_levels 0.4.0");
    expect(status).toContain(norm(new Date(1_700_000_000 * 1000).toLocaleString()));
    expect(status).toContain(new Date(1_699_000_000 * 1000).toLocaleDateString());
  });

  it("calls an untrained profile untrained", async () => {
    const el = await mount({ profileState: profileState({ trained: false }) });
    expect(text(el, ".trained")).toContain("Not trained");
  });
});

describe("al-patterns rebuild", () => {
  const click = (el: AlPatterns): void => {
    el.shadowRoot?.querySelector("ha-button.rebuild")?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
  };

  it("asks the shell to rebuild, unforced by default", async () => {
    const el = await mount({ profileState: profileState() });
    const seen: { force: boolean }[] = [];
    el.addEventListener("al-rebuild", (ev) => seen.push((ev as CustomEvent<{ force: boolean }>).detail));
    click(el);
    expect(seen).toEqual([{ force: false }]);
  });

  it("forces the rebuild once the force switch is on", async () => {
    const el = await mount({ profileState: profileState() });
    const seen: { force: boolean }[] = [];
    el.addEventListener("al-rebuild", (ev) => seen.push((ev as CustomEvent<{ force: boolean }>).detail));
    const force = el.shadowRoot?.querySelector("ha-switch.force") as (HTMLElement & { checked?: boolean }) | null;
    expect(force, "missing force switch").toBeTruthy();
    if (force) force.checked = true;
    force?.dispatchEvent(new Event("change"));
    await el.updateComplete;
    click(el);
    expect(seen).toEqual([{ force: true }]);
  });
});

describe("al-patterns simulation log", () => {
  it("shows the newest entries first, capped, and why a group is blocked", async () => {
    const entries = Array.from({ length: 60 }, (_, i) => entry(1000 + i, "house", `light.l${i}`, i % 2 === 0));
    const el = await mount({
      profileState: profileState(),
      simLog: { entries, active: { house: true }, blocked: { house: null, kitchen: "no lights" } },
    });
    const items = Array.from(el.shadowRoot?.querySelectorAll("ol.log li") ?? []);
    expect(items).toHaveLength(50);
    expect(items[0]?.textContent).toContain("light.l59");
    const blocked = Array.from(el.shadowRoot?.querySelectorAll(".blocked li") ?? []).map((b) =>
      b.textContent?.replace(/\s+/g, " ").trim(),
    );
    expect(blocked).toEqual(["Kitchen: no lights"]);
  });

  it("says when nothing has been simulated yet", async () => {
    const el = await mount({ profileState: profileState(), simLog: { entries: [], active: {}, blocked: {} } });
    expect(text(el, ".log-empty")).toContain("No simulated light changes yet");
  });
});
