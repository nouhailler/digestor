import type { Treatment, TreatmentKind } from '../types';

export const TREATMENT_KIND_LABEL: Record<TreatmentKind, string> = {
  antifongique: 'Antifongique',
  antibiotique: 'Antibiotique',
  probiotique: 'Probiotique',
  prebiotique: 'Prébiotique',
  complement: 'Complément',
  phytotherapie: 'Phytothérapie',
  medicament: 'Médicament',
  autre: 'Autre',
};

export const TREATMENT_KINDS: TreatmentKind[] = [
  'antifongique',
  'antibiotique',
  'probiotique',
  'prebiotique',
  'complement',
  'phytotherapie',
  'medicament',
  'autre',
];

/** Un traitement est « en cours » s'il n'a pas de date de fin, ou si elle est ≥ aujourd'hui. */
export function isTreatmentActive(t: Treatment, todayISO: string): boolean {
  return !t.endDate || t.endDate >= todayISO;
}

/** Tri d'affichage : en cours d'abord, puis du plus récent au plus ancien (date de début). */
export function sortTreatments(list: Treatment[], todayISO: string): Treatment[] {
  return [...list].sort((a, b) => {
    const aActive = isTreatmentActive(a, todayISO);
    const bActive = isTreatmentActive(b, todayISO);
    if (aActive !== bActive) return aActive ? -1 : 1;
    return b.startDate.localeCompare(a.startDate);
  });
}
