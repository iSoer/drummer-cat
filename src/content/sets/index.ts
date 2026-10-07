import type { ObjectSet, SetId } from '../types';
import { KITCHEN } from './kitchen';
import { DESK } from './desk';
import { LIVING } from './living';

export const SETS: readonly ObjectSet[] = [KITCHEN, DESK, LIVING];

export function getSet(id: SetId): ObjectSet {
  return SETS.find((s) => s.id === id) ?? SETS[0];
}
