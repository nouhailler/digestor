import type { DayEntry, Intensity } from '../types';
import { normalize } from './foodClassifier';
import { effectiveDaySymptoms } from './aggregates';

export type CorrelationLevel = 'defavorable' | 'surveiller' | 'favorable' | 'neutre';

export interface Correlation {
  text: string;
  level: CorrelationLevel; // rouge | ambre | vert | gris
}

const SEVERE_OR_MODERE = (i: Intensity) => i === 'severe' || i === 'modere';

interface DayFlags {
  hasSugar: boolean;
  hasAlcohol: boolean;
  hasWhiteBreadMorning: boolean;
  hasQuinoaOrSweetPotato: boolean;
  hasGarlicAndGinger: boolean;
  hasCereals: boolean;
  severeBloating: boolean;
  bloatingAtLeastModere: boolean;
  sugarCravingPM: boolean;
  comfortableDigestion: boolean;
}

function flagsFor(day: DayEntry): DayFlags {
  let hasSugar = false;
  let hasAlcohol = false;
  let hasWhiteBreadMorning = false;
  let hasQuinoaOrSweetPotato = false;
  let hasGarlic = false;
  let hasGinger = false;
  let hasCereals = false;

  for (const meal of day.meals) {
    const morning = meal.time < '11:00';
    for (const f of meal.foods) {
      const n = normalize(f.name);
      if (/(sucre|confiture|biscuit|gateau|patisserie|miel|chocolat|bonbon|jus|soda|sirop|glace)/.test(n))
        hasSugar = true;
      if (/(vin|biere|alcool|champagne|whisky|rhum)/.test(n)) hasAlcohol = true;
      if (n.includes('pain blanc') && morning) hasWhiteBreadMorning = true;
      if (n.includes('quinoa') || n.includes('patate douce')) hasQuinoaOrSweetPotato = true;
      if (n.includes('ail')) hasGarlic = true;
      if (n.includes('gingembre')) hasGinger = true;
      if (/(pain|pate|pates|cereale|riz blanc|baguette|farine|quinoa|patate douce|riz complet)/.test(n))
        hasCereals = true;
    }
  }

  const sym = effectiveDaySymptoms(day);
  return {
    hasSugar,
    hasAlcohol,
    hasWhiteBreadMorning,
    hasQuinoaOrSweetPotato,
    hasGarlicAndGinger: hasGarlic && hasGinger,
    hasCereals,
    severeBloating: sym.ballonnements === 'severe',
    bloatingAtLeastModere: SEVERE_OR_MODERE(sym.ballonnements),
    sugarCravingPM: SEVERE_OR_MODERE(sym.envie_sucre),
    comfortableDigestion: sym.ballonnements !== 'severe' && sym.gaz !== 'severe',
  };
}

const MIN_SAMPLE = 3; // jours avec données nécessaires pour conclure

/**
 * Détection heuristique, transparente et conservatrice :
 * on ne conclut un motif que si l'occurrence dépasse un seuil sur l'échantillon.
 * N'invente rien : sans assez de données → message dédié (liste vide ⇒ géré en UI).
 */
export function detectCorrelations(days: DayEntry[]): Correlation[] {
  const active = days.filter((d) => d.meals.some((m) => m.foods.length > 0));
  if (active.length < MIN_SAMPLE) return [];

  const flags = active.map(flagsFor);
  const out: Correlation[] = [];

  const ratio = (pred: (f: DayFlags) => boolean, cond: (f: DayFlags) => boolean) => {
    const base = flags.filter(pred);
    if (base.length === 0) return { n: 0, hit: 0, rate: 0 };
    const hit = base.filter(cond).length;
    return { n: base.length, hit, rate: hit / base.length };
  };

  // Sucre + alcool → ballonnements sévères (même jour)
  const sa = ratio((f) => f.hasSugar && f.hasAlcohol, (f) => f.severeBloating);
  if (sa.n >= 2 && sa.rate >= 0.5)
    out.push({ text: 'Sucre + alcool → ballonnements sévères dans les 2 h', level: 'defavorable' });

  // Pain blanc le matin → envie de sucre l'après-midi
  const pb = ratio((f) => f.hasWhiteBreadMorning, (f) => f.sugarCravingPM);
  if (pb.n >= 2 && pb.rate >= 0.5)
    out.push({ text: "Pain blanc le matin → envie compulsive de sucre l'après-midi", level: 'defavorable' });

  // Quinoa / patate douce → ballonnements légers tolérables
  const qp = ratio((f) => f.hasQuinoaOrSweetPotato, (f) => f.bloatingAtLeastModere);
  if (qp.n >= 2 && qp.rate >= 0.4 && qp.rate < 0.75)
    out.push({ text: 'Quinoa et patate douce → ballonnements légers tolérables', level: 'surveiller' });

  // Ail + gingembre → digestion plus confortable
  const ag = ratio((f) => f.hasGarlicAndGinger, (f) => f.comfortableDigestion);
  if (ag.n >= 2 && ag.rate >= 0.6)
    out.push({ text: 'Ail + gingembre → digestion plus confortable', level: 'favorable' });

  // Jours sans céréales → 0 ballonnement sévère
  const nc = ratio((f) => !f.hasCereals, (f) => !f.severeBloating);
  const noCerealDays = flags.filter((f) => !f.hasCereals).length;
  if (noCerealDays >= 2 && nc.rate === 1)
    out.push({ text: 'Jours sans céréales → 0 ballonnement sévère', level: 'neutre' });

  return out;
}
