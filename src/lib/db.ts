import Dexie, { type Table } from 'dexie';
import type {
  AiConfig,
  DayAnalysis,
  DayEntry,
  EncyclopediaExtra,
  FavoriteFood,
  FoodInsight,
  MealSuggestionSet,
  OrganInfo,
  Profile,
  MealTemplate,
  PeriodAnalysis,
  ReintroChallenge,
  SymptomInfo,
  Treatment,
} from '../types';
import { dayHasContent } from './aggregates';
import { normalize } from './foodClassifier';

const PROFILE_KEY = 'profile';
const AI_CONFIG_KEY = 'aiConfig';
const ONBOARDING_KEY = 'onboardingDone';
const MEAL_SUGGESTIONS_KEY = 'mealSuggestions';
const ENCYCLOPEDIA_KEY = 'encyclopediaExtra';
const LAST_EXPORT_KEY = 'lastExportAt';

class DigestorDB extends Dexie {
  days!: Table<DayEntry, string>; // clé primaire = date ISO
  meta!: Table<{ key: string; value: unknown }, string>;
  foodInsights!: Table<FoodInsight, string>; // clé primaire = nom normalisé
  dayAnalyses!: Table<DayAnalysis, string>; // clé primaire = date ISO
  symptomNotes!: Table<SymptomInfo, string>; // clé primaire = nom normalisé
  organNotes!: Table<OrganInfo, string>; // clé primaire = id d'organe
  favorites!: Table<FavoriteFood, string>; // clé primaire = nom normalisé
  treatments!: Table<Treatment, string>; // clé primaire = id
  reintroChallenges!: Table<ReintroChallenge, string>; // clé primaire = id
  mealTemplates!: Table<MealTemplate, string>; // clé primaire = id
  periodAnalyses!: Table<PeriodAnalysis, string>; // clé primaire = key (portée+plage)

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
    // v5 : approfondissements IA des organes digestifs (guide « Système digestif »).
    this.version(5).stores({
      days: '&date',
      meta: '&key',
      foodInsights: '&key, name',
      dayAnalyses: '&date',
      symptomNotes: '&key',
      organNotes: '&key',
    });
    // v6 : aliments favoris (remontés en tête des suggestions ; produits scannés).
    // `name` est indexé pour orderBy('name').
    this.version(6).stores({
      days: '&date',
      meta: '&key',
      foodInsights: '&key, name',
      dayAnalyses: '&date',
      symptomNotes: '&key',
      organNotes: '&key',
      favorites: '&key, name',
    });
    // v7 : suivi des traitements/compléments + tests de réintroduction FODMAP.
    // `startDate` indexé pour l'ordre chronologique.
    this.version(7).stores({
      days: '&date',
      meta: '&key',
      foodInsights: '&key, name',
      dayAnalyses: '&date',
      symptomNotes: '&key',
      organNotes: '&key',
      favorites: '&key, name',
      treatments: '&id, startDate',
      reintroChallenges: '&id, startDate',
    });
    // v8 : modèles de repas + cache des rapports IA de période.
    this.version(8).stores({
      days: '&date',
      meta: '&key',
      foodInsights: '&key, name',
      dayAnalyses: '&date',
      symptomNotes: '&key',
      organNotes: '&key',
      favorites: '&key, name',
      treatments: '&id, startDate',
      reintroChallenges: '&id, startDate',
      mealTemplates: '&id, name',
      periodAnalyses: '&key',
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

// ---- Dernier export (pour le rappel de sauvegarde) ----

export async function getLastExportAt(): Promise<string | undefined> {
  const row = await db.meta.get(LAST_EXPORT_KEY);
  return typeof row?.value === 'string' ? row.value : undefined;
}

export async function setLastExportAt(iso: string): Promise<void> {
  await db.meta.put({ key: LAST_EXPORT_KEY, value: iso });
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

// ---- Approfondissements d'organes (guide système digestif) ----

export async function getOrganInfo(key: string): Promise<OrganInfo | undefined> {
  if (!key) return undefined;
  return db.organNotes.get(key);
}

export async function putOrganInfo(info: OrganInfo): Promise<void> {
  await db.organNotes.put(info);
}

export async function getAllOrganInfos(): Promise<OrganInfo[]> {
  return db.organNotes.toArray();
}

export async function getEncyclopediaExtra(): Promise<EncyclopediaExtra | undefined> {
  const row = await db.meta.get(ENCYCLOPEDIA_KEY);
  return row?.value as EncyclopediaExtra | undefined;
}

export async function setEncyclopediaExtra(extra: EncyclopediaExtra): Promise<void> {
  await db.meta.put({ key: ENCYCLOPEDIA_KEY, value: extra });
}

// ---- Aliments favoris ----

export async function getAllFavorites(): Promise<FavoriteFood[]> {
  return db.favorites.orderBy('name').toArray();
}

/**
 * Ajoute (ou met à jour) un favori. Conserve `addedAt`/`name` existants ; pose
 * `scannedAt` si fourni (produit scanné) sans l'effacer pour les ajouts manuels.
 */
export async function addFavorite(
  name: string,
  opts: { scannedAt?: string } = {},
): Promise<void> {
  const key = normalize(name);
  if (!key) return;
  const existing = await db.favorites.get(key);
  await db.favorites.put({
    key,
    name: existing?.name ?? name.trim(),
    addedAt: existing?.addedAt ?? new Date().toISOString(),
    scannedAt: opts.scannedAt ?? existing?.scannedAt,
  });
}

export async function removeFavorite(key: string): Promise<void> {
  await db.favorites.delete(key);
}

/** Bascule l'état favori d'un aliment (par son nom). */
export async function toggleFavorite(name: string): Promise<void> {
  const key = normalize(name);
  if (!key) return;
  if (await db.favorites.get(key)) await db.favorites.delete(key);
  else await addFavorite(name);
}

// ---- Traitements & compléments ----

export async function getAllTreatments(): Promise<Treatment[]> {
  return db.treatments.orderBy('startDate').reverse().toArray();
}

export async function putTreatment(t: Treatment): Promise<void> {
  await db.treatments.put(t);
}

export async function deleteTreatment(id: string): Promise<void> {
  await db.treatments.delete(id);
}

// ---- Tests de réintroduction FODMAP ----

export async function getAllReintroChallenges(): Promise<ReintroChallenge[]> {
  return db.reintroChallenges.orderBy('startDate').reverse().toArray();
}

export async function putReintroChallenge(c: ReintroChallenge): Promise<void> {
  await db.reintroChallenges.put(c);
}

export async function deleteReintroChallenge(id: string): Promise<void> {
  await db.reintroChallenges.delete(id);
}

// ---- Modèles de repas ----

export async function getAllMealTemplates(): Promise<MealTemplate[]> {
  return db.mealTemplates.orderBy('name').toArray();
}

export async function putMealTemplate(t: MealTemplate): Promise<void> {
  await db.mealTemplates.put(t);
}

export async function deleteMealTemplate(id: string): Promise<void> {
  await db.mealTemplates.delete(id);
}

// ---- Cache des rapports IA de période ----

export async function getPeriodAnalysis(key: string): Promise<PeriodAnalysis | undefined> {
  if (!key) return undefined;
  return db.periodAnalyses.get(key);
}

export async function putPeriodAnalysis(a: PeriodAnalysis): Promise<void> {
  await db.periodAnalyses.put(a);
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
  version: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  exportedAt: string;
  profile: Profile;
  days: DayEntry[];
  foodInsights?: FoodInsight[]; // depuis v2
  dayAnalyses?: DayAnalysis[]; // depuis v3
  symptomNotes?: SymptomInfo[]; // depuis v4 (fiches de symptômes)
  organNotes?: OrganInfo[]; // depuis v5 (approfondissements d'organes)
  favorites?: FavoriteFood[]; // depuis v6 (aliments favoris)
  treatments?: Treatment[]; // depuis v7 (traitements & compléments)
  reintroChallenges?: ReintroChallenge[]; // depuis v7 (réintroductions FODMAP)
  mealTemplates?: MealTemplate[]; // depuis v8 (modèles de repas)
  mealSuggestions?: MealSuggestionSet; // depuis v4
  encyclopediaExtra?: EncyclopediaExtra; // depuis v4
  // Réglages non sensibles (depuis v4). La CLÉ API n'y figure jamais (secret).
  settings?: { modelId?: string | null; onboardingDone?: boolean };
}

export async function exportAll(): Promise<ExportPayload> {
  const aiConfig = await getAiConfig();
  return {
    app: 'digestor',
    version: 8,
    exportedAt: new Date().toISOString(),
    profile: await getProfile(),
    days: await getAllDays(),
    foodInsights: await getAllFoodInsights(),
    dayAnalyses: await db.dayAnalyses.toArray(),
    symptomNotes: await getAllSymptomInfos(),
    organNotes: await getAllOrganInfos(),
    favorites: await getAllFavorites(),
    treatments: await getAllTreatments(),
    reintroChallenges: await getAllReintroChallenges(),
    mealTemplates: await getAllMealTemplates(),
    mealSuggestions: await getMealSuggestions(),
    encyclopediaExtra: await getEncyclopediaExtra(),
    // Réglages sans secret : on conserve le modèle choisi, pas la clé.
    settings: { modelId: aiConfig.modelId, onboardingDone: await isOnboardingDone() },
  };
}

export async function importAll(payload: ExportPayload): Promise<void> {
  if (payload?.app !== 'digestor' || !Array.isArray(payload.days)) {
    throw new Error('Fichier invalide : ce n’est pas un export Digestor.');
  }
  await db.transaction(
    'rw',
    [
      db.days,
      db.meta,
      db.foodInsights,
      db.dayAnalyses,
      db.symptomNotes,
      db.organNotes,
      db.favorites,
      db.treatments,
      db.reintroChallenges,
      db.mealTemplates,
      db.periodAnalyses,
    ],
    async () => {
      await db.days.clear();
      await db.days.bulkPut(payload.days);

    await db.foodInsights.clear();
    if (Array.isArray(payload.foodInsights)) await db.foodInsights.bulkPut(payload.foodInsights);

    await db.dayAnalyses.clear();
    if (Array.isArray(payload.dayAnalyses)) await db.dayAnalyses.bulkPut(payload.dayAnalyses);

    await db.symptomNotes.clear();
    if (Array.isArray(payload.symptomNotes)) await db.symptomNotes.bulkPut(payload.symptomNotes);

    await db.organNotes.clear();
    if (Array.isArray(payload.organNotes)) await db.organNotes.bulkPut(payload.organNotes);

    await db.favorites.clear();
    if (Array.isArray(payload.favorites)) await db.favorites.bulkPut(payload.favorites);

    await db.treatments.clear();
    if (Array.isArray(payload.treatments)) await db.treatments.bulkPut(payload.treatments);

    await db.reintroChallenges.clear();
    if (Array.isArray(payload.reintroChallenges)) await db.reintroChallenges.bulkPut(payload.reintroChallenges);

    await db.mealTemplates.clear();
    if (Array.isArray(payload.mealTemplates)) await db.mealTemplates.bulkPut(payload.mealTemplates);

    // Cache régénérable : on le vide à l'import (les analyses ne sont pas exportées).
    await db.periodAnalyses.clear();

    if (payload.profile) await setProfile(payload.profile);
    if (payload.mealSuggestions) await setMealSuggestions(payload.mealSuggestions);
    if (payload.encyclopediaExtra) await setEncyclopediaExtra(payload.encyclopediaExtra);

    // Réglages : restaure le modèle (sans toucher à la clé déjà présente) + l'onboarding.
    if (payload.settings) {
      if (payload.settings.modelId !== undefined) {
        const cfg = await getAiConfig();
        await setAiConfig({ apiKey: cfg.apiKey, modelId: payload.settings.modelId });
      }
      if (typeof payload.settings.onboardingDone === 'boolean') {
        await setOnboardingDone(payload.settings.onboardingDone);
      }
    }
    // La clé API (aiConfig.apiKey) n'est ni exportée ni écrasée (secret local).
  });
}

export async function clearAll(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.days,
      db.meta,
      db.foodInsights,
      db.dayAnalyses,
      db.symptomNotes,
      db.organNotes,
      db.favorites,
      db.treatments,
      db.reintroChallenges,
      db.mealTemplates,
      db.periodAnalyses,
    ],
    async () => {
      await db.days.clear();
      await db.foodInsights.clear();
      await db.dayAnalyses.clear();
      await db.symptomNotes.clear();
      await db.organNotes.clear();
      await db.favorites.clear();
      await db.treatments.clear();
      await db.reintroChallenges.clear();
      await db.mealTemplates.clear();
      await db.periodAnalyses.clear();
      await db.meta.clear();
    },
  );
}
