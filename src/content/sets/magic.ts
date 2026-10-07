import type { ObjectSet } from '../types';

export const MAGIC: ObjectSet = {
  id: 'magic',
  name: 'Школа магии',
  description: 'Зелья, котёл и доспехи',
  backgroundSymbol: '#bg-magic',
  wallColor: '#5C5866',
  objects: [
    { id: 'potion', name: 'Зелье', hp: 1, weight: 10, size: 'M', symbol: '#obj-potion', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'glass', color: '#9C27B0' },
    { id: 'crystalball', name: 'Хрустальный шар', hp: 1, weight: 10, size: 'M', symbol: '#obj-crystalball', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'glass', color: '#D7E9FF' },
    { id: 'quill', name: 'Перо и чернила', hp: 1, weight: 10, size: 'S', symbol: '#obj-quill', breakable: true, hitText: 'ПЛЮХ', sfx: 'splash', color: '#263238' },
    { id: 'snitch', name: 'Крылатый мяч', hp: 1, weight: 10, size: 'S', symbol: '#obj-snitch', breakable: false, hitText: 'ВЖИК', sfx: 'metal', color: '#FFC107' },
    { id: 'frog', name: 'Шоколадная лягушка', hp: 1, weight: 10, size: 'S', symbol: '#obj-frog', breakable: false, hitText: 'ШЛЁП', sfx: 'thud', color: '#6D4C41' },
    { id: 'scroll', name: 'Свиток', hp: 1, weight: 8, size: 'M', symbol: '#obj-scroll', breakable: false, hitText: 'ШЛЁП', sfx: 'thud', color: '#F3E5AB' },
    { id: 'spellbook', name: 'Книга заклинаний', hp: 2, weight: 5, size: 'M', symbol: '#obj-spellbook', breakable: false, hitText: 'БУХ', sfx: 'thud', color: '#4A148C' },
    { id: 'hat', name: 'Волшебная шляпа', hp: 2, weight: 5, size: 'M', symbol: '#obj-hat', breakable: false, hitText: 'УФ', sfx: 'thud', color: '#795548' },
    { id: 'cauldron', name: 'Котёл', hp: 3, weight: 3, size: 'L', symbol: '#obj-cauldron', breakable: false, hitText: 'БАМ', sfx: 'metal', color: '#37474F' },
    { id: 'armor', name: 'Рыцарские доспехи', hp: 5, weight: 1, size: 'L', symbol: '#obj-armor', breakable: true, hitText: 'БА-БАХ', sfx: 'crash', color: '#B0BEC5' },
  ],
};
