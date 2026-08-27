import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { alMapSelect } from "./events";
import { sharedStyles } from "./styles";
import { NODE_H, NODE_W, edgeBetween, edgePoint, layout, pathEdges } from "./topology";
import type { SVGTemplateResult } from "lit";
import type { MapEdge, MapLayout, MapNode } from "./topology";
import type { Config, HomeAssistant, PresenceState, TopologyPayload } from "./types";

/** Half a node, so a node can be drawn centred on the point the layout gave it. */
const HALF_W = NODE_W / 2;
const HALF_H = NODE_H / 2;
/** How many occupants a node names before the rest become "+n". */
const NAMES_SHOWN = 2;
/** Radius of the badge that counts a room's occupants, and of a person in transit. */
const BADGE_R = 9;
const PERSON_R = 7;

/** One decimal is plenty at this scale and keeps the markup readable. */
const n1 = (n: number): string => String(Math.round(n * 10) / 10);

/**
 * The room graph as a picture: rooms as boxes on the rows `topology.ts` laid them out on,
 * doors as lines between them, an arrowhead where a door only opens one way, and whoever
 * the estimator thinks is where drawn on top.
 *
 * Purely presentational. Selecting a node asks the host for the routes between the pair it
 * is keeping; the host hands back `paths`, and the edges along them light up.
 */
