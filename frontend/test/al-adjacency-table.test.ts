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
