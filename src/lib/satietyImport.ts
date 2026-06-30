import type { DayEntry, Meal, SatietyCheck, SatietyCheckpoint, SatietyType } from '../types';
import { parseJsonLoose } from './json';
import { normalize } from './foodClassifier';
import { clampVas, upsertCheck, VAS_NEUTRAL } from './satiety';
import { syncSatietyNotes } from './satietyDuration';

/** Un relevé de satiété importé, ciblant un repas par sa date + son heure. */
export interface ImportedSatietySet {
  date?: string; // ISO ; sinon date par défaut au moment de l'application
  mealTime?: string; // "HH:MM" du repas ciblé
  checks: SatietyCheck[];
}

export interface ParsedSatietyImport {
  sets: ImportedSatietySet[];
  warnings: string[];
}

const TIME_RE = /^(\d{1,2}):(\d{2})$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---- Résolution des checkpoints ----

const CHECKPOINT_SYNONYMS: Record<string, SatietyCheckpoint> = {
  immediate: 'immediate',
  immediat: 'immediate',
  '0h': 'immediate',
  '0 h': 'immediate',
  '0': 'immediate',
  'apres repas': 'immediate',
  'juste apres': 'immediate',
  '1h': '1h',
  '1 h': '1h',
  '1': '1h',
  '2h': '2h',
  '2 h': '2h',
  '2': '2h',
  '3h': '3h',
  '3 h': '3h',
  '3': '3h',
};

export function resolveCheckpoint(input: unknown): SatietyCheckpoint | null {
  if (typeof input !== 'string') return null;
  return CHECKPOINT_SYNONYMS[normalize(input)] ?? null;
}

// ---- Résolution du type de satiété ----

const TYPE_SYNONYMS: Record<string, SatietyType> = {
  legere: 'legere',
  leger: 'legere',
  light: 'legere',
  lourde: 'lourde',
  lourd: 'lourde',
  heavy: 'lourde',
  ballonnement: 'ballonnement',
  ballonnements: 'ballonnement',
  ballonne: 'ballonnement',
  bloated: 'ballonnement',
};

export function resolveSatietyType(input: unknown): SatietyType | null {
  if (typeof input !== 'string') return null;
  return TYPE_SYNONYMS[normalize(input)] ?? null;
}

// ---- Parsing ----

function timeToMin(t: string): number | null {
  const m = t.match(TIME_RE);
  if (!m) return null;
  return Math.min(23, Number(m[1])) * 60 + Number(m[2]);
}

function normalizeTime(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const m = raw.trim().match(TIME_RE);
  if (!m) return undefined;
  const h = Math.min(23, Number(m[1]));
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

function parseVas(o: Record<string, unknown>, key: string, label: string, warnings: string[]): number {
  const v = o[key];
  if (typeof v === 'number') return clampVas(v);
  if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) return clampVas(Number(v));
  if (v !== undefined) warnings.push(`Valeur « ${label} » invalide (${JSON.stringify(v)}) → ${VAS_NEUTRAL}.`);
  return VAS_NEUTRAL;
}

function parseCheck(raw: unknown, warnings: string[]): SatietyCheck | null {
  if (!raw || typeof raw !== 'object') {
    warnings.push('Relevé de satiété ignoré (format inattendu).');
    return null;
  }
  const o = raw as Record<string, unknown>;
  const checkpoint = resolveCheckpoint(o.checkpoint);
  if (!checkpoint) {
    warnings.push(`Checkpoint inconnu ignoré : ${JSON.stringify(o.checkpoint)}.`);
    return null;
  }
  const check: SatietyCheck = {
    checkpoint,
    hungerIntensity: parseVas(o, 'hungerIntensity', 'intensité de la faim', warnings),
    energyLevel: parseVas(o, 'energyLevel', 'énergie', warnings),
    sugarCraving: parseVas(o, 'sugarCraving', 'envie de sucre', warnings),
  };
  const type = resolveSatietyType(o.satietyType);
  if (type) check.satietyType = type;
  else if (o.satietyType !== undefined && o.satietyType !== null)
    warnings.push(`Type de satiété inconnu ignoré : ${JSON.stringify(o.satietyType)}.`);
  if (typeof o.notes === 'string' && o.notes.trim()) check.notes = o.notes.trim();
  if (typeof o.timestamp === 'string' && o.timestamp.trim()) check.timestamp = o.timestamp.trim();
  return check;
}