@customElement("al-graph-map")
export class AlGraphMap extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        background: none;
        overflow-x: auto;
      }
      svg {
        min-width: 100%;
        height: auto;
      }
      .edge {
        stroke: var(--divider-color);
        stroke-width: 2;
      }
      .edge.on-path {
        stroke: var(--primary-color);
        stroke-width: 3;
      }
      .arrow {
        fill: currentColor;
        color: var(--divider-color);
      }
      .node {
        cursor: pointer;
        color: var(--divider-color);
      }
      .node .box {
        fill: var(--card-background-color, transparent);
        stroke: currentColor;
        stroke-width: 2;
      }
      .node.selected {
        color: var(--primary-color);
      }
      .node:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .label {
        fill: var(--primary-text-color);
        font-size: 12px;
        font-weight: 500;
      }
      .names {
        fill: var(--secondary-text-color);
        font-size: 10px;
      }
      .badge {
        fill: var(--primary-color);
      }
      .count {
        fill: var(--text-primary-color, #fff);
        font-size: 10px;
        font-weight: 600;
      }
      .door {
        fill: none;
        stroke: var(--secondary-text-color);
        stroke-width: 1.5;
      }
      .person {
        fill: var(--primary-color);
        stroke: var(--card-background-color, #fff);
        stroke-width: 2;
      }
      .empty {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        padding: 8px 0;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) topology: TopologyPayload | null = null;
  @property({ attribute: false }) presence: PresenceState | null = null;
  /** The pair of rooms the host is routing between; either half may still be empty. */
  @property({ attribute: false }) selected: [string | null, string | null] = [null, null];
  @property({ attribute: false }) paths: string[][] = [];

  private occupantsOf(id: string): string[] {
    return this.presence?.occupants[id] ?? [];
  }

  private select(id: string): void {
    this.dispatchEvent(alMapSelect(id));
  }

  private onKeydown(ev: KeyboardEvent, id: string): void {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    ev.preventDefault();
    this.select(id);
  }

  /**
   * Where each moving person is drawn: half way along the door between their two most
   * likely rooms. A person "between" two rooms with no door is a wrong reading rather
   * than a place, so they are left off the map instead of being put somewhere untrue.
   */
  private movers(map: MapLayout): { name: string; x: number; y: number }[] {
    const out: { name: string; x: number; y: number }[] = [];
    const devices = Object.entries(this.presence?.devices ?? {}).sort(([a], [b]) => a.localeCompare(b));
    for (const [name, outputs] of devices) {
      if (!outputs.moving) continue;
      const ranked = Object.entries(outputs.candidates).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const top = ranked[0]?.[0];
      const second = ranked[1]?.[0];
      if (top === undefined || second === undefined) continue;
      const edge = edgeBetween(map, top, second);
      if (!edge) continue;
      out.push({ name, ...edgePoint(edge, 0.5) });
    }
    return out;
  }

  /**
   * What the whole picture says, for somebody who cannot see it. It labels a `group`, not
   * an `img`: `role="img"` prunes the tree below it, which would take the focusable room
   * buttons with it.
   */
  private summary(map: MapLayout): string {
    const rooms = `${map.nodes.length} room${map.nodes.length === 1 ? "" : "s"}`;
    const doors = `${map.edges.length} door${map.edges.length === 1 ? "" : "s"}`;
    const occupied = map.nodes
      .filter((n) => this.occupantsOf(n.id).length > 0)
      .map((n) => `${n.label}: ${this.occupantsOf(n.id).join(", ")}`);
    const who = occupied.length === 0 ? "Nobody is in a room right now." : `${occupied.join("; ")}.`;
    return `Room map, ${rooms} and ${doors}. ${who}`;
  }

  private renderEdge(edge: MapEdge, onPath: ReadonlySet<MapEdge>): SVGTemplateResult {
    const highlighted = onPath.has(edge);
    return svg`<line
      class="edge ${highlighted ? "on-path" : ""}"
      data-one-way=${edge.oneWay}
      x1=${n1(edge.x1)}
      y1=${n1(edge.y1)}
      x2=${n1(edge.x2)}
      y2=${n1(edge.y2)}
      marker-end=${edge.oneWay ? "url(#al-arrow)" : nothing}
    ></line>`;
  }

  private renderNode(node: MapNode): SVGTemplateResult {
    const names = this.occupantsOf(node.id);
    const shown = names.slice(0, NAMES_SHOWN);
    const extra = names.length - shown.length;
    const selected = this.selected.includes(node.id);
    const caption = [...shown, ...(extra > 0 ? [`+${extra}`] : [])].join(", ");
    const label = [
      node.label,
      node.exit ? "an exit" : "",
      names.length > 0 ? `${names.length} here: ${names.join(", ")}` : "empty",
    ]
      .filter((part) => part !== "")
      .join(", ");
    return svg`<g
      class="node ${selected ? "selected" : ""}"
      data-id=${node.id}
      role="button"
      tabindex="0"
      aria-pressed=${selected ? "true" : "false"}
      aria-label=${label}
      @click=${() => this.select(node.id)}
      @keydown=${(ev: KeyboardEvent) => this.onKeydown(ev, node.id)}
    >
      <rect
        class="box"
        x=${n1(node.x - HALF_W)}
        y=${n1(node.y - HALF_H)}
        width=${NODE_W}
        height=${NODE_H}
        rx="8"
      ></rect>
      <text class="label" x=${n1(node.x)} y=${n1(node.y - 4)} text-anchor="middle">${node.label}</text>
      ${caption === ""
        ? nothing
        : svg`<text class="names" x=${n1(node.x)} y=${n1(node.y + 13)} text-anchor="middle">${caption}</text>`}
      ${names.length === 0 ? nothing : this.renderBadge(node, names.length)}
      ${node.exit ? this.renderDoor(node) : nothing}
    </g>`;
  }

  private renderBadge(node: MapNode, count: number): SVGTemplateResult {
    const cx = node.x + HALF_W - BADGE_R - 3;
    const cy = node.y - HALF_H + BADGE_R + 3;
    return svg`<circle class="badge" cx=${n1(cx)} cy=${n1(cy)} r=${BADGE_R}></circle>
      <text class="count" x=${n1(cx)} y=${n1(cy + 3.5)} text-anchor="middle">${count}</text>`;
  }

  /** A door leaf in the corner: this room is a way out of the house. */
  private renderDoor(node: MapNode): SVGTemplateResult {
    const x = node.x - HALF_W + 7;
    const y = node.y + HALF_H - 7;
    return svg`<path class="door" d=${`M ${n1(x)} ${n1(y)} v -14 h 10 v 14 z`}></path>`;
  }

  private renderPerson(person: { name: string; x: number; y: number }): SVGTemplateResult {
    return svg`<circle class="person" data-name=${person.name} cx=${n1(person.x)} cy=${n1(person.y)} r=${PERSON_R}>
      <title>${person.name} is on the move</title>
    </circle>`;
  }

  override render() {
    const config = this.config;
    const topology = this.topology;
    if (!config || !topology || topology.nodes.length === 0)
      return html`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
    const map = layout(config, topology);
    const onPath = new Set<MapEdge>(this.paths.flatMap((p) => pathEdges(map, p)));
    const summary = this.summary(map);
    return html`
      <svg
        viewBox="0 0 ${map.width} ${map.height}"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label=${summary}
      >
        <title>${summary}</title>
        <defs>
          <marker
            id="al-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path class="arrow" d="M 0 0 L 10 5 L 0 10 z"></path>
          </marker>
        </defs>
        ${map.edges.map((edge) => this.renderEdge(edge, onPath))}
        ${map.nodes.map((node) => this.renderNode(node))}
        ${this.movers(map).map((person) => this.renderPerson(person))}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-graph-map": AlGraphMap;
  }
}
