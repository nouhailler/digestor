import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay } from './factory';
import { computeTrends, describePeriod } from './periodReport';

let n = 0;
function mkDay(foods: string[], symptoms: Partial<Record<SymptomKey, Intensity>> = {}, hydrationL?: number): DayEntry {
  const d = emptyDay(`2026-03-${String(++n).padStart(2, '0')}`);
  d.meals = [{ id: `m${n}`, time: '12:00', foods: foods.map((name, i) => ({ id: `f${n}-${i}`, name, category: name === 'Sucre' ? 'pro' : 'neutral' })) }];
  d.symptoms = { ...d.symptoms, ...symptoms };
  if (hydrationL != null) d.hydrationL = hydrationL;
  return d;
}

describe('computeTrends', () => {
  it('renvoie [] sous 4 jours', () => {
    expect(computeTrends([mkDay(['Riz']), mkDay(['Riz'])])).toEqual([]);
  });

  it('détecte une amélioration des jours à symptômes', () => {
    // 1re moitié : symptômes ; 2de moitié : aucun
    const days: DayEntry[] = [
      mkDay(['Sucre'], { ballonnements: 'severe' }),
      mkDay(['Sucre'], { gaz: 'modere' }),
      mkDay(['Riz']),
      mkDay(['Riz']),
    ];
    const trends = computeTrends(days);
    const sym = trends.find((t) => t.metric === 'Jours à symptômes')!;
    expect(sym.direction).toBe('down');
    expect(sym.good).toBe(true);
    expect(sym.detail).toBe('100 % → 0 %');
  });

  it('ajoute la tendance charge amines seulement si la période en comporte', () => {
    const withAmine = computeTrends([
      mkDay(['Roquefort', 'Saucisson']),
      mkDay(['Roquefort', 'Saucisson']),
      mkDay(['Riz']),
      mkDay(['Riz']),
    ]);
    const t = withAmine.find((x) => x.metric === 'Jours à charge amines élevée')!;
    expect(t).toBeTruthy();
    expect(t.detail).toBe('100 % → 0 %');
    expect(t.direction).toBe('down');
    expect(t.good).toBe(true);

    const noAmine = computeTrends([mkDay(['Riz']), mkDay(['Riz']), mkDay(['Riz']), mkDay(['Riz'])]);
    expect(noAmine.some((x) => x.metric === 'Jours à charge amines élevée')).toBe(false);
  });

  it('inclut l’hydratation seulement si renseignée des deux côtés', () => {
    const withH = computeTrends([
      mkDay(['Riz'], {}, 1.0),
      mkDay(['Riz'], {}, 1.0),
      mkDay(['Riz'], {}, 2.0),
      mkDay(['Riz'], {}, 2.0),
    ]);
    expect(withH.some((t) => t.metric === 'Hydratation moyenne')).toBe(true);
    const noH = computeTrends([mkDay(['Riz']), mkDay(['Riz']), mkDay(['Riz']), mkDay(['Riz'])]);
    expect(noH.some((t) => t.metric === 'Hydratation moyenne')).toBe(false);
  });
});

describe('describePeriod', () => {
  it('résume la période pour le prompt', () => {
    const text = describePeriod(
      [mkDay(['Sucre'], { ballonnements: 'severe' }), mkDay(['Riz'])],
      '4 semaines',
    );
    expect(text).toContain('Période : 4 semaines');
    expect(text).toContain('Jours à symptômes : 1/2');
    expect(text).toContain('Ballonnements');
  });

  it('signale les jours à charge en amines élevée', () => {
    const text = describePeriod([mkDay(['Roquefort', 'Saucisson']), mkDay(['Riz'])], 'Tout');
    expect(text).toContain('Charge en amines biogènes (histamine)');
    expect(text).toContain('1/2 jours à charge élevée');
  });

  it('omet la ligne amines si aucun jour à charge élevée', () => {
    const text = describePeriod([mkDay(['Riz']), mkDay(['Pomme'])], 'Tout');
    expect(text).not.toContain('Charge en amines');
  });

  it('gère l’absence de données', () => {
    expect(describePeriod([], 'Tout')).toContain('Aucune donnée');
  });
});
