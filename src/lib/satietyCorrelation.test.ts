import { describe, expect, it } from 'vitest';
import type { DayEntry, FodmapLevel, FoodCategory, FoodInsight, Meal, SatietyCheck } from '../types';
import { normalize } from './foodClassifier';
import {
  averageCurve,
  bucketByCategory,
  bucketByFodmap,
  collectSatietyMeals,
  dominantCategory,
  maxFodmap,
  overallAverages,
} from './satietyCorrelation';

let n = 0;
function check(checkpoint: SatietyCheck['checkpoint'], hunger: number, sugar = 50): SatietyCheck {
  return { checkpoint, hungerIntensity: hunger, energyLevel: 50, sugarCraving: sugar };
}
function meal(foods: [string, FoodCategory][], checks: SatietyCheck[]): Meal {
  return {
    id: `m${n++}`,
    time: '12:00',
    foods: foods.map(([name, category], i) => ({ id: `f${n}_${i}`, name, category })),
    satiety: checks,
  };
}
function day(date: string, meals: Meal[]): DayEntry {
  return { date, quality: null, meals, symptoms: {} as DayEntry['symptoms'] };
}
function insight(name: string, fodmapLevel: FodmapLevel): FoodInsight {
  return {
    key: normalize(name),
    name,
    category: 'neutral',
    fodmapLevel,
    fodmaps: { fructose: 'low', lactose: 'low', fructans: 'low', gos: 'low', polyols: 'low' },
    sibo: { verdict: 'inconnu', note: '' },
    candida: { verdict: 'inconnu', note: '' },
    summary: '',
    tips: [],
    model: 'test',
    updatedAt: '2026-06-30',
  };
}

describe('collectSatietyMeals', () => {
  it('ne retient que les repas porteurs de relevés', () => {
    const days = [
      day('2026-06-29', [meal([['riz', 'neutral']], [check('immediate', 10)]), { id: 'x', time: '08:00', foods: [] }]),
    ];
    expect(collectSatietyMeals(days)).toHaveLength(1);
  });
});

describe('averageCurve', () => {
  it('moyenne chaque métrique par checkpoint', () => {
    const meals = collectSatietyMeals([
      day('2026-06-29', [meal([['riz', 'neutral']], [check('immediate', 10), check('2h', 60)])]),
      day('2026-06-30', [meal([['pâtes', 'neutral']], [check('immediate', 30)])]),
    ]);
    const curve = averageCurve(meals);
    const immediate = curve.find((c) => c.checkpoint === 'immediate')!;
    expect(immediate.hungerIntensity).toBe(20); // (10 + 30) / 2
    expect(immediate.n).toBe(2);
    const oneH = curve.find((c) => c.checkpoint === '1h')!;
    expect(oneH.hungerIntensity).toBeNull(); // aucun relevé
  });
});

describe('dominantCategory / maxFodmap', () => {
  it('renvoie la catégorie la plus fréquente (pro l’emporte à égalité)', () => {
    expect(dominantCategory(meal([['sucre', 'pro'], ['pain', 'pro'], ['salade', 'beneficial']], []))).toBe('pro');
    expect(dominantCategory(meal([['sucre', 'pro'], ['salade', 'beneficial']], []))).toBe('pro'); // égalité → pro
    expect(dominantCategory(meal([['salade', 'beneficial']], []))).toBe('beneficial');
  });

  it('renvoie le niveau FODMAP maximal d’après le cache', () => {
    const insights = new Map([
      [normalize('riz'), insight('riz', 'low')],
      [normalize('miel'), insight('miel', 'high')],
    ]);
    expect(maxFodmap(meal([['riz', 'neutral'], ['miel', 'pro']], []), insights)).toBe('high');
    expect(maxFodmap(meal([['inconnu', 'neutral']], []), insights)).toBe('unknown');
  });
});

describe('bucketByCategory / bucketByFodmap / overallAverages', () => {
  it('regroupe par catégorie dominante', () => {
    const meals = collectSatietyMeals([
      day('2026-06-29', [
        meal([['sucre', 'pro']], [check('immediate', 80)]),
        meal([['salade', 'beneficial']], [check('immediate', 20)]),
      ]),
    ]);
    const buckets = bucketByCategory(meals);
    expect(buckets.map((b) => b.bucket)).toEqual(['pro', 'beneficial']);
    expect(overallAverages(buckets[0].meals).hungerIntensity).toBe(80);
  });

  it('regroupe par niveau FODMAP (ignore unknown)', () => {
    const insights = new Map([
      [normalize('riz'), insight('riz', 'low')],
      [normalize('miel'), insight('miel', 'high')],
    ]);
    const meals = collectSatietyMeals([
      day('2026-06-29', [
        meal([['riz', 'neutral']], [check('2h', 30, 20)]),
        meal([['miel', 'pro']], [check('2h', 50, 90)]),
        meal([['inconnu', 'neutral']], [check('2h', 40, 40)]),
      ]),
    ]);
    const buckets = bucketByFodmap(meals, insights);
    expect(buckets.map((b) => b.bucket)).toEqual(['low', 'high']);
    const high = buckets.find((b) => b.bucket === 'high')!;
    expect(overallAverages(high.meals).sugarCraving).toBe(90);
  });
});
