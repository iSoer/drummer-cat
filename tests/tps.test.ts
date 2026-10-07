import { describe, expect, it } from 'vitest';
import { LEVELS, TpsMeter } from '../src/core/tps';

/** Серия тапов с равным интервалом, начиная с t0. */
function taps(m: TpsMeter, count: number, t0: number, intervalMs: number): number {
  let t = t0;
  for (let i = 0; i < count; i++) {
    m.tap(t);
    t += intervalMs;
  }
  return t - intervalMs;
}

describe('TpsMeter', () => {
  it('без тапов — уровень 0 (Сон)', () => {
    const m = new TpsMeter();
    expect(m.update(5000).level).toBe(0);
    expect(m.speedMul).toBe(1);
  });

  it('один тап даёт уровень 1', () => {
    const m = new TpsMeter();
    const s = m.tap(1000);
    expect(s.level).toBe(1);
    expect(s.tps).toBeCloseTo(1 / 1.5, 3);
  });

  it('TPS считается по окну 1.5 с', () => {
    const m = new TpsMeter();
    taps(m, 10, 0, 100); // 10 тапов за 0.9 c
    expect(m.tps).toBeCloseTo(10 / 1.5, 3);
  });

  it('повышение уровня мгновенное, пороги по таблице', () => {
    const m = new TpsMeter();
    taps(m, 4, 0, 100); // 2.67 tps → уровень 2
    expect(m.level).toBe(2);
    taps(m, 4, 400, 100); // 8 тапов → 5.33 tps → уровень 3
    expect(m.level).toBe(3);
    taps(m, 3, 800, 100); // 11 → 7.33 → уровень 4
    expect(m.level).toBe(4);
    taps(m, 4, 1100, 100); // 15 → 10 → уровень 5
    expect(m.level).toBe(5);
    expect(m.speedMul).toBe(0.4);
  });

  it('понижение уровня — с задержкой 500 мс', () => {
    const m = new TpsMeter();
    const last = taps(m, 15, 0, 70); // ~1 с, 10 tps → уровень 5
    expect(m.level).toBe(5);
    // Через 1.2 с после последнего тапа в окне остаётся мало тапов
    const t1 = last + 1200;
    const s1 = m.update(t1);
    expect(s1.tps).toBeLessThan(4);
    expect(s1.level).toBe(5); // ещё держится
    expect(m.update(t1 + 300).level).toBe(5);
    expect(m.update(t1 + 520).level).toBeLessThan(5);
  });

  it('через 2 с без тапов — Сон', () => {
    const m = new TpsMeter();
    m.tap(0);
    expect(m.update(1900).level).toBe(1);
    expect(m.update(2000).level).toBe(1); // гистерезис
    expect(m.update(2600).level).toBe(0);
  });

  it('fury ограничена 0..1', () => {
    const m = new TpsMeter();
    expect(m.fury).toBe(0);
    taps(m, 30, 0, 40);
    expect(m.fury).toBe(1);
  });

  it('таблица уровней согласована', () => {
    expect(LEVELS).toHaveLength(6);
    expect(LEVELS.map((l) => l.speedMul)).toEqual([1, 1, 0.8, 0.65, 0.5, 0.4]);
  });
});
