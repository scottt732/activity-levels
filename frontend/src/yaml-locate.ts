/**
 * Finding the line a validation error is talking about.
 *
 * The backend addresses problems by path — `groups/0/children/1/stimuli/0/entity` — and
 * the Code tab shows the same document as text, so clicking an error should put the
 * cursor on the line that caused it. Nothing in the round trip carries source positions:
 * the editor parses YAML into a plain object and the object is what gets validated, so by
 * the time there is a path there is no text left to attach it to.
 *
 * This walks the text instead, which is enough for block-style YAML — the shape the
 * editor's own dumper writes and the shape people hand-write. It is deliberately
 * best-effort: a path that runs into flow style (`{id: hall, connection: stairs}`), an
 * anchor or anything else this does not read stops at the deepest line it did reach,
 * because landing near the problem beats not moving at all.
 */

/** One meaningful line: blanks and comments never make it into the list. */
interface Row {
  /** Column the line's *content* starts at — for `- id: x`, where `id` is. */
  indent: number;
  /** Column the `-` is in, for a sequence item; -1 otherwise. */
  dash: number;
  /** The line without its indent and without its `- `. */
  text: string;
  /** 1-based, for the caller. */
  line: number;
}

const KEY = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/;

/** Where a row sits in its parent's block: a sequence item is at its dash. */
const level = (row: Row): number => (row.dash >= 0 ? row.dash : row.indent);

/** The key a line declares, or null when it declares none (a scalar sequence item). */
function keyOf(text: string): string | null {
  const match = KEY.exec(text);
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? null;
}

function scan(text: string): Row[] {
  const rows: Row[] = [];
  text.split("\n").forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");
    const body = line.trimStart();
    if (body === "" || body.startsWith("#")) return;
    const indent = line.length - body.length;
    const bullet = /^-(?:\s+|$)/.exec(body);
    if (bullet) rows.push({ indent: indent + bullet[0].length, dash: indent, text: body.slice(bullet[0].length), line: i + 1 });
    else rows.push({ indent, dash: -1, text: body, line: i + 1 });
  });
  return rows;
}

/**
 * Where the block opened at `start` ends: the first row that has come back out to
 * `boundary` or shallower. A key's boundary is its own column; a sequence item's is its
 * dash, so the next `- ` closes it.
 */
function blockEnd(rows: Row[], start: number, to: number, boundary: number): number {
  for (let i = start + 1; i < to; i++) if (level(rows[i]!) <= boundary) return i;
  return to;
}

/** The row in `[from, to)` declaring `name` at the block's own indent, or -1. */
function mapKey(rows: Row[], from: number, to: number, name: string): number {
  if (from >= to) return -1;
  const column = rows[from]!.indent;
  for (let i = from; i < to; i++) {
    const row = rows[i]!;
    if (row.indent === column && keyOf(row.text) === name) return i;
  }
  return -1;
}

/** The row starting sequence item `index` in `[from, to)`, or -1 — inline lists have none. */
function seqItem(rows: Row[], from: number, to: number, index: number): number {
  if (from >= to || rows[from]!.dash < 0) return -1;
  const column = rows[from]!.dash;
  let seen = -1;
  for (let i = from; i < to; i++) {
    const row = rows[i]!;
    if (row.dash !== column) continue;
    if (++seen === index) return i;
  }
  return -1;
}

/**
 * The 1-based line `path` names in `text`, the deepest line reached when only part of the
 * path can be followed, or null when even the first step misses.
 */
export function locate(text: string, path: string): number | null {
  const steps = path.split("/").filter((step) => step !== "");
  if (steps.length === 0) return null;
  const rows = scan(text);
  let from = 0;
  let to = rows.length;
  let found: number | null = null;
  for (const step of steps) {
    const index = /^\d+$/.test(step)
      ? seqItem(rows, from, to, Number(step))
      : mapKey(rows, from, to, step);
    if (index < 0) return found;
    const row = rows[index]!;
    found = row.line;
    to = blockEnd(rows, index, to, level(row));
    // A sequence item carries its first key on its own line, so it stays in the window; a
    // mapping key's children all start below it.
    from = row.dash >= 0 ? index : index + 1;
  }
  return found;
}
