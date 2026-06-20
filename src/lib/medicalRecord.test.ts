import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay } from './factory';
import { buildMedicalRecord } from './medicalRecord';

function day(date: string, patch: Partial<DayEntry>): DayEntry {
  return { ...emptyDay(date), ...patch };
}

function sym(partial: Partial<Record<SymptomKey, Intensity>>): Record<SymptomKey, Intensity> {
  return { ...emptyDay('x').symptoms, ...partial };
}

describe('buildMedicalRecord', () => {
  const days: DayEntry[] = [
    day('2026-06-10', {
      meals: [
        { id: 'm1', time: '08:00', foods: [{ id: 'f1', name: 'Café', category: 'neutral' }] },
        {
          id: 'm2',
          time: '12:30',
          foods: [{ id: 'f2', name: 'Sucre', category: 'pro' }],
          symptoms: sym({ ballonnements: 'severe' }),
        },
      ],
      symptoms: sym({ gaz: 'leger' }),
      hydrationL: 1.5,
      stool: { bristol: 6 },
    }),
    day('2026-06-12', {
      meals: [{ id: 'm3', time: '13:00', foods: [{ id: 'f3', name: 'café', category: 'neutral' }] }],
      symptoms: sym({ ballonnements: 'modere' }),
      hydrationL: 2.5,
      stool: { bristol: 4 },
    }),
    // jour vide : ignoré (pas renseigné)
    day('2026-06-13', {}),
  ];

  const rec = buildMedicalRecord(days, { patientName: 'Test' });

  it('ne compte que les jours renseignés, sur la bonne période', () => {
    expect(rec.period.recordedDays).toBe(2);
    expect(rec.period.daysWithMeals).toBe(2);
    expect(rec.period.from).toBe('2026-06-10');
    expect(rec.period.to).toBe('2026-06-12');
    expect(rec.period.spanDays).toBe(3); // 10, 11, 12 inclus
  });

  it('agrège les symptômes (max jour + repas), triés par poids', () => {
    const ballon = rec.symptomStats.find((s) => s.key === 'ballonnements')!;
    expect(ballon.daysPresent).toBe(2);
    expect(ballon.daysSevere).toBe(1);
    expect(ballon.maxIntensity).toBe('severe');
    // ballonnements (3+2=5) doit précéder gaz (1)
    expect(rec.symptomStats[0].key).toBe('ballonnements');
    expect(rec.symptomStats.some((s) => s.key === 'gaz')).toBe(true);
    // un symptôme absent n'apparaît pas
    expect(rec.symptomStats.some((s) => s.key === 'nausees')).toBe(false);
  });

  it('compte les aliments par forme normalisée et repère les défavorables', () => {
    const cafe = rec.topFoods.find((f) => f.name.toLowerCase() === 'café')!;
    expect(cafe.count).toBe(2); // « Café » + « café » fusionnés
    expect(rec.proFoods.map((f) => f.name)).toContain('Sucre');
  });

  it('synthétise transit & hydratation', () => {
    expect(rec.avgHydrationL).toBeCloseTo(2.0);
    expect(rec.stoolDays).toBe(2);
    expect(rec.bristol).toEqual([
      { type: 4, label: expect.stringContaining('type 4'), count: 1 },
      { type: 6, label: expect.stringContaining('type 6'), count: 1 },
    ]);
  });

  it('détaille les jours dans l’ordre chronologique avec les symptômes par repas', () => {
    expect(rec.days.map((d) => d.date)).toEqual(['2026-06-10', '2026-06-12']);
    const lunch = rec.days[0].meals.find((m) => m.time === '12:30')!;
    expect(lunch.symptoms.map((s) => s.key)).toEqual(['ballonnements']);
    expect(rec.days[0].generalSymptoms.map((s) => s.key)).toEqual(['gaz']);
  });

  it('gère l’absence totale de données', () => {
    const empty = buildMedicalRecord([], undefined);
    expect(empty.period.recordedDays).toBe(0);
    expect(empty.period.from).toBeUndefined();
    expect(empty.symptomStats).toEqual([]);
    expect(empty.profile.patientName).toBe('exemple');
  });
});
