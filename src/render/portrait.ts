import type { CatSkin } from '../content/types';

const OUTLINE = '#1F1A17';
const BG_BY_LEVEL = ['#CFD8DC', '#E3EDF5', '#FCE4B8', '#FFB74D', '#E53935', '#B71C1C'];
const EAR_ANGLE = [10, 0, -6, 20, 45, 62];
const HEAD = { cx: 60, cy: 66, rx: 40, ry: 34 };

/** Тёмная ли шерсть: на ней обводка #1F1A17 не читается (закрытый глаз, ресницы). */
function isDark(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 60;
}

/** Зеркально отразить x относительно центра портрета. */
const mx = (x: number) => 120 - x;

function ears(cat: CatSkin, level: number): string {
  const a = EAR_ANGLE[level];
  const earFill = cat.id === 'siam' ? cat.palette.fur2 : cat.palette.fur;
  const inner = cat.palette.innerEar;
  const left = `
    <g transform="rotate(${-a} 40 44)">
      <polygon points="24,50 30,10 58,38" fill="${earFill}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="32,44 33,22 50,38" fill="${inner}"/>
    </g>`;
  const right = `
    <g transform="rotate(${a} 80 44)">
      <polygon points="96,50 90,10 62,38" fill="${earFill}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="88,44 87,22 70,38" fill="${inner}"/>
    </g>`;
  return left + right;
}

function markings(cat: CatSkin): string {
  const p = cat.palette;
  switch (cat.id) {
    case 'marine':
      return `
        <ellipse cx="60" cy="82" rx="18" ry="11" fill="${p.fur2}" opacity="0.35"/>
        <path d="M32 64 l10 14 M30 70 l8 10" fill="none" stroke="${p.fur2}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'wizard':
      return `
        <ellipse cx="60" cy="82" rx="18" ry="11" fill="${p.fur2}" opacity="0.5"/>
        <path d="M50 38 l-5 6 h5 l-5 7" fill="none" stroke="#E57373" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'sherlock':
      return `<ellipse cx="60" cy="82" rx="19" ry="12" fill="#A9B4C2"/>`;
    case 'ginger':
      return `
        <path d="M46 36 l5 14 l5 -14 Z M55 33 l5 17 l5 -17 Z M64 36 l5 14 l5 -14 Z" fill="${p.fur2}"/>
        <ellipse cx="60" cy="82" rx="20" ry="12" fill="#FFF8EE"/>`;
    case 'coal':
      return `<ellipse cx="60" cy="82" rx="18" ry="11" fill="${p.fur2}" opacity="0.55"/>`;
    case 'siam':
      return `<ellipse cx="60" cy="76" rx="24" ry="19" fill="${p.fur2}"/>`;
    case 'vanya':
      return `
        <path d="M48 40 l4 12 l4 -12 Z M56 37 l4 15 l4 -15 Z M64 40 l4 12 l4 -12 Z" fill="${p.fur2}" opacity="0.55"/>
        <ellipse cx="60" cy="80" rx="17" ry="10" fill="#E9D3B6"/>
        <path d="M40 84 C42 102 50 108 60 108 C70 108 78 102 80 84 C72 92 48 92 40 84 Z" fill="${p.fur2}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M50 94 l2 8 M60 96 v9 M70 94 l-2 8" fill="none" stroke="#6B4425" stroke-width="2" stroke-linecap="round"/>`;
    case 'elman':
      return `
        <path d="M42 38 C46 22 62 18 74 28 C66 28 58 32 52 40 Z" fill="${p.fur2}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M46 34 C52 26 62 24 70 28" fill="none" stroke="#C39BD3" stroke-width="2" stroke-linecap="round"/>
        <circle cx="71" cy="74" r="1.8" fill="${OUTLINE}"/>
        <circle cx="27" cy="52" r="3" fill="none" stroke="#F5C542" stroke-width="2.5"/>`;
    case 'ksyusha':
      return `
        <path d="M60 50 C54 40 44 44 48 52 L60 62 L72 52 C76 44 66 40 60 50 Z" fill="${p.fur2}" opacity="0.7"/>
        <circle cx="35" cy="75" r="6" fill="${p.fur2}" opacity="0.5"/>
        <circle cx="85" cy="75" r="6" fill="${p.fur2}" opacity="0.5"/>
        <ellipse cx="60" cy="82" rx="16" ry="9" fill="#FFFFFF" opacity="0.6"/>`;
    case 'kama':
      return `
        <ellipse cx="60" cy="82" rx="18" ry="11" fill="${p.fur2}" opacity="0.5"/>
        <ellipse cx="60" cy="82" rx="8" ry="2.8" fill="#D81B60"/>
        <circle cx="72" cy="73" r="1.6" fill="#8A7A94"/>`;
  }
}

