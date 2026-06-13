import type { FodmapLevel, Verdict } from '../../types';

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
