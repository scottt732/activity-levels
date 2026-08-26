import type { Config, Path } from "./types";

type Node = Record<string | number, unknown>;

export function getAt<T = unknown>(obj: unknown, path: Path): T {
  let cur: unknown = obj;
  for (const key of path) cur = (cur as Node)[key];
  return cur as T;
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

export class Draft {
  original: Config;
  config: Config;
  private past: Config[] = [];
  private future: Config[] = [];

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

  set(next: Config): void {
    this.past.push(this.config);
    this.future = [];
    this.config = next;
  }

  undo(): void {
    const prev = this.past.pop();
    if (prev) {
      this.future.push(this.config);
      this.config = prev;
    }
  }

  redo(): void {
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
  }
}
