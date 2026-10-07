import type { StrikeStyle } from '../content/strikes';
import type { GameObject } from '../content/types';
import { randRange } from '../core/rng';
import { AnimGroup } from './anim';
import { OBJ_BASE } from './scene';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SHARD_SHAPES = ['0,-7 7,3 -5,6', '-8,-3 6,-6 4,7 -5,5', '0,-8 6,0 0,8 -6,0', '-7,-5 7,-2 2,7', '-6,-6 6,-6 0,8'];

/** Восьмилучевая звезда радиуса 1 для вспышки удара. */
function starPoints(spikes = 8, inner = 0.42): string {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 1 : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    pts.push(`${(Math.cos(a) * r).toFixed(3)},${(Math.sin(a) * r).toFixed(3)}`);
  }
  return pts.join(' ');
}

/** Осколки и всплывающие надписи. Пулы узлов, без создания DOM на тап. */
export class Fx {
  private readonly shards: SVGPolygonElement[] = [];
  private shardIdx = 0;
  private readonly texts: SVGTextElement[] = [];
  private textIdx = 0;
  private readonly bursts: SVGPolygonElement[] = [];
  private burstIdx = 0;
  private readonly lines: SVGLineElement[] = [];
  private lineIdx = 0;
  private readonly claws: SVGGElement[] = [];
  private clawIdx = 0;
  private readonly sparks: SVGPolygonElement[] = [];
  private sparkIdx = 0;
  private readonly rings: SVGCircleElement[] = [];
  private ringIdx = 0;

