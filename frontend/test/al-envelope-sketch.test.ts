import { describe, expect, it } from "vitest";
import "../src/al-envelope-sketch";
import type { AlEnvelopeSketch } from "../src/al-envelope-sketch";
import type { SketchEnvelope } from "../src/sketch";

const mount = async (envelope: SketchEnvelope | null): Promise<AlEnvelopeSketch> => {
  document.body.innerHTML = "";
  const el = document.createElement("al-envelope-sketch");
  el.envelope = envelope;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

describe("al-envelope-sketch", () => {
  it("draws the curve, its fill and a dashed sustain gridline", async () => {
    const el = await mount({ attack: 10, decay: 10, sustain: 0.5, release: 20, impulse: false });
    const svg = el.shadowRoot?.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 200 80");
    expect(svg?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    const polyline = el.shadowRoot?.querySelector("polyline");
    expect(polyline?.getAttribute("points")?.split(" ")).toHaveLength(5);
    expect(el.shadowRoot?.querySelector("polygon")).toBeTruthy();
    expect(el.shadowRoot?.querySelectorAll("line.grid")).toHaveLength(2);
  });

  it("captions each non-zero segment", async () => {
    const el = await mount({ attack: 10, decay: 0, sustain: 0.5, release: 1800, impulse: false });
    const captions = [...(el.shadowRoot?.querySelectorAll("text.caption") ?? [])].map((t) => t.textContent);
    expect(captions).toEqual(["A 10s", "S 0.5", "R 30m"]);
  });

  it("drops the sustain gridline for an impulse", async () => {
    const el = await mount({ attack: 0, decay: 0, sustain: 1, release: 60, impulse: true });
    expect(el.shadowRoot?.querySelectorAll("line.grid")).toHaveLength(1);
    const captions = [...(el.shadowRoot?.querySelectorAll("text.caption") ?? [])].map((t) => t.textContent);
    expect(captions).toEqual(["impulse", "R 1m"]);
  });

  it("renders nothing without an envelope", async () => {
    const el = await mount(null);
    expect(el.shadowRoot?.querySelector("svg")).toBeNull();
  });
});