function eye(cx: number, cat: CatSkin, level: number): string {
  const cy = 60;
  const eyeColor = cat.palette.eye;
  switch (level) {
    case 0: {
      const stroke = cat.id === 'siam' ? cat.palette.fur : isDark(cat.palette.fur) ? cat.palette.innerEar : OUTLINE;
      return `<path d="M${cx - 9} ${cy} q9 7 18 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>`;
    }
    case 1:
      return `
        <ellipse cx="${cx}" cy="${cy}" rx="9" ry="9" fill="#FFFFFF" stroke="${OUTLINE}" stroke-width="2.5"/>
        <circle cx="${cx}" cy="${cy}" r="6.5" fill="${eyeColor}"/>
        <circle cx="${cx}" cy="${cy}" r="2.8" fill="${OUTLINE}"/>
        <circle cx="${cx - 2.5}" cy="${cy - 2.5}" r="1.6" fill="#FFFFFF"/>`;
    case 2:
      return `
        <ellipse cx="${cx}" cy="${cy}" rx="9.5" ry="10" fill="#FFFFFF" stroke="${OUTLINE}" stroke-width="2.5"/>
        <circle cx="${cx}" cy="${cy}" r="7.2" fill="${eyeColor}"/>
        <circle cx="${cx}" cy="${cy}" r="4.8" fill="${OUTLINE}"/>
        <circle cx="${cx - 2.5}" cy="${cy - 2.5}" r="2" fill="#FFFFFF"/>`;
    case 3:
      return `
        <ellipse cx="${cx}" cy="${cy}" rx="9.5" ry="8" fill="#FFFFFF" stroke="${OUTLINE}" stroke-width="2.5"/>
        <circle cx="${cx}" cy="${cy}" r="6.5" fill="${eyeColor}"/>
        <ellipse cx="${cx}" cy="${cy}" rx="1.7" ry="5.5" fill="${OUTLINE}"/>
        <circle cx="${cx - 2.5}" cy="${cy - 2.5}" r="1.3" fill="#FFFFFF"/>`;
    case 4:
      return `
        <ellipse cx="${cx}" cy="${cy}" rx="10" ry="7" fill="#FFE5E5" stroke="${OUTLINE}" stroke-width="2.5"/>
        <path d="M${cx - 8} ${cy - 2} l3 2 M${cx + 8} ${cy + 2} l-3 -1" stroke="#E53935" stroke-width="1.2"/>
        <circle cx="${cx}" cy="${cy}" r="6.2" fill="${eyeColor}"/>
        <ellipse cx="${cx}" cy="${cy}" rx="1.3" ry="5.5" fill="${OUTLINE}"/>`;
    default:
      return `
        <circle cx="${cx}" cy="${cy}" r="12" fill="${eyeColor}" opacity="0.35"/>
        <ellipse cx="${cx}" cy="${cy}" rx="10" ry="7" fill="${eyeColor}" stroke="${OUTLINE}" stroke-width="2.5"/>
        <circle cx="${cx}" cy="${cy}" r="1.6" fill="${OUTLINE}"/>`;
  }
}

function brows(level: number): string {
  if (level < 2) return '';
  const spec: Record<number, string> = {
    2: 'M36 47 l16 2',
    3: 'M34 44 l18 6',
    4: 'M31 41 l21 9',
    5: 'M29 38 l23 12',
  };
  const d = spec[level];
  const [, x1, y1, dx, dy] = /M(\d+) (\d+) l(\d+) (\d+)/.exec(d)!.map(Number);
  const mirrored = `M${mx(x1)} ${y1} l${-dx} ${dy}`;
  return `<path d="${d} ${mirrored}" fill="none" stroke="${OUTLINE}" stroke-width="${level >= 4 ? 3.5 : 2.5}" stroke-linecap="round"/>`;
}

