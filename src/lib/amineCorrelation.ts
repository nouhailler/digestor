import type { DayEntry, Intensity, SymptomKey, TypicalAmine } from '../types';
import { dayHasContent, effectiveDaySymptoms } from './aggregates';
import { dayAmineByType, dayAmineLoad } from './biogenicAmines';
import { SYMPTOM_ORDER } from './constants';
import { SYMPTOM_AMINE_META } from './symptomCatalog';

/**
 * Corrélation entre les jours à forte charge en amines biogènes et les jours
 * portant les symptômes correspondants. Deux niveaux :
 *  - `amineSymptomCorrelation` : charge GLOBALE ↔ symptômes histaminiques (repère
 *    d'ensemble, utilisé par la semaine / le dossier / le rapport de période) ;
 *  - `amineTypeCorrelation` : charge d'UNE amine (histamine / tyramine) ↔ les
 *    symptômes dont `typicalAmine` correspond (patterns histaminique / tyraminique).
 *
 * Mêmes garde-fous conservateurs que `contextCorrelations` : on ne conclut pas
 * sous le seuil d'échantillon, ni s'il manque des jours « sans ».
 */

const isMarked = (i: Intensity) => i === 'severe' || i === 'modere';

/**
 * Symptômes correspondant à une amine : ceux dont `typicalAmine` vaut cette
 * amine ou `both`. Dérivé du catalogue (posé avec les symptômes), plus de liste
 * codée en dur.
 */
function symptomsForAmine(amine: 'histamine' | 'tyramine'): SymptomKey[] {
  const match: TypicalAmine[] = [amine, 'both'];
  return SYMPTOM_ORDER.filter((k) => match.includes(SYMPTOM_AMINE_META[k].amine));
}

/** Symptômes évocateurs d'un excès d'amines (histaminiques) — dérivés du catalogue. */
export const AMINE_SYMPTOMS: SymptomKey[] = symptomsForAmine('histamine');

export interface AmineCorrelation {
  enoughData: boolean;
  analyzedDays: number;
  daysHighLoad: number;
  rateWithHigh: number; // part de jours à symptômes quand charge élevée
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

const EMPTY: AmineCorrelation = {
  enoughData: false,
  analyzedDays: 0,
  daysHighLoad: 0,
  rateWithHigh: 0,
  rateWithoutHigh: 0,
  lift: 0,
  suspected: false,
};

/**
 * Cœur de corrélation générique : croise « jour à charge élevée » (`isHigh`) et
 * « jour à symptômes » (`hasSymptom`) sur les jours renseignés, avec les mêmes
 * garde-fous d'échantillon.
 */
function correlate(
  allDays: DayEntry[],
  isHigh: (day: DayEntry) => boolean,
  hasSymptom: (day: DayEntry) => boolean,
  options: AmineCorrelationOptions,
): AmineCorrelation {
  const opt = { ...DEFAULTS, ...options };
  const recorded = allDays.filter(dayHasContent);
  const analyzedDays = recorded.length;
  if (analyzedDays < opt.minTotalDays) return { ...EMPTY, analyzedDays };

  let withSym = 0;
  let withTot = 0;
  let withoutSym = 0;
  let withoutTot = 0;
  for (const day of recorded) {
    const high = isHigh(day);
    const sym = hasSymptom(day);
    if (high) {
      withTot++;
      if (sym) withSym++;
    } else {
      withoutTot++;
      if (sym) withoutSym++;
    }
  }

  if (withTot < opt.minHighDays || withoutTot === 0) {
    return { ...EMPTY, enoughData: true, analyzedDays, daysHighLoad: withTot };
  }

  const rateWithHigh = withSym / withTot;
  const rateWithoutHigh = withoutSym / withoutTot;
  const lift = rateWithHigh - rateWithoutHigh;
  const suspected = rateWithHigh >= opt.minRateWith && lift >= opt.minLift;

  return { enoughData: true, analyzedDays, daysHighLoad: withTot, rateWithHigh, rateWithoutHigh, lift, suspected };
}

/** Un jour porte-t-il au moins un des symptômes donnés à un niveau modéré/sévère ? */
function hasAnySymptom(day: DayEntry, keys: SymptomKey[]): boolean {
  const s = effectiveDaySymptoms(day);
  return keys.some((k) => isMarked(s[k]));
}

/** Corrélation charge globale d'amines ↔ symptômes histaminiques (repère d'ensemble). */
export function amineSymptomCorrelation(
  allDays: DayEntry[],
  options: AmineCorrelationOptions = {},
): AmineCorrelation {
  return correlate(
    allDays,
    (day) => dayAmineLoad(dayFoodNames(day)).band === 'eleve',
    (day) => hasAnySymptom(day, AMINE_SYMPTOMS),
    options,
  );
}

/**
 * Corrélation fine pour UNE amine : la charge de cette amine sur la journée
 * (`dayAmineByType`) ↔ les symptômes dont `typicalAmine` correspond. Permet de
 * distinguer un pattern histaminique d'un pattern tyraminique.
 */
export function amineTypeCorrelation(
  allDays: DayEntry[],
  amine: 'histamine' | 'tyramine',
  options: AmineCorrelationOptions = {},
): AmineCorrelation {
  const keys = symptomsForAmine(amine);
  return correlate(
    allDays,
    (day) => dayAmineByType(dayFoodNames(day))[amine].band === 'eleve',
    (day) => hasAnySymptom(day, keys),
    options,
  );
}

/** Corrélations par type d'amine (histamine & tyramine), pour l'affichage des patterns. */
export interface AmineTypeCorrelations {
  histamine: AmineCorrelation;
  tyramine: AmineCorrelation;
}

export function amineTypeCorrelations(
  allDays: DayEntry[],
  options: AmineCorrelationOptions = {},
): AmineTypeCorrelations {
  return {
    histamine: amineTypeCorrelation(allDays, 'histamine', options),
    tyramine: amineTypeCorrelation(allDays, 'tyramine', options),
  };
}
