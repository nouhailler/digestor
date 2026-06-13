import { describe, expect, it } from 'vitest';
import { toEncyclopediaExtra, toSymptomInfo } from './symptomInfo';
import { encyclopediaNames } from '../encyclopedia';

describe('toSymptomInfo', () => {
  it('normalise et coerce une fiche', () => {
    const info = toSymptomInfo(
      { origine: 'fermentation', manifestation: 'ventre gonflé', effets: ['gêne', ''], conseils: ['réduire FODMAP'] },
      'Ballonnements',
      'modele:free',
    );
    expect(info.key).toBe('ballonnements');
    expect(info.origine).toBe('fermentation');
    expect(info.effets).toEqual(['gêne']); // vide filtré
    expect(info.conseils).toEqual(['réduire FODMAP']);
    expect(info.model).toBe('modele:free');
  });

  it('tolère une réponse incomplète', () => {
    const info = toSymptomInfo({}, 'Reflux', 'm');
    expect(info.origine).toBe('');
    expect(info.effets).toEqual([]);
    expect(info.conseils).toEqual([]);
  });
});

describe('toEncyclopediaExtra', () => {
  it('garde les entrées valides (nom + catégorie)', () => {
    const e = toEncyclopediaExtra(
      {
        items: [
          { category: 'Digestif bas', name: 'Borborygmes', manifestation: 'gargouillis' },
          { name: 'sans catégorie' },
          'oops',
        ],
      },
      'm',
    );
    expect(e.items).toHaveLength(1);
    expect(e.items[0].name).toBe('Borborygmes');
  });
});

describe('encyclopediaNames', () => {
  it('expose les noms du socle statique', () => {
    const names = encyclopediaNames();
    expect(names.length).toBeGreaterThan(10);
    expect(names).toContain('Ballonnements');
  });
});
