import type { FoodQuantity, QuantityUnit } from '../types';

/**
 * Détection de carence sur un set d'aliments restreint (FODMAP/SIBO/candidose +
 * allergènes). Fonctions PURES, sans I/O ni React : la composition nutritionnelle
 * (issue de CIQUAL) et les portions sont passées en paramètres — la couche
 * appelante décide comment charger les données.
 *
 * Principe d'honnêteté (cf. correlations.ts) : on ne conclut à une carence que si
 * la *couverture* des aliments analysés est suffisante ; sinon le statut reste
 * « indéterminé » plutôt que d'afficher un faux manque.
 *
 * Source des références de composition : Anses. 2025. Table Ciqual (Etalab 2.0).
 */

/** Nutriments suivis (clés alignées sur l'asset ciqual-nutrition.json). */
export type NutrientKey =
  | 'kcal'
  | 'eau'
  | 'prot'
  | 'gluc'
  | 'lip'
  | 'sucres'
  | 'amidon'
  | 'fibres'
  | 'polyols'
  | 'ag_satures'
  | 'sel'
  | 'calcium'
  | 'fer'
  | 'iode'
  | 'magnesium'
  | 'potassium'
  | 'zinc'
  | 'vit_d'
  | 'vit_c'
  | 'vit_b9'
  | 'vit_b12'
  | 'omega3';

/** Composition pour 100 g. `null` = non mesuré par CIQUAL (≠ zéro). */
export type NutritionPer100g = Partial<Record<NutrientKey, number | null>>;

/**
 * Apports nutritionnels de référence (ANR) journaliers, adulte — valeurs
 * indicatives (EFSA/ANSES). Seuls les nutriments « à risque de carence » y
 * figurent : l'évaluation se fait sur ces clés. Ajustables via les options.
 */
export const REFERENCE_INTAKE: Partial<Record<NutrientKey, number>> = {
  prot: 50, // g
  fibres: 30, // g
  calcium: 950, // mg
  fer: 11, // mg (référence adulte ; ↑ ~16 pour femme non ménopausée)
  iode: 150, // µg
  magnesium: 350, // mg
  potassium: 3500, // mg
  zinc: 10, // mg
  vit_d: 15, // µg
  vit_c: 110, // mg
  vit_b9: 330, // µg
  vit_b12: 4, // µg
  omega3: 2, // g (ALA+EPA+DHA ; AI ALA ≈ 2 g)
};

export const NUTRIENT_LABEL: Record<NutrientKey, string> = {
  kcal: 'Énergie',
  eau: 'Eau',
  prot: 'Protéines',
  gluc: 'Glucides',
  lip: 'Lipides',
  sucres: 'Sucres',
  amidon: 'Amidon',
  fibres: 'Fibres',
  polyols: 'Polyols',
  ag_satures: 'AG saturés',
  sel: 'Sel',
  calcium: 'Calcium',
  fer: 'Fer',
  iode: 'Iode',
  magnesium: 'Magnésium',
  potassium: 'Potassium',
  zinc: 'Zinc',
  vit_d: 'Vitamine D',
  vit_c: 'Vitamine C',
  vit_b9: 'Vitamine B9 (folates)',
  vit_b12: 'Vitamine B12',
  omega3: 'Oméga-3',
};

/**
 * Poids approximatif (g) d'une unité de portion, pour convertir une
 * `FoodQuantity` en grammes. Valeurs indicatives (ordre de grandeur).
 */
export const UNIT_GRAMS: Record<QuantityUnit, number> = {
  unite: 50,
  cac: 5,
  cas: 15,
  pincee: 1,
  portion: 100,
  poignee: 30,
  tranche: 25,
  verre: 200,
  bol: 250,
  g: 1,
  ml: 1, // densité ≈ 1
};

/** Convertit une portion en grammes. Sans quantité → `fallbackGrams` (défaut 100 g). */
export function gramsForQuantity(quantity: FoodQuantity | undefined, fallbackGrams = 100): number {
  if (!quantity || !Number.isFinite(quantity.amount) || quantity.amount <= 0) return fallbackGrams;
  return quantity.amount * UNIT_GRAMS[quantity.unit];
}

/** Un aliment consommé : sa composition (si connue) et la quantité en grammes. */
export interface ConsumedFood {
  nutrition?: NutritionPer100g;
  grams: number;
}

export interface IntakeTotals {
  /** Apport cumulé par nutriment (sur toute la fenêtre). */
  totals: Partial<Record<NutrientKey, number>>;
  /** Aliments dotés d'une fiche nutrition. */
  covered: number;
  /** Aliments au total. */
  total: number;
  /** covered / total ∈ [0,1] — base du garde-fou d'honnêteté. */
  coverageRatio: number;
}

