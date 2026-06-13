import type { FodmapPhase, Profile } from '../types';

/** Suggestions proposées dans le questionnaire (saisie libre toujours possible). */
export const CONDITION_OPTIONS = [
  'SIBO (confirmé)',
  'SIBO (suspecté)',
  'SII',
  'Candidose intestinale',
  'RGO / reflux',
  'Maladie cœliaque',
];

export const INTOLERANCE_OPTIONS = [
  'Lactose',
  'Gluten',
  'Fructose',
  'Polyols (sorbitol…)',
  'Histamine',
  'FODMAP en général',
  'Caféine',
];

export const ALLERGY_OPTIONS = [
  'Arachides',
  'Fruits à coque',
  'Œuf',
  'Lait',
  'Poisson',
  'Crustacés',
  'Soja',
  'Blé',
  'Sésame',
];

export const FODMAP_PHASE_LABEL: Record<FodmapPhase, string> = {
  aucune: 'Aucune / non concerné',
  elimination: 'Élimination',
  reintroduction: 'Réintroduction',
  personnalisee: 'Personnalisée',
};

export const FODMAP_PHASES: FodmapPhase[] = [
  'aucune',
  'elimination',
  'reintroduction',
  'personnalisee',
];

function list(arr?: string[]): string | null {
  const cleaned = (arr ?? []).map((s) => s.trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(', ') : null;
}

/**
 * Construit le contexte profil injecté dans les prompts IA.
 * Renvoie `undefined` si rien de pertinent n'est renseigné.
 */
export const SEX_LABEL: Record<NonNullable<Profile['sex']>, string> = {
  femme: 'Femme',
  homme: 'Homme',
  autre: 'Autre',
};

export function buildProfileContext(profile: Profile | undefined): string | undefined {
  if (!profile) return undefined;
  const parts: string[] = [];

  if (typeof profile.age === 'number' && profile.age > 0) parts.push(`âge : ${profile.age} ans`);
  if (profile.sex) parts.push(`sexe : ${SEX_LABEL[profile.sex].toLowerCase()}`);

  const conditions = list(profile.conditions);
  if (conditions) parts.push(`conditions : ${conditions}`);

  if (profile.fodmapPhase && profile.fodmapPhase !== 'aucune') {
    parts.push(`phase FODMAP : ${FODMAP_PHASE_LABEL[profile.fodmapPhase].toLowerCase()}`);
  }

  const intolerances = list(profile.intolerances);
  if (intolerances) parts.push(`intolérances : ${intolerances}`);

  const allergies = list(profile.allergies);
  if (allergies) parts.push(`ALLERGIES (à signaler impérativement si l'aliment en contient) : ${allergies}`);

  const avoided = list(profile.avoidedFoods);
  if (avoided) parts.push(`aliments à éviter : ${avoided}`);

  const history = profile.medicalHistory?.trim();
  if (history) parts.push(`antécédents médicaux : ${history}`);

  const meds = profile.medications?.trim();
  if (meds) parts.push(`médicaments : ${meds}`);

  const notes = profile.notes?.trim();
  if (notes) parts.push(`note : ${notes}`);

  return parts.length ? parts.join(' ; ') : undefined;
}

/** Indique si le profil contient des informations santé exploitables. */
export function hasHealthInfo(profile: Profile | undefined): boolean {
  return buildProfileContext(profile) !== undefined;
}
