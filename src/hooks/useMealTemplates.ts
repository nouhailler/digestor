import { useLiveQuery } from 'dexie-react-hooks';
import type { MealTemplate } from '../types';
import { getAllMealTemplates } from '../lib/db';

/** Liste, en live, des modèles de repas (triés par nom). */
export function useMealTemplates(): MealTemplate[] {
  return useLiveQuery(() => getAllMealTemplates(), []) ?? [];
}