function mouth(level: number): string {
  const red = '#8B2E3E';
  switch (level) {
    case 0:
      return `<path d="M50 82 h20" fill="none" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 1:
      return `<path d="M52 80 q4 5 8 0 q4 5 8 0" fill="none" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 2:
      return `
        <path d="M52 80 q4 5 8 0 q4 5 8 0" fill="none" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="60" cy="87" rx="4" ry="3" fill="${red}" stroke="${OUTLINE}" stroke-width="2"/>`;
    case 3:
      return `
        <path d="M46 80 q14 16 28 0 Z" fill="${red}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M49 81 l3 6 l3 -6 Z M65 81 l3 6 l3 -6 Z" fill="#FFFFFF"/>`;
    case 4:
      return `
        <path d="M42 78 q18 22 36 0 Z" fill="${red}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M46 79 l4 9 l4 -9 Z M66 79 l4 9 l4 -9 Z" fill="#FFFFFF"/>`;
    default:
      return `
        <path d="M40 76 q20 28 40 0 Z" fill="${red}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
        <ellipse cx="60" cy="91" rx="7" ry="4" fill="#E05A6A"/>
        <path d="M44 77 l4 11 l4 -11 Z M68 77 l4 11 l4 -11 Z" fill="#FFFFFF"/>`;
  }
}

function whiskers(level: number): string {
  const down = level >= 4 ? 4 : 0;
  return `<path d="M36 76 L16 ${72 + down} M36 81 L16 ${84 + down} M84 76 L104 ${72 + down} M84 81 L104 ${84 + down}" fill="none" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round"/>`;
}

function spikes(cat: CatSkin, count: number): string {
  const angles = [150, 168, 186, 354, 12, 30].slice(0, count);
  const parts: string[] = [];
  for (const deg of angles) {
    const a = (deg * Math.PI) / 180;
    const d = (3 * Math.PI) / 180;
    const pt = (ang: number, k: number) => `${(HEAD.cx + HEAD.rx * k * Math.cos(ang)).toFixed(1)},${(HEAD.cy + HEAD.ry * k * Math.sin(ang)).toFixed(1)}`;
    parts.push(`<polygon points="${pt(a - d, 0.98)} ${pt(a, 1.3)} ${pt(a + d, 0.98)}" fill="${cat.palette.fur}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>`);
  }
  return parts.join('');
}

function effects(cat: CatSkin, level: number): string {
  switch (level) {
    case 0:
      return `
        <text x="88" y="34" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="11" fill="${OUTLINE}" opacity="0.7">z</text>
        <text x="97" y="22" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="15" fill="${OUTLINE}" opacity="0.7">Z</text>`;
    case 3:
      return `
        <path d="M98 40 c-4 6 -6 9 -6 12 a6 6 0 0 0 12 0 c0 -3 -2 -6 -6 -12 Z" fill="#7FD3F7" stroke="${OUTLINE}" stroke-width="2"/>
        <path d="M8 54 h12 M6 64 h10" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round"/>`;
    case 4:
      return spikes(cat, 6);
    case 5:
      return `
        ${spikes(cat, 6)}
        <path d="M14 30 l-6 12 h7 l-5 12 l12 -16 h-7 l5 -8 Z" fill="#FFD400" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M108 26 l-6 12 h7 l-5 12 l12 -16 h-7 l5 -8 Z" fill="#FFD400" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M4 80 h14 M2 90 h12 M104 80 h14 M106 90 h12" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>`;
    default:
      return '';
  }
}

interface Accessory {
  /** Рисуется после головы и отметин, до глаз: шляпа, шлем, причёска. */
  behind: string;
  /** Рисуется поверх всего: очки, усы, ресницы. */
  front: string;
  /** Оставить уши: для очков, усов и причёсок, которые не закрывают макушку. */
  keepEars?: boolean;
}

