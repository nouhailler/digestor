import type {
  DayEntry,
  DayQuality,
  FoodCategory,
  FoodInsight,
  FoodQuantity,
  Intensity,
  MealTag,
  Stool,
  SymptomKey,
} from '../types';
import { parseJsonLoose } from './json';
import { makeFood, uid } from './factory';
import { parseQuantity } from './quantity';
import { parseMealTags } from './mealTags';
import { normalize } from './foodClassifier';
import { SYMPTOM_LABELS, SYMPTOM_ORDER } from './constants';
import { buildFoodInsight } from './ai/foodInsight';

export const IMPORT_INSIGHT_MODEL = 'Import (Claude Web)';

export interface ImportedFood {
  name: string;
  category?: FoodCategory; // explicite ou dérivée de l'insight
  insight?: FoodInsight; // fiche FODMAP/SIBO/candidose fournie par l'import
  quantity?: FoodQuantity; // portion (ex. 1 càc), si fournie
}

export interface ImportedMeal {
  time: string; // "HH:MM"
  foods: ImportedFood[];
  tags?: MealTag[]; // composition (protéiné / fibres / sucré)
}

export interface ImportedDay {
  date?: string; // ISO ; sinon date par défaut au moment de l'application
  meals: ImportedMeal[];
  notes?: string;
  symptoms?: Partial<Record<SymptomKey, Intensity>>;
  symptomTiming?: string;
  hydrationL?: number;
  stool?: Stool;
  digestionDelayH?: number;
  quality?: DayQuality;
}

export interface ParsedMealsImport {
  days: ImportedDay[];
  warnings: string[];
}

export type MergeMode = 'append' | 'replace';

const TIME_RE = /^(\d{1,2}):(\d{2})$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CATEGORIES: FoodCategory[] = ['pro', 'beneficial', 'neutral'];
const INSIGHT_FIELDS = ['fodmapLevel', 'fodmaps', 'sibo', 'candida', 'amines', 'summary', 'tips', 'safePortion'];

// ---- Résolution symptômes / intensités ----

const SYMPTOM_SYNONYMS: Record<string, SymptomKey> = {};
for (const k of SYMPTOM_ORDER) {
  SYMPTOM_SYNONYMS[normalize(k)] = k; // clé canonique (underscores → espaces)
  SYMPTOM_SYNONYMS[normalize(SYMPTOM_LABELS[k])] = k; // libellé affiché
}
Object.assign(SYMPTOM_SYNONYMS, {
  ballonnement: 'ballonnements',
  flatulences: 'gaz',
  'douleurs abdo': 'douleurs_abdo',
  'douleur abdominale': 'douleurs_abdo',
  brulures: 'reflux',
  rgo: 'reflux',
  fatigue: 'fatigue_apres_repas',
  'fringale sucree': 'envie_sucre',
  fringale: 'envie_sucre',
  'selles molles': 'diarrhee',
  diarrhee: 'diarrhee',
  brouillard: 'brouillard_mental',
  'brain fog': 'brouillard_mental',
  mycose: 'mycose_buccale',
  muguet: 'mycose_buccale',
  demangeaison: 'demangeaisons',
  prurit: 'demangeaisons',
  nausee: 'nausees',
} satisfies Record<string, SymptomKey>);

export function resolveSymptomKey(input: string): SymptomKey | null {
  return SYMPTOM_SYNONYMS[normalize(input)] ?? null;
}

const INTENSITY_MAP: Record<string, Intensity> = {
  absent: 'absent',
  nul: 'absent',
  aucun: 'absent',
  leger: 'leger',
  legere: 'leger',
  faible: 'leger',
  modere: 'modere',
  moderee: 'modere',
  moyen: 'modere',
  severe: 'severe',
  fort: 'severe',
  intense: 'severe',
};

export function resolveIntensity(input: unknown): Intensity | null {
  if (typeof input !== 'string') return null;
  return INTENSITY_MAP[normalize(input)] ?? null;
}

// ---- Parsing ----

