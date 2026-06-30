import type { MealTag } from '../types';
import { normalize } from './foodClassifier';

/** Ordre d'affichage des tags de composition. */
export const MEAL_TAGS: MealTag[] = ['proteine', 'fibres', 'sucre'];

export const MEAL_TAG_LABEL: Record<MealTag, string> = {
  proteine: 'Protéiné',
  fibres: 'Fibres',
  sucre: 'Sucré',
};

/** Couleur (variable CSS de @theme) : protéiné/fibres = satiété longue (vert), sucré = courte (rouge). */
export const MEAL_TAG_COLOR: Record<MealTag, string> = {
  proteine: 'var(--color-leger)',
  fibres: 'var(--color-modere)',
  sucre: 'var(--color-severe)',
};

const TAG_SYNONYMS: Record<string, MealTag> = {
  proteine: 'proteine',
  proteines: 'proteine',
  protein: 'proteine',
  'riche en proteines': 'proteine',
  fibre: 'fibres',
  fibres: 'fibres',
  fiber: 'fibres',
  'riche en fibres': 'fibres',
  sucre: 'sucre',
  sucree: 'sucre',
  sucres: 'sucre',
  sugar: 'sucre',
  sucreries: 'sucre',
};

export function resolveMealTag(input: unknown): MealTag | null {
  if (typeof input !== 'string') return null;
  return TAG_SYNONYMS[normalize(input)] ?? null;
}

/** Parse une liste hétérogène de tags → MealTag[] dédupliqué (ignore l'inconnu). */
export function parseMealTags(raw: unknown): MealTag[] {
  if (!Array.isArray(raw)) return [];
  const out: MealTag[] = [];
  for (const t of raw) {
    const tag = resolveMealTag(t);
    if (tag && !out.includes(tag)) out.push(tag);
  }
  return out;
}
