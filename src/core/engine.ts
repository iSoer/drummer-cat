import type { GameObject, ObjectSet } from '../content/types';
import { pickWeighted, type Rng } from './rng';

export interface CurrentObject {
  obj: GameObject;
  hp: number;
  maxHp: number;
}

export type EngineEvent =
  | { type: 'wobble'; obj: GameObject; hp: number; maxHp: number }
  | { type: 'knock'; obj: GameObject; knocked: number }
  | { type: 'step'; obj: GameObject; hp: number; maxHp: number; next: GameObject };

export interface EngineCounters {
  knocked: number;
  hits: number;
}

/** Каждый N-й предмет гарантированно многоударный. */
export const HEAVY_EVERY = 10;
/** Каждый N-й предмет — «босс» набора. */
export const BOSS_EVERY = 30;

/**
 * Игровая логика: удары, снос, выбор предметов. Ничего не знает о DOM.
 * Следующий предмет выбирается заранее (`next`), чтобы рендер показывал его силуэт вдали.
 */
export class Engine {
  current!: CurrentObject;
  next!: CurrentObject;
  /** Порядковый номер текущего предмета в сессии (с 1). */
  seq = 0;
  readonly counters: EngineCounters;
  private history: string[] = [];
  private set: ObjectSet;
  private readonly rng: Rng;

  constructor(set: ObjectSet, counters: EngineCounters = { knocked: 0, hits: 0 }, rng: Rng = Math.random) {
    this.set = set;
    this.counters = counters;
    this.rng = rng;
    this.seq = 1;
    this.current = this.pick(this.seq);
    this.next = this.pick(this.seq + 1);
  }

  get objectSet(): ObjectSet {
    return this.set;
  }

  /** Один удар лапой. Возвращает события для рендера в порядке применения. */
  hit(): EngineEvent[] {
    const cur = this.current;
    cur.hp -= 1;
    this.counters.hits += 1;
    if (cur.hp > 0) {
      return [{ type: 'wobble', obj: cur.obj, hp: cur.hp, maxHp: cur.maxHp }];
    }
    this.counters.knocked += 1;
    const knocked = { type: 'knock' as const, obj: cur.obj, knocked: this.counters.knocked };
    this.seq += 1;
    this.current = this.next;
    this.next = this.pick(this.seq + 1);
    const c = this.current;
    return [knocked, { type: 'step', obj: c.obj, hp: c.hp, maxHp: c.maxHp, next: this.next.obj }];
  }

  /** Сменить набор: текущий и следующий предметы заменяются немедленно, без шага и без счётчика. */
  setObjectSet(set: ObjectSet): CurrentObject {
    if (set.id === this.set.id) return this.current;
    this.set = set;
    this.history = [];
    this.current = this.pick(this.seq);
    this.next = this.pick(this.seq + 1);
    return this.current;
  }

  private pick(seq: number): CurrentObject {
    const obj = this.chooseFor(seq);
    this.history.push(obj.id);
    if (this.history.length > 2) this.history.shift();
    return { obj, hp: obj.hp, maxHp: obj.hp };
  }

  private chooseFor(seq: number): GameObject {
    const all = this.set.objects;
    let pool: GameObject[];
    if (seq % BOSS_EVERY === 0) {
      pool = all.filter((o) => o.hp >= 5);
      if (pool.length === 0) {
        const max = Math.max(...all.map((o) => o.hp));
        pool = all.filter((o) => o.hp === max);
      }
    } else if (seq % HEAVY_EVERY === 0) {
      pool = all.filter((o) => o.hp >= 2);
    } else {
      pool = all;
    }
    // Не повторять два предыдущих; если пул слишком мал — хотя бы не повторять последний.
    const last = this.history[this.history.length - 1];
    let candidates = pool.filter((o) => !this.history.includes(o.id));
    if (candidates.length === 0) candidates = pool.filter((o) => o.id !== last);
    if (candidates.length === 0) candidates = pool;
    return pickWeighted(candidates, (o) => o.weight, this.rng);
  }
}
