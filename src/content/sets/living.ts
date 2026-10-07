import type { ObjectSet } from '../types';

export const LIVING: ObjectSet = {
  id: 'living',
  name: 'Гостиная',
  description: 'Вазы, свечи и телевизор',
  backgroundSymbol: '#bg-living',
  wallColor: '#E8D5E0',
  objects: [
    { id: 'vase', name: 'Ваза', hp: 1, weight: 10, size: 'M', symbol: '#obj-vase', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'ceramic', color: '#3F51B5' },
    { id: 'candle', name: 'Свеча', hp: 1, weight: 10, size: 'S', symbol: '#obj-candle', breakable: false, hitText: 'ПШШ', sfx: 'thud', color: '#FFF1D6' },
    { id: 'figurine', name: 'Статуэтка', hp: 1, weight: 10, size: 'S', symbol: '#obj-figurine', breakable: true, hitText: 'ХРУСЬ', sfx: 'ceramic', color: '#FFFFFF' },
    { id: 'remote', name: 'Пульт', hp: 1, weight: 10, size: 'S', symbol: '#obj-remote', breakable: false, hitText: 'ТУК', sfx: 'thud', color: '#333333' },
    { id: 'book', name: 'Книга', hp: 1, weight: 10, size: 'S', symbol: '#obj-book', breakable: false, hitText: 'ШЛЁП', sfx: 'thud', color: '#B71C1C' },
    { id: 'wineglass', name: 'Бокал', hp: 1, weight: 8, size: 'S', symbol: '#obj-wineglass', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'glass', color: '#F3F3F3' },
    { id: 'lamp', name: 'Лампа', hp: 2, weight: 5, size: 'M', symbol: '#obj-lamp', breakable: true, hitText: 'БРЯМ', sfx: 'metal', color: '#FFC857' },
    { id: 'globe', name: 'Глобус', hp: 2, weight: 5, size: 'M', symbol: '#obj-globe', breakable: false, hitText: 'БУМ', sfx: 'thud', color: '#4FC3F7' },
    { id: 'aquarium', name: 'Аквариум', hp: 3, weight: 3, size: 'L', symbol: '#obj-aquarium', breakable: true, hitText: 'ПЛЮХ', sfx: 'splash', color: '#7FD3F7' },
    { id: 'tv', name: 'Телевизор', hp: 5, weight: 1, size: 'L', symbol: '#obj-tv', breakable: true, hitText: 'БА-БАХ', sfx: 'crash', color: '#2F80ED' },
  ],
};
