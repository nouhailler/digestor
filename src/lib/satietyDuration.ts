import type { DayEntry, FoodInsight, Meal, SatietyCheck, SatietyCheckpoint } from '../types';
import { normalize } from './foodClassifier';
import { sortChecks } from './satiety';
import { dominantCategory } from './satietyCorrelation';

/** Seuil de faim (VAS) au-delà duquel on considère que la satiété est terminée. */
export const HUNGER_RETURN = 50;

const CHECKPOINT_HOURS: Record<SatietyCheckpoint, number> = {
  immediate: 0,
  '1h': 1,
  '2h': 2,
  '3h': 3,
};

// ---- Durée mesurée (retour de la faim au fil des checkpoints) ----

export interface MeasuredSatiety {
  hours: number; // heures de satiété (ou borne basse si ongoing)
  ongoing: boolean; // la faim n'était pas revenue au dernier relevé
  upperBound?: boolean; // la faim est déjà revenue dès le 1er relevé (pas de point antérieur)
}

/**
 * Estime la durée de satiété d'après les relevés : on cherche le moment où la
 * faim (`hungerIntensity`) repasse au-dessus du seuil, par interpolation linéaire
 * entre deux checkpoints. Renvoie `null` si aucun relevé.
 */
export function measureSatiety(checks: SatietyCheck[]): MeasuredSatiety | null {
  const sorted = sortChecks(checks);
  if (sorted.length === 0) return null;
  const pts = sorted.map((c) => ({ h: CHECKPOINT_HOURS[c.checkpoint], hunger: c.hungerIntensity }));

  // Faim déjà revenue dès le premier relevé → satiété terminée à/avant ce point.
  if (pts[0].hunger >= HUNGER_RETURN) {
    return { hours: pts[0].h, ongoing: false, upperBound: pts[0].h > 0 };
  }
  // Cherche le franchissement du seuil entre deux relevés.
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (b.hunger >= HUNGER_RETURN) {
      const frac = (HUNGER_RETURN - a.hunger) / (b.hunger - a.hunger);
      const hours = a.h + frac * (b.h - a.h);
      return { hours: Math.round(hours * 10) / 10, ongoing: false };
    }
  }
  // Jamais franchi → toujours rassasié au dernier relevé.
  return { hours: pts[pts.length - 1].h, ongoing: true };
}

// ---- Durée attendue (heuristique de composition) ----

export interface ExpectedSatiety {
  minH: number;
  maxH: number;
}

/**
 * Durée de satiété *attendue*, approximée d'après la composition. Digestor n'a
 * pas les macros : on s'appuie sur la catégorie dominante (bénéfique ~ protéines/
 * fibres → long ; pro ~ sucres/raffinés → court) et, si dispo, le FODMAP élevé
 * (raccourcit). Approximation assumée.
 */
export function expectedSatiety(meal: Meal, insights?: Map<string, FoodInsight>): ExpectedSatiety {
  if (meal.foods.length === 0) return { minH: 3, maxH: 4 };
  const cat = dominantCategory(meal);
  let range: ExpectedSatiety =
    cat === 'beneficial' ? { minH: 4, maxH: 5 } : cat === 'pro' ? { minH: 2, maxH: 3 } : { minH: 3, maxH: 4 };

  if (insights) {
    const hasHigh = meal.foods.some((f) => insights.get(normalize(f.name))?.fodmapLevel === 'high');
    if (hasHigh) range = { minH: Math.max(1, range.minH - 1), maxH: Math.max(2, range.maxH - 1) };
  }
  return range;
}

// ---- Formatage ----

/** « 1.83 » → « 1 h 50 », « 2 » → « 2 h », « 0.5 » → « 30 min ». */
export function formatHours(h: number): string {
  if (h <= 0) return '0 h';
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  if (hh === 0) return `${mm} min`;
  return mm === 0 ? `${hh} h` : `${hh} h ${String(mm).padStart(2, '0')}`;
}

/**
 * Phrase synthétique « cœur » de la durée de satiété (sans le mot « Satiété »),
 * combinant mesurée + attendue. Renvoie `null` si le repas n'a aucun relevé.
 * Ex. « tenue ~1 h 50 (attendu ~4–5 h) », « encore rassasié à +3 h (attendu ~3–4 h) ».
 */
export function satietyDurationCore(meal: Meal, insights?: Map<string, FoodInsight>): string | null {
  const checks = meal.satiety ?? [];
  const m = measureSatiety(checks);
  if (!m) return null;
  const e = expectedSatiety(meal, insights);
  const expected = `attendu ~${e.minH}–${e.maxH} h`;
  if (m.ongoing) {
    return m.hours < 1 ? `en cours (${expected})` : `encore rassasié à +${formatHours(m.hours)} (${expected})`;
  }
  if (m.hours <= 0) return `peu rassasiant (${expected})`;
  return `tenue ~${formatHours(m.hours)}${m.upperBound ? ' ou moins' : ''} (${expected})`;
}

// ---- Synchronisation des Notes du jour ----

/** Préfixe des lignes de notes générées automatiquement pour la satiété. */
export const SATIETY_NOTE_PREFIX = '⏱ Satiété';
const SATIETY_NOTE_RE = /^⏱ Satiété \(\d{1,2}:\d{2}\)/;

function satietyNoteLine(meal: Meal, insights?: Map<string, FoodInsight>): string {
  return `${SATIETY_NOTE_PREFIX} (${meal.time}) : ${satietyDurationCore(meal, insights)}`;
}

/**
 * Réécrit, dans les Notes du jour, une ligne « ⏱ Satiété (HH:MM) : … » par repas
 * porteur de relevés — en préservant le texte libre de l'utilisateur. Idempotent
 * (supprime les anciennes lignes auto avant de réinsérer les courantes).
 */
export function syncSatietyNotes(day: DayEntry, insights?: Map<string, FoodInsight>): DayEntry {
  const kept = (day.notes ?? '').split('\n').filter((l) => !SATIETY_NOTE_RE.test(l.trim()));
  while (kept.length && kept[kept.length - 1].trim() === '') kept.pop();
  const userText = kept.join('\n').trim();

  const autoLines = [...day.meals]
    .sort((a, b) => a.time.localeCompare(b.time))
    .filter((m) => m.satiety && m.satiety.length > 0)
    .map((m) => satietyNoteLine(m, insights));
  const auto = autoLines.join('\n');

  const notes = [userText, auto].filter(Boolean).join(userText && auto ? '\n\n' : '');
  return { ...day, notes: notes || undefined };
}
