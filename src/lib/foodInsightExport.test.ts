import { describe, expect, it } from 'vitest';
import type { FoodInsight } from '../types';
import { foodInsightFilename, formatFoodInsight } from './foodInsightExport';

const base: FoodInsight = {
  key: 'dessert au soja',
  name: 'Dessert au soja',
  category: 'beneficial',
  fodmapLevel: 'low',
  fodmaps: { fructose: 'low', lactose: 'low', fructans: 'low', gos: 'moderate', polyols: 'low' },
  sibo: { verdict: 'favorable', note: 'Sans lactose, bien toléré.' },
  candida: { verdict: 'favorable', note: 'Peu sucré.' },
  amines: {
    level: 'low',
    putrescineCadaverine: 'low',
    note: 'Amines faibles.',
  },
  safePortion: '1 pot (100 g)',
  summary: 'Alternative végétale sans lactose, plutôt bien tolérée.',
  tips: ['Choisir une version non sucrée.'],
  model: 'test/model',
  updatedAt: '2026-07-09T10:00:00.000Z',
};

describe('formatFoodInsight', () => {
  it('met en tête le nom et une accroche personnelle selon la catégorie', () => {
    const txt = formatFoodInsight(base);
    expect(txt.startsWith('Dessert au soja — Digestor\nCet aliment m’est favorable.')).toBe(true);
    expect(formatFoodInsight({ ...base, category: 'pro' })).toContain('à limiter pour moi');
    expect(formatFoodInsight({ ...base, category: 'neutral' })).toContain('plutôt neutre');
  });

  it('inclut les badges, le résumé, le détail FODMAP et les notes', () => {
    const txt = formatFoodInsight(base);
    expect(txt).toContain('FODMAP : Bas · SIBO : Favorable · Candidose : Favorable · Amines : Faible');
    expect(txt).toContain('Alternative végétale sans lactose');
    expect(txt).toContain('- GOS (galactanes) : Modéré');
    expect(txt).toContain('SIBO — Favorable : Sans lactose, bien toléré.');
    expect(txt).toContain('Candidose — Favorable : Peu sucré.');
    expect(txt).toContain('Portion généralement tolérée : 1 pot (100 g)');
    expect(txt).toContain('Conseils');
    expect(txt).toContain('- Choisir une version non sucrée.');
    expect(txt).toContain('Analyse par test/model. Repère indicatif, non médical.');
  });

  it('détaille les amines : niveau, mécanismes et consommation tolérée', () => {
    const txt = formatFoodInsight({
      ...base,
      amines: {
        level: 'moderate',
        tyramine: 'moderate',
        liberator: true,
        fermented: true,
        note: 'Fèves : source de tyramine.',
      },
    });
    expect(txt).toContain('Amines biogènes : Modéré');
    expect(txt).toContain('- Tyramine : modéré');
    expect(txt).toContain('Mécanismes : histamino-libérateur · fermenté / affiné.');
    expect(txt).toContain('Consommation :');
    expect(txt).toContain('Fèves : source de tyramine.');
  });

  it('omet la section amines quand la fiche n’en a pas', () => {
    const txt = formatFoodInsight({ ...base, amines: undefined });
    expect(txt).not.toContain('Amines');
  });

  it('produit un nom de fichier sans espaces', () => {
    expect(foodInsightFilename(base)).toBe('digestor-aliment-dessert-au-soja.txt');
  });
});
