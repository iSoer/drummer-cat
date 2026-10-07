import type { CatId, SetId } from '../content/types';

export interface SaveV1 {
  v: 1;
  knocked: number;
  hits: number;
  bestTps: number;
  cat: CatId;
  set: SetId;
  sound: boolean;
  haptics: boolean;
  updatedAt: number;
}

export const DEFAULT_SAVE: SaveV1 = {
  v: 1,
  knocked: 0,
  hits: 0,
  bestTps: 0,
  cat: 'ginger',
  set: 'kitchen',
  sound: true,
  haptics: true,
  updatedAt: 0,
};

type Listener<T> = (state: T, prev: T) => void;

export interface Store<T> {
  get(): T;
  set(patch: Partial<T>): void;
  subscribe(fn: Listener<T>): () => void;
}

/** Минимальный стор с подпиской. */
export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener<T>>();
  return {
    get: () => state,
    set(patch) {
      const prev = state;
      state = { ...state, ...patch };
      for (const fn of listeners) fn(state, prev);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/** Привести произвольный объект к валидному SaveV1 (миграции по полю v). */
export function normalizeSave(raw: unknown): SaveV1 {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SAVE };
  const r = raw as Partial<SaveV1>;
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : d);
  const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
  const cats: CatId[] = ['ginger', 'coal', 'siam'];
  const sets: SetId[] = ['kitchen', 'desk', 'living'];
  return {
    v: 1,
    knocked: Math.floor(num(r.knocked, 0)),
    hits: Math.floor(num(r.hits, 0)),
    bestTps: num(r.bestTps, 0),
    cat: cats.includes(r.cat as CatId) ? (r.cat as CatId) : DEFAULT_SAVE.cat,
    set: sets.includes(r.set as SetId) ? (r.set as SetId) : DEFAULT_SAVE.set,
    sound: bool(r.sound, true),
    haptics: bool(r.haptics, true),
    updatedAt: num(r.updatedAt, 0),
  };
}
