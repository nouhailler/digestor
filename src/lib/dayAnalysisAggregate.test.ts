import { describe, expect, it } from 'vitest';
import type { DayAnalysis, DayImprovement } from '../types';
import { aggregateImprovements, aggregateTriggers } from './dayAnalysisAggregate';

function analysis(date: string, likelyTriggers: string[], improvements: DayImprovement[] = []): DayAnalysis {
  return {
    date,
    verdict: 'attention',
    summary: '',
    likelyTriggers,
    improvements,
    model: 'test',
    updatedAt: '2025-06-09T12:00:00Z',
  };
}

describe('aggregateTriggers', () => {
  it('regroupe les variantes d’un même déclencheur (accents, casse, parenthèses)', () => {
    const out = aggregateTriggers([
      analysis('2025-06-09', ['Pain blanc (fructanes)']),
      analysis('2025-06-10', ['pain blanc']),
      analysis('2025-06-11', ['Café']),
    ]);
    expect(out).toHaveLength(2);
    expect(out[0].count).toBe(2); // pain blanc cité 2 jours, en tête
    expect(out[0].label.toLowerCase()).toContain('pain blanc');
    expect(out[0].dates).toEqual(['2025-06-09', '2025-06-10']);
    expect(out[1]).toMatchObject({ label: 'Café', count: 1 });
  });

  it('garde la variante la plus citée comme libellé représentatif', () => {
    const out = aggregateTriggers([
      analysis('2025-06-09', ['oignon cru']),
      analysis('2025-06-10', ['oignon cru']),
      analysis('2025-06-11', ['Oignon cru (fructanes, GOS)']),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].label).toBe('oignon cru');
    expect(out[0].count).toBe(3);
  });

  it('ne fusionne pas deux aliments différents', () => {
    const out = aggregateTriggers([
      analysis('2025-06-09', ['pomme crue', 'lait de vache']),
      analysis('2025-06-10', ['pomme cuite au four avec du miel']),
    ]);
    // « pomme crue » et « pomme cuite au four… » ne partagent que « pomme » →
    // Jaccard < 0,6 et pas d'inclusion : deux groupes distincts.
    expect(out.map((t) => t.label).sort()).toHaveLength(3);
  });

  it('compte chaque journée une seule fois même si le déclencheur y est répété', () => {
    const out = aggregateTriggers([analysis('2025-06-09', ['café', 'café'])]);
    expect(out).toHaveLength(1);
    expect(out[0].count).toBe(1);
  });

  it('liste vide → liste vide', () => {
    expect(aggregateTriggers([])).toEqual([]);
    expect(aggregateTriggers([analysis('2025-06-09', [])])).toEqual([]);
  });
});

describe('aggregateImprovements', () => {
  it('regroupe les pistes reformulées et conserve une justification', () => {
    const out = aggregateImprovements([
      analysis('2025-06-09', [], [
        { action: 'Remplacer le pain blanc par du pain sans gluten', why: 'Réduit les fructanes.' },
      ]),
      analysis('2025-06-10', [], [
        { action: 'Remplacer le pain blanc par un pain sans gluten', why: 'Moins de fructanes fermentescibles.' },
        { action: 'Boire plus d’eau entre les repas', why: 'Aide le transit.' },
      ]),
    ]);
    expect(out).toHaveLength(2);
    expect(out[0].count).toBe(2);
    expect(out[0].label.toLowerCase()).toContain('pain sans gluten');
    expect(out[0].why).toBeTruthy();
    expect(out[1]).toMatchObject({ count: 1, why: 'Aide le transit.' });
  });

  it('tolère l’ancien format en cache (simple chaîne, sans why)', () => {
    const legacy = ['Éviter le café à jeun'] as unknown as DayImprovement[];
    const out = aggregateImprovements([analysis('2025-06-09', [], legacy)]);
    expect(out).toHaveLength(1);
    expect(out[0].label).toBe('Éviter le café à jeun');
    expect(out[0].why).toBeUndefined();
  });

  it('trie par nombre de journées décroissant', () => {
    const out = aggregateImprovements([
      analysis('2025-06-09', [], [{ action: 'Fractionner les repas', why: '' }]),
      analysis('2025-06-10', [], [
        { action: 'Fractionner les repas', why: '' },
        { action: 'Marcher après le dîner', why: '' },
      ]),
    ]);
    expect(out[0].label).toBe('Fractionner les repas');
    expect(out[0].count).toBe(2);
  });
});
