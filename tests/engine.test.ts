import { describe, expect, it } from 'vitest';
import { BOSS_EVERY, Engine, HEAVY_EVERY } from '../src/core/engine';
import { KITCHEN } from '../src/content/sets/kitchen';
import { DESK } from '../src/content/sets/desk';
import type { GameObject, ObjectSet } from '../src/content/types';

function obj(id: string, hp: GameObject['hp'], weight = 10): GameObject {
  return { id, name: id, hp, weight, size: 'S', symbol: `#obj-${id}`, breakable: false, hitText: 'X', sfx: 'thud', color: '#fff' };
}

const SET: ObjectSet = {
  id: 'kitchen',
  name: 't',
  description: '',
  backgroundSymbol: '#bg',
  wallColor: '#fff',
  objects: [obj('a', 1), obj('b', 1), obj('c', 1), obj('d', 3), obj('e', 5)],
};

/** Детерминированный rng: всегда первый кандидат. */
const first = () => 0;

describe('Engine', () => {
  it('одноударный предмет: knock + step, счётчики растут', () => {
    const e = new Engine(SET, { knocked: 0, hits: 0 }, first);
    expect(e.current.obj.id).toBe('a');
    const ev = e.hit();
    expect(ev.map((x) => x.type)).toEqual(['knock', 'step']);
    expect(e.counters).toEqual({ knocked: 1, hits: 1 });
    expect(e.current.obj.id).not.toBe('a');
  });

  it('многоударный предмет: wobble до последнего удара', () => {
    const only: ObjectSet = { ...SET, objects: [obj('d', 3)] };
    const e = new Engine(only, undefined, first);
    expect(e.hit()[0].type).toBe('wobble');
    expect(e.current.hp).toBe(2);
    expect(e.hit()[0].type).toBe('wobble');
    expect(e.hit().map((x) => x.type)).toEqual(['knock', 'step']);
    expect(e.counters).toEqual({ knocked: 1, hits: 3 });
    expect(e.current.hp).toBe(3);
  });

  it('не повторяет два предыдущих предмета (кроме принудительных позиций)', () => {
    const e = new Engine(KITCHEN, undefined, Math.random);
    const ids: string[] = [];
    for (let seq = 1; seq <= 300; seq++) {
      ids.push(e.current.obj.id);
      while (e.seq === seq) e.hit();
    }
    for (let i = 1; i < ids.length; i++) {
      const seq = i + 1;
      if (seq % BOSS_EVERY !== 0) expect(ids[i]).not.toBe(ids[i - 1]);
      if (seq % HEAVY_EVERY !== 0 && i >= 2) expect(ids[i]).not.toBe(ids[i - 2]);
    }
  });

  it('каждый 10-й предмет тяжёлый, каждый 30-й — босс', () => {
    const e = new Engine(KITCHEN, undefined, Math.random);
    for (let seq = 1; seq <= 90; seq++) {
      expect(e.seq).toBe(seq);
      if (seq % BOSS_EVERY === 0) expect(e.current.maxHp).toBe(5);
      else if (seq % HEAVY_EVERY === 0) expect(e.current.maxHp).toBeGreaterThanOrEqual(2);
      while (e.current.hp > 0 && e.seq === seq) e.hit();
    }
  });

  it('следующий предмет известен заранее и становится текущим после сноса', () => {
    const e = new Engine(KITCHEN, undefined, Math.random);
    for (let i = 0; i < 50; i++) {
      const promised = e.next.obj;
      expect(promised.id).not.toBe(e.current.obj.id);
      let ev = e.hit();
      while (ev[0].type === 'wobble') ev = e.hit();
      const step = ev[1];
      expect(step.type).toBe('step');
      expect(e.current.obj).toBe(promised);
      if (step.type === 'step') {
        expect(step.obj).toBe(promised);
        expect(step.next).toBe(e.next.obj);
      }
    }
  });

  it('смена набора заменяет предмет без счёта', () => {
    const e = new Engine(KITCHEN, undefined, first);
    const seqBefore = e.seq;
    const cur = e.setObjectSet(DESK);
    expect(DESK.objects.some((o) => o.id === cur.obj.id)).toBe(true);
    expect(e.seq).toBe(seqBefore);
    expect(e.counters.knocked).toBe(0);
    expect(DESK.objects.some((o) => o.id === e.next.obj.id)).toBe(true);
    expect(e.next.obj.id).not.toBe(cur.obj.id);
    expect(e.setObjectSet(DESK)).toBe(cur);
  });
});
