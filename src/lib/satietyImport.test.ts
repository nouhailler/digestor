import { describe, expect, it } from 'vitest';
import type { DayEntry } from '../types';
import { emptyDay, makeMeal } from './factory';
import {
  applySatietyToDay,
  countSatietyImport,
  parseSatietyImport,
  resolveCheckpoint,
  resolveSatietyType,
} from './satietyImport';

describe('resolveCheckpoint / resolveSatietyType', () => {
  it('résout les synonymes de checkpoint', () => {
    expect(resolveCheckpoint('immédiat')).toBe('immediate');
    expect(resolveCheckpoint('+1h')).toBe('1h');
    expect(resolveCheckpoint('2 h')).toBe('2h');
    expect(resolveCheckpoint('inconnu')).toBeNull();
  });

  it('résout les synonymes de type', () => {
    expect(resolveSatietyType('légère')).toBe('legere');
    expect(resolveSatietyType('Lourd')).toBe('lourde');
    expect(resolveSatietyType('ballonnements')).toBe('ballonnement');
    expect(resolveSatietyType('autre')).toBeNull();
  });
});

describe('parseSatietyImport', () => {
  it('parse un set complet et borne les VAS', () => {
    const { sets, warnings } = parseSatietyImport(
      JSON.stringify({
        app: 'digestor',
        type: 'satiety',
        date: '2026-06-30',
        sets: [
          {
            mealTime: '12:30',
            checks: [
              { checkpoint: 'immediate', hungerIntensity: 10, energyLevel: 70, sugarCraving: 5, satietyType: 'lourde' },
              { checkpoint: '2h', hungerIntensity: 150, energyLevel: 40, sugarCraving: 80 },
            ],
          },
        ],
      }),
    );
    expect(warnings).toHaveLength(0);
    expect(sets).toHaveLength(1);
    expect(sets[0].mealTime).toBe('12:30');
    expect(sets[0].checks[0].satietyType).toBe('lourde');
    expect(sets[0].checks[1].hungerIntensity).toBe(100); // borné
  });

  it('accepte un relevé unique (sans clé sets)', () => {
    const { sets } = parseSatietyImport(
      JSON.stringify({ mealTime: '08:00', checks: [{ checkpoint: '1h', hungerIntensity: 30 }] }),
      '2026-06-30',
    );
    expect(sets).toHaveLength(1);
    expect(sets[0].date).toBe('2026-06-30'); // date de repli
    expect(sets[0].checks[0].energyLevel).toBe(50); // valeur neutre par défaut
  });

  it('avertit et ignore un checkpoint inconnu', () => {
    const { sets, warnings } = parseSatietyImport(
      JSON.stringify({ checks: [{ checkpoint: 'plus tard', hungerIntensity: 50 }, { checkpoint: '1h', hungerIntensity: 50 }] }),
    );
    expect(sets[0].checks).toHaveLength(1);
    expect(warnings.some((w) => w.includes('Checkpoint inconnu'))).toBe(true);
  });

  it('rejette un JSON d’une autre app', () => {
    expect(() => parseSatietyImport(JSON.stringify({ app: 'autre', sets: [] }))).toThrow();
  });

  it('rejette un texte sans relevé', () => {
    expect(() => parseSatietyImport(JSON.stringify({ app: 'digestor' }))).toThrow();
  });
});

describe('applySatietyToDay', () => {
  const baseDay = (): DayEntry => ({
    ...emptyDay('2026-06-30'),
    meals: [makeMeal('08:00', ['œufs']), makeMeal('12:30', ['riz'])],
  });

  it('rattache au repas d’heure exacte', () => {
    const { day, warning } = applySatietyToDay(baseDay(), {
      mealTime: '12:30',
      checks: [{ checkpoint: 'immediate', hungerIntensity: 10, energyLevel: 60, sugarCraving: 5 }],
    });
    expect(warning).toBeUndefined();
    expect(day.meals[0].satiety).toBeUndefined();
    expect(day.meals[1].satiety).toHaveLength(1);
  });

  it('rattache au repas le plus proche si pas d’heure exacte (avec avertissement)', () => {
    const { day, warning } = applySatietyToDay(baseDay(), {
      mealTime: '13:00',
      checks: [{ checkpoint: '1h', hungerIntensity: 40, energyLevel: 50, sugarCraving: 50 }],
    });
    expect(warning).toContain('12:30');
    expect(day.meals[1].satiety).toHaveLength(1);
  });

  it('rattache au dernier repas si aucune heure fournie', () => {
    const { day, warning } = applySatietyToDay(baseDay(), {
      checks: [{ checkpoint: '1h', hungerIntensity: 40, energyLevel: 50, sugarCraving: 50 }],
    });
    expect(warning).toContain('12:30');
    expect(day.meals[1].satiety).toHaveLength(1);
  });

  it('fusionne sans dupliquer le même checkpoint', () => {
    let day = baseDay();
    ({ day } = applySatietyToDay(day, {
      mealTime: '12:30',
      checks: [{ checkpoint: 'immediate', hungerIntensity: 10, energyLevel: 60, sugarCraving: 5 }],
    }));
    ({ day } = applySatietyToDay(day, {
      mealTime: '12:30',
      checks: [{ checkpoint: 'immediate', hungerIntensity: 90, energyLevel: 30, sugarCraving: 50 }],
    }));
    expect(day.meals[1].satiety).toHaveLength(1);
    expect(day.meals[1].satiety![0].hungerIntensity).toBe(90);
  });

  it('avertit si la journée n’a aucun repas', () => {
    const { warning } = applySatietyToDay(emptyDay('2026-06-30'), {
      mealTime: '12:30',
      checks: [{ checkpoint: 'immediate', hungerIntensity: 10, energyLevel: 60, sugarCraving: 5 }],
    });
    expect(warning).toContain('Aucun repas');
  });
});

describe('countSatietyImport', () => {
  it('compte les sets et relevés', () => {
    const parsed = parseSatietyImport(
      JSON.stringify({
        sets: [
          { mealTime: '08:00', checks: [{ checkpoint: 'immediate', hungerIntensity: 10 }] },
          { mealTime: '12:30', checks: [{ checkpoint: '1h', hungerIntensity: 20 }, { checkpoint: '2h', hungerIntensity: 30 }] },
        ],
      }),
    );
    expect(countSatietyImport(parsed)).toEqual({ sets: 2, checks: 3 });
  });
});
