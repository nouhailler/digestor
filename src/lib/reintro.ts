import type { ReintroChallenge, ReintroGroup, ReintroResult } from '../types';
import { FODMAP_GROUP_LABEL } from './ai/insightFormat';

export const REINTRO_GROUP_LABEL: Record<ReintroGroup, string> = {
  ...FODMAP_GROUP_LABEL,
  autre: 'Autre',
};

export const REINTRO_GROUPS: ReintroGroup[] = ['fructose', 'lactose', 'fructans', 'gos', 'polyols', 'autre'];

export const REINTRO_RESULT_LABEL: Record<ReintroResult, string> = {
  en_cours: 'En cours',
  tolere: 'Toléré',
  partiel: 'Toléré en quantité limitée',
  non_tolere: 'Non toléré',
  abandonne: 'Abandonné',
};

export const REINTRO_RESULTS: ReintroResult[] = ['en_cours', 'tolere', 'partiel', 'non_tolere', 'abandonne'];

/** Couleur (variable CSS de @theme) associée au verdict d'un test. */
export const REINTRO_RESULT_COLOR: Record<ReintroResult, string> = {
  en_cours: 'var(--color-absent)',
  tolere: 'var(--color-leger)',
  partiel: 'var(--color-modere)',
  non_tolere: 'var(--color-severe)',
  abandonne: 'var(--color-absent)',
};

/** Tri d'affichage : tests en cours d'abord, puis du plus récent au plus ancien. */
export function sortReintro(list: ReintroChallenge[]): ReintroChallenge[] {
  return [...list].sort((a, b) => {
    const aOpen = a.result === 'en_cours';
    const bOpen = b.result === 'en_cours';
    if (aOpen !== bOpen) return aOpen ? -1 : 1;
    return b.startDate.localeCompare(a.startDate);
  });
}
