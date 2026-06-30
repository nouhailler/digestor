import type { DayEntry, Intensity, SymptomKey } from '../types';
import { dayHasContent, effectiveDaySymptoms } from './aggregates';
import { dayAmineLoad } from './biogenicAmines';

/**
 * Corrélation entre les jours à forte charge en amines biogènes (histamine…) et
 * les jours portant des symptômes typiquement histaminiques. Mêmes garde-fous
 * conservateurs que `contextCorrelations` : on ne conclut pas sous le seuil
 * d'échantillon, ni s'il manque des jours « sans ».
 */

const isMarked = (i: Intensity) => i === 'severe' || i === 'modere';

/** Symptômes évocateurs d'un excès d'amines biogènes. */
export const AMINE_SYMPTOMS: SymptomKey[] = [
  'urticaire',
  'rougeurs',
  'demangeaisons',
  'maux_de_tete',
  'fatigue_apres_repas',
  'nausees',
];

export interface AmineCorrelation {
  enoughData: boolean;
  analyzedDays: number;
  daysHighLoad: number;
  rateWithHigh: number; // part de jours à symptômes histaminiques quand charge élevée
  rateWithoutHigh: number; // … sinon
  lift: number; // rateWithHigh − rateWithoutHigh
  suspected: boolean; // lien jugé significatif
}

export interface AmineCorrelationOptions {
  minTotalDays?: number;
  minHighDays?: number;
  minRateWith?: number;
  minLift?: number;
}

const DEFAULTS: Required<AmineCorrelationOptions> = {
  minTotalDays: 5,
  minHighDays: 3,
  minRateWith: 0.5,
  minLift: 0.2,
};

const dayFoodNames = (day: DayEntry): string[] =>
  day.meals.flatMap((m) => m.foods.map((f) => f.name));

/** Un jour porte-t-il au moins un symptôme histaminique modéré/sévère ? */
function hasAmineSymptom(day: DayEntry): boolean {
  const s = effectiveDaySymptoms(day);
  return AMINE_SYMPTOMS.some((k) => isMarked(s[k]));
}

export function amineSymptomCorrelation(
  allDays: DayEntry[],
  options: AmineCorrelationOptions = {},
): AmineCorrelation {
  const opt = { ...DEFAULTS, ...options };
  const empty: AmineCorrelation = {
    enoughData: false,
    analyzedDays: 0,
    daysHighLoad: 0,
    rateWithHigh: 0,
    rateWithoutHigh: 0,
    lift: 0,
    suspected: false,
  };

  const recorded = allDays.filter(dayHasContent);
  const analyzedDays = recorded.length;
  if (analyzedDays < opt.minTotalDays) return { ...empty, analyzedDays };

  let withSym = 0;
  let withTot = 0;
  let withoutSym = 0;
  let withoutTot = 0;
  for (const day of recorded) {
    const high = dayAmineLoad(dayFoodNames(day)).band === 'eleve';
    const sym = hasAmineSymptom(day);
    if (high) {
      withTot++;
      if (sym) withSym++;
    } else {
      withoutTot++;
      if (sym) withoutSym++;
    }
  }

  if (withTot < opt.minHighDays || withoutTot === 0) {
    return { ...empty, enoughData: true, analyzedDays, daysHighLoad: withTot };
  }

  const rateWithHigh = withSym / withTot;
  const rateWithoutHigh = withoutSym / withoutTot;
  const lift = rateWithHigh - rateWithoutHigh;
  const suspected = rateWithHigh >= opt.minRateWith && lift >= opt.minLift;

  return {
    enoughData: true,
    analyzedDays,
    daysHighLoad: withTot,
    rateWithHigh,
    rateWithoutHigh,
    lift,
    suspected,
  };
}