  constructor(
    layer: SVGGElement,
    private readonly anims: AnimGroup,
  ) {
    for (let i = 0; i < 12; i++) {
      const p = document.createElementNS(SVG_NS, 'polygon');
      p.setAttribute('points', SHARD_SHAPES[i % SHARD_SHAPES.length]);
      p.setAttribute('class', 'shard');
      p.style.visibility = 'hidden';
      layer.appendChild(p);
      this.shards.push(p);
    }
    for (let i = 0; i < 5; i++) {
      const l = document.createElementNS(SVG_NS, 'line');
      l.setAttribute('class', 'speed-line');
      l.style.visibility = 'hidden';
      layer.appendChild(l);
      this.lines.push(l);
    }
    for (let i = 0; i < 2; i++) {
      const b = document.createElementNS(SVG_NS, 'polygon');
      b.setAttribute('class', 'burst');
      b.setAttribute('points', starPoints());
      b.style.visibility = 'hidden';
      layer.appendChild(b);
      this.bursts.push(b);
    }
    for (let i = 0; i < 2; i++) {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'claws');
      for (let j = -1; j <= 1; j++) {
        const l = document.createElementNS(SVG_NS, 'line');
        l.setAttribute('x1', '0');
        l.setAttribute('y1', String(j * 16));
        l.setAttribute('x2', '72');
        l.setAttribute('y2', String(j * 16));
        g.appendChild(l);
      }
      g.style.visibility = 'hidden';
      layer.appendChild(g);
      this.claws.push(g);
    }
    for (let i = 0; i < 6; i++) {
      const sp = document.createElementNS(SVG_NS, 'polygon');
      sp.setAttribute('class', 'spark');
      sp.setAttribute('points', starPoints(4, 0.4));
      sp.style.visibility = 'hidden';
      layer.appendChild(sp);
      this.sparks.push(sp);
    }
    for (let i = 0; i < 2; i++) {
      const r = document.createElementNS(SVG_NS, 'circle');
      r.setAttribute('class', 'focus-ring');
      r.setAttribute('r', '1');
      r.style.visibility = 'hidden';
      layer.appendChild(r);
      this.rings.push(r);
    }
    for (let i = 0; i < 6; i++) {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('class', 'hit-text');
      t.setAttribute('text-anchor', 'middle');
      t.style.visibility = 'hidden';
      layer.appendChild(t);
      this.texts.push(t);
    }
  }

  /** Вспышка-звезда в точке удара; размер растёт с силой. Нет при силе 0. */
  impactBurst(at: { x: number; y: number }, power: number, color = '#FFF6C7'): void {
    if (power <= 0) return;
    const b = this.bursts[this.burstIdx];
    this.burstIdx = (this.burstIdx + 1) % this.bursts.length;
    b.style.fill = color;
    const size = 22 + 50 * power;
    const rot = randRange(-20, 20);
    b.style.visibility = 'visible';
    b.style.transformOrigin = '0 0';
    this.anims.run(
      b,
      [
        { transform: `translate(${at.x}px, ${at.y}px) rotate(${rot}deg) scale(${size * 0.3})`, opacity: 1, offset: 0 },
        { transform: `translate(${at.x}px, ${at.y}px) rotate(${rot + 10}deg) scale(${size})`, opacity: 0.9, offset: 0.45 },
        { transform: `translate(${at.x}px, ${at.y}px) rotate(${rot + 18}deg) scale(${size * 1.25})`, opacity: 0, offset: 1 },
      ],
      { duration: 180, easing: 'ease-out' },
      () => {
        b.style.visibility = 'hidden';
      },
    );
  }

  /** Искры от кончика палочки к точке удара (стиль «Заклинание»). */
  spellBolt(from: { x: number; y: number }, to: { x: number; y: number }, power: number, durationMs: number): void {
    const n = 3 + Math.round(2 * power);
    const dur = Math.max(80, durationMs);
    const colors = ['#B388FF', '#FFD166', '#E1BEE7'];
    for (let i = 0; i < n; i++) {
      const sp = this.sparks[this.sparkIdx];
      this.sparkIdx = (this.sparkIdx + 1) % this.sparks.length;
      sp.style.fill = colors[i % colors.length];
      sp.style.visibility = 'visible';
      sp.style.transformOrigin = '0 0';
      const side = randRange(-30, 30);
      const mx = (from.x + to.x) / 2 + side;
      const my = (from.y + to.y) / 2 - 30 + randRange(-10, 10);
      const sc = 5 + 5 * power + randRange(0, 3);
      this.anims.run(
        sp,
        [
          { transform: `translate(${from.x}px, ${from.y}px) rotate(0deg) scale(${sc * 0.6})`, opacity: 1, offset: 0 },
          { transform: `translate(${mx}px, ${my}px) rotate(90deg) scale(${sc})`, opacity: 1, offset: 0.5 },
          { transform: `translate(${to.x}px, ${to.y}px) rotate(180deg) scale(${sc * 0.5})`, opacity: 0, offset: 1 },
        ],
        { duration: dur, delay: i * dur * 0.12, easing: 'ease-in' },
        () => {
          sp.style.visibility = 'hidden';
        },
      );
    }
  }

  /** Прицельное кольцо, сжимающееся к предмету (стиль «Дедукция»). */
  focusRing(at: { x: number; y: number }, power: number, durationMs: number): void {
    const r = this.rings[this.ringIdx];
    this.ringIdx = (this.ringIdx + 1) % this.rings.length;
    const size = 60 + 20 * power;
    r.style.visibility = 'visible';
    r.style.transformOrigin = '0 0';
    this.anims.run(
      r,
      [
        { transform: `translate(${at.x}px, ${at.y}px) scale(${size * 1.6})`, opacity: 0, offset: 0 },
        { transform: `translate(${at.x}px, ${at.y}px) scale(${size})`, opacity: 1, offset: 0.6 },
        { transform: `translate(${at.x}px, ${at.y}px) scale(${size * 0.8})`, opacity: 0, offset: 1 },
      ],
      { duration: Math.max(140, durationMs + 100), easing: 'ease-out' },
      () => {
        r.style.visibility = 'hidden';
      },
    );
  }

  /** Линии скорости вдоль траектории удара; появляются с силы 0.5. */
  speedLines(style: StrikeStyle, power: number, speedMul: number): void {
    if (power < 0.5 || style.speedAngle === null) return;
    const n = 3 + Math.round(2 * power);
    const a = (style.speedAngle * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const px = -dy;
    const py = dx;
    const len = 30 + 40 * power;
    for (let i = 0; i < n; i++) {
      const l = this.lines[this.lineIdx];
      this.lineIdx = (this.lineIdx + 1) % this.lines.length;
      const back = randRange(70, 150);
      const side = randRange(-40, 40);
      const sx = style.impact.x - dx * back + px * side;
      const sy = style.impact.y - dy * back + py * side;
      l.setAttribute('x1', sx.toFixed(1));
      l.setAttribute('y1', sy.toFixed(1));
      l.setAttribute('x2', (sx + dx * len).toFixed(1));
      l.setAttribute('y2', (sy + dy * len).toFixed(1));
      l.style.visibility = 'visible';
      this.anims.run(
        l,
        [
          { transform: 'translate(0, 0)', opacity: 0.95 },
          { transform: `translate(${(dx * 50).toFixed(1)}px, ${(dy * 50).toFixed(1)}px)`, opacity: 0 },
        ],
        { duration: Math.max(60, 130 * speedMul), easing: 'ease-out' },
        () => {
          l.style.visibility = 'hidden';
        },
      );
    }
  }

  /** Следы когтей в точке удара; появляются с силы 0.75. */
  clawMarks(at: { x: number; y: number }, angle: number, power: number): void {
    if (power < 0.75) return;
    const g = this.claws[this.clawIdx];
    this.clawIdx = (this.clawIdx + 1) % this.claws.length;
    const base = `translate(${at.x - 36}px, ${at.y}px) rotate(${angle}deg)`;
    g.style.visibility = 'visible';
    g.style.transformOrigin = '0 0';
    this.anims.run(
      g,
      [
        { transform: `${base} scale(0.1, 1)`, opacity: 1, offset: 0 },
        { transform: `${base} scale(1, 1)`, opacity: 1, offset: 0.3 },
        { transform: `${base} scale(1, 1)`, opacity: 0.9, offset: 0.7 },
        { transform: `${base} scale(1, 1)`, opacity: 0, offset: 1 },
      ],
      { duration: 320, easing: 'ease-out' },
      () => {
        g.style.visibility = 'hidden';
      },
    );
  }

  /** Разлёт осколков цвета предмета из точки удара; с силой осколков больше и летят дальше. */
  shardsBurst(obj: GameObject, speedMul: number, power = 0): void {
    const n = 4 + Math.floor(Math.random() * 3) + Math.round(3 * power);
    const boost = 1 + 0.6 * power;
    const ox = OBJ_BASE.x;
    const oy = OBJ_BASE.y - 40;
    for (let i = 0; i < n; i++) {
      const p = this.shards[this.shardIdx];
      this.shardIdx = (this.shardIdx + 1) % this.shards.length;
      p.setAttribute('fill', obj.color);
      p.style.visibility = 'visible';
      p.style.transformOrigin = '0 0';
      const dx = randRange(-150, 60) * boost;
      const vy = randRange(-170, -60) * boost;
      const g = 300;
      const rot = randRange(-360, 360);
      const sc = randRange(0.8, 1.6);
      this.anims.run(
        p,
        [
          { transform: `translate(${ox}px, ${oy}px) rotate(0deg) scale(${sc})`, opacity: 1, offset: 0 },
          { transform: `translate(${ox + dx * 0.5}px, ${oy + vy * 0.5 + g * 0.25}px) rotate(${rot * 0.5}deg) scale(${sc})`, opacity: 1, offset: 0.5 },
          { transform: `translate(${ox + dx}px, ${oy + vy + g}px) rotate(${rot}deg) scale(${sc})`, opacity: 0, offset: 1 },
        ],
        { duration: 400 * speedMul, easing: 'linear' },
        () => {
          p.style.visibility = 'hidden';
        },
      );
    }
  }

  /** Всплывающая надпись удара («ДЗЫНЬ»); с силой крупнее, при сильном ударе с «!». */
  hitText(text: string, speedMul: number, power = 0): void {
    const t = this.texts[this.textIdx];
    this.textIdx = (this.textIdx + 1) % this.texts.length;
    t.textContent = power >= 0.75 ? `${text}!` : text;
    t.style.fontSize = `${Math.round(36 + 18 * power)}px`;
    const x = OBJ_BASE.x + randRange(-30, 30);
    const y = OBJ_BASE.y - 60;
    const rot = randRange(-15, 15);
    t.setAttribute('x', String(x));
    t.setAttribute('y', String(y));
    t.style.transformOrigin = `${x}px ${y}px`;
    t.style.visibility = 'visible';
    this.anims.run(
      t,
      [
        { transform: `rotate(${rot}deg) translateY(0) scale(0.7)`, opacity: 0, offset: 0 },
        { transform: `rotate(${rot}deg) translateY(-14px) scale(1.1)`, opacity: 1, offset: 0.25 },
        { transform: `rotate(${rot}deg) translateY(-34px) scale(1)`, opacity: 1, offset: 0.7 },
        { transform: `rotate(${rot}deg) translateY(-50px) scale(1)`, opacity: 0, offset: 1 },
      ],
      { duration: 350 * speedMul, easing: 'ease-out' },
      () => {
        t.style.visibility = 'hidden';
      },
    );
  }
}
