import { LitElement, css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatDuration } from "./duration";
import { pathKey, subtreeErrorCount } from "./errors";
import { alChange, alSelect } from "./events";
import { KIND_DEFS, allowedChildKinds } from "./kinds";
import { newGroup, newStimulus, parentGroupPath, uniqueGroupId } from "./model";
import { getAt, insertAt, legalDrop, moveNode, removeAt } from "./store";
import { sharedStyles } from "./styles";
import { flattenRows, loadExpanded, saveExpanded } from "./tree-rows";
import type { Kind } from "./kinds";
import type { DropVerdict } from "./store";
import type { Row } from "./tree-rows";
import type {
  Config,
  Group,
  GroupLive,
  HomeAssistant,
  LiveState,
  Path,
  ValidationError,
  VoiceLive,
} from "./types";

const stop = (ev: Event): void => ev.stopPropagation();

/** Keeps Enter/Space on an inner control from also reaching the row that contains it. */
const stopSelectKeys = (ev: KeyboardEvent): void => {
  if (ev.key === "Enter" || ev.key === " ") ev.stopPropagation();
};

/** Where a dragged node would land relative to the row under the pointer. */
type Where = "before" | "after" | "into";

interface DropTarget {
  key: string; // the row's path key, so one row at a time wears the indicator
  where: Where;
  verdict: DropVerdict;
}

const STIMULUS_ICON = "mdi:flash";
const DRAG_TYPE = "text/plain";

/**
 * The row height the thirds are measured against when the browser has not laid the row
 * out yet — an unattached tree, or a test with no layout engine. It matches the
 * `min-height` the stylesheet gives a row, so a real drag never uses it.
 */
const ROW_HEIGHT = 36;

