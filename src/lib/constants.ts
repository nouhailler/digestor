import type { FoodCategory, Intensity, SymptomKey } from '../types';

/** Ordre exact d'affichage des symptômes (grille 4×3). */
export const SYMPTOM_ORDER: SymptomKey[] = [
  'ballonnements',
  'gaz',
  'douleurs_abdo',
  'reflux',
  'fatigue_apres_repas',
  'envie_sucre',
  'diarrhee',
  'constipation',
  'brouillard_mental',
  'mycose_buccale',
  'demangeaisons',
  'nausees',
];

/** Explications courtes par symptôme, affichées en infobulle au survol. */
export const SYMPTOM_HINTS: Record<SymptomKey, string> = {
  ballonnements: 'Sensation de ventre gonflé / distendu, souvent après le repas.',
  gaz: 'Flatulences, gaz intestinaux excessifs.',
  douleurs_abdo: 'Douleurs ou crampes au niveau du ventre.',
  reflux: 'Remontées acides, brûlures œsophagiennes (RGO).',
  fatigue_apres_repas: 'Coup de fatigue ou somnolence après avoir mangé.',
  envie_sucre: 'Fringale ou envie compulsive de sucre.',
  diarrhee: 'Selles molles ou liquides, transit accéléré.',
  constipation: 'Selles rares ou difficiles à évacuer.',
  brouillard_mental: 'Difficultés de concentration, tête « dans le coton ».',
  mycose_buccale: 'Dépôt blanchâtre dans la bouche / sur la langue (muguet).',
  demangeaisons: 'Démangeaisons ou irritations cutanées.',
  nausees: 'Sensation de mal de cœur, envie de vomir.',
};

export const SYMPTOM_LABELS: Record<SymptomKey, string> = {
  ballonnements: 'Ballonnements',
  gaz: 'Gaz / flatulences',
  douleurs_abdo: 'Douleurs abdominales',
  reflux: 'Reflux / brûlures',
  fatigue_apres_repas: 'Fatigue après repas',
  envie_sucre: 'Envie de sucre',
  diarrhee: 'Diarrhée / selles molles',
  constipation: 'Constipation',
  brouillard_mental: 'Brouillard mental',
  mycose_buccale: 'Mycose buccale',
  demangeaisons: 'Démangeaisons cutanées',
  nausees: 'Nausées',
};

/** Couleurs (variables CSS de @theme) par intensité. */
export const INTENSITY_COLOR: Record<Intensity, string> = {
  absent: 'var(--color-absent)',
  leger: 'var(--color-leger)',
  modere: 'var(--color-modere)',
  severe: 'var(--color-severe)',
};

export const INTENSITY_LABEL: Record<Intensity, string> = {
  absent: 'Absent',
  leger: 'Léger',
  modere: 'Modéré',
  severe: 'Sévère',
};

export const INTENSITY_HINT: Record<Intensity, string> = {
  absent: 'Symptôme absent.',
  leger: 'Symptôme léger, peu gênant.',
  modere: 'Symptôme modéré, gênant.',
  severe: 'Symptôme sévère, très gênant.',
};

/** Poids numérique d'une intensité (pour agrégats / graphes). */
export const INTENSITY_WEIGHT: Record<Intensity, number> = {
  absent: 0,
  leger: 1,
  modere: 2,
  severe: 3,
};

export const INTENSITY_CYCLE: Intensity[] = ['absent', 'leger', 'modere', 'severe'];

/** Couleurs par catégorie d'aliment. */
export const CATEGORY_COLOR: Record<FoodCategory, string> = {
  pro: 'var(--color-severe)',
  beneficial: 'var(--color-leger)',
  neutral: 'var(--color-absent)',
};

export const CATEGORY_LABEL: Record<FoodCategory, string> = {
  pro: 'Pro-candidose / Pro-SIBO',
  beneficial: 'Bénéfique / Anti-fongique',
  neutral: 'Neutre',
};

/** Infobulles expliquant chaque catégorie d'aliment. */
export const CATEGORY_HINT: Record<FoodCategory, string> = {
  pro: 'Aliments défavorables (sucres, alcool, farines blanches, levures…) qui tendent à nourrir la candidose / le SIBO. À limiter.',
  beneficial: 'Aliments bénéfiques / anti-fongiques : légumes non amidonnés, ail, gingembre, protéines maigres, bonnes graisses…',
  neutral: 'Aliments neutres, à consommer avec modération, ou non encore classés.',
};

/** Infobulle expliquant le badge de qualité de journée. */
export const QUALITY_HINT =
  'Qualité de la journée, proposée automatiquement d’après le cumul des symptômes : vert « Bonne » (≤ 1 léger), orange « Correcte » (2–3 symptômes), rouge « Difficile » (≥ 4 cumulés ou ≥ 2 sévères). En mode édition, touchez le badge pour la forcer.';

export const CATEGORY_CYCLE: FoodCategory[] = ['pro', 'beneficial', 'neutral'];

/** Heures de repas par défaut proposées à la création. */
export const DEFAULT_MEAL_TIMES = ['07:30', '12:30', '16:00', '19:30'];

export const HYDRATION_TARGET_L = 1.5;

/** Choix de selles (échelle de Bristol) proposés dans la combobox. */
export const STOOL_OPTIONS: { label: string; bristol?: number }[] = [
  { label: 'Aucune selle' },
  { label: 'Selles dures, en billes (type 1)', bristol: 1 },
  { label: 'Selles dures, grumeleuses (type 2)', bristol: 2 },
  { label: 'Selles craquelées (type 3)', bristol: 3 },
  { label: 'Selles normales, lisses (type 4)', bristol: 4 },
  { label: 'Selles molles, bords nets (type 5)', bristol: 5 },
  { label: 'Selles molles, déchiquetées (type 6)', bristol: 6 },
  { label: 'Selles liquides (type 7)', bristol: 7 },
];

/** Aide affichée au survol de l'échelle de Bristol. */
export const BRISTOL_HINT =
  'Échelle de Bristol : type 1 (très dur, constipation) → type 4 (normal) → type 7 (liquide, diarrhée).';
