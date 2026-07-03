import type { FoodCategory, Intensity, SymptomCategory, SymptomKey } from '../types';

/**
 * Ordre d'affichage des symptômes, regroupé par catégorie (digestif → alerte).
 * L'itération étant contiguë par catégorie, `symptomsByCategory` (symptomCatalog)
 * peut grouper sans retrier. Les consommateurs agrégés (quality, aggregates,
 * medicalRecord…) restent agnostiques à l'ordre.
 */
export const SYMPTOM_ORDER: SymptomKey[] = [
  // Digestif
  'ballonnements',
  'gaz',
  'douleurs_abdo',
  'reflux',
  'diarrhee',
  'constipation',
  'nausees',
  'trop_plein',
  // Cutané
  'demangeaisons',
  'demangeaisons_visage_cou',
  'demangeaisons_paumes_plantes',
  'urticaire',
  'rougeurs',
  'chaleur_cutanee',
  'oedeme_leger',
  // Neuro
  'maux_de_tete',
  'migraine',
  'vertiges',
  'fatigue_apres_repas',
  'brouillard_mental',
  // Cardiovasculaire
  'palpitations',
  'hypotension',
  'hypertension_soudaine',
  'bouffee_chaleur_pouls',
  // ORL / respiratoire
  'nez_qui_coule',
  'eternuements',
  'toux',
  'gorge_qui_gratte',
  'difficulte_respiratoire',
  // Général
  'envie_sucre',
  'mycose_buccale',
  'malaise_general',
  'anxiete_soudaine',
  'picotement_bouche_levres',
  'salivation_anormale',
  'troubles_sommeil',
  // Signes d'alerte
  'gonflement_gorge_langue',
  'difficulte_avaler',
  'chute_tension_malaise',
  'urticaire_generalisee_aggravation',
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
  urticaire: 'Plaques rouges en relief qui démangent (réaction histaminique).',
  rougeurs: 'Rougeurs du visage / bouffées de chaleur (flush).',
  maux_de_tete: 'Céphalées / migraines, parfois après certains aliments.',
  nausees: 'Sensation de mal de cœur, envie de vomir.',
  // ---- Cutané (amines) ----
  demangeaisons_visage_cou: 'Démangeaisons localisées au visage, au cou ou au cuir chevelu.',
  demangeaisons_paumes_plantes: 'Démangeaisons des paumes des mains / plantes des pieds.',
  chaleur_cutanee: 'Sensation de chaleur sur la peau, sans forcément de rougeur visible.',
  oedeme_leger: 'Léger gonflement des paupières ou des lèvres — à surveiller.',
  // ---- Digestif (amines) ----
  trop_plein: 'Sensation de « trop-plein » inhabituelle, disproportionnée au repas.',
  // ---- Neuro (amines) ----
  migraine: 'Céphalée pulsatile, souvent unilatérale (plutôt liée à la tyramine).',
  vertiges: 'Vertiges ou étourdissements, parfois avec baisse de tension.',
  // ---- Cardiovasculaire (amines) ----
  palpitations: 'Cœur qui bat vite ou fort (tachycardie), sensation de palpitations.',
  hypotension: 'Baisse de tension, souvent avec vertiges ou malaise léger.',
  hypertension_soudaine: 'Poussée de tension soudaine (classique tyramine + IMAO) — à surveiller.',
  bouffee_chaleur_pouls: 'Bouffée de chaleur accompagnée d’un pouls accéléré.',
  // ---- ORL / respiratoire (amines) ----
  nez_qui_coule: 'Nez qui coule ou congestion nasale, hors rhume.',
  eternuements: 'Salves d’éternuements après le repas.',
  toux: 'Toux irritative sans cause infectieuse évidente.',
  gorge_qui_gratte: 'Gorge qui gratte, picote ou se serre.',
  difficulte_respiratoire: 'Gêne respiratoire, sifflements → urgence si marqué.',
  // ---- Général (amines) ----
  malaise_general: 'Sensation de malaise général, « pas bien » diffus.',
  anxiete_soudaine: 'Anxiété soudaine sans cause apparente (effet nerveux de l’histamine).',
  picotement_bouche_levres: 'Picotements ou fourmillements de la bouche / des lèvres.',
  salivation_anormale: 'Salivation excessive ou, au contraire, bouche sèche.',
  troubles_sommeil: 'Endormissement perturbé, surtout après un repas du soir.',
  // ---- Signes d'alerte (urgents) ----
  gonflement_gorge_langue: 'Gonflement de la gorge ou de la langue → urgence médicale.',
  difficulte_avaler: 'Difficulté à respirer ou à avaler → urgence médicale.',
  chute_tension_malaise: 'Chute de tension importante avec malaise → urgence médicale.',
  urticaire_generalisee_aggravation: 'Urticaire généralisée qui s’aggrave vite → urgence médicale.',
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
  urticaire: 'Urticaire',
  rougeurs: 'Rougeurs / bouffées',
  maux_de_tete: 'Maux de tête',
  nausees: 'Nausées',
  // ---- Cutané (amines) ----
  demangeaisons_visage_cou: 'Démangeaisons visage / cou',
  demangeaisons_paumes_plantes: 'Démangeaisons paumes / plantes',
  chaleur_cutanee: 'Chaleur cutanée',
  oedeme_leger: 'Œdème léger (paupières, lèvres)',
  // ---- Digestif (amines) ----
  trop_plein: 'Sensation de trop-plein',
  // ---- Neuro (amines) ----
  migraine: 'Migraine',
  vertiges: 'Vertiges / étourdissements',
  // ---- Cardiovasculaire (amines) ----
  palpitations: 'Palpitations / tachycardie',
  hypotension: 'Hypotension',
  hypertension_soudaine: 'Hypertension soudaine',
  bouffee_chaleur_pouls: 'Bouffée de chaleur + pouls',
  // ---- ORL / respiratoire (amines) ----
  nez_qui_coule: 'Nez qui coule / congestion',
  eternuements: 'Éternuements',
  toux: 'Toux',
  gorge_qui_gratte: 'Gorge qui gratte',
  difficulte_respiratoire: 'Difficulté respiratoire',
  // ---- Général (amines) ----
  malaise_general: 'Malaise général',
  anxiete_soudaine: 'Anxiété soudaine',
  picotement_bouche_levres: 'Picotement bouche / lèvres',
  salivation_anormale: 'Salivation anormale',
  troubles_sommeil: 'Troubles du sommeil',
  // ---- Signes d'alerte (urgents) ----
  gonflement_gorge_langue: 'Gonflement gorge / langue',
  difficulte_avaler: 'Difficulté à avaler',
  chute_tension_malaise: 'Chute de tension / malaise',
  urticaire_generalisee_aggravation: 'Urticaire généralisée qui s’aggrave',
};

