export type FoodCategory = 'pro' | 'beneficial' | 'neutral';
// 'pro'        => Pro-candidose / Pro-SIBO  (rouge)
// 'beneficial' => Bénéfique / Anti-fongique (vert)
// 'neutral'    => Neutre (gris)

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory; // auto-suggérée puis modifiable
}

export interface Meal {
  id: string;
  time: string; // "07:30"
  foods: FoodItem[];
  symptoms?: Record<SymptomKey, Intensity>; // symptômes ressentis après ce repas
}

export type SymptomKey =
  | 'ballonnements'
  | 'gaz'
  | 'douleurs_abdo'
  | 'reflux'
  | 'fatigue_apres_repas'
  | 'envie_sucre'
  | 'diarrhee'
  | 'constipation'
  | 'brouillard_mental'
  | 'mycose_buccale'
  | 'demangeaisons'
  | 'nausees';

export type Intensity = 'absent' | 'leger' | 'modere' | 'severe';
// gris        | vert    | ambre   | rouge

export type DayQuality = 'difficile' | 'correcte' | 'bonne' | null; // badge auto ou manuel

export interface Stool {
  bristol?: number; // 1..7
  count?: number; // nb de selles
  label?: string; // "Selles molles", "Selles normales"…
}

export interface DayEntry {
  date: string; // ISO "2025-06-09" — clé primaire
  quality: DayQuality;
  meals: Meal[];
  symptoms: Record<SymptomKey, Intensity>;
  symptomTiming?: string; // ex: "2 h après repas du soir"
  notes?: string;
  hydrationL?: number; // 1.2
  stool?: Stool;
  digestionDelayH?: number; // 3 => "Délai digestion : ~3 h"
}

/** Phase du protocole pauvre en FODMAP. */
export type FodmapPhase = 'aucune' | 'elimination' | 'reintroduction' | 'personnalisee';

/** Sexe (facultatif). */
export type Sex = 'femme' | 'homme' | 'autre';

export interface Profile {
  patientName: string; // affiché "Patient : exemple"
  age?: number; // facultatif
  sex?: Sex; // facultatif
  conditions?: string[]; // SIBO confirmé/suspecté, SII, candidose, RGO…
  fodmapPhase?: FodmapPhase;
  intolerances?: string[]; // lactose, gluten, fructose, histamine…
  allergies?: string[]; // arachides, fruits à coque, œuf…
  avoidedFoods?: string[]; // aliments évités (saisie libre)
  medicalHistory?: string; // antécédents médicaux (facultatif)
  medications?: string; // médicaments pris, lesquels (facultatif)
  notes?: string; // contexte santé libre
}

// ---- IA (OpenRouter) ----

export interface AiConfig {
  apiKey: string; // clé OpenRouter, stockée localement (IndexedDB)
  modelId: string | null; // modèle :free sélectionné
}

// ---- Analyse d'aliments (FODMAP / SIBO / candidose) ----

export type FodmapLevel = 'low' | 'moderate' | 'high' | 'unknown';

/** Verdict d'adéquation pour une condition donnée. */
export type Verdict = 'favorable' | 'attention' | 'eviter' | 'inconnu';

/** Les 5 groupes FODMAP suivis. */
export interface FodmapGroups {
  fructose: FodmapLevel; // excès de fructose
  lactose: FodmapLevel;
  fructans: FodmapLevel; // fructanes (blé, oignon, ail…)
  gos: FodmapLevel; // galacto-oligosaccharides (légumineuses)
  polyols: FodmapLevel; // sorbitol, mannitol…
}

/**
 * Fiche d'analyse d'un aliment, produite par l'IA puis mise en cache (Dexie).
 * Clé primaire = nom normalisé.
 */
export interface FoodInsight {
  key: string; // nom normalisé (clé primaire du cache)
  name: string; // nom affiché tel qu'analysé
  category: FoodCategory; // catégorie dérivée (pro/beneficial/neutral)
  fodmapLevel: FodmapLevel; // niveau FODMAP global
  fodmaps: FodmapGroups;
  sibo: { verdict: Verdict; note: string };
  candida: { verdict: Verdict; note: string };
  safePortion?: string; // portion tolérée (ex. « 1/2 tasse, 75 g »)
  summary: string; // synthèse 1-2 phrases
  tips: string[];
  model: string; // id du modèle utilisé
  updatedAt: string; // ISO
}

/** Analyse IA d'une journée complète (repas + symptômes). Clé = date. */
export interface DayAnalysis {
  date: string; // clé primaire
  verdict: Verdict; // appréciation globale
  summary: string;
  likelyTriggers: string[]; // aliments/combinaisons suspects
  improvements: string[]; // pistes d'amélioration
  model: string;
  updatedAt: string;
}

/** Une idée de repas adaptée au profil. */
export interface MealSuggestion {
  title: string; // ex. « Petit-déjeuner doux »
  foods: string[];
  why: string; // pourquoi c'est adapté
}

/** Jeu de suggestions de repas mis en cache (meta). */
export interface MealSuggestionSet {
  suggestions: MealSuggestion[];
  model: string;
  updatedAt: string;
}

/** Fiche détaillée d'un symptôme (encyclopédie), générée par l'IA et mise en cache. */
export interface SymptomInfo {
  key: string; // nom normalisé (clé primaire)
  name: string;
  origine: string; // d'où ça vient
  manifestation: string; // comment ça se manifeste
  effets: string[]; // effets / conséquences
  conseils: string[]; // que faire pour l'éviter / l'atténuer
  model: string;
  updatedAt: string;
}

/** Entrée d'encyclopédie ajoutée par l'IA. */
export interface EncyclopediaExtraItem {
  category: string;
  name: string;
  manifestation: string;
}

export interface EncyclopediaExtra {
  items: EncyclopediaExtraItem[];
  model: string;
  updatedAt: string;
}
