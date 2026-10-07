import type { ObjectSet, SetId } from '../types';
import { KITCHEN } from './kitchen';
import { DESK } from './desk';
import { LIVING } from './living';
import { SPACEBASE } from './spacebase';
import { MAGIC } from './magic';
import { DETECTIVE } from './detective';

export const SETS: readonly ObjectSet[] = [KITCHEN, DESK, LIVING, SPACEBASE, MAGIC, DETECTIVE];

export function getSet(id: SetId): ObjectSet {
  return SETS.find((s) => s.id === id) ?? SETS[0];
}
