import type { ObjectSet } from '../types';

export const KITCHEN: ObjectSet = {
  id: 'kitchen',
  name: 'Кухня',
  description: 'Кружки, тарелки и микроволновка',
  backgroundSymbol: '#bg-kitchen',
  wallColor: '#F6E7C1',
  objects: [
    { id: 'mug', name: 'Кружка', hp: 1, weight: 10, size: 'S', symbol: '#obj-mug', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'ceramic', color: '#E85D4A' },
    { id: 'glass', name: 'Стакан', hp: 1, weight: 10, size: 'S', symbol: '#obj-glass', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'glass', color: '#BFE9FF' },
    { id: 'plate', name: 'Тарелка', hp: 1, weight: 10, size: 'M', symbol: '#obj-plate', breakable: true, hitText: 'ХРУСЬ', sfx: 'ceramic', color: '#FFFFFF' },
    { id: 'salt', name: 'Солонка', hp: 1, weight: 10, size: 'S', symbol: '#obj-salt', breakable: false, hitText: 'ТУК', sfx: 'thud', color: '#F4F4F4' },
    { id: 'apple', name: 'Яблоко', hp: 1, weight: 10, size: 'S', symbol: '#obj-apple', breakable: false, hitText: 'ШЛЁП', sfx: 'thud', color: '#E3342F' },
    { id: 'egg', name: 'Яйцо', hp: 1, weight: 8, size: 'S', symbol: '#obj-egg', breakable: true, hitText: 'ЧПОК', sfx: 'splash', color: '#FFF4E0' },
    { id: 'kettle', name: 'Чайник', hp: 2, weight: 5, size: 'M', symbol: '#obj-kettle', breakable: false, hitText: 'БРЯМ', sfx: 'metal', color: '#3D8BFF' },
    { id: 'jam', name: 'Банка варенья', hp: 2, weight: 5, size: 'M', symbol: '#obj-jam', breakable: true, hitText: 'ХРЯСЬ', sfx: 'glass', color: '#A52A6B' },
    { id: 'pot', name: 'Кастрюля', hp: 3, weight: 3, size: 'L', symbol: '#obj-pot', breakable: false, hitText: 'БАМ', sfx: 'metal', color: '#8A8F9A' },
    { id: 'microwave', name: 'Микроволновка', hp: 5, weight: 1, size: 'L', symbol: '#obj-microwave', breakable: false, hitText: 'БА-БАХ', sfx: 'crash', color: '#D9D9D9' },
  ],
};
