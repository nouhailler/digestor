import type { DayEntry, Intensity } from '../types';
import { SYMPTOM_ORDER } from './constants';
import { dayHasContent, effectiveDaySymptoms } from './aggregates';

const isMarked = (i: Intensity) => i === 'severe' || i === 'modere';

export type ContextFactor = 'stress' | 'sommeil' | 'regles';

export interface ContextLink {
  factor: ContextFactor;
  label: string;
  daysWith: number; // jours où le facteur est présent et exploitable
  rateWith: number; // part de jours « à symptômes » quand le facteur est présent
  rateWithout: number; // … quand il est absent
  lift: number; // rateWith − rateWithout
}

export interface ContextCorrelations {
  enoughData: boolean;
  analyzedDays: number;
  links: ContextLink[];
}

export interface ContextCorrelationsOptions {
  minTotalDays?: number;
  minFactorDays?: number;
  minRateWith?: number;
  minLift?: number;
}

const DEFAULTS: Required<ContextCorrelationsOptions> = {
  minTotalDays: 5,
  minFactorDays: 3,
  minRateWith: 0.5,
  minLift: 0.2,
};

/** Un jour est « à symptômes » s'il porte au moins un symptôme modéré ou sévère. */
function isSymptomDay(day: DayEntry): boolean {
  const s = effectiveDaySymptoms(day);
  return SYMPTOM_ORDER.some((k) => isMarked(s[k]));
}

/**
 * Corrélations entre facteurs contextuels (stress élevé, manque de sommeil, règles)
 * et jours à symptômes — calculées sur les données réelles, avec les mêmes garde-fous
 * conservateurs que `personalCorrelations`. N'inclut un facteur que s'il est exploitable
 * (au moins quelques jours « avec » ET quelques jours « sans »).
 */
export function contextCorrelations(
  allDays: DayEntry[],
  options: ContextCorrelationsOptions = {},
): ContextCorrelations {
  const opt = { ...DEFAULTS, ...options };
  const recorded = allDays.filter(dayHasContent);
  const analyzedDays = recorded.length;
  if (analyzedDays < opt.minTotalDays) return { enoughData: false, analyzedDays, links: [] };

  const symptomDay = recorded.map(isSymptomDay);

  const predicates: { factor: ContextFactor; label: string; has: (d: DayEntry) => boolean | null }[] = [
    {
      factor: 'stress',
      label: 'Stress élevé',
      has: (d) => (d.stress == null ? null : isMarked(d.stress)),
    },
    {
      factor: 'sommeil',
      label: 'Sommeil court (< 6 h)',
      has: (d) => (typeof d.sleepH === 'number' ? d.sleepH < 6 : null),
    },
    {
      factor: 'regles',
      label: 'Règles',
      has: (d) => d.menstrual === true ? true : d.menstrual === false ? false : null,
    },
  ];

  const links: ContextLink[] = [];
  for (const p of predicates) {
    let withSym = 0;
    let withTot = 0;
    let withoutSym = 0;
    let withoutTot = 0;
    recorded.forEach((day, i) => {
      const v = p.has(day);
      if (v === null) return; // facteur non renseigné ce jour → ignoré
      if (v) {
        withTot++;
        if (symptomDay[i]) withSym++;
      } else {
        withoutTot++;
        if (symptomDay[i]) withoutSym++;
      }
    });
    if (withTot < opt.minFactorDays || withoutTot === 0) continue;
    const rateWith = withSym / withTot;
    const rateWithout = withoutSym / withoutTot;
    const lift = rateWith - rateWithout;
    if (rateWith >= opt.minRateWith && lift >= opt.minLift) {
      links.push({ factor: p.factor, label: p.label, daysWith: withTot, rateWith, rateWithout, lift });
    }
  }

  links.sort((a, b) => b.lift - a.lift);
  return { enoughData: true, analyzedDays, links };
}
