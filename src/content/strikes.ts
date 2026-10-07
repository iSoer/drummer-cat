/** Стиль удара кота: позы лапы, траектория сноса, эффекты. Сила 0..1 растёт с уровнем ярости. */
export type StrikeId = 'swipe' | 'jab' | 'slam' | 'pump' | 'spell' | 'deduce';

export interface KnockVector {
  dx: number;
  dy: number;
  rot: number;
  /** Предмет сначала сплющивается (удар сверху). */
  squash: boolean;
  /** Подъём вверх в первой трети полёта (отрицательное число), px. */
  lift?: number;
}

export interface StrikeStyle {
  id: StrikeId;
  name: string;
  hint: string;
  swingMs: number;
  backMs: number;
  swingEasing: string;
  /** Направление линий скорости, градусы: 0 — вправо, 90 — вниз. null — без линий. */
  speedAngle: number | null;
  /** Угол следов когтей, градусы. null — стиль без когтей. */
  clawAngle: number | null;
  /** Множитель тряски камеры. */
  shakeMul: number;
  /** Точка удара в координатах сцены. */
  impact: { x: number; y: number };
  /** Цвет вспышки удара (по умолчанию жёлтый). */
  burstColor?: string;
  /** Минимальная сила вспышки: у магии искры есть всегда. */
  minBurst?: number;
  /** Эффект во время замаха: искры от палочки или прицельное кольцо. */
  preImpact?: 'bolt' | 'ring';
  /** Откуда летят искры (для 'bolt'), координаты сцены. */
  wandTip?: { x: number; y: number };
  /** Поза замаха; lift — дополнительный подъём в градусах (для «дыхания»). */
  raised(power: number, lift?: number): string;
  /** Кадры удара от текущей позы `from` до позы контакта. */
  swing(power: number, from: string): Keyframe[];
  /** Кадры возврата от позы контакта к позе замаха `to`. */
  back(power: number, to: string): Keyframe[];
  /** Траектория сноса предмета. */
  knock(power: number): KnockVector;
}

/** Сила удара по уровню ярости 0..5. */
export function powerOf(level: number): number {
  return [0, 0, 0.25, 0.5, 0.75, 1][Math.max(0, Math.min(5, level))];
}

const f = (n: number) => n.toFixed(2);

const SWIPE: StrikeStyle = {
  id: 'swipe',
  name: 'Размашистый',
  hint: 'Боковой мах через весь стол',
  swingMs: 70,
  backMs: 140,
  swingEasing: 'cubic-bezier(0.4, 0, 1, 0.6)',
  speedAngle: 195,
  clawAngle: -18,
  shakeMul: 1,
  impact: { x: 186, y: 440 },
  raised: (p, lift = 0) => `translate(${f(-36 * p)}px, ${f(12 * p)}px) rotate(${f(20 + 10 * p + lift)}deg)`,
  swing(p, from) {
    return [{ transform: from, offset: 0 }, { transform: hitSwipe(p), offset: 1 }];
  },
  back(p, to) {
    return [
      { transform: hitSwipe(p), offset: 0 },
      { transform: `translate(${f(-36 * p)}px, ${f(12 * p)}px) rotate(${f(25 + 14 * p)}deg)`, offset: 0.7 },
      { transform: to, offset: 1 },
    ];
  },
  knock: (p) => ({ dx: -(140 + 90 * p), dy: 260 - 50 * p, rot: -(110 + 80 * p), squash: false }),
};
function hitSwipe(p: number): string {
  return `rotate(${f(-6 - 12 * p)}deg) scale(${f(1.05 + 0.08 * p)})`;
}

