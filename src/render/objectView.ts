import type { GameObject } from '../content/types';
import { AnimGroup } from './anim';
import { OBJ_BASE, OBJ_SIZE } from './scene';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_DMG = 4;
const PIP_R = 4.5;
const PIP_GAP = 14;

interface Slot {
  g: SVGGElement;
  use: SVGUseElement;
}

/** Предмет на столе: два слота (текущий и улетающий), пипсы HP, слои повреждений. */
export class ObjectView {
  private readonly slots: Slot[];
  private active = 0;
  private readonly pips: SVGGElement;
  private readonly pipEls: SVGCircleElement[] = [];

  constructor(
    layer: SVGGElement,
    private readonly anims: AnimGroup,
  ) {
    this.slots = [this.makeSlot(layer), this.makeSlot(layer)];
    this.pips = document.createElementNS(SVG_NS, 'g');
    this.pips.setAttribute('class', 'pips');
    for (let i = 0; i < 5; i++) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('r', String(PIP_R));
      c.setAttribute('cy', String(OBJ_BASE.y + 18));
      c.style.display = 'none';
      this.pips.appendChild(c);
      this.pipEls.push(c);
    }
    layer.appendChild(this.pips);
  }

  private makeSlot(layer: SVGGElement): Slot {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'obj');
    g.style.transformOrigin = `${OBJ_BASE.x}px ${OBJ_BASE.y}px`;
    g.style.visibility = 'hidden';
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('x', String(OBJ_BASE.x - OBJ_SIZE / 2));
    use.setAttribute('y', String(OBJ_BASE.y - OBJ_SIZE * 0.9));
    use.setAttribute('width', String(OBJ_SIZE));
    use.setAttribute('height', String(OBJ_SIZE));
    use.style.transformOrigin = `${OBJ_BASE.x}px ${OBJ_BASE.y}px`;
    g.appendChild(use);
    layer.appendChild(g);
    return { g, use };
  }

  private get cur(): Slot {
    return this.slots[this.active];
  }

  /** Показать предмет сразу, без анимации. */
  show(obj: GameObject, hp: number, maxHp: number): void {
    const s = this.cur;
    this.fill(s, obj, hp, maxHp);
    s.g.style.transform = 'none';
    s.g.style.opacity = '1';
    s.g.style.visibility = 'visible';
    this.updatePips(hp, maxHp);
    this.pips.style.display = maxHp > 1 ? '' : 'none';
  }

  setHp(hp: number, maxHp: number): void {
    this.applyDamage(this.cur.use, hp, maxHp);
    this.updatePips(hp, maxHp);
  }

  wobble(speedMul: number): void {
    this.anims.run(
      this.cur.g,
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-8px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 160 * speedMul, easing: 'ease-out' },
      () => {
        this.cur.g.style.transform = 'none';
      },
    );
  }

  /** Снос: текущий слот улетает, активным становится другой слот. */
  knock(speedMul: number): number {
    const s = this.cur;
    this.pips.style.display = 'none';
    const dur = 320 * speedMul;
    this.anims.run(
      s.g,
      [
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1, offset: 0 },
        { transform: 'translate(-60px, 10px) rotate(-40deg) scale(0.95)', opacity: 1, offset: 0.35 },
        { transform: 'translate(-110px, 130px) rotate(-80deg) scale(0.85)', opacity: 1, offset: 0.7 },
        { transform: 'translate(-140px, 260px) rotate(-110deg) scale(0.7)', opacity: 0, offset: 1 },
      ],
      { duration: dur, easing: 'ease-in' },
      () => {
        s.g.style.visibility = 'hidden';
        s.g.style.transform = 'none';
        s.g.style.opacity = '1';
      },
    );
    this.active = 1 - this.active;
    return dur;
  }

  /** Появление нового предмета (после шага). */
  appear(obj: GameObject, hp: number, maxHp: number, speedMul: number, delay = 0): void {
    const s = this.cur;
    this.fill(s, obj, hp, maxHp);
    s.g.style.transform = 'translateY(40px) scale(0.6)';
    s.g.style.opacity = '0';
    s.g.style.visibility = 'visible';
    this.updatePips(hp, maxHp);
    this.pips.style.display = 'none';
    this.anims.run(
      s.g,
      [
        { transform: 'translateY(40px) scale(0.6)', opacity: 0 },
        { transform: 'translateY(0) scale(1)', opacity: 1 },
      ],
      { duration: 260 * speedMul, delay, easing: 'ease-out' },
      () => {
        s.g.style.transform = 'none';
        s.g.style.opacity = '1';
        this.pips.style.display = maxHp > 1 ? '' : 'none';
      },
    );
  }

  private fill(s: Slot, obj: GameObject, hp: number, maxHp: number): void {
    s.use.setAttribute('href', obj.symbol);
    this.applyDamage(s.use, hp, maxHp);
  }

  private applyDamage(use: SVGUseElement, hp: number, maxHp: number): void {
    const lost = maxHp - hp;
    for (let i = 1; i <= MAX_DMG; i++) {
      use.style.setProperty(`--dmg${i}`, lost >= i ? 'inline' : 'none');
    }
    use.style.transform = lost > 0 ? `rotate(${lost * 4}deg)` : 'none';
  }

  private updatePips(hp: number, maxHp: number): void {
    const startX = OBJ_BASE.x - ((maxHp - 1) * PIP_GAP) / 2;
    this.pipEls.forEach((c, i) => {
      if (i >= maxHp) {
        c.style.display = 'none';
        return;
      }
      c.style.display = '';
      c.setAttribute('cx', String(startX + i * PIP_GAP));
      c.setAttribute('class', i < hp ? 'pip pip--full' : 'pip pip--empty');
    });
  }
}
