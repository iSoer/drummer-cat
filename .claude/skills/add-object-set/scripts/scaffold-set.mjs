#!/usr/bin/env node
/**
 * Создаёт новый набор предметов («уровень», локацию) в Drummer Cat и регистрирует его везде,
 * где нужно. Рисовать предметы и фон потом нужно руками (ищи TODO(<id>)).
 *
 *   node .claude/skills/add-object-set/scripts/scaffold-set.mjs <id> --name "Название" --desc "Описание" \
 *     [--wall #hex] (--spec objects.json | --objects id1,id2,...,id10) [--root <repo>] [--dry-run]
 *
 * --objects: через запятую, 10 id; hp назначаются по ритму набора: 6×hp1, 2×hp2, 1×hp3, 1×hp5 (босс).
 *            Можно явно: id:hp (например console:5).
 * --spec:    JSON-массив объектов { id, name?, hp?, weight?, size?, breakable?, hitText?, sfx?, color? }.
 *
 * Правит: src/content/types.ts (SetId), src/core/store.ts (белый список), src/content/sets/index.ts,
 * src/main.ts (импорт спрайта). Создаёт: src/content/sets/<id>.ts, src/content/svg/<id>.svg.
 * Дописывает заготовку фона #bg-<id> в src/content/svg/backgrounds-themed.svg.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SFX = ['glass', 'ceramic', 'thud', 'metal', 'splash', 'crash'];
const HP = [1, 2, 3, 5];
const WEIGHT_BY_HP = { 1: 10, 2: 5, 3: 3, 5: 1 };
const SIZE_BY_HP = { 1: 'S', 2: 'M', 3: 'L', 5: 'L' };
const HIT_BY_HP = { 1: 'ТУК', 2: 'БРЯМ', 3: 'БАМ', 5: 'БА-БАХ' };
const DEFAULT_RHYTHM = [1, 1, 1, 1, 1, 1, 2, 2, 3, 5];
const WIDTH_BY_SIZE = { S: 80, M: 120, L: 160 };

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
if (!id || args.help) usage(0);
if (!/^[a-z][a-z0-9]*$/.test(id)) fail(`id «${id}» должен быть латиницей в нижнем регистре без дефисов (как 'kitchen', 'spacebase')`);

const root = resolve(args.root ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'));
if (!existsSync(resolve(root, 'src/content/sets/index.ts'))) fail(`Не похоже на корень drummer-cat: ${root} (передай --root)`);

const name = args.name ?? `TODO(${id}) название`;
const desc = args.desc ?? `TODO(${id}) три предмета через запятую`;
const wall = args.wall ?? '#E0DCD3';
if (!/^#[0-9A-Fa-f]{6}$/.test(wall)) fail(`--wall ${wall} должен быть вида #RRGGBB`);

const objects = loadObjects();
const CONST = id.toUpperCase();
const svgVar = `${camel(id)}Svg`;

const files = {
  types: 'src/content/types.ts',
  store: 'src/core/store.ts',
  index: 'src/content/sets/index.ts',
  main: 'src/main.ts',
  bgs: 'src/content/svg/backgrounds-themed.svg',
};
const newFiles = {
  set: `src/content/sets/${id}.ts`,
  svg: `src/content/svg/${id}.svg`,
};
const src = Object.fromEntries(Object.entries(files).map(([k, rel]) => [k, readFileSync(resolve(root, rel), 'utf8')]));
const out = {};

// --- проверки до правок -------------------------------------------------------
const setIdUnion = must(src.types.match(/export type SetId = ([^;]+);/), 'SetId в types.ts')[1];
if (setIdUnion.includes(`'${id}'`)) fail(`Набор '${id}' уже зарегистрирован в SetId`);
for (const rel of Object.values(newFiles)) if (existsSync(resolve(root, rel))) fail(`${rel} уже существует`);
if (src.bgs.includes(`id="bg-${id}"`)) fail(`Символ #bg-${id} уже есть в ${files.bgs}`);
if (src.main.includes(`${id}.svg?raw`)) fail(`${id}.svg уже импортируется в main.ts`);

// --- 1. types.ts ----------------------------------------------------------------
out.types = src.types.replace(/(export type SetId = )([^;]+);/, (_, pre, union) => `${pre}${union.trim()} | '${id}';`);

// --- 2. store.ts ----------------------------------------------------------------
out.store = replaceOnce(src.store, /(const sets: SetId\[\] = \[)([^\]]*)(\];)/, (_, pre, list, post) => `${pre}${list.trim()}, '${id}'${post}`, 'const sets в normalizeSave');

// --- 3. sets/index.ts -------------------------------------------------------------
{
  let s = src.index;
  const lastImport = s.lastIndexOf("\nimport ");
  const lineEnd = s.indexOf('\n', lastImport + 1);
  if (lastImport < 0 || lineEnd < 0) fail('не нашёл импорты в sets/index.ts');
  s = s.slice(0, lineEnd) + `\nimport { ${CONST} } from './${id}';` + s.slice(lineEnd);
  s = replaceOnce(s, /(export const SETS: readonly ObjectSet\[\] = \[)([^\]]*)(\];)/, (_, pre, list, post) => `${pre}${list.trim()}, ${CONST}${post}`, 'массив SETS');
  out.index = s;
}

// --- 4. main.ts: импорт спрайта и вставка в #sprites -----------------------------------
{
  let m = src.main;
  const marker = "?raw';\n";
  const lastRaw = m.lastIndexOf(marker);
  if (lastRaw < 0) fail('не нашёл импорты ?raw в main.ts');
  const at = lastRaw + marker.length;
  m = m.slice(0, at) + `import ${svgVar} from './content/svg/${id}.svg?raw';\n` + m.slice(at);
  m = replaceOnce(m, /(\$\('#sprites'\)\.innerHTML =\s*)([^;]+);/, (_, pre, expr) => `${pre}${expr.trimEnd()} + ${svgVar};`, "присваивание $('#sprites').innerHTML");
  out.main = m;
}

// --- 5. sets/<id>.ts ------------------------------------------------------------------
const setTs = `import type { ObjectSet } from '../types';

export const ${CONST}: ObjectSet = {
  id: '${id}',
  name: '${esc(name)}',
  description: '${esc(desc)}',
  backgroundSymbol: '#bg-${id}',
  wallColor: '${wall}',
  objects: [
${objects
  .map(
    (o) =>
      `    { id: '${o.id}', name: '${esc(o.name)}', hp: ${o.hp}, weight: ${o.weight}, size: '${o.size}', symbol: '#obj-${o.id}', breakable: ${o.breakable}, hitText: '${esc(o.hitText)}', sfx: '${o.sfx}', color: '${o.color}' },`,
  )
  .join('\n')}
  ],
};
`;

// --- 6. svg/<id>.svg: заготовки предметов --------------------------------------------------
const svg = `<svg xmlns="http://www.w3.org/2000/svg">
${objects.map(objectStub).join('\n')}
</svg>
`;

// --- 7. backgrounds-themed.svg: заготовка фона ------------------------------------------------
{
  const bg = `
  <symbol id="bg-${id}" viewBox="0 0 360 640">
    <!-- TODO(${id}): фон «${esc(name)}». Стена — y 0..380 (окно, полки, декор локации), столешница — трапеция ниже.
         Геометрию стола (три polygon/path в конце) оставь, поменяй только цвета дерева/материала. -->
    <rect width="360" height="640" fill="${wall}"/>
    <rect x="0" y="250" width="360" height="130" fill="${shade(wall, -12)}"/>
    <polygon points="60,380 300,380 360,640 0,640" fill="#B08968"/>
    <polygon points="60,380 300,380 306,398 54,398" fill="#C9A27E"/>
    <path d="M120 420 L80 640 M240 420 L280 640" stroke="#8F6B4A" stroke-width="3"/>
    <path d="M60 380 H300 L360 640 M60 380 L0 640" fill="none" stroke="#1F1A17" stroke-width="4"/>
  </symbol>
`;
  const close = src.bgs.lastIndexOf('</svg>');
  if (close < 0) fail(`нет закрывающего </svg> в ${files.bgs}`);
  out.bgs = src.bgs.slice(0, close).replace(/\s*$/, '\n') + bg + '</svg>\n';
}

// --- запись ------------------------------------------------------------------------------------
if (args['dry-run']) {
  console.log(`[dry-run] Были бы изменены: ${Object.keys(out).map((k) => files[k]).join(', ')}`);
  console.log(`[dry-run] Были бы созданы: ${Object.values(newFiles).join(', ')}`);
  console.log(setTs);
  process.exit(0);
}
for (const k of Object.keys(out)) writeFileSync(resolve(root, files[k]), out[k]);
writeFileSync(resolve(root, newFiles.set), setTs);
writeFileSync(resolve(root, newFiles.svg), svg);

console.log(`Набор '${id}' зарегистрирован. Изменены:`);
for (const k of Object.keys(out)) console.log(`  ${files[k]}`);
console.log('Созданы:');
for (const rel of Object.values(newFiles)) console.log(`  ${rel}`);
console.log(`
Дальше (ищи TODO(${id})):
  1. Проверь данные предметов в ${newFiles.set}: name, hitText, sfx, breakable, color (цвет осколков), size.
  2. Нарисуй ${objects.length} предметов в ${newFiles.svg}, заменяя заготовки целиком (см. references/object.md).
     Слои повреждений для hp>1 уже размечены как <g style="display:var(--dmgN,none)">.
  3. Нарисуй фон #bg-${id} в ${files.bgs} (см. references/background.md).
  4. Проверка: npm test && npm run typecheck, затем визуально в npm run dev (шторка 🎨 → «Предметы»).`);

// --- helpers -------------------------------------------------------------------------------------
function loadObjects() {
  let raw;
  if (args.spec) {
    const text = readFileSync(resolve(process.cwd(), args.spec), 'utf8');
    raw = JSON.parse(text);
    if (!Array.isArray(raw) || raw.length === 0) fail('--spec: ожидается непустой JSON-массив');
  } else if (args.objects) {
    const parts = String(args.objects)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const rhythm = parts.length === DEFAULT_RHYTHM.length ? DEFAULT_RHYTHM : rhythmFor(parts.length);
    raw = parts.map((p, i) => {
      const [oid, hp] = p.split(':');
      return { id: oid, hp: hp ? Number(hp) : rhythm[i] };
    });
  } else {
    fail('укажи предметы: --objects id1,...,id10 или --spec objects.json');
  }
  const seen = new Set();
  return raw.map((o, i) => {
    if (!o.id || !/^[a-z][a-z0-9]*$/.test(o.id)) fail(`предмет #${i + 1}: id «${o.id}» — латиница в нижнем регистре без дефисов`);
    if (seen.has(o.id)) fail(`предмет '${o.id}' повторяется`);
    seen.add(o.id);
    const hp = o.hp ?? 1;
    if (!HP.includes(hp)) fail(`предмет '${o.id}': hp ${hp} не из {1, 2, 3, 5}`);
    const size = o.size ?? SIZE_BY_HP[hp];
    if (!['S', 'M', 'L'].includes(size)) fail(`предмет '${o.id}': size ${size} не из S/M/L`);
    const sfx = o.sfx ?? 'thud';
    if (!SFX.includes(sfx)) fail(`предмет '${o.id}': sfx ${sfx} не из ${SFX.join('/')}`);
    const color = o.color ?? '#CCCCCC';
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) fail(`предмет '${o.id}': color ${color} должен быть вида #RRGGBB`);
    return {
      id: o.id,
      name: o.name ?? `TODO(${id}) ${o.id}`,
      hp,
      weight: o.weight ?? WEIGHT_BY_HP[hp],
      size,
      breakable: Boolean(o.breakable ?? false),
      hitText: o.hitText ?? HIT_BY_HP[hp],
      sfx,
      color,
    };
  });
}

function rhythmFor(n) {
  // Меньше или больше 10 предметов: последний — босс, перед ним hp3 и hp2, остальные hp1.
  const r = Array(n).fill(1);
  if (n >= 1) r[n - 1] = 5;
  if (n >= 3) r[n - 2] = 3;
  if (n >= 4) r[n - 3] = 2;
  return r;
}

function objectStub(o) {
  const w = WIDTH_BY_SIZE[o.size];
  const h = Math.round(w * 0.9);
  const x = 100 - w / 2;
  const y = 180 - h;
  const dmg = [];
  for (let n = 1; n < o.hp; n++) {
    const cx = Math.round(x + (w * n) / o.hp);
    const cy = Math.round(y + h * 0.3 + n * 8);
    dmg.push(`      <g fill="none" style="display:var(--dmg${n},none)">
        <path d="M${cx} ${cy} l8 10 l-7 9 l10 11"/>
      </g>`);
  }
  return `  <symbol id="obj-${o.id}" viewBox="0 0 200 200">
    <!-- TODO(${id}): нарисовать «${esc(o.name)}» (${o.size}, hp ${o.hp}${o.breakable ? ', бьётся' : ''}). Заготовка — заменить целиком.
         Предмет стоит на линии y=180, ширина для ${o.size} ≤ ${o.size === 'S' ? 90 : o.size === 'M' ? 130 : 180}px. -->
    <g stroke="#1F1A17" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${o.color}"/>
      <line x1="${x + 12}" y1="${y + 16}" x2="${x + 12}" y2="${y + h - 16}" stroke="#FFFFFF" stroke-width="5" opacity="0.4"/>
${dmg.join('\n')}
    </g>
  </symbol>`.replace(/\n\n/g, '\n');
}

function shade(hex, delta) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, v + delta));
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0').toUpperCase()).join('');
}
function camel(s) {
  return s.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}
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
  console.error(`scaffold-set: ${msg}`);
  process.exit(1);
}
function usage(code) {
  console.log(`Использование:
  node .claude/skills/add-object-set/scripts/scaffold-set.mjs <id> --name "Название" --desc "Описание" [--wall #hex]
      (--objects id1,id2,...,id10 | --spec objects.json) [--root <путь к репозиторию>] [--dry-run]

  --objects  10 id через запятую; hp по ритму 6×1, 2×2, 1×3, 1×5. Явно: id:hp.
  --spec     JSON-массив { id, name?, hp?, weight?, size?, breakable?, hitText?, sfx?, color? }

  Пример:
  node .claude/skills/add-object-set/scripts/scaffold-set.mjs pirate --name "Пиратский трюм" --desc "Ром, карты и сундук" \\
      --wall #6B4F35 --objects bottle,coin,map,compass,parrot,hook,lantern,barrel,cannon,chest`);
  process.exit(code);
}
