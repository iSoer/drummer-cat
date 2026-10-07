import { CATS } from '../content/cats';
import { getStrike } from '../content/strikes';
import { SETS } from '../content/sets';
import type { CatId, SetId } from '../content/types';
import { renderFace } from '../render/portrait';

export interface SkinsCallbacks {
  onCat(id: CatId): void;
  onSet(id: SetId): void;
}

function catCard(id: CatId, name: string, desc: string, strike: string, face: string, selected: boolean): string {
  return `
    <button class="card ${selected ? 'card--selected' : ''}" type="button" data-cat="${id}">
      <svg class="card__preview" viewBox="0 0 120 120">${face}</svg>
      <span class="card__name">${name}</span>
      <span class="card__desc">${desc}</span>
      <span class="card__strike">Удар: ${strike}</span>
    </button>`;
}

function setCard(set: (typeof SETS)[number], selected: boolean): string {
  const objs = [set.objects[0], set.objects[6], set.objects[9]];
  const uses = objs
    .map((o, i) => `<use href="${o.symbol}" x="${8 + i * 92}" y="18" width="100" height="100"/>`)
    .join('');
  return `
    <button class="card ${selected ? 'card--selected' : ''}" type="button" data-set="${set.id}">
      <svg class="card__preview card__preview--wide" viewBox="0 0 300 120">
        <rect width="300" height="120" rx="12" fill="${set.wallColor}"/>
        <rect y="100" width="300" height="20" fill="#1F1A17" opacity="0.15"/>
        ${uses}
      </svg>
      <span class="card__text">
        <span class="card__name">${set.name}</span>
        <span class="card__desc">${set.description}</span>
      </span>
    </button>`;
}

/** Содержимое шторки «Скины»: вкладки «Кот» и «Предметы». */
export function buildSkinsPanel(currentCat: CatId, currentSet: SetId, cb: SkinsCallbacks): HTMLElement {
  const el = document.createElement('div');
  el.className = 'skins';
  el.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tabs__tab tabs__tab--active" type="button" data-tab="cats">Кот</button>
      <button class="tabs__tab" type="button" data-tab="sets">Предметы</button>
    </div>
    <div class="tabs__panel" data-panel="cats">
      <div class="cards">${CATS.map((c) => catCard(c.id, c.name, c.description, getStrike(c.strike).name, renderFace(1, c), c.id === currentCat)).join('')}</div>
    </div>
    <div class="tabs__panel" data-panel="sets" hidden>
      <div class="cards cards--list">${SETS.map((s) => setCard(s, s.id === currentSet)).join('')}</div>
    </div>`;

  el.querySelectorAll<HTMLButtonElement>('.tabs__tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.tabs__tab').forEach((t) => t.classList.toggle('tabs__tab--active', t === tab));
      el.querySelectorAll<HTMLElement>('.tabs__panel').forEach((p) => {
        p.hidden = p.dataset.panel !== tab.dataset.tab;
      });
    });
  });

  const select = (btn: HTMLElement) => {
    const group = btn.parentElement!;
    group.querySelectorAll('.card').forEach((c) => c.classList.toggle('card--selected', c === btn));
  };
  el.querySelectorAll<HTMLButtonElement>('[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      select(btn);
      cb.onCat(btn.dataset.cat as CatId);
    });
  });
  el.querySelectorAll<HTMLButtonElement>('[data-set]').forEach((btn) => {
    btn.addEventListener('click', () => {
      select(btn);
      cb.onSet(btn.dataset.set as SetId);
    });
  });
  return el;
}
