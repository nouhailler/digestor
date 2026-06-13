import { describe, expect, it } from 'vitest';
import type { Intensity, SymptomKey } from '../types';
import { emptyDay, emptySymptoms, makeMeal } from './factory';
import { dayseverityScore, suggestDayQuality, suggestQuality } from './quality';

function sym(overrides: Partial<Record<SymptomKey, Intensity>>): Record<SymptomKey, Intensity> {
  return { ...emptySymptoms(), ...overrides };
}

describe('suggestQuality (barème cumul vert → orange → rouge)', () => {
  it('aucun symptôme ⇒ bonne (vert)', () => {
    expect(suggestQuality(emptySymptoms())).toBe('bonne');
  });

  it('au plus 1 symptôme léger ⇒ bonne', () => {
    expect(suggestQuality(sym({ ballonnements: 'leger' }))).toBe('bonne');
  });

  it('1 modéré ou 1 sévère isolé ⇒ correcte (orange)', () => {
    expect(suggestQuality(sym({ ballonnements: 'modere' }))).toBe('correcte');
    expect(suggestQuality(sym({ ballonnements: 'severe' }))).toBe('correcte');
  });

  it('3 symptômes cumulés ⇒ correcte (orange)', () => {
    expect(
      suggestQuality(sym({ ballonnements: 'modere', gaz: 'leger', fatigue_apres_repas: 'leger' })),
    ).toBe('correcte');
  });

  it('≥ 4 symptômes cumulés ⇒ difficile (rouge)', () => {
    expect(
      suggestQuality(
        sym({ ballonnements: 'leger', gaz: 'leger', reflux: 'leger', nausees: 'leger' }),
      ),
    ).toBe('difficile');
  });

  it('≥ 2 sévères ⇒ difficile (rouge)', () => {
    expect(suggestQuality(sym({ ballonnements: 'severe', gaz: 'severe' }))).toBe('difficile');
  });
});

describe('suggestDayQuality — cumule les symptômes par repas', () => {
  it('agrège les symptômes de plusieurs repas pour le badge', () => {
    const day = {
      ...emptyDay('2025-06-09'),
      meals: [
        { ...makeMeal('08:00', ['café']), symptoms: sym({ ballonnements: 'modere' }) },
        { ...makeMeal('12:30', ['pâtes']), symptoms: sym({ gaz: 'leger', fatigue_apres_repas: 'leger' }) },
      ],
    };
    // 3 symptômes cumulés sur la journée ⇒ correcte
    expect(suggestDayQuality(day)).toBe('correcte');
  });
});

describe('dayseverityScore', () => {
  it('somme pondérée des intensités effectives (jour + repas)', () => {
    const day = {
      ...emptyDay('2025-06-09'),
      symptoms: sym({ diarrhee: 'leger' }),
      meals: [{ ...makeMeal('19:00', ['riz']), symptoms: sym({ ballonnements: 'severe', gaz: 'modere' }) }],
    };
    expect(dayseverityScore(day)).toBe(3 + 2 + 1);
  });

  it('vaut 0 pour un jour sans symptôme', () => {
    expect(dayseverityScore(emptyDay('2025-06-09'))).toBe(0);
  });
});
