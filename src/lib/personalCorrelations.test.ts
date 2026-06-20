import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay } from './factory';
import { personalCorrelations } from './personalCorrelations';

let n = 0;
function mkDay(foods: string[], symptoms: Partial<Record<SymptomKey, Intensity>> = {}): DayEntry {
  const d = emptyDay(`2026-05-${String(++n).padStart(2, '0')}`);
  d.meals = [{ id: `m${n}`, time: '12:00', foods: foods.map((name, i) => ({ id: `f${n}-${i}`, name, category: 'neutral' })) }];
  d.symptoms = { ...d.symptoms, ...symptoms };
  return d;
}

describe('personalCorrelations', () => {
  it('exige un minimum de jours renseignés', () => {
    const r = personalCorrelations([mkDay(['Pomme']), mkDay(['Pomme'])]);
    expect(r.enoughData).toBe(false);
    expect(r.triggers).toEqual([]);
  });

  it('repère un déclencheur quand le symptôme suit nettement l’aliment', () => {
    // « Oignon » → ballonnements à chaque fois ; jours sans oignon : aucun ballonnement.
    const days: DayEntry[] = [
      mkDay(['Oignon', 'Riz'], { ballonnements: 'severe' }),
      mkDay(['Oignon', 'Poulet'], { ballonnements: 'modere' }),
      mkDay(['Oignon', 'Carotte'], { ballonnements: 'severe' }),
      mkDay(['Riz', 'Poulet']),
      mkDay(['Carotte', 'Poulet']),
      mkDay(['Riz', 'Carotte']),
    ];
    const r = personalCorrelations(days);
    expect(r.enoughData).toBe(true);
    const link = r.triggers.find((t) => t.food === 'Oignon' && t.symptom === 'ballonnements');
    expect(link).toBeTruthy();
    expect(link!.daysWithFood).toBe(3);
    expect(link!.rateWith).toBe(1);
    expect(link!.rateWithout).toBe(0);
    expect(link!.lift).toBe(1);
  });

  it('ne conclut pas pour un aliment trop rare', () => {
    const days: DayEntry[] = [
      mkDay(['Ail'], { gaz: 'severe' }), // 1 seule fois → sous le seuil minFoodDays
      mkDay(['Riz']),
      mkDay(['Poulet']),
      mkDay(['Carotte']),
      mkDay(['Pomme']),
    ];
    const r = personalCorrelations(days);
    expect(r.triggers.some((t) => t.food === 'Ail')).toBe(false);
  });

  it('liste les aliments fréquents bien tolérés', () => {
    // « Carotte » mangée souvent, jamais de symptôme ; d'autres jours ont des symptômes.
    const days: DayEntry[] = [
      mkDay(['Carotte', 'Riz']),
      mkDay(['Carotte', 'Poulet']),
      mkDay(['Carotte', 'Courgette']),
      mkDay(['Pain blanc'], { ballonnements: 'severe' }),
      mkDay(['Sucre'], { gaz: 'modere' }),
      mkDay(['Bonbon'], { ballonnements: 'modere' }),
    ];
    const r = personalCorrelations(days);
    expect(r.safeFoods.some((f) => f.food === 'Carotte')).toBe(true);
    const carotte = r.safeFoods.find((f) => f.food === 'Carotte')!;
    expect(carotte.symptomDayRate).toBe(0);
  });
});
