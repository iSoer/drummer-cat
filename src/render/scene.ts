import { AnimGroup } from './anim';

export const SCENE_W = 360;
export const SCENE_H = 640;
/** Точка опоры предмета в координатах сцены. */
export const OBJ_BASE = { x: 180, y: 480 };
/** Размер отрисовки символа предмета (viewBox 200×200). */
export const OBJ_SIZE = 200;
/** Точка вращения лапы («плечо»). */
export const PAW_PIVOT = { x: 410, y: 700 };

export interface SceneParts {
  svg: SVGSVGElement;
  world: SVGGElement;
  bg: SVGGElement;
  bgUse: SVGUseElement;
  objects: SVGGElement;
  fx: SVGGElement;
  vignette: SVGRectElement;
  paw: SVGGElement;
  pawUse: SVGUseElement;
  hint: SVGTextElement;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Собрать SVG-сцену внутри контейнера и вернуть ссылки на слои. */
export function buildScene(container: HTMLElement): SceneParts {
  container.innerHTML = `
<svg class="scene" viewBox="0 0 ${SCENE_W} ${SCENE_H}" preserveAspectRatio="xMidYMid slice" xmlns="${SVG_NS}">
  <defs>
    <radialGradient id="scene-vignette" cx="50%" cy="50%" r="72%">
      <stop offset="50%" stop-color="#B3001B" stop-opacity="0"/>
      <stop offset="100%" stop-color="#B3001B" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <g class="world">
    <g class="bg"><use class="bg__use" href="#bg-kitchen" width="${SCENE_W}" height="${SCENE_H}"/></g>
    <g class="objects"></g>
  </g>
  <g class="fx"></g>
  <rect class="vignette" width="${SCENE_W}" height="${SCENE_H}" fill="url(#scene-vignette)" opacity="0"/>
  <g class="paw"><use class="paw__use" href="#paw-ginger" x="137" y="347" width="240" height="320"/></g>
  <text class="hint" x="${OBJ_BASE.x}" y="${OBJ_BASE.y - 200}" text-anchor="middle">Тапай!</text>
</svg>`;
  const q = <T extends Element>(sel: string) => container.querySelector(sel) as T;
  return {
    svg: q<SVGSVGElement>('svg.scene'),
    world: q<SVGGElement>('g.world'),
    bg: q<SVGGElement>('g.bg'),
    bgUse: q<SVGUseElement>('use.bg__use'),
    objects: q<SVGGElement>('g.objects'),
    fx: q<SVGGElement>('g.fx'),
    vignette: q<SVGRectElement>('rect.vignette'),
    paw: q<SVGGElement>('g.paw'),
    pawUse: q<SVGUseElement>('use.paw__use'),
    hint: q<SVGTextElement>('text.hint'),
  };
}

/** «Шаг вперёд»: качание камеры и параллакс фона. */
export function stepBob(parts: SceneParts, anims: AnimGroup, speedMul: number, delay = 0): void {
  const dur = 260 * speedMul;
  anims.run(
    parts.world,
    [
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(10px) scale(1.03)', offset: 0.5 },
      { transform: 'translateY(0) scale(1)' },
    ],
    { duration: dur, delay, easing: 'ease-in-out' },
  );
  anims.run(
    parts.bg,
    [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)', offset: 0.5 }, { transform: 'translateY(0)' }],
    { duration: dur, delay, easing: 'ease-in-out' },
  );
}

export function setBackground(parts: SceneParts, symbol: string): void {
  parts.bgUse.setAttribute('href', symbol);
}

export function setVignette(parts: SceneParts, level: number): void {
  const opacity = level >= 5 ? 0.35 : level >= 4 ? 0.2 : 0;
  parts.vignette.style.opacity = String(opacity);
}
