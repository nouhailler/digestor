import { describe, expect, it } from 'vitest';
import type { FoodInsight } from '../types';
import { buildFoodReference, type CatalogueFood } from './foodReference';

const insight: FoodInsight = {
  key: 'kaki',
  name: 'Kaki',
  category: 'pro',
  fodmapLevel: 'high',
  fodmaps: { fructose: 'high', lactose: 'low', fructans: 'low', gos: 'low', polyols: 'moderate' },
  sibo: { verdict: 'eviter', note: 'Fruit sucré.' },
  candida: { verdict: 'eviter', note: 'Fruit très sucré.' },
  safePortion: '1/4 de fruit',
  summary: 'Fruit riche en fructose.',
  tips: ['À éviter mûr.'],
  model: 'test/model',
  updatedAt: '2026-06-29T10:00:00.000Z',
};

const now = new Date('2026-06-30T08:00:00.000Z');

describe('buildFoodReference', () => {
  it('enveloppe les entrées dans l’en-tête de référence', () => {
    const ref = buildFoodReference([{ name: 'Kaki', insight }], now);
    expect(ref.app).toBe('digestor');
    expect(ref.type).toBe('food-reference');
    expect(ref.version).toBe(1);
    expect(ref.exportedAt).toBe('2026-06-30T08:00:00.000Z');
    expect(ref.foods).toHaveLength(1);
  });

  it('reprend la fiche analysée telle quelle', () => {
    const [entry] = buildFoodReference([{ name: 'Kaki', insight }], now).foods;
    expect(entry).toMatchObject({
      name: 'Kaki',
      category: 'pro',
      fodmapLevel: 'high',
      fodmaps: { fructose: 'high', polyols: 'moderate' },
      sibo: { verdict: 'eviter', note: 'Fruit sucré.' },
      safePortion: '1/4 de fruit',
      summary: 'Fruit riche en fructose.',
      tips: ['À éviter mûr.'],
    });
    expect(entry.needsReview).toBeUndefined();
  });

  it('crée un stub à compléter pour un aliment sans analyse, avec la catégorie estimée', () => {
    const [entry] = buildFoodReference([{ name: 'Sucre blanc' }], now).foods;
    expect(entry.needsReview).toBe(true);
    expect(entry.category).toBe('pro'); // via classifyFood (dictionnaire)
    expect(entry.fodmapLevel).toBe('unknown');
    expect(entry.sibo.verdict).toBe('inconnu');
    expect(entry.fodmaps).toEqual({
      fructose: 'unknown',
      lactose: 'unknown',
      fructans: 'unknown',
      gos: 'unknown',
      polyols: 'unknown',
    });
  });

  it('omet safePortion/summary/tips quand la fiche ne les fournit pas', () => {
    const lean: FoodInsight = { ...insight, safePortion: undefined, summary: '', tips: [] };
    const [entry] = buildFoodReference([{ name: 'Kaki', insight: lean }], now).foods;
    expect(entry.safePortion).toBeUndefined();
    expect(entry.summary).toBeUndefined();
    expect(entry.tips).toBeUndefined();
  });

  it('ajoute le profil amines via le dictionnaire pour un stub connu', () => {
    const [entry] = buildFoodReference([{ name: 'Roquefort' }], now).foods;
    expect(entry.amines?.level).toBe('high');
    expect(entry.amines?.group).toBe('fromage');
  });

  it('exporte les amines au schéma public (détail par amine + noms explicites)', () => {
    const [entry] = buildFoodReference([{ name: 'Roquefort' }], now).foods;
    // Détail par amine présent
    expect(entry.amines?.histamine).toBe('high');
    expect(entry.amines?.tyramine).toBe('high');
    expect(entry.amines?.fermented).toBe(true);
  });

  it('traduit liberator/daoBlocker vers histamineLiberator/daoInhibitor', () => {
    // "vin rouge" : daoBlocker interne → daoInhibitor à l'export ; pas de flag interne resté brut
    const [entry] = buildFoodReference([{ name: 'Vin rouge' }], now).foods;
    const a = entry.amines as unknown as Record<string, unknown>;
    expect(a.daoInhibitor).toBe(true);
    expect(a.daoBlocker).toBeUndefined(); // le nom interne ne fuit pas
    // Chocolat = histamino-libérateur
    const [choc] = buildFoodReference([{ name: 'Chocolat' }], now).foods;
    const ca = choc.amines as unknown as Record<string, unknown>;
    expect(ca.histamineLiberator).toBe(true);
    expect(ca.liberator).toBeUndefined();
  });

  it('exporte le profil amines des légumineuses ajoutées au dictionnaire', () => {
    const [lentilles] = buildFoodReference([{ name: 'Lentilles corail' }], now).foods;
    expect(lentilles.amines?.level).toBe('low');
    expect(lentilles.amines?.putrescineCadaverine).toBe('low');
    const [feves] = buildFoodReference([{ name: 'Fèves' }], now).foods;
    expect(feves.amines?.level).toBe('moderate');
    expect(feves.amines?.tyramine).toBe('moderate');
  });

  it('n’ajoute pas d’amines pour un aliment inconnu du dictionnaire', () => {
    const [entry] = buildFoodReference([{ name: 'Aliment martien' }], now).foods;
    expect(entry.amines).toBeUndefined();
  });

  it('trie les aliments par nom (fr)', () => {
    const foods: CatalogueFood[] = [{ name: 'Banane' }, { name: 'Abricot' }, { name: 'Carotte' }];
    const names = buildFoodReference(foods, now).foods.map((f) => f.name);
    expect(names).toEqual(['Abricot', 'Banane', 'Carotte']);
  });
});
