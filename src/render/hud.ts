import { LEVELS } from '../core/tps';

const nf = new Intl.NumberFormat('ru-RU');

/** Верхняя панель: счётчик, шкала ярости, подпись уровня. */
export class Hud {
  private readonly counter: HTMLElement;
  private readonly bar: HTMLElement;
  private readonly label: HTMLElement;
  private shownFury = 0;
  private targetFury = 0;
  private lastCount = -1;

  constructor(root: ParentNode = document) {
    this.counter = root.querySelector('#counter') as HTMLElement;
    this.bar = root.querySelector('#fury-bar') as HTMLElement;
    this.label = root.querySelector('#fury-label') as HTMLElement;
  }

  setCounter(n: number, bump = false): void {
    if (n === this.lastCount) return;
    this.lastCount = n;
    this.counter.textContent = nf.format(n);
    if (bump) {
      this.counter.classList.remove('counter__value--bump');
      void this.counter.offsetWidth;
      this.counter.classList.add('counter__value--bump');
    }
  }

  setFuryTarget(fury: number): void {
    this.targetFury = fury;
  }

  setLevel(level: number): void {
    this.label.textContent = LEVELS[level].name;
    this.bar.dataset.level = String(level);
  }

  /** Вызывается из rAF: сглаживание шкалы. */
  tick(): void {
    const diff = this.targetFury - this.shownFury;
    if (Math.abs(diff) < 0.002) {
      if (this.shownFury !== this.targetFury) {
        this.shownFury = this.targetFury;
        this.bar.style.width = `${this.shownFury * 100}%`;
      }
      return;
    }
    this.shownFury += diff * 0.18;
    this.bar.style.width = `${this.shownFury * 100}%`;
  }
}
