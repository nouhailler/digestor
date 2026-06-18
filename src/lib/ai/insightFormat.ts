import type { FodmapLevel, FoodInsight, Verdict } from '../../types';
import { CATEGORY_COLOR } from '../constants';

export const FODMAP_LEVEL_LABEL: Record<FodmapLevel, string> = {
  low: 'Bas',
  moderate: 'Modéré',
  high: 'Élevé',
  unknown: 'Inconnu',
};

export const FODMAP_LEVEL_COLOR: Record<FodmapLevel, string> = {
  low: 'var(--color-leger)',
  moderate: 'var(--color-modere)',
  high: 'var(--color-severe)',
  unknown: 'var(--color-absent)',
};

export const FODMAP_GROUP_LABEL: Record<keyof import('../../types').FodmapGroups, string> = {
  fructose: 'Fructose',
  lactose: 'Lactose',
  fructans: 'Fructanes',
  gos: 'GOS (galactanes)',
  polyols: 'Polyols',
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  favorable: 'Favorable',
  attention: 'À surveiller',
  eviter: 'À éviter',
  inconnu: 'Inconnu',
};

export const VERDICT_COLOR: Record<Verdict, string> = {
  favorable: 'var(--color-leger)',
  attention: 'var(--color-modere)',
  eviter: 'var(--color-severe)',
  inconnu: 'var(--color-absent)',
};

/**
 * Couleur d'une chip d'aliment d'après son analyse IA : on reflète le niveau
 * FODMAP global (Élevé→sévère/rouge, Modéré→ambre, Bas→léger/vert) ; si le
 * niveau est inconnu, on retombe sur la catégorie dérivée (pro/bénéfique/neutre).
 */
export function insightChipColor(insight: FoodInsight): string {
  return insight.fodmapLevel === 'unknown'
    ? CATEGORY_COLOR[insight.category]
    : FODMAP_LEVEL_COLOR[insight.fodmapLevel];
}
