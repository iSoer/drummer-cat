import type { CatSkin } from '../content/types';

const OUTLINE = '#1F1A17';
const BG_BY_LEVEL = ['#CFD8DC', '#E3EDF5', '#FCE4B8', '#FFB74D', '#E53935', '#B71C1C'];
const EAR_ANGLE = [10, 0, -6, 20, 45, 62];
const HEAD = { cx: 60, cy: 66, rx: 40, ry: 34 };

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
    case 'ginger':
      return `
        <path d="M46 36 l5 14 l5 -14 Z M55 33 l5 17 l5 -17 Z M64 36 l5 14 l5 -14 Z" fill="${p.fur2}"/>
        <ellipse cx="60" cy="82" rx="20" ry="12" fill="#FFF8EE"/>`;
    case 'coal':
      return `<ellipse cx="60" cy="82" rx="18" ry="11" fill="${p.fur2}" opacity="0.55"/>`;
    case 'siam':
      return `<ellipse cx="60" cy="76" rx="24" ry="19" fill="${p.fur2}"/>`;
  }
}

function eye(cx: number, cat: CatSkin, level: number): string {
  const cy = 60;
  const eyeColor = cat.palette.eye;
  switch (level) {
    case 0: {
      const stroke = cat.id === 'siam' ? cat.palette.fur : OUTLINE;
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

/** Разметка портрета для уровня ярости 0..5 (внутренность svg viewBox 0 0 120 120). */
export function renderFace(level: number, cat: CatSkin): string {
  const lvl = Math.max(0, Math.min(5, level));
  const p = cat.palette;
  return `
    <circle cx="60" cy="60" r="58" fill="${BG_BY_LEVEL[lvl]}" stroke="${OUTLINE}" stroke-width="3"/>
    ${ears(cat, lvl)}
    <ellipse cx="${HEAD.cx}" cy="${HEAD.cy}" rx="${HEAD.rx}" ry="${HEAD.ry}" fill="${p.fur}" stroke="${OUTLINE}" stroke-width="3"/>
    ${markings(cat)}
    ${effects(cat, lvl)}
    ${eye(45, cat, lvl)}
    ${eye(75, cat, lvl)}
    ${brows(lvl)}
    <path d="M56 72 h8 l-4 5 Z" fill="${p.nose}" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round"/>
    ${whiskers(lvl)}
    ${mouth(lvl)}`;
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
