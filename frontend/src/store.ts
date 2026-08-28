import { allowedChildKinds, isDescendantPath } from "./kinds";
import type { Kind } from "./kinds";
import type { Config, Group, Path, Stimulus } from "./types";

type Node = Record<string | number, unknown>;

/** Reads `path` out of `obj`, or `undefined` if any step along the way is missing. */
export function getAt<T = unknown>(obj: unknown, path: Path): T | undefined {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur == null) return undefined;
    cur = (cur as Node)[key];
  }
  return cur as T | undefined;
}

function clone(node: unknown): Node {
  return Array.isArray(node) ? ([...node] as unknown as Node) : { ...(node as Node) };
}

function update<T>(obj: T, path: Path, fn: (parent: Node, key: string | number) => void): T {
  if (path.length === 0) throw new Error("empty path");
  const root = clone(obj);
  let cur = root;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    const next = clone(cur[key]);
    cur[key] = next;
    cur = next;
  }
  fn(cur, path[path.length - 1]!);
  return root as unknown as T;
}

export function setAt<T>(obj: T, path: Path, value: unknown): T {
  return update(obj, path, (parent, key) => {
    parent[key] = value;
  });
}

export function removeAt<T>(obj: T, path: Path): T {
  return update(obj, path, (parent, key) => {
    if (Array.isArray(parent)) (parent as unknown as unknown[]).splice(key as number, 1);
    else delete parent[key];
  });
}

export function insertAt<T>(obj: T, listPath: Path, index: number, value: unknown): T {
  return update(obj, [...listPath, index], (parent) => {
    (parent as unknown as unknown[]).splice(index, 0, value);
  });
}

export function moveAt<T>(obj: T, listPath: Path, from: number, to: number): T {
  return update(obj, [...listPath, from], (parent) => {
    const list = parent as unknown as unknown[];
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
  });
}

/** Consecutive `set` calls sharing a coalesce key merge into one undo step inside this window. */
const COALESCE_MS = 1000;

export class Draft {
  original: Config;
  config: Config;
  private past: Config[] = [];
  private future: Config[] = [];
  private coalesceKey: string | null = null;
  private coalesceAt = 0;

  constructor(original: Config) {
    this.original = original;
    this.config = original;
  }

  get dirty(): boolean {
    return this.config !== this.original && JSON.stringify(this.config) !== JSON.stringify(this.original);
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /**
   * Records a new config. Passing the same `coalesceKey` again within
   * {@link COALESCE_MS} keeps those edits in one undo step, so typing in a field
   * does not fill the history with a step per keystroke.
   */
  set(next: Config, coalesceKey?: string): void {
    const now = Date.now();
    const merge =
      coalesceKey !== undefined && coalesceKey === this.coalesceKey && now - this.coalesceAt < COALESCE_MS;
    if (!merge) this.past.push(this.config);
    this.future = [];
    this.config = next;
    this.coalesceKey = coalesceKey ?? null;
    this.coalesceAt = now;
  }

  undo(): void {
    this.coalesceKey = null;
    const prev = this.past.pop();
    if (prev) {
      this.future.push(this.config);
      this.config = prev;
    }
  }

  redo(): void {
    this.coalesceKey = null;
    const next = this.future.pop();
    if (next) {
      this.past.push(this.config);
      this.config = next;
    }
  }

  reset(original: Config): void {
    this.original = original;
    this.config = original;
    this.past = [];
    this.future = [];
    this.coalesceKey = null;
  }
}

/** Why a drop is refused, or that it is not. The reason is what the row shows as a hint. */
export type DropVerdict = { ok: true } | { ok: false; reason: string };

const NO = (reason: string): DropVerdict => ({ ok: false, reason });

/** The list a path's node lives in, and its slot in it. */
const listOf = (path: Path): { list: Path; index: number } => ({
  list: path.slice(0, -1),
  index: path[path.length - 1] as number,
});

const isStimulusList = (list: Path): boolean => list[list.length - 1] === "stimuli";

/**
 * Whether `from` may be dropped into `toParent` at `index`.
 *
 * `toParent` is the destination *list* — `["groups"]`, `[…,"children"]` or `[…,"stimuli"]` —
 * and `index` is a slot in that list as it reads now, before anything moves. Every rule the
 * backend would reject on Save is checked here instead, so an illegal drag is refused with
 * a sentence rather than accepted and then failed by the server.
 */
export function legalDrop(config: Config, from: Path, toParent: Path, index: number): DropVerdict {
  const node = getAt<Group | Stimulus>(config, from);
  if (node === undefined) return NO("that node is gone");
  const target = getAt<unknown[]>(config, toParent);
  if (!Array.isArray(target)) return NO("there is nothing to drop into there");
  if (index < 0 || index > target.length) return NO("that is not a slot in this list");

  const movingStimulus = isStimulusList(listOf(from).list);
  if (movingStimulus !== isStimulusList(toParent))
    return movingStimulus
      ? NO("a stimulus belongs to a group, not beside one")
      : NO("that is not a stimulus");
  if (movingStimulus) return { ok: true };

  const group = node as Group;
  if (isDescendantPath(from, toParent) || pathsEqual(from, toParent.slice(0, -1)))
    return NO("a group cannot go into itself");
  const parentPath = toParent.slice(0, -1);
  let parentKind: Kind | null;
  if (toParent.length === 1) {
    parentKind = null;
  } else {
    const parent = getAt<Group>(config, parentPath);
    if (parent === undefined) return NO("that group is gone");
    parentKind = parent.kind;
  }
  const allowed = allowedChildKinds(parentKind);
  if (!allowed.includes(group.kind))
    return NO(
      parentKind === null
        ? "every root group is a property"
        : `a ${parentKind} cannot contain a ${group.kind}`,
    );
  return { ok: true };
}

const pathsEqual = (a: Path, b: Path): boolean =>
  a.length === b.length && a.every((step, i) => b[i] === step);

/**
 * Where a destination ends up once the node being moved has been lifted out of the
 * document. The caller names `toParent` and `index` against the document as it reads
 * *now* — that is what the pointer was over — and removing the node shifts every later
 * slot in *its own list* up by one. Two things can sit in that list: the destination slot
 * itself, when the node is moving within one list, and the ancestor the destination is
 * nested inside, when it is moving into a sibling that came after it. Both are rebased
 * here, so a drag and an Alt+arrow can both say "put it there" and mean the same thing.
 */
export function rebaseDrop(from: Path, toParent: Path, index: number): { parent: Path; index: number } {
  const { list, index: at } = listOf(from);
  const parent = [...toParent];
  const step = parent[list.length];
  const nested = list.length < parent.length && pathsEqual(list, parent.slice(0, list.length));
  if (nested && typeof step === "number" && step > at) parent[list.length] = step - 1;
  return { parent, index: pathsEqual(list, toParent) && index > at ? index - 1 : index };
}

/** Moves a node to `index` of `toParent`, as {@link rebaseDrop} reads that pair. */
export function moveNode<T extends Config>(config: T, from: Path, toParent: Path, index: number): T {
  const { index: at } = listOf(from);
  if (pathsEqual(listOf(from).list, toParent) && (index === at || index === at + 1)) return config;
  const node = getAt(config, from);
  const removed = removeAt(config, from);
  const { parent, index: slot } = rebaseDrop(from, toParent, index);
  return insertAt(removed, parent, slot, node);
}
