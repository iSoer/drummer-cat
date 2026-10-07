/** Описание уровня ярости. */
export interface FuryLevel {
  level: number;
  name: string;
  /** Нижняя граница TPS (строго больше), для уровня 1 — любой тап. */
  minTps: number;
  speedMul: number;
}

export const LEVELS: readonly FuryLevel[] = [
  { level: 0, name: 'Сон', minTps: -1, speedMul: 1 },
  { level: 1, name: 'Спокоен', minTps: 0, speedMul: 1 },
  { level: 2, name: 'Интерес', minTps: 2, speedMul: 0.8 },
  { level: 3, name: 'Азарт', minTps: 4, speedMul: 0.65 },
  { level: 4, name: 'Ярость', minTps: 6, speedMul: 0.5 },
  { level: 5, name: 'Берсерк', minTps: 9, speedMul: 0.4 },
];

export interface TpsOptions {
  /** Окно измерения, мс. */
  windowMs?: number;
  /** Через сколько мс без тапов уровень падает в «Сон». */
  idleAfterMs?: number;
  /** Сколько мс TPS должен держаться ниже порога, чтобы уровень понизился. */
  downDelayMs?: number;
  /** Размер кольцевого буфера. */
  capacity?: number;
}

export interface TpsSnapshot {
  tps: number;
  level: number;
  fury: number;
  speedMul: number;
}

/** Измеритель темпа тапов с уровнями ярости и гистерезисом. */
export class TpsMeter {
  private readonly windowMs: number;
  private readonly idleAfterMs: number;
  private readonly downDelayMs: number;
  private readonly buf: Float64Array;
  private head = 0;
  private count = 0;
  private lastTapAt = -Infinity;
  private belowSince: number | null = null;

  tps = 0;
  level = 0;

  constructor(opts: TpsOptions = {}) {
    this.windowMs = opts.windowMs ?? 1500;
    this.idleAfterMs = opts.idleAfterMs ?? 2000;
    this.downDelayMs = opts.downDelayMs ?? 500;
    this.buf = new Float64Array(opts.capacity ?? 64);
  }

  get speedMul(): number {
    return LEVELS[this.level].speedMul;
  }

  get fury(): number {
    return Math.min(1, Math.max(0, this.tps / 10));
  }

  get levelName(): string {
    return LEVELS[this.level].name;
  }

  /** Зарегистрировать тап и пересчитать состояние. */
  tap(now: number): TpsSnapshot {
    this.buf[this.head] = now;
    this.head = (this.head + 1) % this.buf.length;
    if (this.count < this.buf.length) this.count++;
    this.lastTapAt = now;
    return this.update(now);
  }

  /** Пересчитать TPS и уровень на момент `now`. */
  update(now: number): TpsSnapshot {
    let inWindow = 0;
    const from = now - this.windowMs;
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head - 1 - i + this.buf.length) % this.buf.length;
      if (this.buf[idx] >= from) inWindow++;
      else break;
    }
    this.tps = inWindow / (this.windowMs / 1000);

    const raw = this.rawLevel(now);
    if (raw > this.level) {
      this.level = raw;
      this.belowSince = null;
    } else if (raw < this.level) {
      if (this.belowSince === null) this.belowSince = now;
      else if (now - this.belowSince >= this.downDelayMs) {
        this.level = raw;
        this.belowSince = null;
      }
    } else {
      this.belowSince = null;
    }
    return this.snapshot();
  }

  snapshot(): TpsSnapshot {
    return { tps: this.tps, level: this.level, fury: this.fury, speedMul: this.speedMul };
  }

  private rawLevel(now: number): number {
    if (now - this.lastTapAt >= this.idleAfterMs) return 0;
    for (let i = LEVELS.length - 1; i >= 1; i--) {
      if (this.tps > LEVELS[i].minTps) return i;
    }
    return 1;
  }
}
