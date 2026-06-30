import type {
  DayEntry,
  FodmapLevel,
  FoodCategory,
  FoodInsight,
  Meal,
  SatietyCheck,
  SatietyCheckpoint,
} from '../types';
import { normalize } from './foodClassifier';
import { CATEGORY_LABEL } from './constants';
import { FODMAP_LEVEL_LABEL } from './ai/insightFormat';
import { SATIETY_CHECKPOINTS } from './satiety';

/** Nb minimum de repas suivis avant d'afficher une corrélation (honnêteté). */
export const MIN_SATIETY_MEALS = 3;

/** Un repas porteur d'au moins un relevé de satiété, avec sa date. */
export interface MealWithSatiety {
  date: string;
  meal: Meal;
  checks: SatietyCheck[];
}

/** Tous les repas (toutes journées) ayant au moins un relevé de satiété. */
export function collectSatietyMeals(days: DayEntry[]): MealWithSatiety[] {
  const out: MealWithSatiety[] = [];
  for (const day of days)
    for (const meal of day.meals)
      if (meal.satiety && meal.satiety.length > 0)
        out.push({ date: day.date, meal, checks: meal.satiety });
  return out;
}

function avg(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
}

/** Un point de la courbe moyenne de satiété (un par checkpoint). */
export interface CurvePoint {
  checkpoint: SatietyCheckpoint;
  hungerIntensity: number | null;
  energyLevel: number | null;
  sugarCraving: number | null;
  n: number; // nb de relevés agrégés à ce checkpoint
}

/** Moyenne de chaque métrique VAS par checkpoint, sur l'ensemble des repas fournis. */
export function averageCurve(meals: MealWithSatiety[]): CurvePoint[] {
  return SATIETY_CHECKPOINTS.map((cp) => {
    const checks = meals.flatMap((m) => m.checks.filter((c) => c.checkpoint === cp));
    return {
      checkpoint: cp,
      hungerIntensity: avg(checks.map((c) => c.hungerIntensity)),
      energyLevel: avg(checks.map((c) => c.energyLevel)),
      sugarCraving: avg(checks.map((c) => c.sugarCraving)),
      n: checks.length,
    };
  });
}

/** Moyennes des trois métriques sur l'ensemble des relevés (tous checkpoints). */
export interface MetricAverages {
  hungerIntensity: number | null;
  energyLevel: number | null;
  sugarCraving: number | null;
  n: number;
}

export function overallAverages(meals: MealWithSatiety[]): MetricAverages {
  const checks = meals.flatMap((m) => m.checks);
  return {
    hungerIntensity: avg(checks.map((c) => c.hungerIntensity)),
    energyLevel: avg(checks.map((c) => c.energyLevel)),
    sugarCraving: avg(checks.map((c) => c.sugarCraving)),
    n: checks.length,
  };
}

// ---- Regroupement par composition du repas ----

const CATEGORY_PRIORITY: FoodCategory[] = ['pro', 'beneficial', 'neutral'];

/** Catégorie dominante d'un repas (la plus fréquente ; départage pro > bénéfique > neutre). */
export function dominantCategory(meal: Meal): FoodCategory {
  const counts: Record<FoodCategory, number> = { pro: 0, beneficial: 0, neutral: 0 };
  for (const f of meal.foods) counts[f.category]++;
  let best: FoodCategory = 'neutral';
  let bestN = -1;
  for (const c of CATEGORY_PRIORITY) {
    if (counts[c] > bestN) {
      best = c;
      bestN = counts[c];
    }
  }
  return best;
}

const FODMAP_RANK: Record<FodmapLevel, number> = { unknown: -1, low: 0, moderate: 1, high: 2 };

/**
 * Niveau FODMAP maximal d'un repas, d'après les fiches en cache (par nom
 * normalisé). « unknown » si aucun aliment n'a de fiche FODMAP connue.
 */
export function maxFodmap(meal: Meal, insights: Map<string, FoodInsight>): FodmapLevel {
  let best: FodmapLevel = 'unknown';
  for (const f of meal.foods) {
    const lvl = insights.get(normalize(f.name))?.fodmapLevel;
    if (lvl && FODMAP_RANK[lvl] > FODMAP_RANK[best]) best = lvl;
  }
  return best;
}

/** Un groupe de repas partageant une même valeur de composition (catégorie ou FODMAP). */
export interface Bucketed {
  bucket: string;
  label: string;
  meals: MealWithSatiety[];
}

/** Regroupe les repas par catégorie dominante. */
export function bucketByCategory(meals: MealWithSatiety[]): Bucketed[] {
  return CATEGORY_PRIORITY.map((cat) => ({
    bucket: cat,
    label: CATEGORY_LABEL[cat],
    meals: meals.filter((m) => dominantCategory(m.meal) === cat),
  })).filter((b) => b.meals.length > 0);
}

/** Regroupe les repas par niveau FODMAP maximal (ignore « unknown »). */
export function bucketByFodmap(meals: MealWithSatiety[], insights: Map<string, FoodInsight>): Bucketed[] {
  const levels: FodmapLevel[] = ['low', 'moderate', 'high'];
  return levels
    .map((lvl) => ({
      bucket: lvl,
      label: FODMAP_LEVEL_LABEL[lvl],
      meals: meals.filter((m) => maxFodmap(m.meal, insights) === lvl),
    }))
    .filter((b) => b.meals.length > 0);
}
