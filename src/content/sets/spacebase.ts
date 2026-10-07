import type { ObjectSet } from '../types';

export const SPACEBASE: ObjectSet = {
  id: 'spacebase',
  name: 'Космобаза',
  description: 'Кристаллы, дроны и командный терминал',
  backgroundSymbol: '#bg-spacebase',
  wallColor: '#3B4452',
  objects: [
    { id: 'crystal', name: 'Кристалл', hp: 1, weight: 10, size: 'M', symbol: '#obj-crystal', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'glass', color: '#4FC3F7' },
    { id: 'datapad', name: 'Датапад', hp: 1, weight: 10, size: 'M', symbol: '#obj-datapad', breakable: true, hitText: 'ХРУСЬ', sfx: 'glass', color: '#4CFF88' },
    { id: 'spacemug', name: 'Термокружка', hp: 1, weight: 10, size: 'S', symbol: '#obj-spacemug', breakable: false, hitText: 'ТУК', sfx: 'metal', color: '#6E7F94' },
    { id: 'cell', name: 'Энергоячейка', hp: 1, weight: 10, size: 'S', symbol: '#obj-cell', breakable: false, hitText: 'ПШШ', sfx: 'metal', color: '#4A5A6E' },
    { id: 'beacon', name: 'Маяк', hp: 1, weight: 10, size: 'S', symbol: '#obj-beacon', breakable: false, hitText: 'ТУК', sfx: 'thud', color: '#FF8C1A' },
    { id: 'ration', name: 'Паёк', hp: 1, weight: 8, size: 'S', symbol: '#obj-ration', breakable: false, hitText: 'ШЛЁП', sfx: 'thud', color: '#A0A8B0' },
    { id: 'canister', name: 'Баллон с газом', hp: 2, weight: 5, size: 'M', symbol: '#obj-canister', breakable: false, hitText: 'БРЯМ', sfx: 'metal', color: '#3DBB6A' },
    { id: 'drone', name: 'Ремонтный дрон', hp: 2, weight: 5, size: 'M', symbol: '#obj-drone', breakable: false, hitText: 'ЩЁЛК', sfx: 'metal', color: '#FF8C1A' },
    { id: 'turret', name: 'Турель', hp: 3, weight: 3, size: 'L', symbol: '#obj-turret', breakable: false, hitText: 'БАМ', sfx: 'metal', color: '#4A5A6E' },
    { id: 'console', name: 'Командный терминал', hp: 5, weight: 1, size: 'L', symbol: '#obj-console', breakable: true, hitText: 'БА-БАХ', sfx: 'crash', color: '#4A5A6E' },
  ],
};
