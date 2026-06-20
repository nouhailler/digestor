import { useLiveQuery } from 'dexie-react-hooks';
import type { Treatment } from '../types';
import { getAllTreatments } from '../lib/db';

/** Liste, en live, des traitements & compléments (du plus récent au plus ancien). */
export function useTreatments(): Treatment[] {
  return useLiveQuery(() => getAllTreatments(), []) ?? [];
}
