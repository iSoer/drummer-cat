import type { ObjectSet } from '../types';

export const DETECTIVE: ObjectSet = {
  id: 'detective',
  name: 'Кабинет детектива',
  description: 'Лупа, скрипка и напольные часы',
  backgroundSymbol: '#bg-detective',
  wallColor: '#2F4F3E',
  objects: [
    { id: 'magnifier', name: 'Лупа', hp: 1, weight: 10, size: 'M', symbol: '#obj-magnifier', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'glass', color: '#B3E5FC' },
    { id: 'pipe', name: 'Трубка', hp: 1, weight: 10, size: 'S', symbol: '#obj-pipe', breakable: false, hitText: 'ТУК', sfx: 'thud', color: '#5D4037' },
    { id: 'teacup', name: 'Чашка чая', hp: 1, weight: 10, size: 'S', symbol: '#obj-teacup', breakable: true, hitText: 'ДЗЫНЬ', sfx: 'ceramic', color: '#FFFFFF' },
    { id: 'skull', name: 'Череп', hp: 1, weight: 10, size: 'S', symbol: '#obj-skull', breakable: false, hitText: 'ТУК', sfx: 'thud', color: '#F5F0E6' },
    { id: 'inkwell', name: 'Чернильница', hp: 1, weight: 10, size: 'S', symbol: '#obj-inkwell', breakable: true, hitText: 'ПЛЮХ', sfx: 'splash', color: '#1A237E' },
    { id: 'newspaper', name: 'Газета', hp: 1, weight: 8, size: 'M', symbol: '#obj-newspaper', breakable: false, hitText: 'ШЛЁП', sfx: 'thud', color: '#ECE7D8' },
    { id: 'violin', name: 'Скрипка', hp: 2, weight: 5, size: 'M', symbol: '#obj-violin', breakable: true, hitText: 'ДРЫНЬ', sfx: 'metal', color: '#A0522D' },
    { id: 'chess', name: 'Шахматы', hp: 2, weight: 5, size: 'M', symbol: '#obj-chess', breakable: false, hitText: 'ТРРР', sfx: 'thud', color: '#E6D2B5' },
    { id: 'typewriter', name: 'Печатная машинка', hp: 3, weight: 3, size: 'L', symbol: '#obj-typewriter', breakable: false, hitText: 'КЛАЦ', sfx: 'metal', color: '#37474F' },
    { id: 'clock', name: 'Напольные часы', hp: 5, weight: 1, size: 'L', symbol: '#obj-clock', breakable: true, hitText: 'БОМ-М', sfx: 'crash', color: '#6D4C41' },
  ],
};
