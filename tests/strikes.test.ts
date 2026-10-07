import { describe, expect, it } from 'vitest';
import { STRIKES, powerOf } from '../src/content/strikes';
import { CATS } from '../src/content/cats';

describe('powerOf', () => {
  it('0 на уровнях 0–1, 1 на уровне 5, монотонно растёт', () => {
    expect(powerOf(0)).toBe(0);
    expect(powerOf(1)).toBe(0);
    expect(powerOf(5)).toBe(1);
    for (let l = 1; l < 5; l++) expect(powerOf(l + 1)).toBeGreaterThanOrEqual(powerOf(l));
    expect(powerOf(-3)).toBe(0);
    expect(powerOf(99)).toBe(1);
  });
});

describe('стили ударов', () => {
  const powers = [0, 0.25, 0.5, 0.75, 1];

  it('у каждого кота свой стиль', () => {
    const ids = CATS.map((c) => c.strike);
    expect(new Set(ids).size).toBe(CATS.length);
    for (const id of ids) expect(STRIKES[id]).toBeDefined();
  });

  for (const style of Object.values(STRIKES)) {
    it(`${style.id}: удар начинается из текущей позы, возврат заканчивается в замахе`, () => {
      for (const p of powers) {
        const from = 'rotate(1deg)';
        const swing = style.swing(p, from);
        expect(swing[0].transform).toBe(from);
        expect(swing.length).toBeGreaterThanOrEqual(2);
        const to = style.raised(p);
        const back = style.back(p, to);
        expect(back[back.length - 1].transform).toBe(to);
        expect(back[0].transform).toBe(swing[swing.length - 1].transform);
      }
    });

    it(`${style.id}: с силой предмет летит дальше и крутится сильнее`, () => {
      const weak = style.knock(0);
      const strong = style.knock(1);
      expect(Math.hypot(strong.dx, strong.dy)).toBeGreaterThan(Math.hypot(weak.dx, weak.dy) * 0.95);
      expect(Math.abs(strong.rot)).toBeGreaterThan(Math.abs(weak.rot));
      expect(strong.dx).toBeLessThan(0);
      expect(strong.dy).toBeGreaterThan(0);
    });

    it(`${style.id}: замах при силе 1 отличается от замаха при силе 0`, () => {
      expect(style.raised(1)).not.toBe(style.raised(0));
      expect(style.raised(0, 3)).not.toBe(style.raised(0));
    });
  }
});