/** Libellés des catégories de symptômes (regroupement de la grille). */
export const SYMPTOM_CATEGORY_LABEL: Record<SymptomCategory, string> = {
  digestif: 'Digestif',
  cutane: 'Cutané',
  neuro: 'Neurologique',
  cardiovasculaire: 'Cardiovasculaire',
  orl_respiratoire: 'ORL / respiratoire',
  general: 'Général',
  alerte: "Signes d'alerte",
};

/** Ordre d'affichage des catégories (digestif d'abord, alerte en dernier). */
export const SYMPTOM_CATEGORY_ORDER: SymptomCategory[] = [
  'digestif',
  'cutane',
  'neuro',
  'cardiovasculaire',
  'orl_respiratoire',
  'general',
  'alerte',
];

/** Couleur d'accent par catégorie (variables `--color-*` de @theme). */
export const SYMPTOM_CATEGORY_COLOR: Record<SymptomCategory, string> = {
  digestif: 'var(--color-modere)',
  cutane: 'var(--color-leger)',
  neuro: 'var(--color-modere)',
  cardiovasculaire: 'var(--color-severe)',
  orl_respiratoire: 'var(--color-leger)',
  general: 'var(--color-absent)',
  alerte: 'var(--color-severe)',
};

/** Système corporel de chaque symptôme (regroupement + croisement amines). */
export const SYMPTOM_CATEGORY: Record<SymptomKey, SymptomCategory> = {
  // Digestif
  ballonnements: 'digestif',
  gaz: 'digestif',
  douleurs_abdo: 'digestif',
  reflux: 'digestif',
  diarrhee: 'digestif',
  constipation: 'digestif',
  nausees: 'digestif',
  trop_plein: 'digestif',
  // Cutané
  demangeaisons: 'cutane',
  demangeaisons_visage_cou: 'cutane',
  demangeaisons_paumes_plantes: 'cutane',
  urticaire: 'cutane',
  rougeurs: 'cutane',
  chaleur_cutanee: 'cutane',
  oedeme_leger: 'cutane',
  // Neuro
  maux_de_tete: 'neuro',
  migraine: 'neuro',
  vertiges: 'neuro',
  fatigue_apres_repas: 'neuro',
  brouillard_mental: 'neuro',
  // Cardiovasculaire
  palpitations: 'cardiovasculaire',
  hypotension: 'cardiovasculaire',
  hypertension_soudaine: 'cardiovasculaire',
  bouffee_chaleur_pouls: 'cardiovasculaire',
  // ORL / respiratoire
  nez_qui_coule: 'orl_respiratoire',
  eternuements: 'orl_respiratoire',
  toux: 'orl_respiratoire',
  gorge_qui_gratte: 'orl_respiratoire',
  difficulte_respiratoire: 'orl_respiratoire',
  // Général
  envie_sucre: 'general',
  mycose_buccale: 'general',
  malaise_general: 'general',
  anxiete_soudaine: 'general',
  picotement_bouche_levres: 'general',
  salivation_anormale: 'general',
  troubles_sommeil: 'general',
  // Signes d'alerte
  gonflement_gorge_langue: 'alerte',
  difficulte_avaler: 'alerte',
  chute_tension_malaise: 'alerte',
  urticaire_generalisee_aggravation: 'alerte',
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

/** Libellés d'intensité adaptés au stress (« Aucun → Élevé »). */
export const STRESS_LABEL: Record<Intensity, string> = {
  absent: 'Aucun',
  leger: 'Léger',
  modere: 'Modéré',
  severe: 'Élevé',
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
