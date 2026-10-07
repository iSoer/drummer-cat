interface Tracked {
  anim: Animation;
  onEnd?: () => void;
  done: boolean;
}

/**
 * Группа прерываемых анимаций WAAPI.
 * Все анимации идут с fill: forwards; при завершении (естественном или через finishAll)
 * вызывается onEnd, который фиксирует конечное состояние в inline-стилях, после чего анимация снимается.
 */
export class AnimGroup {
  private list: Tracked[] = [];

  run(
    el: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions,
    onEnd?: () => void,
  ): Animation {
    const anim = el.animate(keyframes, { fill: 'forwards', ...options });
    const entry: Tracked = { anim, onEnd, done: false };
    this.list.push(entry);
    anim.onfinish = () => this.settle(entry);
    return anim;
  }

  /** Мгновенно довести все активные анимации до конца (в порядке запуска). */
  finishAll(): void {
    let guard = 0;
    while (this.list.length > 0 && guard++ < 200) {
      const entry = this.list.shift()!;
      this.settle(entry, true);
    }
  }

  get size(): number {
    return this.list.length;
  }

  private settle(entry: Tracked, forced = false): void {
    if (entry.done) return;
    entry.done = true;
    if (!forced) {
      const i = this.list.indexOf(entry);
      if (i >= 0) this.list.splice(i, 1);
    }
    entry.onEnd?.();
    entry.anim.cancel();
  }
}
