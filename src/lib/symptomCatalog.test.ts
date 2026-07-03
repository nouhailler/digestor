import { describe, expect, it } from 'vitest';
import type { SymptomKey } from '../types';
import { SYMPTOM_CATEGORY, SYMPTOM_LABELS, SYMPTOM_ORDER } from './constants';
import {
  SYMPTOM_AMINE_META,
  isUrgentSymptom,
  symptomMetaHint,
  symptomsByCategory,
} from './symptomCatalog';

describe('symptomCatalog — couverture', () => {
  it('chaque symptôme a une catégorie et une métadonnée amine', () => {
    for (const key of SYMPTOM_ORDER) {
      expect(SYMPTOM_CATEGORY[key], `catégorie manquante pour ${key}`).toBeTruthy();
      expect(SYMPTOM_AMINE_META[key], `amine meta manquante pour ${key}`).toBeTruthy();
    }
  });

  it('symptomsByCategory couvre toutes les clés exactement une fois', () => {
    const seen: SymptomKey[] = [];
    for (const group of symptomsByCategory()) seen.push(...group.keys);
    expect(seen.sort()).toEqual([...SYMPTOM_ORDER].sort());
    expect(new Set(seen).size).toBe(seen.length); // aucun doublon
  });

  it('les groupes sont non vides et libellés', () => {
    for (const group of symptomsByCategory()) {
      expect(group.keys.length).toBeGreaterThan(0);
      expect(group.label).toBeTruthy();
    }
  });
});

describe('symptomCatalog — signes d’alerte', () => {
  it('la catégorie alerte contient exactement les 4 signes urgents', () => {
    const alerte = symptomsByCategory().find((g) => g.category === 'alerte');
    expect(alerte?.keys).toEqual([
      'gonflement_gorge_langue',
      'difficulte_avaler',
      'chute_tension_malaise',
      'urticaire_generalisee_aggravation',
    ]);
    for (const key of alerte!.keys) expect(isUrgentSymptom(key)).toBe(true);
  });

  it('hypertension et difficulté respiratoire sont urgentes hors catégorie alerte', () => {
    expect(isUrgentSymptom('hypertension_soudaine')).toBe(true);
    expect(SYMPTOM_CATEGORY.hypertension_soudaine).toBe('cardiovasculaire');
    expect(isUrgentSymptom('difficulte_respiratoire')).toBe(true);
    expect(SYMPTOM_CATEGORY.difficulte_respiratoire).toBe('orl_respiratoire');
  });

  it('un symptôme digestif banal n’est pas urgent', () => {
    expect(isUrgentSymptom('ballonnements')).toBe(false);
  });
});

describe('symptomCatalog — infobulle', () => {
  it('formate délai + amine', () => {
    expect(symptomMetaHint('reflux')).toBe('~30 min · souvent histamine');
    expect(symptomMetaHint('migraine')).toBe('~2 h · souvent tyramine');
    expect(symptomMetaHint('troubles_sommeil')).toBe('~3 h · souvent histamine');
    expect(symptomMetaHint('malaise_general')).toBe('~45 min · souvent histamine ou tyramine');
  });

  it('renvoie undefined quand amine indéterminée et pas de délai', () => {
    expect(symptomMetaHint('gaz')).toBeUndefined();
    expect(symptomMetaHint('constipation')).toBeUndefined();
  });

  it('les symptômes historiques hors amines sont indéterminés et non urgents', () => {
    for (const key of ['gaz', 'constipation', 'envie_sucre', 'mycose_buccale'] as const) {
      expect(SYMPTOM_AMINE_META[key].amine).toBe('unknown');
      expect(SYMPTOM_AMINE_META[key].urgent).toBe(false);
    }
  });

  it('tout symptôme a un libellé affichable', () => {
    for (const key of SYMPTOM_ORDER) expect(SYMPTOM_LABELS[key]).toBeTruthy();
  });
});
