import type { Config, Path } from "./types";

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
