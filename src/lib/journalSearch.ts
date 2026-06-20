import type { DayEntry } from '../types';
import { SYMPTOM_LABELS, SYMPTOM_ORDER } from './constants';
import { effectiveDaySymptoms } from './aggregates';
import { normalize } from './foodClassifier';

export interface JournalSearchResult {
  date: string;
  foods: string[]; // aliments correspondants (orthographe d'origine)
  symptoms: string[]; // symptômes correspondants (libellés)
  noteMatch: boolean;
}

/** Longueur minimale de requête pour lancer la recherche. */
export const SEARCH_MIN = 2;

/**
 * Recherche dans le journal : aliments, symptômes (actifs) et notes contenant la
 * requête. Pur et testable. Renvoie les jours correspondants, du plus récent au
 * plus ancien, avec le détail de ce qui a matché.
 */
export function searchJournal(days: DayEntry[], query: string): JournalSearchResult[] {
  const q = normalize(query);
  if (q.length < SEARCH_MIN) return [];

  const results: JournalSearchResult[] = [];
  for (const day of days) {
    const foods = new Set<string>();
    for (const meal of day.meals) {
      for (const f of meal.foods) {
        if (normalize(f.name).includes(q)) foods.add(f.name.trim());
      }
    }

    const sym = effectiveDaySymptoms(day);
    const symptoms = SYMPTOM_ORDER.filter(
      (k) => sym[k] !== 'absent' && normalize(SYMPTOM_LABELS[k]).includes(q),
    ).map((k) => SYMPTOM_LABELS[k]);

    const noteMatch = !!day.notes && normalize(day.notes).includes(q);

    if (foods.size > 0 || symptoms.length > 0 || noteMatch) {
      results.push({ date: day.date, foods: [...foods], symptoms, noteMatch });
    }
  }
  return results.sort((a, b) => b.date.localeCompare(a.date));
}
