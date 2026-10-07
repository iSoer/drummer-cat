import type { CatId, CatSkin } from './types';

export const CATS: readonly CatSkin[] = [
  {
    id: 'ginger',
    name: 'Рыжик',
    description: 'Рыжий полосатый, зелёные глаза',
    palette: { fur: '#F2A541', fur2: '#D47B1E', eye: '#5DBB63', nose: '#E8827A', innerEar: '#F6C9B8', pad: '#F4A6A0' },
    pawSymbol: '#paw-ginger',
    strike: 'swipe',
  },
  {
    id: 'coal',
    name: 'Уголёк',
    description: 'Чёрный, жёлтые глаза',
    palette: { fur: '#2B2B33', fur2: '#4A4A57', eye: '#F5C542', nose: '#1A1A1F', innerEar: '#6E5A66', pad: '#3A3A44' },
    pawSymbol: '#paw-coal',
    strike: 'jab',
  },
  {
    id: 'siam',
    name: 'Сима',
    description: 'Сиамская, голубые глаза',
    palette: { fur: '#F1E3C9', fur2: '#5B3A29', eye: '#6EC1E4', nose: '#5B3A29', innerEar: '#8B5E4A', pad: '#5B3A29' },
    pawSymbol: '#paw-siam',
    strike: 'slam',
  },
  {
    id: 'marine',
    name: 'Сержант',
    description: 'Космодесантник в силовой броне',
    palette: { fur: '#8C7B6B', fur2: '#5E514A', eye: '#FF8C1A', nose: '#4A3F38', innerEar: '#B59A88', pad: '#5E514A' },
    pawSymbol: '#paw-marine',
    strike: 'pump',
    accessory: 'helmet',
  },
  {
    id: 'wizard',
    name: 'Гарри',
    description: 'Юный волшебник в очках',
    palette: { fur: '#2E2A3A', fur2: '#4A4560', eye: '#4CAF50', nose: '#4A3F5C', innerEar: '#7A6E8C', pad: '#4A4560' },
    pawSymbol: '#paw-wizard',
    strike: 'spell',
    accessory: 'wizard',
  },
  {
    id: 'sherlock',
    name: 'Шерлок',
    description: 'Сыщик с Бейкер-стрит',
    palette: { fur: '#8A98A8', fur2: '#6B7886', eye: '#E8A33D', nose: '#5C5C66', innerEar: '#C7B1B6', pad: '#6B7886' },
    pawSymbol: '#paw-sherlock',
    strike: 'deduce',
    accessory: 'deerstalker',
  },
];

export function getCat(id: CatId): CatSkin {
  return CATS.find((c) => c.id === id) ?? CATS[0];
}
