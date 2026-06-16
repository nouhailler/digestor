import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { normalize } from '../lib/foodClassifier';

/**
 * Liste, en live, des noms d'aliments déjà saisis dans le journal.
 * Dédupliqués par forme normalisée (on garde la première orthographe vue),
 * triés alphabétiquement. Sert à proposer une autocomplétion lors de la
 * saisie d'un aliment, afin d'éviter les doublons d'orthographe/casse.
 */
export function useKnownFoods(): string[] {
  return (
    useLiveQuery(async () => {
      const days = await db.days.toArray();
      const byNorm = new Map<string, string>();
      for (const day of days) {
        for (const meal of day.meals) {
          for (const food of meal.foods) {
            const name = food.name.trim();
            if (!name) continue;
            const key = normalize(name);
            if (key && !byNorm.has(key)) byNorm.set(key, name);
          }
        }
      }
      return [...byNorm.values()].sort((a, b) => a.localeCompare(b, 'fr'));
    }) ?? []
  );
}