function normalizeTime(raw: unknown, warnings: string[]): string {
  if (typeof raw === 'string') {
    const m = raw.trim().match(TIME_RE);
    if (m) {
      const h = Math.min(23, Number(m[1]));
      return `${String(h).padStart(2, '0')}:${m[2]}`;
    }
  }
  warnings.push(`Heure de repas invalide ou absente (${JSON.stringify(raw)}) → 12:00.`);
  return '12:00';
}

function hasInsightFields(o: Record<string, unknown>): boolean {
  return INSIGHT_FIELDS.some((f) => o[f] !== undefined);
}

function parseFood(raw: unknown, warnings: string[]): ImportedFood | null {
  if (typeof raw === 'string') {
    const name = raw.trim();
    return name ? { name } : null;
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const name = typeof o.name === 'string' ? o.name.trim() : '';
    if (!name) return null;
    const explicit =
      typeof o.category === 'string' && CATEGORIES.includes(o.category as FoodCategory)
        ? (o.category as FoodCategory)
        : undefined;
    const insight = hasInsightFields(o)
      ? buildFoodInsight(o, name, IMPORT_INSIGHT_MODEL)
      : undefined;
    const quantity = parseQuantity(o.quantity);
    return { name, category: explicit ?? insight?.category, insight, quantity };
  }
  warnings.push(`Aliment ignoré (format inattendu) : ${JSON.stringify(raw)}.`);
  return null;
}

function parseMeal(raw: unknown, warnings: string[]): ImportedMeal | null {
  if (!raw || typeof raw !== 'object') {
    warnings.push('Repas ignoré (format inattendu).');
    return null;
  }
  const o = raw as Record<string, unknown>;
  const foodsRaw = Array.isArray(o.foods) ? o.foods : [];
  const foods = foodsRaw.map((f) => parseFood(f, warnings)).filter((f): f is ImportedFood => !!f);
  if (foods.length === 0) {
    warnings.push('Repas sans aliment ignoré.');
    return null;
  }
  const tags = parseMealTags(o.tags);
  return { time: normalizeTime(o.time, warnings), foods, ...(tags.length ? { tags } : {}) };
}

function parseSymptoms(raw: unknown, warnings: string[]): Partial<Record<SymptomKey, Intensity>> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: Partial<Record<SymptomKey, Intensity>> = {};
  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    const key = resolveSymptomKey(name);
    const intensity = resolveIntensity(value);
    if (!key) warnings.push(`Symptôme inconnu ignoré : « ${name} ».`);
    else if (!intensity) warnings.push(`Intensité invalide pour « ${name} » : ${JSON.stringify(value)}.`);
    else out[key] = intensity;
  }
  return Object.keys(out).length ? out : undefined;
}

function parseStool(raw: unknown): Stool | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const stool: Stool = {};
  if (typeof o.label === 'string' && o.label.trim()) stool.label = o.label.trim();
  if (typeof o.count === 'number') stool.count = o.count;
  if (typeof o.bristol === 'number') stool.bristol = Math.min(7, Math.max(1, Math.round(o.bristol)));
  return Object.keys(stool).length ? stool : undefined;
}

function parseQuality(raw: unknown): DayQuality | undefined {
  if (typeof raw !== 'string') return undefined;
  const n = normalize(raw);
  if (n === 'difficile') return 'difficile';
  if (n === 'correcte') return 'correcte';
  if (n === 'bonne') return 'bonne';
  return undefined;
}

function parseDay(raw: unknown, fallbackDate: string | undefined, warnings: string[]): ImportedDay | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const mealsRaw = Array.isArray(o.meals) ? o.meals : [];
  const meals = mealsRaw.map((m) => parseMeal(m, warnings)).filter((m): m is ImportedMeal => !!m);

  const symptoms = parseSymptoms(o.symptoms, warnings);
  const stool = parseStool(o.stool);
  const hydrationL = typeof o.hydrationL === 'number' ? o.hydrationL : undefined;
  const digestionDelayH = typeof o.digestionDelayH === 'number' ? o.digestionDelayH : undefined;
  const quality = parseQuality(o.quality);
  const symptomTiming =
    typeof o.symptomTiming === 'string' && o.symptomTiming.trim() ? o.symptomTiming.trim() : undefined;
  const notes = typeof o.notes === 'string' && o.notes.trim() ? o.notes.trim() : undefined;

  // Un jour est exploitable s'il apporte au moins des repas ou des symptômes/transit.
  const hasTransit = hydrationL !== undefined || stool !== undefined || digestionDelayH !== undefined;
  if (meals.length === 0 && !symptoms && !hasTransit && !notes) return null;

  let date: string | undefined;
  if (typeof o.date === 'string' && DATE_RE.test(o.date.trim())) {
    date = o.date.trim();
  } else if (o.date !== undefined) {
    warnings.push(`Date « ${String(o.date)} » ignorée (format attendu AAAA-MM-JJ).`);
    date = fallbackDate;
  } else {
    date = fallbackDate;
  }

  return { date, meals, notes, symptoms, symptomTiming, hydrationL, stool, digestionDelayH, quality };
}