/**
 * Somme les apports par nutriment sur une liste d'aliments consommés.
 * Une valeur `null` (non mesurée) ne contribue pas mais n'invalide pas l'aliment.
 */
export function sumIntake(items: ConsumedFood[]): IntakeTotals {
  const totals: Partial<Record<NutrientKey, number>> = {};
  let covered = 0;
  for (const it of items) {
    if (!it.nutrition) continue;
    covered++;
    const factor = it.grams / 100;
    for (const k of Object.keys(it.nutrition) as NutrientKey[]) {
      const v = it.nutrition[k];
      if (v == null || !Number.isFinite(v)) continue;
      totals[k] = (totals[k] ?? 0) + v * factor;
    }
  }
  const total = items.length;
  return { totals, covered, total, coverageRatio: total === 0 ? 0 : covered / total };
}

/** Appréciation d'un nutriment vis-à-vis de l'ANR. */
export type NutrientBand = 'ok' | 'limite' | 'faible' | 'indetermine';

export interface NutrientStatus {
  nutrient: NutrientKey;
  /** Apport moyen par jour. */
  perDay: number;
  /** Référence ANR/jour utilisée. */
  reference: number;
  /** % de l'ANR couvert (peut dépasser 100). */
  pctRef: number;
  band: NutrientBand;
}

export interface DeficiencyOptions {
  /** Références ANR à utiliser (défaut REFERENCE_INTAKE). */
  reference?: Partial<Record<NutrientKey, number>>;
  /** Seuil bas du % ANR sous lequel on parle de carence probable (défaut 66). */
  lowPct?: number;
  /** Seuil haut du % ANR au-dessus duquel le besoin est couvert (défaut 100). */
  okPct?: number;
  /** Couverture minimale des aliments pour oser conclure (défaut 0.6). */
  minCoverage?: number;
}

export interface DeficiencyReport {
  coverageRatio: number;
  /** true si la couverture autorise une conclusion. */
  sufficient: boolean;
  nutrients: NutrientStatus[];
}

function bandFor(pct: number, low: number, ok: number): NutrientBand {
  if (pct < low) return 'faible';
  if (pct < ok) return 'limite';
  return 'ok';
}

/**
 * Évalue les apports sur `days` jours et signale les nutriments à risque.
 * Garde-fou : si la couverture < `minCoverage`, tous les statuts sont
 * `indetermine` et `sufficient` est faux (on ne conclut pas).
 */
export function analyzeDeficiency(
  items: ConsumedFood[],
  days: number,
  opts: DeficiencyOptions = {},
): DeficiencyReport {
  const reference = opts.reference ?? REFERENCE_INTAKE;
  const low = opts.lowPct ?? 66;
  const ok = opts.okPct ?? 100;
  const minCoverage = opts.minCoverage ?? 0.6;
  const span = days > 0 ? days : 1;

  const { totals, coverageRatio } = sumIntake(items);
  const sufficient = coverageRatio >= minCoverage;

  const nutrients: NutrientStatus[] = [];
  for (const key of Object.keys(reference) as NutrientKey[]) {
    const ref = reference[key];
    if (!ref || ref <= 0) continue;
    const perDay = (totals[key] ?? 0) / span;
    const pctRef = (perDay / ref) * 100;
    nutrients.push({
      nutrient: key,
      perDay,
      reference: ref,
      pctRef,
      band: sufficient ? bandFor(pctRef, low, ok) : 'indetermine',
    });
  }
  // Les plus carencés d'abord (utile pour l'affichage et les alternatives).
  nutrients.sort((a, b) => a.pctRef - b.pctRef);
  return { coverageRatio, sufficient, nutrients };
}

/** Un aliment candidat comme source d'un nutriment. */
export interface FoodSource {
  key: string;
  nutrition?: NutritionPer100g;
}

export interface RankedSource {
  key: string;
  /** Teneur du nutriment (pour 100 g, ou par portion si `portionGrams` fourni). */
  amount: number;
}

/**
 * Classe des aliments (déjà filtrés « sûrs » par la couche appelante) par teneur
 * décroissante en `nutrient` — pour proposer des alternatives comblant un manque.
 * Si `portionGrams` est fourni, la teneur est ramenée à cette portion.
 */
export function rankSourcesFor(
  nutrient: NutrientKey,
  foods: FoodSource[],
  portionGrams?: number,
): RankedSource[] {
  const out: RankedSource[] = [];
  for (const f of foods) {
    const v = f.nutrition?.[nutrient];
    if (v == null || !Number.isFinite(v) || v <= 0) continue;
    const amount = portionGrams != null ? (v * portionGrams) / 100 : v;
    out.push({ key: f.key, amount });
  }
  out.sort((a, b) => b.amount - a.amount);
  return out;
}
