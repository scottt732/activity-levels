import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { validateConfig } from "./api";
import { alChange, alCodeStatus } from "./events";
import { sharedStyles } from "./styles";
import { locate } from "./yaml-locate";
import type { PropertyValues, TemplateResult } from "lit";
import type { Config, HomeAssistant, ValidationError } from "./types";

/**
 * How long typing has to pause before an edit reaches the draft and the backend. Long
 * enough that a word typed mid-token does not produce a document, short enough that the
 * problem list feels attached to what is on screen.
 */
export const DEBOUNCE_MS = 400;

/** What we use of Home Assistant's YAML editor, and of the CodeMirror view underneath it. */
interface CodeMirrorView {
  state: { doc: { lines: number; line: (n: number) => { from: number } } };
  dispatch: (spec: unknown) => void;
  focus: () => void;
}
interface HaYamlEditor extends HTMLElement {
  setValue?: (value: unknown) => void;
  readonly yaml?: string;
  readonly codemirror?: CodeMirrorView;
}

/** `value-changed` from `ha-yaml-editor`: the parse, whether it worked, and why not. */
interface YamlChange {
  value: unknown;
  isValid: boolean;
  errorMsg?: string;
}

/**
 * The Code tab: the whole configuration as one YAML document.
 *
 * Not a separate copy of anything. It seeds Home Assistant's own `ha-yaml-editor` from the
 * draft, and every edit that parses goes back into the draft as an ordinary `al-change` —
 * so Undo, Redo, Discard and Save keep working, and the other tabs show what was typed
 * here the moment you switch to them. The shell renders this element only while the tab is
 * open, which is also why the editor never fights the draft: it is created from the current
 * document each time it is shown, and nothing re-seeds it while somebody is typing.
 *
 * The one case that does re-seed is the draft moving underneath us — Undo, Redo and
 * Discard are in the app bar and reachable from here. {@link mine} is how it tells its own
 * edit coming back around from somebody else's.
 */
@customElement("al-code")
export class AlCode extends LitElement {
  static styles = [
    sharedStyles,
    css`
      ha-yaml-editor {
        display: block;
        margin-bottom: 12px;
      }
      ul.errors {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      ul.errors li {
        border-top: 1px solid var(--divider-color);
      }
      button.jump {
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        font: inherit;
        color: inherit;
        padding: 8px 4px;
        cursor: pointer;
        border-radius: 4px;
      }
      button.jump:hover,
      button.jump:focus-visible {
        background: var(--secondary-background-color);
      }
      button.jump .path {
        font-family: var(--ha-font-family-code, monospace);
        color: var(--error-color, #db4437);
      }
      .count {
        margin: 0 0 4px;
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: Config;
  /** The shared, path-keyed problem list. The shell owns it; this tab both feeds and shows it. */
  @property({ attribute: false }) errors: ValidationError[] = [];
  /** False when `ha-yaml-editor` never registered; the tab then explains itself instead. */
  @property({ type: Boolean }) available = true;

  /** The parser's complaint, while the text is not YAML at all. */
  @state() private parseError: string | null = null;

  /** The last document this tab produced, so its own edit coming back is not a re-seed. */
  private mine?: Config;
  private timer?: number;
  /** Which validation is the current one; an older answer resolving late is dropped. */
  private seq = 0;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.timer);
  }

  protected override firstUpdated(): void {
    this.seed();
    // Open on the truth rather than on whatever the last tab left behind.
    void this.validate(this.config);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("config") && this.config !== this.mine) this.seed();
  }

  private get editor(): HaYamlEditor | null {
    return this.renderRoot.querySelector<HaYamlEditor>("ha-yaml-editor");
  }

  /** Writes the draft into the editor as YAML. Home Assistant's dumper does the formatting. */
  private seed(): void {
    this.mine = this.config;
    this.editor?.setValue?.(this.config ?? {});
  }

  private onYaml = (ev: CustomEvent<YamlChange>): void => {
    ev.stopPropagation();
    window.clearTimeout(this.timer);
    const detail = ev.detail;
    this.timer = window.setTimeout(() => void this.settle(detail), DEBOUNCE_MS);
  };

  /**
   * One edit, once typing has stopped. Unparseable text produces no document at all, so
   * the draft is left where it was and only the verdict changes — which is what keeps a
   * half-typed key from wiping the configuration the other tabs are showing.
   */
  private async settle(detail: YamlChange): Promise<void> {
    if (!detail.isValid) {
      this.parseError = detail.errorMsg ?? "This is not valid YAML.";
      this.dispatchEvent(alCodeStatus(false, []));
      return;
    }
    this.parseError = null;
    const config = detail.value as Config;
    this.mine = config;
    // Coalesced, so a burst of typing is one undo step rather than one per pause.
    this.dispatchEvent(alChange(config, "code"));
    await this.validate(config);
  }

  private async validate(config: Config | undefined): Promise<void> {
    const hass = this.hass;
    if (!hass || !config) return;
    const seq = ++this.seq;
    try {
      const { errors } = await validateConfig(hass, config);
      if (seq === this.seq) this.dispatchEvent(alCodeStatus(true, errors));
    } catch {
      // A transient websocket failure is not a verdict: keep the last one rather than
      // inventing a problem, or clearing one that is really there. Save asks again.
    }
  }

  /** Puts the cursor on the line `path` names, when the text is one this can walk. */
  private jump(path: string): void {
    const editor = this.editor;
    const view = editor?.codemirror;
    const text = editor?.yaml;
    if (!view || typeof text !== "string") return;
    const line = locate(text, path);
    if (line === null || line > view.state.doc.lines) return;
    const at = view.state.doc.line(line).from;
    view.dispatch({ selection: { anchor: at, head: at }, scrollIntoView: true });
    view.focus();
  }

  private renderProblems(): TemplateResult {
    if (this.parseError !== null)
      return html`<ha-alert class="parse-error" alert-type="error">${this.parseError}</ha-alert>`;
    if (this.errors.length === 0)
      return html`<p class="muted no-problems">No problems. Save applies this document.</p>`;
    return html`
      <p class="count muted">
        ${this.errors.length} ${this.errors.length === 1 ? "problem" : "problems"} — Save is
        disabled until they are fixed.
      </p>
      <ul class="errors">
        ${this.errors.map(
          (e) => html`<li>
            <button type="button" class="jump" @click=${() => this.jump(e.path)}>
              <span class="path">${e.path === "" ? "(document)" : e.path}</span> —
              <span class="message">${e.message}</span>
            </button>
          </li>`,
        )}
      </ul>
    `;
  }

  private renderUnavailable(): TemplateResult {
    return html`<ha-card header="Code">
      <ha-alert class="editor-missing" alert-type="warning">
        Home Assistant's YAML editor did not load, so this tab cannot open. Visit
        <em>Settings → Devices &amp; services</em> once and reload the page; the other tabs edit the
        same configuration in the meantime.
      </ha-alert>
    </ha-card>`;
  }

  override render() {
    if (!this.available) return html`<div class="page">${this.renderUnavailable()}</div>`;
    return html`
      <div class="page">
        <ha-card header="Configuration">
          <ha-yaml-editor @value-changed=${this.onYaml}></ha-yaml-editor>
          ${this.config === undefined ? nothing : this.renderProblems()}
        </ha-card>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "al-code": AlCode;
  }
}
