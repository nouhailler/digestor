import type { DayEntry, Intensity, SymptomKey } from '../types';
import { SYMPTOM_LABELS, SYMPTOM_ORDER } from './constants';
import { dayHasContent, effectiveDaySymptoms } from './aggregates';
import { normalize } from './foodClassifier';

/** Un symptôme « marquant » sur un jour = modéré ou sévère (cohérent avec correlations.ts). */
const isMarked = (i: Intensity) => i === 'severe' || i === 'modere';

export interface FoodSymptomLink {
  food: string; // nom affiché
  symptom: SymptomKey;
  symptomLabel: string;
  daysWithFood: number; // nb de jours où l'aliment a été consommé
  daysSymptomWithFood: number; // dont jours où le symptôme était marquant
  rateWith: number; // P(symptôme marquant | aliment ce jour)
  rateWithout: number; // P(symptôme marquant | aliment absent ce jour)
  lift: number; // rateWith − rateWithout (≥ 0 retenu)
}

export interface SafeFood {
  food: string;
  daysEaten: number;
  symptomDayRate: number; // part de jours « à symptômes » quand l'aliment est consommé
}

export interface PersonalCorrelations {
  enoughData: boolean;
  analyzedDays: number; // jours renseignés pris en compte
  analyzedFoods: number; // aliments assez fréquents pour être évalués
  baselineSymptomDayRate: number; // part de jours « à symptômes » sur l'ensemble
  triggers: FoodSymptomLink[]; // déclencheurs suspectés
  safeFoods: SafeFood[]; // aliments fréquents bien tolérés
}

export interface PersonalCorrelationsOptions {
  minTotalDays?: number; // minimum de jours renseignés pour conclure
  minFoodDays?: number; // minimum de jours où l'aliment apparaît
  minRateWith?: number; // taux minimal de symptôme « avec »
  minLift?: number; // écart minimal avec / sans
  maxResults?: number;
}

const DEFAULTS: Required<PersonalCorrelationsOptions> = {
  minTotalDays: 5,
  minFoodDays: 3,
  minRateWith: 0.5,
  minLift: 0.3,
  maxResults: 12,
};

/**
 * Corrélations aliment → symptôme **calculées sur les données réelles** du journal.
 * Conservateur et transparent : ne conclut un déclencheur que si l'aliment apparaît
 * assez souvent, que le taux de symptôme « les jours avec » est élevé ET nettement
 * supérieur aux jours « sans ». Renvoie aussi les aliments fréquents bien tolérés.
 * N'invente rien sous les seuils (cf. règle d'honnêteté des corrélations).
 */
export function personalCorrelations(
  allDays: DayEntry[],
  options: PersonalCorrelationsOptions = {},
): PersonalCorrelations {
  const opt = { ...DEFAULTS, ...options };
  const recorded = allDays.filter(dayHasContent);
  const analyzedDays = recorded.length;

  // Symptômes effectifs par jour + jour « à symptômes » (au moins un marquant).
  const daySym = recorded.map(effectiveDaySymptoms);
  const dayMarked = daySym.map((s) => SYMPTOM_ORDER.some((k) => isMarked(s[k])));
  const baselineSymptomDayRate = analyzedDays ? dayMarked.filter(Boolean).length / analyzedDays : 0;

  if (analyzedDays < opt.minTotalDays) {
    return {
      enoughData: false,
      analyzedDays,
      analyzedFoods: 0,
      baselineSymptomDayRate,
      triggers: [],
      safeFoods: [],
    };
  }

  // Index : pour chaque aliment normalisé, les indices de jours où il est consommé.
  const foodDays = new Map<string, { name: string; idx: Set<number> }>();
  recorded.forEach((day, i) => {
    const seen = new Set<string>();
    for (const meal of day.meals) {
      for (const f of meal.foods) {
        const key = normalize(f.name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const entry = foodDays.get(key) ?? { name: f.name.trim(), idx: new Set<number>() };
        entry.idx.add(i);
        foodDays.set(key, entry);
      }
    }
  });

  const frequent = [...foodDays.values()].filter((f) => f.idx.size >= opt.minFoodDays);

  const triggers: FoodSymptomLink[] = [];
  const safeFoods: SafeFood[] = [];

  for (const { name, idx } of frequent) {
    const withDays = [...idx];
    const withoutDays = recorded.map((_, i) => i).filter((i) => !idx.has(i));
    if (withoutDays.length === 0) continue; // pas de comparaison possible

    // Aliment « sûr » : peu de jours à symptômes quand on le consomme.
    const symptomDayRate = withDays.filter((i) => dayMarked[i]).length / withDays.length;

    let isTrigger = false;
    for (const k of SYMPTOM_ORDER) {
      const symWith = withDays.filter((i) => isMarked(daySym[i][k])).length;
      const rateWith = symWith / withDays.length;
      const symWithout = withoutDays.filter((i) => isMarked(daySym[i][k])).length;
      const rateWithout = symWithout / withoutDays.length;
      const lift = rateWith - rateWithout;
      if (rateWith >= opt.minRateWith && lift >= opt.minLift) {
        isTrigger = true;
        triggers.push({
          food: name,
          symptom: k,
          symptomLabel: SYMPTOM_LABELS[k],
          daysWithFood: withDays.length,
          daysSymptomWithFood: symWith,
          rateWith,
          rateWithout,
          lift,
        });
      }
    }

    // Bien toléré : fréquent, et taux de jours à symptômes faible et sous la moyenne.
    if (!isTrigger && symptomDayRate <= 0.2 && symptomDayRate < baselineSymptomDayRate) {
      safeFoods.push({ food: name, daysEaten: withDays.length, symptomDayRate });
    }
  }

  triggers.sort((a, b) => b.lift - a.lift || b.daysWithFood - a.daysWithFood);
  safeFoods.sort((a, b) => a.symptomDayRate - b.symptomDayRate || b.daysEaten - a.daysEaten);

  return {
    enoughData: true,
    analyzedDays,
    analyzedFoods: frequent.length,
    baselineSymptomDayRate,
    triggers: triggers.slice(0, opt.maxResults),
    safeFoods: safeFoods.slice(0, opt.maxResults),
  };
}
