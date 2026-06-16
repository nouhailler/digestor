import { describe, expect, it } from 'vitest';
import { describeDay, toDayAnalysis } from './dayAnalysis';
import { emptyDay, emptySymptoms, makeMeal } from '../factory';

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
