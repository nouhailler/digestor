import { describe, expect, it } from 'vitest';
import type { FoodInsight } from '../types';
import { mergeFoodInsight, mergeFoodReference, parseFoodReference } from './foodReferenceImport';

const REF = {
  app: 'digestor',
  type: 'food-reference',
  version: 1,
  foods: [
    {
      name: 'Roquefort',
      category: 'pro',
      fodmapLevel: 'moderate',
      fodmaps: { fructose: 'low', lactose: 'moderate', fructans: 'low', gos: 'low', polyols: 'low' },
      sibo: { verdict: 'attention', note: 'Affiné.' },
      candida: { verdict: 'attention', note: '' },
      // Schéma « public » : noms explicites + détail par amine.
      amines: { level: 'high', histamine: 'high', tyramine: 'high', daoInhibitor: false, fermented: true },
      safePortion: 'À éviter si sensible',
      summary: 'Fromage affiné très riche en amines.',
      tips: ['Éviter avec le vin.'],
    },
    { name: 'Curcuma', category: 'beneficial', needsReview: true, amines: { level: 'low', maoInhibitor: true } },
  ],
};

describe('parseFoodReference', () => {
  it('rejette un JSON qui n’est pas un référentiel', () => {
    expect(() => parseFoodReference('{"type":"meals","days":[]}')).toThrow(/référentiel/i);
    expect(() => parseFoodReference('pas du json')).toThrow();
  });

  it('construit des fiches avec le profil amines (noms publics coercés en interne)', () => {
    const { insights, withAmines } = parseFoodReference(JSON.stringify(REF));
    expect(insights).toHaveLength(2);
    expect(withAmines).toBe(2);
    const roq = insights.find((i) => i.key === 'roquefort')!;
    expect(roq.amines).toMatchObject({ level: 'high', histamine: 'high', tyramine: 'high', fermented: true });
    expect(roq.category).toBe('pro'); // catégorie explicite conservée
    const cur = insights.find((i) => i.key === 'curcuma')!;
    expect(cur.amines?.maoInhibitor).toBe(true);
    expect(cur.category).toBe('beneficial'); // conservée malgré FODMAP inconnu
  });

  it('avertit sur les entrées sans nom et les doublons', () => {
    const { insights, warnings } = parseFoodReference(
      JSON.stringify({ type: 'food-reference', foods: [{ name: '' }, { name: 'Riz' }, { name: 'riz' }] }),
    );
    expect(insights).toHaveLength(1);
    expect(warnings.some((w) => /sans "name"/i.test(w))).toBe(true);
    expect(warnings.some((w) => /doublon/i.test(w))).toBe(true);
  });
});

const base: FoodInsight = {
  key: 'roquefort',
  name: 'Roquefort',
  category: 'pro',
  fodmapLevel: 'moderate',
  fodmaps: { fructose: 'low', lactose: 'moderate', fructans: 'low', gos: 'low', polyols: 'low' },
  sibo: { verdict: 'attention', note: 'Analyse existante.' },
  candida: { verdict: 'eviter', note: 'Existant.' },
  summary: 'Résumé existant.',
  tips: ['Conseil existant.'],
  model: 'ia',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('mergeFoodInsight', () => {
  it('ajoute les amines sans écraser une analyse en place par des inconnus', () => {
    const incoming: FoodInsight = {
      ...base,
      fodmapLevel: 'unknown', // import « stub » : ne doit pas écraser
      fodmaps: { fructose: 'unknown', lactose: 'unknown', fructans: 'unknown', gos: 'unknown', polyols: 'unknown' },
      sibo: { verdict: 'inconnu', note: '' },
      candida: { verdict: 'inconnu', note: '' },
      summary: '',
      tips: [],
      amines: { level: 'high', histamine: 'high' },
      model: 'Import référentiel',
      updatedAt: '2026-07-03T00:00:00.000Z',
    };
    const m = mergeFoodInsight(base, incoming);
    expect(m.amines).toEqual({ level: 'high', histamine: 'high' }); // amines importées gagnent
    expect(m.fodmapLevel).toBe('moderate'); // existant conservé (import unknown)
    expect(m.sibo.verdict).toBe('attention');
    expect(m.candida.verdict).toBe('eviter');
    expect(m.summary).toBe('Résumé existant.');
    expect(m.tips).toEqual(['Conseil existant.']);
    expect(m.key).toBe('roquefort');
  });

  it('les valeurs signifiantes de l’import gagnent', () => {
    const incoming: FoodInsight = {
      ...base,
      fodmapLevel: 'high',
      summary: 'Nouveau résumé.',
      amines: { level: 'moderate' },
      updatedAt: '2026-07-03T00:00:00.000Z',
    };
    const m = mergeFoodInsight(base, incoming);
    expect(m.fodmapLevel).toBe('high');
    expect(m.summary).toBe('Nouveau résumé.');
  });
});

describe('mergeFoodReference', () => {
  it('compte ajouts et mises à jour', () => {
    const { insights } = parseFoodReference(JSON.stringify(REF));
    const { merged, added, updated } = mergeFoodReference([base], insights);
    expect(added).toBe(1); // Curcuma
    expect(updated).toBe(1); // Roquefort
    expect(merged).toHaveLength(2);
    const roq = merged.find((i) => i.key === 'roquefort')!;
    expect(roq.amines?.histamine).toBe('high');
    expect(roq.sibo.note).toBe('Affiné.'); // note import (non vide) prioritaire
  });
});
