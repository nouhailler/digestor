import { describe, expect, it } from 'vitest';
import {
  analyzeDeficiency,
  gramsForQuantity,
  rankSourcesFor,
  sumIntake,
  UNIT_GRAMS,
  type ConsumedFood,
  type FoodSource,
} from './nutrition';

describe('gramsForQuantity', () => {
  it('convertit selon l’unité', () => {
    expect(gramsForQuantity({ amount: 2, unit: 'cas' })).toBe(2 * UNIT_GRAMS.cas);
    expect(gramsForQuantity({ amount: 150, unit: 'g' })).toBe(150);
    expect(gramsForQuantity({ amount: 1, unit: 'bol' })).toBe(250);
  });

  it('retombe sur le fallback sans quantité ou quantité invalide', () => {
    expect(gramsForQuantity(undefined)).toBe(100);
    expect(gramsForQuantity(undefined, 80)).toBe(80);
    expect(gramsForQuantity({ amount: 0, unit: 'g' }, 80)).toBe(80);
    expect(gramsForQuantity({ amount: -5, unit: 'g' }, 80)).toBe(80);
  });
});

describe('sumIntake', () => {
  it('somme proportionnellement aux grammes et ignore les valeurs null', () => {
    const items: ConsumedFood[] = [
      { grams: 200, nutrition: { prot: 10, fer: 2, iode: null } }, // ×2
      { grams: 50, nutrition: { prot: 20, fer: null } }, // ×0.5
    ];
    const r = sumIntake(items);
    expect(r.totals.prot).toBeCloseTo(10 * 2 + 20 * 0.5); // 30
    expect(r.totals.fer).toBeCloseTo(2 * 2); // 4 (le null ignoré)
    expect(r.totals.iode).toBeUndefined(); // jamais mesuré
  });

  it('calcule la couverture (aliments avec fiche / total)', () => {
    const items: ConsumedFood[] = [
      { grams: 100, nutrition: { prot: 5 } },
      { grams: 100 }, // sans fiche
      { grams: 100, nutrition: { prot: 5 } },
    ];
    const r = sumIntake(items);
    expect(r.covered).toBe(2);
    expect(r.total).toBe(3);
    expect(r.coverageRatio).toBeCloseTo(2 / 3);
  });

  it('couverture 0 sur liste vide', () => {
    expect(sumIntake([]).coverageRatio).toBe(0);
  });
});

describe('analyzeDeficiency', () => {
  // Aliment fictif riche, pour piloter les bandes via la quantité/jours.
  const rich = (n: Partial<Record<'prot' | 'fer', number>>): ConsumedFood => ({
    grams: 100,
    nutrition: n,
  });

  it('classe ok / limite / faible selon le % ANR', () => {
    // ANR prot=50/j. Sur 1 jour : 60→ok, 40→limite(80%? non) ; calibrons.
    // 100 g à prot=60 → 60/j = 120% → ok
    // 100 g à fer=5 → 5/j, ANR 11 → 45% → faible
    const r = analyzeDeficiency([rich({ prot: 60, fer: 5 })], 1);
    const prot = r.nutrients.find((x) => x.nutrient === 'prot')!;
    const fer = r.nutrients.find((x) => x.nutrient === 'fer')!;
    expect(prot.band).toBe('ok');
    expect(prot.pctRef).toBeCloseTo(120);
    expect(fer.band).toBe('faible');
    expect(fer.pctRef).toBeCloseTo((5 / 11) * 100);
  });

  it('bande « limite » entre lowPct et okPct', () => {
    // prot 40/j sur ANR 50 = 80% → limite (entre 66 et 100)
    const r = analyzeDeficiency([rich({ prot: 40 })], 1);
    expect(r.nutrients.find((x) => x.nutrient === 'prot')!.band).toBe('limite');
  });

  it('divise par le nombre de jours', () => {
    // 700 g-équiv… ici : 100 g à prot=70 sur 7 j → 10/j → 20% → faible
    const r = analyzeDeficiency([rich({ prot: 70 })], 7);
    const prot = r.nutrients.find((x) => x.nutrient === 'prot')!;
    expect(prot.perDay).toBeCloseTo(10);
    expect(prot.pctRef).toBeCloseTo(20);
  });

  it('garde-fou : couverture insuffisante → indéterminé, sufficient=false', () => {
    const items: ConsumedFood[] = [
      { grams: 100, nutrition: { prot: 50 } },
      { grams: 100 },
      { grams: 100 },
      { grams: 100 },
    ]; // couverture 1/4 = 0.25 < 0.6
    const r = analyzeDeficiency(items, 1);
    expect(r.sufficient).toBe(false);
    expect(r.nutrients.every((x) => x.band === 'indetermine')).toBe(true);
  });

  it('trie les nutriments du plus carencé au plus couvert', () => {
    const r = analyzeDeficiency([rich({ prot: 60, fer: 5 })], 1);
    const pcts = r.nutrients.map((x) => x.pctRef);
    expect(pcts).toEqual([...pcts].sort((a, b) => a - b));
  });
});

describe('rankSourcesFor', () => {
  const foods: FoodSource[] = [
    { key: 'lentilles', nutrition: { fer: 2.45 } },
    { key: 'epinard', nutrition: { fer: 2.14 } },
    { key: 'riz blanc', nutrition: { fer: 0.25 } },
    { key: 'eau', nutrition: { fer: 0 } }, // exclu (0)
    { key: 'inconnu', nutrition: { fer: null } }, // exclu (null)
  ];

  it('classe par teneur décroissante et exclut 0/null', () => {
    const r = rankSourcesFor('fer', foods);
    expect(r.map((x) => x.key)).toEqual(['lentilles', 'epinard', 'riz blanc']);
    expect(r[0].amount).toBeCloseTo(2.45);
  });

  it('ramène à la portion si portionGrams fourni', () => {
    const r = rankSourcesFor('fer', [{ key: 'lentilles', nutrition: { fer: 2.45 } }], 200);
    expect(r[0].amount).toBeCloseTo(2.45 * 2); // 200 g
  });
});
