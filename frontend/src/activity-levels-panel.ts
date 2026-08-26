import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getConfig, getState, saveConfig, validateConfig } from "./api";
import { ensureHaElements } from "./ha-elements";
import { runSave } from "./save-flow";
import { Draft } from "./store";
import { sharedStyles } from "./styles";
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

  private liveTimer?: number;

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const { ok, missing } = await ensureHaElements();
    this.missing = ok ? [] : missing;
    await this.load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopLive();
  }

  private async load(): Promise<void> {
    try {
      const cfg = await getConfig(this.hass);
      this.draft = new Draft(cfg);
      this.errors = [];
      this.banner = null;
    } catch (err) {
      this.banner = { kind: "error", text: `Could not load configuration: ${(err as Error).message}` };
    }
  }

  private setConfig(next: Config): void {
    this.draft?.set(next);
    this.requestUpdate();
  }

  private async save(): Promise<void> {
    const draft = this.draft;
    if (!draft) return;
    this.busy = true;
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
    }
  }

  private discard(): void {
    if (!this.draft) return;
    this.draft.reset(this.draft.original);
    this.errors = [];
    this.banner = null;
    this.requestUpdate();
  }

  private undo(): void {
    this.draft?.undo();
    this.requestUpdate();
  }

  private redo(): void {
    this.draft?.redo();
    this.requestUpdate();
  }

  private toggleLive(on: boolean): void {
    this.liveOn = on;
    if (on) this.startLive();
    else this.stopLive();
  }

  private startLive(): void {
    this.stopLive();
    const tick = async (): Promise<void> => {
      try {
        this.live = await getState(this.hass);
      } catch {
        /* transient websocket failure: keep the last frame and retry */
      }
    };
    void tick();
    this.liveTimer = window.setInterval(() => void tick(), LIVE_POLL_MS);
  }

  private stopLive(): void {
    if (this.liveTimer !== undefined) {
      clearInterval(this.liveTimer);
      this.liveTimer = undefined;
    }
    this.live = null;
  }

  override render() {
    if (this.missing.length) return this.renderMissing();
    const d = this.draft;
    return html`
      <ha-top-app-bar-fixed>
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
          <ha-button .disabled=${!d?.dirty || this.busy} @click=${this.save}>${d?.dirty ? "Save" : "Saved"}</ha-button>
        </div>
        ${this.renderBanner()}
        <div class="tabs">
          ${TABS.map(
            (t) => html`<div
              class="tab ${this.tab === t ? "active" : ""}"
              role="tab"
              @click=${() => {
                this.tab = t;
              }}
            >
              ${t[0]!.toUpperCase() + t.slice(1)}
            </div>`,
          )}
        </div>
        ${d ? this.renderTab(d) : html`<p style="padding:16px">Loading…</p>`}
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
    const onChange = (e: CustomEvent<Config>) => this.setConfig(e.detail);
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
    const onChange = (e: CustomEvent<Config>) => this.setConfig(e.detail);
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
        ></al-group-editor>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "activity-levels-panel": ActivityLevelsPanel;
  }
}
