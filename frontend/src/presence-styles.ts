import { css } from "lit";

/** Native controls share theme colors and geometry across the presence tools. */
export const presenceStyles = css`
  :host {
    --al-control-border: color-mix(in srgb, var(--primary-text-color) 55%, var(--card-background-color));
  }
  button, select, .resource-links a {
    box-sizing: border-box;
    min-height: 36px;
    padding: 8px 12px;
    border: 1px solid var(--al-control-border);
    border-radius: 4px;
    background: var(--card-background-color, var(--primary-background-color));
    color: var(--primary-text-color);
    font: inherit;
    line-height: 1.3;
  }
  button, .resource-links a { cursor: pointer; }
  button:hover, .resource-links a:hover {
    background: var(--secondary-background-color);
    border-color: var(--primary-color);
  }
  button:focus-visible, select:focus-visible, a:focus-visible, summary:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  button:disabled, select:disabled { opacity: 0.6; cursor: default; }
  button[aria-expanded="true"], button[aria-pressed="true"] {
    border-color: var(--primary-color);
    box-shadow: inset 3px 0 var(--primary-color);
    background: var(--secondary-background-color);
  }
  a { color: var(--primary-text-color); text-underline-offset: 3px; }
  a:hover { color: var(--primary-color); }
  .resource-links, .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .resource-links a { display: inline-flex; align-items: center; text-decoration: none; }
  .resource-links a::after { content: "↗"; margin-left: 6px; }
  .page > * { min-width: 0; }
  .table-scroll { overflow-x: auto; }
  h2 { margin: 0 0 16px; font-size: 1.25em; font-weight: 500; }
`;
