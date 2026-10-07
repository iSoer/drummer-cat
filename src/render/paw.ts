import { AnimGroup } from './anim';
import { PAW_PIVOT } from './scene';

const RAISED = 'rotate(20deg)';
const HIT = 'rotate(-6deg) scale(1.05)';

/** Лапа кота: замах, удар, возврат, «дыхание» в покое. */
export class PawView {
  private idleAnim: Animation | null = null;

  constructor(
    private readonly g: SVGGElement,
    private readonly use: SVGUseElement,
    private readonly anims: AnimGroup,
  ) {
    g.style.transformOrigin = `${PAW_PIVOT.x}px ${PAW_PIVOT.y}px`;
    g.style.transform = RAISED;
  }

  setSkin(symbol: string): void {
    this.use.setAttribute('href', symbol);
  }

  /** Удар: по завершении вызывается onImpact, затем лапа возвращается в замах. */
  swing(speedMul: number, onImpact: () => void): void {
    this.stopIdle();
    this.anims.run(this.g, [{ transform: RAISED }, { transform: HIT }], { duration: 70 * speedMul, easing: 'ease-in' }, () => {
      this.g.style.transform = HIT;
      onImpact();
      this.returnToReady(speedMul);
    });
  }

  private returnToReady(speedMul: number): void {
    this.anims.run(
      this.g,
      [{ transform: HIT }, { transform: 'rotate(24deg)', offset: 0.75 }, { transform: RAISED }],
      { duration: 140 * speedMul, easing: 'ease-out' },
      () => {
        this.g.style.transform = RAISED;
      },
    );
  }

  /** Покачивание в покое (уровень «Сон»). */
  setIdle(on: boolean): void {
    if (on && !this.idleAnim) {
      if (this.anims.size > 0) return;
      this.idleAnim = this.g.animate(
        [{ transform: RAISED }, { transform: 'rotate(23deg)' }, { transform: RAISED }],
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
