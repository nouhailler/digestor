import { describe, expect, it } from 'vitest';
import type { Meal } from '../types';
import { mealFromTemplate, mealFoodsToTemplate, templateFromMeal } from './mealTemplates';

const meal: Meal = {
  id: 'm1',
  time: '08:00',
  foods: [
    { id: 'a', name: 'Flocons avoine', category: 'neutral', quantity: { amount: 40, unit: 'g' } },
    { id: 'b', name: 'Banane', category: 'beneficial' },
  ],
};

describe('mealTemplates', () => {
  it('extrait les aliments du repas sans les id', () => {
    const foods = mealFoodsToTemplate(meal);
    expect(foods).toEqual([
      { name: 'Flocons avoine', category: 'neutral', quantity: { amount: 40, unit: 'g' } },
      { name: 'Banane', category: 'beneficial' },
    ]);
  });

  it('crée un modèle depuis un repas (heure conservée)', () => {
    const t = templateFromMeal('  Petit-déj habituel ', meal);
    expect(t.name).toBe('Petit-déj habituel');
    expect(t.time).toBe('08:00');
    expect(t.foods).toHaveLength(2);
    expect(t.id).toBeTruthy();
  });

  it('instancie un repas depuis un modèle avec des id neufs', () => {
    const t = templateFromMeal('X', meal);
    const out = mealFromTemplate(t, '07:30');
    expect(out.time).toBe('07:30');
    expect(out.id).not.toBe(meal.id);
    expect(out.foods.map((f) => f.name)).toEqual(['Flocons avoine', 'Banane']);
    expect(out.foods[0].quantity).toEqual({ amount: 40, unit: 'g' });
    // tous les id régénérés et uniques
    const ids = [out.id, ...out.foods.map((f) => f.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('utilise l’heure du modèle si aucune n’est fournie', () => {
    const t = templateFromMeal('X', meal);
    expect(mealFromTemplate(t).time).toBe('08:00');
  });
});
