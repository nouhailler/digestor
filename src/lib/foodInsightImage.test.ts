import { describe, expect, it } from 'vitest';
import type { FoodInsight } from '../types';
import { buildShareCardModel } from './foodInsightImage';

const base: FoodInsight = {
  key: 'dessert au soja',
  name: 'Dessert au soja',
  category: 'beneficial',
  fodmapLevel: 'low',
  fodmaps: { fructose: 'low', lactose: 'low', fructans: 'low', gos: 'moderate', polyols: 'low' },
  sibo: { verdict: 'favorable', note: '' },
  candida: { verdict: 'favorable', note: '' },
  amines: { level: 'low', putrescineCadaverine: 'low' },
  safePortion: '1 pot (100 g)',
  summary: 'Alternative végétale sans lactose.',
  tips: ['a', 'b', 'c', 'd', 'e', 'f'],
  model: 'test/model',
  updatedAt: '2026-07-09T10:00:00.000Z',
};

describe('buildShareCardModel', () => {
  it('titre, accroche et couleur d’accent selon la catégorie', () => {
    expect(buildShareCardModel(base)).toMatchObject({
      title: 'Dessert au soja',
      lead: 'Cet aliment m’est favorable.',
      accent: '#5fbf6f', // vert (beneficial)
    });
    expect(buildShareCardModel({ ...base, category: 'pro' })).toMatchObject({
      lead: 'Cet aliment est à limiter pour moi.',
      accent: '#f0606a', // rouge (pro)
    });
    expect(buildShareCardModel({ ...base, category: 'neutral' }).accent).toBe('#8a8a8e');
  });

  it('badges FODMAP/SIBO/candidose colorés + amines si présentes', () => {
    const m = buildShareCardModel(base);
    expect(m.badges.map((b) => b.label)).toEqual([
      'FODMAP : Bas',
      'SIBO : Favorable',
      'Candidose : Favorable',
      'Amines : Faible',
    ]);
    expect(m.badges[0].color).toBe('#5fbf6f'); // FODMAP bas → vert
    // sans amines : pas de 4e badge
    expect(buildShareCardModel({ ...base, amines: undefined }).badges).toHaveLength(3);
  });

  it('condense les amines (niveau + mécanismes) et omet la ligne sans profil', () => {
    const m = buildShareCardModel({
      ...base,
      amines: { level: 'moderate', tyramine: 'moderate', liberator: true, fermented: true },
    });
    expect(m.amineLine).toBe('Amines modéré — histamino-libérateur · fermenté / affiné');
    expect(buildShareCardModel({ ...base, amines: undefined }).amineLine).toBe('');
  });

  it('portion tolérée et conseils plafonnés à 4', () => {
    const m = buildShareCardModel(base);
    expect(m.portion).toBe('Portion tolérée : 1 pot (100 g)');
    expect(m.tips).toEqual(['a', 'b', 'c', 'd']);
    expect(buildShareCardModel({ ...base, safePortion: undefined }).portion).toBe('');
  });
});
