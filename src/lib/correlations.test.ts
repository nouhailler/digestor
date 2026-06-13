import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay, emptySymptoms, makeMeal } from './factory';
import { detectCorrelations } from './correlations';

function day(
  date: string,
  foods: string[],
  symptoms: Partial<Record<SymptomKey, Intensity>> = {},
  time = '12:30',
): DayEntry {
  return {
    ...emptyDay(date),
    meals: [makeMeal(time, foods)],
    symptoms: { ...emptySymptoms(), ...symptoms },
  };
}

describe('detectCorrelations', () => {
  it('ne conclut rien sous le seuil d’échantillon (< 3 jours actifs)', () => {
    const days = [
      day('2025-06-09', ['vin blanc', 'biscuits sucrés'], { ballonnements: 'severe' }),
      day('2025-06-10', ['vin blanc', 'confiture'], { ballonnements: 'severe' }),
    ];
    expect(detectCorrelations(days)).toEqual([]);
  });

  it('ignore les jours sans aucun aliment', () => {
    const days = [emptyDay('2025-06-09'), emptyDay('2025-06-10'), emptyDay('2025-06-11')];
    expect(detectCorrelations(days)).toEqual([]);
  });

  it('détecte « sucre + alcool → ballonnements sévères » (défavorable)', () => {
    const days = [
      day('2025-06-09', ['vin blanc', 'biscuits sucrés'], { ballonnements: 'severe' }),
      day('2025-06-10', ['vin rouge', 'confiture'], { ballonnements: 'severe' }),
      day('2025-06-11', ['brocoli vapeur'], { ballonnements: 'absent' }),
    ];
    const found = detectCorrelations(days);
    const sa = found.find((c) => c.text.includes('Sucre + alcool'));
    expect(sa).toBeDefined();
    expect(sa!.level).toBe('defavorable');
  });

  it('détecte « ail + gingembre → digestion plus confortable » (favorable)', () => {
    const days = [
      day('2025-06-09', ['ail', 'tisane de gingembre', 'poulet rôti'], { ballonnements: 'absent' }),
      day('2025-06-10', ['ail', 'gingembre', 'brocoli vapeur'], { ballonnements: 'leger' }),
      day('2025-06-11', ['ail', 'gingembre', 'saumon grillé'], { ballonnements: 'absent' }),
    ];
    const found = detectCorrelations(days);
    const ag = found.find((c) => c.text.includes('Ail + gingembre'));
    expect(ag).toBeDefined();
    expect(ag!.level).toBe('favorable');
  });
});
