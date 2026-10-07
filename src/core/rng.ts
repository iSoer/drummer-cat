export type Rng = () => number;

/** Взвешенный выбор элемента. Веса ≤ 0 игнорируются. */
export function pickWeighted<T>(items: T[], weightOf: (item: T) => number, rng: Rng): T {
  if (items.length === 0) throw new Error('pickWeighted: empty list');
  let total = 0;
  for (const it of items) total += Math.max(0, weightOf(it));
  if (total <= 0) return items[Math.floor(rng() * items.length)];
  let r = rng() * total;
  for (const it of items) {
    r -= Math.max(0, weightOf(it));
    if (r < 0) return it;
  }
  return items[items.length - 1];
}

/** Случайное число в диапазоне [min, max). */
export function randRange(min: number, max: number, rng: Rng = Math.random): number {
  return min + (max - min) * rng();
}
