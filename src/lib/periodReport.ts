import type { DayEntry, PeriodTrend, SymptomKey } from '../types';
import { INTENSITY_WEIGHT, SYMPTOM_LABELS, SYMPTOM_ORDER } from './constants';
import { dayHasContent, effectiveDaySymptoms, topSymptoms } from './aggregates';
import { dayAmineLoad } from './biogenicAmines';
import { amineSymptomCorrelation } from './amineCorrelation';
import { normalize } from './foodClassifier';

/** Aliments d'un jour (noms), pour la charge en amines. */
const dayFoodNames = (day: DayEntry): string[] => day.meals.flatMap((m) => m.foods.map((f) => f.name));

const isMarked = (k: SymptomKey, s: Record<SymptomKey, import('../types').Intensity>) =>
  s[k] === 'severe' || s[k] === 'modere';

interface HalfStats {
  days: number;
  symptomDayRate: number; // part de jours à symptômes
  avgSeverity: number; // somme pondérée des symptômes / jour
  avgHydration: number | null;
  proPerDay: number; // aliments « pro » par jour
  amineHighRate: number; // part de jours à charge amines élevée
}

function halfStats(days: DayEntry[]): HalfStats {
  let symptomDays = 0;
  let severitySum = 0;
  let hydrationSum = 0;
  let hydrationN = 0;
  let proCount = 0;
  let amineHighDays = 0;
  for (const day of days) {
    const sym = effectiveDaySymptoms(day);
    let w = 0;
    let marked = false;
    for (const k of SYMPTOM_ORDER) {
      w += INTENSITY_WEIGHT[sym[k]];
      if (isMarked(k, sym)) marked = true;
    }
    severitySum += w;
    if (marked) symptomDays++;
    if (typeof day.hydrationL === 'number') {
      hydrationSum += day.hydrationL;
      hydrationN++;
    }
    for (const m of day.meals) for (const f of m.foods) if (f.category === 'pro') proCount++;
    if (dayAmineLoad(dayFoodNames(day)).band === 'eleve') amineHighDays++;
  }
  const n = days.length || 1;
  return {
    days: days.length,
    symptomDayRate: symptomDays / n,
    avgSeverity: severitySum / n,
    avgHydration: hydrationN > 0 ? hydrationSum / hydrationN : null,
    proPerDay: proCount / n,
    amineHighRate: amineHighDays / n,
  };
}

function pct(x: number): string {
  return `${Math.round(x * 100)} %`;
}

/**
 * Tendances calculées en comparant la 1re et la 2de moitié de la période
 * (uniquement les jours renseignés). Renvoie `[]` sous 4 jours (trop court).
 */
export function computeTrends(allDays: DayEntry[]): PeriodTrend[] {
  const recorded = allDays.filter(dayHasContent).sort((a, b) => a.date.localeCompare(b.date));
  if (recorded.length < 4) return [];
  const mid = Math.floor(recorded.length / 2);
  const a = halfStats(recorded.slice(0, mid));
  const b = halfStats(recorded.slice(mid));

  const trends: PeriodTrend[] = [];
  const add = (
    metric: string,
    av: number,
    bv: number,
    flat: number,
    lowerIsBetter: boolean,
    fmt: (x: number) => string,
  ) => {
    const delta = bv - av;
    const direction = Math.abs(delta) < flat ? 'flat' : delta > 0 ? 'up' : 'down';
    const good = direction === 'flat' ? true : lowerIsBetter ? delta < 0 : delta > 0;
    trends.push({ metric, direction, detail: `${fmt(av)} → ${fmt(bv)}`, good });
  };

  add('Jours à symptômes', a.symptomDayRate, b.symptomDayRate, 0.1, true, pct);
  add('Sévérité moyenne / jour', a.avgSeverity, b.avgSeverity, 0.5, true, (x) => x.toFixed(1));
  add('Aliments défavorables / jour', a.proPerDay, b.proPerDay, 0.5, true, (x) => x.toFixed(1));
  // Charge en amines : n'ajoute la tendance que si la période en comporte (évite le bruit « 0 % → 0 % »).
  if (a.amineHighRate > 0 || b.amineHighRate > 0) {
    add('Jours à charge amines élevée', a.amineHighRate, b.amineHighRate, 0.1, true, pct);
  }
  if (a.avgHydration != null && b.avgHydration != null) {
    add('Hydratation moyenne', a.avgHydration, b.avgHydration, 0.2, false, (x) => `${x.toFixed(1)} L`);
  }
  return trends;
}

/** Aliments « pro » les plus fréquents de la période (pour le prompt). */
function topProFoods(days: DayEntry[], max = 6): string[] {
  const acc = new Map<string, { name: string; count: number }>();
  for (const day of days)
    for (const m of day.meals)
      for (const f of m.foods)
        if (f.category === 'pro') {
          const k = normalize(f.name);
          const e = acc.get(k) ?? { name: f.name.trim(), count: 0 };
          e.count++;
          acc.set(k, e);
        }
  return [...acc.values()]
    .sort((x, y) => y.count - x.count)
    .slice(0, max)
    .map((x) => `${x.name} (×${x.count})`);
}

/** Résumé texte d'une période pour le prompt IA (pur, testable). */
export function describePeriod(allDays: DayEntry[], label: string): string {
  const recorded = allDays.filter(dayHasContent).sort((a, b) => a.date.localeCompare(b.date));
  if (recorded.length === 0) return `Période : ${label}. Aucune donnée renseignée.`;
  const from = recorded[0].date;
  const to = recorded[recorded.length - 1].date;

  const symptomDays = recorded.filter((d) => {
    const s = effectiveDaySymptoms(d);
    return SYMPTOM_ORDER.some((k) => isMarked(k, s));
  }).length;

  const tops = topSymptoms(recorded)
    .slice(0, 5)
    .map((t) => `${SYMPTOM_LABELS[t.key]} (${t.weight})`)
    .join(', ');

  const trends = computeTrends(recorded)
    .map((t) => `${t.metric} : ${t.detail} (${t.good ? 'mieux' : 'moins bien'})`)
    .join(' ; ');

  const pro = topProFoods(recorded);

  // Charge en amines biogènes (histamine) : jours à charge élevée + lien avec les symptômes histaminiques.
  const amineHighDays = recorded.filter((d) => dayAmineLoad(dayFoodNames(d)).band === 'eleve').length;
  const amineCorr = amineSymptomCorrelation(recorded);

  const lines = [
    `Période : ${label} (${recorded.length} jours renseignés, du ${from} au ${to})`,
    `Jours à symptômes : ${symptomDays}/${recorded.length}`,
    `Top symptômes (intensité cumulée) : ${tops || 'aucun'}`,
  ];
  if (pro.length) lines.push(`Aliments défavorables fréquents : ${pro.join(', ')}`);
  if (amineHighDays > 0) {
    let amineLine = `Charge en amines biogènes (histamine) : ${amineHighDays}/${recorded.length} jours à charge élevée`;
    if (amineCorr.suspected) {
      amineLine += ` — lien probable avec les symptômes histaminiques (${pct(amineCorr.rateWithHigh)} de ces jours vs ${pct(amineCorr.rateWithoutHigh)} sinon)`;
    }
    lines.push(amineLine);
  }
  if (trends) lines.push(`Évolution (1re vs 2de moitié) : ${trends}`);
  return lines.join('\n');
}
