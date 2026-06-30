import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay } from './factory';
import { amineSymptomCorrelation } from './amineCorrelation';

let n = 0;
function mkDay(foods: string[], symptoms: Partial<Record<SymptomKey, Intensity>> = {}): DayEntry {
  const d = emptyDay(`2026-05-${String(++n).padStart(2, '0')}`);
  d.meals = [
    { id: `m${n}`, time: '12:00', foods: foods.map((name, i) => ({ id: `f${n}_${i}`, name, category: 'neutral' })) },
  ];
  d.symptoms = { ...d.symptoms, ...symptoms };
  return d;
}

const HIGH = ['Vin rouge', 'Comté']; // combinaison alcool + fromage → charge élevée
const LOW = ['Riz', 'Courgette']; // charge faible

describe('amineSymptomCorrelation', () => {
  it('exige un minimum de jours', () => {
    const r = amineSymptomCorrelation([mkDay(HIGH, { urticaire: 'severe' })]);
    expect(r.enoughData).toBe(false);
  });

  it('repère le lien charge élevée → symptômes histaminiques', () => {
    const days: DayEntry[] = [
      mkDay(HIGH, { urticaire: 'severe' }),
      mkDay(HIGH, { rougeurs: 'modere' }),
      mkDay(HIGH, { maux_de_tete: 'severe' }),
      mkDay(LOW),
      mkDay(LOW),
      mkDay(LOW),
    ];
    const r = amineSymptomCorrelation(days);
    expect(r.enoughData).toBe(true);
    expect(r.daysHighLoad).toBe(3);
    expect(r.rateWithHigh).toBe(1);
    expect(r.rateWithoutHigh).toBe(0);
    expect(r.suspected).toBe(true);
  });

  it('ne conclut pas s’il manque des jours « sans charge élevée »', () => {
    const days: DayEntry[] = [
      mkDay(HIGH, { urticaire: 'severe' }),
      mkDay(HIGH, { rougeurs: 'severe' }),
      mkDay(HIGH, { urticaire: 'modere' }),
      mkDay(HIGH),
      mkDay(HIGH),
    ];
    const r = amineSymptomCorrelation(days);
    expect(r.enoughData).toBe(true);
    expect(r.rateWithoutHigh).toBe(0); // aucun jour « sans »
    expect(r.suspected).toBe(false);
  });

  it('pas de lien quand les symptômes ne suivent pas la charge', () => {
    const days: DayEntry[] = [
      mkDay(HIGH),
      mkDay(HIGH),
      mkDay(HIGH),
      mkDay(LOW, { urticaire: 'severe' }),
      mkDay(LOW, { rougeurs: 'severe' }),
      mkDay(LOW),
    ];
    const r = amineSymptomCorrelation(days);
    expect(r.suspected).toBe(false);
    expect(r.rateWithHigh).toBe(0);
  });
});
