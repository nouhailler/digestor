import type { DayEntry, Intensity, FoodItem, Meal, SymptomKey } from '../types';
import { classifyFood } from './foodClassifier';
import { SYMPTOM_ORDER } from './constants';

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function emptySymptoms(): Record<SymptomKey, 'absent'> {
  const out = {} as Record<SymptomKey, 'absent'>;
  for (const k of SYMPTOM_ORDER) out[k] = 'absent';
  return out;
}

/**
 * Complète les symptômes d'un jour (et de ses repas) avec les clés manquantes
 * à « absent ». Indispensable pour les jours enregistrés avant l'ajout d'un
 * symptôme : sans cela, la nouvelle clé vaut `undefined` et fausse les lectures
 * directes (affichée comme « présente », libellé/poids `undefined`).
 */
export function withCompleteSymptoms(day: DayEntry): DayEntry {
  const symptoms = { ...emptySymptoms(), ...day.symptoms } as Record<SymptomKey, Intensity>;
  const meals = day.meals.map((m) =>
    m.symptoms ? { ...m, symptoms: { ...emptySymptoms(), ...m.symptoms } as Record<SymptomKey, Intensity> } : m,
  );
  return { ...day, symptoms, meals };
}

export function makeFood(name: string): FoodItem {
  return { id: uid(), name, category: classifyFood(name) };
}

export function makeMeal(time: string, foodNames: string[] = []): Meal {
  return { id: uid(), time, foods: foodNames.map(makeFood) };
}

/** Jour vide pour une date donnée. */
export function emptyDay(date: string): DayEntry {
  return {
    date,
    quality: null,
    meals: [],
    symptoms: emptySymptoms(),
  };
}
