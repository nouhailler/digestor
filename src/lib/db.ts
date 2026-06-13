import Dexie, { type Table } from 'dexie';
import type {
  AiConfig,
  DayAnalysis,
  DayEntry,
  EncyclopediaExtra,
  FoodInsight,
  MealSuggestionSet,
  Profile,
  SymptomInfo,
} from '../types';
import { dayHasContent } from './aggregates';

const PROFILE_KEY = 'profile';
const AI_CONFIG_KEY = 'aiConfig';
const ONBOARDING_KEY = 'onboardingDone';
const MEAL_SUGGESTIONS_KEY = 'mealSuggestions';
const ENCYCLOPEDIA_KEY = 'encyclopediaExtra';

class DigestorDB extends Dexie {
  days!: Table<DayEntry, string>; // clé primaire = date ISO
  meta!: Table<{ key: string; value: unknown }, string>;
  foodInsights!: Table<FoodInsight, string>; // clé primaire = nom normalisé
  dayAnalyses!: Table<DayAnalysis, string>; // clé primaire = date ISO
  symptomNotes!: Table<SymptomInfo, string>; // clé primaire = nom normalisé

  constructor() {
    super('digestor');
    this.version(1).stores({
      days: '&date',
      meta: '&key',
    });
    // v2 : cache des analyses d'aliments produites par l'IA.
    // `name` est indexé pour permettre orderBy('name').
    this.version(2).stores({
      days: '&date',
      meta: '&key',
      foodInsights: '&key, name',
    });
    // v3 : cache des analyses IA de journées complètes.
    this.version(3).stores({
      days: '&date',
      meta: '&key',
      foodInsights: '&key, name',
      dayAnalyses: '&date',
    });
    // v4 : fiches détaillées de symptômes (encyclopédie).
    this.version(4).stores({
      days: '&date',
      meta: '&key',
      foodInsights: '&key, name',
      dayAnalyses: '&date',
      symptomNotes: '&key',
    });
  }
}

export const db = new DigestorDB();

export async function getProfile(): Promise<Profile> {
  const row = await db.meta.get(PROFILE_KEY);
  return (row?.value as Profile) ?? { patientName: 'exemple' };
}

export async function setProfile(profile: Profile): Promise<void> {
  await db.meta.put({ key: PROFILE_KEY, value: profile });
}

// ---- Configuration IA ----

const DEFAULT_AI_CONFIG: AiConfig = { apiKey: '', modelId: null };

export async function getAiConfig(): Promise<AiConfig> {
  const row = await db.meta.get(AI_CONFIG_KEY);
  return (row?.value as AiConfig) ?? DEFAULT_AI_CONFIG;
}

export async function setAiConfig(config: AiConfig): Promise<void> {
  await db.meta.put({ key: AI_CONFIG_KEY, value: config });
}

export function isAiReady(config: AiConfig | undefined): config is AiConfig {
  return !!config && config.apiKey.trim().length > 0 && !!config.modelId;
}

// ---- Onboarding ----

export async function isOnboardingDone(): Promise<boolean> {
  const row = await db.meta.get(ONBOARDING_KEY);
  return row?.value === true;
}

export async function setOnboardingDone(done: boolean): Promise<void> {
  await db.meta.put({ key: ONBOARDING_KEY, value: done });
}

// ---- Cache des analyses d'aliments ----

export async function getFoodInsight(key: string): Promise<FoodInsight | undefined> {
  if (!key) return undefined;
  return db.foodInsights.get(key);
}

export async function putFoodInsight(insight: FoodInsight): Promise<void> {
  await db.foodInsights.put(insight);
}

export async function getAllFoodInsights(): Promise<FoodInsight[]> {
  return db.foodInsights.orderBy('name').toArray();
}

export async function deleteFoodInsight(key: string): Promise<void> {
  await db.foodInsights.delete(key);
}

// ---- Analyse IA d'une journée ----

export async function getDayAnalysis(date: string): Promise<DayAnalysis | undefined> {
  return db.dayAnalyses.get(date);
}

export async function putDayAnalysis(analysis: DayAnalysis): Promise<void> {
  await db.dayAnalyses.put(analysis);
}