/**
 * Analyse un texte collé (JSON éventuellement entouré de prose / fences).
 * Accepte « { days: [...] } » ou un jour unique « { meals: [...], symptoms: {...} } ».
 */
export function parseMealsImport(text: string, fallbackDate?: string): ParsedMealsImport {
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

  const rawDays = Array.isArray(obj.days)
    ? obj.days
    : Array.isArray(obj.meals) || obj.symptoms || obj.stool
      ? [obj]
      : [];

  if (rawDays.length === 0) {
    throw new Error('Aucun contenu trouvé. Attendu : { "days": [ { "meals": [...] } ] }.');
  }

  const days = rawDays
    .map((d) => parseDay(d, topDate, warnings))
    .filter((d): d is ImportedDay => !!d);

  if (days.length === 0) throw new Error('Aucun repas ni symptôme exploitable dans ce JSON.');

  return { days, warnings };
}

// ---- Application ----

function toMeal(meal: ImportedMeal) {
  return {
    id: uid(),
    time: meal.time,
    ...(meal.tags && meal.tags.length ? { tags: meal.tags } : {}),
    foods: meal.foods.map((f) => {
      const base = f.category ? { id: uid(), name: f.name, category: f.category } : makeFood(f.name);
      return f.quantity ? { ...base, quantity: f.quantity } : base;
    }),
  };
}

/** Fusionne un jour importé dans une journée (repas + symptômes + transit + notes). */
export function mergeImportedDay(day: DayEntry, imported: ImportedDay, mode: MergeMode): DayEntry {
  const newMeals = imported.meals.map(toMeal);
  const meals =
    imported.meals.length === 0 ? day.meals : mode === 'replace' ? newMeals : [...day.meals, ...newMeals];

  const symptoms = imported.symptoms ? { ...day.symptoms, ...imported.symptoms } : day.symptoms;
  const notes =
    imported.notes && day.notes ? `${day.notes}\n${imported.notes}` : (imported.notes ?? day.notes);

  return {
    ...day,
    meals,
    symptoms,
    notes,
    symptomTiming: imported.symptomTiming ?? day.symptomTiming,
    hydrationL: imported.hydrationL ?? day.hydrationL,
    stool: imported.stool ?? day.stool,
    digestionDelayH: imported.digestionDelayH ?? day.digestionDelayH,
    quality: imported.quality ?? day.quality,
  };
}

/** Toutes les fiches d'analyse fournies par l'import (à mettre en cache). */
export function collectInsights(parsed: ParsedMealsImport): FoodInsight[] {
  const out: FoodInsight[] = [];
  for (const d of parsed.days)
    for (const m of d.meals) for (const f of m.foods) if (f.insight) out.push(f.insight);
  return out;
}

export interface ImportCounts {
  meals: number;
  foods: number;
  insights: number;
  symptomDays: number;
}

export function countImport(parsed: ParsedMealsImport): ImportCounts {
  let meals = 0;
  let foods = 0;
  let insights = 0;
  let symptomDays = 0;
  for (const d of parsed.days) {
    if (d.symptoms && Object.keys(d.symptoms).length) symptomDays++;
    for (const m of d.meals) {
      meals++;
      for (const f of m.foods) {
        foods++;
        if (f.insight) insights++;
      }
    }
  }
  return { meals, foods, insights, symptomDays };
}
