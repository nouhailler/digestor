import type { Meal, SatietyCheck, SatietyCheckpoint, SatietyType } from '../types';

/** Ordre temporel des checkpoints de satiété. */
export const SATIETY_CHECKPOINTS: SatietyCheckpoint[] = ['immediate', '1h', '2h', '3h'];

export const CHECKPOINT_LABEL: Record<SatietyCheckpoint, string> = {
  immediate: 'Immédiat',
  '1h': '+1 h',
  '2h': '+2 h',
  '3h': '+3 h',
};

/** Libellé court pour l'axe X du graphe de courbe. */
export const CHECKPOINT_SHORT: Record<SatietyCheckpoint, string> = {
  immediate: '0 h',
  '1h': '1 h',
  '2h': '2 h',
  '3h': '3 h',
};

/** Checkpoints où le type de satiété qualitatif est pertinent (proches du repas). */
export const TYPE_CHECKPOINTS: SatietyCheckpoint[] = ['immediate', '1h'];

export const SATIETY_TYPES: SatietyType[] = ['legere', 'lourde', 'ballonnement'];

export const SATIETY_TYPE_LABEL: Record<SatietyType, string> = {
  legere: 'Légère',
  lourde: 'Lourde',
  ballonnement: 'Ballonnement',
};

/** Couleur (variable CSS de @theme) par type de satiété. */
export const SATIETY_TYPE_COLOR: Record<SatietyType, string> = {
  legere: 'var(--color-leger)',
  lourde: 'var(--color-modere)',
  ballonnement: 'var(--color-severe)',
};

/** Les 3 mesures numériques (VAS) d'un relevé de satiété. */
export type VasMetricKey = 'hungerIntensity' | 'energyLevel' | 'sugarCraving';

export interface VasMetric {
  key: VasMetricKey;
  label: string;
  leftLabel: string; // ancre à 0
  rightLabel: string; // ancre à 100
  color: string; // variable CSS de @theme
}

export const VAS_METRICS: VasMetric[] = [
  {
    key: 'hungerIntensity',
    label: 'Intensité de la faim',
    leftLabel: 'Aucune faim',
    rightLabel: 'Faim extrême',
    color: 'var(--color-severe)',
  },
  {
    key: 'energyLevel',
    label: 'Énergie',
    leftLabel: 'Coup de barre',
    rightLabel: 'Énergie stable',
    color: 'var(--color-leger)',
  },
  {
    key: 'sugarCraving',
    label: 'Envie de sucre',
    leftLabel: 'Aucune envie',
    rightLabel: 'Irrépressible',
    color: 'var(--color-modere)',
  },
];

/** Valeur neutre (centre du slider) utilisée par défaut. */
export const VAS_NEUTRAL = 50;

/** Borne une mesure VAS à un entier 0-100 ; retombe sur la valeur neutre si non finie. */
export function clampVas(n: number): number {
  if (!Number.isFinite(n)) return VAS_NEUTRAL;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Relevé vierge (valeurs neutres) pour un checkpoint. */
export function emptySatietyCheck(checkpoint: SatietyCheckpoint): SatietyCheck {
  return {
    checkpoint,
    hungerIntensity: VAS_NEUTRAL,
    energyLevel: VAS_NEUTRAL,
    sugarCraving: VAS_NEUTRAL,
  };
}

const CHECKPOINT_INDEX: Record<SatietyCheckpoint, number> = {
  immediate: 0,
  '1h': 1,
  '2h': 2,
  '3h': 3,
};

/** Tri des relevés par ordre temporel (immédiat → +3 h). */
export function sortChecks(checks: SatietyCheck[]): SatietyCheck[] {
  return [...checks].sort((a, b) => CHECKPOINT_INDEX[a.checkpoint] - CHECKPOINT_INDEX[b.checkpoint]);
}

/** Insère ou remplace le relevé d'un checkpoint (1 relevé max par checkpoint), puis trie. */
export function upsertCheck(checks: SatietyCheck[], check: SatietyCheck): SatietyCheck[] {
  const rest = checks.filter((c) => c.checkpoint !== check.checkpoint);
  return sortChecks([...rest, check]);
}

/** Retire le relevé d'un checkpoint. */
export function removeCheck(checks: SatietyCheck[], checkpoint: SatietyCheckpoint): SatietyCheck[] {
  return checks.filter((c) => c.checkpoint !== checkpoint);
}

/** Le type de satiété est-il proposé pour ce checkpoint ? */
export function typeApplies(checkpoint: SatietyCheckpoint): boolean {
  return TYPE_CHECKPOINTS.includes(checkpoint);
}

/** Le repas a-t-il au moins un relevé de satiété ? */
export function hasSatiety(meal: Pick<Meal, 'satiety'>): boolean {
  return !!meal.satiety && meal.satiety.length > 0;
}