/** Головной убор: часть под глазами (шляпа) и поверх (очки). Наклоняется с ростом ярости через wrap(). */
function accessory(cat: CatSkin, level: number): Accessory {
  const tilt = -EAR_ANGLE[level] * 0.35;
  const lift = level >= 4 ? -3 : 0;
  const wrap = (inner: string) => `<g transform="translate(0 ${lift}) rotate(${tilt.toFixed(1)} 60 44)">${inner}</g>`;
  switch (cat.accessory) {
    case 'helmet': {
      const glow = (0.55 + 0.09 * level).toFixed(2);
      return {
        behind: wrap(`
          <path d="M20 58 C20 24 40 12 60 12 C80 12 100 24 100 58 Z" fill="#5B7A99" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M24 36 h72" stroke="#3F5873" stroke-width="3"/>
          <rect x="24" y="38" width="72" height="11" rx="5.5" fill="#FF8C1A" stroke="${OUTLINE}" stroke-width="2.5" opacity="${glow}"/>
          <path d="M98 36 l9 -14" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="107" cy="22" r="3.5" fill="#FF3B3B" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="34" cy="28" r="2.2" fill="#C9D6E5"/><circle cx="86" cy="28" r="2.2" fill="#C9D6E5"/>`),
        front: '',
      };
    }
    case 'wizard':
      return {
        behind: wrap(`
          <path d="M28 34 C40 18 50 8 76 4 C70 14 84 22 92 34 Z" fill="#3B3650" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M36 32 Q60 38 86 32" fill="none" stroke="#D4A017" stroke-width="4"/>
          <ellipse cx="60" cy="36" rx="46" ry="8" fill="#2E2A3A" stroke="${OUTLINE}" stroke-width="3"/>`),
        front: `
          <circle cx="45" cy="60" r="12" fill="none" stroke="${OUTLINE}" stroke-width="2.5"/>
          <circle cx="75" cy="60" r="12" fill="none" stroke="${OUTLINE}" stroke-width="2.5"/>
          <path d="M57 60 h6 M33 58 l-8 -3 M87 58 l8 -3" fill="none" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>`,
      };
    case 'deerstalker':
      return {
        behind: wrap(`
          <path d="M18 50 C18 22 36 10 60 10 C84 10 102 22 102 50 Z" fill="#8D6E4C" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M24 42 L54 14 M40 48 L80 12 M62 48 L96 22 M28 30 L54 48 M50 16 L92 44" fill="none" stroke="#6B4F35" stroke-width="2"/>
          <path d="M12 50 Q60 68 108 50 Z" fill="#6B4F35" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M50 12 l10 6 l10 -6" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="60" cy="17" r="3.5" fill="#6B4F35" stroke="${OUTLINE}" stroke-width="2"/>`),
        front: '',
      };
    case 'beard':
      // Усы поверх рта (закрывают верхнюю губу), борода — в markings(), чтобы оскал был виден. Не наклоняются.
      return {
        behind: '',
        front: `<path d="M60 81 C56 75 46 74 40 80 C44 85 54 86 60 82 C66 86 76 85 80 80 C74 74 64 75 60 81 Z" fill="${cat.palette.fur2}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>`,
        keepEars: true,
      };
    case 'shades':
      // Золотые очки-авиаторы с тонированными стёклами: глаза просвечивают, на 5-м уровне светятся сквозь них. Съезжают набок с яростью.
      return {
        behind: '',
        front: wrap(`
          <path d="M35 53 h20 a3 3 0 0 1 3 3 v6 a8 8 0 0 1 -8 8 h-10 a8 8 0 0 1 -8 -8 v-6 a3 3 0 0 1 3 -3 Z" fill="#3A2A55" opacity="0.78" stroke="#F5C542" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M65 53 h20 a3 3 0 0 1 3 3 v6 a8 8 0 0 1 -8 8 h-10 a8 8 0 0 1 -8 -8 v-6 a3 3 0 0 1 3 -3 Z" fill="#3A2A55" opacity="0.78" stroke="#F5C542" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M58 57 h4 M32 56 l-8 -4 M88 56 l8 -4" fill="none" stroke="#F5C542" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M38 57 l6 -2 M68 57 l6 -2" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>`),
        keepEars: true,
      };
    case 'roundgold':
      // Круглые золотые очки на носу: не наклоняются.
      return {
        behind: '',
        front: `
          <circle cx="45" cy="60" r="11.5" fill="none" stroke="#D4A82A" stroke-width="2.5"/>
          <circle cx="75" cy="60" r="11.5" fill="none" stroke="#D4A82A" stroke-width="2.5"/>
          <path d="M56.5 59 q3.5 -3 7 0 M33.5 58 l-9 -3 M86.5 58 l9 -3" fill="none" stroke="#D4A82A" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M38 53 a9 9 0 0 1 5 -3 M68 53 a9 9 0 0 1 5 -3" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>`,
        keepEars: true,
      };
    case 'curls': {
      // Кудри по верху головы (подпрыгивают с яростью), уши торчат из причёски. Ресницы лиловые: чёрные на чёрной шерсти не видны.
      const hair = '#4A2F3C';
      const shine = '#7A5468';
      return {
        behind: wrap(`
          <g fill="${hair}" stroke="${OUTLINE}" stroke-width="2.5">
            <circle cx="30" cy="48" r="9"/><circle cx="40" cy="38" r="10"/><circle cx="52" cy="31" r="11"/>
            <circle cx="66" cy="29" r="11"/><circle cx="79" cy="35" r="10"/><circle cx="90" cy="46" r="9"/>
            <circle cx="24" cy="60" r="7"/><circle cx="96" cy="60" r="7"/>
          </g>
          <g fill="${shine}" opacity="0.9">
            <circle cx="42" cy="34" r="3"/><circle cx="55" cy="26" r="3.5"/><circle cx="69" cy="25" r="3.5"/><circle cx="82" cy="31" r="3"/><circle cx="27" cy="45" r="2.5"/>
          </g>`),
        front: `<path d="M35 53 l-6 -4 M36 57 l-7 -2 M85 53 l6 -4 M84 57 l7 -2" fill="none" stroke="#B48EAD" stroke-width="2" stroke-linecap="round"/>`,
        keepEars: true,
      };
    }
    default:
      return { behind: '', front: '' };
  }
}