const JAB: StrikeStyle = {
  id: 'jab',
  name: 'Тычок',
  hint: 'Короткий прямой выпад',
  swingMs: 50,
  backMs: 110,
  swingEasing: 'cubic-bezier(0.5, 0, 0.9, 0.4)',
  speedAngle: 215,
  clawAngle: null,
  shakeMul: 0.8,
  impact: { x: 182, y: 432 },
  raised: (p, lift = 0) => `translate(${f(26 - 6 * p)}px, ${f(38 - 8 * p)}px) rotate(${f(10 + 4 * p + lift)}deg)`,
  swing(p, from) {
    return [{ transform: from, offset: 0 }, { transform: hitJab(p), offset: 1 }];
  },
  back(p, to) {
    return [
      { transform: hitJab(p), offset: 0 },
      { transform: `translate(${f(34 - 6 * p)}px, ${f(48 - 8 * p)}px) rotate(${f(13 + 5 * p)}deg)`, offset: 0.6 },
      { transform: to, offset: 1 },
    ];
  },
  knock: (p) => ({ dx: -(200 + 90 * p), dy: 170 - 30 * p, rot: -(70 + 110 * p), squash: false }),
};
function hitJab(p: number): string {
  return `translate(${f(-34 - 2 * p)}px, ${f(-30 + 4 * p)}px) rotate(${f(-2 - 1 * p)}deg) scale(${f(1.06 + 0.06 * p)})`;
}

const SLAM: StrikeStyle = {
  id: 'slam',
  name: 'Сверху',
  hint: 'Шлепок сверху всей лапой',
  swingMs: 80,
  backMs: 180,
  swingEasing: 'cubic-bezier(0.6, 0, 1, 0.5)',
  speedAngle: 95,
  clawAngle: 78,
  shakeMul: 1.4,
  impact: { x: 180, y: 452 },
  raised: (p, lift = 0) => `rotate(${f(8 + 4 * p + lift)}deg) translate(${f(-20 - 10 * p)}px, ${f(-90 - 30 * p - lift * 2)}px)`,
  swing(p, from) {
    return [
      { transform: from, offset: 0 },
      { transform: `rotate(${f(9 + 4 * p)}deg) translate(${f(-22 - 10 * p)}px, ${f(-104 - 44 * p)}px) scale(${f(1 + 0.04 * p)})`, offset: 0.3 },
      { transform: hitSlam(p), offset: 1 },
    ];
  },
  back(p, to) {
    return [
      { transform: hitSlam(p), offset: 0 },
      { transform: `rotate(${f(-2 - 2 * p)}deg) translate(-16px, ${f(30 + 16 * p)}px) scale(${f(1.1 + 0.1 * p)}, 0.94)`, offset: 0.15 },
      { transform: `rotate(${f(9 + 4 * p)}deg) translate(${f(-22 - 10 * p)}px, ${f(-100 - 34 * p)}px)`, offset: 0.75 },
      { transform: to, offset: 1 },
    ];
  },
  knock: (p) => ({ dx: -(70 + 50 * p), dy: 290, rot: -(140 + 60 * p), squash: true }),
};
function hitSlam(p: number): string {
  return `rotate(${f(-4 - 2 * p)}deg) translate(-16px, ${f(26 + 16 * p)}px) scale(${f(1.1 + 0.1 * p)}, ${f(1 + 0.04 * p)})`;
}

const PUMP: StrikeStyle = {
  id: 'pump',
  name: 'Гидравлика',
  hint: 'Прямой удар бронированной лапой с откатом',
  swingMs: 60,
  backMs: 150,
  swingEasing: 'cubic-bezier(0.6, 0, 1, 0.4)',
  speedAngle: 200,
  clawAngle: null,
  shakeMul: 1.6,
  impact: { x: 180, y: 432 },
  raised: (p, lift = 0) => `translate(${f(20 - 4 * p)}px, ${f(30 - 6 * p)}px) rotate(${f(6 + 3 * p + lift)}deg)`,
  swing(p, from) {
    return [
      { transform: from, offset: 0 },
      { transform: `translate(${f(40 + 6 * p)}px, ${f(56 + 8 * p)}px) rotate(${f(8 + 3 * p)}deg)`, offset: 0.35 },
      { transform: hitPump(p), offset: 1 },
    ];
  },
  back(p, to) {
    return [
      { transform: hitPump(p), offset: 0 },
      { transform: `translate(${f(36 + 6 * p)}px, ${f(50 + 8 * p)}px) rotate(${f(9 + 3 * p)}deg)`, offset: 0.5 },
      { transform: to, offset: 1 },
    ];
  },
  knock: (p) => ({ dx: -(240 + 100 * p), dy: 150 - 20 * p, rot: -(60 + 80 * p), squash: false }),
};
function hitPump(p: number): string {
  return `translate(${f(-30 - 6 * p)}px, ${f(-34 - 4 * p)}px) rotate(${f(-2 - 1 * p)}deg) scale(${f(1.08 + 0.06 * p)})`;
}