/** Group/stimulus tree: one flat row per node, with drag-and-drop and Alt+arrow moves. */
@customElement("al-tree")
export class AlTree extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .tree {
        display: flex;
        flex-direction: column;
      }
      .footer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .badge {
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.75em;
        line-height: 1.6;
      }
      .chip {
        white-space: nowrap;
      }
      ha-icon-button {
        --ha-icon-button-size: 32px;
        --mdc-icon-size: 18px;
      }
      .blurb {
        margin: 0 0 12px;
      }
      .add-menu .muted {
        font-size: 0.8em;
        white-space: normal;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) selection: Path | null = null;
  @property({ attribute: false }) errors: ValidationError[] = [];
  @property({ attribute: false }) live: LiveState | null = null;

  @state() private expanded: Set<string> = loadExpanded();
  @state() private dragging: string | null = null;
  @state() private target: DropTarget | null = null;
  /** The row whose add-group menu is open, if any. One at a time. */
  @state() private menu: string | null = null;

  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  private emitChange(next: Config): void {
    this.dispatchEvent(alChange(next, undefined, true));
  }

  private emitSelect(path: Path | null): void {
    this.dispatchEvent(alSelect(path));
  }

  private isSelected(path: Path): boolean {
    return this.selection !== null && pathKey(this.selection) === pathKey(path);
  }

  private select(ev: Event, path: Path): void {
    ev.stopPropagation();
    this.menu = null;
    this.emitSelect(path);
  }

  private toggle(path: Path): void {
    const key = pathKey(path);
    const next = new Set(this.expanded);
    if (!next.delete(key)) next.add(key);
    this.expanded = next;
    saveExpanded(next);
  }

  /** Opens a group so a node just added inside it is visible rather than hidden. */
  private open(path: Path): void {
    if (path.length === 0) return;
    const next = new Set(this.expanded).add(pathKey(path));
    this.expanded = next;
    saveExpanded(next);
  }

  /** The list a node lives in, and the slot after it: the two arguments a move needs. */
  private listOf(path: Path): { list: Path; index: number } {
    return { list: path.slice(0, -1), index: path[path.length - 1] as number };
  }

  private addGroup(listPath: Path, index: number, kind: Kind): void {
    const config = this.config;
    if (!config) return;
    this.menu = null;
    this.open(listPath.slice(0, -1));
    this.emitChange(insertAt(config, listPath, index, newGroup(uniqueGroupId(config, kind), kind)));
    this.emitSelect([...listPath, index]);
  }

  private addStimulus(groupPath: Path, index: number): void {
    const config = this.config;
    if (!config) return;
    this.menu = null;
    this.open(groupPath);
    const listPath = [...groupPath, "stimuli"];
    this.emitChange(insertAt(config, listPath, index, newStimulus("")));
    this.emitSelect([...listPath, index]);
  }

  private removeNode(path: Path, label: string): void {
    const config = this.config;
    if (!config) return;
    if (!window.confirm(`Delete ${label}? This cannot be undone after saving.`)) return;
    this.emitChange(removeAt(config, path));
    const parent = parentGroupPath(path);
    this.emitSelect(parent.length ? parent : null);
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
    const height = box.height || ROW_HEIGHT;
    const third = height / 3;
    const y = ev.clientY - box.top;
    if (y < third) return "before";
    if (y > height - third) return "after";
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
      } else if (ev.key === "Escape" && this.menu !== null) {
        this.menu = null;
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
        if (typeof parentIndex === "number") moved = this.tryMove(row.path, parentList, parentIndex + 1);
        break;
      }
      default:
        return;
    }
    ev.preventDefault();
    if (moved) ev.stopPropagation();
  }

  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  private countdown(at: number | null): string | null {
    const now = this.live?.now;
    if (at === null || now === undefined) return null;
    return formatDuration(Math.max(0, Math.round((at - now) * 1000) / 1000));
  }

  /** Tooltip for a voice's phase chip: what it is doing, and how long that lasts. */
  private voiceTitle(voice: VoiceLive): string {
    const ends = this.countdown(voice.phase_ends);
    return ends === null ? `Phase: ${voice.phase}` : `Phase: ${voice.phase}, ends in ${ends}`;
  }

  /** Tooltip for a group's meter: the displayed value, the unrounded mix, and the next wake. */
  private meterTitle(live: GroupLive, max: number, isRoot: boolean): string {
    const parts = [`${live.value} of ${max}`, `raw ${live.raw_value.toFixed(3)}`];
    const wake = isRoot ? this.countdown(live.next_wake) : null;
    if (wake !== null) parts.push(`next wake in ${wake}`);
    return parts.join(" · ");
  }

  /** What the row is called: the group's own name, or the entity's friendly name. */
  private labelFor(row: Row): string {
    if (row.kind === "stimulus") {
      const stimulus = row.stimulus;
      const entity = stimulus === undefined ? undefined : this.hass?.states[stimulus.entity];
      return (entity?.attributes.friendly_name as string | undefined) ?? (stimulus?.entity || "(no entity)");
    }
    return row.group?.name || row.group?.id || "(unnamed group)";
  }

  override render() {
    const config = this.config;
    if (!config) return html`<ha-card><span class="muted">Loading…</span></ha-card>`;
    if (config.groups.length === 0) return this.renderEmpty();
    return html`
      <ha-card>
        <div class="tree" role="tree">
          ${flattenRows(config, this.expanded).map((row) => this.renderRow(config, row))}
        </div>
        <div class="footer">
          <ha-button @click=${() => this.addGroup(["groups"], config.groups.length, "property")}>
            Add property
          </ha-button>
        </div>
      </ha-card>
    `;
  }

  private renderEmpty(): TemplateResult {
    return html`
      <ha-card>
        <p class="muted blurb">
          Nothing is configured yet. Everything starts with a property — the whole lot, inside and out —
          and inside it go the structures, floors, rooms and outdoor areas that make up your home.
        </p>
        <div class="footer">
          <ha-button @click=${() => this.addGroup(["groups"], 0, "property")}>Add your first property</ha-button>
        </div>
      </ha-card>
    `;
  }

  private renderRow(config: Config, row: Row): TemplateResult {
    if (row.kind === "placeholder")
      return html`<div class="tree-row placeholder" role="none" style="--al-indent: ${row.depth}">
        <span class="guides"></span>
        Nothing in here yet — add a stimulus or a group with the buttons on the row above.
      </div>`;
    const key = pathKey(row.path);
    const target = this.target?.key === key ? this.target : null;
    const selected = this.isSelected(row.path);
    const classes = [
      "row",
      "tree-row",
      selected ? "selected" : "",
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
      aria-level=${row.depth + 1}
      aria-selected=${selected ? "true" : "false"}
      aria-expanded=${row.expandable ? (row.expanded ? "true" : "false") : nothing}
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
            title=${row.expanded ? "Collapse" : "Expand"}
            @keydown=${stopSelectKeys}
            @click=${(ev: Event) => {
              ev.stopPropagation();
              this.toggle(row.path);
            }}
          >
            <ha-icon icon=${row.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </ha-icon-button>`
        : html`<span class="caret"></span>`}
      <ha-icon
        icon=${row.kind === "group" && row.group ? KIND_DEFS[row.group.kind].icon : STIMULUS_ICON}
      ></ha-icon>
      <button
        type="button"
        class="label"
        title=${row.kind === "stimulus" ? (row.stimulus?.entity ?? "") : "Edit this group"}
        @keydown=${stopSelectKeys}
        @click=${(ev: Event) => this.select(ev, row.path)}
      >
        ${this.labelFor(row)}
      </button>
      ${target !== null && !target.verdict.ok
        ? html`<span class="hint">${target.verdict.reason}</span>`
        : this.renderRowStatus(config, row)}
      ${this.renderActions(row)} ${this.menu === key ? this.renderAddMenu(row) : nothing}
    </div>`;
  }

  /** The live and validation read-out a row carries: a badge, and whatever the frame knows. */
  private renderRowStatus(config: Config, row: Row): TemplateResult {
    const count = subtreeErrorCount(this.errors, row.path);
    const badge = count
      ? html`<span class="badge" title="${count} problem(s) in this group">${count}</span>`
      : nothing;
    if (row.kind === "stimulus") {
      const stimulus = row.stimulus;
      const entity = stimulus === undefined ? undefined : this.hass?.states[stimulus.entity];
      const group = getAt<Group>(config, parentGroupPath(row.path));
      const voice =
        group === undefined
          ? undefined
          : this.live?.voices[group.id]?.find((v) => v.label === (stimulus?.key ?? stimulus?.entity));
      return html`${badge}${entity ? html`<span class="muted chip">${entity.state}</span>` : nothing}
      ${voice
        ? html`<span class="chip phase ${voice.phase}" title=${this.voiceTitle(voice)}>${voice.phase}</span>
            <span class="muted chip">${voice.value.toFixed(2)}</span>`
        : nothing}`;
    }
    const group = row.group;
    const live = group === undefined ? undefined : this.live?.groups[group.id];
    const max = live?.max_value ?? group?.max_value ?? config.defaults.max_value;
    const pct = live ? Math.max(0, Math.min(100, (live.value / (max || 1)) * 100)) : 0;
    return html`${badge}
    ${live
      ? html`<div class="meter" title=${this.meterTitle(live, max, row.depth === 0)}>
            <div style="width: ${pct}%"></div>
          </div>
          <span class="dot ${live.gated ? "gated" : ""}" title=${live.gated ? "Gate open" : "Gate closed"}></span>`
      : nothing}`;
  }

  private renderActions(row: Row): TemplateResult {
    const path = row.path;
    if (row.kind === "stimulus")
      return html`<div class="actions" @click=${stop} @keydown=${stopSelectKeys}>
        <ha-icon-button
          label="Delete stimulus"
          title="Delete stimulus"
          data-action="delete"
          @click=${() => this.removeNode(path, `stimulus "${this.labelFor(row)}"`)}
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </ha-icon-button>
      </div>`;
    const group = row.group;
    if (group === undefined) return html`<div class="actions"></div>`;
    return html`<div class="actions" @click=${stop} @keydown=${stopSelectKeys}>
      <ha-icon-button
        label="Add stimulus"
        title="Add stimulus"
        data-action="add-stimulus"
        @click=${() => this.addStimulus(path, group.stimuli.length)}
      >
        <ha-icon icon="mdi:flash-outline"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        label="Add group"
        title="Add group"
        data-action="add-group"
        aria-haspopup="menu"
        aria-expanded=${this.menu === pathKey(path) ? "true" : "false"}
        .disabled=${allowedChildKinds(group.kind).length === 0}
        @click=${() => {
          this.menu = this.menu === pathKey(path) ? null : pathKey(path);
        }}
      >
        <ha-icon icon="mdi:folder-plus"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        label="Delete group"
        title="Delete group"
        data-action="delete"
        @click=${() => this.removeNode(path, `group "${group.name || group.id}" and everything in it`)}
      >
        <ha-icon icon="mdi:delete"></ha-icon>
      </ha-icon-button>
    </div>`;
  }

  /** The kinds this parent may contain, each with its own definition under the label. */
  private renderAddMenu(row: Row): TemplateResult {
    const group = row.group;
    if (group === undefined) return html`${nothing}`;
    return html`<div class="add-menu" role="menu" @click=${stop} @keydown=${stopSelectKeys}>
      ${allowedChildKinds(group.kind).map(
        (kind) => html`<button
          type="button"
          role="menuitem"
          data-kind=${kind}
          @click=${() => this.addGroup([...row.path, "children"], group.children.length, kind)}
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
}

declare global {
  interface HTMLElementTagNameMap {
    "al-tree": AlTree;
  }
}
