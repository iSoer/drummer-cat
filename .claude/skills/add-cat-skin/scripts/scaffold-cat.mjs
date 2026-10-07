#!/usr/bin/env node
/**
 * Регистрирует нового кота во всех местах проекта Drummer Cat и создаёт заготовки,
 * которые потом нужно дорисовать (ищи TODO(<id>)).
 *
 *   node .claude/skills/add-cat-skin/scripts/scaffold-cat.mjs <id> --name "Имя" --desc "Описание" \
 *     --strike swipe [--accessory tricorn] \
 *     [--fur #hex --fur2 #hex --eye #hex --nose #hex --inner-ear #hex --pad #hex] [--root <repo>] [--dry-run]
 *
 * Правит: src/content/types.ts (CatId, accessory), src/core/store.ts (белый список),
 * src/content/cats.ts (запись), src/render/portrait.ts (case в markings() и accessory()),
 * src/content/svg/paws-themed.svg (заготовка лапы).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
if (!id || args.help) usage(0);
if (!/^[a-z][a-z0-9]*$/.test(id)) fail(`id «${id}» должен быть латиницей в нижнем регистре без дефисов (как 'ginger', 'sherlock')`);

const root = resolve(args.root ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'));
if (!existsSync(resolve(root, 'src/content/cats.ts'))) fail(`Не похоже на корень drummer-cat: ${root} (передай --root)`);

const name = args.name ?? `TODO(${id}) имя`;
const desc = args.desc ?? `TODO(${id}) описание`;
const strike = args.strike ?? 'swipe';
const accessory = args.accessory ?? null;
const palette = {
  fur: args.fur ?? '#9E9E9E',
  fur2: args.fur2 ?? '#6E6E6E',
  eye: args.eye ?? '#5DBB63',
  nose: args.nose ?? '#E8827A',
  innerEar: args['inner-ear'] ?? '#F6C9B8',
  pad: args.pad ?? '#F4A6A0',
};
for (const [k, v] of Object.entries(palette)) if (!/^#[0-9A-Fa-f]{6}$/.test(v)) fail(`Цвет ${k}=${v} должен быть вида #RRGGBB`);

const files = {
  types: 'src/content/types.ts',
  store: 'src/core/store.ts',
  cats: 'src/content/cats.ts',
  portrait: 'src/render/portrait.ts',
  strikes: 'src/content/strikes.ts',
  paws: 'src/content/svg/paws-themed.svg',
};
const src = Object.fromEntries(Object.entries(files).map(([k, rel]) => [k, readFileSync(resolve(root, rel), 'utf8')]));
const out = {};

// --- проверки до правок -------------------------------------------------------
const catIdUnion = must(src.types.match(/export type CatId = ([^;]+);/), 'CatId в types.ts')[1];
if (catIdUnion.includes(`'${id}'`)) fail(`Кот '${id}' уже зарегистрирован в CatId`);
const strikeUnion = must(src.strikes.match(/export type StrikeId = ([^;]+);/), 'StrikeId в strikes.ts')[1];
if (!strikeUnion.includes(`'${strike}'`)) {
  fail(`Стиль удара '${strike}' не найден в StrikeId (${strikeUnion.trim()}). Сначала добавь стиль в src/content/strikes.ts, затем повтори.`);
}
if (src.paws.includes(`id="paw-${id}"`)) fail(`Символ #paw-${id} уже есть в ${files.paws}`);
{
  // tests/strikes.test.ts требует уникальный стиль у каждого кота.
  const owner = [...src.cats.matchAll(/id: '(\w+)',[\s\S]*?strike: '(\w+)'/g)].find((m) => m[2] === strike)?.[1];
  if (owner) {
    const all = [...strikeUnion.matchAll(/'(\w+)'/g)].map((m) => m[1]);
    const used = new Set([...src.cats.matchAll(/strike: '(\w+)'/g)].map((m) => m[1]));
    const free = all.filter((s) => !used.has(s));
    fail(
      `Стиль '${strike}' уже у кота '${owner}', а тесты требуют уникальный стиль на кота. ` +
        (free.length ? `Свободные стили: ${free.join(', ')}.` : 'Свободных стилей нет — добавь новый в src/content/strikes.ts (см. references/strike.md).'),
    );
  }
}

// --- 1. types.ts: CatId и (опционально) accessory -----------------------------
out.types = src.types.replace(/(export type CatId = )([^;]+);/, (_, pre, union) => `${pre}${union.trim()} | '${id}';`);
let accessoryIsNew = false;
if (accessory) {
  const m = must(out.types.match(/(accessory\?: )([^;]+);/), 'поле accessory в CatSkin');
  if (!m[2].includes(`'${accessory}'`)) {
    accessoryIsNew = true;
    out.types = out.types.replace(/(accessory\?: )([^;]+);/, (_, pre, union) => `${pre}${union.trim()} | '${accessory}';`);
  }
}

// --- 2. store.ts: белый список сохранения -------------------------------------
out.store = replaceOnce(src.store, /(const cats: CatId\[\] = \[)([^\]]*)(\];)/, (_, pre, list, post) => `${pre}${list.trim()}, '${id}'${post}`, 'const cats в normalizeSave');

// --- 3. cats.ts: запись ------------------------------------------------------
const entry = [
  '  {',
  `    id: '${id}',`,
  `    name: '${esc(name)}',`,
  `    description: '${esc(desc)}',`,
  `    palette: { fur: '${palette.fur}', fur2: '${palette.fur2}', eye: '${palette.eye}', nose: '${palette.nose}', innerEar: '${palette.innerEar}', pad: '${palette.pad}' },`,
  `    pawSymbol: '#paw-${id}',`,
  `    strike: '${strike}',`,
  ...(accessory ? [`    accessory: '${accessory}',`] : []),
  '  },',
].join('\n');
out.cats = replaceOnce(src.cats, /\n\];\n(\s*export function getCat)/, `\n${entry}\n];\n$1`, 'конец массива CATS');

// --- 4. portrait.ts: markings() и accessory() -------------------------------
{
  let p = src.portrait;
  const mStart = p.indexOf('function markings(cat: CatSkin): string {');
  if (mStart < 0) fail('не нашёл function markings() в portrait.ts');
  const mEnd = p.indexOf('\n  }\n}', mStart);
  if (mEnd < 0) fail('не нашёл конец switch в markings()');
  const markingsCase = [
    '',
    `    case '${id}':`,
    `      // TODO(${id}): отметины на морде. Голова — эллипс (60,66) rx40 ry34; глаза (45,60) и (75,60); нос (60,72..77); рот y 76..91.`,
    "      return `<ellipse cx=\"60\" cy=\"82\" rx=\"18\" ry=\"11\" fill=\"${p.fur2}\" opacity=\"0.4\"/>`;",
  ].join('\n');
  p = p.slice(0, mEnd) + markingsCase + p.slice(mEnd);

  if (accessoryIsNew) {
    const aStart = p.indexOf('function accessory(cat: CatSkin, level: number)');
    if (aStart < 0) fail('не нашёл function accessory() в portrait.ts');
    const marker = "    default:\n      return { behind: '', front: '' };";
    const aDefault = p.indexOf(marker, aStart);
    if (aDefault < 0) fail('не нашёл default-ветку в accessory()');
    const accCase = [
      `    case '${accessory}':`,
      `      // TODO(${id}): головной убор. behind — под глазами (шляпа, шлем, капюшон), front — поверх (очки, монокль).`,
      '      // wrap() наклоняет убор с ростом ярости и приподнимает на уровнях 4–5. Без keepEars уши не рисуются (шляпа закрывает макушку, y ≈ 10..50); для очков, усов и причёсок верни keepEars: true.',
      '      return {',
      '        behind: wrap(`<path d="M20 52 C20 24 40 12 60 12 C80 12 100 24 100 52 Z" fill="#8D6E4C" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>`),',
      "        front: '',",
      '      };',
      '',
    ].join('\n');
    p = p.slice(0, aDefault) + accCase + p.slice(aDefault);
  }
  out.portrait = p;
}

// --- 5. paws-themed.svg: заготовка лапы -------------------------------------
{
  const symbol = `
  <symbol id="paw-${id}" viewBox="0 0 240 320" overflow="visible">
    <!-- TODO(${id}): лапа «${esc(name)}». Вид сверху, глазами кота. Кисть — круг (78,78), предплечье уходит вправо-вниз за край
         viewBox к (270,420), поэтому overflow="visible" обязателен. Слои: обводка → шерсть → декор (полоски, манжета, предмет в лапе) → когти. -->
    <g stroke-linecap="round" stroke-linejoin="round">
      <g fill="#1F1A17" stroke="#1F1A17">
        <line x1="92" y1="100" x2="270" y2="420" stroke-width="96"/>
        <circle cx="78" cy="78" r="58"/>
        <circle cx="31" cy="61" r="20"/><circle cx="49" cy="37" r="20"/><circle cx="78" cy="28" r="20"/><circle cx="107" cy="37" r="20"/>
      </g>
      <g fill="${palette.fur}" stroke="${palette.fur}">
        <line x1="92" y1="100" x2="270" y2="420" stroke-width="88"/>
        <circle cx="78" cy="78" r="54"/>
        <circle cx="31" cy="61" r="16"/><circle cx="49" cy="37" r="16"/><circle cx="78" cy="28" r="16"/><circle cx="107" cy="37" r="16"/>
      </g>
      <g stroke-linecap="butt">
        <line x1="122" y1="230" x2="186" y2="194" stroke="${palette.fur2}" stroke-width="12"/>
        <line x1="150" y1="278" x2="213" y2="243" stroke="${palette.fur2}" stroke-width="12"/>
      </g>
      <g stroke="#1F1A17" stroke-width="4" fill="none">
        <path d="M54 60 L38 47 M69 49 L63 30 M87 49 L93 30"/>
      </g>
    </g>
  </symbol>
`;
  const close = src.paws.lastIndexOf('</svg>');
  if (close < 0) fail(`нет закрывающего </svg> в ${files.paws}`);
  out.paws = src.paws.slice(0, close).replace(/\s*$/, '\n') + symbol + '</svg>\n';
}

// --- запись -------------------------------------------------------------------
const changed = Object.keys(out);
if (args['dry-run']) {
  console.log(`[dry-run] Были бы изменены: ${changed.map((k) => files[k]).join(', ')}`);
  console.log(entry);
  process.exit(0);
}
for (const k of changed) writeFileSync(resolve(root, files[k]), out[k]);

console.log(`Кот '${id}' зарегистрирован. Изменены:`);
for (const k of changed) console.log(`  ${files[k]}`);
console.log(`
Дальше (ищи TODO(${id})):
  1. Нарисуй лапу: заменить заготовку #paw-${id} в ${files.paws} (см. references/paw.md).
  2. Отметины на морде: case '${id}' в markings() в ${files.portrait} (см. references/portrait.md).${
    accessory ? `\n  3. Головной убор '${accessory}'${accessoryIsNew ? ` — новый, дорисуй case в accessory()` : ' уже есть в accessory()'}.` : ''
  }
  ${accessory ? 4 : 3}. Проверка: npm test && npm run typecheck, затем визуально в npm run dev (шторка 🎨).`);

// --- helpers -------------------------------------------------------------------
function parseArgs(argv) {
  const res = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') res.help = true;
    else if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) res[key] = true;
      else {
        res[key] = next;
        i++;
      }
    } else res._.push(a);
  }
  return res;
}
function must(m, what) {
  if (!m) fail(`не нашёл ${what}`);
  return m;
}
function replaceOnce(text, re, replacement, what) {
  if (!re.test(text)) fail(`не нашёл ${what}`);
  return text.replace(re, replacement);
}
function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
function fail(msg) {
  console.error(`scaffold-cat: ${msg}`);
  process.exit(1);
}
function usage(code) {
  console.log(`Использование:
  node .claude/skills/add-cat-skin/scripts/scaffold-cat.mjs <id> --name "Имя" --desc "Описание" --strike <StrikeId>
      [--accessory <helmet|wizard|deerstalker|новый>] [--fur #hex --fur2 #hex --eye #hex --nose #hex --inner-ear #hex --pad #hex]
      [--root <путь к репозиторию>] [--dry-run]

  Пример:
  node .claude/skills/add-cat-skin/scripts/scaffold-cat.mjs pirate --name "Флинт" --desc "Одноглазый кот-пират" \\
      --strike slam --accessory tricorn --fur #B5651D --fur2 #7A3E0E --eye #F5C542 --nose #4A2C17 --inner-ear #D9A066 --pad #7A3E0E`);
  process.exit(code);
}
