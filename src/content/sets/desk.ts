import type { ObjectSet } from '../types';

export const DESK: ObjectSet = {
  id: 'desk',
  name: 'Рабочий стол',
  description: 'Мышки, кофе и монитор',
  backgroundSymbol: '#bg-desk',
  wallColor: '#DCE4EC',
  objects: [
    { id: 'pen', name: 'Ручка', hp: 1, weight: 10, size: 'S', symbol: '#obj-pen', breakable: false, hitText: 'ТЫК', sfx: 'thud', color: '#2F80ED' },
    { id: 'mouse', name: 'Мышка', hp: 1, weight: 10, size: 'S', symbol: '#obj-mouse', breakable: false, hitText: 'ЩЁЛК', sfx: 'thud', color: '#EDEDED' },
    { id: 'phone', name: 'Смартфон', hp: 1, weight: 10, size: 'S', symbol: '#obj-phone', breakable: true, hitText: 'ХРУСЬ', sfx: 'glass', color: '#4FA3FF' },
    { id: 'coffee', name: 'Стаканчик кофе', hp: 1, weight: 10, size: 'S', symbol: '#obj-coffee', breakable: false, hitText: 'ПЛЮХ', sfx: 'splash', color: '#8D5524' },
    { id: 'stapler', name: 'Степлер', hp: 1, weight: 10, size: 'S', symbol: '#obj-stapler', breakable: false, hitText: 'КЛАЦ', sfx: 'metal', color: '#E53935' },
    { id: 'frame', name: 'Фоторамка', hp: 1, weight: 8, size: 'S', symbol: '#obj-frame', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'glass', color: '#C98A3B' },
    { id: 'cactus', name: 'Кактус', hp: 2, weight: 5, size: 'M', symbol: '#obj-cactus', breakable: true, hitText: 'БУХ', sfx: 'ceramic', color: '#D2691E' },
    { id: 'keyboard', name: 'Клавиатура', hp: 2, weight: 5, size: 'M', symbol: '#obj-keyboard', breakable: false, hitText: 'ТРРР', sfx: 'thud', color: '#3A3A3A' },
    { id: 'laptop', name: 'Ноутбук', hp: 3, weight: 3, size: 'L', symbol: '#obj-laptop', breakable: true, hitText: 'ХРЯСЬ', sfx: 'crash', color: '#8E99A4' },
    { id: 'monitor', name: 'Монитор', hp: 5, weight: 1, size: 'L', symbol: '#obj-monitor', breakable: true, hitText: 'БА-БАХ', sfx: 'crash', color: '#3FA9F5' },
  ],
};
