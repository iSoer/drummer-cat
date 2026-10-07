import type { GameObject } from '../content/types';
import { randRange } from '../core/rng';
import { AnimGroup } from './anim';
import { OBJ_BASE } from './scene';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SHARD_SHAPES = ['0,-7 7,3 -5,6', '-8,-3 6,-6 4,7 -5,5', '0,-8 6,0 0,8 -6,0', '-7,-5 7,-2 2,7', '-6,-6 6,-6 0,8'];

/** Осколки и всплывающие надписи. Пулы узлов, без создания DOM на тап. */
export class Fx {
  private readonly shards: SVGPolygonElement[] = [];
  private shardIdx = 0;
  private readonly texts: SVGTextElement[] = [];
  private textIdx = 0;

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
    for (let i = 0; i < 6; i++) {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('class', 'hit-text');
      t.setAttribute('text-anchor', 'middle');
      t.style.visibility = 'hidden';
      layer.appendChild(t);
      this.texts.push(t);
    }
  }

  /** Разлёт осколков цвета предмета из точки удара. */
  shardsBurst(obj: GameObject, speedMul: number): void {
    const n = 4 + Math.floor(Math.random() * 3);
    const ox = OBJ_BASE.x;
    const oy = OBJ_BASE.y - 40;
    for (let i = 0; i < n; i++) {
      const p = this.shards[this.shardIdx];
      this.shardIdx = (this.shardIdx + 1) % this.shards.length;
      p.setAttribute('fill', obj.color);
      p.style.visibility = 'visible';
      p.style.transformOrigin = '0 0';
      const dx = randRange(-150, 60);
      const vy = randRange(-170, -60);
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

  /** Всплывающая надпись удара («ДЗЫНЬ»). */
  hitText(text: string, speedMul: number): void {
    const t = this.texts[this.textIdx];
    this.textIdx = (this.textIdx + 1) % this.texts.length;
    t.textContent = text;
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
