import { describe, expect, it } from 'vitest';
import type { FodmapLevel, FoodCategory, FoodInsight, Meal, SatietyCheck } from '../types';
import { normalize } from './foodClassifier';
import {
  expectedSatiety,
  formatHours,
  measureSatiety,
  satietyDurationCore,
  syncSatietyNotes,
} from './satietyDuration';

let n = 0;
function check(checkpoint: SatietyCheck['checkpoint'], hunger: number): SatietyCheck {
  return { checkpoint, hungerIntensity: hunger, energyLevel: 50, sugarCraving: 50 };
}
function meal(foods: [string, FoodCategory][], checks: SatietyCheck[], time = '08:00'): Meal {
  return {
    id: `m${n++}`,
    time,
    foods: foods.map(([name, category], i) => ({ id: `f${n}_${i}`, name, category })),
    satiety: checks,
  };
}
function insight(name: string, fodmapLevel: FodmapLevel): FoodInsight {
  return {
    key: normalize(name),
    name,
    category: 'neutral',
    fodmapLevel,
    fodmaps: { fructose: 'low', lactose: 'low', fructans: 'low', gos: 'low', polyols: 'low' },
    sibo: { verdict: 'inconnu', note: '' },
    candida: { verdict: 'inconnu', note: '' },
    summary: '',
    tips: [],
    model: 'test',
    updatedAt: '2026-06-30',
  };
}

describe('measureSatiety', () => {
  it('interpole le moment où la faim repasse le seuil', () => {
    const m = measureSatiety([check('immediate', 10), check('1h', 30), check('2h', 70)]);
    expect(m).toEqual({ hours: 1.5, ongoing: false });
  });

  it('signale une satiété encore en cours si la faim n’est pas revenue', () => {
    const m = measureSatiety([check('immediate', 10), check('2h', 30)]);
    expect(m).toEqual({ hours: 2, ongoing: true });
  });

  it('repas peu rassasiant : faim haute dès le relevé immédiat', () => {
    expect(measureSatiety([check('immediate', 70)])).toEqual({ hours: 0, ongoing: false, upperBound: false });
  });

  it('borne haute si la faim est déjà revenue à un relevé tardif isolé', () => {
    expect(measureSatiety([check('2h', 70)])).toEqual({ hours: 2, ongoing: false, upperBound: true });
  });

  it('renvoie null sans relevé', () => {
    expect(measureSatiety([])).toBeNull();
  });
});

describe('expectedSatiety', () => {
  it('plus long pour un repas bénéfique, plus court pour un repas pro', () => {
    expect(expectedSatiety(meal([['salade', 'beneficial']], []))).toEqual({ minH: 4, maxH: 5 });
    expect(expectedSatiety(meal([['sucre', 'pro']], []))).toEqual({ minH: 2, maxH: 3 });
    expect(expectedSatiety(meal([['riz', 'neutral']], []))).toEqual({ minH: 3, maxH: 4 });
  });

  it('raccourcit si un aliment est FODMAP élevé', () => {
    const insights = new Map([[normalize('salade'), insight('salade', 'high')]]);
    expect(expectedSatiety(meal([['salade', 'beneficial']], []), insights)).toEqual({ minH: 3, maxH: 4 });
  });
});

describe('formatHours', () => {
  it('formate heures et minutes', () => {
    expect(formatHours(2)).toBe('2 h');
    expect(formatHours(1.5)).toBe('1 h 30');
    expect(formatHours(0.5)).toBe('30 min');
    expect(formatHours(0)).toBe('0 h');
  });
});

describe('satietyDurationCore', () => {
  it('combine mesurée et attendue', () => {
    const core = satietyDurationCore(meal([['salade', 'beneficial']], [check('immediate', 10), check('2h', 50)]));
    expect(core).toBe('tenue ~2 h (attendu ~4–5 h)');
  });

  it('formule « encore rassasié » si en cours', () => {
    const core = satietyDurationCore(meal([['riz', 'neutral']], [check('immediate', 10), check('3h', 20)]));
    expect(core).toBe('encore rassasié à +3 h (attendu ~3–4 h)');
  });

  it('renvoie null sans relevé', () => {
    expect(satietyDurationCore(meal([['riz', 'neutral']], []))).toBeNull();
  });
});

describe('syncSatietyNotes', () => {
  const baseDay = (notes?: string) => ({
    date: '2026-06-30',
    quality: null,
    meals: [meal([['riz', 'neutral']], [check('immediate', 10), check('2h', 50)], '08:00')],
    symptoms: {} as Record<string, never>,
    notes,
  });

  it('ajoute une ligne auto en préservant le texte libre', () => {
    const out = syncSatietyNotes(baseDay('Bonne journée') as never);
    expect(out.notes).toContain('Bonne journée');
    expect(out.notes).toMatch(/⏱ Satiété \(08:00\) : tenue ~2 h/);
  });

  it('est idempotent (pas de doublon)', () => {
    const once = syncSatietyNotes(baseDay('Note') as never);
    const twice = syncSatietyNotes(once);
    expect(twice.notes).toBe(once.notes);
  });

  it('retire la ligne auto quand le repas n’a plus de relevé', () => {
    const withNote = syncSatietyNotes(baseDay() as never);
    const cleared = syncSatietyNotes({
      ...withNote,
      meals: withNote.meals.map((m) => ({ ...m, satiety: [] })),
    });
    expect(cleared.notes).toBeUndefined();
  });
});
