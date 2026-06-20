import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay } from './factory';
import { contextCorrelations } from './contextCorrelations';

let n = 0;
function mkDay(patch: Partial<DayEntry>, symptoms: Partial<Record<SymptomKey, Intensity>> = {}): DayEntry {
  const d = emptyDay(`2026-04-${String(++n).padStart(2, '0')}`);
  // un repas pour que le jour soit « renseigné »
  d.meals = [{ id: `m${n}`, time: '12:00', foods: [{ id: `f${n}`, name: 'Riz', category: 'neutral' }] }];
  d.symptoms = { ...d.symptoms, ...symptoms };
  return { ...d, ...patch };
}

describe('contextCorrelations', () => {
  it('exige un minimum de jours', () => {
    const r = contextCorrelations([mkDay({ stress: 'severe' }, { gaz: 'severe' })]);
    expect(r.enoughData).toBe(false);
  });

  it('repère le stress comme facteur quand les symptômes suivent', () => {
    const days: DayEntry[] = [
      mkDay({ stress: 'severe' }, { ballonnements: 'severe' }),
      mkDay({ stress: 'modere' }, { gaz: 'modere' }),
      mkDay({ stress: 'severe' }, { douleurs_abdo: 'severe' }),
      mkDay({ stress: 'absent' }),
      mkDay({ stress: 'absent' }),
      mkDay({ stress: 'leger' }),
    ];
    const r = contextCorrelations(days);
    expect(r.enoughData).toBe(true);
    const stress = r.links.find((l) => l.factor === 'stress');
    expect(stress).toBeTruthy();
    expect(stress!.daysWith).toBe(3); // stress modéré+ sur 3 jours
    expect(stress!.rateWith).toBe(1);
    expect(stress!.rateWithout).toBe(0);
  });

  it('ignore un facteur jamais renseigné (pas de sommeil saisi)', () => {
    const days: DayEntry[] = [
      mkDay({ stress: 'severe' }, { gaz: 'severe' }),
      mkDay({ stress: 'severe' }, { gaz: 'severe' }),
      mkDay({ stress: 'severe' }, { gaz: 'severe' }),
      mkDay({ stress: 'absent' }),
      mkDay({ stress: 'absent' }),
    ];
    const r = contextCorrelations(days);
    expect(r.links.some((l) => l.factor === 'sommeil')).toBe(false);
    expect(r.links.some((l) => l.factor === 'regles')).toBe(false);
  });

  it('repère le manque de sommeil', () => {
    const days: DayEntry[] = [
      mkDay({ sleepH: 4.5 }, { fatigue_apres_repas: 'severe' }),
      mkDay({ sleepH: 5 }, { ballonnements: 'modere' }),
      mkDay({ sleepH: 5.5 }, { gaz: 'severe' }),
      mkDay({ sleepH: 8 }),
      mkDay({ sleepH: 7.5 }),
      mkDay({ sleepH: 8 }),
    ];
    const r = contextCorrelations(days);
    const sleep = r.links.find((l) => l.factor === 'sommeil');
    expect(sleep).toBeTruthy();
    expect(sleep!.daysWith).toBe(3);
  });
});