/** Разметка портрета для уровня ярости 0..5 (внутренность svg viewBox 0 0 120 120). */
export function renderFace(level: number, cat: CatSkin): string {
  const lvl = Math.max(0, Math.min(5, level));
  const p = cat.palette;
  const acc = accessory(cat, lvl);
  return `
    <circle cx="60" cy="60" r="58" fill="${BG_BY_LEVEL[lvl]}" stroke="${OUTLINE}" stroke-width="3"/>
    ${cat.accessory && !acc.keepEars ? '' : ears(cat, lvl)}
    <ellipse cx="${HEAD.cx}" cy="${HEAD.cy}" rx="${HEAD.rx}" ry="${HEAD.ry}" fill="${p.fur}" stroke="${OUTLINE}" stroke-width="3"/>
    ${markings(cat)}
    ${effects(cat, lvl)}
    ${acc.behind}
    ${eye(45, cat, lvl)}
    ${eye(75, cat, lvl)}
    ${brows(lvl)}
    <path d="M56 72 h8 l-4 5 Z" fill="${p.nose}" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round"/>
    ${whiskers(lvl)}
    ${mouth(lvl)}
    ${acc.front}`;
}

/** Портрет в HUD: перерисовывается при смене уровня или кота. */
export class PortraitView {
  private readonly svg: SVGSVGElement;
  private level = -1;
  private catId = '';

  constructor(
    private readonly container: HTMLElement,
    private cat: CatSkin,
  ) {
    container.innerHTML = '<svg viewBox="0 0 120 120" class="portrait__svg" xmlns="http://www.w3.org/2000/svg"></svg>';
    this.svg = container.querySelector('svg') as SVGSVGElement;
    this.setLevel(1);
  }

  setCat(cat: CatSkin): void {
    this.cat = cat;
    this.render();
  }

  setLevel(level: number): void {
    if (level === this.level && this.catId === this.cat.id) return;
    this.level = level;
    this.render();
    this.container.classList.toggle('portrait--shake-2', level === 4);
    this.container.classList.toggle('portrait--shake-4', level === 5);
    this.container.classList.toggle('portrait--pulse', level === 5);
  }

  private render(): void {
    this.catId = this.cat.id;
    this.svg.innerHTML = renderFace(this.level, this.cat);
  }
}
