import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { normalize } from '../lib/foodClassifier';
import { addDays } from 'date-fns';
import { toISODate } from '../lib/dates';

/** Fenêtre de récence : aujourd'hui, hier, avant-hier. */
const RECENT_DAYS = 3;

/**
 * Liste, en live, des aliments consommés **récemment** (aujourd'hui, hier ou
 * avant-hier), du plus pertinent au moins pertinent : on les ordonne par
 * fréquence (nombre d'occurrences sur la fenêtre) décroissante, puis par
 * récence (jour le plus récent d'abord), puis alphabétiquement.
 *
 * Sert à proposer ces aliments **en tête** de l'autocomplétion d'un repas :
 * ce qu'on a mangé hier ou ce matin remonte au lieu d'être noyé en bas de liste.
 * Dédupliqué par forme normalisée (on garde la première orthographe vue).
 */
export function useRecentFoods(): string[] {
  return (
    useLiveQuery(async () => {
      const today = new Date();
      // Les ISO de la fenêtre, indexés par ancienneté (0 = aujourd'hui).
      const window = Array.from({ length: RECENT_DAYS }, (_, i) =>
        toISODate(addDays(today, -i)),
      );
      const days = await db.days.bulkGet(window);

      interface Rec {
        name: string;
        count: number;
        recency: number; // plus petit = plus récent
      }
      const byNorm = new Map<string, Rec>();
      days.forEach((day, offset) => {
        if (!day) return;
        for (const meal of day.meals) {
          for (const food of meal.foods) {
            const name = food.name.trim();
            if (!name) continue;
            const key = normalize(name);
            if (!key) continue;
            const rec = byNorm.get(key);
            if (rec) {
              rec.count += 1;
              rec.recency = Math.min(rec.recency, offset);
            } else {
              byNorm.set(key, { name, count: 1, recency: offset });
            }
          }
        }
      });

      return [...byNorm.values()]
        .sort(
          (a, b) =>
            b.count - a.count ||
            a.recency - b.recency ||
            a.name.localeCompare(b.name, 'fr'),
        )
        .map((r) => r.name);
    }) ?? []
  );
}