// ---- Suggestions de repas (meta) ----

export async function getMealSuggestions(): Promise<MealSuggestionSet | undefined> {
  const row = await db.meta.get(MEAL_SUGGESTIONS_KEY);
  return row?.value as MealSuggestionSet | undefined;
}

export async function setMealSuggestions(set: MealSuggestionSet): Promise<void> {
  await db.meta.put({ key: MEAL_SUGGESTIONS_KEY, value: set });
}

// ---- Encyclopédie des symptômes ----

export async function getSymptomInfo(key: string): Promise<SymptomInfo | undefined> {
  if (!key) return undefined;
  return db.symptomNotes.get(key);
}

export async function putSymptomInfo(info: SymptomInfo): Promise<void> {
  await db.symptomNotes.put(info);
}

export async function getAllSymptomInfos(): Promise<SymptomInfo[]> {
  return db.symptomNotes.toArray();
}

export async function getEncyclopediaExtra(): Promise<EncyclopediaExtra | undefined> {
  const row = await db.meta.get(ENCYCLOPEDIA_KEY);
  return row?.value as EncyclopediaExtra | undefined;
}

export async function setEncyclopediaExtra(extra: EncyclopediaExtra): Promise<void> {
  await db.meta.put({ key: ENCYCLOPEDIA_KEY, value: extra });
}

export async function getDay(date: string): Promise<DayEntry | undefined> {
  return db.days.get(date);
}

export async function putDay(day: DayEntry): Promise<void> {
  await db.days.put(day);
}

export async function getDays(dates: string[]): Promise<DayEntry[]> {
  const rows = await db.days.bulkGet(dates);
  return rows.filter((r): r is DayEntry => !!r);
}

export async function getAllDays(): Promise<DayEntry[]> {
  return db.days.orderBy('date').toArray();
}

export async function isEmpty(): Promise<boolean> {
  return (await db.days.count()) === 0;
}

/** Date ISO du jour renseigné le plus récent (avec repas ou symptôme), sinon undefined. */
export async function getLatestActiveDate(): Promise<string | undefined> {
  const recent = await db.days.orderBy('date').reverse().toArray();
  return recent.find(dayHasContent)?.date;
}

// ---- Export / Import JSON complet ----

export interface ExportPayload {
  app: 'digestor';
  version: 1 | 2 | 3;
  exportedAt: string;
  profile: Profile;
  days: DayEntry[];
  foodInsights?: FoodInsight[]; // depuis v2
  dayAnalyses?: DayAnalysis[]; // depuis v3
}

export async function exportAll(): Promise<ExportPayload> {
  return {
    app: 'digestor',
    version: 3,
    exportedAt: new Date().toISOString(),
    profile: await getProfile(),
    days: await getAllDays(),
    foodInsights: await getAllFoodInsights(),
    dayAnalyses: await db.dayAnalyses.toArray(),
  };
}

export async function importAll(payload: ExportPayload): Promise<void> {
  if (payload?.app !== 'digestor' || !Array.isArray(payload.days)) {
    throw new Error('Fichier invalide : ce n’est pas un export Digestor.');
  }
  await db.transaction('rw', db.days, db.meta, db.foodInsights, db.dayAnalyses, async () => {
    await db.days.clear();
    await db.days.bulkPut(payload.days);
    await db.foodInsights.clear();
    if (Array.isArray(payload.foodInsights)) {
      await db.foodInsights.bulkPut(payload.foodInsights);
    }
    await db.dayAnalyses.clear();
    if (Array.isArray(payload.dayAnalyses)) {
      await db.dayAnalyses.bulkPut(payload.dayAnalyses);
    }
    if (payload.profile) await setProfile(payload.profile);
    // La clé/configuration IA n'est volontairement pas exportée ni écrasée.
  });
}

export async function clearAll(): Promise<void> {
  await db.transaction('rw', db.days, db.meta, db.foodInsights, db.dayAnalyses, async () => {
    await db.days.clear();
    await db.foodInsights.clear();
    await db.dayAnalyses.clear();
    await db.meta.clear();
  });
}