const SPELL: StrikeStyle = {
  id: 'spell',
  name: 'Заклинание',
  hint: 'Взмах палочкой, предмет взмывает и падает',
  swingMs: 90,
  backMs: 160,
  swingEasing: 'cubic-bezier(0.3, 0, 0.6, 1)',
  speedAngle: null,
  clawAngle: null,
  shakeMul: 0.6,
  impact: { x: 180, y: 436 },
  burstColor: '#B388FF',
  minBurst: 0.3,
  preImpact: 'bolt',
  wandTip: { x: 236, y: 258 },
  raised: (p, lift = 0) => `rotate(${f(14 + 3 * p + lift)}deg) translate(0px, ${f(-30 - 10 * p)}px)`,
  swing(p, from) {
    return [
      { transform: from, offset: 0 },
      { transform: `rotate(${f(8 + 2 * p)}deg) translate(${f(-26 - 8 * p)}px, ${f(-44 - 12 * p)}px)`, offset: 0.55 },
      { transform: hitSpell(p), offset: 1 },
    ];
  },
  back(p, to) {
    return [
      { transform: hitSpell(p), offset: 0 },
      { transform: `rotate(${f(17 + 3 * p)}deg) translate(4px, ${f(-36 - 10 * p)}px)`, offset: 0.6 },
      { transform: to, offset: 1 },
    ];
  },
  knock: (p) => ({ dx: -(100 + 60 * p), dy: 220, rot: 160 + 100 * p, squash: false, lift: -(60 + 50 * p) }),
};
function hitSpell(p: number): string {
  return `rotate(${f(16 + 3 * p)}deg) translate(${f(-10 - 4 * p)}px, ${f(-24 - 10 * p)}px)`;
}

const DEDUCE: StrikeStyle = {
  id: 'deduce',
  name: 'Дедукция',
  hint: 'Прицельный щелчок, предмет аккуратно опрокидывается',
  swingMs: 60,
  backMs: 170,
  swingEasing: 'cubic-bezier(0.5, 0, 0.8, 0.5)',
  speedAngle: null,
  clawAngle: null,
  shakeMul: 0.5,
  impact: { x: 180, y: 424 },
  burstColor: '#FFFFFF',
  preImpact: 'ring',
  raised: (p, lift = 0) => `rotate(${f(16 + 4 * p + lift)}deg) translate(-10px, ${f(-40 - 12 * p)}px)`,
  swing(p, from) {
    return [{ transform: from, offset: 0 }, { transform: hitDeduce(p), offset: 1 }];
  },
  back(p, to) {
    return [
      { transform: hitDeduce(p), offset: 0 },
      { transform: `rotate(${f(20 + 4 * p)}deg) translate(-12px, ${f(-46 - 12 * p)}px)`, offset: 0.65 },
      { transform: to, offset: 1 },
    ];
  },
  knock: (p) => ({ dx: -(50 + 30 * p), dy: 240, rot: -(85 + 15 * p), squash: false }),
};
function hitDeduce(p: number): string {
  return `rotate(${f(-2 - 2 * p)}deg) translate(-20px, ${f(10 + 4 * p)}px) scale(${f(1.02 + 0.04 * p)})`;
}

export const STRIKES: Record<StrikeId, StrikeStyle> = { swipe: SWIPE, jab: JAB, slam: SLAM, pump: PUMP, spell: SPELL, deduce: DEDUCE };

export function getStrike(id: StrikeId): StrikeStyle {
  return STRIKES[id];
}
