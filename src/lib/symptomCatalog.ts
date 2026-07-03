import type { SymptomCategory, SymptomKey, TypicalAmine } from '../types';
import { SYMPTOM_CATEGORY, SYMPTOM_CATEGORY_LABEL, SYMPTOM_CATEGORY_ORDER, SYMPTOM_ORDER } from './constants';

/**
 * Couche métier « amines biogènes ↔ symptômes ».
 *
 * Chaque symptôme porte, en plus de sa catégorie (cf. `SYMPTOM_CATEGORY` dans
 * constants), une métadonnée indicative : l'amine la plus souvent en cause
 * (`amine`), son caractère d'urgence médicale (`urgent`) et le délai typique
 * d'apparition après le repas (`onsetMin`, en minutes).
 *
 * IMPORTANT — honnêteté : ces valeurs sont des REPÈRES, pas un diagnostic. Le
 * délai et l'amine varient fortement d'une personne à l'autre. Elles servent
 * d'infobulle discrète aujourd'hui, et de socle au croisement amine↔symptôme
 * par catégorie (patterns histaminique / tyraminique / à surveiller) prévu
 * ensuite dans `amineCorrelation.ts`. En cas de symptôme `urgent`, consulter
 * plutôt que se fier au suivi.
 */
export interface SymptomAmineMeta {
  amine: TypicalAmine;
  urgent: boolean;
  onsetMin?: number; // délai typique d'apparition post-repas (min), indicatif
}

const M = (amine: TypicalAmine, onsetMin?: number, urgent = false): SymptomAmineMeta => ({
  amine,
  urgent,
  ...(onsetMin !== undefined ? { onsetMin } : {}),
});

/**
 * Métadonnée amine par symptôme. Les symptômes historiques hors amines
 * (`gaz`, `constipation`, `envie_sucre`, `mycose_buccale`) sont `unknown`,
 * non urgents et sans délai.
 */
export const SYMPTOM_AMINE_META: Record<SymptomKey, SymptomAmineMeta> = {
  // ---- Digestif ----
  ballonnements: M('both', 60),
  gaz: M('unknown'),
  douleurs_abdo: M('both', 60),
  reflux: M('histamine', 30),
  diarrhee: M('histamine', 90),
  constipation: M('unknown'),
  nausees: M('both', 45),
  trop_plein: M('unknown', 30),
  // ---- Cutané ----
  demangeaisons: M('histamine', 60),
  demangeaisons_visage_cou: M('histamine', 30),
  demangeaisons_paumes_plantes: M('histamine', 45),
  urticaire: M('histamine', 45),
  rougeurs: M('histamine', 20),
  chaleur_cutanee: M('histamine', 20),
  oedeme_leger: M('histamine', 30),
  // ---- Neuro ----
  maux_de_tete: M('histamine', 60),
  migraine: M('tyramine', 120),
  vertiges: M('both', 45),
  fatigue_apres_repas: M('histamine', 60),
  brouillard_mental: M('histamine', 60),
  // ---- Cardiovasculaire ----
  palpitations: M('both', 30),
  hypotension: M('histamine', 30),
  hypertension_soudaine: M('tyramine', 45, true),
  bouffee_chaleur_pouls: M('histamine', 20),
  // ---- ORL / respiratoire ----
  nez_qui_coule: M('histamine', 30),
  eternuements: M('histamine', 20),
  toux: M('histamine', 30),
  gorge_qui_gratte: M('histamine', 15),
  difficulte_respiratoire: M('histamine', 20, true),
  // ---- Général ----
  envie_sucre: M('unknown'),
  mycose_buccale: M('unknown'),
  malaise_general: M('both', 45),
  anxiete_soudaine: M('histamine', 30),
  picotement_bouche_levres: M('histamine', 10),
  salivation_anormale: M('unknown', 20),
  troubles_sommeil: M('histamine', 180),
  // ---- Signes d'alerte (urgents) ----
  gonflement_gorge_langue: M('histamine', 15, true),
  difficulte_avaler: M('histamine', 15, true),
  chute_tension_malaise: M('both', 20, true),
  urticaire_generalisee_aggravation: M('histamine', 30, true),
};

/** Libellé de l'amine typique (pour l'infobulle). */
export const TYPICAL_AMINE_LABEL: Record<TypicalAmine, string> = {
  histamine: 'histamine',
  tyramine: 'tyramine',
  both: 'histamine ou tyramine',
  unknown: 'indéterminée',
};

/** Un symptôme est-il un signe d'alerte médicale ? */
export function isUrgentSymptom(key: SymptomKey): boolean {
  return SYMPTOM_AMINE_META[key].urgent;
}

/**
 * Infobulle indicative « délai · amine » d'un symptôme, ou `undefined` quand
 * on n'a rien de pertinent à dire (amine indéterminée et pas de délai).
 * Ex. « ~30 min · souvent histamine ».
 */
export function symptomMetaHint(key: SymptomKey): string | undefined {
  const meta = SYMPTOM_AMINE_META[key];
  const parts: string[] = [];
  if (meta.onsetMin !== undefined) parts.push(`~${formatOnset(meta.onsetMin)}`);
  if (meta.amine !== 'unknown') parts.push(`souvent ${TYPICAL_AMINE_LABEL[meta.amine]}`);
  return parts.length ? parts.join(' · ') : undefined;
}

/** Formate un délai en minutes de façon lisible (« 45 min », « 2 h », « 1 h 30 »). */
function formatOnset(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest === 0 ? `${h} h` : `${h} h ${rest}`;
}

/** Une catégorie de symptômes prête à afficher (regroupement de la grille). */
export interface SymptomGroup {
  category: SymptomCategory;
  label: string;
  keys: SymptomKey[];
}

/**
 * Regroupe `SYMPTOM_ORDER` par catégorie, dans l'ordre de
 * `SYMPTOM_CATEGORY_ORDER`. L'ordre interne de chaque groupe suit
 * `SYMPTOM_ORDER`. Les catégories sans symptôme sont omises.
 */
export function symptomsByCategory(): SymptomGroup[] {
  return SYMPTOM_CATEGORY_ORDER.map((category) => ({
    category,
    label: SYMPTOM_CATEGORY_LABEL[category],
    keys: SYMPTOM_ORDER.filter((k) => SYMPTOM_CATEGORY[k] === category),
  })).filter((g) => g.keys.length > 0);
}
