import type { StrikeId } from './strikes';

/** Идентификаторы котов. */
export type CatId = 'ginger' | 'coal' | 'siam' | 'marine' | 'wizard' | 'sherlock' | 'vanya' | 'elman' | 'ksyusha' | 'kama';
/** Идентификаторы наборов предметов. */
export type SetId = 'kitchen' | 'desk' | 'living' | 'spacebase' | 'magic' | 'detective';
/** Тип синтезированного звука при сносе. */
export type SfxKind = 'glass' | 'ceramic' | 'thud' | 'metal' | 'splash' | 'crash';

export interface CatPalette {
  fur: string;
  fur2: string;
  eye: string;
  nose: string;
  innerEar: string;
  pad: string;
}

export interface CatSkin {
  id: CatId;
  name: string;
  description: string;
  palette: CatPalette;
  /** Символ лапы в спрайте, например '#paw-ginger'. */
  pawSymbol: string;
  /** Стиль удара (см. content/strikes.ts). */
  strike: StrikeId;
  /** Аксессуар на портрете (см. accessory() в render/portrait.ts): шляпы скрывают уши и наклоняются с ростом ярости; очки, усы и причёски уши оставляют. */
  accessory?: 'helmet' | 'wizard' | 'deerstalker' | 'beard' | 'shades' | 'roundgold' | 'curls';
}

export interface GameObject {
  id: string;
  name: string;
  hp: 1 | 2 | 3 | 5;
  weight: number;
  size: 'S' | 'M' | 'L';
  /** Символ предмета в спрайте, например '#obj-mug'. */
  symbol: string;
  breakable: boolean;
  hitText: string;
  sfx: SfxKind;
  /** Основной цвет заливки: используется для осколков. */
  color: string;
}

export interface ObjectSet {
  id: SetId;
  name: string;
  description: string;
  backgroundSymbol: string;
  /** Цвет стены для превью. */
  wallColor: string;
  objects: GameObject[];
}
