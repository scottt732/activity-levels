import { html, nothing } from "lit";
import { loadPanelOpen, savePanelOpen } from "./panel-state";
import type { TemplateResult } from "lit";

/**
 * One editor panel: a header carrying the section's name over the one line that says what
 * it is for, an optional badge, and a collapse state remembered per browser. Both editors
 * draw their sections with this, so a panel opens, reads and remembers the same way
 * whichever of them you are looking at.
 *
 * `scope` namespaces the stored state ("group", "stimulus"), so the Identity panel of a
 * group and a like-named panel of a stimulus do not share one remembered state.
 */
export function renderPanel(
  scope: string,
  id: string,
  header: string,
  definition: string,
  fallback: boolean,
  body: unknown,
  badge: unknown = nothing,
): TemplateResult {
  const key = `${scope}:${id}`;
  return html`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${id}
    ?expanded=${loadPanelOpen(key, fallback)}
    @expanded-changed=${(ev: CustomEvent<{ expanded: boolean }>) => {
      savePanelOpen(key, ev.detail.expanded);
    }}
  >
    <div slot="header" class="panel-header">
      <span>${header} ${badge}</span>
      <div class="muted">${definition}</div>
    </div>
    <div class="panel-body">${body}</div>
  </ha-expansion-panel>`;
}
