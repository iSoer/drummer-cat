import type { CatId, CatSkin } from './types';

export const CATS: readonly CatSkin[] = [
  {
    id: 'ginger',
    name: 'Рыжик',
    description: 'Рыжий полосатый, зелёные глаза',
    palette: { fur: '#F2A541', fur2: '#D47B1E', eye: '#5DBB63', nose: '#E8827A', innerEar: '#F6C9B8', pad: '#F4A6A0' },
    pawSymbol: '#paw-ginger',
  },
  {
    id: 'coal',
    name: 'Уголёк',
    description: 'Чёрный, жёлтые глаза',
    palette: { fur: '#2B2B33', fur2: '#4A4A57', eye: '#F5C542', nose: '#1A1A1F', innerEar: '#6E5A66', pad: '#3A3A44' },
    pawSymbol: '#paw-coal',
  },
  {
    id: 'siam',
    name: 'Сима',
    description: 'Сиамская, голубые глаза',
    palette: { fur: '#F1E3C9', fur2: '#5B3A29', eye: '#6EC1E4', nose: '#5B3A29', innerEar: '#8B5E4A', pad: '#5B3A29' },
    pawSymbol: '#paw-siam',
  },
];

export function getCat(id: CatId): CatSkin {
  return CATS.find((c) => c.id === id) ?? CATS[0];
}
