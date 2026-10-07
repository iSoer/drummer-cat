import type { KnockVector } from '../content/strikes';
import type { GameObject } from '../content/types';
import { AnimGroup } from './anim';
import { FAR_OFFSET_X, FAR_OFFSET_Y, FAR_SCALE, OBJ_BASE, OBJ_SIZE } from './scene';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_DMG = 4;
const PIP_R = 4.5;
const PIP_GAP = 14;

const NEAR_POSE = 'translate(0, 0) scale(1)';
const FAR_POSE = `translate(${FAR_OFFSET_X}px, ${FAR_OFFSET_Y}px) scale(${FAR_SCALE})`;
/** Доля шага, за которую силуэт растворяется, а предмет проявляется. */
const REVEAL_AT = 0.6;
const MID_POSE = `translate(${FAR_OFFSET_X * (1 - REVEAL_AT)}px, ${FAR_OFFSET_Y * (1 - REVEAL_AT)}px) scale(${FAR_SCALE + (1 - FAR_SCALE) * REVEAL_AT})`;

interface Slot {
  g: SVGGElement;
  use: SVGUseElement;
}

/**
 * Предметы на столе: два слота для текущего/улетающего предмета, два слота-силуэта
 * для следующего предмета вдали, пипсы HP и слои повреждений.
 */
export class ObjectView {
  private readonly slots: Slot[];
  private active = 0;
  private readonly ghosts: Slot[];
  private activeGhost = 0;
  private readonly pips: SVGGElement;
  private readonly pipEls: SVGCircleElement[] = [];

  constructor(
    layer: SVGGElement,
    private readonly anims: AnimGroup,
  ) {
    this.ghosts = [this.makeSlot(layer, true), this.makeSlot(layer, true)];
    this.slots = [this.makeSlot(layer, false), this.makeSlot(layer, false)];
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

  private makeSlot(layer: SVGGElement, ghost: boolean): Slot {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', ghost ? 'obj obj--ghost' : 'obj');
    g.style.transformOrigin = `${OBJ_BASE.x}px ${OBJ_BASE.y}px`;
    g.style.visibility = 'hidden';
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('x', String(OBJ_BASE.x - OBJ_SIZE / 2));
    use.setAttribute('y', String(OBJ_BASE.y - OBJ_SIZE * 0.9));
    use.setAttribute('width', String(OBJ_SIZE));
    use.setAttribute('height', String(OBJ_SIZE));
    if (ghost) use.setAttribute('filter', 'url(#silhouette)');
    else use.style.transformOrigin = `${OBJ_BASE.x}px ${OBJ_BASE.y}px`;
    g.appendChild(use);
    layer.appendChild(g);
    return { g, use };
  }

  private get cur(): Slot {
    return this.slots[this.active];
  }

  /** Показать текущий предмет и силуэт следующего сразу, без анимации. */
  show(obj: GameObject, hp: number, maxHp: number, next: GameObject): void {
    const s = this.cur;
    this.fill(s, obj, hp, maxHp);
    s.g.style.transform = NEAR_POSE;
    s.g.style.opacity = '1';
    s.g.style.visibility = 'visible';
    this.updatePips(hp, maxHp);
    this.pips.style.display = maxHp > 1 ? '' : 'none';

    const gh = this.ghosts[this.activeGhost];
    gh.use.setAttribute('href', next.symbol);
    gh.g.style.transform = FAR_POSE;
    gh.g.style.opacity = '1';
    gh.g.style.visibility = 'visible';
    this.ghosts[1 - this.activeGhost].g.style.visibility = 'hidden';
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
        this.cur.g.style.transform = NEAR_POSE;
      },
    );
  }

  /** Снос по траектории стиля удара: текущий слот улетает, активным становится другой слот. */
  knock(speedMul: number, v: KnockVector): number {
    const s = this.cur;
    this.pips.style.display = 'none';
    const dur = 320 * speedMul;
    const lift = v.lift ?? 0;
    const at = (t: number, rotT: number, sc: number, op: number, offset: number): Keyframe => {
      // Подъём максимален в первой трети полёта и исчезает к концу.
      const up = lift * Math.sin(Math.min(1, t) * Math.PI);
      return {
        transform: `translate(${(v.dx * t).toFixed(1)}px, ${(v.dy * t + up).toFixed(1)}px) rotate(${(v.rot * rotT).toFixed(1)}deg) scale(${sc})`,
        opacity: op,
        offset,
      };
    };
    const frames: Keyframe[] = v.squash
      ? [
          at(0, 0, 1, 1, 0),
          { transform: 'translate(0, 0) rotate(0deg) scale(1.18, 0.78)', opacity: 1, offset: 0.14 },
          at(0.3, 0.3, 0.98, 1, 0.42),
          at(0.7, 0.72, 0.85, 1, 0.74),
          at(1, 1, 0.7, 0, 1),
        ]
      : [at(0, 0, 1, 1, 0), at(0.35, 0.36, 0.95, 1, 0.35), at(0.72, 0.73, 0.85, 1, 0.7), at(1, 1, 0.7, 0, 1)];
    this.anims.run(s.g, frames, { duration: dur, easing: 'ease-in' }, () => {
      s.g.style.visibility = 'hidden';
      s.g.style.transform = NEAR_POSE;
      s.g.style.opacity = '1';
    });
    this.active = 1 - this.active;
    return dur;
  }

  /**
   * Шаг вперёд: силуэт следующего предмета едет с дальней позиции на ближнюю и растворяется,
   * на его месте проявляется цветной предмет; вдали проявляется силуэт нового следующего.
   */
  appear(obj: GameObject, hp: number, maxHp: number, next: GameObject, speedMul: number, delay = 0): void {
    const dur = 260 * speedMul;
    const easing = 'ease-out';

    const s = this.cur;
    this.fill(s, obj, hp, maxHp);
    s.g.style.transform = FAR_POSE;
    s.g.style.opacity = '0';
    s.g.style.visibility = 'visible';
    this.updatePips(hp, maxHp);
    this.pips.style.display = 'none';
    this.anims.run(
      s.g,
      [
        { transform: FAR_POSE, opacity: 0, offset: 0 },
        { transform: MID_POSE, opacity: 1, offset: REVEAL_AT },
        { transform: NEAR_POSE, opacity: 1, offset: 1 },
      ],
      { duration: dur, delay, easing },
      () => {
        s.g.style.transform = NEAR_POSE;
        s.g.style.opacity = '1';
        this.pips.style.display = maxHp > 1 ? '' : 'none';
      },
    );

    const gh = this.ghosts[this.activeGhost];
    this.anims.run(
      gh.g,
      [
        { transform: FAR_POSE, opacity: 1, offset: 0 },
        { transform: MID_POSE, opacity: 0, offset: REVEAL_AT },
        { transform: NEAR_POSE, opacity: 0, offset: 1 },
      ],
      { duration: dur, delay, easing },
      () => {
        gh.g.style.visibility = 'hidden';
        gh.g.style.transform = FAR_POSE;
        gh.g.style.opacity = '1';
      },
    );

    const nextGhost = this.ghosts[1 - this.activeGhost];
    nextGhost.use.setAttribute('href', next.symbol);
    nextGhost.g.style.transform = FAR_POSE;
    nextGhost.g.style.opacity = '0';
    nextGhost.g.style.visibility = 'visible';
    this.anims.run(
      nextGhost.g,
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: dur * 0.6, delay: delay + dur * 0.4, easing },
      () => {
        nextGhost.g.style.opacity = '1';
      },
    );
    this.activeGhost = 1 - this.activeGhost;
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