function parseSet(raw: unknown, fallbackDate: string | undefined, warnings: string[]): ImportedSatietySet | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const checksRaw = Array.isArray(o.checks) ? o.checks : [];
  const checks = checksRaw.map((c) => parseCheck(c, warnings)).filter((c): c is SatietyCheck => !!c);
  if (checks.length === 0) {
    warnings.push('Relevé sans checkpoint exploitable ignoré.');
    return null;
  }

  let date: string | undefined;
  if (typeof o.date === 'string' && DATE_RE.test(o.date.trim())) date = o.date.trim();
  else if (o.date !== undefined) {
    warnings.push(`Date « ${String(o.date)} » ignorée (format attendu AAAA-MM-JJ).`);
    date = fallbackDate;
  } else date = fallbackDate;

  const mealTime = normalizeTime(o.mealTime);
  if (o.mealTime !== undefined && !mealTime)
    warnings.push(`Heure de repas « ${String(o.mealTime)} » ignorée (format attendu HH:MM).`);

  return { date, mealTime, checks };
}

/**
 * Analyse un texte collé (JSON éventuellement entouré de prose / fences).
 * Accepte « { sets: [...] } » ou un relevé unique « { mealTime, checks: [...] } ».
 */
export function parseSatietyImport(text: string, fallbackDate?: string): ParsedSatietyImport {
  if (!text.trim()) throw new Error('Collez d’abord le JSON généré.');

  let obj: Record<string, unknown>;
  try {
    obj = parseJsonLoose<Record<string, unknown>>(text);
  } catch {
    throw new Error('JSON invalide : vérifiez le copier-coller.');
  }

  if (obj.app !== undefined && obj.app !== 'digestor') {
    throw new Error("Ce JSON n'est pas au format Digestor.");
  }

  const warnings: string[] = [];
  const topDate =
    typeof obj.date === 'string' && DATE_RE.test(obj.date.trim()) ? obj.date.trim() : fallbackDate;

  const rawSets = Array.isArray(obj.sets) ? obj.sets : Array.isArray(obj.checks) ? [obj] : [];
  if (rawSets.length === 0) {
    throw new Error('Aucun relevé trouvé. Attendu : { "sets": [ { "mealTime": "12:30", "checks": [...] } ] }.');
  }

  const sets = rawSets
    .map((s) => parseSet(s, topDate, warnings))
    .filter((s): s is ImportedSatietySet => !!s);

  if (sets.length === 0) throw new Error('Aucun relevé de satiété exploitable dans ce JSON.');

  return { sets, warnings };
}

// ---- Application ----

export interface ApplyResult {
  day: DayEntry;
  warning?: string;
}

/**
 * Rattache les relevés d'un set au repas ciblé (par heure exacte, sinon le plus
 * proche, sinon le dernier repas du jour). Fusionne via upsertCheck (1 relevé
 * max par checkpoint). Renvoie la journée mise à jour + un éventuel avertissement.
 */
export function applySatietyToDay(day: DayEntry, set: ImportedSatietySet): ApplyResult {
  if (set.checks.length === 0) return { day };
  if (day.meals.length === 0) {
    return { day, warning: `Aucun repas le ${day.date} : satiété non rattachée.` };
  }

  let target: Meal;
  let warning: string | undefined;
  const wantMin = set.mealTime ? timeToMin(set.mealTime) : null;

  if (wantMin !== null) {
    const exact = day.meals.find((m) => m.time === set.mealTime);
    if (exact) {
      target = exact;
    } else {
      target = [...day.meals].sort(
        (a, b) =>
          Math.abs((timeToMin(a.time) ?? 0) - wantMin) - Math.abs((timeToMin(b.time) ?? 0) - wantMin),
      )[0];
      warning = `Aucun repas à ${set.mealTime} : satiété rattachée au repas de ${target.time}.`;
    }
  } else {
    target = [...day.meals].sort((a, b) => a.time.localeCompare(b.time))[day.meals.length - 1];
    warning = `Heure de repas non précisée : satiété rattachée au repas de ${target.time}.`;
  }

  const meals = day.meals.map((m) => {
    if (m.id !== target.id) return m;
    let satiety = m.satiety ?? [];
    for (const c of set.checks) satiety = upsertCheck(satiety, c);
    return { ...m, satiety };
  });

  return { day: syncSatietyNotes({ ...day, meals }), warning };
}

export interface SatietyImportCounts {
  sets: number;
  checks: number;
}

export function countSatietyImport(parsed: ParsedSatietyImport): SatietyImportCounts {
  return {
    sets: parsed.sets.length,
    checks: parsed.sets.reduce((n, s) => n + s.checks.length, 0),
  };
}
