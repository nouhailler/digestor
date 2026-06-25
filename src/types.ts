export type FoodCategory = 'pro' | 'beneficial' | 'neutral';
// 'pro'        => Pro-candidose / Pro-SIBO  (rouge)
// 'beneficial' => Bénéfique / Anti-fongique (vert)
// 'neutral'    => Neutre (gris)

/** Unités de quantité proposées (cuillères, portions, poids, volume…). */
export type QuantityUnit =
  | 'unite' // nombre seul, sans libellé (ex. « 2 » pour 2 œufs)
  | 'cac' // cuillère à café
  | 'cas' // cuillère à soupe
  | 'pincee'
  | 'portion'
  | 'poignee'
  | 'tranche'
  | 'verre'
  | 'bol'
  | 'g'
  | 'ml';

/** Quantité d'un aliment dans un repas (ex. 1 càc, 2 càs, 150 g). */
export interface FoodQuantity {
  amount: number; // ex. 1, 2, 0.5
  unit: QuantityUnit;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory; // auto-suggérée puis modifiable
  quantity?: FoodQuantity; // portion optionnelle (sinon non précisée)
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
  // Facteurs contextuels (modulateurs connus du SII / SIBO)
  stress?: Intensity; // niveau de stress du jour (absent → sévère)
  sleepH?: number; // heures de sommeil
  menstrual?: boolean; // règles ce jour (cycle menstruel)
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

/**
 * Aliment favori : remonté en tête des suggestions lors de l'ajout d'un aliment
 * à un repas. Un produit scanné devient automatiquement favori (avec sa date de
 * scan). Clé primaire = nom normalisé.
 */
export interface FavoriteFood {
  key: string; // nom normalisé (clé primaire)
  name: string; // nom affiché
  addedAt: string; // ISO — ajout aux favoris
  scannedAt?: string; // ISO — date du dernier scan (si ajouté via le scanner)
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

/** Une piste d'amélioration : la recommandation + pourquoi on la propose. */
export interface DayImprovement {
  action: string; // la recommandation concrète
  why: string; // justification (effet attendu / mécanisme)
}

/** Analyse IA d'une journée complète (repas + symptômes). Clé = date. */
export interface DayAnalysis {
  date: string; // clé primaire
  verdict: Verdict; // appréciation globale
  summary: string;
  likelyTriggers: string[]; // aliments/combinaisons suspects
  improvements: DayImprovement[]; // pistes d'amélioration (avec justification)
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
  related: string[]; // symptômes liés (liens croisés)
  model: string;
  updatedAt: string;
}

/** Approfondissement IA d'un organe digestif, mis en cache (clé = id de l'organe). */
export interface OrganInfo {
  key: string; // id de l'organe (clé primaire)
  name: string;
  apercu: string; // approfondissement du rôle de l'organe
  pathologies: { name: string; description: string }[]; // pathologies détaillées
  liens: string; // lien avec candidose / SIBO / SII
  conseils: string[]; // comment prendre soin de cet organe
  signesAlarme: string[]; // signes qui doivent amener à consulter
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

// ---- Suivi des traitements & compléments ----

export type TreatmentKind =
  | 'antifongique'
  | 'antibiotique'
  | 'probiotique'
  | 'prebiotique'
  | 'complement'
  | 'phytotherapie'
  | 'medicament'
  | 'autre';

/** Une cure / traitement / complément, sur une plage de dates (fin vide = en cours). */
export interface Treatment {
  id: string;
  name: string; // ex. « Nystatine », « Berbérine », « Lactobacillus »
  kind: TreatmentKind;
  dose?: string; // ex. « 500 mg »
  frequency?: string; // ex. « 2× / jour »
  startDate: string; // ISO jour
  endDate?: string; // ISO jour — vide = en cours
  notes?: string;
}

// ---- Protocole FODMAP : tests de réintroduction ----

/** Groupe FODMAP testé (les 5 groupes suivis + « autre »). */
export type ReintroGroup = keyof FodmapGroups | 'autre';

export type ReintroResult = 'en_cours' | 'tolere' | 'partiel' | 'non_tolere' | 'abandonne';

/** Une étape de dose d'un test de réintroduction + la réaction observée. */
export interface ReintroDose {
  label: string; // ex. « Jour 1 : ¼ d'avocat »
  severity: Intensity; // réaction (absent → sévère)
}

/** Un test de réintroduction d'un aliment représentatif d'un groupe FODMAP. */
export interface ReintroChallenge {
  id: string;
  foodName: string; // aliment testé (ex. « Miel » pour le fructose)
  group: ReintroGroup;
  startDate: string; // ISO jour
  endDate?: string; // ISO jour
  result: ReintroResult;
  doses?: ReintroDose[];
  notes?: string;
}

// ---- Modèles de repas (repas récurrents réutilisables) ----

/** Aliment d'un modèle (sans id : régénéré à chaque insertion dans un repas). */
export interface TemplateFood {
  name: string;
  category: FoodCategory;
  quantity?: FoodQuantity;
}

/** Modèle de repas réutilisable, ex. « petit-déjeuner habituel ». */
export interface MealTemplate {
  id: string;
  name: string;
  time?: string; // heure suggérée (facultatif)
  foods: TemplateFood[];
  updatedAt: string;
}

// ---- Rapport IA de période (semaine / mois / tout) ----

/** Une tendance calculée localement entre la 1re et la 2de moitié de la période. */
export interface PeriodTrend {
  metric: string; // ex. « Jours à symptômes »
  direction: 'up' | 'down' | 'flat';
  detail: string; // ex. « 60 % → 30 % »
  good: boolean; // l'évolution est-elle favorable ?
}

/** Analyse IA d'une période complète, mise en cache (clé = portée+plage). */
export interface PeriodAnalysis {
  key: string; // ex. « all » ou « 4weeks:2026-05-01:2026-05-28 »
  scope: 'week' | '4weeks' | 'all';
  from: string;
  to: string;
  verdict: Verdict;
  summary: string;
  trends: string[]; // tendances narratives (IA)
  triggers: string[];
  improvements: DayImprovement[];
  model: string;
  updatedAt: string;
}
