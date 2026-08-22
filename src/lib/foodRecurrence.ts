import type { DayEntry, FoodCategory } from '../types';
import { looseKey } from './foodClassifier';
import { fromISODate } from './dates';
import { differenceInCalendarDays } from 'date-fns';

/**
 * Récurrence des aliments sur une fenêtre glissante (par défaut 30 jours) :
 * combien de fois un aliment a été mentionné dans le journal, sur combien de
 * jours distincts, et de quelle date à quelle date. Fonction pure : aucune
 * conclusion (ni corrélation, ni verdict), un simple décompte factuel.
 *
 * Les quasi-doublons (« Tomate » / « Tomates ») sont regroupés via `looseKey` ;
 * le nom affiché est l'orthographe la plus fréquente (à égalité : la 1re vue).
 */

/** Fenêtre d'historique du tableau de récurrence (jours). */
export const RECURRENCE_WINDOW_DAYS = 30;

export interface FoodRecurrenceRow {
  /** Clé de regroupement (pluriels dépliés) — jamais affichée. */
  key: string;
  /** Nom affiché : orthographe la plus fréquente. */
  name: string;
  /** Catégorie dominante parmi les occurrences. */
  category: FoodCategory;
  /** Nombre total de mentions (une par aliment et par repas). */
  mentions: number;
  /** Jours distincts où l'aliment apparaît, croissants. */
  dates: string[];
  /** Première mention (ISO). */
  first: string;
  /** Dernière mention (ISO). */
  last: string;
  /** Étendue première → dernière mention, en jours inclus (1 si un seul jour). */
  spanDays: number;
  /** Écart moyen entre deux jours de mention (null si un seul jour). */
  avgIntervalDays: number | null;
  /** Jours écoulés depuis la dernière mention (par rapport à la fin de fenêtre). */
  daysSinceLast: number;
}

const CATEGORY_RANK: Record<FoodCategory, number> = { pro: 0, neutral: 1, beneficial: 2 };

/**
 * Décompte des mentions d'aliments sur `days` (fenêtre déjà découpée par
 * l'appelant). `until` = fin de fenêtre pour « il y a N jours » ; par défaut la
 * dernière date de la liste.
 */
export function foodRecurrence(days: DayEntry[], until?: string): FoodRecurrenceRow[] {
  const end = until ?? days.reduce<string>((max, d) => (d.date > max ? d.date : max), '');

  interface Acc {
    key: string;
    names: Map<string, number>;
    firstName: string;
    categories: Map<FoodCategory, number>;
    mentions: number;
    dates: Set<string>;
  }
  const acc = new Map<string, Acc>();

  // Jours parcourus dans l'ordre chronologique pour que « 1re orthographe vue »
  // et « 1re catégorie vue » soient stables quel que soit l'ordre d'entrée.
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  for (const day of sorted) {
    for (const meal of day.meals) {
      for (const food of meal.foods) {
        const name = food.name.trim();
        if (!name) continue;
        const key = looseKey(name);
        if (!key) continue;
        let a = acc.get(key);
        if (!a) {
          a = {
            key,
            names: new Map(),
            firstName: name,
            categories: new Map(),
            mentions: 0,
            dates: new Set(),
          };
          acc.set(key, a);
        }
        a.names.set(name, (a.names.get(name) ?? 0) + 1);
        a.categories.set(food.category, (a.categories.get(food.category) ?? 0) + 1);
        a.mentions++;
        a.dates.add(day.date);
      }
    }
  }

  const rows: FoodRecurrenceRow[] = [];
  for (const a of acc.values()) {
    const dates = [...a.dates].sort();
    const first = dates[0];
    const last = dates[dates.length - 1];
    const spanDays = differenceInCalendarDays(fromISODate(last), fromISODate(first)) + 1;
    rows.push({
      key: a.key,
      name: bestName(a.names, a.firstName),
      category: bestCategory(a.categories),
      mentions: a.mentions,
      dates,
      first,
      last,
      spanDays,
      avgIntervalDays: dates.length > 1 ? (spanDays - 1) / (dates.length - 1) : null,
      daysSinceLast: end ? Math.max(0, differenceInCalendarDays(fromISODate(end), fromISODate(last))) : 0,
    });
  }

  // Le plus récurrent d'abord : jours distincts, puis mentions, puis alphabétique.
  return rows.sort(
    (a, b) =>
      b.dates.length - a.dates.length ||
      b.mentions - a.mentions ||
      a.name.localeCompare(b.name, 'fr'),
  );
}

/** Orthographe la plus fréquente ; à égalité, la première rencontrée. */
function bestName(names: Map<string, number>, firstName: string): string {
  let best = firstName;
  let bestN = names.get(firstName) ?? 0;
  for (const [name, n] of names) {
    if (n > bestN) {
      best = name;
      bestN = n;
    }
  }
  return best;
}

/** Catégorie dominante ; à égalité, la plus « à surveiller » (pro > neutre > bénéfique). */
function bestCategory(categories: Map<FoodCategory, number>): FoodCategory {
  let best: FoodCategory = 'neutral';
  let bestN = -1;
  for (const [cat, n] of categories) {
    if (n > bestN || (n === bestN && CATEGORY_RANK[cat] < CATEGORY_RANK[best])) {
      best = cat;
      bestN = n;
    }
  }
  return best;
}
