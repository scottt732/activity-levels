import { describe, expect, it } from "vitest";
import "../src/al-graph-map";
import { roomsConfig } from "./fixtures";
import { COL_W, PAD } from "../src/topology";
import type { AlGraphMap } from "../src/al-graph-map";
import type { HomeAssistant, PresenceState, TopologyPayload } from "../src/types";

const TOPO: TopologyPayload = {
  nodes: ["kitchen", "dining_room", "hall", "bedroom", "back_patio"],
  edges: [
    ["kitchen", "dining_room", false],
    ["kitchen", "back_patio", false],
    ["dining_room", "hall", false],
    ["hall", "bedroom", true],
  ],
  exits: ["back_patio"],
};

const hassStub = (): HomeAssistant => ({ states: {} }) as unknown as HomeAssistant;

const presenceState = (over: Partial<PresenceState> = {}): PresenceState => ({
  enabled: true,
  devices: {},
  occupants: {},
  scanners: [],
  unmapped: [],
  disabled: [],
  ...over,
});

const map = async (
  presence: Partial<PresenceState> = {},
  topology: TopologyPayload = TOPO,
): Promise<AlGraphMap> => {
  document.body.innerHTML = "";
  const el = document.createElement("al-graph-map") as AlGraphMap;
  el.hass = hassStub();
  el.config = roomsConfig();
  el.topology = topology;
  el.presence = presenceState(presence);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

const listenFor = <T extends Event>(node: HTMLElement, type: string): Promise<T> =>
  new Promise<T>((resolve) => node.addEventListener(type, (ev) => resolve(ev as T), { once: true }));

describe("al-graph-map", () => {
  it("draws a node per room and a line per edge", async () => {
    const el = await map();
    expect(el.shadowRoot!.querySelectorAll("g.node")).toHaveLength(5);
    expect(el.shadowRoot!.querySelectorAll("line.edge")).toHaveLength(4);
    expect(el.shadowRoot!.querySelector('line.edge[data-one-way="true"]')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('g.node[data-id="back_patio"] .door')).toBeTruthy();
  });

  it("shows who is in each room and how many", async () => {
    const el = await map({ occupants: { kitchen: ["Scott", "Erin"] } });
    const node = el.shadowRoot!.querySelector('g.node[data-id="kitchen"]')!;
    expect(node.querySelector(".count")!.textContent).toBe("2");
    expect(node.textContent).toContain("Scott");
  });

  it("draws a moving person on the edge between their top two candidates", async () => {
    const el = await map({
      devices: {
        Scott: {
          t: 1,
          room: "kitchen",
          confidence: 0.5,
          moving: true,
          candidates: { kitchen: 0.5, dining_room: 0.4 },
          path: [],
        },
      },
      occupants: {},
    });
    const person = el.shadowRoot!.querySelector('circle.person[data-name="Scott"]')!;
    expect(Number(person.getAttribute("cx"))).toBeCloseTo(PAD + COL_W / 2);
  });

  it("leaves a person off the map when there is no door between their candidates", async () => {
    const el = await map({
      devices: {
        Scott: {
          t: 1,
          room: "kitchen",
          confidence: 0.5,
          moving: true,
          candidates: { kitchen: 0.5, bedroom: 0.4 },
          path: [],
        },
      },
    });
    expect(el.shadowRoot!.querySelector("circle.person")).toBeNull();
  });

  it("emits al-map-select and highlights the given paths", async () => {
    const el = await map();
    const seen = listenFor<CustomEvent<{ id: string }>>(el, "al-map-select");
    el.shadowRoot!.querySelector<SVGElement>('g.node[data-id="hall"]')!.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    expect((await seen).detail.id).toBe("hall");

    el.paths = [["kitchen", "dining_room", "hall"]];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll("line.edge.on-path")).toHaveLength(2);
  });

  it("selects a node from the keyboard and marks it pressed", async () => {
    const el = await map();
    const seen = listenFor<CustomEvent<{ id: string }>>(el, "al-map-select");
    el.shadowRoot!.querySelector<SVGElement>('g.node[data-id="hall"]')!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect((await seen).detail.id).toBe("hall");

    el.selected = ["hall", null];
    await el.updateComplete;
    const node = el.shadowRoot!.querySelector('g.node[data-id="hall"]')!;
    expect(node.getAttribute("aria-pressed")).toBe("true");
    expect(node.getAttribute("tabindex")).toBe("0");
  });

  it("says so when there is no graph yet", async () => {
    const el = await map({}, { nodes: [], edges: [], exits: [] });
    expect(el.shadowRoot!.textContent).toContain("No rooms are connected yet");
  });
});
