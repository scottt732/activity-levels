import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getConfig, getState, saveConfig, validateConfig } from "./api";
import { ensureHaElements } from "./ha-elements";
import { runSave } from "./save-flow";
import { Draft, getAt } from "./store";
import { sharedStyles } from "./styles";
import type { AlChangeEvent } from "./events";
import type { Banner } from "./save-flow";
import type { Config, HomeAssistant, LiveState, Path, ValidationError } from "./types";

type Tab = "groups" | "envelopes" | "defaults";

const TABS: Tab[] = ["groups", "envelopes", "defaults"];
const LIVE_POLL_MS = 2000;
const RELOAD_GRACE_MS = 1500;

@customElement("activity-levels-panel")
export class ActivityLevelsPanel extends LitElement {
  static styles = [sharedStyles];

  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) narrow = false;

  @state() private draft?: Draft;
  @state() private tab: Tab = "groups";
  @state() private selection: Path | null = null;
  @state() private errors: ValidationError[] = [];
  @state() private banner: Banner | null = null;
  @state() private live: LiveState | null = null;
  @state() private liveOn = false;
  @state() private busy = false;
  @state() private missing: string[] = [];

  /** Which tab the roving tabindex sits on; arrow keys move it without activating. */
  @state() private tabFocus = 0;

  private liveTimer?: number;

  private readonly onVisibilityChange = (): void => this.updateLivePolling();

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    const { ok, missing } = await ensureHaElements();
    this.missing = ok ? [] : missing;
    await this.load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.stopLive();
  }

  /** Non-admins can look, but every write command is rejected by the backend. */
  private get readOnly(): boolean {
    return this.hass?.user?.is_admin === false;
  }

  private async load(): Promise<void> {
    try {
      const cfg = await getConfig(this.hass);
      this.draft = new Draft(cfg);
      this.syncSelection();
      this.errors = [];
      this.banner = null;
    } catch (err) {
      this.banner = { kind: "error", text: `Could not load configuration: ${(err as Error).message}` };
    }
  }

  private setConfig(next: Config, coalesceKey?: string): void {
    this.draft?.set(next, coalesceKey);
    this.syncSelection();
    this.requestUpdate();
  }

  /** Drops a selection whose node is gone, so the editor pane never renders a dangling path. */
  private syncSelection(): void {
    const config = this.draft?.config;
    if (!config || !this.selection) return;
    if (getAt(config, this.selection) === undefined) this.selection = null;
  }

  private async save(): Promise<void> {
    const draft = this.draft;
    if (!draft) return;
    this.busy = true;
    this.updateLivePolling();
    try {
      const outcome = await runSave(draft.config, {
        validate: (config) => validateConfig(this.hass, config),
        save: (config) => saveConfig(this.hass, config),
      });
      if (outcome.errors !== null) this.errors = outcome.errors;
      this.banner = outcome.banner;
      if (outcome.reload) {
        await new Promise<void>((resolve) => setTimeout(resolve, RELOAD_GRACE_MS));
        await this.load();
      }
    } finally {
      this.busy = false;
      this.updateLivePolling();
    }
  }

  private discard(): void {
    if (!this.draft) return;
    this.draft.reset(this.draft.original);
    this.syncSelection();
    this.errors = [];
    this.banner = null;
    this.requestUpdate();
  }

  private undo(): void {
    this.draft?.undo();
    this.syncSelection();
    this.requestUpdate();
  }

  private redo(): void {
    this.draft?.redo();
    this.syncSelection();
    this.requestUpdate();
  }

  private toggleLive(on: boolean): void {
    if (on) this.startLive();
    else this.stopLive();
  }

  private startLive(): void {
    this.liveOn = true;
    this.updateLivePolling();
  }

  private stopLive(): void {
    this.liveOn = false;
    this.clearLiveTimer();
    this.live = null;
  }

  /**
   * Starts or pauses the poll to match the current conditions. It runs only while the
   * toggle is on, no save is in flight - a reload is about to replace the config the
   * frame describes - and the tab is actually on screen. Pausing keeps the last frame,
   * so resuming redraws immediately rather than blanking the meters.
   */
  private updateLivePolling(): void {
    const shouldPoll = this.liveOn && !this.busy && document.visibilityState === "visible";
    if (!shouldPoll) {
      this.clearLiveTimer();
      return;
    }
    if (this.liveTimer !== undefined) return;
    void this.pollLive();
    this.liveTimer = window.setInterval(() => void this.pollLive(), LIVE_POLL_MS);
  }

  private async pollLive(): Promise<void> {
    try {
      this.live = await getState(this.hass);
    } catch {
      /* transient websocket failure: keep the last frame and retry */
    }
  }

  private clearLiveTimer(): void {
    if (this.liveTimer === undefined) return;
    clearInterval(this.liveTimer);
    this.liveTimer = undefined;
  }

  private selectTab(index: number): void {
    const next = TABS[index];
    if (next === undefined) return;
    this.tab = next;
    this.tabFocus = index;
  }

  /** Moves the roving tabindex, and the focus with it, without changing the shown tab. */
  private focusTab(index: number): void {
    this.tabFocus = index;
    void this.updateComplete.then(() => {
      this.renderRoot.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
    });
  }

  /** Manual-activation tablist: arrows (and Home/End) move, Enter/Space activate. */
  private onTabsKeydown = (ev: KeyboardEvent): void => {
    const last = TABS.length - 1;
    switch (ev.key) {
      case "ArrowRight":
        this.focusTab((this.tabFocus + 1) % TABS.length);
        break;
      case "ArrowLeft":
        this.focusTab((this.tabFocus + last) % TABS.length);
        break;
      case "Home":
        this.focusTab(0);
        break;
      case "End":
        this.focusTab(last);
        break;
      case "Enter":
      case " ":
        this.selectTab(this.tabFocus);
        break;
      default:
        return;
    }
    ev.preventDefault();
  };

  override render() {
    if (this.missing.length) return this.renderMissing();
    const d = this.draft;
    return html`
      <ha-top-app-bar-fixed .narrow=${this.narrow}>
        <ha-menu-button slot="navigationIcon"></ha-menu-button>
        <div slot="title">Activity Levels</div>
        <div slot="actionItems" class="row">
          <span class="muted">Live</span>
          <ha-switch
            .checked=${this.liveOn}
            @change=${(e: Event) => this.toggleLive((e.target as HTMLInputElement).checked)}
          ></ha-switch>
          <ha-icon-button .disabled=${!d?.canUndo} @click=${this.undo} title="Undo">
            <ha-icon icon="mdi:undo"></ha-icon>
          </ha-icon-button>
          <ha-icon-button .disabled=${!d?.canRedo} @click=${this.redo} title="Redo">
            <ha-icon icon="mdi:redo"></ha-icon>
          </ha-icon-button>
          <ha-button appearance="plain" .disabled=${!d?.dirty || this.busy} @click=${this.discard}>Discard</ha-button>
          <ha-button .disabled=${!d?.dirty || this.busy || this.readOnly} @click=${this.save}
            >${d?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()} ${this.renderReadOnly()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${TABS.map(
            (t, i) => html`<button
              type="button"
              id="tab-${t}"
              class="tab ${this.tab === t ? "active" : ""}"
              role="tab"
              aria-selected=${this.tab === t ? "true" : "false"}
              aria-controls="tabpanel"
              tabindex=${i === this.tabFocus ? 0 : -1}
              @click=${() => this.selectTab(i)}
            >
              ${t[0]!.toUpperCase() + t.slice(1)}
            </button>`,
          )}
        </div>
        <div id="tabpanel" role="tabpanel" aria-labelledby="tab-${this.tab}">
          ${d ? this.renderTab(d) : html`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
  }

  private renderMissing() {
    return html`
      <div style="padding:16px">
        <p>
          <strong>Activity Levels</strong>: some Home Assistant UI components did not load
          (${this.missing.join(", ")}). Open <em>Settings → Devices &amp; services</em> once, then return here and
          reload the page.
        </p>
      </div>
    `;
  }

  private renderReadOnly() {
    if (!this.readOnly) return nothing;
    return html`<ha-alert alert-type="info"
      >You are signed in as a non-administrator, so this panel is read-only: saving is rejected by Home
      Assistant. Ask an administrator to make configuration changes.</ha-alert
    >`;
  }

  private renderBanner() {
    const banner = this.banner;
    if (!banner) return nothing;
    return html`<ha-alert
      alert-type=${banner.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
        this.banner = null;
      }}
      >${banner.text}</ha-alert
    >`;
  }

  private renderTab(d: Draft) {
    const onChange = (e: AlChangeEvent) => this.setConfig(e.detail, e.coalesceKey);
    switch (this.tab) {
      case "groups":
        return html`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree
            .hass=${this.hass}
            .config=${d.config}
            .selection=${this.selection}
            .errors=${this.errors}
            .live=${this.live}
            @al-select=${(e: CustomEvent<Path>) => {
              this.selection = e.detail;
            }}
            @al-change=${onChange}
          ></al-tree>
          <div>${this.renderEditor(d)}</div>
        </div>`;
      case "envelopes":
        return html`<al-envelopes
          .hass=${this.hass}
          .config=${d.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${onChange}
        ></al-envelopes>`;
      case "defaults":
        return html`<al-defaults
          .hass=${this.hass}
          .config=${d.config}
          .errors=${this.errors}
          @al-change=${onChange}
        ></al-defaults>`;
    }
  }

  private renderEditor(d: Draft) {
    const selection = this.selection;
    if (!selection) return html`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
    const onChange = (e: AlChangeEvent) => this.setConfig(e.detail, e.coalesceKey);
    const isStimulus = selection[selection.length - 2] === "stimuli";
    return isStimulus
      ? html`<al-stimulus-editor
          .hass=${this.hass}
          .config=${d.config}
          .path=${selection}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${onChange}
        ></al-stimulus-editor>`
      : html`<al-group-editor
          .hass=${this.hass}
          .config=${d.config}
          .path=${selection}
          .errors=${this.errors}
          @al-change=${onChange}
          @al-select=${(e: CustomEvent<Path | null>) => {
            this.selection = e.detail;
          }}
        ></al-group-editor>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "activity-levels-panel": ActivityLevelsPanel;
  }
}
