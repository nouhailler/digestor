import type { DayEntry, Intensity, FoodCategory, SymptomKey } from '../types';
import { INTENSITY_WEIGHT, SYMPTOM_LABELS, SYMPTOM_ORDER } from './constants';
import { isAddedSugarOrAlcohol } from './foodClassifier';
import { dayAmineLoad, type AmineLoadBand } from './biogenicAmines';

/** Itère tous les aliments d'un jour. */
function* foodsOf(day: DayEntry) {
  for (const meal of day.meals) for (const f of meal.foods) yield f;
}

/**
 * Symptômes effectifs du jour = max par symptôme entre le niveau « jour »
 * (saisie générale / import / seed) et chaque repas (symptômes par repas).
 */
export function effectiveDaySymptoms(day: DayEntry): Record<SymptomKey, Intensity> {
  // Base complète : tout à « absent ». Indispensable pour les jours enregistrés
  // avant l'ajout d'un symptôme (leur objet symptoms ne contient pas la clé).
  const out = {} as Record<SymptomKey, Intensity>;
  for (const k of SYMPTOM_ORDER) out[k] = day.symptoms[k] ?? 'absent';
  for (const meal of day.meals) {
    const ms = meal.symptoms;
    if (!ms) continue;
    for (const k of SYMPTOM_ORDER) {
      if ((INTENSITY_WEIGHT[ms[k]] ?? 0) > INTENSITY_WEIGHT[out[k]]) out[k] = ms[k];
    }
  }
  return out;
}

/** Un jour est « renseigné » s'il contient au moins un aliment ou un symptôme non absent. */
export function dayHasContent(day: DayEntry): boolean {
  if (day.meals.some((m) => m.foods.length > 0)) return true;
  return Object.values(effectiveDaySymptoms(day)).some((v) => v !== 'absent');
}

/** Date du dernier jour renseigné d'une liste, sinon undefined. */
export function latestActiveDate(days: DayEntry[]): string | undefined {
  let latest: string | undefined;
  for (const d of days) {
    if (dayHasContent(d) && (!latest || d.date > latest)) latest = d.date;
  }
  return latest;
}

export interface WeekStats {
  hardDays: number;
  totalDays: number;
  severeBloating: number;
  diarrheaEpisodes: number;
  noAddedSugarDays: number;
  daysWithMeals: number;
  avgHydration: number | null;
  energyScore: number | null; // /10
  amineScore: number | null; // /10 (10 = journées peu chargées en amines)
}

/** Statistiques de la maquette « Récapitulatif de la semaine » sur 7 jours. */
export function computeWeekStats(days: DayEntry[]): WeekStats {
  const totalDays = 7;
  let hardDays = 0;
  let severeBloating = 0;
  let diarrheaEpisodes = 0;
  let noAddedSugarDays = 0;
  let daysWithMeals = 0;
  let hydrationSum = 0;
  let hydrationN = 0;
  let energyPenaltySum = 0;
  let energyN = 0;
  let amineBandSum = 0;
  let amineN = 0;

  for (const day of days) {
    const sym = effectiveDaySymptoms(day);
    if (day.quality === 'difficile') hardDays++;
    if (sym.ballonnements === 'severe') severeBloating++;
    if (sym.diarrhee === 'modere' || sym.diarrhee === 'severe') diarrheaEpisodes++;

    const hasMeals = day.meals.some((m) => m.foods.length > 0);
    if (hasMeals) {
      daysWithMeals++;
      let added = false;
      for (const f of foodsOf(day)) if (isAddedSugarOrAlcohol(f.name)) added = true;
      if (!added) noAddedSugarDays++;
      // Charge en amines du jour (repère par bande : faible 0, modéré 1, élevé 2).
      amineBandSum += AMINE_BAND_WEIGHT[dayAmineLoad([...foodsOf(day)].map((f) => f.name)).band];
      amineN++;
    }

    if (typeof day.hydrationL === 'number') {
      hydrationSum += day.hydrationL;
      hydrationN++;
    }

    // Score énergie = inverse de (fatigue + brouillard mental).
    const penalty =
      INTENSITY_WEIGHT[sym.fatigue_apres_repas] + INTENSITY_WEIGHT[sym.brouillard_mental];
    if (hasMeals || day.quality) {
      energyPenaltySum += penalty;
      energyN++;
    }
  }

  const avgHydration = hydrationN > 0 ? hydrationSum / hydrationN : null;
  // penalty max = 6 (2 symptômes × 3). 10 - (penalty/6)*10, arrondi.
  const energyScore =
    energyN > 0
      ? Math.round(10 - (energyPenaltySum / energyN / 6) * 10)
      : null;
  // Note amines /10 : bande max = 2 (élevé). 10 = journées peu chargées.
  const amineScore = amineN > 0 ? Math.round(10 - (amineBandSum / amineN / 2) * 10) : null;

  return {
    hardDays,
    totalDays,
    severeBloating,
    diarrheaEpisodes,
    noAddedSugarDays,
    daysWithMeals,
    avgHydration,
    energyScore,
    amineScore,
  };
}

/** Poids par bande de charge amines pour la note hebdo. */
const AMINE_BAND_WEIGHT: Record<AmineLoadBand, number> = { faible: 0, modere: 1, eleve: 2 };

export interface DaySeverityPoint {
  date: string;
  leger: number;
  modere: number;
  severe: number;
  total: number;
}

/** Sévérité empilée par jour (pour graphe en aires/barres). */
export function severityByDay(days: DayEntry[]): DaySeverityPoint[] {
  return days.map((day) => {
    const sym = effectiveDaySymptoms(day);
    let leger = 0;
    let modere = 0;
    let severe = 0;
    for (const k of SYMPTOM_ORDER) {
      const v = sym[k];
      if (v === 'leger') leger++;
      else if (v === 'modere') modere++;
      else if (v === 'severe') severe++;
    }
    return { date: day.date, leger, modere, severe, total: leger + modere + severe };
  });
}

export interface CategoryCountPoint {
  date: string;
  pro: number;
  beneficial: number;
  neutral: number;
}

/** Nombre d'aliments par catégorie et par jour (barres empilées). */
export function categoryCountsByDay(days: DayEntry[]): CategoryCountPoint[] {
  return days.map((day) => {
    const c: Record<FoodCategory, number> = { pro: 0, beneficial: 0, neutral: 0 };
    for (const f of foodsOf(day)) c[f.category]++;
    return { date: day.date, ...c };
  });
}

export interface HydrationPoint {
  date: string;
  hydration: number | null;
}

export function hydrationByDay(days: DayEntry[]): HydrationPoint[] {
  return days.map((day) => ({
    date: day.date,
    hydration: typeof day.hydrationL === 'number' ? day.hydrationL : null,
  }));
}

export interface TopSymptom {
  key: SymptomKey;
  label: string;
  weight: number;
}

/** Top symptômes sur la période, fréquence pondérée par intensité. */
export function topSymptoms(days: DayEntry[]): TopSymptom[] {
  const acc = {} as Record<SymptomKey, number>;
  for (const day of days) {
    const sym = effectiveDaySymptoms(day);
    for (const key of SYMPTOM_ORDER) {
      acc[key] = (acc[key] ?? 0) + INTENSITY_WEIGHT[sym[key]];
    }
  }
  return (Object.keys(acc) as SymptomKey[])
    .map((key) => ({ key, label: SYMPTOM_LABELS[key], weight: acc[key] }))
    .filter((s) => s.weight > 0)
    .sort((a, b) => b.weight - a.weight);
}
