import type { Meal, MealTemplate, TemplateFood } from '../types';
import { uid } from './factory';
import { normalize } from './foodClassifier';

/** Convertit les aliments d'un repas en aliments de modèle (on retire les id). */
export function mealFoodsToTemplate(meal: Meal): TemplateFood[] {
  return meal.foods.map((f) => ({
    name: f.name.trim(),
    category: f.category,
    ...(f.quantity ? { quantity: f.quantity } : {}),
  }));
}

/** Crée un modèle à partir d'un repas existant. `id`/`updatedAt` générés. */
export function templateFromMeal(name: string, meal: Meal): MealTemplate {
  return {
    id: uid(),
    name: name.trim(),
    time: meal.time,
    foods: mealFoodsToTemplate(meal),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Instancie un repas à partir d'un modèle : nouvel id de repas et d'aliments
 * (sinon collisions), heure du modèle si absente de l'appel.
 */
export function mealFromTemplate(template: MealTemplate, time?: string): Meal {
  return {
    id: uid(),
    time: time ?? template.time ?? '12:00',
    foods: template.foods.map((f) => ({
      id: uid(),
      name: f.name,
      category: f.category,
      ...(f.quantity ? { quantity: f.quantity } : {}),
    })),
  };
}

/**
 * Ajoute les aliments d'un modèle à un repas existant : id et heure du repas
 * conservés (le modèle peut être appliqué quelle que soit l'heure du repas).
 * Les aliments déjà présents (même nom normalisé) sont ignorés (anti-doublon).
 */
export function applyTemplateToMeal(meal: Meal, template: MealTemplate): Meal {
  const existing = new Set(meal.foods.map((f) => normalize(f.name)));
  const added = template.foods
    .filter((f) => !existing.has(normalize(f.name)))
    .map((f) => ({
      id: uid(),
      name: f.name,
      category: f.category,
      ...(f.quantity ? { quantity: f.quantity } : {}),
    }));
  return { ...meal, foods: [...meal.foods, ...added] };
}
