import { describe, expect, it } from 'vitest';
import type { FoodInsight } from '../../types';
import { describeDay, toDayAnalysis } from './dayAnalysis';
import { emptyDay, emptySymptoms, makeMeal } from '../factory';
import { normalize } from '../foodClassifier';

describe('describeDay', () => {
  const day = {
    ...emptyDay('2025-06-09'),
    meals: [makeMeal('12:30', ['pain blanc', 'brocoli'])],
    symptoms: { ...emptySymptoms(), ballonnements: 'severe' as const },
    notes: 'ventre gonflé',
    hydrationL: 1.2,
  };

  it('inclut date, repas (avec catégorie), symptômes non absents et notes', () => {
    const text = describeDay(day);
    expect(text).toContain('2025-06-09');
    expect(text).toContain('12:30');
    expect(text).toContain('pain blanc (pro)');
    expect(text).toContain('Ballonnements (sévère)');
    expect(text).toContain('ventre gonflé');
    expect(text).toContain('1.2 L');
  });

  it('n’inclut pas les symptômes absents', () => {
    expect(describeDay(emptyDay('2025-06-09'))).toContain('Symptômes : aucun');
  });

  it('enrichit un aliment avec son analyse IA quand elle existe', () => {
    const insight: FoodInsight = {
      key: normalize('pain blanc'),
      name: 'Pain blanc',
      category: 'pro',
      fodmapLevel: 'high',
      fodmaps: { fructose: 'low', lactose: 'low', fructans: 'high', gos: 'low', polyols: 'low' },
      sibo: { verdict: 'eviter', note: '' },
      candida: { verdict: 'attention', note: '' },
      summary: '',
      tips: [],
      model: 'm',
      updatedAt: '2025-06-09T00:00:00.000Z',
    };
    const text = describeDay(day, new Map([[insight.key, insight]]));
    expect(text).toContain('pain blanc (FODMAP élevé, SIBO à éviter, candida à surveiller)');
    // brocoli n'a pas d'analyse → on garde sa catégorie, sans repère FODMAP.
    expect(text).toContain('brocoli (');
    expect(text).not.toMatch(/brocoli \(FODMAP/);
  });

  it('préfixe la quantité d’un aliment quand elle est précisée', () => {
    const withQty = {
      ...emptyDay('2025-06-09'),
      meals: [
        {
          id: 'm1',
          time: '08:00',
          foods: [{ id: 'f1', name: 'confiture', category: 'pro' as const, quantity: { amount: 1, unit: 'cac' as const } }],
        },
      ],
    };
    expect(describeDay(withQty)).toContain('1 càc confiture (pro)');
  });
});

describe('toDayAnalysis', () => {
  it('valide et coerce une réponse correcte', () => {
    const a = toDayAnalysis(
      {
        verdict: 'attention',
        summary: 'Journée moyenne.',
        likelyTriggers: ['pain blanc', '', 'vin'],
        improvements: [{ action: 'plus de légumes', why: 'apport de fibres bien tolérées' }],
      },
      '2025-06-09',
      'modele/x:free',
    );
    expect(a.verdict).toBe('attention');
    expect(a.date).toBe('2025-06-09');
    expect(a.likelyTriggers).toEqual(['pain blanc', 'vin']); // chaîne vide filtrée
    expect(a.improvements).toEqual([{ action: 'plus de légumes', why: 'apport de fibres bien tolérées' }]);
    expect(a.model).toBe('modele/x:free');
  });

  it('tolère une piste fournie en simple chaîne (why vide)', () => {
    const a = toDayAnalysis({ improvements: ['boire plus d’eau', '', { action: 'fractionner', why: '' }] }, '2025-06-09', 'm');
    expect(a.improvements).toEqual([
      { action: 'boire plus d’eau', why: '' },
      { action: 'fractionner', why: '' },
    ]);
  });

  it('retombe sur des valeurs sûres si la réponse est incohérente', () => {
    const a = toDayAnalysis({ verdict: 'n’importe quoi', summary: 42, likelyTriggers: 'x' }, '2025-06-09', 'm');
    expect(a.verdict).toBe('inconnu');
    expect(a.summary).toBe('');
    expect(a.likelyTriggers).toEqual([]);
    expect(a.improvements).toEqual([]);
  });
});
