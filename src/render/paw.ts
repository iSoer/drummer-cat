import type { StrikeStyle } from '../content/strikes';
import { AnimGroup } from './anim';
import { PAW_PIVOT } from './scene';

/** Лапа кота: замах, удар и возврат по стилю удара кота, «дыхание» в покое. */
export class PawView {
  private style: StrikeStyle;
  private power = 0;
  /** Текущая зафиксированная поза (inline transform). */
  private pose: string;
  private idleAnim: Animation | null = null;

  constructor(
    private readonly g: SVGGElement,
    private readonly use: SVGUseElement,
    private readonly anims: AnimGroup,
    style: StrikeStyle,
  ) {
    this.style = style;
    this.pose = style.raised(0);
    g.style.transformOrigin = `${PAW_PIVOT.x}px ${PAW_PIVOT.y}px`;
    g.style.transform = this.pose;
  }

  setSkin(symbol: string, style: StrikeStyle): void {
    this.use.setAttribute('href', symbol);
    this.style = style;
    this.easeToRaised();
  }

  /** Сила удара 0..1: меняет позу замаха и амплитуду. */
  setPower(power: number): void {
    if (power === this.power) return;
    this.power = power;
    if (this.anims.size === 0 && !this.idleAnim) this.easeToRaised();
  }

  /** Удар: по завершении вызывается onImpact, затем лапа возвращается в замах. */
  swing(speedMul: number, onImpact: () => void): void {
    this.stopIdle();
    const style = this.style;
    const p = this.power;
    const frames = style.swing(p, this.pose);
    const hitPose = frames[frames.length - 1].transform as string;
    this.anims.run(this.g, frames, { duration: style.swingMs * speedMul, easing: style.swingEasing }, () => {
      this.g.style.transform = hitPose;
      this.pose = hitPose;
      onImpact();
      this.returnToReady(speedMul);
    });
  }

  private returnToReady(speedMul: number): void {
    const style = this.style;
    const to = style.raised(this.power);
    this.anims.run(this.g, style.back(this.power, to), { duration: style.backMs * speedMul, easing: 'ease-out' }, () => {
      this.g.style.transform = to;
      this.pose = to;
    });
  }

  /** Плавно перевести лапу в позу замаха текущего стиля и силы. */
  private easeToRaised(): void {
    this.stopIdle();
    const to = this.style.raised(this.power);
    if (to === this.pose) return;
    this.anims.run(this.g, [{ transform: this.pose }, { transform: to }], { duration: 160, easing: 'ease-out' }, () => {
      this.g.style.transform = to;
      this.pose = to;
    });
  }

  /** Покачивание в покое (уровень «Сон»). */
  setIdle(on: boolean): void {
    if (on && !this.idleAnim) {
      if (this.anims.size > 0) return;
      const base = this.style.raised(this.power);
      this.g.style.transform = base;
      this.pose = base;
      this.idleAnim = this.g.animate(
        [{ transform: base }, { transform: this.style.raised(this.power, 3) }, { transform: base }],
        { duration: 3000, iterations: Infinity, easing: 'ease-in-out' },
      );
    } else if (!on) {
      this.stopIdle();
    }
  }

  private stopIdle(): void {
    if (this.idleAnim) {
      this.idleAnim.cancel();
      this.idleAnim = null;
    }
  }
}
