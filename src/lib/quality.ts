import type { DayEntry, DayQuality, Intensity, SymptomKey } from '../types';
import { INTENSITY_WEIGHT, SYMPTOM_ORDER } from './constants';
import { effectiveDaySymptoms } from './aggregates';

function tally(symptoms: Record<SymptomKey, Intensity>) {
  let active = 0;
  let modere = 0;
  let severe = 0;
  for (const k of SYMPTOM_ORDER) {
    const v = symptoms[k];
    if (v === 'absent') continue;
    active++;
    if (v === 'severe') severe++;
    else if (v === 'modere') modere++;
  }
  return { active, modere, severe };
}

/**
 * Badge qualité auto-proposé d'après le cumul des symptômes de la journée
 * (tous repas confondus). Trois niveaux : vert → orange → rouge.
 *  - « bonne » (vert)      : au plus 1 symptôme léger, aucun modéré/sévère.
 *  - « difficile » (rouge) : ≥ 4 symptômes cumulés, OU ≥ 2 sévères.
 *  - « correcte » (orange) : entre les deux (2–3 symptômes, sévérité limitée).
 * Reste surchargeable manuellement (cf. DayEntry.quality).
 */
export function suggestQuality(symptoms: Record<SymptomKey, Intensity>): DayQuality {
  const { active, modere, severe } = tally(symptoms);
  if (severe >= 2 || active >= 4) return 'difficile';
  if (active === 0 || (active <= 1 && modere === 0 && severe === 0)) return 'bonne';
  return 'correcte';
}

/** Qualité auto proposée pour une journée (symptômes effectifs = jour + repas). */
export function suggestDayQuality(day: DayEntry): DayQuality {
  return suggestQuality(effectiveDaySymptoms(day));
}

/** Score de sévérité du jour (somme pondérée des intensités effectives). */
export function dayseverityScore(day: DayEntry): number {
  const sym = effectiveDaySymptoms(day);
  let total = 0;
  for (const k of SYMPTOM_ORDER) total += INTENSITY_WEIGHT[sym[k]];
  return total;
}
