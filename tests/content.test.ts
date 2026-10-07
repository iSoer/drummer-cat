import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATS } from '../src/content/cats';
import { SETS } from '../src/content/sets';
import { STRIKES } from '../src/content/strikes';
import { normalizeSave } from '../src/core/store';
import { renderFace } from '../src/render/portrait';

/**
 * Целостность контента: всё, что объявлено в cats.ts / sets/*.ts, должно быть
 * зарегистрировано в типах и в белом списке сохранения, а каждый символ —
 * нарисован в одном из спрайтов, которые main.ts вставляет в DOM.
 */

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (rel: string): string => readFileSync(root + rel, 'utf8');

const mainTs = read('src/main.ts');
const importedSprites = [...mainTs.matchAll(/from '\.\/content\/svg\/([\w-]+\.svg)\?raw'/g)].map((m) => m[1]);
const spriteFiles = readdirSync(root + 'src/content/svg').filter((f) => f.endsWith('.svg'));

/** id символа → его разметка, по всем импортированным спрайтам. */
const symbols = new Map<string, string>();
for (const file of importedSprites) {
  const svg = read(`src/content/svg/${file}`);
  for (const m of svg.matchAll(/<symbol\s+id="([^"]+)"[\s\S]*?<\/symbol>/g)) symbols.set(m[1], m[0]);
}

const symbolExists = (href: string): boolean => symbols.has(href.replace(/^#/, ''));

describe('спрайты', () => {
  it('каждый svg в src/content/svg импортируется в main.ts', () => {
    for (const f of spriteFiles) expect(importedSprites, `${f} не импортирован в main.ts`).toContain(f);
  });

  it('id символов уникальны между спрайтами', () => {
    const seen = new Map<string, string>();
    for (const file of importedSprites) {
      const svg = read(`src/content/svg/${file}`);
      for (const m of svg.matchAll(/<symbol\s+id="([^"]+)"/g)) {
        expect(seen.has(m[1]), `символ #${m[1]} объявлен и в ${seen.get(m[1])}, и в ${file}`).toBe(false);
        seen.set(m[1], file);
      }
    }
  });
});

describe('коты', () => {
  it('id уникальны', () => {
    expect(new Set(CATS.map((c) => c.id)).size).toBe(CATS.length);
  });

  for (const cat of CATS) {
    describe(cat.id, () => {
      it('проходит белый список normalizeSave (core/store.ts)', () => {
        expect(normalizeSave({ cat: cat.id }).cat).toBe(cat.id);
      });

      it('лапа нарисована в импортированном спрайте', () => {
        expect(symbolExists(cat.pawSymbol), `${cat.pawSymbol} не найден`).toBe(true);
        expect(symbols.get(cat.pawSymbol.slice(1))).toMatch(/viewBox="0 0 240 320"/);
      });

      it('стиль удара существует', () => {
        expect(STRIKES[cat.strike]).toBeDefined();
      });

      it('портрет рисуется на всех уровнях без дыр в разметке', () => {
        for (let level = 0; level <= 5; level++) {
          const svg = renderFace(level, cat);
          expect(svg).not.toMatch(/undefined|NaN/);
          expect(svg).toContain(cat.palette.fur);
        }
      });
    });
  }
});

describe('наборы', () => {
  it('id уникальны', () => {
    expect(new Set(SETS.map((s) => s.id)).size).toBe(SETS.length);
  });

  for (const set of SETS) {
    describe(set.id, () => {
      it('проходит белый список normalizeSave (core/store.ts)', () => {
        expect(normalizeSave({ set: set.id }).set).toBe(set.id);
      });

      it('фон нарисован в импортированном спрайте', () => {
        expect(symbolExists(set.backgroundSymbol), `${set.backgroundSymbol} не найден`).toBe(true);
        expect(symbols.get(set.backgroundSymbol.slice(1))).toMatch(/viewBox="0 0 360 640"/);
      });

      it('ритм набора: есть многоударные предметы и босс (hp 5)', () => {
        expect(set.objects.length).toBeGreaterThanOrEqual(3);
        expect(set.objects.some((o) => o.hp >= 2)).toBe(true);
        expect(set.objects.some((o) => o.hp === 5)).toBe(true);
        expect(new Set(set.objects.map((o) => o.id)).size).toBe(set.objects.length);
      });

      for (const obj of set.objects) {
        it(`${obj.id}: символ, вес, слои повреждений`, () => {
          expect(obj.symbol).toBe(`#obj-${obj.id}`);
          expect(symbolExists(obj.symbol), `${obj.symbol} не найден`).toBe(true);
          expect(obj.weight).toBeGreaterThan(0);
          expect(obj.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          const markup = symbols.get(obj.symbol.slice(1))!;
          expect(markup).toMatch(/viewBox="0 0 200 200"/);
          for (let n = 1; n < obj.hp; n++) {
            expect(markup, `${obj.id} (hp ${obj.hp}) без слоя --dmg${n}`).toContain(`--dmg${n}`);
          }
        });
      }
    });
  }
});
